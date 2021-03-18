<template>
  <div class="dashboard-editor-container">
    <panel-group @handleSetLineChartData="handleSetLineChartData" />

    <el-row style="background:#fff;padding:16px 16px 0;margin-bottom:32px;">
      <line-chart :chart-data="lineChartData" />
    </el-row>
    <el-row style="position: relative;width: 100%;height: 400px;padding: 1em;background: #fff">
      <el-col :sm="10" :lg="10" style="height: 100%">
        <h3 style="padding: 1em">{{barChartData.proName}}</h3>
        <bar-chart height="80%" :chart-data="barChartData"/>
      </el-col>
      <el-col :sm="14" :lg="14" style="height: 100%">
        <h3 style="padding: 1em">项目完成进度</h3>
        <a-list>
          <RecycleScroller
            v-infinite-scroll="handleInfiniteOnLoad"
            style="height: 280px;border-top: 1px solid #ebebeb;border-bottom: 1px solid #ebebeb"
            :items="projects.records"
            :item-size="60"
            key-field="id"
            :infinite-scroll-disabled="busy"
            :infinite-scroll-distance="15"
          >
            <a-list-item slot-scope="{ item }">
              <div @click="proItemClick(item)" :class="barChartData.id == item.id?'is-checked':''" class="list-item my-transition">
                <div style="height: 28px; position: relative; line-height: 28px">
                <a-tooltip :destroyTooltipOnHide="true" placement="topLeft" :title="item.name">
                  <el-tag style="top:0;position: absolute;max-width: 60%;text-overflow:ellipsis;overflow: hidden;white-space: nowrap" effect="plain">{{item.name}}</el-tag>
                </a-tooltip>
                  <a-progress
                    style="max-width: 39%; float: right; height: 28px; padding: 3.6px 0"
                    :stroke-color="{
                      from: '#108ee9',
                      to: '#87d068',
                    }"
                    :percent="item.completion"
                    status="active"
                  />
                </div>
                <el-divider />
              </div>
            </a-list-item>
          </RecycleScroller>
          <a-spin v-if="loading" class="demo-loading" />
        </a-list>
      </el-col>
    </el-row>
    <div style="padding: 1em;background: #fff;">
      <a-row type="flex" justify="start" :gutter="3">
        <a-col :sm="24" :lg="12">
          <el-card>
            <div slot="header" class="index-md-title">
              <span>终审待办【{{ maxPage[0] }}】</span>
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
              <a-table-column ellipsis="true" key="finallyAudit" title="状态" data-index="finallyAudit">
                <template slot-scope="finallyAudit">
                  <el-tag type="danger">未完成</el-tag>
                </template>
              </a-table-column>
              <a-table-column key="action" title="操作" :width="100">
                <template slot-scope="text, record">
                  <el-button @click="gotoOtherPage('/proCheck/final', record)" size="mini">前往 <a-icon type="double-right" /></el-button>
                </template>
              </a-table-column>
            </a-table>
          </el-card>
        </a-col>
        <a-col :sm="24" :lg="12">
          <el-card>
            <div slot="header" class="index-md-title">
              <span>技审待办【{{ maxPage[1] }}】</span>
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
              <a-table-column ellipsis="true" key="technicalAudit" title="状态" data-index="technicalAudit">
                <template slot-scope="technicalAudit">
                  <el-tag type="danger">未完成</el-tag>
                </template>
              </a-table-column>
              <a-table-column key="action" title="操作" :width="100">
                <template slot-scope="text, record">
                  <el-button @click="gotoOtherPage('/proCheck/technology', record)" size="mini">前往 <a-icon type="double-right" /></el-button>
                </template>
              </a-table-column>
            </a-table>
          </el-card>
        </a-col>
        <a-col :sm="24" :lg="12">
          <el-card>
            <div slot="header" class="index-md-title">
              <span>商审待办【{{ maxPage[2] }}】</span>
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
              <a-table-column ellipsis="true" key="businessAudit" title="状态" data-index="businessAudit">
                <template slot-scope="businessAudit">
                  <el-tag type="danger">未完成</el-tag>
                </template>
              </a-table-column>
              <a-table-column key="action" title="操作" :width="100">
                <template slot-scope="text, record">
                  <el-button @click="gotoOtherPage('/proCheck/business', record)" size="mini">前往 <a-icon type="double-right" /></el-button>
                </template>
              </a-table-column>
            </a-table>
          </el-card>
        </a-col>
        <a-col :sm="24" :lg="12">
          <el-card>
            <div slot="header" class="index-md-title">
              <span>比价待办【{{ maxPage[3] }}】</span>
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
              <a-table-column ellipsis="true" key="compareAudit" title="状态" data-index="compareAudit">
                <template slot-scope="compareAudit">
                  <el-tag type="danger">未完成</el-tag>
                </template>
              </a-table-column>
              <a-table-column key="action" title="操作" :width="100">
                <template slot-scope="text, record">
                  <el-button @click="gotoOtherPage('/compare/compare', record)" size="mini">前往 <a-icon type="double-right" /></el-button>
                </template>
              </a-table-column>
            </a-table>
          </el-card>
        </a-col>

      </a-row>
      <a-row>
        <a-col>
          <el-card>
            <div slot="header" class="index-md-title">
              <span>一审待办【{{ maxPage[3] }}】</span>
            </div>
            <a-table
              :dataSource="dataSourceFirst"
              size="small"
              id="compareLazyLoadTable"
              :scroll="{ y: 166 }"
              :pagination="false"
              :rowKey="record => record.id"
            >
              <a-table-column ellipsis="true" key="proName" title="项目" data-index="proName"/>
              <a-table-column ellipsis="true" key="contractNo" title="合同" data-index="contractNo"/>
              <a-table-column ellipsis="true" key="firstAudit" title="一审" data-index="firstAudit">
                <template slot-scope="text, record">
                  <el-tag v-if="text" :type="status[text]['type']">{{status[text]['text']}}</el-tag>
                  <el-tag v-else type="info">无需审核</el-tag>
                </template>
              </a-table-column>
              <a-table-column ellipsis="true" key="secondAudit" title="二审" data-index="secondAudit">
                <template slot-scope="text, record">
                  <el-tag v-if="text" :type="status[text]['type']">{{status[text]['text']}}</el-tag>
                  <el-tag v-else type="info">无需审核</el-tag>
                </template>
              </a-table-column>
              <a-table-column ellipsis="true" key="threeAudit" title="三审" data-index="threeAudit">
                <template slot-scope="text, record">
                  <el-tag v-if="text" :type="status[text]['type']">{{status[text]['text']}}</el-tag>
                  <el-tag v-else type="info">无需审核</el-tag>
                </template>
              </a-table-column>
              <a-table-column key="action" title="操作" :width="100">
                <template slot-scope="text, record">
                  <el-button @click="gotoOtherPage('/purchase/check/first', record)" size="mini">前往 <a-icon type="double-right" /></el-button>
                </template>
              </a-table-column>
            </a-table>
          </el-card>
        </a-col>
      </a-row>
      <a-row>
        <a-col>
          <el-card>
            <div slot="header" class="index-md-title">
              <span>二审待办【{{ maxPage[3] }}】</span>
            </div>
            <a-table
              :dataSource="dataSourceSecond"
              size="small"
              id="compareLazyLoadTable"
              :scroll="{ y: 166 }"
              :pagination="false"
              :rowKey="record => record.id"
            >
              <a-table-column ellipsis="true" key="proName" title="项目" data-index="proName"/>
              <a-table-column ellipsis="true" key="contractNo" title="合同" data-index="contractNo"/>
              <a-table-column ellipsis="true" key="firstAudit" title="一审" data-index="firstAudit">
                <template slot-scope="text, record">
                  <el-tag v-if="text" :type="status[text]['type']">{{status[text]['text']}}</el-tag>
                  <el-tag v-else type="info">无需审核</el-tag>
                </template>
              </a-table-column>
              <a-table-column ellipsis="true" key="secondAudit" title="二审" data-index="secondAudit">
                <template slot-scope="text, record">
                  <el-tag v-if="text" :type="status[text]['type']">{{status[text]['text']}}</el-tag>
                  <el-tag v-else type="info">无需审核</el-tag>
                </template>
              </a-table-column>
              <a-table-column ellipsis="true" key="threeAudit" title="三审" data-index="threeAudit">
                <template slot-scope="text, record">
                  <el-tag v-if="text" :type="status[text]['type']">{{status[text]['text']}}</el-tag>
                  <el-tag v-else type="info">无需审核</el-tag>
                </template>
              </a-table-column>
              <a-table-column key="action" title="操作" :width="100">
                <template slot-scope="text, record">
                  <el-button @click="gotoOtherPage('/purchase/check/second', record)" size="mini">前往 <a-icon type="double-right" /></el-button>
                </template>
              </a-table-column>
            </a-table>
          </el-card>
        </a-col>
      </a-row>
      <a-row>
        <a-col>
          <el-card>
            <div slot="header" class="index-md-title">
              <span>三审待办【{{ maxPage[3] }}】</span>
            </div>
            <a-table
              :dataSource="dataSourceThree"
              size="small"
              id="compareLazyLoadTable"
              :scroll="{ y: 166 }"
              :pagination="false"
              :rowKey="record => record.id"
            >
              <a-table-column ellipsis="true" key="proName" title="项目" data-index="proName"/>
              <a-table-column ellipsis="true" key="contractNo" title="合同" data-index="contractNo"/>
              <a-table-column ellipsis="true" key="firstAudit" title="一审" data-index="firstAudit">
                <template slot-scope="text, record">
                  <el-tag v-if="text" :type="status[text]['type']">{{status[text]['text']}}</el-tag>
                  <el-tag v-else type="info">无需审核</el-tag>
                </template>
              </a-table-column>
              <a-table-column ellipsis="true" key="secondAudit" title="二审" data-index="secondAudit">
                <template slot-scope="text, record">
                  <el-tag v-if="text" :type="status[text]['type']">{{status[text]['text']}}</el-tag>
                  <el-tag v-else type="info">无需审核</el-tag>
                </template>
              </a-table-column>
              <a-table-column ellipsis="true" key="threeAudit" title="三审" data-index="threeAudit">
                <template slot-scope="text, record">
                  <el-tag v-if="text" :type="status[text]['type']">{{status[text]['text']}}</el-tag>
                  <el-tag v-else type="info">无需审核</el-tag>
                </template>
              </a-table-column>
              <a-table-column key="action" title="操作" :width="100">
                <template slot-scope="text, record">
                  <el-button @click="gotoOtherPage('/purchase/check/third', record)" size="mini">前往 <a-icon type="double-right" /></el-button>
                </template>
              </a-table-column>
            </a-table>
          </el-card>
        </a-col>
      </a-row>
    </div>

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

