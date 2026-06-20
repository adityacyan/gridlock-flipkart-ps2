import joblib
import warnings
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
