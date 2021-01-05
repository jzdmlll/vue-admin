<template>
  <!-- 询价结果 -->
  <div class="inquiry-result">
    <div class="btns" style="padding:1em;margin-bottom:1em;background:#fff">
      <el-button v-if="selectedRowKeys.length>0"  type="primary" icon="el-icon-document" size="small" :loading="downloadLoading" @click="handleDownload">导出Excel</el-button>
      <el-button v-if="selectedRowKeys.length>0"  type="primary" size="small" @click="toPurchase">发往采购</el-button>
      <!--<el-button v-if="selectedRowKeys.length>0"  type="primary" icon="el-icon-document" size="small" @click="addContract">生成采购合同</el-button>
-->   <el-select v-model="searchForm.proDetailId" style="margin-right: 6px" filterable clearable placeholder="请选择项目" value-key="name">
        <el-option v-for="item in projects" :key="item.id" :label="item.name" :value="item.id" />
      </el-select>
      <el-button style="margin-right: 6px" type="primary" icon="el-icon-search" size="small" @click="toSearch">查询</el-button>
    </div>
    <div style="padding:1em;margin-bottom:1em;background:#fff">
      <a-table
        size="small"
        ref="purchases"
        :rowKey="record => record.quote.id"
        :pagination="false"
        :loading="loading"
        :data-source="purchases"
        :scroll="purchases.length > 0?{ x: 1500}:{}"
        :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }">
        <a-table-column :width="80" align="center" title="状态" key="inquiry.itemId" data-index="inquiry.itemId">
          <template slot-scope="text, record">
            <el-tag :type="text? 'success':'info'">{{ text?'已发采购':'未发采购' }}</el-tag>
          </template>
        </a-table-column>
        <a-table-column defaultSortOrder="ascend" :sorter="(a, b) => a.inquiry.sort-b.inquiry.sort" title="序号" key="inquiry.sort" data-index="inquiry.sort" align="center" :width="50" />
        <a-table-column :width="100" ellipsis="true" key="inquiry.name" title="名称" data-index="inquiry.name" align="center"/>
        <a-table-column
          :width="100"
          ellipsis="true"
          :sorter="(a, b) => a.quote.supplier.localeCompare(b.quote.supplier)"
          key="quote.supplier"
          title="供应商"
          data-index="quote.supplier"
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
        <a-table-column :width="100" ellipsis="true" key="quote.suBrand" title="品牌" data-index="quote.suBrand" align="center"/>
        <a-table-column :width="100" ellipsis="true" key="quote.suModel" title="规格型号" data-index="quote.suModel" align="center"/>
        <a-table-column :width="100" ellipsis="true" key="inquiry.price" title="比价报价" data-index="inquiry.price" align="center"/>
        <a-table-column :width="100" ellipsis="true" key="inquiry.finallyPrice" title="最终报价" data-index="inquiry.finallyPrice" align="center"/>
        <a-table-column :width="100" ellipsis="true" key="inquiry.correctPrice" title="修正报价" data-index="inquiry.correctPrice" align="center"/>
        <a-table-column :width="60" key="inquiry.unit" title="单位" data-index="inquiry.unit" align="center"/>
        <a-table-column :width="60" key="inquiry.number" title="数量" data-index="inquiry.number" align="center"/>
        <a-table-column :width="60" key="quote.suPrice" title="供应商单价" data-index="quote.suPrice" align="center"/>
        <a-table-column :width="100" ellipsis="true" key="inquiry.params" title="技术要求" data-index="inquiry.params" align="center"/>
        <a-table-column :width="100" ellipsis="true" key="quote.suDelivery" title="货期" data-index="quote.suDelivery" align="center"/>
        <a-table-column :width="100" ellipsis="true" key="inquiry.remark" title="备注" data-index="inquiry.remark" align="center"/>
        <a-table-column :width="120" key="action" title="操作" align="center" fixed="right">
          <template slot-scope="text, record">
           <!-- <el-button v-if="role.name == '采购员' || role.name == '管理员'" @click="editPrice('供货价', record.quote)" type="success" icon="el-icon-edit" size="mini" style="padding: 7px 10px;">供货价</el-button>