import infiniteScroll from 'vue-infinite-scroll'
import { RecycleScroller } from 'vue-virtual-scroller'
import { getAction, postActionByJson, postActionByQueryString } from '@/api/manage'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';

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
  directives: { infiniteScroll },
  components: {
    GithubCorner,
    PanelGroup,
    LineChart,
    RaddarChart,
    PieChart,
    BarChart,
    TransactionTable,
    TodoList,
    BoxCard,
    RecycleScroller
  },
  data() {
    return {
      dataSourceFirst: [],
      dataSourceSecond: [],
      dataSourceThree: [],
      loading: false,
      busy: false,

      projects: { records: []},

      status: [
        { type: 'warning', text: '未审核' },
        { type: 'success', text: '通过' },
        { type: 'danger', text: '否决' },
      ],
      lineChartData: [],
      barChartData: {
        id: null,
        proName: 'xxx项目',
        xAxis: ['询价', '报价', '技审', '商审', '比价', '终审'],
        finishedData: [200, 192, 120, 144, 160, 130],
        unfinishedData: [180, 160, 151, 106, 145, 150]
      },
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
      currentPage: [1, 1, 1, 1, 1, 1, 1],
      maxPage: [],

      proCurrentPage: 1,
      proHasNextPage: true,
    }
  },
  beforeMount() {
    this.fetchData(res => {
      this.data = res.records.map((item, index) => ({ ...item, index }));
    });
  },
  created() {
    this.init()
    this.fetchData(res => {
      this.data = res.records.map((item, index) => ({ ...item, index }));
      if (this.data.length>0) {
        this.proItemClick(this.data[0])
      }
    });
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
    proItemClick(item) {
      getAction('/index/findProProcess',{
        proId: item.id
      }).then(resp => {
        //console.log(resp.data)
        let project = resp.data[0]
        this.barChartData = {
          id: item.id,
          proName: project.proName,
          xAxis: ['询价', '报价', '技审', '商审', '比价', '终审'],
          finishedData: [project['iNum'], project['qNum'], project['tNum'], project['bNum'], project['cNum'], project['fNum']],
          unfinishedData: [0, 0, project['qNum']-project['tNum'], project['qNum']-project['bNum'], project['qNum']-project['cNum'], project['qNum']-project['fNum']]
        }
      })
    },
    gotoOtherPage(url, record) {
      this.$router.push({ path: url, query: record})
    },
    fetchData(callback) {
      getAction('/sysIndex/findProAndCompletion', {
        pageNum: this.proCurrentPage
      })
        .then(resp => {
          this.$set(this.projects, 'total', resp.data.total)
          this.proCurrentPage  = resp.data.current + 1
          this.proHasNextPage = resp.data.pages > resp.data.current?true:false
          callback(resp.data)
        })
    },
    handleInfiniteOnLoad() {
      const data = this.projects.records;
      this.loading = true;
      if (this.proHasNextPage == false) {
        this.$message.warning('已到底部');
        this.busy = true;
        this.loading = false;
        return;
      }
      this.fetchData(res => {
        this.projects.records = data.concat(res.records).map((item, index) => ({ ...item, index }));
        this.loading = false;
      });
    },
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
              case 0: this.dataSource1 = this.dataSource1.concat(response.data.records); break
              case 1: this.dataSource2 = this.dataSource2.concat(response.data.records); break
              case 2: this.dataSource3 = this.dataSource3.concat(response.data.records); break
              case 3: this.dataSource4 = this.dataSource4.concat(response.data.records); break
            }
            this.currentPage[index] = response.data.current + 1
            this.hasNextPage[index] = response.data.pages > response.data.current?true:false
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
      //request.get('/index/findProProcess?proName='+)
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
          this.dataSource4 = resp.data.records
          this.currentPage[3] = resp.data.current + 1
          this.hasNextPage[3] = resp.data.pages > resp.data.current?true:false
          this.maxPage[3] = resp.data.total
        })
      request.get('/sysIndex/findTechnicalAuditDeal')
        .then(resp => {
          this.dataSource2 = resp.data.records
          this.currentPage[1] = resp.data.current + 1
          this.hasNextPage[1] = resp.data.pages > resp.data.current?true:false
          this.maxPage[1] = resp.data.total
        })
      request.get('/sysIndex/findBusinessAuditDeal')
        .then(resp => {
          this.dataSource3 = resp.data.records
          this.currentPage[2] = resp.data.current + 1
          this.hasNextPage[2] = resp.data.pages > resp.data.current?true:false
          this.maxPage[2] = resp.data.total
        })
      request.get('/sysIndex/findFinallyAuditDeal')
        .then(resp => {
          this.dataSource1 = resp.data.records
          this.currentPage[0] = resp.data.current + 1
          this.hasNextPage[0] = resp.data.pages > resp.data.current?true:false
          this.maxPage[0] = resp.data.total
        })
      request.get('/sysIndex/dataSourceFirst')
        .then(resp => {
          this.dataSourceFirst = resp.data.records
          this.currentPage[4] = resp.data.current + 1
          this.hasNextPage[4] = resp.data.pages > resp.data.current?true:false
          this.maxPage[4] = resp.data.total
        })
      request.get('/sysIndex/dataSourceSecond')
        .then(resp => {
          this.dataSourceSecond = resp.data.records
          this.currentPage[5] = resp.data.current + 1
          this.hasNextPage[5] = resp.data.pages > resp.data.current?true:false
          this.maxPage[5] = resp.data.total
        })
      request.get('/sysIndex/dataSourceThree')
        .then(resp => {
          this.dataSourceThree = resp.data.records
          this.currentPage[6] = resp.data.current + 1
          this.hasNextPage[6] = resp.data.pages > resp.data.current?true:false
          this.maxPage[6] = resp.data.total
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
  .ant-list-item {
    padding: 0;
  }
  .list-item {
    cursor: pointer;
    padding:0 8px;
    width: 100%;
    height: 60px;
    line-height: 60px;
    position: relative;
    padding: 16px 6px;
    border-radius: 2px;
  }

  .list-item:hover {
    background: #e5eff7;
  }

  .is-checked, .is-checked:hover {
    background: #44cbcde3;
  }

  /deep/.el-divider--horizontal {
    margin: 8px 0 0 0;
    bottom: 0px;
    position: absolute;
  }
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
