import Vue from 'vue'
import App from './App'
import https from '@/common/lib/request.js'
import appurl from '@/common/lib/allapi.js'

Vue.config.productionTip = false

Vue.prototype.$http = https;
Vue.prototype.$appurl = appurl;
Vue.prototype.$eventHub = Vue.prototype.$eventHub || new Vue()

import loading from "@/common/loadings/loading.vue"
Vue.component('loadings',loading)

App.mpType = 'app'

const app = new Vue({
    ...App
})

app.$mount()
