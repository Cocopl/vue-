import Vue from 'vue'
import Router from 'vue-router'
import Login from './components/Login.vue'
import Home from './components/Home.vue'
import Welcome from './components/Welcome.vue'
import User from './components/user/User.vue'
// 权限管理
import Right from './components/power/Right.vue'
import Role from './components/power/Role.vue'
// 商品管理
import Cate from './components/goods/Cate.vue'
import Good from './components/goods/Good.vue'
import Params from './components/goods/Params.vue'
import Add from './components/goods/Add.vue'

import Order from './components/order/Order.vue'
import Report from './components/order/Report.vue'
Vue.use(Router)

const router = new Router({
  routes: [{
    path: '/',
    redirect: '/login'
  }, {
    path: '/login',
    component: Login
  }, {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [{
      path: '/welcome',
      component: Welcome
    }, {
      path: '/users',
      component: User
    }, {
      path: '/rights',
      component: Right
    }, {
      path: '/roles',
      component: Role
    }, {
      path: '/categories',
      component: Cate
    }, {
      path: '/goods',
      component: Good,
    }, {
      path: '/params',
      component: Params
    }, {
      path: '/goods/add',
      component: Add
    }, {
      path: '/orders',
      component: Order
    }, {
      path: '/reports',
      component: Report
    }]
  }]
})
router.beforeEach((to, from, next) => {
  if (to.path === '/login') return next()
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})
export default router
