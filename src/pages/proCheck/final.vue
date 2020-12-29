<template>
  <!-- 最终审核 -->
  <div class="finalCheck_list">
    <div class="btns" style="padding:1em;margin-bottom:1em;background:#fff">
      <el-button :style="hasSelected?{display: 'inline-block'}:{display: 'none'}" type="primary" size="small" @click="toCheck(key=1)">通过</el-button>
      <el-button :style="hasSelected?{display: 'inline-block'}:{display: 'none'}" type="danger" size="small" @click="toCheck(key=2)">拒绝</el-button>
      <el-button :style="hasSelected?{display: 'inline-block'}:{display: 'none'}" type="info" size="small" @click="toCheck(key=0)">撤销</el-button>
      <el-select v-model="form.proDetailId" style="margin-right: 6px" filterable clearable placeholder="请选择项目" value-key="name">
        <el-option v-for="item in projects" :key="item.id" :label="item.name" :value="item.id" />
      </el-select>
      <el-button style="margin-right: 6px" type="primary" :loading="searchLoading" icon="el-icon-search" size="small" @click="loadData">查询</el-button>
      <div class="helper">
        <el-tag effect="dark" style="float: left;background: #4bbc89;border-color: #4bbc89;width: 24px;height:24px;"></el-tag>
        <span style="font-size: 14px;height: 24px;display: block;float: left;margin-left: 4px;color: #303133">终审</span>
        <span style="height: 24px;display: block;float: left;margin-left: 8px;"><i class="el-icon-star-off" style="font-size: 24px;color: #2b2f3a;"></i></span>
        <span style="font-size: 14px;height: 24px;display: block;float: left;margin-left: 4px;color: #2b2f3a">拟比价</span>
        <span style="height: 24px;display: block;float: left;margin-left: 8px;"><i class="el-icon-medal-1" style="font-size: 24px;color: #0568c3;"></i></span>
        <span style="font-size: 14px;height: 24px;display: block;float: left;margin-left: 4px;color: #303133">最低价</span>
      </div>
    </div>
    <div style="padding:1em;margin-bottom:4em;background:#fff">
      <el-table :data="data" border size="small" :default-sort = "{prop: 'sort', order: 'ascending'}"
                :max-height="tableHeight" :row-class-name="tableRowClassName" style="width: 100%" >
        <el-table-column
          prop="inquiry"
          label="询价序号"
          :fixed="dynamicColumns.suppliers.length > 6?'left':false"
          v-if="data.length>0"
          align="center"
          width="70">
          <template style="width: 100%" slot-scope="scope">
            <p>{{scope.row['inquiry'].sort}}</p>
          </template>
        </el-table-column>
        <el-table-column
          prop="inquiry"
          label="询价内容"
          :fixed="dynamicColumns.suppliers.length > 6?'left':false"
          v-if="data.length>0"
          :width="dynamicColumns.suppliers.length > 6? 180:'auto'">
          <template style="width: 100%" slot-scope="scope">
            <div style="position:relative;">
            <el-tooltip :content="scope.row['inquiry'].name" placement="top" effect="light">
              <p class="ellipsis">设备名：{{scope.row['inquiry'].name}}</p>
            </el-tooltip>
            <el-tooltip :content="scope.row['inquiry'].params" placement="top" effect="light">
              <p class="ellipsis">技术参数：{{scope.row['inquiry'].params}}</p>
            </el-tooltip>
              <p class="ellipsis">单位：{{scope.row['inquiry'].unit}}</p>
              <p class="ellipsis">数量：{{scope.row['inquiry'].number}}</p>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="draft"
          label="拟定报价"
          :fixed="dynamicColumns.suppliers.length > 6?'left':false"
          v-if="data.length>0"
          :width="dynamicColumns.suppliers.length > 6? 180:'auto'">
          <template slot-scope="scope">
            <div style="position:relative;cursor: pointer">
            <div style="position: relative" @click="draftClick(scope.row['inquiry'], scope.row['draft'])">
              <p :style="scope.row['draft'].totalPrice < priceChecks[scope.row['inquiry'].inquiryId]?{color: 'red'}:scope.row['draft'].totalPrice > 2*priceChecks[scope.row['inquiry'].inquiryId]?{color: '#faad14'}:{}">报价单价：{{scope.row['draft'].price}}</p>
              <p :style="scope.row['draft'].totalPrice < priceChecks[scope.row['inquiry'].inquiryId]?{color: 'red'}:scope.row['draft'].totalPrice > 2*priceChecks[scope.row['inquiry'].inquiryId]?{color: '#faad14'}:{}">报价总价：{{scope.row['draft'].totalPrice}}</p>
            </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          v-for="(supplier,index) in dynamicColumns.suppliers"
          :label="supplier"
          :prop="supplier"
          :key="supplier"
          :width="dynamicColumns.suppliers.length > 6? 180:undefined"
          >
          <template  slot-scope="scope">
            <a-popover title="备注" trigger="click" placement="right" v-if="scope.row[supplier]
            && (scope.row[supplier].compareStatus === 1 || scope.row[supplier].finallyAudit === 1)">
              <template slot="content" >
                <el-input
                  type="textarea"
                  :rows="3"
                  placeholder="请输入内容"
                  v-model="scope.row[supplier].finallyRemark">
                </el-input>
              </template>
              <div class="my-transition" style="position: relative;cursor: pointer" v-bind:style="scope.row[supplier] && scope.row.inquiry.veto == 0 && scope.row[supplier].finallyAudit === 1?{background: '#4bbc89',boxShadow: '2px 2px 2px #909090',color: '#fff'}:scope.row[supplier] && scope.row[supplier].compareStatus === 1?{border: '1px #2b2f3a dashed'}:{}"
                   @click="finalCheck(scope.row[supplier], scope.row.inquiry.veto)">
                <i class="el-icon-medal-1" style="opacity: .7;font-size: 18px;color: #0568c3; float: right" v-if="scope.row[supplier] && scope.row[supplier].minPrice === 1">
                  <span style="font-size: 12px">最低价</span>
                </i>
                <i class="el-icon-star-off" style="opacity: .7;font-size: 18px;color: #2b2f3a; float: right; bottom: 12px; right: 12px; position: absolute" v-if="scope.row[supplier] && scope.row[supplier].compareStatus === 1">
                  <span style="font-size: 12px;position: relative">拟比价</span>
                </i>
                <el-tooltip :content="scope.row['inquiry'].suModel" placement="top" effect="light">
                  <p class="ellipsis">型号：{{scope.row[supplier]?nullFormat(scope.row[supplier].suModel):''}}</p>
                </el-tooltip>
                <el-tooltip :content="scope.row['inquiry'].suParams" placement="top" effect="light">
                  <p class="ellipsis">技术参数：{{scope.row[supplier]?nullFormat(scope.row[supplier].suParams):''}}</p>
                </el-tooltip>
                  <p class="ellipsis">单价：{{scope.row[supplier]?nullFormat(scope.row[supplier].suPrice):''}}</p>
                  <p class="ellipsis">总价：{{scope.row[supplier]?nullFormat(scope.row[supplier].suTotalPrice):''}}</p>
                <p>
                  <span>技审：</span><el-tag size="mini" :type="statusType[scope.row[supplier].technicalAudit]">{{status[scope.row[supplier].technicalAudit]}}</el-tag>
                  <el-tooltip v-if="scope.row[supplier].technicalRemark" :content="scope.row[supplier].technicalRemark" placement="top" effect="light">
                    <span style="float: right; width: calc(100% - 80px)" class="ellipsis">备注：{{scope.row[supplier].technicalRemark}}</span>
                  </el-tooltip>
                </p>
                <p>
                  <span>商审：</span><el-tag size="mini" :type="statusType[scope.row[supplier].businessAudit]">{{status[scope.row[supplier].businessAudit]}}</el-tag>
                  <el-tooltip v-if="scope.row[supplier].businessRemark" :content="scope.row[supplier].businessRemark" placement="top" effect="light">
                    <span style="float: right; width: calc(100% - 80px)" class="ellipsis">备注：{{scope.row[supplier].businessRemark}}</span>
                  </el-tooltip>
                </p>
                <el-tooltip :content="scope.row['inquiry'].compareRemark" placement="top" effect="light">
                  <p class="ellipsis" style="margin-bottom: 14px" v-if="scope.row[supplier] && scope.row[supplier].compareStatus == 1">拟比价备注：{{scope.row[supplier]?nullFormat(scope.row[supplier].compareRemark):''}}</p>
                </el-tooltip>
              </div>
            </a-popover>
            <div style="cursor: pointer;position:relative;" v-if="scope.row[supplier] && (scope.row[supplier].compareStatus !== 1 && scope.row[supplier].finallyAudit !== 1)" class="my-transition"
                 v-bind:style="scope.row[supplier] && scope.row[supplier].finallyAudit === 1?{background: '#4bbc89',boxShadow: '2px 2px 2px #909090',color: '#fff'}:scope.row[supplier] && scope.row[supplier].compareStatus === 1?{border: '1px #ff4949 dashed'}:{}"
                 @click="finalCheck(scope.row[supplier], scope.row.inquiry.veto)">
              <i class="el-icon-medal-1" style="opacity: .7;font-size: 18px;color: #0568c3; float: right" v-if="scope.row[supplier] && scope.row[supplier].minPrice === 1">
                <span style="font-size: 12px">最低价</span>
              </i>
              <i class="el-icon-star-off" style="opacity: .7;font-size: 18px;color: #303133; float: right; bottom: 12px; right: 12px; position: absolute" v-if="scope.row[supplier] && scope.row[supplier].compareStatus === 1">
                <span style="font-size: 12px">拟比价</span>
              </i>
              <el-tooltip :content="scope.row['inquiry'].suModel" placement="top" effect="light">
                <p class="ellipsis">型号：{{scope.row[supplier]?nullFormat(scope.row[supplier].suModel):''}}</p>
              </el-tooltip>
              <el-tooltip :content="scope.row['inquiry'].suParams" placement="top" effect="light">
                <p class="ellipsis">技术参数：{{scope.row[supplier]?nullFormat(scope.row[supplier].suParams):''}}</p>
              </el-tooltip>
              <p class="ellipsis">单价：{{scope.row[supplier]?nullFormat(scope.row[supplier].suPrice):''}}</p>
              <p class="ellipsis">总价：{{scope.row[supplier]?nullFormat(scope.row[supplier].suTotalPrice):''}}</p>
              <p>
                <span>技审：</span><el-tag size="mini" :type="statusType[scope.row[supplier].technicalAudit]">{{status[scope.row[supplier].technicalAudit]}}</el-tag>
                <el-tooltip v-if="scope.row[supplier].technicalRemark" :content="scope.row[supplier].technicalRemark" placement="top" effect="light">
                  <span style="float: right; width: calc(100% - 80px)" class="ellipsis">备注：{{scope.row[supplier].technicalRemark}}</span>
                </el-tooltip>
              </p>
              <p>
                <span>商审：</span><el-tag size="mini" :type="statusType[scope.row[supplier].businessAudit]">{{status[scope.row[supplier].businessAudit]}}</el-tag>
                <el-tooltip v-if="scope.row[supplier].businessRemark" :content="scope.row[supplier].businessRemark" placement="top" effect="light">
                  <span style="float: right; width: calc(100% - 80px)" class="ellipsis">备注：{{scope.row[supplier].businessRemark}}</span>
                </el-tooltip>
              </p>
              <el-tooltip :content="scope.row['inquiry'].compareRemark" placement="top" effect="light">
                <p class="ellipsis" style="margin-bottom: 14px" v-if="scope.row[supplier] && scope.row[supplier].compareStatus == 1">拟比价备注：{{scope.row[supplier]?nullFormat(scope.row[supplier].compareRemark):''}}</p>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
        <el-table-column v-if="data.length > 0" align="center" label="操作" width="80" fixed="right">
          <template slot-scope="{row}">
            <el-popover
              ref="popover"
              placement="top"
              width="200"
              title="拒绝并重新询价"
              trigger="click">
              <el-form :model="refuseForm" status-icon>
                  <span style="float: left;display: block">备注：</span><el-input size="mini" type="text" v-model="refuseForm.remark" style="margin-bottom: 6px" />
              </el-form>
              <el-button type="primary" size="small" @click="refuseHandler">提交</el-button>
            </el-popover>
            <el-tooltip v-if="row.inquiry.veto == 0" class="item" effect="dark" content="否决并退回到询价" placement="bottom-start">
              <el-button type="danger" size="mini" style="padding: 7px 10px;" @click="refuseForm.id = row.inquiry.inquiryId" v-popover:popover>否决</el-button>
            </el-tooltip>
            <el-tooltip v-if="row.inquiry.veto == 1" class="item" effect="dark" content="已否决，重新询价" placement="bottom-start">
              <el-button plain disabled type="danger" size="mini" style="padding: 7px 10px;" >已否决</el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="footer" >
      报价总价:<span style="margin: 0 2em 0 4px;color: #1682e6;">{{cost.toFixed(2)}}</span>
      成本总价:<span style="margin: 0 2em 0 4px;color: #1682e6;">{{priceChecks.total?(priceChecks.total).toFixed(2):0}}</span>
      利率:<span style="margin: 0 2em 0 4px;color: #1682e6;">{{priceChecks.total?((cost-priceChecks.total)/priceChecks.total*100).toFixed(2):0}}%</span>
      已选择<span style="margin: 0 4px;color: #1682e6;">{{submitForm.checkCompareIds.length}}</span>家供应商
      <el-button :loading="submitLoading"  style="right:0;margin: 0 2em 0 0" type="primary" size="small" @click="submitCheck">{{submitLoading?'':'终审'}}</el-button>
    </div>

    <el-dialog
      title="修改拟定报价"
      :visible.sync="draftDialogVisible"
      >
      <el-form ref="form1" :model="form1" :rules="rules" status-icon>
        <el-form-item label="拟定报价单价" label-width="80px" prop="price">
          <el-autocomplete
            v-model="form1.price"
            :fetch-suggestions="querySearchAsync"
            placeholder="请输入拟定单价"
            @select="handleSelect"
            style="width: 100%"
            status-icon
          ></el-autocomplete>
        </el-form-item>
        <el-form-item label="拟定报价总价" label-width="80px">
          <el-input type="text" :value="form1.inquiry?(form1.price*form1.inquiry.number).toFixed(2):0" disabled></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button size="small" @click="draftDialogVisible = false">取 消</el-button>
        <el-button size="small" type="primary" @click="draftDialogHandler('form1')">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import request from '@/utils/request'
