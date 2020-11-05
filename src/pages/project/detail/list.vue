<template>
  <!-- 项目管理 -->
  <div class="pro_list">
    <div class="btns" style="padding:1em;margin-bottom:1em;background:#fff">
      <el-tooltip class="item" effect="dark" content="新增项目" placement="bottom-start">
        <el-button type="primary" icon="el-icon-plus" size="mini" @click="toAdd">添加项目</el-button>
      </el-tooltip>
    </div>
    <div style="padding:1em;margin-bottom:1em;background:#fff">
      <el-table v-loading="loading" :data="projects" size="small">
        <el-table-column type="index" prop="" label="序号" width="120" />
        <el-table-column prop="name" label="项目名称" />
        <el-table-column prop="content" label="内容" />
        <el-table-column prop="remark" label="批注" />
        <el-table-column label="操作" align="center" width="180">
          <template slot-scope="scope">
            <el-tooltip class="item" effect="dark" content="删除该项目" placement="bottom-start">
              <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteHandler(scope.row.id)" />
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="修改该项目" placement="bottom-start">
              <el-button type="success" icon="el-icon-edit" size="mini" @click="editHandler(scope.row)" />
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="上传询价函" placement="bottom-start">
              <el-button type="success" icon="el-icon-upload" size="mini" @click="uploadHandler(scope.row)" />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <!-- 模态框 -->
    <el-dialog :title="title" :visible.sync="visible">
      <el-steps :active="active" simple style="background: #d8f1e3;margin-bottom: 8px;padding: 13px 4%;height: 36px">
        <el-step title="填写项目内容" icon="el-icon-edit" />
        <el-step title="上传项目文件" icon="el-icon-upload" />
        <el-step title="选择审核流程" icon="el-icon-upload" />
      </el-steps>
      <el-form ref="form" :rules="codeRules" status-icon :model="form">
        <!-- 填写项目内容 -->
        <div :style="active === 1?{display: 'block'}:{display:'none'}">
          <el-form-item label="项目来源" label-width="80px" size="small" prop="proOriginId">
            <el-select v-model="form.proOriginId" clearable placeholder="请选择项目来源" value-key="name" size="small">
              <el-option v-for="item in proOrigins" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="项目类型" label-width="80px" size="small" prop="proTypeId">
            <el-select v-model="form.proTypeId" clearable placeholder="请选择项目类型" value-key="name" size="small">
              <el-option v-for="item in proTypes" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="项目名称" label-width="80px" size="small" prop="name">
            <el-input v-model="form.name" autocomplete="off" />
          </el-form-item>
          <el-form-item label="项目内容" label-width="80px" size="small" prop="code">
            <el-input v-model="form.content" type="textarea" />
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
        <!-- 选择审核流程 -->
        <div :style="active === 3?{display: 'block'}:{display:'none'}">
          <el-select size="small" v-model="form.role" placeholder="请选择要添加的审核" value-key="checkName" style="margin:0 0 8px 1em" @change="addCheck(form.role)">
            <el-option v-for="item in roles" :key="item.id" :label="item.checkName" :value="item" />
          </el-select>
          <div class="timeline-container">
            <a-timeline>
              <a-timeline-item v-for="item in proChecks" :key="item.roleId">
                {{item.checkName}}
                <i  class="el-icon-remove my-transition" @click="removeCheck(item)"/>
              </a-timeline-item>
            </a-timeline>
          </div>
        </div>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="cancelHandler">{{ this.active === 1?'取消':'上一步' }}</el-button>
        <el-button type="primary" :loading="submitLoading" size="small" @click="saveRecordHandler('form')">{{ this.active === 3?'确定':'下一步' }}</el-button>
      </div>
    </el-dialog>
    <el-dialog title="导入询价函" class="importDialog" :visible.sync="visible2">
      <el-form ref="form1" :model="form1" :rules="codeRules" status-icon>
        <div>
          <div style="margin: 8px 0 26px 0;position: relative;">
            <el-button @click="clickFileInput" type="primary" size="small"><a-icon type="file-excel" style="font-size: 12px;margin-right: 5px"/>excel导入</el-button>
            <input type="file" ref="upload" accept=".xls,.xlsx" @change="readExcel" class="outputlist_upload">
            <div v-if="excelRows>0" style="position: absolute;left: 0;padding: 4px 0;font-size: 12px;color: #909399">从Excel读取到
              <span style="color: #42b983">{{excelRows}}</span>条数据
            </div>
          </div>

          <el-input
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
  </div>
</template>
<script>
import request from '@/utils/request'
import qs from 'querystring'
import '@/styles/auto-style.css'
import { getUser } from '@/utils/auth'
import XLSX from 'xlsx'

