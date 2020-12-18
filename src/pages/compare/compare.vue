<template>
  <div class="compare_compare">
    <div class="btns" style="padding:1em;margin-bottom:1em;background:#fff;">
      <span :style="opacity==1?{opacity: opacity}:{opacity: 0, display: 'none'}" class="draw-fixed-button el-icon-arrow-down my-transition" @click="()=>{this.drawer=true; this.loadInquiries()}"></span>
    </div>
    <div class="table-container">
      <el-card v-for="card in compares" shadow="never">
        <div slot="header" class="index-md-title">
          <span>【{{nullFormat(card.inquiry.name)}}】|【{{nullFormat(card.inquiry.model)}}】|【{{nullFormat(card.inquiry.realBrand)}}】|【{{nullFormat(card.inquiry.params)}}】|【{{nullFormat(card.inquiry.number)}}】</span>
        </div>
        <a-table
          size="small"
          :rowKey="record => record.id"
          :date-source="card.quoteList"
          :loading="comparesLoading"
          >

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
          <el-button @click="setInquiryRate" style="float:right;" type="primary"  size="mini">设置利率</el-button>
        </div>
        <a-table
          size="small"
          :pagination="{pageSize: 8}"
          ref="inquiries"
          :rowKey="record => record.id"
          :loading="inquiriesLoading"
          :data-source="inquiries"
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
          <a-table-column key="action" title="操作" align="center" :width="100">
            <template slot-scope="text, record">
              <el-button @click="toCompare(record.id)" type="primary" size="mini" style="padding: 7px 10px;">比价</el-button>
            </template>
          </a-table-column>
        </a-table>
      </el-card>
    </el-drawer>
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
        drawer: false,
        opacity: 0,

        inquiriesLoading: false,
        inquiries: [],

        proDetailId: null,
        scopedSlots,
        searchText: '',
        searchedColumn: '',
        searchInput: null,

        selectedKeys: [],

        compares: [],
        comparesLoading: false,
      }
    },
    created() {
      this.init()
    },
    methods: {
      nullFormat,
      toCompare(id) {
        this.selectedKeys.push(id)
        this.compareRequest()
      },
      compareRequest() {
        this.comparesLoading = true
        request.request({
          url: '/compare/findQuoteByInquiryId',
          method: 'post',
          data: qs.stringify({inquiryIds: this.selectedKeys})
        }).then(resp => {
          this.compares = resp.data
          this.comparesLoading = false
        }).catch(()=>{
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
  }
</style>
