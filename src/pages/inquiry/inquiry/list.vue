<template>
  <!-- 询价管理 -->
  <div class="pro_inquiry_list">
    <div class="btns" style="padding:1em;margin-bottom:1em;background:#fff">
      <el-tooltip class="item" v-if="selectedId.length > 0" effect="dark" content="批量删除" placement="bottom-start">
        <el-button type="danger" size="small" icon="el-icon-delete" @click="batchDelete">批量删除</el-button>
      </el-tooltip>
      <el-tooltip class="item" v-if="selectedId.length > 0" effect="dark" content="导出excel" placement="bottom-start">
        <el-button type="primary" icon="el-icon-document" size="small" :loading="downloadLoading" @click="handleDownload">导出Excel</el-button>
      </el-tooltip>
      <el-tooltip class="item" v-if="selectedId.length > 0" effect="dark" content="选择设备类型" placement="bottom-start">
        <el-button type="primary" icon="el-icon-s-help" size="small" @click="handleSetDevice">选择设备类型</el-button>
      </el-tooltip>
      <el-select v-model="searchForm.proDetailId" style="margin-right: 6px" filterable clearable placeholder="请选择项目" value-key="name">
        <el-option v-for="item in projects" :key="item.id" :label="item.name" :value="item.id" />
      </el-select>
      <el-button style="margin-right: 6px" type="primary" icon="el-icon-search" size="small" @click="toSearch">查询</el-button>
    </div>
    <div style="padding:1em;margin-bottom:1em;background:#fff">
      <a-table
        class="table"
        size="middle"
        ref="inquiryList"
        :rowKey="record => record.id"
        :loading="loading"
        :data-source="inquiryList"
        :row-class-name="tableRowClassName"
        :row-selection="{ selectedRowKeys: selectedId, onChange: handleSelectionChange, selections: [{
            key: 'all-data',
            text: '全选',
            onSelect: () => {
              this.selectedId =  inquiryList.map(item=>{return item.id});
            },
        }]}"
        :scroll="inquiryList.length > 0 ?{ x: 1200}:{}">
        <a-table-column v-if="currentTemplate.tree == 1" :ellipsis="true" :width="100" align="center" key="parentId" title="大类" data-index="parentId"/>
        <a-table-column v-for="item in currentTemplate.tableColumn" ellipsis="true" :width="item.width" :align="item.align" :key="item.key" :title="item.title" :dataIndex="item.dataIndex">
          <template slot-scope="text, record">
            <template v-if="record.editable && item.key != 'sort'">
              <el-input v-model="record[item.key]" class="edit-input" size="small" />
            </template>
            <a-tooltip v-else :title="text+''" placement="topLeft">
              <span>{{record[item.key]}}</span>
            </a-tooltip>
          </template>
        </a-table-column>
        <a-table-column fixed="right" title="操作" key="action" align="center" :width="140">
          <template slot-scope="text, record">
            <span v-if="record.editable" >
                <el-tooltip class="item" effect="dark" content="行内编辑保存" placement="bottom-start">
                  <el-button type="success" size="mini" style="padding: 7px 10px;" @click="save(record)">保存</el-button>
                </el-tooltip>
                <a-popconfirm title="确定取消修改吗?" @confirm="() => cancel(record)">
                  <el-tooltip class="item" effect="dark" content="取消" placement="bottom-start">
                    <el-button type="danger" size="mini" style="padding: 7px 10px;">取消</el-button>
                  </el-tooltip>
                </a-popconfirm>
              </span>
            <span v-else>
                 <!--<el-tooltip class="item" effect="dark" content="选择历史产品" placement="bottom-start">
                  <el-button type="success" icon="el-icon-star-on" size="mini" style="padding: 7px 10px;background: #faad14;border-color:#faad14" @click="poolChoose(row)">产品池选择</el-button>
                </el-tooltip>-->
                <el-tooltip v-if="record.veto==1" class="item" effect="dark" content="重新询价" placement="bottom-start">
                  <el-button type="primary" icon="el-icon-edit" size="mini" @click="addInquiry(record)">重新询价</el-button>
                </el-tooltip>
                <el-tooltip class="item" effect="dark" content="行内编辑" placement="bottom-start">
                  <el-button :disabled="record.veto==1?true:false" type="primary" icon="el-icon-edit" size="mini" @click="edit(record)"></el-button>
                </el-tooltip>
              </span>
          </template>
        </a-table-column>
      </a-table>
    </div>

    <!-- 模态框 -->
    <el-dialog title="重新询价" :visible.sync="quoteVisible">
      <el-form :model="form" status-icon>
        <el-row>
          <el-col :sm="24" :lg="12">
            <el-form-item size="mini" label="设备名" label-width="80px" prop="name">
              <el-input v-model="form.name" autocomplete="off" size="small" />
            </el-form-item>
          </el-col>
          <el-col :sm="24" :lg="12">
            <el-form-item label="品牌" label-width="80px" prop="realBrand">
              <el-input v-model="form.realBrand" autocomplete="off" size="small" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :sm="24" :lg="12">
            <el-form-item label="技术参数" label-width="80px" prop="params">
              <el-input v-model="form.params" autocomplete="off" size="small" />
            </el-form-item>
          </el-col>
          <el-col :sm="24" :lg="12">
            <el-form-item label="型号" label-width="80px" prop="model">
              <el-input v-model="form.model" autocomplete="off" size="small" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :sm="24" :lg="12">
            <el-form-item label="单位" label-width="80px" prop="unit">
              <el-input v-model="form.unit" autocomplete="off" size="small" />
            </el-form-item>
          </el-col>
          <el-col :sm="24" :lg="12">
            <el-form-item label="数量" label-width="80px" prop="number">
              <el-input v-model="form.number" autocomplete="off" size="small" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :sm="24" :lg="12">
            <el-form-item label="品牌推荐" label-width="80px" prop="brand">
              <el-input v-model="form.brand" autocomplete="off" size="small" />
            </el-form-item>
          </el-col>
          <el-col :sm="24" :lg="12">
            <el-form-item label="备注" label-width="80px" prop="brand">
              <el-input v-model="form.remark" autocomplete="off" size="small" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="quoteVisible = false">取消</el-button>
        <el-button type="primary" size="small" @click="addInquirySubmit">提交</el-button>
      </div>
    </el-dialog>
    <!-- 模态框 -->
    <el-dialog title="选择设备类型" :visible.sync="deviceVisible">
      <el-form :model="deviceForm" status-icon>
        <el-form-item label="设备类型" label-width="80px" prop="device">
          <el-cascader size="small" v-model="deviceForm.id" :options="devices" :props="props" clearable />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="quoteVisible = false">取消</el-button>
        <el-button type="primary" size="small" @click="setDeviceSubmit">提交</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
  import '@/styles/auto-style.css'
  import request from '@/utils/request'
  import qs from 'querystring'
  import { dateFormat,nullToEmpty } from '@/utils/format'
  import { getUser } from '@/utils/auth'
  import { sortBykey } from '@/utils/sort'
  import { getAction, postActionByJson, postActionByQueryString } from '@/api/manage'

  export default {
    data() {
      const fileUploadUrl = process.env.VUE_APP_BASE_API + 'file/uploadCache'
      return {

        currentTemplate: {},

        props: { multiple: false, value: 'id', label: 'name', emitPath: false },
        devices: [],
        deviceVisible: false,
        deviceForm: {},
        quoteVisible: false,
        downloadLoading: false,
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
      this.init()
    },
    methods: {
      loadDevice() {
        request.get('/deviceType/findDeviceTypeTree')
          .then(resp => {
            this.devices = resp.data
          })
      },
      setDeviceSubmit() {
        //console.log(this.selectedId)
        request.request({
          url: '/inquiry/modifyDeviceType',
          method: 'post',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          data: qs.stringify({inquiryIds: this.selectedId, code: this.deviceForm.id})
        }).then(resp => {
          this.$message({ message: resp.message, type: 'success' })
          this.deviceVisible = false
        })
      },
      handleSetDevice() {
        this.deviceVisible = true
        if(this.devices.length == 0){
          this.loadDevice()
        }
      },
      sortBykey,
      handleDownload() {
        if (this.selectedId.length) {
          this.downloadLoading = true
          import('@/vendor/Export2Excel').then(excel => {
            let quote = {
              tHeader: ['报价型号', '报价品牌', '实际技术参数', '设备单价','设备总价','货期','质保期/售后','图片','备注'],
              filterVal: ['suModel', 'suBrand', 'suParams', 'price', 'totalPrice', 'delivery', 'warranty', 'image', 'quoteRemark']
            }
            let tHeader = Object.keys(this.currentTemplate.jsonKeys)
            let filterVal = Object.values(this.currentTemplate.jsonKeys)
            tHeader = ['编号'].concat(tHeader)
            tHeader = tHeader.concat(quote.tHeader)
            filterVal = ['id'].concat(filterVal)
            filterVal = filterVal.concat(quote.filterVal)


           /* const tHeader = [
              '编号', '序号','供应商', '设备名称', '品牌', '型号', '技术要求', '单位', '报价型号', '报价品牌', '实际技术参数',
              '设备单价','设备总价','货期','质保期/售后','图片','备注'
            ]
            const filterVal = ['id', 'sort', 'supplier', 'name', 'realBrand', 'model', 'params', 'unit', 'suModel', 'suBrand',
              'suParams', 'price', 'totalPrice', 'delivery', 'warranty', 'image', 'remark']*/
            let list = []
            this.inquiryList.map(item=>{
              console.log(item)
              if(this.selectedId.includes(item.id)){
                let inquiry = {}
                filterVal.map(key => {
                  inquiry[key] = item[key]
                })
                list.push(inquiry)
              }
            })

            list = this.sortBykey(list, 'sort')
            const data = this.formatJson(filterVal, list)
            excel.export_json_to_excel({
              header: tHeader,
              data,
              filename: this.filename
            })
            this.downloadLoading = false
            this.$refs.inquiryList.clearSelection()

          })
        } else {
          this.$message({
            message: 'Please select at least one item',
            type: 'warning'
          })
        }
      },
      formatJson(filterVal, jsonData) {
        return jsonData.map(v => filterVal.map(j => v[j]))
      },
      addInquirySubmit(){
        this.form.operator = getUser()
        request.request({
          url: '/inquiry/saveOrUpdate',
          method: 'post',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          data: qs.stringify(this.form)
        }).then(resp => {
          this.$message({ message: resp.message, type: 'success' })
          this.quoteVisible = false
          this.form = {}
          this.init()
        })
      },
      addInquiry(row) {
        this.form = row
        this.quoteVisible = true
      },
      tableRowClassName(row, index) {
        if (row.veto == 1 || row.refuseNum != 0) {
          return 'danger-row';
        }else if(row.poolNum != 0){
          return 'warning-row';
        }
        return '';
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
          selectedId.push(item)
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
      async init() {
        await this.loadProjects()
        if(this.projects.length > 0){
          if(!this.searchForm.proDetailId) {
            this.$set(this.searchForm, 'proDetailId', this.projects[0].id)
          }
          this.toSearch()
        }else {
          this.loading = false
        }
      },
      /**
       * 点击条件查询
       */
      toSearch() {
        if (this.searchForm.proDetailId) {
          this.loading = true
          request.get('/inquiry/findByProDetailId?proDetailId='+this.searchForm.proDetailId)
            .then(async(response) => {
              this.currentTemplate = {}
              if (response.data.length > 0) {
                await this.loadCurrentTemplate(response.data[0]['templateId'])
              }
              this.inquiryList = response.data
              this.loading = false
            }).catch(()=>{
              this.loading = false
            })
        }
      },
      /**
       * 日期格式化
       */
      dateFormat,
      /**
       * 查询所有项目
       */
      async loadProjects() {
        await request.get('/project/detail/findByAll')
          .then(response => {
            this.projects = response.data
          })
      },
      loadCurrentTemplate(id) {
        if (id) {
          getAction('/inquiry/template/findInquiryTemplate', {id: id})
            .then(resp => {
              resp.data[0].jsonKeys = JSON.parse(resp.data[0].jsonKeys)
              resp.data[0].tableColumn = JSON.parse(resp.data[0].tableColumn)
              this.currentTemplate = resp.data[0]
            })
            .catch(()=> {
              this.loading = false
            })
        }
      },
    }
  }
</script>

<style lang="scss" scoped>
  .pro_inquiry_list {
    /deep/.el-form-item__content{
      height:auto;
      line-height:32px;
      margin-left:90px!important
    }
    .table {
        /deep/.danger-row{
          background: #f1b7b7;
        }
      /deep/.warning-row{
          background: #eae2c5;
        }
        .cell {
          .el-button {
            margin-left: 5px!important;
          }
        }
    }
    /deep/.el-col {
      padding: 0 1em
    }
  }
</style>

