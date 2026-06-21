import joblib
import warnings
import pandas as pd
from sklearn.neighbors import KDTree
warnings.filterwarnings("ignore")

from config import MODEL_FILES

_store: dict = {}


def load_all():
    print("Loading models...")
    _store["lgbm"]           = joblib.load(MODEL_FILES["lgbm"])
    _store["xgb"]            = joblib.load(MODEL_FILES["xgb"])
    _store["mlp"]            = joblib.load(MODEL_FILES["mlp"])
    _store["meta_learner"]   = joblib.load(MODEL_FILES["meta_learner"])
    _store["scaler"]         = joblib.load(MODEL_FILES["scaler"])
    _store["label_encoders"] = joblib.load(MODEL_FILES["label_encoders"])
    _store["kmeans"]         = joblib.load(MODEL_FILES["kmeans"])
    _store["feature_names"]  = joblib.load(MODEL_FILES["feature_names"])

    try:
        import torch
        from pytorch_tabnet.tab_model import TabNetClassifier
        tn = TabNetClassifier()
        tn.load_model(str(MODEL_FILES["tabnet"]))
        _store["tabnet"] = tn
        print("TabNet loaded")
    except Exception as e:
        _store["tabnet"] = None
        print(f"TabNet skipped: {e}")

    try:
        _store["geo_lookup"] = joblib.load(MODEL_FILES["geo_lookup"])
        coords = _store["geo_lookup"][["latitude", "longitude"]].values
        _store["geo_kdtree"] = KDTree(coords)
        print("Geographic lookup database loaded.")
    except Exception as e:
        _store["geo_lookup"] = None
        _store["geo_kdtree"] = None
        print(f"Geographic lookup skipped: {e}")

    print(f"All models loaded. Features: {len(_store['feature_names'])}")


def get(key):
    return _store.get(key)


def get_corridor_classes():
    le = _store.get("label_encoders", {})
    if "corridor" in le:
        return [c for c in le["corridor"].classes_ if c != "Non-corridor"]
    return []


def get_police_station_classes():
    le = _store.get("label_encoders", {})
    if "police_station" in le:
        return list(le["police_station"].classes_)
    return []


def get_zone_classes():
    le = _store.get("label_encoders", {})
    if "zone" in le:
        return [z for z in le["zone"].classes_ if z != "UNKNOWN"]
    return []


def lookup_closest_location(lat: float, lng: float):
    tree = _store.get("geo_kdtree")
    df_lookup = _store.get("geo_lookup")
    if tree is None or df_lookup is None:
        return None

    dist, idx = tree.query([[lat, lng]], k=1)
    nearest_idx = int(idx[0][0])
    dist_deg = float(dist[0][0])
    row = df_lookup.iloc[nearest_idx]

    # Heuristic: If the clicked point is too far from the nearest historical incident,
    # it is likely on a different street/junction, so we do not snap to that corridor/junction.
    # 0.0025 degrees is approx 275 meters in Bengaluru.
    is_nearby = dist_deg <= 0.0025

    return {
        "corridor":       None if (not is_nearby or str(row["corridor"]) in ("Non-corridor", "UNKNOWN")) else str(row["corridor"]),
        "police_station": None if str(row["police_station"]) == "UNKNOWN" else str(row["police_station"]),
        "zone":           None if str(row["zone"]) == "UNKNOWN" else str(row["zone"]),
        "junction":       None if (not is_nearby or str(row["junction"]) == "UNKNOWN") else str(row["junction"]),
        "pin_code":       int(row["pin_code"]) if pd.notna(row["pin_code"]) else 560001
    }
