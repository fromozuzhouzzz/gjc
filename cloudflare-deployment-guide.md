# 关键词识别和标注系统 - Cloudflare 完整部署教程

## 项目概述

本项目是一个基于现代 Web 技术栈的关键词识别和标注系统：

- **前端**: Vite + Vanilla JavaScript + Tailwind CSS
- **后端**: Cloudflare Workers + KV 存储
- **部署**: Cloudflare Pages (前端) + Cloudflare Workers (API)
- **特性**: 响应式设计、实时高亮、云端同步、批量处理

## 🚀 部署架构

```
GitHub Repository
       ↓
Cloudflare Pages (前端)
       ↓
Cloudflare Workers (API)
       ↓
Cloudflare KV (数据存储)
```

## 📋 前置条件和环境要求

### 必需工具
- **Node.js**: 版本 16.0.0 或更高
- **npm**: 版本 7.0.0 或更高 (通常随 Node.js 安装)
- **Git**: 用于版本控制
- **现代浏览器**: Chrome 90+, Firefox 88+, Safari 14+

### 账户要求
- **GitHub 账户**: 用于代码托管和自动部署
- **Cloudflare 账户**: 免费账户即可开始

### 验证环境
```bash
# 检查 Node.js 版本
node --version
# 应显示 v16.0.0 或更高

# 检查 npm 版本  
npm --version
# 应显示 7.0.0 或更高

# 检查 Git 版本
git --version
# 应显示 Git 版本信息
```

## 🛠️ 第一步：准备项目代码

### 1.1 克隆或下载项目
```bash
# 如果项目已在 GitHub 上
git clone https://github.com/your-username/keywords.git
cd keywords

# 或者如果是本地项目，确保在项目根目录
cd /path/to/your/keywords/project
```

### 1.2 安装项目依赖
```bash
# 安装前端依赖
npm install

# 安装 Cloudflare Wrangler CLI (全局安装)
npm install -g wrangler

# 验证 Wrangler 安装
wrangler --version
```

**截图位置**: 在此处添加终端执行 `npm install` 和 `wrangler --version` 的截图

### 1.3 项目结构确认
确保你的项目结构如下：
```
keywords/
├── src/                    # 前端源码
├── workers/               # Workers API 代码
│   └── keywords-api/
├── public/               # 静态资源
├── dist/                 # 构建输出 (构建后生成)
├── package.json          # 前端依赖配置
├── _headers             # Cloudflare Pages 头部配置
├── _redirects           # 重定向配置
└── README.md
```

## 🔐 第二步：Cloudflare 账户配置

