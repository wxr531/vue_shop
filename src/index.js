import Vue from 'vue'
import Router from 'vue-router'
import Login from './components/Login.vue'
import Home from './components/Home.vue'

Vue.use(Router)

const router = new Router({
  routes: [
    { path: '/', redirect: '/login' }, // 重定向到login
    { path: '/login', component: Login }, // 设定具体地址连接到具体页面vue
    { path: '/home', component: Home }
  ]
})

// 挂在路由导航守卫
// 将要 来自 放行 next('/login')强制跳转
router.beforeEach((to, from, next) => {
  if (to.path === '/login') return next()
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})

export default router
