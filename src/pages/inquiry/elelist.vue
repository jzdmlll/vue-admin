<template>
  <!-- 询价管理 -->
  <div class="pro_origin_list">
    <div class="btns" style="padding:1em;margin-bottom:1em;background:#fff">
      <el-tooltip class="item" effect="dark" content="新增询价" placement="bottom-start">
        <el-button type="primary" icon="el-icon-plus" size="mini" @click="toAdd" />
      </el-tooltip>
    </div>
    <div style="padding:1em;margin-bottom:1em;background:#fff">
      <el-table v-loading="loading" :data="projects" stripe @expand-change="expandChange">
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-table :data="scope.row.detailList" stripe size="small">
              <el-table-column prop="supplier" :show-overflow-tooltip="true" fixed label="供应商" />
              <el-table-column prop="name" :show-overflow-tooltip="true" fixed label="询价名" />
              <el-table-column prop="device" :show-overflow-tooltip="true" fixed label="设备名" />
              <el-table-column prop="model" :show-overflow-tooltip="true" fixed label="设备型号" />
              <el-table-column prop="suModel" :show-overflow-tooltip="true" fixed label="供应商设备型号" />
              <el-table-column prop="require" :show-overflow-tooltip="true" fixed label="技术参数" />
              <el-table-column prop="suRequire" :show-overflow-tooltip="true" fixed label="供应商技术参数" />
              <el-table-column prop="unit" :show-overflow-tooltip="true" fixed label="单位" />
              <el-table-column prop="number" :show-overflow-tooltip="true" label="数量" />
              <el-table-column prop="suPrice" :show-overflow-tooltip="true" label="供应商单价" />
              <el-table-column prop="suTotalPrice" :show-overflow-tooltip="true" label="供应商总价" />
              <el-table-column prop="suRemark" :show-overflow-tooltip="true" label="供应商备注" />
              <el-table-column prop="suDelivery" :show-overflow-tooltip="true" label="供应商货期" />
              <el-table-column prop="suDelivery" :show-overflow-tooltip="true" label="供应商货期" />
              <el-table-column prop="supplierId" :show-overflow-tooltip="true" label="质保期" />

            </el-table>
          </template>
        </el-table-column>
        <el-table-column type="index" prop="" label="序号" width="120" />
        <el-table-column prop="name" label="项目名称" />
        <el-table-column prop="sysProOrigin.name" label="项目来源" />
        <el-table-column prop="sysProType.name" label="项目类型" />
        <el-table-column label="操作" align="center" width="180">
          <template slot-scope="scope">
            <el-tooltip class="item" effect="dark" content="删除该询价" placement="bottom-start">
              <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteHandler(scope.row.id)" />
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="修改该询价" placement="bottom-start">
              <el-button type="success" icon="el-icon-edit" size="mini" @click="editHandler(scope.row)" />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <!-- 模态框 -->
    <el-dialog :title="title" :visible.sync="visible">

      <el-select v-model="currentProject" clearable placeholder="请选择项目">
        <el-option v-for="item in projects" :key="item.id" :label="item.name" :value="item" />
      </el-select>
      {{ form }}
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="visible = false">取 消</el-button>
        <el-button type="primary" size="small" @click="saveRecordHandler('form')">确 定</el-button>
      </div>
    </el-dialog>

  </div>
</template>
<script>
import request from '@/utils/request'
import qs from 'querystring'
import '@/styles/auto-style.css'

export default {
  data() {
    return {
      visible: false,
      title: '新增询价',
      projects: [],
      form: [],
      currentProject: {},
      loading: true,
      codeRules: {
        code: [
          { pattern: /[A-Z]/, message: '必须是1位大写英文字母', trigger: 'blur' }
        ]
      }

    }
  },
  created() {
    this.loadProjects()
  },
  methods: {
    expandChange(row, expandedRows) {
      if (expandedRows.length > 0) {
        request.request({
          url: '/inquiry/findByDetailId?id=' + row.id,
          method: 'get'
        }).then(response => {
          this.projects.forEach((item, index) => {
            if (item.id === row.id) {
              this.projects[index].detailList = response.data
            }
          })
        })
      }
    },
    saveRecordHandler(form) {
      this.$refs[form].validate((valid) => {
        if (valid) {
          request.request({
            url: '/project/origin/saveOrUpdate',
            method: 'post',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: qs.stringify(this.form)
          })
            .then(response => {
              this.visible = false
              this.$message({ message: response.message, type: 'success' })
              this.loadProjects()
            })
        } else {
          console.log('error commit')
          return false
        }
      })
    },

    toAdd() {
      this.visible = true
      this.title = '新增询价'
    },
    loadProjects() {
      request.get('/project/detail/findByAll')
        .then(response => {
          response.data.map(item => {
            item.detailList = []
          })
          this.projects = response.data
          this.loading = false
        })
    },

    deleteHandler(id) {
      this.$confirm('此操作为删除操作, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        request.request({
          url: '/project/origin/logicDeleteById',
          method: 'post',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          data: qs.stringify({ 'proOriginId': id })
        })
          .then(response => {
            this.$message({ type: 'success', message: response.message })
            this.loadRecords()
          })
      })
    }
  /* dateFormat(cjsj) {
      var date = new Date(cjsj)
      var Y = date.getFullYear() + '-'
      var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-'
      var D = (date.getDate() + 1 < 10 ? '0' + (date.getDate()) : date.getDate()) + ' '
      var h = (date.getHours() + 1 < 10 ? '0' + (date.getHours()) : date.getHours()) + ':'
      var m = (date.getMinutes() + 1 < 10 ? '0' + (date.getMinutes()) : date.getMinutes()) + ':'
      var s = (date.getSeconds() + 1 < 10 ? '0' + (date.getSeconds()) : date.getSeconds())
      return Y + M + D + h + m + s
    }*/
  }
}
</script>
