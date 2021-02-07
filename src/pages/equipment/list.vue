<template>
  <!--     设备管理          -->
  <div class="equipment-list">
    <a-layout>
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
        <el-button  type="primary" size="small" style="
                background: #42b983;
                color: #fefefe;
                float: right;
              " @click="toSub">补充合同信息</el-button>
        <!--      合同显示布局区域   -->
        <div style="padding: 0 0 1em 0">
          <a-row>
            <a-descriptions
              :title="contract.contractName"
              size="small"
              :column="{ xxl: 4, xl: 4, lg: 2, md: 2, sm: 1, xs: 1 }"
              bordered
            >
              <a-descriptions-item :span="2" label="付款方式">{{ contract.payType }}</a-descriptions-item>
              <a-descriptions-item :span="2" label="录入人">{{ contract.operator }}</a-descriptions-item>
              <a-descriptions-item :span="2" label="应付款">{{ contract.needPay }}</a-descriptions-item>
              <a-descriptions-item :span="2" label="已付款">
                <el-tag
                  :type="contract.alreadyPayment != '' ? 'success' : 'danger'"
                  @click="alreadyPayMethod">{{ contract.alreadyPayment }}
                </el-tag>
              </a-descriptions-item>

              <a-descriptions-item :span="2" label="预定到货时间">{{ contract.schedulerPayTime }}</a-descriptions-item>
              <a-descriptions-item :span="2" label="预定付款时间">{{ contract.schedulerDeliveryTime }}</a-descriptions-item>

              <a-descriptions-item :span="2" label="履约金">{{ contract.performanceBound }}</a-descriptions-item>
              <a-descriptions-item :span="2" label="状态">
                <el-tag
                  :type="contract.performanceBondStatus == 0? 'warning':
                         contract.performanceBondStatus == 1? 'success': 'danger'"
                >
                  {{ contract.performanceBondStatus == 0 ? "无保证金" :
                     contract.performanceBondStatus == 1 ? "已支付" : "未支付" }}
                </el-tag>
              </a-descriptions-item>
              <a-descriptions-item :span="2" label="履约金支付时间">{{ contract.performanceBoundPayTime }}</a-descriptions-item>
              <a-descriptions-item :span="2" label="履约金归还时间">{{ contract.performanceBoundDeliverTime }}</a-descriptions-item>
              <a-descriptions-item :span="4" label="合同附件状态">
                <a-row>
                  <a-col :span="8"><el-tag @click="subFile('供货发票')">供货发票</el-tag></a-col>
                  <a-col :span="8"><el-tag @click="subFile('付款通知单')">付款通知单</el-tag></a-col>
                  <a-col :span="8"><el-tag @click="subFile('实际付款状态')">实际付款状态</el-tag></a-col>
                </a-row>
              </a-descriptions-item>
              <a-descriptions-item :span="4" :col="2" label="备注">{{ contract.remark }}</a-descriptions-item>
            </a-descriptions>
          </a-row>
        </div>
      </a-layout-sider>
      <a-layout-content :style="margin==0?{}:{marginLeft: '24px'}" class="my-transition" style="padding-left: 1em;">
        <div style="background: #fff;padding: 0 1em" :style="{ minHeight: windowHeight+'px' }">
          <a-tabs default-active-key="1" size="large">
            <a-tab-pane key="1" tab="采购项清单">
              <a-table></a-table>
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

        contract: {contractName:''},

        purchaseProjects: [],
        searchForm: {},

        windowHeight: document.documentElement.clientHeight - 130,
        margin: 0,
      }
    },
    methods: {
      toSub() {},
      subFile(type) {},
      alreadyPayMethod() {},
      /**
       * 点击查询事件
       */
      toSearch() {

        const contract = JSON.parse(this.searchForm.contract[1])
        // 查询合同订单信息
        if (contract.contractOrderId) {

          getAction('/equipment/equipmentOrderManagement/findEquipmentContractOrderInfoById', {
            contractOrderId: contract.contractOrderId
          }).then(resp => {
            if (resp.data.length > 0) {
              this.contract = resp.data[0]
            }else {
              this.contract.contractName = contract.contractName
            }
          })
        }
        this.contract.contractName = contract.contractName

        // 查询采购项清单信息
        getAction('/equipment/equipmentOrderManagement/findAllItemInfosByContractId', {
          contractId: contract.id
        }).then(resp => {
          
        })
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
  }
}
</style>

