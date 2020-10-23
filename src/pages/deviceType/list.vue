<template>
  <!-- 设备类型管理 -->
  <div class="device_list">
    <div class="btns" style="padding:1em;margin-bottom:1em;background:#fff">
      <el-tooltip class="item" effect="dark" content="添加设备类型" placement="bottom-start">
        <el-button type="primary" size="small" icon="el-icon-plus" @click="toAdd">添加设备类型</el-button>
      </el-tooltip>
    </div>
    <div style="padding:1em;margin-bottom:1em;background:#fff">
      <el-table v-loading="loading" :data="devices" size="small">
        <el-table-column type="index" prop="" label="序号" width="120" />
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
        <el-form-item label="设备类型" label-width="80px">
          <el-input v-model="form.name" autocomplete="off" />
        </el-form-item>
        <el-form-item label="设备类型编码" label-width="80px">
          <el-input v-model="form.code" autocomplete="off" />
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
      form: {},
      visible: false,
      title: '添加设备类型',
      devices: [],
      loading: 'true'
    }
  },
  created() {
    this.loadDevices()
  },
  methods: {
    loadDevices() {
      request.get('/deviceType/findAllLike')
        .then(response => {
          this.devices = response.data
          this.loading = false
        })
    },
    toEdit() {},
    toAdd() {
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
          this.loadDevices()
        })
    },
  }
}
</script>
