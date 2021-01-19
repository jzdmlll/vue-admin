export function beforeUpload(file) {
  if (file.size > 12 * 1024 * 1024) {
    this.$message({ message: '上传文件大小不能超过12M', type: 'error' })
    return false
  }else {
    this.uploadKey = false
  }
}
export function uploadStatusChange(info) {
  if (info.file.status === 'uploading' || info.file.response.error === 0) {
    let fileList = [...info.fileList]
    fileList = fileList.map(file => {
      if (file.response) {
        file.url = file.response.url
        file.id = file.response.fileId
        file.name = file.response.fileName
        //file.type = 1
      }
      return file
    })

    this.fileList = fileList
    this.uploadKey = true
  }
}
