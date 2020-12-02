<template>
  <body>
    <img :src="bgUrl" alt="" class="wave">
    <div class="login-container">
      <div class="img">
        <img :src="img3Url" alt="">
      </div>
      <div class="login-box">
        <el-form ref="loginForm" :model="loginForm" :rules="loginRules" autocomplete="on" label-position="left">

          <img :src="avatarUrl" alt="" class="avatar">
          <h2>新自信智能管理平台</h2>
          <div class="input-group">
            <div class="icon">
              <i class="el-icon-user" />
            </div>
            <div>
              <h5>用户名</h5>
              <input v-model="loginForm.username" name="username" type="text" class="input">
            </div>
          </div>
          <div class="input-group">
            <div class="icon">
              <i class="el-icon-lock" />
            </div>
            <div>
              <h5>密码</h5>
              <input v-model="loginForm.password" type="password" name="password" class="input">
            </div>
          </div>
          <a href="#">Forgot Password?</a>
          <el-button :loading="loading" class="btn" @keyup.enter.native="handleLogin" @click.native.prevent="handleLogin">登 陆</el-button>

        </el-form>
      </div>
    </div>
    <a target="_blank" class="copyright">&copy;新钢自动化信息技术有限公司</a>
  </body>
</template>

<script>
import { validUsername } from '@/utils/validate'
import SocialSign from './components/SocialSignin'
import '@/styles/login-style.css'
import '@/assets/js/login.js'
import '@/styles/auto-style.css'

export default {
  name: 'Login',
  components: { SocialSign },
  data() {
    const validateUsername = (rule, value, callback) => {
      if (value == '') {
        callback(new Error('用户名不能为空'))
      } else {
        callback()
      }
    }
    const validatePassword = (rule, value, callback) => {
      if (value.length < 6) {
        callback(new Error('The password can not be less than 6 digits'))
      } else {
        callback()
      }
    }
    return {
      loginForm: {
      },
      loginRules: {
        username: [{ required: true, trigger: 'blur', validator: validateUsername }],
        password: [{ required: true, trigger: 'blur', validator: validatePassword }]
      },
      passwordType: 'password',
      capsTooltip: false,
      loading: false,
      showDialog: false,
      redirect: undefined,
      otherQuery: {},
      bgUrl: require('@/assets/images/bg.png'),
      avatarUrl: require('@/assets/images/avatar.svg'),
      img3Url: require('@/assets/images/img-3.svg')
    }
  },
  watch: {
    $route: {
      handler: function(route) {
        const query = route.query
        if (query) {
          this.redirect = query.redirect
          this.otherQuery = this.getOtherQuery(query)
        }
      },
      immediate: true
    }
  },
  created() {
    // window.addEventListener('storage', this.afterQRScan)
    var t = this;
    document.onkeydown = function(e){
      if(window.event == undefined){
        var key = e.keyCode;
      }else{
        var key = window.event.keyCode;
      }
      //enter的ASCII码是13
      if(key == 13){
        t.handleLogin();
      }
    }
  },
  mounted() {
    const inputs = document.querySelectorAll('.input')

    inputs.forEach(input => {
      input.addEventListener('focus', () => {
        input.parentNode.parentNode.classList.add('focus')
      })

      input.addEventListener('blur', () => {
        if (input.value === '') {
          input.parentNode.parentNode.classList.remove('focus')
        }
      })
    })
  },
  destroyed() {
    // window.removeEventListener('storage', this.afterQRScan)
  },
  methods: {
    checkCapslock({ shiftKey, key } = {}) {
      if (key && key.length === 1) {
        if (shiftKey && (key >= 'a' && key <= 'z') || !shiftKey && (key >= 'A' && key <= 'Z')) {
          this.capsTooltip = true
        } else {
          this.capsTooltip = false
        }
      }
      if (key === 'CapsLock' && this.capsTooltip === true) {
        this.capsTooltip = false
      }
    },
    showPwd() {
      if (this.passwordType === 'password') {
        this.passwordType = ''
      } else {
        this.passwordType = 'password'
      }
      this.$nextTick(() => {
        this.$refs.password.focus()
      })
    },
    handleLogin() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true
          this.$store.dispatch('user/login', this.loginForm)
            .then(() => {
              this.$router.push({ path: this.redirect || '/', query: this.otherQuery })
              this.loading = false
            })
            .catch(() => {
              this.loading = false
            })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    getOtherQuery(query) {
      return Object.keys(query).reduce((acc, cur) => {
        if (cur !== 'redirect') {
          acc[cur] = query[cur]
        }
        return acc
      }, {})
    }
    // afterQRScan() {
    //   if (e.key === 'x-admin-oauth-code') {
    //     const code = getQueryObject(e.newValue)
    //     const codeMap = {
    //       wechat: 'code',
    //       tencent: 'code'
    //     }
    //     const type = codeMap[this.auth_type]
    //     const codeName = code[type]
    //     if (codeName) {
    //       this.$store.dispatch('LoginByThirdparty', codeName).then(() => {
    //         this.$router.push({ path: this.redirect || '/' })
    //       })
    //     } else {
    //       alert('第三方登录失败')
    //     }
    //   }
    // }
  }
}
</script>

