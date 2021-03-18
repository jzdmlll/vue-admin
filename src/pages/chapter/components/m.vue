<template>
  <div class="m-chapter-check">
    <van-tabs v-model="active" sticky animated :before-change="beforeTabsChange">
      <van-tab v-for="item in ['待审核', '已通过', '已否决']" :key="item" :title="item">
        <van-search v-model="searchText" placeholder="请输入搜索关键词" />
        <van-list
          v-model="loading"
          :finished="finished"
          :finished-text="finishedText"
          @load="onLoad"
        >
          <van-card @click="toDetail(item)"
                    v-for="item in list"
                    :key="item.id"
                    :desc="item.contractNo"
                    style="background: #fff"
                    >
            <template #thumb>
              <Avatar  :username="item.projectName?item.projectName[0]:'空'"
                       background-color="#e8e8e8"
                       color="#ff4949"
                       style=" vertical-align: middle;float: left"
                       :inline="true">
              </Avatar>
            </template>
            <!--<template #tags>
              <span style="overflow: hidden;white-space: nowrap;text-overflow: ellipsis; color: #aaa">
                {{item.sender+'：‘'+item.senderRemark+'’'}}
              </span>
            </template>-->
            <template #price>
              <span style="font-size: 14px; color: #ff4949">￥{{toThousandFilter(item.price)}}</span>
            </template>
            <template #title>
              <span style="font-size: 13px; color: #000">{{item.projectName}}</span>
            </template>
            <template #num>
              <span>{{dateTimeFormat(item.senderTime)}}</span>
            </template>
          </van-card>
          <van-empty v-if="list.length == 0" description="暂无数据" />
        </van-list>

      </van-tab>
    </van-tabs>

  </div>
</template>

<script>
  import Avatar from 'vue-avatar'
  import { getAction, postActionByJson, postActionByQueryString } from '@/api/manage'
  import {dateTimeFormat, dateFormat, toThousandFilter} from '@/utils/format'

  export default {
    components:{
      Avatar
    },
    data() {
      return {
        list: [],
        loading: false,
        finished: false,
        finishedText: '',

        currentPage: 1,
        hasNextPage: true,

        searchText: '',

        active: 0,
      }
    },
    created() {

    },
    methods: {
      toDetail(item) {
        item.files = JSON.stringify(item.files)
        this.$router.push({ path: '/chapter/components/detail', query: item })
      },
      beforeTabsChange(index) {
        return new Promise((resolve) => {
          // 在 resolve 函数中返回 true 或 false
          this.active = index
          this.currentPage = 1
          this.hasNextPage = true
          this.finishedText = ''
          this.onLoad()
          resolve(true);
        });
      },
      onLoad() {
        if (this.hasNextPage) {
          getAction('/chapter/chapterAudit/findChapterAuditInfosByParams', {
            auditStatus: this.active,
            pageNum: this.currentPage
          }).then(resp => {
            this.list = resp.data.records
            this.currentPage = resp.data.current+1
            this.hasNextPage = resp.data.pages > resp.data.current?true:false
            if (resp.data.records.length>0&&!this.hasNextPage) {
              this.finishedText = '已到底部'
            }
            this.loading = false
            this.finished = true
          }).catch(()=> {
            this.loading = false
            this.finished = true
            this.finishedText = '数据加载失败！'
          })
        }else {
          this.finished = true
          this.finishedText = '已到底部'
        }

        /*// 异步更新数据
        // setTimeout 仅做示例，真实场景中一般为 ajax 请求
        setTimeout(() => {
          for (let i = 0; i < 10; i++) {
            this.list.push(this.list.length + 1);
          }

          // 加载状态结束
          this.loading = false;

          // 数据全部加载完成
          if (this.list.length >= 40) {
            this.finished = true;
          }
        }, 1000);*/
      },
      toThousandFilter,
      dateTimeFormat
    },
  }
</script>

<style lang="scss" scoped>
  .m-chapter-check {

  }
</style>
