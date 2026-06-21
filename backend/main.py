import os
import httpx
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional


SIDECAR_URL = os.getenv("SIDECAR_URL", "http://localhost:8001")
PORT = int(os.getenv("PORT", "8080"))
TIMEOUT = 5.0

client = httpx.AsyncClient(timeout=TIMEOUT)


@asynccontextmanager
async def lifespan(_app: FastAPI):
    yield
    await client.aclose()


app = FastAPI(title="ASTRAM Gridlock API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)


class PredictRequest(BaseModel):
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


@app.post("/api/predict")
async def predict(req: PredictRequest):
    try:
        r = await client.post(f"{SIDECAR_URL}/infer", json=req.model_dump())
        if r.status_code != 200:
            raise HTTPException(status_code=502, detail=f"sidecar error {r.status_code}: {r.text}")
        return r.json()
    except httpx.RequestError as e:
        raise HTTPException(status_code=503, detail=f"sidecar unreachable: {e}")


@app.get("/api/health")
async def health():
    sidecar_status = "ok"
    try:
        r = await client.get(f"{SIDECAR_URL}/health")
        if r.status_code != 200:
            sidecar_status = "unhealthy"
    except Exception:
        sidecar_status = "unreachable"

    return {
        "status": "ok" if sidecar_status == "ok" else "degraded",
        "service": "astram-gridlock-api",
        "sidecar_url": SIDECAR_URL,
        "sidecar_status": sidecar_status,
    }


@app.get("/api/meta")
async def get_meta():
    try:
        r = await client.get(f"{SIDECAR_URL}/meta")
        if r.status_code != 200:
            raise HTTPException(status_code=502, detail=f"sidecar error {r.status_code}: {r.text}")
        return r.json()
    except httpx.RequestError as e:
        raise HTTPException(status_code=503, detail=f"ML service unavailable: {e}")


@app.get("/api/lookup-location")
async def lookup_location(lat: float, lng: float):
    try:
        r = await client.get(f"{SIDECAR_URL}/lookup-location", params={"lat": lat, "lng": lng})
        if r.status_code != 200:
            raise HTTPException(status_code=r.status_code, detail=r.text)
        return r.json()
    except httpx.RequestError as e:
        raise HTTPException(status_code=503, detail=f"ML service unavailable: {e}")


@app.get("/api/corridors")
async def get_corridors():
    try:
        r = await client.get(f"{SIDECAR_URL}/meta")
        if r.status_code != 200:
            raise HTTPException(status_code=502, detail=f"sidecar error {r.status_code}: {r.text}")
        data = r.json()
        return {"corridors": data.get("corridors", [])}
    except httpx.RequestError as e:
        raise HTTPException(status_code=503, detail=f"ML service unavailable: {e}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=PORT)
