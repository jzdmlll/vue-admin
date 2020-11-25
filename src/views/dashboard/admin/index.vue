<template>
  <div class="dashboard-editor-container">

    <panel-group @handleSetLineChartData="handleSetLineChartData" />

    <el-row style="background:#fff;padding:16px 16px 0;margin-bottom:32px;">
      <line-chart :chart-data="lineChartData" />
    </el-row>
    <div style="padding: 1em;background: #fff;">
      <a-tabs v-model="indexBottomTab" size="large" :tab-bar-style="{marginBottom: '24px', paddingLeft: '16px'}">
        <!--<div class="extra-wrapper" slot="tabBarExtraContent">
          <a-radio-group v-model="indexRegisterType" @change="changeRegisterType">
            <a-radio-button value="转移登记">转移登记</a-radio-button>
            <a-radio-button value="抵押登记">抵押登记</a-radio-button>
            <a-radio-button value="">所有</a-radio-button>
          </a-radio-group>
        </div>-->

        <!--<a-tab-pane loading="true" tab="业务流程限时监管" key="1">

          <a-table :dataSource="dataSource1" size="default" rowKey="id" :columns="columns" :pagination="ipagination1" @change="tableChange1">
            <template slot="flowRate" slot-scope="text, record, index">
              <a-progress :strokeColor="getPercentColor(record.flowRate)" :format="getPercentFormat" :percent="getFlowRateNumber(record.flowRate)" style="width:80px" />
            </template>
          </a-table>
        </a-tab-pane>

        <a-tab-pane loading="true" tab="业务节点限时监管" key="2">
          <a-table :dataSource="dataSource2" size="default" rowKey="id" :columns="columns2" :pagination="ipagination2" @change="tableChange2">
            <template slot="flowRate" slot-scope="text, record, index">
              <span style="color: red;">{{ record.flowRate }}小时</span>
            </template>
          </a-table>
        </a-tab-pane>
-->
      </a-tabs>
    </div>

    <!--<el-row :gutter="32">
      <el-col :xs="24" :sm="24" :lg="8">
        <div class="chart-wrapper">
          <raddar-chart />
        </div>
      </el-col>
      <el-col :xs="24" :sm="24" :lg="8">
        <div class="chart-wrapper">
          <pie-chart />
        </div>
      </el-col>
      <el-col :xs="24" :sm="24" :lg="8">
        <div class="chart-wrapper">
          <bar-chart />
        </div>
      </el-col>
    </el-row>-->

    <!--<el-row :gutter="8">
      <el-col :xs="{span: 24}" :sm="{span: 24}" :md="{span: 24}" :lg="{span: 12}" :xl="{span: 12}" style="padding-right:8px;margin-bottom:30px;">
        &lt;!&ndash;<transaction-table />&ndash;&gt;
      </el-col>
      <el-col :xs="{span: 24}" :sm="{span: 12}" :md="{span: 12}" :lg="{span: 6}" :xl="{span: 6}" style="margin-bottom:30px;">
        <todo-list />
      </el-col>
      <el-col :xs="{span: 24}" :sm="{span: 12}" :md="{span: 12}" :lg="{span: 6}" :xl="{span: 6}" style="margin-bottom:30px;">
        <box-card />
      </el-col>
    </el-row>-->
  </div>
</template>

<script>
import GithubCorner from '@/components/GithubCorner'
import PanelGroup from './components/PanelGroup'
import LineChart from './components/LineChart'
import RaddarChart from './components/RaddarChart'
import PieChart from './components/PieChart'
import BarChart from './components/BarChart'
import TransactionTable from './components/TransactionTable'
import TodoList from './components/TodoList'
import BoxCard from './components/BoxCard'
import request from '@/utils/request'

/*let lineChartData = {
  projects: {
    actualData: [1,2,3]
  },
  suppliers: {
    expectedData: [200, 192, 120, 144, 160, 130, 140],
    actualData: [180, 160, 151, 106, 145, 150, 130]
  },
}*/

export default {
  name: 'DashboardAdmin',
  components: {
    GithubCorner,
    PanelGroup,
    LineChart,
    RaddarChart,
    PieChart,
    BarChart,
    TransactionTable,
    TodoList,
    BoxCard
  },
  data() {
    return {
      lineChartData: [],
      allChartData: {
        projects: {
          actualData: []
        },
        suppliers: {
          actualData: []
        },
      },
      indexBottomTab: "1"
    }
  },
  created() {
    this.init()
    this.lineChartData = this.allChartData.projects
  },
  methods: {
    handleSetLineChartData(type) {
      this.lineChartData = this.allChartData[type]
    },
    init() {
      let year = new Date().getFullYear();
      request.get('/sysIndex/findYearPro?year='+year)
        .then(resp => {
        this.allChartData.projects.actualData = resp.data
        console.log(this.lineChartData)
      })
      request.get('/sysIndex/findYearSupplier?year='+year)
        .then(resp => {
          this.allChartData.suppliers.actualData = resp.data
          console.log(this.lineChartData)
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard-editor-container {
  padding: 32px;
  background-color: rgb(240, 242, 245);
  position: relative;

  .github-corner {
    position: absolute;
    top: 0px;
    border: 0;
    right: 0;
  }

  .chart-wrapper {
    background: #fff;
    padding: 16px 16px 0;
    margin-bottom: 32px;
  }
}

@media (max-width:1024px) {
  .chart-wrapper {
    padding: 8px;
  }
}
</style>
