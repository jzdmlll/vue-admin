<template>
  <!-- 审核管理 -->
  <div class="check_list">
    <div class="btns" style="padding:1em;margin-bottom:1em;background:#fff">
      <el-button :style="hasSelected?{display: 'inline-block'}:{display: 'none'}" type="primary" size="small" @click="toCheck(key=1)">通过</el-button>
      <el-button :style="hasSelected?{display: 'inline-block'}:{display: 'none'}" type="danger" size="small" @click="toCheck(key=2)">拒绝</el-button>
      <el-button :style="hasSelected?{display: 'inline-block'}:{display: 'none'}" type="info" size="small" @click="toCheck(key=0)">撤销</el-button>
      <el-select v-model="searchForm.proDetailId" style="margin-right: 6px" filterable clearable placeholder="请选择项目" value-key="name">
        <el-option v-for="item in projects" :key="item.id" :label="item.name" :value="item.id" ></el-option>
      </el-select>
      <el-select v-model="searchForm.status" style="margin-right: 6px" :style="searchForm.status.length >2 ? {width:'250px'}:{}" clearable placeholder="请选择审核状态" value-key="name">
        <el-option v-for="item in select" :key="item.status" :label="item.name" :value="item.status" />
      </el-select>
      <el-input v-if="$route.name == '商务审核'" v-model="searchForm.supplier"  placeholder="请输入供应商名"></el-input>
      <el-button style="margin-right: 6px" type="primary" icon="el-icon-search" size="small" @click="toSearch">查询</el-button>
      <el-link v-for="item in files" type="primary" :download="item.name" target="_blank" :href = "item.url">{{item.name}} | </el-link>
    </div>
    <div style="padding:1em;margin-bottom:1em;background:#fff">
      <a-table
        size="small"
        :loading="loading"
        :data-source="proChecks"
        :columns="realColumns"
        class="childTable"
        :row-class-name="tableRowClassName"
        :rowKey="record => record.id"
        :scroll="{x: 2000, y: tableHeight}"
        :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
      >
        <span slot="files" slot-scope="record">
          <span v-for="file in record" v-if="file.type == fileType">
            <el-link :href="file.url" :download="file.name" target="_blank" type="primary">{{file.name}}</el-link><br>
          </span>
        </span>
        <span slot="image" slot-scope="text, record, index">
          <el-image fit="contain" style="height: 40px; width:auto" :src="text" :preview-src-list="[text]" v-if="text!=null && text != ''">
            <div slot="error" class="image-slot">
              <i class="el-icon-picture-outline"></i>
            </div>
          </el-image>
        </span>
        <span slot="technicalAudit" slot-scope="text, record, index">
          <el-tag :type="text === 0 ? 'info':(text === 1? 'success':'danger')">{{ statu(text) }}</el-tag>
        </span>
        <span slot="businessAudit" slot-scope="text, record, index">
          <el-tag :type="text === 0 ? 'info':(text === 1? 'success':'danger')">{{ statu(text) }}</el-tag>
        </span>
-->      </a-table>
    </div>

    <!-- 模态框 -->
    <el-dialog title="填写备注" :visible.sync="visible">
      <el-form ref="form" :rules="codeRules" :model="form"  status-icon>
        <el-form-item label="备注" label-width="80px" size="small" prop="remark">
          <el-input type="text" v-model="form.remark"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="visible = false">取 消</el-button>
        <el-button type="primary" size="small" @click="submitHandler('form')">提 交</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import request from '@/utils/request'
import qs from 'querystring'
import '@/styles/auto-style.css'
import { getUser } from '@/utils/auth'
import { getAction } from '@/api/manage'

let checkStatusCol = ''

