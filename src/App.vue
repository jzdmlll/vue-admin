<template>
  <div id="app">
    <a-locale-provider :locale="zh_CN">
      <router-view />
    </a-locale-provider>
  </div>
</template>

<script>
  import zh_CN from 'ant-design-vue/lib/locale-provider/zh_CN';
  import moment from 'moment';
  import 'moment/locale/zh-cn';

  moment.locale('zh-cn');
  export default {
    name: 'App',

    data() {
      return {
        zh_CN,
      }
    }
  }
</script>

<style lang="css">

  li {
    text-align: left;
  }
  body {
    overflow: auto!important;
  }
  .sidebar-logo-link {
    text-align: center;
  }
</style>
