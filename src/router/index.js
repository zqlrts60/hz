import Vue from 'vue'
import Router from 'vue-router'

export const routes = [{
    path: '/',
    name: 'login',

    meta: {
      title: '登陆'
    },
    component: (resolve) => require(['@/page/login/login'], resolve)
  },
  {
    path: '/home',
    name: 'home',
    meta: {
      navShow: true,
      title: '首页'
    },
    component: (resolve) => require(['@/page/home'], resolve),
    children: [{
        path: '/inforRummary',
        icon: 'messages',
        name: 'inforRummary',
        meta: {
          navShow: true,
          title: '信息汇总'
        },
        component: (resolve) => require(['@/page/inforRummary'], resolve),
      },
      {
        path: '/riverManageinfo',
        name: 'riverManageinfo',
        icon: 'riverlength',
        meta: {
          navShow: true,
          title: '河长信息'
        },
        component: (resolve) => require(['@/page/riverManageinfo'], resolve),
      },
      {
        path: '/myRiver',
        name: 'myRiver',
        icon: 'river',
        meta: {
          navShow: true,
          title: '所有河湖'
        },
        component: (resolve) => require(['@/page/myRiver'], resolve),
      },

      {
        path: '/problemHandling',
        name: 'problemHandling',
        icon: 'problem handling',
        meta: {
          navShow: true,
          title: '问题处理',
          requiresAuth: true
        },
        component: (resolve) => require(['@/page/problemHandling'], resolve),
      },
      {
        path: '/inspectionSummary',
        name: 'InspectionSummary',
        icon: 'tosumup',
        meta: {
          navShow: true,
          title: '巡查总结',
        },
        component: (resolve) => require(['@/page/inspectionSummary'], resolve),
      },
      {
        path: '/addnews',
        name: 'addnews',
        icon: 'release',
        meta: {
          navShow: true,
          title: '发布新闻'
        },
        component: (resolve) => require(['@/page/addnews/ueditor_demo.vue'], resolve),
      },
      {
        path: '/governmentDoc',
        name: 'governmentDoc',
        icon: 'file',
        meta: {
          navShow: true,
          title: '政府文件'
        },
        component: (resolve) => require(['@/page/governmentDoc'], resolve),
      },
      {
        path: '/inspectionReminder',
        name: 'inspectionReminder',
        icon: 'remind',
        meta: {
          navShow: true,
          title: '通知提醒'
        },
        component: (resolve) => require(['@/page/inspectionReminder'], resolve),
      },
      {
        path: '/notification',
        name: 'notification',
        icon: 'notice',
        meta: {
          navShow: true,
          title: '通知公告'
        },
        component: (resolve) => require(['@/page/notification'], resolve),
      },
      {
        path: '/riverLake',
        name: 'riverLake',
        icon: 'reports',
        meta: {
          navShow: true,
          title: '数据报表'
        },
        component: (resolve) => require(['@/page/riverLake'], resolve),
      },
      {
        path: '/drainagestatistics',
        icon: 'statistics',
        name: 'drainagestatistics',
        meta: {
          navShow: true,
          title: '排水统计'
        },
        component: (resolve) => require(['@/page/drainagestatistics'], resolve),
      },
      {
        path: '/reportstatistics',
        icon: 'ranking',
        name: 'reportstatistics',
        meta: {
          navShow: true,
          title: '报表统计'
        },
        component: (resolve) => require(['@/page/reportstatistics'], resolve),
      },

      {
        path: '/failureproblem',
        name: 'failureproblem',
        meta: {
          navShow: false, //通过navshow来决定菜单显示与否
          title: '问题回复',

        },
        component: (resolve) => require(['@/page/problemHandling/failureproblem'], resolve),
      },

      {
        path: '/ranking',
        name: 'ranking',
        icon: 'ranking',
        meta: {
          navShow: true,
          title: '排行榜'
        },
        component: (resolve) => require(['@/page/ranking'], resolve),
      },
      // {
      //   path: '/InfoMaintenance',
      //   name: 'InfoMaintenance',
      //   meta: {
      //     title: '信息维护'
      //   },
      //   component: (resolve) => require(['@/page/InfoMaintenance'], resolve),
      // },


      // {
      //   path: '/video',
      //   name: 'video',
      //   meta: {
      //     title: '视频'
      //   },
      //   component: (resolve) => require(['@/page/video'], resolve),
      // },
    ]
  },
  {
    path: '/inspectionList',
    icon: 'icon-icon02',
    name: 'inspectionList',
    meta: {
      title: '个人巡查列表' //个人巡查列表     路由单独写在外面，不在home组件内
    },
    component: (resolve) => require(['@/page/ranking/inspectionList'], resolve)
  },
  {
    path: '/drainInlet',
    name: 'drainInlet',
    icon: 'icon-icon02',
    meta: {
      title: '排水口导入' //环境监测站    路由单独写在外面 ，不在home组件内
    },
    component: (resolve) => require(['@/page/drainInlet'], resolve),
  },

];
Vue.use(Router);
export const router = new Router({
  // mode: 'history',
  routes,
});
