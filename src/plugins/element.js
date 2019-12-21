import Vue from 'vue'
import { Button, Form, FormItem, Input, Message } from 'element-ui'

Vue.use(Button)// Button按钮
Vue.use(Form)// Form表单
Vue.use(FormItem)
Vue.use(Input)// Input输入框
Vue.prototype.$message = Message// message消息弹框组件
