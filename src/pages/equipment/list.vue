<template>
  <!--     设备管理          -->
  <div class="equipment-list">
    <a-layout>
      <a-layout-sider
        class="left-container my-transition"
        width="500"
        :style="{ height: windowHeight+'px', marginLeft: margin+'px' }"
      >
        <div class="fix-btn" @click="changeMargin">
          <i :class="margin==0?'el-icon-s-fold':'el-icon-s-unfold'" style="font-size: 24px;line-height: 48px; color: #fff"></i>
        </div>
        <div class="btns" style="padding:1em 0;margin-bottom:1em;background:#fff">
          <a-cascader
            v-model="searchForm.id"
            :options="purchaseProjects"
            :load-data="loadContracts"
            change-on-select
            :show-search="{ filter }"
            placeholder="请选择合同"
          />
          <el-button type="primary" icon="el-icon-search" size="small">查询</el-button>
        </div>
        
      </a-layout-sider>
      <a-layout-content>

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
        purchaseProjects: [],
        searchForm: {},

        windowHeight: document.documentElement.clientHeight - 130,
        margin: 0,
      }
    },
    methods: {
      /**
       * left-sider 收缩事件
       */
      changeMargin(){
        this.margin = this.margin == 0?-500:0
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
                item.value = item.id
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
    .fix-btn {
      background: #a7b8d7;
      width: 48px;
      height: 48px;
      border-radius: 0 5px 5px 0;
      top: 50%;
      position: absolute;
      transform: translate(0, -50%);
      right: -48px;
      line-height: 48px;
      text-align: center;
      z-index: 9999;
      cursor: pointer;
    }
  }
}
</style>

