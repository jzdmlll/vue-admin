<template>
  <!-- 权限管理 -->
  <div class="privilege_list">
    <div class="btns" style="padding:1em;margin-bottom:1em;background:#fff">
      <el-tooltip class="item" effect="dark" content="添加权限" placement="bottom-start">
        <el-button type="primary" size="small" @click="toAdd">添加</el-button>
      </el-tooltip>
    </div>
    <div style="padding:1em;margin-bottom:1em;background:#fff">
      <el-table
        :data="privileges"
        size="small"
        :lazy="true"
        row-key="id"
        :load="lazyLoadPrivilege"
        :tree-props="{children: 'children', hasChildren: 'hasChildren'}">
        <el-table-column prop="name" label="名称"></el-table-column>
        <el-table-column prop="route" label="路径"></el-table-column>
        <el-table-column prop="type" label="类型"></el-table-column>
        <el-table-column label="操作" align="center" width="120" fixed='right'>
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="deleteHandler(scope.row.id)">移除</el-button>
            <el-button type="text" size="small" @click="toEdit(scope.row)">修改</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <!-- 模态框 -->
    <el-dialog :title="title" :visible.sync="visible">
      <el-form :model="form">
        <el-form-item label="名称" label-width="80px">
          <el-input v-model="form.name" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="路径" label-width="80px">
          <el-input v-model="form.route" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="类型" label-width="80px">
          <el-select v-model="form.type" clearable placeholder="请选择">
            <el-option label="菜单" value="menu"></el-option>
            <el-option label="方法" value="method"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="父权限" label-width="80px">
          <el-select v-model="form.parentId" clearable placeholder="请选择">
            <el-option v-for="p in privileges" :key="p.id" :label="p.name" :value="p.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="描述" label-width="80px">
          <el-input type="textarea" v-model="form.remark" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="visible = false" size="small">取 消</el-button>
        <el-button type="primary" @click="submitHandler" size="small">确 定</el-button>
      </div>
    </el-dialog>
    <!-- /模态框 -->
  </div>
</template>
<script>
import request from '@/utils/request'
import qs from 'querystring'

export default {
  data() {
    return {
      form: {},
      visible: false,
      title: '',
      privileges: []
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
            item.hasChildren = !Boolean(item.parentId)
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
          response.data.forEach(item => {
            item.hasChildren = !Boolean(item.parentId)
          })
          this.privileges = response.data;
        })
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
<style>
  .el-dialog__header {
    background: #97c7bd
  }

  .el-form-item__label {
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
    line-height: 32px !important;
  }

  .el-form-item__content {
    height: 32px;
    line-height: 32px !important;
    margin-left: 90px !important
  }

  .el-dialog__body, .el-dialog__footer {
    background: #f5f5f5
  }

  @media screen and (max-width: 767px) {
    .el-dialog {
      width: 90%;
      margin: 100px 5% 0 5%
    }

  }
</style>
