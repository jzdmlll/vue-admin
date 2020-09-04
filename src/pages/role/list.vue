<template>
  <!-- 角色管理 -->
  <div class="role_list">
    <div class="btns" style="padding:1em;margin-bottom:1em;background:#fff">
		<el-tooltip class="item" effect="dark" content="添加角色" placement="bottom-start">
      <el-button type="primary" size="small" @click="toAdd">添加</el-button>
		</el-tooltip>
    </div>
	<div style="padding:1em;margin-bottom:1em;background:#fff">
		<el-table :data="roles" size="small" v-loading="loading">
      <el-table-column type="index" prop="" label="序号" width="120"/>
      <el-table-column prop="name" label="角色名称"></el-table-column>
      <el-table-column label="操作" align="center" width="180">
			<template slot-scope="scope">
      <el-tooltip class="item" effect="dark" content="修改角色" placement="bottom-start">
        <el-button icon="el-icon-edit" type="success" size="mini" @click="toEdit(scope.row)"></el-button>
      </el-tooltip>
      <el-tooltip class="item" effect="dark" content="删除角色" placement="bottom-start">
        <el-button icon="el-icon-delete" type="danger" size="mini" @click="deleteHandler(scope.row.id)"></el-button>
      </el-tooltip>
      <el-tooltip class="item" effect="dark" content="给角色授权" placement="bottom-start">
        <el-button icon="el-icon-key" type="primary" size="mini" @click="toAuthorization(scope.row)"></el-button></el-tooltip>
			</template>
      </el-table-column>
		</el-table>
	</div>
    <!-- 模态框 -->
    <el-dialog :title="title" :visible.sync="visible">
      <el-form :model="form">
        <el-form-item label="角色名称" label-width="80px">
          <el-input v-model="form.name" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="visible = false" size="small">取 消</el-button>
        <el-button type="primary" size="small" @click="saveRoleHandler">确 定</el-button>
      </div>
    </el-dialog>
    <!-- /模态框 -->
    <!-- 授权模态框 -->
    <el-dialog title="授权" :visible.sync="authorization_visible">
      <el-form :model="role">
        <el-form-item label="角色名称" label-width="80px">
          {{role.name}}
        </el-form-item>
        <el-form-item label="权限" label-width="80px" id="el-form-item">
          <el-cascader-panel v-model="role.privileges" :options="options" :props="props" clearable></el-cascader-panel>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="authorization_visible = false" size="small">取 消</el-button>
        <el-button type="primary" size="small" @click="authorizationHandler">确 定</el-button>
      </div>
    </el-dialog>
    <!-- /模态框 -->
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
      authorization_visible: false,
      title: '添加角色',
      role: {}, // 当前角色
      roles: [], // 角色列表
      props: { multiple: true, value: 'id', label: 'name', emitPath: false },
      options: [],
      loading: true
    }
  },
  created() {
    // 加载角色
    this.loadRoles()
    // 加载权限
    this.loadPrivileges()
  },
  methods: {
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
          this.loadRoles()
        })
    },
    saveRoleHandler() {
      request.request({
        url: '/role/saveOrUpdate',
        method: 'post',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: qs.stringify(this.form)
      })
      .then(response=>{
        this.visible = false;
        this.$message({message:response.message,type:'success'});
        this.loadRoles();
      })
    },
    loadPrivileges(){
      request.get("/privilege/findPrivilegeTree")
      .then(response=>{
        this.options = response.data;
      })
    },
    toAdd(){
      this.visible = true;
    },
    loadRoles(){
      request.get("/role/cascadePrivilegeFindAll")
      .then(response => {
        response.data.forEach(item=>{
          item.privileges = item.privileges.map(p => p.id)
        })
        this.roles = response.data;
		this.loading = false
      })
    },
    deleteHandler(id){
      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        request.get("/role/deleteById?id="+id)
        .then(response=>{
          this.$message({ type: 'success', message:response.message });
          this.loadRoles();
        })
      })
    },
    toAuthorization(record){
      this.role = record;
      this.authorization_visible = true;
    },
    toEdit(record) {
      this.title = '修改角色'
      this.visible = true
      this.form = record
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
