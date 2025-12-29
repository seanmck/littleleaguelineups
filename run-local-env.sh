#!/bin/bash

# filepath: /home/seanmck/repos/github.com/seanmck/littleleaguelineups/run-local-env.sh

# Exit immediately if a command exits with a non-zero status
set -e

# Rebuild types package
(cd ./packages/types && npm run build)
(cd ./apps/api && npm install ../../packages/types)

# Define variables
PG_CONTAINER_NAME="littleleague-pg"
PG_IMAGE="postgres:15-alpine"
PG_PORT_DEFAULT=5432
export PG_USER="myadmin"
export PG_PASSWORD="mypassword"
export PG_DB="appdb"
export PG_HOST="localhost"

SEED_DATA=false
if [ "$1" == "--seed" ]; then
  SEED_DATA=true
fi

# Function to start a fresh container
start_fresh_container() {
  # Clean up any existing container
  if [ "$(docker ps -a -q -f name=^${PG_CONTAINER_NAME}$)" ]; then
    echo "🗑 Removing existing PostgreSQL container..."
    docker rm -f $PG_CONTAINER_NAME > /dev/null
  fi

  # Find an available port starting from default
  find_available_port() {
    local port=$1
    while docker ps -q --filter "publish=$port" | grep -q . || lsof -i :$port -t > /dev/null 2>&1; do
      echo "Port $port is in use, trying next..." >&2
      port=$((port + 1))
    done
    echo $port
  }

  export PG_PORT=$(find_available_port $PG_PORT_DEFAULT)
  if [ "$PG_PORT" != "$PG_PORT_DEFAULT" ]; then
    echo "⚠️  Default port $PG_PORT_DEFAULT unavailable, using port $PG_PORT"
  fi

  # Start PostgreSQL in a Docker container
  echo "🚀 Starting PostgreSQL container on port $PG_PORT..."
  docker run --name $PG_CONTAINER_NAME \
    -e POSTGRES_USER=$PG_USER \
    -e POSTGRES_PASSWORD=$PG_PASSWORD \
    -e POSTGRES_DB=$PG_DB \
    -p $PG_PORT:5432 \
    -d $PG_IMAGE
  echo "✅ PostgreSQL container started."

  # Wait for PostgreSQL to be ready
  echo "⏳ Waiting for PostgreSQL to be ready..."
  until docker exec $PG_CONTAINER_NAME pg_isready -U $PG_USER > /dev/null 2>&1; do
    sleep 1
  done
  echo "✅ PostgreSQL is ready."
}

# Check if our container is already running with correct credentials
if [ "$(docker ps -q -f name=^${PG_CONTAINER_NAME}$)" ]; then
  export PG_PORT=$(docker port $PG_CONTAINER_NAME 5432 | cut -d: -f2)
  # Verify we can authenticate with expected credentials
  if docker exec $PG_CONTAINER_NAME pg_isready -U $PG_USER > /dev/null 2>&1 && \
     docker exec -e PGPASSWORD=$PG_PASSWORD $PG_CONTAINER_NAME psql -U $PG_USER -d $PG_DB -c "SELECT 1" > /dev/null 2>&1; then
    echo "✅ PostgreSQL container already running with valid credentials, reusing it."
  else
    echo "⚠️  Container exists but credentials don't match, recreating..."
    start_fresh_container
  fi
else
  start_fresh_container
fi

# Generate the DATABASE_URL environment variable (sslmode=disable for local Docker)
export DATABASE_URL="postgresql://${PG_USER}:${PG_PASSWORD}@${PG_HOST}:${PG_PORT}/${PG_DB}?schema=public&sslmode=disable"
echo "✅ DATABASE_URL set to: $DATABASE_URL"

# Write .env file for API (overrides any cloud settings)
cat > apps/api/.env <<EOF
DATABASE_URL=${DATABASE_URL}
EOF
echo "✅ Created apps/api/.env for local development"

npx prisma generate --schema=apps/api/prisma/schema.prisma
npx prisma migrate deploy --schema=apps/api/prisma/schema.prisma

npm run --prefix packages/types/ build

# Start the API service
echo "🚀 Starting API service..."
cd apps/api
npm install
NODE_ENV=development DEBUG=* npm run dev 2>&1 | tee api.log &
API_PID=$!
cd ../..

# Start the web-ui service
echo "🚀 Starting Web UI service..."
cd apps/web-ui
npm install
npm run dev 2>&1 | tee web-ui.log &
WEB_UI_PID=$!
cd ../..

# Wait for API to be ready
echo "⏳ Waiting for API to be ready..."
until curl -s http://localhost:3000/api/teams > /dev/null 2>&1; do
  sleep 1
done

# Seed data if requested
if [ "$SEED_DATA" = true ]; then
  echo "🌱 Seeding test data..."

  # Create account and team with 13 players
  node -e "
  (async () => {
    const API_BASE = 'http://localhost:3000/api';

    async function seed() {
      const signupRes = await fetch(\`\${API_BASE}/signup\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com', password: 'password123' })
      });
      const { token } = await signupRes.json();
      console.log('✅ Created account, token:', token);

      const teamRes = await fetch(\`\${API_BASE}/teams\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${token}\`
        },
        body: JSON.stringify({ name: 'Test Team' })
      });
      const team = await teamRes.json();

      const positions = ['P','C','1B','2B','3B','SS','LF','CF','RF','LCF','RCF'];

      function positionsSample(exclude = []) {
        return positions
          .filter(p => !exclude.includes(p))
          .sort(() => 0.5 - Math.random())
          .slice(0, Math.floor(Math.random() * 3));
      }

      for (let i = 1; i <= 13; i++) {
        const preferredPositions = positionsSample();
        const avoidPositions = positionsSample(preferredPositions);

        await fetch(\`\${API_BASE}/teams/\${team.id}/players\`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': \`Bearer \${token}\`
          },
          body: JSON.stringify({
            name: \`Player \${i}\`,
            preferredPositions,
            avoidPositions
          })
        });
      }

      console.log('✅ Seed data created.');
    }

    seed().catch(console.error);
  })();
  "
fi

echo "🔗 API running at http://localhost:3000"
echo "🔗 Web UI: http://localhost:5173"
echo "Press Ctrl+C to stop."

# Trap Ctrl+C and clean up
trap "echo '🛑 Stopping local environment...'; kill $API_PID $WEB_UI_PID; docker stop $PG_CONTAINER_NAME > /dev/null; docker rm $PG_CONTAINER_NAME > /dev/null; exit 0" SIGINT

# Keep the script running
wait