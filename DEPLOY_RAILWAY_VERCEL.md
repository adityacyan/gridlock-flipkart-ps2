# Deploying to Railway & Vercel

This guide walks you through deploying the **ML Sidecar** and **FastAPI Backend** to **Railway**, and the **Next.js Frontend** to **Vercel**.

---

## Part 1: Deploying Backend & Sidecar to Railway

Railway can automatically deploy your services directly from your GitHub repository using the `Dockerfile`s defined in the project.

### Step 1: Create a Railway Project
1. Log in to [Railway.app](https://railway.app/).
2. Click **New Project** -> **Deploy from GitHub repo**.
3. Select your repository (`gridlock-flipkart-ps2`).

---

### Step 2: Add and Configure the ML Sidecar Service
1. In your Railway project dashboard, click **+ New** -> **GitHub Repo** and select your repository again.
2. Rename this service to `ml-sidecar`.
3. Go to the **Settings** tab of the `ml-sidecar` service:
   * Under **Build**: Set the **Dockerfile Path** to `ml_sidecar/Dockerfile`.
   * Under **General**: Set the **Root Directory** to `/` (default).
4. Go to the **Variables** tab and add:
   * `PORT=8001`
5. Railway will automatically build and deploy the sidecar. Once deployed, copy its **Reference URL** (e.g., `http://ml-sidecar.railway.internal:8001` or the public domain provided under the Networking section).

---

### Step 3: Add and Configure the Backend API Service
1. Click **+ New** -> **GitHub Repo** and select your repository again.
2. Rename this service to `backend-api`.
3. Go to the **Settings** tab of the `backend-api` service:
   * Under **Build**: Set the **Dockerfile Path** to `backend/Dockerfile`.
   * Under **General**: Set the **Root Directory** to `/` (default).
4. Go to the **Variables** tab and add:
   * `PORT=8080`
   * `SIDECAR_URL=http://ml-sidecar.railway.internal:8001` (Replace this with the internal or public URL of your `ml-sidecar` service from Step 2).
5. Go to the **Settings** tab, scroll to **Networking**, and click **Generate Domain** to expose the backend API publicly.
6. Copy this generated public URL (e.g., `https://backend-api-production.up.railway.app`). This is your **`BACKEND_URL`**.

---

## Part 2: Deploying Next.js Frontend to Vercel

Vercel is the recommended hosting platform for Next.js applications.

### Step 1: Import Your Repository
1. Log in to [Vercel](https://vercel.com/).
2. Click **Add New** -> **Project**.
3. Import your GitHub repository (`gridlock-flipkart-ps2`).

### Step 2: Configure Build & Environment Settings
1. **Framework Preset**: Vercel will automatically detect **Next.js**.
2. **Root Directory**: Set this to `frontend` (click **Edit** next to Root Directory, select the `frontend` folder, and click **Continue**).
3. **Environment Variables**: Expand this section and add:
   * **Key**: `NEXT_PUBLIC_API_URL`
   * **Value**: `https://backend-api-production.up.railway.app` (The public URL of your backend service from Railway).
4. Click **Deploy**.

---

## Verification
1. Once Vercel finishes building your Next.js project, it will generate a deployment URL (e.g., `https://gridlock-flipkart.vercel.app`).
2. Open the URL, fill out a traffic prediction request, and click **Run Prediction** to verify that the frontend correctly communicates with the FastAPI Backend on Railway!
