<template>
  <!-- 采购计划 -->
  <div class="purchase_plan_list">
    <div class="btns" style="padding:1em;margin-bottom:1em;background:#fff">
      <el-button v-if="selectedRowKeys.length>0" style="margin-right: 6px" type="primary" icon="el-icon-document" size="small" @click="handleAddInquiry">发起询价</el-button>
      <el-select v-model="searchForm.purchaseProId" style="margin-right: 6px" filterable clearable placeholder="请选择采购项目" value-key="name">
        <el-option v-for="item in purchasePros" :key="item.id" :label="item.name" :value="item.id" />
      </el-select>
      <el-button style="margin-right: 6px" type="primary" icon="el-icon-search" size="small" @click="toSearch">查询</el-button>
      <el-button style="margin-right: 6px" type="primary" size="small" @click="toAddItems">新增采购项</el-button>
      <el-button @click="clickFileInput" type="primary" size="small"><a-icon type="file-excel" style="font-size: 12px;margin-right: 5px"/>excel导入</el-button>
      <input type="file" ref="upload" accept=".xls,.xlsx" @change="readExcel" class="outputlist_upload">
      <div v-if="excelRows>0" style="display: inline-block;padding: 4px 0;font-size: 12px;color: #909399">从Excel读取到
        <span style="color: #42b983">{{excelRows}}</span>条数据
      </div>
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
          :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
          :customRow="rowClick">
          <a-table-column title="序号">
            <template slot-scope="text, record, index">
              {{index+1}}
            </template>
          </a-table-column>
          <a-table-column key="name" title="设备名" data-index="name" />
          <a-table-column key="action" title="操作" fixed="right">
            <template slot-scope="text, record">
                <el-button v-if="record.isInquiry == 0" @click="poolChoose(record)" type="success" icon="el-icon-star-on" size="mini" style="padding: 7px 10px;background: #faad14;border-color:#faad14">产品池</el-button>
            </template>
          </a-table-column>
        </a-table>
      </el-card>
      <el-card shadow="never" style="margin-top: 1em">
        <div slot="header" class="index-md-title">
          <span>采购供应商</span>
        </div>
        <a-table
          size="small"
          :pagination="false"
          ref="purchaseSupplier"
          :rowKey="record => record.id"
          :loading="purchaseSupplierLoading"
          :data-source="purchaseSupplier"
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
    <el-dialog title="选择产品池产品" class="poolDialog" :visible.sync="poolDialogVisible">
      <el-input type="text"
                v-model="dialogSearchForm.name"
                placeholder="设备名" size="small" style="max-width: 200px;"></el-input>
      <el-input type="text"
                v-model="dialogSearchForm.model"
                placeholder="型号" size="small" style="max-width: 200px;"></el-input>
      <el-button type="primary" size="small" @click="poolFind">查询</el-button>
      <el-form :model="poolForm" status-icon>
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

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="poolDialogVisible = false">取消</el-button>
        <el-button type="primary" size="small" @click="poolSubmit">提交</el-button>
      </div>
    </el-dialog>

    <!-- 新增采购项模态框 -->
    <el-dialog title="新增采购项" class="itemDialog" :visible.sync="itemDialogVisible">
      <el-form :model="addItemsForm" status-icon>
        <el-row>
          <el-col :sm="24" :lg="12">
            <el-form-item label="采购序号" label-width="80px" prop="suModel">
              <el-input v-model="addItemsForm.serialNumber" autocomplete="off" size="small" />
            </el-form-item>
          </el-col>
          <el-col :sm="24" :lg="12">
          <el-form-item size="mini" label="设备名称" label-width="80px" prop="supplier">
              <el-input v-model="addItemsForm.item" autocomplete="off" size="small" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :sm="24" :lg="12">
            <el-form-item label="型号" label-width="80px" prop="suModel">
              <el-input v-model="addItemsForm.model" autocomplete="off" size="small" />
            </el-form-item>
          </el-col>
          <el-col :sm="24" :lg="12">
            <el-form-item label="配置需求" label-width="80px" prop="suBrand">
              <el-input v-model="addItemsForm.params" autocomplete="off" size="small" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :sm="24" :lg="12">
            <el-form-item label="单位" label-width="80px" prop="suParams">
              <el-input v-model="addItemsForm.unit" autocomplete="off" size="small" />
            </el-form-item>
          </el-col>
          <el-col :sm="24" :lg="12">
            <el-form-item label="数量" label-width="80px" prop="suParams">
              <el-input v-model="addItemsForm.number" autocomplete="off" size="small" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :sm="24" :lg="12">
            <el-form-item label="销售单价(元)" label-width="80px" prop="suPrice">
              <el-input v-model="addItemsForm.sale_price" autocomplete="off" size="small" />
            </el-form-item>
          </el-col>
          <el-col :sm="24" :lg="12">
            <el-form-item label="销售总价(元)" label-width="80px" prop="suTotalPrice">
              <el-input v-model="addItemsForm.sale_totalPrice" autocomplete="off" size="small" />
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
            <el-form-item label="要求货期" label-width="80px" prop="suDelivery">
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
        <el-button type="primary" size="small" @click="addItemsSubmit">提交</el-button>
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
        outputs: [],
        excelRows: {},
        addItemsForm: {},
        itemDialogVisible: false,
        searchForm: {},
        purchasePros: [],

        plans: [],
        plansLoading: true,
        selectedRowKeys: [],
        purchaseSupplier: [],
        purchaseSupplierLoading: false,

        poolData: [],
        poolLoading: true,

        dialogSearchForm: {},
        poolDialogVisible: false,
        poolForm: {}
      }
    },
    created() {
      this.init()
    },
    methods: {
      addItemsSubmit(){},
      clickFileInput(){
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
            request.request({
              url: '',
              method: 'post',
              headers: {
                'Content-Type': 'application/json'
              },
              data: JSON.stringify({items: this.outputs})

            }).then(resp => {

            })
            this.$refs.upload.value = '';
          } catch (e) {
            console.log(e)
            return false;
          }
        };
        fileReader.readAsBinaryString(files[0]);
      },
      toAddItems(row){
        this.itemDialogVisible = true
      },
      rowClick(row, index) {
        return {
          on: {
            click: () => {
              this.purchaseSupplierLoading = true
              this.purchaseSupplier = [
                {id: 1, supplier: '供应商'+(index+1),}
              ]
              this.purchaseSupplierLoading = false
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
      poolSubmit() {},
      poolChoose(row) {
        this.poolDialogVisible = true
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
      handleAddInquiry() {},
      onSelectChange(selectedRowKeys, selectedRows) {
        const rows = selectedRows.map(item => {
          if (item.id) {
            return item.id
          }
        })
        this.selectedRowKeys = rows
      },
      init() {
        this.loadPurchasePros()
        this.loadPlans()
      },
      loadPlans() {
        this.plansLoading = true
        setTimeout(()=>{
          this.plans = [
            {id: 1, name: 'xxx采购'},
            {id: 2, name: 'xxx采购'},
            {id: 3, name: 'xxx采购'},
            {id: 4, name: 'xxx采购'},
            {id: 5, name: 'xxx采购'},
          ]
          this.plansLoading = false
        },500)
      },
      loadPurchasePros() {
        this.purchasePros = [
          {id: 1, name: '项目1'},
          {id: 2, name: '项目2'},
          {id: 3, name: '项目3'},
          {id: 4, name: '项目4'},
        ]
      },
      toSearch() {
        this.loadPlans()
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
}
.outputlist_upload {
  opacity: 0;
  width: 0;
  overflow: hidden;
}
</style>
