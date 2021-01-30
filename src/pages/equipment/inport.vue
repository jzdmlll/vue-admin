<template>
  <!-- 设备管理入库确认 -->
  <div class="chapter-list">
    <div class="btns" style="padding:1em;margin-bottom:1em;background:#fff">
      <el-select v-model="project.projectId" style="margin-right: 6px" filterable clearable placeholder="请选择项目" @change="loadcontract" value-key="name">
        <el-option v-for="item in project" :key="item.id" :label="item.projectName" :value="item.projectName" />
        </el-select>
        <el-select v-model="project.contractId" style="margin-right: 6px" filterable clearable placeholder="请选择合同" value-key="name">
          
        <el-option v-for="item in project" :key="item.id" :label="item.contractId" :value="item.contractId" >
        <span>{{item.contractId}}</span>
        <el-tag style="float:right" :type="item.contractId==2?'success':'danger'">
          {{item.contractId==2?'已生成':'未生成'}}
          </el-tag>
        </el-option>
        </el-select>

<el-select v-model="searchForm.auditStatus">
        <el-option value="0" label="已签收"/>
        <el-option value="1" label="未签收"/>
      </el-select>



        <el-date-picker
        style="margin-left:10px;"
        v-model="searchForm.time"
        unlink-panels
        value-format="timestamp"
        type="daterange"
        range-separator="至"
        width="300px;"
        start-placeholder="开始日期"
        end-placeholder="结束日期">
      </el-date-picker>
      
      
      <el-button  type="primary" icon="el-icon-search" size="small" @click="toSearch">查询</el-button>
      
    </div>
    <div style="padding:1em;margin-bottom:1em;background:#fff">
                <a-button v-if="selectedKeys.length>1" style="background:#42b983;color:#fefefe;" @click="toSignAll">批量入库</a-button>
          <a-button v-if="selectedKeys.length==1" style="background:#42b983;color:#fefefe;" @click="toSign">入库</a-button>
      <a-table
        v-loading="loading"
        :data-source="devices"
        size="large"
        :rowKey="record => record.id"
        :row-selection="{ selectedRowKeys: selectedKeys,
        onChange: onSelectChange,
        getCheckboxProps: record => ({props: {disabled: record.price != 2}}) ,
        type:'checkbox'}"
        :scroll="{x:2000}"
        >
        <!-- <a-button v-if="selectKeys.length>0"/>  -->
        <a-table-column :width="100" key="id" data-index="id" title="设备ID" v-if="false">
          <template slot-scope="text,scope">
            <el-tag :type="scope.auditStatus===1? 'success':scope.auditStatus=== 2?'danger':'warning'" @click="toadd">{{scope.auditStatus ===1 ?'已填写签收单':'未填写'}}</el-tag>
          </template>
        </a-table-column>
        <a-table-column :width="100" key="serialNumber" align="center" data-index="serialNumber" title="设备序号" />
        <a-table-column :width="100" key="item"  data-index="item" title="设备名" />
        <a-table-column :width="100" key="brand" data-index="brand" title="品牌" />
        <a-table-column :width="100" key="params" data-index="params" title="技术参数" />
        <a-table-column :width="100" key="item"  data-index="item" title="未签收数量" />
        <a-table-column :width="100" key="model" data-index="model" title="型号" />
        <a-table-column :width="100" key="number" data-index="number" title="数量" />
        <a-table-column :width="100" key="unit" data-index="unit" title="单位" />
        <a-table-column :width="100" key="contractOrderId" data-index="contractOrderId" title="合同订单追踪ID" />
        <a-table-column :width="100" key="supplyId" data-index="supplyId" title="供应商ID" />
        <a-table-column :width="100" key="supplier" data-index="supplier" title="供应商" />
        <a-table-column :width="100" key="price" data-index="price" title="供应商单价" />
        <a-table-column :width="100" key="totalPrice" data-index="totalPrice" title="总价" />
        <a-table-column :width="100" key="warranty" data-index="warranty" title="设备保质期" />
        <a-table-column :width="100" title="操作" fixed="right">
          <template slot-scope="text,scope">
            <a-tooltip placement="topLeft" title="查看附件">
              <a-button type="primary" icon="folder" size="small" @click="getFile(scope.id)"/>
            </a-tooltip>
          </template>
        </a-table-column>
      </a-table>
    </div>
    <!-- 模态框 -->
    <el-dialog :title="title" :visible.sync="Signview">
     
    
        
     
      <el-form ref="form" :model="form" :rules="rule">
        
        <!-- 填写项目内容 -->
        <div :style="active === 1?{display: 'block'}:{display:'none'}">
          <a-row>
          <a-col :span="12"> <el-form-item label="签收数量"  label-width="80px" size="small" prop="projectName">
          <el-input v-model="form.number" clearable placeholder="签收数量" value-key="name" size="small">
          </el-input>
          </el-form-item></a-col>
          <a-col :span="12"></a-col>
        </a-row>
        </div>
        <!-- 上传项目文件 -->
        
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" :loading="submitLoading" size="small" @click="saveRecordHandler('form')">{{ this.active === 1?'确定':'下一步' }}</el-button>
      </div>
    </el-dialog>
    <el-dialog v-el-drag-dialog title="附件查看" :visible.sync="fileVisible">
      <div>
        <a v-for='file in files' :key="file.id" :href='file.url'><button>{{file.name}}</button></a>
        <br>
      </div>
    </el-dialog>
  </div>
