<template>
  <!-- 角色管理 -->
  <div class="role_list">
    <div class="btns" style="padding:1em;margin-bottom:1em;background:#fff">
      <!--<el-tooltip class="item" effect="dark" content="添加" placement="bottom-start">
        <el-button type="primary" icon="el-icon-plus" size="small" @click="toAdd">添加</el-button>
      </el-tooltip>-->
    </div>
    <div style="padding:1em;margin-bottom:1em;background:#fff">

    </div>
  </div>
</template>
<script>
  import request from '@/utils/request'
  import qs from 'querystring'
  import '@/styles/auto-style.css'
  import { dateTimeFormat,nullFormat } from '@/utils/format'

  export default {
    data() {
      return {
      }
    },
    created() {
    },
    methods: {


    }
  }
</script>
