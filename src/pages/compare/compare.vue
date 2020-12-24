<template>
  <div class="compare_compare">
    <div class="btns" style="margin-bottom:1em;background:#fff;position:absolute;">
      <span :style="opacity==1?{opacity: opacity}:{opacity: 0, display: 'none'}" class="draw-fixed-button el-icon-arrow-down my-transition" @click="()=>{this.drawer=true; this.loadInquiries()}"></span>
    </div>
    <div class="table-container">
      <el-card v-for="card in compares" :key="card.inquiry.id" shadow="never">
        <div slot="header" class="index-md-title">

          <span>【{{nullFormat(card.inquiry.name)}}】|【{{nullFormat(card.inquiry.model)}}】|【{{nullFormat(card.inquiry.realBrand)}}】|【{{nullFormat(card.inquiry.params)}}】|【{{nullFormat(card.inquiry.number)}}】</span>
          <span style="color: red">【利率：<span>{{rate[card.inquiry.id]}}</span>%】</span>
          <span v-if="remark[card.inquiry.id]" style="color: #606266">【备注：<span>{{remark[card.inquiry.id]}}</span>】</span>
          <el-button icon="el-icon-plus" type="primary" size="mini" @click="addPrice(card.inquiry)" style="float: right;margin-right:5px"></el-button>
          <el-button type="primary" size="mini" @click="addRemark(card.inquiry)" style="float: right;margin-right:5px">备注</el-button>
        </div>
        <a-table
          class="compare-table"
          size="small"
          :rowKey="record => record.id"
          :data-source="card.quotes"
          :pagination = false
          :loading="comparesLoading"
          :row-class-name="tableRowClassName"
          :row-selection="{ selectedRowKeys: selectedRowKey[card.inquiry.id], onChange: onSelectChange, type: 'radio' }"
          >
          <a-table-column  key="supplier" title="供应商" data-index="supplier" />
          <a-table-column align="center" key="suModel" v-slot:title="title" data-index="suModel">
            <span slot="title" >型号<p :class="{'table-column-p': card.inquiry.model?true:false}"><a-icon v-if="card.inquiry.model" type="like" />【{{card.inquiry.model}}】</p></span>
          </a-table-column>
          <a-table-column align="center" key="suParams" v-slot:title="title" data-index="suParams">
            <span slot="title">参数<p :class="{'table-column-p': card.inquiry.params?true:false}"><a-icon v-if="card.inquiry.params" type="like" />【{{card.inquiry.params}}】</p></span>
          </a-table-column>
          <a-table-column align="center" key="suPrice" title="单价" data-index="suPrice" />
          <a-table-column align="center" key="suTotalPrice" title="总价" data-index="suTotalPrice" />
          <a-table-column align="center" key="suBrand" v-slot:title="title" data-index="suBrand">
            <span slot="title">品牌<p :class="{'table-column-p': card.inquiry.realBrand?true:false}"><a-icon v-if="card.inquiry.realBrand" type="like" />【{{card.inquiry.realBrand}}】</p></span>
          </a-table-column>
          <a-table-column align="center" key="suDelivery" title="货期" data-index="suDelivery" />
          <a-table-column align="center" key="warranty" title="质保期" data-index="warranty" />
        </a-table>
      </el-card>
    </div>
    <el-drawer
      :visible.sync="drawer"
      size="550px"
      :wrapperClosable="true"
      :with-header="false"
      direction="ttb"
      :before-close="drawerClose">
      <el-card shadow="never">
        <div slot="header" class="index-md-title">
          <span>询价表</span>
          <el-button :style="hasSelected?{display: 'inline-block'}:{display: 'none'}" @click="batchCompare" type="primary"  size="mini">批量比价</el-button>
          <el-button @click="setInquiryRate" style="float:right;" type="primary"  size="mini">设置利率</el-button>
        </div>
        <a-table
          size="small"
          :pagination="{pageSize: 8}"
          ref="inquiries"
          :rowKey="record => record.id"
          :loading="inquiriesLoading"
          :data-source="inquiries"
          :row-selection="{ selectedRowKeys: selectedInquiryIds, onChange: onInquirySelectChange}"
        >
          <a-table-column title="序号" :width="50">
            <template slot-scope="text, record, index">
              {{index+1}}
            </template>
          </a-table-column>
          <a-table-column :sorter="(a, b) => a.name.localeCompare(b.name)" ellipsis="true"
                          key="name" title="设备名" data-index="name"
                          @filter="onFilter" @filterDropdownVisibleChange="onFilterDropdownVisibleChange" :scopedSlots="scopedSlots">
            <template slot="filterDropdown" slot-scope="{ setSelectedKeys, selectedKeys, confirm, clearFilters, column }"
                      style="padding: 8px">
              <a-input
                v-ant-ref="c => (searchInput = c)"
                :placeholder="`查找设备名`"
                :value="selectedKeys[0]"
                style="width: 188px; margin-bottom: 8px; display: block;"
                @change="e => setSelectedKeys(e.target.value ? [e.target.value] : [])"
                @pressEnter="() => handleSearch(selectedKeys, confirm, column.dataIndex)"
              />
              <el-button
                type="primary"
                icon="el-icon-search"
                size="small"
                style="width: 90px; margin-right: 8px"
                @click="() => handleSearch(selectedKeys, confirm, column.dataIndex)"
              >
                查找
              </el-button>
              <el-button size="small" style="width: 90px" @click="() => handleReset(clearFilters)">
                重置
              </el-button>
            </template>
          </a-table-column>
          <a-table-column ellipsis="true" key="model" title="型号" data-index="model" />
          <a-table-column ellipsis="true" key="params" title="参数" data-index="params" />
          <a-table-column ellipsis="true" key="number" align="center" :width="60" title="数量" data-index="number" />
          <a-table-column ellipsis="true" key="unit" align="center" :width="50" title="单位" data-index="unit" />
          <a-table-column ellipsis="true" key="inquiryRate" :width="60" align="center" title="利率" data-index="inquiryRate">
            <template slot-scope="text, record, index">
              {{parseFloat(text)/1000}}%
            </template>
          </a-table-column>
          <a-table-column ellipsis="true" key="price" title="拟定报价单价" data-index="price" />
          <a-table-column ellipsis="true" key="totalPrice" title="拟定报价总价" data-index="totalPrice" />
          <a-table-column ellipsis="true" key="realBrand" title="品牌" data-index="realBrand" />
          <a-table-column ellipsis="true" key="remark" title="备注" data-index="remark" />
          <a-table-column :sorter="(a, b) => a.unCompare - b.unCompare" defaultSortOrder="descend" key="unCompare" title="状态" :width="100" data-index="unCompare" align="center">
            <template slot-scope="text, record, index">
              <el-tag :type="text == 0 ? 'success':'danger'">{{ text == 0 ? '已完成':'未完成' }}</el-tag>
            </template>
          </a-table-column>
          <a-table-column key="action" title="操作" align="center" :width="170">
            <template slot-scope="text, record">
              <el-button @click="toCompare(record.id)" type="primary" size="mini" style="padding: 7px 10px;">比价</el-button>
            </template>
          </a-table-column>
        </a-table>
      </el-card>
    </el-drawer>

    <!-- 模态框 -->
    <el-dialog title="添加拟定报价" :visible.sync="visible">
      <el-form ref="dialogForm" :model="dialogForm"  status-icon>
        <el-row>
          <el-col :sm="24" :lg="12">
            <el-form-item label="设备名" label-width="80px" size="small" prop="proOriginId">
              {{dialogForm.name}}
            </el-form-item>
          </el-col>
          <el-col :sm="24" :lg="12">
            <el-form-item label="型号" label-width="80px" size="small" prop="proOriginId">
              {{dialogForm.model}}
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :sm="24" :lg="12">
            <el-form-item label="报价单价" label-width="80px" size="small" prop="price">
              <el-input v-model="dialogForm.price" autocomplete="off" />
            </el-form-item>
          </el-col>
          <el-col :sm="24" :lg="12">
            <el-form-item label="报价总价" label-width="80px" size="small" prop="totalPrice">
              <el-input v-model="dialogForm.totalPrice" autocomplete="off" :placeholder="dialogForm.price?(parseFloat(dialogForm.price)*dialogForm.number).toFixed(2):0"/>
            </el-form-item>
          </el-col>
        </el-row>
        <div style="margin-bottom: 12px">
          <el-input type="text"
                    v-model="dialogSearchForm.name"
                    placeholder="设备名" size="small" style="max-width: 200px;"></el-input>
          <el-input type="text"
                    v-model="dialogSearchForm.model"
                    placeholder="型号" size="small" style="max-width: 200px;"></el-input>
          <el-button type="primary" size="small" @click="poolFind">查询</el-button>
        </div>
        <el-table :data="poolData" v-loading="poolLoading" size="small" @row-click="rowClick">
          <el-table-column :show-overflow-tooltip="true" prop="name" label="设备名称" />
          <el-table-column :show-overflow-tooltip="true" prop="supplier" label="供应商" />
          <el-table-column :show-overflow-tooltip="true" prop="params" label="技术参数" />
          <el-table-column :show-overflow-tooltip="true" prop="model" label="品牌型号" />
          <el-table-column :show-overflow-tooltip="true" prop="price" label="单价" />
          <el-table-column :show-overflow-tooltip="true" prop="number" label="数量" />
          <el-table-column :show-overflow-tooltip="true" prop="delivery" label="货期" />
          <el-table-column :show-overflow-tooltip="true" prop="remark" label="备注" />
        </el-table>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="visible = false">取 消</el-button>
        <el-button type="primary" size="small" @click="dialogSubmitHandler">确 定</el-button>
      </div>
    </el-dialog>


    <div class="footer" :style="selectedRowKey[Object.keys(selectedRowKey)[0]] > 0?{display: 'block'}:{display: 'none'}">
      <el-button :loading="submitLoading"  style="right:0;margin: 0 2em 0 0" type="primary" size="small" @click="submitCompare">{{submitLoading?'':'选用'}}</el-button>
    </div>
  </div>
