import "./style.css";
import { ApiService } from "./services/ApiService.js";

// 关键词识别和标注系统
let keywords = []; // 现在存储 {text: string, color: string} 对象
let highlights = [];
let currentHighlightIndex = -1;

// 初始化API服务
const apiService = new ApiService('/api');

// 预定义的颜色方案
const KEYWORD_COLORS = [
  { name: '红色', bg: '#fef2f2', text: '#dc2626', current: '#dc2626' },
  { name: '蓝色', bg: '#eff6ff', text: '#2563eb', current: '#2563eb' },
  { name: '绿色', bg: '#f0fdf4', text: '#16a34a', current: '#16a34a' },
  { name: '紫色', bg: '#faf5ff', text: '#9333ea', current: '#9333ea' },
  { name: '橙色', bg: '#fff7ed', text: '#ea580c', current: '#ea580c' },
  { name: '青色', bg: '#ecfeff', text: '#0891b2', current: '#0891b2' },
  { name: '粉色', bg: '#fdf2f8', text: '#db2777', current: '#db2777' },
  { name: '黄色', bg: '#fefce8', text: '#ca8a04', current: '#ca8a04' },
  { name: '灰色', bg: '#f9fafb', text: '#374151', current: '#374151' },
  { name: '靛蓝', bg: '#eef2ff', text: '#4f46e5', current: '#4f46e5' }
];

let colorIndex = 0; // 用于循环分配颜色

// 初始化应用
function initializeApp() {
  const appElement = document.querySelector('#app');

  // 创建主容器
  const mainContainer = document.createElement('div');
  mainContainer.className = 'min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100';

  // 创建头部
  const header = document.createElement('header');
  header.className = 'bg-white shadow-sm border-b sticky top-0 z-10';

  const headerContent = document.createElement('div');
  headerContent.className = 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4';

  const headerInner = document.createElement('div');
  headerInner.className = 'flex flex-col sm:flex-row sm:items-center sm:justify-between';

  const titleSection = document.createElement('div');
  const title = document.createElement('h1');
  title.className = 'text-2xl sm:text-3xl font-bold text-gray-900';
  title.textContent = '关键词识别和标注系统';

  const subtitle = document.createElement('p');
  subtitle.className = 'text-sm text-gray-600 mt-1';
  subtitle.textContent = '智能识别文本中的关键词并进行高亮标注';

  titleSection.appendChild(title);
  titleSection.appendChild(subtitle);

  headerInner.appendChild(titleSection);
  headerContent.appendChild(headerInner);
  header.appendChild(headerContent);

  // 创建主要内容区域
  const main = document.createElement('main');
  main.className = 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-[calc(100vh-120px)]';

  const container = document.createElement('div');
  container.className = 'flex flex-col gap-6 h-full';

  // 上半部分：文本编辑器
  const topPanel = createTextEditor();

  // 下半部分：关键词管理
  const bottomPanel = createKeywordManager();

  container.appendChild(topPanel);
  container.appendChild(bottomPanel);
  main.appendChild(container);

  // 组装页面
  mainContainer.appendChild(header);
  mainContainer.appendChild(main);
  appElement.appendChild(mainContainer);
}

