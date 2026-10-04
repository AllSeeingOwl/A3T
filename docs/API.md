# API Documentation

The A3T FastAPI backend exposes endpoints for multiplayer game sessions, question generation, AI analysis, analytics, and administration.

## Core Endpoints

### Health Check
- `GET /health`
  - Returns `{"status": "healthy", "version": "1.0.0", "timestamp": "..."}`

### Games (`/api/games`)
- `POST /api/games`: Create a new trivia game room.
- `POST /api/games/{game_id}/join`: Join an existing game room.
- `GET /api/games/{game_id}`: Retrieve current game session state.
- `POST /api/games/{game_id}/answer`: Submit an answer for the current question.
- `POST /api/games/{game_id}/next-question`: Advance game to the next question.
- `GET /api/games/{game_id}/leaderboard`: Retrieve current scores and leaderboard rankings.
- `POST /api/games/{game_id}/end`: End game and summarize winners.
- `WS /ws/games/{game_id}`: Real-time WebSocket connection for game state broadcasts.

### AI Generation & Analysis (`/api/generate`, `/api/analyze`)
- `POST /api/generate/single`: Generate single trivia questions via Claude.
- `POST /api/generate/chain`: Generate a 3-question linked trivia chain.
- `POST /api/generate/variations`: Create difficulty variations.
- `POST /api/analyze/quality`: Analyze question quality and formatting.
- `POST /api/analyze/validate`: Run schema and safety validation.

### Analytics & Admin (`/api/analytics`, `/api/admin`)
- `POST /api/analytics/flag`: Flag a question for review.
- `POST /api/admin/login`: Authenticate admin and acquire JWT.
- `GET /api/admin/flags`: View flagged questions (Requires JWT).
