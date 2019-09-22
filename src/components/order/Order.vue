<template>
    <div>
        <!-- 面包屑导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item>商品管理</el-breadcrumb-item>
          <el-breadcrumb-item>商品列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图 -->
        <el-card>
            <el-row :gutter="20">
                <el-col :span="10">
                    <el-input placeholder="请输入内容" class="input-with-select" v-model="queryInfo.query" clearable @clear="getOrderList">
                        <el-button slot="append" icon="el-icon-search" @click="getOrderList"></el-button>
                    </el-input>
                </el-col>
            </el-row>
            <!-- 订单表格列表区 -->
            <el-table :data="orderList" stripe border>
                <el-table-column type='index'></el-table-column>
                <el-table-column label='订单编号' prop="order_number"></el-table-column>
                <el-table-column label='订单价格' prop="order_price"></el-table-column>
                <el-table-column label='是否付款' prop='pay_status'>
                    <template slot-scope="scope">
                        <el-tag v-if="scope.row.pay_status === '1' " type="success">已付款</el-tag>
                        <el-tag v-else type="danger">未付款</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label='是否发货' prop='is_send'></el-table-column>
                <el-table-column label='下单时间' prop='create_time'>
                    <template slot-scope="scope">
                        {{scope.row.create_time | dataFormat}}
                    </template>
                </el-table-column>
                <el-table-column label='操作'>
                  <template slot-scope='scope'>
                    <!-- 修改按钮 -->
                    <el-button type='primary' size='mini' icon="el-icon-edit" @click="showEdit"></el-button>
                    <!-- 删除按钮 -->
                    <el-button type='success' size='mini' icon="el-icon-location" @click="locationById(scope.row.order_id)"></el-button>
                  </template>
                </el-table-column>
            </el-table>
            <!-- 分页 -->
            <el-pagination
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="queryInfo.pagenum"
              :page-sizes="[10, 50, 100, 150, 200]"
              :page-size="queryInfo.pagesize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="total">
            </el-pagination>
        </el-card>
        <!-- 修改地址 -->
        <el-dialog
          title="修改地址"
          :visible.sync="editAddressDialogVisible"
          width="50%">
          <el-form :model="addressForm" :rules="addressRules" ref="addressForm" label-width="100px" class="demo-ruleForm">
            <el-form-item label="省市区/县" prop="address2">
              <el-cascader
                expand-trigger="hover"
                :options="citydata"
                v-model="addressForm.address1"
                @change="handleChange">
              </el-cascader>
            </el-form-item>
            <el-form-item label="详细地址" prop="address2">
              <el-input v-model="addressForm.address2"></el-input>
            </el-form-item>
          </el-form>
          <span slot="footer" class="dialog-footer">
            <el-button @click="editAddressDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="editAddressDialogVisible = false">确 定</el-button>
          </span>
        </el-dialog>
        <!-- 物流消息 -->
        <el-dialog title="物流进度" :visible.sync="showInfoDialogVisible" width="50%">
            <el-timeline>
                <el-timeline-item v-for="(activity, index) in DeliverInfo" :key="index" :timestamp="activity.time">
                  {{activity.context}}
                </el-timeline-item>
            </el-timeline>
        </el-dialog>
    </div>
</template>          
<script>
import citydata from './citydata.js'
import { getOrdersApi, getDeliverInfoApi } from '@/api'
export default {
  data () {
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      total: 0,
      orderList: [],
      editAddressDialogVisible: false,
      addressForm: {
        address1: [],
        address2: ''
      },
      addressRules: {
        address1: [
          { required: true, message: '请选择地址', trigger: 'blur' }
        ],
        address2: [
          { required: true, message: '请输入具体地址', trigger: 'blur' }
        ],
      },
      citydata,
      showInfoDialogVisible: false,
      DeliverInfo: []
    }
  },
  created() {
    this.getOrderList()
  },
  methods: {
    async getOrderList () {
      const { data: res } = await getOrdersApi(this.queryInfo)
    //   console.log(res)
      if (res.meta.status !== 200) return this.$message.error('获取订单失败')
      // this.$message.success('获取商品成功')
      this.orderList = res.data.goods
      this.total = res.data.total
    },
    showEdit (id) {
      this.editAddressDialogVisible = true
    },
    async locationById (id) {
      this.showInfoDialogVisible = true
      const { data: res } = await getDeliverInfoApi(1106975712662)
      console.log(res)
      if (res.meta.status !== 200) return this.$message.error('获取订单失败')
      // this.$message.success('获取商品成功')
      this.DeliverInfo = res.data
    },
    // 分页
    handleSizeChange(val) {
      // console.log(`每页 ${val} 条`)
      this.queryInfo.pagesize = val
      this.getOrderList()
    },
    handleCurrentChange(val) {
      // console.log(`当前页: ${val}`)
      this.queryInfo.pagenum = val
      this.getOrderList()
    },
    handleChange () {

    }
  },         
}
</script>
<style lang="less" scoped>
@import '../../plugins/timeline/timeline.css';        
@import '../../plugins/timeline-item/timeline-item.css' ;         
</style>