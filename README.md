# Little League Lineups

A full-stack TypeScript app for managing youth baseball rosters and automatically generating fair game lineups. Coaches add their roster, set player position preferences, and the app generates balanced lineups that rotate players through positions across innings.

## Features

- **Automatic lineup generation** - Shuffles and assigns players to positions each inning, with bench rotation for large rosters
- **Player position preferences** - Set preferred and avoided positions per player
- **Fairness tracking** - Season recap with equity metrics for bench time, pitching distribution, and overall playing time
- **Game management** - Track opponents, scores, and view/edit lineups per game
- **Season analytics** - Charts and stats via Recharts (pitching distribution, position breakdowns, sortable player tables)
- **Print-friendly lineups** - Optimized CSS for printing lineup cards
- **JWT authentication** - Secure coach accounts with token-based auth

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS v4, Zustand, Recharts |
| Backend | Express.js, Prisma ORM, PostgreSQL 15 |
| Shared | TypeScript, npm workspaces |
| Auth | JWT (jsonwebtoken), bcryptjs |

## Project Structure

```
├── apps/
│   ├── api/            # Express REST API
│   └── web-ui/         # React + Vite frontend
├── packages/
│   └── types/          # Shared TypeScript types (@lineup/types)
└── run-local-env.sh    # One-command local dev setup
```

## Quick Start

**Prerequisites**: Node.js >= 20, Docker

```bash
# Clone and install
git clone https://github.com/seanmck/littleleaguelineups.git
cd littleleaguelineups
npm install

# Start everything (PostgreSQL, API on :3000, Web UI on :5173)
./run-local-env.sh

# Or start with seed data (test account + 13 players)
./run-local-env.sh --seed
```

The script handles PostgreSQL via Docker, Prisma migrations, and starts both the API and frontend. Hit `Ctrl+C` to tear everything down.

**Seed account**: `test@example.com` / `password123`

## Running Services Individually

```bash
# API (port 3000)
cd apps/api && npm run dev

# Web UI (port 5173, proxies /api to localhost:3000)
cd apps/web-ui && npm run dev

# Rebuild shared types after changes
cd packages/types && npm run build
cd ../../apps/api && npm install ../../packages/types
```

## Database

PostgreSQL with Prisma ORM. Schema lives at `apps/api/prisma/schema.prisma`.

```bash
# Generate Prisma client after schema changes
npx prisma generate --schema=apps/api/prisma/schema.prisma

# Run migrations
npx prisma migrate deploy --schema=apps/api/prisma/schema.prisma

# Create a new migration
npx prisma migrate dev --schema=apps/api/prisma/schema.prisma
```

### Data Model

- **Account** - Coach/parent auth (email + hashed password)
- **Team** - A baseball team
- **TeamMembership** - Links accounts to teams with a role (coach or parent)
- **Player** - Roster entry with preferred/avoided positions
- **Game** - Date, opponent, scores, innings (1-9), and generated lineup (JSON)

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/signup` | Create account |
| POST | `/api/login` | Login, returns JWT |
| GET | `/api/my-teams` | Current user's teams |
| POST | `/api/teams` | Create team |
| GET/POST | `/api/teams/:id/players` | Roster management |
| PUT/DELETE | `/api/teams/:id/players/:pid` | Update/remove player |
| GET/POST | `/api/teams/:id/games` | Game list / create game with lineup |
| GET/PUT | `/api/teams/:id/games/:gid` | Game details / update scores & lineup |
| GET | `/api/teams/:id/season-recap` | Fairness metrics and season stats |

## How Lineup Generation Works

The algorithm in `apps/api/src/lib/generateLineup.ts`:

1. For each inning, shuffles the player list randomly
2. Assigns field positions based on roster size:
   - **10+ players**: P, C, 1B, 2B, 3B, SS, LF, LCF, RCF, RF
   - **9 players**: P, C, 1B, 2B, 3B, SS, LF, CF, RF
   - **< 9 players**: Fewer positions as needed
3. Remaining players are assigned to Bench
4. Tracks position history across innings to support fairness analysis

## Environment Variables

| Variable | Used By | Description |
|----------|---------|-------------|
| `DATABASE_URL` | API | PostgreSQL connection string |
| `JWT_SECRET` | API | Secret for signing tokens (defaults to dev value) |
| `VITE_API_BASE_URL` | Web UI | API base URL (defaults to `/api`) |

`run-local-env.sh` sets database variables automatically.

## Deployment

Both apps have Dockerfiles and GitHub Actions workflows for Azure deployment:

- `apps/api/Dockerfile` - API container
- `apps/web-ui/Dockerfile` - Frontend container
- `.github/workflows/` - CI/CD pipelines for Azure Static Web Apps and API