// 创建文本编辑器面板
function createTextEditor() {
  const panel = document.createElement('div');
  panel.className = 'flex-1 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden flex flex-col';

  const content = document.createElement('div');
  content.className = 'p-6 flex-1 flex flex-col';

  const title = document.createElement('h2');
  title.className = 'text-xl font-bold text-gray-800 mb-4';
  title.textContent = '文本编辑器';

  // 关键词颜色显示区域
  const keywordColorsContainer = document.createElement('div');
  keywordColorsContainer.id = 'keyword-colors-display';
  keywordColorsContainer.className = 'mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center gap-3 min-h-[50px]';

  const keywordColorsTitle = document.createElement('div');
  keywordColorsTitle.className = 'text-sm font-medium text-gray-700 flex-shrink-0';
  keywordColorsTitle.textContent = '当前关键词颜色：';

  const keywordColorsContent = document.createElement('div');
  keywordColorsContent.id = 'keyword-colors-content';
  keywordColorsContent.className = 'flex flex-wrap gap-2 flex-1';

  keywordColorsContainer.appendChild(keywordColorsTitle);
  keywordColorsContainer.appendChild(keywordColorsContent);

  const textareaContainer = document.createElement('div');
  textareaContainer.className = 'relative flex-1 min-h-0';

  const textarea = document.createElement('textarea');
  textarea.id = 'text-input';
  textarea.className = 'w-full h-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none';
  textarea.placeholder = '请在此输入要分析的文本...';

  textareaContainer.appendChild(textarea);

  const buttonContainer = document.createElement('div');
  buttonContainer.className = 'mt-4 flex gap-2';

  const identifyBtn = document.createElement('button');
  identifyBtn.id = 'identify-btn';
  identifyBtn.className = 'bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg';
  identifyBtn.textContent = '识别关键词';

  const clearBtn = document.createElement('button');
  clearBtn.id = 'clear-btn';
  clearBtn.className = 'bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg';
  clearBtn.textContent = '清除高亮';

  const prevBtn = document.createElement('button');
  prevBtn.id = 'prev-btn';
  prevBtn.className = 'bg-purple-500 hover:bg-purple-600 text-white px-3 py-2 rounded-lg';
  prevBtn.textContent = '上一个';

  const nextBtn = document.createElement('button');
  nextBtn.id = 'next-btn';
  nextBtn.className = 'bg-purple-500 hover:bg-purple-600 text-white px-3 py-2 rounded-lg';
  nextBtn.textContent = '下一个';



  const infoDiv = document.createElement('div');
  infoDiv.id = 'highlight-info';
  infoDiv.className = 'text-xs text-gray-500 ml-2 py-2';
  infoDiv.textContent = '未找到关键词';

  buttonContainer.appendChild(identifyBtn);
  buttonContainer.appendChild(clearBtn);
  buttonContainer.appendChild(prevBtn);
  buttonContainer.appendChild(nextBtn);
  buttonContainer.appendChild(infoDiv);

  content.appendChild(title);
  content.appendChild(keywordColorsContainer);
  content.appendChild(textareaContainer);
  content.appendChild(buttonContainer);
  panel.appendChild(content);

  return panel;
}

// 创建关键词管理面板
function createKeywordManager() {
  const panel = document.createElement('div');
  panel.className = 'h-60 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden flex flex-col';

  const content = document.createElement('div');
  content.className = 'p-6 flex-1 flex flex-col min-h-0';

  const titleContainer = document.createElement('div');
  titleContainer.className = 'mb-4 flex justify-between items-center';

  const title = document.createElement('h2');
  title.className = 'text-xl font-bold text-gray-800';
  title.innerHTML = '关键词管理 (<span id="keyword-count">0</span>个)';

  const syncButton = document.createElement('button');
  syncButton.id = 'sync-btn';
  syncButton.className = 'px-3 py-1 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors';
  syncButton.innerHTML = '🔄 同步';
  syncButton.title = '手动同步到云端';

  titleContainer.appendChild(title);
  titleContainer.appendChild(syncButton);

  const inputContainer = document.createElement('div');
  inputContainer.className = 'mb-4';

  const inputRow = document.createElement('div');
  inputRow.className = 'flex gap-2';

  const input = document.createElement('input');
  input.type = 'text';
  input.id = 'keyword-input';
  input.className = 'flex-1 px-3 py-2 border border-gray-300 rounded-lg';
  input.placeholder = '输入关键词...';

  const addBtn = document.createElement('button');
  addBtn.id = 'add-keyword-btn';
  addBtn.className = 'bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg';
  addBtn.textContent = '添加';

  inputRow.appendChild(input);
  inputRow.appendChild(addBtn);
  inputContainer.appendChild(inputRow);

  const keywordsList = document.createElement('div');
  keywordsList.id = 'keywords-list';
  keywordsList.className = 'flex flex-wrap gap-2 flex-1 overflow-y-auto custom-scrollbar content-start';

  content.appendChild(titleContainer);
  content.appendChild(inputContainer);
  content.appendChild(keywordsList);
  panel.appendChild(content);

  return panel;
}

