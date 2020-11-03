<template>
  <!-- 询价管理 -->
  <div class="pro_inquiry_list">
    <div class="btns" style="padding:1em;margin-bottom:1em;background:#fff">
      <el-tooltip class="item" v-if="selectedId.length > 0" effect="dark" content="批量删除" placement="bottom-start">
        <el-button type="danger" size="small" icon="el-icon-delete" @click="batchDelete">批量删除</el-button>
      </el-tooltip>
      <el-select v-model="searchForm.proDetailId" style="margin-right: 6px" filterable clearable placeholder="请选择项目" value-key="name">
        <el-option v-for="item in projects" :key="item.id" :label="item.name" :value="item.id" />
      </el-select>
      <el-button style="margin-right: 6px" type="primary" icon="el-icon-search" size="small" @click="toSearch">查询</el-button>
    </div>
    <div style="padding:1em;margin-bottom:1em;background:#fff">
      <el-table class="table" v-loading="loading" :default-sort = "{prop: 'sort', order: 'ascending'}"
                :data="inquiryList"  @selection-change="handleSelectionChange" size="small" stripe>
        <el-table-column
          type="selection"
          width="55">
        </el-table-column>
        <el-table-column prop="sort" label="序号" width="50" />
        <el-table-column prop="name" label="设备名称">
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
        <el-table-column prop="params" label="技术参数" >
          <template slot-scope="{row}">
            <template v-if="row.editable">
              <el-input v-model="row.params" class="edit-input" size="small" />
            </template>
            <template v-else>{{nullFormat(row.params)}}</template>
          </template>
        </el-table-column>
        <el-table-column prop="model" label="品牌型号" >
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
        <el-table-column align="center" label="操作" width="130">
          <template slot-scope="{row}">
              <span v-if="row.editable" >
                <el-tooltip class="item" effect="dark" content="行内编辑" placement="bottom-start">
                  <el-button type="success" size="mini" style="padding: 7px 10px;" @click="save(row)">保存</el-button>
                </el-tooltip>
                <a-popconfirm title="确定取消修改吗?" @confirm="() => cancel(row)">
                  <el-tooltip class="item" effect="dark" content="取消" placement="bottom-start">
                    <el-button type="danger" size="mini" style="padding: 7px 10px;">取消</el-button>
                  </el-tooltip>
                </a-popconfirm>
              </span>
              <span v-else>
                <el-tooltip class="item" effect="dark" content="行内编辑" placement="bottom-start">
                  <el-button type="primary" icon="el-icon-edit" size="mini" @click="edit(row)" />
                </el-tooltip>
              </span>
          </template>
        </el-table-column>
      </el-table>
    </div>
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
        .cell {
          .el-button {
            margin-left: 5px!important;
          }
        }
      }
    }
  }
</style>

