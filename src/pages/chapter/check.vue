<template>
  <!--用章审核-->
  <div class="chapter-check">
    <el-card shadow="never" style="margin-top: 1em">
      <div slot="header" class="index-md-title">
        <el-input v-model="searchForm.proName" placeholder="请输入工程名" style="width:200px;"></el-input>
        <el-select v-model="searchForm.auditStatus">
          <el-option value="0" label="审核中"/>
          <el-option value="1" label="审核通过"/>
          <el-option value="2" label="审核否决"/>
        </el-select>
        <el-date-picker
          v-model="searchForm.time"
          unlink-panels
          value-format="timestamp"
          type="daterange"
          range-separator="至"
          width="300px;"
          start-placeholder="开始日期"
          end-placeholder="结束日期">
        </el-date-picker>
        <el-button style="margin-right: 6px" type="primary" icon="el-icon-search" size="small" @click="toSearch">查询</el-button>
      </div>
      <a-table
        size="small"
        ref="contractChecks"
        :data-source="contractChecks"
        :rowKey="record => record.id"
        :loading="contractChecksLoading"
        :scroll="{ x: 1300}"
        :pagination="false"
        style="margin-top:20px;"
      >
        <a-table-column :width="100" key="id" title="id" data-index="id" align="center" v-if="false"/>
        <a-table-column :width="200" key="projectName" title="项目名" data-index="projectName" align="center"/>
        <a-table-column :width="170" key="contractNo" title="合同编号" data-index="contractNo" align="center"/>
        <a-table-column :width="100" key="price" title="金额" data-index="price" align="center">
          <template slot-scope="text, record">
            <el-tag effect="plain">￥{{text}}</el-tag>
          </template>
        </a-table-column>
        <a-table-column :width="100" key="auditStatus" data-index="auditStatus" title="审核状态" aligwarningn="center" >
          <template slot-scope="text,scope">
            <el-tag :type="scope.auditStatus===1? 'success':scope.auditStatus=== 2?'danger':'warning'">{{scope.auditStatus ===1 ?'审核通过':scope.auditStatus=== 2?'审核否决':'未审核'}}</el-tag>
          </template>
        </a-table-column>
        <a-table-column key="senderRemark" title="送审备注" data-index="senderRemark" align="center"/>
        <a-table-column key="firstParty" title="甲方" data-index="firstParty" align="center"/>
        <a-table-column key="secondParty" title="乙方" data-index="secondParty" align="center"/>
        <a-table-column :width="80" key="type" title="类别" data-index="type" align="center"/>
        <a-table-column key="mainContent" title="主要内容" data-index="mainContent" align="center"/>
        <a-table-column :width="80" key="sender" title="送审人" data-index="sender" align="center"/>
        <a-table-column :width="180" title="送审时间" align="center">
          <template slot-scope="text,record">{{dateTimeFormat(record.senderTime)}}</template>
        </a-table-column>
        <a-table-column :width="230" fixed="right" ellipsis="true" title="操作" align="center">
          <template slot-scope="text, record">
            <el-button type="primary" size="mini" @click="judge(record.id)">通过</el-button>
            <el-button type="danger" size="mini" @click="deny(record.id)">否决</el-button>
            <el-button type="warning" icon="audit" size="mini" @click="getFile(record.id)">附件</el-button>
          </template>
        </a-table-column>
      </a-table>
    </el-card>
    <el-dialog :model="file" v-el-drag-dialog title="附件查看" :visible.sync="visible">
        <el-tag effect="plain" :type="type[Math.floor(Math.random() * 5)]">
          <a target="_blank" v-for='file in files' :key="file.id" :href='file.url'>{{file.name}}</a>
        </el-tag>
        <br>
    </el-dialog>

    <el-dialog :model="file" v-el-drag-dialog title="审核备注" :visible.sync="judgeVisible">
      <div>
        <el-input v-model="form.auditRemark" placeholder="请输入备注"></el-input>
        <br>
        <el-button style="margin-top: 6px;float:right;" type="primary"  size="small" @click="toJudge">提交</el-button>
        <br>
      </div>
    </el-dialog>
  </div>
</template>
<script>
  import request from '@/utils/request'
  import { getAction, postActionByJson, postActionByQueryString } from '@/api/manage'
  import qs from 'querystring'
  import '@/styles/auto-style.css'
  import { getUser } from '@/utils/auth'
  import XLSX from 'xlsx'
  import { onFilterDropdownVisibleChange, onFilter, handleSearch, handleReset } from '@/utils/column-search'
  import elDragDialog from '@/directive/el-drag-dialog'
  import {dateFormat} from '@/utils/format'
  import { dateTimeFormat } from '@/utils/format'

  export default {
    directives: { elDragDialog },
    data() {
      return {
        //提交信息
        form: {},
        file:[],     //获取文件存放对象
        status: [{process:'未审核',value:0}, {process:'通过',value:1}, {process:'拒绝',value:2}],
        files:[],
        searchForm: {time:''},
        visible:false,
        contractChecks: [],
        visiblePublish:'none',
        contractChecksLoading: false,
        projects:[],

        type: ['', 'success', 'info', 'danger', 'warning'],
        judgeVisible:false,
        page: null,
        level: [
          { audit: 'firstAudit', title: '一级审核'},
          { audit: 'secondAudit', title: '二级审核'},
          { audit: 'threeAudit', title: '三级审核'}
        ]
      }
    },
    created() {
      this.init()

    },
    methods: {
      dateTimeFormat,
      judge(info)
      {
        this.judgeVisible = true
        this.form.id = info
        this.form.auditStatus='1'
      },
      deny(info)
      {
        this.judgeVisible = true
        this.form.id = info
        this.form.auditStatus='2'
      },
      toSearch() {
        this.contractChecks = []
        request.request({
          url: '/chapter/chapterAudit/findChapterAuditInfosByParams',
          method: 'get',
          params: { proName: this.searchForm.proName, startTime: this.searchForm.time[0], overTime: this.searchForm.time[1], auditStatus: this.searchForm.auditStatus }
        })
       .then( resp => {
          this.contractChecks = resp.data
          this.visiblePublish=''
        })
      },
      getFile(record)
      {
        getAction('/chapter/chapterAudit/findFileUrlByOtherId',{id: record})
          .then(resp=>{
            this.files=resp.data
            this.visible=true
          })
      },
      toJudge()
      {
        this.form.auditor = getUser()
        postActionByJson('/chapter/chapterAudit/updateChapterAudit', this.form)
        .then( resp => {
          this.$message({ message: resp.message, type: 'success' })
          this.judgeVisible = false
          this.toSearch()
        })
      },
      init() {
        this.toSearch()
      },

      handleChange(value) {
      },
      checkContract(contract) {
        return contract[this.level[this.page]['audit']] == 0?false:true
      },
    }
  }
</script>
<style lang="scss" scoped>
  .chapter-check {

  }
</style>