// 用户ID相关函数已移除 - 系统改为全局共享模式

// 设置事件监听器
function setupEventListeners() {
  // 添加关键词
  document.getElementById('add-keyword-btn').addEventListener('click', addKeyword);

  // 回车键添加关键词
  document.getElementById('keyword-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      addKeyword();
    }
  });

  // 识别关键词
  document.getElementById('identify-btn').addEventListener('click', identifyKeywords);

  // 清除高亮
  document.getElementById('clear-btn').addEventListener('click', clearHighlights);

  // 导航按钮
  document.getElementById('prev-btn').addEventListener('click', () => navigateHighlight(-1));
  document.getElementById('next-btn').addEventListener('click', () => navigateHighlight(1));

  // 同步按钮
  document.getElementById('sync-btn').addEventListener('click', syncToCloud);

  // 文本变化时清除高亮
  document.getElementById('text-input').addEventListener('input', () => {
    if (highlights.length > 0) {
      clearHighlights();
    }
  });

  // 滚动时同步高亮层
  document.getElementById('text-input').addEventListener('scroll', () => {
    const textarea = document.getElementById('text-input');
    const highlightDiv = document.querySelector('.highlight-overlay');
    if (highlightDiv) {
      highlightDiv.scrollTop = textarea.scrollTop;
      highlightDiv.scrollLeft = textarea.scrollLeft;
    }
  });
}

// 添加关键词
async function addKeyword() {
  const input = document.getElementById('keyword-input');
  const keyword = input.value.trim();

  if (!keyword) {
    showMessage('请输入关键词', 'warning');
    return;
  }

  // 检查关键词是否已存在
  if (keywords.some(k => k.text === keyword)) {
    showMessage('关键词已存在', 'warning');
    return;
  }

  // 分配颜色
  const color = KEYWORD_COLORS[colorIndex % KEYWORD_COLORS.length];
  colorIndex++;

  // 添加关键词对象
  keywords.push({
    text: keyword,
    color: color
  });

  input.value = '';
  renderKeywords();
  await saveKeywords();
  showMessage('关键词添加成功', 'success');
}

// 渲染关键词列表
function renderKeywords() {
  const container = document.getElementById('keywords-list');
  const countElement = document.getElementById('keyword-count');

  // 更新计数
  if (countElement) {
    countElement.textContent = keywords.length;
  }

  if (keywords.length === 0) {
    container.innerHTML = '<div class="text-gray-500 text-center py-4 w-full">还没有添加关键词</div>';
    updateKeywordColorsDisplay(); // 更新颜色显示区域
    return;
  }

  container.innerHTML = '';

  keywords.forEach(keywordObj => {
    const tag = document.createElement('div');
    tag.className = 'inline-flex items-center px-3 py-2 rounded-full text-sm font-medium border transition-all hover:shadow-md hover:scale-105 cursor-pointer group';
    tag.style.backgroundColor = keywordObj.color.bg;
    tag.style.color = keywordObj.color.text;
    tag.style.borderColor = keywordObj.color.text + '40'; // 40% opacity
    tag.title = `关键词: ${keywordObj.text} | 颜色: ${keywordObj.color.name}`;

    // 颜色指示器
    const colorIndicator = document.createElement('div');
    colorIndicator.className = 'w-2 h-2 rounded-full mr-2 flex-shrink-0';
    colorIndicator.style.backgroundColor = keywordObj.color.text;

    // 关键词文本
    const span = document.createElement('span');
    span.className = 'font-medium';
    span.textContent = keywordObj.text;

    // 删除按钮
    const button = document.createElement('button');
    button.className = 'ml-2 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-100 rounded-full w-4 h-4 flex items-center justify-center text-xs';
    button.innerHTML = '×';
    button.title = '删除关键词';
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      removeKeyword(keywordObj.text);
    });

    tag.appendChild(colorIndicator);
    tag.appendChild(span);
    tag.appendChild(button);
    container.appendChild(tag);
  });

  // 更新颜色显示区域
  updateKeywordColorsDisplay();
}

