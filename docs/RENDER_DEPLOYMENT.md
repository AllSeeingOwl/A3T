# Deploying A3T to Render

This guide provides step-by-step instructions for deploying the **Always A (Trivial) Triple Threat (A3T)** application to [Render](https://render.com).

A3T consists of two primary components that can be hosted on Render:
1. **Frontend Web App (`a3t-web`)**: A React + TypeScript static application built with Vite.
2. **Backend API & MCP Server (`a3t-api`)**: A Python FastAPI service that hosts multiplayer game session endpoints, question validation, and AI draft generation.

---

## 🛠️ Option 1: Automatic Deployment using Render Blueprints (Recommended)

Render Blueprints allow you to deploy both the frontend static site and backend web service simultaneously using the `render.yaml` configuration file included in this repository.

### Steps:

1. **Push Repository to GitHub / GitLab:**
   Ensure your code is pushed to your remote repository.

2. **Log into Render Dashboard:**
   Go to [https://dashboard.render.com/](https://dashboard.render.com/).

3. **Create a New Blueprint:**
   - Click **New +** in the top right corner.
   - Select **Blueprint**.
   - Connect your Git repository containing the A3T code.
   - Render will automatically detect `render.yaml` in the root directory.

4. **Configure Environment Variables:**
   - Set a name for your Blueprint instance.
   - If prompted for `ANTHROPIC_API_KEY`, enter your Anthropic API Key (required if using AI question generation/analysis features; optional otherwise).

5. **Deploy:**
   - Click **Apply**.
   - Render will automatically build and launch both services:
     - `a3t-web` (Static Site)
     - `a3t-api` (Web Service)

---

## 🔧 Option 2: Manual Service Setup via Render Dashboard

If you prefer to configure services manually on Render:

### 1. Deploying the Backend API (`a3t-api`)

- **Service Type:** Web Service
- **Environment:** Python
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `uvicorn src.mcp_server:app --host 0.0.0.0 --port $PORT`
- **Health Check Path:** `/health`
- **Environment Variables:**
  - `PYTHON_VERSION`: `3.12.3`
  - `ANTHROPIC_API_KEY`: *(Optional)* Your Anthropic Claude API key for AI generation features.

### 2. Deploying the Frontend Web App (`a3t-web`)

- **Service Type:** Static Site
- **Build Command:** `pnpm install && pnpm build` (or `npm install && npm run build`)
- **Publish Directory:** `./dist`
- **Rewrite Rules:**
  - Source: `/*`
  - Destination: `/index.html` (for single-page app routing)
- **Environment Variables:**
  - `VITE_BASE_PATH`: `/`

---

## ⚙️ Environment Variables Reference

| Service | Variable Name | Default / Required | Description |
| :--- | :--- | :--- | :--- |
| `a3t-web` | `VITE_BASE_PATH` | `/` | Base URL path for assets. Set to `/` for Render static sites (or `/A3T/` for GitHub Pages). |
| `a3t-api` | `PORT` | Auto-assigned | Port provided dynamically by Render for Uvicorn web service. |
| `a3t-api` | `ANTHROPIC_API_KEY` | Optional | Anthropic Claude API key used by `/api/generate/*` and AI analyzer endpoints. |

---

## 🔍 Verification & Health Check

After deployment completes:
- **Backend Health Check:** Visit `https://<your-a3t-api-url>.onrender.com/health` to confirm the API returns `{"status":"ok", ...}`.
- **Interactive API Docs:** Visit `https://<your-a3t-api-url>.onrender.com/docs` to test endpoints via Swagger UI.
- **Frontend App:** Visit `https://<your-a3t-web-url>.onrender.com` to use the interactive tabletop game board.
