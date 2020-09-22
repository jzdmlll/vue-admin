<template>
  <!-- 询价管理 -->
  <div class="pro_origin_list">
    <div class="btns" style="padding:1em;margin-bottom:1em;background:#fff">
      <el-tooltip class="item" effect="dark" content="添加询价" placement="bottom-start">
        <el-button type="primary" icon="el-icon-plus" size="small" @click="toAdd">添加询价</el-button>
      </el-tooltip>
    </div>
    <div style="padding:1em;margin-bottom:1em;background:#fff">
      <a-table :columns="columns" :data-source="projects" :scroll="{ x: 786 }" @expand="expandChange">
        <a-table
          slot="expandedRowRender"
          slot-scope="scope"
          class="childTable"
          :class="scope.detailList.length > 0 ? { noData: false}:{noData: true}"
          :scroll="{x: 1800}"
          :columns="innerColumns"
          :data-source="scope.detailList"
          :pagination="false"
        >
          <template
            v-for="col in ['supplier','brand','name','device','model','suModel','params',
                           'suParams','number','unit','suPrice','suTotalPrice','suRemark','suWarranties']"
            :slot="col"
            slot-scope="text, record, index"
          >
            <el-tooltip class="item" effect="dark" :content="text+''" placement="bottom-start">
              <div :key="col">
                <a-input
                  v-if="record.editable"
                  style="margin: -5px 0"
                  :value="text"
                  @change="e => handleChange(e.target.value, record, col)"
                />
                <template v-else>
                  {{ text }}
                </template>
              </div>
            </el-tooltip>
          </template>
          <template
            v-for="col in ['suDelivery','warranty']"
            :slot="col"
            slot-scope="text, record, index"
          >
            <div :key="col">
              <el-date-picker
                v-if="record.editable"
                v-model.number="record[col]"
                value-format="timestamp"
                type="date"
                @change="e => handleChange(e.target.value, record, col)"
              />
              <template v-else>
                {{ dateFormat(parseInt(text)) }}
              </template>
            </div>
          </template>
          <template slot="operation" slot-scope="text, record, index">
            <div class="editable-row-operations">
              <span v-if="record.editable">
                <el-tooltip class="item" effect="dark" content="编辑该条询价" placement="bottom-start">
                  <el-button type="success" size="mini" style="padding: 7px 10px;" @click="save(record)">保存</el-button>
                </el-tooltip>
                <a-popconfirm title="确定取消修改吗?" @confirm="() => cancel(record)">
                  <el-tooltip class="item" effect="dark" content="取消" placement="bottom-start">
                    <el-button type="danger" size="mini" style="padding: 7px 10px;">取消</el-button>
                  </el-tooltip>
                </a-popconfirm>
              </span>
              <span v-else>
                <el-tooltip class="item" effect="dark" content="编辑该条询价" placement="bottom-start">
                  <el-button type="primary" icon="el-icon-edit" size="mini" @click="edit(record)" />
                </el-tooltip>
              </span>
            </div>
          </template>
        </a-table>
      </a-table>
    </div>
    <!-- 模态框 -->
    <el-dialog title="添加询价" :visible.sync="visible">
      <el-steps :active="active" simple style="background: #d8f1e3;margin-bottom: 8px;padding: 13px 4%;height: 36px">
        <el-step title="填写询价内容" icon="el-icon-edit" /> 
        <el-step title="上传询价文件" icon="el-icon-upload" />
        <el-step title="选择审核流程" icon="el-icon-upload" />
      </el-steps>
      <el-form ref="form" :model="form" :rules="codeRules" status-icon>
        <div>
          <div :style="active === 1?{display: 'block'}:{display:'none'}">
            <el-row>
              <el-col :sm="24" :lg="12">
                <el-form-item label="项目" label-width="80px" size="mini" prop="proDetailId">
                  <el-select v-model="form.proDetailId" clearable placeholder="请选择要询价的项目" value-key="name" size="mini">
                    <el-option v-for="item in projects" :key="item.id" :label="item.name" :value="item.id" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :sm="24" :lg="12">
                <el-form-item label="设备类型" label-width="80px" size="mini" prop="deviceTypeId">
                  <el-select v-model="form.deviceTypeId" clearable placeholder="请选择设备类型" value-key="name" size="mini">
                    <el-option v-for="item in deviceType" :key="item.id" :label="item.name" :value="item.id" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :sm="24" :lg="12">
                <el-form-item label="供应商" label-height="28px" label-width="80px" prop="supplier">
                  <el-input v-model="form.supplier" autocomplete="off" size="mini" />
                </el-form-item>
              </el-col>
              <el-col :sm="24" :lg="12">
                <el-form-item label="询价名" label-width="80px" prop="name">
                  <el-input v-model="form.name" autocomplete="off" size="mini" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :sm="24" :lg="12">
                <el-form-item label="设备名" label-width="80px" prop="device">
                  <el-input v-model="form.device" autocomplete="off" size="mini" />
                </el-form-item>
              </el-col>
              <el-col :sm="24" :lg="12">
                <el-form-item label="设备型号" label-width="80px" prop="model">
                  <el-input v-model="form.model" autocomplete="off" size="mini" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :sm="24" :lg="12">
                <el-form-item label="商家设备型号" label-width="80px" prop="suModel">
                  <el-input v-model="form.suModel" autocomplete="off" size="mini" />
                </el-form-item>
              </el-col>
              <el-col :sm="24" :lg="12">
                <el-form-item label="技术参数" label-width="80px" prop="params">
                  <el-input v-model="form.params" autocomplete="off" size="mini" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :sm="24" :lg="12">
                <el-form-item label="商家技术参数" label-width="80px" prop="suParams">
                  <el-input v-model="form.suParams" autocomplete="off" size="mini" />
                </el-form-item>
              </el-col>
              <el-col :sm="24" :lg="12">
                <el-form-item label="单位" label-width="80px" prop="unit">
                  <el-input v-model="form.unit" autocomplete="off" size="mini" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :sm="24" :lg="12">
                <el-form-item label="数量" label-width="80px" prop="number">
                  <el-input v-model="form.number" autocomplete="off" size="mini" />
                </el-form-item>
              </el-col>
              <el-col :sm="24" :lg="12">
                <el-form-item label="商家单价" label-width="80px" prop="suPrice">
                  <el-input v-model="form.suPrice" autocomplete="off" size="mini" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :sm="24" :lg="12">
                <el-form-item label="商家总价" label-width="80px" prop="suTotalPrice">
                  <el-input v-model="form.suTotalPrice" autocomplete="off" size="mini" />
                </el-form-item>
              </el-col>
              <el-col :sm="24" :lg="12">
                <el-form-item label="商家备注" label-width="80px" prop="suRemark">
                  <el-input v-model="form.suRemark" autocomplete="off" size="mini" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :sm="24" :lg="12">
                <el-form-item label="商家资质" label-width="80px" prop="suWarranties">
                  <el-input v-model="form.suWarranties" autocomplete="off" size="mini" />
                </el-form-item>
              </el-col>
              <el-col :sm="24" :lg="12">
                <el-form-item label="品牌" label-width="80px" prop="brand">
                  <el-input v-model="form.brand" autocomplete="off" size="mini" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :sm="24" :lg="12">
                <el-form-item label="商家货期" label-width="80px" prop="suDelivery">
                  <el-date-picker v-model="form.suDelivery" value-format="timestamp" type="date" placeholder="请选择货期" size="mini" />
                </el-form-item>
              </el-col>
              <el-col :sm="24" :lg="12">
                <el-form-item label="质保期" label-width="80px" prop="warranty">
                  <el-date-picker v-model="form.warranty" value-format="timestamp" type="date" placeholder="请选择质保期" size="mini" />
                </el-form-item>
              </el-col>
            </el-row>
          </div>
          <div :style="active === 2?{display: 'block'}:{display:'none'}">
            <a-upload-dragger
              name="file"
              :multiple="true"
              :action="fileUploadUrl"
              list-type="picture"
              :before-upload="beforeUpload"
              :file-list="fileList"
              @change="uploadStatusChange"
            >
              <p class="ant-upload-drag-icon">
                <a-icon type="inbox" />
              </p>
              <p class="ant-upload-text">
                点击或者拖拽文件来上传
              </p>
              <p class="ant-upload-hint">
                支持单个或多个文件上传. 单个文件请不要超过12M
              </p>
            </a-upload-dragger>

          </div>
          <div :style="active === 3?{display: 'block'}:{display:'none'}">
            <el-select v-model="form.role" clearable placeholder="请选择要添加的审核" value-key="checkName" style="margin:0 0 8px 1em" @change="addCheck(form.role)">
              <el-option v-for="item in roles" :key="item.id" :label="item.checkName" :value="item" />
            </el-select>
            <div :style="{height: proChecks.length*100+'px'}" style="position: relative;padding: 0 1em">

              <el-steps direction="vertical" :active="proChecks.length">
                <el-step v-for="item in proChecks" :key="item.roleId" :title="item.checkName" />
              </el-steps>
              <div class="removeBox"><i v-for="item in proChecks" :style="{marginBottom: (proChecks.length*(100-27))/(proChecks.length-1)+'px'}" class="el-icon-close" @click="removeCheck(form.role)" /></div>
            </div>
          </div>
        </div>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="cancelHandler">{{ this.active === 1?'取消':'上一步' }}</el-button>
        <el-button type="primary" :loading="submitLoading" size="small" @click="saveRecordHandler('form')">{{ this.active === 3?'确定':'下一步' }}</el-button>
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

