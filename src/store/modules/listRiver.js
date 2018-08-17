const listRiver = {
  state: {
    listRiver: []
  },
  mutations: {
    setlistRiver(state, payload) {
      state.listRiver = payload.list;
    },

  },
  getters: {
    rivertList: state => {
      return state.listRiver.myRiverList
    },
    allRiverList: state => {
      return state.listRiver.allRiverList
    },
    newsList: state => {
      return state.listRiver.newNotification
    },
  },
  actions: {
    setlistRiver({commit}, list) {
      commit('setlistRiver', list)
    }
  }
};

export default listRiver;
