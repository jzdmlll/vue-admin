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
                <el-tag v-if="contractAttribute.id" type="success" @click="alreadyPayMethod">{{ contractAttribute.alreadyPayment }}</el-tag>
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
                :scroll="purchaseItems.length > 0 ?{ x: 900}:{}"
              >
                <a-table-column :width="100" align="center" fixed="left" key="item" title="设备名" data-index="item" />
                <a-table-column :width="100" align="center" fixed="left" key="supplier" title="供应商" data-index="supplier" />
                <a-table-column :width="100" align="center" key="brand" title="品牌" data-index="brand" />
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

    <!--   发票、付款通知单 模态框  -->
    <el-dialog :title="contractInfoDialog.title" :visible.sync="contractInfoDialog.visible" v-el-drag-dialog>
      <a-table
        :pagination="false"
        v-loading="contractInfoDialog.tableLoading"
        :data-source="contractInfoDialog.data"
        size="middle"
        :rowKey="(record) => record.id"
      >
      </a-table>
    </el-dialog>
  </div>
</template>

<script>
  import elDragDialog from "@/directive/el-drag-dialog";
  import "@/styles/auto-style.css";
  import { getUser } from "@/utils/auth";
  import { getAction, postActionByJson, postActionByQueryString } from "@/api/manage";
  import { dateTimeFormat } from "@/utils/format";

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
      return {

        contractInfoDialog: { // 合同信息模态框
          title: '补充合同信息',
          visible: false,
          form: {}
        },

        purchaseItemsLoading: false, // 采购项清单table 加载状态
        purchaseItems: [], // 采购项清单table数据源

        contractAttribute: {contractName:''}, // 合同订单信息

        purchaseProjects: [], // 采购项目
        searchForm: {}, // 搜索form数据源

        windowHeight: document.documentElement.clientHeight - 130, // 页面高度
        margin: 0, // left-sider 移动距离

        rule: {
          /*
            projectName: [
              {required: true, message: '不能为空', trigger: 'blur'}
            ],*/
        }
      }
    },
    methods: {
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

        const contract = JSON.parse(this.searchForm.contract[1])

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
          getAction('/stock/actualAccount/findByContractId', {
            contractId: contract.id
          }).then(resp => {
            this.contractAttribute.actualAccounts = resp.data
          })

          // 查询采购项清单信息
          getAction('/purchase/contractManagement/findItemsInfoByContractId', {
            contractId: contract.id
          }).then(resp => {
            this.purchaseItems = resp.data
          })
        }
        this.contractAttribute.contractName = contract.contractName
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
    }
  }
</script>
<!--  css -->
<style lang="scss" scoped>
.equipment-list {
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
</style>

