export class ApiService {
  constructor(baseUrl = '/api') {
    this.baseUrl = baseUrl;
  }

  async saveKeywords(keywords) {
    try {
      const response = await fetch(`${this.baseUrl}/keywords`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
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
      const response = await fetch(`${this.baseUrl}/keywords`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          // 还没有保存过关键词
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
      const response = await fetch(`${this.baseUrl}/keywords`, {
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
