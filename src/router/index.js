import Vue from 'vue'
import Router from 'vue-router'
Vue.use(Router)
/* Layout */
import Layout from '@/layout'
/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'             the icon show in the sidebar
    noCache: true                if set true, the page will no be cached(default is false)
    affix: true                  if set true, the tag will affix in the tags-view
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path*',
        component: () => import('@/views/redirect/index')
      }
    ]
  },
  /*{
    path: '/stock',
    component: Layout,
    children: [
      {
        path: 'list-bak',
        component: () => import('@/pages/stock/list-bak'),
        name: 'article_list',
        meta: { title: '设备管理',  affix: true }
      },
    ]
  },*/
  /*{
    path: '/equipment',
    component: Layout,
    children: [
      {
        path: 'list',
        component: () => import('@/pages/equipment/list'),
        name: 'article_list',
        meta: { title: '设备管理',  affix: true }
      },
    ]
  },
   {
    path: '/equipment',
    component: Layout,
    children: [
      {
        path: 'app',
        component: () => import('@/pages/equipment/sign'),
        name: 'article_list',
        meta: { title: '设备签收管理',  affix: true }
      },
    ]
  },
  {
    path: '/equipment',
    component: Layout,
    children: [
      {
        path: 'inport',
        component: () => import('@/pages/equipment/entry'),
        name: 'article_list',
        meta: { title: '设备入库管理',  affix: true }
      },
    ]
  },
  {
    path: '/equipment',
    component: Layout,
    children: [
      {
        path: 'stock',
        component: () => import('@/pages/equipment/stock'),
        name: 'article_list',
        meta: { title: '设备库存',  affix: true }
      },
    ]
  },

  {
    path: '/chapter',
    component: Layout,
    children: [
      {
        path: 'check',
        component: () => import('@/pages/chapter/check'),
        name: 'article_list',
        meta: { title: '设备管理',  affix: true }
      },
    ]
  },*/
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },
  {
    path: '/auth-redirect',
    component: () => import('@/views/login/auth-redirect'),
    hidden: true
  },
  {
    path: '/404',
    component: () => import('@/views/error-page/404'),
    hidden: true
  },
  {
    path: '/401',
    component: () => import('@/views/error-page/401'),
    hidden: true
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        component: () => import('@/views/dashboard/index'),
        name: 'Dashboard',
        meta: { title: '首页', icon: 'dashboard', affix: true, noCache: true }
      }
      /*{
        path: 'dashboard',
        component: () => import('@/pages/dashboard/index'),
        name: '首页',
        meta: { title: '首页', icon: 'dashboard', affix: true }
      }*/
    ]
  },
  {
    path: '/websocket',
    component: () => import('@/pages/websocket/index'),
    name: 'websocket',
    meta: {title: 'websocket', icon: 'dashboard', affix: true, noCache: true},
  },
  {
    path: '/profile',
    component: Layout,
    redirect: '/profile/index',
    hidden: true,
    children: [
      {
        path: 'index',
        component: () => import('@/views/profile/index'),
        name: 'Profile',
        meta: { title: 'Profile', icon: 'user', noCache: true }
      }
    ]
  }
]

/**
 * asyncRoutes
 * the routes that need to be dynamically loaded based on user roles
 */
export const asyncRoutes = [

  /* // 文章路由
  {
    path: '/article',
    component: Layout,
    children: [
      {
        path: 'list',
        component: () => import('@/pages/article/list'),
        name: 'article_list',
        meta: { title: '物品管理', icon: 'education', affix: true }
      },
      {
        hidden: true,
        path: 'editor',
        component: () => import('@/pages/article/editor'),
        name: 'article_editor',
        meta: { title: '失物/拾取发布', icon: 'documentation', affix: false }
      }
    ]
  },
  // 系统设置路由
  {
    path: '/user',
    component: Layout,
    children: [
      {
        path: 'user/list',
        component: () => import('@/pages/sys/user/list'),
        name: 'sys_user_list',
        meta: { title: '用户管理', icon: 'user', affix: true }
      }
    ]
  }, {
    path: '/role',
    component: Layout,
    children: [
      {
        path: 'list',
        component: () => import('@/pages/sys/role/list'),
        name: 'role_list',
        meta: { title: '角色管理', icon: 'peoples', affix: true }
      }
    ]
  }, {
    path: '/record',
    component: Layout,
    children: [
      {
        path: 'list',
        component: () => import('@/pages/record/list'),
        name: 'record_list',
        meta: { title: '记录管理', icon: 'lock', affix: true }
      }
    ]
  },
  {
    path: '/privilege',
    component: Layout,
    children: [
      {
        path: 'list',
        component: () => import('@/pages/sys/privilege/list'),
        name: 'privilge_list',
        meta: { title: '权限管理', icon: 'lock', affix: true }
      }
    ]
  },
  */
  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
