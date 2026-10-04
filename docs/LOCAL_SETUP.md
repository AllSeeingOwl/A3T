# Local Development Setup

This guide provides instructions for setting up and running the A3T (Always A Trivial Triple Threat) full stack locally using Docker Compose or native Python.

## Quick Start with Docker Compose

Ensure Docker and Docker Compose are installed on your system.

```bash
# 1. Clone the repository
git clone https://github.com/AllSeeingOwl/A3T.git
cd A3T

# 2. Copy environment variables configuration
cp .env.example .env

# 3. Edit .env with your specific API keys if needed
# e.g., ANTHROPIC_API_KEY=sk-ant-...

# 4. Start all services (Database, API, and Frontend)
docker-compose -f docker/docker-compose.yml up -d

# 5. Run database migrations
docker-compose -f docker/docker-compose.yml exec api alembic upgrade head
```

### Access Endpoints

- **Frontend App:** [http://localhost:5173](http://localhost:5173)
- **FastAPI REST Service:** [http://localhost:8000](http://localhost:8000)
- **Interactive OpenAPI Specs:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **PostgreSQL Database:** `localhost:5432` (`a3t_dev` / `dev_password`)

## Native Local Python Development

If you prefer running Python directly:

```bash
# Create and activate a virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run pytest test suite
pytest tests/ -v

# Run FastAPI application locally
uvicorn api.app:app --reload --port 8000
```
