from pathlib import Path

BASE_DIR   = Path(__file__).parent
MODELS_DIR = BASE_DIR / "trained_models"

MODEL_FILES = {
    "lgbm":           MODELS_DIR / "lgbm_model.pkl",
    "xgb":            MODELS_DIR / "xgb_model.pkl",
    "mlp":            MODELS_DIR / "mlp_model.pkl",
    "meta_learner":   MODELS_DIR / "meta_learner.pkl",
    "scaler":         MODELS_DIR / "scaler.pkl",
    "label_encoders": MODELS_DIR / "label_encoders.pkl",
    "kmeans":         MODELS_DIR / "kmeans_model.pkl",
    "feature_names":  MODELS_DIR / "feature_names.pkl",
    "tabnet":         MODELS_DIR / "tabnet_model.zip",
}

SEVERITY_LABELS = {0: "Low", 1: "Medium", 2: "High", 3: "Critical"}

RESOURCE_TABLE = {
    0: (2,  4,  "Cones / indicators only",
                "No diversion needed"),
    1: (4,  8,  "Partial barricade (1 lane closed) + 1 marshal",
                "Advisory alternate route via parallel road"),
    2: (8,  14, "Full barricade both sides + 2 marshal points",
                "Mandatory alternate route + digital signage"),
    3: (15, 25, "Full corridor lockdown + marshal chain",
                "Police-escorted diversion + public advisory + PR alert"),
}
