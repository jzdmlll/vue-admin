<template>
  <!-- 设备管理 -->
  <div class="equipment-list">
    <a-layout>
      <!-- 侧边容器 -->
      <a-layout-sider
        class="left-container my-transition"
        width="460"
        :style="{ minHeight: windowHeight+'px',  marginLeft: margin+'px' }"
      >
        <div class="btns" style="padding:1em 0;margin-bottom:1em;background:#fff;position:relative;">
          <a-cascader
            v-model="searchForm.contract"
            :options="purchaseProjects"
            :load-data="loadContracts"
            change-on-select
            :show-search="{ filter }"
            placeholder="请选择合同"
          />
          <el-button type="primary" icon="el-icon-search" size="small" @click="toSearch">查询</el-button>
          <i @click="changeMargin" class="sider-btn my-transition" :class="margin==0?'el-icon-s-fold':'el-icon-s-unfold'"></i>
        </div>
        <!--      合同显示布局区域   -->
        <div style="padding: 0 0 1em 0">
          <a-row>
            <a-descriptions
              :title="contractAttribute.contractName"
              size="small"
              :column="{ xxl: 4, xl: 4, lg: 2, md: 2, sm: 1, xs: 1 }"
              bordered
            >
              <a-descriptions-item :span="2" label="付款方式">{{ contractAttribute.paymentMethod }}</a-descriptions-item>
              <a-descriptions-item :span="2" label="录入人">{{ contractAttribute.operator }}</a-descriptions-item>
              <a-descriptions-item :span="2" label="应付款">{{ contractAttribute.payable }}</a-descriptions-item>
              <a-descriptions-item :span="2" label="已付款">
                <el-tag v-if="contractAttribute.id" type="success" @click="alreadyPayMethod">￥{{ actualAccounts }}</el-tag>
              </a-descriptions-item>

              <a-descriptions-item :span="2" label="预定到货时间">{{ contractAttribute.schedulerPayTime }}</a-descriptions-item>
              <a-descriptions-item :span="2" label="预定付款时间">{{ contractAttribute.schedulerDeliveryTime }}</a-descriptions-item>

              <a-descriptions-item :span="2" label="履约金">{{ contractAttribute.performanceBound }}</a-descriptions-item>
              <a-descriptions-item :span="2" label="状态">
                <el-tag
                  v-if="contractAttribute.id"
                  :type="contractAttribute.performanceBondStatus == 0? 'warning':contractAttribute.performanceBondStatus == 1? 'success': 'danger'"
                >
                  {{ contractAttribute.performanceBondStatus == 0 ? "无保证金" : contractAttribute.performanceBondStatus == 1 ? "已支付" : "未支付" }}
                </el-tag>
              </a-descriptions-item>
              <a-descriptions-item :span="2" label="履约金支付时间">{{ contractAttribute.performanceBoundPayTime }}</a-descriptions-item>
              <a-descriptions-item :span="2" label="履约金归还时间">{{ contractAttribute.performanceBoundDeliverTime }}</a-descriptions-item>
              <a-descriptions-item :span="4" label="合同附件状态">
                <el-row :gutter="10" class="attr-row" v-if="contractAttribute.id">
                  <el-col :span="12" ><el-tag @click="subFile('供货发票', contractAttribute)">供货发票</el-tag></el-col>
                  <el-col :span="12" ><el-tag @click="subFile('付款通知单', contractAttribute)">付款通知单</el-tag></el-col>
                </el-row>
              </a-descriptions-item>
              <a-descriptions-item :span="4" :col="2" label="备注">{{ contractAttribute.remark }}</a-descriptions-item>
            </a-descriptions>
          </a-row>
        </div>
      </a-layout-sider>
      <!-- 主要内容 容器 -->
      <a-layout-content :style="margin==0?{}:{marginLeft: '24px'}" class="my-transition" style="padding-left: 1em;">
        <div style="background: #fff;padding: 0 1em" :style="{ minHeight: windowHeight+'px' }">
          <a-tabs default-active-key="1" size="large">
            <a-tab-pane key="1" tab="采购项清单">
              <a-table
                :data-source="purchaseItems"
                size="small"
                :rowKey="record => record.id"
                :loading="purchaseItemsLoading"
                :scroll="purchaseItems.length > 0 ?{ x: 1600}:{}"
              >
                <a-table-column :width="100" align="center" fixed="left" key="name" title="设备名" data-index="name" />
                <a-table-column :width="100" align="center" fixed="left" key="supplier" title="供应商" data-index="supplier" />
                <a-table-column :width="100" align="center" key="brand" title="品牌" data-index="brand" />
                <a-table-column :width="150" align="center" key="model" title="型号" data-index="model" />
                <a-table-column align="center" key="params" title="技术参数" data-index="params" />
                <a-table-column :width="70" align="center" key="price" title="单价" data-index="price" />
                <a-table-column :width="80" align="center" key="totalPrice" title="总价" >
                  <template slot-scope="text, record">
                    {{record.price&&record.number?record.price * record.number:''}}
                  </template>
                </a-table-column>
                <a-table-column :width="100" align="center" key="delivery" title="货期" data-index="delivery" />
                <a-table-column :width="100" align="center" key="warranty" title="质保期" data-index="warranty" />
                <a-table-column :width="100" align="center" key="remark" title="备注" data-index="remark" />
                <a-table-column fixed="right" :width="70" align="center" key="number" title="总数量" data-index="number" />
                <a-table-column fixed="right" :width="70" align="center" key="stockChecks" title="已签收" data-index="stockChecks" >
                  <template slot-scope="text, record">
                    <a-popover :destroyTooltipOnHide="true" title="已签收" trigger="click">
                      <template slot="content">
                        <div v-for="item in text" :key="item.id">
                          <el-tag effect="plain">{{item.checkPerson}}</el-tag>
                          <el-tag type="success" effect="plain">{{item.checkNumber}}</el-tag>
                          <el-tag effect="plain">{{dateTimeFormat(parseInt(item.checkTime))}}</el-tag>
                          <el-divider class="divider"></el-divider>
                        </div>
                      </template>
                      <el-tag style="cursor: pointer" size="small" type="success" effect="plain">{{record.checkNum}}</el-tag>
                    </a-popover>
                  </template>
                </a-table-column>
                <a-table-column fixed="right" :width="70" align="center" key="stockEntries" title="已入库" data-index="stockEntries" >
                  <template slot-scope="text, record">
                    <a-popover :destroyTooltipOnHide="true" title="已签收" trigger="click">
                      <template slot="content">
                        <div v-for="item in text" :key="item.id">
                          <el-tag effect="plain">{{item.entryPerson}}</el-tag>
                          <el-tag type="warning" effect="plain">{{item.entryNumber}}</el-tag>
                          <el-tag effect="plain">{{dateTimeFormat(parseInt(item.entryTime))}}</el-tag>
                          <el-divider class="divider"></el-divider>
                        </div>
                      </template>
                      <el-tag style="cursor: pointer" size="small" type="warning" effect="plain">{{record.entryNum}}</el-tag>
                    </a-popover>
                  </template>
                </a-table-column>
                <a-table-column fixed="right" :width="150" aligin="center" key="action" title="操作" data-index="action">
                  <template slot-scope="text, record">
                    <el-button @click="showStockDialog('签收', record)" type="primary" size="mini">签收</el-button>
                    <el-button @click="showStockDialog('入库', record)" type="warning" size="mini">入库</el-button>
                  </template>
                </a-table-column>
              </a-table>
            </a-tab-pane>
            <a-tab-pane key="2" tab="到货状态">
              <a-table></a-table>
            </a-tab-pane>
            <a-tab-pane key="3" tab="供货清单">
              <a-table></a-table>
            </a-tab-pane>
          </a-tabs>
        </div>
      </a-layout-content>
    </a-layout>
    <!-- 发票、付款通知单 2级模态框 -->
    <el-dialog v-el-drag-dialog :visible.sync="uploadModal.visible" :title="uploadModal.title" append-to-body>
      <el-form ref="uploadModalForm" :model="uploadModal.form" :rules="rules"  status-icon>
        <el-form-item v-if="contractInfoDialog.title=='供货发票'" label="编号" label-width="80px" size="small" prop="no">
          <el-input v-model="uploadModal.form.no" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item v-if="contractInfoDialog.title=='付款通知单'" label="金额" label-width="80px" size="small" prop="money">
          <el-input v-model="uploadModal.form.money" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item v-if="contractInfoDialog.title=='付款通知单'" label="付款时间" label-width="80px" size="small" prop="paymentTime">
          <el-date-picker
            v-model="uploadModal.form.paymentTime"
            value-format="timestamp"
            type="datetime"
            placeholder="选择日期时间"
            default-time="12:00:00">
          </el-date-picker>
        </el-form-item>
        <a-upload
          name="file"
          :action="fileUploadUrl"
          :file-list="fileList"
          :before-upload="beforeUpload"
          @change="uploadStatusChange"
        >
          <a-button> <a-icon type="upload" /> 点击上传 </a-button>
        </a-upload>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="uploadModal.visible = false">取 消</el-button>
        <el-button size="small" type="primary" @click="uploadModalHandle">确 定</el-button>
      </div>
    </el-dialog>
    <!--   发票、付款通知单 模态框  -->
    <el-dialog :title="contractInfoDialog.title" :visible.sync="contractInfoDialog.visible" v-el-drag-dialog>
      <div style="margin-bottom: 8px">
        <el-button @click="showUploadModal" size="small" type="primary" icon="el-icon-upload">上传</el-button>
      </div>
      <a-table
        :pagination="false"
        v-loading="contractInfoDialog.tableLoading"
        :data-source="contractInfoDialog.data"
        size="middle"
        :rowKey="(record) => record.id"
      >
        <a-table-column v-if="contractInfoDialog.title=='供货发票'" key="no" data-index="no" title="发票编号" align="center"/>
        <a-table-column v-if="contractInfoDialog.title=='付款通知单'" key="money" data-index="money" title="付款金额" align="center"/>
        <a-table-column v-if="contractInfoDialog.title=='付款通知单'" key="paymentTime" title="付款时间" data-index="paymentTime" align="center">
          <template slot-scope="text, record">
            {{dateTimeFormat(text)}}
          </template>
        </a-table-column>
        <a-table-column v-if="contractInfoDialog.title=='供货发票'" key="url" title="发票文件" align="center">
          <template slot-scope="text, record, index">
            <el-link type="primary" :href="record.image">{{record.no}}</el-link>
          </template>
        </a-table-column>
        <a-table-column key="operator" title="创建人" data-index="operator" align="center"/>
        <a-table-column key="time" title="创建时间" data-index="time" align="center">
          <template slot-scope="text, record">
            {{dateTimeFormat(text)}}
          </template>
        </a-table-column>
      </a-table>
    </el-dialog>
    <!--签收、入库模态框 begin-->
    <el-dialog v-el-drag-dialog :title="stockDialog.title" :visible.sync="stockDialog.visible">
      <el-form ref="stockDialogForm" :model="stockDialog.form" :rules="rules"  status-icon>
        <el-form-item :label="stockDialog.title+'数量'" label-width="80px" size="small" prop="number">
          <el-input-number v-model="stockDialog.form.number" :precision="2" :step="1"></el-input-number>
        </el-form-item>
        <el-form-item :label="stockDialog.title+'时间'" label-width="80px" size="small" prop="time">
          {{stockDialog.form.time}}
          <el-date-picker
            v-model="stockDialog.form.time"
            value-format="timestamp"
            type="datetime"
            placeholder="选择日期时间"
            >
          </el-date-picker>
        </el-form-item>
        <el-form-item :label="stockDialog.title+'人'" label-width="80px" size="small" prop="operator">
          <el-input v-model="stockDialog.form.operator" type="text" size="small"></el-input>
        </el-form-item>
        <el-form-item label="备注" label-width="80px" size="small" prop="remark">
          <el-input v-model="stockDialog.form.remark" type="textarea" size="small"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="stockDialog.visible = false">取 消</el-button>
        <el-button size="small" type="primary" @click="stockDialogHandle('stockDialogForm')">确 定</el-button>
      </div>
    </el-dialog>
    <!--签收入库模态框 end-->
  </div>
