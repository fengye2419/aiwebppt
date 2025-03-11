<script setup>
import { onMounted, ref, watch, computed, nextTick, onUnmounted } from 'vue';
import Reveal from 'reveal.js';
import RevealHighlight from 'reveal.js/plugin/highlight/highlight';
import 'reveal.js/dist/reveal.css';
import 'reveal.js/dist/theme/white.css';
import 'reveal.js/plugin/highlight/monokai.css';
import pptxgen from 'pptxgenjs';

const deckRefs = ref([]);
const revealInstances = ref([]);
const currentSlideIndex = ref(0);
const slides = ref([
  {
    type: 'title',
    title: 'AI Web PPT',
    subtitle: '基于Reveal.js的智能幻灯片',
    author: 'Your Name'
  },
  {
    type: 'bullets',
    title: '功能特点',
    content: [
      '简洁美观的界面',
      '支持Markdown语法',
      '支持代码高亮',
      '支持幻灯片切换动画',
      '支持演讲者模式'
    ]
  },
  {
    type: 'code',
    title: '代码示例',
    content: 'function example() {\n  console.log(\'Hello, world!\');\n}'
  },
  {
    type: 'normal',
    title: '垂直幻灯片',
    content: '按下键盘上的向下箭头查看更多内容'
  },
  {
    type: 'normal',
    title: '垂直幻灯片 - 子页面',
    content: '这是一个垂直方向的子幻灯片',
    isVertical: true
  },
  {
    type: 'normal',
    title: '谢谢观看',
    content: '更多信息请访问 <a href="https://revealjs.com">reveal.js</a>'
  }
]);

const scrollContainer = ref(null);
const isScrolling = ref(false);

// 添加全屏演示状态
const isPresenting = ref(false);

// 计算实际显示的幻灯片（处理垂直幻灯片）
const flattenedSlides = computed(() => {
  const result = [];
  for (let i = 0; i < slides.value.length; i++) {
    if (!slides.value[i].isVertical || (i > 0 && !slides.value[i-1].isVertical)) {
      result.push(slides.value[i]);
    }
  }
  return result;
});

function addSlide(slideData) {
  slides.value.push(slideData);
  
  // 在下一个事件循环中重新初始化reveal
  setTimeout(() => {
    if (revealInstances.value) {
      revealInstances.value.forEach(instance => {
        instance.sync();
      });
    }
    // 滚动到新添加的幻灯片
    scrollToSlide(flattenedSlides.value.length - 1);
  }, 100);
}

function scrollToSlide(index) {
  if (index < 0 || index >= flattenedSlides.value.length) return;
  
  // 更新当前索引
  currentSlideIndex.value = index;
  
  // 滚动到对应幻灯片
  const targetSlide = document.getElementById(`slide-${index}`);
  if (targetSlide) {
    // 标记正在滚动，防止handleScroll干扰
    isScrolling.value = true;
    
    // 使用scrollIntoView滚动到目标幻灯片
    targetSlide.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    console.log(`滚动到幻灯片 ${index}`);
    
    // 延迟重置滚动标记
    setTimeout(() => {
      isScrolling.value = false;
    }, 800); // 延长时间以适应平滑滚动
  }
  
  // 同步缩略图选中状态
  highlightThumbnail(index);
}

function highlightThumbnail(index) {
  const thumbnails = document.querySelectorAll('.thumbnail');
  thumbnails.forEach((thumb, i) => {
    if (i === index) {
      thumb.classList.add('active');
    } else {
      thumb.classList.remove('active');
    }
  });
}

