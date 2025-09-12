export class TextEditor {
  constructor(container, options = {}) {
    this.container = container;
    this.keywords = options.keywords || [];
    this.currentHighlightIndex = -1;
    this.highlights = [];
    this.onKeywordNavigate = options.onKeywordNavigate || (() => {});
    
    this.init();
  }

  init() {
    this.container.innerHTML = `
      <div class="flex flex-col h-full">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold text-gray-800">文本编辑器</h2>
          <div class="flex gap-2">
            <button id="identify-btn" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors">
              识别关键词
            </button>
            <button id="clear-btn" class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors">
              清除高亮
            </button>
          </div>
        </div>
        
        <div class="flex-1 flex flex-col">
          <textarea 
            id="text-input" 
            class="text-editor flex-1 w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="请在此输入要分析的文本..."
          ></textarea>
          
          <div class="flex justify-between items-center mt-4">
            <div class="flex gap-2">
              <button id="prev-btn" class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed" disabled>
                上一个
              </button>
              <button id="next-btn" class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed" disabled>
                下一个
              </button>
            </div>
            <div id="highlight-info" class="text-sm text-gray-600">
              未找到关键词
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    const identifyBtn = this.container.querySelector('#identify-btn');
    const clearBtn = this.container.querySelector('#clear-btn');
    const prevBtn = this.container.querySelector('#prev-btn');
    const nextBtn = this.container.querySelector('#next-btn');
    const textInput = this.container.querySelector('#text-input');

    identifyBtn.addEventListener('click', () => this.identifyKeywords());
    clearBtn.addEventListener('click', () => this.clearHighlights());
    prevBtn.addEventListener('click', () => this.navigateToPrevious());
    nextBtn.addEventListener('click', () => this.navigateToNext());
    
    // 监听文本变化，清除高亮
    textInput.addEventListener('input', () => {
      if (this.highlights.length > 0) {
        this.clearHighlights();
      }
    });
  }

  setKeywords(keywords) {
    this.keywords = keywords;
  }

  identifyKeywords() {
    const textInput = this.container.querySelector('#text-input');
    const text = textInput.value;
    
    if (!text.trim() || this.keywords.length === 0) {
      this.updateHighlightInfo('没有文本或关键词');
      return;
    }

    this.highlights = [];
    let highlightedText = text;
    let offset = 0;

    // 找到所有关键词匹配
    this.keywords.forEach(keyword => {
      if (!keyword.trim()) return;
      
      const regex = new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      let match;
      
      while ((match = regex.exec(text)) !== null) {
        this.highlights.push({
          keyword: keyword,
          start: match.index,
          end: match.index + match[0].length,
          text: match[0]
        });
      }
    });

    // 按位置排序
    this.highlights.sort((a, b) => a.start - b.start);

    if (this.highlights.length === 0) {
      this.updateHighlightInfo('未找到匹配的关键词');
      return;
    }

    // 应用高亮
    this.applyHighlights(text);
    this.currentHighlightIndex = 0;
    this.updateNavigationButtons();
    this.updateHighlightInfo();
    this.scrollToCurrentHighlight();
  }

  applyHighlights(originalText) {
    const textInput = this.container.querySelector('#text-input');
    let highlightedText = originalText;
    let offset = 0;

    this.highlights.forEach((highlight, index) => {
      const start = highlight.start + offset;
      const end = highlight.end + offset;
      const className = index === this.currentHighlightIndex ? 'keyword-highlight current' : 'keyword-highlight';
      const replacement = `<span class="${className}" data-highlight-index="${index}">${highlight.text}</span>`;
      
      highlightedText = highlightedText.substring(0, start) + replacement + highlightedText.substring(end);
      offset += replacement.length - highlight.text.length;
    });

    // 创建一个div来显示高亮文本
    const highlightDiv = document.createElement('div');
    highlightDiv.id = 'highlight-display';
    highlightDiv.className = 'absolute inset-0 p-4 pointer-events-none whitespace-pre-wrap break-words';
    highlightDiv.innerHTML = highlightedText;

    // 设置textarea的样式使其透明，但保持功能
    textInput.style.color = 'transparent';
    textInput.style.caretColor = 'black';
    
    // 添加高亮层
    const parent = textInput.parentNode;
    parent.style.position = 'relative';
    parent.appendChild(highlightDiv);
  }

  clearHighlights() {
    const textInput = this.container.querySelector('#text-input');
    const highlightDisplay = this.container.querySelector('#highlight-display');
    
    if (highlightDisplay) {
      highlightDisplay.remove();
    }
    
    textInput.style.color = '';
    textInput.style.caretColor = '';
    
    this.highlights = [];
    this.currentHighlightIndex = -1;
    this.updateNavigationButtons();
    this.updateHighlightInfo('未找到关键词');
  }

  navigateToPrevious() {
    if (this.highlights.length === 0) return;
    
    this.currentHighlightIndex = this.currentHighlightIndex <= 0 
      ? this.highlights.length - 1 
      : this.currentHighlightIndex - 1;
    
    this.updateCurrentHighlight();
  }

  navigateToNext() {
    if (this.highlights.length === 0) return;
    
    this.currentHighlightIndex = this.currentHighlightIndex >= this.highlights.length - 1 
      ? 0 
      : this.currentHighlightIndex + 1;
    
    this.updateCurrentHighlight();
  }

  updateCurrentHighlight() {
    const highlightDisplay = this.container.querySelector('#highlight-display');
    if (!highlightDisplay) return;

    // 更新所有高亮的样式
    const spans = highlightDisplay.querySelectorAll('span[data-highlight-index]');
    spans.forEach((span, index) => {
      span.className = index === this.currentHighlightIndex 
        ? 'keyword-highlight current' 
        : 'keyword-highlight';
    });

    this.updateHighlightInfo();
    this.scrollToCurrentHighlight();
    this.onKeywordNavigate(this.currentHighlightIndex, this.highlights[this.currentHighlightIndex]);
  }

  scrollToCurrentHighlight() {
    const textInput = this.container.querySelector('#text-input');
    const highlight = this.highlights[this.currentHighlightIndex];

    if (!highlight) return;

    // 设置光标位置到当前高亮
    textInput.focus();
    textInput.setSelectionRange(highlight.start, highlight.end);

    // 计算高亮文本在textarea中的位置并滚动
    this.scrollTextareaToPosition(textInput, highlight.start);
  }

  // 滚动textarea到指定位置
  scrollTextareaToPosition(textarea, position) {
    const text = textarea.value;
    const beforeText = text.substring(0, position);

    // 计算行数和列数
    const lines = beforeText.split('\n');
    const lineNumber = lines.length - 1;
    const columnNumber = lines[lines.length - 1].length;

    // 获取textarea的样式信息
    const computedStyle = window.getComputedStyle(textarea);
    const lineHeight = parseFloat(computedStyle.lineHeight) || 20;
    const paddingTop = parseFloat(computedStyle.paddingTop) || 0;

    // 计算目标位置的像素高度
    const targetY = lineNumber * lineHeight + paddingTop;

    // 获取textarea的可视区域高度
    const textareaHeight = textarea.clientHeight;
    const scrollTop = textarea.scrollTop;
    const visibleTop = scrollTop;
    const visibleBottom = scrollTop + textareaHeight;

    // 如果目标位置不在可视区域内，则滚动
    if (targetY < visibleTop || targetY > visibleBottom - lineHeight) {
      // 将目标位置滚动到可视区域的中央
      const newScrollTop = Math.max(0, targetY - textareaHeight / 2);
      textarea.scrollTop = newScrollTop;

      // 同步高亮层的滚动位置
      const highlightDisplay = this.container.querySelector('#highlight-display');
      if (highlightDisplay) {
        highlightDisplay.scrollTop = newScrollTop;
        highlightDisplay.scrollLeft = textarea.scrollLeft;
      }
    }
  }

  updateNavigationButtons() {
    const prevBtn = this.container.querySelector('#prev-btn');
    const nextBtn = this.container.querySelector('#next-btn');
    
    const hasHighlights = this.highlights.length > 0;
    prevBtn.disabled = !hasHighlights;
    nextBtn.disabled = !hasHighlights;
  }

  updateHighlightInfo(customMessage = null) {
    const infoElement = this.container.querySelector('#highlight-info');
    
    if (customMessage) {
      infoElement.textContent = customMessage;
      return;
    }

    if (this.highlights.length === 0) {
      infoElement.textContent = '未找到关键词';
    } else {
      infoElement.textContent = `第 ${this.currentHighlightIndex + 1} 个，共 ${this.highlights.length} 个`;
    }
  }

  getText() {
    const textInput = this.container.querySelector('#text-input');
    return textInput.value;
  }

  setText(text) {
    const textInput = this.container.querySelector('#text-input');
    textInput.value = text;
    this.clearHighlights();
  }
}
