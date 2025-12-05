# Multi-stage build for ADHD Task Manager PWA

# Build stage
FROM node:18-alpine AS builder

# Add retry mechanism for base image pull
RUN if ! apk add --no-cache --update-cache --allow-untrusted ca-certificates; then \
    echo "Retrying apk update..."; \
    sleep 5; \
    apk add --no-cache --update-cache --allow-untrusted ca-certificates; \
    fi

# Set timezone and locale
RUN apk add --no-cache tzdata && \
    cp /usr/share/zoneinfo/UTC /etc/localtime && \
    echo "UTC" > /etc/timezone && \
    apk del tzdata

WORKDIR /app

# Copy package files first (for better caching)
COPY package*.json ./
COPY client/package*.json ./client/

# Install dependencies with retry and alternative registry
RUN npm config set registry https://registry.npmmirror.com && \
    npm install --retry 5 --prefer-offline || \
    npm config set registry https://registry.npmjs.org && \
    npm install --retry 5 --prefer-offline

RUN cd client && \
    npm config set registry https://registry.npmmirror.com && \
    npm install --retry 5 --prefer-offline || \
    npm config set registry https://registry.npmjs.org && \
    npm install --retry 5 --prefer-offline

# Copy source code (excluding files in .dockerignore)
COPY . .

# Build frontend with memory optimization
RUN cd client && npm run build -- --max-old-space-size=512

# Production stage
FROM node:18-alpine

# Add retry mechanism for production stage
RUN if ! apk add --no-cache --update-cache --allow-untrusted ca-certificates; then \
    echo "Retrying apk update for production stage..."; \
    sleep 5; \
    apk add --no-cache --update-cache --allow-untrusted ca-certificates; \
    fi

# Set timezone and locale
RUN apk add --no-cache tzdata && \
    cp /usr/share/zoneinfo/UTC /etc/localtime && \
    echo "UTC" > /etc/timezone && \
    apk del tzdata

WORKDIR /app

# Copy built application
COPY --from=builder /app ./

# Create data directory
RUN mkdir -p data

# Expose ports
EXPOSE 3000

# Health check with retry
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Start the application with error handling
CMD ["sh", "-c", "npm start || (echo 'Failed to start, retrying...' && sleep 5 && npm start)"]