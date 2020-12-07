<template>
  <!-- 产品池管理 -->
  <div class="pro_pool_list">
    <div class="btns" style="padding:1em;margin-bottom:1em;background:#fff">
      <el-button style="margin-right: 6px" type="primary" icon="el-icon-plus" size="small" @click="add">新增</el-button>
      <el-input v-model="form.proName" placeholder="请输入项目名"></el-input>
      <el-input v-model="form.name" placeholder="请输入设备名"></el-input>
      <el-input v-model="form.brand" placeholder="请输入品牌"></el-input>
      <el-input v-model="form.model" placeholder="请输入型号"></el-input>
      <el-button style="margin-right: 6px" type="primary" icon="el-icon-search" size="small" @click="toSearch">查询</el-button>
    </div>
    <div style="padding:1em;margin-bottom:1em;background:#fff">
      <el-table id="lazyLoadTable" v-loading="loading" :data="pools" size="small" :max-height="tableHeight">
        <el-table-column type="index" prop="" label="序号" width="60" />
        <el-table-column :show-overflow-tooltip="true" prop="proName" label="项目名" />
        <el-table-column :show-overflow-tooltip="true" prop="name" label="设备名" />
        <el-table-column :show-overflow-tooltip="true" prop="supplier" label="供应商" />
        <el-table-column :show-overflow-tooltip="true" prop="brand" label="品牌" />

        <el-table-column :show-overflow-tooltip="true" prop="params" label="技术参数" />
        <el-table-column :show-overflow-tooltip="true" prop="model" label="品牌型号" />
        <el-table-column :show-overflow-tooltip="true" prop="price" label="单价" />
        <el-table-column :show-overflow-tooltip="true" prop="delivery" label="货期" />

        <el-table-column :show-overflow-tooltip="true" prop="purchaseDate" label="采购时间" />
        <el-table-column :show-overflow-tooltip="true" prop="purchaseContractNo" label="采购合同" />
        <el-table-column :show-overflow-tooltip="true" prop="saleContractNo" label="销售合同" />
        <el-table-column :show-overflow-tooltip="true" label="时间">
          <template slot-scope="{row}">
            {{dateTimeFormat(row.time)}}
          </template>
        </el-table-column>
        <el-table-column :show-overflow-tooltip="true" prop="remark" label="备注" />
        <!--<el-table-column label="操作" align="center" width="180">
          <template slot-scope="scope">
            <el-tooltip class="item" effect="dark" content="修改角色" placement="bottom-start">
              <el-button icon="el-icon-edit" type="success" size="mini" @click="toEdit(scope.row)" />
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="删除角色" placement="bottom-start">
              <el-button icon="el-icon-delete" type="danger" size="mini" @click="deleteHandler(scope.row.id)" />
            </el-tooltip>
          </template>
        </el-table-column>-->
      </el-table>
    </div>
    <!-- 模态框 -->
    <el-dialog :title="title" :visible.sync="visible">
      <el-form ref="form1" :model="form1"  status-icon>
        <el-form-item label="项目名" label-width="80px" size="small" prop="remark">
          <el-input type="text" v-model="form1.proName"></el-input>
        </el-form-item>
        <el-form-item label="设材代码" label-width="80px" size="small" prop="remark">
          <el-input type="text" v-model="form1.code"></el-input>
        </el-form-item>
        <el-form-item label="设备名" label-width="80px" size="small" prop="remark">
          <el-input type="text" v-model="form1.name"></el-input>
        </el-form-item>
        <el-form-item label="品牌" label-width="80px" size="small" prop="remark">
          <el-input type="text" v-model="form1.brand"></el-input>
        </el-form-item>
        <el-form-item label="供应商" label-width="80px" size="small" prop="remark">
          <el-input type="text" v-model="form1.supplier"></el-input>
        </el-form-item>
        <el-form-item label="型号" label-width="80px" size="small" prop="remark">
          <el-input type="text" v-model="form1.model"></el-input>
        </el-form-item>
        <el-form-item label="技术参数" label-width="80px" size="small" prop="remark">
          <el-input type="text" v-model="form1.params"></el-input>
        </el-form-item>
        <el-form-item label="供应商报价" label-width="80px" size="small" prop="remark">
          <el-input type="text" v-model="form1.price"></el-input>
        </el-form-item>
        <el-form-item label="货期" label-width="80px" size="small" prop="remark">
          <el-input type="text" v-model="form1.delivery"></el-input>
        </el-form-item>
        <el-form-item label="报价" label-width="80px" size="small" prop="remark">
          <el-input type="text" v-model="form1.quote"></el-input>
        </el-form-item>
        <el-form-item label="备注" label-width="80px" size="small" prop="remark">
          <el-input type="text" v-model="form1.remark"></el-input>
        </el-form-item>
        <el-form-item label="采购时间" label-width="80px" size="small" prop="remark">
          <el-date-picker v-model="form1.purchaseDate" value-format="timestamp" type="date" placeholder="请选择采购时间" size="small" />
        </el-form-item>
        <el-form-item label="采购合同编号" label-width="80px" size="small" prop="remark">
          <el-input type="text" v-model="form1.purchaseContractNo"></el-input>
        </el-form-item>
        <el-form-item label="销售合同编号" label-width="80px" size="small" prop="remark">
          <el-input type="text" v-model="form1.saleContractNo"></el-input>
        </el-form-item>
        <el-form-item label="数量" label-width="80px" size="small" prop="remark">
          <el-input type="text" v-model="form1.number"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="visible = false">取 消</el-button>
        <el-button type="primary" size="small" @click="submitHandler('form')">提 交</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
  import request from '@/utils/request'
  import qs from 'querystring'
  import '@/styles/auto-style.css'
  import { dateTimeFormat,nullFormat } from '@/utils/format'
  import { getUser } from '@/utils/auth'

  export default {
    data() {
      return {
        form1: {},
        title: '',
        visible: false,
        hasNextPage: false,
        currentPage: 1,
        tableHeight: document.documentElement.clientHeight-83-150,
        projects: [],
        form: {},
        pools: [],
        loading: true
      }
    },
    created() {
      this.loadPools()
    },
    mounted() {
      var that = this
      let table = document.querySelector('#lazyLoadTable .el-table__body-wrapper');
      table.addEventListener("scroll", function() {
        const scrollDistance =table.scrollHeight - table.scrollTop - table.clientHeight;
        //console.log(table.scrollHeight + '-' +table.scrollTop +'-' +table.clientHeight+'='+scrollDistance)
        if(scrollDistance <= 0.5) {//等于0证明已经到底，可以请求接口
          if(that.hasNextPage){
            const name = that.form.name
            const brand = that.form.brand
            const proName = that.form.proName
            const model = that.form.model
            //请求接口的代码
            request.request({
              url: '/pool/findByParams?pageNum='+that.currentPage,
              method: 'get',
              params: {name: name, brand: brand, proName: proName, model: model}
            }).then( response => {
              //将请求回来的数据和当前展示的数据合并在一起
              that.pools = that.pools.concat(response.data.list)
              that.currentPage = response.data.nextPage
              that.hasNextPage = response.data.hasNextPage
              that.loading = false
            }).catch(()=>{
              that.loading = false
            })
          }
        }
      })
    },
    methods: {
      submitHandler() {
        request.request({
          url: '/pool/addProductPool',
          method: 'post',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          data: qs.stringify(this.form1)
        }).then(resp => {
          this.visible = false
          this.loadPools()
          this.$message({ message: resp.message, type: 'success' })
        }).catch(()=>{

        })
      },
      add() {
        this.title = '新增'
        this.visible = true
      },
      toSearch() {
        request.request({
          url: '/pool/findByParams',
          method: 'get',
          params: {'name': this.form.name, 'brand': this.form.brand, 'model': this.form.model, 'proName': this.form.proName}
        })
        .then(response => {
          this.pools = response.data.list
          this.currentPage = response.data.nextPage
          this.hasNextPage = response.data.hasNextPage
          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
      },
      dateTimeFormat,
      loadPools() {
        request.get('/pool/findByParams')
        .then(response => {
          this.pools = response.data.list
          this.currentPage = response.data.nextPage
          this.hasNextPage = response.data.hasNextPage
          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
      },
    }
  }
</script>
<style lang="scss" scoped>
  .pro_pool_list {
    /deep/.el-form-item__content{
      height:auto;
      line-height:32px;
      margin-left:90px!important
    }
  }
</style>
