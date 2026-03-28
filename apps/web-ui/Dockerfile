# Stage 1: Build the React app
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package files
COPY package.json package-lock.json ./

# Copy all workspaces
COPY apps ./apps
COPY packages ./packages

# Install dependencies
RUN npm install --workspaces

# Build shared types
RUN npm run --workspace @lineup/types build

# Build web-ui
RUN npm run --workspace littleleaguelineups build

# Stage 2: Serve with nginx
FROM nginx:alpine

COPY --from=builder /app/apps/web-ui/dist /usr/share/nginx/html
COPY apps/web-ui/nginx.conf.template /etc/nginx/nginx.conf.template
COPY apps/web-ui/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/docker-entrypoint.sh"]
