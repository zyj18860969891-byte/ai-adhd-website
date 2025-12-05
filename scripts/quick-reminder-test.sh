#!/bin/bash

# Quick Reminder Test Script
# Tests immediate notification functionality

echo "🧪 Quick Reminder Test..."

# Get the Railway app URL
APP_URL="https://ai-adhd-website-production.up.railway.app"

echo "📍 Testing with: $APP_URL"

# Test 1: Create a task with due date 1 minute from now
echo "1. Creating task with 1-minute reminder..."

# Calculate due date 1 minute from now (for testing)
DUE_DATE=$(date -u -d '+1 minute' '+%Y-%m-%dT%H:%M:%SZ')

echo "   Due date: $DUE_DATE"

# Create task
curl -X POST "$APP_URL/api/services/db/tasks" \
  -H "Content-Type: application/json" \
  -d "{
    \"title\": \"测试提醒\",
    \"description\": \"测试提醒功能\",
    \"category\": \"个人\",
    \"priority\": \"高优先级\",
    \"dueDate\": \"$DUE_DATE\"
  }"

echo ""
echo "✅ Task created!"

# Wait and check
echo "2. Waiting 60 seconds..."
sleep 60

echo "3. Checking notifications..."
curl -s "$APP_URL/api/services/notification/notifications/user-1" | jq '.' 2>/dev/null || curl -s "$APP_URL/api/services/notification/notifications/user-1"

echo ""
echo "🎯 Check the app:"
echo "   - Look for red notification badge"
echo "   - Click to see pending notifications"