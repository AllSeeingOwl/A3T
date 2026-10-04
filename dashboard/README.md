# A3T Analytics & Admin Dashboard

The **A3T Analytics & Admin Dashboard** is a React single-page application for monitoring game performance, question difficulty metrics, player leaderboards, and managing moderation flags.

## Features

- **Overview Dashboard**: High-level game metrics (total games, unique players, daily sessions, overall accuracy) with interactive 30-day trends and category/difficulty bar charts.
- **Question Performance Analytics**: Searchable, filterable question performance table with intended vs. actual difficulty calculations and accuracy highlighting.
- **Player Leaderboard**: All-time top player rankings with sortable metrics (total score, average score, accuracy %, games played).
- **Admin Moderation Panel**: JWT password-authenticated admin console for reviewing flagged questions and hiding/unhiding problematic questions from active games.
- **Real-Time WebSocket Integration**: Live active player count and game completion notifications via `/ws/analytics`.

## Getting Started

### Prerequisites

- Node.js 18+ and `pnpm`
- Running FastAPI backend server (or `src/mcp_server.py`)

### Installation & Running Locally

1. Install dependencies:
   ```bash
   cd dashboard
   pnpm install
   ```

2. Start the development server (with Vite proxy to `http://localhost:8000`):
   ```bash
   pnpm dev
   ```

3. Build for production:
   ```bash
   pnpm build
   ```

## Backend Endpoints

- `GET /api/analytics/overview` - High-level game statistics
- `GET /api/analytics/questions` - Performance metrics for all trivia questions
- `GET /api/analytics/daily-stats` - Daily games and accuracy trends
- `GET /api/analytics/player-leaderboard` - All-time top player rankings
- `GET /api/analytics/category-breakdown` - Performance breakdown by domain
- `GET /api/analytics/difficulty-breakdown` - Performance breakdown by difficulty tier
- `POST /api/admin/authenticate` - Password authentication returning JWT token
- `POST /api/admin/flag-question` - Flag a problematic question
- `GET /api/admin/flagged-questions` - List flagged questions (Admin JWT required)
- `POST /api/admin/hide-question` - Hide question from active games (Admin JWT required)
- `POST /api/admin/unhide-question` - Re-enable hidden question (Admin JWT required)
- `WS /ws/analytics` - Live analytics WebSocket feed
