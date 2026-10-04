# Production Deployment Guide

This guide covers deploying the A3T project to production using Render or Google Cloud Run.

## Option 1: Render (Recommended)

A3T is configured with a Blueprint template in `deployment/render.yaml` or `render.yaml`.

### Automated Deployment Steps

1. Push your changes to the `main` branch of your GitHub repository.
2. Log into the [Render Dashboard](https://dashboard.render.com).
3. Click **New +** > **Blueprint**.
4. Connect your A3T GitHub repository.
5. Render will detect `render.yaml` and provision:
   - `a3t-api` Python Web Service (runs Alembic migrations and Uvicorn).
   - `a3t-db` PostgreSQL Database.
   - `a3t-web` Static Site (Vite React app).
6. Configure environment variables in Render:
   - `ANTHROPIC_API_KEY`: Your Anthropic Claude API Key.
   - `ADMIN_PASSWORD`: Secure password for admin authentication.

### Continuous Deployment Hook

You can configure `.github/workflows/deploy-to-cloud.yml` by adding your Render Deploy Hook URL to GitHub repository secrets as `RENDER_DEPLOY_HOOK`.

## Option 2: Google Cloud Run

For Google Cloud Run deployment:

```bash
# Build API container image
docker build -t a3t-api:latest -f docker/Dockerfile.api .

# Tag image for Google Container Registry / Artifact Registry
docker tag a3t-api:latest gcr.io/YOUR_PROJECT_ID/a3t-api:latest

# Push to GCR
docker push gcr.io/YOUR_PROJECT_ID/a3t-api:latest

# Deploy to Cloud Run
gcloud run deploy a3t-api \
  --image gcr.io/YOUR_PROJECT_ID/a3t-api:latest \
  --platform managed \
  --region us-central1 \
  --set-env-vars DATABASE_URL=$DATABASE_URL,ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY
```
