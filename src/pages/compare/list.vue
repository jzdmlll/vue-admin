<template>
  <div class="compare_list">
    <div class="btns" style="padding:1em;margin-bottom:1em;background:#fff">
      <el-button :style="hasSelected?{display: 'inline-block'}:{display: 'none'}" type="primary" size="small" @click="batchCompare()">批量比价</el-button>
      <el-select v-model="form.proDetailId" style="margin-right: 6px" filterable clearable placeholder="请选择项目" value-key="name">
        <el-option v-for="item in projects" :key="item.id" :label="item.name" :value="item.id" />
      </el-select>
      <el-select v-model="form.compareStatus" style="margin-right: 6px" clearable placeholder="选择比价状态" value-key="name">
        <el-option v-for="item in select" :key="item.status" :label="item.name" :value="item.status" />
      </el-select>
      <el-button style="margin-right: 6px" type="primary" icon="el-icon-search" size="small" @click="toSearch">查询</el-button>
    </div>
    <div style="padding:1em;margin-bottom:1em;background:#fff;position: relative">
      <el-table :max-height="compares.length>8?400:undefined" v-loading="loading" :data="compares"
                size="small" @selection-change="handleSelectionChange" ref="multipleTable">
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column type="index" prop="index" label="序号" width="120" />
        <el-table-column prop="name" label="询价名" :show-overflow-tooltip="true" />
        <el-table-column prop="params" label="参数" :show-overflow-tooltip="true" />
        <el-table-column prop="number" label="数量" />
        <el-table-column  label="利率" >
          <template slot-scope="scope">{{scope.row.rate/1000}}%</template>
        </el-table-column>
        <el-table-column prop="price" label="拟定报价单价" />
        <el-table-column prop="totalPrice" label="拟定报价总价" />
        <el-table-column label="操作" align="center" width="240">
          <template slot-scope="scope">
            <el-tooltip class="item" effect="dark" content="查看比价" placement="bottom-start">
              <el-button type="primary" size="mini" @click="compareDetail(scope.row)" >比价详情</el-button>
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="添加拟定报价" placement="bottom-start">
              <el-button icon="el-icon-plus" type="primary" size="mini" @click="addPrice(scope.row)" >添加拟定报价</el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 比价界面-->
      <div class="my-transition" style="overflow-x: auto" :style="realCompares.length > 0?{display: 'block',width: suppliers.length * 238+100 + 'px'}:{display: 'none'}">
        <sticky :sticky-top="350" width="50px">
          <el-button style="left:0;z-index: 99;" icon="el-icon-arrow-left" class="my-transition" circle @click="cardLeft"></el-button>
        </sticky>
        <sticky right="1em" :sticky-top="350" width="50px">
          <el-button style="right:0;z-index: 99;" icon="el-icon-arrow-right" class="my-transition" circle @click="cardRight"></el-button>
        </sticky>
        <!-- 头部 供应商列表-->
        <Sticky minWidth="100%" margin="0 0 0 -28px" padding="0 0 0 2em" background="#fff" boxShadow="1px 1px 4px #9e9e9e" style="height: 74px;background:#fff">
          <div class="compare-container my-transition"
               :style="{gridTemplateColumns: '100px '+'repeat('+ suppliers.length + ', 1fr)', width: suppliers.length * 238+100 + 'px', transform: 'translate('+moveWidth+'px)'}" >
            <div></div>
            <div class="compare-item my-transition" v-for="(item, index) in suppliers" :key="index">
              <div class="item-head my-transition">{{item}}</div>
              <span style="width: 180px;display: block;text-align: center;">小计：￥{{suppliersTotal[item]}}</span>
            </div>
          </div>
        </Sticky>
        <!-- 询价卡片 -->
        <div v-for="(item,index) in realCompares" :key="index" class="my-transition" :style="{transform: 'translate('+moveWidth+'px)'}">
          <div class="compare-container" :style="{gridTemplateColumns: '100px '+'repeat('+item.inquiryCompareVMS.length+', 1fr)',width:item.inquiryCompareVMS.length*238+100+'px'}">
            <!--<div class="compare-item" :slot="item.inquiryCompareVMS[0]" v-if="item.inquiryCompareVMS.length>0" style="color: #42B983">
          &lt;!&ndash;    <div class="item-head" style="width: 0;overflow:hidden;border: none"></div>&ndash;&gt;
              <div class="item-body" style="border: none">
                <span id="compareColumn" v-for="key in compareColumns" :key="key" v-if="compareColumns.includes(key)">
                  {{compareColumnsValue[key]}}
                </span>
              </div>
            </div>-->
            <div></div>
            <div class="compare-item my-transition" v-for="item in item.inquiryCompareVMS" :key="item.id">
              <el-radio :style="item['dataSource'] == 0?{background: '#eae2c5'}:{}" v-if="item.id && (item['businessAudit']==1 && item['technicalAudit']==1)" border @change="radioChange(item, index)" v-model="compareForm[index].compareId" class="item-body my-transition"
                        style="border-color: #42B983" :class="{'item-body-select':(compareForm[index] && item.compareId == compareForm[index].compareId)}">
                <div class="check-div my-transition"><a-icon type="check" style="font-size: 18px;font-size: 20px;font-weight: 600;
                transform: rotate(-45deg);margin-top: 5px;"/></div>
                <a-popover title="备注" trigger="click" placement="right" v-if="item.compareId == compareForm[index].compareId">
                  <template slot="content" >
                    <el-input
                      type="textarea"
                      :rows="3"
                      placeholder="请输入内容"
                      v-model="compareForm[index].remark">
                    </el-input>
                  </template>

                    <span v-for="key in compareColumns" :key="key" class="ellipsis" v-if="compareColumns.includes(key)">
                      <el-tooltip :content="item[key]+''" placement="top" effect="light">
                        <div>{{compareColumnsValue[key]}}：{{(key==='warranty' || key==='suDelivery')?item[key]:nullFormat(item[key])}}</div>
                      </el-tooltip>
                    </span>

                </a-popover>
                <div v-else>
                  <span v-for="key in compareColumns" :key="key" class="ellipsis"
                        v-if="compareColumns.includes(key)">
                    <el-tooltip :content="item[key]+''" placement="top" effect="light">
                        <div>{{compareColumnsValue[key]}}：{{(key==='warranty' || key==='suDelivery')?item[key]:nullFormat(item[key])}}</div>
                      </el-tooltip>
                  </span>
                </div>
              </el-radio>
              <div v-else-if="item.id && (item['businessAudit']==2 || item['technicalAudit']==2)" style="border-color: red" class="item-body my-transition">
                <div class="el-radio__label">
                  <span v-for="key in compareColumns" :key="key" class="ellipsis"
                        v-if="compareColumns.includes(key)">
                    <el-tooltip :content="item[key]+''" placement="top" effect="light">
                        <div>{{compareColumnsValue[key]}}：{{(key==='warranty' || key==='suDelivery')?item[key]:nullFormat(item[key])}}</div>
                      </el-tooltip>
                  </span>
                </div>
              </div>

              <div v-else-if="item.id && (item['businessAudit']==0 || item['technicalAudit']==0)" style="border-color: rgba(0, 0, 0, 0.65);opacity: .5;" class="item-body my-transition">
                <div class="el-radio__label">
                  <span v-for="key in compareColumns" :key="key" class="ellipsis"
                        v-if="compareColumns.includes(key)">
                    <el-tooltip :content="item[key]+''" placement="top" effect="light">
                        <div>{{compareColumnsValue[key]}}：{{(key==='warranty' || key==='suDelivery')?item[key]:nullFormat(item[key])}}</div>
                      </el-tooltip>
                  </span>
                </div>
              </div>

              <template v-else >
                <a-empty style="width: 180px;margin:0;top: 50%;position: relative;transform: translate(0,-60%);" />
              </template>

            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="footer" :style="realCompares.length > 0?{display: 'block'}:{display: 'none'}">
      报价总价:<span style="margin: 0 2em 0 4px;color: #1682e6;">{{cost.toFixed(2)}}</span>
      成本总价:<span style="margin: 0 2em 0 4px;color: #1682e6;">{{suppliersTotal.total?(suppliersTotal.total).toFixed(2):0}}</span>
      利率:<span style="margin: 0 2em 0 4px;color: #1682e6;">{{suppliersTotal.total?((cost-suppliersTotal.total)/suppliersTotal.total*100).toFixed(2):0}}%</span>
      <el-button :loading="submitLoading"  style="right:0;margin: 0 2em 0 0" type="primary" size="small" @click="submitCompare">{{submitLoading?'':'选用'}}</el-button>
    </div>
    <!-- 模态框 -->
    <el-dialog title="添加拟定报价" :visible.sync="visible">
      <el-form ref="dialogForm" :model="dialogForm"  status-icon>
        <el-form-item label="设备名" label-width="80px" size="small" prop="proOriginId">
          {{dialogForm.name}}
        </el-form-item>
        <el-form-item label="技术参数" label-width="80px" size="small" prop="proOriginId">
          {{dialogForm.params}}
        </el-form-item>
        <el-form-item label="报价单价" label-width="80px" size="small" prop="price">
          <el-autocomplete
            v-model="dialogForm.price"
            :fetch-suggestions="querySearchAsync"
            placeholder="请输入内容"
            @select="handleSelect"
          ></el-autocomplete>
        </el-form-item>
        <el-form-item label="报价总价" label-width="80px" size="small" prop="totalPrice">
          <el-input v-model="dialogForm.totalPrice" autocomplete="off" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="visible = false">取 消</el-button>
        <el-button type="primary" size="small" @click="submitHandler('dialogForm')">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import request from '@/utils/request'
