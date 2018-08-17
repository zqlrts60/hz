import iView from 'iview';
import Cookies from 'js-cookie';
import {router} from './index';
import {util} from '../config/mUtils';
// 监听路由跳转
router.beforeEach((to, from, next) => {
  //iview进度条
  iView.LoadingBar.start();
  // 每个页面设置标题
  util.title(to.meta.title);
  if (!Cookies.get('userid') && to.name !== 'login') { // 如果没登录，且跳转的页面不是登录页 
    next({
      name: 'login'
    });
  } else if (Cookies.get('userid') && to.name === 'login') { // 如果已经登录了，且跳转的是登录页
    next({name: 'home'});
  } else {    //已经登录，跳转其他页面  或者  没登录，跳转登录页
    next();
  }
});

router.afterEach((to) => {
  iView.LoadingBar.finish();
  window.scrollTo(0, 0);
});
