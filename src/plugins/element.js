import Vue from 'vue'
import {
  Button, Form, FormItem, Input, Message, Tooltip,
  Container, Header, Aside, Main,
  Menu, Submenu, MenuItem,
  Breadcrumb, BreadcrumbItem, card,
  Select, Option, Row, Col,
  Table, TableColumn, Switch, Pagination,
  Dialog, Drawer, Radio, RadioGroup,
  MessageBox, Tag, Tree
} from 'element-ui'
Vue.use(Button)// Button按钮
Vue.use(Form)// Form表单
Vue.use(FormItem)
Vue.use(Input)// Input输入框
Vue.use(Container)
Vue.use(Header)
Vue.use(Aside)
Vue.use(Main)// 注册为全局组件
Vue.use(Menu)
Vue.use(Submenu)
Vue.use(MenuItem)
Vue.use(Breadcrumb)
Vue.use(BreadcrumbItem)
Vue.use(card)
Vue.use(Select)
Vue.use(Option)
Vue.use(Row)
Vue.use(Col)
Vue.use(Table)
Vue.use(TableColumn)
Vue.use(Switch)
Vue.use(Tooltip)
Vue.use(Pagination)
Vue.use(Dialog)
Vue.use(Drawer)
Vue.use(Radio)
Vue.use(RadioGroup)
Vue.use(Tag)
Vue.use(Tree)
Vue.prototype.$message = Message// message消息弹框组件
Vue.prototype.$confirm = MessageBox.confirm
