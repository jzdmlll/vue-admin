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
  console.log(privileges)
  const routes = []
  for (const privilege of privileges) {
    if (privilege.type === 'parent') {
      const route = {
        path: privilege.route,
        component: Layout,
        meta: { title: privilege.name, icon: privilege.icon, affix: true },
        children: []
      }
      if (privilege.children && privilege.children.length > 0) {
        for (const p of privilege.children) {
          if (p.type === 'menu') {
            console.log(p)
            const son_route = {
              hidden: true,
              path: p.route,
              // component: () => import('@/pages'+p.route),
              component: function component(resolve) {
                require(['@/pages' + p.route + '.vue'], resolve)
              },
              name: p.route.replace(/\//g, '_'),
              meta: { title: p.name, affix: true }
            }
            route.children.push(son_route)
          }
        }
      }
      routes.push(route)
    }
  }
  routes.push({ path: '*', redirect: '/404', hidden: true })
  return routes
}
// let routes = parseMenu();

export default parseMenu