### 2.1 创建 Cloudflare 账户
1. 访问 [https://dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up)
2. 使用邮箱注册账户
3. 验证邮箱地址
4. 完成账户设置

**截图位置**: Cloudflare 注册页面和仪表板首页截图

### 2.2 获取 API Token (可选，用于高级配置)
1. 登录 Cloudflare Dashboard
2. 点击右上角头像 → "My Profile"
3. 选择 "API Tokens" 标签
4. 点击 "Create Token"
5. 选择 "Custom token" 模板
6. 配置权限：
   - Account: Cloudflare Pages:Edit
   - Zone: Zone:Read
   - Zone Resources: Include All zones

**截图位置**: API Token 创建页面截图

### 2.3 Wrangler 身份验证
```bash
# 登录 Cloudflare 账户
wrangler auth login
```

这将打开浏览器窗口，按照提示完成授权。

**截图位置**: Wrangler 授权成功的终端输出截图

## ☁️ 第三步：部署 Cloudflare Workers API

### 3.1 配置 Workers 项目
```bash
# 进入 Workers 目录
cd workers/keywords-api

# 安装 Workers 依赖
npm install
```

### 3.2 创建 KV 命名空间
```bash
# 创建生产环境 KV 命名空间
wrangler kv:namespace create "KEYWORDS_KV"

# 创建预览环境 KV 命名空间  
wrangler kv:namespace create "KEYWORDS_KV" --preview
```

**重要**: 记录输出的命名空间 ID，类似于：
```
🌀 Creating namespace with title "keywords-api-KEYWORDS_KV"
✨ Success! Created KV namespace with id "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
```

**截图位置**: KV 命名空间创建成功的终端输出截图

### 3.3 更新 wrangler.toml 配置
编辑 `workers/keywords-api/wrangler.toml` 文件：

```toml
name = "keywords-api"
main = "src/index.js"
compatibility_date = "2024-09-10"
compatibility_flags = ["nodejs_compat"]

# KV 命名空间绑定 - 替换为实际的 ID
[[kv_namespaces]]
binding = "KEYWORDS_KV"
id = "你的生产环境KV命名空间ID"
preview_id = "你的预览环境KV命名空间ID"

# 环境变量
[vars]
ENVIRONMENT = "production"

# 开发环境配置
[env.dev]
name = "keywords-api-dev"
vars = { ENVIRONMENT = "development" }
```

### 3.4 部署 Workers
```bash
# 部署到生产环境
wrangler deploy

# 如果需要部署到开发环境
wrangler deploy --env dev
```

**重要**: 记录部署成功后的 Workers URL，类似于：
```
✨ Success! Deployed to https://keywords-api.your-subdomain.workers.dev
```

**截图位置**: Workers 部署成功的终端输出截图

### 3.5 测试 Workers API
```bash
# 测试 API 是否正常工作
curl https://keywords-api.your-subdomain.workers.dev/health

# 应该返回类似: {"status":"ok","timestamp":"2024-01-01T00:00:00.000Z"}
```

## 📄 第四步：配置前端项目

### 4.1 更新 API 配置
编辑 `_redirects` 文件，更新 Workers URL：

```
# Cloudflare Pages Redirects Configuration

# SPA fallback - redirect all non-file requests to index.html
/*    /index.html   200

# API routes - redirect to Cloudflare Workers
/api/*  https://keywords-api.your-subdomain.workers.dev/:splat  200
```

**注意**: 将 `keywords-api.your-subdomain.workers.dev` 替换为步骤 3.4 中获得的实际 Workers URL。

### 4.2 构建前端项目
```bash
# 返回项目根目录
cd ../..

# 构建生产版本
npm run build
```

构建成功后，会在项目根目录生成 `dist/` 文件夹。

**截图位置**: 构建成功的终端输出和生成的 dist 目录截图

## 🌐 第五步：部署到 Cloudflare Pages (推荐方式：GitHub 自动同步)

### 5.1 将代码推送到 GitHub

#### 如果还没有 GitHub 仓库：
```bash
# 初始化 Git 仓库 (如果还没有)
git init

# 添加所有文件
git add .

# 提交代码
git commit -m "Initial commit: Keywords recognition system"

# 在 GitHub 上创建新仓库，然后添加远程仓库
git remote add origin https://github.com/your-username/keywords.git

# 推送代码
git push -u origin main
```

#### 如果已有 GitHub 仓库：
```bash
# 添加更改
git add .

# 提交更改
git commit -m "Update configuration for Cloudflare deployment"

# 推送到 GitHub
git push origin main
```

**截图位置**: GitHub 仓库页面截图，显示代码已成功推送

### 5.2 在 Cloudflare Pages 中创建项目

1. **登录 Cloudflare Dashboard**
   - 访问 [https://dash.cloudflare.com](https://dash.cloudflare.com)
   - 使用你的账户登录

2. **进入 Pages 部分**
   - 在左侧导航栏中点击 "Pages"
   - 点击 "Create a project" 按钮

**截图位置**: Cloudflare Pages 创建项目页面截图

3. **连接 GitHub 仓库**
   - 选择 "Connect to Git"
   - 点击 "GitHub" 按钮
   - 授权 Cloudflare 访问你的 GitHub 账户
   - 选择你的 `keywords` 仓库

**截图位置**: GitHub 仓库选择页面截图

4. **配置构建设置**
   ```
   项目名称: keywords-system (或你喜欢的名称)
   生产分支: main
   构建命令: npm run build
   构建输出目录: dist
   根目录: / (保持默认)
   ```

**截图位置**: 构建设置配置页面截图

5. **环境变量设置 (可选)**
   在 "Environment variables" 部分添加：
   ```
   NODE_VERSION = 18
   NPM_VERSION = 8
   ```

6. **开始部署**
   - 点击 "Save and Deploy" 按钮
   - 等待构建和部署完成 (通常需要 2-5 分钟)

**截图位置**: 部署进行中和部署成功的页面截图

### 5.3 获取 Pages URL
部署成功后，你会获得一个类似于以下的 URL：
```
https://keywords-system.pages.dev
```

**截图位置**: 部署成功页面，显示项目 URL

## 🔧 第六步：域名配置 (可选)

### 6.1 添加自定义域名
如果你有自己的域名，可以配置自定义域名：

1. **在 Pages 项目中添加域名**
   - 进入你的 Pages 项目
   - 点击 "Custom domains" 标签
   - 点击 "Set up a custom domain"
   - 输入你的域名 (例如: keywords.yourdomain.com)

2. **配置 DNS 记录**
   - 在你的域名提供商处添加 CNAME 记录：
   ```
   名称: keywords (或你选择的子域名)
   类型: CNAME
   值: keywords-system.pages.dev
   ```

3. **等待 DNS 传播**
   - DNS 更改通常需要几分钟到几小时生效
   - 可以使用 `nslookup` 或在线工具检查 DNS 状态

**截图位置**: 自定义域名配置页面和 DNS 设置截图

### 6.2 SSL 证书
Cloudflare 会自动为你的自定义域名提供免费的 SSL 证书，无需额外配置。

## ✅ 第七步：验证部署

### 7.1 功能测试清单
访问你的网站 URL，测试以下功能：

- [ ] **页面加载**: 网站能正常打开，界面显示完整
- [ ] **添加关键词**: 能够添加新的关键词
- [ ] **文本输入**: 能够在文本框中输入内容
- [ ] **关键词识别**: 点击"识别关键词"按钮能正常工作
- [ ] **高亮显示**: 关键词能正确高亮显示
- [ ] **颜色区分**: 不同关键词使用不同颜色
- [ ] **导航功能**: "上一个"和"下一个"按钮正常工作
- [ ] **删除关键词**: 能够删除已添加的关键词
- [ ] **数据持久化**: 刷新页面后关键词仍然存在

### 7.2 性能测试
```bash
# 使用 curl 测试 API 响应时间
curl -w "@curl-format.txt" -o /dev/null -s "https://your-pages-url.pages.dev"

# 或使用在线工具测试:
# - GTmetrix: https://gtmetrix.com/
# - PageSpeed Insights: https://pagespeed.web.dev/
```

### 7.3 移动端测试
- 在手机浏览器中打开网站
- 测试响应式布局
- 确认触摸操作正常

**截图位置**: 桌面端和移动端的网站截图

## 🚨 常见问题排查

### 问题 1: 构建失败
**症状**: Pages 部署时构建失败
**解决方案**:
```bash
# 检查 Node.js 版本兼容性
# 在 Pages 环境变量中设置:
NODE_VERSION = 18

# 清除本地缓存重新构建
rm -rf node_modules package-lock.json
npm install
npm run build
```

### 问题 2: API 调用失败
**症状**: 前端无法连接到 Workers API
**解决方案**:
1. 检查 `_redirects` 文件中的 Workers URL 是否正确
2. 确认 Workers 已成功部署：
   ```bash
   curl https://your-worker-url.workers.dev/health
   ```
3. 检查 Workers 日志：
   ```bash
   cd workers/keywords-api
   wrangler tail
   ```

### 问题 3: KV 存储问题
**症状**: 数据无法保存或读取
**解决方案**:
1. 确认 KV 命名空间 ID 正确配置在 `wrangler.toml` 中
2. 测试 KV 访问：
   ```bash
   wrangler kv:key list --namespace-id="your-kv-namespace-id"
   ```

### 问题 4: 页面显示异常
**症状**: 页面样式错误或功能异常
**解决方案**:
1. 检查浏览器控制台错误信息
2. 确认所有静态资源正确加载
3. 验证 `_headers` 文件配置正确

### 问题 5: 自动部署不工作
**症状**: 推送代码到 GitHub 后 Pages 没有自动重新部署
**解决方案**:
1. 检查 GitHub 仓库的 webhook 设置
2. 在 Pages 项目中手动触发重新部署
3. 确认推送到了正确的分支 (通常是 main)

## 📊 监控和维护

### 监控指标
1. **访问统计**: 在 Cloudflare Analytics 中查看
2. **API 调用**: 在 Workers Analytics 中监控
3. **错误日志**: 使用 `wrangler tail` 实时查看

### 定期维护
```bash
# 每月更新依赖
npm update

# 重新部署 Workers (如有更新)
cd workers/keywords-api
wrangler deploy

# 检查安全更新
npm audit
npm audit fix
```

## 💰 成本估算

基于 Cloudflare 免费计划的使用限制：

| 服务 | 免费限制 | 超出后费用 |
|------|----------|------------|
| Pages | 500 次构建/月 | $0.25/构建 |
| Workers | 100,000 请求/天 | $0.50/百万请求 |
| KV 存储 | 100,000 读取/天<br>1,000 写入/天 | $0.50/百万读取<br>$5.00/百万写入 |

**预估**: 对于中小型应用，免费计划完全够用。

## 🔄 更新和维护流程

### 代码更新流程
1. **本地开发和测试**
   ```bash
   npm run dev  # 本地开发服务器
   ```

2. **提交更改**
   ```bash
   git add .
   git commit -m "描述你的更改"
   git push origin main
   ```

3. **自动部署**
   - Pages 会自动检测到 GitHub 更改并重新部署
   - 通常在 2-5 分钟内完成

### Workers 更新流程
```bash
cd workers/keywords-api
# 修改代码后
wrangler deploy
```

## 🎉 部署完成

恭喜！你已经成功将关键词识别和标注系统部署到 Cloudflare 平台。

### 下一步建议
1. **设置监控**: 配置 Cloudflare 的监控和告警
2. **性能优化**: 根据使用情况优化缓存策略
3. **功能扩展**: 根据用户反馈添加新功能
4. **备份策略**: 定期备份 KV 存储中的重要数据

### 有用的链接
- [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [Wrangler CLI 文档](https://developers.cloudflare.com/workers/wrangler/)
- [项目 GitHub 仓库](https://github.com/your-username/keywords)

---

**技术支持**: 如果在部署过程中遇到问题，可以：
1. 查看 Cloudflare 社区论坛
2. 检查项目的 GitHub Issues
3. 参考官方文档和示例

**最后更新**: 2024年9月12日
