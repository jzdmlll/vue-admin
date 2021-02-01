<!--  html  -->
<template>
  <div id="equipment">
    <!--     layout          -->
    <a-layout>
      <!--   左布局      -->
      <a-layout-sider :width="slider1 == 550 ? '550' : '0'" :style="style1">
        <!--      合同查询布局区域   -->
        <div style="padding: 1em; margin-bottom: 1em" class="slider-header">
          <el-select
            v-model="project.projectId"
            style="margin-right: 6px"
            filterable
            clearable
            placeholder="请选择项目"
            @change="loadcontract"
            value-key="name"
          >
            <el-option
              v-for="item in project"
              :key="item.id"
              :label="item.projectName"
              :value="item.projectName"
            />
          </el-select>
          <el-select
            v-model="project.contractId"
            style="margin-right: 6px"
            filterable
            clearable
            placeholder="请选择合同"
            value-key="name"
          >
            <el-option
              v-for="item in project"
              :key="item.id"
              :label="item.contractId"
              :value="item.contractId"
            >
              <span>{{ item.contractId }}</span>
              <el-tag
                style="float: right"
                :type="item.contractId == 2 ? 'success' : 'danger'"
              >
                {{ item.contractId == 2 ? "已生成" : "未生成" }}
              </el-tag>
            </el-option>
          </el-select>
          <a-button
            style="background: #42b983; color: #fefefe"
            @click="toSearch"
            >查询</a-button
          >
        </div>
        <!--      合同显示布局区域        -->
        <div style="padding: 1em; margin-top: 1em; height: 605px">
          <a-row>
            <a-descriptions
              :title="contractinfo[0].title"
              size="small"
              bordered
            >
              <a-descriptions-item :span="2" label="付款方式">
                {{ contractinfo[0].payType }}
              </a-descriptions-item>
              <a-descriptions-item :span="2" label="录入人">
                {{ contractinfo[0].operator }}
              </a-descriptions-item>
              <a-descriptions-item :span="2" label="应付款">
                {{ contractinfo[0].needPay }}
              </a-descriptions-item>
              <a-descriptions-item :span="2" label="已付款">
                <el-tag
                  :type="
                    contractinfo[0].alreadyPayment != '' ? 'success' : 'danger'
                  "
                  @click="alreadyPayMethod"
                  >{{ contractinfo[0].alreadyPayment }}</el-tag
                >
              </a-descriptions-item>

              <a-descriptions-item :span="2" label="预定到货时间">
                {{ contractinfo[0].schedulerPayTime }}
              </a-descriptions-item>
              <a-descriptions-item :span="2" label="预定付款时间">
                {{ contractinfo[0].schedulerDeliveryTime }}
              </a-descriptions-item>

              <a-descriptions-item :span="2" label="履约金">
                {{ contractinfo[0].performanceBound }}
              </a-descriptions-item>
              <a-descriptions-item :span="2" label="状态">
                {{ contractinfo[0].performanceBondStatus }}
              </a-descriptions-item>
              <a-descriptions-item :span="2" label="履约金支付时间">
                {{ contractinfo[0].performanceBoundPayTime }}
              </a-descriptions-item>
              <a-descriptions-item :span="2" label="履约金归还时间">
                {{ contractinfo[0].performanceBoundDeliverTime }}
              </a-descriptions-item>
              <a-descriptions-item :span="4" label="合同附件状态">
                <a-row>
                  <a-col :span="8"
                    ><el-tag @click="subFile('供货发票')"
                      >供货发票</el-tag
                    ></a-col
                  >
                  <a-col :span="8"
                    ><el-tag @click="subFile('付款通知单')"
                      >付款通知单</el-tag
                    ></a-col
                  >
                  <a-col :span="8"
                    ><el-tag @click="subFile('实际付款状态')"
                      >实际付款状态</el-tag
                    ></a-col
                  >
                </a-row>
              </a-descriptions-item>
              <a-descriptions-item :span="4" :col="2" label="备注">
                {{ contractinfo[0].remark }}
              </a-descriptions-item>
            </a-descriptions>
          </a-row>
          <a-row>
            <a-button
              style="
                background: #42b983;
                color: #fefefe;
                float: right;
                margin-top: 10px;
              "
              @click="toSub"
              >填写合同信息</a-button
            >
          </a-row>
        </div>
      </a-layout-sider>
      <!--   右布局      -->
      <a-layout>
        <!--     右下布局    -->
        <a-layout-content>
          <div
            style="
              padding: 1em;
              margin-left: 1em;
              margin-top: -1em;
              height: 700px;
              background: #fff;
            "
          >
            <a-tabs default-active-key="1">
              <a-tab-pane key="1" tab="采购项清单">
                <a-table
                  v-loading="loading"
                  :data-source="devices"
                  size="large"
                  :rowKey="(record) => record.id"
                  :row-selection="{
                    selectedRowKeys: selectedKeys,
                    onChange: onSelectChange,
                    getCheckboxProps: (record) => ({
                      props: { disabled: record.price != 2 },
                    }),
                    type: 'checkbox',
                  }"
                  :scroll="{ x: 2000 }"
                >
                  <!-- <a-button v-if="selectKeys.length>0"/>  -->
                  <a-table-column
                    :width="100"
                    key="id"
                    data-index="id"
                    title="设备ID"
                    v-if="false"
                  >
                    <template slot-scope="text, scope">
                      <el-tag
                        :type="
                          scope.auditStatus === 1
                            ? 'success'
                            : scope.auditStatus === 2
                            ? 'danger'
                            : 'warning'
                        "
                        @click="toadd"
                        >{{
                          scope.auditStatus === 1 ? "已填写签收单" : "未填写"
                        }}</el-tag
                      >
                    </template>
                  </a-table-column>
                  <a-table-column
                    :width="100"
                    key="serialNumber"
                    align="center"
                    data-index="serialNumber"
                    title="设备序号"
                  />
                  <a-table-column
                    :width="100"
                    key="item"
                    data-index="item"
                    title="设备名"
                  />
                  <a-table-column
                    :width="100"
                    key="brand"
                    data-index="brand"
                    title="品牌"
                  />
                  <a-table-column
                    :width="100"
                    key="params"
                    data-index="params"
                    title="技术参数"
                  />
                  <a-table-column
                    :width="100"
                    key="item"
                    data-index="item"
                    title="未签收数量"
                  />
                  <a-table-column
                    :width="100"
                    key="model"
                    data-index="model"
                    title="型号"
                  />
                  <a-table-column
                    :width="100"
                    key="number"
                    data-index="number"
                    title="数量"
                  />
                  <a-table-column
                    :width="100"
                    key="unit"
                    data-index="unit"
                    title="单位"
                  />
                  <a-table-column
                    :width="100"
                    key="contractOrderId"
                    data-index="contractOrderId"
                    title="合同订单追踪ID"
                  />
                  <a-table-column
                    :width="100"
                    key="supplyId"
                    data-index="supplyId"
                    title="供应商ID"
                  />
                  <a-table-column
                    :width="100"
                    key="supplier"
                    data-index="supplier"
                    title="供应商"
                  />
                  <a-table-column
                    :width="100"
                    key="price"
                    data-index="price"
                    title="供应商单价"
                  />
                  <a-table-column
                    :width="100"
                    key="totalPrice"
                    data-index="totalPrice"
                    title="总价"
                  />
                  <a-table-column
                    :width="100"
                    key="warranty"
                    data-index="warranty"
                    title="设备保质期"
                  />
                  <a-table-column :width="100" title="操作" fixed="right">
                    <template slot-scope="text, scope">
                      <a-tooltip placement="topLeft" title="查看附件">
                        <a-button
                          type="primary"
                          icon="folder"
                          size="small"
                          @click="getFile(scope.id)"
                        />
                      </a-tooltip>
                    </template>
                  </a-table-column>
                </a-table>
              </a-tab-pane>
              <a-tab-pane key="3" tab="到货状态">
                <a-table
                  v-loading="loading"
                  :data-source="devices"
                  size="large"
                >
                  <a-table-column
                    :width="100"
                    key="id"
                    data-index="id"
                    title="id"
                    v-if="false"
                  />
                  <a-table-column
                    :width="150"
                    key="projectName"
                    data-index="projectName"
                    title="采购项"
                  >
                    <template slot-scope="text, scope">
                      <el-tag
                        :type="
                          scope.auditStatus === 1
                            ? 'success'
                            : scope.auditStatus === 2
                            ? 'danger'
                            : 'warning'
                        "
                        @click="toadd"
                        >{{
                          scope.auditStatus === 1 ? "已填写签收单" : "未填写"
                        }}</el-tag
                      >
                    </template>
                  </a-table-column>
                  <a-table-column
                    :width="500"
                    key="mainContent"
                    align="center"
                    data-index="mainContent"
                    title="主要内容"
                  />
                  <a-table-column
                    :width="100"
                    key="price"
                    data-index="price"
                    title="金额"
                  />
                  <a-table-column
                    :width="100"
                    key="firstParty"
                    data-index="firstParty"
                    title="甲方"
                  />
                  <a-table-column
                    :width="100"
                    key="secondParty"
                    data-index="secondParty"
                    title="乙方"
                  />
                  <a-table-column
                    :width="100"
                    key="type"
                    data-index="type"
                    title="类别"
                  />
                  <a-table-column :width="100" title="操作" fixed="right">
                    <template slot-scope="text, scope">
                      <a-tooltip placement="topLeft" title="查看附件">
                        <a-button
                          type="primary"
                          icon="folder"
                          size="small"
                          @click="getFile(scope.id)"
                        />
                      </a-tooltip>
                    </template>
                  </a-table-column>
                </a-table>
              </a-tab-pane>
              <a-tab-pane key="4" tab="供货清单">
                <a-button
                  style="background: #42b983; color: #fefefe"
                  @click="subit"
                  >上传</a-button
                >
                <a-table
                  v-loading="loading"
                  :data-source="devices"
                  size="large"
                  :rowKey="(record) => record.id"
                  :row-selection="{
                    selectedRowKeys: selectedKeys,
                    onChange: onSelectChange,
                    getCheckboxProps: (record) => ({
                      props: { disabled: record.price != 2 },
                    }),
                    type: 'checkbox',
                  }"
                  :scroll="{ x: 2000 }"
                >
                  <!-- <a-button v-if="selectKeys.length>0"/>  -->
                  <a-table-column
                    :width="100"
                    key="id"
                    data-index="id"
                    title="设备ID"
                    v-if="false"
                  >
                    <template slot-scope="text, scope">
                      <el-tag
                        :type="
                          scope.auditStatus === 1
                            ? 'success'
                            : scope.auditStatus === 2
                            ? 'danger'
                            : 'warning'
                        "
                        @click="toadd"
                        >{{
                          scope.auditStatus === 1 ? "已填写签收单" : "未填写"
                        }}</el-tag
                      >
                    </template>
                  </a-table-column>
                  <a-table-column
                    :width="100"
                    key="serialNumber"
                    align="center"
                    data-index="serialNumber"
                    title="设备序号"
                  />
                  <a-table-column
                    :width="100"
                    key="item"
                    data-index="item"
                    title="设备名"
                  />
                  <a-table-column
                    :width="100"
                    key="brand"
                    data-index="brand"
                    title="品牌"
                  />
                  <a-table-column
                    :width="100"
                    key="params"
                    data-index="params"
                    title="技术参数"
                  />
                  <a-table-column
                    :width="100"
                    key="item"
                    data-index="item"
                    title="未签收数量"
                  />
                  <a-table-column
                    :width="100"
                    key="model"
                    data-index="model"
                    title="型号"
                  />
                  <a-table-column
                    :width="100"
                    key="number"
                    data-index="number"
                    title="数量"
                  />
                  <a-table-column
                    :width="100"
                    key="unit"
                    data-index="unit"
                    title="单位"
                  />
                  <a-table-column
                    :width="100"
                    key="contractOrderId"
                    data-index="contractOrderId"
                    title="合同订单追踪ID"
                  />
                  <a-table-column
                    :width="100"
                    key="supplyId"
                    data-index="supplyId"
                    title="供应商ID"
                  />
                  <a-table-column
                    :width="100"
                    key="supplier"
                    data-index="supplier"
                    title="供应商"
                  />
                  <a-table-column
                    :width="100"
                    key="price"
                    data-index="price"
                    title="供应商单价"
                  />
                  <a-table-column
                    :width="100"
                    key="totalPrice"
                    data-index="totalPrice"
                    title="总价"
                  />
                  <a-table-column
                    :width="100"
                    key="warranty"
                    data-index="warranty"
                    title="设备保质期"
                  />
                  <a-table-column :width="100" title="操作" fixed="right">
                    <template slot-scope="text, scope">
                      <a-tooltip placement="topLeft" title="查看附件">
                        <a-button
                          type="primary"
                          icon="folder"
                          size="small"
                          @click="getFile(scope.id)"
                        />
                      </a-tooltip>
                    </template>
                  </a-table-column>
                </a-table>
              </a-tab-pane>
            </a-tabs>
          </div>
        </a-layout-content>
      </a-layout>
    </a-layout>
    <!--     layout          -->

    <!--   查看已付款信息  alreadyVisible -->
    <el-dialog :title="title" :visible.sync="alreadyVisible">
      <a-table
        :pagination="false"
        v-loading="loading"
        :data-source="devices"
        size="large"
        :rowKey="(record) => record.id"
      >
        <!-- <a-button v-if="selectKeys.length>0"/>  -->
        <!--
        <a-table-column
          :width="100"
          key="id"
          data-index="id"
          title="设备ID"
          v-if="false"
        >
          <template slot-scope="text, scope">
            <el-tag
              :type="
                scope.auditStatus === 1
                  ? 'success'
                  : scope.auditStatus === 2
                  ? 'danger'
                  : 'warning'
              "
              @click="toadd"
              >{{ scope.auditStatus === 1 ? "已填写签收单" : "未填写" }}</el-tag
            >
          </template>
        </a-table-column>
        -->
        <a-table-column
          :width="100"
          key="serialNumber"
          align="center"
          data-index="serialNumber"
          title="已付款"
        />
        <a-table-column
          :width="100"
          key="serialNumber"
          align="center"
          data-index="serialNumber"
          title="操作人"
        />
        <a-table-column
          :width="100"
          key="serialNumber"
          align="center"
          data-index="serialNumber"
          title="付款时间"
        />
      </a-table>
      <el-button type="primary" size="small" @click="addpay"
        >新增记录</el-button
      >
    </el-dialog>

    <!--   已付款新增弹窗 payVisible  -->
    <el-dialog :title="title" :visible.sync="payVisible">
      <el-form ref="form" :model="form" :rules="rule">
        <!-- 填写项目内容 -->
        <div :style="active === 2 ? { display: 'block' } : { display: 'none' }">
          <a-row>
            <a-col :span="8">
              <el-form-item
                label="应付款"
                label-width="80px"
                size="small"
                prop="contractName"
              >
                <el-input
                  v-model="payment.needPay"
                  clearable
                  placeholder="应付款"
                  value-key="name"
                  size="small"
                >
                </el-input>
              </el-form-item>
            </a-col>
            <a-col :span="8">
              <el-form-item
                label="单位"
                label-width="80px"
                size="small"
                prop="contractNo"
              >
                <el-input
                  v-model="payment.unitMoney"
                  clearable
                  placeholder="单位"
                  value-key="name"
                  size="small"
                >
                </el-input>
              </el-form-item>
            </a-col>
            <a-col :span="8">
              <el-form-item
                label="货币"
                label-width="80px"
                size="small"
                prop="price"
              >
                <el-input
                  v-model="payment.currecy"
                  clearable
                  placeholder="货币"
                  value-key="name"
                  size="small"
                >
                </el-input>
              </el-form-item>
            </a-col>
          </a-row></div
      ></el-form>
      <el-button
        style="float: right"
        type="primary"
        size="small"
        @click="toSubpay"
        >确认</el-button
      >
    </el-dialog>
    <!--   已付款新增弹窗   -->

    <!-- 新增文件 -->
    <el-dialog :title="fileTitle" :visible.sync="fileVisible">
      <a-table
        :pagination="false"
        v-loading="loading"
        :data-source="devices"
        size="large"
        :rowKey="(record) => record.id"
      >
        <!-- <a-button v-if="selectKeys.length>0"/>  -->
        <!--
        <a-table-column
          :width="100"
          key="id"
          data-index="id"
          title="设备ID"
          v-if="false"
        >
          <template slot-scope="text, scope">
            <el-tag
              :type="
                scope.auditStatus === 1
                  ? 'success'
                  : scope.auditStatus === 2
                  ? 'danger'
                  : 'warning'
              "
              @click="toadd"
              >{{ scope.auditStatus === 1 ? "已填写签收单" : "未填写" }}</el-tag
            >
          </template>
        </a-table-column>
        -->
        <a-table-column
          :width="100"
          key="serialNumber"
          align="center"
          data-index="serialNumber"
          title="文件"
        />
        <a-table-column
          :width="100"
          key="serialNumber"
          align="center"
          data-index="serialNumber"
          title="操作人"
        />
        <a-table-column
          :width="100"
          key="serialNumber"
          align="center"
          data-index="serialNumber"
          title="上传时间"
        />
      </a-table>
      <el-button type="primary" size="small" @click="fileUp"
        >上传文件</el-button
      >
    </el-dialog>
    <!-- 新增文件 -->
    <!--   文件上传   -->
    <el-dialog :title="fileTitle" :visible.sync="fileVisible2">
      <el-form ref="form" :model="form" :rules="rule">
        <!-- 填写项目内容 -->
        <div :style="active === 2 ? { display: 'block' } : { display: 'none' }">
          <a-row>
            <a-col :span="24">
              <el-form-item
                label="编号"
                label-width="80px"
                size="small"
                prop="contractNo"
              >
                <el-input
                  v-model="fileForm.number"
                  clearable
                  placeholder="编号"
                  value-key="name"
                  size="small"
                >
                </el-input>
              </el-form-item>
            </a-col>
          </a-row>
          <a-row>
            <a-col :span="8">
              <el-form-item
                label="应付款"
                label-width="80px"
                size="small"
                prop="contractName"
              >
                <el-input
                  v-model="fileForm.price"
                  clearable
                  placeholder="应付款"
                  value-key="name"
                  size="small"
                >
                </el-input>
              </el-form-item>
            </a-col>
            <a-col :span="8">
              <el-form-item
                label="单位"
                label-width="80px"
                size="small"
                prop="contractNo"
              >
                <el-input
                  v-model="fileForm.unitMoney"
                  clearable
                  placeholder="单位"
                  value-key="name"
                  size="small"
                >
                </el-input>
              </el-form-item>
            </a-col>
            <a-col :span="8">
              <el-form-item
                label="货币"
                label-width="80px"
                size="small"
                prop="price"
              >
                <el-input
                  v-model="fileForm.currecy"
                  clearable
                  placeholder="货币"
                  value-key="name"
                  size="small"
                >
                </el-input>
              </el-form-item>
            </a-col>
          </a-row></div
      ></el-form>
      <div :style="active === 2 ? { display: 'block' } : { display: 'none' }">
        <a-upload-dragger
          name="file"
          :multiple="true"
          :action="fileUploadUrl"
          withCredentials
          list-type="picture"
          :before-upload="beforeUpload"
          :file-list="fileList"
          @change="uploadStatusChange"
        >
          <p class="ant-upload-drag-icon">
            <a-icon type="inbox" />
          </p>
          <p class="ant-upload-text" style="color: #40a9ff">上传项目文件</p>
          <p class="ant-upload-text">点击或者拖拽文件来上传</p>
          <p class="ant-upload-hint">
            支持单个或多个文件上传. 单个文件请不要超过12M
          </p>
        </a-upload-dragger>
        <el-button
          type="primary"
          :loading="submitLoading"
          size="small"
          @click="subNewFile('form')"
          >{{ this.active === 2 ? "确定" : "下一步" }}</el-button
        >
      </div>
    </el-dialog>
    <!--   文件上传   -->

    <!--   合同信息 invisible  -->
    <el-dialog :title="title1" :visible.sync="invisible">
      <el-form ref="form" :model="form" :rules="rule">
        <!-- 填写项目内容 -->
        <div :style="active === 2 ? { display: 'block' } : { display: 'none' }">
          <a-row>
            <a-col :span="8">
              <el-form-item
                label="应付款"
                label-width="80px"
                size="small"
                prop="contractName"
              >
                <el-input
                  v-model="form.needPay"
                  clearable
                  placeholder="应付款"
                  value-key="name"
                  size="small"
                >
                </el-input>
              </el-form-item>
            </a-col>
            <a-col :span="8">
              <el-form-item
                label="单位"
                label-width="80px"
                size="small"
                prop="contractNo"
              >
                <el-input
                  v-model="form.unitMoney"
                  clearable
                  placeholder="单位"
                  value-key="name"
                  size="small"
                >
                </el-input>
              </el-form-item>
            </a-col>
            <a-col :span="8">
              <el-form-item
                label="货币"
                label-width="80px"
                size="small"
                prop="price"
              >
                <el-input
                  v-model="form.currecy"
                  clearable
                  placeholder="货币"
                  value-key="name"
                  size="small"
                >
                </el-input>
              </el-form-item>
            </a-col>
          </a-row>
          <!--
          <a-row>
            <a-col :span="8">
              <el-form-item
                label="已付款"
                label-width="80px"
                size="small"
                prop="type"
              >
                <el-input
                  v-model="form.alreadyPayment"
                  clearable
                  placeholder="已付款"
                  value-key="name"
                  size="small"
                >
                </el-input>
              </el-form-item>
            </a-col>
            <a-col :span="8">
              <el-form-item
                label="单位"
                label-width="80px"
                size="small"
                prop="contractNo"
              >
                <el-input
                  v-model="form.unitMoney"
                  clearable
                  placeholder="单位"
                  value-key="name"
                  size="small"
                >
                </el-input>
              </el-form-item>
            </a-col>
            <a-col :span="8">
              <el-form-item
                label="货币"
                label-width="80px"
                size="small"
                prop="price"
              >
                <el-input
                  v-model="form.currecy"
                  clearable
                  placeholder="货币"
                  value-key="name"
                  size="small"
                >
                </el-input>
              </el-form-item>
            </a-col>
          </a-row>
