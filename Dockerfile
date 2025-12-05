# Multi-stage build for ADHD Task Manager PWA

# Build stage
FROM node:20-slim AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/

# Install dependencies with retry and alternative registry
RUN npm config set registry https://registry.npmmirror.com && \
    npm install --retry 3 --timeout 60000 || \
    npm config set registry https://registry.npmjs.org && \
    npm install --retry 3 --timeout 60000

RUN cd client && \
    npm config set registry https://registry.npmmirror.com && \
    npm install --retry 3 --timeout 60000 || \
    npm config set registry https://registry.npmjs.org && \
    npm install --retry 3 --timeout 60000

# Copy source code
COPY . .

# Build frontend
RUN cd client && npm run build

# Production stage
FROM node:20-slim

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