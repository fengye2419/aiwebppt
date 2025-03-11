<script setup>
import { ref } from 'vue';

const emit = defineEmits(['addSlide']);

const slideTitle = ref('');
const slideContent = ref('');
const slideType = ref('normal'); // normal, code, bullets
const isVertical = ref(false);

function addSlide() {
  if (!slideTitle.value.trim()) {
    alert('请输入幻灯片标题');
    return;
  }
  
  let content = slideContent.value;
  
  // 如果是列表类型，将文本转换为数组
  if (slideType.value === 'bullets' && content) {
    content = content.split('\n').filter(line => line.trim());
  }
  
  emit('addSlide', {
    type: slideType.value,
    title: slideTitle.value,
    content: content,
    isVertical: isVertical.value
  });
  
  // 重置表单
  slideTitle.value = '';
  slideContent.value = '';
  slideType.value = 'normal';
  isVertical.value = false;
}
</script>

<template>
  <div class="slide-controls">
    <h3>添加新幻灯片</h3>
    
    <div class="form-group">
      <label for="slide-type">幻灯片类型</label>
      <select id="slide-type" v-model="slideType">
        <option value="normal">普通</option>
        <option value="code">代码</option>
        <option value="bullets">列表</option>
        <option value="title">标题</option>
      </select>
    </div>
    
    <div class="form-group">
      <label for="slide-title">标题</label>
      <input id="slide-title" type="text" v-model="slideTitle" placeholder="输入幻灯片标题">
    </div>
    
    <div class="form-group" v-if="slideType === 'title'">
      <label for="slide-subtitle">副标题</label>
      <input id="slide-subtitle" type="text" v-model="slideContent" placeholder="输入幻灯片副标题">
    </div>
    
    <div class="form-group" v-else>
      <label for="slide-content">
        {{ slideType === 'bullets' ? '内容 (每行一个项目)' : '内容' }}
      </label>
      <textarea 
        id="slide-content" 
        v-model="slideContent" 
        :placeholder="slideType === 'bullets' ? '每行输入一个列表项' : '输入幻灯片内容'"
        :rows="slideType === 'code' ? 8 : 4"
      ></textarea>
    </div>
    
    <div class="form-group checkbox-group">
      <input type="checkbox" id="is-vertical" v-model="isVertical">
      <label for="is-vertical">作为垂直子幻灯片</label>
    </div>
    
    <button @click="addSlide" class="add-btn">添加幻灯片</button>
  </div>
</template>

<style scoped>
.slide-controls {
  background-color: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  margin: 20px auto;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.checkbox-group {
  display: flex;
  align-items: center;
}

.checkbox-group input {
  width: auto;
  margin-right: 8px;
}

.checkbox-group label {
  margin-bottom: 0;
  font-weight: normal;
}

input, select, textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

textarea {
  resize: vertical;
}

.add-btn {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  width: 100%;
}

.add-btn:hover {
  background-color: #45a049;
}
</style> 