<template>
  <!-- 最终审核 -->
  <div class="finalCheck_list">
    <div class="btns" style="padding:1em;margin-bottom:1em;background:#fff">
      <el-button :loading="downloadLoading" style="margin-bottom:20px" type="primary" icon="el-icon-document" @click="handleDownload">导出</el-button>
      <el-button :style="hasSelected?{display: 'inline-block'}:{display: 'none'}" type="primary" size="small" @click="toCheck(key=1)">通过</el-button>
      <el-button :style="hasSelected?{display: 'inline-block'}:{display: 'none'}" type="danger" size="small" @click="toCheck(key=2)">拒绝</el-button>
      <el-button :style="hasSelected?{display: 'inline-block'}:{display: 'none'}" type="info" size="small" @click="toCheck(key=0)">撤销</el-button>
      <el-select @change="selectChange" v-model="form.proDetailId" style="margin-right: 6px" filterable clearable placeholder="请选择项目" value-key="id">
        <el-option v-for="item in projects" :key="item.id" :label="item.name" :value="item.id" />
      </el-select>
      <el-select v-model="form.inquiryName" style="margin-right: 6px" filterable clearable placeholder="请选择询价设备" value-key="name">
        <el-option v-for="item in inquiries" :key="item.name" :label="item.name" :value="item.name">
          <span>{{item.name}}</span>
          <el-tag size="mini" type="success" style="float: right;transform: translate(0, 7px)">{{item['count(1)']}}</el-tag>
        </el-option>
      </el-select>
      <el-button style="margin-right: 6px" type="primary" :loading="searchLoading" icon="el-icon-search" size="small" @click="loadData">查询</el-button>
      <div class="helper">
        <el-tag effect="dark" style="float: left;background: #4bbc89;border-color: #4bbc89;width: 24px;height:24px;"></el-tag>
        <span style="font-size: 14px;height: 24px;display: block;float: left;margin-left: 4px;color: #303133">终审</span>
        <el-tag effect="dark" style="margin-left: 10px;float: left;background: #fff;border: 2px #4bbc89 dashed;width: 24px;height:24px;"></el-tag>
        <span style="font-size: 14px;height: 24px;display: block;float: left;margin-left: 4px;color: #2b2f3a">拟比价</span>
        <span style="height: 24px;display: block;float: left;margin-left: 8px;"><i class="el-icon-medal-1" style="font-size: 24px;color: #0568c3;"></i></span>
        <span style="font-size: 14px;height: 24px;display: block;float: left;margin-left: 4px;color: #303133">最低价</span>
      </div>
    </div>
    <div style="padding:1em;margin-bottom:4em;background:#fff">
      <a-table
        size="small"
        class="table"
        bordered
        ref="data"
        :rowKey="record => record.inquiry.id"
        :loading="dataLoading"
        :data-source="data"
        :row-class-name="tableRowClassName"
        :scroll="{ x: dynamicColumns.suppliers.length*200, y: tableHeight}"
      >
        <a-table-column :fixed="dynamicColumns.suppliers.length>4?'left':false" :width="60" key="inquiry.sort" align="center" title="序号" dataIndex="inquiry.sort"/>
        <a-table-column :fixed="dynamicColumns.suppliers.length>4?'left':false" :width="150" key="inquiry" align="center" title="询价内容" dataIndex="inquiry">
          <template slot-scope="text, record">
            <div style="position:relative;cursor: pointer;width:132px;padding:0">
            <a-tooltip :destroyTooltipOnHide="true" placement="top" :title="text.name">
              <p class="ellipsis" style="font-size: 14px;color: #8c8c8c;font-weight: 600;">{{text.name}}</p>
            </a-tooltip>
            <a-tooltip v-if="inquiryKeys.includes(item.key)" v-for="item in currentTemplate.tableColumn" :destroyTooltipOnHide="true" placement="top" :title="text[item.key]">
              <p class="ellipsis"><el-tag size="mini" style="background: #ecf5ff;color: #409eff;" type="success">{{item.title}}</el-tag>
                <span style="margin-left: 4px;background: #f6fcff;padding: 2px 4px">{{text[item.key]}}</span>
              </p>
            </a-tooltip>
            </div>
          </template>
        </a-table-column>
        <a-table-column :fixed="dynamicColumns.suppliers.length>4?'left':false" :width="150" key="draft" align="center" title="拟定报价" dataIndex="draft">
          <template slot-scope="text, record">
            <div @click="draftClick(record['inquiry'], text)" style="position:relative;cursor: pointer;width:132px;padding:0">
            <p><el-tag size="mini" style="background: #ecf5ff;color: #409eff;" type="success">拟报价</el-tag>
              <span style="margin-left: 4px;background: #f6fcff;padding: 2px 4px">{{record['inquiry'].price}}</span>
            </p>
            <p><el-tag size="mini" style="background: #ecf5ff;color: #409eff;" type="success">终报价</el-tag>
              <span style="margin-left: 4px;background: #f6fcff;padding: 2px 4px">{{record['inquiry'].finallyPrice}}</span>
            </p>
            </div>
          </template>
        </a-table-column>
        <a-table-column class="supplier" v-for="supplier in dynamicColumns.suppliers" :width="200" :key="supplier" align="center" :title="supplier.split('*')[0]?supplier.split('*')[0]:supplier" :dataIndex="supplier">
          <template slot-scope="text, record">
            <a-popover title="备注" trigger="click" placement="right" v-if="text
            && (text.finallyAudit === 1)">
              <template slot="content" >
                <el-input
                  type="textarea"
                  :rows="3"
                  placeholder="请输入内容"
                  v-model="text.finallyRemark">
                </el-input>
              </template>
            <div style="cursor: pointer;position:relative;padding: 10px" class="my-transition"
                 v-bind:style="text && text.finallyAudit === 1?{background: '#4bbc89',boxShadow: '2px 2px 2px #909090',color: '#fff'}:text && text.compareStatus === 1?{border: '2px #4bbc89 dashed'}:{}"
                 @click="finalCheck(text, record.inquiry.veto)">
              <i class="el-icon-medal-1" style="opacity: .7;font-size: 18px;color: #0568c3; float: right" v-if="text && text.minPrice === 1">
                <span style="font-size: 12px">最低价</span>
              </i>
              <a-tooltip :destroyTooltipOnHide="true" placement="top" :title="text.suModel">
                <p class="ellipsis"><el-tag size="mini" style="background: #ecf5ff;color: #409eff;" type="success">品牌</el-tag>
                  <span style="margin-left: 4px;background: #6bca9f;padding: 2px 4px">{{text?nullFormat(text.suBrand):''}}</span>
                </p>
              </a-tooltip>
              <a-tooltip :destroyTooltipOnHide="true" placement="top" :title="text.suModel">
                <p class="ellipsis"><el-tag size="mini" style="background: #ecf5ff;color: #409eff;" type="success">型号</el-tag>
                  <span style="margin-left: 4px;background: #6bca9f;padding: 2px 4px">{{text?nullFormat(text.suModel):''}}</span>
                </p>
              </a-tooltip>
              <a-tooltip :destroyTooltipOnHide="true" placement="top" :title="text.suParams">
                <p class="ellipsis"><el-tag size="mini" style="background: #ecf5ff;color: #409eff;" type="success">参数</el-tag>
                  <span style="margin-left: 4px;background: #6bca9f;padding: 2px 4px">{{text?nullFormat(text.suParams):''}}</span>
                </p>
              </a-tooltip>
              <p class="ellipsis"><el-tag size="mini" style="background: #ecf5ff;color: #409eff;" type="success">单价</el-tag>
                <span style="margin-left: 4px;background: #6bca9f;padding: 2px 4px">{{text?nullFormat(text.suPrice):''}}</span>
              </p>
              <p class="ellipsis"><el-tag size="mini" style="background: #ecf5ff;color: #409eff;" type="success">总价</el-tag>
                <span style="margin-left: 4px;background: #6bca9f;padding: 2px 4px">{{text?nullFormat(text.suTotalPrice):''}}</span>
              </p>
              <p>
                <el-tag size="mini" style="background: #ecf5ff;color: #409eff;" type="success">技审</el-tag>
                <el-tag size="mini" :type="statusType[text.technicalAudit]">{{status[text.technicalAudit]}}</el-tag>
                <a-tooltip v-if="text.technicalRemark" :destroyTooltipOnHide="true" placement="top" :title="text.technicalRemark">
                  <span style="float: right; width: calc(100% - 80px)" class="ellipsis">{{text.technicalRemark}}</span>
                </a-tooltip>
              </p>
              <p>
                <el-tag size="mini" style="background: #ecf5ff;color: #409eff;" type="success">商审</el-tag>
                <el-tag size="mini" :type="statusType[text.businessAudit]">{{status[text.businessAudit]}}</el-tag>
                <a-tooltip v-if="text.businessRemark" :destroyTooltipOnHide="true" placement="top" :title="text.businessRemark">
                  <span style="float: right; width: calc(100% - 80px)" class="ellipsis">{{text.businessRemark}}</span>
                </a-tooltip>
              </p>
              <p>
                <el-tag size="mini" style="background: #ecf5ff;color: #409eff;" type="success">比价</el-tag>
                <el-tag size="mini" :type="statusType[text.compareStatus]">{{status[text.compareStatus]}}</el-tag>
                <a-tooltip v-if="text.compareRemark" :destroyTooltipOnHide="true" placement="top" :title="text.compareRemark">
                  <span style="float: right; width: calc(100% - 80px)" class="ellipsis">{{text.compareRemark}}</span>
                </a-tooltip>
              </p>
              <p>
                <el-tag size="mini" style="background: #ecf5ff;color: #409eff;" type="success">终审</el-tag>
                <el-tag size="mini" :type="statusType[text.finallyAudit]">{{status[text.finallyAudit]}}</el-tag>
                <a-tooltip v-if="text.finallyRemark" :destroyTooltipOnHide="true" placement="top" :title="text.finallyRemark">
                  <span style="float: right; width: calc(100% - 80px)" class="ellipsis">{{text.finallyRemark}}</span>
                </a-tooltip>
              </p>
            </div>
            </a-popover>
            <div v-else-if="text
            && (text.finallyAudit !== 1)" style="cursor: pointer;position:relative;padding: 10px" class="my-transition"
                 v-bind:style="text && text.finallyAudit === 1?{background: '#4bbc89',boxShadow: '2px 2px 2px #909090',color: '#fff'}:text && text.compareStatus === 1?{border: '2px #4bbc89 dashed'}:{}"
                 @click="finalCheck(text, record.inquiry.veto)">
              <i class="el-icon-medal-1" style="opacity: .7;font-size: 18px;color: #0568c3; float: right" v-if="text && text.minPrice === 1">
                <span style="font-size: 12px">最低价</span>
              </i>
              <a-tooltip :destroyTooltipOnHide="true" placement="top" :title="text.suBrand">
                <p class="ellipsis"><el-tag size="mini" style="background: #ecf5ff;color: #409eff;" type="success">品牌</el-tag>
                  <span style="margin-left: 4px;background: #f6fcff;padding: 2px 4px">{{text?nullFormat(text.suBrand):''}}</span>
                </p>
              </a-tooltip>
              <a-tooltip :destroyTooltipOnHide="true" placement="top" :title="text.suModel">
                <p class="ellipsis"><el-tag size="mini" style="background: #ecf5ff;color: #409eff;" type="success">型号</el-tag>
                  <span style="margin-left: 4px;background: #f6fcff;padding: 2px 4px">{{text?nullFormat(text.suModel):''}}</span>
                </p>
              </a-tooltip>
              <a-tooltip :destroyTooltipOnHide="true" placement="top" :title="text.suParams">
                <p class="ellipsis"><el-tag size="mini" style="background: #ecf5ff;color: #409eff;" type="success">参数</el-tag>
                  <span style="margin-left: 4px;background: #f6fcff;padding: 2px 4px">{{text?nullFormat(text.suParams):''}}</span>
                </p>
              </a-tooltip>
              <p class="ellipsis"><el-tag size="mini" style="background: #ecf5ff;color: #409eff;" type="success">单价</el-tag>
                <span style="margin-left: 4px;background: #f6fcff;padding: 2px 4px">{{text?nullFormat(text.suPrice):''}}</span>
              </p>
              <p class="ellipsis"><el-tag size="mini" style="background: #ecf5ff;color: #409eff;" type="success">总价</el-tag>
                <span style="margin-left: 4px;background: #f6fcff;padding: 2px 4px">{{text?nullFormat(text.suTotalPrice):''}}</span>
              </p>
              <p>
                <el-tag size="mini" style="background: #ecf5ff;color: #409eff;" type="success">技审</el-tag>
                <el-tag size="mini" :type="statusType[text.technicalAudit]">{{status[text.technicalAudit]}}</el-tag>
                <a-tooltip v-if="text.technicalRemark" :destroyTooltipOnHide="true" placement="top" :title="text.technicalRemark">
                  <span style="float: right; width: calc(100% - 80px)" class="ellipsis">{{text.technicalRemark}}</span>
                </a-tooltip>
              </p>
              <p>
                <el-tag size="mini" style="background: #ecf5ff;color: #409eff;" type="success">商审</el-tag>
                <el-tag size="mini" :type="statusType[text.businessAudit]">{{status[text.businessAudit]}}</el-tag>
                <a-tooltip v-if="text.businessRemark" :destroyTooltipOnHide="true" placement="top" :title="text.businessRemark">
                  <span style="float: right; width: calc(100% - 80px)" class="ellipsis">{{text.businessRemark}}</span>
                </a-tooltip>
              </p>
              <p>
                <el-tag size="mini" style="background: #ecf5ff;color: #409eff;" type="success">比价</el-tag>
                <el-tag size="mini" :type="statusType[text.compareStatus]">{{status[text.compareStatus]}}</el-tag>
                <a-tooltip v-if="text.compareRemark" :destroyTooltipOnHide="true" placement="top" :title="text.compareRemark">
                  <span style="float: right; width: calc(100% - 80px)" class="ellipsis">{{text.compareRemark}}</span>
                </a-tooltip>
              </p>
              <p>
                <el-tag size="mini" style="background: #ecf5ff;color: #409eff;" type="success">终审</el-tag>
                <el-tag size="mini" :type="statusType[text.finallyAudit]">{{status[text.finallyAudit]}}</el-tag>
                <a-tooltip v-if="text.finallyRemark" :destroyTooltipOnHide="true" placement="top" :title="text.finallyRemark">
                  <span style="float: right; width: calc(100% - 80px)" class="ellipsis">{{text.finallyRemark}}</span>
                </a-tooltip>
              </p>
            </div>
          </template>
        </a-table-column>
        <a-table-column :width="80" key="action" title="操作" align="center" :fixed="dynamicColumns.suppliers.length>6?'right':false">
          <template slot-scope="text, record">
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
            <a-tooltip v-if="record.inquiry.veto == 0" :destroyTooltipOnHide="true" placement="top" title="否决并退回到询价">
              <el-button type="danger" size="mini" style="padding: 7px 10px;" @click="refuseForm.id = record.inquiry.inquiryId" v-popover:popover>否决</el-button>
            </a-tooltip>
            <a-tooltip v-if="record.inquiry.veto == 1" :destroyTooltipOnHide="true" placement="top" title="已否决，重新询价">
              <el-button plain disabled type="danger" size="mini" style="padding: 7px 10px;" >已否决</el-button>
            </a-tooltip>
          </template>
        </a-table-column>
      </a-table>
    </div>

    <div class="footer" >
      报价总价:<span style="margin: 0 2em 0 4px;color: #1682e6;">{{cost.toFixed(2)}}</span>
      成本总价:<span style="margin: 0 2em 0 4px;color: #1682e6;">{{priceChecks.total?(priceChecks.total).toFixed(2):0}}</span>
      利率:<span style="margin: 0 2em 0 4px;color: #1682e6;">{{priceChecks.total?((cost-priceChecks.total)/priceChecks.total*100).toFixed(2):0}}%</span>
      已选择<span style="margin: 0 4px;color: #1682e6;">{{submitForm.checkCompareIds.length}}</span>家供应商
      <el-button :loading="submitLoading"  style="right:0;margin: 0 2em 0 0" type="primary" size="small" @click="submitCheck">{{submitLoading?'':'终审'}}</el-button>
    </div>
    <!-- 模态框 -->
    <el-dialog v-el-drag-dialog title="修改拟定报价" :visible.sync="draftDialogVisible">
      <el-form ref="form1" :model="form1" :rules="rules" status-icon>
        <el-row>
          <el-col :sm="24" :lg="12">
            <el-form-item label="设备名" label-width="80px" size="small" prop="proOriginId">
              {{form1.inquiry?form1.inquiry.name:''}}
            </el-form-item>
          </el-col>
          <el-col :sm="24" :lg="12">
            <el-form-item label="型号" label-width="80px" size="small" prop="proOriginId">
              {{form1.inquiry?form1.inquiry.model:''}}
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :sm="24" :lg="12">
            <el-form-item label="报价单价" label-width="80px" size="small" prop="price">
              <el-input v-if="!form1.inquiry||!form1.inquiry.finallyPrice" v-model="form1.price" autocomplete="off" />
              <el-input v-else v-model="form1.inquiry.finallyPrice" autocomplete="off" />
            </el-form-item>
          </el-col>
          <el-col :sm="24" :lg="12">
            <el-form-item label="报价总价" label-width="80px" size="small" prop="totalPrice">
              <el-input type="text" v-if="form1.inquiry" :value="form1.inquiry.finallyPrice?(form1.inquiry.finallyPrice*form1.inquiry.number).toFixed(2):(form1.price*form1.inquiry.number).toFixed(2)" disabled></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <div style="margin-bottom: 12px">
          <el-input type="text"
                    v-model="dialogSearchForm.name"
                    placeholder="设备名" size="small" style="max-width: 200px;"></el-input>
          <el-input type="text"
                    v-model="dialogSearchForm.model"
                    placeholder="型号" size="small" style="max-width: 200px;"></el-input>
          <el-button type="primary" size="small" @click="poolFind">查询</el-button>
        </div>
        <el-table :data="poolData" v-loading="poolLoading" size="small" @row-click="rowClick">
          <el-table-column :show-overflow-tooltip="true" prop="name" label="设备名称" />
          <el-table-column :show-overflow-tooltip="true" prop="supplier" label="供应商" />
          <el-table-column :show-overflow-tooltip="true" prop="params" label="技术参数" />
          <el-table-column :show-overflow-tooltip="true" prop="model" label="品牌型号" />
          <el-table-column :show-overflow-tooltip="true" prop="price" label="单价" />
          <el-table-column :show-overflow-tooltip="true" prop="number" label="数量" />
          <el-table-column :show-overflow-tooltip="true" prop="delivery" label="货期" />
          <el-table-column :show-overflow-tooltip="true" prop="remark" label="备注" />
        </el-table>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="draftDialogVisible = false">取 消</el-button>
        <el-button size="small" type="primary" @click="draftDialogHandler('form1')">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import request from '@/utils/request'
  import qs from 'querystring'
  import '@/styles/auto-style.css'
  import { getUser } from '@/utils/auth'
  import { dateFormat, nullFormat } from '@/utils/format'
  import elDragDialog from '@/directive/el-drag-dialog'
  import { getAction, postActionByJson, postActionByQueryString } from '@/api/manage'

  export default {
    directives: { elDragDialog },
    data() {
      return {
        downloadLoading: false,

        inquiries: [],

        inquiryKeys: ['model', 'params', 'meter', 'measuringRange', 'meterSignal', 'connectionMode',
          'tube', 'unit', 'number'
        ],
        currentTemplate: {},

        dataLoading: false,
        poolData: [],
        poolLoading: false,
        dialogSearchForm: {},
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
        dynamicColumns: {suppliers: [], columns: [], compareIds: []},
        selectedRowKeys: [],
        form: {
          inquiryName: ''
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
    async created() {
      await this.loadProjects()
      if(this.$route.query && this.$route.query.proId){
        this.$set(this.form, 'proDetailId', parseInt(this.$route.query.proId))
        this.loadData()
      }
    },
    methods: {
      handleDownload() {
        this.downloadLoading = true
        import('@/vendor/Export2Excel').then(excel => {
          let multiHeader = [['询价','','','','']]
          let header = ['序号', '设备名称', '主要技术参数', '单位', '数量']

          const filterVal = ['inquiry-sort', 'inquiry-name', 'inquiry-params', 'inquiry-unit', 'inquiry-number']
          const columns = ['设备型号', '设备厂家', '设备单价', '设备总价', '备注']
          const columnsVal = ['suModel', 'supplier', 'suPrice', 'suTotalPrice', 'suRemark']
          const columns1 = ['报价单价', '报价总价']
          const columns1Val = ['finallyPrice', 'finallyTotalPrice']
          let list = []
          let merges = ['A1:E1']
          let c = [70]

          let suppliers = [...this.dynamicColumns.suppliers]
          suppliers.push('比价结果')
          suppliers.push('核定结果')
          suppliers.push('最低价')
          suppliers.push('拟定报价')
          suppliers.push('最终报价')

          //console.log(this.data)

          suppliers.map(supplier => {

            // 处理表头
            let col = []
            let colVal = []
            if (supplier == '拟定报价' || supplier == '最终报价') {
              col = columns1
              colVal = columns1Val
            }else {
              col = columns
              colVal = columnsVal
            }
            let length = col.length - 1
            multiHeader[0].push(supplier)
            col.map((column, index) => {
              if(index > 0) {
                multiHeader[0].push('')
              }
              header.push(column)
              if(supplier == '比价结果' && column == '备注') {
                filterVal.push(supplier+'-'+'compareRemark')
              }else if(supplier == '核定结果' && column == '备注') {
                filterVal.push(supplier+'-'+'finallyRemark')
              }else {
                filterVal.push(supplier+'-'+colVal[index])
              }
            })
            let result = ''
            if (c.length == 1) {
              // 1位
              if (c[0]+length< 91 ) {
                result = String.fromCharCode(c[0])+'1:'+String.fromCharCode(c[0]+length)+'1'
                c[0] += length+1
              }else {
                // 加一位
                c.push(65)
                result = String.fromCharCode(c[0])+'1:'+String.fromCharCode(c[1])+String.fromCharCode(c[0]-90+64+length)+'1'
                c[1] = c[0]-90+64+length+1
                c[0] = 65
              }
            }else if(c.length == 2) {
              if (c[1]+length< 91 ) {
                if (c[1] == 65 && c[0]+length >= 91 ) {
                  result = String.fromCharCode(c[0])+'1:'+String.fromCharCode(c[1])+String.fromCharCode(c[0]-90+64+length)+'1'
                  c[1] = c[0]-90+64+length+1
                  c[0] = 65
                }else {
                  result = String.fromCharCode(c[0])+String.fromCharCode(c[1])+'1:'+String.fromCharCode(c[0])+String.fromCharCode(c[1]+length)+'1'
                  c[1] += length+1
                }
              }else if(c[1]+length >= 91 && c[0] < 90){
                // 第一位加1
                c[0] ++
                result = String.fromCharCode(c[0]-1)+String.fromCharCode(c[1])+'1:'+String.fromCharCode(c[0])+String.fromCharCode(c[1]-90+64+length)+'1'
                c[1] = c[1]-90+64+length+1
              }else {
                // 加一位
                c.push(65)
              }
            }else if(c.length == 3) {
                // 三位 （待定）

            }
            merges.push(result)
          })


          //console.log(filterVal)
          // 处理数据
          this.data.map(item => {
            let record = {}
            let compareSupplier = ''
            let minPriceSupplier = ''
            let finallySupplier = ''
            // 遍历表头
            filterVal.map(key => {
              var supplier = key.split('-')[0]
              var reKey = key.split('-')[1]
              if (item[supplier]) {
                record[key] = item[supplier][reKey]
                if (item[supplier]['compareStatus'] == 1) {
                  compareSupplier = supplier
                }
                if (item[supplier]['minPrice'] == 1) {
                  minPriceSupplier = supplier
                }
                if (item[supplier]['finallyAudit'] == 1) {
                  finallySupplier = supplier
                }
              }else if(supplier=='比价结果'&&item[compareSupplier]) {
                record[key] = item[compareSupplier][reKey]
              }else if(supplier=='最终报价') {
                if (item['inquiry']['finallyPrice']&&item['inquiry']['number']) {
                  record['最终报价-finallyPrice'] = item['inquiry']['finallyPrice']
                  record['最终报价-finallyTotalPrice'] = parseFloat(item['inquiry']['finallyPrice'])*parseFloat(item['inquiry']['number'])
                }else {
                  record[key] = null
                }
              }else if(supplier=='拟定报价') {
                if (item['inquiry']['price']&&item['inquiry']['number']) {
                  record['拟定报价-finallyPrice'] = item['inquiry']['price']
                  record['拟定报价-finallyTotalPrice'] = parseFloat(item['inquiry']['price'])*parseFloat(item['inquiry']['number'])
                }else {
                  record[key] = null
                }
              }else if(supplier=='最低价'){
                record[key] = minPriceSupplier?item[minPriceSupplier][reKey]:null
              }else if(supplier == '核定结果') {
                record[key] = finallySupplier?item[finallySupplier][reKey]:null
              }
            })
            list.push(record)
          })
          //console.log(list)
          let data = this.formatJson(filterVal, list)
          let filename = '终审导出'
          this.projects.map(pro => {
            if (pro.id == this.form.proDetailId) {
              filename = pro.name + '终审导出'
            }
          })
          excel.export_json_to_excel({
            multiHeader,
            header,
            merges,
            data,
            autoWidth: true,
            filename: filename
          })
          setTimeout(()=> {
            this.downloadLoading = false
          },2000)
        }).catch(e => {
          console.log(e)
          this.downloadLoading = false
        })
      },
      formatJson(filterVal, jsonData) {
        return jsonData.map(v => filterVal.map(j => v[j]))
      },
      selectChange(value) {
        this.loadInquiries(value)
      },
      loadInquiries(id) {
        if(id) {
          this.form.inquiryName = ''
          getAction('/finallyCheck/findInquiryNameByProId', {proId: id})
            .then(resp => {
              this.inquiries = resp.data
            })
        }
      },
      /**
       * 查询询价模板
       */
      loadCurrentTemplate(id) {
        if (id) {
          getAction('/inquiry/template/findInquiryTemplate', {id: id})
            .then(resp => {
              resp.data[0].jsonKeys = JSON.parse(resp.data[0].jsonKeys)
              resp.data[0].tableColumn = JSON.parse(resp.data[0].tableColumn)
              this.currentTemplate = resp.data[0]
            })
            .finally(()=>{
              this.searchLoading = false
              this.dataLoading = false
            })
        }

      },
      /**
       * 加载项目下拉框数据
       */
      loadProjects() {
        request.get('/project/detail/findByAll')
          .then(response => {
            this.projects = response.data
          })
      },
      /**
       * 查询点击事件
       */
      loadData() {
        if (this.form.proDetailId) {
          this.searchLoading = true
          this.dataLoading = true
          getAction('/finallyCheck/findDraftComparePrice', {proDetailId: this.form.proDetailId, name: this.form.inquiryName})
            .then(resp => {
              this.data = resp.data
              this.dynamicColumns.suppliers = []
              this.data.map(item => {
                Object.keys(item).map(key => {
                  if(key != 'inquiry' && key != 'draft' && !this.dynamicColumns.suppliers.includes(key)){
                    this.dynamicColumns.suppliers.push(key)
                  }
                })
              })
              // 渲染动态列
              this.dynamicColumns.suppliers.map(item => {
                this.dynamicColumns.columns.push({
                  title: item,
                  dataIndex: item,
                  scopedSlots: { customRender: item}
                })
              })
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
                  if (item['inquiry'].finallyPrice){
                    this.cost += parseFloat(item['inquiry'].finallyPrice) * parseInt(item['inquiry'].number)
                  }else {
                    this.cost += parseFloat(item['inquiry'].price) * parseInt(item['inquiry'].number)
                  }
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
              if (resp.data.length > 0) {
                this.loadCurrentTemplate(resp.data[0]['inquiry'].templateId)
              }else {
                this.searchLoading = false
                this.dataLoading = false
              }
            })
        }else {
          this.$message({ message: '请选择项目', type: 'warning' })
        }

      },
      /**
       * 终审选择点击事件
       */
      finalCheck(row, veto) {
        const id = row.compareId
        const name = row.name
        const supplier = row.supplier
        const quoteId = row.id

        //console.log(row)
        if(id && name && supplier && veto == 0 && row.businessAudit == 1 && row.technicalAudit == 1) {
          //alert(id + '  ' + name + '  ' + supplier)
          const data = [...this.data]
          const allCompareIds = []
          data.map(item => {
            //console.log(item)
            if (item.inquiry.name == name && row.inquiryId == item.inquiry.inquiryId) {
              this.dynamicColumns.suppliers.map(s => {
                if(item[s]){
                  item[s].finallyAudit = 0
                  allCompareIds.push(item[s].compareId)
                  if(item[s]['id'] == quoteId) {
                    item[s].finallyAudit = 1
                  }
                }
              })
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
          //console.log(this.data)
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
              if (item['inquiry'].finallyPrice) {
                this.cost += parseFloat(item['inquiry'].finallyPrice) * parseInt(item['inquiry'].number)
              }else {
                this.cost += parseFloat(item['inquiry'].price) * parseInt(item['inquiry'].number)
              }
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
      /**
       * 终审选用提交事件
       */
      submitCheck() {
        const submitForm = { checkCompareIds: [], uncheckCompareIds: [], remarks: []}
        const allCompareIds = []
        //console.log(this.data)
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
      /**
       * 产品池查询
       */
      poolFind() {
        if(this.dialogSearchForm.name || this.dialogSearchForm.model){
          request.request({
            url: '/pool/fuzzyQueryByNameOrModel',
            method: 'get',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            params: {name: this.dialogSearchForm.name, model: this.dialogSearchForm.model}
          }).then(resp => {
            this.poolData = resp.data
          })
        }else {
          this.$message({ message: "请输入查询条件", type: 'warning' })
        }
      },
      /**
       * 产品池table行点击
       */
      rowClick(row, column) {
        if(this.form1.inquiry.finallyPrice) {
          this.form1.inquiry.finallyPrice = row.price
        }else {
          this.form1.price = row.price
        }
      },
      /**
       * 产品池提交事件
       */
      draftDialogHandler(form) {
        this.$refs[form].validate((valid) => {
          if (valid) {
            let finallyPrice = ''
            if(this.form1.inquiry.finallyPrice) {
              finallyPrice = this.form1.inquiry.finallyPrice
            }else {
              finallyPrice = this.form1.price
            }
            request.request({
              url: '/inquiry/finallyUpdateDraft',
              method: 'post',
              headers: {
                'Content-Type': 'application/json'
              },
              data: JSON.stringify({id: this.form1.id, finallyPrice: finallyPrice, operator: getUser()})
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
      /**
       * 拒绝 重新询价提交事件
       */
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
      /**
       * 加载项目下拉框数据
       */
      tableRowClassName(row, index) {

        if (row.inquiry.veto == 1) {
          return 'danger-row';
        }
        return '';
      },
      draftClick(inquiry, draft) {
        this.loadPool(inquiry.name)
        this.draftDialogVisible = true
        this.form1 = {id: inquiry.inquiryId, inquiry: inquiry, price: draft.price, totalPrice: draft.totalPrice}
      },
      loadPool(name) {
        this.poolLoading = true
        request.request({
          url: '/pool/findHistoryPrices',
          method: 'get',
          params: {'name': name}
        }).then(resp => {
          this.poolData = resp.data
          this.poolLoading = false
        }).catch(() => {
          this.poolLoading = false
        })
      },
      /**
       * 否决点击事件
       */
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
      dateFormat, nullFormat,
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

    /deep/.ant-table {
      /deep/.ant-table-tbody .danger-row {
        background: #f1b7b7;
      }
      td {
        font-size: 13px;
        text-align: left!important;
      }
      .ellipsis {
        overflow: hidden!important;
        white-space: nowrap!important;
        text-overflow: ellipsis!important;
        font-size: 13px;
      }
      .supplier {
        padding: 0!important
      }
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