<style lang="scss" scope>
  @keyframes init {
    0% {opacity:0;margin-left:10%;}

    100% {opacity: 1;margin-left:0px;}
  }
  @keyframes img-init {
    0% {opacity:0;top:-100%}
    50% {opacity:0;top:-10%}
    100% {opacity:1;top:0}
  }
  @keyframes form-init {
    0% {opacity:0;bottom:-10%}
    50% {opacity:0;bottom:-10%}
    100% {opacity:1;bottom:0}
  }
  @keyframes word-init {
    0% {opacity:0;}
    40% {opacity:0;width:0;}
    100% {opacity:1;width:100%}
  }
  body{
    overflow: hidden;
    animation:init 0.5s;
    -moz-animation:init 0.5s; /* Firefox */
    -webkit-animation:init 0.5s; /* Safari and Chrome */
    -o-animation:init 0.5s; /* Opera */

  }
  .img img{
    position: relative;
    animation:img-init 1s ease;
    -moz-animation:img-init 1s ease; /* Firefox */
    -webkit-animation:img-init 1s ease; /* Safari and Chrome */
    -o-animation:img-init 1s ease; /* Opera */
    transition: all .5s;
    -moz-transition: all .5s;	/* Firefox 4 */
    -webkit-transition: all .5s;	/* Safari 和 Chrome */
    -o-transition: all .5s;	/* Opera */
  }
  .avatar {
    transition: all .5s;
    -moz-transition: all .5s;	/* Firefox 4 */
    -webkit-transition: all .5s;	/* Safari 和 Chrome */
    -o-transition: all .5s;	/* Opera */
  }
  .avatar:hover {
    transform: rotate(90deg);
    -webkit-transform: rotate(90deg);
    -webkit-transform-origin: 95% 40%;
    transform-origin: top;
    -webkit-transition: all 0.3s ease-in-out;
    transition: all 0.3s ease-in-out;
  }
  .img img:hover {
    transform: scale(1.1);
  }
  .login-box form {
    position: relative;
    animation:form-init 1s ease;
    -moz-animation:form-init 1s ease; /* Firefox */
    -webkit-animation:form-init 1s ease; /* Safari and Chrome */
    -o-animation:form-init 1s ease; /* Opera */
  }
  .login-box form h2{ font-size: 1.5em;height: 42px;white-space:nowrap;}
  .login-box form .btn{left: 50%;transform: translate(-50%);}
  .login-box form h2,.login-box form .btn{
    position: relative;
    overflow:hidden;
    animation:word-init 1.5s ease;
    -moz-animation:word-init 1.5s ease; /* Firefox */
    -webkit-animation:word-init 1.5s ease; /* Safari and Chrome */
    -o-animation:word-init 1.5s ease; /* Opera */
  }

</style>
