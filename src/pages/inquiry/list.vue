<template>
  <!-- 询价管理 -->
  <div class="pro_origin_list">
    <div class="btns" style="padding:1em;margin-bottom:1em;background:#fff">
      <el-tooltip class="item" effect="dark" content="新增询价" placement="bottom-start">
        <el-button type="primary" icon="el-icon-plus" size="mini" @click="toAdd" ></el-button>
      </el-tooltip>
    </div>
    <div style="padding:1em;margin-bottom:1em;background:#fff">
      <el-table v-loading="loading" :data="projects" size="small">
        <el-table-column type="index" prop="" label="序号" width="120"/>
        <el-table-column prop="name" label="询价名称" />
        <el-table-column prop="code" label="询价编码" />
        <el-table-column label="操作" align="center" width="180">
          <template slot-scope="scope">
            <el-tooltip class="item" effect="dark" content="删除该询价" placement="bottom-start">
              <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteHandler(scope.row.id)"></el-button>
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="修改该询价" placement="bottom-start">
              <el-button type="success" icon="el-icon-edit" size="mini" @click="editHandler(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <!-- 模态框 -->
    <el-dialog :title="title" :visible.sync="visible">
      <el-form status-icon ref="form" :model="form" :rules="codeRules">
        <el-form-item label="询价名称" >
          <el-input v-model="form.name" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="询价编码" prop="code">
          <el-input  v-model="form.code" maxlength="1" autocomplete="off" show-word-limit placeholder="1位大写英文字母"></el-input>
        </el-form-item>
      </el-form>
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
      form: { code: '' },
      visible: false,
      title: '新增询价',
      projects: [],
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
      this.form = {}
      this.title = '新增询价'
    },

    loadProjects() {
      request.get('/project/origin/findAll')
        .then(response => {
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
    },
    editHandler(row) {
      this.visible = true
      this.title = '修改询价'
      this.form = row
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
