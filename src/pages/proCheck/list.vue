<template>
  <!-- 审核管理 -->
  <div class="check_list">
    <div class="btns" style="padding:1em;margin-bottom:1em;background:#fff">
      <el-button :style="hasSelected?{display: 'inline-block'}:{display: 'none'}" type="primary" size="small" @click="toCheck(key=1)">通过</el-button>
      <el-button :style="hasSelected?{display: 'inline-block'}:{display: 'none'}" type="danger" size="small" @click="toCheck(key=2)">拒绝</el-button>
      <el-button :style="hasSelected?{display: 'inline-block'}:{display: 'none'}" type="info" size="small" @click="toCheck(key=0)">撤销</el-button>
      <el-select v-model="form.proDetailId" style="margin-right: 6px" filterable clearable placeholder="请选择项目" value-key="name">
        <el-option v-for="item in projects" :key="item.id" :label="item.name" :value="item.id" />
      </el-select>
      <el-select v-model="form.status" style="margin-right: 6px" :style="form.status.length >2 ? {width:'250px'}:{}" clearable placeholder="请选择审核状态" value-key="name">
        <el-option v-for="item in select" :key="item.status" :label="item.name" :value="item.status" />
      </el-select>
      <el-button style="margin-right: 6px" type="primary" icon="el-icon-search" size="small" @click="toSearch">查询</el-button>
    </div>
    <div style="padding:1em;margin-bottom:1em;background:#fff">
      <a-table
        :loading="loading"
        :columns="realColumns"
        :data-source="proChecks"
        class="childTable"
        :rowKey="record => record.id"
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
      </a-table>
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

let checkStatusCol = ''

