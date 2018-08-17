/**
 * 配置编译环境和线上环境之间的切换
 *
 * baseUrl: 域名地址
 * routerMode: 路由模式
 * baseImgPath: 图片存放地址
 *
 */
let baseUrl = '';
let baseImgpath = '';
if (process.env.NODE_ENV == 'development') {

  // baseUrl = 'http://192.168.0.239:8090';
  //  baseImgpath = 'http://192.168.0.239:8090';
  // baseUrl = 'http://hzz.cstor.cn:8967/hzz/';
  // baseImgpath = 'http://hzz.cstor.cn:8967/hzzfile/';

  baseUrl = 'http://58.213.47.166:9013/hzzDemo/';
  baseImgpath = 'http://58.213.47.166:9013/hzzfile/';
} else {
  // baseUrl = 'http://127.0.0.1:8090';
  // baseImgpath = 'http://127.0.0.1:8090';
  // baseUrl = 'http://58.213.47.166:9013/hzzDemo/';
  // baseImgpath = 'http://58.213.47.166:9013/hzzfile/';

  baseUrl = 'http://hzz.cstor.cn:8967/hzz/';
  baseImgpath = 'http://hzz.cstor.cn:8967/hzzfile/';
}
export {
  baseUrl,
  baseImgpath
}
