// 导入axios
import axios from 'axios'
// 配置请求的根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// 请求拦截器
axios.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
// Vue.prototype.$http = axios
// 登录
export const loginApi = params => {
  return axios.post('login', params)
}
// 获取home的导航栏菜单
export const homeApi = params => {
  return axios.get('menus', params)
}
// 获取用户列表
export const usersListApi = params => {
  return axios.get('users', {
    params
  })
}
// 修改用户状态
export const userStateApi = params => {
  return axios.put(`users/${params.uid}/state/${params.type}`)
}
// 添加用户
export const addUserApi = params => {
  return axios.post('users', params)
}
// 修改用户 /users/:id
export const editUserIdApi = params => {
  return axios.get(`users/${params}`)
}
// 编辑用户
export const editUserApi = params => {
  return axios.put(`users/${params.id}`, { email: params.email, mobile: params.mobile })
}
// 删除用户
export const deleteUserApi = params => {
  return axios.delete(`users/${params}`)
}
// 获取权限列表
export const getRightsApi = params => {
  return axios.get(`rights/${params}`)
}
// 获取角色列表
export const getRolesApi = params => {
  return axios.get('roles')
}
// 删除用户
export const deleteRightByIdApi = params => {
  return axios.delete(`roles/${params.roleId}/rights/${params.rightId}`)
}
// 角色授权
export const addRightApi = params => {
  return axios.post(`roles/${params.roleId}/rights`, { rids: params.rids })
}
// 分配用户角色
export const updateRoleApi = params => {
  return axios.put(`users/${params.id}/role`, { rid: params.rid })
}
// 获取商品分类列表
export const getCateApi = params => {
  return axios.get('categories', { params })
}
// 添加分类
export const addCateApi = params => {
  return axios.post('categories', params)
}
// 获取参数列表
export const getParamsApi = params => {
  return axios.get(`categories/${params.id}/attributes`, { params: { sel: params.sel } })
}
// 添加参数或者属性
export const addParamsApi = params => {
  return axios.post(`categories/${params.id}/attributes`, { attr_name: params.attr_name, attr_sel: params.attr_sel })
}
// 提交编辑后的参数
export const updateParamsApi = params => {
  return axios.put(`categories/${params.id}/attributes/${params.attrId}`, { attr_name: params.attr_name, attr_sel: params.attr_sel, attr_vals: params.attr_vals })
}
// 删除参数
export const deleteParamsApi = params => {
  return axios.delete(`categories/${params.id}/attributes/${params.attrid}`)
}
// 获取商品列表
export const getGoodsApi = params => {
  return axios.get('goods', { params })
}
// 根据id删除商品
export const deleteGoodApi = params => {
  return axios.delete(`goods/${params}`)
}
// 添加商品
export const addGoodApi = params => {
  return axios.post('goods', params )
}
// 获取订单列表
export const getOrdersApi = params => {
  return axios.get('orders', { params })
}
// 获取订单列表
export const getDeliverInfoApi = params => {
  return axios.get(`/kuaidi/${params}`)
}
// 获取数据报表
export const getReportApi = params => {
  return axios.get(`reports/type/1`)
}