let columns = [
  { title: '供应商', dataIndex: 'quote.supplier', key: 'quote.supplier', ellipsis: true,
    sorter: (a, b) => a.quote.supplier.length - b.quote.supplier.length, sortDirections: ['descend', 'ascend'] },
  { title: '设备名', dataIndex: 'inquiry.name', key: 'inquiry.name', ellipsis: true,
    sorter: (a, b) => a.inquiry.name.length - b.inquiry.name.length, sortDirections: ['descend', 'ascend'] },
  { title: '设备型号', dataIndex: 'inquiry.model', key: 'inquiry.model', ellipsis: true,
    sorter: (a, b) => a.inquiry.model.length - b.inquiry.model.length, sortDirections: ['descend', 'ascend'] },
  { title: '商家设备型号', dataIndex: 'quote.suModel', key: 'quote.suModel', ellipsis: true,
    sorter: (a, b) => a.quote.suModel.length - b.quote.suModel.length, sortDirections: ['descend', 'ascend'] },
  { title: '技术参数', dataIndex: 'inquiry.params', key: 'inquiry.params', ellipsis: true,
    sorter: (a, b) => a.inquiry.params.length - b.inquiry.params.length, sortDirections: ['descend', 'ascend'] },
  { title: '商家技术参数', dataIndex: 'quote.suParams', key: 'quote.suParams', ellipsis: true,
    sorter: (a, b) => a.quote.suParams.length - b.quote.suParams.length, sortDirections: ['descend', 'ascend'] },
  { title: '品牌', dataIndex: 'inquiry.brand', key: 'inquiry.brand', ellipsis: true,
    sorter: (a, b) => a.inquiry.brand.length - b.inquiry.brand.length, sortDirections: ['descend', 'ascend'] },
  { title: '数量', dataIndex: 'inquiry.number', key: 'inquiry.number', ellipsis: true,
    sorter: (a, b) => a.inquiry.number - b.inquiry.number, sortDirections: ['descend', 'ascend'] },
  { title: '单位', dataIndex: 'inquiry.unit', key: 'inquiry.unit', ellipsis: true,
    sorter: (a, b) => a.inquiry.unit - b.inquiry.unit, sortDirections: ['descend', 'ascend'] },
  { title: '商家单价', dataIndex: 'quote.suPrice', key: 'quote.suPrice', ellipsis: true,
    sorter: (a, b) => a.quote.suPrice - b.quote.suPrice, sortDirections: ['descend', 'ascend'] },
  { title: '商家总价', dataIndex: 'quote.suTotalPrice', key: 'quote.suTotalPrice', ellipsis: true,
    sorter: (a, b) => a.quote.suTotalPrice - b.quote.suTotalPrice, sortDirections: ['descend', 'ascend'] },
  { title: '商家备注', dataIndex: 'quote.suRemark', key: 'quote.suRemark', ellipsis: true },
  { title: '商家货期', dataIndex: 'quote.suDelivery', scopedSlots: 'quote.suDelivery', ellipsis: true,
    sorter: (a, b) => a.quote.suDelivery - b.quote.suDelivery, sortDirections: ['descend', 'ascend'] },
  { title: '质保期', dataIndex: 'quote.warranty', key: 'quote.warranty', ellipsis: true,
    sorter: (a, b) => a.quote.warranty - b.quote.warranty, sortDirections: ['descend', 'ascend'] },
  { title: '文件',  dataIndex: 'files', scopedSlots: { customRender: 'files' }, key: 'files', ellipsis: true, align: 'center'},
  { title: '设备图片', dataIndex: 'quote.image', scopedSlots: { customRender: 'image' }, key: 'quote.image', align: 'center'},
  { title: '审核状态', dataIndex: 'businessAudit', scopedSlots: { customRender: 'businessAudit' }, key: 'businessAudit',
    sorter: (a, b) => a.checkStatus - b.checkStatus, sortDirections: ['descend', 'ascend'] },
  { title: '审核状态', dataIndex: 'technicalAudit', scopedSlots: { customRender: 'technicalAudit' }, key: 'technicalAudit',
    sorter: (a, b) => a.checkStatus - b.checkStatus, sortDirections: ['descend', 'ascend'] },
  { title: '备注', dataIndex: 'businessRemark', scopedSlots: { customRender: 'businessRemark' }, key: 'businessRemark',
    sorter: (a, b) => a.checkStatus - b.checkStatus, sortDirections: ['descend', 'ascend'] },
  { title: '备注', dataIndex: 'technicalRemark', scopedSlots: { customRender: 'technicalRemark' }, key: 'technicalRemark',
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
      form: {},
      visible: false,
      checkStatusCol: '',
      fileType: -1,
      visible: false,
      proChecks: [],
      loading: true,
      columns,
      prop: {
        '技术审核': ['quote.supplier', 'inquiry.name',
          'inquiry.model', 'quote.suModel', 'inquiry.params', 'quote.suParams', 'checkStatus', 'quote.image', 'files', 'technicalAudit', 'technicalRemark'
        ],
        '商务审核': ['quote.supplier', 'inquiry.name', 'inquiry.params',
          'quote.suPrice', 'quote.suTotalPrice', 'inquiry.suWarranties', 'checkStatus', 'files', 'businessAudit', 'businessRemark'
        ],
      },
      realColumns: [],
      status: ['未审核', '通过', '拒绝'],
      select: [{ status: 0, name: '未审核' }, { status: 1, name: '通过' }, { status: 2, name: '拒绝' }],
      form: { status: '' },
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
  created() {
    this.loadChecks()
    this.initColumns()
    this.loadProjects()


  },
  methods: {
    submitHandler(form) {
      const key = this.form.key
      let status = ''
      let remark = ''
      if (this.$route.name == '技术审核') {
        status = 'technicalAudit'
        remark = 'technicalRemark'
      }else if (this.$route.name == '商务审核') {
        status = 'businessAudit'
        remark = 'businessRemark'
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
              url: '/proCheck/updateTechnicalStatus',
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
          url: '/proCheck/updateTechnicalStatus',
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
        }).catch(()=>{
          this.toSearch()
        })
      }
    },
    getUser,
    toCheck(key) {
      this.visible = true
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
      let url = ''
      if (this.$route.name == '技术审核') {
        url = '/proCheck/findTechnicalCheck'
      }else if (this.$route.name == '商务审核') {
        url = '/proCheck/findBusinessCheck'
      }
      this.form.proDetailId = parseInt(this.form.proDetailId)

      request.request({
        url: url,
        method: 'get',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        params: this.form
      })
        .then(response => {
          this.proChecks = response.data
          this.loading = false
        }).catch(()=>{
          this.loading = false
        })
      if (!this.form.proDetailId) {
        delete this.form.proDetailId
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
      console.log(this.prop[this.$route.name])
      // alert(this.$route.name)
      if (this.$route.name == '技术审核') {
        this.fileType = 2
      }else if (this.$route.name == '商务审核') {
        this.fileType = 3
      }
      this.realColumns = this.columns.map(item => {
        const key = item.key
        if (this.prop[this.$route.name].includes(key)) {
          return item
        }
      })
      this.realColumns.map((item, index) => {
        if (item == null) {
          delete this.realColumns[index]
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
      th, td, .ant-table-column-sorters {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        cursor: pointer;
        max-width: 110px!important;
        font-size: 13px;
        span, div {
          font-size: 13px;
        }
      }
      td, .ant-table-column-sorters {
        padding: 10px 8px;
      }
      th {
        padding: 10px 2px;
      }
    }
  }
</style>
