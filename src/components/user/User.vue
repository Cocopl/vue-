<template>
    <div>
      <!-- 面包屑导航 -->
      <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item>用户管理</el-breadcrumb-item>
          <el-breadcrumb-item>用户列表</el-breadcrumb-item>
      </el-breadcrumb>
      <!-- 卡片 -->
      <el-card>
        <el-row :gutter="20">
            <el-col :span="10">
                <el-input placeholder="请输入内容" class="input-with-select" v-model="useInfo.query" clearable @clear="init">
                <el-button slot="append" icon="el-icon-search" @click="init()"></el-button>
            </el-input>
            </el-col>
            <el-col :span="4">
                <el-button type="primary" @click="adduser">添加用户</el-button>
            </el-col>
        </el-row>
        <!-- 用户列表 -->
        <el-table :data="userList" stripe>
            <el-table-column type='index'></el-table-column>
            <el-table-column label='姓名' prop="username"></el-table-column>
            <el-table-column label='邮箱' prop="email"></el-table-column>
            <el-table-column label='电话' prop='mobile'></el-table-column>
            <el-table-column label='角色' prop='role_name'></el-table-column>
            <el-table-column label='状态'>
              <template slot-scope='scope'>
                <el-switch v-model='scope.row.mg_state' @change="userStateChange(scope.row)"></el-switch>
              </template>
            </el-table-column>
            <el-table-column label='操作' width='180px'>
              <template slot-scope='scope'>
                <!-- 修改按钮 -->
                <el-button type='primary' size='mini' icon="el-icon-edit" @click="showEdit(scope.row.id)"></el-button>
                <!-- 删除按钮 -->
                <el-button type='danger' size='mini' icon="el-icon-delete" @click="removeUserById(scope.row.id)"></el-button>
                <!-- 分配角色按钮 -->
                <el-tooltip effect="light" content="分配角色" placement="top" :enterable="false">
                  <el-button type='warning' size='mini' icon="el-icon-share" @click="showShareRole(scope.row)"></el-button>
                </el-tooltip>
              </template>
            </el-table-column>
        </el-table>
        <!-- 分页 -->
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="useInfo.pagenum"
          :page-sizes="[1, 2, 3, 4]"
          :page-size="useInfo.pagesize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
        </el-pagination>
      </el-card>
      <!-- 添加用户 -->
      <el-dialog
        title="添加用户"
        :visible.sync="dialogVisible"
        width="50%" @close="addDialogColsed">
        <!-- 主体区域 -->
        <el-form ref="addFormRef" :model="addForm" label-width="70px" :rules="addFormRules">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="addForm.username"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="addForm.password"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="addForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机" prop="mobile">
            <el-input v-model="addForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <!-- 底部区域 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="add()">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 修改用户 -->
      <el-dialog
        title="修改用户"
        :visible.sync="editDialogVisible"
        width="50%">
        <!-- 主体区域 -->
        <el-form ref="editFormRef" :model="editForm" label-width="70px" :rules="editFormRules">
          <el-form-item label="用户名">
            <el-input v-model="editForm.username" disabled></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="editForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机" prop="mobile">
            <el-input v-model="editForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <!-- 底部区域 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="edit()">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 分配角色的对话框 -->
      <el-dialog title="分配角色" :visible.sync="setRoleDialogVisible" width="50%">
        <div>
          <p>当前的用户： {{userInfo.username}}</p>
          <p>当前的角色： {{userInfo.role_name}}</p>
          <p>分配新角色：
            <el-select v-model="selectedRoleId" placeholder="请选择">
              <el-option
                v-for="item in rolesList"
                :key="item.id"
                :label="item.roleName"
                :value="item.id">
              </el-option>
            </el-select>
          </p>
        </div>
        <!-- 底部区域 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="setRoleDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
        </span>
      </el-dialog>
    </div>
