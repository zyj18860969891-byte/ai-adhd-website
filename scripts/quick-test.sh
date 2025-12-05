#!/bin/bash

# Quick Test Script for ADHD Task Manager PWA
# This script tests the deployed application endpoints

echo "🧪 Starting quick test of ADHD Task Manager PWA..."

# Get the Railway app URL (replace with your actual URL)
APP_URL="https://ai-adhd-website-production.up.railway.app"

echo "📍 Testing endpoints on: $APP_URL"

# Test 1: Health check
echo "1. Testing health check..."
curl -s -o /dev/null -w "Status: %{http_code}\n" "$APP_URL/api/health"

# Test 2: AI Service health
echo "2. Testing AI service health..."
curl -s -o /dev/null -w "Status: %{http_code}\n" "$APP_URL/api/services/ai/health"

# Test 3: Database service health
echo "3. Testing database service health..."
curl -s -o /dev/null -w "Status: %{http_code}\n" "$APP_URL/api/services/db/health"

# Test 4: Notification service health
echo "4. Testing notification service health..."
curl -s -o /dev/null -w "Status: %{http_code}\n" "$APP_URL/api/services/notification/health"

# Test 5: AI classification (sample request)
echo "5. Testing AI task classification..."
curl -s -X POST "$APP_URL/api/services/ai/classify-task" \
  -H "Content-Type: application/json" \
  -d '{"taskName":"Test task", "description":"Test description", "category":"work"}' \
  -o /dev/null -w "Status: %{http_code}\n"

# Test 6: Task extraction (sample request)
echo "6. Testing AI task extraction..."
curl -s -X POST "$APP_URL/api/services/ai/extract-tasks" \
  -H "Content-Type: application/json" \
  -d '{"text":"I need to complete the project report, send emails to clients, and prepare for the meeting"}' \
  -o /dev/null -w "Status: %{http_code}\n"

echo "✅ Quick test completed!"
echo "📋 Check the status codes above:"
echo "   - 200: Success"
echo "   - 404: Endpoint not found (proxy issue)"
echo "   - 503: Service unavailable"