function handleScroll() {
  if (isScrolling.value) return;
  
  const container = scrollContainer.value;
  const scrollPosition = container.scrollTop;
  const containerHeight = container.clientHeight;
  
  // 计算当前应该显示哪个幻灯片
  const slidePages = document.querySelectorAll('.slide-page');
  let currentIndex = 0;
  
  for (let i = 0; i < slidePages.length; i++) {
    const slidePage = slidePages[i];
    const slideTop = slidePage.offsetTop;
    const slideBottom = slideTop + slidePage.offsetHeight;
    
    // 如果滚动位置在当前幻灯片的范围内，则更新索引
    if (scrollPosition >= slideTop - containerHeight / 2 && 
        scrollPosition < slideBottom - containerHeight / 2) {
      currentIndex = i;
      break;
    }
  }
  
  if (currentIndex !== currentSlideIndex.value) {
    currentSlideIndex.value = currentIndex;
    highlightThumbnail(currentIndex);
    console.log(`滚动切换到幻灯片 ${currentIndex}`);
  }
}

function handleThumbnailClick(index) {
  if (index === currentSlideIndex.value) return; // 避免重复点击
  scrollToSlide(index);
}

function renderSlideContent(slide) {
  if (slide.type === 'title') {
    return `
      <h1>${slide.title}</h1>
      <h3>${slide.subtitle || ''}</h3>
      ${slide.author ? `<p><small>Created by ${slide.author}</small></p>` : ''}
    `;
  } else if (slide.type === 'normal') {
    return `
      <h2>${slide.title}</h2>
      <p>${slide.content || ''}</p>
    `;
  } else if (slide.type === 'code') {
    // 对代码内容进行HTML转义，避免在缩略图中解析HTML
    const escapedCode = (slide.content || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
    
    return `
      <h2>${slide.title}</h2>
      <pre><code>${escapedCode}</code></pre>
    `;
  } else if (slide.type === 'bullets') {
    const listItems = Array.isArray(slide.content) 
      ? slide.content.map(item => `<li>${item}</li>`).join('') 
      : '';
    return `
      <h2>${slide.title}</h2>
      <ul>${listItems}</ul>
    `;
  }
  return '';
}

// 监听currentSlideIndex变化
watch(currentSlideIndex, (newIndex) => {
  // 确保DOM已更新
  nextTick(() => {
    // 高亮对应的缩略图
    highlightThumbnail(newIndex);
  });
});

// 处理键盘事件
function handleKeyDown(event) {
  // 上下左右键导航
  if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
    // 下一张幻灯片
    if (currentSlideIndex.value < flattenedSlides.value.length - 1) {
      scrollToSlide(currentSlideIndex.value + 1);
    }
  } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
    // 上一张幻灯片
    if (currentSlideIndex.value > 0) {
      scrollToSlide(currentSlideIndex.value - 1);
    }
  } else if (event.key === 'Home') {
    // 第一张幻灯片
    scrollToSlide(0);
  } else if (event.key === 'End') {
    // 最后一张幻灯片
    scrollToSlide(flattenedSlides.value.length - 1);
  }
}

// 初始化所有幻灯片的Reveal实例
function initializeRevealInstances() {
  // 清除旧实例
  revealInstances.value.forEach(instance => {
    try {
      instance.destroy();
    } catch (e) {
      console.error('销毁Reveal实例失败:', e);
    }
  });
  revealInstances.value = [];
  
  // 获取所有幻灯片容器
  const slideContainers = document.querySelectorAll('.reveal-container');
  
  // 为每个容器创建Reveal实例
  slideContainers.forEach((container, index) => {
    try {
      const instance = new Reveal(container, {
        controls: false,
        progress: false,
        center: true,
        hash: false,
        transition: 'none',
        plugins: [RevealHighlight],
        embedded: true, // 嵌入模式
        margin: 0,
        width: '100%',
        height: '100%',
        disableLayout: true, // 禁用默认布局
        display: 'block' // 使用块级显示
      });
      
      instance.initialize();
      revealInstances.value.push(instance);
    } catch (e) {
      console.error(`初始化第${index+1}个Reveal实例失败:`, e);
    }
  });
}

