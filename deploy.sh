#!/bin/bash

# ADHD Task Manager PWA - 完整部署脚本
# 支持 Railway + Vercel 部署

echo "🚀 ADHD Task Manager PWA 部署脚本"
echo "================================="

# 检查依赖
check_dependencies() {
    echo "📋 检查依赖..."
    
    if ! command -v git &> /dev/null; then
        echo "❌ Git 未安装"
        exit 1
    fi
    
    if ! command -v railway &> /dev/null; then
        echo "❌ Railway CLI 未安装"
        echo "请先安装: npm install -g @railway/cli"
        exit 1
    fi
    
    if ! command -v vercel &> /dev/null; then
        echo "❌ Vercel CLI 未安装"
        echo "请先安装: npm install -g vercel"
        exit 1
    fi
    
    echo "✅ 依赖检查完成"
}

# 构建项目
build_project() {
    echo "🔨 构建项目..."
    
    # 安装依赖
    npm install
    
    # 构建前端
    cd client
    npm install
    npm run build
    cd ..
    
    echo "✅ 项目构建完成"
}

# 部署到 Railway
deploy_to_railway() {
    echo "🚂 部署到 Railway..."
    
    # 登录 Railway
    railway login
    
    # 创建新项目或选择现有项目
    echo "请选择部署方式:"
    echo "1. 创建新项目"
    echo "2. 使用现有项目"
    read -p "请输入选择 (1-2): " choice
    
    if [ "$choice" = "1" ]; then
        read -p "请输入项目名称: " project_name
        railway init $project_name
    fi
    
    # 推送到 Railway
    git add .
    git commit -m "Deploy ADHD Task Manager to Railway"
    git push railway main
    
    # 等待部署完成
    echo "⏳ 等待部署完成..."
    sleep 30
    
    # 获取 Railway URL
    RAILWAY_URL=$(railway domains | grep -E '^[a-zA-Z0-9-]+\.up\.railway\.app' | head -1)
    echo "🌐 Railway URL: $RAILWAY_URL"
    
    # 配置环境变量
    configure_railway_env $RAILWAY_URL
}

# 配置 Railway 环境变量
configure_railway_env() {
    local railway_url=$1
    
    echo "🔧 配置 Railway 环境变量..."
    
    # 必需的环境变量
    read -s -p "请输入 OpenRouter API Key: " openrouter_key
    echo
    
    read -s -p "请输入 JWT Secret: " jwt_secret
    echo
    
    # 设置环境变量
    railway variables set NODE_ENV=production
    railway variables set PORT=3000
    railway variables set GATEWAY_PORT=3000
    railway variables set AI_SERVICE_PORT=3001
    railway variables set DB_SERVICE_PORT=3002
    railway variables set NOTIFICATION_SERVICE_PORT=3003
    railway variables set OPENROUTER_API_KEY=$openrouter_key
    railway variables set OPENROUTER_MODEL=qwen/qwen3-235b-a22b-2507
    railway variables set JWT_SECRET=$jwt_secret
    railway variables set DB_PATH=./data/tasks.db
    railway variables set CORS_ORIGIN=https://your-adhd-task-manager.vercel.app
    
    # 重启服务
    railway restart
    
    echo "✅ Railway 环境变量配置完成"
}

# 部署到 Vercel
deploy_to_vercel() {
    echo "☁️ 部署到 Vercel..."
    
    # 登录 Vercel
    vercel login
    
    # 进入前端目录
    cd client
    
    # 设置环境变量
    echo "🔧 配置 Vercel 环境变量..."
    read -p "请输入 Railway URL (如: your-app.up.railway.app): " railway_url
    
    vercel env add VITE_API_BASE_URL production "https://$railway_url"
    vercel env add VITE_WS_URL production "wss://$railway_url"
    vercel env add VITE_APP_TITLE production "ADHD Task Manager"
    vercel env add VITE_APP_VERSION production "1.0.0"
    
    # 部署
    vercel --prod
    
    # 获取 Vercel URL
    VERCEL_URL=$(vercel domains list | grep -E '^[a-zA-Z0-9-]+\.vercel\.app' | head -1)
    echo "🌐 Vercel URL: $VERCEL_URL"
    
    cd ..
    echo "✅ Vercel 部署完成"
}

# 验证部署
verify_deployment() {
    echo "🔍 验证部署..."
    
    read -p "请输入 Railway URL: " railway_url
    read -p "请输入 Vercel URL: " vercel_url
    
    # 检查主服务器健康状态
    echo "检查主服务器健康状态..."
    curl -s "https://$railway_url/api/health" | grep -q "healthy" && echo "✅ 主服务器正常" || echo "❌ 主服务器异常"
    
    # 检查 AI 服务
    echo "检查 AI 服务..."
    curl -s "https://$railway_url/api/services/ai/health" | grep -q "healthy" && echo "✅ AI 服务正常" || echo "❌ AI 服务异常"
    
    # 检查数据库服务
    echo "检查数据库服务..."
    curl -s "https://$railway_url/api/services/db/health" | grep -q "healthy" && echo "✅ 数据库服务正常" || echo "❌ 数据库服务异常"
    
    # 检查通知服务
    echo "检查通知服务..."
    curl -s "https://$railway_url/api/services/notification/health" | grep -q "healthy" && echo "✅ 通知服务正常" || echo "❌ 通知服务异常"
    
    # 检查前端
    echo "检查前端..."
    curl -s "https://$vercel_url" | grep -q "ADHD" && echo "✅ 前端正常" || echo "❌ 前端异常"
    
    echo ""
    echo "🎉 部署验证完成！"
    echo "🌐 主服务器: https://$railway_url"
    echo "🌐 前端应用: https://$vercel_url"
    echo ""
    echo "📝 访问前端应用开始使用 ADHD Task Manager！"
}

# 清理函数
cleanup() {
    echo "🧹 清理临时文件..."
    # 可以添加清理逻辑
}

# 主函数
main() {
    case "${1:-deploy}" in
        "check")
            check_dependencies
            ;;
        "build")
            build_project
            ;;
        "deploy")
            check_dependencies
            build_project
            deploy_to_railway
            deploy_to_vercel
            verify_deployment
            ;;
        "railway")
            check_dependencies
            build_project
            deploy_to_railway
            ;;
        "vercel")
            deploy_to_vercel
            ;;
        "verify")
            verify_deployment
            ;;
        "cleanup")
            cleanup
            ;;
        *)
            echo "用法: $0 {check|build|deploy|railway|vercel|verify|cleanup}"
            echo ""
            echo "命令说明:"
            echo "  check    - 检查依赖"
            echo "  build    - 构建项目"
            echo "  deploy   - 完整部署 (Railway + Vercel)"
            echo "  railway  - 仅部署到 Railway"
            echo "  vercel   - 仅部署到 Vercel"
            echo "  verify   - 验证部署"
            echo "  cleanup  - 清理临时文件"
            exit 1
            ;;
    esac
}

# 执行主函数
main "$@"