<template>
    <div>
      <!-- 面包屑导航 -->
      <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item>权限管理</el-breadcrumb-item>
          <el-breadcrumb-item>角色列表</el-breadcrumb-item>
      </el-breadcrumb>
      <!-- 卡片视图 -->
      <el-card>
          <!-- 添加角色按钮区 -->
          <el-row>
              <el-col>
                  <el-button type="primary">添加角色</el-button>
              </el-col>
          </el-row>
          <!-- 角色列表区 -->
          <el-table :data="rolesList" stripe border width="100%">
            <el-table-column type='expand'>
                <template slot-scope="scope">
                    <el-row v-for="(item1, i1) in scope.row.children" :key="item1.id" :class="['bdbottom', i1 === 0 ? 'bdtop' : '', 'vcenter']">
                        <!-- 渲染一级权限 -->
                        <el-col :span="5">
                            <el-tag closable>{{item1.authName}}</el-tag><i class="el-icon-caret-right"></i>
                        </el-col>
                        <!-- 渲染二级和三级权限 -->
                        <el-col :span="19">
                            <!-- 通过for嵌套渲染二级权限 -->
                            <el-row v-for="(item2, i2) in item1.children" :key="item2.id" :class="[i2 === 0 ? '' : 'bdtop', 'vcenter']">
                                <el-col :span="6">
                                    <el-tag closable type="success">{{item2.authName}}</el-tag><i class="el-icon-caret-right"></i>   
                                </el-col>
                                <el-col :span="18">
                                    <el-tag closable @close="removeById(scope.row, item3.id)" type="warning" v-for="(item3, i3) in item2.children" :key="item3.id" :class="['bdbottom', i3 === 0 ? 'bdtop' : '']">{{item3.authName}}</el-tag>
                                </el-col>
                            </el-row>
                        </el-col>
                    </el-row>
                </template>
            </el-table-column>
            <el-table-column label='角色名称' prop="roleName"></el-table-column>
            <el-table-column label='角色描述' prop="roleDesc"></el-table-column>
            <el-table-column label='操作' width="300px">
                <template slot-scope='scope'>
                    <el-button type='primary' size='mini' icon="el-icon-edit" @click="editRole(scope.row.id)">编辑</el-button>
                    <el-button type='danger' size='mini' icon="el-icon-delete" @click="deleteRole(scope.row.id)">删除</el-button>
                    <el-button type='warning' size='mini' icon="el-icon-share" @click="shareRight(scope.row)">分配权限</el-button>
                </template>
            </el-table-column>
          </el-table>
          <!-- 分配权限对话框 -->
          <el-dialog
            title="分配权限"
            :visible.sync="setRightdialogVisible"
            width="50%"
            @close="setRightdialogclosed">
            <el-tree :data="rightsList" :props="treeProps" show-checkbox :default-checked-keys="defkeys" default-expand-all node-key="id" ref="treeRef"></el-tree>
            <span slot="footer" class="dialog-footer">
              <el-button @click="setRightdialogVisible = false">取 消</el-button>
              <el-button type="primary" @click="setRights">确 定</el-button>
            </span>
          </el-dialog>
      </el-card>
    </div>
</template>
<script>
import { getRolesApi, deleteRightByIdApi, getRightsApi, addRightApi } from '@/api'
export default {
  data() {
    return {
      rolesList: [],
      rightsList: [],
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      setRightdialogVisible: false,
      defkeys: [],
      roleId: ''
    }
  },
  created() {
    this.init()
  },
  methods: {
    // 获取权限列表
    async init () {
      const { data: res } = await getRolesApi()
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户列表失败！')
      }
      this.rolesList = res.data
    },
    editRole (id) {

    },
    deleteRole (id) {

    },
    // 删除角色权限
    async removeById (role, right) {
      const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') return this.$message.info('已取消删除')
      const { data: res} = await deleteRightByIdApi({roleId: role.id, rightId: right})
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户列表失败！')
      }
      // 为了列表不关闭
      role.children = res.data
    },
    // 展示分配权限对话框
    async shareRight (role) {
        this.roleId = role.id
      const { data: res } = await getRightsApi('tree')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限数据失败！')
      }
      this.rightsList = res.data
      // 递归获取三级节点
      this.getLeafKeys (role, this.defkeys)
      this.setRightdialogVisible = true
    },
    // 为角色分配权限
    async setRights () {
      // ...a1,...a2合并数组
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const keyStr = keys.join(',')
      const { data: res} = await addRightApi({roleId: this.roleId, rids: keyStr})
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户列表失败！')
      }
      this.$message.success('分配角色成功')
      this.setRightdialogVisible = false
      this.init()
    },
    // 通过递归的形式，获取角色下所有三级权限的id，并保存到defkeys数组中
    getLeafKeys (node, arr) {
      // 如果当前node节点不包含children属性，则是三级节点
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => this.getLeafKeys (item, arr))
    },
    // 监听分配权限对话框关闭
    setRightdialogclosed () {
      this.defkeys = []
    }
  }
}
</script>
<style>
  .el-tag {
    margin: 7px;
  }
  .bdtop {
    border-top: 1px solid #eee;
  }
  .bdbottom {
    border-bottom: 1px solid #eee;
  }
</style>
