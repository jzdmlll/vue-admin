<template>
  <div class="profile-emailBind">
    <el-form ref="form" :rules="rules" :model="form" status-icon>
      <el-form-item
        label="邮箱" label-width="80px" prop="email">
        <el-input :disabled="user.email?true:false" v-model.trim="form.email" type="email" />
      </el-form-item>
      <el-form-item v-if="!user.email" label="验证码" label-width="80px" prop="code">
        <el-input style="max-width: 100px" v-model="form.code"/>
        <el-button size="small" :loading="sendCodeLoading" :disabled="sendCodeText=='获取验证码'?false:true" type="primary" @click="sendCode">{{sendCodeText}}</el-button>
      </el-form-item>
      <el-form-item>
        <el-button :disabled="user.email?true:false" type="primary" @click="submit">{{user.email?'已绑定':'绑定'}}</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
  import { getAction, postActionByQueryString } from "@/api/manage"
  import { getUser } from "@/utils/auth";
  import { logout } from "@/utils/request";

  export default {
    props: {
      user: {
        type: Object,
        default: () => {
          return {
            email: '',
          }
        }
      }
    },
    data() {
      var checkEmail = (rule, value, callback) => {
        const mailReg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/
        if (!value) {
          return callback(new Error('邮箱不能为空'))
        }
        setTimeout(() => {
          if (mailReg.test(value)) {
            callback()
          } else {
            callback(new Error('请输入正确的邮箱格式'))
          }
        }, 100)
      }
      return {
        rules: {
          email: [
            {validator: checkEmail, trigger: 'blur'}
          ],
          code: [
            {required: false, message: '不能为空', trigger: 'blur'}
          ]
        },
        form: {
          email: this.user.email
        },
        sendCodeText: '获取验证码',
        sendCodeLoading: false
      }
    },
    created() {

    },
    methods: {
      sendCode() {
        this.$refs['form'].validate((valid) => {
          if (valid) {
            if (this.sendCodeText == '获取验证码') {
              this.sendCodeLoading = true
              getAction('/user/getEmailBindCode', {
                email: this.form.email
              }).then(resp=>{
                this.$message({ type: 'success', message: '发送成功' })
                this.sendCodeLoading = false
                this.sendCodeText = 60
                this.rules['code'][0]['required'] = true
                setInterval(()=>{
                  if (this.sendCodeText>=0) {
                    this.sendCodeText --
                  }else {
                    clearInterval()
                    this.sendCodeText = '获取验证码'
                    this.rules['code'][0]['required'] = false
                  }
                },1000)
              })
            }
          }else {
            console.log('error commit')
            return false
          }
        })
      },
      submit() {
        this.$refs['form'].validate((valid) => {
          if (valid) {
            postActionByQueryString('/user/bindEmail',{
              email: this.form.email,
              code: this.form.code
            }).then(resp=>{
              this.$message({ type: 'success', message: resp.message })
              this.user.email = this.form.email
              this.$store.commit("user/SET_EMAIL", this.form.email)
            }).catch(()=>{
              this.rules['code'][0]['required'] = false
            })
          } else {
            console.log('error commit')
            return false
          }
        })
      }
    }
  }
</script>

<style lang="scss" scoped>
  .profile-emailBind {
    @import "~@/styles/auto-style.css";
      /deep/.el-form-item__content{
        height:auto;
        line-height:32px;
        margin-left:90px!important
      }
      .el-input {
        max-width: 500px
      }
  }
</style>
