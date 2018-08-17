import Vue from 'vue' 
import iView from 'iview';
import App from './App'
import {router} from './router'
import store from './store'
// router拦截器
import '@/router/interceptors';
import 'iview/dist/styles/iview.css';

import http from './config/http'
import 'babel-polyfill'
import {sync} from 'vuex-router-sync'

Vue.prototype.get = http.get;
Vue.prototype.post = http.post;
Vue.prototype.postformdata = http.postformdata;

// this.post('/login', {  用法实例
//   username: this.loginForm.username,
//   password: this.loginForm.password
// }).then(resp => {
//
//   });
sync(store, router)
Vue.use(iView);
Vue.config.productionTip = false;

/* eslint-disable no-new */
//之所以把Hls挂载window对象上，是因为当DPlayer.video.type='hls'时，new DPlayer()对象会用到此对象。
window.Hls = require('hls.js');

new Vue({
  el: '#app',
  store,
  router,
  render: h => h(App),
});


