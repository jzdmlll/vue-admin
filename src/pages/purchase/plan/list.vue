<template>
  <!-- 采购计划 -->
  <div class="purchase_plan_list" ref="purchase">
    <div class="btns" style="padding:1em;margin-bottom:1em;background:#fff">
      <el-button v-if="selectedRowKeys.length>0" style="margin-right: 6px" type="danger" icon="el-icon-delete" size="small" @click="toDeleteItems">批量删除</el-button>
      <el-button v-if="selectedRowKeys.length>0" style="margin-right: 6px" type="primary" icon="el-icon-document" size="small" @click="handleAddInquiry">发往询价</el-button>
      <el-button style="margin-right: 6px" type="primary" size="small" @click="toAddItems">新增采购项</el-button>
      <el-button @click="importHandle" type="primary" size="small"><a-icon type="file-excel" style="font-size: 12px;margin-right: 5px"/>excel导入</el-button>
      <input type="file" ref="upload" accept=".xls,.xlsx" @change="readExcel" class="outputlist_upload">
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
          :scroll="plans.length > 0 ?{ x: 900}:{}">

          <a-table-column :width="70" align="center" key="isInquiry" title="状态" data-index="isInquiry">
            <template slot-scope="text, record">
              <el-tag :type="text == 1 ? 'success':'info'">{{ text == 1 ? '已发询价':'未发询价' }}</el-tag>
            </template>
          </a-table-column>
          <a-table-column :width="60" align="center" key="serialNumber" title="序号" data-index="serialNumber" />
          <a-table-column :width="120" align="center" ellipsis="true" key="item" title="设备名" data-index="item" />
          <a-table-column :width="120" align="center" ellipsis="true" key="brand" title="品牌" data-index="brand" />
          <a-table-column v-if="item.key != 'inquiryRemark' && item.key != 'sort' && item.key != 'name' && item.key != 'brand' && item.key != 'realBrand'"
                          v-for="item in currentTemplate.tableColumn" ellipsis="true" :width="item.width" :align="item.align" :key="item.key" :title="item.title" :dataIndex="item.dataIndex" />
          <a-table-column :width="120" align="center" ellipsis="true" key="remark" title="备注" data-index="remark" />
          <a-table-column :width="250" align="center" flex="right" key="action" title="操作" fixed="right">
            <template slot-scope="text, record">
              <el-button v-if="record.isInquiry == 0" @click="poolChoose(record)" type="success" icon="el-icon-star-on" size="mini" style="padding: 7px 10px;background: #faad14;border-color:#faad14">产品池</el-button>
              <el-button v-if="record.isInquiry == 0" @click="splitPurchaseItem(record)" type="info" size="mini" >拆分</el-button>
              <el-button @click="editPurchaseItem(record)" size="mini" type="success" >修改</el-button>
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
          :scroll="purchaseSuppliers.length > 0 ?{ x: 1200}:{}">
        >
          <a-table-column :width="60" align="center" title="序号" fixed="left">
            <template slot-scope="text, record, index">
              {{index+1}}
            </template>
          </a-table-column>
          <a-table-column :width="100" align="center" fixed="left" key="supplier" title="供应商" data-index="supplier" />
          <a-table-column :width="100" align="center" fixed="left" key="brand" title="品牌" data-index="brand" />
          <a-table-column :width="150" align="center" key="model" title="型号" data-index="model" />
          <a-table-column :width="150" align="center" key="params" title="技术参数" data-index="params" />
          <a-table-column :width="70" align="center" key="price" title="单价" data-index="price" />
          <a-table-column :width="70" align="center" key="number" title="数量" data-index="number" />
          <a-table-column :width="80" align="center" key="totalPrice" title="总价" >
            <template slot-scope="text, record">
              {{record.price&&record.number?record.price * record.number:''}}
            </template>
          </a-table-column>
          <a-table-column :width="100" align="center" key="delivery" title="货期" data-index="delivery" />
          <a-table-column :width="100" align="center" key="warranty" title="质保期" data-index="warranty" />
          <a-table-column :width="100" align="center" key="remark" title="备注" data-index="remark" />
          <a-table-column :width="100" align="center" flex="right" key="action" title="操作" fixed="right">
            <template slot-scope="text, record">
              <el-button  @click="deletePurchaseSupply(record, index)" type="danger" icon="el-icon-delete" size="mini" ></el-button>
            </template>
          </a-table-column>
        </a-table>
      </el-card>

    <!-- 模态框 -->
    <el-dialog v-el-drag-dialog title="选择产品池产品" class="poolDialog" :visible.sync="poolDialogVisible">
      <el-form :model="poolForm" status-icon>
        <el-row :gutter="10">
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
              <el-radio :label="scope.row" v-model="poolForm.supply">&nbsp;</el-radio>
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
    <el-dialog v-el-drag-dialog :title="itemDialogTitle" class="itemDialog" :visible.sync="itemDialogVisible">
      <el-form ref="addItemsForm" :rules="rules" :model="addItemsForm" status-icon>
        <el-row>
          <el-col :sm="24" :lg="12">
            <el-form-item label="采购模板" label-width="80px" prop="currentTemplate">
              <el-select v-model="addItemsForm.currentTemplate" :disabled="currentTemplate.id?true:false" style="width: 100%" size="small" placeholder="请选择模板" value-key="name" >
                <el-option v-for="item in excelTemplates" :key="item.id" :label="item.name" :value="item" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
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
              <el-input v-model="addItemsForm.remark" autocomplete="off" size="small" />
            </el-form-item>
          </el-col>
        </el-row>
        <div v-if="addItemsForm.currentTemplate&&addItemsForm.currentTemplate.tableColumn&&addItemsForm.currentTemplate.tableColumn.length>0">
          <el-divider><i class="el-icon-mobile-phone"> {{addItemsForm.currentTemplate.name}}</i></el-divider>
          <el-row v-if="index%2 == 0" v-for="(item, index) in column = addItemsForm.currentTemplate.tableColumn.filter(item => item.commons == false)" :key="item.key">
            <el-col :sm="24" :lg="12">
              <el-form-item :label="item.title" label-width="80px" :prop="item.key">
                <el-input v-model="addItemsForm[item.key]" autocomplete="off" size="small" />
              </el-form-item>
            </el-col>
            <el-col :sm="24" :lg="12">
              <el-form-item v-if="column[index+1]" :label="column[index+1].title" label-width="80px" :prop="column[index+1].key">
                <el-input v-model="addItemsForm[column[index+1].key]" autocomplete="off" size="small" />
              </el-form-item>
            </el-col>
          </el-row>
        </div>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="itemDialogVisible = false">取消</el-button>
        <el-button type="primary" size="small" @click="addItemsSubmit('addItemsForm')">提交</el-button>
      </div>
    </el-dialog>
    <el-dialog title="导入采购计划" class="importDialog" :visible.sync="importDialogVisible">
      <el-form ref="importForm" :model="importForm" status-icon>
        <div>
          <div style="margin: 8px 0 26px 0;position: relative;">
            <el-select size="small" :disabled="currentTemplate.id?true:false" v-model="importForm.template" placeholder="请选择解析模板" value-key="name" style="margin:0 0 8px 1em">
              <el-option v-for="item in excelTemplates" :key="item.id" :label="item.name" :value="item" />
            </el-select>
            <el-button @click="clickFileInput" type="primary" size="small"><a-icon type="file-excel" style="font-size: 12px;margin-right: 5px"/>excel导入</el-button>
            <input type="file" ref="upload" accept=".xls,.xlsx" @change="readExcel" class="outputlist_upload">
            <div v-if="excelRows>0" style="position: absolute;left: 0;padding: 4px 0;font-size: 12px;color: #909399">从Excel读取到
              <span style="color: #42b983">{{outputs.length}}</span>条数据
            </div>
          </div>

          <el-input
            type="textarea"
            placeholder="点击上方按钮导入或者复制excel中数据来粘贴"
            :autosize="{ minRows: 4, maxRows: 12}"
            >
          </el-input>
        </div>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="importDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" size="small" @click="importHandler('importForm')">提交</el-button>
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
            if (response.data > 0 && value != this.nokey) {
              callback(new Error('采购项序号已存在'))
            }else {
              callback()
            }
          })
      };
      var validTemplate = (rule, value, callback) => {
        if (!value.id) {
          return callback(new Error('不能为空'));
        }else {
          callback()
        }
      };
      return {
        submitLoading: false,
        importForm: {template: {}},
        importDialogVisible: false,

        excelTemplates: [],
        currentTemplate: {},

        outputs: [],
        excelRows: null,
        addItemsForm: {currentTemplate:{}},
        itemDialogVisible: false,
        itemDialogTitle: '',
        searchForm: {},
        purchasePros: [],

        plans: [],
        plansLoading: false,
        selectedRowKeys: [],
        purchaseSuppliers: [],
        purchaseSupplierLoading: false,

        currentItem: '',
        selectKey: null,

        noKey: null,

        poolData: [],
        poolLoading: false,

        dialogSearchForm: {},
        poolDialogVisible: false,
        poolForm: {},
        sendInquiryItem: [],
        /*excelKeys: {
          序号: 'serialNumber',
          设备名称: 'item',
          型号: 'model',
          配置需求: 'params',
          单位: 'unit',
          数量: 'number',
          设备厂家: 'brand',
          货期: 'requiredDelivery',
          备注: 'remark'
        },*/

        rules: {
          currentTemplate: [
            { validator: validTemplate, trigger: 'blur'}
          ],
          serialNumber: [
            { validator: validSerialNumber, trigger: 'blur'}
          ],
          item: [
            { required: true, message: '不能为空', trigger: 'blur'}
          ],
          number: [
            { required: true, message: '不能为空', trigger: 'blur'}
          ],
          /*salePrice: [
            { required: true, message: '不能为空', trigger: 'blur'}
          ],*/
        },

        //windowWidth: document.documentElement.clientWidth, // 屏幕实时宽度
      }
    },
    mounted() {
      /*var that = this;
      // <!--把window.onresize事件挂在到mounted函数上-->
      window.onresize = () => {
        return (() => {

          //window.fullWidth = document.documentElement.clientWidth;
          that.windowWidth = that.$refs.purchase.clientWidth ; // 宽
        })()
      };*/
    },
    created() {
      this.init()
    },
    methods: {
      importHandler() {
        if (this.outputs.length > 0) {
          postActionByJson('/purchase/purchasePlan/excelPurchaseItems', { purchaseItems: this.outputs})
            .then(resp => {
              this.$message({ type: 'success', message: resp.message})
              this.importDialogVisible = false
              this.toSearch()
            })
            .catch(() => {

            })
        }else {

        }
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
              this.plansLoading = false
            })
        }
      },
      importHandle() {
        if (this.searchForm.purchaseProId) {
          this.importForm.template = this.currentTemplate
          this.importDialogVisible = true
        }else {
          this.$message({type: 'warning', message: '请选择采购项目'})
        }
      },
      loadTemplates() {
        getAction('/inquiry/template/findInquiryTemplate')
          .then(resp => {
            resp.data.map(item=> {
              item.tableColumn = JSON.parse(item.tableColumn)
              item.jsonKeys = JSON.parse(item.jsonKeys)
            })
            this.excelTemplates = resp.data

          })
      },
      deletePurchaseSupply(row, index) {
        this.$confirm('是否确定删除？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          let form = {}
          form.id = row.id
          form.itemId = row.itemId
          form.operator = getUser()
          postActionByQueryString("/purchase/purchasePlan/deletePurchaseSupply", form)
            .then(resp => {
              this.$message({message: resp.message, type: 'success'})
              this.toSearchSupply(row)
            })
        })
      },
      splitPurchaseItem(row) {
        this.$prompt('请输入拆分数量', '采购项拆分', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputPattern: /^[1-9][0-9]*([\.][0-9]{1,2})?$/,
          inputErrorMessage: '格式不正确'
        }).then(({ value }) => {
          alert(row.number)
          if (value > row.number) {
            this.$message({message: '不能大于原始数量【'+row.number+'】', type: 'warning'})
            return false
          }else {
            let form = {}
            form = row
            form.operator = getUser()

            form.itemNum = value
            postActionByQueryString('/purchase/purchasePlan/insertItem', form)
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
            if (form.salePrice&&form.number) {
              form.saleTotalPrice = parseFloat(form.salePrice * form.number)
            }
            form.templateId = form.currentTemplate.id
            let url = ''
            if (form.id) {
              url = '/purchase/purchasePlan/updatePurchaseItem'
            }else {
              url = '/purchase/purchasePlan/addPurchaseItem'
            }
            postActionByQueryString(url, form)
              .then( resp => {
                this.$message({ message: resp.message, type: 'success' })
                this.itemDialogVisible = false
                this.toSearch()
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

            let parent = {}
            let children = []
            let userId = getUser()
            this.importForm.template.purchaseKeys = JSON.parse(this.importForm.template.purchaseKeys)
            ws.map(item => {
              if(this.importForm.template.tree == 0) {
                var num = Object.keys(item).length;
                if( num>2 && item['序号']){
                  let keyArray = Object.keys(item)
                  let inquiry = {}
                  keyArray.map(key => {
                    if (this.importForm.template.purchaseKeys[key] != undefined)
                      inquiry[this.importForm.template.purchaseKeys[key]] = item[key]
                  })
                  inquiry['projectId'] = this.searchForm.purchaseProId
                  inquiry['operator'] = userId
                  inquiry['templateId'] = this.importForm.template.id
                  this.outputs.push(inquiry);
                }
              }else {
                let no = item['序号']+''

                if(!no.includes('.') && Object.keys(item).length <= 2) {
                  if (parent['name']) {
                    parent['children'] = children
                    parent['projectId'] = this.searchForm.purchaseProId
                    this.outputs.push(parent)
                    parent = {}
                    children = []
                  }

                  parent['sort'] = no
                  var keys = Object.keys(item)
                  parent['name'] = item[keys[1]]

                }else {
                  let keyArray = Object.keys(item)
                  let inquiry = {}
                  keyArray.map(key => {
                    if (this.importForm.template.purchaseKeys[key] != undefined)
                      inquiry[this.importForm.template.purchaseKeys[key]] = item[key]
                  })
                  inquiry['projectId'] = this.searchForm.purchaseProId
                  inquiry['operator'] = userId
                  inquiry['templateId'] = this.importForm.template.id
                  children.push(inquiry)
                }
              }
              this.excelRows ++
            })
            if(this.importForm.template.tree == 1) {
              parent['children'] = children
              parent['projectId'] = this.searchForm.purchaseProId
              this.outputs.push(parent)
            }
            console.log(this.outputs)
            this.$refs.upload.value = '';
          } catch (e) {
            console.log(e)
            return false;
          }
        };
        fileReader.readAsBinaryString(files[0]);
      },
      editPurchaseItem(row, index){
        this.itemDialogTitle = '修改采购项'
        this.addItemsForm = row
        this.nokey = row.serialNumber
        if (this.currentTemplate.id) {
          this.addItemsForm.currentTemplate = this.currentTemplate

        }else {
          this.$message({type: 'warning', message: '该采购计划未设置模板'})
        }
        this.itemDialogVisible = true
      },
      toAddItems(row){
        this.itemDialogTitle = '新增采购项'
        this.nokey = ''
        if(this.searchForm.purchaseProId) {
          if (this.currentTemplate) {
            this.addItemsForm.currentTemplate = this.currentTemplate
          }else {
            this.excelTemplates.map(item => {
              if (item.name == '一般模板') {
                this.addItemsForm.currentTemplate = item
              }
            })
          }
          this.itemDialogVisible = true

        }else {
          this.$message({message: '请选择采购项目', type: 'warning'})
        }
      },
      rowClick(row, index) {
        return {
          on: {
            click: () => {
              this.toSearchSupply(row)
            }
          }
        }
      },
      toSearchSupply(row) {
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
        if (this.poolForm.supply) {
          let form = {}
          form.supplier = this.poolForm.supply.supplier
          form.itemId = this.poolForm.id
          form.model = this.poolForm.supply.model
          form.brand = this.poolForm.supply.brand
          form.params = this.poolForm.supply.params
          form.price = this.poolForm.supply.price
          form.delivery = this.poolForm.supply.delivery
          form.number = this.poolForm.number
          form.totalPrice = this.poolForm.price * this.poolForm.number
          form.warranty = this.poolForm.supply.warranty
          form.operator = getUser()
          postActionByQueryString("/purchase/purchasePlan/insertSupplyByItem", form)
            .then( resp => {
              this.$message({ type: 'success', message: resp.message })
              this.poolDialogVisible = false
            })
        }else {
          return false
        }
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
        this.loadTemplates()
        //this.loadPlans()
      },
      loadPlans(projectId) {
        this.currentTemplate = {}
        this.plansLoading = true
        getAction('/purchase/purchasePlan/findItemsByProjectId', { projectId: projectId })
          .then(async resp => {
            if (resp.data.length > 0) {
              await this.loadCurrentTemplate(resp.data[0].templateId)
            }
            this.plans = resp.data
            this.plansLoading = false
          })
          .catch(()=>{
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
          this.purchaseSuppliers = []
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
  /deep/.el-dialog {
    .el-col {
      padding: 0 4px
    }
  }
}
</style>
