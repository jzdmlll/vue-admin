<template>
  <!-- 最终审核 -->
  <div class="finalCheck_list">
    <div class="btns" style="padding:1em;margin-bottom:1em;background:#fff">
      <el-button :style="hasSelected?{display: 'inline-block'}:{display: 'none'}" type="primary" size="small" @click="toCheck(key=1)">通过</el-button>
      <el-button :style="hasSelected?{display: 'inline-block'}:{display: 'none'}" type="danger" size="small" @click="toCheck(key=2)">拒绝</el-button>
      <el-button :style="hasSelected?{display: 'inline-block'}:{display: 'none'}" type="info" size="small" @click="toCheck(key=0)">撤销</el-button>
      <el-select v-model="form.proDetailId" style="margin-right: 6px" filterable clearable placeholder="请选择项目" value-key="name">
        <el-option v-for="item in projects" :key="item.id" :label="item.name" :value="item.id" />
      </el-select>
      <el-button style="margin-right: 6px" type="primary" icon="el-icon-search" size="small" @click="loadData">查询</el-button>
      <div class="helper">
        <el-tag effect="dark" style="float: left;background: #4bbc89;border-color: #4bbc89;width: 24px;height:24px;"></el-tag>
        <span style="font-size: 14px;height: 24px;display: block;float: left;margin-left: 4px;color: #303133">拟比价</span>
        <el-tag effect="dark" style="margin-left: 8px;float: left;background: #ffc759;border-color: #4bbc89;width: 24px;height:24px;"></el-tag>
        <span style="font-size: 14px;height: 24px;display: block;float: left;margin-left: 4px;color: #303133">终审</span>
        <span style="height: 24px;display: block;float: left;margin-left: 8px;"><i class="el-icon-medal-1" style="font-size: 24px;color: #0568c3;"></i></span>
        <span style="font-size: 14px;height: 24px;display: block;float: left;margin-left: 4px;color: #303133">最低价</span>
      </div>
    </div>
    <div style="padding:1em;margin-bottom:1em;background:#fff">
      <el-table :data="data" size="small" style="width: 100%">
        <el-table-column
          prop="inquiry"
          label="询价内容"
          :fixed="dynamicColumns.suppliers.length > 8?'left':false"
          v-if="data.length>0"
          width="120">
          <template style="width: 100%" slot-scope="scope">
            <p>{{scope.row['inquiry'].name}}</p>
            <p>{{scope.row['inquiry'].params}}</p>
            <p>{{scope.row['inquiry'].unit}}</p>
            <p>{{scope.row['inquiry'].number}}</p>
          </template>
        </el-table-column>
        <el-table-column
          prop="draft"
          label="拟定报价"
          :fixed="dynamicColumns.suppliers.length > 8?'left':false"
          v-if="data.length>0"
          width="120">
          <template slot-scope="scope">
            <p>{{scope.row['draft'].price}}</p>
            <p>{{scope.row['draft'].totalPrice}}</p>
          </template>
        </el-table-column>
        <el-table-column
          v-for="(supplier,index) in dynamicColumns.suppliers"
          :label="supplier"
          :prop="supplier"
          :key="supplier"
          :width="dynamicColumns.suppliers.length > 8? 160:undefined"
          >
          <template  slot-scope="scope">
            <a-popover title="备注" trigger="click" placement="right" v-if="submitForm.remarks[index] && scope.row[supplier]
            && (scope.row[supplier].compareStatus === 1 || scope.row[supplier].compareStatus === 3)">
              <template slot="content" >
                <el-input
                  type="textarea"
                  :rows="3"
                  placeholder="请输入内容"
                  v-model="submitForm.remarks[index].remark">
                </el-input>
              </template>
              <div class="my-transition" v-bind:style="scope.row[supplier] && scope.row[supplier].compareStatus === 1?
                {background: '#4bbc89',boxShadow: '2px 2px 2px #909090',color: '#fff'}:scope.row[supplier] && scope.row[supplier].compareStatus === 3?{background: '#ffc759',boxShadow: '2px 2px 2px #909090',color: '#fff'}:{}"
                   @click="finalCheck(scope.row[supplier].compareId, scope.row[supplier].name, scope.row[supplier].supplier)">
                <i class="el-icon-medal-1" style="font-size: 18px;color: #0568c3; float: right" v-if="scope.row[supplier] && scope.row[supplier].minPrice === 1"></i>
                <p>{{scope.row[supplier]?nullFormat(scope.row[supplier].brand):''}}</p>
                <p>{{scope.row[supplier]?nullFormat(scope.row[supplier].suModel):''}}</p>
                <p>{{scope.row[supplier]?nullFormat(scope.row[supplier].price):''}}</p>
                <p>{{scope.row[supplier]?nullFormat(scope.row[supplier].suTotalPrice):''}}</p>
                <p>{{scope.row[supplier]?nullFormat(scope.row[supplier].suRemark):''}}</p>
                <p>{{scope.row[supplier]?nullFormat(scope.row[supplier].compareRemark):''}}</p>
              </div>
            </a-popover>
            <div v-else class="my-transition" v-bind:style="scope.row[supplier] && scope.row[supplier].compareStatus === 1?
                {background: '#4bbc89',boxShadow: '2px 2px 2px #909090',color: '#fff'}:scope.row[supplier] && scope.row[supplier].compareStatus === 3?{background: '#ffc759',boxShadow: '2px 2px 2px #909090',color: '#fff'}:{}"
                 @click="finalCheck(scope.row[supplier].compareId, scope.row[supplier].name, scope.row[supplier].supplier)">
              <i class="el-icon-medal-1" style="font-size: 18px;color: #0568c3; float: right" v-if="scope.row[supplier] && scope.row[supplier].minPrice === 1"></i>
              <p>{{scope.row[supplier]?nullFormat(scope.row[supplier].brand):''}}</p>
              <p>{{scope.row[supplier]?nullFormat(scope.row[supplier].suModel):''}}</p>
              <p>{{scope.row[supplier]?nullFormat(scope.row[supplier].price):''}}</p>
              <p>{{scope.row[supplier]?nullFormat(scope.row[supplier].suTotalPrice):''}}</p>
              <p>{{scope.row[supplier]?nullFormat(scope.row[supplier].suRemark):''}}</p>
              <p>{{scope.row[supplier]?nullFormat(scope.row[supplier].compareRemark):''}}</p>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="footer" >
      已选择<span style="margin: 0 4px;color: #1682e6;">{{submitForm.checkInquiryIds.length}}</span>家供应商
      <el-button :loading="submitLoading"  style="right:0;margin: 0 2em 0 0" type="primary" size="small" @click="submitCheck">{{submitLoading?'':'终审'}}</el-button>
    </div>
  </div>
