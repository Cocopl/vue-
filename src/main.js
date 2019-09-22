import Vue from 'vue'
import App from './App.vue'
import router from './router'
// 导入全局样式表
import './assets/css/global.css'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
// 导入字体图标
import './assets/fonts/iconfont.css'
// 导入elementUi
Vue.use(ElementUI)
// 导入树形组件
import TreeTable from 'vue-table-with-tree-grid'
Vue.component('tree-table', TreeTable)
Vue.config.productionTip = false
// 时间
import moment from 'moment'
Vue.filter('dataFormat', function(msg) {
  return moment().format('YYYY-MM-DD hh:mm:ss')
})
// 富文本
// require styles
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
import VueQuillEditor from 'vue-quill-editor'
Vue.use(VueQuillEditor)
// vue.filter('dataFormat', function(originVal) {
//   const dt = new Date(originVal)
//   const y = dt.getFullYear()
//   const m = (dt.getMonth() + 1 + '').padStart(2, '0')
//   const d = (dt.getDate() + '').padStart(2, '0')
//   const hh = (dt.getHours() + '').padStart(2, '0')
//   const mm = (dt.getMinutes() + '').padStart(2, '0')
//   const ss = (dt.getSeconds() + '').padStart(2, '0')
//   return `${y}-${m}-${d}-${hh}:${mm}:${ss}`
// })
import Timeline from './plugins/timeline/index.js'
import TimelineItem from './plugins/timeline-item/index'
Vue.use(TimelineItem)
Vue.use(Timeline)
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
