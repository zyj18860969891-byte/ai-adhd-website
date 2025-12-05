#!/bin/bash

# Docker Build Optimization Script for ADHD Task Manager PWA
# This script helps optimize Docker builds for Railway deployment

echo "🚀 Starting Docker build optimization..."

# Set environment variables for better caching
export DOCKER_BUILDKIT=1
export BUILDKIT_PROGRESS=plain

# Function to retry Docker build with different strategies
retry_build() {
    local strategy=$1
    echo "🔄 Attempting build with strategy: $strategy"
    
    case $strategy in
        "standard")
            docker build -t adhd-task-manager:latest .
            ;;
        "no-cache")
            docker build --no-cache -t adhd-task-manager:latest .
            ;;
        "parallel")
            docker build --progress=plain --build-arg BUILDKIT_INLINE_CACHE=1 -t adhd-task-manager:latest .
            ;;
        "optimized")
            docker build --target builder --cache-from=adhd-task-manager:builder -t adhd-task-manager:builder .
            docker build --cache-from=adhd-task-manager:builder -t adhd-task-manager:latest .
            ;;
    esac
    
    if [ $? -eq 0 ]; then
        echo "✅ Build successful with strategy: $strategy"
        return 0
    else
        echo "❌ Build failed with strategy: $strategy"
        return 1
    fi
}

# Try different build strategies
echo "📋 Trying different build strategies..."

# Strategy 1: Standard build
if retry_build "standard"; then
    echo "🎉 Build completed successfully!"
    exit 0
fi

# Strategy 2: No cache build
if retry_build "no-cache"; then
    echo "🎉 Build completed successfully with no-cache!"
    exit 0
fi

# Strategy 3: Parallel build
if retry_build "parallel"; then
    echo "🎉 Build completed successfully with parallel processing!"
    exit 0
fi

# Strategy 4: Optimized multi-stage build
if retry_build "optimized"; then
    echo "🎉 Build completed successfully with optimization!"
    exit 0
fi

echo "❌ All build strategies failed. Please check your Dockerfile and dependencies."
exit 1