const columns = [
  { title: '项目名称', dataIndex: 'name', key: 'name', ellipsis: true },
  { title: '项目来源', dataIndex: 'sysProOrigin.name', key: 'sysProOrigin.name', ellipsis: true },
  { title: '项目类型', dataIndex: 'sysProType.name', key: 'sysProType.name', ellipsis: true }
]
const innerColumns = [

  { title: '供应商', dataIndex: 'supplier', scopedSlots: { customRender: 'supplier' }, fixed: 'left', width: 110,
    sorter: (a, b) => a.supplier.length - b.supplier.length, sortDirections: ['descend', 'ascend'] },
  { title: '询价名', dataIndex: 'name', scopedSlots: { customRender: 'name' }, fixed: 'left', width: 110,
    sorter: (a, b) => a.name.length - b.name.length, sortDirections: ['descend', 'ascend'] },
  { title: '设备名', dataIndex: 'device', scopedSlots: { customRender: 'device' }, fixed: 'left', width: 110,
    sorter: (a, b) => a.device.length - b.device.length, sortDirections: ['descend', 'ascend'] },
  { title: '设备型号', dataIndex: 'model', scopedSlots: { customRender: 'model' }, fixed: 'left', width: 110,
    sorter: (a, b) => a.model.length - b.model.length, sortDirections: ['descend', 'ascend'] },
  { title: '商家设备型号', dataIndex: 'suModel', scopedSlots: { customRender: 'suModel' }, fixed: 'left', width: 110,
    sorter: (a, b) => a.suModel.length - b.suModel.length, sortDirections: ['descend', 'ascend'] },
  { title: '技术参数', dataIndex: 'params', scopedSlots: { customRender: 'params' }, fixed: 'left', width: 110,
    sorter: (a, b) => a.params.length - b.params.length, sortDirections: ['descend', 'ascend'] },
  { title: '商家技术参数', dataIndex: 'suParams', scopedSlots: { customRender: 'suParams' }, fixed: 'left', width: 110,
    sorter: (a, b) => a.suParams.length - b.suParams.length, sortDirections: ['descend', 'ascend'] },
  { title: '品牌', dataIndex: 'brand', scopedSlots: { customRender: 'brand' }, width: 100, ellipsis: true,
    sorter: (a, b) => a.brand.length - b.brand.length, sortDirections: ['descend', 'ascend'] },
  { title: '数量', dataIndex: 'number', scopedSlots: { customRender: 'number' }, width: 100, ellipsis: true,
    sorter: (a, b) => a.number - b.number, sortDirections: ['descend', 'ascend'] },
  { title: '单位', dataIndex: 'unit', scopedSlots: { customRender: 'unit' }, width: 100, ellipsis: true,
    sorter: (a, b) => a.unit - b.unit, sortDirections: ['descend', 'ascend'] },
  { title: '商家单价', dataIndex: 'suPrice', scopedSlots: { customRender: 'suPrice' }, width: 100, ellipsis: true,
    sorter: (a, b) => a.suPrice - b.suPrice, sortDirections: ['descend', 'ascend'] },
  { title: '商家总价', dataIndex: 'suTotalPrice', scopedSlots: { customRender: 'suTotalPrice' }, width: 100, ellipsis: true,
    sorter: (a, b) => a.suTotalPrice - b.suTotalPrice, sortDirections: ['descend', 'ascend'] },
  { title: '商家备注', dataIndex: 'suRemark', scopedSlots: { customRender: 'suRemark' }, width: 100, ellipsis: true },
  { title: '商家货期', dataIndex: 'suDelivery', scopedSlots: { customRender: 'suDelivery' }, width: 100, ellipsis: true,
    sorter: (a, b) => a.suDelivery - b.suDelivery, sortDirections: ['descend', 'ascend'] },
  { title: '质保期', dataIndex: 'warranty', scopedSlots: { customRender: 'warranty' }, width: 100, ellipsis: true,
    sorter: (a, b) => a.warranty - b.warranty, sortDirections: ['descend', 'ascend'] },
  { title: '商家资质', dataIndex: 'suWarranties', scopedSlots: { customRender: 'suWarranties' }, width: 100, ellipsis: true,
    sorter: (a, b) => a.suWarranties.length - b.suWarranties.length, sortDirections: ['descend', 'ascend'] },
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
    const fileUploadUrl = process.env.VUE_APP_BASE_API + 'file/uploadCache'
    return {
      visible: false,
      projects: [],
      loading: true,
      form: {},
      columns,
      innerColumns,
      editingKey: '',
      newInquiry: [],
      cacheInquiry: [],
      active: 1,
      deviceType: [],
      fileUploadUrl,
      fileList: [],
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
        device: [
          { required: true, message: '不能为空', trigger: 'blur' }
        ],
        model: [
          { required: true, message: '不能为空', trigger: 'blur' }
        ],
        suModel: [
          { required: true, message: '不能为空', trigger: 'blur' }
        ],
        params: [
          { required: true, message: '不能为空', trigger: 'blur' }
        ],
        suParams: [
          { required: true, message: '不能为空', trigger: 'blur' }
        ],
        brand: [
          { required: true, message: '不能为空', trigger: 'blur' }
        ],
        number: [
          { required: true, message: '不能为空', trigger: 'blur' }
        ],
        suPrice: [
          { required: true, message: '不能为空', trigger: 'blur' }
        ],
        suTotalPrice: [
          { required: true, message: '不能为空', trigger: 'blur' }
        ],
        suRemark: [
          { required: true, message: '不能为空', trigger: 'blur' }
        ],
        suDelivery: [
          { required: true, message: '不能为空', trigger: 'blur' }
        ],
        warranty: [
          { required: true, message: '不能为空', trigger: 'blur' }
        ],
        suWarranties: [
          { required: true, message: '不能为空', trigger: 'blur' }
        ],
        unit: [
          { required: true, message: '不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.loadProjects()
  },
  methods: {
    dateFormat,
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
          }
          return file
        })
        this.fileList = fileList
      }
    },
    loadDeviceType() {
      request.get('/deviceType/findAllLike')
        .then(response => {
          this.deviceType = response.data
        })
    },
    handleChange(value, record, column) {
      this.projects.forEach((item, index) => {
        if (item.id === record.proDetailId) {
          this.newInquiry = [...this.projects[index].detailList]
        }
      })
      const target = this.newInquiry.filter(item => record.id === item.id)[0]
      if (target) {
        target[column] = value
        this.projects.forEach((item, index) => {
          if (item.id === record.proDetailId) {
            this.projects[index].detailList = this.newInquiry
          }
        })
      }
    },
    edit(record) {
      this.projects.forEach((item, index) => {
        if (item.id === record.proDetailId) {
          this.newInquiry = [...this.projects[index].detailList]
        }
      })
      this.cacheInquiry = this.newInquiry.map(item => ({ ...item }))
      const target = this.newInquiry.filter(item => record.id === item.id)[0]
      this.editingKey = record.id
      if (target) {
        target.editable = true
        this.projects.forEach((item, index) => {
          if (item.id === record.proDetailId) {
            this.projects[index].detailList = this.newInquiry
          }
        })
      }
    },
    save(record) {
      this.projects.forEach((item, index) => {
        if (item.id === record.proDetailId) {
          this.newInquiry = [...this.projects[index].detailList]
        }
      })
      const newCacheData = [...this.cacheInquiry]
      const target = this.newInquiry.filter(item => record.id === item.id)[0]
      const targetCache = newCacheData.filter(item => record.id === item.id)[0]
      request.request({
        url: '/inquiry/saveOrUpdate',
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
            this.projects.forEach((item, index) => {
              if (item.id === record.proDetailId) {
                this.projects[index].detailList = this.newInquiry
              }
            })
            Object.assign(targetCache, target)
            this.cacheInquiry = newCacheData
          }
        })
      this.editingKey = ''
    },
    cancel(record) {
      this.projects.forEach((item, index) => {
        if (item.id === record.proDetailId) {
          this.newInquiry = [...this.projects[index].detailList]
        }
      })
      const target = this.newInquiry.filter(item => record.id === item.id)[0]
      this.editingKey = ''
      if (target) {
        Object.assign(target, this.cacheInquiry.filter(item => record.id === item.id)[0])
        delete target.editable
        this.projects.forEach((item, index) => {
          if (item.id === record.proDetailId) {
            this.projects[index].detailList = this.newInquiry
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
        case 2:this.active++; break
        case 3:
          this.submitLoading = true
          const fileList = this.fileList.map(item => {
            return { id: item.id, name: item.name, url: item.url }
          })
          this.form.files = [...fileList]
          this.form.operator = parseInt(getUser())
          this.form.proChecks = this.proChecks
          request.request({
            url: '/inquiry/saveOrUpdate',
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
    toAdd() {
      this.submitLoading = false
      this.active = 1
      this.visible = true
      this.fileList = []
      this.loadDeviceType()
      this.loadProChecks()
    },
    expandChange(expanded, record) {
      if (expanded) {
        request.request({
          url: '/inquiry/findByDetailId?id=' + record.id,
          method: 'get'
        }).then(response => {
          this.projects.forEach((item, index) => {
            if (item.id === record.id) {
              this.projects[index].detailList = response.data
            }
          })
        })
      }
    },
    loadProjects() {
      request.get('/project/detail/findByAll')
        .then(response => {
          response.data.map(item => {
            item.detailList = []
          })
          this.projects = response.data
          this.loading = false
        })
    }
  }
}
</script>

<style lang="scss">
  .pro_origin_list {
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
  }
</style>

