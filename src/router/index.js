import { createRouter, createWebHistory } from 'vue-router'
import MarkdownInput from '../views/MarkdownInput.vue'
import Presentation from '../components/Presentation.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: MarkdownInput
    },
    {
      path: '/presentation',
      name: 'presentation',
      component: Presentation
    }
  ]
})

export default router