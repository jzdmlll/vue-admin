<template>
  <div class="websocket">
    <el-input type="textarea" v-model="message"></el-input>
    <el-button type="primary" @click="sendAll">全体发送</el-button>
  </div>
</template>

<script>
  import { getUser, getToken } from '@/utils/auth'
  import { getAction, postActionByJson, postActionByQueryString } from '@/api/manage'

  export default {
    data () {
      return {
        message: '',
      }
    },
    mounted() {
      //初始化websocket
      this.initWebSocket()
    },
    destroyed: function () { // 离开页面生命周期函数
      this.websocketclose();
    },
    created () {
    },
    computed: {
    },
    methods: {
      sendAll() {
        postActionByJson('/webSocket/sendAll', { message: this.message})
      },
      initWebSocket: function () {
        // WebSocket与普通的请求所用协议有所不同，ws等同于http，wss等同于https
        var userId = getUser()
        var url = process.env.VUE_APP_BASE_API.replace("https://","ws://").replace("http://","ws://")+"websocket/"+userId;
        this.websock = new WebSocket(url);
        this.websock.onopen = this.websocketonopen;
        this.websock.onerror = this.websocketonerror;
        this.websock.onmessage = this.websocketonmessage;
        this.websock.onclose = this.websocketclose;
      },
      websocketonopen: function () {
        console.log("WebSocket连接成功");
      },
      websocketonerror: function (e) {
        console.log("WebSocket连接发生错误");
      },
      websocketonmessage: function (e) {
        var data = eval("(" + e.data + ")");
        const h = this.$createElement;
        //处理订阅信息
        if(data.cmd == "topic"){
          //TODO 系统通知

          this.$notify({
            title: '系统通知',
            message: h('i', { style: 'color: teal'}, data.msgTxt)
          });
          console.log('系统通知'+data.msgTxt)
        }else if(data.cmd == "user"){
          //TODO 用户消息
          this.$notify({
            title: '用户消息',
            message: h('i', { style: 'color: teal'}, data.msgTxt)
          });
          console.log(data.msgTxt)
        }
      },
      websocketclose: function (e) {
        //console.log("connection closed (" + e.code + ")");
      }
    }
  }
</script>

<style lang="scss" scoped>

</style>
