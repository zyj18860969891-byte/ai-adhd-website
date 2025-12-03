@echo off
chcp 65001 >nul

echo 🚀 ADHD Task Manager PWA 部署脚本
echo =================================

REM 检查依赖
:check_dependencies
echo 📋 检查依赖...

where git >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Git 未安装
    exit /b 1
)

where railway >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Railway CLI 未安装
    echo 请先安装: npm install -g @railway/cli
    exit /b 1
)

where vercel >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Vercel CLI 未安装
    echo 请先安装: npm install -g vercel
    exit /b 1
)

echo ✅ 依赖检查完成

REM 构建项目
:build_project
echo 🔨 构建项目...

npm install

cd client
npm install
npm run build
cd ..

echo ✅ 项目构建完成

REM 部署到 Railway
:deploy_railway
echo 🚂 部署到 Railway...

REM 登录 Railway
railway login

echo 请选择部署方式:
echo 1. 创建新项目
echo 2. 使用现有项目
set /p choice=请输入选择 (1-2): 

if "%choice%"=="1" (
    set /p project_name=请输入项目名称: 
    railway init %project_name%
)

REM 推送到 Railway
git add .
git commit -m "Deploy ADHD Task Manager to Railway"
git push railway main

echo ⏳ 等待部署完成...
timeout /t 30 /nobreak

REM 获取 Railway URL
for /f "tokens=1" %%i in ('railway domains ^| findstr "\.up\.railway\.app"') do set RAILWAY_URL=%%i
echo 🌐 Railway URL: %RAILWAY_URL%

REM 配置环境变量
call :configure_railway_env

REM 部署到 Vercel
call :deploy_vercel %RAILWAY_URL%

REM 验证部署
call :verify_deployment %RAILWAY_URL%

goto :eof

REM 配置 Railway 环境变量
:configure_railway_env
echo 🔧 配置 Railway 环境变量...

set /p openrouter_key=请输入 OpenRouter API Key: 
set /p jwt_secret=请输入 JWT Secret: 

railway variables set NODE_ENV=production
railway variables set PORT=3000
railway variables set GATEWAY_PORT=3000
railway variables set AI_SERVICE_PORT=3001
railway variables set DB_SERVICE_PORT=3002
railway variables set NOTIFICATION_SERVICE_PORT=3003
railway variables set OPENROUTER_API_KEY=%openrouter_key%
railway variables set OPENROUTER_MODEL=qwen/qwen3-235b-a22b-2507
railway variables set JWT_SECRET=%jwt_secret%
railway variables set DB_PATH=./data/tasks.db
railway variables set CORS_ORIGIN=https://your-adhd-task-manager.vercel.app

railway restart

echo ✅ Railway 环境变量配置完成
goto :eof

REM 部署到 Vercel
:deploy_vercel
set railway_url=%1
echo ☁️ 部署到 Vercel...

vercel login

cd client

echo 🔧 配置 Vercel 环境变量...
set /p railway_domain=请输入 Railway 域名 (如: your-app.up.railway.app): 

echo 设置环境变量...
vercel env add VITE_API_BASE_URL production "https://%railway_domain%"
vercel env add VITE_WS_URL production "wss://%railway_domain%"
vercel env add VITE_APP_TITLE production "ADHD Task Manager"
vercel env add VITE_APP_VERSION production "1.0.0"

vercel --prod

for /f "tokens=1" %%i in ('vercel domains list ^| findstr "\.vercel\.app"') do set VERCEL_URL=%%i
echo 🌐 Vercel URL: %VERCEL_URL%

cd ..
echo ✅ Vercel 部署完成
goto :eof

REM 验证部署
:verify_deployment
set railway_url=%1
echo 🔍 验证部署...

echo 检查主服务器健康状态...
curl -s "https://%railway_url%/api/health" | findstr "healthy" >nul && echo ✅ 主服务器正常 || echo ❌ 主服务器异常

echo 检查 AI 服务...
curl -s "https://%railway_url%/api/services/ai/health" | findstr "healthy" >nul && echo ✅ AI 服务正常 || echo ❌ AI 服务异常

echo 检查数据库服务...
curl -s "https://%railway_url%/api/services/db/health" | findstr "healthy" >nul && echo ✅ 数据库服务正常 || echo ❌ 数据库服务异常

echo 检查通知服务...
curl -s "https://%railway_url%/api/services/notification/health" | findstr "healthy" >nul && echo ✅ 通知服务正常 || echo ❌ 通知服务异常

echo 🎉 部署验证完成！
echo 🌐 主服务器: https://%railway_url%
echo 🌐 前端应用: %VERCEL_URL%
echo.
echo 📝 访问前端应用开始使用 ADHD Task Manager！

goto :eof