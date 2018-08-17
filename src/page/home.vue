<template>
  <div class="index">
    <!-- 左侧导航 -->
    <div class="leftbar">
      <div>
        <img src="../assets/images/logo.png">
      </div>
      <!-- 左侧导航栏（router-link），避免代码重复，使用循环渲染，图标通关过属性绑定 动态拼接 -->
      <Menu class="mainNav" ref="Menu" :active-name="active">
        <template v-for="(item,index) in meauList">
          <router-link :key="index" class="router" active-class="router-link-exact-active" :to="item.name">
            <MenuItem :name="index" :key="index">
            <i class="iconimg">
              <img :class="item.icon" :src='geticonurl(item.icon)' />
            </i>
            {{item.meta.title}}
            </MenuItem>          
          </router-link>
        </template>      
      </Menu>
    </div>
    <div class="right-cont">
      <!-- 右上 -->
      <Row class="mainHeader">
        <Col :sm="{ span:20}" :md="{ span:20}" :lg="{ span:20}">
        </Col>
        <Col :sm="{ span:4}" :md="{ span:4}" :lg="{ span:4}">
        <Dropdown class="mainUser" trigger="click" placement="bottom-end">
          <a href="javascript:void(0)">
            <span>{{userMes?userMes:'admin'}}</span>
            <Icon type="arrow-down-b"></Icon>
          </a>
          <Dropdown-menu slot="list">
            <router-link to="/login">
              <Dropdown-item @click.native="signOut">退出</Dropdown-item>
            </router-link>
          </Dropdown-menu>
        </Dropdown>
        <div @click="showMessage" class="message-con" style="float:right">
          <Tooltip placement="bottom" transfer>
            <Badge :count="contents.length">
              <Icon type="ios-bell" :size="32"></Icon>
            </Badge>
            <div slot="content" style="white-space: normal;">
              <p> {{ contents.length > 0 ? '有' + contents.length + '条未读消息' : '无未读消息'}} </p>
              <ul>
                <li v-for="(item,index) in contents" :key="index">{{item}}</li>
              </ul>
            </div>
          </Tooltip>
        </div>
        </Col>
      </Row>
      <!-- 主路由 -->
      <div class="mainContent" :sm="{ span:18}" :md="{ span:18}" :lg="{ span:18}">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>
