<template>
  <div class="contract-sale-detail">
    <div class="my-header">
      <el-row :gutter="20">
        <el-col :span="16"><div class="grid-content bg-purple">
          <h2>销售合同:</h2>
        </div></el-col>
        <el-col :span="8"><div class="grid-content bg-purple"></div></el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="8"><div class="grid-content bg-purple"></div></el-col>
        <el-col :span="8"><div class="grid-content bg-purple"></div></el-col>
        <el-col :span="4"><div class="grid-content bg-purple"></div></el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
    export default {
        name: "detail.vue",

      data(){

        return{

        }
      },

    }

</script>

<style lang="scss" scoped>
.contract-sale-detail {
  .my-header {
    height: 188px;
    width: 100%;
    border-bottom: 1px solid #e8e8e8;
    padding: 16px 16px 0 16px;
    background-color: #fff;
    h2 {
      width: 567px;
      height: 28px;
      font-weight: 100;
    }
  }
}
</style>
