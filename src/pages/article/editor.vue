<template>
  <div>
    <div style='background: #fff;padding: 1em;margin-bottom: 1em'>
      <el-tooltip class="item" effect="dark" content="返回上一页" placement="bottom-start">
        <el-button type="primary" size="small" @click="back">返回</el-button>
      </el-tooltip>
    </div>
    <div style='background: #fff;padding: 1em;margin-bottom: 1em'>
      <el-form ref="form" :model="form" label-width="80px">
        <el-tabs v-model="type" @tab-click="tabHandleClick">
          <el-tab-pane v-bind:label="'失物'+action" name="0">
		  <el-form-item label="物品名">
              <el-input v-model="form.name"></el-input>
              </el-form-item>
            <el-form-item label="所属标签">
            <el-select v-model="form.category" placeholder="请选择所属标签" value-key="name">
              <el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c"></el-option>
            </el-select>
            </el-form-item>
            <el-form-item label="发布者">
            <el-select v-model="form.author" placeholder="请选择发布者" value-key="username">
              <el-option v-for="u in users" :key="u.id" :label="u.username" :value="u"></el-option>
            </el-select>
            </el-form-item>
           <el-form-item label="丢/拾地点">
              <el-input v-model="form.place"></el-input>
              </el-form-item>
			  <el-form-item label="丢/拾时间" label-width="80px">
          <el-date-picker value-format="timestamp" v-model="form.time" type="datetime" placeholder="请选择时间" default-time="12:00:00"></el-date-picker>
        </el-form-item>
            <el-form-item label="失物描述">
            <el-input type="textarea" v-model="form.describe"></el-input>
            </el-form-item><br>
            <el-form-item label="状态">
            <el-switch
                v-model="isOnsale"
                active-color="#13ce66"
                active-value="1"
                inactive-value="0"
                inactive-color="#ff4949"
                @change="handleStatusChange">
              </el-switch>
             <el-tag v-bind:type="form.isOnsale==0?'danger':'success'">{{form.isOnsale==0?'已下架':'已上架'}}</el-tag>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane v-bind:label="'招领'+action" name="1">
		      <el-form-item label="物品名">
              <el-input v-model="form.name"></el-input>
              </el-form-item>
            <el-form-item label="所属标签">
              <el-select v-model="form.category" placeholder="请选择所属标签" value-key="name">
                <el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c"></el-option>
              </el-select>
              </el-form-item>
              <el-form-item label="发布者">
              <el-select v-model="form.author" placeholder="请选择发布者" value-key="username">
                <el-option v-for="u in users" :key="u.id" :label="u.username" :value="u"></el-option>
              </el-select>
              </el-form-item>
              <el-form-item label="丢/拾地点">
              <el-input v-model="form.place"></el-input>
              </el-form-item>
			  <el-form-item label="丢/拾时间" label-width="80px">
          <el-date-picker value-format="timestamp" v-model="form.time" type="datetime" placeholder="请选择时间" default-time="12:00:00"></el-date-picker>
        </el-form-item>
              <el-form-item label="物品描述">
              <el-input type="textarea" v-model="form.describe"></el-input>
              </el-form-item><br>
              <el-form-item label="状态">
              <el-switch
                v-model="isOnsale"
                active-color="#13ce66"
                active-value="1"
                inactive-value="0"
                inactive-color="#ff4949"
                @change="handleStatusChange">
              </el-switch>
              <el-tag v-bind:type="form.isOnsale==0?'danger':'success'">{{form.isOnsale==0?'已下架':'已上架'}}</el-tag>
              </el-form-item>
          </el-tab-pane>
        </el-tabs>
        <el-form-item id="el-form-item__content">
        <el-button type="primary" @click="onSubmit">{{action}}</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
<script>
import request from '@/utils/request'
import qs from 'querystring'
export default {
  data(){
    return {
      form:{},
	    categories:[],
	    type:'0',
	    action:"发布",
	    users:[],
    }
  },
  created(){
    this.form = this.$route.query
	  this.reloadData()
	  let arr = this.$route.fullPath.split('=')
	  if(arr[arr.length-1]=="publish"){
	    this.action = '发布'
	    this.form.type = this.type
	  }else{
	    this.action = '修改'
		this.isOnsale = this.form.isOnsale+''
	    this.type = this.form.type+""
	    
	  }
  },
  methods:{
    back(){
      this.$router.go(-1);
    },
    onSubmit(){
      // 交互
	    this.form.categoryId = this.form.category.id
	    this.form.authorId = this.form.author.id
      request.request({

        url:"/article/saveOrUpdate",
        method:"post",
        headers:{
          "Content-Type":"application/x-www-form-urlencoded"
        },
        data:qs.stringify(this.form)
      })
      .then(response =>{
        // 提示成功
        this.$message({
          message: response.message,
          type: 'success'
        });
        // 返回列表页
        this.back();
      })
    },
	  reloadData(){
	    //查询所有标签信息
      let url = "/category/findAll"
      request.get(url).then(response => {
        this.categories = response.data;
      })
      // 查询所有用户信息
      request.get("/user/findAll")
      .then(response =>{
        this.users = response.data;
      })
    },
    tabHandleClick(){
      if(this.type == 1){
        this.form.type = 1
      }else{
        this.form.type = 0
      }
    },
    handleStatusChange(){
      if(this.form.isOnsale == 1){
	  this.form.isOnsale = 0
	  }else {
	  this.form.isOnsale = 1
	  }
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
.el-form-item__content .el-button--medium{
	margin-top:10px
}
@media screen and (min-width: 300px) and (max-width: 433px) {
	.el-form-item__content .el-button--medium{
		margin-top:10px;
		width:100%;
		position:absolute;
		left:0
	}
	#el-form-item__content div{
		margin-left:0!important;
		width:100%
	}
}
@media screen and (max-width: 767px) {
	.el-dialog{
		width:90%;
		margin: 100px 5% 0 5%
	}

}
</style>
