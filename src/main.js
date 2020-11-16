import Vue from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import store from './store'

// main.js
import API from 'syncobox-shared-api'

Vue.config.productionTip = false

API.config.mainBaseUrl = process.env.VUE_APP_MAIN_BASE_URL
API.config.bimBaseUrl = process.env.VUE_APP_BIM_BASE_URL
Vue.prototype.$API = API

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
