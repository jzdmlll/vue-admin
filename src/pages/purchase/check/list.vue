<template>
  <div class="purchase-check">
    <div class="btns" style="padding:1em;margin-bottom:1em;background:#fff">
      <el-cascader
        v-model="searchForm.contractId"
        :options="proAndContracts"
        :props="props"
        @change="handleChange">
        <template slot-scope="{ node, data }">
          <div v-if="!node.isLeaf">
            <span>{{ data.label }}</span>
          </div>
          <div v-else>
            <span>{{ data.label.contractName }}</span>
            <span>{{ 1 }}</span>
          </div>
        </template>
      </el-cascader>
    </div>
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
              console.log(node)
              let nodes = []
              const projectId = node.data.value
              getAction('/purchase/contract/findByProjectId', {projectId: projectId})
                .then( resp => {
                  let nodes = []
                  resp.data.map(item => {
                    nodes.push({
                      value: item.id,
                      label: item,
                      leaf: level >= 1
                    })
                  })
                  // 通过调用resolve将子节点数据返回，通知组件数据加载完成
                  resolve(nodes)
                })
              break
          }
          /*setTimeout(() => {
            const nodes = Array.from({ length: level + 1 })
              .map(item => ({
                value: 1,
                label: `选项1`,
                leaf: level >= 1
              }));
            // 通过调用resolve将子节点数据返回，通知组件数据加载完成
            resolve(nodes);
          }, 1000);*/
        }
      }
      return {
        proAndContracts: [],
        searchForm: {},

        props: props,
      }
    },
    created() {
      this.init()
    },
    methods: {
      init() {

      },
      handleChange() {

      },
    }
  }
</script>
<style lang="scss" scoped>
  .purchase-check {

  }
</style>