// 更新关键词颜色显示区域
function updateKeywordColorsDisplay() {
  const container = document.getElementById('keyword-colors-content');
  if (!container) return;

  if (keywords.length === 0) {
    container.innerHTML = '<div class="text-gray-500 text-sm">暂无关键词</div>';
    return;
  }

  container.innerHTML = '';

  keywords.forEach(keywordObj => {
    const tag = document.createElement('div');
    tag.className = 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border transition-all hover:shadow-sm';
    tag.style.backgroundColor = keywordObj.color.bg;
    tag.style.color = keywordObj.color.text;
    tag.style.borderColor = keywordObj.color.text + '40'; // 40% opacity
    tag.title = `关键词: ${keywordObj.text} | 颜色: ${keywordObj.color.name}`;

    // 颜色点
    const colorDot = document.createElement('div');
    colorDot.className = 'w-2 h-2 rounded-full mr-2 flex-shrink-0';
    colorDot.style.backgroundColor = keywordObj.color.text;

    // 关键词文本
    const text = document.createElement('span');
    text.textContent = keywordObj.text;

    tag.appendChild(colorDot);
    tag.appendChild(text);
    container.appendChild(tag);
  });
}

// 删除关键词
async function removeKeyword(keywordText) {
  keywords = keywords.filter(k => k.text !== keywordText);
  renderKeywords();
  await saveKeywords();
  showMessage('关键词已删除', 'success');
}

