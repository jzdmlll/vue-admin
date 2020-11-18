<template>
  <!-- 询价管理 -->
  <div class="pro_inquiry_list">
    <div class="btns" style="padding:1em;margin-bottom:1em;background:#fff">
      <el-tooltip class="item" v-if="selectedId.length > 0" effect="dark" content="批量删除" placement="bottom-start">
        <el-button type="danger" size="small" icon="el-icon-delete" @click="batchDelete">批量删除</el-button>
      </el-tooltip>
      <el-tooltip class="item" v-if="selectedId.length > 0" effect="dark" content="无需询价" placement="bottom-start">
        <el-button type="success" size="small" @click="setIsNotInquiry(0)">无需询价</el-button>
      </el-tooltip>
      <el-tooltip class="item" v-if="selectedId.length > 0" effect="dark" content="撤回无需询价" placement="bottom-start">
        <el-button type="warning" size="small" @click="setIsNotInquiry(1)">撤回</el-button>
      </el-tooltip>
      <el-select v-model="searchForm.proDetailId" style="margin-right: 6px" filterable clearable placeholder="请选择项目" value-key="name">
        <el-option v-for="item in projects" :key="item.id" :label="item.name" :value="item.id" />
      </el-select>
      <el-button style="margin-right: 6px" type="primary" icon="el-icon-search" size="small" @click="toSearch">查询</el-button>
    </div>
    <div style="padding:1em;margin-bottom:1em;background:#fff">
      <el-table class="table" v-loading="loading" :default-sort = "{prop: 'sort', order: 'ascending'}"
                :data="inquiryList" :row-class-name="tableRowClassName" @selection-change="handleSelectionChange" size="small" stripe>
        <el-table-column
          type="selection"
          width="55">
        </el-table-column>
        <el-table-column prop="sort" label="序号" width="50" />
        <el-table-column :show-overflow-tooltip="true" prop="name" label="设备名称">
          <template slot-scope="{row}">
            <template v-if="row.editable">
              <el-input v-model="row.name" class="edit-input" size="small" />
            </template>
            <template v-else>{{nullFormat(row.name)}}</template>
          </template>
        </el-table-column>
        <el-table-column prop="realBrand" label="品牌">
          <template slot-scope="{row}">
            <template v-if="row.editable">
              <el-input v-model="row.realBrand" class="edit-input" size="small" />
            </template>
            <template v-else>{{nullFormat(row.realBrand)}}</template>
          </template>
        </el-table-column>
        <el-table-column prop="params" :show-overflow-tooltip="true" label="技术参数" >
          <template slot-scope="{row}">
            <template v-if="row.editable">
              <el-input v-model="row.params" class="edit-input" size="small" />
            </template>
            <template v-else>{{nullFormat(row.params)}}</template>
          </template>
        </el-table-column>
        <el-table-column prop="model" :show-overflow-tooltip="true" label="品牌型号" >
          <template slot-scope="{row}">
            <template v-if="row.editable">
              <el-input v-model="row.model" class="edit-input" size="small" />
            </template>
            <template v-else>{{nullFormat(row.model)}}</template>
          </template>
        </el-table-column>
        <el-table-column prop="unit" label="单位">
          <template slot-scope="{row}">
            <template v-if="row.editable">
              <el-input v-model="row.unit" class="edit-input" size="small" />
            </template>
            <template v-else>{{nullFormat(row.unit)}}</template>
          </template>
        </el-table-column>
        <el-table-column prop="number" label="数量" >
          <template slot-scope="{row}">
            <template v-if="row.editable">
              <el-input v-model="row.number" class="edit-input" size="small" />
            </template>
            <template v-else>{{nullFormat(row.number)}}</template>
          </template>
        </el-table-column>
        <el-table-column prop="brand" label="品牌推荐" >
          <template slot-scope="{row}">
            <template v-if="row.editable">
              <el-input v-model="row.brand" class="edit-input" size="small" />
            </template>
            <template v-else>{{nullFormat(row.brand)}}</template>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" >
          <template slot-scope="{row}">
            <template v-if="row.editable">
              <el-input v-model="row.remark" class="edit-input" size="small" />
            </template>
            <template v-else>{{nullFormat(row.remark)}}</template>
          </template>
        </el-table-column>
        <el-table-column prop="isInquiry" label="是否需要询价" fixed="right">
          <template slot-scope="{row}">
            <el-switch
              v-model.string="row.isinquiry"
              active-color="#42B983"
              inactive-color="#8b8b8b"
              :active-value="1"
              :inactive-value="0"
              @change="switchChange(row.id, row.isinquiry)"
            >
            </el-switch>

          </template>
        </el-table-column>
        <el-table-column align="right" label="操作" width="180" fixed="right">
          <template slot-scope="{row}">
              <span v-if="row.editable" >
                <el-tooltip class="item" effect="dark" content="行内编辑保存" placement="bottom-start">
                  <el-button type="success" size="mini" style="padding: 7px 10px;" @click="save(row)">保存</el-button>
                </el-tooltip>
                <a-popconfirm title="确定取消修改吗?" @confirm="() => cancel(row)">
                  <el-tooltip class="item" effect="dark" content="取消" placement="bottom-start">
                    <el-button type="danger" size="mini" style="padding: 7px 10px;">取消</el-button>
                  </el-tooltip>
                </a-popconfirm>
              </span>
              <span v-else>
                 <el-tooltip v-if="row.isinquiry == 0" class="item" effect="dark" content="选择历史产品" placement="bottom-start">
                  <el-button type="success" icon="el-icon-star-on" size="mini" style="padding: 7px 10px;background: #faad14;border-color:#faad14" @click="poolChoose(row)">产品池选择</el-button>
                </el-tooltip>
                <el-tooltip class="item" effect="dark" content="行内编辑" placement="bottom-start">
                  <el-button :disabled="row.veto==1?true:false" type="primary" icon="el-icon-edit" size="mini" @click="edit(row)"></el-button>
                </el-tooltip>
              </span>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <!-- 模态框 -->
    <el-dialog title="选择产品池产品" class="importDialog" :visible.sync="visible">
      <el-form :model="form" status-icon>
        <el-table :data="poolData" v-loading="loading1" size="small">
          <el-table-column label width="35">
            <template slot-scope="scope">
              <el-radio :label="scope.row.id" v-model="form.id">&nbsp;</el-radio>
            </template>
          </el-table-column>
          <el-table-column :show-overflow-tooltip="true" prop="name" label="设备名称" />
          <el-table-column :show-overflow-tooltip="true" prop="supplier" label="供应商" />
          <el-table-column :show-overflow-tooltip="true" prop="params" label="技术参数" />
          <el-table-column :show-overflow-tooltip="true" prop="model" label="品牌型号" />
          <el-table-column :show-overflow-tooltip="true" prop="price" label="单价" />
          <el-table-column :show-overflow-tooltip="true" prop="delivery" label="货期" />
          <el-table-column :show-overflow-tooltip="true" prop="remark" label="备注" />
        </el-table>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="visible = false">取消</el-button>
        <el-button type="primary" size="small" @click="submitHandler">提交</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
  import '@/styles/auto-style.css'
  import request from '@/utils/request'
  import qs from 'querystring'
  import { dateFormat,nullFormat } from '@/utils/format'
  import { getUser } from '@/utils/auth'

  export default {
    data() {
      const fileUploadUrl = process.env.VUE_APP_BASE_API + 'file/uploadCache'
      return {
        loading1: true,
        poolData: [],
        visible: false,
        form: {},
        selectedId: [],
        searchForm: {},
        projects: [],
        inquiryList: [],
        loading: true,
        originRow: {},
        editingKey: '',
      }
    },
    created() {
      this.loadProjects()
      this.init()
    },
    methods: {
      tableRowClassName({row, index}) {
        if (row.veto == 1) {
          return 'danger-row';
        }
        return '';
      },
      submitHandler(){
        if(this.form.id){
          request.request({
            url: '/inquiry/inquiryChoosePool',
            method: 'post',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: qs.stringify({'inquiryId': this.form.inquiryId, 'proPoolId': this.form.id, 'operator': getUser()})
          }).then(resp => {
            this.$message({ message: resp.message, type: 'success' })
            this.visible = false
          })
        }

      },
      loadPool(name) {
        request.request({
          url: '/pool/findHistoryPrices',
          method: 'get',
          params: {'name': name}
        }).then(resp => {
          this.poolData = resp.data
          this.loading1 = false
        }).catch(() => {
          this.loading1 = false
        })
      },
      poolChoose(row) {
        this.visible = true
        this.form.inquiryId = row.id
        this.loadPool(row.name)
      },
      switchChange(id, status) {
        console.log(id,status)
        const ids = []
        ids.push(id)
        request.request({
          url: '/inquiry/batchSetIsNotInquiry',
          method: 'post',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          data: qs.stringify({'ids': ids, 'status': status})
        })
          .then(response => {
            this.$message({ message: response.message, type: 'success' })
            this.init()
          }).catch(()=>{
          this.init()
        })
      },
      setIsNotInquiry(status) {
        if (this.selectedId.length > 0) {
          request.request({
            url: '/inquiry/batchSetIsNotInquiry',
            method: 'post',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: qs.stringify({'ids': this.selectedId, 'status': status})
          })
            .then(response => {
              this.$message({ message: response.message, type: 'success' })
              this.init()
            })
        }
      },
      batchDelete() {
        this.$confirm('将删除选中询价, 是否删除?', '提示', {
          confirmButtonText: '删除',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          if (this.selectedId.length > 0) {
            request.request({
              url: '/inquiry/batchSetInvalid',
              method: 'post',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
              },
              data: qs.stringify({ids: this.selectedId})
            })
              .then(response => {
                this.$message({ message: response.message, type: 'success' })
                this.init()
              })
          }
        })
      },
      handleSelectionChange(record) {
        const selectedId = []
        console.log(record)
        record.map(item => {
          selectedId.push(item.id)
        })
        this.selectedId = selectedId
      },
      /**
       * 行内编辑（确定）
       */
      edit(record) {
        this.newInquiry = [...this.inquiryList]
        this.cacheInquiry = this.newInquiry.map(item => ({ ...item }))
        const target = this.newInquiry.filter(item => record.id === item.id)[0]
        this.editingKey = record.id
        if (target) {
          target.editable = true
          this.inquiryList = this.newInquiry
        }
      },
      save(record) {
        this.newInquiry = [...this.inquiryList]
        const newCacheData = [...this.cacheInquiry]
        const target = this.newInquiry.filter(item => record.id === item.id)[0]
        const targetCache = newCacheData.filter(item => record.id === item.id)[0]
        request.request({
          url: '/inquiry/rowSave',
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
              this.inquiryList = this.newInquiry
              Object.assign(targetCache, target)
              this.cacheInquiry = newCacheData
            }
          })
        this.editingKey = ''
      },
      cancel(record) {
        this.newInquiry = [...this.inquiryList]
        const target = this.newInquiry.filter(item => record.id === item.id)[0]
        this.editingKey = ''
        if (target) {
          Object.assign(target, this.cacheInquiry.filter(item => record.id === item.id)[0])
          delete target.editable
          this.inquiryList = this.newInquiry
        }
      },
      /**
       * 页面初始化
       */
      init() {
        request.get('/inquiry/findAll')
          .then(response => {
            this.inquiryList = response.data
            this.loading = false
          })
      },
      /**
       * 点击条件查询
       */
      toSearch() {
        if (this.searchForm.proDetailId) {
          this.loading = true
          request.get('/inquiry/findByProDetailId?proDetailId='+this.searchForm.proDetailId)
            .then(response => {
              this.inquiryList = response.data
              this.loading = false
            })
        }
      },
      /**
       * 日期格式化
       */
      dateFormat,
      /**
       * 空值格式化
       */
      nullFormat,
      /**
       * 查询所有项目
       */
      loadProjects() {
        request.get('/project/detail/findByAll')
          .then(response => {
            this.projects = response.data
          })
      }
    }
  }
</script>

<style lang="scss" scoped>
  .pro_inquiry_list {
    .table {
      /deep/.el-table__body {
        .danger-row, .danger-row td {
          background: #f1b7b7;
        }
        .cell {
          .el-button {
            margin-left: 5px!important;
          }
        }
      }
    }
  }
</style>

