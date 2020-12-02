<template>
  <!-- 用户管理 -->
  <div class="user_list">
    <div class="btns" style="padding:1em;margin-bottom:1em;background:#fff">
      <el-tooltip class="item" effect="dark" content="添加新用户" placement="bottom-start">
        <el-button type="primary" icon="el-icon-plus" size="mini" @click="toAdd">添加新用户</el-button>
      </el-tooltip>
    </div>
    <div style="padding:1em;margin-bottom:1em;background:#fff">
      <el-table v-loading="loading" :data="users" size="small">
        <el-table-column type="index" prop="" label="序号" width="120" />
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="roles" label="所属角色">
          <template slot-scope="scope">
            <el-tag
              v-for="role in scope.row.roles"
              :key="role"
              :type="role.name === '管理员' ? 'success':'info'"
            >
              {{ role.name }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="180">
          <template slot-scope="scope">
            <el-tooltip class="item" effect="dark" content="修改用户信息" placement="bottom-start">
              <el-button icon="el-icon-edit" type="success" size="mini" @click="toEdit(scope.row)" />
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="删除用户" placement="bottom-start">
              <el-button icon="el-icon-delete" type="danger" size="mini" @click="deleteHandler(scope.row.id)" />
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="给用户设置角色" placement="bottom-start">
              <el-button icon="el-icon-setting" type="primary" size="mini" @click="toSetRole(scope.row)" />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <!-- 模态框 -->
    <el-dialog :title="title" :visible.sync="visible">
      <el-form :model="form">
        <el-form-item label="用户名" label-width="80px">
          <el-input v-model="form.username" autocomplete="off" />
        </el-form-item>
        <el-form-item label="密码" label-width="80px">
          <el-input v-model="form.password" show-password />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="visible = false">取 消</el-button>
        <el-button type="primary" size="small" @click="saveUserHandler">确 定</el-button>
      </div>
    </el-dialog>
    <!-- /模态框 -->
    <!-- 角色模态框 -->
    <el-dialog title="设置角色" :visible.sync="role_visible">
      <el-form :model="user">
        <el-form-item label="用户名" label-width="80px">
          {{ user.username }}
        </el-form-item>
        <el-form-item label="角色" label-width="80px">
          <el-select v-model="user.roles" multiple placeholder="请选择" value-key="name">
            <el-option v-for="item in roles" :key="item.id" :label="item.name" :value="item" />
          </el-select>
          <!--<el-cascader v-model="user.roles" :options="roles" :props="props" clearable></el-cascader>-->
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="role_visible = false">取 消</el-button>
        <el-button type="primary" size="small" @click="setRolesHandler">确 定</el-button>
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
      role_visible: false,
      title: '添加用户',
      user: {},
      users: [],
      roles: [],
      props: { multiple: true, value: 'id', label: 'name', emitPath: false },
      loading: 'true'
    }
  },
  async created() {
    await this.loadUsers()
    await this.loadRoles()
  },
  methods: {
    loadRoles() {
      request.get('/role/findAll')
        .then(response => {
          this.roles = response.data
          this.loading = false
        })
    },
    saveUserHandler() {
      request.request({
        url: '/user/saveOrUpdate',
        method: 'post',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: qs.stringify(this.form)
      })
        .then(response => {
          this.visible = false
          this.$message({ message: response.message, type: 'success' })
          this.loadUsers()
        })
    },
    toAdd() {
      this.title = '添加用户'
      this.form = {}
      this.visible = true
    },
    loadUsers() {
      request.get('/user/cascadeRoleFindAll')
        .then(response => {
          this.users = response.data
        })
    },
    deleteHandler(id) {
      this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        request.get('/user/deleteById?id=' + id)
          .then(response => {
            this.$message({ type: 'success', message: response.message })
            this.loadUsers()
          })
      })
    },
    toEdit(record) {
      this.title = '修改用户'
      this.form = record
      this.visible = true
    },
    toSetRole(record) {
      // 初始化角色
      // record.roles = [];
      this.user = record
      this.role_visible = true
    },
    toDetails() {

    },
    setRolesHandler() {
      for (var i = 0; i < this.user.roles.length; i++) {
        this.user.roles[i] = this.user.roles[i].id
      }
      request.request({
        url: '/user/setRoles',
        method: 'post',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: qs.stringify({
          id: this.user.id,
          roles: this.user.roles
        })
      })
        .then(response => {
          this.role_visible = false
          this.$message({ message: response.message, type: 'success' })
          this.loadUsers()
        })
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
