<template>
  <!-- 报价管理 -->
  <div class="pro_quote_list">
    <el-tabs type="border-card" @tab-click="tabClick">
      <el-tab-pane label="报价管理">
        <div class="btns" style="padding:1em;margin-bottom:1em;background:#fff">
          <el-tooltip class="item" effect="dark" content="批量导入报价" placement="bottom-start">
            <el-button type="primary" size="small" @click="batchImport"><a-icon type="import" style="font-size: 12px;margin-right: 5px"/>批量导入报价</el-button>
          </el-tooltip>
          <el-select v-model="searchForm.proDetailId" style="margin-right: 6px" filterable clearable placeholder="请选择项目" value-key="name">
            <el-option v-for="item in projects" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
          <el-input v-model="searchForm.name"  placeholder="请输入设备名"></el-input>
          <el-input v-model="searchForm.model" placeholder="请输入型号"></el-input>
          <el-button style="margin-right: 6px" type="primary" icon="el-icon-search" size="small" @click="toSearch">查询</el-button>
        </div>
        <div style="padding:1em;margin-bottom:1em;background:#fff">
          <a-table class="parentTable" :loading="loading" size="middle" :data-source="inquiryList" :scroll="{ x: 786 }"
                   :row-class-name="tableRowClassName" @expand="expandChange" :rowKey="record => record.id">
            <a-table-column v-for="item in currentTemplate.tableColumn" ellipsis="true" :width="item.width" :align="item.align" :key="item.key" :title="item.title" :dataIndex="item.dataIndex">
              <template slot-scope="text, record">
                <a-tooltip placement="topLeft" :title="text+''">
                  <span @click="handleCopy(text, $event)">{{ text }}</span>
                </a-tooltip>
              </template>
            </a-table-column>
            <a-table-column>

            </a-table-column>
            <a-table-column
              key="operation"
              title="操作"
              data-index="operation"
              align="center"
              :width="230">
              <template slot-scope="text, record, index">
                <el-button type="success" icon="el-icon-star-on" size="mini" style="padding: 7px 10px;background: #faad14;border-color:#faad14" @click="poolChoose(record)">产品池</el-button>
                <el-button type="success" size="mini" style="padding: 7px 10px;" @click="toCheck(record)">送审</el-button>
                <el-button type="success" size="mini" style="padding: 7px 10px;" @click="toCompare(record)">比价</el-button>
              </template>
            </a-table-column>
            <a-table
              slot="expandedRowRender"
              slot-scope="scope"
              class="childTable"
              :class="scope.detailList.length > 0 ? { noData: false}:{noData: true}"
              :scroll="{x: 1580}"
              :columns="innerColumns"
              :data-source="scope.detailList"
              :pagination="false"
              :loading="childLoading[scope.id]"
              :row-class-name="tableRowClassName2"
            >
              <span slot="technicalAudit" slot-scope="text, record, index">
                <el-tag :type="text!=null?(text === 0 ? 'info':(text === 1? 'success':'danger')):'warning'">{{ statu(text) }}</el-tag>
              </span>
              <span slot="businessAudit" slot-scope="text, record, index">
                <el-tag :type="text!=null?(text === 0 ? 'info':(text === 1? 'success':'danger')):'warning'">{{ statu(text) }}</el-tag>
              </span>
              <template
                v-for="col in ['supplier','suBrand','suParams','suModel','brand','suPrice','suTotalPrice','suDelivery',
                           'warranty','suRemark']"
                :slot="col"
                slot-scope="text, record, index"
              >
                <a-tooltip placement="topLeft" :title="text+''">
                  <div :key="col">
                    <a-input
                      v-if="record.editable"
                      style="margin: -5px 0"
                      :value="text"
                      @change="e => handleChange(e.target.value, record, col)"
                    />

                    <template v-if="!record.editable" >
                      <span @click="handleCopy(text, $event)">{{ text }}</span>
                    </template>
                  </div>
                </a-tooltip>
              </template>
              <template slot="operation" slot-scope="text, record, index">
                <div class="editable-row-operations" style="text-align: center">
              <span v-if="record.editable" >
                  <el-button type="primary" icon="el-icon-upload" size="mini" @click="toEdit(record)" />
                <el-tooltip class="item" effect="dark" content="行内编辑" placement="bottom-start">
                  <el-button type="success" size="mini" style="padding: 7px 10px;" @click="save(record)">保存</el-button>
                </el-tooltip>
                <a-popconfirm title="确定取消修改吗?" @confirm="() => cancel(record)">
                  <el-tooltip class="item" effect="dark" content="取消" placement="bottom-start">
                    <el-button type="danger" size="mini" style="padding: 7px 10px;">取消</el-button>
                  </el-tooltip>
                </a-popconfirm>
              </span>
                  <span v-else>
                  <el-button type="primary" icon="el-icon-upload" size="mini" @click="toEdit(record)" />
                <el-tooltip v-if="record.technicalAudit==0 && record.businessAudit==0" class="item" effect="dark" content="行内编辑" placement="bottom-start">
                  <el-button type="primary" icon="el-icon-edit" size="mini" @click="edit(record)" />
                </el-tooltip>
                <el-tooltip v-if="record.technicalAudit==2 || record.businessAudit==2" class="item" effect="dark" content="新增报价" placement="bottom-start">
                  <el-button type="primary" icon="el-icon-plus" size="mini" @click="addQuote(record)" />
                </el-tooltip>
                    <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteQuote(record)"></el-button>
              </span>
                </div>
              </template>
            </a-table>
          </a-table>
        </div>
        <!-- 模态框 -->
        <el-dialog v-el-drag-dialog :title="title" :visible.sync="visible">
          <el-steps :active="active" simple style="background: #d8f1e3;margin-bottom: 8px;padding: 13px 4%;height: 36px">
            <el-step title="上传询价文件" icon="el-icon-upload" />
            <el-step title="上传技术文件" icon="el-icon-upload" />
          </el-steps>
          <el-form ref="form" :model="form" :rules="codeRules" status-icon>
            <div>
              <div :style="active === 1?{display: 'block'}:{display:'none'}">
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
                    上传询价文件
                  </p>
                  <p class="ant-upload-text">
                    点击或者拖拽文件来上传
                  </p>
                  <p class="ant-upload-hint">
                    支持单个或多个文件上传. 单个文件请不要超过12M
                  </p>
                </a-upload-dragger>

              </div>
              <div :style="active === 2?{display: 'block'}:{display:'none'}">
                <a-upload-dragger
                  name="file"
                  :multiple="true"
                  :action="fileUploadUrl"
                  withCredentials
                  list-type="picture"
                  :before-upload="beforeUpload"
                  :file-list="fileList1"
                  @change="uploadStatusChange1"
                  accept="*"
                >
                  <p class="ant-upload-drag-icon">
                    <a-icon type="inbox" />
                  </p>
                  <p class="ant-upload-text" style="color: #40a9ff">
                    上传技术文件
                  </p>
                  <p class="ant-upload-text">
                    点击或者拖拽文件来上传
                  </p>
                  <p class="ant-upload-hint">
                    支持单个或多个文件上传. 单个文件请不要超过12M
                  </p>
                </a-upload-dragger>
              </div>
            </div>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button size="small" @click="cancelHandler">{{ this.active === 1?'取消':'上一步' }}</el-button>
            <el-button type="primary" :loading="submitLoading" size="small" @click="saveRecordHandler('form')">{{ this.active === 2?'确定':'下一步' }}</el-button>
          </div>
        </el-dialog>
        <el-dialog v-el-drag-dialog title="批量导入报价" class="importDialog" :visible.sync="visible2">
          <el-form ref="form1" :model="form1" :rules="codeRules" status-icon>
            <div>
              <!--<el-form-item label="" label-width="0px" size="small" prop="proDetailId">
                <el-select v-model="form1.proDetailId" filterable clearable placeholder="请选择项目" value-key="name" size="small">
                  <el-option v-for="item in projects" :key="item.id" :label="item.name" :value="item.id" />
                </el-select>
              </el-form-item>-->
              <div style="margin: 8px 0;position: relative">
                <el-button @click="clickFileInput" type="primary" size="small"><a-icon type="file-excel" style="font-size: 12px;margin-right: 5px"/>excel导入</el-button>
                <input type="file" ref="upload" accept=".xls,.xlsx" @change="readExcel" class="outputlist_upload">
                <div v-if="excelRows>0" style="position: absolute;left: 0;padding: 4px 0;font-size: 12px;color: #909399">从Excel读取到
                  <span style="color: #42b983">{{excelRows}}</span>条数据
                </div>
              </div>
              <el-input
                style="margin: 12px 0"
                type="textarea"
                placeholder="点击上方按钮导入或者复制excel中数据来粘贴"
                :autosize="{ minRows: 4, maxRows: 12}"
                v-model="importData">
              </el-input>
            </div>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button size="small" @click="cancelHandler2">取消</el-button>
            <el-button type="primary" :loading="submitLoading" size="small" @click="importHandler('form1')">提交</el-button>
          </div>
        </el-dialog>
        <!-- 模态框 -->
        <el-dialog v-el-drag-dialog title="选择产品池产品" class="importDialog" :visible.sync="poolChooseVisible">
          <el-input type="text"
                    v-model="poolChooseSearchForm.name"
                    placeholder="设备名" size="small" style="max-width: 200px;"></el-input>
          <el-input type="text"
                    v-model="poolChooseSearchForm.model"
                    placeholder="型号" size="small" style="max-width: 200px;"></el-input>
          <el-button type="primary" size="small" @click="find">查询</el-button>
          <el-form :model="poolChooseForm" status-icon>
            <el-table :data="poolData" v-loading="poolChooseLoading" size="small">
              <el-table-column label width="35">
                <template slot-scope="scope">
                  <el-radio :label="scope.row.id" v-model="poolChooseForm.id">&nbsp;</el-radio>
                </template>
              </el-table-column>
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
            <el-button size="small" @click="poolChooseVisible = false">取消</el-button>
            <el-button type="primary" size="small" @click="poolChooseSubmitHandler">提交</el-button>
          </div>
        </el-dialog>
      </el-tab-pane>
      <el-tab-pane label="供应商报价管理">
        <div class="btns" style="padding:1em;margin-bottom:1em;background:#fff">
          <el-tooltip class="item" v-if="selectedId.length > 0" effect="dark" content="批量删除" placement="bottom-start">
            <el-button type="danger" size="small" icon="el-icon-delete" @click="batchDelete">批量删除</el-button>
          </el-tooltip>
