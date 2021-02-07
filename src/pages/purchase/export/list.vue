<template>
  <!-- 生成采购合同 -->
  <div class="purchase-export">
    <div class="btns" style="padding:1em;margin-bottom:1em;background:#fff">
      <el-button v-if="selectedRowKeys.length>0"  type="primary" icon="el-icon-document" size="small" :loading="downloadLoading" @click="handleDownload">导出Excel</el-button>
      <el-button v-if="selectedRowKeys.length>0"  type="primary" icon="el-icon-document" size="small" @click="addContract">生成采购合同</el-button>
      <el-select multiple v-model="searchForm.proDetailIds" style="margin-right: 6px" filterable clearable placeholder="请选择项目" value-key="name">
        <el-option v-for="item in projects" :key="item.id" :label="item.projectName" :value="item.id" />
      </el-select>
      <el-input type="text" size="small" v-model="searchForm.name"></el-input>
      <el-button style="margin-right: 6px" type="primary" icon="el-icon-search" size="small" @click="toSearch">查询</el-button>
      <el-link v-for="item in files" type="primary" :download="item.name" target="_blank" :href = "item.url">{{item.name}} | </el-link>
    </div>
    <div style="padding:1em;margin-bottom:1em;background:#fff">
      <a-table
        size="small"
        ref="purchases"
        :rowKey="record => record.id"
        :pagination="false"
        :loading="loading"
        :data-source="purchases"
        :scroll="purchases.length > 0?{ x: 1500}:{}"
        :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }">
        <a-table-column :width="80" align="center" title="状态" key="contractId" data-index="contractId">
          <template slot-scope="text, record">
            <el-tag :type="text? 'success':'info'">{{ text?'有合同':'无合同' }}</el-tag>
          </template>
        </a-table-column>
        <a-table-column defaultSortOrder="ascend" :sorter="(a, b) => a.serialNumber-b.serialNumber" title="序号" key="serialNumber" data-index="serialNumber" align="center" :width="50" />
        <a-table-column :width="100" align="center" ellipsis="true" key="purchaseProName" title="项目" data-index="purchaseProName"></a-table-column>
        <a-table-column :width="100" ellipsis="true" key="item" title="设备" data-index="item" align="center"/>
        <a-table-column
          :width="100"
          ellipsis="true"
          :sorter="(a, b) => a.purchaseSupply.supplier.localeCompare(b.purchaseSupply.supplier)"
          key="purchaseSupply.supplier"
          title="供应商"
          data-index="purchaseSupply.supplier"
          align="center"
          @filter="onFilter"
          @filterDropdownVisibleChange="onFilterDropdownVisibleChange"
          :scopedSlots="scopedSlots">
          <template slot="filterDropdown" slot-scope="{ setSelectedKeys, selectedKeys, confirm, clearFilters, column }"
                    style="padding: 8px">
            <a-input
              v-ant-ref="c => (searchInput = c)"
              :placeholder="`查找供应商`"
              :value="selectedKeys[0]"
              style="width: 188px; margin-bottom: 8px; display: block;"
              @change="e => setSelectedKeys(e.target.value ? [e.target.value] : [])"
              @pressEnter="() => handleSearch(selectedKeys, confirm, column.dataIndex)"
            />
            <el-button
              type="primary"
              icon="el-icon-search"
              size="small"
              style="width: 90px; margin-right: 8px"
              @click="() => handleSearch(selectedKeys, confirm, column.dataIndex)"
            >
              查找
            </el-button>
            <el-button size="small" style="width: 90px" @click="() => handleReset(clearFilters)">
              重置
            </el-button>
          </template>
        </a-table-column>
        <a-table-column :width="100" ellipsis="true" key="purchaseSupply.brand" title="品牌" data-index="purchaseSupply.brand" align="center"/>
        <a-table-column v-if="item.commons == false" v-for="item in currentTemplate.tableColumn" :width="item.width" ellipsis="true" :key="item.key" :title="item.title" :data-index="item.dataIndex" align="center"/>
        <a-table-column :width="70" key="purchaseSupply.price" title="单价" data-index="purchaseSupply.price" align="center"/>
        <a-table-column :width="80" key="purchaseSupply.totalPrice" title="总价" data-index="purchaseSupply.totalPrice" align="center"/>
        <a-table-column :width="50" key="unit" title="单位" data-index="unit" align="center"/>
        <a-table-column :width="70" key="number" title="数量" data-index="number" align="center"/>
        <a-table-column :width="100" ellipsis="true" key="purchaseSupply.params" title="实际参数" data-index="purchaseSupply.params" align="center"/>
        <a-table-column :width="100" ellipsis="true" key="purchaseSupply.warranty" title="货期" data-index="purchaseSupply.warranty" align="center"/>
        <a-table-column :width="100" ellipsis="true" key="purchaseSupply.remark" title="备注" data-index="purchaseSupply.remark" align="center"/>
        <a-table-column :width="120" fixed="right" key="action" title="操作" align="center">
          <template slot-scope="text, record">
            <el-button @click="editPrice(record.purchaseSupply)" type="success" icon="el-icon-edit" size="mini" style="padding: 7px 10px;">供货价</el-button>
          </template>
        </a-table-column>
      </a-table>
    </div>
    <!-- 模态框 -->
    <el-dialog v-el-drag-dialog title="生成采购合同" :visible.sync="visible">
      <el-form ref="form" :model="form" :rules="rules" status-icon>
        <el-form-item label="合同名" label-width="80px" size="small" prop="contractName">
          <el-input type="text" v-model="form.contractName"></el-input>
        </el-form-item>
        <el-form-item label="类型" label-width="80px" size="small" prop="type">
          <el-radio-group @change="radioChange" v-model="form.type">
            <el-radio :label="0">我方合同</el-radio>
            <el-radio :label="1">对方合同</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="合同编号" label-width="80px" size="small" prop="contractNo">
          <el-input type="text" v-model="form.contractNo" :suffix-icon="form.contractNoLoading==true?'el-icon-loading':''"></el-input>
        </el-form-item>
        <el-form-item label="备注" label-width="80px" size="small" prop="remark">
          <el-input type="textarea" v-model="form.remark"></el-input>
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
  import { getAction, postActionByJson, postActionByQueryString } from '@/api/manage'
  import qs from 'querystring'
  import '@/styles/auto-style.css'
  import { getUser } from '@/utils/auth'
  import XLSX from 'xlsx'
  import { onFilterDropdownVisibleChange, onFilter, handleSearch, handleReset } from '@/utils/column-search'
  import elDragDialog from '@/directive/el-drag-dialog'

  export default {
    directives: { elDragDialog },
    data() {
      const scopedSlots = {
        filterDropdown: 'filterDropdown',
        filterIcon: 'filterIcon',
        customRender: 'customRender',
      }
      var validNo = (rule, value, callback) => {
        if (!value) {
          return callback(new Error('不能为空'));
        }
        request.get('/purchase/purchaseContractGenerate/findContractNo',{
          params: { contractNo: value }
        })
          .then(response => {
            if (response.data > 0) {
              callback(new Error('合同编号已存在'))
            }else {
              callback()
            }
          })
      };
      return {
        files: [],
        currentTemplate: {},

        searchForm: { proDetailIds: [] },
        purchases: [],
        loading: true,
        downloadLoading: false,
        selectedRowKeys: [],
        projects: [],
        visible: false,
        form: { type: 0, contractNoLoading: false },
        role: {},

        selectSupplier: null,

        scopedSlots,
        searchText: '',
        searchedColumn: '',
        searchInput: null,

        rules: {
          contractNo: [
            { validator: validNo, trigger: 'blur'}
          ],
          contractName: [
            { required: true, message: '不能为空', trigger: 'blur'}
          ]
        }
      }
    },
    created() {
      this.init()
      this.role = this.$store.getters.roles[0]
    },
    methods: {
      radioChange(value) {
        this.form.contractNoLoading = true
        getAction('/purchase/contract/automaticGenerationContractNo', {})
          .then(resp => {
            this.$set(this.form, 'contractNo', resp.data)
            this.form.contractNoLoading = false
          })
          .catch(() => {
            this.form.contractNoLoading = false
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
      /**
       * 弹出生成合同模态框
       */
      addContract() {
        this.visible = true
        this.form.type = 0
      },
      /**
       * 修改供货价
       */
      editPrice(row) {
        this.$prompt('请输入供货价', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputPattern: /^[1-9][0-9]*([\.][0-9]{1,2})?$/,
          inputErrorMessage: '格式不正确'
        }).then(({ value }) => {
          row.price = value
          row.updateOperator = getUser()
          postActionByJson('/purchase/contract/updateSupplyPrice', row)
            .then(resp => {
              this.$message({ message: resp.message, type: 'success' })
              this.toSearch()
            })
        }).catch(() => {
        });
      },
      /**
       * 生成采购合同提交 事件
       */
      submitHandler(form) {
        this.$refs[form].validate((valid) => {
          if (valid) {
            let form = this.form
            form.operator = getUser()
            form.projectId = this.searchForm.proDetailId

            postActionByJson('/purchase/purchaseContractGenerate/contractGenerate', { purchaseContract: form, itemIds: this.selectedRowKeys })
              .then( resp => {
                this.$message({ message: resp.message, type: 'success' })
                this.visible = false
                this.toSearch()
              })
          }else {
            console.log('error commit')
            return false
          }
        })
      },
      /**
       * 导出excel
       */
      handleDownload() {
        if (this.selectedRowKeys.length) {
          this.downloadLoading = true
          import('@/vendor/Export2Excel').then(excel => {

            const tHeader = ['序号', '设备名称', '型号', '配置需求',  '单位', '数量', '单价', '总价', '品牌', '货期', '备注']
            const filterVal = ['sort', 'name', 'suModel', 'params', 'unit', 'number', 'price',
              'totalPrice', 'brand', 'delivery', 'remark']
            let list = []
            let sort = 0
            this.purchases.map(item=>{
              sort ++
              if(this.selectedRowKeys.includes(item.quote.id)){
                list.push({
                  sort: sort,
                  name: item.inquiry.name,
                  suModel: item.quote.suModel,
                  params: item.inquiry.params,
                  unit: item.inquiry.unit,
                  number: item.inquiry.number,
                  price: item.inquiry.finallyPrice,
                  totalPrice: item.inquiry.correctPrice * item.inquiry.number,
                  brand: item.quote.suBrand,
                  delivery: item.quote.suDelivery,
                  remark: item.inquiry.remark,
                })
              }
            })
            const data = this.formatJson(filterVal, list)
            excel.export_json_to_excel({
              header: tHeader,
              data,
              filename: this.filename
            })
            this.downloadLoading = false
            this.selectedRowKeys = []

          })
        } else {
          this.$message({
            message: 'Please select at least one item',
            type: 'warning'
          })
        }
      },
      /**
       * 格式化json 导出excel时 调用
       */
      formatJson(filterVal, jsonData) {
        return jsonData.map(v => filterVal.map(j => v[j]))
      },
      /**
       * table多选触发事件
       */
      onSelectChange(selectedRowKeys, selectedRows) {
        if(selectedRows.length == 0) {
          this.selectSupplier = null
        }
        let rows = []
        selectedRows.map(item => {

          if (!item.contractId) {
            if(this.selectSupplier == null) {
              this.selectSupplier = item.purchaseSupply.supplier
            }
            if (item.id && (item.purchaseSupply.supplier == this.selectSupplier || !this.selectSupplier)) {
              rows.push(item.id)
            }else {
              this.$message({type: 'info', message: '只能选同一个供应商'})
            }
          }else {
            this.$message({type: 'info', message: '该采购项已生成过合同'})
          }
        })
        this.selectedRowKeys = rows
      },
      /**
       * 顶部 查询按钮 点击事件
       */
      toSearch() {
        if(this.searchForm.proDetailIds) {
          this.loading = true
          //查询项目文件
          getAction('/file/findByProId',{proId : this.searchForm.proDetailId})
            .then(resp => {
              this.files = resp.data
            })
          postActionByQueryString('/purchase/generatePurchaseContract/findItemsAndSupplyByProjectId', { projectIds: this.searchForm.proDetailIds, name: this.searchForm.name})
            .then(async resp => {
              if (resp.data.length > 0) {
                await this.loadCurrentTemplate(resp.data[0].templateId)
              }
              this.purchases = resp.data
              this.loading = false
            }).catch(()=> {
              this.loading = false
            })
        }
      },
      /**
       * 页面初始化 调用
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
       * 查询所有采购项目
       */
      async loadProjects() {
        await request.get('/purchase/project/findAllLike')
          .then(response => {
            this.projects = response.data
          })
      },
      /**
       * ant table 列筛选相关方法
       */
      onFilterDropdownVisibleChange,
      onFilter,
      handleReset,
      handleSearch,
    }
  }
</script>

<style lang="scss" scoped>
  .purchase-export {
    /deep/.el-form-item__content{
      height:auto;
      line-height:32px;
      margin-left:90px!important
    }
  }
</style>
