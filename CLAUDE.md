# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Little League Lineups is a full-stack TypeScript application for managing youth baseball team rosters and automatically generating fair game lineups. It uses a monorepo structure with npm workspaces.

## Development Commands

### Full Local Environment
```bash
./run-local-env.sh          # Starts PostgreSQL (Docker), API, and Web UI
./run-local-env.sh --seed   # Same as above but seeds test data
```

### Individual Services
```bash
# API (Express backend) - runs on port 3000
cd apps/api && npm run dev

# Web UI (React frontend) - runs on port 5173
cd apps/web-ui && npm run dev

# Shared types package
cd packages/types && npm run build
```

### Database
```bash
# Generate Prisma client after schema changes
npx prisma generate --schema=apps/api/prisma/schema.prisma

# Run migrations
npx prisma migrate deploy --schema=apps/api/prisma/schema.prisma

# Create new migration
npx prisma migrate dev --schema=apps/api/prisma/schema.prisma
```

### Build
```bash
npm run build   # From apps/api or apps/web-ui
```

## Architecture

### Monorepo Structure
- `apps/api` - Express.js REST API with Prisma ORM (PostgreSQL)
- `apps/web-ui` - React + Vite + Tailwind CSS frontend
- `packages/types` - Shared TypeScript types (`@lineup/types`)

### API Routes
All routes are under `/api` prefix. Main endpoints:
- `POST /api/signup` - Account creation, returns JWT
- `GET/POST /api/teams` - Team management
- `GET/POST /api/teams/:teamId/players` - Player roster
- `PUT /api/teams/:teamId/players/:playerId` - Update player
- `GET/POST /api/teams/:teamId/games` - Game management (POST generates lineup)

### Frontend Pages
Routes map to `apps/web-ui/src/pages/`:
- `/` - LandingPage
- `/dashboard` - Dashboard
- `/signup` - Signup
- `/teams` - TeamSelectPage
- `/teams/:teamId/roster` - RosterPage
- `/teams/:teamId/games` - GamesListPage
- `/teams/:teamId/games/setup` - GameSetupPage
- `/teams/:teamId/games/:gameId` - GameDetailPage

### Data Model (Prisma)
- `Account` - User accounts with email/password
- `Team` - Baseball teams
- `TeamMembership` - Links accounts to teams with roles (coach/parent)
- `Player` - Team roster with preferredPositions and avoidPositions
- `Game` - Game instances with generated lineup stored as JSON

### Key Types
Positions: `P`, `C`, `1B`, `2B`, `3B`, `SS`, `LF`, `CF`, `RF`, `LCF`, `RCF`, `Bench`

The lineup generator in `apps/api/src/lib/generateLineup.ts` shuffles players per inning and balances position assignments.

## Environment Variables

Required for API:
- `DATABASE_URL` - PostgreSQL connection string
- `PG_HOST`, `PG_USER`, `PG_PASSWORD`, `PG_DB`, `PG_PORT` - Used by run-local-env.sh

Frontend (optional):
- `VITE_API_BASE_URL` - API base URL (defaults to `/api`, proxied to localhost:3000 in dev)

## Notes

- After modifying `packages/types`, rebuild and reinstall in API: `cd packages/types && npm run build && cd ../../apps/api && npm install ../../packages/types`
- Frontend uses Zustand for state management (`apps/web-ui/src/state/store.ts`)
- API uses JWT authentication via Bearer tokens
