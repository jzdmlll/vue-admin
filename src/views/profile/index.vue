<template>
  <div class="app-container">
    <div v-if="user">
      <el-row :gutter="20">

        <el-col :span="6" :xs="24">
          <user-card :user="user" />
        </el-col>

        <el-col :span="18" :xs="24">
          <el-card>
            <el-tabs v-model="activeTab">
              <!--<el-tab-pane label="Activity" name="activity">
                <activity />
              </el-tab-pane>
              <el-tab-pane label="Timeline" name="timeline">
                <timeline />
              </el-tab-pane>-->
              <el-tab-pane label="修改密码" name="account">
                <account :user="user" />
              </el-tab-pane>
              <el-tab-pane label="绑定邮箱" name="emailBind">
                <emailBind :user="user" />
              </el-tab-pane>
            </el-tabs>
          </el-card>
        </el-col>

      </el-row>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import UserCard from './components/UserCard'
import Activity from './components/Activity'
import Timeline from './components/Timeline'
import Account from './components/Account'
import EmailBind from './components/EmailBind'

export default {
  name: 'Profile',
  components: { UserCard, Activity, Timeline, Account, EmailBind },
  data() {
    return {
      user: {},
      activeTab: 'account'
    }
  },
  computed: {
    ...mapGetters([
      'name',
      'avatar',
      'roles',
      'email'
    ])
  },
  created() {
    this.getUser()
  },
  methods: {
    getUser() {
      this.user = {
        name: this.name,
        role: this.roles.map(item=>{ return item.name}).join(),
        email: this.email,
        avatar: this.avatar
      }
      // console.log(this.user.role)
    }
  }
}
</script>