</template>

<script>
  import "@/styles/auto-style.css";
  import { getUser } from "@/utils/auth";
  import { getAction, postActionByJson, postActionByQueryString } from "@/api/manage";
  import { dateTimeFormat } from "@/utils/format";
  import { beforeUpload, uploadStatusChange } from '@/utils/upload'
  import elDragDialog from "@/directive/el-drag-dialog";

  export default {
    directives: { elDragDialog },

    created() {
      this.loadPurchaseProjects()
    },
    mounted() {
      var that = this;
      // <!--把window.onresize事件挂在到mounted函数上-->
      window.onresize = () => {
        return (() => {
          that.windowHeight = document.documentElement.clientHeight  - 130; // 高
        })()
      };
    },
    data() {
      const fileUploadUrl = process.env.VUE_APP_BASE_API + 'file/uploadCache'
      return {

        fileNum: 1,
        uploadKey: true,

        fileList: [],
        fileUploadUrl,

        stockDialog: {
          title: '',
          form: {},
          visible: false
        },

        uploadModal: {
          title: '上传',
          form: {},
          visible: false,
        },

        contractInfoDialog: { // 模态框
          title: null,
          visible: false,
          form: {},
          tableLoading: false,
        },

        purchaseItemsLoading: false, // 采购项清单table 加载状态
        purchaseItems: [], // 采购项清单table数据源

        contractAttribute: {contractName:''}, // 合同订单信息
        actualAccounts: 0,

        purchaseProjects: [], // 采购项目
        searchForm: {contract:[]}, // 搜索form数据源

        windowHeight: document.documentElement.clientHeight - 130, // 页面高度
        margin: 0, // left-sider 移动距离

        rules: {
          no: [
            { required: true, message: '不能为空', trigger: 'blur' }
          ],
          money: [
            { required: true, pattern: /^(\-|\+)?\d+(\.\d+)?$/, message: '格式不正确', trigger: 'blur' }
          ],
          number: [
            { required: true, pattern: /^(\-|\+)?\d+(\.\d+)?$/, message: '格式不正确', trigger: 'blur' }
          ],
          time: [
            { required: true, message: '不能为空', trigger: 'blur' }
          ],
          operator: [
            { required: true, message: '不能为空', trigger: 'blur' }
          ]
        }
      }
    },
    methods: {
      stockDialogHandle(form) {
        this.$refs[form].validate((valid) =>{
          if (valid) {
            let url = ''
            let form = {}

            if (this.stockDialog.title == '签收') {
              url = '/stock/check/sign'
              form = {
                itemId: this.stockDialog.form.itemId,
                checkNumber: this.stockDialog.form.number,
                checkTime: this.stockDialog.form.time,
                checkPerson: this.stockDialog.form.operator,
                checkRemark: this.stockDialog.form.remark,
              }
            }else {
              url = '/stock/entry/signalEntry'
              form = {
                purchaseItemId: this.stockDialog.form.itemId,
                entryNumber: this.stockDialog.form.number,
                entryTime: this.stockDialog.form.time,
                entryPerson: this.stockDialog.form.operator,
                entryRemark: this.stockDialog.form.remark,
              }
            }
            form.operator = getUser()
            postActionByQueryString(url, form)
              .then(resp => {
                this.$message({ type: 'success', message: resp.message })
                this.stockDialog.visible = false
                this.toSearch()
              })
          }else {
            console.log('error valid')
            return
          }
        })
      },
      showStockDialog(type, record) {
        this.stockDialog.title = type
        this.stockDialog.visible = true
        this.$set(this.stockDialog.form, 'number', record.number)
        this.$set(this.stockDialog.form, 'itemId', record.itemId)
      },
      showUploadModal() {
        this.uploadModal.visible = true
        this.uploadModal.title = this.contractInfoDialog.title+'上传'
      },
      uploadModalHandle(from) {
        this.$refs[addItemsForm].validate((valid) => {
          if (valid) {
            let url = ''
            let form = {}
            if (this.contractInfoDialog.title == '供货发票') {
              url = '/stock/invoice/invoiceUpload'
              form = {
                stockInvoice: this.uploadModal.form,
                files: this.fileList
              }
            }else {
              url = '/stock/actualAccount/addActualAccount'
              form = this.uploadModal.form
            }
            this.uploadModal.form.operator = getUser()
            this.uploadModal.form.contractId = this.contractAttribute.contractId
            postActionByJson(url, form).then(resp => {
              this.$message({ type:'success', message: resp.message })
              this.uploadModal.visible = false
              this.subFile(this.contractInfoDialog.title, this.contractAttribute)
            }).catch(() => {
              this.uploadModal.visible = false
            })
          }else {

          }
        })

      },
      subFile(type, record) {
        if (record.id) {
          this.contractInfoDialog.title = type
          this.contractInfoDialog.visible = true
          this.contractInfoDialog.tableLoading = true
          let url = null
          if (type == '供货发票') {
            url = '/stock/invoice/findInvoice'
          }else {
            url = '/stock/actualAccount/findByContractId'
          }
          getAction(url, { contractId: record.contractId})
            .then(resp => {
              this.contractInfoDialog.data = resp.data
              this.contractInfoDialog.tableLoading = false
            })
            .catch(() => {
              this.contractInfoDialog.tableLoading = false
            })
        }
      },
      alreadyPayMethod() {},
      /**
       * 点击查询事件
       */
      toSearch() {
        if(this.searchForm.contract&&this.searchForm.contract.length>0) {
          const contract = JSON.parse(this.searchForm.contract[1])
          this.contractAttribute = { contractName: contract.contractName }
          if (contract.id) {

            // 查询合同订单信息
            getAction('/stock/contractAttribute/findByContractId', {
              contractId: contract.id
            }).then(resp => {
              if (resp.data) {
                this.contractAttribute = resp.data
              }
              this.contractAttribute.contractName = contract.contractName
            })

            // 查询合同实付款项
            getAction('/stock/actualAccount/statisticsActualAccountByContractId', {
              contractId: contract.id
            }).then(resp => {
              this.actualAccounts = resp.data
            })
            this.purchaseItemsLoading = true
            // 查询采购项清单信息
            getAction('/stock/purchaseItemStockEntryInvoice/findPurchaseItemStockEntryInvoiceByContractId', {
              contractId: contract.id
            }).then(resp => {
              this.purchaseItems = resp.data
              this.purchaseItemsLoading = false
            }).catch(()=> {
              this.purchaseItemsLoading = false
            })
          }
          this.contractAttribute.contractName = contract.contractName
        }else {
          this.$message({ type: 'warning', message: '请选择合同' })
        }
      },
      /**
       * left-sider 收缩事件
       */
      changeMargin(){
        this.margin = this.margin == 0?-460-14:0
      },
      /**
       * 加载下拉框所有采购项目
       */
      loadPurchaseProjects() {
        getAction("/purchase/project/findAllLike")
          .then((resp) => {
            resp.data.map(item => {
              item.value = item.id
              item.label = item.projectName
              item.isLeaf = false
            })
            this.purchaseProjects = resp.data
          })
      },
      /**
       * 加载已选择所有合同
       */
      loadContracts(selectedOptions) {
        console.log(selectedOptions)
        const targetOption = selectedOptions[selectedOptions.length - 1]
        targetOption.loading = true
        if (targetOption) {
          getAction("/purchase/contract/findByProjectId", { projectId: targetOption.id })
            .then(resp => {
              resp.data.map(item => {
                item.value = JSON.stringify(item)
                item.label = item.contractName
              })
              targetOption.loading = false
              targetOption.children = resp.data
              this.purchaseProjects = [...this.purchaseProjects]
            })
        }

      },
      /**
       * 级联下拉过滤
       */
      filter(inputValue, path) {
        return path.some(option => option.label.toLowerCase().indexOf(inputValue.toLowerCase()) > -1);
      },
      dateTimeFormat,
      beforeUpload,
      uploadStatusChange
    }
  }
</script>
<!--  css -->
<style lang="scss" scoped>
.equipment-list {
  /deep/.el-divider--horizontal {
    marign: 8px 0!important;
  }
  /deep/.el-form-item__content{
    height:auto;
    line-height:32px;
    margin-left:90px!important
  }
  .left-container {
    background: #fff;
    position: relative;
    .sider-btn {
      cursor: pointer;top:18px;position: absolute;font-size: 28px;color:#73767b;
    }
    .el-icon-s-fold {
      right: 0px;
    }
    .el-icon-s-unfold {
      top: -6px;
      right: -57px;
      border: 1px dashed #d5d5d5;
      background: #fff;
    }
    .attr-row {
      .el-col {
        text-align: center;
        span {
          cursor: pointer;
        }
      }
    }
  }

}
/deep/.el-picker-panel {
  z-index: 2900!important
}
</style>

