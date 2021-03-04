<template>
  <!-- 合同管理 -->
  <div class="contract_list">
    <div class="btns" style="padding:1em;margin-bottom:1em;background:#fff">
      <el-button type="primary" icon="el-icon-plus" size="mini" @click="toAdd">添加</el-button>
      <el-select v-model="searchForm.purProjectId" style="margin-right: 6px" filterable clearable placeholder="请选择项目" value-key="name">
        <el-option v-for="item in purchasePros" :key="item.id" :label="item.projectName" :value="item.id" />
      </el-select>
      <el-input v-model="searchForm.contractName" type="text" size="small" placeholder="合同名" clearable/>
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
        <a-table-column fixed="right" align="center" :width="234" key="action" title="操作">
          <template slot-scope="text, record, index">
            <el-button @click.native.stop="editContract(record)" icon="el-icon-edit" type="success" size="mini" style="padding: 7px 10px;">修改</el-button>
            <el-button @click.native.stop="toCheck(record)" v-if="record.firstAudit==null && record.secondAudit==null && record.threeAudit==null" type="success" icon="el-icon-s-promotion" size="mini" style="padding: 7px 10px;">送审</el-button>
            <el-button @click.native.stop="setProp(record.id)" v-else-if="calculateProgress(record.firstAudit, record.secondAudit, record.threeAudit) == 100" size="mini" type="primary" icon="el-icon-setting" style="padding: 7px 10px;">属性</el-button>
            <el-button @click.native.stop="upload(record, index)" :loading="uploadLoading[index]" type="primary" size="mini" style="padding: 7px 10px;" icon="el-icon-upload">附件</el-button>
            <el-button @click.native.stop="deleteContract(record, index)" icon="el-icon-delete" type="danger" size="mini" style="padding: 7px 10px;">删除</el-button>
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
        :scroll="contractSupplies.length > 0 ?{ x: 1300}:{}"
      >
        <a-table-column defaultSortOrder="ascend" :sorter="(a, b) => a.serialNumber-b.serialNumber" title="序号" key="serialNumber" data-index="serialNumber" align="center" :width="50" />
        <a-table-column :width="100" ellipsis="true" key="item" title="设备" data-index="item" align="center"/>
        <a-table-column :width="100" ellipsis="true" key="purchaseSupply.supplier" title="供应商" data-index="purchaseSupply.supplier" align="center" />
        <a-table-column :width="100" ellipsis="true" key="purchaseSupply.brand" title="品牌" data-index="purchaseSupply.brand" align="center"/>
        <a-table-column :width="100" ellipsis="true" key="purchaseSupply.model" title="规格型号" data-index="purchaseSupply.model" align="center"/>
        <a-table-column :width="70" key="purchaseSupply.price" title="单价" data-index="purchaseSupply.price" align="center"/>
        <a-table-column :width="80" title="总价" align="center">
          <template slot-scope="text, record">
            {{record.purchaseSupply.price*record.purchaseSupply.number}}
          </template>
        </a-table-column>
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

    <!-- 模态框 -->
    <el-dialog :title="title" :visible.sync="dialogVisible">
      <el-form ref="form" status-icon :model="form" :rules="rules">
        <!--<el-form-item label="采购项目" label-width="80px" prop="projectId">
          <el-select v-model="form.projectId" clearable placeholder="请选择">
            <el-option v-for="p in purchasePros" :key="p.id" :label="p.projectName" :value="p.id" />
          </el-select>
        </el-form-item>-->
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
        <el-button size="small" @click="dialogVisible = false">取 消</el-button>
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
        <el-button size="small" @click="checkDialogVisible = false">取 消</el-button>
        <el-button type="primary" size="small" @click="sendCheckHandler">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="上传附件" :visible.sync="uploadDialogVisible">
      <el-form :model="uploadForm">
        <el-row>
          <el-col :span="12">
            <el-form-item label="合同名" label-width="80px" prop="contractName">{{uploadForm.contractName}}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="合同编号" label-width="80px" prop="contractNo">{{uploadForm.contractNo}}</el-form-item>
          </el-col>
        </el-row>
        <div>
          <a-upload-dragger
            name="file"
            :multiple="true"
            :action="fileUploadUrl"
            withCredentials
            list-type="picture"
            :before-upload="beforeUpload"
            :file-list="fileList"
            @change="uploadStatusChange"
          >
            <p class="ant-upload-drag-icon">
              <a-icon type="inbox" />
            </p>
            <p class="ant-upload-text" style="color: #40a9ff">
              上传合同文件
            </p>
            <p class="ant-upload-text">
              点击或者拖拽文件来上传
            </p>
            <p class="ant-upload-hint">
              支持单个或多个文件上传. 单个文件请不要超过12M
            </p>
          </a-upload-dragger>
        </div>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="uploadDialogVisible = false">取 消</el-button>
        <el-button type="primary" :loading="uploadSubmitLoading" size="small" @click="uploadHandler">提 交</el-button>
      </div>
    </el-dialog>

    <el-dialog v-el-drag-dialog title="合同属性" :visible.sync="attrDialogVisible">
      <el-form ref="attrDialogForm" :model="attrDialogForm" :rules="rules" status-icon>
        <el-row :gutter="10">
          <el-col :lg="8" :sm="24">
            <el-form-item label="付款方式" label-width="80px" size="small" prop="paymentMethod">
              <el-select v-model="attrDialogForm.paymentMethod" placeholder="应付款" size="small">
                <el-option v-for="item in ['预付款', '货到付款', '款到发货']" :key="item" :value="item" :label="item"/>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :lg="8" :sm="24">
            <el-form-item label="应付款(元)" label-width="80px" size="small" prop="payable">
              <el-input v-model="attrDialogForm.payable" clearable placeholder="应付款金额" size="small" />
            </el-form-item>
          </el-col>
          <el-col :lg="8" :sm="24">
            <el-form-item label="付款时间" label-width="80px" size="small" prop="payableTime">
              <el-date-picker v-model="attrDialogForm.payableTime" value-format="timestamp" clearable placeholder="预计付款时间" size="small" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="是否有保证金" label-width="80px" size="small" prop="isBond">
          <el-switch
            v-model="attrDialogForm.isBond"
            active-color="#13ce66"
            active-value="1"
            inactive-value="0"
          />
        </el-form-item>
        <el-row v-if="attrDialogForm&&attrDialogForm.isBond == 1" :gutter="10">
          <el-col :lg="12" :sm="24">
            <el-form-item label="保证金(元)" label-width="80px" size="small" prop="bond">
              <el-input v-model="attrDialogForm.bond" clearable placeholder="金额" size="small" />
            </el-form-item>
          </el-col>
          <el-col :lg="12" :sm="24">
            <el-form-item label="应缴纳时间" label-width="80px" size="small" prop="bondTime">
              <el-date-picker v-model="attrDialogForm.bondTime" value-format="timestamp" clearable placeholder="应缴纳时间" size="small" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="attrDialogVisible = false">取 消</el-button>
        <el-button type="primary" size="small" @click="attrDialogHandler">提 交</el-button>
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
  import { beforeUpload, uploadStatusChange } from '@/utils/upload'
  import elDragDialog from '@/directive/el-drag-dialog'


  const fileUploadUrl = process.env.VUE_APP_BASE_API + 'file/uploadCache'

  export default {
    directives: { elDragDialog },
    data() {

      var validNo = (rule, value, callback) => {
        if (!value) {
          return callback(new Error('不能为空'));
        }
        request.get('/purchase/purchaseContractGenerate/findContractNo',{
          params: { contractNo: value }
        })
          .then(response => {
            if (response.data > 0 && value!=this.contractNo) {
              callback(new Error('合同编号已存在'))
            }else {
              callback()
            }
          })
      };
      return {
        fileUploadUrl,

        contractNo: null,

        attrDialogVisible: false,
        attrDialogForm: {},

        uploadForm: {},
        fileList: [],
        uploadKey: true,
        uploadDialogVisible: false,
        uploadSubmitLoading: false,

        uploadLoading: [],

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
          ],
          paymentMethod: [
            { required: true, message: '不能为空', trigger: 'blur'}
          ],
          payable: [
            { required: true, pattern: /^(\-|\+)?\d+(\.\d+)?$/, message: '格式不正确', trigger: 'blur' }
          ],
          bond: [
            { required: true, pattern: /^(\-|\+)?\d+(\.\d+)?$/, message: '格式不正确', trigger: 'blur' }
          ],
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
      editContract(record) {
        this.form = record
        this.title = '修改'
        this.contractNo = record.contractNo
        console.log(record)
        this.dialogVisible = true
      },
      attrDialogHandler() {
        this.$refs['attrDialogForm'].validate((valid) => {
          if (valid) {
            // alert(1)
            this.attrDialogForm.operator = getUser()
            postActionByQueryString('/stock/contractAttribute/saveOrUpdateStockContractAttribute', this.attrDialogForm)
              .then(resp => {
                this.$message({ type: 'success', message: resp.message })
                this.attrDialogVisible = false
              })
          }else {
            console.log('error commit')
            return false
          }
        })
      },
      async setProp(id) {
        this.attrDialogForm.contractId = id
        await this.loadContractAttr(id)
        this.attrDialogVisible = true
      },
      loadContractAttr(contractId) {
        getAction('/stock/contractAttribute/findByContractId', { contractId: contractId })
          .then( resp => {
            if (resp.data) {
              this.attrDialogForm = resp.data
            }
          })
          .catch(()=> {
            this.attrDialogVisible = true
          })
      },
      deleteContract(row, index){
        this.$confirm('是否确定删除？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          postActionByQueryString('/purchase/contract/deleteById',row)
            .then(resp => {
              this.$message({ message: resp.message, type: 'success' })
              this.toSearch()
              this.rowClick(row)
            })
        })
      },
      uploadHandler() {
        if (this.uploadKey) {
          this.uploadSubmitLoading = true
          const fileList = this.fileList.map(item => {
            console.log(item)
            return { id: item.id, name: item.name, url: item.url, type: 5, operator: item.response.operator }
          })
          console.log(fileList)
          let form = {}
          form.purchaseContract = this.uploadForm
          form.purchaseContract.operator = getUser()
          form.fileList = fileList
          postActionByJson('/purchase/contractManagement/uploadContractFile', form)
            .then(resp=> {
              this.$message({ message: resp.message, type: 'success' })
            })
            .finally(() => {
              this.uploadSubmitLoading = false
              this.uploadDialogVisible = false
            })
        }else {
          this.$message({ message: '文件上传未完成', type: 'warning' })
        }
      },
      beforeUpload,
      uploadStatusChange,
      upload(row, index) {
        this.fileList = []
        this.uploadLoading[index] = true
        getAction('/file/findByOtherId',{otherId: row.id, type: 5})
          .then(resp => {
            resp.data.map(item => {
              let response = item
              response.error = 0
              response.fileId = response.id
              response.fileName = response.name
              this.fileList.push({
                uid: 0-item.id,
                name: item.name,
                operator: item.operator,
                status: 'done',
                response: response,
                url: response.url
              })
            })
            this.uploadDialogVisible = true
            this.uploadForm = row
          })
          .finally(()=>{
            this.uploadLoading[index] = false
          })
      },
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
              getAction('/purchase/contractManagement/findPurchaseMessageByContractId', {contractId: row.id})
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
          postActionByQueryString('/purchase/contract/purchaseContractSend', form)
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
        this.contractNo = null
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
        getAction('/purchase/contract/findByProjectId', { projectId: projectId, contractName: this.searchForm.contractName})
          .then(resp => {
            this.contracts = resp.data
            this.contractsLoading = false
          })
          .catch(() => {
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