import qs from 'querystring'
import '@/styles/auto-style.css'
import { getUser } from '@/utils/auth'
import { dateFormat, nullFormat } from '@/utils/format'

export default {

  data() {
    return {
      searchLoading: false,
      draftDialogVisible: false,
      tableHeight: document.documentElement.clientHeight-83-196,
      status: ['未审核', '通过', '拒绝'],
      statusType: ['info', 'success', 'danger'],
      refuseForm: {},
      popoverVisible: false,
      cost: 0,
      priceChecks:{total: 0},
      form1: {},
      visible: false,
      data: [],
      loading: 'true',
      dynamicColumns: {suppliers: [], columns: [], compareIds: []},
      selectedRowKeys: [],
      form: {
      },
      projects: [],
      submitForm:{ checkCompareIds: [], uncheckCompareIds: [], allInquiryIds: [], remarks: []},
      submitLoading: false,
      rules: {
        price: [ { required: true, pattern: /^(\-|\+)?\d+(\.\d+)?$/, message: '格式不正确', trigger: 'blur' } ],
      },
    }
  },
  computed: {
    hasSelected() {
      return this.selectedRowKeys.length > 0
    }
  },
  mounted() {
    var that = this
    that.tableHeight = document.documentElement.clientHeight-83-196
  },
  created() {
    this.loadProjects()
  },
  methods: {
    draftDialogHandler(form) {
      this.$refs[form].validate((valid) => {
        if (valid) {
          request.request({
            url: '/inquiry/finallyUpdateDraft',
            method: 'post',
            headers: {
              'Content-Type': 'application/json'
            },
            data: JSON.stringify({id: this.form1.id, price: this.form1.price, totalPrice: (this.form1.price*this.form1.inquiry.number).toFixed(2), operator: getUser()})
          }).then(response => {
            this.loadData()
            this.draftDialogVisible = false
            this.$message({ message: response.message, type: 'success' })
          }).catch(()=> {
            this.loadData()
          })
        }else {
          return false
        }
      })
    },
    draftClick(inquiry, draft) {
      this.draftDialogVisible = true
      this.form1 = {id: inquiry.inquiryId, inquiry: inquiry, price: draft.price, totalPrice: draft.totalPrice}
    },
    handleSelect(item) {
      //this.form1.price = item.value
    },
    querySearchAsync(qs, cb){
      if(this.form1.inquiry){
        let name = this.form1.inquiry.name
        request.request({
          url: '/pool/findHistoryPrices',
          method: 'get',
          params: {name: name}
        }).then(response => {
          const result = []
          response.data.map(item => {
            result.push({value: '采购价:'+item.price+'  报价:'+item.quote})
          })
          cb(result)
        })
      }else{
        cb(new Array())
      }
    },
    refuseHandler() {
      this.refuseForm.operator = getUser()
      request.request({
        url: '/finallyCheck/refuseInquiry',
        method: 'post',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: qs.stringify(this.refuseForm)
      }).then(response => {
        this.$message({ message: response.message, type: 'success' })
        this.loadData()
      })
    },
    tableRowClassName({row, index}) {

      if (row.inquiry.veto == 1) {
        return 'danger-row';
      }
      return '';
    },
    /*draftDialogHandler(form1) {
      let form = this.form1

      form.operator = parseInt(getUser())
      const data = [...this.data]
      //this.data = [...this.data]
      let i = ''
      data.map((item, index) => {
        //console.log(item)
        if(item.inquiry.inquiryId == form.id) {
          i = index
          item.draft.price = form.price
          item.draft.totalPrice = form.totalPrice
        }
      })
      this.data = data
      request.request({
        url: '/inquiry/finallyUpdateDraft',
        method: 'post',
        headers: {
          'Content-Type': 'application/json'
        },
        data: JSON.stringify(form)
      }).then(response => {
        this.loadData()
        this.draftDialogVisible = false
        this.$message({ message: response.message, type: 'success' })
      }).catch(()=> {
        this.loadData()
      })
    },*/
    nullFormat,
    submitCheck() {
      const submitForm = { checkCompareIds: [], uncheckCompareIds: [], remarks: []}
      const allCompareIds = []
      console.log(this.data)
      this.data.map(item => {

        this.dynamicColumns.suppliers.map(s => {
          if(item[s] && (item[s].finallyAudit === 1 && item.inquiry.veto == 0)){
            submitForm.checkCompareIds.push(item[s].compareId)
            submitForm.remarks.push({id: item[s].compareId, remark: item[s].finallyRemark})
          }
        })
      })
      this.data.map(item => {
        let key = 0
        this.dynamicColumns.suppliers.map(s => {
          if(item[s] && item[s].finallyAudit == 1){
            key ++
            allCompareIds.push(item[s].compareId)
          }
        })
        if(key > 0) {
          this.dynamicColumns.suppliers.map(s => {
            if(item[s]){
              allCompareIds.push(item[s].compareId)
            }
          })
        }
      })
      allCompareIds.map(item => {
        if (!submitForm.checkCompareIds.includes(item)){
          submitForm.uncheckCompareIds.push(item)
        }
      })

      this.submitForm = submitForm
      if (this.submitForm.checkCompareIds.length > 0) {
        const form = this.submitForm
        const userId = parseInt(getUser())
        form.remarks.map(i => {
          if (!i.remark) {
            i.remark = ''
          }
        })
        form.userId = userId
        //console.log(form)
        request.request({
          url: '/finallyCheck/saveFinallyCheckMessage',
          method: 'post',
          headers: {
            'Content-Type': 'application/json'
          },
          data: JSON.stringify(form)
        }).then(response => {
          this.$message({ message: response.message, type: 'success' })
        })
      }else {
        this.$message({ message: '还未选择终审通过的供应商', type: 'warning' })
      }
    },
    finalCheck(row, veto) {
      const id = row.compareId
      const name = row.name
      const supplier = row.supplier
      //console.log(row)
      if(id && name && supplier && veto == 0 && row.businessAudit == 1 && row.technicalAudit) {
        //alert(id + '  ' + name + '  ' + supplier)
        const data = [...this.data]
        const allCompareIds = []
        data.map(item => {
          console.log(item)
          if (item.inquiry.name == name && row.inquiryId == item.inquiry.inquiryId) {
            this.dynamicColumns.suppliers.map(s => {
              if(item[s]){
                item[s].finallyAudit = 0
                allCompareIds.push(item[s].compareId)
              }
            })
            item[supplier].finallyAudit = 1
          }/*else{
            this.dynamicColumns.suppliers.map(s => {
              if(item[s]){
                allCompareIds.push(item[s].compareId)
              }
            })
          }*/
        })

        this.data = data
        const submitForm = { checkCompareIds: [], uncheckCompareIds: [], remarks: []}
        console.log(this.data)
        this.priceChecks = {total: 0}
        this.cost = 0
        let total = 0

        this.data.map(item => {
          let key = 0
          this.dynamicColumns.suppliers.map(s => {
            if(item[s] && (item[s].finallyAudit === 1 && item.inquiry.veto == 0)){
              submitForm.checkCompareIds.push(item[s].compareId)
              submitForm.remarks.push({id: item[s].compareId, remark: item[s].finallyRemark})
              this.$set(this.priceChecks, item[s].inquiryId, item[s].suTotalPrice)
              total += item[s].suTotalPrice
              key ++
            }
          })

          if(key > 0){
            this.cost += parseFloat(item['draft'].totalPrice)
          }
        })
        this.$set(this.priceChecks, 'total', total)
        allCompareIds.map(item => {
          if (!submitForm.checkCompareIds.includes(item)){
            submitForm.uncheckCompareIds.push(item)
          }
        })

        this.submitForm = submitForm
      }
    },
    loadProjects() {
      request.get('/project/detail/findByAll')
        .then(response => {
          this.projects = response.data
        })
    },
    loadData() {
      if(this.form.proDetailId){
        this.searchLoading = true
        let data = []
        let suppliers = []
        request.get('/finallyCheck/findDraftComparePrice?proDetailId='+this.form.proDetailId)
        .then(response => {
          data = response.data
          // 初始化动态列
          data.map(item => {
            // 筛选出所有列名
            Object.keys(item).map(key => {
              if(key != 'inquiry' && key != 'draft' && !suppliers.includes(key)){
                suppliers.push(key)
              }
            })
          })
          this.dynamicColumns.suppliers = suppliers
          // 渲染动态列
          this.dynamicColumns.suppliers.map(item => {
            this.dynamicColumns.columns.push({
              title: item,
              dataIndex: item,
              scopedSlots: { customRender: item}
            })
          })
          this.data = data
          const allCompareIds = []
          const submitForm = { checkCompareIds: [], uncheckCompareIds: [], remarks: []}
          this.data.map(item => {
            let key = 0
            this.dynamicColumns.suppliers.map(s => {
              if(item[s] && item[s].finallyAudit == 1){
                key ++
                allCompareIds.push(item[s].compareId)
              }
            })
            if(key > 0) {
              this.dynamicColumns.suppliers.map(s => {
                if(item[s]){
                  allCompareIds.push(item[s].compareId)
                }
              })
            }
          })
          this.priceChecks = {total: 0}
          this.cost = 0
          let total = 0

          this.data.map((item, index) => {
            let key = 0
            this.dynamicColumns.suppliers.map(s => {
              if(item[s] && (item[s].finallyAudit === 1 && item.inquiry.veto == 0)){
                key ++
                submitForm.checkCompareIds.push(item[s].compareId)
                submitForm.remarks.push({id: item[s].compareId, remark: item[s].finallyRemark})
                this.$set(this.priceChecks, item[s].inquiryId, item[s].suTotalPrice)
                total += item[s].suTotalPrice
              }
            })
            if(key > 0){
              this.cost += parseFloat(item['draft'].totalPrice)
            }
          })
          this.$set(this.priceChecks, 'total', total)
          allCompareIds.map(item => {
            if (!submitForm.checkCompareIds.includes(item)){
              submitForm.uncheckCompareIds.push(item)
            }
          })
          submitForm.allCompareIds = [...allCompareIds]

          this.submitForm = submitForm
          this.searchLoading = false
        }).catch(()=>{
          this.searchLoading = true
        })
      }else {
        this.$message({ message: '请选择项目', type: 'warning' })
      }
    },
  }
}
</script>

<style lang="scss" scoped>
  .finalCheck_list {
    /deep/.el-form-item__content{
      height:auto;
      line-height:32px;
      margin-left:90px!important
    }
    /deep/.el-table__body .danger-row {
      background: #f1b7b7;
    }
    .ellipsis {
      overflow: hidden!important;
      white-space: nowrap!important;
      text-overflow: ellipsis!important;
    }
    .helper {
      float: right;
      height: 24px;
      line-height: 24px;
    }
    /deep/.el-table__body {
      tbody {
        tr {
          td {
            padding: 0!important;
            .cell {
              padding: 0!important;
              div {
                position: absolute;
                top: 0;
                height: 100%;
                width: 100%;
                padding: 1em!important;
                p {
                  margin: 0;
                }
              }
            }
          }
        }
      }
    }
    .footer {
      height: 60px;
      line-height: 60px;
      width: calc(100% + 1em);
      position: fixed;
      z-index: 999;
      background: #fff;
      bottom: 0;
      left: 0;
      box-shadow: 1px 1px 4px #9e9e9e;
      text-align: right;
      padding: 0 4%;
    }
  }
</style>
