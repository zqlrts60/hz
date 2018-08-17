import Cookies from 'js-cookie';

const user = {
  state: {},
  mutations: {
    logout(state, vm) {
      Cookies.remove('user');
      Cookies.remove('password');
    }
  }
};

export default user;
