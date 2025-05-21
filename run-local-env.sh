#!/bin/bash

# filepath: /home/seanmck/repos/github.com/seanmck/littleleaguelineups/run-local-env.sh

# Exit immediately if a command exits with a non-zero status
set -e

# Define variables
PG_CONTAINER_NAME="littleleague-pg"
PG_IMAGE="postgres:15-alpine"
export PG_PORT=5432
export PG_USER="myadmin"
export PG_PASSWORD="mypassword"
export PG_DB="appdb"
export PG_HOST="localhost"

# Start PostgreSQL in a Docker container
echo "🚀 Starting PostgreSQL container..."
if [ "$(docker ps -q -f name=$PG_CONTAINER_NAME)" ]; then
  echo "✅ PostgreSQL container is already running."
else
  docker run --name $PG_CONTAINER_NAME \
    -e POSTGRES_USER=$PG_USER \
    -e POSTGRES_PASSWORD=$PG_PASSWORD \
    -e POSTGRES_DB=$PG_DB \
    -p $PG_PORT:5432 \
    -d $PG_IMAGE
  echo "✅ PostgreSQL container started."
fi

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
until docker exec $PG_CONTAINER_NAME pg_isready -U $PG_USER > /dev/null 2>&1; do
  sleep 1
done
echo "✅ PostgreSQL is ready."

# Generate the DATABASE_URL environment variable
export DATABASE_URL="postgresql://${PG_USER}:${PG_PASSWORD}@${PG_HOST}:${PG_PORT}/${PG_DB}"
echo "✅ DATABASE_URL set to: $DATABASE_URL"

npx prisma generate --schema=apps/api/prisma/schema.prisma
npx prisma migrate deploy --schema=apps/api/prisma/schema.prisma

npm run --prefix packages/types/ build

# Start the API service
echo "🚀 Starting API service..."
cd apps/api
npm install
npm run dev &
API_PID=$!
cd ../..

# Start the web-ui
echo "🚀 Starting web-ui..."
cd apps/web-ui
npm install
npm run dev &
WEB_UI_PID=$!
cd ../..

# Wait for user to terminate
echo "🌐 Local development environment is running."
echo "🔗 API: http://localhost:3000"
echo "🔗 Web UI: http://localhost:5173"
echo "Press Ctrl+C to stop."

# Trap Ctrl+C and clean up
trap "echo '🛑 Stopping local development environment...'; kill $API_PID $WEB_UI_PID; docker stop $PG_CONTAINER_NAME > /dev/null; docker rm $PG_CONTAINER_NAME > /dev/null; exit 0" SIGINT

# Keep the script running
wait