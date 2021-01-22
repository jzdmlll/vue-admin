<template>
  <!--用章审核-->
  <div class="chapter-check">
    <!--
    <div class="btns" style="padding:1em;margin-bottom:1em;background:#fff">
      <el-cascader
        v-model="searchForm.contractId"
        clearable
        filterable
        :props="props"
        @change="handleChange">
        <template slot-scope="{ node, data }">
          <div v-if="!node.isLeaf">
            <span>{{ data.label }}</span>
          </div>
          <div v-else>
            <span>{{ data.label }}</span>
            <el-tag
              style="float: right;transform: translate(0px, 7px);"
              :type="checkContract(data.item)?'success':'info'"
              size="mini"
              effect="plain">
              {{ checkContract(data.item)?'已完成':'未完成' }}
            </el-tag>
          </div>
        </template>
      </el-cascader>
      <el-button style="margin-right: 6px" type="primary" icon="el-icon-search" size="small" @click="toSearch">查询</el-button>
    </div>
    -->
    <el-card shadow="never" style="margin-top: 1em">
      <div slot="header" class="index-md-title">
        <el-select v-model="searchForm.projectName" style="margin-right: 6px" filterable clearable placeholder="请选择项目" value-key="name">
          <el-option v-for="item in projects" :key="item.id" :label="item.projectName" :value="item.projectName" />
        </el-select>
        <!--
        <el-select v-model="searchForm.process" style="margin-right: 6px" filterable clearable placeholder="审核流程" value-key="process">
        <el-option v-for="item in status" :key="item" :label="item.process" :value="item.value" />
        </el-select>
        -->
        <el-button style="margin-right: 6px" type="primary" icon="el-icon-search" size="small" @click="toSearch">查询</el-button>
      </div>
      <a-table
        size="small"
        ref="contractChecks"
        :data-source="contractChecks"
        :rowKey="record => record.id"
        :loading="contractChecksLoading"
        :scroll="{ x: 2000}"
        :pagination="false"
        style="margin-top:20px;"
      >
        <a-table-column :width="100" key="id" title="id" data-index="id" align="center" v-if="false"/>
        <a-table-column :width="100" key="contractName" title="合同名" data-index="contractName" align="center"/>
        <a-table-column :width="100" key="contractNo" title="合同编号" data-index="contractNo" align="center"/>
        <a-table-column :width="100" key="price" title="金额" data-index="price" align="center"/>
        <a-table-column :width="60" key="firstparty" title="甲方" data-index="firstParty" align="center"/>
        <a-table-column :width="80" key="secondParty" title="乙方" data-index="secondParty" align="center"/>
        <a-table-column :width="80" key="type" title="类别" data-index="type" align="center"/>
        <a-table-column :width="80" key="sender" title="送审人" data-index="sender" align="center"/>
        <a-table-column  title="送审时间" align="center">
          <template slot-scope="text,record">{{dateTimeFormat(record.senderTime)}}</template>
        </a-table-column>
        <a-table-column :width="500" key="mainContent" title="主要内容" data-index="mainContent" align="center"/>
        <a-table-column  key="senderRemark" title="送审备注" data-index="senderRemark" align="center"/>
        <a-table-column :width="200" ellipsis="true" title="操作" align="center">
          <template slot-scope="text, record">
            <a-tooltip placement="topLeft" title="通过">
              <a-button type="primary" icon="check" size="small" @click="judge(record.id)"/>
            </a-tooltip>
            <a-tooltip placement="topLeft" title="否决">
              <a-button type="primary" icon="close" size="small" @click="deny(record.id)"/>
            </a-tooltip>
            <a-tooltip placement="topLeft" title="查看附件">
              <a-button type="primary" icon="audit" size="small" @click="getFile(record.id)"/>
            </a-tooltip>
            <a-tooltip placement="topLeft" title="删除">
              <a-button type="primary" icon="delete" size="small" @click="todelete(record.id)"/>
            </a-tooltip>
          </template>
        </a-table-column>
      </a-table>
    </el-card>
    <el-dialog :model="file" v-el-drag-dialog title="附件查看" :visible.sync="visible">
      <div>
        <a target="_blank" v-for='file in files' :key="file.id" :href='file.url'><button>{{file.name}}</button></a>
        <br>
      </div>
    </el-dialog>

    <el-dialog :model="file" v-el-drag-dialog title="审核备注" :visible.sync="judgeVisible">
      <div>
        <el-input v-model="searchForm.remark" placeholder="请输入备注"></el-input>
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

      const props = {
        lazy: true,
        lazyLoad(node, resolve) {
          const { level } = node;
          switch (level) {
            case 0:
              // 请求一级节点数据
              getAction('/purchase/project/findAllLike', {})
                .then( resp => {
                  let nodes = []
                  resp.data.map(item => {
                    nodes.push({
                      value: item.id,
                      label: item.projectName,
                      leaf: level >= 1
                    })
                  })
                  // 通过调用resolve将子节点数据返回，通知组件数据加载完成
                  resolve(nodes);
                })
              break
            case 1:
              // 请求二级节点数据
              let nodes = []
              const projectId = node.data.value
              getAction('/purchase/contract/findByProjectId', {projectId: projectId})
                .then( resp => {
                  let nodes = []
                  resp.data.map(item => {
                    nodes.push({
                      value: item.id,
                      label: item.contractName,
                      item: item,
                      leaf: level >= 1
                    })
                  })
                  // 通过调用resolve将子节点数据返回，通知组件数据加载完成
                  resolve(nodes)
                })
              break
          }
        }
      }
      return {
        file:[],     //获取文件存放对象
        status: [{process:'未审核',value:0}, {process:'通过',value:1}, {process:'拒绝',value:2}],
        files:[],
        searchForm: {},
        visible:false,
        contractChecks: [],
        visiblePublish:'none',
        contractChecksLoading: false,
        projects:[],
        props: props,
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
        /*
        if(Object.keys(this.searchForm).length == 0)
        {
        }*/
        if(this.searchForm.projectName==undefined)
        {
          this.$message({ type: 'warning', message: '请选择工程名'})
        }
        else{
          this.judgeVisible=true
          this.searchForm.id=info
          this.searchForm.judge='1'
        }
      },
      deny(info)
      {
        if(this.searchForm.projectName==undefined)
        {
          this.$message({ type: 'warning', message: '请选择工程名'})
        }
        else{
          this.judgeVisible=true
          this.searchForm.id=info
          this.searchForm.judge='2'
        }
      },
      toSearch() {
        if(this.searchForm.projectName==undefined)
        {
          this.$message({ type: 'warning', message: '请选择工程名'})
        }
        else{
          let form={}
          form['projectName']=this.searchForm.projectName

          getAction('/chapter/chapterAudit/findChapterAuditInfosByProjectName', form)
            .then( resp => {
              this.contractChecks = resp.data
              this.visiblePublish=''
            })
        }

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
        let form = {}
        /*form[this.level[this.page]['audit']] =  record*/
        form['id']=this.searchForm.id
        form['auditStatus']=this.searchForm.judge
        form['auditRemark']=this.searchForm.remark
        postActionByJson('/chapter/chapterAudit/updateChapterAudit', form)
          .then( resp => {

            this.$message({ message: resp.message, type: 'success' })
          })
      },
      todelete(info)
      {
        /*form[this.level[this.page]['audit']] =  record*/
        let form = {}
        form['id']=this.searchForm.id
        getAction('/chapter/chapterAudit/deleteChapterAuditService', {id:info})
          .then( resp => {
            this.$message({ message: resp.message, type: 'success' })
            this.toSearch()
          })

      },
      init() {
        this.loadProjects()
      },
      async loadProjects() {
        await request.get('/chapter/chapterAudit/findAllProjectName')
          .then(response => {
            this.projects = response.data
          })
      },
      handleChange(value) {
      },
      checkContract(contract) {
        return contract[this.level[this.page]['audit']] == 0?false:true
      }
    }
  }
</script>
<style lang="scss" scoped>
  .chapter-check {

  }
</style>
