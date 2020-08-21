<template>
  <!-- 记录管理 -->
  <div class="role_list">
    <div class="btns" style="padding:1em;margin-bottom:1em;background:#fff">
      <el-tooltip class="item" effect="dark" content="添加记录" placement="bottom-start">
        <el-button type="primary" size="small" @click="toAdd">添加</el-button>
      </el-tooltip>
    </div>
    <div style="padding:1em;margin-bottom:1em;background:#fff">
      <el-table v-loading="loading" :data="records" size="small">
        <el-table-column prop="id" label="记录编号" />
        <el-table-column prop="article.name" label="物品名" />
        <el-table-column label="类型" >
			<template slot-scope="scope">{{scope.row.article.type == 0?'丢失':'拾取'}}</template>
		</el-table-column>
        <el-table-column prop="publisher.username" label="发布者" />
        <el-table-column prop="user.username" label="联系者" />
        <el-table-column label="状态" >
			<template slot-scope="scope">{{status[scope.row.article.status].text}}</template>
		</el-table-column>
		<el-table-column label="时间" >
			<template slot-scope="scope">{{dateFormat(scope.row.time)}}</template>
		</el-table-column>
		<el-table-column label="操作" align="center" width="180">
          <template slot-scope="scope">
		  
            <el-button type="text" size="small" @click="deleteHandler(scope.row.id)">移除</el-button>
            <el-button type="text" size="small" @click="editRecord(scope.row)">修改</el-button>
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
			<el-option v-for="item in status" :key="item.id" :label="item.text" :value="item"></el-option>
		  </el-select>
        </el-form-item>
		<el-form-item label="联系者" label-width="80px">
          <el-select v-model="form.user" placeholder="请选择" value-key="id">
			<el-option v-for="item in users" :key="item.id" :label="item.username" :value="item"></el-option>
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
export default {
  data() {
    return {
	  users: [],
	  articles: [],
	  status: [{id: 0,text: '待归还'},{id: 1,text: '归还中'},{id: 2,text: '归还成功'}],
      form: {article: {name:''}},
      visible: false,
      authorization_visible: false,
      title: '添加记录',
      records: [], // 记录列表
      props: { multiple: true, value: 'id', label: 'name', emitPath: false },
      options: [],
      loading: true
    }
  },
  created() {
	this.loadRecords()
  },
  methods: {
    
    saveRecordHandler() {
	  console.log(qs.stringify(this.form))
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
	  this.form = {article: {name:''}}
	  this.title = '新增记录'
    },
    
	loadRecords() {
      request.get('/record/cascadeFindAll')
        .then(response => {
          this.records = response.data
		  
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
    editRecord(row) {
	  this.findAllUser()
	  this.findAllArticle()
	  this.visible = true
	  this.title = '修改记录'
	  this.form = row
	  this.form.status=this.form.status == 0?{id: 0,text: '归还中'}:{id: 1,text: '归还成功'}
	},
	findAllUser() {
	  request.get("/user/findAll")
      .then(response => {
        this.users = response.data;
      })
	},
	findAllArticle() {
	  request.get("/article/findAll")
      .then(response => {
        this.articles = response.data;
      })
	},
	dateFormat(cjsj) {
		var date = new Date(cjsj) 
        var Y = date.getFullYear() + '-'
        var M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-'
        var D = (date.getDate()+1 < 10 ? '0'+(date.getDate()) : date.getDate()) + ' '
        var h = (date.getHours()+1 < 10 ? '0'+(date.getHours()) : date.getHours()) + ':'
        var m = (date.getMinutes()+1 < 10 ? '0'+(date.getMinutes()) : date.getMinutes()) + ':'
        var s = (date.getSeconds()+1 < 10 ? '0'+(date.getSeconds()) : date.getSeconds())
        return Y+M+D+h+m+s
	}
  }
}
</script>
<style>
.el-dialog__header{
	background:#97c7bd
}
.el-form-item__label{
	background-color: #ecf5ff;
	height: 32px;
	padding: 0 5px;
	line-height: 30px;
	font-size: 12px;
	color: #409eff;
	border: 1px solid #d9ecff;
	border-radius: 4px;
	box-sizing: border-box;
	white-space: nowrap;
	text-align: center;
	line-height: 32px!important;
}
.el-form-item__content{
	height:32px;
	line-height:32px!important;
	margin-left:90px!important
}
.el-dialog__body,.el-dialog__footer{
	background:#f5f5f5
}
#el-form-item,#el-form-item .el-form-item__content{
	position:relative;
	height:auto;
	width:auto
}
#el-form-item div .el-cascader-panel{
	overflow-x:auto
}
#cascader-menu-2720-1,#cascader-menu-2720-1 div{
	overflow:hidden
}
@media screen and (max-width: 767px) {
	.el-dialog{
		width:90%;
		margin: 100px 5% 0 5%
	}

}
</style>
