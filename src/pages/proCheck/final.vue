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
        <span style="font-size: 14px;height: 24px;display: block;float: left;margin-left: 4px;color: #303133">终审</span>
        <span style="height: 24px;display: block;float: left;margin-left: 8px;"><i class="el-icon-star-off" style="font-size: 24px;color: #f52222;"></i></span>
        <span style="font-size: 14px;height: 24px;display: block;float: left;margin-left: 4px;color: #303133">拟比价</span>
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
          width="auto">
          <template style="width: 100%" slot-scope="scope">
            <p>设备名：{{scope.row['inquiry'].name}}</p>
            <p>技术参数：{{scope.row['inquiry'].params}}</p>
            <p>单位：{{scope.row['inquiry'].unit}}</p>
            <p>数量：{{scope.row['inquiry'].number}}</p>
          </template>
        </el-table-column>
        <el-table-column
          prop="draft"
          label="拟定报价"
          :fixed="dynamicColumns.suppliers.length > 8?'left':false"
          v-if="data.length>0"
          width="auto">
          <template slot-scope="scope">
            <a-popover title="修改拟定报价" trigger="click" placement="right" v-if="!form1.visible">
              <template slot="content" >
                <el-form ref="form1" :model="form1"  status-icon>
                  <el-form-item label-width="0" size="small" prop="price">
                    <el-input
                      type="text"
                      :rows="3"
                      placeholder="请输入拟定单价"
                      size="mini"
                      v-model="form1.price"
                    >
                    </el-input>
                  </el-form-item>
                  <el-form-item label-width="0" size="small" prop="totalPrice">
                    <el-input
                      type="text"
                      :rows="3"
                      placeholder="请输入拟定总价"
                      size="mini"
                      v-model="form1.totalPrice"
                    >
                    </el-input>
                  </el-form-item>
                  <el-button type="primary" size="small" @click="submitPrice('form1', scope.row['inquiry'].inquiryId)">提交</el-button>
                </el-form>

              </template>
              <p>报价单价：{{scope.row['draft'].price}}</p>
              <p>报价总价：{{scope.row['draft'].totalPrice}}</p>
            </a-popover>

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
            && (scope.row[supplier].compareStatus === 1 || scope.row[supplier].finalCheck.checkStatus === 1)">
              <template slot="content" >
                <el-input
                  type="textarea"
                  :rows="3"
                  placeholder="请输入内容"
                  v-model="submitForm.remarks[index].remark">
                </el-input>
              </template>
              <div class="my-transition" v-bind:style="scope.row[supplier] && scope.row[supplier].finalCheck.checkStatus === 1?{background: '#4bbc89',boxShadow: '2px 2px 2px #909090',color: '#fff'}:scope.row[supplier] && scope.row[supplier].compareStatus === 1?{border: '1px #ff4949 dashed'}:{}"
                   @click="finalCheck(scope.row[supplier].finalCheck.id, scope.row[supplier].name, scope.row[supplier].supplier)">
                <i class="el-icon-medal-1" style="opacity: .7;font-size: 18px;color: #0568c3; float: right" v-if="scope.row[supplier] && scope.row[supplier].minPrice === 1">
                  <span style="font-size: 12px">最低价</span>
                </i>
                <i class="el-icon-star-off" style="opacity: .7;font-size: 18px;color: #f52222; float: right; bottom: 12px; right: 12px; position: absolute" v-if="scope.row[supplier] && scope.row[supplier].compareStatus === 1">
                  <span style="font-size: 12px">拟比价</span>
                </i>
                <p>实际型号：{{scope.row[supplier]?nullFormat(scope.row[supplier].suModel):''}}</p>
                <p>实际技术参数：{{scope.row[supplier]?nullFormat(scope.row[supplier].suModel):''}}</p>
                <p>单价：{{scope.row[supplier]?nullFormat(scope.row[supplier].price):''}}</p>
                <p>总价：{{scope.row[supplier]?nullFormat(scope.row[supplier].suTotalPrice):''}}</p>
                <p v-if="scope.row[supplier] && scope.row[supplier].compareStatus == 1">拟比价备注：{{scope.row[supplier]?nullFormat(scope.row[supplier].compareRemark):''}}</p>
              </div>
            </a-popover>
            <div v-else class="my-transition" v-bind:style="scope.row[supplier] && scope.row[supplier].finalCheck.checkStatus === 1?{background: '#4bbc89',boxShadow: '2px 2px 2px #909090',color: '#fff'}:scope.row[supplier] && scope.row[supplier].compareStatus === 1?{border: '1px #ff4949 dashed'}:{}"
                 @click="finalCheck(scope.row[supplier].finalCheck.id, scope.row[supplier].name, scope.row[supplier].supplier)">
              <i class="el-icon-medal-1" style="opacity: .7;font-size: 18px;color: #0568c3; float: right" v-if="scope.row[supplier] && scope.row[supplier].minPrice === 1">
                <span style="font-size: 12px">最低价</span>
              </i>
              <i class="el-icon-star-off" style="opacity: .7;font-size: 18px;color: #f52222; float: right; bottom: 12px; right: 12px; position: absolute" v-if="scope.row[supplier] && scope.row[supplier].compareStatus === 1">
                <span style="font-size: 12px">拟比价</span>
              </i>
              <p>实际型号：{{scope.row[supplier]?nullFormat(scope.row[supplier].suModel):''}}</p>
              <p>实际技术参数：{{scope.row[supplier]?nullFormat(scope.row[supplier].suModel):''}}</p>
              <p>单价：{{scope.row[supplier]?nullFormat(scope.row[supplier].price):''}}</p>
              <p>总价：{{scope.row[supplier]?nullFormat(scope.row[supplier].suTotalPrice):''}}</p>
              <p v-if="scope.row[supplier] && scope.row[supplier].compareStatus == 1">拟比价备注：{{scope.row[supplier]?nullFormat(scope.row[supplier].compareRemark):''}}</p>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="footer" >
      已选择<span style="margin: 0 4px;color: #1682e6;">{{submitForm.checkCompareIds.length}}</span>家供应商
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
      form1: {},
      visible: false,
      data: [],
      loading: 'true',
      dynamicColumns: {suppliers: [], columns: [], compareIds: []},
      selectedRowKeys: [],
      form: {
      },
      projects: [],
      submitForm:{ checkCompareIds: [], uncheckCompareIds: [], allInquiryIds: [], remarks: []},
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
    submitPrice(form1, id) {
      let form = this.form1

      form.id = id
      form.operator = parseInt(getUser())
      const data = [...this.data]
      //this.data = [...this.data]
      let i = ''
      data.map((item, index) => {
        //console.log(item)
        if(item.inquiry.inquiryId == id) {
          i = index
          item.draft.price = form.price
          item.draft.totalPrice = form.totalPrice
        }
      })
      this.data = data
      request.request({
        url: '/inquiry/rowSave',
        method: 'post',
        headers: {
          'Content-Type': 'application/json'
        },
        data: JSON.stringify(form)
      }).then(response => {
        this.$message({ message: response.message, type: 'success' })
      })
    },
    nullFormat,
    submitCheck() {
      if (this.submitForm.checkCompareIds.length > 0) {
        const form = this.submitForm
        const userId = parseInt(getUser())
        form.remarks.map(i => {
          if (!i.remark) {
            i.remark = ''
          }
        })
        form.userId = userId
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
      }else {
        this.$message({ message: '还未选择终审通过的供应商', type: 'warning' })
      }
    },
    finalCheck(id, name, supplier) {
      if(id && name && supplier) {
        //alert(id + '  ' + name + '  ' + supplier)
        const data = [...this.data]
        const allCompareIds = []
        data.map(item => {
          console.log(item)
          if (item.inquiry.name == name) {
            this.dynamicColumns.suppliers.map(s => {
              if(item[s]){
                item[s].finalCheck.checkStatus = 0
                allCompareIds.push(item[s].finalCheck.id)
              }
            })
            item[supplier].finalCheck.checkStatus = 1
          }else{
            this.dynamicColumns.suppliers.map(s => {
              if(item[s]){
                allCompareIds.push(item[s].finalCheck.id)
              }
            })
          }
        })
        this.data = data
        const submitForm = { checkCompareIds: [], uncheckCompareIds: [], remarks: []}
        this.data.map((item, index) => {
          this.dynamicColumns.suppliers.map(s => {
            if(item[s] && (item[s].finalCheck.checkStatus === 1)){
              submitForm.checkCompareIds.push(item[s].finalCheck.id)
              submitForm.remarks.push({id: item[s].finalCheck.id, remark: item[s].finalCheck.remark})
            }
          })
        })
        allCompareIds.map(item => {
          if (!submitForm.checkCompareIds.includes(item)){
            submitForm.uncheckCompareIds.push(item)
          }
        })

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
        request.get('/finallyCheck/findDraftComparePrice?proDetailId='+this.form.proDetailId)
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
          const allCompareIds = []
          const submitForm = { checkCompareIds: [], uncheckCompareIds: [], remarks: []}
          this.data.map(item => {
            this.dynamicColumns.suppliers.map(s => {
              if(item[s]){
                allCompareIds.push(item[s].finalCheck.id)
              }
            })
          })
          this.data.map((item, index) => {
            this.dynamicColumns.suppliers.map(s => {
              if(item[s] && (item[s].finalCheck.checkStatus === 1)){
                submitForm.checkCompareIds.push(item[s].finalCheck.id)
                submitForm.remarks.push({id: item[s].finalCheck.id, remark: item[s].finalCheck.remark})
              }
            })
          })
          allCompareIds.map(item => {
            if (!submitForm.checkCompareIds.includes(item)){
              submitForm.uncheckCompareIds.push(item)
            }
          })
          submitForm.allCompareIds = [...allCompareIds]

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
    /deep/.el-form-item__content {
      margin-left: 0!important;
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
