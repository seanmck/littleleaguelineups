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
export PG_PORT=5432
export PG_USER="myadmin"
export PG_PASSWORD="mypassword"
export PG_DB="appdb"
export PG_HOST="localhost"

SEED_DATA=false
if [ "$1" == "--seed" ]; then
  SEED_DATA=true
fi

# Start PostgreSQL in a Docker container
echo "🚀 Starting PostgreSQL container..."
if [ "$(docker ps -a -q -f name=$PG_CONTAINER_NAME)" ]; then
  echo "🗑 Removing existing PostgreSQL container..."
  docker rm -f $PG_CONTAINER_NAME > /dev/null
fi

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

# Generate the DATABASE_URL environment variable
export DATABASE_URL="postgresql://${PG_USER}:${PG_PASSWORD}@${PG_HOST}:${PG_PORT}/${PG_DB}?schema=public"
echo "✅ DATABASE_URL set to: $DATABASE_URL"

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