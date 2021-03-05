// 动态路由
import request from '@/utils/request'
import Layout from '@/layout'
import { construct } from '@aximario/json-tree'
let routes = []

async function parseMenu(id) {
  const response = await request.get('/user/findMenuByUserId?id=' + id)
  const privileges = construct(response.data, {
    id: 'id',
    pid: 'parentId',
    children: 'children'
  })

  for (const privilege of privileges) {
    if (privilege.type === 'parent') {
      var r = recursionParseMenu(privilege)
      if (r!=null) {
        routes.push(r)
      }
    }
  }
  console.log(routes)
  routes.push({ path: '*', redirect: '/404', hidden: true })
  return routes
}
// let routes = parseMenu();
// 递归解析路由菜单
function recursionParseMenu(privilege) {
  if (privilege.children && privilege.children.length > 0) {
    let component = null
    if (privilege.type === 'parent') {
      component = Layout
    }else {
      component = function component(resolve) {
        require(['@/layout/components/AppMain.vue'
        ], resolve)
      }
    }
    const route = {
      path: privilege.route,
      component: component,
      meta: { title: privilege.name, icon: privilege.icon, affix: true },
      children: []
    }
    for (const p of privilege.children) {
      if (p.type === 'menu' && !p.children.length > 0) {
        let page = p.route
        let hidden = false
        if(p.remark == 'hidden') {
          hidden = true
        }
        if (privilege.name === '审核管理' && page!='/proCheck/final') {
          page = '/proCheck/list'
        }
        if (privilege.name === '采购管理' && p.remark == 'single'){
          page = '/purchase/check/list'
        }
        const son_route = {
          hidden: hidden,
          path: p.route,
          // component: () => import('@/pages'+p.route),
          component: function component(resolve) {
            require(['@/pages' + page + '.vue'], resolve)
          },
          name: p.name.replace(/\//g, '_'),
          meta: { title: p.name, affix: true, noCache: false }
        }
        route.children.push(son_route)
      }else {
        var r = recursionParseMenu(p)
        if(r!=null) {
          route.children.push(r)
        }
      }
    }
    return route
  }
  return null
}
export default parseMenu