// 初始化代码高亮
function initializeCodeHighlight() {
  // 查找所有代码块
  const codeBlocks = document.querySelectorAll('pre code');
  
  // 应用高亮
  if (codeBlocks.length > 0) {
    try {
      // 使用Reveal.js的高亮插件
      RevealHighlight.init();
      
      // 或者直接使用highlight.js (如果可用)
      if (window.hljs) {
        codeBlocks.forEach(block => {
          window.hljs.highlightBlock(block);
        });
      }
    } catch (e) {
      console.error('代码高亮初始化失败:', e);
    }
  }
}

// 切换全屏演示模式
function togglePresentation() {
  isPresenting.value = !isPresenting.value;
  
  if (isPresenting.value) {
    // 进入全屏模式
    const presentationElement = document.getElementById('presentation-container');
    if (presentationElement && presentationElement.requestFullscreen) {
      presentationElement.requestFullscreen().catch(err => {
        console.error(`全屏请求失败: ${err.message}`);
      });
    }
    
    // 滚动到当前幻灯片
    scrollToSlide(currentSlideIndex.value);
  } else {
    // 退出全屏模式
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(err => {
        console.error(`退出全屏失败: ${err.message}`);
      });
    }
  }
}

// 下载当前PPT
function downloadPresentation() {
  try {
    // 创建一个新的PPT实例
    const pptx = new pptxgen();
    
    // 设置PPT属性
    pptx.title = 'AI Web PPT';
    pptx.subject = '基于Reveal.js的智能幻灯片';
    pptx.author = 'AI Web PPT';
    
    // 遍历所有幻灯片并添加到PPT中
    slides.value.forEach((slide, index) => {
      // 创建新的幻灯片
      const pptSlide = pptx.addSlide();
      
      // 根据幻灯片类型设置内容
      if (slide.type === 'title') {
        // 标题幻灯片
        pptSlide.addText(slide.title, { 
          x: 1, 
          y: 1, 
          w: '80%', 
          h: 1.5, 
          fontSize: 44, 
          color: '363636', 
          bold: true,
          align: 'center' 
        });
        
        if (slide.subtitle) {
          pptSlide.addText(slide.subtitle, { 
            x: 1, 
            y: 3, 
            w: '80%', 
            h: 1, 
            fontSize: 28, 
            color: '666666',
            align: 'center' 
          });
        }
        
        if (slide.author) {
          pptSlide.addText(`Created by ${slide.author}`, { 
            x: 1, 
            y: 5, 
            w: '80%', 
            h: 0.5, 
            fontSize: 14, 
            color: '999999',
            align: 'center',
            italic: true
          });
        }
      } else if (slide.type === 'bullets') {
        // 列表幻灯片
        pptSlide.addText(slide.title, { 
          x: 0.5, 
          y: 0.5, 
          w: '90%', 
          h: 1, 
          fontSize: 32, 
          color: '363636', 
          bold: true 
        });
        
        // 添加列表项
        if (Array.isArray(slide.content)) {
          const bulletPoints = slide.content.map(item => ({ text: item }));
          pptSlide.addText(bulletPoints, { 
            x: 0.5, 
            y: 1.8, 
            w: '90%', 
            h: 4, 
            fontSize: 20, 
            color: '666666', 
            bullet: true 
          });
        }
      } else if (slide.type === 'code') {
        // 代码幻灯片
        pptSlide.addText(slide.title, { 
          x: 0.5, 
          y: 0.5, 
          w: '90%', 
          h: 1, 
          fontSize: 32, 
          color: '363636', 
          bold: true 
        });
        
        // 添加代码块
        pptSlide.addText(slide.content || '', { 
          x: 0.5, 
          y: 1.8, 
          w: '90%', 
          h: 4, 
          fontSize: 16, 
          fontFace: 'Courier New',
          color: '333333',
          fill: { color: 'F5F5F5' }
        });
      } else {
        // 普通幻灯片
        pptSlide.addText(slide.title, { 
          x: 0.5, 
          y: 0.5, 
          w: '90%', 
          h: 1, 
          fontSize: 32, 
          color: '363636', 
          bold: true 
        });
        
        // 添加内容（可能包含HTML标签）
        const content = slide.content || '';
        // 简单处理HTML标签，实际应用中可能需要更复杂的HTML解析
        const plainContent = content.replace(/<[^>]*>/g, '');
        
        pptSlide.addText(plainContent, { 
          x: 0.5, 
          y: 1.8, 
          w: '90%', 
          h: 4, 
          fontSize: 20, 
          color: '666666' 
        });
      }
    });
    
    // 保存PPT文件
    pptx.writeFile({ fileName: 'AI_Web_PPT.pptx' });
    
    console.log('PPT下载成功');
  } catch (error) {
    console.error('生成PPT时出错:', error);
    alert('生成PPT时出错，请查看控制台获取详细信息');
  }
}

