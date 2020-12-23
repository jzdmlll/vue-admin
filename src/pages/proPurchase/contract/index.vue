<template>
    <!--合同首页-->
  <div class="contract_index">
    <div class="btns" style="padding:1em;margin-bottom:1em;background:#fff">
      <el-tooltip class="item" effect="dark" content="" placement="bottom-start">
        <el-button type="primary" icon="el-icon-plus" size="mini" @click="toAdd">添加采购合同</el-button>
      </el-tooltip>
    </div>
    <div style="padding:1em;margin-bottom:1em;background:#fff">
      <el-table v-loading="loading" :data="projects" size="small">
        <el-table-column type="index" prop="" label="序号" width="120" />
        <el-table-column prop="name" label="采购项目名称" />
        <el-table-column prop="contract" label="合同编号" />
        <el-table-column label="操作" align="center" width="180">
          <template slot-scope="scope">
            <el-tooltip class="item" effect="dark" content="删除" placement="bottom-start">
              <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteHandler(scope.row.id)" />
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="修改" placement="bottom-start">
              <el-button type="success" icon="el-icon-edit" size="mini" @click="editHandler(scope.row)" />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <!-- 模态框 -->
    <el-dialog :title="title" :visible.sync="visible">
      <el-form ref="form" status-icon :model="form">
        <el-form-item label="采购项目" label-width="80px">
          <el-select v-model="form.projectId" clearable placeholder="请选择">
            <el-option v-for="p in projects" :key="p.id" :label="p.project_name" :value="p.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="采购合同编号">
          <el-input v-model="form.number" autocomplete="off" />
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
        form: {},
        visible: false,
        title: '新增采购合同',
        projects: [],
        loading: true
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
              url: '/project/type/saveOrUpdate',
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
        this.title = '新增采购合同'
      },

      loadProjects() {
        request.get('/project/type/findAll')
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
            url: '/project/type/logicDeleteById',
            method: 'post',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: qs.stringify({ 'proTypeId': id })
          })
            .then(response => {
              this.$message({ type: 'success', message: response.message })
              this.loadProjects()
            })
        })
      },
      editHandler(row) {
        console.log()
        this.visible = true
        this.title = '修改采购合同'
        this.form = row
      }
    }
  }
</script>
<style lang="scss" scoped>

  /deep/.el-form-item__content{
    height:auto;
    line-height:32px;
    margin-left:90px!important
  }
</style>
