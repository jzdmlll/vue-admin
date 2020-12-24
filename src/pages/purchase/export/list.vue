<template>
  <!-- 生成采购合同 -->
  <div class="purchase_export_list">
    <div class="btns" style="padding:1em;margin-bottom:1em;background:#fff">
      <el-button v-if="selectedRowKeys.length>0" style="margin-right: 6px" type="primary" icon="el-icon-document" size="small" :loading="downloadLoading" @click="handleDownload">生成采购合同</el-button>
     <!-- <el-tooltip class="item" v-if="selectedId.length > 0" effect="dark" content="批量删除" placement="bottom-start">
        <el-button type="danger" size="small" icon="el-icon-delete" @click="batchDelete">批量删除</el-button>
      </el-tooltip>-->
      <el-select v-model="searchForm.proDetailId" style="margin-right: 6px" filterable clearable placeholder="请选择项目" value-key="name">
        <el-option v-for="item in projects" :key="item.id" :label="item.name" :value="item.id" />
      </el-select>
      <el-button style="margin-right: 6px" type="primary" icon="el-icon-search" size="small" @click="toSearch">查询</el-button>
    </div>
    <div style="padding:1em;margin-bottom:1em;background:#fff">
      <a-table
        size="small"
        ref="purchases"
        :rowKey="record => record.quote.id"
        :loading="loading"
        :data-source="purchases"
        :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }">
        <a-table-column title="序号">
          <template slot-scope="text, record, index">
            {{index+1}}
          </template>
        </a-table-column>
        <a-table-column key="quote.supplier" title="供应商" data-index="quote.supplier" />
        <a-table-column key="quote.suBrand" title="品牌" data-index="quote.suBrand" />
        <a-table-column key="quote.suModel" title="规格型号" data-index="quote.suModel" />
        <a-table-column key="inquiry.name" title="名称" data-index="inquiry.name" />
        <a-table-column key="inquiry.unit" title="单位" data-index="inquiry.unit" />
        <a-table-column key="inquiry.number" title="数量" data-index="inquiry.number" />
        <a-table-column key="inquiry.price" title="单价" data-index="inquiry.price" />
        <a-table-column key="inquiry.totalPrice" title="总价" data-index="inquiry.totalPrice" />
        <a-table-column key="inquiry.params" title="技术要求" data-index="inquiry.params" />
        <a-table-column key="quote.suDelivery" title="货期" data-index="inquiry.suDelivery" />
        <a-table-column key="inquiry.remark" title="备注" data-index="inquiry.remark" />
        <!--<a-table-column key="action" title="操作">
          <template slot-scope="text, record">
            <el-tooltip class="item" effect="dark" content="选择历史产品" placement="bottom-start">
              <el-button type="success" icon="el-icon-star-on" size="mini" style="padding: 7px 10px;background: #faad14;border-color:#faad14">产品池选择</el-button>
            </el-tooltip>
          </template>
        </a-table-column>-->
      </a-table>
    </div>
    <!-- 模态框 -->
    <el-dialog title="生成采购合同" :visible.sync="visible">
      <el-form ref="form" :model="form"  status-icon>
        <!--<el-form-item label="备注" label-width="80px" size="small" prop="remark">
          <el-input type="text" v-model="form.remark"></el-input>
        </el-form-item>-->
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
  import qs from 'querystring'
  import '@/styles/auto-style.css'
  import { getUser } from '@/utils/auth'
  import XLSX from 'xlsx'

  export default {
    data() {
      return {
        searchForm: {},
        purchases: [],
        loading: true,
        downloadLoading: false,
        selectedRowKeys: [],
        projects: [],
        visible: false,
        form: {},
      }
    },
    created() {
      this.init()
    },
    methods: {
      submitHandler() {

      },
      handleDownload() {
        if (this.selectedRowKeys.length) {
          this.visible = true
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
        const rows = selectedRows.map(item => {
          if (item.quote.id) {
            return item.quote.id
          }
        })
        this.selectedRowKeys = rows
      },
      toSearch() {
        if(this.searchForm.proDetailId) {
          request.get('/proPurchase/findProPurchase?proDetailId='+this.searchForm.proDetailId)
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
      }
    }
  }
</script>

<style lang="scss" scoped>
.purchase_export_list {
  /deep/.el-form-item__content{
    height:auto;
    line-height:32px;
    margin-left:90px!important
  }
}
</style>
