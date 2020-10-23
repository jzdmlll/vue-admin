<template>
  <!-- 询价管理 -->
  <div class="pro_quote_list">
    <div class="btns" style="padding:1em;margin-bottom:1em;background:#fff">
      <el-tooltip class="item" effect="dark" content="导入报价单" placement="bottom-start">
        <el-button type="primary" size="small" @click="batchImport"><a-icon type="import" style="font-size: 12px;margin-right: 5px"/>导入报价单</el-button>
      </el-tooltip>
      <el-select v-model="searchForm.proDetailId" style="margin-right: 6px" filterable clearable placeholder="请选择项目" value-key="name">
        <el-option v-for="item in projects" :key="item.id" :label="item.name" :value="item.id" />
      </el-select>
      <el-button style="margin-right: 6px" type="primary" icon="el-icon-search" size="small" @click="toSearch">查询</el-button>
    </div>
    <div style="padding:1em;margin-bottom:1em;background:#fff">
      <a-table :columns="columns" :loading="loading" size="default" :data-source="inquiryList" :scroll="{ x: 786 }" @expand="expandChange">
        <a-table
          slot="expandedRowRender"
          slot-scope="scope"
          class="childTable"
          :class="scope.detailList.length > 0 ? { noData: false}:{noData: true}"
          :scroll="{x: 1450}"
          :columns="innerColumns"
          :data-source="scope.detailList"
          :pagination="false"
          :loading="childLoading[scope.id]"
        >
          <template
            v-for="col in ['supplier','brand','name','device','model','suModel','params',
                           'suParams','number','unit','suPrice','suTotalPrice','suRemark','suWarranties','suDelivery','warranty']"
            :slot="col"
            slot-scope="text, record, index"
          >
            <el-tooltip class="item" effect="dark" :content="text+''" placement="bottom-start">
              <div :key="col">
                <a-input
                  v-if="record.editable && (col != 'suDelivery' && col != 'warranty')"
                  style="margin: -5px 0"
                  :value="text"
                  @change="e => handleChange(e.target.value, record, col)"
                />
                <el-date-picker
                  v-if="record.editable && (col === 'suDelivery' || col === 'warranty')"
                  v-model.number="record[col]"
                  value-format="timestamp"
                  type="date"
                  @change="e => handleChange(e.target.value, record, col)"
                />
                <template v-if="!record.editable && (col === 'suDelivery' || col === 'warranty')">
                  {{ dateFormat(parseInt(text)) }}
                </template>
                <template v-if="!record.editable && (col !== 'suDelivery' && col !== 'warranty')">
                  {{ text }}
                </template>
              </div>
            </el-tooltip>
          </template>
          <template slot="operation" slot-scope="text, record, index">
            <div class="editable-row-operations" style="text-align: center">
              <span v-if="record.editable" >
                <el-tooltip class="item" effect="dark" content="编辑" placement="bottom-start">
                  <el-button type="primary" icon="el-icon-upload" size="mini" @click="toEdit(record)" />
                </el-tooltip>
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
                <el-tooltip class="item" effect="dark" content="编辑" placement="bottom-start">
                  <el-button type="primary" icon="el-icon-upload" size="mini" @click="toEdit(record)" />
                </el-tooltip>
                <el-tooltip class="item" effect="dark" content="行内编辑" placement="bottom-start">
                  <el-button type="primary" icon="el-icon-edit" size="mini" @click="edit(record)" />
                </el-tooltip>
              </span>
            </div>
          </template>
        </a-table>
      </a-table>
    </div>
    <!-- 模态框 -->
    <el-dialog :title="title" :visible.sync="visible">
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
    <el-dialog title="导入报价单" class="importDialog" :visible.sync="visible2">
      <!-- <el-steps :active="active1" simple style="background: #d8f1e3;margin-bottom: 8px;padding: 13px 4%;height: 36px">
         <el-step title="批量导入询价" icon="el-icon-edit" />
         <el-step title="选择审核流程" icon="el-icon-upload" />
       </el-steps>-->
      <el-form ref="form1" :model="form1" :rules="codeRules" status-icon>
        <div>
          {{importData}}
          <el-form-item label="" label-width="0px" size="small" prop="proDetailId">
            <el-select v-model="form1.proDetailId" clearable placeholder="请选择项目" value-key="name" size="small">
              <el-option v-for="item in projects" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
          <!--<el-form-item label="" label-width="0px" size="small" prop="deviceTypeId">
            <el-select v-model="form1.deviceTypeId" clearable placeholder="请选择设备类型" value-key="name" size="small">
              <el-option v-for="item in deviceType" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>-->
          <div style="margin: 8px 0">
            <el-button @click="clickFileInput" type="primary" size="small"><a-icon type="file-excel" style="font-size: 12px;margin-right: 5px"/>excel导入</el-button>
            <input type="file" ref="upload" accept=".xls,.xlsx" @change="readExcel" class="outputlist_upload">
          </div>
          <el-input
            type="textarea"
            placeholder="点击上方按钮导入或者复制excel中数据来粘贴"
            :autosize="{ minRows: 4, maxRows: 12}"
            v-model="importData">
          </el-input>
        </div>
        <!--<div :style="active1 === 2?{display: 'block'}:{display:'none'}">
          <el-select v-model="form1.role" clearable placeholder="请选择要添加的审核" value-key="checkName" style="margin:0 0 8px 1em" @change="addCheck(form1.role)">
            <el-option v-for="item in roles" :key="item.id" :label="item.checkName" :value="item" />
          </el-select>
          <div :style="{height: proChecks.length*100+'px'}" style="position: relative;padding: 0 1em">

            <el-steps direction="vertical" :active="proChecks.length">
              <el-step v-for="item in proChecks" :key="item.roleId" :title="item.checkName" />
            </el-steps>
            <div class="removeBox"><i v-for="item in proChecks" :style="{marginBottom: (proChecks.length*(100-27))/(proChecks.length-1)+'px'}" class="el-icon-close" @click="removeCheck(form1.role)" /></div>
          </div>
        </div>-->
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="cancelHandler2">取消</el-button>
        <el-button type="primary" :loading="submitLoading" size="small" @click="importHandler('form1')">提交</el-button>
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

  const columns = [
    { title: '设备名', dataIndex: 'name', key: 'name', ellipsis: true },
    { title: '技术参数', dataIndex: 'params', key: 'params', ellipsis: true },
    { title: '设备型号', dataIndex: 'model', key: 'model', ellipsis: true },
    { title: '单位', dataIndex: 'unit', key: 'unit', ellipsis: true },
    { title: '数量', dataIndex: 'number', key: 'number', ellipsis: true }
  ]
  const innerColumns = [

    { title: '供应商', dataIndex: 'supplier', scopedSlots: { customRender: 'supplier' }, fixed: 'left', width: 110,
      sorter: (a, b) => a.supplier.length - b.supplier.length, sortDirections: ['descend', 'ascend'] },
   /* { title: '设备名', dataIndex: 'name', scopedSlots: { customRender: 'name' }, fixed: 'left', width: 110,
      sorter: (a, b) => a.name.length - b.name.length, sortDirections: ['descend', 'ascend'] },
    { title: '设备名', dataIndex: 'device', scopedSlots: { customRender: 'device' }, fixed: 'left', width: 110,
      sorter: (a, b) => a.device.length - b.device.length, sortDirections: ['descend', 'ascend'] },
    { title: '技术参数', dataIndex: 'params', scopedSlots: { customRender: 'params' }, fixed: 'left', width: 110,
      sorter: (a, b) => a.params.length - b.params.length, sortDirections: ['descend', 'ascend'] },
    { title: '设备型号', dataIndex: 'model', scopedSlots: { customRender: 'model' }, fixed: 'left', width: 110,
      sorter: (a, b) => a.model.length - b.model.length, sortDirections: ['descend', 'ascend'] },
*/    { title: '商家技术参数', dataIndex: 'suParams', scopedSlots: { customRender: 'suParams' }, width: 100,
      sorter: (a, b) => a.suParams.length - b.suParams.length, sortDirections: ['descend', 'ascend'] },
    { title: '商家设备型号', dataIndex: 'suModel', scopedSlots: { customRender: 'suModel' }, width: 110,
      sorter: (a, b) => a.suModel.length - b.suModel.length, sortDirections: ['descend', 'ascend'] },
    { title: '品牌推荐', dataIndex: 'brand', scopedSlots: { customRender: 'brand' }, width: 100, ellipsis: true,
      sorter: (a, b) => a.brand.length - b.brand.length, sortDirections: ['descend', 'ascend'] },
    { title: '数量', dataIndex: 'number', scopedSlots: { customRender: 'number' }, width: 100, ellipsis: true,
      sorter: (a, b) => a.number - b.number, sortDirections: ['descend', 'ascend'] },
    /*{ title: '单位', dataIndex: 'unit', scopedSlots: { customRender: 'unit' }, width: 100, ellipsis: true,
      sorter: (a, b) => a.unit - b.unit, sortDirections: ['descend', 'ascend'] },
*/    { title: '商家单价', dataIndex: 'suPrice', scopedSlots: { customRender: 'suPrice' }, width: 100, ellipsis: true,
      sorter: (a, b) => a.suPrice - b.suPrice, sortDirections: ['descend', 'ascend'] },
    { title: '商家总价', dataIndex: 'suTotalPrice', scopedSlots: { customRender: 'suTotalPrice' }, width: 100, ellipsis: true,
      sorter: (a, b) => a.suTotalPrice - b.suTotalPrice, sortDirections: ['descend', 'ascend'] },
    { title: '商家货期', dataIndex: 'suDelivery', scopedSlots: { customRender: 'suDelivery' }, width: 100, ellipsis: true,
      sorter: (a, b) => a.suDelivery - b.suDelivery, sortDirections: ['descend', 'ascend'] },
    { title: '质保期', dataIndex: 'warranty', scopedSlots: { customRender: 'warranty' }, width: 100, ellipsis: true,
      sorter: (a, b) => a.warranty - b.warranty, sortDirections: ['descend', 'ascend'] },
    { title: '商家备注', dataIndex: 'suRemark', scopedSlots: { customRender: 'suRemark' }, width: 100, ellipsis: true },
    /*{ title: '商家资质', dataIndex: 'suWarranties', scopedSlots: { customRender: 'suWarranties' }, width: 100, ellipsis: true,
      sorter: (a, b) => a.suWarranties.length - b.suWarranties.length, sortDirections: ['descend', 'ascend'] },*/
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
    data() {
      const fileUploadUrl = process.env.VUE_APP_BASE_API + 'file/uploadCache'
      return {
        inquiryList: [],
        searchForm: {},
        title: '新增询价',
        childLoading: {},
        form1: {},
        active1: 1,
        keys: {
          "供应商": 'supplier',
          "设备名称": 'name',
          "品牌型号": 'model',
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
        }
      }
    },
    created() {
      this.loadProjects()
      this.init()
    },
    methods: {
      init() {
        request.get('/inquiry/findAll')
          .then(response => {
            response.data.map(item => {
              item.detailList = []
            })
            this.inquiryList = response.data
            this.inquiryList.map(item => {
              this.childLoading[item.id] = true
            })
            this.loading = false
          })
      },
      toSearch() {
        if(this.searchForm.proDetailId) {
          request.get('/inquiry/findByProDetailId?proDetailId='+this.searchForm.proDetailId)
            .then(response => {
              response.data.map(item => {
                item.detailList = []
              })
              this.inquiryList = response.data
              this.inquiryList.map(item => {
                this.childLoading[item.id] = true
              })
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
        this.loadDeviceType()
        this.loadProChecks()
      },
      clickFileInput() {
        this.$refs.upload.dispatchEvent(new MouseEvent('click'))
      },
      readExcel(e) {//表格导入
        var that = this;
        const files = e.target.files;
        //console.log(files);
        if(files.length<=0){//如果没有文件名
          return false;
        }else if(!/\.(xls|xlsx)$/.test(files[0].name.toLowerCase())){
          this.$Message.error('上传格式不正确，请上传xls或者xlsx格式');
          return false;
        }

        const fileReader = new FileReader();
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
              if( item['供应商'] && item['设备名称']){
                that.outputs.push(item);
              }
            })
            this.$refs.upload.value = '';
          } catch (e) {
            return false;
          }
        };
        fileReader.readAsBinaryString(files[0]);
      },
      importHandler(form1) {
        this.$refs[form1].validate((valid) => {
          if (valid) {
            const form = []
            let keyArray = []
            this.outputs.map(item => {
              keyArray = Object.keys(item)
              let inquiry = {}
              keyArray.map(key => {
                if (this.keys[key] != undefined)
                  inquiry[this.keys[key]] = item[key]
              })
              form.push(inquiry)
            })
            let userId = parseInt(getUser())
            form.map(item => {
              item['proDetailId'] = this.form1.proDetailId
              item['deviceTypeId'] = this.form1.deviceTypeId
              item['operator'] = userId
              item['proChecks'] = this.proChecks
            })
            request.request({
              url: '/inquiry/batchAddInquiry',
              method: 'post',
              headers: {
                'Content-Type': 'application/json'
              },
              data: JSON.stringify({inquiryVMs: form})
            }).then( response => {
              this.$message({ message: response.message, type: 'success' })
              this.visible2 = false
              this.loadinquiryList()
            })
          } else {
            console.log('error commit')
            return false
          }
        })
      },
      dateFormat,
      batchImport() {
        this.visible2 = true
        this.importData = ''
        this.loadDeviceType()
        this.loadProChecks()
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
      loadDeviceType() {
        request.get('/deviceType/findAllLike')
          .then(response => {
            this.deviceType = response.data
          })
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
          if (item.id === record.proDetailId) {
            this.newInquiry = [...this.inquiryList[index].detailList]
          }
        })
        this.cacheInquiry = this.newInquiry.map(item => ({ ...item }))
        const target = this.newInquiry.filter(item => record.id === item.id)[0]
        this.editingKey = record.id
        if (target) {
          target.editable = true
          this.inquiryList.forEach((item, index) => {
            if (item.id === record.proDetailId) {
              this.inquiryList[index].detailList = this.newInquiry
            }
          })
        }
      },
      save(record) {
        this.inquiryList.forEach((item, index) => {
          if (item.id === record.proDetailId) {
            this.newInquiry = [...this.inquiryList[index].detailList]
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
              this.inquiryList.forEach((item, index) => {
                if (item.id === record.proDetailId) {
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
          if (item.id === record.proDetailId) {
            this.newInquiry = [...this.inquiryList[index].detailList]
          }
        })
        const target = this.newInquiry.filter(item => record.id === item.id)[0]
        this.editingKey = ''
        if (target) {
          Object.assign(target, this.cacheInquiry.filter(item => record.id === item.id)[0])
          delete target.editable
          this.inquiryList.forEach((item, index) => {
            if (item.id === record.proDetailId) {
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
          case 2:this.active++; break
          case 3:
            this.submitLoading = true
            const fileList = this.fileList.map(item => {
              return { id: item.id, name: item.name, url: item.url, type: 1 }
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
        this.loadDeviceType()
        this.loadProChecks()
      },
      expandChange(expanded, record) {
        if (expanded) {
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
        }else {
          this.childLoading[record.id] = true
        }
      },
      loadProjects() {
        request.get('/project/detail/findByAll')
          .then(response => {
            this.projects = response.data
          })
      }
    }
  }
</script>

<style lang="scss">
  .pro_quote_list {
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
        float: left;
        .el-form-item__content {
          margin: 0 8px 0 0 !important;
        }
      }
    }
  }
</style>

