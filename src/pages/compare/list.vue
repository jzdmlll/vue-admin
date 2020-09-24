<template>
  <div class="compare_list">
    <div class="btns" style="padding:1em;margin-bottom:1em;background:#fff">
      <el-select v-model="form.proDetailId" style="margin-right: 6px" filterable clearable placeholder="请选择项目" value-key="name">
        <el-option v-for="item in projects" :key="item.id" :label="item.name" :value="item.id" />
      </el-select>
      <el-select v-model="form.compareStatus" style="margin-right: 6px" clearable placeholder="选择比价状态" value-key="name">
        <el-option v-for="item in select" :key="item.status" :label="item.name" :value="item.status" />
      </el-select>
      <el-button style="margin-right: 6px" type="primary" icon="el-icon-search" size="small" @click="toSearch">查询</el-button>
    </div>
    <div style="padding:1em;margin-bottom:1em;background:#fff;position: relative">
      <el-table :height="compares.length>4?200:''" v-loading="loading" :data="compares" size="small">
        <el-table-column type="index" prop="" label="序号" width="120" />
        <el-table-column prop="name" label="询价名" />
        <el-table-column prop="params" label="参数" />
        <el-table-column label="操作" align="center" width="180">
          <template slot-scope="scope">
            <el-tooltip class="item" effect="dark" content="查看比价" placement="bottom-start">
              <el-button type="primary" size="mini" @click="compareDetail(scope.row)" >比价详情</el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <div style="position:relative;overflow-x: auto">
      <div class="compare-container" :style="{gridTemplateColumns: '100px '+'repeat('+realCompares.length+', 1fr)',width:realCompares.length*238+100+'px'}">
        <div class="compare-item" :slot="realCompares[0]" v-if="realCompares.length>0" style="color: #42B983">
          <div class="item-head" style="width: 0;overflow:hidden;border: none"></div>
          <div class="item-body" style="border: none">
            <span id="compareColumn" v-for="key in Object.keys(realCompares[0])" v-if="compareColumns.includes(key)">
              {{compareColumnsValue[key]}}
            </span>
          </div>
        </div>
        <div class="compare-item my-transition" v-for="item in realCompares" >
          <el-radio @change="radioChange" border v-model="compareForm.compareId"  class="item-head my-transition"
                    :label="item.compareId" :class="{'item-head-select':item.compareId == compareForm.compareId?true:false}">{{item.supplier}}</el-radio>
          <div class="item-body my-transition" :class="{'item-body-select':item.compareId == compareForm.compareId?true:false}">
            <span v-for="key in Object.keys(item)" v-if="compareColumns.includes(key)">
              {{(key==='warranty' || key==='suDelivery')?(dateFormat(parseInt(item[key]))):item[key]}}
            </span>
          </div>
        </div>
      </div>
      <el-button :loading="submitLoading" v-if="compareForm.compareId" style="right:60px;bottom:1em;position:absolute" type="primary" size="small" @click="submitCompare">{{submitLoading?'':'选用'}}</el-button>
    </div>
    </div>
  </div>
</template>

<script>
import request from '@/utils/request'
import qs from 'querystring'
import '@/styles/auto-style.css'
import { dateFormat } from '@/utils/format'

export default {
  data () {
    return {
      form: {},
      projects: [],
      select: [{ status: 0, name: '未比价' }, { status: 1, name: '已比价' }],
      compares: [],
      realCompares: [],
      compareColumns: ['brand','warranty','suModel','model','suRemark','suDelivery','suWarranties','unit',
        'suParams','suPrice','suTotalPrice','number','device'],
      compareColumnsValue: {'brand':'品牌','warranty':'质保期','suModel':'型号(商)','model':'型号'
        ,'suRemark':'备注(商)','suDelivery':'货期(商)','suWarranties':'资质','unit':'单位',
        'suParams':'参数(商)','suPrice':'单价(商)','suTotalPrice':'总价(商)','number':'数量(商)','device':'设备'},
      compareForm: {compareId:'',otherCompareId:[]},
      loading: true,
      submitLoading: false,
      currentProDetailId: ''
    }
  },
  created () {
    this.loadProjects()
    this.loadCompares()
  },
  methods: {
    submitCompare () {
      this.submitLoading = true
      this.compareForm.otherCompareId.splice(this.compareForm.otherCompareId.findIndex(item => item == this.compareForm.compareId), 1)
      request.request({
        url: '/compare/completeCompare',
        method: 'post',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: qs.stringify(this.compareForm)
      }).then(response => {
        this.$message({ message: response.message, type: 'success' })
        this.submitLoading = false
      })
      this.compareForm.otherCompareId = []
      this.realCompares.map(item => {
        this.compareForm.otherCompareId.push(
          item.compareId
        )
      })
    },
    radioChange (value) {
      this.compareForm.compareId = value
    },
    dateFormat,
    compareDetail (row) {
      if(this.currentProDetailId != row.proDetailId){
        this.currentProDetailId = row.proDetailId
        request.get('/compare/cascadeFindAllByParams?proDetailId='+row.proDetailId+'&name='+row.name)
          .then(response => {
            this.realCompares = response.data
            this.compareForm.otherCompareId = []
            this.realCompares.map(item => {
              this.compareForm.otherCompareId.push(
                item.compareId
              )
            })
          })
      }
    },
    toSearch() {
      this.loading = true
      this.form.proDetailId = parseInt(this.form.proDetailId)
      this.form.compareStatus = parseInt(this.form.compareStatus)
      request.request({
        url: '/compare/cascadeFindAll',
        method: 'post',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: qs.stringify(this.form)
      })
        .then(response => {
          this.compares = response.data
          this.loading = false
        })
      if (!this.form.proDetailId) {
        delete this.form.proDetailId

      }
      if (!this.form.compareStatus) {
        delete this.form.compareStatus
      }
    },
    loadProjects() {
      request.get('/project/detail/findByAll')
        .then(response => {
          this.projects = response.data
        })
    },
    loadCompares() {
      request.get('/compare/cascadeFindAll')
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
  .compare-container {
    width: 100%;
    display: grid;
    grid-template-rows: 1fr;
    padding: 1em 0;
    margin: 0 auto;
    .compare-item {
      width: auto;
      margin: 1em 1em 2em 1em;
      .item-head {
        width: 180px;
        height: 60px;
        border-radius: 6px;
        border: 1px solid #42B983;
        font-size: 20px;
        line-height: 60px;
        text-align: center;
        color: #42B983;
        padding: 0;
        .el-radio__inner {
          display: none
        }
        .el-radio__label {
          color: #42b983;
          font-size: 20px;
          padding: 0;
        }
      }
      .item-body {
        width: 180px;
        height: auto;
        margin: 1em 0;
        padding: 1em 0;
        border-radius: 8px;
        border: 1px dotted #d9d9d9;
        span {
          display: block;
          padding: 12px 12px 0 12px;
          text-align: left;
        }
      }
       .item-body-select {
        box-shadow: 0 10px 25px 0 rgba(0,0,0,0.25);
        width: 220px;
      }
       .item-head-select {
        background: #42B983;
        width: 220px;
        color: #fff;
      }
      .item-head-select .el-radio__label {
        color: #fff;
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
}
</style>
