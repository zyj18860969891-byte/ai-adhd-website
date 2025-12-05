#!/bin/bash

# Git Commit and Push Script for ADHD Task Manager PWA
# This script helps commit and push changes to trigger Railway deployment

echo "🚀 Preparing to commit and push changes..."

# Check if there are any changes to commit
if [ -z "$(git status --porcelain)" ]; then
    echo "ℹ️  No changes to commit"
    exit 0
fi

# Add all changes
echo "📝 Adding changes to staging area..."
git add .

# Create commit message
COMMIT_MSG="🚀 Optimize Docker build for Railway deployment

- Add retry mechanisms for base image pulls
- Use mirror registries for npm dependencies
- Add memory optimization for builds
- Create simplified Dockerfile for better reliability
- Update Railway configuration for Docker builds
- Add build optimization scripts and documentation

🔧 Fixes:
- Docker Hub 500 errors
- Registry access issues
- Build timeout problems
- Resource constraint issues

#docker #railway #optimization"

# Commit changes
echo "✅ Creating commit..."
git commit -m "$COMMIT_MSG"

# Check if push is needed
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  Commit failed, please check git status"
    exit 1
fi

# Push to origin
echo "📤 Pushing to remote repository..."
git push origin main

if [ $? -eq 0 ]; then
    echo "🎉 Changes pushed successfully!"
    echo "🌐 Railway deployment should start automatically"
    echo "📊 Monitor deployment at: https://railway.app/project/[your-project-id]"
else
    echo "❌ Push failed, please check your internet connection and repository access"
    exit 1
fi