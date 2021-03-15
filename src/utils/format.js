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


export function GetTime(date) {
  var datee = new Date(date).toJSON();
  return new Date(+new Date(datee) + 8 * 3600 * 1000).toISOString().
  replace(/T/g, ' ').replace(/\.[\d]{3}Z/, '')
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
    return '空'
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

/**
 * 10000 => "10,000"
 * @param {number} num
 */
export function toThousandFilter(num) {
  return (+num || 0).toFixed(2).replace(/\d{1,3}(?=(\d{3})+(\.\d*)?$)/g, '$&,')
  // return (+num || 0).toString().replace(/^-?\d+/g, m => m.replace(/(?=(?!\b)(\d{3})+$)/g, ','))
}
