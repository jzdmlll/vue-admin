<template>
  <!-- 项目管理 -->
  <div class="pro_list">
    <div class="btns" style="padding:1em;margin-bottom:1em;background:#fff">
      <el-tooltip class="item" effect="dark" content="新增项目" placement="bottom-start">
        <el-button type="primary" icon="el-icon-plus" size="mini" @click="toAdd" ></el-button>
      </el-tooltip>
    </div>
    <div style="padding:1em;margin-bottom:1em;background:#fff">
      <el-table v-loading="loading" :data="projects" size="small">
        <el-table-column prop="id" label="项目编号" />
        <el-table-column prop="name" label="项目名称" />
        <el-table-column label="类型" >
          <el-select v-model="projects.types" multiple placeholder="请选择" value-key="name">
            <el-option v-for="item in types" :key="item.id" :label="item.name" :value="item"></el-option>
          </el-select>
        </el-table-column>
        <el-table-column prop="projects.content" label="内容" />
        <el-table-column prop="projects.remark" label="批注" />
        <el-table-column label="操作" align="center" width="180">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="deleteHandler(scope.row.id)">移除</el-button>
            <el-button type="text" size="small" @click="editHandler(scope.row)">修改</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <!-- 模态框 -->
    <el-dialog :title="title" :visible.sync="visible">
      <el-form :model="form">
		<el-form-item label="物品名" label-width="80px">
      <el-select v-model="form.article" placeholder="请选择" value-key="id">
			<el-option v-for="item in articles" :key="item.id" :label="item.name" :value="item"></el-option>
      </el-select>
		</el-form-item>
		<el-form-item label="状态" label-width="80px">
    <el-select v-model="form.status" placeholder="请选择" value-key="id">
			<el-option v-for="item in status" :key="item.id" :label="item.text" :value="item" />
    </el-select>
        </el-form-item>
		<el-form-item label="联系者" label-width="80px">
          <el-select v-model="form.user" placeholder="请选择" value-key="id">
			<el-option v-for="item in users" :key="item.id" :label="item.username" :value="item" />
      </el-select>
        </el-form-item>
		<el-form-item label="物品发布者" label-width="80px">
          <el-select v-model="form.publisher" placeholder="请选择" value-key="id">
			<el-option v-for="item in users" :key="item.id" :label="item.username" :value="item"></el-option>
    </el-select>
        </el-form-item>
		<el-form-item label="记录创建时间" label-width="80px">
          <el-date-picker value-format="timestamp" v-model="form.time" type="datetime" placeholder="选择日期时间" default-time="12:00:00"></el-date-picker>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="visible = false">取 消</el-button>
        <el-button type="primary" size="small" @click="saveRecordHandler">确 定</el-button>
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
      users: [],
      articles: [],
      status: [{ id: 0, text: '待归还' }, { id: 1, text: '归还中' }, { id: 2, text: '归还成功' }],
      form: { article: { name: '' }},
      visible: false,
      authorization_visible: false,
      title: '添加记录',
      projects: [], // 记录列表
      props: { multiple: true, value: 'id', label: 'name', emitPath: false },
      options: [],
      loading: false
    }
  },
  created() {
    // this.loadProjects()

  },
  methods: {

    saveRecordHandler() {
      this.form.articleId = this.form.article.id
      this.form.userId = this.form.user.id
      this.form.publishId = this.form.publisher.id
      this.form.status = this.form.status.id
      request.request({
        url: '/record/saveOrUpdate',
        method: 'post',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: qs.stringify(this.form)
      })
        .then(response => {
          this.visible = false
          this.$message({ message: response.message, type: 'success' })
          this.loadRecords()
        })
    },

    toAdd() {
      this.visible = true
      this.findAllUser()
      this.findAllArticle()
      this.form = { article: { name: '' }}
      this.title = '新增记录'
    },

    loadProjects() {
      request.get('/project/cascadeFindAll')
        .then(response => {
          this.projects = response.data

          this.loading = false
        })
    },
    deleteHandler(id) {
      this.$confirm('此操作将永久删除该记录, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        request.get('/record/deleteById?id=' + id)
          .then(response => {
            this.$message({ type: 'success', message: response.message })
            this.loadRecords()
          })
      })
    },
    editHandler(row) {
      this.findAllUser()
      this.findAllArticle()
      this.visible = true
      this.title = '修改记录'
      this.form = row
      this.form.status = this.form.status === 0 ? { id: 0, text: '归还中' } : { id: 1, text: '归还成功' }
    },
    findAllUser() {
      request.get('/user/findAll')
        .then(response => {
          this.users = response.data
        })
    },
    findAllArticle() {
      request.get('/article/findAll')
        .then(response => {
          this.articles = response.data
        })
    },
    dateFormat(cjsj) {
      var date = new Date(cjsj)
      var Y = date.getFullYear() + '-'
      var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-'
      var D = (date.getDate() + 1 < 10 ? '0' + (date.getDate()) : date.getDate()) + ' '
      var h = (date.getHours() + 1 < 10 ? '0' + (date.getHours()) : date.getHours()) + ':'
      var m = (date.getMinutes() + 1 < 10 ? '0' + (date.getMinutes()) : date.getMinutes()) + ':'
      var s = (date.getSeconds() + 1 < 10 ? '0' + (date.getSeconds()) : date.getSeconds())
      return Y + M + D + h + m + s
    }
  }
}
</script>
