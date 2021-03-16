<template>
  <!-- 用章管理 -->
  <div class="chapter-list">
    <div class="btns" style="padding:1em;margin-bottom:1em;background:#fff">
      <el-input v-model="searchForm.proName" placeholder="请输入工程名" style="width:200px;"></el-input>
      <el-select v-model="searchForm.auditStatus" clearable>
        <el-option value="0" label="审核中"/>
        <el-option value="1" label="审核通过"/>
        <el-option value="2" label="审核否决"/>
      </el-select>
      <el-date-picker
        v-model="searchForm.time"
        unlink-panels
        style = "margin-left: 10px"
        value-format="timestamp"
        type="daterange"
        range-separator="至"
        width="300px;"
        start-placeholder="开始日期"
        end-placeholder="结束日期">
      </el-date-picker>
      <el-button style="margin-right:10px" type="primary" icon="el-icon-search" size="small" @click="toSearch">查询</el-button>
      <el-tooltip class="item" effect="dark" content="发起用章申请" placement="bottom-start">
        <el-button type="primary" size="small" icon="el-icon-plus" @click="toAdd">发起用章申请</el-button>
      </el-tooltip>
    </div>
    <div style="padding:1em;margin-bottom:1em;background:#fff">
      <a-table
        v-loading="loading"
        :data-source="devices"
        :pagination="pagination"
        size="small"
        row-key="id"
        :scroll="{x:2000}"
      >
        <a-table-column :width="100" key="id" data-index="id" title="id" v-if="false"/>
        <a-table-column :width="200" key="projectName" data-index="projectName" title="工程名" />
        <a-table-column :width="200" key="contractName" data-index="contractName" title="合同名" />
        <a-table-column :width="100" key="sender" data-index="sender" title="送审人" />
        <a-table-column :width="100" key="auditor" data-index="auditor" title="审核人" />
        <!--<a-table-column :width="200" key="contractNo" data-index="contractNo" title="合同编号" />-->
        <a-table-column :width="100" key="auditStatus" data-index="auditStatus" title="审核状态" aligwarningn="center" >
          <template slot-scope="text,scope">
            <el-tag :type="scope.auditStatus===1? 'success':scope.auditStatus=== 2?'danger':'warning'">{{scope.auditStatus ===1 ?'审核通过':scope.auditStatus=== 2?'审核否决':'正在审核'}}</el-tag>
          </template>
        </a-table-column>
        <a-table-column :width="100" key="auditRemark" data-index="auditRemark" title="审核备注" />
        <a-table-column :width="120" key="auditTime" title="审核时间">
          <template slot-scope="text, record">{{dateTimeFormat(record.auditTime)}}</template>
        </a-table-column>
        <a-table-column :width="100" prop="senderRemark" data-index="senderRemark" title="送审备注" />
        <a-table-column :width="120" key="senderTime" data-index="senderTime" title="送审时间" >
          <template slot-scope="text,scope">{{dateTimeFormat(scope.senderTime)}}</template>
        </a-table-column>
        <a-table-column :width="160" key="files" title="附件" data-index="files" align="center">
          <template slot-scope="text, record">
            <el-tag effect="plain" type="primary">
              <a v-for="file in text" style="display: block" class="ellipsis" :href="file.url" :key="file.url" target="_blank">{{file.name}}</a>
            </el-tag>
          </template>
        </a-table-column>
        <a-table-column :ellipsis="true" key="mainContent" align="center" data-index="mainContent" title="主要内容" />
        <a-table-column :width="100" key="price"  data-index="price" title="金额" />
        <a-table-column :width="100" key="firstParty" data-index="firstParty" title="甲方" />
        <a-table-column :width="100" key="secondParty" data-index="secondParty" title="乙方" />
        <a-table-column :width="100" key="type" data-index="type" title="类别" />
        <a-table-column title="操作" align="center" :width="70" fixed="right">
          <template slot-scope="text,scope">
            <a-tooltip title="修改">
              <el-button type="primary" icon="el-icon-edit" size="mini" @click="modifyInfo(scope)"/>
            </a-tooltip>
          </template>
        </a-table-column>
      </a-table>
    </div>
    <!-- 模态框 -->
    <el-dialog :title="title" :visible.sync="visible">
      <el-steps :active="active" simple style="background: #d8f1e3;margin-bottom: 8px;padding: 13px 4%;height: 36px">
        <el-step title="填写详细内容" icon="el-icon-edit" />
        <el-step title="上传相关文件" icon="el-icon-upload" />
        <!--<el-step title="选择审核流程" icon="el-icon-upload" />-->
      </el-steps>
      <el-form ref="form" :model="form" :rules="rule">
        <!-- 填写项目内容 -->
        <div :style="active === 1?{display: 'block'}:{display:'none'}">

          <el-form-item label="工程名"  label-width="80px" size="small" prop="projectName">
            <el-input v-model="form.projectName" clearable placeholder="工程名" value-key="name" size="small">
            </el-input>
          </el-form-item>
          <el-form-item label="合同名"  label-width="80px" size="small" prop="contractName">
            <el-input v-model="form.contractName" clearable placeholder="合同名" value-key="name" size="small">
            </el-input>
          </el-form-item>
          <el-form-item label="合同编号" label-width="80px" size="small" prop="contractNo">
            <el-input v-model="form.contractNo" clearable placeholder="合同编号" value-key="name" size="small">
            </el-input>
          </el-form-item>
          <el-form-item label="金额" label-width="80px" size="small" prop="price">
            <el-input v-model="form.price" clearable placeholder="金额" value-key="name" size="small">
            </el-input>
          </el-form-item>
          <el-form-item label="甲方" label-width="80px" size="small" prop="firstParty">
            <el-input v-model="form.firstParty" clearable placeholder="请填写甲方" value-key="name" size="small">
            </el-input>
          </el-form-item>
          <el-form-item label="乙方" label-width="80px" size="small" prop="secondParty">
            <el-input v-model="form.secondParty" clearable placeholder="请填写乙方" value-key="name" size="small">
            </el-input>
          </el-form-item>
          <el-form-item label="类别" label-width="80px" size="small" prop="type">
            <el-input v-model="form.type" clearable placeholder="请填写类别" value-key="name" size="small">
            </el-input>
          </el-form-item>
          <el-form-item label="审核人" label-width="80px" size="small" prop="auditor">
            <!-- <el-input v-model="form.auditor" clearable placeholder="请填写类别" value-key="name" size="small"/>  -->
            <el-select v-model="form.auditor" clearable placeholder="请填写审核人" value-key="auditor" size="small">
              <el-option v-for="item in auditors" :key="item.username" :label="item.username" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item :width="500" label="送审备注" label-width="80px" size="small" prop="senderRemark">
            <el-input v-model="form.senderRemark" clearable placeholder="请填写备注" value-key="name" size="small">
            </el-input>
          </el-form-item>
          <el-form-item label="主要内容" label-width="80px"  size="small" prop="mainContent">
            <el-input v-model="form.mainContent" type="textarea" :autosize="{ minRows:3, maxRows: 10}"/>
          </el-form-item>
        </div>
        <!-- 上传项目文件 -->
        <div :style="active === 2?{display: 'block'}:{display:'none'}">
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
              上传项目文件
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
        <el-button size="small" @click="cancelHandler">{{ this.active === 1?'取消':'上一步' }}</el-button>
        <el-button type="primary" :loading="submitLoading" size="small" @click="saveRecordHandler('form')">{{ this.active === 2?'确定':'下一步' }}</el-button>
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

        pagination: {
          showQuickJumper: true,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50'],
          current: 1,
          pageSize: 10,
          total: 0,
          onChange: (item) => {
            this.pagination.current = item
            this.toSearch()
          }
        },

        projects:[],
        filemark:{},
        modify:{},
        fileUploadUrl,
        searchForm: {time:''},
        fileVisible:false,
        form: {projectName:'',contractName:'',contractNo:'',price:'',firstParty:'',secondParty:'',type:'',senderRemark:'',auditor:'',mainContent:''},
        rule: {
          /*projectName: [
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
          ]*/

        },
        active:1,
        visible: false,
        title: '添加设备类型',
        devices: [],
        loading: 'true',
        submitLoading: false,
        form1: {proDetailId: ''},
        fileList:[],
        files:[],
        auditors:[]
      }
    },
    created() {
      this.init()
    },
    methods: {
      dateTimeFormat,
      getUser,
      modifyInfo(record){
        this.form=record
        this.visible = true
        this.active=1
      },
      openFile()
      {
        this.fileVisible=true
      },
      loadAuditors() {
        request.get('/chapter/chapterAudit/findAllChapterAuditor')
          .then(response => {
            this.auditors = response.data
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

      toSearch() {
        this.devices = []
        request.request({
          url: '/chapter/chapterAudit/findChapterAuditInfosByParams',
          method: 'get',
          params: {
            proName: this.searchForm.proName,
            startTime: this.searchForm.time[0],
            overTime: this.searchForm.time[1],
            auditStatus: this.searchForm.auditStatus,
            pageNum: this.pagination.current,
            pageSize: this.pagination.pageSize
          }
        })
          .then(resp => {
            this.devices = resp.data.list
            this.pagination.current = resp.data.pageNum
            this.pagination.pageSize = resp.data.pageSize
            this.pagination.total = resp.data.total
            this.loading = false
          }).catch(()=>{
          this.loading = false
        })
      },
      init() {
        this.loadAuditors()
        this.toSearch()
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
                  .catch(()=>{
                    this.submitLoading = false
                    this.visible = false
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
    .ellipsis {
      overflow: hidden!important;
      white-space: nowrap!important;
      text-overflow: ellipsis!important;
      font-size: 13px;
      max-width: 110px;
    }
  }
</style>
