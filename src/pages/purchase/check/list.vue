<template>
  <!--合同审核-->
  <div class="purchase-check">
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
    <el-card shadow="never" style="margin-top: 1em">
      <div slot="header" class="index-md-title">
        <span>{{level[page].title}}</span>
        <span v-if="contractChecks.length>0">【{{projectName}} / {{contractName}}】</span>
        <span><el-button v-if="contractChecks.length>0" style="margin-right: 6px;float:right;" type="primary" icon="el-icon-success" size="small" @click="toJudge(1)">审核通过</el-button></span>
        <span><el-button v-if="contractChecks.length>0" style="margin-right: 6px;float:right;" type="danger" icon="el-icon-close" size="small" @click="toJudge(2)">审核不通过</el-button></span>
        <span><el-button v-if="contractChecks.length>0" style="margin-right: 6px;float:right;" type="warning" icon="el-icon-paperclip" size="small" @click="getFile">查看附件</el-button></span>
      </div>
      <a-table
        size="small"
        ref="contractChecks"
        :data-source="contractChecks"
        :rowKey="record => record.id"
        :loading="contractChecksLoading"
        :scroll="contractChecks.length > 0 ?{ x: 1500}:{}"
        :pagination="false"
        style="margin-top:20px;"
      >
        <a-table-column :width="60" key="serialNumber" title="序号" data-index="serialNumber" align="center"/>
        <a-table-column :width="150" key="item" title="设备" data-index="item" align="center"/>
        <a-table-column :width="100" key="purchaseSupply.brand" title="品牌" data-index="purchaseSupply.brand" align="center"/>
        <a-table-column :width="100" key="purchaseSupply.supplier" title="厂家" data-index="purchaseSupply.supplier" align="center"/>
        <a-table-column :width="100" key="model" title="型号" data-index="model" align="center"/>
        <a-table-column :width="60" key="unit" title="单位" data-index="unit" align="center"/>
        <a-table-column :width="80" key="number" title="数量" data-index="number" align="center"/>
        <a-table-column :width="80" key="purchaseSupply.price" title="单价" data-index="purchaseSupply.price" align="center"/>
        <a-table-column :width="80" key="totalPrice" title="总价" data-index="totalPrice" align="center"/>
        <a-table-column  key="params" title="技术要求" data-index="params" align="center"/>
        <a-table-column  key="purchaseSupply.params" title="实际参数" data-index="purchaseSupply.params" align="center"/>
        <a-table-column :width="100" key="remark" title="备注" data-index="remark" align="center"/>
        <a-table-column :width="100" key="purchaseSupply.warranty" title="质保期" data-index="purchaseSupply.warranty" align="center"/>
        <a-table-column key="purchaseSupply.delivery" title="货期" data-index="purchaseSupply.delivery" align="center"/>
      </a-table>
    </el-card>
    <el-dialog :model="file" v-el-drag-dialog title="附件查看" :visible.sync="visible">
      <div v-if="files.length > 0">
        <a v-for='file in files' :key="file.id" :href='file.url' target="_blank"><button>{{file.name}}</button></a>
        <br>
      </div>
      <a-empty v-else/>
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
  export default {
    directives: { elDragDialog },
    data() {

      return {

        projectName: null,
        contractName: null,
        projects: [],
        contracts: [],

        file:[],     //获取文件存放对象
        files:[],
        searchForm: {},
        visible:false,
        contractChecks: [],
        contractChecksLoading: false,

        props: {
          lazy: true,
          lazyLoad:((node, resolve)=>{
            const { level } = node;
            switch (level) {
              case 0:
                // 请求一级节点数据
                getAction('/purchase/project/findAllLike', {})
                  .then( resp => {
                    this.projects = resp.data
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
                    this.contracts = resp.data
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
          }),
        },
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
      this.page = this.$route.name == '一级审核'?0:this.$route.name == '二级审核'?1:2
    },
    methods: {

      toSearch() {
        this.contractChecksLoading = true
        if (this.searchForm.contractId) {
          getAction('/purchase/contractManagement/findPurchaseMessageByContractId', { contractId: this.searchForm.contractId[1]})
            .then( resp => {
              this.contractChecks = resp.data
              this.contractChecksLoading = false
            }).catch(()=> {
            this.contractChecksLoading = false
          })
        }else {
          this.$message({ type: 'warning', message: '请选择合同'})
        }
      },
      getFile()
      {
        getAction('/purchase/contractManagement/findContractFileByContractId',{contractId: this.searchForm.contractId[1]})
          .then(resp=>{
            this.files=resp.data
            this.visible=true
          })
      },
      toJudge(record)
      {
        let form = {}
        form[this.level[this.page]['audit']] =  record
        form['id'] = this.searchForm.contractId[1]
        form.operator = getUser()
        postActionByQueryString('/purchase/contractAudit/updateContractAuditInfoById', form)
          .then( resp => {
            this.$message({ message: resp.message, type: 'success' })
          })
      },
      init() {
      },
      handleChange(value) {
        this.projectName = this.projects.filter(item=>item.id==value[0])[0]['projectName']
        this.contractName = this.contracts.filter(item=>item.id==value[1])[0]['contractName']
      },
      checkContract(contract) {
        return contract[this.level[this.page]['audit']] == 0?false:true
      }
    }
  }
</script>
<style lang="scss" scoped>
  .purchase-check {
    .el-input {

    }
  }
</style>
