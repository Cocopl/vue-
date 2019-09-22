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
                <el-input placeholder="请输入内容" class="input-with-select" v-model="goodsInfo.query" clearable @clear="getGoods">
                <el-button slot="append" icon="el-icon-search" @click="getGoods"></el-button>
            </el-input>
            </el-col>
            <el-col :span="4">
                <el-button type="primary" @click="addGood">添加商品</el-button>
            </el-col>
        </el-row>
        <!-- 商品表格列表区 -->
        <el-table :data="goodsList" stripe border>
            <el-table-column type='index'></el-table-column>
            <el-table-column label='商品名称' prop="goods_name"></el-table-column>
            <el-table-column label='商品价格(元)' prop="goods_price" width='95px'></el-table-column>
            <el-table-column label='商品重量' prop='goods_weight' width='70px'></el-table-column>
            <el-table-column label='创建时间' prop='add_time' width='140px'>
              <template slot-scope="scope">{{scope.row.add_time | dataFormat}}</template>
            </el-table-column>
            <el-table-column label='操作' width='130px'>
              <template slot-scope='scope'>
                <!-- 修改按钮 -->
                <el-button type='primary' size='mini' icon="el-icon-edit" @click="showEdit(scope.row)"></el-button>
                <!-- 删除按钮 -->
                <el-button type='danger' size='mini' icon="el-icon-delete" @click="removeUserById(scope.row.goods_id)"></el-button>
              </template>
            </el-table-column>
        </el-table>
        <!-- 分页 -->
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="goodsInfo.pagenum"
          :page-sizes="[10, 50, 100, 150, 200]"
          :page-size="goodsInfo.pagesize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
        </el-pagination>
      </el-card>
    </div>
</template>      
<script>
import { getGoodsApi, deleteGoodApi } from '@/api'
export default{
  data () {
    return {
      goodsInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10 
      },
      goodsList: [],
      total: 0
    }
  },
  created() {
    this.getGoods()
  },
  methods: {
    async getGoods () {
      const { data: res } = await getGoodsApi(this.goodsInfo)
      console.log(res)
      if (res.meta.status !== 200) return this.$message.error('获取商品失败')
      // this.$message.success('获取商品成功')
      this.goodsList = res.data.goods
      this.total = res.data.total
    },
    // 添加商品
    addGood () {
      this.$router.push('/goods/add')
    },
    // 编辑商品
    showEdit (row) {

    },
    // 删除商品
    async removeUserById (id) {
      const confirmResult = await this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') return this.$message.info('已取消删除')
      const { data: res } = await deleteGoodApi(id)
      if (res.meta.status !== 200) {
        this.$message.error('删除商品失败')
      }
      this.$message.success('删除商品成功')
      this.getGoods()
    },
    // 分页
    handleSizeChange(val) {
      // console.log(`每页 ${val} 条`)
      this.goodsInfo.pagesize = val
      this.getGoods()
    },
    handleCurrentChange(val) {
      // console.log(`当前页: ${val}`)
      this.goodsInfo.pagenum = val
      this.getGoods()
    }
  }
}
</script>
<style scoped>
            
</style>