// 监听全屏变化事件
function handleFullscreenChange() {
  if (!document.fullscreenElement) {
    isPresenting.value = false;
  }
}

onMounted(() => {
  // 初始化滚动事件监听
  if (scrollContainer.value) {
    scrollContainer.value.addEventListener('scroll', handleScroll);
    
    // 确保初始时滚动到第一张幻灯片
    setTimeout(() => {
      scrollToSlide(0);
    }, 100);
  }
  
  // 初始化缩略图高亮
  setTimeout(() => {
    highlightThumbnail(0);
  }, 100);
  
  // 添加键盘事件监听
  window.addEventListener('keydown', handleKeyDown);
  
  // 初始化所有Reveal实例
  nextTick(() => {
    setTimeout(() => {
      initializeRevealInstances();
    }, 200);
  });
  
  // 初始化代码高亮
  nextTick(() => {
    setTimeout(() => {
      initializeCodeHighlight();
    }, 200);
  });
  
  // 添加全屏变化事件监听
  document.addEventListener('fullscreenchange', handleFullscreenChange);
});

// 监听幻灯片数据变化，重新初始化Reveal实例和代码高亮
watch(slides, () => {
  nextTick(() => {
    setTimeout(() => {
      initializeRevealInstances();
      initializeCodeHighlight();
    }, 200);
  });
}, { deep: true });

// 监听currentSlideIndex变化，确保当前幻灯片的代码高亮
watch(currentSlideIndex, () => {
  nextTick(() => {
    setTimeout(() => {
      initializeCodeHighlight();
    }, 100);
  });
});

// 组件卸载时移除事件监听
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
  if (scrollContainer.value) {
    scrollContainer.value.removeEventListener('scroll', handleScroll);
  }
  
  // 移除全屏变化事件监听
  document.removeEventListener('fullscreenchange', handleFullscreenChange);
});
</script>

