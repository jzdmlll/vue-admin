import axios from 'axios'
import { Message } from 'element-ui'
const service = axios.create({
  baseURL: process.env.OS_API // api的base_url
})
service.interceptors.response.use(
  response => {
    return response
  }, error => {
    console.log('err' + error)// for debug
    Message({
      message: '对象存储服务访问超时，请检查链接是否能够访问。',
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  })

export function createStorage(data) {
  return service({
    url: '/storage/create',
    method: 'post',
    data
  })
}
