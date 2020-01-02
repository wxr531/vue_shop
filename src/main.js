import Vue from 'vue'
import App from './App.vue'
import router from '.'
import './plugins/element.js'
import echarts from 'echarts'
// 导入全局样式表global.css
import './assets/css/global.css'
// 导入字体图标
import './assets/fonts/iconfont.css'
// 配置请求根路径
import axios from 'axios'
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
axios.interceptors.request.use(config => { // 挂载请求拦截器 回调函数 请求对象
  console.log(config)
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
Vue.prototype.$http = axios
Vue.prototype.$echarts = echarts

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