<template>
  <div class="presentation-container" id="presentation-container" :class="{ 'presenting-mode': isPresenting }">
    <!-- 顶部功能区 -->
    <div class="function-area" v-if="!isPresenting">
      <div class="function-content">
        <h1 class="app-title">AI Web PPT</h1>
        <div class="function-buttons">
          <button class="present-button" @click="togglePresentation">
            <span class="button-icon">▶</span> 演示
          </button>
          <button class="download-button" @click="downloadPresentation">
            <span class="button-icon">↓</span> 下载
          </button>
        </div>
      </div>
    </div>
    
    <!-- 主要内容区域 -->
    <div class="main-content" :class="{ 'with-function-area': !isPresenting }">
      <!-- 左侧缩略图区域 -->
      <div class="thumbnails-panel" v-if="!isPresenting">
        <div class="thumbnails-header">幻灯片缩略图</div>
        <div 
          v-for="(slide, index) in flattenedSlides" 
          :key="index"
          class="thumbnail"
          :class="{ active: index === currentSlideIndex }"
          @click="handleThumbnailClick(index)"
        >
          <div class="thumbnail-content" v-html="renderSlideContent(slide)"></div>
          <div class="thumbnail-number">{{ index + 1 }}</div>
        </div>
      </div>
      
      <!-- 右侧幻灯片区域 -->
      <div class="slides-container" ref="scrollContainer">
        <div 
          v-for="(slide, index) in flattenedSlides" 
          :key="index"
          class="slide-page"
          :id="`slide-${index}`"
        >
          <div 
            class="slide-content"
            :class="{ 'title-slide': slide.type === 'title' }"
          >
            <!-- 标题幻灯片 -->
            <template v-if="slide.type === 'title'">
              <h1>{{ slide.title }}</h1>
              <h3>{{ slide.subtitle }}</h3>
              <p v-if="slide.author">
                <small>Created by <a href="#">{{ slide.author }}</a></small>
              </p>
            </template>
            
            <!-- 普通幻灯片 -->
            <template v-else-if="slide.type === 'normal'">
              <h2>{{ slide.title }}</h2>
              <p v-html="slide.content"></p>
            </template>
            
            <!-- 代码幻灯片 -->
            <template v-else-if="slide.type === 'code'">
              <h2>{{ slide.title }}</h2>
              <pre><code class="language-javascript">{{ slide.content }}</code></pre>
            </template>
            
            <!-- 列表幻灯片 -->
            <template v-else-if="slide.type === 'bullets'">
              <h2>{{ slide.title }}</h2>
              <ul>
                <li v-for="(item, i) in slide.content" :key="i">{{ item }}</li>
              </ul>
            </template>
          </div>
        </div>
        
        <!-- 导航按钮 - 移动到右侧内容区域内 -->
        <div class="navigation-buttons" v-if="flattenedSlides.length > 1">
          <button 
            class="nav-button prev" 
            @click="currentSlideIndex > 0 && scrollToSlide(currentSlideIndex - 1)"
            :disabled="currentSlideIndex === 0"
          >
            &#9664;
          </button>
          <div class="slide-counter">{{ currentSlideIndex + 1 }} / {{ flattenedSlides.length }}</div>
          <button 
            class="nav-button next" 
            @click="currentSlideIndex < flattenedSlides.length - 1 && scrollToSlide(currentSlideIndex + 1)"
            :disabled="currentSlideIndex === flattenedSlides.length - 1"
          >
            &#9654;
          </button>
        </div>
      </div>
    </div>
    
    <!-- 演示模式退出按钮 -->
    <div class="exit-presentation" v-if="isPresenting" @click="togglePresentation">
      <span class="exit-icon">✕</span> 退出演示
    </div>
    
    <!-- 固定导航按钮 -->
    <div class="fixed-navigation-buttons" v-if="flattenedSlides.length > 1 && !isPresenting">
      <button 
        class="nav-button prev" 
        @click="currentSlideIndex > 0 && scrollToSlide(currentSlideIndex - 1)"
        :disabled="currentSlideIndex === 0"
      >
        &#9664;
      </button>
      <div class="slide-counter">{{ currentSlideIndex + 1 }} / {{ flattenedSlides.length }}</div>
      <button 
        class="nav-button next" 
        @click="currentSlideIndex < flattenedSlides.length - 1 && scrollToSlide(currentSlideIndex + 1)"
        :disabled="currentSlideIndex === flattenedSlides.length - 1"
      >
        &#9654;
      </button>
    </div>
  </div>
</template>

<style scoped>
.presentation-container {
  position: relative;
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: #fff;
}

/* 顶部功能区 */
.function-area {
  height: 60px;
  width: 100%;
  background: linear-gradient(135deg, #4285f4 0%, #34a853 100%);
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0,0,0,0.2);
  z-index: 20;
  flex-shrink: 0;
  position: relative; /* 添加相对定位 */
}

.function-content {
  width: 100%;
  max-width: 1400px;
  padding: 0 20px;
  display: flex;
  justify-content: flex-end; /* 改为右对齐 */
  align-items: center;
}

.app-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  position: absolute;
  top: 18px; /* 调整垂直位置 */
  left: 20px;
}

.function-buttons {
  display: flex;
  gap: 10px;
  margin-left: auto; /* 确保按钮靠右 */
}

.present-button {
  background-color: #fff;
  color: #4285f4;
  border: none;
  border-radius: 20px;
  padding: 6px 15px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
}

