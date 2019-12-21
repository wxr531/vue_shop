import Vue from 'vue'
import App from './App.vue'
import router from '.'
import './plugins/element.js'

// 导入全局样式表global.css
import './assets/css/global.css'
// 配置请求根路径
import axios from 'axios'
axios.defaults.baseURL = 'http://localhost:8080/XingKaiHu1'
Vue.prototype.$http = axios

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
