<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const markdownContent = ref('');
const showBackToTop = ref(false);

// 示例Markdown内容
const exampleMarkdown = `# AI Web PPT 演示
## 基于Markdown的智能幻灯片
### 作者：AI Web PPT

---

# 使用说明

* 使用 Markdown 语法编写内容
* 使用 --- 作为幻灯片分隔符（确保分隔符前后各有一个空行）
* 每个幻灯片以 # 标题 开始
* 支持代码高亮显示
* 支持列表和其他Markdown格式

---

# 代码示例

下面是一个JavaScript代码示例：

\`\`\`javascript
function hello() {
  console.log("Hello, AI Web PPT!");
  return "欢迎使用智能幻灯片";
}
\`\`\`

---

# 列表演示

* 第一项：简单易用
* 第二项：美观大方
* 第三项：功能强大
* 第四项：支持导出

---

# 谢谢观看

更多信息请访问我们的网站
`;

function submitMarkdown() {
  if (!markdownContent.value.trim()) {
    alert('请先输入Markdown内容');
    return;
  }
  
  try {
    // 保存到localStorage
    localStorage.setItem('aiwebppt-markdown-content', markdownContent.value);
    
    // 调试信息
    console.log('提交的Markdown内容:', markdownContent.value);
    console.log('localStorage中的内容:', localStorage.getItem('aiwebppt-markdown-content'));
    
    // 跳转到演示页面
    router.push('/presentation');
  } catch (error) {
    console.error('保存Markdown内容时出错:', error);
    alert('保存内容时出错，请重试');
  }
}

function loadExample() {
  markdownContent.value = exampleMarkdown;
}

function clearContent() {
  markdownContent.value = '';
  localStorage.removeItem('aiwebppt-markdown-content');
  console.log('已清空内容和localStorage');
}

function checkLocalStorage() {
  const content = localStorage.getItem('aiwebppt-markdown-content');
  console.log('localStorage中的内容:', content);
  alert('localStorage中的内容已输出到控制台');
}

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

function handleScroll() {
  showBackToTop.value = window.scrollY > 300;
}

onMounted(() => {
  // 检查是否有保存的内容
  const savedContent = localStorage.getItem('aiwebppt-markdown-content');
  if (savedContent) {
    markdownContent.value = savedContent;
  }
  
  // 添加滚动事件监听
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  // 移除滚动事件监听
  window.removeEventListener('scroll', handleScroll);
});
</script>

<template>
  <div class="markdown-input-container">
    <h1>AI Web PPT - Markdown编辑器</h1>
    
    <div class="instructions">
      <h2>使用说明</h2>
      <ul>
        <li>使用Markdown语法编写幻灯片内容</li>
        <li>使用 <code>---</code> 作为幻灯片分隔符（<strong>重要：确保分隔符前后各有一个空行</strong>）</li>
        <li>每个幻灯片以 <code># 标题</code> 开始</li>
        <li>支持代码块、列表和其他Markdown格式</li>
      </ul>
      <div class="example-format">
        <h3>正确的格式示例：</h3>
        <pre>
# 第一张幻灯片

内容...

---

# 第二张幻灯片

内容...
        </pre>
      </div>
      <div class="example-buttons">
        <button @click="loadExample" class="example-button">加载示例</button>
        <button @click="clearContent" class="clear-button">清空内容</button>
        <button @click="checkLocalStorage" class="debug-button">检查存储</button>
      </div>
    </div>
    
    <div class="input-area">
      <textarea 
        v-model="markdownContent" 
        placeholder="请输入 Markdown 格式的演示内容..." 
        rows="20"
      ></textarea>
    </div>
    
    <!-- 固定在底部的按钮区域 -->
    <div class="button-area">
      <button @click="submitMarkdown" class="submit-button">
        <span class="button-icon">▶</span> 生成演示文稿
      </button>
    </div>
    
    <!-- 返回顶部按钮 -->
    <div v-if="showBackToTop" class="back-to-top" @click="scrollToTop">
      <span class="back-to-top-icon">↑</span>
    </div>
  </div>
</template>

<style scoped>
.markdown-input-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  padding-bottom: 30px; /* 减小底部填充，不再需要为固定按钮留出那么多空间 */
  height: auto;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  text-align: center; /* 添加此属性使内容居中 */
}

h1 {
  text-align: center;
  color: #4285f4;
  margin-bottom: 20px;
}

.instructions {
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 15px 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.instructions h2 {
  color: #333;
  font-size: 1.3rem;
  margin-top: 0;
  margin-bottom: 10px;
}

.instructions ul {
  margin: 0;
  padding-left: 20px;
}

.instructions li {
  margin-bottom: 8px;
  color: #555;
}

.instructions code {
  background-color: #e8e8e8;
  padding: 2px 5px;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
}

.example-buttons {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.example-button {
  background-color: #4285f4;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 15px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.example-button:hover {
  background-color: #3367d6;
}

.clear-button {
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 15px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.clear-button:hover {
  background-color: #d32f2f;
}

.debug-button {
  background-color: #9e9e9e;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 15px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.debug-button:hover {
  background-color: #757575;
}

.input-area {
  flex: 1;
  margin-bottom: 20px;
  min-height: 300px;
  max-height: 50vh;
  display: flex;
  flex-direction: column;
}

textarea {
  width: 100%;
  height: 100%;
  min-height: 300px;
  max-height: 50vh;
  padding: 15px;
  font-size: 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  resize: none;
  font-family: 'Courier New', Courier, monospace;
  outline: none;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
  line-height: 1.5;
  overflow-y: auto;
}

textarea:focus {
  border-color: #4285f4;
  box-shadow: 0 2px 15px rgba(66, 133, 244, 0.2);
}

.button-area {
  display: flex;
  justify-content: center;
  margin: 30px 0;
}

.submit-button {
  background: linear-gradient(135deg, #4285f4 0%, #34a853 100%);
  color: white;
  border: none;
  border-radius: 30px;
  padding: 15px 40px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0,0,0,0.2);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 250px;
}

.button-icon {
  font-size: 20px;
}

.submit-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(0,0,0,0.25);
}

.submit-button:active {
  transform: translateY(1px);
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
}

@media (max-width: 768px) {
  .markdown-input-container {
    padding: 15px;
  }
  
  h1 {
    font-size: 1.8rem;
  }
  
  .instructions h2 {
    font-size: 1.2rem;
  }
  
  .instructions li {
    font-size: 0.9rem;
  }
  
  textarea {
    font-size: 14px;
  }
  
  .submit-button {
    font-size: 16px;
    padding: 10px 25px;
  }
}

.example-format {
  background-color: #f8f8f8;
  border-radius: 4px;
  padding: 10px;
  margin: 15px 0;
  border-left: 3px solid #4285f4;
}

.example-format h3 {
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 1rem;
  color: #333;
}

.example-format pre {
  margin: 0;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  line-height: 1.4;
  color: #444;
  white-space: pre-wrap;
}

.back-to-top {
  position: fixed;
  bottom: 90px;
  right: 30px;
  width: 50px;
  height: 50px;
  background-color: rgba(66, 133, 244, 0.8);
  color: white;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(0,0,0,0.2);
  transition: all 0.3s ease;
  z-index: 100;
}

.back-to-top:hover {
  background-color: rgba(66, 133, 244, 1);
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
}

.back-to-top-icon {
  font-size: 24px;
  font-weight: bold;
}
</style>