<script>
  import Cookies from 'js-cookie';
  import { routes } from '../router/index';
  var flash_title = {
    doc: document,
    timer: null,
    is_flash: false,
    o_title: '',
    msg: '你有新消息！！！',
    message: null,
    flash: function (msg) {

      if (this.is_flash) {
        this.clear(); //先停止
      } else {
        this.o_title = this.doc.title; //保存原来的title
      }
      this.is_flash = true;
      if (typeof (msg) == 'undefined') {
        msg = this.msg;
      }
      this.message = [msg, this.getSpace(msg)];
      var th = this;
      this.timer = setInterval(function () {
        th._flash(msg);
      }, 1000);
    },
    _flash: function (msg) {
      this.index = (!this.index) ? 1 : 0;
      this.doc.title = '【' + this.message[this.index] + '】';
    },
    clear: function () {
      clearInterval(this.timer);
      if (this.is_flash) // 如果正在闪
        this.doc.title = this.o_title; //将title复原
      this.is_flash = false;
    },
    getSpace: function (msg) {
      var n = msg.length;
      var s = '';
      var num = msg.match(/\w/g);
      var n2 = (num != null) ? num.length : 0; //半角字符的个数
      n = n - n2; //全角字符个数
      var t = parseInt(n2 / 2);
      if (t > 0) { //两个半角替换为一个全角
        n = n + t;
      }
      s = (n2 % 2) ? ' ' : ''; //如果半角字符个数为奇数
      while (n > 0) {
        s = s + '　'; //全角空格
        n--;
      };
      return s;
    }
  };
  export default {
    data() {
      return {
        imgsrc: "../assets/images/logo.png",
        png: '.png',
        userMes: null,
        contents: [],
        // 此处是通过 获取路由名的集合 meta.title 在路由配置里可看
        meauList: [],  ////meauLIst 已经被赋值  routes[1].meta
        active: "0",
        msgtype: 1, //1=inspectionReminder 2=problemHandling  3=problemHandling
      }
    },
    watch: {
      contents: {
        handler: (val, oldVal) => {

        },
        deep: true,
        // immediate: true  //表示创建组件时立马执行一次。(立即以表达式的当前值触发回调)
      }
    },
    //Goeasy 实时消息推送
    mounted() {
      this.$nextTick(function () {
        this.$refs.Menu.updateActiveName();
      })

      // this.$router.push(this.meauList[0].name);

      this.goEasy = new GoEasy({ //此appkey免费试用一年，过期需要重新申请。
        appkey: 'BC-261fa51d71da49fb8ad5278f3368776f'
      });

      this.goEasy.subscribe({
        channel: 'addNotification', //巡查提醒
        onMessage: (message) => {
          console.log("我收到消息", message)
          this.msgtype = 1;
          flash_title.flash()
          this.contents.push(message.content)
        },
        onSuccess: function () {
          // console.log("巡查提醒监听开启");
        },
        onFailed: function (error) {
          console.log("监听失败, 错误编码：" + error.code + " 错误信息：" + error.content)
        }
      });
      this.goEasy.subscribe({
        channel: 'updateRiver', //问题处理的提醒
        onMessage: (message) => {
          flash_title.flash()
          this.msgtype = 2;
          this.contents.push(message.content)
        },
        onSuccess: function () {
          // console.log("问题处理的提醒监听开启");
        },
        onFailed: function (error) {
          console.log("监听失败, 错误编码：" + error.code + " 错误信息：" + error.content)
        }
      });
      this.goEasy.subscribe({
        channel: 'addRiver_i', // 提交问题的  提醒
        onMessage: (message) => {
          flash_title.flash()
          this.msgtype = 3;
          this.contents.push(message.content)
        },
        onSuccess: function () {
          // console.log("提交问题的提醒监听开启");
        },
        onFailed: function (error) {
          console.log("监听失败, 错误编码：" + error.code + " 错误信息：" + error.content)
        }
      });
    },

    methods: {
      geticonurl(icon) {
        let url = './static/icon/';
        let png = ".png";
        let a = url + icon + png
        return a
      },
      showMessage() {
        flash_title.clear()
        if (Cookies.get('type') == 5) { //养护
          // this.$router.push({ name: 'problemHandling' });
        } else {
          //this.$router.push({ name: 'inspectionReminder' });
        }
        this.$nextTick(function () {
          this.$refs.Menu.updateActiveName();
        });
        this.contents = [];

      },
      signOut() {
        Cookies.remove('user');
        Cookies.remove('password');
        Cookies.remove('userid');
        this.$router.push({ name: 'login' });
      }
    },
    created() {
      
      console.log(routes[1])    //获取的所有一级路由  只有四个   "/" "/home"  "inspectionList" "drainInlet"
      //此处通过登录时，返回的type 确定要渲染的右侧栏详情，相当于不同权限 
      if (Cookies.get('type') == 9) { //环境监测站    路由差别  在router/index.js  写的
        this.$router.push({ name: 'drainInlet' });
      } else { 
        //4">建设局   5">环保局  6">城管局（这3个局只能看一个页面）       7">河长办"（所有的页面都可以看）
        this.meauList = Cookies.get('type') == 10 ? routes[1].children.filter(function (item) {
          return item.meta.requiresAuth == true; 
        }) : routes[1].children.filter(function (item) {
          return item.meta.navShow == true
        })
        this.$router.push({ name: this.meauList[0].name });
        this.userMes = Cookies.get('user') ? Cookies.get('user') : {};
        if (!this.userMes) {
          this.$router.push({ name: 'login' });
        }
      }
      console.log(this.meauList)   //meauLIst 已经被赋值  routes[1].meta
    }
    
  };

</script>


