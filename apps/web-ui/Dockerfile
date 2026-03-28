# Stage 1: Build the React app
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package files
COPY package.json package-lock.json ./

# Copy all workspaces
COPY apps ./apps
COPY packages ./packages

# Install all dependencies (including devDependencies needed for build)
RUN npm install --include=dev

# Build shared types
RUN npm run --workspace @lineup/types build

# Build web-ui
RUN npm run --workspace littleleaguelineups build

# Stage 2: Serve with Node.js
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/apps/web-ui/dist ./dist
COPY apps/web-ui/server.js ./server.js

EXPOSE 8080

CMD ["node", "server.js"]
