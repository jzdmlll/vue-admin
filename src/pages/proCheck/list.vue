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
      <el-select v-model="form.status" style="margin-right: 6px" multiple :style="form.status.length >2 ? {width:'250px'}:{}" clearable placeholder="请选择审核状态" value-key="name">
        <el-option v-for="item in select" :key="item.status" :label="item.name" :value="item.status" />
      </el-select>
      <el-button style="margin-right: 6px" type="primary" icon="el-icon-search" size="small" @click="toSearch">查询</el-button>
    </div>
    <div style="padding:1em;margin-bottom:1em;background:#fff">
      <a-table
        :columns="realColumns"
        :data-source="proChecks"
        class="childTable"
        :rowKey="record => record.id"
        :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
      >
        <span slot="checkStatus" slot-scope="text, record, index">
          <el-tag :type="text === 0 ? 'info':(text === 1? 'success':'danger')">{{ statu(text) }}</el-tag>
        </span>
      </a-table>
    </div>
  </div>
</template>
<script>
import request from '@/utils/request'
import qs from 'querystring'
import '@/styles/auto-style.css'

const columns = [
  { title: '供应商', dataIndex: 'inquiry.supplier', key: 'inquiry.supplier', ellipsis: true,
    sorter: (a, b) => a.inquiry.supplier.length - b.inquiry.supplier.length, sortDirections: ['descend', 'ascend'] },
  { title: '询价名', dataIndex: 'inquiry.name', key: 'inquiry.name', ellipsis: true,
    sorter: (a, b) => a.inquiry.name.length - b.inquiry.name.length, sortDirections: ['descend', 'ascend'] },
  { title: '设备名', dataIndex: 'inquiry.device', key: 'inquiry.device', ellipsis: true,
    sorter: (a, b) => a.inquiry.device.length - b.inquiry.device.length, sortDirections: ['descend', 'ascend'] },
  { title: '设备型号', dataIndex: 'inquiry.model', key: 'inquiry.model', ellipsis: true,
    sorter: (a, b) => a.inquiry.model.length - b.inquiry.model.length, sortDirections: ['descend', 'ascend'] },
  { title: '商家设备型号', dataIndex: 'inquiry.suModel', key: 'inquiry.suModel', ellipsis: true,
    sorter: (a, b) => a.inquiry.suModel.length - b.inquiry.suModel.length, sortDirections: ['descend', 'ascend'] },
  { title: '技术参数', dataIndex: 'inquiry.params', key: 'inquiry.params', ellipsis: true,
    sorter: (a, b) => a.inquiry.params.length - b.inquiry.params.length, sortDirections: ['descend', 'ascend'] },
  { title: '商家技术参数', dataIndex: 'inquiry.suParams', key: 'inquiry.suParams', ellipsis: true,
    sorter: (a, b) => a.inquiry.suParams.length - b.inquiry.suParams.length, sortDirections: ['descend', 'ascend'] },
  { title: '品牌', dataIndex: 'inquiry.brand', key: 'inquiry.brand', ellipsis: true,
    sorter: (a, b) => a.inquiry.brand.length - b.inquiry.brand.length, sortDirections: ['descend', 'ascend'] },
  { title: '数量', dataIndex: 'inquiry.number', key: 'inquiry.number', ellipsis: true,
    sorter: (a, b) => a.inquiry.number - b.inquiry.number, sortDirections: ['descend', 'ascend'] },
  { title: '单位', dataIndex: 'inquiry.unit', key: 'inquiry.unit', ellipsis: true,
    sorter: (a, b) => a.inquiry.unit - b.inquiry.unit, sortDirections: ['descend', 'ascend'] },
  { title: '商家单价', dataIndex: 'inquiry.suPrice', key: 'inquiry.suPrice', ellipsis: true,
    sorter: (a, b) => a.inquiry.suPrice - b.inquiry.suPrice, sortDirections: ['descend', 'ascend'] },
  { title: '商家总价', dataIndex: 'inquiry.suTotalPrice', key: 'inquiry.suTotalPrice', ellipsis: true,
    sorter: (a, b) => a.inquiry.suTotalPrice - b.inquiry.suTotalPrice, sortDirections: ['descend', 'ascend'] },
  { title: '商家备注', dataIndex: 'inquiry.suRemark', key: 'inquiry.suRemark', ellipsis: true },
  { title: '商家货期', dataIndex: 'inquiry.suDelivery', scopedSlots: 'inquiry.suDelivery', ellipsis: true,
    sorter: (a, b) => a.inquiry.suDelivery - b.inquiry.suDelivery, sortDirections: ['descend', 'ascend'] },
  { title: '质保期', dataIndex: 'inquiry.warranty', key: 'inquiry.warranty', ellipsis: true,
    sorter: (a, b) => a.inquiry.warranty - b.inquiry.warranty, sortDirections: ['descend', 'ascend'] },
  { title: '商家资质', dataIndex: 'inquiry.suWarranties', key: 'inquiry.suWarranties', ellipsis: true,
    sorter: (a, b) => a.inquiry.suWarranties.length - b.inquiry.suWarranties.length, sortDirections: ['descend', 'ascend'] },
  { title: '审核状态', dataIndex: 'checkStatus', scopedSlots: { customRender: 'checkStatus' }, key: 'checkStatus',
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
      visible: false,
      proChecks: [],
      loading: 'true',
      columns,
      prop: {
        '技术审核': ['inquiry.name', 'inquiry.model',
          'inquiry.suModel', 'inquiry.params', 'inquiry.suParams', 'checkStatus'
        ],
        '商务审核': ['inquiry.supplier', 'inquiry.name',
          'inquiry.price', 'inquiry.number', 'inquiry.suTotalPrice', 'inquiry.suWarranties', 'checkStatus'
        ],
      },
      realColumns: [],
      status: ['未审核', '通过', '拒绝'],
      select: [{ status: 0, name: '未审核' }, { status: 1, name: '通过' }, { status: 2, name: '拒绝' }],
      form: { status: [] },
      projects: [],
      selectedRowKeys: [],
      inquiryIds: []
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
    toCheck(key) {
      request.request({
        url: '/proCheck/batchCheck',
        method: 'post',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: qs.stringify({ status: key, ids: this.selectedRowKeys, inquiryIds: this.inquiryIds })
      }).then(response => {
        this.$message({ message: response.message, type: 'success' })
        this.selectedRowKeys = []
        this.inquiryIds = []
        this.toSearch()
      })
    },
    onSelectChange(selectedRowKeys, selectedRows) {
      const rows = selectedRows.map(item => {
        if (item.id) {
          return item.id
        }
      })
      this.inquiryIds = selectedRows.map(item => {
        if (item.id) {
          return item.contentId
        }
      })
      this.selectedRowKeys = rows
    },
    toSearch() {
      this.form.checkName = this.$route.name
      this.form.type = 0

      this.form.proDetailId = parseInt(this.form.proDetailId)
      request.request({
        url: '/proCheck/cascadeFindAllByCheckName',
        method: 'post',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: qs.stringify(this.form)
      })
        .then(response => {
          this.proChecks = response.data
          console.log(this.proChecks)
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
      request.get('/proCheck/cascadeFindAllByCheckName?checkName=' + this.$route.name + '&type=0')
        .then(response => {
          this.proChecks = response.data
          console.log(this.proChecks)
        })
    },
    initColumns() {
      console.log(this.prop[this.$route.name])
      // alert(this.$route.name)
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
