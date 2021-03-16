<template>
  <div class="sale_list">
    <!--销售合同列表-->
    <div class="btns" style="padding: 1em;margin-bottom: 1em;background:#fff">
      <el-tooltip effect="dark" content="新增" placement="bottom-start">
        <el-button type="primary" icon="el-icon-plus" size="mini" @click="toAdd">添加</el-button>
      </el-tooltip>
      <el-input v-model="searchForm.contractName" type="text" size="small" placeholder="合同名" clearable/>
      <el-button type="primary" icon="el-icon-search" size="mini" @click="toSearch">查询</el-button>
    </div>
    <div style="padding:1em;margin-bottom:1em;background:#fff">
      <a-table
        :loading="loading"
        :data-source="saleContract"
        size="small"
        :rowKey="record => record.id"
        :scroll="saleContract.length>0?{x:1300}:{}">
        <a-table-column :width="60" title="序号" align="center">
          <template slot-scope="text, record, index">
            {{index+1}}
          </template>
        </a-table-column>
        <a-table-column key="contractNo" title="合同编号" data-index="contractNo" ellipsis="true" align="center"/>
        <a-table-column :width="100" key="enginerring" title="工程" data-index="enginerring" ellipsis="true" align="center"/>
        <a-table-column :width="100" key="type" title="合同类型" data-index="type" ellipsis="true" align="center"/>
        <a-table-column :width="100" key="remark" title="备注" data-index="remark" ellipsis="true" align="center"/>
        <a-table-column :width="100" key="operator" title="创建人" data-index="operator" ellipsis="true" align="center"/>
        <a-table-column :width="100" key="time" title="创建时间">
          <template slot-scope="text, record">
            {{dateTimeFormat(record.time)}}
          </template>
        </a-table-column>
        <a-table-column :width="100" key="updateTime" title="修改时间">
          <template slot-scope="text, record">
            {{dateTimeFormat(record.updateTime)}}
          </template>
        </a-table-column>
        <a-table-column :width="100" key="updateOperator" title="修改人" data-index="updateOperator" align="center"/>
        <a-table-column :width="180" title="操作" fixed="right" key="action" align="center">
          <template slot-scope="text, record">
            <el-tooltip class="item" effect="dark" content="删除" placement="bottom-start">
              <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteHandler(record.id)" />
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="修改" placement="bottom-start">
              <el-button type="success" icon="el-icon-edit" size="mini" @click="editHandler(record)" />
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="详情" placement="bottom-start">
              <el-button type="success" icon="el-icon-more" size="mini" @click="detailHandler(record.id)" />
            </el-tooltip>
          </template>
        </a-table-column>
      </a-table>
    </div>


    <!-- 模态框 -->
    <el-dialog :title="title" :visible.sync="dialogVisible">
      <el-form ref="form" status-icon :model="form" :rules="rules">
        <el-form-item label="合同编号" label-width="80px" prop="contractNo">
          <el-input v-model="form.contractNo" autocomplete="off" />
        </el-form-item>
        <el-form-item label="工程" label-width="80px" prop="enginerring">
          <el-input v-model="form.enginerring" autocomplete="off"/>
        </el-form-item>
        <el-form-item label="类型" label-width="80px" prop="type">
          <el-input v-model="form.type" autocomplete="off"/>
        </el-form-item>
        <el-form-item label="备注" label-width="80px" prop="remark">
          <el-input type="textarea" v-model="form.remark" autocomplete="off" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" size="small" @click="saveRecordHandler('form')">确 定</el-button>
      </div>
    </el-dialog>

  </div>
</template>


<script>

  import { dateTimeFormat } from '@/utils/format'
  import {getAction, postActionByQueryString} from '@/api/manage'
  import '@/styles/auto-style.css'

  export default {
    name: "list.uve",

    data(){

      return{
        title: '',
        saleContract: [],
        searchForm: {},
        loading: false,
        dialogVisible: false,
        form: {},
        rules: {
          contractNo: [
            { required: true, message: '不能为空', trigger: 'blur'}
          ],
          contractName: [
            { required: true, message: '不能为空', trigger: 'blur'}
          ],
        },
      }
    },
    methods: {
      saveRecordHandler(form){
        this.$refs[form].validate((valid) => {
          if (valid) {
            postActionByQueryString('/contract/sale/saveOrUpdate', this.form)
              .then( resp => {
                this.$message({ message: resp.message, type: 'success' })
                this.dialogVisible = false
                this.toSearch()
              })
          }else {
            return false
          }
        })
      },
      toAdd(){
        this.title = "添加销售合同"
        this.dialogVisible = true
        this.form = {}
      },
      toSearch(){
        this.loading = true
        getAction('/contract/sale/findSaleContractData', {name: this.searchForm.contractName})
        .then(resp => {
          if (resp.data){

            this.saleContract = resp.data
            this.loading = false;
          }
        })
        .catch(() => {
          this.loading = false;
        })
      },
      deleteHandler(){
        this.$confirm('是否确定删除？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          postActionByQueryString('/purchase/purchasePlan/logicDeletePurchaseItems', { purchaseItemIds: this.selectedRowKeys})
            .then(resp => {
              this.$message({message: resp.message, type: 'success'})
              this.toSearch()
            })
        })
      },
      editHandler(record){
        this.title = "修改销售合同"
        this.dialogVisible = true
        this.form = record
      },
      dateTimeFormat,
      detailHandler(id){
        //跳转到详情页
        this.$router.push({path: '/sale/contract/detail', query: {saleId : id}})
      }
    }
  }

</script>

<style lang="scss" scoped>

  .pro_list {
    .timeline-container {
      padding: 1em;
      width: calc(221px + 4em);
      .el-icon-remove {
        color: #ff4949;
        float: right;
        transform: translate(0,4px);
        opacity: 0;
        cursor: pointer;
        margin-right: 2em;
      }
      .ant-timeline:hover > li .ant-timeline-item-content .el-icon-remove {
        opacity: 1;
      }
    }
    .outputlist_upload {
      opacity: 0;
      width: 0;
      overflow: hidden;
    }
    .importDialog {
      .el-form-item {
        /deep/.el-form-item__content {
          margin: 0 8px 0 0 !important;
        }
      }
    }
  }
</style>
