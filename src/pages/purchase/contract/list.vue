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
        class="status-table"
        size="small"
        ref="contracts"
        :rowKey="record => record.id"
        :loading="contractsLoading"
        :data-source="contracts"
        :customRow="rowClick"
        :scroll="windowWidth < 768 && contracts.length > 0 ?{ x: 1000}:{}"
        :row-class-name="tableRowClassName"
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
            <a-tooltip v-if="!(record.firstAudit==null && record.secondAudit==null && record.threeAudit==null)" :destroyTooltipOnHide="true">
              <div slot="title">
                <el-row style="width: 260px;padding-right:6px">
                  <el-col v-if="record[item['key']]!=null" v-for="(item, index) in audits" :key="index" class="progress-tooltip-col" :span="24/countProgress(record.firstAudit, record.secondAudit, record.threeAudit)">
                    <div class="progress-tooltip-col-div" style="border-color: #fff; border-bottom: 1px solid"><a-icon theme="filled" :style="{color: checkIcon[record[item['key']]].color}" :type="checkIcon[record[item['key']]].type" /></div>
                    <div class="progress-tooltip-col-div">{{record[item['remark']]}}</div>
                  </el-col>
                </el-row>
              </div>
            <a-progress
              :stroke-color="{
                from: '#108ee9',
                to: '#87d068',
              }"
              :percent="calculateProgress(record.firstAudit, record.secondAudit, record.threeAudit)"
              status="active"
            />
            </a-tooltip>
            <el-tag v-else type="info">{{'未送审'}}</el-tag>
          </template>
        </a-table-column>
        <a-table-column align="center" :width="120" key="remark" title="备注" data-index="remark" />
        <a-table-column fixed="right" align="center" :width="120" key="action" title="操作">
          <template slot-scope="text, record">
            <el-button v-if="record.firstAudit==null && record.secondAudit==null && record.threeAudit==null" @click="toCheck(record)" type="primary" size="mini" style="padding: 7px 10px;">送审</el-button>
          </template>
        </a-table-column>
      </a-table>
    </el-card>
    <el-card shadow="never" style="margin-top: 1em">
      <div slot="header" class="index-md-title">
        <span>合同供货表</span>
        <span v-if="currentContract!='' && currentContract">【{{currentContract}}】</span>
      </div>
      <a-table
        size="small"
        ref="contractSupplies"
        :data-source="contractSupplies"
        :rowKey="record => record.id"
        :loading="contractSuppliesLoading"
        :scroll="windowWidth < 768 && contractSupplies.length > 0 ?{ x: 1400}:{}"
      >
        <a-table-column defaultSortOrder="ascend" :sorter="(a, b) => a.serialNumber-b.serialNumber" title="序号" key="serialNumber" data-index="serialNumber" align="center" :width="50" />
        <a-table-column :width="100" ellipsis="true" key="item" title="设备" data-index="item" align="center"/>
        <a-table-column :width="100" ellipsis="true" key="supplier" title="供应商" data-index="supplier" align="center" />
        <a-table-column :width="100" ellipsis="true" key="brand" title="品牌" data-index="brand" align="center"/>
        <a-table-column :width="100" ellipsis="true" key="model" title="规格型号" data-index="model" align="center"/>
        <a-table-column :width="70" key="price" title="单价" data-index="price" align="center"/>
        <a-table-column :width="80" key="totalPrice" title="总价" data-index="totalPrice" align="center"/>
        <a-table-column :width="50" key="unit" title="单位" data-index="unit" align="center"/>
        <a-table-column :width="70" key="number" title="数量" data-index="number" align="center"/>
        <a-table-column :width="100" ellipsis="true" key="itemsParams" title="技术要求" data-index="itemsParams" align="center"/>
        <a-table-column :width="100" ellipsis="true" key="supplyParams" title="实际参数" data-index="supplyParams" align="center"/>
        <a-table-column :width="100" ellipsis="true" key="warranty" title="货期" data-index="warranty" align="center"/>
        <a-table-column :width="100" ellipsis="true" key="remark" title="备注" data-index="remark" align="center"/>
        <!--<a-table-column :width="120" fixed="right" key="action" title="操作" align="center">
          <template slot-scope="text, record">
            <el-button @click="editPrice('供货价', record.purchaseSupply)" type="success" icon="el-icon-edit" size="mini" style="padding: 7px 10px;">供货价</el-button>
          </template>
        </a-table-column>-->
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
      <el-form ref="form" status-icon :model="form" :rules="rules">
        <el-form-item label="采购项目" label-width="80px" prop="projectId">
          <el-select v-model="form.projectId" clearable placeholder="请选择">
            <el-option v-for="p in purchasePros" :key="p.id" :label="p.projectName" :value="p.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="合同名" label-width="80px" prop="contractName">
          <el-input v-model="form.contractName" autocomplete="off" />
        </el-form-item>
        <el-form-item label="合同编号" label-width="80px" prop="contractNo">
          <el-input v-model="form.contractNo" autocomplete="off" />
        </el-form-item>
        <el-form-item label="备注" label-width="80px" prop="remark">
          <el-input type="textarea" v-model="form.remark" autocomplete="off" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="visible = false">取 消</el-button>
        <el-button type="primary" size="small" @click="saveRecordHandler('form')">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="送审" :visible.sync="checkDialogVisible">
      <el-form :model="toCheckDialogForm" >
        <el-form-item label="合同名" label-width="80px" prop="contractName">{{toCheckDialogForm.contractName}}</el-form-item>
        <el-form-item label="合同编号" label-width="80px" prop="contractNo">{{toCheckDialogForm.contractNo}}</el-form-item>
        <el-form-item label="审核流程" label-width="80px" prop="checkProcess">
          <el-slider
            v-model="toCheckDialogForm.checkProcess"
            :marks="marks"
            :show-tooltip="false"
            :step="30"
            show-stops
            style="padding: 0 1em">
          </el-slider>
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="visible = false">取 消</el-button>
        <el-button type="primary" size="small" @click="sendCheckHandler">确 定</el-button>
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
  import { getAction, postActionByJson, postActionByQueryString } from '@/api/manage'

  export default {
    data() {
      var validNo = (rule, value, callback) => {
        if (!value) {
          return callback(new Error('不能为空'));
        }
        request.get('/purchase/purchaseContractGenerate/findContractNo',{
          params: { contractNo: value }
        })
          .then(response => {
            if (response.data > 0) {
              callback(new Error('合同编号已存在'))
            }else {
              callback()
            }
          })
      };
      return {
        marks: {
          0: '无审核',
          30: '一级',
          60: '二级',
          90: '三级'
        },
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

        rules: {
          contractNo: [
            { validator: validNo, trigger: 'blur'}
          ],
          contractName: [
            { required: true, message: '不能为空', trigger: 'blur'}
          ],
          projectId: [
            { required: true, message: '不能为空', trigger: 'blur'}
          ]
        },

        toCheckDialogForm: {},
        checkDialogVisible: false,

        contractSupplies: [],
        contractSuppliesLoading: false,

        selectKey: '',
        currentContract: '',

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
      tableRowClassName(row, index){
        if(this.selectKey == row.id) {
          return 'selected'
        }else {
          return ''
        }
      },
      rowClick(row, index) {
        return {
          on: {
            click: () => {
              this.contractSuppliesLoading = true
              getAction('/purchase/contractManagement/findItemsInfoByContractId', {contractId: row.id})
                .then( resp => {
                  this.contractSupplies = resp.data
                  this.contractSuppliesLoading = false
                  this.selectKey = row.id
                  this.currentContract = row.contractName
                })
            }
          }
        }
      },
      sendCheckHandler() {
        if (this.toCheckDialogForm.id) {
          let form = {}
          form.id = this.toCheckDialogForm.id
          form.sender = getUser()
          switch (this.toCheckDialogForm.checkProcess) {
            case 0: break
            case 30: form.firstAudit = 0;break
            case 60: form.firstAudit = 0;form.secondAudit = 0;break
            case 90: form.firstAudit = 0;form.secondAudit = 0;form.threeAudit = 0;break
          }
          postActionByQueryString('/purchase/contract/saveOrUpdate', form)
            .then( resp => {
              this.$message({ message: resp.message, type: 'success' })
              this.checkDialogVisible = false
              this.toSearch()
            })
        }

      },
      toCheck(record) {
        this.checkDialogVisible = true
        this.toCheckDialogForm = record
      },
      saveRecordHandler(form) {
        let params = this.form
        params.operator = getUser()
        this.$refs[form].validate((valid) => {
          if (valid) {
            postActionByQueryString('/purchase/contract/saveOrUpdate', params)
              .then( resp => {
                this.$message({ message: resp.message, type: 'success' })
                this.dialogVisible = false
                this.toSearch()
              })
          }else {
            console.log('error commit')
            return false
          }
        })
      },
      countProgress(a, b, c) {
        let m = 0
        if (a!=null) {
          m ++
        }
        if (b!=null) {
          m ++
        }
        if (c!=null) {
          m ++
        }
        return m
      },
      calculateProgress(a, b, c) {
        let m = this.countProgress(a, b, c)
        let n = 0

        if (a == 1) {
          n ++
        }
        if (b == 1) {
          n ++
        }
        if (c == 1) {
          n ++
        }
        if (m != 0) {
          return parseFloat(parseFloat(n / m * 100).toFixed(2))
        }else {
          return 0
        }
      },
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
  .progress-tooltip-col {
    .progress-tooltip-col-div {
      text-align: center;
      min-height: 16px;
      .anticon {

      }
    }
  }
  /deep/.status-table {
    .selected {
      background: #e6f7ff;
    }
  }
}

</style>
