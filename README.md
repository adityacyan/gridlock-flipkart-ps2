# ASTRAM Gridlock -- Bengaluru Traffic Congestion Prediction

Every morning, 10 million people in Bengaluru get into a vehicle and hope. Hope that the road ahead is clear. Hope that the rally on MG Road won't snarl the evening commute. Hope that the water-logged underpass near Hebbal isn't going to cost them two hours.

Right now, traffic management is reactive. A VIP movement is announced, and officers are deployed by gut feel. An accident blocks Hosur Road, and by the time resources arrive, the damage is done. There is no system that looks at an event and says: *this will cause a Level 3 gridlock, deploy 25 officers, close this lane, and divert traffic here.*

This is that system.

ASTRAM Gridlock takes a single event description -- location, time, cause, corridor -- and runs it through a stacked ensemble of four ML models. In under 120 milliseconds, it returns a severity class (Low / Medium / High / Critical), per-class probabilities, and a concrete resource deployment plan: how many officers, what barricading, which diversion route.

The ensemble achieves **99.4% accuracy** and a **98.7% macro F1-score** across four severity classes. The system was trained on 8,173 historical traffic events from Bengaluru's Astram traffic management system, with 30+ engineered features capturing spatial, temporal, and operational patterns. A KMeans geo-clustering layer (k=20) learns Bengaluru's natural traffic zones directly from incident coordinates.

The result is a deployable, production-grade decision support tool for traffic police, event organisers, and civic agencies -- turning reactive chaos into proactive, data-driven resource allocation.

---

## Table of Contents

