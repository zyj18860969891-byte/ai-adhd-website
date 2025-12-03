#!/bin/bash

echo "🚀 启动 ADHD Task Manager PWA 开发环境..."

# 检查 Node.js 版本
NODE_VERSION=$(node -v 2>/dev/null)
if [ $? -ne 0 ]; then
    echo "❌ 未找到 Node.js，请先安装 Node.js 18+"
    exit 1
fi

echo "✅ Node.js 版本: $NODE_VERSION"

# 安装主项目依赖
echo "📦 安装主项目依赖..."
npm install

# 安装前端依赖
echo "📦 安装前端依赖..."
cd client
npm install
cd ..

# 安装微服务依赖
echo "📦 安装微服务依赖..."
cd services/ai-service
npm install
cd ../db-service
npm install
cd ../notification-service
npm install
cd ../../

# 创建环境变量文件（如果不存在）
if [ ! -f .env ]; then
    echo "📝 创建环境变量文件..."
    cp .env.example .env
    echo "⚠️  请编辑 .env 文件，填入你的配置"
fi

# 启动开发服务器
echo "🚀 启动开发服务器..."
npm run dev

echo "✅ 开发环境启动完成！"
echo "🌐 前端地址: http://localhost:5173"
echo "🔌 后端地址: http://localhost:3000"
echo "🤖 AI 服务: http://localhost:3001"
echo "🗄️  数据库服务: http://localhost:3002"
echo "🔔 通知服务: http://localhost:3003"