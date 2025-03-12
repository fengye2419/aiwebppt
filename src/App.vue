<script setup>
// 移除直接导入的组件
// import Presentation from './components/Presentation.vue'
</script>

<template>
  <main>
    <!-- 将固定的组件替换为router-view -->
    <router-view />
  </main>
</template>

<style>
html, body {
  margin: 0;
  padding: 0;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  width: 100vw;
  height: 100vh;
}

#app {
  width: 100vw;
  height: 100vh;
}

main {
  width: 100vw;
  height: 100vh;
}

/* 自定义滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* 确保所有内容都能正常显示 */
* {
  box-sizing: border-box;
}

/* 修复可能的溢出问题 */
img, video, canvas, svg {
  max-width: 100%;
  height: auto;
}
</style>
