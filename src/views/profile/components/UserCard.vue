<template>
  <el-card style="margin-bottom:20px;">
    <div slot="header" class="clearfix">
      <span>个人信息</span>
    </div>

    <div class="user-profile">
      <div class="box-center" >
        <pan-thumb :image="user.avatar" :height="'100px'" :width="'100px'" :hoverable="false">
          <div>Hello</div>
          {{ user.role }}
          <el-tag style="cursor: pointer" effect="plain" size="medium" @click="imageCropperShow=true">
            <span class="el-icon-upload"></span>
          </el-tag>
        </pan-thumb>
      </div>
      <div class="box-center">
        <div class="user-name text-center">{{ user.name }}</div>
        <div class="user-role text-center text-muted">{{ user.role }}</div>
      </div>
    </div>

    <div class="user-bio">
      <div class="user-education user-bio-section">
        <div class="user-bio-section-header"><svg-icon icon-class="skill" /><span>简介</span></div>
        <div class="user-bio-section-body">
          <div class="text-muted">
          </div>
        </div>
      </div>

      <!--<div class="user-skills user-bio-section">
        <div class="user-bio-section-header"><svg-icon icon-class="skill" /><span>Skills</span></div>
        <div class="user-bio-section-body">
          <div class="progress-item">
            <span>Vue</span>
            <el-progress :percentage="70" />
          </div>
          <div class="progress-item">
            <span>JavaScript</span>
            <el-progress :percentage="18" />
          </div>
          <div class="progress-item">
            <span>Css</span>
            <el-progress :percentage="12" />
          </div>
          <div class="progress-item">
            <span>ESLint</span>
            <el-progress :percentage="100" status="success" />
          </div>
        </div>
      </div>-->
    </div>
    <image-cropper
      v-show="imageCropperShow"
      :key="imageCropperKey"
      field="file"
      :width="300"
      :height="300"
      :url="fileUploadUrl"
      lang-type="zh"
      @close="close"
      @crop-upload-success="cropSuccess"
    />
  </el-card>
</template>

<script>
import PanThumb from '@/components/PanThumb'
import ImageCropper from '@/components/ImageCropper'

export default {
  components: { PanThumb, ImageCropper },
  props: {
    user: {
      type: Object,
      default: () => {
        return {
          name: '',
          email: '',
          avatar: '',
          roles: ''
        }
      }
    }
  },
  data() {
    const fileUploadUrl = process.env.VUE_APP_BASE_API + 'user/uploadAvatar'
    return {
      imageCropperShow: false,
      imageCropperKey: 0,
      fileUploadUrl
    }
  },
  methods: {
    cropSuccess(resData) {
      this.imageCropperShow = false
      this.imageCropperKey = this.imageCropperKey + 1
      console.log(resData)
      this.user.avatar = resData.data
      this.$store.commit('user/SET_AVATAR', resData.data)
      this.$message({ type: 'success', message: resData.message})
    },
    close() {
      this.imageCropperShow = false
    }
  }
}
</script>

<style lang="scss" scoped>
.box-center {
  margin: 0 auto;
  display: table;
}

.text-muted {
  color: #777;
}

.user-profile {
  .user-name {
    font-weight: bold;
  }

  .box-center {
    padding-top: 10px;
  }

  .user-role {
    padding-top: 10px;
    font-weight: 400;
    font-size: 14px;
  }

  .box-social {
    padding-top: 30px;

    .el-table {
      border-top: 1px solid #dfe6ec;
    }
  }

  .user-follow {
    padding-top: 20px;
  }
}

.user-bio {
  margin-top: 20px;
  color: #606266;

  span {
    padding-left: 4px;
  }

  .user-bio-section {
    font-size: 14px;
    padding: 15px 0;

    .user-bio-section-header {
      border-bottom: 1px solid #dfe6ec;
      padding-bottom: 10px;
      margin-bottom: 10px;
      font-weight: bold;
    }
  }
}
</style>