<style lang="scss">
  .ivu-menu-horizontal .ivu-menu-item,
  .ivu-menu-horizontal .ivu-menu-submenu {
    padding: 0 10px;
  }

  ::-webkit-scrollbar {
    /*滚动条整体样式*/
    width: 10px;
    /*高宽分别对应横竖滚动条的尺寸*/
    height: 10px !important;
  }

  ::-webkit-scrollbar-thumb {
    /*滚动条里面小方块*/
    border-radius: 10px;
    -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
    background: #535353;
  }

  ::-webkit-scrollbar-track {
    /*滚动条里面轨道*/
    -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
    border-radius: 10px;
    background: #EDEDED;
  }

  .index {
    height: 100%;
    .leftbar {
      overflow-x: hidden;
      padding-top: 35px;
      background: #1ac9c5;
      float: left;
      width: 240px;
      height: 100%;
      overflow-y: auto;
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      .mainNav {
        margin-top: 24px;
        background: #1ac9c5;
        color: #fff;
        a {
          color: #fff;
          &:hover {
            color: #333;
            .ivu-menu-item {
              background: transparent;
            }
          }
          &.ivu-menu-vertical {
            .ivu-menu-item {
              &:after {
                content: "";
                display: block;
                position: absolute;
                width: 5px;
                height: 100%;
                background: transparent;
                left: 0;
                top: 0;
              }
              &:hover {
                background: transparent;
              }
            }
          }
          &.router-link-exact-active {
            color: #138585;
            .ivu-menu-item {
              color: #138585;
              &:after {
                content: "";
                display: block;
                position: absolute;
                width: 5px;
                height: 100%;
                background: #fff;
                left: 0;
                top: 0;
              }
              &:hover {
                background: transparent;
              }
            }
          }
          .ivu-menu-item {
            font-size: 18px;
          } // .ivu-menu-item {
          //   font-size: 18px;
          //   &:hover {
          //     background: #1ac9c5;
          //     color: #138585
          //   }
          //   &.ivu-menu-item-active {
          //     position: relative;
          //     background: none;
          //     color: #138585;
          //     border-right: none;
          //     border-left: none； // border-left: 5px solid #fff;
          //   }
          //   &.ivu-menu-item-active:after {
          //     content: "";
          //     display: block;
          //     position: absolute;
          //     width: 5px;
          //     height: 100%;
          //     background: #fff;
          //     left: 0;
          //     top: 0;
          //   }
          //   .iconimg {
          //     display: inline-block;
          //     img {
          //       vertical-align: middle;
          //     }
          //   }
          // }
        }
      }
    }
    .right-cont {
      left: 0;
      box-sizing: border-box;
      padding-left: 240px;
      height: 100%; // overflow-y:auto;
      background: #faf9ff;
      &:after {
        content: "";
        clear: both;
        overflow: hidden;
        display: block;
      }
      .mainHeader {
        position: relative !important;
        height: 60px;
        width: 100%;
        background: none;
        z-index: 10;
        .message-con {
          display: inline-block;
          width: 30px;
          padding: 15px 0px;
          margin-right: 20px;
          text-align: center; //cursor: pointer;
        }
        &.ivu-row {
          .ivu-col {
            height: 60px !important;
          }
        }
        .mainLogo {
          // width: 100px;
          position: relative;
          height: 100%;
          img {
            display: block;
            position: absolute;
            top: 0;
            left: 20px;
            bottom: 0;
            margin: auto;
          }
        }
        .mainNav {
          background: #41b18b;
          a.router {
            height: 100%;

            display: inline-block;
            .ivu-menu-item {
              box-sizing: border-box;
              color: #fff;
            }
            .ivu-menu-item-active.ivu-menu-item-selected {
              border-bottom: 2px solid transparent;
              color: #fff;
            }
          }
          a.router-link-exact-active {
            .ivu-menu-item {
              color: red !important;
              border-bottom: 2px solid #2d8cf0 !important;
            }
          }
        }
        .mainUser {
          height: 100%;
          float: right;
          margin-right: 30px;
          .ivu-dropdown-rel {
            height: 100%;
            &>i {
              display: inline-block;
              position: relative;
              float: left;
              width: 60px;
              height: 100%;
              img {
                position: absolute;
                top: 0;
                bottom: 0;
                margin: auto;
              }
            }
            a {
              display: inline-block;
              position: relative;
              top: 0;
              height: 100%;
              line-height: 60px;
              color: #000;
              font-size: 18px;
              img {
                position: absolute;
                display: inline-block;
                top: 0;
                bottom: 0;
                margin: auto;
              }
            }
          }
        }
      }
      .mainContent {
        position: relative;
        width: 100%;
        height: calc(100% - 60px);
        overflow-y: auto;
        top: 0 !important;
      }
    }
  }
</style>