import Vue from 'vue'
import './plugins/vuetify'
import App from './App.vue'


import store from './store/store'


new Vue({
  render: h => h(App),
  
  store,
}).$mount('#app')
