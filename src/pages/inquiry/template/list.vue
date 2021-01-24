<template>
  <div class="inquiry-template">
    <div class="btns" style="padding:1em;margin-bottom:1em;background:#fff">
      <el-button type="primary" size="mini" icon="el-icon-plus" @click="addTemplate">添加</el-button>
    </div>
    <el-card shadow="never">
      <div slot="header" class="index-md-title">
        <span>询价模板</span>
      </div>
      <a-table
        size="middle"
        ref="templates"
        :rowKey="record => record.id"
        :loading="templatesLoading"
        :data-source="templates"
        :scroll="templates.length>0?{x: 900}:{}"
        >
        <a-table-column :width="60" align="center" key="id" title="id" data-index="id" />
        <a-table-column :width="100" align="center" key="name" title="name" data-index="name" />
        <a-table-column :width="200" align="center" key="jsonKeys" title="jsonKeys" data-index="jsonKeys" />
        <a-table-column align="center" key="tableColumn" title="tableColumn" data-index="tableColumn" />
        <a-table-column :width="100" align="center" key="tree" title="tree" data-index="tree" />
        <a-table-column :width="100" align="center" key="time" title="time" data-index="time">
          <template slot-scope="text, record">{{dateTimeFormat(text)}}</template>
        </a-table-column>
        <a-table-column :width="160" fixed="right" align="center" key="action" title="操作">
          <template slot-scope="text, record">
            <el-button @click="editTemplate(record)" type="primary" size="mini" icon="el-icon-edit"></el-button>
            <el-button @click="deleteTemplate(record)" type="danger" size="mini" icon="el-icon-delete"></el-button>
          </template>
        </a-table-column>
      </a-table>
    </el-card>

    <el-dialog v-el-drag-dialog :title="dialog.title" :visible.sync="dialog.visible">
      <el-form ref="form" :rules="rules" :model="dialog.form" status-icon>
        <el-form-item size="mini" label="名称" label-width="80px" prop="name">
          <el-input v-model="dialog.form.name" autocomplete="off" size="small"></el-input>
        </el-form-item>
        <el-form-item size="mini" label="树形结构" label-width="80px" prop="tree">
          <el-switch
            v-model="dialog.form.tree"
            active-color="#13ce66"
            active-value="1"
            inactive-value="0">
          </el-switch>
        </el-form-item>
        <el-form-item size="mini" label="jsonKeys" label-width="80px" prop="jsonKeys">
          <!--<el-input v-model="dialog.form.keys" type="textarea" autocomplete="off" size="small"></el-input>-->
          <json-editor ref="jsonEditor" v-model="dialog.form.jsonKeys" />
        </el-form-item>
        <el-button style="margin: 0 0 8px 90px" type="primary" size="mini" @click="getAutoColumn">生成</el-button>
        <el-form-item size="mini" label="tableColumn" label-width="80px" prop="tableColumn">
          <!--<el-input v-model="dialog.form.tableColumn" type="textarea" autocomplete="off" size="small"></el-input>-->
          <json-editor ref="jsonEditor" v-model="dialog.form.tableColumn" />
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="dialog.visible = false">取消</el-button>
        <el-button type="primary" size="small" @click="dialogSubmit('form')">提交</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import '@/styles/auto-style.css'
  import { getUser } from '@/utils/auth'
  import { dateTimeFormat } from '@/utils/format'
  import JsonEditor from '@/components/JsonEditor'
  import { getAction, postActionByJson, postActionByQueryString } from '@/api/manage'
  import elDragDialog from '@/directive/el-drag-dialog'

  const jsonTemplate = '{"序号": "sort", "设备名称": "name", "品牌": "realBrand", "型号": "model", "技术要求": "params", "品牌推荐": "brand", "单位": "unit", "数量": "number", "备注": "remark"}'
  const columnTemplate = '[{"width": 60,"align": "center","key": "sort","title": "序号"}]'
  export default {
    name: 'JsonEditorDemo',
    components: { JsonEditor },
    directives: { elDragDialog },
    data() {
      return {
        templates: [],
        templatesLoading: false,

        dialog: {
          title: '',
          visible: false,
          form: {
            jsonKeys: '',
            tableColumn: ''
          }
        },

        rules: {
          name: [
            { required: true, message: '不能为空', trigger: 'blur'}
          ],
          keys: [
            { required: true, message: '不能为空', trigger: 'blur'}
          ],
          tableColumn: [
            { required: true, message: '不能为空', trigger: 'blur'}
          ],
        }

      }
    },
    created() {
      this.init()
    },
    methods: {
      init() {
        this.loadTemplates()
      },
      loadTemplates() {
        this.templatesLoading = true
        getAction('/inquiry/template/findInquiryTemplate')
          .then(resp => {
            this.templates = resp.data
          })
          .finally(()=>{
            this.templatesLoading = false
          })
      },
      addTemplate() {
        this.dialog.title = '新增模板'
        this.dialog.visible = true
        this.dialog.form.jsonKeys = JSON.parse(jsonTemplate)
        this.getAutoColumn(keys)
      },
      editTemplate(record) {
        this.dialog.title = '修改模板'
        this.dialog.visible = true
        this.dialog.form = JSON.parse(JSON.stringify(record))
        this.dialog.form.jsonKeys = JSON.parse(record.jsonKeys)
        this.dialog.form.tableColumn = JSON.parse(record.tableColumn)
      },
      deleteTemplate(record) {

      },
      getAutoColumn() {
        if ('object' != typeof this.dialog.form.jsonKeys) {
          this.dialog.form.jsonKeys = JSON.parse(this.dialog.form.jsonKeys)
        }
        let keys = Object.keys(this.dialog.form.jsonKeys)
        console.log(keys)
        let tableColumn = []
        keys.map(key => {
          let width = 100
          if (key == '序号' || key == '单位' || key == '数量') {
            width = 60
          }
          if (key == '技术要求' || key == '型号' || key == '设备位号' || key == '参数') {
            width = ''
          }
          tableColumn.push({
            width: width,
            key: this.dialog.form.jsonKeys[key],
            title: key,
            dataIndex: this.dialog.form.jsonKeys[key],
            align: 'center',
            ellipsis: false
          })
        })
        this.dialog.form.tableColumn = tableColumn
      },
      dialogSubmit(form) {
        this.$refs[form].validate((valid) => {
          if (this.dialog.form) {
            let url = ''
            if (this.dialog.form.id) {
              url = '/inquiry/template/updateInquiryTemplate'
            } else {
              url = '/inquiry/template/insertInquiryTemplate'
            }
            let form = this.dialog.form
            if ('object' == typeof form.jsonKeys) {
              form.jsonKeys = JSON.stringify(form.jsonKeys)
            }
            if ('object' == typeof form.tableColumn) {
              form.tableColumn = JSON.stringify(form.tableColumn)
            }
            form.operator = getUser()
            postActionByQueryString(url, form)
              .then(resp => {
                this.$message({type: 'success', message: resp.message})
                this.dialog.visible = false
                this.loadTemplates()
              })
          }else {
            return false
          }
        })
      },
      dateTimeFormat,
    }
  }
</script>

<style lang="scss" scoped>
  .inquiry-template {
    /deep/.el-form-item__content{
      height:auto;
      line-height:32px;
      margin-left:90px!important
    }
  }
</style>
