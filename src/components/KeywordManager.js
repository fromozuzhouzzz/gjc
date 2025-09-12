export class KeywordManager {
  constructor(container, options = {}) {
    this.container = container;
    this.keywords = options.keywords || [];
    this.onKeywordsChange = options.onKeywordsChange || (() => {});
    this.apiService = options.apiService;
    
    this.init();
  }

  init() {
    this.container.innerHTML = `
      <div class="flex flex-col h-full">
        <div class="mb-4">
          <h2 class="text-xl font-bold text-gray-800 mb-4">关键词管理</h2>
          
          <!-- 添加单个关键词 -->
          <div class="mb-4">
            <div class="flex gap-2">
              <input 
                type="text" 
                id="keyword-input" 
                class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="输入关键词..."
              />
              <button 
                id="add-keyword-btn" 
                class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                添加
              </button>
            </div>
          </div>

          <!-- 批量导入 -->
          <div class="mb-4">
            <button 
              id="toggle-batch-btn" 
              class="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              批量导入关键词
            </button>
            <div id="batch-import" class="hidden mt-2">
              <textarea 
                id="batch-input" 
                class="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="每行一个关键词..."
              ></textarea>
              <div class="flex gap-2 mt-2">
                <button 
                  id="import-btn" 
                  class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                >
                  导入
                </button>
                <button 
                  id="cancel-import-btn" 
                  class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                >
                  取消
                </button>
              </div>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="flex gap-2 mb-4">
            <button 
              id="clear-all-btn" 
              class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors text-sm"
            >
              清空所有
            </button>
            <button 
              id="save-btn" 
              class="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors text-sm"
            >
              保存到云端
            </button>
            <button 
              id="load-btn" 
              class="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg transition-colors text-sm"
            >
              从云端加载
            </button>
          </div>
        </div>

        <!-- 关键词列表 -->
        <div class="flex-1 overflow-hidden">
          <div class="flex justify-between items-center mb-2">
            <h3 class="text-lg font-semibold text-gray-700">关键词列表</h3>
            <span id="keyword-count" class="text-sm text-gray-500">共 0 个</span>
          </div>
          <div id="keywords-list" class="h-full overflow-y-auto border border-gray-200 rounded-lg p-2">
            <!-- 关键词项目将在这里动态生成 -->
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
    this.renderKeywords();
  }

  bindEvents() {
    const keywordInput = this.container.querySelector('#keyword-input');
    const addBtn = this.container.querySelector('#add-keyword-btn');
    const toggleBatchBtn = this.container.querySelector('#toggle-batch-btn');
    const batchImport = this.container.querySelector('#batch-import');
    const batchInput = this.container.querySelector('#batch-input');
    const importBtn = this.container.querySelector('#import-btn');
    const cancelImportBtn = this.container.querySelector('#cancel-import-btn');
    const clearAllBtn = this.container.querySelector('#clear-all-btn');
    const saveBtn = this.container.querySelector('#save-btn');
    const loadBtn = this.container.querySelector('#load-btn');

    // 添加单个关键词
    addBtn.addEventListener('click', () => this.addKeyword());
    keywordInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.addKeyword();
      }
    });

    // 批量导入切换
    toggleBatchBtn.addEventListener('click', () => {
      batchImport.classList.toggle('hidden');
      if (!batchImport.classList.contains('hidden')) {
        batchInput.focus();
      }
    });

    // 批量导入
    importBtn.addEventListener('click', () => this.importKeywords());
    cancelImportBtn.addEventListener('click', () => {
      batchImport.classList.add('hidden');
      batchInput.value = '';
    });

    // 清空所有
    clearAllBtn.addEventListener('click', () => this.clearAllKeywords());

    // 云端操作
    saveBtn.addEventListener('click', () => this.saveToCloud());
    loadBtn.addEventListener('click', () => this.loadFromCloud());
  }

  addKeyword() {
    const input = this.container.querySelector('#keyword-input');
    const keyword = input.value.trim();
    
    if (!keyword) {
      this.showMessage('请输入关键词', 'error');
      return;
    }

    if (this.keywords.includes(keyword)) {
      this.showMessage('关键词已存在', 'warning');
      return;
    }

    this.keywords.push(keyword);
    input.value = '';
    this.renderKeywords();
    this.onKeywordsChange(this.keywords);
    this.showMessage('关键词添加成功', 'success');
  }

  importKeywords() {
    const batchInput = this.container.querySelector('#batch-input');
    const text = batchInput.value.trim();
    
    if (!text) {
      this.showMessage('请输入要导入的关键词', 'error');
      return;
    }

    const newKeywords = text.split('\n')
      .map(line => line.trim())
      .filter(line => line && !this.keywords.includes(line));

    if (newKeywords.length === 0) {
      this.showMessage('没有新的关键词需要导入', 'warning');
      return;
    }

    this.keywords.push(...newKeywords);
    batchInput.value = '';
    this.container.querySelector('#batch-import').classList.add('hidden');
    this.renderKeywords();
    this.onKeywordsChange(this.keywords);
    this.showMessage(`成功导入 ${newKeywords.length} 个关键词`, 'success');
  }

  removeKeyword(keyword) {
    const index = this.keywords.indexOf(keyword);
    if (index > -1) {
      this.keywords.splice(index, 1);
      this.renderKeywords();
      this.onKeywordsChange(this.keywords);
      this.showMessage('关键词删除成功', 'success');
    }
  }

  clearAllKeywords() {
    if (this.keywords.length === 0) {
      this.showMessage('没有关键词需要清空', 'warning');
      return;
    }

    if (confirm('确定要清空所有关键词吗？')) {
      this.keywords = [];
      this.renderKeywords();
      this.onKeywordsChange(this.keywords);
      this.showMessage('所有关键词已清空', 'success');
    }
  }

  async saveToCloud() {
    if (!this.apiService) {
      this.showMessage('云端服务未配置', 'error');
      return;
    }

    try {
      this.showMessage('正在保存到云端...', 'info');
      await this.apiService.saveKeywords(this.keywords);
      this.showMessage('保存到云端成功', 'success');
    } catch (error) {
      console.error('保存失败:', error);
      this.showMessage('保存到云端失败', 'error');
    }
  }

  async loadFromCloud() {
    if (!this.apiService) {
      this.showMessage('云端服务未配置', 'error');
      return;
    }

    try {
      this.showMessage('正在从云端加载...', 'info');
      const cloudKeywords = await this.apiService.loadKeywords();
      
      if (cloudKeywords && cloudKeywords.length > 0) {
        this.keywords = [...cloudKeywords];
        this.renderKeywords();
        this.onKeywordsChange(this.keywords);
        this.showMessage(`从云端加载了 ${cloudKeywords.length} 个关键词`, 'success');
      } else {
        this.showMessage('云端没有保存的关键词', 'warning');
      }
    } catch (error) {
      console.error('加载失败:', error);
      this.showMessage('从云端加载失败', 'error');
    }
  }

  renderKeywords() {
    const listContainer = this.container.querySelector('#keywords-list');
    const countElement = this.container.querySelector('#keyword-count');
    
    countElement.textContent = `共 ${this.keywords.length} 个`;

    if (this.keywords.length === 0) {
      listContainer.innerHTML = `
        <div class="text-center text-gray-500 py-8">
          <p>还没有添加关键词</p>
          <p class="text-sm mt-2">请在上方输入框中添加关键词</p>
        </div>
      `;
      return;
    }

    listContainer.innerHTML = this.keywords.map(keyword => `
      <div class="keyword-item flex justify-between items-center p-2 mb-2 bg-gray-50 rounded-lg hover:bg-gray-100">
        <span class="text-gray-800 flex-1 truncate" title="${keyword}">${keyword}</span>
        <button 
          class="text-red-500 hover:text-red-700 ml-2 p-1 rounded transition-colors"
          onclick="window.keywordManager.removeKeyword('${keyword.replace(/'/g, "\\'")}')"
          title="删除关键词"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    `).join('');
  }

  showMessage(message, type = 'info') {
    // 创建消息提示
    const messageDiv = document.createElement('div');
    const bgColor = {
      success: 'bg-green-100 border-green-400 text-green-700',
      error: 'bg-red-100 border-red-400 text-red-700',
      warning: 'bg-yellow-100 border-yellow-400 text-yellow-700',
      info: 'bg-blue-100 border-blue-400 text-blue-700'
    }[type];

    messageDiv.className = `fixed top-4 right-4 px-4 py-2 border rounded-lg ${bgColor} z-50 transition-opacity`;
    messageDiv.textContent = message;

    document.body.appendChild(messageDiv);

    // 3秒后自动消失
    setTimeout(() => {
      messageDiv.style.opacity = '0';
      setTimeout(() => {
        if (messageDiv.parentNode) {
          messageDiv.parentNode.removeChild(messageDiv);
        }
      }, 300);
    }, 3000);
  }

  setKeywords(keywords) {
    this.keywords = [...keywords];
    this.renderKeywords();
  }

  getKeywords() {
    return [...this.keywords];
  }
}