.present-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}

.download-button {
  background-color: #fff;
  color: #34a853;
  border: none;
  border-radius: 20px;
  padding: 6px 15px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
}

.download-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}

.button-icon {
  font-size: 0.9rem;
}

/* 主要内容区域 */
.main-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.main-content.with-function-area {
  height: calc(100vh - 60px);
}

/* 左侧缩略图面板 */
.thumbnails-panel {
  width: 250px;
  height: 100%;
  overflow-y: auto;
  background-color: #f0f0f0;
  border-right: 1px solid #ddd;
  padding: 10px;
  box-sizing: border-box;
  flex-shrink: 0;
  box-shadow: 2px 0 5px rgba(0,0,0,0.05);
  z-index: 10;
}

.thumbnail {
  width: 100%;
  height: 150px;
  margin-bottom: 15px;
  border: 1px solid #ccc;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  position: relative;
  background-color: white;
  transition: all 0.2s ease;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  user-select: none;
  -webkit-tap-highlight-color: transparent; /* 移除移动设备上的点击高亮 */
}

.thumbnail:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.thumbnail:active {
  transform: scale(0.98);
}

.thumbnail.active {
  border: 2px solid #4285f4;
  box-shadow: 0 0 10px rgba(66, 133, 244, 0.5);
  position: relative;
}

.thumbnail.active::after {
  content: '';
  position: absolute;
  right: -10px;
  top: 50%;
  transform: translateY(-50%);
  border-top: 10px solid transparent;
  border-bottom: 10px solid transparent;
  border-left: 10px solid #4285f4;
  display: none;
}

@media (min-width: 768px) {
  .thumbnail.active::after {
    display: block;
  }
}

.thumbnail-content {
  width: 100%;
  height: 100%;
  padding: 5px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  transform: scale(0.25);
  transform-origin: center;
  pointer-events: none;
}

.thumbnail-content h1, 
.thumbnail-content h2, 
.thumbnail-content h3 {
  margin: 0;
  text-align: center;
  font-size: 60px;
}

.thumbnail-content h3 {
  font-size: 40px;
}

.thumbnail-content p, 
.thumbnail-content ul, 
.thumbnail-content pre {
  margin: 10px 0;
}

.thumbnail-number {
  position: absolute;
  bottom: 5px;
  right: 5px;
  background-color: rgba(0,0,0,0.5);
  color: white;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 12px;
}

/* 右侧幻灯片区域 */
.slides-container {
  flex: 1;
  height: 100%;
  overflow-y: auto;
  background-color: #f9f9f9;
  position: relative;
  scroll-snap-type: y mandatory; /* 启用滚动捕捉 */
  scroll-behavior: smooth; /* 平滑滚动 */
}

.slide-page {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f9f9f9;
  position: relative;
  box-sizing: border-box;
  padding: 20px;
  scroll-snap-align: start; /* 滚动捕捉对齐 */
  scroll-snap-stop: always; /* 总是停止在捕捉点 */
}

.presenting-mode .slide-page {
  height: 100vh; /* 演示模式下设置为视口高度 */
}

.slide-content {
  width: 90%;
  max-width: 1200px;
  height: auto;
  max-height: 85vh; /* 限制最大高度 */
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 30px;
  box-sizing: border-box;
  position: relative;
  overflow: auto; /* 允许内容过多时滚动 */
  transition: all 0.3s ease;
}

/* 幻灯片内容样式 */
.slide-content h1 {
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
  color: #333;
  text-align: center;
  font-weight: 600;
  width: 100%;
}

.slide-content h2 {
  font-size: 2rem;
  margin-bottom: 2rem;
  color: #333;
  text-align: center;
  font-weight: 600;
  width: 100%;
}

.slide-content h3 {
  font-size: 1.5rem;
  margin-bottom: 2rem;
  color: #666;
  text-align: center;
  font-weight: 500;
  width: 100%;
}

.slide-content p {
  font-size: 1.2rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
  color: #444;
  text-align: center;
  width: 100%;
}

