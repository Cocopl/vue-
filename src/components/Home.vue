<template>
    <el-container class="home-con">
      <el-header>
        <div>
          <img src="../assets/heima.png" alt="">
          <span>电商管理系统</span>
        </div>
        <el-button type="info" @click="logout">退出</el-button>
      </el-header>
      <el-container>
        <el-aside :width="iscollapse ? '64px' : '200px'">
          <div class="toggle_button" @click="toggleCol">|||</div>
          <el-menu background-color="#333744" text-color="#fff" active-text-color="#409EFF" :unique-opened="true" :collapse="iscollapse" :collapse-transition="false" :router="true" :default-active="activePath">
            <el-submenu :index="index + ''" :key="index" v-for="(items,index) in menulist">
              <!-- 一级菜单模板 -->
              <template slot="title">
                <!-- 图标 -->
                <i :class="iconObj[items.id]"></i>
                <!-- 文本 -->
                <span>{{items.authName}}</span>
              </template>
              <!-- 二级菜单 -->
              <el-menu-item :index="'/' + item.path" :key="i" v-for="(item,i) in items.children" @click="saveState('/' + item.path)">
                <template slot="title">
                  <i class="el-icon-menu"></i>
                  <span>{{item.authName}}</span>
                </template>
              </el-menu-item>
            </el-submenu>
          </el-menu>
        </el-aside>
        <el-container>
          <el-main>
            <router-view></router-view>
          </el-main>
        </el-container>
      </el-container>
    </el-container>
</template>

<script>
import { homeApi } from '@/api/index.js'
export default {
  data() {
    return {
      menulist: [],
      iconObj: {
        '125': 'iconfont icon-user',
        '103': 'iconfont icon-tijikongjian',
        '101': 'iconfont icon-shangpin',
        '102': 'iconfont icon-danju',
        '145': 'iconfont icon-baobiao'
      },
      iscollapse: false,
      activePath: ''
    }
  },
  created () {
    this.getAllMenu()
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    logout() {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    async getAllMenu() {
    // const { data: res } = await this.$http.get('menus');
      const { data: res } = await homeApi()
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.menulist = res.data
    },
    toggleCol() {
      this.iscollapse = !this.iscollapse
    },
    saveState(activePath) {
      // console.log(activePath)
      this.activePath = activePath
      window.sessionStorage.setItem('activePath', activePath)
    }
  }
}
</script>

<style lang="less" scoped>
  .home-con {

    height: 100%;
  }
  .el-header {
    background-color: #373d41;
    display:flex;
    justify-content: space-between;
    padding-left: 0;
    align-items: center;
    color: #fff;
    font-size: 20px;
    > div {
      display: flex;
      align-items: center;
      justify-content: space-between;
      span {
        margin-left: 15px;
      }
    }
  }
  .el-aside {
    background-color: #333744
  }
  .el-menu {
      border-right: 0;
  }
  .el-submenu__title{
    span {
      margin-left: 5px;
    }
  }
  .toggle_button {
    background-color: #4a5064;
    font-size: 10px;
    line-height: 24px;
    text-align: center;
    color: #fff;
    cursor: pointer;
    letter-spacing: 0.2em;
  }
  .el-main {
    background-color: #eaedf1
  }
</style>
