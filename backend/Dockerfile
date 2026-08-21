# ---------- Stage 1: Build ----------
# Pinned Node LTS (alpine = small base image) instead of "latest"
FROM node:20-alpine AS builder

WORKDIR /app

# Copy manifest files first so npm install layer is cached
# unless package.json/package-lock.json actually change
COPY package*.json ./

RUN npm ci

# Now copy the rest of the source
COPY . .

# ---------- Stage 2: Production ----------
FROM node:20-alpine AS production

WORKDIR /app

# Non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

ENV NODE_ENV=production

# Only prod deps in the final image
COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app .

USER appuser

EXPOSE 5000

# Exec-form CMD so signals (SIGTERM) forward correctly
CMD ["node", "server.js"]
