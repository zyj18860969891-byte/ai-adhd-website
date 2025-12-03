@echo off
echo 🚀 ADHD Task Manager PWA - 一键启动所有服务
echo ===========================================

REM 检查 Node.js
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 未找到 Node.js，请先安装 Node.js 18+
    pause
    exit /b 1
)

echo ✅ Node.js 检查通过

REM 检查环境变量文件
if not exist .env (
    echo ⚠️  警告: .env 文件不存在
    echo    正在复制 .env.example...
    copy .env.example .env >nul
)

REM 启动服务函数
:start_service
set SERVICE_NAME=%1
set SERVICE_CMD=%2
set SERVICE_DIR=%3

echo.
echo 🚀 启动 %SERVICE_NAME%...
echo   命令: %SERVICE_CMD%
echo   目录: %SERVICE_DIR%
echo.

cd %SERVICE_DIR%
start "ADHD Task Manager - %SERVICE_NAME%" cmd /k "%SERVICE_CMD% && pause"
cd ..

goto :eof

REM 启动所有服务
echo 📦 正在启动所有服务...

REM 1. AI 服务 (端口 3001)
call :start_service "AI 服务" "node index.js" "services\ai-service"

REM 2. 数据库服务 (端口 3002)
call :start_service "数据库服务" "node index.js" "services\db-service"

REM 3. 通知服务 (端口 3003)
call :start_service "通知服务" "node index.js" "services\notification-service"

REM 4. 主服务器 (端口 3000)
call :start_service "主服务器" "npm run dev:server" ""

REM 5. 前端 PWA (端口 5173)
call :start_service "前端 PWA" "npm run dev" "client"

echo.
echo 🎯 所有服务已启动！
echo.
echo 🌐 访问地址:
echo   前端: http://localhost:5173
echo   主服务器: http://localhost:3000
echo   AI 服务: http://localhost:3001
echo   数据库服务: http://localhost:3002
echo   通知服务: http://localhost:3003
echo.
echo 📋 服务窗口说明:
echo   - ADHD Task Manager - AI 服务 (端口 3001)
echo   - ADHD Task Manager - 数据库服务 (端口 3002)
echo   - ADHD Task Manager - 通知服务 (端口 3003)
echo   - ADHD Task Manager - 主服务器 (端口 3000)
echo   - ADHD Task Manager - 前端 PWA (端口 5173)
echo.
echo ✅ 启动完成！请检查所有窗口是否正常运行。
echo    如果有错误，请查看对应窗口的日志信息。
echo.
pause