<template>
  <div>
	<div style='background: #fff;padding: 1em;margin-bottom: 1em'>
		<el-tooltip class="item" effect="dark" content="发布" placement="bottom-start">
		  <el-button type="primary" size="small" @click="toPublishArticle">发布</el-button>
		</el-tooltip>

	</div>
	<div style='background: #fff;padding: 1em;margin-bottom: 1em'>
		<el-table :data="tableData" style="width: 100%" v-loading="loading" size="small">
		  <el-table-column prop="id" label="编号" width="180"> </el-table-column>
		  <el-table-column prop="name" label="物品名" width="180"> </el-table-column>
		  <el-table-column prop="author.username" label="发布者"> </el-table-column>
		  <el-table-column prop="type" :formatter="toFormatType" label="类型"></el-table-column>
		  <el-table-column prop="category.name" label="对应标签"> </el-table-column>
		  <el-table-column label="状态"><template slot-scope='scope'>{{status[scope.row.status]}}</template></el-table-column>
		  <el-table-column label="是否上架"><template slot-scope='scope'>{{scope.row.isOnsale==0?'已下架':'已上架'}}</template></el-table-column>
		  <el-table-column
			fixed="right"
			label="操作"
			align="center"
			width="100">
			<template slot-scope="scope">
			  <el-button type="text" size="small">查看</el-button>
			  <el-button @click="toEditArticle(scope.row)" type="text" size="small">编辑</el-button>
			</template>
		  </el-table-column>
		</el-table>
	</div>
  </div>
</template>

<script>
import request from '@/utils/request'
export default {
  // 模板中要用到的变量
  data(){
    return {
      tableData:[],
	  loading:'true',
	  status: ['待归还','归还中','归还成功']
    }
  },
  // 声明周期钩子函数
  created(){
    // 查询所有物品信息
    request.get("/article/cascadeFindAll")
    .then(response =>{
      this.tableData = response.data
	    this.loading = false
    })
  },
  // 方法，模块中要用到的方法，
  methods:{
    toPublishArticle(){
      // 跳转页面
      this.$router.push({
        path:'/article/editor?action=publish',
      })
    },
    toEditArticle(row){
      this.$router.push({
        path:'/article/editor?action=edit',
        query:row,
      })
    },
	toFormatType(article){
	  return article.type == 0?'丢失':'拾取'
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
@media screen and (max-width: 767px) {
	.el-dialog{
		width:90%;
		margin: 100px 5% 0 5%
	}

}
</style>
