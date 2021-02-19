<template>
  <div class="dashboard-editor-container">
    <panel-group @handleSetLineChartData="handleSetLineChartData" />

    <el-row style="background:#fff;padding:16px 16px 0;margin-bottom:32px;">
      <line-chart :chart-data="lineChartData" />
    </el-row>
    <el-row style="position: relative;width: 100%;height: 400px;padding: 1em;background: #fff">
      <el-col :sm="12" :lg="19" style="height: 100%">
        <bar-chart height="100%"/>
      </el-col>
      <el-col :sm="12" :lg="5" style="height: 100%">

      </el-col>
    </el-row>
    <div style="padding: 1em;background: #fff;">
      <a-row type="flex" justify="start" :gutter="3">
        <a-col :sm="24" :lg="12">
          <el-card>
            <div slot="header" class="index-md-title">
              <span>终审待办【{{ maxPage[0] }}】</span>
              <a v-if="dataSource1 " slot="footer" @click="goPage('终审')">前往 <a-icon type="double-right" /></a>
            </div>
            <a-table
              :dataSource="dataSource1"
              id="finalLazyLoadTable"
              :pagination="false"
              :scroll="{ y: 166 }"
              size="small"
              :rowKey="record => record.id"
            >
              <a-table-column ellipsis="true" key="proName" title="项目" data-index="proName"/>
              <a-table-column ellipsis="true" key="inquiryName" title="设备名" data-index="inquiryName"/>
              <a-table-column ellipsis="true" key="quoteSupplier" title="供应商" data-index="quoteSupplier"/>
              <a-table-column ellipsis="true" key="finallyAudit" title="状态" data-index="finallyAudit">
                <template slot-scope="finallyAudit">
                  <el-tag :type="finallyAudit == 0 ? 'info':(finallyAudit == 1? 'success':'danger')">{{ statu(finallyAudit) }}</el-tag>
                </template>
              </a-table-column>
            </a-table>
          </el-card>
        </a-col>
        <a-col :sm="24" :lg="12">
          <el-card>
            <div slot="header" class="index-md-title">
              <span>技审待办【{{ maxPage[1] }}】</span>
              <a v-if="dataSource2 " slot="footer" @click="goPage('技审')">前往 <a-icon type="double-right" /></a>
            </div>
            <a-table
              :dataSource="dataSource2"
              size="small"
              id="technicalLazyLoadTable"
              :scroll="{ y: 166 }"
              :pagination="false"
              :rowKey="record => record.id"
            >
              <a-table-column ellipsis="true" key="proName" title="项目" data-index="proName"/>
              <a-table-column ellipsis="true" key="inquiryName" title="设备名" data-index="inquiryName"/>
              <a-table-column ellipsis="true" key="quoteSupplier" title="供应商" data-index="quoteSupplier"/>
              <a-table-column ellipsis="true" key="quoteSuParams" title="实际参数" data-index="quoteSuParams"/>
              <a-table-column ellipsis="true" key="quoteSuModel" title="实际型号" data-index="quoteSuModel"/>
              <a-table-column ellipsis="true" key="technicalAudit" title="状态" data-index="technicalAudit">
                <template slot-scope="technicalAudit">
                  <el-tag :type="technicalAudit == 0 ? 'info':(technicalAudit == 1? 'success':'danger')">{{ statu(technicalAudit) }}</el-tag>
                </template>
              </a-table-column>
            </a-table>
          </el-card>
        </a-col>
        <a-col :sm="24" :lg="12">
          <el-card>
            <div slot="header" class="index-md-title">
              <span>商审待办【{{ maxPage[2] }}】</span>
              <a v-if="dataSource3 " slot="footer" @click="goPage('商审')">前往 <a-icon type="double-right" /></a>
            </div>
            <a-table
              :dataSource="dataSource3"
              size="small"
              id="businessLazyLoadTable"
              :scroll="{ y: 166 }"
              :pagination="false"
              :rowKey="record => record.id"
            >
              <a-table-column ellipsis="true" key="proName" title="项目" data-index="proName"/>
              <a-table-column ellipsis="true" key="inquiryName" title="设备名" data-index="inquiryName"/>
              <a-table-column ellipsis="true" key="quoteSupplier" title="供应商" data-index="quoteSupplier"/>
              <a-table-column ellipsis="true" key="quoteSuBrand" title="品牌" data-index="quoteSuBrand"/>
              <a-table-column ellipsis="true" key="quoteSuPrice" title="单价" data-index="quoteSuPrice"/>
              <a-table-column ellipsis="true" key="businessAudit" title="状态" data-index="businessAudit">
                <template slot-scope="businessAudit">
                  <el-tag :type="businessAudit == 0 ? 'info':(businessAudit == 1? 'success':'danger')">{{ statu(businessAudit) }}</el-tag>
                </template>
              </a-table-column>
            </a-table>
          </el-card>
        </a-col>
        <a-col :sm="24" :lg="12">
          <el-card>
            <div slot="header" class="index-md-title">
              <span>比价待办【{{ maxPage[3] }}】</span>
              <a v-if="dataSource4 " slot="footer" @click="goPage('比价')">前往 <a-icon type="double-right" /></a>
            </div>
            <a-table
              :dataSource="dataSource4"
              size="small"
              id="compareLazyLoadTable"
              :scroll="{ y: 166 }"
              :pagination="false"
              :rowKey="record => record.id"
            >
              <a-table-column ellipsis="true" key="proName" title="项目" data-index="proName"/>
              <a-table-column ellipsis="true" key="inquiryName" title="设备名" data-index="inquiryName"/>
              <a-table-column ellipsis="true" key="quoteSupplier" title="供应商" data-index="quoteSupplier"/>
              <a-table-column ellipsis="true" key="quoteSuBrand" title="品牌" data-index="quoteSuBrand"/>
              <a-table-column ellipsis="true" key="quoteSuModel" title="实际参数" data-index="quoteSuModel"/>
              <a-table-column ellipsis="true" key="quoteSuParams" title="实际型号" data-index="quoteSuParams"/>
              <a-table-column ellipsis="true" key="quoteSuPrice" title="单价" data-index="quoteSuPrice"/>
              <a-table-column ellipsis="true" key="compareAudit" title="状态" data-index="compareAudit">
                <template slot-scope="compareAudit">
                  <el-tag :type="compareAudit == 0 ? 'info':(compareAudit == 1? 'success':'danger')">{{ statu(compareAudit) }}</el-tag>
                </template>
              </a-table-column>
            </a-table>
          </el-card>
        </a-col>

      </a-row>
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
import '@/styles/auto-style.css'

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
      status: ['未审核', '通过', '拒绝'],
      lineChartData: [],
      allChartData: {
        projects: {
          actualData: []
        },
        suppliers: {
          actualData: []
        },
      },
      indexBottomTab: "1",
      dataSource1:[],
      dataSource2:[],
      dataSource3:[],
      dataSource4:[],
      hasNextPage: [false, false, false, false],
      currentPage: [1, 1, 1, 1],
      maxPage: [],
    }
  },
  created() {
    this.init()
    this.lineChartData = this.allChartData.projects
  },
  mounted() {
    var that = this
    let finalLazyLoadTable = document.querySelector('#finalLazyLoadTable .ant-table-body');
    finalLazyLoadTable.addEventListener("scroll", function (){
      that.lazyLoadListener(finalLazyLoadTable, 0)
    })

    let technicalLazyLoadTable = document.querySelector('#technicalLazyLoadTable .ant-table-body');
    technicalLazyLoadTable.addEventListener("scroll", function (){
      that.lazyLoadListener(technicalLazyLoadTable, 1)
    })

    let businessLazyLoadTable = document.querySelector('#businessLazyLoadTable .ant-table-body');
    businessLazyLoadTable.addEventListener("scroll", function (){
      that.lazyLoadListener(businessLazyLoadTable, 2)
    })

    let compareLazyLoadTable = document.querySelector('#compareLazyLoadTable .ant-table-body');
    compareLazyLoadTable.addEventListener("scroll", function (){
      that.lazyLoadListener(compareLazyLoadTable, 3)
    })
  },
  methods: {
    lazyLoadListener(table, index) {
      const scrollDistance =table.scrollHeight - table.scrollTop - table.clientHeight;
      if(scrollDistance <= 0.5) {//等于0证明已经到底，可以请求接口
        let url = '/sysIndex/findCompareAuditDeal?pageNum='
        switch (index) {
          case 0: url = '/sysIndex/findFinallyAuditDeal?pageNum='; break
          case 1: url = '/sysIndex/findTechnicalAuditDeal?pageNum='; break
          case 2: url = '/sysIndex/findBusinessAuditDeal?pageNum='; break
          case 3: url = '/sysIndex/findCompareAuditDeal?pageNum='; break
        }
        if(this.hasNextPage[index]){
          //请求接口的代码
          request.request({
            url: url+this.currentPage[index],
            method: 'get',
          }).then( response => {
            //将请求回来的数据和当前展示的数据合并在一起
            switch (index) {
              case 0: this.dataSource1 = this.dataSource1.concat(response.data.list); break
              case 1: this.dataSource2 = this.dataSource2.concat(response.data.list); break
              case 2: this.dataSource3 = this.dataSource3.concat(response.data.list); break
              case 3: this.dataSource4 = this.dataSource4.concat(response.data.list); break
            }
            this.currentPage[index] = response.data.nextPage
            this.hasNextPage[index] = response.data.hasNextPage
            this.loading = false
          }).catch(()=>{
            this.loading = false
          })
        }
      }
    },
    statu(text) {
      return this.status[parseInt(text)]
    },
    handleSetLineChartData(type) {
      this.lineChartData = this.allChartData[type]
    },
    init() {
      let year = new Date().getFullYear();
      request.get('/sysIndex/findYearPro?year='+year)
        .then(resp => {
        this.allChartData.projects.actualData = resp.data
      })
      request.get('/sysIndex/findYearSupplier?year='+year)
        .then(resp => {
          this.allChartData.suppliers.actualData = resp.data
        })
      this.loadToDoList()
    },
    goPage(page) {
      let path = ''
      switch (page) {
        case '终审': path = 'proCheck/final'; break;
        case '技审': path = 'proCheck/technology'; break;
        case '商审': path = 'proCheck/business'; break;
        case '比价': path = 'compare/list'; break;
      }
      this.$router.push(path)
    },
    loadToDoList() {
      request.get('/sysIndex/findCompareAuditDeal')
        .then(resp => {
          this.dataSource4 = resp.data.list
          this.currentPage[3] = resp.data.nextPage
          this.hasNextPage[3] = resp.data.hasNextPage
          this.maxPage[3] = resp.data.total
        })
      request.get('/sysIndex/findTechnicalAuditDeal')
        .then(resp => {
          this.dataSource2 = resp.data.list
          this.currentPage[1] = resp.data.nextPage
          this.hasNextPage[1] = resp.data.hasNextPage
          this.maxPage[1] = resp.data.total
        })
      request.get('/sysIndex/findBusinessAuditDeal')
        .then(resp => {
          this.dataSource3 = resp.data.list
          this.currentPage[2] = resp.data.nextPage
          this.hasNextPage[2] = resp.data.hasNextPage
          this.maxPage[2] = resp.data.total
        })
      request.get('/sysIndex/findFinallyAuditDeal')
        .then(resp => {
          this.dataSource1 = resp.data.list
          this.currentPage[0] = resp.data.nextPage
          this.hasNextPage[0] = resp.data.hasNextPage
          this.maxPage[0] = resp.data.total
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard-editor-container {
  padding: 0px;
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

  /deep/.el-card__header {
    background: #f0f2f5;
    padding: 14px 18px;
    .index-md-title {
      color: #1890ff;
      line-height: 27px;
      span {
        font-size: 18px;
        font-family: cursive;
      }
      a {
        font-size: 14px;
        float: right
      }
    }
  }
  /deep/.el-card__body {
    padding: 12px;
  }

  .ant-col {
    margin-bottom: 6px;
  }

  ::-webkit-scrollbar-track {
    display: none
  }
}

@media (max-width:1024px) {
  .chart-wrapper {
    padding: 8px;
  }
}
</style>
