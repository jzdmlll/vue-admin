<template>
  <!-- 采购计划 -->
  <div class="purchase_plan_list" ref="purchase">
    {{excelRows}}
    <div class="btns" style="padding:1em;margin-bottom:1em;background:#fff">
      <el-button v-if="selectedRowKeys.length>0" style="margin-right: 6px" type="danger" icon="el-icon-delete" size="small" @click="toDeleteItems">批量删除</el-button>
      <el-button v-if="selectedRowKeys.length>0" style="margin-right: 6px" type="primary" icon="el-icon-document" size="small" @click="handleAddInquiry">发往询价</el-button>
      <el-button style="margin-right: 6px" type="primary" size="small" @click="toAddItems">新增采购项</el-button>
      <el-button @click="clickFileInput" type="primary" size="small"><a-icon type="file-excel" style="font-size: 12px;margin-right: 5px"/>excel导入</el-button>
      <input type="file" ref="upload" accept=".xls,.xlsx" @change="readExcel" class="outputlist_upload">
      <div v-if="excelRows>0" style="display: inline-block;padding: 4px 0;font-size: 12px;color: #909399">从Excel读取到
        <span style="color: #42b983">{{excelRows}}</span>条数据
      </div>

      <el-select v-model="searchForm.purchaseProId" style="margin-right: 6px" filterable clearable placeholder="请选择采购项目" value-key="name">
        <el-option v-for="item in purchasePros" :key="item.id" :label="item.projectName" :value="item.id" />
      </el-select>
      <el-button style="margin-right: 6px" type="primary" icon="el-icon-search" size="small" @click="toSearch">查询</el-button>
    </div>
      <el-card shadow="never">
        <div slot="header" class="index-md-title">
          <span>采购计划</span>
        </div>
        <a-table
          size="small"
          ref="plans"
          :rowKey="record => record.id"
          :loading="plansLoading"
          :data-source="plans"
          :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange, getCheckboxProps: record => ({props: {disabled: record.isInquiry == 1}})}"
          :customRow="rowClick"
          :scroll="windowWidth< 870 + 34*2 && plans.length > 0 ?{ x: 900}:{}">

          <a-table-column :width="70" align="center" key="isInquiry" title="状态" data-index="isInquiry">
            <template slot-scope="text, record">
              <el-tag :type="text == 1 ? 'success':'info'">{{ text == 1 ? '已发询价':'未发询价' }}</el-tag>
            </template>
          </a-table-column>
          <a-table-column :width="60" align="center" key="serialNumber" title="序号" data-index="serialNumber" />
          <a-table-column :width="60" align="center" key="id" title="id" data-index="id" />
          <a-table-column :width="120" align="center" ellipsis="true" key="item" title="采购项" data-index="item" />
          <a-table-column :width="120" align="center" ellipsis="true" key="brand" title="品牌" data-index="brand" />
          <a-table-column :width="120" align="center" ellipsis="true" key="model" title="型号" data-index="model" />
          <a-table-column :width="120" align="center" ellipsis="true" key="params" title="技术要求" data-index="params" />
          <a-table-column :width="60" align="center" key="unit" title="单位" data-index="unit" />
          <a-table-column :width="60" align="center" key="number" title="数量" data-index="number" />
          <a-table-column :width="170" align="center" flex="right" key="action" title="操作" fixed="right">
            <template slot-scope="text, record">
              <el-button v-if="record.isInquiry == 0" @click="poolChoose(record)" type="success" icon="el-icon-star-on" size="mini" style="padding: 7px 10px;background: #faad14;border-color:#faad14">产品池</el-button>
              <el-button v-if="record.isInquiry == 0" @click="splitPurchaseItem(record)" type="success" size="mini" >拆分</el-button>
            </template>
          </a-table-column>
        </a-table>
      </el-card>
      <el-card shadow="never" style="margin-top: 1em">
        <div slot="header" class="index-md-title">
          <span>采购供应商</span>
          <span v-if="currentItem!='' && currentItem">【{{currentItem}}】</span>
        </div>
        <a-table
          size="small"
          :pagination="false"
          ref="purchaseSuppliers"
          :rowKey="record => record.id"
          :loading="purchaseSupplierLoading"
          :data-source="purchaseSuppliers"
        >
          <a-table-column title="序号">
            <template slot-scope="text, record, index">
              {{index+1}}
            </template>
          </a-table-column>
          <a-table-column key="supplier" title="供应商" data-index="supplier" />
        </a-table>
      </el-card>

    <!-- 模态框 -->
    <el-dialog v-el-drag-dialog title="选择产品池产品" class="poolDialog" :visible.sync="poolDialogVisible">
      <el-form :model="poolForm" status-icon>
        <el-row>
          <el-col :sm="24" :lg="12">
            <el-form-item label="采购项" label-width="80px" prop="item">{{poolForm.item}}</el-form-item>
          </el-col>
          <el-col :sm="24" :lg="12">
            <el-form-item label="品牌" label-width="80px" prop="brand">{{poolForm.brand}}</el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :sm="24" :lg="12">
            <el-form-item label="型号" label-width="80px" prop="model">{{poolForm.model}}</el-form-item>
          </el-col>
          <el-col :sm="24" :lg="12">
            <el-form-item label="技术要求" label-width="80px" prop="params">{{poolForm.params}}</el-form-item>
          </el-col>
        </el-row>
        <el-input type="text"
                v-model="dialogSearchForm.name"
                placeholder="设备名" size="small" style="max-width: 200px;"></el-input>
        <el-input type="text"
                v-model="dialogSearchForm.model"
                placeholder="型号" size="small" style="max-width: 200px;"></el-input>
        <el-button type="primary" size="small" @click="poolFind">查询</el-button>
      <div style="margin-top: 6px">
        <el-table :data="poolData" v-loading="poolLoading" size="small">
          <el-table-column label width="35">
            <template slot-scope="scope">
              <el-radio :label="scope.row.id" v-model="poolForm.id">&nbsp;</el-radio>
            </template>
          </el-table-column>
          <el-table-column :show-overflow-tooltip="true" prop="name" label="设备名称" />
          <el-table-column :show-overflow-tooltip="true" prop="supplier" label="供应商" />
          <el-table-column :show-overflow-tooltip="true" prop="params" label="技术参数" />
          <el-table-column :show-overflow-tooltip="true" prop="model" label="品牌型号" />
          <el-table-column :show-overflow-tooltip="true" prop="price" label="单价" />
          <el-table-column :show-overflow-tooltip="true" prop="number" label="数量" />
          <el-table-column :show-overflow-tooltip="true" prop="delivery" label="货期" />
          <el-table-column :show-overflow-tooltip="true" prop="remark" label="备注" />
        </el-table>
      </div>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="poolDialogVisible = false">取消</el-button>
        <el-button type="primary" size="small" @click="poolSubmit">提交</el-button>
      </div>
    </el-dialog>

    <!-- 新增采购项模态框 -->
    <el-dialog v-el-drag-dialog title="新增采购项" class="itemDialog" :visible.sync="itemDialogVisible">
      <el-form ref="addItemsForm" :rules="rules" :model="addItemsForm" status-icon>
        <el-row>
          <el-col :sm="24" :lg="12">
            <el-form-item label="采购序号" label-width="80px" prop="serialNumber">
              <el-input v-model="addItemsForm.serialNumber" autocomplete="off" size="small" />
            </el-form-item>
          </el-col>
          <el-col :sm="24" :lg="12">
          <el-form-item size="mini" label="设备名称" label-width="80px" prop="item">
              <el-input v-model="addItemsForm.item" autocomplete="off" size="small" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :sm="24" :lg="12">
            <el-form-item label="型号" label-width="80px" prop="model">
              <el-input v-model="addItemsForm.model" autocomplete="off" size="small" />
            </el-form-item>
          </el-col>
          <el-col :sm="24" :lg="12">
            <el-form-item label="配置需求" label-width="80px" prop="params">
              <el-input v-model="addItemsForm.params" autocomplete="off" size="small" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :sm="24" :lg="12">
            <el-form-item label="单位" label-width="80px" prop="unit">
              <el-input v-model="addItemsForm.unit" autocomplete="off" size="small" />
            </el-form-item>
          </el-col>
          <el-col :sm="24" :lg="12">
            <el-form-item label="数量" label-width="80px" prop="number">
              <el-input v-model="addItemsForm.number" autocomplete="off" size="small" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :sm="24" :lg="12">
            <el-form-item label="销售单价(元)" label-width="80px" prop="salePrice">
              <el-input v-model="addItemsForm.salePrice" autocomplete="off" size="small" />
            </el-form-item>
          </el-col>
          <el-col :sm="24" :lg="12">
            <el-form-item label="销售总价(元)" label-width="80px">
              <el-input disabled :value="parseFloat(addItemsForm.salePrice * addItemsForm.number)" autocomplete="off" size="small" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :sm="24" :lg="12">
            <el-form-item label="品牌" label-width="80px" prop="suDelivery">
              <el-input v-model="addItemsForm.brand" autocomplete="off" size="small" />
            </el-form-item>
          </el-col>
          <el-col :sm="24" :lg="12">
            <el-form-item label="要求货期" label-width="80px" prop="requiredDelivery">
              <el-input v-model="addItemsForm.requiredDelivery" autocomplete="off" size="small" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :sm="24" :lg="12">
            <el-form-item label="备注" label-width="80px" prop="suRemark">
              <el-input v-model="addItemsForm.suRemark" autocomplete="off" size="small" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="inquiryVisible = false">取消</el-button>
        <el-button type="primary" size="small" @click="addItemsSubmit('addItemsForm')">提交</el-button>
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
  import { getAction, postActionByJson, postActionByQueryString } from '@/api/manage'
  import elDragDialog from '@/directive/el-drag-dialog'

  export default {
    directives: { elDragDialog },
    data() {
      var validSerialNumber = (rule, value, callback) => {
        if (!value) {
          return callback(new Error('不能为空'));
        }
        request.get('/purchase/purchasePlan/checkSerialNumberIsExists',{
          params: { projectId: this.searchForm.purchaseProId, serialNum: value }
        })
          .then(response => {
            if (response.data > 0) {
              callback(new Error('采购项序号已存在'))
            }else {
              callback()
            }
          })
      };
      return {
        sendInquiryItem: [],
        items: {},
        outputs: [],
        excelRows: null,
        addItemsForm: {},
        itemDialogVisible: false,
        searchForm: {},

        purchasePros: [],
        plans: [],
        plansLoading: false,
        selectedRowKeys: [],
        purchaseSuppliers: [],

        purchaseSupplierLoading: false,
        currentItem: '',

        selectKey: null,
        poolData: [],

        poolLoading: false,
        dialogSearchForm: {},
        poolDialogVisible: false,
        poolForm: {},


        excelKeys: {
          序号: 'serialNumber',
          设备名称: 'item',
          型号: 'model',
          配置需求: 'params',
          单位: 'unit',
          数量: 'number',
          设备厂家: 'brand',
          货期: 'requiredDelivery',
          备注: 'remark'
        },

        rules: {
          serialNumber: [
            { validator: validSerialNumber, trigger: 'blur'}
          ],
          item: [
            { required: true, message: '不能为空', trigger: 'blur'}
          ],
          number: [
            { required: true, message: '不能为空', trigger: 'blur'}
          ],
          salePrice: [
            { required: true, message: '不能为空', trigger: 'blur'}
          ],
        },

        windowWidth: document.documentElement.clientWidth, // 屏幕实时宽度
      }
    },
    mounted() {
      var that = this;
      // <!--把window.onresize事件挂在到mounted函数上-->
      window.onresize = () => {
        return (() => {

          //window.fullWidth = document.documentElement.clientWidth;
          that.windowWidth = that.$refs.purchase.clientWidth ; // 宽
        })()
      };
    },
    created() {
      this.init()
    },
    methods: {
      splitPurchaseItem(row) {
        this.$prompt('请输入拆分数量', '拆分', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputPattern: /^[1-9][0-9]*([\.][0-9]{1,2})?$/,
          inputErrorMessage: '格式不正确'
        }).then(({ value }) => {
          if (value > row.number) {
            this.$message({message: '不能大于原始数量', type: 'warning'})
            return false
          }else {
            this.items.operator = getUser()
            this.items.id = row.id
            this.items.itemNum = value
            console.log(this.Items)
            postActionByQueryString('/purchase/purchasePlan/insertItem',this.items)
            .then(resp => {
              this.$message({message: resp.message, type: 'success'})
              this.toSearch()
            })
          }
        })
      },
      toDeleteItems() {
        this.$confirm('是否确定删除？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          postActionByQueryString('/purchase/purchasePlan/logicDeletePurchaseItems', { purchaseItemIds: this.selectedRowKeys})
            .then(resp => {
              this.$message({message: resp.message, type: 'success'})
              this.toSearch()
            })
        })
      },
      addItemsSubmit(addItemsForm){
        this.$refs[addItemsForm].validate((valid) => {
          if (valid) {
            let form = this.addItemsForm
            form.operator = getUser()
            form.projectId = this.searchForm.purchaseProId

            postActionByQueryString('/purchase/purchasePlan/addPurchaseItem', form)
              .then( resp => {
                this.$message({ message: resp.message, type: 'success' })
                this.itemDialogVisible = false
              })
          }else {
            console.log('error commit')
            return false
          }
        })
      },
      clickFileInput(){
        if (this.searchForm.purchaseProId) {
          this.$refs.upload.dispatchEvent(new MouseEvent('click'))
        }else {
          this.$message({type: 'warning', message: '请选择采购项目'})
        }
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
                let data = {}
                let keys = Object.keys(item)
                keys.map(key => {
                  data[this.excelKeys[key]] = item[key]
                })
                data.projectId = this.searchForm.purchaseProId
                data.operator = getUser()
                this.outputs.push(data);
                this.excelRows ++
              }
            })
            console.log(this.outputs)
            this.$confirm('是否确定导入？', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }).then(() => {
              postActionByJson('/purchase/purchasePlan/excelPurchaseItems', { purchaseItems: this.outputs } )
                .then(resp => {
                  this.$message({ message: resp.message, type: 'success' })
                  this.toSearch()
                })
            })
            this.excelRows = null
            this.$refs.upload.value = '';
          } catch (e) {
            console.log(e)
            return false;
          }
        };
        fileReader.readAsBinaryString(files[0]);
      },
      toAddItems(row){
        if(this.searchForm.purchaseProId) {
          this.itemDialogVisible = true
        }else {
          this.$message({message: '请选择采购项目', type: 'warning'})
        }
      },
      rowClick(row, index) {
        return {
          on: {
            click: () => {
              this.purchaseSupplierLoading = true
              getAction('/purchase/purchasePlan/findPurchasingSupplierByItemId', { id: row.id })
                .then( resp => {
                  this.purchaseSuppliers = resp.data
                  this.purchaseSupplierLoading = false
                  this.selectKey = row.id
                  this.currentItem = row.item
                })
                .catch(() => {
                  this.purchaseSupplierLoading = false
                })
            }
          }
        }
      },
      poolFind() {
        if(this.dialogSearchForm.name || this.dialogSearchForm.model){
          request.request({
            url: '/pool/fuzzyQueryByNameOrModel',
            method: 'get',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            params: {name: this.dialogSearchForm.name, model: this.dialogSearchForm.model}
          }).then(resp => {
            this.poolData = resp.data
          })
        }else {
          this.$message({ message: "请输入查询条件", type: 'warning' })
        }
      },
      poolSubmit() {

      },
      poolChoose(row) {
        this.poolDialogVisible = true
        this.poolForm = row
        this.poolForm.inquiryId = row.id
        this.loadPool(row.name)
      },
      loadPool(name) {
        this.poolLoading = true
        request.request({
          url: '/pool/findHistoryPrices',
          method: 'get',
          params: {'name': name}
        }).then(resp => {
          this.poolData = resp.data
          this.poolLoading = false
        }).catch(() => {
          this.poolLoading = false
        })
      },
      handleAddInquiry() {
        this.$confirm('是否确定发往询价，不可撤销，请谨慎操作', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          let purchaseItems = this.sendInquiryItem
          let operator = getUser()
          postActionByJson('/purchase/purchasePlan/insertInquiryInfo', {purchaseItemsList: purchaseItems, sysProDetailWithBLOBs: {operator: operator, purchaseProId: this.searchForm.purchaseProId}})
            .then(resp => {
              this.$message({ type: 'success', message: resp.message })
              this.toSearch()
            })
        })
      },
      onSelectChange(selectedRowKeys, selectedRows) {
        const rows = selectedRows.map(item => {
          if (item.id) {
            this.sendInquiryItem.push({id : item.id})
            return item.id
          }
        })
        this.selectedRowKeys = rows
      },
      init() {
        this.loadPurchasePros()
        //this.loadPlans()
      },
      loadPlans(projectId) {
        this.plansLoading = true
        /*setTimeout(()=>{
          this.plans = [
            {id: 1, name: 'xxx采购'},
            {id: 2, name: 'xxx采购'},
            {id: 3, name: 'xxx采购'},
            {id: 4, name: 'xxx采购'},
            {id: 5, name: 'xxx采购'},
          ]
          this.plansLoading = false
        },500)*/
        request.get("/purchase/purchasePlan/findItemsByProjectId?projectId="+projectId)
          .then( resp => {
            this.plans = resp.data
            this.plansLoading = false
          })
      },
      loadPurchasePros() {
        request.get('/purchase/project/findAllLike')
          .then(response => {
            this.purchasePros = response.data
          })
      },
      toSearch() {
        if(this.searchForm.purchaseProId) {
          this.loadPlans(this.searchForm.purchaseProId)
        }else {
          this.$message({message: '请选择项目', type: 'warning'})
        }
      },
    }
  }
</script>

<style lang="scss" scoped>
.purchase_plan_list {
  /deep/.el-form-item__content{
    height:auto;
    line-height:32px;
    margin-left:90px!important
  }
  .outputlist_upload {
    opacity: 0;
    width: 0;
    overflow: hidden;
  }
}
</style>
