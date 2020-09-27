import Vue from 'vue'
import App from './App'
import uView from 'uview-ui'
import requestTool from './util/request.js'
import store from './store/index.js'

Vue.use(requestTool)
Vue.use(uView)

//把vuex定义成全局组件
Vue.prototype.$store = store
Vue.config.productionTip = false

App.mpType = 'app'

const app = new Vue({
    ...App,
	store
})
app.$mount()