<!--          <el-button v-if="selectedId.length>0" style="margin-right: 6px" type="primary" icon="el-icon-document" size="small" :loading="downloadLoading" @click="handleDownload">导出Excel</el-button>-->
          <el-select v-model="searchFormQuote.proDetailId" style="margin-right: 6px" filterable clearable placeholder="请选择项目" value-key="name">
            <el-option v-for="item in projects" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
          <el-input v-model="searchFormQuote.supplier" style="width: auto" placeholder="请输入供应商名"></el-input>
          <el-button style="margin-right: 6px" type="primary" icon="el-icon-search" size="small" @click="toSearchQuote">查询</el-button>
        </div>
        <div style="padding:1em;margin-bottom:1em;background:#fff">
          <el-table id="quote_table" class="parentTable" v-loading="quoteLoading" @selection-change="handleSelectionChange"
                    :row-class-name="tableRowClassName1" ref="quoteList" :data="quoteList" stripe size="small" :max-height="tableHeight">
            <el-table-column
              type="selection"
              width="55">
            </el-table-column>
            <el-table-column :show-overflow-tooltip="true" prop="supplier" label="供应商" />
            <el-table-column :show-overflow-tooltip="true" prop="inquiry.name" label="设备名" />
            <el-table-column :show-overflow-tooltip="true" prop="inquiry.params" label="技术要求" />
            <el-table-column :show-overflow-tooltip="true" prop="inquiry.model" label="设备型号" />
            <el-table-column :show-overflow-tooltip="true" prop="suModel" label="实际型号" />
            <el-table-column :show-overflow-tooltip="true" prop="suParams" label="实际参数" />
            <el-table-column :show-overflow-tooltip="true" prop="suPrice" label="单价" />
            <el-table-column :show-overflow-tooltip="true" prop="suTotalPrice" label="总价" />
            <el-table-column :show-overflow-tooltip="true" prop="inquiry.number" label="数量" />
            <el-table-column :show-overflow-tooltip="true" prop="inquiry.unit" label="单位" />
          </el-table>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 模态框 -->
    <el-dialog v-el-drag-dialog title="新增报价" :visible.sync="quoteVisible">
      <el-form :model="quoteForm" status-icon>
        <el-row>
          <el-col :sm="24" :lg="12">
            <el-form-item size="mini" label="供应商" label-width="80px" prop="supplier">
              <el-input v-model="quoteForm.supplier" autocomplete="off" size="small" />
            </el-form-item>
          </el-col>
          <el-col :sm="24" :lg="12">
            <el-form-item label="型号" label-width="80px" prop="suModel">
              <el-input v-model="quoteForm.suModel" autocomplete="off" size="small" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :sm="24" :lg="12">
            <el-form-item label="品牌" label-width="80px" prop="suBrand">
              <el-input v-model="quoteForm.suBrand" autocomplete="off" size="small" />
            </el-form-item>
          </el-col>
          <el-col :sm="24" :lg="12">
            <el-form-item label="技术参数" label-width="80px" prop="suParams">
              <el-input v-model="quoteForm.suParams" autocomplete="off" size="small" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :sm="24" :lg="12">
            <el-form-item label="单价" label-width="80px" prop="suPrice">
              <el-input v-model="quoteForm.suPrice" autocomplete="off" size="small" />
            </el-form-item>
          </el-col>
          <el-col :sm="24" :lg="12">
            <el-form-item label="总价" label-width="80px" prop="suTotalPrice">
              <el-input v-model="quoteForm.suTotalPrice" autocomplete="off" size="small" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :sm="24" :lg="12">
            <el-form-item label="货期" label-width="80px" prop="suDelivery">
              <el-input v-model="quoteForm.suDelivery" autocomplete="off" size="small" />
            </el-form-item>
          </el-col>
          <el-col :sm="24" :lg="12">
            <el-form-item label="质保期" label-width="80px" prop="warranty">
              <el-input v-model="quoteForm.warranty" autocomplete="off" size="small" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :sm="24" :lg="12">
            <el-form-item label="备注" label-width="80px" prop="suRemark">
              <el-input v-model="quoteForm.suRemark" autocomplete="off" size="small" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="inquiryVisible = false">取消</el-button>
        <el-button type="primary" size="small" @click="addQuoteSubmit">提交</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
  import '@/styles/auto-style.css'
  import request from '@/utils/request'
  import qs from 'querystring'
  import { dateFormat } from '@/utils/format'
  import { getUser } from '@/utils/auth'
  import XLSX from 'xlsx'
  import clip from '@/utils/clipboard'
  import elDragDialog from '@/directive/el-drag-dialog'
  import { getAction, postActionByJson, postActionByQueryString } from '@/api/manage'
  import { sortBykey } from '@/utils/sort'

  const innerColumns = [

    { title: '供应商', dataIndex: 'supplier', scopedSlots: { customRender: 'supplier' }, fixed: 'left', width: 110,
      sorter: (a, b) => a.supplier.length - b.supplier.length, sortDirections: ['descend', 'ascend'] },
    { title: '技审', dataIndex: 'technicalAudit', scopedSlots: { customRender: 'technicalAudit' }, width: 110,
      sorter: (a, b) => a.technicalAudit.length - b.technicalAudit.length, sortDirections: ['descend', 'ascend'] },
    { title: '商审', dataIndex: 'businessAudit', scopedSlots: { customRender: 'businessAudit' }, width: 110,
      sorter: (a, b) => a.businessAudit.length - b.businessAudit.length, sortDirections: ['descend', 'ascend'] },
    { title: '商家技术参数', dataIndex: 'suParams', scopedSlots: { customRender: 'suParams' }, width: 100,
      sorter: (a, b) => a.suParams.length - b.suParams.length, sortDirections: ['descend', 'ascend'] },
    { title: '商家品牌', dataIndex: 'suBrand', scopedSlots: { customRender: 'suBrand' }, width: 110,
      sorter: (a, b) => a.suBrand.length - b.suBrand.length, sortDirections: ['descend', 'ascend'] },
    { title: '商家型号', dataIndex: 'suModel', scopedSlots: { customRender: 'suModel' }, width: 110,
      sorter: (a, b) => a.suModel.length - b.suModel.length, sortDirections: ['descend', 'ascend'] },
    { title: '商家单价', dataIndex: 'suPrice', scopedSlots: { customRender: 'suPrice' }, width: 100, ellipsis: true,
      sorter: (a, b) => a.suPrice - b.suPrice, sortDirections: ['descend', 'ascend'] },
    { title: '商家总价', dataIndex: 'suTotalPrice', scopedSlots: { customRender: 'suTotalPrice' }, width: 100, ellipsis: true,
      sorter: (a, b) => a.suTotalPrice - b.suTotalPrice, sortDirections: ['descend', 'ascend'] },
    { title: '商家货期', dataIndex: 'suDelivery', scopedSlots: { customRender: 'suDelivery' }, width: 100, ellipsis: true,
      sorter: (a, b) => a.suDelivery - b.suDelivery, sortDirections: ['descend', 'ascend'] },
    { title: '质保期', dataIndex: 'warranty', scopedSlots: { customRender: 'warranty' }, width: 100, ellipsis: true,
      sorter: (a, b) => a.warranty - b.warranty, sortDirections: ['descend', 'ascend'] },
    { title: '商家备注', dataIndex: 'suRemark', scopedSlots: { customRender: 'suRemark' }, width: 100, ellipsis: true },
    { title: '技审备注', dataIndex: 'technicalRemark', scopedSlots: { customRender: 'technicalRemark' }, width: 100, ellipsis: true },
    { title: '商审备注', dataIndex: 'businessRemark', scopedSlots: { customRender: 'businessRemark' }, width: 100, ellipsis: true },
    {
      title: '操作',
      dataIndex: 'operation',
      scopedSlots: { customRender: 'operation' },
      width: 170,
      fixed: 'right',
      align: 'center'
    }
  ]


  export default {
    directives: { elDragDialog },
    data() {
      const fileUploadUrl = process.env.VUE_APP_BASE_API + 'file/uploadCache'
      return {

        currentTemplate: {},

        downloadLoading: false,
        quoteForm: {},
        quoteVisible: false,
        status: ['未审核', '通过', '拒绝'],
        hasNextPage: false,
        currentPage: 1,
        tableHeight: document.documentElement.clientHeight-83-220,
        selectedId: [],
        quoteList: [],
        quoteLoading: true,
        file: {},
        excelRows: 0,
        inquiryList: [],
        searchForm: {},
        searchFormQuote: {},
        title: '新增询价',
        childLoading: {},
        form1: {},
        active1: 1,
        keys: {
          "供应商": 'supplier',
          "设备名称": 'name',
          "型号": 'model',
          "技术要求": 'params',
          "单位": 'unit',
          "数量": 'number',
          "报价品牌型号": 'suModel',
          "实际技术参数": 'suParams',
          "设备单价": 'suPrice',
          "设备总价": 'suTotalPrice',
          "货期": 'suDelivery',
          "质保期/售后": 'warranty',
          "备注": 'suRemark',
        },
        outputs: [],
        importData: '',
        visible: false,
        visible2: false,
        projects: [],
        loading: false,
        form: {},
        innerColumns,
        editingKey: '',
        newInquiry: [],
        cacheInquiry: [],
        active: 1,
        fileUploadUrl,
        fileList: [],
        fileList1: [],
        submitLoading: false,
        roles: [],
        proChecks: [],
        codeRules: {
          proDetailId: [
            { required: true, message: '不能为空', trigger: 'blur' }
          ],
          deviceTypeId: [
            { required: true, message: '不能为空', trigger: 'blur' }
          ],
          supplier: [
            { required: true, message: '不能为空', trigger: 'blur' }
          ],
          name: [
            { required: true, message: '不能为空', trigger: 'blur' }
          ],
        },
        poolChooseVisible: false,
        poolChooseLoading: false,
        poolChooseForm: {},
        poolChooseSearchForm: {},
        poolData: [],
      }
    },
    created() {
      this.init()
    },
    mounted() {
      var that = this
      let table = document.querySelector('#quote_table .el-table__body-wrapper');
      table.addEventListener("scroll", function() {
        const scrollDistance =table.scrollHeight - table.scrollTop - table.clientHeight;
        //console.log(table.scrollHeight + '-' +table.scrollTop +'-' +table.clientHeight+'='+scrollDistance)
        if(scrollDistance <= 0.5) {//等于0证明已经到底，可以请求接口
          if(that.hasNextPage){
            that.quoteLoading = true
            const proId = that.searchFormQuote.proDetailId
            const supplier = that.searchFormQuote.supplier
            //请求接口的代码
            request.request({
              url: '/quote/findBySupplierOrPro?pageNum='+that.currentPage,
              method: 'get',
              params: {proId: proId, supplier: supplier}
            }).then( response => {
              //将请求回来的数据和当前展示的数据合并在一起
              that.quoteList = that.quoteList.concat(response.data.list)
              that.currentPage = response.data.nextPage
              that.hasNextPage = response.data.hasNextPage
            })
              .finally(() => {
                that.quoteLoading = false
              })
          }
        }
      })
    },
    methods: {
      loadCurrentTemplate(id) {
        if (id) {
          this.currentTemplate = {}
          getAction('/inquiry/template/findInquiryTemplate', {id: id})
            .then(resp => {
              resp.data[0].jsonKeys = JSON.parse(resp.data[0].jsonKeys)
              resp.data[0].tableColumn = JSON.parse(resp.data[0].tableColumn)
              this.currentTemplate = resp.data[0]
            })
            .catch(() => {
              this.loading = false
            })
        }
      },
      /*handleDownload() {
        if (this.selectedId.length) {
          this.downloadLoading = true
          import('@/vendor/Export2Excel').then(excel => {
            let quote = {
              tHeader: ['报价型号', '报价品牌', '实际技术参数', '设备单价','设备总价','货期','质保期/售后','图片','备注'],
              filterVal: ['suModel', 'suBrand', 'suParams', 'price', 'totalPrice', 'delivery', 'warranty', 'image', 'quoteRemark']
            }
            let tHeader = Object.keys(this.currentTemplate.jsonKeys)
            let filterVal = Object.values(this.currentTemplate.jsonKeys)
            tHeader = ['编号'].concat(tHeader)
            tHeader = tHeader.concat(quote.tHeader)
            filterVal = ['id'].concat(filterVal)
            filterVal = filterVal.concat(quote.filterVal)


            /!* const tHeader = [
               '编号', '序号','供应商', '设备名称', '品牌', '型号', '技术要求', '单位', '报价型号', '报价品牌', '实际技术参数',
               '设备单价','设备总价','货期','质保期/售后','图片','备注'
             ]
             const filterVal = ['id', 'sort', 'supplier', 'name', 'realBrand', 'model', 'params', 'unit', 'suModel', 'suBrand',
               'suParams', 'price', 'totalPrice', 'delivery', 'warranty', 'image', 'remark']*!/
            let list = []
            this.inquiryList.map(item=>{
              console.log(item)
              if(this.selectedId.includes(item.id)){
                let inquiry = {}
                filterVal.map(key => {
                  inquiry[key] = item[key]
                })
                list.push(inquiry)
              }
            })

            list = sortBykey(list, 'sort')
            const data = this.formatJson(filterVal, list)
            excel.export_json_to_excel({
              header: tHeader,
              data,
              filename: this.filename
            })
            this.downloadLoading = false
            this.$refs['quoteList'].clearSelection()

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
      },*/
      toCompare(row) {
        request.get('/quote/sendCompare?inquiryId='+row.id)
          .then(resp=>{
            this.$message({ message: resp.message, type: 'success' })
          })
      },
      toCheck(row) {
        request.get('/quote/initiateAudit?inquiryId='+row.id)
          .then(resp=>{
            this.$message({ message: resp.message, type: 'success' })
          })
      },
      handleCopy(text, event) {
        clip(text, event)
      },
      poolChooseSubmitHandler() {
        if(this.poolChooseForm.id){
          request.request({
            url: '/inquiry/inquiryChoosePool',
            method: 'post',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: qs.stringify({'inquiryId': this.poolChooseForm.inquiryId, 'proPoolId': this.poolChooseForm.id, 'operator': getUser()})
          }).then(resp => {
            this.$message({ message: resp.message, type: 'success' })
            this.poolChooseVisible = false
            this.init()
          })
        }
      },
      find(){
        if(this.poolChooseSearchForm.name || this.poolChooseSearchForm.model){
          request.request({
            url: '/pool/fuzzyQueryByNameOrModel',
            method: 'get',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            params: {name: this.poolChooseSearchForm.name, model: this.poolChooseSearchForm.model}
          }).then(resp => {
            this.poolData = resp.data
          })
        }else {
          this.$message({ message: "请输入查询条件", type: 'warning' })
        }
      },
      poolChoose(row) {
        this.poolChooseVisible = true
        this.poolChooseForm.inquiryId = row.id
        this.loadPool(row.name)
      },
      loadPool(name) {
        this.poolChooseLoading = true
        request.request({
          url: '/pool/findHistoryPrices',
          method: 'get',
          params: {'name': name}
        }).then(resp => {
          this.poolData = resp.data
          this.poolChooseLoading = false
        }).catch(() => {
          this.poolChooseLoading = false
        })
      },
      addQuoteSubmit() {
        if(this.quoteForm.id){
          this.quoteForm.operator = parseInt(getUser())
          request.request({
            url: '/quote/addQuote',
            method: 'post',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: qs.stringify(this.quoteForm)
          }).then(resp => {
            this.$message({ message: resp.message, type: 'success' })
            this.quoteVisible = false
            this.loadChildTable({id: this.quoteForm.inquiryId})
          })
        }
      },
      deleteQuote(row) {
        this.$confirm('将删除选中报价, 是否删除?', '提示', {
          confirmButtonText: '删除',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          request.request({
            url: '/quote/batchSetInvalid',
            method: 'post',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: qs.stringify({ids: [row.id]})
          })
            .then(response => {
              this.$message({ message: response.message, type: 'success' })
              this.loadChildTable({id: row.inquiryId})
            })
        })
      },
      addQuote(row) {
        this.quoteVisible = true
        this.quoteForm = row
      },
      statu(text) {
        return text!=null?this.status[parseInt(text)]:'未送审'
      },
      tableRowClassName2(row, index) {
        if(row.dataSource == 0){
          return 'warning-row';
        }
        return ''
      },
      tableRowClassName1({row, index}) {
        if (row.dataSource == 0) {
          return 'warning-row';
        }
        return '';
      },
      tableRowClassName(row, index){
        if (row.poolNum != 0 && !(row.veto == 1 || row.refuseNum != 0)) {
          return 'warning-row';
        }else if(row.veto == 1 || row.refuseNum != 0){
          return 'danger-row';
        }
        return '';
      },
      batchDelete() {
        this.$confirm('将删除选中报价价, 是否删除?', '提示', {
          confirmButtonText: '删除',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          if (this.selectedId.length > 0) {
            request.request({
              url: '/quote/batchSetInvalid',
              method: 'post',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
              },
              data: qs.stringify({ids: this.selectedId})
            })
              .then(response => {
                this.$message({ message: response.message, type: 'success' })
                this.quoteInit()
              })
          }
        })
      },
      handleSelectionChange(record) {
        const selectedId = []
       // console.log(record)
        record.map(item => {
          selectedId.push(item.id)
        })
        this.selectedId = selectedId
      },
      tabClick(record) {
       // console.log(record.label)
        if (record.label === '供应商报价管理') {
          this.quoteInit()
        }else if(record.label === '供应商报价管理') {
          this.init()
        }
      },
      quoteInit() {
        this.toSearchQuote()
      },
      toSearchQuote() {
        const proId = this.searchFormQuote.proDetailId
        const supplier = this.searchFormQuote.supplier
        request.request({
          url: '/quote/findBySupplierOrPro',
          method: 'get',
          params: {proId: proId, supplier: supplier}
        }).then( response => {
          this.quoteList = response.data.list
          this.currentPage = response.data.nextPage
          this.hasNextPage = response.data.hasNextPage
          this.quoteLoading = false
        })
      },
      async init() {
        await this.loadProjects()
        if(this.projects.length > 0){
          if(!this.searchForm.proDetailId) {
            this.$set(this.searchForm, 'proDetailId', this.projects[0].id)
          }
          this.toSearch()
        }else {
          //this.loading = false
        }

        //this.loadProChecks()
      },
      toSearch() {
        if(this.searchForm.proDetailId) {
          this.loading = true
          request.request({
            url: '/inquiry/findByProDetailId',
            method: 'get',
            params: this.searchForm
          })
            .then(async(response) => {
              response.data.map(item => {
                item.detailList = []
              })
              if (response.data.length > 0) {
                await this.loadCurrentTemplate(response.data[0]['templateId'])
              }
              this.inquiryList = response.data
              this.loading = false
            })
            .catch(() => {
              this.loading = false
            })
        }
      },
      toEdit(record){
        this.submitLoading = false
        this.form = record
        this.active = 1
        this.visible = true
        this.fileList = []
        this.fileList1 = []
        this.title = '编辑询价'
        //this.loadProChecks()
      },
      clickFileInput() {
        this.$refs.upload.dispatchEvent(new MouseEvent('click'))
      },
      readExcel(e) {//表格导入
        var that = this;
        const files = e.target.files;
        //console.log(files);
        if(files.length<=0){//如果没有文件名
          return false
        }else if(!/\.(xls|xlsx)$/.test(files[0].name.toLowerCase())){
          this.$message.error('上传格式不正确，请上传xls或者xlsx格式')
          return false
        }

        const fileReader = new FileReader();
        this.excelRows = 0
        fileReader.onload = (ev) => {
          try {
            const data = ev.target.result;
            const workbook = XLSX.read(data, {
              type: 'binary'
            });
            const wsname = workbook.SheetNames[0];//取第一张表
            const ws = XLSX.utils.sheet_to_json(workbook.Sheets[wsname]);//生成json表格内容
            console.log(ws)
            that.outputs = [];//清空接收数据
            ws.map(item => {
              var num = Object.keys(item).length
              console.log(item)
              if( item['序号'] && num > 2){
                that.outputs.push(item);
                this.excelRows ++
              }
            })
            if(this.excelRows > 0){

              let formData = new FormData();
              formData.append('file', this.$refs.upload.files[0])
              request.request({
                url: '/file/uploadCache',
                method: 'post',
                headers: {
                  'Content-Type': 'multipart/form-data'
                },
                data: formData
              }).then(response => {
                //this.$message({ message: response.message, type: '导入成功' })
                this.file.id = response.fileId
                this.file.name = response.fileName
                this.file.url = response.url
              })
            }
            this.$refs.upload.value = '';
          } catch (e) {
            return false;
          }
        };
        fileReader.readAsBinaryString(files[0]);
      },
      importHandler(form1) {
        this.$refs[form1].validate((valid) => {
          if (valid && this.file.id) {
            this.submitLoading = true
            let form = {files:[]}
            let userId = parseInt(getUser())
            form.files.push(this.file)
            form.proDetailId = this.form1.proDetailId
            form.operator = userId
            request.request({
              url: '/quote/batchAddQuote',
              method: 'post',
              headers: {
                'Content-Type': 'application/json'
              },
              data: JSON.stringify(form)
            }).then( response => {
              this.$message({ message: response.message, type: 'success' })
              this.visible2 = false
              this.submitLoading = false
              this.init()
            }).catch(()=>{
              this.submitLoading = false
            })

          } else {
            this.$message({ message: "文件上传解析中", type: 'warning' })
            return false
          }
        })
      },
      dateFormat,
      batchImport() {
        if (this.searchForm.proDetailId) {
          this.visible2 = true
          this.form1.proDetailId = this.searchForm.proDetailId
          this.submitLoading = false
          this.importData = ''
        }else {
          this.$message({type: 'warning', message: '请选择项目'})
        }

        //this.loadProChecks()
      },
      removeCheck(role) {
        /* this.proChecks.map((item,index) => {
          if(role.id === item.roleId){
            this.proChecks.splice(index,1);
          }
        })*/
        this.proChecks.splice(this.proChecks.findIndex(item => item.roleId === role.id), 1)
      },
      addCheck(role) {
        this.proChecks.push({ checkName: role.checkName, roleId: role.id })
      },
      loadProChecks() {
        request.get('/role/selectAllHasCheckName')
          .then(response => {
            this.roles = response.data
          })
      },
      beforeUpload(file) {
        if (file.size > 12 * 1024 * 1024) {
          this.$message({ message: '上传文件大小不能超过12M', type: 'error' })
          return false
        }
      },
      uploadStatusChange(info) {
        if (info.file.status === 'uploading' || info.file.response.error === 0) {
          let fileList = [...info.fileList]
          fileList = fileList.map(file => {
            if (file.response) {
              file.url = file.response.url
              file.id = file.response.fileId
              file.name = file.response.fileName
              //file.type = 1
            }
            return file
          })

          this.fileList = fileList
        }
      },
      uploadStatusChange1(info) {
        if (info.file.status === 'uploading' || info.file.response.error === 0) {
          let fileList = [...info.fileList]
          fileList = fileList.map(file => {
            if (file.response) {
              file.url = file.response.url
              file.id = file.response.fileId
              file.name = file.response.fileName
              //file.type = 2
            }
            return file
          })
          this.fileList1 = fileList
        }
      },
      handleChange(value, record, column) {
        this.inquiryList.forEach((item, index) => {
          if (item.id === record.proDetailId) {
            this.newInquiry = [...this.inquiryList[index].detailList]
          }
        })
        const target = this.newInquiry.filter(item => record.id === item.id)[0]
        if (target) {
          target[column] = value
          this.inquiryList.forEach((item, index) => {
            if (item.id === record.proDetailId) {
              this.inquiryList[index].detailList = this.newInquiry
            }
          })
        }
      },
      edit(record) {
        this.inquiryList.forEach((item, index) => {
          if (item.id === record.inquiryId) {
            this.newInquiry = [...this.inquiryList[index].detailList]
          }
        })
        this.cacheInquiry = this.newInquiry.map(item => ({ ...item }))
        const target = this.newInquiry.filter(item => record.id === item.id)[0]
        this.editingKey = record.id
        if (target) {
          target.editable = true
          this.inquiryList.forEach((item, index) => {
            if (item.id === record.inquiryId) {
              this.inquiryList[index].detailList = this.newInquiry
            }
          })
        }
      },
      save(record) {
        this.inquiryList.forEach((item, index) => {
          if (item.id === record.inquiryId) {
            this.newInquiry = [...this.inquiryList[index].detailList]
          }
        })
        const newCacheData = [...this.cacheInquiry]
        const target = this.newInquiry.filter(item => record.id === item.id)[0]
        const targetCache = newCacheData.filter(item => record.id === item.id)[0]
        request.request({
          url: '/quote/rowSave',
          method: 'post',
          headers: {
            'Content-Type': 'application/json'
          },
          data: JSON.stringify(record)
        })
          .then(response => {
            this.$message({ message: response.message, type: 'success' })
            if (target && targetCache) {
              delete target.editable
              this.inquiryList.forEach((item, index) => {
                if (item.id === record.inquiryId) {
                  this.inquiryList[index].detailList = this.newInquiry
                }
              })
              Object.assign(targetCache, target)
              this.cacheInquiry = newCacheData
            }
          })
        this.editingKey = ''
      },
      cancel(record) {
        this.inquiryList.forEach((item, index) => {
          if (item.id === record.inquiryId) {
            this.newInquiry = [...this.inquiryList[index].detailList]
          }
        })
        const target = this.newInquiry.filter(item => record.id === item.id)[0]
        this.editingKey = ''
        if (target) {
          Object.assign(target, this.cacheInquiry.filter(item => record.id === item.id)[0])
          delete target.editable
          this.inquiryList.forEach((item, index) => {
            if (item.id === record.inquiryId) {
              this.inquiryList[index].detailList = this.newInquiry
            }
          })
        }
      },
      saveRecordHandler(form) {
        switch (this.active) {
          case 1:
            this.$refs[form].validate((valid) => {
              if (valid) {
                this.active++
              } else {
                console.log('error commit')
                return false
              }
            })
            break
          case 2:
            this.submitLoading = true
            const fileList = this.fileList.map(item => {
              return { id: item.id, name: item.name, url: item.url, type: 3 }
            })
            const fileList1 = this.fileList1.map(item => {
              return { id: item.id, name: item.name, url: item.url, type: 2 }
            })
            this.form.files = [...fileList.concat(fileList1)]
            this.form.operator = parseInt(getUser())
            //this.form.proChecks = this.proChecks
            request.request({
              url: '/quote/saveOrUpdate',
              method: 'post',
              headers: {
                'Content-Type': 'application/json'
              },
              data: JSON.stringify(this.form)
            }).then(response => {
              this.submitLoading = false
              this.visible = false
              this.$message({ message: response.message, type: 'success' })
            })
            break
        }
      },
      cancelHandler() {
        if (this.active === 1) {
          this.visible = false
        } else {
          this.active--
        }
      },
      cancelHandler2() {
        /*if (this.active1 === 1) {
          this.visible2 = false
        } else {
          this.active1--
        }*/
        this.visible2 = false
      },
      toAdd() {
        this.submitLoading = false
        this.form = {}
        this.active = 1
        this.visible = true
        this.fileList = []
        this.fileList1 = []
        this.loadProChecks()
      },
      loadChildTable(record) {
        this.childLoading[record.id] = true
        request.request({
          url: '/quote/findByInquiryId?inquiryId=' + record.id,
          method: 'get'
        }).then(response => {
          this.inquiryList.forEach((item, index) => {
            if (item.id === record.id) {
              this.inquiryList[index].detailList = response.data
              this.childLoading[record.id] = false
            }
          })
        })
      },
      expandChange(expanded, record) {
        if (expanded) {
          this.loadChildTable(record)
        }else {
          //this.childLoading[record.id] = true
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

<style lang="scss">
  .pro_quote_list {
    /deep/.el-form-item__content{
      height:auto;
      line-height:32px;
      margin-left:90px!important
    }
    .parentTable {
      .warning-row {
        background: #eae2c5;
      }
      .danger-row {
        background: #f1b7b7;
      }
    }
    .el-tabs__content {
      background: #fafafa;
    }
    .ant-table-body {
      overflow-x: auto !important;
    }
    .childTable{
      th, td, .ant-table-column-sorters {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        cursor: pointer;
        max-width: 110px!important;
        font-size: 12px;
        span, div {
          font-size: 12px;
        }
      }
      td, .ant-table-column-sorters {
        padding: 10px 8px;
      }
      th {
        padding: 10px 2px;
      }
    }
    .noData .ant-table-body {
      overflow: hidden!important;
    }
    .el-dialog__body {
      .el-form-item__label, .el-form-item__content{
        height: 28px!important;
        line-height: 28px!important;
      }
      .el-form-item {
        height: 28px!important;
        margin-bottom: 18px!important;
        line-height: 28px!important;
      }
      .el-col {
        padding: 0 6px;
      }
      .removeBox {
        height: 100%;
        position: absolute;
        top: 0;
        width: 32px;
        left: 210px;
        i {
          width: 32px;
          height: 24px;
          cursor: pointer;
          color: #319efc;
        }
      }
    }
    .outputlist_upload {
      opacity: 0;
      width: 0;
      overflow: hidden;
    }
    .importDialog {
      .el-form-item {
        .el-form-item__content {
          margin: 0 8px 0 0 !important;
        }
      }
    }
  }
</style>

