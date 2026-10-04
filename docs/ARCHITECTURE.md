# Architecture & System Design

A3T (Always A Trivial Triple Threat) is designed as a hybrid full-stack application supporting real-time trivia games, automated Claude-powered question generation, validation workflows, and MCP server integrations.

## System Topology

```
                  ┌──────────────────────┐
                  │   Vite React Web UI  │
                  └──────────┬───────────┘
                             │ HTTP / WebSockets
                             ▼
                  ┌──────────────────────┐
                  │    FastAPI Backend   │
                  │     (api/app.py)     │
                  └──────────┬───────────┘
         ┌───────────────────┼───────────────────┐
         ▼                   ▼                   ▼
┌────────────────┐  ┌────────────────┐  ┌────────────────┐
│  PostgreSQL /  │  │ Anthropic API  │  │   MCP Server   │
│    Alembic     │  │ (Claude 3.5)   │  │ (mcp_server)   │
└────────────────┘  └────────────────┘  └────────────────┘
```

## Key Components

1. **Frontend (`src/`)**: React + TypeScript + Vite + Tailwind CSS. Handles arena game loops, trivia deck selection, QR scanner interactions, and real-time multiplayer updates.
2. **API Backend (`api/`)**:
   - `api/app.py`: Main FastAPI entrypoint integrating routers.
   - `src/routers/games.py`: Game room lifecycle, answer submissions, and WebSocket broadcasts.
   - `api/routers/generate.py` & `analyze.py`: AI question synthesis and validation.
   - `api/routers/analytics.py` & `admin.py`: Telemetry, flag reviews, and admin actions.
3. **Model Context Protocol (`mcp/` & `src/mcp_server.py`)**: Exposes question validation, duplicate checks, safety checks, and domain search capabilities to Claude and LLM tool runners.
4. **Database & Migrations (`alembic/` & `api/models.py`)**: SQLAlchemy models for persistent game state, player histories, and submitted answers with Alembic migration versioning.
