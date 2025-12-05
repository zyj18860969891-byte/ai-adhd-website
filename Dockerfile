# Multi-stage build for ADHD Task Manager PWA

# Build stage
FROM node:18-alpine AS builder

# Set timezone and locale
RUN apk add --no-cache tzdata && \
    cp /usr/share/zoneinfo/UTC /etc/localtime && \
    echo "UTC" > /etc/timezone && \
    apk del tzdata

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/

# Install dependencies with retry and alternative registry
RUN npm config set registry https://registry.npmmirror.com && \
    npm install --retry 5 --timeout 120000 || \
    npm config set registry https://registry.npmjs.org && \
    npm install --retry 5 --timeout 120000

RUN cd client && \
    npm config set registry https://registry.npmmirror.com && \
    npm install --retry 5 --timeout 120000 || \
    npm config set registry https://registry.npmjs.org && \
    npm install --retry 5 --timeout 120000

# Copy source code
COPY . .

# Build frontend
RUN cd client && npm run build

# Production stage
FROM node:18-alpine

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

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Start the application
CMD ["npm", "start"]