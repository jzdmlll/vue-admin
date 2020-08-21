<template>
  <div>
	<div style='background: #fff;padding: 1em;margin-bottom: 1em'>
		<!-- 按钮 -->
		<el-button type="primary" size="small" @click="toAdd">新增</el-button>
		<el-button type="danger" size="small" @click="batchDelete" v-bind:style="{ display:display}">批量删除</el-button>
		<!-- /按钮 -->
	</div>
	<div style='background: #fff;padding: 1em;margin-bottom: 1em'>
		<!-- 表格 -->
		<el-table :data="categories" @selection-change="handleSelectionChange"  size="small" v-loading="loading">
		  <el-table-column type="selection" width="55"></el-table-column>
		  <el-table-column prop="id" label="编号"></el-table-column>
		  <el-table-column prop="name" label="名称"></el-table-column>
		  <el-table-column prop="description" label="描述"></el-table-column>
		  <el-table-column prop="parentId" label="父标签编号"></el-table-column>
		  <el-table-column
			fixed="right"
			label="操作"
			align="center"
			width="100">
			<template slot-scope="scope">
			  <el-button @click="toEdit(scope.row)" type="text" size="small">编辑</el-button>
			  <el-button @click="toDelete(scope.row.id)" type="text" size="small">删除</el-button>
			</template>
		  </el-table-column>
		</el-table>
		<!-- /表格 -->
		<!-- 模态框 -->
		<el-dialog :title="title" :visible.sync="visible">
		  <el-form :model="form">
			<el-form-item label="标签名称" label-width="80px">
			  <el-input v-model="form.name" autocomplete="off"></el-input>
			</el-form-item>
			<el-form-item label="标签介绍" label-width="80px">
			  <el-input type="textarea" v-model="form.description" autocomplete="off"></el-input>
			</el-form-item>
			<el-form-item label="父标签" label-width="80px">
			  <el-select clearable v-model="form.parentId" placeholder="请选择父标签">
				<el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.id"></el-option>
			  </el-select>
			</el-form-item>
		  </el-form>
		  <div slot="footer" class="dialog-footer">
			<el-button @click="visible = false" size="small">取 消</el-button>
			<el-button type="primary" @click="submitForm" size="small">确 定</el-button>
		  </div>
		</el-dialog>
		<!-- /模态框 -->
	</div>
    
  </div>
</template>
<script>
import request from '@/utils/request'
import qs from 'querystring'
export default {
  // 数据
  data(){
    return {
      visible:false,
      form:{},
      title:"新增标签",
      categories:[],
      ids:[],
	  display: 'none',
	  loading: 'true'
    }
  },
  // 生命周期
  created(){
    this.reloadData();
  },
  // 方法
  methods:{
    handleSelectionChange(val){
		if(val.length>0){
			this.display = 'inline-block';
		}else{
			this.display = 'none';
		}
      this.ids = val.map(item => item.id);
    },
    reloadData(){
		this.loading = true
      let url = "/category/findAll"
      request.get(url).then(response => {
        this.categories = response.data;
		this.loading = false
      })
    },
    toAdd(){
	  this.title = '新增标签'
      this.form = {}
      this.visible = true
    },
    toEdit(record){
      // 将要编辑的数据绑定表单中
	  this.title = '修改标签'
      this.form = record;
      this.visible = true;
    },
    batchDelete(){
      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      .then(() =>{
        let url = "/category/batchDelete"
        request.request({
          url,
          method:"post",
          headers:{
            'Content-Type':'application/x-www-form-urlencoded'
          },
          data:qs.stringify({ids:this.ids})
        })
        .then(response=>{
          this.$message({ type: 'success', message: response.message });
          // 重载数据
          this.reloadData();
        })
      })
    },
    toDelete(id){
      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let url = "/category/deleteById"
        request.get(url,{params:{id}})
        .then(response=>{
          this.$message({
            type: 'success',
            message: response.message
          });
          // 重载数据
          this.reloadData();
        })
      })
    },
    submitForm(){
      request.request({
        url:'/category/saveOrUpdate',
        method:'post',
        headers:{
          'Content-Type':'application/x-www-form-urlencoded'
        },
        data:qs.stringify(this.form)
      })
      .then(response =>{
        // 提示成功
        this.$message({
          message:response.message,
          type:'success'
        })
        // 关闭模态
        this.visible = false;
        // 重载数据
        this.reloadData();
      })
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