export default {
  data() {
    const fileUploadUrl = process.env.VUE_APP_BASE_API + 'file/uploadCache'

    var validName = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('不能为空'));
      }
      request.get('/project/detail/verifyExistence',{
        params: {proName: value}
      })
        .then(response => {
          console.log(response)
          if (response.data && value != this.nameKey) {
            callback(new Error('项目名已存在'))
          }else {
            callback();
          }
        })
    };
    return {
      nameKey: '',
      keys: {
        "设备名称": 'name',
        "品牌": 'realBrand',
        "型号": 'model',
        "技术要求": 'params',
        "品牌推荐": 'brand',
        "单位": 'unit',
        "数量": 'number',
        "备注": 'remark',
      },
      outputs: [],
      excelRows: 0,
      visible2: false,
      form1: {proDetailId: ''},
      importData: '',
      visible: false,
      title: '添加项目',
      projects: [],
      loading: true,
      submitLoading: false,
      form: {proOriginId: '', proTypeId: ''},
      active: 1,
      fileList: [],
      fileUploadUrl,
      roles: [],
      proChecks: [],
      proOrigins: [],
      proTypes: [],
      codeRules: {
        name: [
          {validator: validName, trigger: 'blur'}
        ],
        proOriginId: [
          {required: true, message: '不能为空', trigger: 'blur'}
        ],
        proTypeId: [
          {required: true, message: '不能为空', trigger: 'blur'}
        ],
        proDetailId: [
          {required: true, message: '不能为空', trigger: 'blur'}
        ]
      }
    }
  },
  created() {
    this.loadProjects()
  },
  methods: {
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
            item['operator'] = userId
          })
          request.request({
            url: '/inquiry/batchAddInquiry',
            method: 'post',
            headers: {
              'Content-Type': 'application/json'
            },
            data: JSON.stringify({inquiryList: form})
          }).then( response => {
            this.$message({ message: response.message, type: 'success' })
            this.visible2 = false
          })
        } else {
          console.log('error commit')
          return false
        }
      })
    },
    clickFileInput() {
      this.$refs.upload.dispatchEvent(new MouseEvent('click'))
    },
    readExcel(e) {
      const files = e.target.files;
      //console.log(files);
      if(files.length<=0){//如果没有文件名
        return false;
      }else if(!/\.(xls|xlsx)$/.test(files[0].name.toLowerCase())){
        this.$message.error('上传格式不正确，请上传xls或者xlsx格式');
        return false;
      }
      this.excelRows = 0
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
          this.outputs = [];//清空接收数据
          ws.map(item => {
            if(item['序号']&&item['设备名称']){
              this.outputs.push(item);
              this.excelRows ++
            }
          })
          this.$refs.upload.value = '';
        } catch (e) {
          console.log(e)
          return false;
        }
      };
      fileReader.readAsBinaryString(files[0]);
    },
    cancelHandler2() {
      this.visible2 = false
    },
    uploadHandler(row) {
      this.visible2 = true
      this.form1.proDetailId = row.id
      this.excelRows  = 0
    },
    removeCheck(role) {
      this.proChecks.splice(this.proChecks.findIndex(item => item.roleId === role.id), 1)
    },
    addCheck(role) {
      let key = 0;
      this.proChecks.map(item => {
        if (item.roleId == role.id) {
          key ++
        }
      })
      if (key === 0) {
        this.proChecks.push({ checkName: role.checkName, roleId: role.id })
      }else {

      }
    },
    loadProChecks() {
      request.get('/role/selectAllHasCheckName')
        .then(response => {
          this.roles = response.data
        })
    },
    loadProOrigins() {
      request.get('/project/origin/findAll')
        .then(response => {
          this.proOrigins = response.data
        })
    },
    loadProTypes() {
      request.get('/project/type/findAll')
        .then(response => {
          this.proTypes = response.data
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
    cancelHandler() {
      if (this.active === 1) {
        this.visible = false
      } else {
        this.active--
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
          this.active++;
          break
        case 3:
          this.submitLoading = true
          const fileList = this.fileList.map(item => {
            return { id: item.id, name: item.name, url: item.url, type: 1 }
          })
          this.form.operator = parseInt(getUser())
          delete this.form.role
          request.request({
            url: '/project/detail/saveOrUpdate',
            method: 'post',
            headers: {
              'Content-Type': 'application/json'
            },
            data: JSON.stringify({proDetails: this.form, files: fileList, proChecks: this.proChecks})
          })
            .then(response => {
              this.submitLoading = false
              this.visible = false
              this.$message({message: response.message, type: 'success'})
              this.loadProjects()
            })
          break
      }
    },

    toAdd() {
      this.visible = true
      this.nameKey = ''
      this.form = {}
      this.title = '添加项目'
      this.submitLoading = false
      this.active = 1
      this.fileList = []
      this.loadProChecks()
      this.loadProOrigins()
      this.loadProTypes()
    },

    loadProjects() {
      request.get('/project/detail/findByAll')
        .then(response => {
          this.projects = response.data
          this.loading = false
        })
    },
    deleteHandler(id) {
      this.$confirm('此操作将永久删除该记录, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {

      })
    },
    editHandler(row) {
      this.visible = true
      this.title = '修改项目'
      this.form = row
      this.submitLoading = false
      this.nameKey = row.name
      this.loadProChecks()
      this.loadProOrigins()
      this.loadProTypes()
      let proChecks = []
      request.get('/project/detail/findProDetailCheck?proDetailId='+row.id)
        .then(response => {
          response.data.map(item => {
            proChecks.push({'checkName': item.checkName, 'roleId': item.id})
          })
          this.proChecks = [...proChecks]
        })
    }
  }
}
</script>

<style lang="scss" scoped>
  .pro_list {
    .timeline-container {
      padding: 1em;
      width: calc(221px + 4em);
      .el-icon-remove {
        color: #ff4949;
        float: right;
        transform: translate(0,4px);
        opacity: 0;
        cursor: pointer;
        margin-right: 2em;
      }
      .ant-timeline:hover > li .ant-timeline-item-content .el-icon-remove {
        opacity: 1;
      }
    }
    .outputlist_upload {
      opacity: 0;
      width: 0;
      overflow: hidden;
    }
    .importDialog {
      .el-form-item {
        /deep/.el-form-item__content {
          margin: 0 8px 0 0 !important;
        }
      }
    }
  }
</style>