-->

          <a-row>
            <a-col :span="8">
              <el-form-item
                label="预定付款时间"
                label-width="80px"
                size="small"
                prop="firstParty"
              >
                <el-input
                  v-model="form.schedulerPayTime"
                  clearable
                  placeholder="预定付款时间"
                  value-key="name"
                  size="small"
                >
                </el-input>
              </el-form-item>
            </a-col>
            <a-col :span="8">
              <el-form-item
                label="预定到货时间"
                label-width="80px"
                size="small"
                prop="secondParty"
              >
                <el-input
                  v-model="form.schedulerDeliveryTime"
                  clearable
                  placeholder="预定到货时间"
                  value-key="name"
                  size="small"
                >
                </el-input>
              </el-form-item>
            </a-col>
            <a-col :span="8">
              <el-form-item
                label="勾选额外信息"
                label-width="80px"
                size="small"
                prop="type"
              >
                <el-row>
                  <el-col :span="6"
                    ><el-checkbox v-model="form.BondStatus" @change="addInfo"
                      >履约保证金</el-checkbox
                    ></el-col
                  >
                  <!--<el-col :span="6"><el-checkbox v-model="form.BondStatus2">供货发票状态</el-checkbox></el-col>
          <el-col :span="6"><el-checkbox v-model="form.BondStatus3">付款通知单</el-checkbox></el-col>
          <el-col :span="6"><el-checkbox v-model="form.BondStatus4">实际付款状态</el-checkbox></el-col>-->
                </el-row>
              </el-form-item>
            </a-col>
          </a-row>

          <a-row>
            <a-col :span="8">
              <el-form-item
                label="保证金金额"
                label-width="80px"
                size="small"
                prop="mainContent"
                v-if="form.BondStatus === true"
              >
                <el-input
                  v-model="form.performanceBound"
                  clearable
                  placeholder="金额"
                  value-key="name"
                  size="small"
                >
                </el-input>
              </el-form-item>
            </a-col>
            <a-col :span="8">
              <el-form-item
                label="单位"
                v-if="form.BondStatus === true"
                label-width="80px"
                size="small"
                prop="contractNo"
              >
                <el-input
                  v-model="form.unitMoney"
                  clearable
                  placeholder="单位"
                  value-key="name"
                  size="small"
                >
                </el-input>
              </el-form-item>
            </a-col>
            <a-col :span="8">
              <el-form-item
                label="货币"
                v-if="form.BondStatus === true"
                label-width="80px"
                size="small"
                prop="price"
              >
                <el-input
                  v-model="form.currecy"
                  clearable
                  placeholder="货币"
                  value-key="name"
                  size="small"
                >
                </el-input>
              </el-form-item>
            </a-col>
          </a-row>
          <a-row>
            <a-col :span="8">
              <el-form-item
                label="保证金支付时间"
                label-width="80px"
                size="small"
                prop="mainContent"
                v-if="form.BondStatus === true"
              >
                <el-date-picker
                  v-model="form.performanceBoundPayTime"
                  type="datetime"
                  placeholder="选择日期时间"
                >
                </el-date-picker>
              </el-form-item>
            </a-col>
            <a-col :span="8">
              <el-form-item
                label="保证金归还时间"
                label-width="80px"
                size="small"
                prop="mainContent"
                v-if="form.BondStatus === true"
              >
                <el-date-picker
                  v-model="form.performanceBoundDeliverTime"
                  type="datetime"
                  placeholder="选择日期时间"
                >
                </el-date-picker>
              </el-form-item>
            </a-col>
            <a-col :span="8">
              <el-form-item
                label="保证金信息"
                label-width="80px"
                size="small"
                prop="mainContent"
                v-if="form.BondStatus === true"
              >
                <el-select
                  v-model="form.performanceBondStatus"
                  type="textarea"
                  :autosize="{ minRows: 3, maxRows: 10 }"
                >
                  <el-option key="performanceBound" label="未支付" value="0">
                  </el-option>
                  <el-option key="performanceBound" label="已支付" value="1">
                  </el-option>
                  <el-option key="performanceBound" label="已归还" value="2">
                  </el-option>
                </el-select>
              </el-form-item>
            </a-col>
          </a-row>

          <a-row>
            <a-col :span="12">
              <el-form-item
                label="付款方式"
                label-width="80px"
                size="small"
                prop="projectName"
              >
                <el-select
                  v-model="form.payType"
                  clearable
                  placeholder="付款方式"
                  value-key="name"
                  size="small"
                >
                  <el-option
                    key="performanceBound"
                    label="货到付款"
                    value="货到付款"
                  >
                  </el-option>
                  <el-option
                    key="performanceBound"
                    label="预付款"
                    value="预付款"
                  >
                  </el-option>
                  <el-option
                    key="performanceBound"
                    label="款到发货"
                    value="款到发货"
                  >
                  </el-option>
                  <el-select-option />
                </el-select>
              </el-form-item>
            </a-col>
          </a-row>

          <el-form-item
            label="供货发票状态"
            label-width="80px"
            size="small"
            prop="mainContent"
            v-if="form.BondStatus2 === true"
          >
            <el-select
              v-model="form.supplierlnvoice"
              type="textarea"
              :autosize="{ minRows: 3, maxRows: 10 }"
            >
              <el-option key="performanceBound" label="未上传" value="1">
              </el-option>

              <el-option key="performanceBound" label="已上传" value="2">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item
            label="付款通知单"
            label-width="80px"
            size="small"
            prop="mainContent"
            v-if="form.BondStatus3 === true"
          >
            <el-select
              v-model="form.paymentNotice"
              type="textarea"
              :autosize="{ minRows: 3, maxRows: 10 }"
            >
              <el-option key="performanceBound" label="未上传" value="1">
              </el-option>

              <el-option key="performanceBound" label="已上传" value="2">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item
            label="付款实际状态"
            label-width="80px"
            size="small"
            prop="mainContent"
            v-if="form.BondStatus4 === true"
          >
            <el-select
              v-model="form.actualPayment"
              type="textarea"
              :autosize="{ minRows: 3, maxRows: 10 }"
            >
              <el-option key="performanceBound" label="未上传" value="1">
              </el-option>

              <el-option key="performanceBound" label="已上传" value="2">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item
            label="备注"
            label-width="80px"
            size="small"
            prop="mainContent"
          >
            <el-input
              v-model="form.remark"
              type="textarea"
              :autosize="{ minRows: 3, maxRows: 10 }"
            />
          </el-form-item>
        </div>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button
          type="primary"
          :loading="submitLoading"
          size="small"
          @click="saveRecordHandler('form')"
          >{{ this.active === 2 ? "确定" : "下一步" }}</el-button
        >
      </div>
    </el-dialog>
    <!--   合同信息   -->

    <!--  收缩标签(下面的页面宽度控制)   -->
    <div
      style="
        position: fixed;
        left: 68px;
        bottom: 0px;
        width: 50px;
        height: 50px;
        z-index: 999;
      "
    >
      <el-button
        type="success"
        icon="el-icon-caret-left"
        @click="expand"
      ></el-button>
    </div>
    <div
      style="
        position: fixed;
        right: 18px;
        bottom: 0px;
        width: 50px;
        height: 50px;
      "
    >
      <el-button
        type="success"
        icon="el-icon-caret-right"
        @click="reduce"
      ></el-button>
    </div>
    <!--  收缩标签(下面的页面宽度控制)   -->
  </div>