- [System Architecture](#system-architecture)
- [ML Architecture](#ml-architecture)
- [Data Flow](#data-flow)
- [Dataset](#dataset)
- [Feature Engineering](#feature-engineering)
- [Target Variable](#target-variable)
- [ML Models](#ml-models)
- [Resource Recommendation Engine](#resource-recommendation-engine)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Docker](#docker)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Required Model Files](#required-model-files)
- [Deployment](#deployment)

---

## System Architecture

```mermaid
graph TB
    subgraph Browser["Browser"]
        NEXT["Next.js 16 Frontend<br/>(port 3000)"]
    end

    subgraph Backend["Python Backend"]
        API["FastAPI API Server<br/>(port 8080)"]
    end

    subgraph ML["ML Inference"]
        SIDECAR["FastAPI ML Sidecar<br/>(port 8001)"]
        LGBM["LightGBM<br/>Base Model"]
        XGB["XGBoost<br/>Base Model"]
        MLP["MLP<br/>Base Model"]
        TABNET["TabNet<br/>Base Model (optional)"]
        META["Meta-Learner<br/>(LightGBM)"]
    end

    NEXT -- "POST /api/predict" --> API
    API -- "POST /infer" --> SIDECAR
    LGBM --> META
    XGB --> META
    MLP --> META
    TABNET --> META
    SIDECAR --> LGBM
    SIDECAR --> XGB
    SIDECAR --> MLP
    SIDECAR --> TABNET
    META --> SIDECAR

    style NEXT fill:#2d3748,color:#fff
    style API fill:#2b6cb0,color:#fff
    style SIDECAR fill:#2b6cb0,color:#fff
    style META fill:#744210,color:#fff
```

---

## ML Architecture

```mermaid
graph LR
    subgraph Input["Feature Input (17 engineered features)"]
        A["Raw Event Data"]
    end

    subgraph Preprocess["Preprocessing"]
        B["Label Encoding"]
        C["Standard Scaling"]
        D["KMeans Geo-Cluster<br/>(k=20)"]
    end

    subgraph Ensemble["Stacked Ensemble"]
        L["LightGBM<br/>4-class probs"]
        X["XGBoost<br/>4-class probs"]
        M["MLP NN<br/>(256-128-64-32)<br/>4-class probs"]
        T["TabNet<br/>4-class probs"]
        STACK["Stacked Probability<br/>Vectors (16-20 dim)"]
        META["Meta-Learner<br/>(LightGBM)"]
    end

    subgraph Output["Output"]
        SEV["Severity Class<br/>(0=Low / 1=Medium / 2=High / 3=Critical)"]
        PROB["Per-class<br/>Probabilities"]
        REC["Resource<br/>Recommendations"]
    end

    A --> B
    A --> C
    A --> D
    B --> L
    B --> X
    C --> M
    C --> T
    D --> L
    D --> X
    D --> M
    D --> T
    L --> STACK
    X --> STACK
    M --> STACK
    T --> STACK
    STACK --> META
    META --> SEV
    META --> PROB
    SEV --> REC
    PROB --> REC

    style META fill:#744210,color:#fff
    style SEV fill:#276749,color:#fff
    style PROB fill:#276749,color:#fff
    style REC fill:#276749,color:#fff
```

---

## Data Flow

```mermaid
sequenceDiagram
    participant User as User (Browser)
    participant Frontend as Next.js Frontend
    participant API as FastAPI Backend
    participant Sidecar as FastAPI ML Sidecar

    User->>Frontend: Fill event form (location, time, cause, type)
    User->>Frontend: Click "Run Prediction"
    Frontend->>Frontend: Validate form fields
    Frontend->>API: POST /api/predict (JSON body)
    API->>API: Parse & validate request via Pydantic
    API->>Sidecar: POST /infer (forwarded payload)
    Sidecar->>Sidecar: Load .pkl models from disk (at startup)
    Sidecar->>Sidecar: Feature engineer (hour, day, time_bucket, veh_type_simple...)
    Sidecar->>Sidecar: Label encode categoricals
    Sidecar->>Sidecar: Standard scale numerics
    Sidecar->>Sidecar: Predict with LightGBM, XGBoost, MLP, TabNet
    Sidecar->>Sidecar: Stack probability vectors
    Sidecar->>Sidecar: Meta-learner predicts final severity
    Sidecar->>Sidecar: Compute resource recommendations (rule-based)
    Sidecar-->>API: JSON response (severity, confidence, probs, resources)
    API-->>Frontend: Forward response
    Frontend->>Frontend: Render SeverityCard, ProbabilityChart, ResourcePanel
    Frontend->>Frontend: Save to localStorage history
    User->>Frontend: View result
```

---

## Dataset

**Source:** Proprietary internal data from Astram (Bengaluru traffic management system, operated under Flipkart).

| Property | Value |
|---|---|
| Rows | 8,173 |
| Columns | 46 |
| Timeframe | Historical event records |
| Geography | Bengaluru (lat/lon, corridors, police stations, zones) |
| Content | Event logs with type, cause, time, location, priority, road closure flags, vehicle types, police assignments, resolution times |

No public link -- dataset was provided directly by Astram.

---

## Feature Engineering

30+ features generated from 46 raw columns:

**Spatial:**
`latitude`, `longitude`, `location_cluster` (KMeans k=20), `pin_code`, `has_end_location`

**Temporal:**
`hour`, `day_of_week`, `month`, `day`, `day_of_year`, `is_weekend`, `is_night`, `is_morning_rush`, `is_evening_rush`, `time_bucket`

**Event:**
`event_type` (planned/unplanned), `event_cause`, `corridor`, `is_corridor`, `veh_type_simple`, `police_station`, `zone`, `junction`

**Operational:**
`authenticated_flag`, `has_description`, `has_end_time`, `has_been_closed`, `duration_mins`, `resolution_mins`, `status`

---

## Target Variable

Since the dataset has no direct congestion metric, severity is proxied from two zero-null columns:

| Priority | Requires Road Closure | Severity | Label |
|---|---|---|---|
| Low | No | 0 | Low |
| Low | Yes | 1 | Medium |
| High | No | 2 | High |
| High | Yes | 3 | Critical |

---

## ML Models

```mermaid
graph TB
    subgraph Base["Base Learners"]
        L["LightGBM<br/>objective: multiclass<br/>num_leaves: 63<br/>lr: 0.03"]
        X["XGBoost<br/>objective: multi:softprob<br/>max_depth: 6<br/>lr: 0.03"]
        M["MLP<br/>hidden: 256-128-64-32<br/>activation: relu<br/>early_stopping: True"]
        T["TabNet<br/>n_d: 32, n_a: 32<br/>n_steps: 5<br/>gamma: 1.5"]
    end

    subgraph Meta["Meta-Learner"]
        ML["LightGBM<br/>objective: multiclass<br/>num_leaves: 15<br/>lr: 0.02<br/>input: stacked OOF probs<br/>(5-fold CV)"]
    end

    L --> ML
    X --> ML
    M --> ML
    T --> ML
    ML --> OUT["Severity (0-3)<br/>+ Probabilities"]
```

| Model | Role | Input Features | Output |
|---|---|---|---|
| LightGBM | Base learner (tree) | 17 engineered (raw + scaled) | 4-class probabilities |
| XGBoost | Base learner (tree) | 17 engineered (raw) | 4-class probabilities |
| MLP (sklearn) | Base learner (neural) | 17 engineered (standard-scaled) | 4-class probabilities |
| TabNet | Base learner (attention) | 17 engineered (standard-scaled) | 4-class probabilities |
| Meta-Learner (LightGBM) | Stacked ensemble | 16-20 concatenated probs from base models | Final severity (0-3) |
| KMeans | Geo-clustering | latitude, longitude | Cluster ID (0-19) |

The meta-learner is trained on **out-of-fold (OOF)** probability vectors from 5-fold stratified cross-validation, preventing label leakage.

---

## Resource Recommendation Engine

Resources are computed rule-based (not ML) from the predicted severity:

| Severity | Manpower | Barricading | Diversion | Impact |
|---|---|---|---|---|
| 0 Low | 2-4 officers | Cones / indicators only | No diversion needed | ~15 min avg delay |
| 1 Medium | 4-8 officers | Partial barricade (1 lane) + 1 marshal | Advisory alternate route | ~30 min avg delay |
| 2 High | 8-14 officers | Full barricade both sides + 2 marshals | Mandatory alternate + digital signage | ~60 min avg delay |
| 3 Critical | 15-25 officers | Full corridor lockdown + marshal chain | Police-escorted diversion + PR alert | ~90 min avg delay |

**Modifiers:**
- **Corridor bonus (x1.4):** Major roads like ORR get more officers
- **Rush hour bonus (x1.25):** 7-10 AM and 5-9 PM
- **Planned events:** `pre_deploy` field suggests deploying manpower before event start
- **Special actions:** Event-cause-specific (crowd control for public events, ambulance lanes for accidents)

---

## Project Structure

```
gridlock/
|-- backend/                        # Python FastAPI API server
|   |-- main.py                     FastAPI app, routes, CORS, HTTP client
|   |-- requirements.txt            fastapi, uvicorn, httpx, pydantic
|   +-- Dockerfile                  Python 3.11-slim image
|
|-- ml_sidecar/                     # Python FastAPI ML inference (internal)
|   |-- main.py                     FastAPI app, /infer and /meta endpoints
|   |-- predictor.py                predict_congestion() with full pipeline
|   |-- loader.py                   Model loading at startup
|   |-- config.py                   Model paths, severity labels, resource table
|   |-- requirements.txt            fastapi, lightgbm, xgboost, sklearn, torch, tabnet
|   |-- Dockerfile                  Python 3.11-slim + libgomp1
|   |-- trained_models/             .pkl model files (gitignored)
|   +-- .dockerignore
|
|-- frontend/                       # Next.js 16 App Router frontend
|   |-- app/
|   |   |-- layout.tsx              Root layout with Google Fonts
|   |   |-- page.tsx                Landing page (TRAFFIC.NOIR)
|   |   +-- (app)/
|   |       |-- layout.tsx          App shell with Navbar
|   |       |-- predict/page.tsx    Event form + results
|   |       |-- dashboard/page.tsx  Stats, map, recent events
|   |       |-- history/page.tsx    Prediction history table
|   |       +-- model/page.tsx      Model metrics with chart lightbox
|   |-- components/
|   |   |-- prediction/             EventForm, SeverityCard, ProbabilityChart, ResourcePanel
|   |   |-- dashboard/              StatsBar, SeverityDonut
|   |   |-- map/                    BengaluruMap, DynamicMap, IncidentPin
|   |   |-- shared/                 Navbar, SeverityBadge
|   |   |-- ui/                     Badge, Button, Card, Input, Select, Tabs
|   |   +-- providers/              SmoothScroll
|   |-- lib/                        api.ts, history.ts, motion.ts, severity.ts, validate.ts, utils.ts
|   |-- types/                      PredictRequest, PredictResponse, HistoryEntry, etc.
|   |-- public/
|   |   |-- model-charts/           PNG visualizations from training pipeline
|   |   +-- *.svg                   favicon, file, globe, next, vercel, window
|   +-- Dockerfile                  Node 20 multi-stage build
|
|-- trained_models/                 Root-level trained model artifacts
|   |-- *.png                       EDA and evaluation visualizations
|   |-- lgbm_model.txt              LightGBM booster text format
|   |-- xgb_model.json              XGBoost serialized model
|   +-- tabnet_model.zip            TabNet saved model
|
|-- cyan_training_pipeline.py       Full ML pipeline (EDA, feature engineering, training, evaluation)
|-- docker-compose.yml              Orchestrates sidecar + backend + frontend
|-- .gitignore
|-- README.md                       This file

+-- ROADMAP.md                      Day-by-day project plan
```

---

## Prerequisites

| Dependency | Version | Notes |
|---|---|---|
| Python | 3.10+ | Tested with 3.11 |
| Node.js | 18+ | Tested with 20 |
| pip | Latest | |
| npm | Latest | |
| Docker (optional) | Latest | For containerized run |

---

## Quick Start

### Step 1: ML Sidecar (Terminal 1)

```bash
cd ml_sidecar
pip install -r requirements.txt
uvicorn main:app --port 8001 --reload
```

**Verify:**
```bash
curl http://localhost:8001/health
# {"status":"ok","models":{"lgbm":true,"xgb":true,"mlp":true,...}}
```

### Step 2: API Backend (Terminal 2)

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --port 8080 --reload
```

**Verify:**
```bash
curl http://localhost:8080/api/health
# {"status":"ok","service":"astram-gridlock-api","sidecar_status":"ok"}
```

### Step 3: Frontend (Terminal 3)

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000 in a browser.

### End-to-End Test

```bash
curl -X POST http://localhost:8080/api/predict \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 12.9716,
    "longitude": 77.5946,
    "event_type": "planned",
    "event_cause": "public_event",
    "start_hour": 18,
    "day_of_week": 5,
    "month": 6,
    "day": 18,
    "corridor": "MG Road",
    "police_station": "Cubbon Park",
    "zone": "CBD 2",
    "duration_mins": 180
  }'
```

Expected response:
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
    "priority_flag": "CRITICAL",
    "manpower_min": 21,
    "manpower_max": 35,
    "barricading": "Full corridor lockdown + marshal chain",
    "diversion": "Police-escorted diversion + public advisory + PR alert",
    "impact_minutes": 90,
    "pre_deploy": "Deploy min 21 officers 2h before event start",
    "peak_note": "Peak hour active - raise headcount by 25%",
    "special_action": "Issue public advisory. Coordinate with event organiser. Set up crowd control perimeter."
  },
  "location_cluster": 7
}
```

---

## Docker

### Build and run all three services:

```bash
docker compose up --build
```

This starts:
- **ML Sidecar** on http://localhost:8001
- **API Backend** on http://localhost:8080
- **Frontend** on http://localhost:3000 (with `NEXT_PUBLIC_API_URL=http://backend:8080`)

### Verify with Docker:

```bash
curl http://localhost:8080/api/health
curl -X POST http://localhost:8080/api/predict -H "Content-Type: application/json" -d "{...}"
```

---

## Environment Variables

### API Backend (`backend/main.py`)

| Variable | Default | Description |
|---|---|---|
| `PORT` | `8080` | Port for the API server |
| `SIDECAR_URL` | `http://localhost:8001` | URL of the ML sidecar service |

### Frontend (`frontend/`)

Create `frontend/.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8080
```

For production, set this to the deployed API URL (e.g., `https://your-api.railway.app`).

---

## API Reference

### Backend Endpoints (Public)

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/health` | Health check with sidecar status |
| `POST` | `/api/predict` | Predict congestion severity |
| `GET` | `/api/meta` | List available corridors, police stations, zones |
| `GET` | `/api/corridors` | List available corridors only |

### Sidecar Endpoints (Internal)

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Model loading status |
| `POST` | `/infer` | Run ML inference |
| `GET` | `/meta` | Available categorical values |

### POST /api/predict -- Request Body

| Field | Type | Required | Description |
|---|---|---|---|
| `latitude` | number | yes | Event latitude (Bengaluru area: 12-13) |
| `longitude` | number | yes | Event longitude (Bengaluru area: 77-78) |
| `event_type` | string | yes | "planned" or "unplanned" |
| `event_cause` | string | yes | e.g. "public_event", "accident", "vehicle_breakdown", "water_logging", "road_work" |
| `start_hour` | integer | yes | 0-23 |
| `day_of_week` | integer | yes | 0=Monday to 6=Sunday |
| `month` | integer | yes | 1-12 |
| `day` | integer | yes | 1-31 |
| `corridor` | string | no | e.g. "MG Road", "ORR East 1", "Hosur Road" |
| `police_station` | string | no | e.g. "Cubbon Park", "Indiranagar" |
| `zone` | string | no | e.g. "CBD 2", "East 1" |
| `veh_type` | string | no | Vehicle type involved |
| `duration_mins` | number | no | Expected event duration in minutes |
| `junction` | string | no | Junction name if applicable |

---

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

These are excluded from git (large binary files). Generate them by running:

```bash
python cyan_training_pipeline.py
```

Or download from the project's release artifacts.

---

## Deployment

### Railway (Python API + ML Sidecar)

1. Connect GitHub repo to Railway
2. Create two services: `backend/` and `ml_sidecar/`
3. Set `SIDECAR_URL=http://<sidecar-service>.railway.internal:8001`
4. Upload `.pkl` files or build via Docker

### Vercel (Next.js Frontend)

1. Connect GitHub repo to Vercel, set root to `frontend/`
2. Set `NEXT_PUBLIC_API_URL=https://<your-api-url>.railway.app`
3. Deploy

---

## Model Metrics

| Model | Accuracy | F1 (Macro) | F1 (Weighted) |
|---|---|---|---|
| LightGBM | 0.996 | 0.991 | 0.996 |
| XGBoost | 0.996 | 0.991 | 0.996 |
| MLP-NN | 0.993 | 0.979 | 0.993 |
| TabNet | 0.995 | 0.986 | 0.995 |
| **Stacked Ensemble** | **0.994** | **0.987** | **0.994** |

View detailed charts at `/model` page in the frontend or see `trained_models/` for PNG visualizations.

---

## Tech Stack

| Layer | Technology |
|---|---|
| ML Inference | Python 3.11 + FastAPI |
| API Server | Python 3.11 + FastAPI |
| Frontend | Next.js 16 (App Router) + TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Map | react-leaflet + OpenStreetMap |
| Charts | Recharts |
| Containerization | Docker + Docker Compose |
| Deployment | Railway (backend) + Vercel (frontend) |
