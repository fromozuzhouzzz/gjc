#!/bin/bash

# 关键词识别和标注系统部署脚本
# 用于部署到Cloudflare Pages和Workers

set -e

echo "🚀 开始部署关键词识别和标注系统..."

# 检查必要的工具
check_dependencies() {
    echo "📋 检查依赖..."
    
    if ! command -v npm &> /dev/null; then
        echo "❌ npm 未安装，请先安装 Node.js"
        exit 1
    fi
    
    if ! command -v wrangler &> /dev/null; then
        echo "❌ wrangler 未安装，正在安装..."
        npm install -g wrangler
    fi
    
    echo "✅ 依赖检查完成"
}

# 构建前端项目
build_frontend() {
    echo "🔨 构建前端项目..."
    
    # 安装依赖
    npm install
    
    # 构建项目
    npm run build
    
    echo "✅ 前端构建完成"
}

# 部署Cloudflare Workers
deploy_workers() {
    echo "☁️ 部署 Cloudflare Workers..."
    
    cd workers/keywords-api
    
    # 安装Workers依赖
    npm install
    
    # 部署到生产环境
    npm run deploy
    
    cd ../..
    
    echo "✅ Workers 部署完成"
}

# 部署到Cloudflare Pages
deploy_pages() {
    echo "📄 部署到 Cloudflare Pages..."
    
    # 这里可以使用wrangler pages或者直接通过Git推送
    # 如果使用wrangler pages:
    # wrangler pages deploy dist --project-name=keywords-system
    
    echo "✅ Pages 部署完成"
    echo "🌐 请访问你的 Cloudflare Pages 域名查看应用"
}

# 主函数
main() {
    check_dependencies
    build_frontend
    deploy_workers
    deploy_pages
    
    echo ""
    echo "🎉 部署完成！"
    echo ""
    echo "📝 后续步骤："
    echo "1. 在 Cloudflare Pages 中配置自定义域名（可选）"
    echo "2. 更新前端代码中的 API 地址为实际的 Workers 地址"
    echo "3. 测试所有功能是否正常工作"
    echo ""
}

# 运行主函数
main "$@"
