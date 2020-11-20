<template>
  <!-- 项目来源管理 -->
  <div class="dashboard-page">
    <el-row class="header">
      <el-col :span="6">
        <el-card shadow="never" class="project-card">
          <div slot="header" class="card-header">
            <span>项目列表</span>
          </div>
          <el-input class="search-input" type="text" v-model="proName" @change="proChange"></el-input>
          <div class="card-body">
            <ul class="el-menu el-menu--inline">
              <li class="el-menu-item">12</li>
              <li class="el-menu-item">12</li>
              <li class="el-menu-item">12</li>
              <li class="el-menu-item">12</li>
              <li class="el-menu-item">12</li>
              <li class="el-menu-item">12</li>
              <li class="el-menu-item">12</li>
              <li class="el-menu-item">12</li>
              <li class="el-menu-item">12</li>
              <li class="el-menu-item">12</li>
              <li class="el-menu-item">12</li>
              <li class="el-menu-item">12</li>
            </ul>
          </div>
        </el-card>
      </el-col>
      <el-col :span="18">
        <el-card shadow="never" class="project-card">
          <div class="title">XXXXX项目</div>
          <el-row>
            <el-col :span="6">
              <div class="card-left" style="">
                <el-timeline>
                  <el-timeline-item
                    v-for="(activity, index) in activities"
                    :key="index"
                    :icon="activity.icon"
                    :type="activity.type"
                    :color="activity.color"
                    :size="activity.size"
                    :timestamp="activity.timestamp">
                    {{activity.content}}
                  </el-timeline-item>
                </el-timeline>
              </div>
            </el-col>
            <el-col :span="18">
              <div class="card-body" style="height: 800px">

              </div>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>
    <el-row>
      <el-col></el-col>
      <el-col></el-col>
    </el-row>
  </div>
</template>
<script>
  import request from '@/utils/request'
  import qs from 'querystring'
  import '@/styles/auto-style.css'

  export default {
    data() {
      return {
        proName: '',
        clientHeight:  document.documentElement.clientHeight,
        activities: [{
          content: '支持使用图标',
          timestamp: '2018-04-12 20:46',
          size: 'large',
          type: 'primary',
          icon: 'el-icon-more'
        }, {
          content: '支持自定义颜色',
          timestamp: '2018-04-03 20:46',
          color: '#0bbd87'
        }, {
          content: '支持自定义尺寸',
          timestamp: '2018-04-03 20:46',
          size: 'large'
        }, {
          content: '默认样式的节点',
          timestamp: '2018-04-03 20:46'
        }]
      }
    },
    created() {
    },
    methods: {
      proChange(){},
    }
  }
</script>
<style lang="scss" scoped>
  .dashboard-page {
    .search-input, .search-input /deep/.el-input__inner {
      border-radius: 36px!important;
    }
    .header {
      /deep/.el-col {
        padding: 0 0.5em;
      }
      /deep/.el-card__header {
        padding: 14px 16px;
        background: #42b983;
        color: #fff
      }
      .search-input {
        padding: 0 1em;
        width: 100%;
      }
      .title {
        font-size: 24px;
        max-height: 50vh;
        overflow-y: auto;
      }
      .card-left{
        padding: 1em 0;
        /deep/.el-timeline {
          padding-left: 1em;
        }
      }
      .card-body {
        max-height: calc(80vh - 190px - 1em);
        overflow-y: auto;
        .el-menu-item {
          height: 40px;
          line-height: 40px;
          padding: 0 6px;
        }
    }
  }
}
</style>
