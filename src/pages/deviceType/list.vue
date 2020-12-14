<template>
  <!-- 设备类型管理 -->
  <div class="device_list">
    <div class="btns" style="padding:1em;margin-bottom:1em;background:#fff">
      <el-tooltip class="item" effect="dark" content="添加设备类型" placement="bottom-start">
        <el-button type="primary" size="small" icon="el-icon-plus" @click="toAdd">添加设备类型</el-button>
      </el-tooltip>
      <el-input v-model="searchForm.name" placeholder="请输入设备类型"></el-input>
      <el-input v-model="searchForm.code" placeholder="请输入设备编码"></el-input>
      <el-button style="margin-right: 6px" type="primary" icon="el-icon-search" size="small" @click="toSearch">查询</el-button>
    </div>
    <div style="padding:1em;margin-bottom:1em;background:#fff">
      <el-table
        v-loading="loading"
        :data="devices"
        size="small"
        :lazy="true"
        row-key="id"
        :load="lazyLoad"
        :tree-props="{children: 'children', hasChildren: 'hasChildren'}">

        <el-table-column prop="name" label="设备类型" />
        <el-table-column prop="code" label="设备类型编码" />

        <el-table-column label="操作" align="center" width="180">
          <template slot-scope="scope">
            <el-tooltip class="item" effect="dark" content="修改设备类型信息" placement="bottom-start">
              <el-button icon="el-icon-edit" type="success" size="mini" @click="toEdit(scope.row)" />
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="删除设备类型" placement="bottom-start">
              <el-button icon="el-icon-delete" type="danger" size="mini" @click="deleteHandler(scope.row.id)" />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <!-- 模态框 -->
    <el-dialog :title="title" :visible.sync="visible">
      <el-form :model="form">
        <el-form-item label="设备类型名" label-width="80px">
          <el-input v-model="form.name" autocomplete="off" />
        </el-form-item>
        <el-form-item label="设备类型编码" label-width="80px">
          <el-input v-model="form.code" autocomplete="off" />
        </el-form-item>
        <el-form-item label="父类型" label-width="80px">
          <el-select v-model="form.parentId" style="margin-right: 6px" filterable clearable placeholder="请选择父类型" value-key="name">
            <el-option v-for="item in devices" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="visible = false">取 消</el-button>
        <el-button type="primary" size="small" @click="saveHandler">确 定</el-button>
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
      searchForm: {},
      form: {},
      visible: false,
      title: '添加设备类型',
      devices: [],
      loading: 'true'
    }
  },
  created() {
    this.init()
  },
  methods: {
    lazyLoad(row, treeNode, resolve) {
      request.get('/deviceType/findByParentId?parentId=' + row.id)
        .then(response => {
          response.data.forEach(item => {
            item.hasChildren = !item.parentId
          })
          resolve(response.data)
        })
    },
    toSearch() {
      this.loading = true
      request.request({
        url: '/deviceType/findByParentId',
        method: 'get',
        params: { name: this.searchForm.name, code: this.searchForm.code }
      })
        .then(response => {

          this.devices = response.data
          this.devices.forEach(item => {
            item.hasChildren = !item.parentId
            this.$set(this.devices, item, item)
          })
          this.loading = false
        }).catch(()=>{
        this.loading = false
      })
    },
    init() {
      this.toSearch()
    },
    toEdit() {},
    toAdd() {
      this.toSearch()
      this.visible = true
    },
    deleteHandler() {},
    saveHandler() {
      request.request({
        url: '/deviceType/saveOrUpdate',
        method: 'post',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: qs.stringify(this.form)
      })
        .then(response => {
          this.visible = false
          this.$message({ message: response.message, type: 'success' })
          this.init()
        })
    },
  }
}
</script>
<style lang="scss" scoped>
.device_list{
  /deep/.el-form-item__content{
    height:auto;
    line-height:32px;
    margin-left:90px!important
  }
}
</style>
