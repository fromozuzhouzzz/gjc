/**
 * Cloudflare Workers API for Keywords Management
 * 处理关键词的增删改查操作，使用Cloudflare KV存储
 */

// CORS 头部配置
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

// 处理 CORS 预检请求
function handleCORS(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }
  return null;
}

// 创建响应
function createResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
  });
}

// 错误响应
function createErrorResponse(message, status = 400) {
  return createResponse({ error: message }, status);
}

// 验证用户ID
function validateUserId(userId) {
  if (!userId || typeof userId !== 'string' || userId.length < 5) {
    return false;
  }
  return true;
}

// 验证关键词数组
function validateKeywords(keywords) {
  if (!Array.isArray(keywords)) {
    return false;
  }
  
  // 检查每个关键词
  for (const keyword of keywords) {
    if (typeof keyword !== 'string' || keyword.trim().length === 0) {
      return false;
    }
  }
  
  return true;
}

// 获取关键词
async function getKeywords(request, env) {
  const url = new URL(request.url);
  const userId = url.searchParams.get('userId');
  
  if (!validateUserId(userId)) {
    return createErrorResponse('无效的用户ID');
  }
  
  try {
    const key = `keywords:${userId}`;
    const data = await env.KEYWORDS_KV.get(key);
    
    if (!data) {
      return createResponse({ keywords: [] });
    }
    
    const parsed = JSON.parse(data);
    return createResponse({
      keywords: parsed.keywords || [],
      updatedAt: parsed.updatedAt,
    });
  } catch (error) {
    console.error('获取关键词失败:', error);
    return createErrorResponse('获取关键词失败', 500);
  }
}

// 保存关键词
async function saveKeywords(request, env) {
  try {
    const body = await request.json();
    const { userId, keywords } = body;
    
    if (!validateUserId(userId)) {
      return createErrorResponse('无效的用户ID');
    }
    
    if (!validateKeywords(keywords)) {
      return createErrorResponse('无效的关键词数据');
    }
    
    // 限制关键词数量
    if (keywords.length > 1000) {
      return createErrorResponse('关键词数量不能超过1000个');
    }
    
    // 限制单个关键词长度
    for (const keyword of keywords) {
      if (keyword.length > 100) {
        return createErrorResponse('单个关键词长度不能超过100个字符');
      }
    }
    
    const key = `keywords:${userId}`;
    const data = {
      keywords: keywords.map(k => k.trim()).filter(k => k.length > 0),
      updatedAt: new Date().toISOString(),
      userId: userId,
    };
    
    await env.KEYWORDS_KV.put(key, JSON.stringify(data));
    
    return createResponse({
      success: true,
      message: '关键词保存成功',
      count: data.keywords.length,
      updatedAt: data.updatedAt,
    });
  } catch (error) {
    console.error('保存关键词失败:', error);
    return createErrorResponse('保存关键词失败', 500);
  }
}

// 删除关键词
async function deleteKeywords(request, env) {
  const url = new URL(request.url);
  const userId = url.searchParams.get('userId');
  
  if (!validateUserId(userId)) {
    return createErrorResponse('无效的用户ID');
  }
  
  try {
    const key = `keywords:${userId}`;
    await env.KEYWORDS_KV.delete(key);
    
    return createResponse({
      success: true,
      message: '关键词删除成功',
    });
  } catch (error) {
    console.error('删除关键词失败:', error);
    return createErrorResponse('删除关键词失败', 500);
  }
}

// 获取用户统计信息
async function getUserStats(request, env) {
  const url = new URL(request.url);
  const userId = url.searchParams.get('userId');
  
  if (!validateUserId(userId)) {
    return createErrorResponse('无效的用户ID');
  }
  
  try {
    const key = `keywords:${userId}`;
    const data = await env.KEYWORDS_KV.get(key);
    
    if (!data) {
      return createResponse({
        keywordCount: 0,
        lastUpdated: null,
      });
    }
    
    const parsed = JSON.parse(data);
    return createResponse({
      keywordCount: parsed.keywords ? parsed.keywords.length : 0,
      lastUpdated: parsed.updatedAt,
    });
  } catch (error) {
    console.error('获取统计信息失败:', error);
    return createErrorResponse('获取统计信息失败', 500);
  }
}

// 主处理函数
export default {
  async fetch(request, env, ctx) {
    // 处理 CORS 预检请求
    const corsResponse = handleCORS(request);
    if (corsResponse) {
      return corsResponse;
    }
    
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    
    try {
      // 路由处理
      if (path === '/api/keywords') {
        switch (method) {
          case 'GET':
            return await getKeywords(request, env);
          case 'POST':
            return await saveKeywords(request, env);
          case 'DELETE':
            return await deleteKeywords(request, env);
          default:
            return createErrorResponse('不支持的请求方法', 405);
        }
      }
      
      if (path === '/api/stats') {
        if (method === 'GET') {
          return await getUserStats(request, env);
        } else {
          return createErrorResponse('不支持的请求方法', 405);
        }
      }
      
      // 健康检查
      if (path === '/api/health') {
        return createResponse({
          status: 'ok',
          timestamp: new Date().toISOString(),
          version: '1.0.0',
        });
      }
      
      // 404 处理
      return createErrorResponse('API端点不存在', 404);
      
    } catch (error) {
      console.error('请求处理失败:', error);
      return createErrorResponse('服务器内部错误', 500);
    }
  },
};