.slide-content ul {
  font-size: 1.2rem;
  line-height: 1.6;
  margin: 1.5rem 0;
  padding-left: 2rem;
  text-align: left;
  width: 90%;
  max-width: 800px;
}

.slide-content li {
  margin-bottom: 0.8rem;
  color: #444;
  position: relative;
}

.slide-content li::before {
  content: '•';
  color: #4285f4;
  font-weight: bold;
  display: inline-block;
  width: 1em;
  margin-left: -1em;
}

.slide-content pre {
  width: 90%;
  max-width: 800px;
  background-color: #f5f5f5;
  padding: 1.2rem;
  border-radius: 8px;
  overflow: auto;
  margin: 1.2rem 0;
  box-shadow: inset 0 0 5px rgba(0,0,0,0.1);
}

.slide-content code {
  font-family: 'Fira Code', 'Courier New', Courier, monospace;
  font-size: 1rem;
  line-height: 1.5;
}

.slide-content small {
  font-size: 1rem;
  color: #777;
}

.thumbnails-header {
  font-weight: bold;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ddd;
  text-align: center;
  color: #333;
}

/* 导航按钮 */
.navigation-buttons {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.7);
  padding: 5px 10px;
  border-radius: 20px;
  z-index: 1000;
  box-shadow: 0 2px 10px rgba(0,0,0,0.2);
  display: none; /* 隐藏原导航按钮 */
}

/* 固定导航按钮 */
.fixed-navigation-buttons {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.7);
  padding: 5px 10px;
  border-radius: 20px;
  z-index: 1000;
  box-shadow: 0 2px 10px rgba(0,0,0,0.2);
}

.nav-button {
  background: none;
  border: none;
  color: white;
  font-size: 16px;
  cursor: pointer;
  padding: 5px 10px;
  transition: all 0.2s;
}

.nav-button:hover:not(:disabled) {
  transform: scale(1.2);
}

.nav-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.slide-counter {
  color: white;
  margin: 0 10px;
  font-size: 14px;
}

/* 缩略图内容样式调整 */
.thumbnail-content pre,
.thumbnail-content code {
  width: 100%;
  max-width: 300px;
  font-size: 40px;
  background-color: #f5f5f5;
  border-radius: 4px;
  padding: 10px;
  margin: 5px 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

/* 确保代码高亮样式正确显示 */
:deep(.hljs) {
  background: transparent;
  padding: 0;
}

:deep(.hljs-keyword),
:deep(.hljs-function) {
  color: #0000ff;
}

:deep(.hljs-string) {
  color: #a31515;
}

:deep(.hljs-comment) {
  color: #008000;
}

:deep(.hljs-number) {
  color: #098658;
}

/* 标题幻灯片特殊样式 */
.title-slide {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  justify-content: center;
  min-height: 60vh; /* 为标题幻灯片保留最小高度 */
  padding: 50px 40px; /* 增加内边距 */
}

/* 响应式调整 */
@media (max-width: 768px) {
  .thumbnails-panel {
    width: 180px;
  }
  
  .slide-content h1 {
    font-size: 2rem;
  }
  
  .slide-content h2 {
    font-size: 1.8rem;
  }
  
  .slide-content h3 {
    font-size: 1.3rem;
  }
  
  .slide-content p, 
  .slide-content ul,
  .slide-content li {
    font-size: 1rem;
  }
  
  .slide-content pre,
  .slide-content code {
    font-size: 0.9rem;
  }
}

/* 演示模式样式 */
.presenting-mode {
  background-color: #000;
}

.presenting-mode .slides-container {
  width: 100vw;
  height: 100vh;
}

.exit-presentation {
  position: fixed;
  top: 20px;
  right: 20px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 10px 20px;
  border-radius: 30px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 2000;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.exit-presentation:hover {
  background-color: rgba(0, 0, 0, 0.9);
  transform: translateY(-2px);
}

.exit-icon {
  font-size: 1.2rem;
}
</style> 