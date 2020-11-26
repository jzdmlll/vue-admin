<template>
  <!-- 产品池管理 -->
  <div class="pro_pool_list">
    <div class="btns" style="padding:1em;margin-bottom:1em;background:#fff">
      <el-input v-model="form.name" style="width: auto" placeholder="请输入设备名"></el-input>
      <el-input v-model="form.brand" style="width: auto" placeholder="请输入品牌"></el-input>
      <el-button style="margin-right: 6px" type="primary" icon="el-icon-search" size="small" @click="toSearch">查询</el-button>
    </div>
    <div style="padding:1em;margin-bottom:1em;background:#fff">
      <el-table v-loading="loading" :data="pools" size="small">
        <el-table-column type="index" prop="" label="序号" width="60" />
        <el-table-column :show-overflow-tooltip="true" prop="proName" label="项目名" />
        <el-table-column :show-overflow-tooltip="true" prop="name" label="设备名" />
        <el-table-column :show-overflow-tooltip="true" prop="supplier" label="供应商" />
        <el-table-column :show-overflow-tooltip="true" prop="brand" label="品牌" />

        <el-table-column :show-overflow-tooltip="true" prop="params" label="技术参数" />
        <el-table-column :show-overflow-tooltip="true" prop="model" label="品牌型号" />
        <el-table-column :show-overflow-tooltip="true" prop="price" label="单价" />
        <el-table-column :show-overflow-tooltip="true" prop="delivery" label="货期" />

        <el-table-column :show-overflow-tooltip="true" prop="purchaseDate" label="采购时间" />
        <el-table-column :show-overflow-tooltip="true" prop="purchaseContractNo" label="采购合同" />
        <el-table-column :show-overflow-tooltip="true" prop="saleContractNo" label="销售合同" />
        <el-table-column :show-overflow-tooltip="true" label="时间">
          <template slot-scope="{row}">
            {{dateTimeFormat(row.time)}}
          </template>
        </el-table-column>
        <el-table-column :show-overflow-tooltip="true" prop="remark" label="备注" />
        <!--<el-table-column label="操作" align="center" width="180">
          <template slot-scope="scope">
            <el-tooltip class="item" effect="dark" content="修改角色" placement="bottom-start">
              <el-button icon="el-icon-edit" type="success" size="mini" @click="toEdit(scope.row)" />
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="删除角色" placement="bottom-start">
              <el-button icon="el-icon-delete" type="danger" size="mini" @click="deleteHandler(scope.row.id)" />
            </el-tooltip>
          </template>
        </el-table-column>-->
      </el-table>
    </div>
  </div>
</template>
<script>
  import request from '@/utils/request'
  import qs from 'querystring'
  import '@/styles/auto-style.css'
  import { dateTimeFormat,nullFormat } from '@/utils/format'

  export default {
    data() {
      return {
        projects: [],
        form: {},
        visible: false,
        authorization_visible: false,
        title: '添加角色',
        role: {}, // 当前角色
        pools: [], // 角色列表
        props: { multiple: true, value: 'id', label: 'name', emitPath: false },
        options: [],
        loading: true
      }
    },
    created() {
      this.loadpools()
    },
    methods: {
      toSearch() {
        request.request({
          url: '/pool/findByParams',
          method: 'get',
          params: {'name': this.form.name, 'brand': this.form.brand}
        })
        .then(response => {
          this.pools = response.data
          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
      },
      dateTimeFormat,
      loadpools() {
        request.get('/pool/findByParams')
        .then(response => {
          this.pools = response.data
          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
      },
    }
  }
</script>
