<template>
  <div class="compare_new">
    <!--<div class="btns" style="padding:1em;margin-bottom:1em;background:#fff">
      <el-select v-model="searchForm.purchaseProId" style="margin-right: 6px" filterable clearable placeholder="请选择项目" value-key="name">
        <el-option v-for="item in projects" :key="item.id" :label="item.name" :value="item.id" />
      </el-select>
      <el-button style="margin-right: 6px" type="primary" icon="el-icon-search" size="small" @click="toSearch">查询</el-button>
    </div>-->
    <el-card shadow="never">
      <div slot="header" class="index-md-title">
        <span>项目表</span>
      </div>
      <a-table v-loading="loading" :rowKey="record => record.id" :data-source="projects" size="middle">
        <a-table-column title="序号" :width="60">
          <template slot-scope="text, record, index">
            {{index+1}}
          </template>
        </a-table-column>
        <a-table-column :sorter="(a, b) => a.name.localeCompare(b.name)" @filter="onFilter" @filterDropdownVisibleChange="onFilterDropdownVisibleChange" :scopedSlots="scopedSlots" ellipsis="true" key="name" title="项目名称" data-index="name">
          <template slot="filterDropdown" slot-scope="{ setSelectedKeys, selectedKeys, confirm, clearFilters, column }"
                    style="padding: 8px">
            <a-input
              v-ant-ref="c => (searchInput = c)"
              :placeholder="`查找项目名`"
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
        <!--<a-table-column :sorter="(a, b) => a.name.localeCompare(b.name)" @filter="onFilter"
                        @filterDropdownVisibleChange="onFilterDropdownVisibleChange"
                        :scopedSlots="scopedSlots" ellipsis="true"
                        key="name" title="项目名称" data-index="name">
          <ColumnSearch/>
        </a-table-column>-->
        <a-table-column ellipsis="true" key="content" title="内容" data-index="content" />
        <a-table-column ellipsis="true" key="remark" title="备注" data-index="remark" />
        <a-table-column ellipsis="true" key="sysUser.username" title="创建人" data-index="sysUser.username" />
        <a-table-column ellipsis="true" key="time" title="创建时间" data-index="time">
          <template slot-scope="text,record">{{dateFormat(text)}}</template>
        </a-table-column>
        <a-table-column ellipsis="true" key="sysUser1.username" title="修改人" data-index="sysUser1.username" />
        <a-table-column ellipsis="true" key="updateTime" title="修改时间" data-index="updateTime">
          <template slot-scope="text,record">{{dateFormat(text)}}</template>
        </a-table-column>
        <a-table-column title="操作" align="center" width="180">
          <template slot-scope="text, record, index">
            <el-button type="primary" size="mini" @click="toCompare(record.id)">比价</el-button>
          </template>
        </a-table-column>
      </a-table>
    </el-card>
  </div>
</template>
<script>
  import request from '@/utils/request'
  import qs from 'querystring'
  import '@/styles/auto-style.css'
  import { getUser } from '@/utils/auth'
  import { onFilterDropdownVisibleChange, onFilter, handleReset, handleSearch} from '@/utils/column-search'
  import { dateFormat } from '@/utils/format'

  const scopedSlots = {
    filterDropdown: 'filterDropdown',
    filterIcon: 'filterIcon',
    customRender: 'customRender',
  }

  export default {
    data() {
      return {
        searchForm: {},
        scopedSlots,
        searchText: '',
        searchedColumn: '',
        searchInput: null,
        loading: false,
        projects: [],

      }
    },
    created() {
      this.init()
    },
    methods: {
      dateFormat,
      onFilterDropdownVisibleChange,
      onFilter,
      handleReset,
      handleSearch,
      toSearch() {},
      toCompare(proDetailId) {
        this.$router.push({ path: "/compare/compare", query: { proDetailId: proDetailId}})
      },
      init() {
        this.loadProjects()
      },
      loadProjects() {
        request.get('/project/detail/findByAll')
          .then(response => {
            this.projects = response.data
            this.loading = false
          })
      },
    }
  }
</script>
<style lang="scss" scoped>

</style>
