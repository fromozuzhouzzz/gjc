# 关键词识别和标注系统 - 部署指南

本指南将帮助你将关键词识别和标注系统部署到Cloudflare Pages和Workers。

## 前置要求

- Node.js 16+ 和 npm
- Cloudflare 账户
- Git

## 部署步骤

### 1. 准备工作

```bash
# 克隆项目（如果还没有）
git clone <your-repo-url>
cd keywords

# 安装依赖
npm install

# 安装 Cloudflare Wrangler CLI
npm install -g wrangler

# 登录 Cloudflare
wrangler auth login
```

### 2. 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件，填入实际的配置值
```

### 3. 部署 Cloudflare Workers API

```bash
# 进入 Workers 目录
cd workers/keywords-api

# 安装依赖
npm install

# 创建 KV 命名空间
npm run kv:create
npm run kv:create:preview

# 更新 wrangler.toml 中的 KV 命名空间 ID
# 将输出的 ID 填入 wrangler.toml 文件

# 部署到生产环境
npm run deploy

# 记录输出的 Workers URL，稍后需要用到
```

### 4. 更新前端 API 配置

在 `src/main.js` 中找到以下行：
```javascript
const apiUrl = 'https://your-worker.your-subdomain.workers.dev/api/keywords';
```

将 URL 替换为步骤3中获得的实际 Workers URL。

### 5. 构建前端项目

```bash
# 返回项目根目录
cd ../..

# 构建项目
npm run build
```

### 6. 部署到 Cloudflare Pages

#### 方法一：通过 Git 自动部署（推荐）

**重要：现在推荐使用 GitHub 自动同步部署，详细步骤请参考 `cloudflare-pages-setup.md`**

1. 将代码推送到 GitHub
2. 登录 Cloudflare Dashboard
3. 进入 Pages 部分
4. 点击 "Create a project"
5. 选择 "Connect to Git"
6. 连接你的 GitHub 仓库 `gjc`
7. 配置构建设置：
   - 项目名称：`keywords-system`
   - 构建命令：`npm run build`
   - 构建输出目录：`dist`
   - 生产分支：`main`
   - 环境变量：添加必要的环境变量

配置完成后，每次推送到 main 分支都会自动触发重新部署。

#### 方法二：使用 Wrangler CLI（备用方案）

```bash
# 使用 wrangler pages 部署
wrangler pages deploy dist --project-name=keywords-system
```

### 7. 配置自定义域名（可选）

1. 在 Cloudflare Pages 项目设置中
2. 进入 "Custom domains" 部分
3. 添加你的域名
4. 按照提示配置 DNS 记录

## 环境配置

### 生产环境变量

在 Cloudflare Pages 项目设置中添加以下环境变量：

- `VITE_API_BASE_URL`: Workers API 的完整 URL
- `VITE_APP_NAME`: 应用名称
- `VITE_APP_VERSION`: 应用版本

### Workers 环境配置

在 `workers/keywords-api/wrangler.toml` 中配置：

- KV 命名空间绑定
- 环境变量
- 路由配置（如果使用自定义域名）

## 验证部署

1. 访问你的 Cloudflare Pages URL
2. 测试以下功能：
   - 添加关键词
   - 文本识别和高亮
   - 关键词导航
   - 云端保存和加载
   - 批量导入

## 故障排除

### 常见问题

1. **API 调用失败**
   - 检查 Workers URL 是否正确
   - 确认 CORS 配置
   - 查看 Workers 日志：`wrangler tail`

2. **KV 存储问题**
   - 确认 KV 命名空间 ID 正确
   - 检查 KV 绑定配置

3. **构建失败**
   - 检查 Node.js 版本
   - 清除缓存：`npm run build -- --force`

### 日志查看

```bash
# 查看 Workers 实时日志
cd workers/keywords-api
npm run tail

# 查看 Pages 构建日志
# 在 Cloudflare Dashboard 的 Pages 项目中查看
```

## 性能优化

1. **启用缓存**
   - 静态资源已通过 `_headers` 文件配置缓存
   - API 响应可以根据需要添加缓存头

2. **压缩优化**
   - Cloudflare 自动启用 Gzip/Brotli 压缩
   - 图片和资源已优化

3. **CDN 加速**
   - Cloudflare 全球 CDN 自动加速
   - 支持 HTTP/3 和其他现代协议

## 监控和维护

1. **监控指标**
   - Cloudflare Analytics 提供访问统计
   - Workers Analytics 提供 API 调用统计

2. **日志监控**
   - 使用 `wrangler tail` 监控实时日志
   - 可集成第三方日志服务

3. **更新部署**
   - 推送代码到 Git 仓库自动触发重新部署
   - 使用 `wrangler deploy` 更新 Workers

## 成本估算

基于 Cloudflare 免费计划：

- **Pages**: 免费（每月 500 次构建）
- **Workers**: 免费（每天 100,000 次请求）
- **KV**: 免费（每天 100,000 次读取，1,000 次写入）

适合中小型应用使用，超出限制后按使用量付费。
