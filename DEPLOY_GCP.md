# Deploying ASTRAM Gridlock to Google Cloud Run (Windows PowerShell Edition)

This guide walkthroughs how to deploy the three services (**ML Sidecar**, **FastAPI Backend**, and **Next.js Frontend**) to Google Cloud Run using Windows PowerShell.

---

## Architecture Overview

```
[ Next.js Frontend ] (Public)
        │
        ▼ (NEXT_PUBLIC_API_URL)
[ FastAPI Backend ] (Public)
        │
        ▼ (SIDECAR_URL)
[ ML Sidecar ] (Private / Internal-only, or Public)
```

Because Cloud Run services scale to zero and are serverless, we deploy them as three separate containers.

---

## Prerequisites

1. **Google Cloud SDK (gcloud CLI)**: Ensure `gcloud` is installed and configured in your PowerShell session.
2. **Docker**: Ensure Docker Desktop is running on Windows.
3. **Artifact Registry**: Enable the Artifact Registry API in your GCP Console.

---

## Step 1: Initial GCP Setup

Initialize the `gcloud` CLI and log in:

```powershell
# Log in to your Google Account
gcloud auth login

# Set your active GCP project
gcloud config set project YOUR_GCP_PROJECT_ID

# Enable the required APIs
gcloud services enable artifactregistry.googleapis.com run.googleapis.com
```

Create a Docker repository in Google Artifact Registry:

```powershell
gcloud artifacts repositories create gridlock-repo `
    --repository-format=docker `
    --location=asia-south1 `
    --description="ASTRAM Gridlock Docker images"
```

Configure Docker to authenticate with Artifact Registry:

```powershell
gcloud auth configure-docker asia-south1-docker.pkg.dev
```

---

## Step 2: Build & Deploy the ML Sidecar

The ML Sidecar serves the model predictions.

1. **Build and Tag the image:**
   ```powershell
   docker build -t asia-south1-docker.pkg.dev/YOUR_GCP_PROJECT_ID/gridlock-repo/ml-sidecar:latest -f ml_sidecar/Dockerfile .
   ```

2. **Push the image to Artifact Registry:**
   ```powershell
   docker push asia-south1-docker.pkg.dev/YOUR_GCP_PROJECT_ID/gridlock-repo/ml-sidecar:latest
   ```

3. **Deploy to Cloud Run:**
   ```powershell
   gcloud run deploy ml-sidecar `
       --image=asia-south1-docker.pkg.dev/YOUR_GCP_PROJECT_ID/gridlock-repo/ml-sidecar:latest `
       --region=asia-south1 `
       --platform=managed `
       --allow-unauthenticated `
       --port=8001 `
       --memory=2Gi `
       --cpu=2
   ```

> [!IMPORTANT]
> Note the Service URL returned by this command. It will look like:
> `https://ml-sidecar-xxxx-el.a.run.app`
> Save this URL as **`$SIDECAR_URL`**.

---

## Step 3: Build & Deploy the Backend API

The Backend orchestrates user requests and forwards them to the ML Sidecar.

1. **Build and Tag the image:**
   ```powershell
   docker build -t asia-south1-docker.pkg.dev/YOUR_GCP_PROJECT_ID/gridlock-repo/backend:latest ./backend
   ```

2. **Push the image to Artifact Registry:**
   ```powershell
   docker push asia-south1-docker.pkg.dev/YOUR_GCP_PROJECT_ID/gridlock-repo/backend:latest
   ```

3. **Deploy to Cloud Run:**
   Pass the `SIDECAR_URL` you saved from the previous step as an environment variable:
   ```powershell
   gcloud run deploy backend-api `
       --image=asia-south1-docker.pkg.dev/YOUR_GCP_PROJECT_ID/gridlock-repo/backend:latest `
       --region=asia-south1 `
       --platform=managed `
       --allow-unauthenticated `
       --port=8080 `
       --set-env-vars="SIDECAR_URL=https://ml-sidecar-xxxx-el.a.run.app,PORT=8080"
   ```

> [!IMPORTANT]
> Note the Service URL returned by this command. It will look like:
> `https://backend-api-xxxx-el.a.run.app`
> Save this URL as **`$BACKEND_URL`**.

---

## Step 4: Build & Deploy the Next.js Frontend

The frontend needs the `BACKEND_URL` baked in at build time so the client browser knows where to send API requests.

1. **Build and Tag the image (passing BACKEND_URL as build argument):**
   ```powershell
   docker build `
       --build-arg NEXT_PUBLIC_API_URL=https://backend-api-xxxx-el.a.run.app `
       -t asia-south1-docker.pkg.dev/YOUR_GCP_PROJECT_ID/gridlock-repo/frontend:latest `
       ./frontend
   ```

2. **Push the image to Artifact Registry:**
   ```powershell
   docker push asia-south1-docker.pkg.dev/YOUR_GCP_PROJECT_ID/gridlock-repo/frontend:latest
   ```

3. **Deploy to Cloud Run:**
   ```powershell
   gcloud run deploy frontend-ui `
       --image=asia-south1-docker.pkg.dev/YOUR_GCP_PROJECT_ID/gridlock-repo/frontend:latest `
       --region=asia-south1 `
       --platform=managed `
       --allow-unauthenticated `
       --port=3000
   ```

---

## Verification

Once the frontend deployment is complete:
1. Open the URL returned by the `frontend-ui` deployment (e.g., `https://frontend-ui-xxxx-el.a.run.app`).
2. Go to the prediction page and test the end-to-end functionality!