let columns = [
  { title: '供应商', dataIndex: 'quote.supplier', key: 'quote.supplier', width: 100,
    sorter: (a, b) => a.quote.supplier.length - b.quote.supplier.length, sortDirections: ['descend', 'ascend'] },
  { title: '商家品牌', dataIndex: 'quote.suBrand', key: 'quote.suBrand', width: 120,
    sorter: (a, b) => a.quote.suBrand.length - b.quote.suBrand.length, sortDirections: ['descend', 'ascend'] },
  { title: '商家设备型号', dataIndex: 'quote.suModel', key: 'quote.suModel', width: 160,
    sorter: (a, b) => a.quote.suModel.length - b.quote.suModel.length, sortDirections: ['descend', 'ascend'] },
  { title: '商家技术参数', dataIndex: 'quote.suParams', key: 'quote.suParams', align: 'center',
    sorter: (a, b) => a.quote.suParams.length - b.quote.suParams.length, sortDirections: ['descend', 'ascend'] },
  { title: '商家单价', dataIndex: 'quote.suPrice', key: 'quote.suPrice', width: 80,
    sorter: (a, b) => a.quote.suPrice - b.quote.suPrice, sortDirections: ['descend', 'ascend'] },
  { title: '商家总价', dataIndex: 'quote.suTotalPrice', key: 'quote.suTotalPrice', width: 80,
    sorter: (a, b) => a.quote.suTotalPrice - b.quote.suTotalPrice, sortDirections: ['descend', 'ascend'] },
  { title: '商家货期', dataIndex: 'quote.suDelivery', scopedSlots: 'quote.suDelivery', width: 100,
    sorter: (a, b) => a.quote.suDelivery - b.quote.suDelivery, sortDirections: ['descend', 'ascend'] },
  { title: '质保期', dataIndex: 'quote.warranty', key: 'quote.warranty', width: 100,
    sorter: (a, b) => a.quote.warranty - b.quote.warranty, sortDirections: ['descend', 'ascend'] },
  { title: '文件',  dataIndex: 'files', scopedSlots: { customRender: 'files' }, width: 100, key: 'files',  align: 'center'},
  { title: '设备图片', dataIndex: 'quote.image', scopedSlots: { customRender: 'image' }, width: 80, key: 'quote.image', align: 'center'},
  { title: '状态', dataIndex: 'businessAudit', scopedSlots: { customRender: 'businessAudit' }, width: 100, key: 'businessAudit',
    sorter: (a, b) => a.checkStatus - b.checkStatus, sortDirections: ['descend', 'ascend'] },
  { title: '状态', dataIndex: 'technicalAudit', scopedSlots: { customRender: 'technicalAudit' }, width: 100, key: 'technicalAudit',
    sorter: (a, b) => a.checkStatus - b.checkStatus, sortDirections: ['descend', 'ascend'] },
  { title: '商家备注', dataIndex: 'quote.suRemark', key: 'quote.suRemark', width: 120,
    sorter: (a, b) => a.quote.suRemark - b.quote.suRemark, sortDirections: ['descend', 'ascend'] },
  { title: '备注', dataIndex: 'businessRemark',  key: 'businessRemark', width: 100,
    sorter: (a, b) => a.checkStatus - b.checkStatus, sortDirections: ['descend', 'ascend'] },
  { title: '备注', dataIndex: 'technicalRemark',  key: 'technicalRemark', width: 100,
    sorter: (a, b) => a.checkStatus - b.checkStatus, sortDirections: ['descend', 'ascend'] },

  {
    title: '操作',
    dataIndex: 'operation',
    scopedSlots: { customRender: 'operation' },
    width: 100,
    fixed: 'right'
  }
]