import qs from 'querystring'
import '@/styles/auto-style.css'
import { dateFormat, nullFormat } from '@/utils/format'
import Sticky from '@/components/Sticky'
import { getUser } from '@/utils/auth'

export default {
  components: { Sticky },
  data () {
    return {
      cost: 0.00,
      priceInquiries: [],
      poolForm: {},
      dialogForm: {},
      visible: false,
      moveWidth: 0,
      form: {},
      projects: [],
      select: [{ status: 0, name: '未比价' }, { status: 1, name: '已比价' }],
      compares: [],
      realCompares: [],
      compareColumns: ['name','suBrand','suParams','suModel','suPrice','suTotalPrice',
        'warranty','suDelivery','suRemark','businessRemark','technicalRemark','finallyRemark'],
      compareColumnsValue: {'name': '设备名','suBrand':'品牌','suParams':'参数','suModel':'型号','suPrice':'单价(商)', 'suTotalPrice':'总价(商)',
        'warranty':'质保期','suDelivery':'货期','suRemark':'备注(商)', 'businessRemark':'商审备注','technicalRemark':'技审备注','finallyRemark':'终审备注'},
      compareForm: [{compareId: '',otherCompareId:[]}],
      loading: true,
      submitLoading: false,
      currentInquiry: '',
      selected: {inquiryIds:[], names:[]},
      suppliers: [],
      suppliersTotal: {}
    }
  },
  created () {
    this.init()
  },
  computed: {
    hasSelected() {
      return this.selected.names.length > 0
    }
  },
  methods: {
    async init() {
      await this.loadProjects()
      //this.loadCompares()
      if(this.projects.length > 0){
        if(!this.form.proDetailId) {
          this.$set(this.form, 'proDetailId', this.projects[0].id)
        }
        this.toSearch()
      }else {
        this.loading = false
      }
    },
    handleSelect(item) {
      this.dialogForm.price = item.value
    },
    querySearchAsync(queryString, cb){
        if(this.poolForm[this.dialogForm.id]){
          let name = this.poolForm[this.dialogForm.id].name
          let model = this.poolForm[this.dialogForm.id].model
          request.request({
            url: '/pool/findHistoryPrices',
            method: 'get',
            params: {name: name, model: model}
          }).then(response => {
            const result = []
            response.data.map(item => {
              result.push({value: '采购价:'+item.price+'  报价:'+item.quote})
            })
            cb(result)
          })
        }else{
          cb(new Array())
        }
    },
    submitHandler() {
      let form = this.dialogForm
      form.operator = parseInt(getUser())

      request.request({
        url: '/inquiry/compareUpdateDraft',
        method: 'post',
        headers: {
          'Content-Type': 'application/json'
        },
        data: JSON.stringify(form)
      }).then(response => {
        this.$message({ message: response.message, type: 'success' })
        this.visible = false
        this.loadCompares()
      })
    },
    addPrice(row){
      this.visible = true
      console.log(row)
      this.dialogForm = JSON.parse(JSON.stringify(row))
      this.$set(this.poolForm, this.dialogForm.id, {name: row.name, model: row.model})
      //this.poolForm[this.dialogForm.id].name = row.name
    },
    getUser,
    cardLeft() {
      if (this.moveWidth < 0) {
        this.moveWidth += 238
      }
    },
    cardRight() {
      const clientWidth = document.body.clientWidth
      if (this.moveWidth > clientWidth - 200 - (this.compares.length ) * 238 ) {
        this.moveWidth -= 238
      }
    },
    /**
     * 点击批量比价
     */
    batchCompare () {
      this.priceInquiries = []
      this.suppliers = []
      this.suppliersTotal = {}
      request.request({
        url: '/compare/batchGetCompare',
        method: 'post',
        headers: {
          'Content-Type': 'application/json'
        },
        data: JSON.stringify(this.selected)
      }).then(response => {
        this.realCompares = response.data
        this.realCompares.map( item => {
          item.inquiryCompareVMS.map( i => {
            if (!this.suppliers.includes(i.supplier)) {
              this.suppliers.push(
                i.supplier
              )
            }
          })
        })
        //this.suppliers.sort()
        const realCompares = []
        const compareForm = [...this.compareForm]
        this.realCompares.map( (item, index) => {
          realCompares.push({inquiryId: item.inquiryId, name: item.name, inquiryCompareVMS: []})
          item.inquiryCompareVMS.map( inquiry => {
            if (inquiry.compareStatus === 1) {
              this.$set(this.compareForm[index], 'remark', inquiry.compareRemark)
            }
          })
          this.compareForm = compareForm
          this.suppliers.map( i => {
            let key = 0
            let data = {}

            item.inquiryCompareVMS.map( inquiry => {
              if (i == inquiry.supplier) {
                key ++
                data = inquiry
              }
            })

            if (key === 0){
              realCompares[index].inquiryCompareVMS.push({})
            }else{
              realCompares[index].inquiryCompareVMS.push(data)
            }
          })
          item.inquiryCompareVMS.map( inquiry => {
            if (inquiry.compareStatus === 1) {
              this.sumTotal(inquiry, index)
            }
          })
        })
        this.realCompares = realCompares
        // 计算报价总价
        this.countCost()
      })

      this.currentInquiry = "批量比价"
    },
    /**
     * 批量比价多选触发事件
     * @param row
     */
    handleSelectionChange(row) {
      this.realCompares = []
      const selected = {inquiryIds:[], names:[]}
      const compareForm = []
      row.map(item => {
        selected.inquiryIds.push(item.id)
        selected.names.push(item.name)
        compareForm.push({compareId: '',otherCompareId:[]})
      })
      if(row.length > this.selected.inquiryIds.length){
        this.compareForm = compareForm
        this.selected = selected
      }else {
        this.selected = selected
      }
    },
    /**
     * 比价选用按钮点击事件
     */
    submitCompare () {
      let otherCompareId = []
      const checkCompareId = []
      const remarks = []
      this.compareForm.map(item => {
        if (item.compareId) {
          checkCompareId.push(item.compareId)
        }
        if (item.otherCompareId.length > 0) {
          otherCompareId = otherCompareId.concat(item.otherCompareId)
        }
        if (item.compareId && item.remark){
          remarks.push({id: item.compareId, remark: item.remark})
        }
      })
      request.request({
        url: '/compare/completeCompare',
        method: 'post',
        headers: {
          'Content-Type': 'application/json'
        },
        data: JSON.stringify({checkCompareIds: checkCompareId, otherCompareIds: otherCompareId, remarks: remarks, inquiries: this.priceInquiries, userId: parseInt(getUser())})
      }).then(response => {
        this.$message({ message: response.message, type: 'success' })
      })
      this.compareForm.otherCompareId = []

    },
    /**
     * 比价选中供应商点击事件
     * @param value
     */
    radioChange (item, index) {
      // 计算每个供应商总价
      this.sumTotal(item, index)
      // 点击按照项目利率计算报价单价、总价
      // console.log(item)
      let compares = this.compares
      const priceInquiries = [...this.priceInquiries]
      compares.map(i => {
        if(i.id == item.inquiryId){
          i.price = (item.suPrice * (1 + i.rate/100000)).toFixed(2)
          i.totalPrice = (item.suTotalPrice * (1 + i.rate/100000)).toFixed(2)
          priceInquiries.push({
            'id': i.id,
            'price': i.price,
            'totalPrice': i.totalPrice
          })
        }
      })
      this.priceInquiries = priceInquiries
      this.compares = compares
      // 计算报价总价
      this.countCost()
    },
    /**
     * 计算报价总价
     *
     */
    countCost(){
      this.cost = 0.00
      let compareIds = []
      this.compareForm.map(cf => {
        if(cf.compareId){
          compareIds.push(cf.compareId)
        }
      })
      // console.log("compareIds",compareIds)
      let inquiryIds = []
      this.realCompares.map(rc => {
        // console.log(rc)
        let key = 0
        rc.inquiryCompareVMS.map(inquiry => {
          if(compareIds.includes(inquiry.compareId)){
            key ++
          }
        })
        if(key > 0){
          inquiryIds.push(rc.inquiryId)
        }
      })
      this.compares.map(c => {

        if(inquiryIds.includes(c.id)){
          this.cost += parseFloat(c.totalPrice)
        }
      })
    },
    sumTotal(item, index){
      this.cost = 0.00
      this.$set(this.poolForm, item.inquiryId, {name: item.name, model: item.suModel})
      const compareForm = [...this.compareForm]
      compareForm[index].compareId = item.compareId
      compareForm[index].supplier = item.supplier
      compareForm[index].suTotalPrice = parseInt(item.suTotalPrice)

      this.realCompares.map((i, index1) => {
        if (i.inquiryId == item.inquiryId) {
          if (this.compareForm[index1].compareId !== '') {
            this.compareForm[index1].otherCompareId = []
          }
          i.inquiryCompareVMS.map(inquiry => {
            if(inquiry.compareId !== item.compareId && inquiry.compareId) {
              this.compareForm[index1].otherCompareId.push(inquiry.compareId)
            }
          })
        }
      })

      let suppliersTotal = {}
      suppliersTotal['total'] = 0
      this.suppliers.forEach( supplier => {
        suppliersTotal[supplier] = 0
        compareForm.map(i => {
          if(supplier === i.supplier && i.suTotalPrice) {
            suppliersTotal[supplier] += i.suTotalPrice
            suppliersTotal['total'] += i.suTotalPrice
          }
        })
      })

      this.suppliersTotal = suppliersTotal
      this.compareForm = compareForm

    },
    /**
     * 日期时间格式转换
     */
    dateFormat,
    /**
     * 空值格式转换
     * */
    nullFormat,
    /**
     * 点击比价详情点击事件
     * @param row
     */
    compareDetail (row) {
      this.$refs.multipleTable.clearSelection()
      this.$refs.multipleTable.toggleRowSelection(row)
      this.priceInquiries = []
      this.suppliersTotal = {}
      if(this.currentInquiry != row.id){
        this.currentInquiry = row.id
        request.get('/compare/cascadeFindAllByParams', {
            params: {
              inquiryId: row.id,
              name: row.name,
            }
          })
          .then(response => {
            this.realCompares = response.data
            const realCompares = []
            const suppliers = []
            const compareForm = [{compareId: null, otherCompareId: []}]
            this.realCompares.map(item => {
              realCompares.push({inquiryId: item.inquiryId, name: item.name, inquiryCompareVMS: []})
                item.inquiryCompareVMS.forEach( (inquiry, index) => {
                  realCompares[0].inquiryCompareVMS.push(inquiry)
                  suppliers.push(inquiry.supplier)
                  if (inquiry.compareStatus === 1) {
                    compareForm[0].compareId = inquiry.compareId
                    compareForm[0].remark = inquiry.compareRemark
                  }else{
                    compareForm[0].otherCompareId.push(inquiry.compareId)
                  }
                })
            })
            this.compareForm = compareForm
            this.suppliers = suppliers
            this.realCompares.map(item => {
              item.inquiryCompareVMS.forEach( (inquiry, index) => {
                if (inquiry.compareStatus === 1) {
                  this.sumTotal(inquiry, 0)
                }
              })
            })
            this.realCompares = realCompares
            // 计算报价总价
            this.countCost()
          })

      }
    },
    /**
     * 多条件查询询价组点击事件
     */
    toSearch() {
      this.loading = true
      this.realCompares = []
      const form = {}
      form.proDetailId = this.form.proDetailId
      form.compareStatus = this.form.compareStatus
        request.request({
          url: '/compare/findByProIdOrCompareStatus',
          method: 'get',
          params: form
        })
          .then(response => {
            this.compares = response.data
            this.loading = false
          }).catch(()=>{
          this.loading = false
        })
      /*if (!this.form.proDetailId) {
        delete this.form.proDetailId
      }
      if (!this.form.compareStatus) {
        delete this.form.compareStatus
      }*/
    },
    /**
     * 加载所有项目详情（下拉框信息）
     */
    async loadProjects() {
      await request.get('/project/detail/findByAll')
        .then(response => {
          this.projects = response.data
        })
    },
    /**
     * 页面初始化时查询询价组
     */
    loadCompares() {
      request.request({
        url: '/compare/findByProIdOrCompareStatus',
        method: 'get',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
      })
        .then(response => {
          this.compares = response.data
          this.loading = false
        })
    },
  }
}
</script>

