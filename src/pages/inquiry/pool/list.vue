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
        <el-table-column :show-overflow-tooltip="true">
          <template slot-scope="{row}">
            <el-link type="primary" @click="goToProject(row.id)">默认链接</el-link>
          </template>
        </el-table-column>
        <el-table-column type="index" prop="" label="序号" width="60" />
        <el-table-column :show-overflow-tooltip="true" prop="equipmentName" label="设备名" />
        <el-table-column :show-overflow-tooltip="true" prop="brand" label="品牌" />
        <el-table-column :show-overflow-tooltip="true" prop="model" label="型号" />
        <el-table-column :show-overflow-tooltip="true" prop="technicalRequire" label="技术要求" />
        <el-table-column :show-overflow-tooltip="true" prop="unit" label="单位" />
        <el-table-column :show-overflow-tooltip="true" prop="supplier" label="供应商" />
        <el-table-column :show-overflow-tooltip="true" prop="quoteBrand" label="报价品牌" />
        <el-table-column :show-overflow-tooltip="true" prop="quoteModel" label="实际型号" />
        <el-table-column :show-overflow-tooltip="true" prop="technicalParams" label="实际参数" />
        <el-table-column :show-overflow-tooltip="true" prop="price" label="单价" />
        <el-table-column :show-overflow-tooltip="true" prop="delivery" label="货期" />
        <el-table-column :show-overflow-tooltip="true" prop="warranty" label="质保期" />
        <el-table-column :show-overflow-tooltip="true" prop="purchaseDate" label="采购时间" />
        <el-table-column :show-overflow-tooltip="true" prop="purchaseContractNo" label="采购合同" />
        <el-table-column :show-overflow-tooltip="true" prop="saleContractNo" label="销售合同" />
        <el-table-column  label="图片">
          <template slot-scope="{row}">
            <el-image fit="contain" style="height: 40px; width:auto" :src="row.image" :preview-src-list="[row.image]" v-if="row.image!=null && row.image != ''">
              <div slot="error" class="image-slot">
                <i class="el-icon-picture-outline"></i>
              </div>
            </el-image>
          </template>
        </el-table-column>

        <el-table-column :show-overflow-tooltip="true" prop="remark" label="备注" />
        <el-table-column :show-overflow-tooltip="true" label="时间">
          <template slot-scope="{row}">
            {{dateTimeFormat(row.time)}}
          </template>
        </el-table-column>
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
        pools: [],
        props: { multiple: true, value: 'id', label: 'name', emitPath: false },
        options: [],
        loading: true
      }
    },
    created() {
      this.loadPools()
    },
    methods: {
      goToProject(id) {
        this.$router.push('project/detail/list')
      },
      toSearch() {
        request.request({
          url: '/inquiryPool/findByParams',
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
      loadPools() {
        request.get('/inquiryPool/findByParams')
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
