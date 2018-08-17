import Vue from 'vue';
import Vuex from 'vuex';
import createPersistedState from 'vuex-persistedstate'
import listRiver from './modules/listRiver';
import user from './modules/user';
Vue.use(Vuex);

const store = new Vuex.Store({
  // 在部署生产时，不要启用严格模式！ 
  strict: process.env.NODE_ENV !== 'production',
  state: {
    ranklist: [],
    route:null,
    countHZ:[]
  },
  mutations: {
    setRanklist(state, payload) {
      state.ranklist = payload
    },
    setcountHZ(state, payload) {
      state.countHZ = payload
    },

  },
  actions: {

  },
  modules: {
    listRiver,
    user,

  },
  getters: {},
  plugins: [createPersistedState({})]

});

export default store;
