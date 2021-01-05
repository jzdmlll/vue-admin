import request from '@/utils/request'
import qs from 'querystring'

//get
export function getAction(url, parameter) {
  return request({
    url: url,
    method: 'get',
    params: parameter
  })
}

//postActionByJson
export function postActionByJson(url, parameter) {
  return request({
    url: url,
    method:'post',
    headers: {
      'Content-Type': 'application/json'
    },
    data: JSON.stringify(parameter)
  })
}

//postActionByQueryString
export function postActionByQueryString(url, parameter) {
  return request({
    url: url,
    method:'post' ,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data: qs.stringify(parameter)
  })
}
