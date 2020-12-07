<template>
  <!-- 采购管理 -->
  <div class="pro_purchase_list">
    {{selectedRowKeys}}
    <div class="btns" style="padding:1em;margin-bottom:1em;background:#fff">
      <el-button v-if="selectedRowKeys.length>0" style="margin-right: 6px" type="primary" icon="el-icon-document" size="small" :loading="downloadLoading" @click="handleDownload">导出Excel</el-button>
     <!-- <el-tooltip class="item" v-if="selectedId.length > 0" effect="dark" content="批量删除" placement="bottom-start">
        <el-button type="danger" size="small" icon="el-icon-delete" @click="batchDelete">批量删除</el-button>
      </el-tooltip>-->
      <el-select v-model="searchForm.proDetailId" style="margin-right: 6px" filterable clearable placeholder="请选择项目" value-key="name">
        <el-option v-for="item in projects" :key="item.id" :label="item.name" :value="item.id" />
      </el-select>
      <el-button style="margin-right: 6px" type="primary" icon="el-icon-search" size="small" @click="toSearch">查询</el-button>
    </div>
    <div style="padding:1em;margin-bottom:1em;background:#fff">
      <a-table
        ref="purchases"
        :rowKey="record => record.quote.id"
        :loading="loading"
        :data-source="purchases"
        :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }">
        <a-table-column title="序号">
          <template slot-scope="text, record, index">
            {{index+1}}
          </template>
        </a-table-column>
        <a-table-column key="quote.suModel" title="规格型号" data-index="quote.suModel" />
        <a-table-column key="inquiry.name" title="名称" data-index="inquiry.name" />
        <a-table-column key="inquiry.unit" title="单位" data-index="inquiry.unit" />
        <a-table-column key="inquiry.number" title="数量" data-index="inquiry.number" />
        <a-table-column key="inquiry.price" title="单价" data-index="inquiry.price" />
        <a-table-column key="inquiry.totalPrice" title="总价" data-index="inquiry.totalPrice" />
        <a-table-column key="inquiry.params" title="产品描述/备注" data-index="inquiry.params" />
        <!--<a-table-column key="action" title="操作">
          <template slot-scope="text, record">
            <el-tooltip class="item" effect="dark" content="选择历史产品" placement="bottom-start">
              <el-button type="success" icon="el-icon-star-on" size="mini" style="padding: 7px 10px;background: #faad14;border-color:#faad14">产品池选择</el-button>
            </el-tooltip>
          </template>
        </a-table-column>-->
      </a-table>
    </div>
  </div>
</template>
<script>
  import request from '@/utils/request'
  import qs from 'querystring'
  import '@/styles/auto-style.css'
  import { getUser } from '@/utils/auth'
  import XLSX from 'xlsx'

  export default {
    data() {
      return {
        searchForm: {},
        purchases: [],
        loading: true,
        downloadLoading: false,
        selectedRowKeys: [],
        projects: []
      }
    },
    created() {
      this.init()
    },
    methods: {
      handleDownload() {
        if (this.selectedRowKeys.length) {
          this.downloadLoading = true
          import('@/vendor/Export2Excel').then(excel => {
            const tHeader = ['规格型号', '名称', '单位', '数量', '单价', '总价', '产品描述/备注']
            const filterVal = ['suModel', 'name', 'unit', 'number', 'price',
              'totalPrice', 'params']
            let list = []
            this.purchases.map(item=>{
              if(this.selectedRowKeys.includes(item.quote.id)){
                list.push({
                  suModel: item.quote.suModel,
                  name: item.inquiry.name,
                  unit: item.inquiry.unit,
                  number: item.inquiry.number,
                  price: item.inquiry.price,
                  totalPrice: item.inquiry.totalPrice,
                  params: item.inquiry.params,
                })
              }
            })
            const data = this.formatJson(filterVal, list)
            excel.export_json_to_excel({
              header: tHeader,
              data,
              filename: this.filename
            })
            this.downloadLoading = false
            this.selectedRowKeys = []

          })
        } else {
          this.$message({
            message: 'Please select at least one item',
            type: 'warning'
          })
        }
      },
      formatJson(filterVal, jsonData) {
        return jsonData.map(v => filterVal.map(j => v[j]))
      },
      onSelectChange(selectedRowKeys, selectedRows) {
        const rows = selectedRows.map(item => {
          if (item.quote.id) {
            return item.quote.id
          }
        })
        this.selectedRowKeys = rows
      },
      toSearch() {
        if(this.searchForm.proDetailId) {
          request.get('/proPurchase/findProPurchase?proDetailId='+this.searchForm.proDetailId)
            .then(response => {
              this.purchases = response.data
              this.loading = false
            }).catch(()=> {
              this.loading = false
            })
        }
      },
      async init() {
        await this.loadProjects()
        if(this.projects.length > 0){
          if(!this.searchForm.proDetailId) {
            this.$set(this.searchForm, 'proDetailId', this.projects[0].id)
          }
          this.toSearch()
        }else {
          this.loading = false
        }
      },
      async loadProjects() {
        await request.get('/project/detail/findByAll')
          .then(response => {
            this.projects = response.data
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
