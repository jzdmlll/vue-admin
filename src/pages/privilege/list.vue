<template>
  <!-- 权限管理 -->
  <div class="privilege_list">
    <div class="btns" style="padding:1em;margin-bottom:1em;background:#fff">
      <el-tooltip class="item" effect="dark" content="添加权限" placement="bottom-start">
        <el-button type="primary" icon="el-icon-plus" size="mini" @click="toAdd">添加权限</el-button>
      </el-tooltip>
    </div>
    <div style="padding:1em;margin-bottom:1em;background:#fff">
      <a-table
        :loading="loading"
        :data-source="privileges"
        size="small"
        :row-key="record=>record.id"
        :scroll="privileges.length>0?{x:768}:{}"
      >
        <a-table-column key="name" title="名称" data-index="name" />
        <a-table-column key="route" title="路径" data-index="route" align="center"/>
        <a-table-column key="type" title="类型" data-index="type" align="center"/>
        <a-table-column key="action" title="操作" align="center" width="120" fixed="right">
          <template slot-scope="text, record">
            <el-tooltip class="item" effect="dark" content="删除权限" placement="bottom-start">
              <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteHandler(record.id)" />
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="修改权限" placement="bottom-start">
              <el-button type="success" icon="el-icon-edit" size="mini" @click="toEdit(record)" />
            </el-tooltip>
          </template>
        </a-table-column>
      </a-table>
    </div>
    <!-- 模态框 -->
    <el-dialog :title="title" :visible.sync="visible">
      <el-form :model="form">
        <el-form-item label="名称" label-width="80px">
          <el-input v-model="form.name" autocomplete="off" />
        </el-form-item>
        <el-form-item label="路径" label-width="80px">
          <el-input v-model="form.route" autocomplete="off" />
        </el-form-item>
        <el-form-item label="类型" label-width="80px">
          <el-select v-model="form.type" clearable placeholder="请选择">
            <el-option label="父级" value="parent" />
            <el-option label="菜单" value="menu" />
            <el-option label="方法" value="method" />
          </el-select>
        </el-form-item>
        <el-form-item label="父权限" label-width="80px">
          <el-select v-model="form.parentId" clearable placeholder="请选择">
            <el-option v-for="p in privileges" :key="p.id" :label="p.name" :value="p.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="图标" label-width="80px">
          <el-input v-model="form.icon" autocomplete="off" />
        </el-form-item>
        <el-form-item label="描述" label-width="80px">
          <el-input v-model="form.remark" type="textarea" autocomplete="off" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="visible = false">取 消</el-button>
        <el-button type="primary" size="small" @click="submitHandler">确 定</el-button>
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
      title: '',
      privileges: [],
      loading: true
    }
  },
  created() {
    this.loadprivileges()
  },
  methods: {
    submitHandler() {
      request.request({
        url: '/privilege/saveOrUpdate',
        method: 'post',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: qs.stringify(this.form)
      })
        .then(response => {
          this.visible = false
          this.$message({ message: response.message, type: 'success' })
          this.loadprivileges()
        })
    },
    lazyLoadPrivilege(row, treeNode, resolve) {
      request.get('/privilege/findByParentId?id=' + row.id)
        .then(response => {
          response.data.forEach(item => {
            item.hasChildren = !item.parentId
          })
          resolve(response.data)
        })
    },
    toAdd() {
      this.title = '添加权限'
      this.form = {}
      this.visible = true
    },
    loadprivileges() {
      request.get('/privilege/findByParentId')
        .then(response => {
          response.data = this.deleteChildren(response.data)
          this.privileges = response.data
          this.loading = false
        })
    },
    deleteChildren(privileges) {
      if (privileges.length > 0){
        let arr = []
        privileges.map(item => {
          if(item.children && item.children.length == 0) {
            this.$delete(item, 'children')
          }else {
            item.children = this.deleteChildren(item.children)
          }
          arr.push(item)
        })
        return arr
      }else {
        return
      }
    },
    deleteHandler(id) {
      this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        request.get('/privilege/deleteById?id=' + id)
          .then(response => {
            this.$message({ type: 'success', message: response.message })
            this.loadprivileges()
          })
      })
    },
    toEdit(record) {
      this.title = '修改权限'
      this.form = record
      this.visible = true
    }
  }
}
</script>

<style lang="scss" scoped>
.privilege_list{
  /deep/.el-form-item__content{
    height:auto;
    line-height:32px;
    margin-left:90px!important
  }
}
</style>
