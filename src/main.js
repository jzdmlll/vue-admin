import Vue from 'vue'

import Cookies from 'js-cookie'

import 'normalize.css/normalize.css' // a modern alternative to CSS resets

import { Badge, Card, Divider, LocaleProvider, Modal, Spin, List, Cascader, Descriptions,Tag,Button,Select,Layout,Skeleton, Table, Popconfirm, Input, Upload, Icon, Empty, Popover, Timeline, Tabs, Row, Col, InputNumber, Tooltip, Progress } from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css'
import { List as VanList, Card as VanCard, Search as VanSearch, Tab as VanTab, Tabs as VanTabs, NavBar as VanNavBar,
  Cell as VanCell, CellGroup as VanCellGroup, Button as VanButton, Empty as VanEmpty, Dialog as VanDialog, Toast as VanToast,
  Field as VanField, Collapse as VanCollapse, CollapseItem as VanCollapseItem} from 'vant'
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

Vue.use(VanList)
Vue.use(VanCard)
Vue.use(VanSearch)
Vue.use(VanTab)
Vue.use(VanTabs)
Vue.use(VanNavBar)
Vue.use(VanCell)
Vue.use(VanCellGroup)
Vue.use(VanButton)
Vue.use(VanEmpty)
Vue.use(VanDialog)
Vue.use(VanToast)
Vue.use(VanField)
Vue.use(VanCollapse)
Vue.use(VanCollapseItem)



Vue.use(LocaleProvider)
Vue.use(Cascader)
Vue.use(Descriptions)
Vue.use(Tag)
Vue.use(Button)
Vue.use(Layout)
Vue.use(Select)
Vue.use(Skeleton)
Vue.use(Progress)
Vue.use(List)
Vue.use(Spin)
Vue.use(Modal)
Vue.use(Divider)
Vue.use(Card)
Vue.use(Badge)
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
