<template>
  <!--采购项目-->
  <div class="purchase_index">
    <div class="btns" style="padding:1em;margin-bottom:1em;background:#fff">
        <el-button type="primary" icon="el-icon-plus" size="mini" @click="toAdd">添加</el-button>
    </div>
    <el-card shadow="never">
      <div slot="header" class="index-md-title">
        <span>采购项目</span>
      </div>
      <a-table :loading="loading" :data-source="projects" size="small" :rowKey="record => record.id">
        <a-table-column title="序号">
          <template slot-scope="text, record, index">
            {{index+1}}
          </template>
        </a-table-column>
        <a-table-column key="projectName" title="采购项目名称" data-index="projectName" />
        <a-table-column key="inquiryProjectName" title="询价项目名称" data-index="inquiryProjectName" />
        <a-table-column key="purchaseProNo" title="采购项目编号" data-index="purchaseProNo" />
        <a-table-column key="remark" title="备注" data-index="remark" />
        <a-table-column key="operator" title="创建人" data-index="operator" />
        <a-table-column key="time" title="时间" data-index="time">
          <template slot-scope="text,reord">
            {{dateFormat(text)}}
          </template>
        </a-table-column>
        <a-table-column key="updateOperator" title="修改人" data-index="updateOperator" />
        <a-table-column key="updateTime" title="修改时间" data-index="updateTime">
          <template slot-scope="text,reord">
            {{dateFormat(text)}}
          </template>
        </a-table-column>

        <a-table-column key="action" title="操作" :width="120" align="center">
          <template slot-scope="text, record">
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteHandler(record.id)" />
            <el-button type="success" icon="el-icon-edit" size="mini" @click="editHandler(record)" />
          </template>
        </a-table-column>
      </a-table>
    </el-card>
    <!-- 模态框 -->
    <el-dialog :title="title" :visible.sync="visible">
      <el-form ref="form" status-icon :model="form">
        <el-form-item label="采购项目名称">
          <el-input v-model="form.projectName" autocomplete="off" />
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
  import { dateFormat } from '@/utils/format'
  import { getUser } from '@/utils/auth'

  export default {
    data() {
      return {
        form: {},
        visible: false,
        title: '新增采购项目',
        projects: [],
        loading: true
      }
    },
    created() {
      this.loadProjects()
    },
    methods: {
      dateFormat,
      saveRecordHandler(form) {
        this.form.updateOperator = getUser();
        this.$refs[form].validate((valid) => {
          if (valid) {
            request.request({
              url: '/purchase/project/saveOrUpdate',
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
        this.title = '新增采购项目'
      },

      loadProjects() {
        request.get('/purchase/project/findAllLike')
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
            url: '/purchase/project/deleteById',
            method: 'post',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: qs.stringify({ id: id , user: getUser()})
          })
            .then(response => {
              this.$message({ type: 'success', message: response.message })
              this.loadProjects()
            })
        })
      },
      editHandler(row) {
        this.visible = true
        this.title = '修改采购项目'
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
