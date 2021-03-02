<template>
  <!-- 设备签收确认 -->
  <div class="equipment-sign">
    <div class="btns" style="padding: 1em; margin-bottom: 1em; background: #fff">

    </div>

  </div>
</template>
<script>
  import { getUser } from "@/utils/auth";
  import { getAction, postActionByJson, postActionByQueryString } from "@/api/manage";
  import { dateTimeFormat } from "@/utils/format";
  import elDragDialog from "@/directive/el-drag-dialog";

  export default {
    directives: { elDragDialog },
    data() {
      return {

      }
    },
    created() {

    },
    method: {

    }
  }
</script>
<style lang="sass" scope>
  @import "~@/styles/auto-style.css"

</style>
