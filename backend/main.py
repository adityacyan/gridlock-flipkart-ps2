from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

app = FastAPI(title="ASTRAM Gridlock API")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["GET","POST","OPTIONS"], allow_headers=["Content-Type","Authorization"])

class PredictRequest(BaseModel):
    latitude: float; longitude: float; event_type: str; event_cause: str
    start_hour: int; day_of_week: int; month: int; day: int
    corridor: Optional[str] = None; police_station: Optional[str] = None
    zone: Optional[str] = None; veh_type: Optional[str] = None
    duration_mins: Optional[float] = None; junction: Optional[str] = None

@app.post("/api/predict")
async def predict(req: PredictRequest):
    return {"severity_level": 1, "severity_label": "Medium", "confidence": 0.0}

@app.get("/api/health")
async def health():
    return {"status":"ok","service":"astram-gridlock-api"}
