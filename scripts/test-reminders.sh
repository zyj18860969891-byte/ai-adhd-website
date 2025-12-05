#!/bin/bash

# Test Script for Task Reminder Functionality
# This script tests the real-time notification system

echo "🧪 Testing Task Reminder Functionality..."

# Get the Railway app URL (replace with your actual URL)
APP_URL="https://ai-adhd-website-production.up.railway.app"

echo "📍 Testing with: $APP_URL"

# Test 1: Create a task with due date 2 minutes from now
echo "1. Creating a task with reminder in 2 minutes..."

# Calculate due date 2 minutes from now
DUE_DATE=$(date -u -d '+2 minutes' '+%Y-%m-%dT%H:%M:%SZ')

# Create task with reminder
curl -X POST "$APP_URL/api/services/db/tasks" \
  -H "Content-Type: application/json" \
  -d "{
    \"title\": \"测试提醒任务\",
    \"description\": \"这是一个测试提醒功能的任务\",
    \"category\": \"个人\",
    \"priority\": \"高优先级\",
    \"dueDate\": \"$DUE_DATE\",
    \"tags\": [\"测试\", \"提醒\"]
  }"

echo ""
echo "✅ Task created with reminder for: $DUE_DATE"
echo "⏰ Please wait 2 minutes and check the notification badge in the app"
echo ""

# Test 2: Check notifications after 1 minute
echo "2. Waiting 60 seconds to check notifications..."
sleep 60

echo "3. Checking for notifications..."
curl -s "$APP_URL/api/services/notification/notifications/user-1" | jq '.'

echo ""
echo "4. Creating a task with reminder in 1 minute..."

# Calculate due date 1 minute from now
DUE_DATE_1MIN=$(date -u -d '+1 minute' '+%Y-%m-%dT%H:%M:%SZ')

curl -X POST "$APP_URL/api/services/db/tasks" \
  -H "Content-Type: application/json" \
  -d "{
    \"title\": \"快速测试提醒\",
    \"description\": \"1分钟后提醒\",
    \"category\": \"工作\",
    \"priority\": \"中优先级\",
    \"dueDate\": \"$DUE_DATE_1MIN\",
    \"tags\": [\"快速测试\"]
  }"

echo ""
echo "✅ Quick test task created with reminder for: $DUE_DATE_1MIN"
echo "⏰ Please wait 1 minute and check the notification badge"
echo ""

# Test 3: Check notifications again
echo "5. Waiting 60 seconds more..."
sleep 60

echo "6. Final notification check:"
curl -s "$APP_URL/api/services/notification/notifications/user-1" | jq '.'

echo ""
echo "📋 Test Summary:"
echo "   - Created tasks with due dates"
echo "   - Should receive notifications before due dates"
echo "   - Check the notification badge in the app header"
echo "   - Notifications appear as red dot with count"
echo ""
echo "🎯 Expected Behavior:"
echo "   - Red notification badge appears"
echo "   - Clicking shows pending notifications"
echo "   - Can acknowledge/clear notifications"