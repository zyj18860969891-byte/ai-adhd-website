# Docker Build Optimization Guide

This document provides guidance for optimizing Docker builds for the ADHD Task Manager PWA on Railway.

## Build Issues and Solutions

### 1. Registry Access Issues
**Problem**: Docker Hub 500 errors or registry access denied
**Solution**: 
- Use mirror registries in Dockerfile
- Add retry mechanisms
- Use local caching

### 2. Network Timeouts
**Problem**: Build fails due to network timeouts
**Solution**:
- Increase timeout values
- Use `--prefer-offline` for npm installs
- Add retry logic in Dockerfile

### 3. Resource Constraints
**Problem**: Build fails in resource-constrained environments
**Solution**:
- Add memory limits for Node.js processes
- Use smaller base images
- Optimize build steps

## Build Commands

### Local Testing
```bash
# Run the optimization script
chmod +x scripts/build-optimized.sh
./scripts/build-optimized.sh

# Or build manually
docker build -t adhd-task-manager:latest .
```

### Railway Deployment
1. Push changes to git
2. Railway will automatically use the optimized Dockerfile
3. Monitor build logs for any issues

## Performance Tips

1. **Use BuildKit**: Enable with `DOCKER_BUILDKIT=1`
2. **Layer Caching**: Copy package.json first for better caching
3. **Multi-stage Builds**: Separate build and production stages
4. **Health Checks**: Add proper health check endpoints
5. **Resource Limits**: Set appropriate CPU and memory limits

## Troubleshooting

### Common Errors
- **500 Internal Server Error**: Registry issue, try mirror
- **Timeout**: Increase timeout values
- **Memory**: Add memory limits
- **Network**: Use offline mode and caching

### Debug Steps
1. Check Dockerfile syntax
2. Verify all dependencies
3. Test locally first
4. Monitor Railway logs