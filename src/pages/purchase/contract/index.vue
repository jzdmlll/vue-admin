<template>
    <!--合同管理-->
  <div class="contract_index">
    <div class="btns" style="padding:1em;margin-bottom:1em;background:#fff">
      <el-button type="primary" icon="el-icon-plus" size="mini" @click="toAdd">添加</el-button>
      <el-select v-model="searchForm.purProjectId" style="margin-right: 6px" filterable clearable placeholder="请选择项目" value-key="name">
        <el-option v-for="item in projects" :key="item.id" :label="item.projectName" :value="item.id" />
      </el-select>
      <el-button type="primary" icon="el-icon-search" size="mini" @click="toSearch">查询</el-button>
    </div>
    <el-card shadow="never">
      <div slot="header" class="index-md-title">
        <span>采购合同表</span>
      </div>
      <a-table :loading="loading" :data-source="contracts" size="small" :rowKey="record => record.id">
        <a-table-column title="序号">
          <template slot-scope="text, record, index">
            {{index+1}}
          </template>
        </a-table-column>
        <a-table-column key="contractName" title="合同名" data-index="contractName" />
        <a-table-column key="contractNo" title="合同编号" data-index="contractNo" />
        <a-table-column key="action" title="操作" :width="120" align="center">
          <template slot-scope="text, record">
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteHandler(scope.row.id)" />
            <el-button type="success" icon="el-icon-edit" size="mini" @click="editHandler(scope.row)" />
          </template>
        </a-table-column>
      </a-table>
    </el-card>
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
        searchForm: {},
        visible: false,
        title: '新增采购合同',
        contracts: [],
        projects: [],
        loading: false
      }
    },
    created() {
      this.loadProjects()
    },
    methods: {
      toSearch() {
        let projectId = ''
        if (this.searchForm.purProjectId) {
          projectId = this.searchForm.purProjectId
        }
        this.loading = true
        request.get('/purchase/contract/findByProjectId?projectId='+projectId)
          .then(resp => {
            this.contracts = resp.data
            this.loading = false
          })
      },
      loadProjects() {
        request.get('/purchase/project/findAllLike')
          .then(response => {
            this.projects = response.data
          })
      },
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
                this.loadContracts()
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
              this.loadContracts()
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
  .contract_index {

  }
  /deep/.el-form-item__content{
    height:auto;
    line-height:32px;
    margin-left:90px!important
  }
</style>
