<template>
  <div class="chapter-detail">
    <van-nav-bar
      title="用章审核详情"
      left-text="返回"
      left-arrow
      @click-left="$router.push('/chapter/check')"
    />
    <van-cell-group>
      <van-cell title="项目名" :value="contract.projectName" />
      <van-cell title="合同编号" :value="contract.contractNo" />
      <van-cell title="单价" >￥{{toThousandFilter(contract.price)}}</van-cell>
      <van-cell title="送审人" :value="contract.sender" />
      <van-cell title="备注" :value="contract.senderRemark" />
      <van-cell title="送审时间">{{dateTimeFormat(parseInt(contract.senderTime
        ))}}</van-cell>
      <van-cell title="附件" :value="contract.file" />
      <van-cell title="类别" :value="contract.secondParty" />
      <van-cell title="主要内容" size="large" :value="contract.mainContent" />
    </van-cell-group>
    <van-cell-group title="审核意见">
      <van-field v-model="contract.auditRemark" label="意见" placeholder="请输入审核意见" />
    </van-cell-group>
    <div style="margin: 16px;">
      <van-button v-if="contract.auditStatus!==2" :disabled="contract.auditStatus!=0" @click="toCheck(1)" class="van-button" block type="primary" native-type="submit">{{contract.auditStatus==1?'已通过':'通过'}}</van-button>
      <van-button v-if="contract.auditStatus!==1" :disabled="contract.auditStatus!=0" @click="toCheck(2)" class="van-button" block type="danger" native-type="submit">{{contract.auditStatus==2?'已否决':'否决'}}</van-button>
    </div>
  </div>
</template>

<script>
  import { getAction, postActionByJson, postActionByQueryString } from '@/api/manage'
  import { getUser } from '@/utils/auth'
  import {dateTimeFormat, dateFormat, toThousandFilter} from '@/utils/format'

export default {
  data() {
    return {
      contract: {}
    }
  },
  created() {
    if (this.$route.query) {
      this.contract = this.$route.query
    }
  },
  methods: {
    toCheck(type) {
      let message = type===1?'通过':'否决'
      this.$dialog.confirm({
        title: '提示',
        message: '确定'+message+'审核？',
      })
        .then(() => {
          // on confirm
          let form = {}
          form.id = this.contract.id
          form.auditor = getUser()
          form.auditStatus = type
          form.auditRemark = this.contract.auditRemark
          postActionByJson('/chapter/chapterAudit/updateChapterAudit', form)
            .then(resp =>{
              this.$toast.success('操作成功')
              this.$router.push('/chapter/check')
            })
            .catch(() => {
              this.$toast.fail('操作失败')
            })
        })
        .catch(() => {
          // on cancel
        });

    },
    dateTimeFormat,
    toThousandFilter
  }
}
</script>

<style lang="scss" scoped>
.chapter-detail {
  .van-button {
    margin: 1em 0 0 0
  }
}
</style>
