# ASTRAM Gridlock — Bengaluru Traffic Congestion Prediction

**Theme:** Event-Driven Congestion (Planned & Unplanned)
**Deadline:** 21 June 2026

## Problem Statement

Political rallies, festivals, sports events, construction activities, and sudden gatherings create localized traffic breakdowns.

**Why It's Hard Today:**
- Event impact is not quantified in advance
- Resource deployment is experience-driven
- No post-event learning system

**How this solves it:** Using historical and real-time data to forecast event-related traffic impact and recommend optimal manpower, barricading, and diversion plans.

## Dataset

**Source:** Proprietary internal data from Astram (Bengaluru's traffic management system, operated under Flipkart).

| Property | Value |
|---|---|
| Rows | 8,173 |
| Columns | 46 |
| Timeframe | Historical event records |
| Geography | Bengaluru (lat/lon, corridors, police stations, zones) |
| Content | Event logs with type, cause, time, location, priority, road closure flags, vehicle types, police assignments, resolution times |

No public link — dataset was provided directly by Astram.

## How Planned & Unplanned Events are Handled

### Event Types

| Type | Examples | Handling |
|---|---|---|
| **Planned** | Concerts, cricket matches, political rallies, festivals, VIP movements | Severity predicted from historical patterns. Resource output includes `pre_deploy` (deploy manpower hours before event start). |
| **Unplanned** | Accidents, vehicle breakdowns, water logging, road damage | Severity predicted from location/time/cause features. Resource output adapts dynamically (e.g., ambulance lane for accidents, peak-hour headcount bonuses). |

### Target Variable (Severity 0–3)

Since the dataset has no direct congestion metric, severity is proxied from two zero-null columns:

| Priority | Requires Road Closure | Severity | Label |
|---|---|---|---|
| Low | No | 0 | Low |
| Low | Yes | 1 | Medium |
| High | No | 2 | High |
| High | Yes | 3 | Critical |

### Feature Engineering

30+ features generated from raw columns:

```
Spatial:    latitude, longitude, location_cluster (KMeans=20), pin_code, has_end_location
Temporal:   hour, day_of_week, month, day, day_of_year, is_weekend, is_night,
            is_morning_rush, is_evening_rush, time_bucket
Event:      event_type (planned/unplanned), event_cause, corridor, is_corridor,
            veh_type_simple, police_station, zone, junction
Operational: authenticated_flag, has_description, has_end_time, has_been_closed,
             duration_mins, resolution_mins, status
```

### Resource Recommendation Engine

Resources are computed rule-based (not ML) from the predicted severity:

| Severity | Manpower | Barricading | Diversion | Impact |
|---|---|---|---|---|
| 0 Low | 2–4 officers | Cones/indicators | None | ~15 min |
| 1 Medium | 4–8 officers | Partial barricade, 1 marshal | Advisory alternate route | ~30 min |
| 2 High | 8–14 officers | Full barricade, 2 marshals | Mandatory alternate + digital signage | ~60 min |
| 3 Critical | 15–25 officers | Full corridor lockdown + marshal chain | Police-escorted diversion + PR alert | ~90 min |

Modifiers applied:
- **Corridor bonus** (×1.4): Major roads like ORR get more officers
- **Rush hour bonus** (×1.25): 7–10 AM and 5–9 PM
- **Planned events**: `pre_deploy` field added ("Deploy min X officers ≥2h before")
- **Special actions**: Event-cause-specific (crowd control for public events, ambulance lanes for accidents)

### ML Architecture

```
LightGBM ──┐
XGBoost  ──┤──► meta-learner (LightGBM) ──► severity (0-3) + probabilities
MLP      ──┤
TabNet   ──┘ (optional, fallback-safe)
```

All .pkl models loaded at startup by the Python sidecar.

## Architecture

```
Next.js 15 Frontend (:3000)
        ↓  POST /api/predict
Python FastAPI Backend (:8080)
        ↓  POST /infer (internal)
Python FastAPI ML Sidecar (:8001)
        ↓  LightGBM + XGBoost + MLP + TabNet → meta-learner
        ↑  severity, confidence, probabilities, resource recommendations
```

## Prerequisites

- **Python** 3.10+ (with pip)
- **Node.js** 18+
- ML model files (`.pkl`) in `ml_sidecar/trained_models/`

## Quick Start (3 terminals)

### Terminal 1 — Python ML Sidecar

```bash
cd ml_sidecar
pip install -r requirements.txt
py -m uvicorn main:app --port 8001 --reload
```

Runs on http://localhost:8001

### Terminal 2 — Python API Backend

```bash
cd backend
pip install -r requirements.txt
py -m uvicorn main:app --port 8080 --reload
```

Runs on http://localhost:8080

### Terminal 3 — Next.js Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on http://localhost:3000

## Environment Variables

### API Backend (`backend/`)

| Variable | Default | Description |
|---|---|---|
| `PORT` | `8080` | Port for API server |
| `SIDECAR_URL` | `http://localhost:8001` | URL of ML sidecar |

### Next.js Frontend (`frontend/`)

Create `frontend/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8080
```

## Required Model Files

Place these in `ml_sidecar/trained_models/`:

```
lgbm_model.pkl
xgb_model.pkl
mlp_model.pkl
meta_learner.pkl
scaler.pkl
label_encoders.pkl
kmeans_model.pkl
feature_names.pkl
tabnet_model.zip
```

> These are excluded from git (large binary files). Download from the training notebook or Google Drive.

## API Endpoints

### API Backend (public)

| Method | Path | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| POST | `/api/predict` | Predict congestion severity |
| GET | `/api/meta` | Get corridors, zones, police stations |

### POST /api/predict — Request Body

```json
{
  "latitude": 12.9716,
  "longitude": 77.5946,
  "event_type": "planned",
  "event_cause": "Concert",
  "start_hour": 20,
  "day_of_week": 5,
  "month": 6,
  "day": 18,
  "corridor": "MG Road",
  "duration_mins": 180
}
```

### POST /api/predict — Response

```json
{
  "severity_level": 3,
  "severity_label": "Critical",
  "confidence": 0.87,
  "class_probabilities": {
    "Low": 0.02,
    "Medium": 0.05,
    "High": 0.06,
    "Critical": 0.87
  },
  "recommendations": {
    "manpower_min": 15,
    "manpower_max": 25,
    "barricading": "Full perimeter barricading required",
    "diversion": "Mandatory diversion via Hosur Road",
    "impact_minutes": 90,
    "pre_deploy": "Deploy 2 hours before event start"
  },
  "location_cluster": 7
}
```

## Project Structure

```
gridlock-new/
├── backend/                  # Python FastAPI server
│   ├── main.py
│   └── requirements.txt
├── ml_sidecar/               # Python FastAPI ML inference
│   ├── main.py
│   ├── predictor.py
│   ├── loader.py
│   ├── config.py
│   ├── requirements.txt
│   └── trained_models/ # .pkl files (not in git)
├── frontend/                 # Next.js 15 App Router
│   ├── app/
│   │   ├── page.tsx          # Dashboard
│   │   ├── predict/page.tsx  # Prediction form
│   │   └── history/page.tsx  # History table
│   ├── components/
│   │   ├── map/BengaluruMap.tsx
│   │   ├── prediction/
│   │   └── shared/
│   └── lib/
│       ├── api.ts
│       ├── history.ts
│       └── severity.ts
└── ROADMAP.md
```

## Deployment

See **[DEPLOY.md](./DEPLOY.md)** for full Railway + Vercel step-by-step instructions.

### Railway (Python API + ML Sidecar)

1. Connect GitHub repo to Railway
2. Create two services: `backend/` and `ml_sidecar/`
3. Set env vars: `SIDECAR_URL=http://<sidecar-service>.railway.internal:8001`
4. Upload `.pkl` files as Railway volumes or use a shared drive URL at startup

### Vercel (Next.js)

1. Connect GitHub repo to Vercel, set root to `frontend/`
2. Set env var: `NEXT_PUBLIC_API_URL=https://<your-railway-go-url>`

## ML Models

| Model | Role |
|---|---|
| LightGBM | Base learner (best single model) |
| XGBoost | Base learner |
| MLP (sklearn) | Base learner |
| TabNet | Base learner (optional) |
| Meta-learner | Stacks base model probabilities → final prediction |
| KMeans (20 clusters) | Geo-cluster assignment for Bengaluru |

**Severity Classes:** 0=Low, 1=Medium, 2=High, 3=Critical
