<template>
    <div>
        <!-- 面包屑导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>参数列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图 -->
        <el-card>
            <!-- 警告框 -->
            <el-alert
              title="注意：只允许使为第三级分类设置相关参数"
              type="warning"
              :closable="false"
              show-icon>
            </el-alert>
            <!-- 选择商品分类区 -->
            <el-row class="cat_opt">
                <el-col>
                    <span>选择商品分类：</span>
                    <!-- 选择商品级联框 -->
                    <el-cascader
                      expand-trigger="hover"
                      :options="catelist"
                      :props="cateProps"
                      v-model="selectedCateKeys"
                      @change="handleChange">
                    </el-cascader>
                </el-col>
            </el-row>
            <!-- tab标签区 -->
            <el-tabs v-model="activeName" @tab-click="handleTabClick">
              <el-tab-pane label="动态参数" name="many">
                <el-button type="primary" :disabled="isBtnDisabled" @click="addParamsdialogVisible = true">添加参数</el-button>
                <!-- 动态参数表格 -->
                <el-table :data="manyTableData" border stripe>
                    <!-- 展开行 -->
                    <el-table-column type="expand">
                      <template slot-scope="scope">
                    <el-tag :key="item.attr_id" v-for="(item, i) in scope.row.attr_vals" closable @close="handleTagClose(scope.row, i)">{{item}}</el-tag>
                    <el-input
                      class="input-new-tag"
                      v-if="scope.row.inputVisible"
                      v-model="scope.row.inputValue"
                      ref="saveTagInput"
                      size="small"
                      @keyup.enter.native="handleInputConfirm(scope.row)"
                      @blur="handleInputConfirm(scope.row)">
                    </el-input>
                    <el-button v-else size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                  </template>
                    </el-table-column>
                    <el-table-column label="参数名称" prop="attr_name"></el-table-column>
                    <el-table-column label="操作">
                        <template slot-scope="scope">
                            <el-button type="primary" size="mini" icon="el-icon-edit" @click="editParams(scope.row)">编辑</el-button>
                            <el-button type="danger" size="mini" icon="el-icon-delete" @click="deleteParams(scope.row)">删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>
              </el-tab-pane>
              <el-tab-pane label="静态属性" name="only">
                  <el-button type="primary" :disabled="isBtnDisabled" @click="addParamsdialogVisible = true">添加属性</el-button>
                  <!-- 静态参数表格 -->
                  <el-table :data="onlyTableData" border stripe>
                      <!-- 展开行 -->
                      <el-table-column type="expand">
                        <template slot-scope="scope">
                        <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="handleClose(i, scope.row)">{{item}}</el-tag>
                        <el-input
                          class="input-new-tag"
                          v-if="scope.row.inputVisible"
                          v-model="scope.row.inputValue"
                          ref="saveTagInput"
                          size="small"
                          @keyup.enter.native="handleInputConfirm(scope.row)"
                          @blur="handleInputConfirm(scope.row)">
                        </el-input>
                        <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                      </template>
                      </el-table-column>
                      <el-table-column label="属性名称" prop="attr_name"></el-table-column>
                      <el-table-column label="操作">
                          <template slot-scope="scope">
                              <el-button type="primary" size="mini" icon="el-icon-edit" @click="editParams(scope.row)">编辑</el-button>
                              <el-button type="danger" size="mini" icon="el-icon-delete" @click="deleteParams(scope.row)">删除</el-button>
                          </template>
                      </el-table-column>
                  </el-table>
              </el-tab-pane>
            </el-tabs>
        </el-card>
        <!-- 添加参数或者属性 -->
        <el-dialog
          :title="'添加' + titleText"
          :visible.sync="addParamsdialogVisible"
          width="50%"
          @close="addParamsDialogClosed">
          <el-form ref="addParamsRef" :model="addParamsForm" label-width="100px" :rules="addParamsFormRules">
          <el-form-item :label="titleText" prop="attr_name">
            <el-input v-model="addParamsForm.attr_name"></el-input>
          </el-form-item>
          </el-form>
          <span slot="footer" class="dialog-footer">
            <el-button @click="addParamsdialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="addParamsText">确 定</el-button>
          </span>
        </el-dialog>
        <!-- 编辑参数或者属性 -->
        <el-dialog
          :title="'编辑' + titleText"
          :visible.sync="editParamsdialogVisible"
          width="50%">
          <el-form ref="editParamsRef" :model="editParamsForm" label-width="100px" :rules="editParamsFormRules">
          <el-form-item :label="titleText" prop="attr_name">
            <el-input v-model="editParamsForm.attr_name"></el-input>
          </el-form-item>
          </el-form>
          <span slot="footer" class="dialog-footer">
            <el-button @click="editParamsdialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="editParamsText">确 定</el-button>
          </span>
        </el-dialog>
    </div>
