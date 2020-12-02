// 动态路由
import request from '@/utils/request'
import Layout from '@/layout'
import { construct } from '@aximario/json-tree'

async function parseMenu(id) {
  const response = await request.get('/user/findMenuByUserId?id=' + id)
  const privileges = construct(response.data, {
    id: 'id',
    pid: 'parentId',
    children: 'children'
  })

  const routes = []
  for (const privilege of privileges) {
    if (privilege.type === 'parent') {
      if (privilege.children && privilege.children.length > 0) {
        const route = {
          path: privilege.route,
          component: Layout,
          meta: { title: privilege.name, icon: privilege.icon, affix: true },
          children: []
        }
        for (const p of privilege.children) {
          if (p.type === 'menu') {
            let page = p.route
            if (privilege.name === '审核管理' && page!='/proCheck/final') {
              page = '/proCheck/list'
            }
            const son_route = {
              hidden: false,
              path: p.route,
              // component: () => import('@/pages'+p.route),
              component: function component(resolve) {
                require(['@/pages' + page + '.vue'], resolve)
              },
              name: p.name.replace(/\//g, '_'),
              meta: { title: p.name, affix: true, noCache: false }
            }
            route.children.push(son_route)
          }
        }
        routes.push(route)
      }
    }
  }
  routes.push({ path: '*', redirect: '/404', hidden: true })
  console.log(routes)
  return routes
}
// let routes = parseMenu();

export default parseMenu
