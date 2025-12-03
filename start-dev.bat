@echo off
echo 🚀 启动 ADHD Task Manager PWA 开发环境...
echo ===========================================

REM 检查 Node.js
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 未找到 Node.js，请先安装 Node.js 18+
    pause
    exit /b 1
)

echo ✅ Node.js 版本: %NODE_VER%

REM 安装主项目依赖
echo 📦 安装主项目依赖...
npm install

REM 安装前端依赖
echo 📦 安装前端依赖...
cd client
npm install
cd ..

REM 安装微服务依赖
echo 📦 安装微服务依赖...
cd services\ai-service
npm install
cd ..\db-service
npm install
cd ..\notification-service
npm install
cd ..\..

REM 检查环境变量文件
if not exist .env (
    echo ⚠️  警告: .env 文件不存在，使用 .env.example
    copy .env.example .env >nul
)

echo 🚀 启动开发服务器...
echo.
echo 📝 请在新窗口中分别运行以下命令：
echo 1. 主服务器: npm run dev:server (端口 3000)
echo 2. AI 服务: cd services\ai-service && node index.js (端口 3001)
echo 3. 数据库服务: cd services\db-service && node index.js (端口 3002)
echo 4. 通知服务: cd services\notification-service && node index.js (端口 3003)
echo 5. 前端: cd client && npm run dev (端口 5173)
echo.
echo 🌐 访问地址:
echo - 前端: http://localhost:5173
echo - 主服务器: http://localhost:3000
echo - AI 服务: http://localhost:3001
echo - 数据库服务: http://localhost:3002
echo - 通知服务: http://localhost:3003
echo.
echo ✅ 开发环境启动完成！
pause