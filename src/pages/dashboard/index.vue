<template>
  <!-- 项目来源管理 -->
  <div class="dashboard-page">
    <div style="padding:1em;margin-bottom:1em;background:#fff;position: relative">
      <el-table
        v-loading="loadings.tableLoading"
        :data="data.projects"
        size="small">
        <el-table-column label="项目名">
          <template slot-scope="{row}">{{row.name}}</template>
        </el-table-column>
        <el-table-column label="询价">
          <template slot-scope="{row}">{{row.inquiry}}</template>
        </el-table-column>
        <el-table-column label="报价">
          <template slot-scope="{row}">{{row.quote}}</template>
        </el-table-column>
        <el-table-column label="技术审核">
          <template slot-scope="{row}">{{row.techCheck}}</template>
        </el-table-column>
        <el-table-column label="商务审核">
          <template slot-scope="{row}">{{row.bussCheck}}</template>
        </el-table-column>
        <el-table-column label="最终审核">
          <template slot-scope="{row}">{{row.finCheck}}</template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>
<script>
  import request from '@/utils/request'
  import qs from 'querystring'
  import '@/styles/auto-style.css'

  export default {
    data() {
      return {
        data: {projects: {}},
        loadings: {tableLoading: false}
      }
    },
    created() {
      this.init()
    },
    methods: {
      init() {

      },
      loadProject() {
        request.get({

        })
      }
    }
  }
</script>
<style lang="scss" scoped>
  .dashboard-page {

  }
</style>
