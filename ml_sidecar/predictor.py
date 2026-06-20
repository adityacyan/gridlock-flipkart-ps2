import numpy as np
import pandas as pd
from config import SEVERITY_LABELS, RESOURCE_TABLE
import loader


def _time_bucket(hour: int) -> str:
    if 5  <= hour < 9:  return "early_morning"
    if 9  <= hour < 12: return "morning"
    if 12 <= hour < 15: return "afternoon"
    if 15 <= hour < 19: return "evening"
    if 19 <= hour < 22: return "night"
    return "late_night"


def _simplify_veh(v) -> str:
    if not v: return "unknown"
    v = str(v).lower()
    if "bus" in v:                                      return "bus"
    if any(w in v for w in ("truck", "heavy", "lcv")): return "heavy"
    if any(w in v for w in ("private", "car")):        return "private"
    if "auto" in v:                                    return "auto"
    return "other"


def recommend_resources(severity: int, event_cause: str,
                        is_corridor: bool, hour: int,
                        is_planned: bool = False) -> dict:
    mn, mx, barricade, diversion = RESOURCE_TABLE[severity]

    if is_corridor:
        mn, mx = int(mn * 1.4), int(mx * 1.4)

    is_rush = (7 <= hour <= 10) or (17 <= hour <= 21)
    if is_rush:
        mn, mx = int(mn * 1.25), int(mx * 1.25)

    rec = {
        "priority_flag":   ["LOW", "MEDIUM", "HIGH", "CRITICAL"][severity],
        "manpower_min":    mn,
        "manpower_max":    mx,
        "barricading":     barricade,
        "diversion":       diversion,
        "impact_minutes":  [15, 30, 60, 90][severity],
    }

    if is_planned:
        rec["pre_deploy"] = f"Deploy min {mn} officers ≥2h before event start"
    if is_rush:
        rec["peak_note"] = "Peak hour active — raise headcount by 25%"
    if event_cause == "public_event" and severity >= 2:
        rec["special_action"] = (
            "Issue public advisory. Coordinate with event organiser. "
            "Set up crowd control perimeter."
        )
    if event_cause == "accident" and severity >= 2:
        rec["special_action"] = (
            "Ensure ambulance lane maintained. "
            "Contact trauma centre on standby."
        )
    return rec


def predict(payload: dict) -> dict:
    latitude       = float(payload["latitude"])
    longitude      = float(payload["longitude"])
    event_type     = payload["event_type"]
    event_cause    = payload["event_cause"]
    start_hour     = int(payload["start_hour"])
    day_of_week    = int(payload["day_of_week"])
    month          = int(payload["month"])
    day            = int(payload["day"])
    corridor       = payload.get("corridor") or "Non-corridor"
    police_station = payload.get("police_station") or "UNKNOWN"
    zone           = payload.get("zone") or "UNKNOWN"
    veh_type       = payload.get("veh_type")
    duration_mins  = payload.get("duration_mins")
    junction       = payload.get("junction") or "UNKNOWN"

    kmeans         = loader.get("kmeans")
    label_encoders = loader.get("label_encoders")
    scaler         = loader.get("scaler")
    feature_names  = loader.get("feature_names")
    lgbm           = loader.get("lgbm")
    xgb            = loader.get("xgb")
    mlp            = loader.get("mlp")
    tabnet         = loader.get("tabnet")
    meta           = loader.get("meta_learner")

    cluster = int(kmeans.predict([[latitude, longitude]])[0])

    try:
        day_of_year = pd.Timestamp(f"2024-{month:02d}-{day:02d}").day_of_year
    except Exception:
        day_of_year = 1

    row = {
        "latitude":          latitude,
        "longitude":         longitude,
        "location_cluster":  cluster,
        "pin_code":          560001,
        "has_end_location":  0,
        "hour":              start_hour,
        "day_of_week":       day_of_week,
        "month":             month,
        "day":               day,
        "day_of_year":       day_of_year,
        "is_weekend":        int(day_of_week >= 5),
        "is_night":          int(start_hour >= 22 or start_hour <= 5),
        "is_morning_rush":   int(7 <= start_hour <= 10),
        "is_evening_rush":   int(17 <= start_hour <= 21),
        "time_bucket":       _time_bucket(start_hour),
        "event_type":        event_type,
        "event_cause":       event_cause,
        "is_corridor":       int(corridor not in ("Non-corridor", "", None)),
        "authenticated_flag": 1,
        "has_description":   1,
        "has_end_time":      int(duration_mins is not None),
        "has_been_closed":   0,
        "duration_mins":     float(duration_mins) if duration_mins else 0.0,
        "resolution_mins":   0,
        "corridor":          corridor,
        "veh_type_simple":   _simplify_veh(veh_type),
        "police_station":    police_station,
        "zone":              zone,
        "junction":          junction,
        "status":            "active",
    }

    inp = pd.DataFrame([row])

    for col, le in label_encoders.items():
        if col in inp.columns:
            v = str(inp[col].iloc[0])
            v = v if v in le.classes_ else le.classes_[0]
            inp[col] = le.transform([v])[0]

    for col in feature_names:
        if col not in inp.columns:
            inp[col] = 0
    inp = inp[feature_names].fillna(0)
    inp_sc = scaler.transform(inp).astype("float32")

    blocks = [
        lgbm.predict_proba(inp),
        xgb.predict_proba(inp),
        mlp.predict_proba(inp_sc),
    ]
    if tabnet is not None:
        try:
            blocks.append(tabnet.predict_proba(inp_sc))
        except Exception:
            pass

    # Meta-learner may have been trained on fewer base models (e.g. 3 without TabNet)
    n_meta_feats = getattr(meta, "n_features_in_", len(blocks) * 4)
    n_models = n_meta_feats // 4
    if len(blocks) > n_models:
        blocks = blocks[:n_models]

    meta_feat = np.hstack(blocks)
    sev_pred  = int(meta.predict(meta_feat)[0])
    sev_probs = meta.predict_proba(meta_feat)[0]

    recs = recommend_resources(
        severity    = sev_pred,
        event_cause = event_cause,
        is_corridor = row["is_corridor"] == 1,
        hour        = start_hour,
        is_planned  = event_type == "planned",
    )

    return {
        "severity_level":      sev_pred,
        "severity_label":      SEVERITY_LABELS[sev_pred],
        "confidence":          float(round(sev_probs.max(), 4)),
        "class_probabilities": {
            SEVERITY_LABELS[i]: float(round(sev_probs[i], 4)) for i in range(4)
        },
        "recommendations":     recs,
        "location_cluster":    cluster,
    }
