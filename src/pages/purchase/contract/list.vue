<template>
  <!-- 合同管理 -->
  <div class="contract_list">
    <div class="btns" style="padding:1em;margin-bottom:1em;background:#fff">
      <el-button type="primary" icon="el-icon-plus" size="mini" @click="toAdd">添加</el-button>
      <el-select v-model="searchForm.purProjectId" style="margin-right: 6px" filterable clearable placeholder="请选择项目" value-key="name">
        <el-option v-for="item in purchasePros" :key="item.id" :label="item.projectName" :value="item.id" />
      </el-select>
      <el-button type="primary" icon="el-icon-search" size="mini" @click="toSearch">查询</el-button>
    </div>
    <el-card shadow="never">
      <div slot="header" class="index-md-title">
        <span>采购合同表</span>
      </div>
      <a-table
        size="small"
        ref="contracts"
        :rowKey="record => record.id"
        :loading="contractsLoading"
        :data-source="contracts"
        :scroll="windowWidth< 1000 && contracts.length > 0 ?{ x: 1000}:{}"
        >
        <a-table-column title="序号" align="center" :width="60">
          <template slot-scope="text, record, index">
            {{index+1}}
          </template>
        </a-table-column>
        <a-table-column align="center" :width="120" key="contractName" title="合同名" data-index="contractName" />
        <a-table-column align="center" :width="160" key="contractNo" title="合同编号" data-index="contractNo" />
        <a-table-column align="center" :width="160"  key="time" title="生成时间" data-index="time">
          <template slot-scope="text, record, index">
            {{dateTimeFormat(text)}}
          </template>
        </a-table-column>
        <!--<a-table-column :width="100" align="center" v-for="item in audits" :key="item.key" :title="item.title" :data-index="item.key">
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
        </a-table-column>-->
        <a-table-column title="审核进度" align="center" :width="260">
          <template slot-scope="text, record">
            <a-tooltip destroyTooltipOnHide="true">
              <div slot="title">
                <el-row style="width: 260px;">
                  <el-col v-for="(item, index) in audits" :key="index" class="progress-tooltip-col" :span="8">
                    <div class="progress-tooltip-col-div"><a-icon theme="filled" :style="{color: checkIcon[record[item['key']]].color}" :type="checkIcon[record[item['key']]].type" /></div>
                    <div class="progress-tooltip-col-div">{{record[item['remark']]}}</div>
                  </el-col>
                </el-row>
              </div>
            <a-progress
              :stroke-color="{
                from: '#108ee9',
                to: '#87d068',
              }"
              :percent="record.threeAudit == 1?100:record.secondAudit == 1?67:record.firstAudit == 1?33:0"
              status="active"
            />
            </a-tooltip>
          </template>
        </a-table-column>
        <a-table-column align="center" :width="120" key="remark" title="备注" data-index="remark" />
        <a-table-column fixed="right" align="center" :width="120" key="action" title="操作">
          <template slot-scope="text, record">
            <el-button type="primary" size="mini" style="padding: 7px 10px;">送审</el-button>
          </template>
        </a-table-column>
      </a-table>
    </el-card>
    <el-card shadow="never" style="margin-top: 1em">
      <div slot="header" class="index-md-title">
        <span>合同供货表</span>
      </div>
      <a-table
        size="small"
        ref=""
      >

      </a-table>
    </el-card>
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

    <!-- 模态框 -->
    <el-dialog :title="title" :visible.sync="dialogVisible">
      <el-form ref="form" status-icon :model="form">
        <el-form-item label="采购项目" label-width="80px">
          <el-select v-model="form.projectId" clearable placeholder="请选择">
            <el-option v-for="p in purchasePros" :key="p.id" :label="p.projectName" :value="p.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="采购合同编号">
          <el-input v-model="form.number" autocomplete="off" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="visible = false">取 消</el-button>
        <el-button type="primary" size="small" @click="saveRecordHandler('form')">确 定</el-button>
      </div>
    </el-dialog>

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
        contractsLoading: false,
        purchasePros: [],

        checkIcon: [
          { color: '#909399', type: 'question-circle' },
          { color: '#13ce66', type: 'check-circle' },
          { color: '#ff4949', type: 'close-circle'},
        ],

        audits: [
          { key: 'firstAudit', title: '一级审核', remark: 'firstRemark' },
          { key: 'secondAudit', title: '二级审核', remark: 'secondRemark' },
          { key: 'threeAudit', title: '三级审核', remark: 'threeRemark'}
        ],

        title: '',
        dialogVisible: false,
        form: {},

        windowWidth: document.documentElement.clientWidth, // 屏幕实时宽度
      }
    },
    created() {
      this.loadProjects()
    },
    mounted() {
      var that = this;
      // <!--把window.onresize事件挂在到mounted函数上-->
      window.onresize = () => {
        return (() => {
          window.fullWidth = document.documentElement.clientWidth;
          that.windowWidth = window.fullWidth; // 宽
        })()
      };
    },
    methods: {
      toAdd() {
        this.dialogVisible = true
        this.form = {}
        this.title = '新增采购合同'
      },
      toSearch() {
        let projectId = ''
        if (this.searchForm.purProjectId) {
          projectId = this.searchForm.purProjectId
        }
        this.contractsLoading = true
        request.get('/purchase/contract/findByProjectId?projectId='+projectId)
          .then(resp => {
            this.contracts = resp.data
            this.contractsLoading = false
          })
      },
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
      loadProjects() {
        request.get('/purchase/project/findAllLike')
          .then(response => {
            this.purchasePros = response.data
          })
      },
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
.progress-tooltip-col {
  .progress-tooltip-col-div {
    text-align: center;
    .anticon {

    }
  }
}
</style>
