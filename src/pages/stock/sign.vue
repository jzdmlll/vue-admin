<template>
  <!-- 设备签收确认页面 -->
  <div class="equipment-sign">
    {{searchForm}}
    <!--按钮区域 begin-->
    <div class="btns" style="padding: 1em; margin-bottom: 1em; background: #fff">
      <el-select v-model="searchForm.proId" @change="proSelectChange" placeholder="选择项目" filterable clearable>
        <el-option v-for="item in options.projects" :keys="item.id" :label="item.projectName" :value="item.id" />
      </el-select>
      <el-select v-model="searchForm.contractId" placeholder="选择合同" filterable clearable>
        <el-option v-for="item in options.contracts" :keys="item.id" :label="item.contractNo" :value="item.id"/>
      </el-select>
      <el-select v-model="searchForm.status" placeholder="签收状态" filterable clearable>
        <el-option v-for="item in ['已签收', '未签收']" :keys="item" :label="item" :value="item"/>
      </el-select>
      <el-date-picker
        style="margin-left: 8px"
        v-model="searchForm.time"
        unlink-panels
        value-format="timestamp"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
      >
      </el-date-picker>
      <el-button @click="toSearch" type="primary" icon="el-icon-search" size="small" style="margin: 4px 0 0 6px" >查询</el-button>
    </div>
    <!--按钮区域 end-->
    <!--表格卡片区域 begin-->
    <el-card shadow="never">
      <a-table
        size="small"
        :rowKey="record => record.id"
        :loading="stockChecksTable.loading"
        :data-source="stockChecksTable.data"
        :scroll="stockChecksTable.data.length > 0 ?{ x: 1000}:{}"
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
      </a-table>
    </el-card>
    <!--表格卡片区域 end-->
  </div>
</template>
<script>
  import { getUser } from "@/utils/auth";
  import { getAction, postActionByJson, postActionByQueryString } from "@/api/manage";
  import { dateTimeFormat } from "@/utils/format";
  import elDragDialog from "@/directive/el-drag-dialog";

  export default {
    directives: { elDragDialog },
    data() {
      return {
        // 按钮区域表单
        searchForm: {

        },

        options: {
          projects: [],
          contracts: [],
        },

        stockChecksTable: {
          data: [],
          loading: false,
        }
      }
    },
    created() {
      this.loadProjects()
    },
    methods: {
      // 按钮区域搜索事件
      toSearch() {},
      // 查询项目列表
      loadProjects() {
        getAction("/purchase/project/findAllLike")
          .then((resp) => {
            this.options.projects = resp.data
          })
      },
      // 查询合同列表
      loadContracts(proId) {
        getAction('/purchase/contract/findByProjectId', {
          projectId: proId
        }).then(resp => {
          this.options.contracts = resp.data
        })
      },
      // 项目下拉框 Change 事件
      proSelectChange(id) {
        this.$delete(this.searchForm,'contractId')
        this.loadContracts(id)
      },
    }
  }
</script>
<style lang="scss" scoped>
  @import "~@/styles/auto-style.css";

  .equipment-sign {

  }
</style>

