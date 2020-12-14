export function dateFormat(cjsj) {
  if(cjsj == null || isNaN(cjsj)) {
    return ''
  }
  var date = new Date(cjsj)
  var Y = date.getFullYear() + '-'
  var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-'
  var D = (date.getDate() + 1 < 10 ? '0' + (date.getDate()) : date.getDate()) + ' '
  return Y + M + D
}

export function dateTimeFormat(cjsj) {
  if(cjsj == null || isNaN(cjsj)) {
    return ''
  }
  var date = new Date(cjsj)
  var Y = date.getFullYear() + '-'
  var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-'
  var D = (date.getDate() + 1 < 10 ? '0' + (date.getDate()) : date.getDate()) + ' '
  var h = (date.getHours() + 1 < 10 ? '0' + (date.getHours()) : date.getHours()) + ':'
  var m = (date.getMinutes() + 1 < 10 ? '0' + (date.getMinutes()) : date.getMinutes()) + ':'
  var s = (date.getSeconds() + 1 < 10 ? '0' + (date.getSeconds()) : date.getSeconds())
  return Y + M + D + h + m + s
}

export function nullFormat(record) {
  if (record == null || record == '') {
    return ''
  }
  return record
}

export function nullToEmpty(obj) {
  for(let key in obj) {
    if(obj[key] == null) {
      obj[key] = ''
    }
  }
}