</template>
<script>
import request from '@/utils/request'
import qs from 'querystring'
import '@/styles/auto-style.css'
import { getUser } from '@/utils/auth'
import { dateFormat, nullFormat } from '@/utils/format'

export default {

  data() {
    return {
      visible: false,
      data: [],
      loading: 'true',
      dynamicColumns: {suppliers: [], columns: [], compareIds: []},
      selectedRowKeys: [],
      form: {
      },
      projects: [],
      submitForm:{ checkInquiryIds: [], unCheckInquiryIds: [], allInquiryIds: [], remarks: []},
      submitLoading: false
    }
  },
  computed: {
    hasSelected() {
      return this.selectedRowKeys.length > 0
    }
  },
  created() {
    this.loadProjects()
  },
  methods: {
    nullFormat,
    submitCheck() {
      const form = this.submitForm
      const roleId = this.$store.getters.roles[0].id
      const userId = parseInt(getUser())
      form.remarks.map(i => {
        if (!i.remark) {
          i.remark = ''
        }
      })
      form.userId = userId
      form.roleId = roleId
      console.log(form)
      request.request({
        url: '/finallyCheck/saveFinallyCheckMessage',
        method: 'post',
        headers: {
          'Content-Type': 'application/json'
        },
        data: JSON.stringify(form)
      }).then(response => {
        this.$message({ message: response.message, type: 'success' })
      })
    },
    finalCheck(id, name, supplier) {
      if(id && name && supplier) {
        //alert(id + '  ' + name + '  ' + supplier)
        const data = [...this.data]
        const allCompareIds = []
        const allInquiryIds = []
        data.map(item => {
          if (item.inquiry.name == name) {
            console.log(item)
            this.dynamicColumns.suppliers.map(s => {
              if(item[s]){
                item[s].compareStatus = 2
                allCompareIds.push(item[s].compareId)
                allInquiryIds.push(item[s].id)
              }
            })
            item[supplier].compareStatus = 3
          }else{
            this.dynamicColumns.suppliers.map(s => {
              if(item[s]){
                allCompareIds.push(item[s].compareId)
                allInquiryIds.push(item[s].id)
              }
            })
          }
        })
        this.data = data
        const submitForm = { checkInquiryIds: [], uncheckInquiryIds: [], allInquiryIds: [], remarks: []}
        this.data.map((item, index) => {
          this.dynamicColumns.suppliers.map(s => {
            if(item[s] && (item[s].compareStatus === 1 || item[s].compareStatus === 3)){
              submitForm.checkInquiryIds.push(item[s].id)
              submitForm.remarks.push({id: item[s].id, remark: item[s].finalRemark})
            }
          })
        })
        allCompareIds.map(item => {
          if (!submitForm.checkInquiryIds.includes(item)){
            submitForm.uncheckInquiryIds.push(item)
          }
        })
        submitForm.allInquiryIds = [...allInquiryIds]

        this.submitForm = submitForm
      }
    },
    loadProjects() {
      request.get('/project/detail/findByAll')
        .then(response => {
          this.projects = response.data
        })
    },
    loadData() {

      if(this.form.proDetailId){
        let data = []
        let suppliers = []
        request.get('/finallyCheck/findDraftComparePrice?proDetailId='+this.form.proDetailId+'&checkName='+this.$route.name)
        .then(response => {
          data = response.data
          // 初始化动态列
          data.map(item => {
            // 筛选出所有列名
            Object.keys(item).map(key => {
              if(key != 'inquiry' && key != 'draft' && !suppliers.includes(key)){
                suppliers.push(key)
              }
            })
          })
          this.dynamicColumns.suppliers = suppliers
          // 渲染动态列
          this.dynamicColumns.suppliers.map(item => {
            this.dynamicColumns.columns.push({
              title: item,
              dataIndex: item,
              scopedSlots: { customRender: item}
            })
          })
          this.data = data
          const allInquiryIds = []
          const submitForm = { checkInquiryIds: [], uncheckInquiryIds: [], allInquiryIds: [], remarks: []}
          this.data.map(item => {
            this.dynamicColumns.suppliers.map(s => {
              if(item[s]){
                allInquiryIds.push(item[s].id)
              }
            })
          })
          this.data.map((item, index) => {
            this.dynamicColumns.suppliers.map(s => {
              if(item[s] && (item[s].compareStatus === 1 || item[s].compareStatus === 3)){
                submitForm.checkInquiryIds.push(item[s].id)
                submitForm.remarks.push({id: item[s].id, remark: item[s].finalRemark})
              }
            })
          })
          allInquiryIds.map(item => {
            if (!submitForm.checkInquiryIds.includes(item)){
              submitForm.uncheckInquiryIds.push(item)
            }
          })
          submitForm.allInquiryIds = [...allInquiryIds]

          this.submitForm = submitForm
        })
      }else {
        this.$message({ message: '请选择项目', type: 'warning' })
      }
    },
  }
}
</script>

<style lang="scss" scoped>
  .finalCheck_list {
    .helper {
      float: right;
      height: 24px;
      line-height: 24px;
    }
    /deep/.el-table__body {
      tbody {
        tr {
          td {
            .cell {
              padding: 0!important;
              div {
                position: absolute;
                top: 0;
                height: 98%;
                width: 98%;
                padding: 1em;
                margin: 1%;
                p {
                  margin: 0;
                }
              }
            }
          }
        }
      }
    }
    .footer {
      height: 60px;
      line-height: 60px;
      width: calc(100% + 1em);
      position: fixed;
      z-index: 999;
      background: #fff;
      bottom: 0;
      left: 0;
      box-shadow: 1px 1px 4px #9e9e9e;
      text-align: right;
      padding: 0 4%;
    }
  }
</style>
