<template>
  <div class="purchase-check">

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
      return {}
    },
    created() {
    },
    methods: {

    }
  }
</script>
<style lang="scss" scoped>
  .purchase-check {

  }
</style>