-->        <el-button @click="editPrice('报价', record.inquiry)" type="success" icon="el-icon-edit" size="mini" style="padding: 7px 10px;">报价</el-button>
          </template>
        </a-table-column>
      </a-table>
    </div>
    <!-- 模态框 -->
    <!--<el-dialog title="生成采购合同" :visible.sync="visible">
      <el-form ref="form" :model="form"  status-icon>
        &lt;!&ndash;<el-form-item label="备注" label-width="80px" size="small" prop="remark">
          <el-input type="text" v-model="form.remark"></el-input>
        </el-form-item>&ndash;&gt;
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="visible = false">取 消</el-button>
        <el-button type="primary" size="small" @click="submitHandler('form')">提 交</el-button>
      </div>
    </el-dialog>-->
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
      return {
        searchForm: {},
        purchases: [],
        loading: true,
        downloadLoading: false,
        selectedRowKeys: [],
        projects: [],
        //visible: false,
        form: {},
        role: {},

        selectSupplier: null,

        scopedSlots,
        searchText: '',
        searchedColumn: '',
        searchInput: null,
      }
    },
    created() {
      this.init()
      this.role = this.$store.getters.roles[0]
    },
    methods: {
      /*addContract() {
        this.visible = true
      },*/
      toPurchase() {
        this.$confirm('是否确定发往采购，不可撤销，请谨慎操作', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          postActionByQueryString('', { quoteIds: this.selectedRowKeys})
            .then(resp => {
              this.$message({ type: 'success', message: resp.message });
            })
        })
      },
      editPrice(type, row) {
        this.$prompt('请输入'+type, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputPattern: /^[1-9][0-9]*([\.][0-9]{1,2})?$/,
          inputErrorMessage: '格式不正确'
        }).then(({ value }) => {
          let url = { 供货价: '/inquiry/updateSupplyPrice', 报价: '/inquiry/updateCorrectPrice'}
          let params = {
            供货价: { id: row.id, suPrice: value, operator: getUser()},
            报价: { id: row.id, correctPrice: value, operator: getUser()}
          }
          postActionByQueryString(url[type], params[type])
            .then(resp => {
              this.$message({ message: resp.message, type: 'success' })
              this.toSearch()
            })
        }).catch(() => {
        });
      },
      submitHandler() {

      },
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
      formatJson(filterVal, jsonData) {
        return jsonData.map(v => filterVal.map(j => v[j]))
      },
      onSelectChange(selectedRowKeys, selectedRows) {
        if(selectedRows.length == 0) {
          this.selectSupplier = null
        }
        const rows = selectedRows.map(item => {
          /*if(this.selectSupplier == null) {
            this.selectSupplier = item.quote.supplier
          }
          if (item.quote.id && (item.quote.supplier == this.selectSupplier || !this.selectSupplier)) {
            return item.quote.id
          }*/
          return item.quote.id
        })
        this.selectedRowKeys = rows
      },
      toSearch() {
        if(this.searchForm.proDetailId) {
          request.get('/inquiry/findProPurchase?proDetailId='+this.searchForm.proDetailId)
            .then(response => {
              this.purchases = response.data
              this.loading = false
            }).catch(()=> {
              this.loading = false
            })
        }
      },
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
      async loadProjects() {
        await request.get('/project/detail/findByAll')
          .then(response => {
            this.projects = response.data
          })
      },
      onFilterDropdownVisibleChange,
      onFilter,
      handleReset,
      handleSearch,
    }
  }
</script>

<style lang="scss" scoped>
.inquiry-result {
  /deep/.el-form-item__content{
    height:auto;
    line-height:32px;
    margin-left:90px!important
  }
}
</style>
