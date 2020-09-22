<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App'
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