export default {
  data() {
    return {
      tableHeight: document.documentElement.clientHeight - 340,

      currentTemplate: {},
      files: [],
      searchForm: {status: ''},
      visible: false,
      checkStatusCol: '',
      fileType: -1,
      proChecks: [],
      loading: false,
      columns,
      prop: {
        '技术审核': ['quote.supplier', 'name', 'meter', 'measuringRange', 'meterSignal', 'connectionMode', 'tube',
          'model', 'quote.suModel', 'params', 'quote.suParams', 'checkStatus', 'quote.image', 'files', 'technicalAudit', 'technicalRemark', 'quote.suRemark', 'quote.suBrand'
        ],
        '商务审核': ['quote.supplier', 'name', 'params', 'meter', 'measuringRange', 'meterSignal', 'connectionMode', 'tube',
          'quote.suPrice', 'quote.suTotalPrice', 'suWarranties', 'checkStatus', 'files', 'businessAudit', 'businessRemark', 'quote.suRemark'
        ],
      },
      realColumns: [],
      status: ['未审核', '通过', '拒绝'],
      select: [{ status: 0, name: '未审核' }, { status: 1, name: '通过' }, { status: 2, name: '拒绝' }],
      form: {},
      projects: [],
      selectedRowKeys: [],
      inquiryIds: [],
      codeRules: {
        remark: [
          {required: true, message: '不能为空', trigger: 'blur'}
        ],
      }
    }
  },
  computed: {
    hasSelected() {
      return this.selectedRowKeys.length > 0
    }
  },
  mounted() {
    var that = this;
    // <!--把window.onresize事件挂在到mounted函数上-->
    window.onresize = () => {
      return (() => {
        window.fullHeight = document.documentElement.clientHeight;
        that.tableHeight = window.fullHeight - 340;
      })()
    };
  },
  async created() {
    //this.loadChecks()
    //this.initColumns()
    await this.loadProjects()
    this.searchForm.status = 0

    if(this.$route.query && this.$route.query.proId){
      this.$set(this.searchForm, 'proDetailId', parseInt(this.$route.query.proId))
      this.toSearch()
    }
  },
  methods: {
    loadCurrentTemplate(id) {
      if (id) {
        getAction('/inquiry/template/findInquiryTemplate', {id: id})
          .then(resp => {
            resp.data[0].jsonKeys = JSON.parse(resp.data[0].jsonKeys)
            resp.data[0].tableColumn = JSON.parse(resp.data[0].tableColumn)
            this.currentTemplate = resp.data[0]

            this.initColumns()
          })
      }

    },
    tableRowClassName(row, index){
      if (row.quote.dataSource == 0) {
        return 'warning-row';
      }
      return '';
    },
    submitHandler(form) {
      const key = this.form.key
      let status = ''
      let remark = ''
      let url = ''
      if (this.$route.name == '技术审核') {
        status = 'technicalAudit'
        remark = 'technicalRemark'
        url = '/proCheck/updateTechnicalStatus'
      }else if (this.$route.name == '商务审核') {
        status = 'businessAudit'
        remark = 'businessRemark'
        url = '/proCheck/updateBusinessStatus'
      }
      const data = []
      if(key == 2){
        this.$refs[form].validate((valid) => {
          if(valid){
            this.selectedRowKeys.map(id => {
              this.proChecks.map(item => {
                if(id == item.id) {
                  item.operator = parseInt(getUser())
                  item[status] = key
                  item[remark] = this.form.remark
                  data.push(item)
                }
              })
            })
            request.request({
              url: url,
              method: 'post',
              headers: {
                'Content-Type': 'application/json'
              },
              data: JSON.stringify(data)
            }).then(response => {
              this.$message({ message: response.message, type: 'success' })
              this.selectedRowKeys = []
              this.inquiryIds = []
              this.toSearch()
              this.visible = false
            }).catch(()=>{
              this.toSearch()
            })
          }else{
            console.log('error commit')
            return false
          }
        })
      }else{
        this.selectedRowKeys.map(id => {
          this.proChecks.map(item => {
            if(id == item.id) {
              item.operator = parseInt(getUser())
              item[status] = key
              item[remark] = this.form.remark
              data.push(item)
            }
          })
        })
        request.request({
          url: url,
          method: 'post',
          headers: {
            'Content-Type': 'application/json'
          },
          data: JSON.stringify(data)
        }).then(response => {
          this.$message({ message: response.message, type: 'success' })
          this.selectedRowKeys = []
          this.inquiryIds = []
          this.toSearch()
          this.visible = false
        }).catch(()=>{
          this.toSearch()
        })
      }
    },
    getUser,
    toCheck(key) {
      this.visible = true
      this.form = {}
      this.form.key = key

    },
    onSelectChange(selectedRowKeys, selectedRows) {
      const rows = selectedRows.map(item => {
        if (item.id) {
          return item.id
        }
      })
      this.selectedRowKeys = rows
    },
    toSearch() {

      if (this.searchForm.proDetailId){
        getAction('/file/findByProId',{proId : this.searchForm.proDetailId})
          .then(resp => {
            this.files = resp.data
          })
      }

      this.loading = true
      let url = ''
      if (this.$route.name == '技术审核') {
        url = '/proCheck/findTechnicalCheck'
      }else if (this.$route.name == '商务审核') {
        url = '/proCheck/findBusinessCheck'
      }
      this.searchForm.proDetailId = parseInt(this.searchForm.proDetailId)

      request.request({
        url: url,
        method: 'get',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        params: this.searchForm
      })
        .then(response => {
          this.proChecks = response.data
          this.loading = false
          if (this.proChecks.length > 0) {
            this.loadCurrentTemplate(this.proChecks[0]['inquiry'].templateId)
          }
        }).catch(()=>{
          this.loading = false
        })
      if (!this.searchForm.proDetailId) {
        delete this.searchForm.proDetailId
      }
    },
    loadProjects() {
      request.get('/project/detail/findByAll')
        .then(response => {
          this.projects = response.data
        })
    },
    statu(text) {
      return this.status[parseInt(text)]
    },
    loadChecks() {
      let url = ''
      if (this.$route.name == '技术审核') {
        url = '/proCheck/findTechnicalCheck'
      }else if (this.$route.name == '商务审核') {
        url = '/proCheck/findBusinessCheck'
      }
      request.get(url)
        .then(response => {
          this.proChecks = response.data
          this.loading = false
        }).catch(()=>{
          this.loading = false
        })
    },
    initColumns() {
      // alert(this.$route.name)
      if (this.$route.name == '技术审核') {
        this.fileType = 2
      }else if (this.$route.name == '商务审核') {
        this.fileType = 3
      }
      this.realColumns = []
      this.currentTemplate.tableColumn.map(item => {
        if (this.prop[this.$route.name].includes(item.key) ) {
          if (item.key == 'params' || item.key == 'model' ) {
            this.$delete(item, 'width')
          }
          item.key = 'inquiry.'+item.key
          item.dataIndex = 'inquiry.'+item.dataIndex

          this.realColumns.push(item)
        }
      })

      this.columns.map(item => {
        if (this.prop[this.$route.name].includes(item.key) ) {
          this.realColumns.push(item)
        }
      })
    }
  }
}
</script>

<style lang="scss">
  .check_list {
    /deep/.el-form-item__content{
      height:auto;
      line-height:32px;
      margin-left:90px!important
    }
    .childTable{
      .warning-row {
        background: #eae2c5;
      }
      /*th, td, .ant-table-column-sorters {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        cursor: pointer;
        max-width: 110px!important;
        font-size: 13px;
        span, div {
          font-size: 13px;
        }
      }*/
      td, .ant-table-column-sorters {
        padding: 10px 8px;
      }
      th {
        padding: 10px 2px;
      }

      /deep/.ant-table-hide-scrollbar {
        overflow: auto!important;
      }
    }
  }
</style>
