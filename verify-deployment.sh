#!/bin/bash

echo "🔍 部署验证脚本 - ADHD Task Manager PWA"
echo "=========================================="

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查函数
check_service() {
    local name=$1
    local url=$2
    local expected_status=$3
    
    echo -n "检查 $name: "
    if curl -s -o /dev/null -w "%{http_code}" "$url" | grep -q "$expected_status"; then
        echo -e "${GREEN}✅ 正常${NC}"
        return 0
    else
        echo -e "${RED}❌ 异常${NC}"
        return 1
    fi
}

# 检查 Docker 安装
echo -n "检查 Docker: "
if command -v docker &> /dev/null; then
    echo -e "${GREEN}✅ 已安装${NC}"
else
    echo -e "${RED}❌ 未安装${NC}"
    echo "请先安装 Docker: https://docs.docker.com/get-docker/"
    exit 1
fi

# 检查 Docker Compose 安装
echo -n "检查 Docker Compose: "
if command -v docker-compose &> /dev/null; then
    echo -e "${GREEN}✅ 已安装${NC}"
else
    echo -e "${RED}❌ 未安装${NC}"
    echo "请先安装 Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi

# 检查配置文件
echo "检查配置文件:"
files=(
    "docker-compose.yml"
    "Dockerfile"
    "mcp-config.json"
    "vercel.json"
    "railway.toml"
    "services/ai-service/Dockerfile"
    "services/db-service/Dockerfile"
    "services/notification-service/Dockerfile"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "  ✅ $file"
    else
        echo -e "  ${RED}❌ $file 不存在${NC}"
    fi
done

# 检查环境变量文件
echo "检查环境变量:"
if [ -f ".env" ]; then
    echo -e "  ✅ .env 文件存在"
    if grep -q "OPENAI_API_KEY" .env; then
        echo -e "  ✅ OPENAI_API_KEY 已配置"
    else
        echo -e "  ${YELLOW}⚠️  OPENAI_API_KEY 未配置${NC}"
    fi
else
    echo -e "  ${YELLOW}⚠️  .env 文件不存在，使用 .env.example${NC}"
fi

# 检查 package.json
echo "检查项目配置:"
if [ -f "package.json" ]; then
    echo -e "  ✅ package.json 存在"
    if grep -q "start-dev.sh" package.json; then
        echo -e "  ✅ 开发脚本已配置"
    else
        echo -e "  ${YELLOW}⚠️  开发脚本未配置${NC}"
    fi
else
    echo -e "  ${RED}❌ package.json 不存在${NC}"
fi

# 检查任务进度文件
if [ -f "task-progress.json" ]; then
    echo -e "  ✅ task-progress.json 存在"
    if grep -q "production-ready" task-progress.json; then
        echo -e "  ✅ 项目状态: production-ready"
    else
        echo -e "  ${YELLOW}⚠️  项目状态: 未就绪${NC}"
    fi
else
    echo -e "  ${RED}❌ task-progress.json 不存在${NC}"
fi

# 检查 MCP 配置
echo "检查 MCP 配置:"
if [ -f "mcp-config.json" ]; then
    echo -e "  ✅ mcp-config.json 存在"
    if grep -q "classify-task" mcp-config.json; then
        echo -e "  ✅ AI 工具已配置"
    else
        echo -e "  ${YELLOW}⚠️  AI 工具未配置${NC}"
    fi
else
    echo -e "  ${RED}❌ mcp-config.json 不存在${NC}"
fi

# 检查部署脚本
echo "检查部署脚本:"
if [ -f "start-dev.sh" ]; then
    echo -e "  ✅ start-dev.sh 存在"
    if [ -x "start-dev.sh" ]; then
        echo -e "  ✅ start-dev.sh 可执行"
    else
        echo -e "  ${YELLOW}⚠️  start-dev.sh 不可执行，运行: chmod +x start-dev.sh${NC}"
    fi
else
    echo -e "  ${RED}❌ start-dev.sh 不存在${NC}"
fi

# 检查文档
echo "检查文档:"
docs=(
    "README.md"
    "DEPLOYMENT.md"
    "PROJECT_SUMMARY.md"
    "PROJECT_SUMMARY_OPTIMIZED.md"
)

for doc in "${docs[@]}"; do
    if [ -f "$doc" ]; then
        echo -e "  ✅ $doc"
    else
        echo -e "  ${RED}❌ $doc 不存在${NC}"
    fi
done

echo ""
echo "📋 部署建议:"
echo "=========================================="
echo "1. 开发环境: ./start-dev.sh"
echo "2. Docker 部署: docker-compose up -d"
echo "3. Vercel 前端: cd client && vercel --prod"
echo "4. Railway 后端: railway deploy"
echo ""
echo "📖 详细文档:"
echo "- README.md - 项目说明"
echo "- DEPLOYMENT.md - 部署指南"
echo "- PROJECT_SUMMARY.md - 项目总结"
echo ""
echo "🎯 MCP 服务:"
echo "- AI 服务: http://localhost:3001"
echo "- 数据库服务: http://localhost:3002"
echo "- 通知服务: http://localhost:3003"
echo "- 网关服务: http://localhost:3000"
echo ""
echo "✅ 部署验证完成！"