</template>
<script>
  import request from '@/utils/request'
  import qs from 'querystring'
  import '@/styles/auto-style.css'
  import {getUser} from '@/utils/auth'
  import { getAction, postActionByJson, postActionByQueryString } from '@/api/manage'
  import { dateTimeFormat } from '@/utils/format'
  import elDragDialog from '@/directive/el-drag-dialog'
  export default {
    directives: { elDragDialog },
    data() {

      const fileUploadUrl = process.env.VUE_APP_BASE_API + 'file/uploadCache'
      return {
        filemark:{},
        modify:{},
        fileUploadUrl,
        searchForm: {time:''},
        fileVisible:false,
        form: {projectName:'',contractName:'',contractNo:'',price:'',firstParty:'',secondParty:'',type:'',senderRemark:'',auditor:'',mainContent:''},
        rule: {
          projectName: [
            {required: true, message: '不能为空', trigger: 'blur'}
          ],
          contractName: [
            {required: true, message: '不能为空', trigger: 'blur'}
          ],
          contractNo: [
            {required: true, message: '不能为空', trigger: 'blur'}
          ],
          price: [
            {required: true, message: '不能为空', trigger: 'blur'}
          ],
          firstParty: [
            {required: true, message: '不能为空', trigger: 'blur'}
          ],
          secondParty: [
            {required: true, message: '不能为空', trigger: 'blur'}
          ],
          type: [
            {required: true, message: '不能为空', trigger: 'blur'}
          ],
          senderRemark: [
            {required: true, message: '不能为空', trigger: 'blur'}
          ],
          auditor: [
            {required: true, message: '不能为空', trigger: 'blur'}
          ],
          mainContent: [
            {required: true, message: '不能为空', trigger: 'blur'}
          ]

        },
        active:1,
        visible: false,
        title: '请确认签收信息',
        devices: [{id:'006',price:'2',mainContent:'500'},{id:'007',price:'3',mainContent:'555'},{id:'008',price:'2',mainContent:'500'},{id:'009',price:'2',mainContent:'500'}],
        loading: 'true',
        submitLoading: false,
        form1: {proDetailId: ''},
        fileList:[],
        selectedKeys:[],
        files:[],
        project:[{projectName:'001',contractId:'002'},{projectName:'002',contractId:'004'}],
        Signview:false,
        form1:[]
      }
    },
    created() {
      this.loadProjects()
      this.init()

    },
    methods: {
      dateTimeFormat,
      getUser,
      modifyInfo(record){
        this.form=record
        this.$delete(this.form,'auditRemark')
        this.$delete(this.form,'file')
        this.$delete(this.form,'id')
        this.$delete(this.form,'isActive')
        this.$delete(this.form,'auditTime')
        this.$delete(this.form,'auditStatus')
        this.$delete(this.form,'senderTime')
        this.form.auditor=''
        this.visible = true
        this.active=1
      },
      openFile()
      {
        this.fileVisible=true
      },
      async loadProjects() {
        await request.get('/chapter/chapterAudit/findAllChapterAuditor')
          .then(response => {
            this.form1 = response.data
          })
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
      beforeUpload(file) {
        if (file.size > 12 * 1024 * 1024) {
          this.$message({ message: '上传文件大小不能超过12M', type: 'error' })
          return false
        }
      },
onSelectChange(selectedRowKeys, selectedRows) {
              //alert("123")
        // if(selectedRows.length == 0) {
        //   this.selectSupplier = null
        // }
        let rows = []
        selectedRows.map(item => {
              rows.push(item.id)
        })
        this.selectedKeys = rows
      },
      toSearch() {
        request.request({
          url: '/chapter/chapterAudit/findChapterAuditorInfos',
          method: 'get',
          params: { projectName: this.searchForm.name, startTime: this.searchForm.time[0], overTime:this.searchForm.time[1],auditStatus:this.searchForm.auditStatus }
        })
          .then(response => {
            this.devices = response.data
            this.devices.forEach(item => {
              item.hasChildren = !item.parentId
              this.$set(this.devices, item, item)
            })
            this.loading = false
          }).catch(()=>{
          this.loading = false
        })
      },
      init() {
        request.get('/chapter/chapterAudit/findChapterAuditorInfos')
          .then(response => {
             /* this.devices = response.data */
          })
          .finally(()=> {
            this.loading=false
          })
      },
      toSign(){
        this.$confirm('将进行入库，请确认勾选项项, 是否入库?', '提示', {
          
          cancelButtonText: '取消',
          confirmButtonText: '确定',
          type: 'warning'
        })
      },
      toSignAll(){
        this.$confirm('将进行批量入库，请确认勾选项项, 是否批量入库?', '提示', {
          
          cancelButtonText: '取消',
          confirmButtonText: '确定',
          type: 'warning'
        })
        .then(() => {
          /*postActionByJson('url',{data:this.userInfo})
          .then(item=>{

          })*/
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
      },
      cancelHandler() {
        if (this.active === 1) {
          this.visible = false
        } else {
          this.active --
        }
      },
      toAdd() {
        this.title = '发起用章申请'
        this.active=1
        this.form = {}
        this.visible = true
      },
      saveRecordHandler(form) {
        this.$refs[form].validate((valid) => {
          if(valid){
            switch (this.active) {
              case 1:
                this.active++
                break
              case 2:
                this.submitLoading = true
                const fileList = this.fileList.map(item => {
                  return { id: item.id, name: item.name, url: item.url, type: 1 }
                })
                this.form.sender = parseInt(getUser())
                delete this.form.role
                request.request({
                  url: '/chapter/chapterAudit/insertChapterAudit',
                  method: 'post',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  data: JSON.stringify({chapterAudit: this.form, files: fileList})
                })
                  .then(response => {
                    this.submitLoading = false
                    this.visible = false

                    this.$message({message: response.message, type: 'success'})
                    this.fileList=[]
                    this.init()
                  })
                break
            }
          }
          else{
            this.$message({message: '请填写信息', type: 'success'})
          }
        })

      },
      deleteHandler(row) {
        this.form = row
        this.form.operator = getUser()
        request.request({
          url: '/deviceType/setInvalid',
          method: 'post',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          data: qs.stringify(this.form)
        }).then(response => {
          this.$message({message: response.message, type: 'success' })
          this.init();
        })
      },
      saveHandler() {
        this.form.operator = getUser()
        request.request({
          url: '/deviceType/saveOrUpdate',
          method: 'post',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          data: qs.stringify(this.form)
        })
          .then(response => {
            this.visible = false
            this.$message({ message: response.message, type: 'success' })
            this.init()
          })
      },
      getFile(record)
      {
        getAction('/chapter/chapterAudit/findFileUrlByOtherId',{id: record})
          .then(resp=>{
            this.files=resp.data
            this.fileVisible=true
          })
      }
    }
  }
</script>
<style lang="scss" scoped>
  .chapter-list{
    /deep/.el-form-item__content{
      height:auto;
      line-height:32px;
      margin-left:90px!important
    }
  }
</style>