</template>

<script>
  import request from '@/utils/request'
  import qs from 'querystring'
  import '@/styles/auto-style.css'
  import { getUser } from '@/utils/auth'
  import { nullFormat } from '@/utils/format'
  import { onFilterDropdownVisibleChange, onFilter, handleSearch, handleReset } from '@/utils/column-search'

  export default {
    data() {
      const scopedSlots = {
        filterDropdown: 'filterDropdown',
        filterIcon: 'filterIcon',
        customRender: 'customRender',
      }
      return {
        poolData: [],
        poolLoading: false,
        dialogSearchForm: {},

        dialogForm: {},
        visible: false,
        drawer: false,
        opacity: 0,

        inquiriesLoading: false,
        inquiries: [],
        selectedInquiryIds: [],

        proDetailId: null,
        scopedSlots,
        searchText: '',
        searchedColumn: '',
        searchInput: null,

        selectedKeys: [],

        compares: [],
        comparesLoading: false,
        selectedRowKey: {},

        rate: {},
        remark: {},
        draftPrice: {},

        submitLoading: false
      }
    },
    computed: {
      hasSelected() {
        return this.selectedInquiryIds.length > 0
      }
    },
    created() {
      this.init()
    },
    methods: {
      addRemark(inquiry) {
        this.$prompt('请输入备注', '填写备注', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          //inputPattern: /^[1-9][0-9]*([\.][0-9]{1,2})?$/,
          //inputErrorMessage: '格式不正确'
        }).then(({ value }) => {
          this.$set(this.remark, inquiry.id, value)
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '取消输入'
          })
        })
      },
      submitCompare() {

        let quoteList = []
        const selecteds = Object.keys(this.selectedRowKey)
        selecteds.map(item => {
          if (this.selectedRowKey[item][0]) {
            quoteList.push({
              id: this.selectedRowKey[item][0],
              inquiryId: item,
              operator: getUser(),
              remark: this.remark[item]
            })
          }
        })
        request.request({
          url: '/compare/compareResultCommit',
          method: 'post',
          headers: {
            'Content-Type': 'application/json'
          },
          data: JSON.stringify({quoteList: quoteList})
        }).then(resp => {
          this.$message({ message: resp.message, type: 'success' })
        })
      },
      getUser,
      getRate(suPrice, draftPrice, inquiryId) {
        let rate = 0
        if(suPrice && draftPrice) {
          rate = ((parseFloat(draftPrice) - parseFloat(suPrice))/parseFloat(suPrice)).toFixed(2)
        }
        this.$set(this.rate, inquiryId, rate)
      },
      dialogSubmitHandler() {
        let form = this.dialogForm
        form.operator = parseInt(getUser())
        if(!form.totalPrice || form.totalPrice == 0) {
          form.totalPrice = (parseFloat(form.price)*form.number).toFixed(2)
        }
        request.request({
          url: '/compare/compareUpdateDraft',
          method: 'post',
          headers: {
            'Content-Type': 'application/json'
          },
          data: JSON.stringify(form)
        }).then(response => {
          this.$message({ message: response.message, type: 'success' })
          let arr = []
          arr.push(form.price)
          this.$set(this.draftPrice, form.id, arr)
          this.getRate(form.suPrice, form.price, form.id)
          this.visible = false
        })
      },
      rowClick(row, column) {
        this.dialogForm.price = row.price
      },
      loadPool(name) {
        this.poolLoading = true
        request.request({
          url: '/pool/findHistoryPrices',
          method: 'get',
          params: {'name': name}
        }).then(resp => {
          this.poolData = resp.data
          this.poolLoading = false
        }).catch(() => {
          this.poolLoading = false
        })
      },
      poolFind() {
        if(this.dialogSearchForm.name || this.dialogSearchForm.model){
          request.request({
            url: '/pool/fuzzyQueryByNameOrModel',
            method: 'get',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            params: {name: this.dialogSearchForm.name, model: this.dialogSearchForm.model}
          }).then(resp => {
            this.poolData = resp.data
          })
        }else {
          this.$message({ message: "请输入查询条件", type: 'warning' })
        }
      },
      addPrice(row){
        this.visible = true
        row.totalPrice = null
        this.dialogForm = row
        this.loadPool(row.name)
      },
      batchCompare() {
        this.compareRequest(this.selectedInquiryIds)
        this.drawer = false
      },
      onInquirySelectChange(selectedRowKeys, selectedRows) {
        const rows = selectedRows.map(item => {
          if (item.id) {
            return item.id
          }
        })
        this.selectedInquiryIds = rows
      },
      onSelectChange(selectedRowKeys, selectedRows) {
        const rows = selectedRows.map(item => {
          if (item.id && item.businessAudit != 2 && item.technicalAudit != 2) {
            return item.id
          }
        })
        if(rows && rows!='') {
          this.$set(this.selectedRowKey, selectedRows[0].inquiryId, rows)
          this.dialogForm.suPrice = selectedRows[0].suPrice
          this.getRate(selectedRows[0].suPrice, this.draftPrice[selectedRows[0].inquiryId], selectedRows[0].inquiryId)
        }
      },
      tableRowClassName(row) {
        if (row.dataSource == 0 && !(row.businessAudit == 2 || row.technicalAudit == 2)) {
          return 'warning-row';
        }else if(row.businessAudit == 2 || row.technicalAudit == 2) {
          return 'danger-row'
        }
        return '';
      },
      nullFormat,
      getUser,
      toCompare(id) {
        let selectedInquiryIds = []
        selectedInquiryIds.push(id)
        this.compareRequest(selectedInquiryIds)
        this.drawer = false
      },
      compareRequest(selectedInquiryIds) {
        this.draftPrice = {}
        this.compares = []
        this.selectedRowKey = {}
        this.comparesLoading = true
        request.request({
          url: '/compare/findQuoteByInquiryId',
          method: 'post',
          data: qs.stringify({inquiryIds: selectedInquiryIds})
        }).then(resp => {
          resp.data.map( item => {
            this.$set(this.selectedRowKey, item.inquiry.id, [])
            let arr = []
            arr.push(item.inquiry.price)
            this.$set(this.draftPrice, item.inquiry.id, arr)
            //this.$set(this.selectedRowKey, item.inquiry.id, )
            this.getRate(item.suPrice, item.inquiry.price, item.inquiry.id)
            item.quotes.map(quote => {
              console.log(quote.compareStatus)
              if (quote.compareStatus == 1) {
                let arr = []
                arr.push(quote.id)
                this.$set(this.selectedRowKey, item.inquiry.id, arr)
              }
            })
          })
          this.compares = resp.data
          this.comparesLoading = false
        }).catch(()=>{
          alert('error')
          this.comparesLoading = false
        })
      },
      setInquiryRate() {
        this.$prompt('请输入利率', '批量设置利率', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputPattern: /^[1-9][0-9]*([\.][0-9]{1,2})?$/,
          inputErrorMessage: '格式不正确'
        }).then(({ value }) => {
          request.request({
            url: '/compare/setInquiryRate',
            method: 'post',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: qs.stringify({rate: parseFloat(value)*1000, proDetailId: this.proDetailId})
          }).then(resp => {
            this.$message({ message: resp.message, type: 'success' })
          })
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '取消输入'
          })
        })
      },
      onFilterDropdownVisibleChange,
      onFilter,
      handleReset,
      handleSearch,
      drawerClose() {
        this.drawer = false
      },
      init() {
        if(this.$route.query.proDetailId) {
          this.proDetailId = this.$route.query.proDetailId
        }
        /*setTimeout(() => {
          this.opacity = 1
        }, 1000)*/
        this.loadInquiries()
      },
      loadInquiries() {
        this.selectedInquiryIds = []
        if(this.proDetailId) {
          request.get("/compare/findInquiryByProDetailId?proDetailId="+this.proDetailId)
            .then(resp => {
            setTimeout(() => {
                this.opacity = 1
              }, 1000)
              this.inquiries = resp.data
            })
        }
      }
    }
  }
</script>
<style lang="scss" scoped>
  .compare_compare {
    .draw-fixed-button {
      position: fixed;
      top: -20px;
      display: block;
      background: #e1e1e1;
      border: 1px solid #b9b9b9;
      border-radius: 20px;
      width: 80px;
      cursor: pointer;
      height: 40px;
      left: calc(50% - 22px);
      text-align: center;
      line-height: 60px;
      font-size: 20px;
      color: #909399;
    }
    .compare-table {
      /deep/.warning-row {
        background: #eae2c5;
      }
      /deep/.danger-row {
        background: #f1b7b7;
      }
      .table-column-p {
        color: #1890ff
      }
    }
    /deep/.el-form-item__content{
      height:auto;
      line-height:32px;
      margin-left:90px!important
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
