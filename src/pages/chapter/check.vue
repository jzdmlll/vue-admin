<template>
  <component :is="currentSize"></component>
</template>

<script>
  import m from "./components/m"
  import pc from "./components/pc"

  export default {
    components: { m, pc },
    data() {
      return {
        currentSize: 'pc',
        windowWidth: document.documentElement.clientWidth,
      }
    },
    mounted() {
      var that = this;
      // <!--把window.onresize事件挂在到mounted函数上-->
      window.onresize = () => {
        return (() => {
          window.fullWidth = document.documentElement.clientWidth;
          that.windowWidth = window.fullWidth; // 宽

          if (that.windowWidth < 768) {
            that.currentSize = 'm'
          }else {
            that.currentSize = 'pc'
          }
        })()
      };
    },
    created() {
      if (this.windowWidth < 768) {
        this.currentSize = 'm'
      }else {
        this.currentSize = 'pc'
      }
    },
    methods: {
    },
  }
</script>

<style>

</style>
