import Vue from 'vue'
import App from './App'
import '../static/css/common.css'
import store from './vuex/index.js'
import api from './utils/api.js'
var aldstat = require("./utils/ald-stat.js");

Vue.config.productionTip = false

global.aldstat = aldstat;
App.mpType = 'app'

Vue.prototype.$store = store;
Vue.prototype.$api = api;



const app = new Vue(App)
app.$mount()

export default {
  // 这个字段走 app.json
  config: {
    // 页面前带有 ^ 符号的，会被编译成首页，其他页面可以选填，我们会自动把 webpack entry 里面的入口页面加进去
    pages: ['^pages/home/main','pages/index/main'],
    window: {
      backgroundTextStyle: 'light',
      navigationBarBackgroundColor: '#4B375E',
      navigationBarTitleText: 'WeChat',
      navigationBarTextStyle: '#FFFFFF',
      backgroundColorTop: '#4B375E',
      backgroundColorBottom: '#4B375E'
    }
  }
}
