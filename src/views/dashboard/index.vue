<template>
  <div class="dashboard-container">
    <component :is="currentRole" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import adminDashboard from './admin'
import editorDashboard from './editor'

export default {
  name: 'Dashboard',
  components: { adminDashboard, editorDashboard },
  data() {
    return {
      currentRole: 'adminDashboard'
    }
  },
  computed: {
    ...mapGetters([
      'roles'
    ])
  },
  created() {
    if (!this.roles.includes('管理员')) {
      this.currentRole = 'editorDashboard'
    }
  }
}
</script>

<style>
  @media screen and (max-width: 768px) {
    .pan-item{
		float: none!important;
		margin: 0 auto;
		display: block!important;
	}
	.info-container{
		margin-left:0!important;
		text-align:center
	}
	.info-container .display_name{
	    display: block;
		left: 0;
		right: 0;
		margin: 0 auto;
	}
	.dashboard-editor-container img{
		width:100%!important
	}
  }
</style>
