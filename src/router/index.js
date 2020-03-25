import Vue from 'vue'
import Router from 'vue-router'
import Three from '@/components/Three'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Three',
      component: Three
    }
  ]
})
