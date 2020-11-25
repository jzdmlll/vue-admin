import Vue from 'vue'

import Cookies from 'js-cookie'

import 'normalize.css/normalize.css' // a modern alternative to CSS resets

import { Table, Popconfirm, Input, Upload, Icon, Empty, Popover, Timeline, Tabs } from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css'

import Element from 'element-ui'
import './styles/element-variables.scss'

import '@/styles/index.scss' // global css

import App from './App'
import store from './store'
import router from './router'

import './icons' // icon
import './permission' // permission control
import './utils/error-log' // error log

import * as filters from './filters' // global filters

/**
 * If you don't want to use mock-server
 * you want to use MockJs for mock api
 * you can execute: mockXHR()
 *
 * Currently MockJs will be used in the production environment,
 * please remove it before going online! ! !
 */
// import { mockXHR } from '../mock'
// if (process.env.NODE_ENV === 'production') {
//   mockXHR()
// }

Vue.use(Element, {
  size: Cookies.get('size') || 'medium' // set element-ui default size
})
Vue.use(Tabs, {
  size: Cookies.get('size') || 'medium' // set element-ui default size
})
Vue.use(Table, {
  size: Cookies.get('size') || 'medium'
})
Vue.use(Popconfirm, {
  size: Cookies.get('size') || 'medium'
})
Vue.use(Input, {
  size: Cookies.get('size') || 'medium'
})
Vue.use(Upload, {
  size: Cookies.get('size') || 'medium'
})
Vue.use(Icon, {
  size: Cookies.get('size') || 'medium'
})
Vue.use(Empty, {
  size: Cookies.get('size') || 'medium'
})
Vue.use(Popover,{
  size: Cookies.get('size') || 'medium'
})
Vue.use(Timeline,{
  size: Cookies.get('size') || 'medium'
})
// register global utility filters
Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})

Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
