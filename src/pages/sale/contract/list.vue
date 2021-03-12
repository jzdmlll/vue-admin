<template>
  <div class="contract_list">
    <!--销售合同列表-->
    <div class="btns" style="padding: 1em;margin-bottom: 1em;background:#fff">
      <el-tooltip class="contract" effect="dark" content="新增项目" placement="bottom-start">
        <el-button type="primary" icon="el-icon-plus" size="mini">添加项目</el-button>
      </el-tooltip>
    </div>
  </div>
</template>


<script>

    export default {
        name: "list.uve"
    }

</script>

<style lang="scss" scoped>
  .pro_list {
    .timeline-container {
      padding: 1em;
      width: calc(221px + 4em);
      .el-icon-remove {
        color: #ff4949;
        float: right;
        transform: translate(0,4px);
        opacity: 0;
        cursor: pointer;
        margin-right: 2em;
      }
      .ant-timeline:hover > li .ant-timeline-item-content .el-icon-remove {
        opacity: 1;
      }
    }
    .outputlist_upload {
      opacity: 0;
      width: 0;
      overflow: hidden;
    }
    .importDialog {
      .el-form-item {
        /deep/.el-form-item__content {
          margin: 0 8px 0 0 !important;
        }
      }
    }
  }
</style>