// 识别关键词
function identifyKeywords() {
  const textarea = document.getElementById('text-input');
  const text = textarea.value.trim();

  if (!text) {
    showMessage('请先输入文本', 'warning');
    return;
  }

  if (keywords.length === 0) {
    showMessage('请先添加关键词', 'warning');
    return;
  }

  // 清除之前的高亮
  clearHighlights();

  // 查找所有关键词匹配
  highlights = [];
  keywords.forEach(keywordObj => {
    const regex = new RegExp(keywordObj.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    let match;
    while ((match = regex.exec(text)) !== null) {
      highlights.push({
        keyword: keywordObj.text,
        keywordObj: keywordObj, // 保存完整的关键词对象，包含颜色信息
        start: match.index,
        end: match.index + keywordObj.text.length,
        text: match[0]
      });
    }
  });

  // 按位置排序
  highlights.sort((a, b) => a.start - b.start);

  if (highlights.length === 0) {
    showMessage('未找到匹配的关键词', 'info');
    updateHighlightInfo('未找到关键词');
    return;
  }

  // 应用高亮
  applyHighlights(text);
  currentHighlightIndex = 0;
  updateNavigationButtons();
  updateHighlightInfo();
  scrollToCurrentHighlight();

  showMessage('找到 ' + highlights.length + ' 个匹配的关键词', 'success');
}

// 应用高亮显示
function applyHighlights(originalText) {
  const textarea = document.getElementById('text-input');

  // 创建高亮显示层
  const container = textarea.parentNode;
  let highlightDiv = container.querySelector('.highlight-overlay');

  if (!highlightDiv) {
    highlightDiv = document.createElement('div');
    highlightDiv.className = 'highlight-overlay absolute inset-0 p-4 pointer-events-none whitespace-pre-wrap break-words overflow-hidden';
    container.style.position = 'relative';
    container.appendChild(highlightDiv);
  }

  // 同步样式
  const computedStyle = window.getComputedStyle(textarea);
  highlightDiv.style.top = textarea.offsetTop + 'px';
  highlightDiv.style.left = textarea.offsetLeft + 'px';
  highlightDiv.style.width = textarea.offsetWidth + 'px';
  highlightDiv.style.height = textarea.offsetHeight + 'px';
  highlightDiv.style.fontSize = computedStyle.fontSize;
  highlightDiv.style.fontFamily = computedStyle.fontFamily;
  highlightDiv.style.lineHeight = computedStyle.lineHeight;
  highlightDiv.style.padding = computedStyle.padding;
  highlightDiv.style.border = computedStyle.border;
  highlightDiv.style.borderColor = 'transparent'; // 隐藏边框但保持布局

  // 同步滚动位置
  highlightDiv.scrollTop = textarea.scrollTop;
  highlightDiv.scrollLeft = textarea.scrollLeft;

  // 构建高亮文本
  let highlightedText = '';
  let lastIndex = 0;

  highlights.forEach((highlight, index) => {
    // 添加高亮前的普通文本
    highlightedText += escapeHtml(originalText.substring(lastIndex, highlight.start));

    // 添加高亮的关键词，使用对应的颜色
    const isCurrent = index === currentHighlightIndex;
    const color = highlight.keywordObj.color;
    const className = isCurrent ? 'keyword-highlight current' : 'keyword-highlight';
    const style = isCurrent
      ? `background-color: ${color.current}; color: white;`
      : `background-color: ${color.bg}; color: ${color.text};`;

    highlightedText += '<span class="' + className + '" data-highlight-index="' + index + '" style="' + style + '">' +
                      escapeHtml(highlight.text) + '</span>';

    lastIndex = highlight.end;
  });

  // 添加剩余的普通文本
  highlightedText += escapeHtml(originalText.substring(lastIndex));

  highlightDiv.innerHTML = highlightedText;

  // 使textarea文字透明，但保持光标可见
  textarea.style.color = 'transparent';
  textarea.style.caretColor = 'black';
  textarea.style.backgroundColor = 'transparent';
}

// HTML转义函数
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// 清除高亮
function clearHighlights() {
  const textarea = document.getElementById('text-input');
  const highlightDiv = document.querySelector('.highlight-overlay');

  if (highlightDiv) {
    highlightDiv.remove();
  }

  // 重置textarea样式
  textarea.style.color = '';
  textarea.style.caretColor = '';
  textarea.style.backgroundColor = '';

  highlights = [];
  currentHighlightIndex = -1;
  updateNavigationButtons();
  updateHighlightInfo('未找到关键词');
}

// 导航高亮
function navigateHighlight(direction) {
  if (highlights.length === 0) {
    return;
  }

  currentHighlightIndex += direction;

  if (currentHighlightIndex < 0) {
    currentHighlightIndex = highlights.length - 1;
  } else if (currentHighlightIndex >= highlights.length) {
    currentHighlightIndex = 0;
  }

  updateCurrentHighlight();
  updateHighlightInfo();
  scrollToCurrentHighlight();
}

// 更新当前高亮
function updateCurrentHighlight() {
  const highlightDiv = document.querySelector('.highlight-overlay');
  if (!highlightDiv) return;

  // 更新所有高亮的样式
  const spans = highlightDiv.querySelectorAll('span[data-highlight-index]');
  spans.forEach((span, index) => {
    const highlight = highlights[index];
    if (!highlight) return;

    const isCurrent = index === currentHighlightIndex;
    const color = highlight.keywordObj.color;

    span.className = isCurrent ? 'keyword-highlight current' : 'keyword-highlight';
    span.style.backgroundColor = isCurrent ? color.current : color.bg;
    span.style.color = isCurrent ? 'white' : color.text;
  });
}

// 更新高亮信息显示
function updateHighlightInfo(customMessage = null) {
  const infoElement = document.getElementById('highlight-info');

  if (customMessage) {
    infoElement.textContent = customMessage;
    return;
  }

  if (highlights.length === 0) {
    infoElement.textContent = '未找到关键词';
  } else {
    infoElement.textContent = '第 ' + (currentHighlightIndex + 1) + ' 个，共 ' + highlights.length + ' 个';
  }
}

// 滚动到当前高亮
function scrollToCurrentHighlight() {
  const textarea = document.getElementById('text-input');
  const highlight = highlights[currentHighlightIndex];

  if (!highlight) {
    return;
  }

  // 确保textarea获得焦点
  textarea.focus();

  // 使用多种方法确保滚动成功
  requestAnimationFrame(() => {
    // 方法1: 设置选择范围，浏览器通常会自动滚动到选中区域
    textarea.setSelectionRange(highlight.start, highlight.end);

    // 方法2: 手动计算并设置滚动位置
    const text = textarea.value;
    const beforeText = text.substring(0, highlight.start);
    const lines = beforeText.split('\n');
    const lineNumber = lines.length - 1;

    // 获取样式信息
    const computedStyle = window.getComputedStyle(textarea);
    const fontSize = parseFloat(computedStyle.fontSize) || 16;
    const lineHeight = fontSize * 1.6; // 匹配CSS
    const paddingTop = parseFloat(computedStyle.paddingTop) || 0;

    // 计算目标Y位置
    const targetY = lineNumber * lineHeight + paddingTop;
    const textareaHeight = textarea.clientHeight;

    // 计算新的滚动位置（居中显示）
    const newScrollTop = Math.max(0, targetY - textareaHeight / 2);

    // 强制设置滚动位置
    textarea.scrollTop = newScrollTop;

    // 同步高亮层滚动
    const highlightDiv = document.querySelector('.highlight-overlay');
    if (highlightDiv) {
      highlightDiv.scrollTop = newScrollTop;
      highlightDiv.scrollLeft = textarea.scrollLeft;
    }

    // 再次确保选择范围正确
    setTimeout(() => {
      textarea.setSelectionRange(highlight.start, highlight.end);
    }, 50);
  });
}



// 更新导航按钮状态
function updateNavigationButtons() {
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');

  const hasHighlights = highlights.length > 0;
  prevBtn.disabled = !hasHighlights;
  nextBtn.disabled = !hasHighlights;
}

// 显示消息提示
function showMessage(message, type = 'info') {
  const messageDiv = document.createElement('div');
  const config = {
    success: {
      bg: 'bg-green-100 border-green-400 text-green-700',
      icon: '✓'
    },
    error: {
      bg: 'bg-red-100 border-red-400 text-red-700',
      icon: '✗'
    },
    warning: {
      bg: 'bg-yellow-100 border-yellow-400 text-yellow-700',
      icon: '⚠'
    },
    info: {
      bg: 'bg-blue-100 border-blue-400 text-blue-700',
      icon: 'ℹ'
    }
  };

  const typeConfig = config[type] || config.info;

  messageDiv.className = 'fixed top-4 right-4 px-4 py-3 border rounded-lg ' + typeConfig.bg + ' z-50 shadow-lg max-w-sm flex items-center';
  messageDiv.innerHTML = '<span class="mr-2">' + typeConfig.icon + '</span><span>' + message + '</span>';

  document.body.appendChild(messageDiv);

  // 3秒后自动消失
  setTimeout(() => {
    if (messageDiv.parentNode) {
      messageDiv.parentNode.removeChild(messageDiv);
    }
  }, 3000);
}

// 保存关键词到本地存储和云端
async function saveKeywords() {
  try {
    // 保存到本地存储
    localStorage.setItem('keywords', JSON.stringify(keywords));

    // 保存到云端
    try {
      const keywordTexts = keywords.map(k => k.text);
      await apiService.saveKeywords(keywordTexts);
      console.log('关键词已同步到云端');
    } catch (cloudError) {
      console.warn('云端保存失败，但本地保存成功:', cloudError);
      // 不显示错误消息，因为本地保存成功了
    }
  } catch (error) {
    console.error('保存关键词失败:', error);
    showMessage('保存关键词失败', 'error');
  }
}

// 从本地存储加载关键词
function loadKeywordsFromLocal() {
  try {
    const saved = localStorage.getItem('keywords');
    if (!saved) return [];

    const parsed = JSON.parse(saved);

    // 兼容旧版本数据格式（字符串数组）
    if (parsed.length > 0 && typeof parsed[0] === 'string') {
      // 转换为新格式
      return parsed.map((keyword, index) => ({
        text: keyword,
        color: KEYWORD_COLORS[index % KEYWORD_COLORS.length]
      }));
    }

    // 新格式数据，验证颜色对象是否完整
    return parsed.map((item, index) => {
      if (!item.color || !item.color.bg) {
        return {
          text: item.text || item,
          color: KEYWORD_COLORS[index % KEYWORD_COLORS.length]
        };
      }
      return item;
    });
  } catch (error) {
    console.error('加载本地关键词失败:', error);
    return [];
  }
}

// 从云端和本地加载关键词
async function loadKeywords() {
  try {
    // 首先尝试从云端加载
    const cloudKeywords = await apiService.loadKeywords();

    if (cloudKeywords && cloudKeywords.length > 0) {
      console.log('从云端加载了', cloudKeywords.length, '个关键词');

      // 将云端数据转换为本地格式（包含颜色信息）
      const keywordsWithColors = cloudKeywords.map((keyword, index) => ({
        text: keyword,
        color: KEYWORD_COLORS[index % KEYWORD_COLORS.length]
      }));

      // 同步到本地存储
      localStorage.setItem('keywords', JSON.stringify(keywordsWithColors));

      return keywordsWithColors;
    }
  } catch (error) {
    console.warn('从云端加载关键词失败，尝试从本地加载:', error);
  }

  // 如果云端加载失败，从本地加载
  const localKeywords = loadKeywordsFromLocal();
  console.log('从本地加载了', localKeywords.length, '个关键词');

  return localKeywords;
}

// 手动同步到云端
async function syncToCloud() {
  try {
    const syncBtn = document.getElementById('sync-btn');
    const originalText = syncBtn.innerHTML;

    // 显示同步状态
    syncBtn.innerHTML = '🔄 同步中...';
    syncBtn.disabled = true;
    showMessage('正在同步到云端...', 'info');

    const keywordTexts = keywords.map(k => k.text);
    await apiService.saveKeywords(keywordTexts);

    showMessage('同步到云端成功', 'success');

    // 恢复按钮状态
    syncBtn.innerHTML = originalText;
    syncBtn.disabled = false;
  } catch (error) {
    console.error('同步失败:', error);
    showMessage('同步到云端失败', 'error');

    // 恢复按钮状态
    const syncBtn = document.getElementById('sync-btn');
    syncBtn.innerHTML = '🔄 同步';
    syncBtn.disabled = false;
  }
}

// 初始化应用
async function initApp() {
  try {
    // 显示加载状态
    showMessage('正在加载关键词...', 'info');

    keywords = await loadKeywords();
    renderKeywords();
    setupEventListeners();

    // 隐藏加载消息
    if (keywords.length > 0) {
      showMessage(`已加载 ${keywords.length} 个关键词`, 'success');
    }
  } catch (error) {
    console.error('初始化应用失败:', error);
    showMessage('初始化失败，请刷新页面重试', 'error');
  }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', async () => {
  initializeApp();
  await initApp();
});
