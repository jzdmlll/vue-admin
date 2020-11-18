<template>
  <!-- 角色管理 -->
  <div class="role_list">
    <div class="btns" style="padding:1em;margin-bottom:1em;background:#fff">
      <el-tooltip class="item" effect="dark" content="添加" placement="bottom-start">
        <el-button type="primary" icon="el-icon-plus" size="small" @click="toAdd">添加</el-button>
      </el-tooltip>
    </div>
    <div style="padding:1em;margin-bottom:1em;background:#fff">
      <el-table v-loading="loading" :data="pools" size="small">
        <el-table-column type="index" prop="" label="序号" width="120" />
        <el-table-column prop="name" label="设备名称" />
        <el-table-column prop="supplier" label="供应商" />
        <el-table-column prop="params" label="技术参数" />
        <el-table-column prop="model" label="品牌型号" />
        <el-table-column prop="price" label="单价" />
        <el-table-column prop="delivery" label="货期" />
        <el-table-column prop="remark" label="备注" />
        <el-table-column label="操作" align="center" width="180">
          <template slot-scope="scope">
            <el-tooltip class="item" effect="dark" content="修改角色" placement="bottom-start">
              <el-button icon="el-icon-edit" type="success" size="mini" @click="toEdit(scope.row)" />
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="删除角色" placement="bottom-start">
              <el-button icon="el-icon-delete" type="danger" size="mini" @click="deleteHandler(scope.row.id)" />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <!-- 模态框 -->
    <el-dialog :title="title" :visible.sync="visible">
      <el-form :model="form">
        <el-form-item label="设备名" label-width="80px">
          <el-input v-model="form.name" autocomplete="off" />
        </el-form-item>
        <el-form-item label="供应商" label-width="80px">
          <el-input v-model="form.supplier" autocomplete="off" />
        </el-form-item>
        <el-form-item label="技术参数" label-width="80px">
          <el-input v-model="form.params" autocomplete="off" />
        </el-form-item>
        <el-form-item label="设备型号" label-width="80px">
          <el-input v-model="form.model" autocomplete="off" />
        </el-form-item>
        <el-form-item label="单价" label-width="80px">
          <el-input v-model="form.price" autocomplete="off" />
        </el-form-item>
        <el-form-item label="备注" label-width="80px">
          <el-input v-model="form.remark" autocomplete="off" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="visible = false">取 消</el-button>
        <el-button type="primary" size="small" @click="saveRoleHandler">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
  import request from '@/utils/request'
  import qs from 'querystring'
  import '@/styles/auto-style.css'
  import { dateFormat,nullFormat } from '@/utils/format'

  export default {
    data() {
      return {
        form: {},
        visible: false,
        authorization_visible: false,
        title: '添加角色',
        role: {}, // 当前角色
        pools: [], // 角色列表
        props: { multiple: true, value: 'id', label: 'name', emitPath: false },
        options: [],
        loading: true
      }
    },
    created() {
      // 加载角色
      this.loadpools()
      // 加载权限
      this.loadPrivileges()
    },
    methods: {
      dateFormat,
      authorizationHandler() {
        request.request({
          url: '/role/authorization',
          method: 'post',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          data: qs.stringify(this.role)
        })
          .then(response => {
            this.authorization_visible = false
            this.$message({ message: response.message, type: 'success' })
            this.loadpools()
          })
      },
      saveRoleHandler() {
        request.request({
          url: '/pool/updateMessage',
          method: 'post',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          data: qs.stringify(this.form)
        })
          .then(response => {
            this.visible = false
            this.$message({ message: response.message, type: 'success' })
            this.loadpools()
          })
      },
      loadPrivileges() {
        request.get('/privilege/findPrivilegeTree')
          .then(response => {
            this.options = response.data
          })
      },
      toAdd() {
        this.visible = true
      },
      loadpools() {
        request.get('/pool/findByParams')
          .then(response => {
            this.pools = response.data
            this.loading = false
          })
      },
      deleteHandler(id) {
        this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          request.get('/role/deleteById?id=' + id)
            .then(response => {
              this.$message({ type: 'success', message: response.message })
              this.loadpools()
            })
        })
      },
      toAuthorization(record) {
        this.role = record
        this.authorization_visible = true
      },
      toEdit(record) {
        this.title = '修改'
        this.visible = true
        this.form = record
      }
    }
  }
</script>
