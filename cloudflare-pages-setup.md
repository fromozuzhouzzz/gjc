# Cloudflare Pages 自动部署配置指南

本指南将帮助你将现有的手动上传部署方式改为 GitHub 自动同步部署。

## 前置条件

- GitHub 仓库已经包含最新代码
- Cloudflare 账户
- Cloudflare Workers API 已部署（保持不变）

## 配置步骤

### 1. 登录 Cloudflare Dashboard

1. 访问 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 登录你的账户

### 2. 创建新的 Pages 项目

1. 在左侧导航栏中点击 **"Pages"**
2. 点击 **"Create a project"** 按钮
3. 选择 **"Connect to Git"**

### 3. 连接 GitHub 仓库

1. 选择 **"GitHub"** 作为 Git 提供商
2. 如果首次使用，需要授权 Cloudflare 访问你的 GitHub 账户
3. 在仓库列表中找到并选择 `gjc` 仓库
4. 点击 **"Begin setup"**

### 4. 配置构建设置

在项目设置页面，配置以下参数：

**基本设置：**
- **Project name**: `keywords-system`（或你喜欢的名称）
- **Production branch**: `main`

**构建设置：**
- **Framework preset**: 选择 `Vite` 或 `None`
- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Root directory**: `/`（保持默认）

**环境变量（可选）：**
如果需要，可以添加以下环境变量：
- `NODE_ENV`: `production`
- `VITE_API_BASE_URL`: 你的 Workers API URL

### 5. 完成部署设置

1. 检查所有配置是否正确
2. 点击 **"Save and Deploy"**
3. Cloudflare Pages 将开始首次构建和部署

### 6. 验证自动部署

1. 等待首次部署完成（通常需要 2-5 分钟）
2. 部署完成后，你会获得一个 `.pages.dev` 域名
3. 访问该域名验证网站是否正常工作

## 自动部署工作流程

配置完成后，每当你：
1. 向 `main` 分支推送代码
2. 合并 Pull Request 到 `main` 分支

Cloudflare Pages 会自动：
1. 检测到代码变更
2. 拉取最新代码
3. 运行 `npm run build` 构建项目
4. 将 `dist` 目录部署到 CDN
5. 更新线上网站

## 高级配置

### 自定义域名

1. 在 Pages 项目设置中点击 **"Custom domains"**
2. 点击 **"Set up a custom domain"**
3. 输入你的域名
4. 按照提示配置 DNS 记录

### 预览部署

- 每个 Pull Request 都会自动创建预览部署
- 预览 URL 会在 PR 评论中显示
- 可以在合并前测试更改

### 环境变量管理

1. 在项目设置中点击 **"Environment variables"**
2. 分别为 Production 和 Preview 环境配置变量
3. 常用变量：
   - `VITE_API_BASE_URL`: API 基础 URL
   - `NODE_ENV`: 环境标识

## 故障排除

### 构建失败

1. 检查 GitHub 仓库中的 `package.json` 是否正确
2. 确保 `npm run build` 在本地能正常运行
3. 查看 Cloudflare Pages 的构建日志

### 部署后网站无法访问

1. 检查构建输出目录是否为 `dist`
2. 确保 `dist` 目录包含 `index.html`
3. 检查 API 调用是否正确配置

### API 调用失败

1. 确认 Workers API 仍在正常运行
2. 检查 CORS 配置
3. 验证 API URL 是否正确

## 迁移注意事项

1. **保持 Workers 不变**: 现有的 Cloudflare Workers API 无需修改
2. **域名切换**: 如果使用自定义域名，需要更新 DNS 记录
3. **缓存清理**: 部署后可能需要清理浏览器缓存
4. **监控**: 密切关注首次自动部署的结果

## 成本影响

- Cloudflare Pages 免费计划包含：
  - 每月 500 次构建
  - 无限带宽
  - 全球 CDN
- 超出免费额度后按使用量计费
- 通常比手动部署更经济高效