</template>
<!--  html  -->

<!-- script  -->
<script>
import request from "@/utils/request";
import qs from "querystring";
import "@/styles/auto-style.css";
import { getUser } from "@/utils/auth";
import {
  getAction,
  postActionByJson,
  postActionByQueryString,
} from "@/api/manage";
import { dateTimeFormat } from "@/utils/format";
import elDragDialog from "@/directive/el-drag-dialog";
export default {
  data() {
    const fileUploadUrl = process.env.VUE_APP_BASE_API + "file/uploadCache";
    const rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {
        selectedRows.map((item) => {
          alert(item.mainContent);
        });

        console.log(
          `selectedRowKeys: ${selectedRowKeys}`,
          "selectedRows: ",
          selectedRows
        );
      },
      onSelect: (record, selected, selectedRows) => {
        console.log(record, selected, selectedRows);
      },
      onSelectAll: (selected, selectedRows, changeRows) => {
        console.log(selected, selectedRows, changeRows);
      },
    };
    return {
      test: [{ data: "test123" }],
      rowSelection,
      payment: {},
      fileUploadUrl,
      selectedKeys: [],
      alreadyVisible: false,
      fileVisible: false,
      slider1: 550,
      style1: "padding:0px;background:#fefefe;",
      style2: "padding:0px;background:#fefefe;",
      selectSupplier: null,
      loading: true,
      devices: [
        { id: "006", price: "2", mainContent: "500" },
        { id: "007", price: "3", mainContent: "555" },
        { id: "008", price: "2", mainContent: "500" },
        { id: "009", price: "2", mainContent: "500" },
      ],
      searchForm: { test: "123" },
      visible: false,
      title: "填写已付款信息",
      title1: "填写合同信息",
      selectedRowKeys: [],
      contractinfo: [
        {
          title: "新钢自动化部采购合同",
          payType: "货到付款",
          operator: "小辣椒",
          needPay: "230",
          alreadyPayment: "230",
          schedulerPayTime: "2021-1-29 20:59:21",
          schedulerDeliveryTime: "2021-1-29 20:59:21",
          performanceBound: "50",
          performanceBondStatus: "已支付",
          performanceBoundPayTime: "2021-1-29 20:59:21",
          performanceBoundDeliverTime: "2021-1-29 20:59:21",
          remark: "采购200件电脑",
        },
      ],
      invisible: false,
      form: {},
      fileForm: {},
      payVisible: false,
      fileVisible2: false,
      BondStatus: false,
      fileVisible: false,
      submitLoading: false,
      project: [
        { projectName: "001", contractId: "002" },
        { projectName: "002", contractId: "004" },
      ],
      contract: {},
      active: 2,
      stylish: 1,
      fileList: [],
      rule: {
        /*
          projectName: [
            {required: true, message: '不能为空', trigger: 'blur'}
          ],
          contractName: [
            {required: true, message: '不能为空', trigger: 'blur'}
          ],
          contractNo: [
            {required: true, message: '不能为空', trigger: 'blur'}
          ],
          price: [
            {required: true, message: '不能为空', trigger: 'blur'}
          ],
          firstParty: [
            {required: true, message: '不能为空', trigger: 'blur'}
          ],
          secondParty: [
            {required: true, message: '不能为空', trigger: 'blur'}
          ],
          type: [
            {required: true, message: '不能为空', trigger: 'blur'}
          ],
          senderRemark: [
            {required: true, message: '不能为空', trigger: 'blur'}
          ],
          auditor: [
            {required: true, message: '不能为空', trigger: 'blur'}
          ],
          mainContent: [
            {required: true, message: '不能为空', trigger: 'blur'}
          ]
*/
      },
    };
  },
  created() {
    this.init();
    this.loadproject();
  },
  methods: {
    getUser,
    alreadyPayMethod() {
      this.alreadyVisible = true;
    },
    expand() {
      this.slider1 = 100;
    },
    reduce() {
      this.slider1 = 550;
    },
    choose() {
      alert("123");
      if (this.stylish == 1) {
        return true;
      } else {
        return false;
      }
    },
    toSearch() {
      alert(this.project.projectId);
      getAction("url", {
        projectID: this.project.projectId,
        contractId: "this.project.contractId",
      }).then((resp) => {
        this.contractinfo = resp.data;
      });
    },
    subFile(record) {
      this.fileTitle = record;
      this.fileVisible = true;
    },
    addpay() {
      this.payVisible = true;
    },
    fileUp() {
      this.fileVisible2 = true;
    },
    addInfo() {
      if (this.form.performanceBondStatus == true) {
        this.BondStatus = true;
      }
    },
    /*     获取项目列表     */
    loadproject() {
      getAction("url").then((resp) => {
        this.project = resp.data;
        this.form.projectId = resp.data.projectId;
      });
    },
    loadcontract() {
      getAction("url", { projectId: this.project.projectId }).then((resp) => {
        this.contract = resp.data;
        this.form.contractId = resp.data.contractId;
      });
    },
    toSubpay() {
      alert(this.payment.needPay);
      postActionByJson("url", {
        needPay: this.payment.needPay,
      }).then((item) => {
        alert("test success");
        console.log(item);
      });
    },
    onSelectChange(selectedRowKeys, selectedRows) {
      //alert("123")
      // if(selectedRows.length == 0) {
      //   this.selectSupplier = null
      // }
      let rows = [];
      selectedRows.map((item) => {
        rows.push(item.id);
      });
      this.selectedKeys = rows;
    },

    beforeUpload(file) {
      if (file.size > 12 * 1024 * 1024) {
        this.$message({ message: "上传文件大小不能超过12M", type: "error" });
        return false;
      }
    },
    uploadStatusChange(info) {
      if (info.file.status === "uploading" || info.file.response.error === 0) {
        let fileList = [...info.fileList];
        fileList = fileList.map((file) => {
          if (file.response) {
            file.url = file.response.url;
            file.id = file.response.fileId;
            file.name = file.response.fileName;
            //file.type = 1
          }
          return file;
        });
        this.fileList = fileList;
      }
    },
    init() {
      this.loading = false;
    },
    toSub() {
      this.invisible = true;
    },
    toadd() {
      this.visible = true;
    },
    toLeft() {
      this.style1 = this.style2;
      alert(this.style1);
    },
    cancelHandler() {
      if (this.active === 1) {
        this.visible = false;
      } else {
        this.active--;
      }
    },
    subNewFile() {
      const fileList = this.fileList.map((item) => {
        return { id: item.id, name: item.name, url: item.url, type: 1 };
      });
      request
        .request({
          url: "/chapter/chapterAudit/insertChapterAudit",
          method: "post",
          headers: {
            "Content-Type": "application/json",
          },
          data: JSON.stringify({
            chapterAudit: this.fileForm,
            files: fileList,
          }),
        })
        .then((response) => {
          this.submitLoading = false;
          this.visible = false;
          this.fileVisible2 = false;
          this.$message({ message: response.message, type: "success" });
          this.fileList = [];
          this.init();
        });
    },
    saveRecordHandler(form) {
      this.$refs[form].validate((valid) => {
        if (valid) {
          switch (this.active) {
            case 1:
              this.active++;
              break;
            case 2:
              this.submitLoading = true;
              const fileList = this.fileList.map((item) => {
                return { id: item.id, name: item.name, url: item.url, type: 1 };
              });
              this.form.operator = parseInt(getUser());
              this.$delete(this.form, "BondStatus");
              this.$delete(this.form, "BondStatus2");
              this.$delete(this.form, "BondStatus3");
              this.$delete(this.form, "BondStatus4");
              delete this.form.role;
              request
                .request({
                  url: "/chapter/chapterAudit/insertChapterAudit",
                  method: "post",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  data: JSON.stringify({
                    chapterAudit: this.form,
                    files: fileList,
                  }),
                })
                .then((response) => {
                  this.submitLoading = false;
                  this.visible = false;
                  this.fileVisible2 = false;

                  this.$message({ message: response.message, type: "success" });
                  this.fileList = [];
                  this.init();
                });
              break;
          }
        } else {
          this.$message({ message: "请填写信息", type: "success" });
        }
      });
    },
  },
};
</script>

<!--  css -->
<style lang="scss" scoped>
#components-layout-demo-basic .ant-layout-header,
#components-layout-demo-basic .ant-layout-sider {
  background: #fefefe;
  color: #fff;
}
#components-layout-demo-basic .ant-layout-content {
  color: #fff;
}
#components-layout-demo-basic > .ant-layout {
  margin-bottom: 48px;
}
#components-layout-demo-basic > .ant-layout:last-child {
  margin: 0;
}
.el-row {
  margin-bottom: 20px;
  &:last-child {
    margin-bottom: 0;
  }
}
.el-col {
  border-radius: 4px;
}
.bg-purple-dark {
  background: #99a9bf;
}
.bg-purple {
  background: #d3dce6;
}
.bg-purple-light {
  background: #e5e9f2;
}
.grid-content {
  border-radius: 4px;
  min-height: 36px;
}
.row-bg {
  padding: 10px 0;
  background-color: #f9fafc;
}
</style>