</template>
<script>
import { usersListApi, userStateApi, addUserApi, editUserApi, editUserIdApi, deleteUserApi, updateRoleApi, getRolesApi } from '@/api'
export default {
  data () {
    var checkEmail = (rule, value, cb) => {
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      if (regEmail.test(value)) {
        return cb()
      }
      cb(new Error('请输入合法邮箱'))
    }
    var checkMobile = (rule, value, cb) => {
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      if (regMobile.test(value)) {
        return cb()
      }
      cb(new Error('请输入有效的手机号'))
    }
    return {
      userList: [],
      useInfo: {
        query: '',
        pagenum: 1,
        pagesize: 2
      },
      total: 0,
      dialogVisible: false,
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 5, message: '长度在3到5个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 10, message: '长度在6到10个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      editDialogVisible: false,
      editForm: {},
      editFormRules: {
        email: [
          { required: true, message: '请输入用户邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }],
        mobile: [
          { required: true, message: '请输入用户手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }]
      },
      setRoleDialogVisible: false,
      // 当前角色信息
      userInfo: [],
      // 角色列表
      rolesList: [],
      // 被选中的角色
      selectedRoleId: ''
    }
  },
  created () {
    this.init()
  },
  methods: {
    async init () {
      const { data: res } = await usersListApi(this.useInfo)
      // console.log(res)
      this.total = Math.ceil(res.data.total)
      // console.log(this.total)
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户列表失败！')
      }
      this.userList = res.data.users
      this.total = res.data.total
    },
    handleSizeChange(val) {
      console.log(`每页 ${val} 条`)
      this.useInfo.pagesize = val
    },
    handleCurrentChange(val) {
      console.log(`当前页: ${val}`)
      this.useInfo.pagenum = val
      this.init()
    },
    async userStateChange(userInfo) {
      // console.log(userInfo)
      const { data: res } = await userStateApi({ uid: userInfo.id, type: userInfo.mg_state })
      console.log(res,666)
      if (res.meta.status !== 200) {
        return this.$message.error('获取状态失败')
      } else {
        return this.$message.success('获取状态成功')
      }
      
    },
    // 添加用户按钮
    adduser() {
      this.dialogVisible = true
    },
    // 重置模态框里面的数据
    addDialogColsed() {
      this.$refs.addFormRef.resetFields()
    },
    // 添加用户
    add() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await addUserApi(this.addForm)
        if (res.meta.status !== 201) {
          this.$message.error('添加用户失败')
        }
        this.$message.success('添加用户成功')
        this.dialogVisible = false
        this.init()
      })
    },
    // 根据id查询用户
    async showEdit(id) {
      const { data: res } = await editUserIdApi(id)
      // console.log(res)
      if (res.meta.status !== 200) {
        this.$message.error('修改用户失败')
      }
      this.editForm = res.data
      this.editDialogVisible = true
    },
    // 修改用户
    edit() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await editUserApi({ id: this.editForm.id, email: this.editForm.email, mobile: this.editForm.mobile })
        if (res.meta.status !== 200) {
          this.$message.error('修改用户失败')
        }
        this.$message.success('修改用户成功')
        this.editForm = res.data
        this.init()
        this.editDialogVisible = true
      })
    },
    // 删除角色
    async removeUserById(id) {
      const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') return this.$message.info('已取消删除')
      const { data: res } = await deleteUserApi(id)
      if (res.meta.status !== 201) {
        this.$message.error('删除用户失败')
      }
      this.$message.success('删除用户成功')
      // this.dialogVisible = false
      this.init()
    },
    // 展现角色
    async showShareRole (val) {
      const { data: res } = await getRolesApi()
      if (res.meta.status !== 200) {
        this.$message.error('获取角色失败')
      }
      this.rolesList = res.data
      this.userInfo = val
      this.setRoleDialogVisible = true
    },
    // 更新角色
    async saveRoleInfo () {
      const { data: res } = await updateRoleApi({ id: this.userInfo.id, rid: this.selectedRoleId })
      if (res.meta.status !== 200) {
        this.$message.error('更新角色失败')
      }
      this.$message.success('更新角色成功')
      this.setRoleDialogVisible = false
      this.init()
    }
  }
}
</script>
<style lang="less" scoped>
</style>
