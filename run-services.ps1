# PowerShell 启动脚本
# ADHD Task Manager PWA - 启动所有服务

Write-Host "🚀 ADHD Task Manager PWA - PowerShell 启动脚本" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green

# 检查 Node.js
$nodeVersion = node -v 2>$null
if (-not $nodeVersion) {
    Write-Host "❌ 未找到 Node.js，请先安装 Node.js 18+" -ForegroundColor Red
    Read-Host "按任意键退出"
    exit 1
}

Write-Host "✅ Node.js 版本: $nodeVersion" -ForegroundColor Green

# 检查环境变量文件
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  警告: .env 文件不存在" -ForegroundColor Yellow
    Write-Host "    正在复制 .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
}

# 启动服务函数
function Start-ServiceWindow {
    param(
        [string]$title,
        [string]$command,
        [string]$directory = ""
    )
    
    Write-Host "`n🚀 启动 $title..." -ForegroundColor Cyan
    Write-Host "   命令: $command" -ForegroundColor Gray
    if ($directory) {
        Write-Host "   目录: $directory" -ForegroundColor Gray
    }
    
    $fullCommand = "cmd /c cd /d `"$PSScriptRoot\$directory`" && $command && pause"
    Start-Process -FilePath "powershell.exe" -ArgumentList "-Title `"$title`" -Command `$fullCommand" -WindowStyle Normal
    
    Start-Sleep -Milliseconds 500
}

# 启动所有服务
Write-Host "`n📦 正在启动所有服务..." -ForegroundColor Green

# 1. AI 服务 (端口 3001)
Start-ServiceWindow -title "AI 服务 (端口 3001)" -command "node index.js" -directory "services\ai-service"

# 2. 数据库服务 (端口 3002)
Start-ServiceWindow -title "数据库服务 (端口 3002)" -command "node index.js" -directory "services\db-service"

# 3. 通知服务 (端口 3003)
Start-ServiceWindow -title "通知服务 (端口 3003)" -command "node index.js" -directory "services\notification-service"

# 4. 主服务器 (端口 3000)
Start-ServiceWindow -title "主服务器 (端口 3000)" -command "npm run dev:server" -directory ""

# 5. 前端 PWA (端口 5173)
Start-ServiceWindow -title "前端 PWA (端口 5173)" -command "npm run dev" -directory "client"

Write-Host "`n🎯 所有服务已启动！" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 访问地址:" -ForegroundColor Yellow
Write-Host "   前端: http://localhost:5173" -ForegroundColor White
Write-Host "   主服务器: http://localhost:3000" -ForegroundColor White
Write-Host "   AI 服务: http://localhost:3001" -ForegroundColor White
Write-Host "   数据库服务: http://localhost:3002" -ForegroundColor White
Write-Host "   通知服务: http://localhost:3003" -ForegroundColor White
Write-Host ""
Write-Host "📋 服务窗口说明:" -ForegroundColor Yellow
Write-Host "   - AI 服务 (端口 3001)" -ForegroundColor White
Write-Host "   - 数据库服务 (端口 3002)" -ForegroundColor White
Write-Host "   - 通知服务 (端口 3003)" -ForegroundColor White
Write-Host "   - 主服务器 (端口 3000)" -ForegroundColor White
Write-Host "   - 前端 PWA (端口 5173)" -ForegroundColor White
Write-Host ""
Write-Host "✅ 启动完成！请检查所有窗口是否正常运行。" -ForegroundColor Green
Write-Host "   如果有错误，请查看对应窗口的日志信息。" -ForegroundColor Gray

Read-Host "`n按任意键查看快速验证步骤"
Write-Host ""
Write-Host "🧪 快速验证步骤:" -ForegroundColor Magenta
Write-Host "1. 打开浏览器访问 http://localhost:5173 (前端)" -ForegroundColor White
Write-Host "2. 访问 http://localhost:3000/api/health (主服务器)" -ForegroundColor White
Write-Host "3. 访问 http://localhost:3001/api/health (AI 服务)" -ForegroundColor White
Write-Host "4. 访问 http://localhost:3002/api/health (数据库服务)" -ForegroundColor White
Write-Host "5. 访问 http://localhost:3003/api/health (通知服务)" -ForegroundColor White
Write-Host ""
Write-Host "如果所有地址都能正常访问，说明服务启动成功！" -ForegroundColor Green