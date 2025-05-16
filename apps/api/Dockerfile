# Stage 1: Build and install
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package.json and lockfile
COPY package.json package-lock.json ./

# Copy all workspaces
COPY apps ./apps
COPY packages ./packages

# Install with workspaces enabled
RUN npm install --workspaces

# Build shared types package (optional: build others too)
RUN npm run --workspace @lineup/types build

RUN npx prisma generate --schema=apps/api/prisma/schema.prisma

# Stage 2: Production image
FROM node:20-alpine

WORKDIR /app

# Copy only necessary parts from builder
COPY --from=builder /app/apps/api ./apps/api
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/types ./packages/types

EXPOSE 3000

CMD ["npx", "tsx", "apps/api/index.ts"]