</template> 
<script>
import { getCateApi, getParamsApi, addParamsApi, updateParamsApi, deleteParamsApi } from '@/api'
export default {
  data () {
    return {
      catelist: [],
      cateProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 级联选择框双向绑定
      selectedCateKeys: [],
      activeName: 'many',
      // 动态参数数据
      manyTableData: [],
      // 静态属性参数
      onlyTableData: [],
      // 添加参数
      addParamsForm: {
        attr_name: ''
      },
      addParamsdialogVisible: false,
      addParamsFormRules: {
        attr_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      // 编辑参数
      editParamsForm: {},
      editParamsdialogVisible: false,
      editParamsFormRules: {
        attr_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    // 获取所有商品分类
    async getCateList () {
      const { data: res } = await getCateApi()
      // console.log(res)
      if (res.meta.status !== 200) return this.$message.error('获取商品列表失败')
      // this.$message.success('获取商品列表失败')
      this.catelist = res.data 
    },
    // 级联选择框选中项变化，会触发这个函数
    handleChange () {
      this.getParamsData()
    },
    // tab标签点击事件的处理函数
    handleTabClick () {
      // console.log(this.activeName)
      this.getParamsData()
    },
    async getParamsData () {
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        return
      }
      // 根据所选的ID和当前所处的面板 获取对应的参数
      const { data: res } = await getParamsApi({ id: this.cateId, sel: this.activeName })
      // console.log(res)
      if (res.meta.status !== 200) return this.$message.error('获取参数列表失败')
      if (this.activeName === 'many') {
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : []
          // 文本框的显示与隐藏
          item.inputVisible = false
          // 文本框中输入的值
          item.inputValue = ''
        });
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },
    // 添加参数
    async addParamsText () {
      const { data: res } = await addParamsApi({ id: this.cateId, attr_name: this.addParamsForm.attr_name, attr_sel: this.activeName })
      // console.log(res)
      if (res.meta.status !== 201) return this.$message.error('参数创建失败')
      this.$message.success('参数创建成功')
      this.addParamsdialogVisible = false
      this.getParamsData()
    },
    // 对话框关闭
    addParamsDialogClosed () {
      this.$refs.addParamsRef.resetFields()
    },
    // 根据id查询参数
    editParams (result) {
      this.editParamsdialogVisible = true
      this.editParamsForm = result
      // console.log(this.editParamsForm)
    },
    // 编辑参数
    async editParamsText () {
      // const { data: res } = await updateParamsApi({ id: this.cateId, attrId: this.editParamsForm.attr_id, attr_name: this.editParamsForm.attr_name, attr_sel: this.activeName })
      // console.log(res)
      // if (res.meta.status !== 200) return this.$message.error('参数更新失败')
      // this.$message.success('参数更新成功')
      this.saveAttrVals(this.editParamsForm)
      this.editParamsdialogVisible = false
      this.getParamsData()
    },
    // 删除参数
    async deleteParams(result) {
      const confirmResult = await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') return this.$message.info('已取消删除')
      const { data: res } = await deleteParamsApi({ id: this.cateId, attrid: result.attr_id })
      if (res.meta.status !== 200) {
        this.$message.error('删除用户失败')
      }
      this.$message.success('删除用户成功')
      // this.dialogVisible = false
      this.getParamsData()
    },
    // 文本框失去焦点和按下enter键就会触发
    handleInputConfirm (row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      } else {
        row.attr_vals.push(row.inputValue.trim())
        row.inputValue = ''
        row.inputVisible = false
        this.saveAttrVals(row)
      }
    },
    async saveAttrVals (row) {
      const { data: res } = await updateParamsApi({ id: this.cateId, attrId: row.attr_id, attr_name: row.attr_name, attr_sel: row.attr_sel, attr_vals: row.attr_vals.join(',') })
      if (res.meta.status !== 200) return this.$message.error('参数更新失败')
      this.$message.success('参数更新成功')
    },
    // 点击会出现文本框
    // $nextTick的作用 当页面上的元素重新渲染之后才会指定回调函数中的代码
    showInput (result) {
      console.log(result)
      result.inputVisible = true
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 删除对应参数的可选项
    handleClose (i, row) {
      row.attr_vals.splice(i, 1)
      this.saveAttrVals(row)
    }
  },
  computed: {
    isBtnDisabled () {
      // 如果按钮需要被禁用，则返回true，否则返回false
      if (this.selectedCateKeys.length !== 3) {
        return true
      } else {
        return false
      }
    },
    cateId () {
      if (this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[2]
      }
      return null
    },
    // 动态获取标题
    titleText () {
      if (this.activeName === 'many') {
        return '动态参数'
      }
      return '静态属性'
    }
  }  
}
</script>
<style scoped>
  .cat_opt {
    margin: 15px 0;
  }
  .el-tag {
    margin: 10px;
  }
  .input-new-tag {
    width: 90px;
    margin-left: 10px;
  }       
</style>
