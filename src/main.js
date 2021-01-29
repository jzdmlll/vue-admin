import Vue from 'vue'

import Cookies from 'js-cookie'

import 'normalize.css/normalize.css' // a modern alternative to CSS resets

<<<<<<< HEAD
import { Descriptions,Tag,Button,Select,Layout,Table, Popconfirm, Input, Upload, Icon, Empty, Popover, Timeline, Tabs, Row, Col, InputNumber, Tooltip, Progress } from 'ant-design-vue'
=======
import { Skeleton, Table, Popconfirm, Input, Upload, Icon, Empty, Popover, Timeline, Tabs, Row, Col, InputNumber, Tooltip, Progress } from 'ant-design-vue'
>>>>>>> ab517146236ff58db8ffdf6137bc98d2040eadbe
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
import './utils/directives'
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
<<<<<<< HEAD
Vue.use(Descriptions)
Vue.use(Tag)
Vue.use(Button)
Vue.use(Layout)
Vue.use(Select)
=======
Vue.use(Skeleton)
>>>>>>> ab517146236ff58db8ffdf6137bc98d2040eadbe
Vue.use(Progress)
Vue.use(Element, {
  size: Cookies.get('size') || 'medium' // set element-ui default size
})
Vue.use(Tooltip, {
  size: Cookies.get('size') || 'medium' // set element-ui default size
})
Vue.use( InputNumber, {
  size: Cookies.get('size') || 'medium' // set element-ui default size
})
Vue.use( Tabs, {
  size: Cookies.get('size') || 'medium' // set element-ui default size
})
Vue.use( Row, {
  size: Cookies.get('size') || 'medium' // set element-ui default size
})
Vue.use( Col, {
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