<style lang="scss">
.compare_list {
  /deep/.el-form-item__content{
    height:auto;
    line-height:32px;
    margin-left:90px!important
  }
  .ellipsis, .ellipsis div {
    overflow: hidden!important;
    white-space: nowrap!important;
    text-overflow: ellipsis!important;
  }
  .compare-container {
    width: 100%;
    display: grid;
    grid-template-rows: 1fr;
    .compare-item {
      width: auto;
      margin: 1em 0 0 0;
      position: relative;
      .item-head {
        height: 60px;
        border-radius: 6px;
        border: 1px solid #42B983;
        font-size: 20px;
        line-height: 60px;
        text-align: center;
        padding: 0;
        background: #42B983;
        width: 180px;
        color: #fff;
      }
      .item-body {
        width: 180px;
        height: auto;
        margin: 1em 0;
        padding: 1em 0;
        border-radius: 8px;
        border: 2px dotted #d9d9d9;
        overflow: hidden;
        .el-radio__inner, .el-radio__input {
          display: none
        }
        .check-div {
          background: #42b983;
          height: 30px;
          width: 128px;
          transform: rotate(45deg);
          position: absolute;
          left: 45%;
          top: 14px;
          box-shadow: 1px 1px 4px #b0b0b0;
          text-align: center;
          line-height: 30px;
          color: #fff;
          opacity: 0;
        }
        .el-radio__label {
          color: #606266;
          padding: 0;
          text-align: left;
          span {
            font-size: 12px;
            display: block;
            height: auto;
            line-height: 20.8px;
            padding: 0 1em;
            margin: 12px 0 0 0;
            white-space: normal;
          }
        }
        span {
          display: block;
          text-align: left;
        }
      }
      .item-body-select {
        box-shadow: 0 10px 25px 0 rgba(0,0,0,0.25);
        .check-div {
          opacity: 1;
        }
      }

    }
    #compareColumn {

      width: 60px;
      margin: 12px 0px 0px;
      padding: 0px;
      text-align: left;
      font-size: 12px;
      height: 20.8px;
      line-height: 20.8px;
    }
  }
  .redioGroup {
    margin: 0 auto;
    width: 100%;
    grid-template-rows: 1fr;
    .radioItem {
      width: 180px;
      height: auto;
      margin: 14px 14px;
      transform: translate(30px);
      text-align: center;
      .el-radio__label {
        display: none
      }
      .el-radio__input.is-checked .el-radio__inner {
        border-color: #42B983;
        background: #42B983;
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
