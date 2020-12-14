<template>
  <!-- 合同管理 -->
  <div class="contract_list">
    <div class="btns" style="padding:1em;margin-bottom:1em;background:#fff">
      <el-select v-model="searchForm.purchaseProId" style="margin-right: 6px" filterable clearable placeholder="请选择项目" value-key="name">
        <el-option v-for="item in purchasePros" :key="item.id" :label="item.name" :value="item.id" />
      </el-select>
      <el-button style="margin-right: 6px" type="primary" icon="el-icon-search" size="small" @click="toSearch">查询</el-button>
    </div>
    <div class="table-container">
      <a-table
        size="small"
        ref="contracts"
        :rowKey="record => record.id"
        :loading="contractsLoading"
        :data-source="contracts"
        >
        <a-table-column title="序号">
          <template slot-scope="text, record, index">
            {{index+1}}
          </template>
        </a-table-column>
        <a-table-column key="contractNo" title="合同编号" data-index="contractNo" />
        <a-table-column key="time" title="生成时间" data-index="time">
          <template slot-scope="text, record, index">
            {{dateTimeFormat(text)}}
          </template>
        </a-table-column>
        <a-table-column v-for="item in audits" :key="item.key" :title="item.title" :data-index="item.key">
          <template slot-scope="text, record, index">
            <el-switch
              v-model.string="text"
              active-color="#42B983"
              inactive-color="#8b8b8b"
              :active-value="1"
              :inactive-value="0"
              @change="switchChange(text, index, item.key)"
            >
            </el-switch>
          </template>
        </a-table-column>
        <a-table-column key="remark" title="备注" data-index="remark" />
        <a-table-column key="action" title="操作">
          <template slot-scope="text, record">
            <el-button type="primary" size="mini" style="padding: 7px 10px;">送审</el-button>
          </template>
        </a-table-column>
      </a-table>
    </div>
    <div class="table-container">
      <a-row type="flex" justify="start" :gutter="3">
        <a-col :sm="24" :lg="6" style="padding: 12px">

        </a-col>
        <a-col :sm="24" :lg="18" style="padding: 12px">
          <a-table
            size="small"
            ref=""
          >

          </a-table>
        </a-col>
      </a-row>
      <!--<a-table
        size="middle"
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
        <a-table-column key="quote.supplier" title="合同编号" data-index="quote.supplier" />
        <a-table-column key="quote.suBrand" title="生成时间" data-index="quote.suBrand" />
        <a-table-column key="quote.suModel" title="规格型号" data-index="quote.suModel" />
        <a-table-column key="inquiry.name" title="名称" data-index="inquiry.name" />
        <a-table-column key="inquiry.unit" title="单位" data-index="inquiry.unit" />
        <a-table-column key="inquiry.number" title="数量" data-index="inquiry.number" />
        <a-table-column key="inquiry.price" title="单价" data-index="inquiry.price" />
        <a-table-column key="inquiry.totalPrice" title="总价" data-index="inquiry.totalPrice" />
        <a-table-column key="inquiry.params" title="技术要求" data-index="inquiry.params" />
        <a-table-column key="quote.suDelivery" title="货期" data-index="inquiry.suDelivery" />
        <a-table-column key="inquiry.remark" title="备注" data-index="inquiry.remark" />
      </a-table>-->
    </div>
  </div>
</template>
<script>
  import request from '@/utils/request'
  import qs from 'querystring'
  import '@/styles/auto-style.css'
  import { getUser } from '@/utils/auth'
  import XLSX from 'xlsx'
  import { dateTimeFormat } from '@/utils/format'

  export default {
    data() {
      return {
        searchForm: {},
        contracts: [],
        contractsLoading: true,
        purchasePros: [],

        audits: [
          { key: 'firstAudit', title: '一级审核' },
          { key: 'secondAudit', title: '二级审核' },
          { key: 'threeAudit', title: '三级审核'}
        ]
      }
    },
    created() {
      this.init()
    },
    methods: {
      switchChange(text, index, key) {
        if(text == 1){
          this.contracts[index][key] = 1
        }else {
          this.contracts[index][key] = 0
        }

      },
      dateTimeFormat,
      handleDownload() {
        if (this.selectedRowKeys.length) {
          this.downloadLoading = true
          import('@/vendor/Export2Excel').then(excel => {
            const tHeader = ['序号', '设备名称', '型号', '配置需求',  '单位', '数量', '单价', '总价', '设备厂家', '货期', '备注']
            const filterVal = ['sort', 'name', 'suModel', 'params', 'unit', 'number', 'price',
              'totalPrice', 'supplier', 'delivery', 'remark']
            let list = []
            let sort = 0
            this.purchases.map(item=>{
              sort ++
              if(this.selectedRowKeys.includes(item.quote.id)){
                list.push({
                  sort: sort,
                  name: item.inquiry.name,
                  suModel: item.quote.suModel,
                  params: item.inquiry.params,
                  unit: item.inquiry.unit,
                  number: item.inquiry.number,
                  price: item.inquiry.price,
                  totalPrice: item.inquiry.totalPrice,
                  supplier: item.quote.supplier,
                  delivery: item.quote.suDelivery,
                  remark: item.inquiry.remark,
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
        if(this.searchForm.purchaseProId) {
          /*request.get('/proPurchase/findProPurchase?proDetailId='+this.searchForm.proDetailId)
            .then(response => {
              this.contracts = response.data
              this.contractsLoading = false
            }).catch(()=> {
              this.contractsLoading = false
            })*/
          this.contracts = [
            {id: 1, contractNo: 'Nk1283247', time: 1606701683024, firstAudit:'0', secondAudit:'0', threeAudit:'0', remark: '备注：XXXX'},
            {id: 2, contractNo: 'Nk1283247', time: 1606701683024, firstAudit:'0', secondAudit:'0', threeAudit:'0', remark: '备注：XXXX'},
            {id: 3, contractNo: 'Nk1283247', time: 1606701683024, firstAudit:'0', secondAudit:'0', threeAudit:'0', remark: '备注：XXXX'},
            {id: 4, contractNo: 'Nk1283247', time: 1606701683024, firstAudit:'0', secondAudit:'0', threeAudit:'0', remark: '备注：XXXX'},
            {id: 5, contractNo: 'Nk1283247', time: 1606701683024, firstAudit:'0', secondAudit:'0', threeAudit:'0', remark: '备注：XXXX'},
          ]

          this.contractsLoading = false
        }
      },
      async init() {
        await this.loadProjects()
        if(this.purchasePros.length > 0){
          if(!this.searchForm.purchaseProId) {
            this.$set(this.searchForm, 'purchaseProId', this.purchasePros[0].id)
          }
          this.toSearch()
        }else {
          this.loading = false
        }
      },
      async loadProjects() {
        await request.get('/project/detail/findByAll')
          .then(response => {
            this.purchasePros = response.data
          })
      }
    }
  }
</script>

<style lang="scss" scoped>
.contract_list {
  /deep/.el-form-item__content{
    height:auto;
    line-height:32px;
    margin-left:90px!important
  }
}
</style>
