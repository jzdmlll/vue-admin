<template>
  <div class="supply-list">
    <div class="btns" style="padding:1em;margin-bottom:1em;background:#fff">
      <el-button type="primary" size="mini" icon="el-icon-plus" @click="addSupplier">添加</el-button>
    </div>
    <el-card shadow="never">
      <div slot="header" class="index-md-title">
        <span>供应商</span>
      </div>
      <a-table
        size="small"
        ref="suppliers"
        :rowKey="record => record.id"
        :loading="suppliersLoading"
        :data-source="suppliers"
        :scroll="suppliers.length>0?{x: 700}:{}"
      >
        <a-table-column :width="100" key="id" data-index="id" title="编号" align="center" :ellipsis="true" />
        <a-table-column
          :width="150"
          key="supplier"
          title="供应商"
          data-index="supplier"
          align="center"
          ellipsis="true"
          :sorter="(a, b) => a.supplier.localeCompare(b.supplier)"
          :scopedSlots="scopedSlots"
          @filterDropdownVisibleChange="onFilterDropdownVisibleChange"
          @filter="onFilter"
        >
          <template
            slot="filterDropdown"
            slot-scope="{ setSelectedKeys, selectedKeys, confirm, clearFilters, column }"
            style="padding: 8px">
            <a-input
              v-ant-ref="c => (searchInput = c)"
              :placeholder="`查找项目名`"
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
        <a-table-column :width="120" key="telephone" title="联系方式" data-index="telephone" :ellipsis="true" align="center" />
        <a-table-column :width="120" key="address" title="地址" data-index="address" :ellipsis="true" align="center" />
        <a-table-column :width="120" key="remark" title="备注" data-index="remark" :ellipsis="true" align="center" />
        <a-table-column :width="120" key="addOperator" title="录入人" data-index="addOperator" :ellipsis="true" align="center" />
        <a-table-column :width="120" key="addTime" title="录入时间" data-index="addTime" align="center">
          <template slot-scope="text, record">
            {{dateTimeFormat(text)}}
          </template>
        </a-table-column>
        <a-table-column :width="160" fixed="right" align="center" key="action" title="操作">
          <template slot-scope="text, record">
            <el-button @click="editTemplate(record)" type="primary" size="mini" icon="el-icon-edit"></el-button>
            <el-button @click="deleteTemplate(record)" type="danger" size="mini" icon="el-icon-delete"></el-button>
          </template>
        </a-table-column>
      </a-table>
    </el-card>

    <el-dialog v-el-drag-dialog :title="dialog.title" :visible.sync="dialog.visible">
      <el-form ref="form" :rules="rules" :model="dialog.form" status-icon>
        <el-row :gutter="10">
          <el-col :sm="24" :lg="12">
            <el-form-item label="供应商" label-width="80px" prop="supplier">
              <el-input type="text" size="small" v-model="dialog.form.supplier"/>
            </el-form-item>
          </el-col>
          <el-col :sm="24" :lg="12">
            <el-form-item label="联系方式" label-width="80px" prop="telephone">
              <el-input type="text" size="small" v-model="dialog.form.telephone"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col :sm="24" :lg="12">
            <el-form-item label="地址" label-width="80px" prop="address">
              <el-input type="text" size="small" v-model="dialog.form.address"/>
            </el-form-item>
          </el-col>
          <el-col :sm="24" :lg="12">
            <el-form-item label="备注" label-width="80px" prop="remark">
              <el-input type="text" size="small" v-model="dialog.form.remark"/>
            </el-form-item>
          </el-col>
        </el-row>

      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="dialog.visible = false">取消</el-button>
        <el-button type="primary" size="small" @click="dialogSubmit('form')">提交</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import '@/styles/auto-style.css'
  import { getUser } from '@/utils/auth'
  import { dateTimeFormat } from '@/utils/format'
  import { getAction, postActionByJson, postActionByQueryString } from '@/api/manage'
  import elDragDialog from '@/directive/el-drag-dialog'
  import { onFilterDropdownVisibleChange, onFilter, handleReset, handleSearch} from '@/utils/column-search'

  export default {
    directives: { elDragDialog },
    data() {
      const scopedSlots = {
        filterDropdown: 'filterDropdown',
        filterIcon: 'filterIcon',
        customRender: 'customRender',
      }
      return {
        suppliers: [],
        suppliersLoading: false,

        dialog: {
          title: '',
          visible: false,
          form: {
          }
        },

        rules: {
          supplier: [
            { required: true, message: '不能为空', trigger: 'blur'}
          ],
        },

        scopedSlots,
      }
    },
    created() {
      this.init()
    },
    methods: {
      init() {
        this.loadSuppliers()
      },
      loadSuppliers() {
        this.suppliersLoading = true
        getAction('/supply/supplier/findSupplierByParams')
          .then(resp => {
            this.suppliers = resp.data
          })
          .finally(()=>{
            this.suppliersLoading = false
          })
      },
      addSupplier() {
        this.dialog.title = '新增'
        this.dialog.visible = true
        this.dialog.form = {}
      },
      editTemplate(record) {
        this.dialog.title = '修改'
        this.dialog.visible = true
        this.dialog.form = record
      },
      deleteTemplate(record) {

      },
      dialogSubmit(form) {
        this.$refs[form].validate((valid) => {
          if (valid) {
            if (this.dialog.form.id) {
              this.dialog.form.updateOperator = getUser()
            }else {
              this.dialog.form.addOperator = getUser()
            }
            postActionByQueryString('/supply/supplier/saveOrUpdate', this.dialog.form)
              .then(resp => {
                this.$message({ type: 'success', message: resp.message })
                this.dialog.visible = false
                this.loadSuppliers()
              })
          }else {
            return false
          }
        })
      },
      dateTimeFormat,
      onFilterDropdownVisibleChange,
      onFilter,
      handleReset,
      handleSearch,
    }
  }
</script>

<style lang="scss" scoped>
  .supply-list {
    /deep/.el-form-item__content{
      height:auto;
      line-height:32px;
      margin-left:90px!important
    }
  }
</style>
