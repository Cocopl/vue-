<template>
    <div>
        <!-- 面包屑导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品分类</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图 -->
        <el-card>
            <el-row>
                <el-col>
                  <el-button type="primary" @click="showaddCateDialog">添加分类</el-button>
                </el-col>
            </el-row>
            <!-- 商品列表 -->
            <tree-table :data="catelist" :columns="columns" :selection-type="false" :expand-type="false" :show-index="true" index-text="#" border :show-row-hover="false">
                <!-- 是否有效 -->
                <template slot="isok" slot-scope="scope">
                    <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color: lightgreen;"></i>
                    <i class="el-icon-error" v-else style="color: red"></i>
                </template>
                <!-- 排序 -->
                <template slot="order" slot-scope="scope">
                    <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
                    <el-tag size="mini" type="success" v-else-if="scope.row.cat_level === 1">二级</el-tag>
                    <el-tag size="mini" type="warning" v-else>三级</el-tag>
                </template>
                <!-- 操作 -->
                <template slot="opt" slot-scope="scope">
                    <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
                    <el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
                </template>
            </tree-table>
            <!-- 分页 -->
            <el-pagination
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="cateInfo.pagenum"
              :page-sizes="[3, 5, 10, 15]"
              :page-size="cateInfo.pagesize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="total">
            </el-pagination>
        </el-card>
        <!-- 添加分类 -->
        <el-dialog
        title="添加分类"
        :visible.sync="addCatedialogVisible"
        width="50%"
        @close="addCateDialogClosed">
         <el-form ref="addCateFormRef" :model="addCateForm" label-width="100px" :rules="addCateFormRules">
          <el-form-item label="分类名称" prop="cat_name">
            <el-input v-model="addCateForm.cat_name"></el-input>
          </el-form-item>
          <!-- 父级分类 -->
          <el-form-item label="父级分类">
            <!-- option用来指定数据源 -->
            <el-cascader
            v-model="selectedKeys"
            :options="parentCateList"
            :props="cascaderProps"
            @change="parentCateChange"
            expand-trigger="hover"
            clearable>
            </el-cascader>
          </el-form-item>
         </el-form>
          <span slot="footer" class="dialog-footer">
            <el-button @click="addCatedialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="addCate">确 定</el-button>
          </span>
        </el-dialog>
    </div>
</template>
<script>
import { getCateApi, addCateApi } from '@/api'
export default {
  data() {
    return {
      cateInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      catelist: [],
      columns: [{
        label: '分类名称',
        prop: 'cat_name'
      }, {
        label: '是否有效',
        type: 'template',
        template: 'isok'
      }, {
        label: '排序',
        type: 'template',
        template: 'order'
      }, {
        label: '操作',
        type: 'template',
        template: 'opt'
      }],
      total: 0,
      addCatedialogVisible: false,
      addCateForm: {
        cat_name: '',
        cat_pid: 0,
        cat_level: 0
      },
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      parentCateList: [],
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 选中的父级分类的id数组
      selectedKeys: []
    }
  },
  created () {
    this.getCate()
  },
  methods: {
    async getCate () {
      const { data: res } = await getCateApi(this.cateInfo)
      if (res.meta.status !== 200) return this.$message.error('获取商品列表失败')
      // this.$message.success('获取商品列表成功')
      this.catelist = res.data.result
      this.total = res.data.total
      // console.log(res)
      // console.log(this.catelist)
    },
    // 分页
    handleSizeChange(val) {
      console.log(`每页 ${val} 条`)
      this.cateInfo.pagesize = val
      this.getCate()
    },
    handleCurrentChange(val) {
      console.log(`当前页: ${val}`)
      this.cateInfo.pagenum = val
      this.getCate()
    },
    // 点击按钮，展示添加分类的对话框
    showaddCateDialog () {
      this.getParentCateList()
      this.addCatedialogVisible = true
    },
    // 获取父级分类列表
    async getParentCateList () {
      const { data: res } = await getCateApi({ type: 2 })
      if (res.meta.status !== 200) return this.$message.error('获取商品列表失败')
      this.parentCateList = res.data
      // console.log(res,666)
      // console.log(this.parentCateList)
    },
    // 选择项变化
    parentCateChange () {
      // 如果selectedKeys数组中的length大于0，证明选中的父级分类
      if (this.selectedKeys.length > 0) {
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        this.addCateForm.cat_level = this.selectedKeys.length
        // console.log(this.addCateForm, 6666)
        return
      } else {
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },
    // 点击按钮，添加分类
    addCate () {
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return
        console.log(this.addCateForm)
        const { data: res } = await addCateApi(this.addCateForm)
        console.log(res)
        if (res.meta.status !== 201) {
          this.$message.error('添加分类失败')
        }
        this.$message.success('添加分类成功')
        this.addCatedialogVisible = false
        this.getCate()
      })
    },
    // 监听对话框关闭事件 重置表单
    addCateDialogClosed () {
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level = 0
      // this.addCatedialogVisible = false
    }
  }
}
</script>
<style scoped>
  .zk-table {
    margin-top: 20px;
  }
  .el-cascader {
    width: 100%;
  }   
</style>
