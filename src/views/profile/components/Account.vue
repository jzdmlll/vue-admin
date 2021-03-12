<template>
  <div class="profile-account">
    <el-form ref="form" :rules="rules" :model="form" status-icon>
      <el-form-item label="用户名" label-width="80px" prop="name">
        <el-input v-model.trim="form.name" />
      </el-form-item>
      <el-form-item label="原密码" label-width="80px" prop="oldPassword">
        <el-input v-model="form.oldPassword" show-password/>
      </el-form-item>
      <el-form-item label="新密码" label-width="80px" prop="newPassword">
        <el-input v-model="form.newPassword" show-password/>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submit">更新</el-button>
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
          name: '',
          oldPassword: '',
          newPassword: '',
        }
      }
    }
  },
  data() {
    var validPassword = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('不能为空'));
      }
      getAction('/user/validOldPassword', { password: value})
        .then(resp => {
          if(resp.data == true) {
            callback()
          }else {
            callback(new Error(resp.message))
          }
        }).catch(()=>{
        callback(new Error('后台异常'))
      })
    };
    return {
      form: {
        name: '',
        oldPassword: '',
        newPassword: '',
      },
      rules: {
        oldPassword: [
          {validator: validPassword, trigger: 'blur'}
        ],
        newPassword: [
          {required: true, message: '不能为空', trigger: 'blur'}
        ]
      }
    }
  },
  created() {
    this.form = this.user
  },
  methods: {
    submit() {

      this.$refs['form'].validate((valid) => {
        if (valid) {
          postActionByQueryString('/user/saveOrUpdate', {
            id: getUser(),
            username: this.user.name,
            password: this.user.newPassword
          }).then(resp => {
            this.$message({
              message: '操作成功',
              type: 'success',
              duration: 3 * 1000
            })
            setTimeout(()=>{
              this.$alert('密码已修改，请重新登录', '警告', {
                confirmButtonText: '确定',
                callback: action => {
                  logout()
                }
              });
            },1000)

          })
        }else {
          console.log('error commit')
          return false
        }
      })

      /*this.$message({
        message: 'User information has been updated successfully',
        type: 'success',
        duration: 5 * 1000
      })*/
    }
  }
}
</script>

<style lang="scss" scoped>
  @import "~@/styles/auto-style.css";

  .profile-account {
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
