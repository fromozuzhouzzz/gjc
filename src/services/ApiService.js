export class ApiService {
  constructor(baseUrl = '/api') {
    this.baseUrl = baseUrl;
    this.userId = this.getUserId();
  }

  getUserId() {
    // 从localStorage获取或生成用户ID
    let userId = localStorage.getItem('keyword_user_id');
    if (!userId) {
      userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('keyword_user_id', userId);
    }
    return userId;
  }

  async saveKeywords(keywords) {
    try {
      const response = await fetch(`${this.baseUrl}/keywords`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: this.userId,
          keywords: keywords
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('保存关键词失败:', error);
      throw error;
    }
  }

  async loadKeywords() {
    try {
      const response = await fetch(`${this.baseUrl}/keywords?userId=${this.userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          // 用户还没有保存过关键词
          return [];
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.keywords || [];
    } catch (error) {
      console.error('加载关键词失败:', error);
      throw error;
    }
  }

  async deleteKeywords() {
    try {
      const response = await fetch(`${this.baseUrl}/keywords?userId=${this.userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('删除关键词失败:', error);
      throw error;
    }
  }
}
