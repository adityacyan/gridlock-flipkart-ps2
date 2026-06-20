import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
import loader
import predictor


@asynccontextmanager
async def lifespan(app: FastAPI):
    loader.load_all()
    yield


app = FastAPI(title="ASTRAM ML Sidecar", lifespan=lifespan)


class InferRequest(BaseModel):
    latitude:       float
    longitude:      float
    event_type:     str
    event_cause:    str
    start_hour:     int
    day_of_week:    int
    month:          int
    day:            int
    corridor:       Optional[str] = None
    police_station: Optional[str] = None
    zone:           Optional[str] = None
    veh_type:       Optional[str] = None
    duration_mins:  Optional[float] = None
    junction:       Optional[str] = None


@app.post("/infer")
def infer(req: InferRequest):
    try:
        return predictor.predict(req.model_dump())
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/meta")
def meta():
    return {
        "corridors":      loader.get_corridor_classes(),
        "police_stations": loader.get_police_station_classes(),
        "zones":          loader.get_zone_classes(),
    }


@app.get("/health")
def health():
    keys = ["lgbm", "xgb", "mlp", "meta_learner", "scaler",
            "label_encoders", "kmeans", "feature_names"]
    return {
        "status": "ok",
        "models": {k: loader.get(k) is not None for k in keys},
        "tabnet": loader.get("tabnet") is not None,
    }
