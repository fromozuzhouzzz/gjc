# Keywords API - Cloudflare Workers

这是关键词识别和标注系统的后端API，使用Cloudflare Workers和KV存储构建。

## 功能特性

- 用户关键词的增删改查操作
- 基于Cloudflare KV的数据持久化存储
- CORS支持，可跨域访问
- 数据验证和错误处理
- 用户统计信息

## API端点

### 1. 获取关键词
```
GET /api/keywords?userId={userId}
```

响应：
```json
{
  "keywords": ["关键词1", "关键词2"],
  "updatedAt": "2024-09-12T10:30:00.000Z"
}
```

### 2. 保存关键词
```
POST /api/keywords
Content-Type: application/json

{
  "userId": "user_123",
  "keywords": ["关键词1", "关键词2"]
}
```

响应：
```json
{
  "success": true,
  "message": "关键词保存成功",
  "count": 2,
  "updatedAt": "2024-09-12T10:30:00.000Z"
}
```

### 3. 删除关键词
```
DELETE /api/keywords?userId={userId}
```

响应：
```json
{
  "success": true,
  "message": "关键词删除成功"
}
```

### 4. 获取用户统计
```
GET /api/stats?userId={userId}
```

响应：
```json
{
  "keywordCount": 10,
  "lastUpdated": "2024-09-12T10:30:00.000Z"
}
```

### 5. 健康检查
```
GET /api/health
```

响应：
```json
{
  "status": "ok",
  "timestamp": "2024-09-12T10:30:00.000Z",
  "version": "1.0.0"
}
```

## 部署步骤

### 1. 安装依赖
```bash
cd workers/keywords-api
npm install
```

### 2. 创建KV命名空间
```bash
# 创建生产环境KV命名空间
npm run kv:create

# 创建预览环境KV命名空间
npm run kv:create:preview
```

### 3. 配置wrangler.toml
将创建的KV命名空间ID填入`wrangler.toml`文件中：
```toml
[[kv_namespaces]]
binding = "KEYWORDS_KV"
id = "your-actual-kv-namespace-id"
preview_id = "your-actual-preview-kv-namespace-id"
```

### 4. 配置路由（可选）
如果你有自定义域名，更新`wrangler.toml`中的路由配置：
```toml
[[routes]]
pattern = "yourdomain.com/api/*"
zone_name = "yourdomain.com"
```

### 5. 本地开发
```bash
npm run dev
```

### 6. 部署到生产环境
```bash
npm run deploy
```

### 7. 部署到开发环境
```bash
npm run deploy:dev
```

## 数据限制

- 每个用户最多存储1000个关键词
- 单个关键词最大长度100个字符
- 用户ID最小长度5个字符

## 错误处理

API会返回适当的HTTP状态码和错误信息：

- 400: 请求参数错误
- 404: 资源不存在
- 405: 请求方法不支持
- 500: 服务器内部错误

## 监控和日志

使用以下命令查看实时日志：
```bash
npm run tail
```

## 安全考虑

- 所有输入数据都经过验证
- 实施了数据长度和数量限制
- 支持CORS但建议在生产环境中限制允许的域名
- 用户ID用于数据隔离，确保用户间数据安全

## 成本优化

- 使用Cloudflare Workers免费层（每天100,000次请求）
- KV存储免费层（每天100,000次读取，1,000次写入）
- 适合中小型应用的使用需求
