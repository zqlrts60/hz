<template>
  <div style="width:90%;margin-left:auto;margin-right:auto">
    <p style="text-align:left;padding-bottom:10px;">
      <Button type="ghost" @click="goback">返回问题列表</Button>
    </p>
    <Table ref="table" border :columns="column" :data="tableData"></Table>
    <Page :total="total" placement="top" :current="page" @on-change="changePageNumber" show-total></Page>
  </div>
</template>
<script>
import Cookies from 'js-cookie';
export default {
  data() {
    return {
      page: 1,
      total: 1,
      column: [{
          type: 'index',
          title: '序号',
          width: 70,
          align: 'center'
        },
        {
          title: '巡查时间',
          key: 'recordTime',
          align: 'center',
          sortable: true
        }, {
          title: '巡查人员',
          key: 'userName',

          align: 'center',
        },
        {
          title: '职务',
          key: 'duty',
          className: 'userSelectText',
          align: 'center',
        },
        {
          title: '上报位置',
          key: 'address',
          align: 'center',
        },

        {
          title: '问题描述',
          key: 'issue',
          className: 'userSelectText',
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('span', {
                style: {
                  margin: '0px',
                  color: 'red',
                },
              }, params.row.issue),
            ]);
          }

        },
        {
          title: '问题责任人',
          key: 'disposeName',
          align: 'center',
          className: 'userSelectText',
          render: (h, params) => {
            return h('div', [
              h('span', {
                style: {
                  marginRight: '5px'
                },
              }, params.row.disposeName)
            ]);
          }
        },
        {
          title: '是否处理',
          key: 'dispose',
          width: 120,
          align: 'center',
          className: 'userSelectText',
          render: (h, params) => {
            return h('div', [
              h('Button', {
                props: {
                  type: params.row.dispose == 0 ? 'error' : (params.row.dispose == 1 ? 'warning' : 'success'),
                  icon: params.row.dispose == 0 ? 'close' : (params.row.dispose == 1 ? 'log-in' : 'checkmark-round'),
                  // disabled: params.row.dispose == 0 ? false : true
                },
                style: {
                  marginRight: '5px'
                },
                // on: {
                //   click: () => {
                //     this.showhandle(params.row.proId)
                //   }
                // }

              }, params.row.dispose == 0 ? '未处理' : '已处理')
            ]);
          }
        },
        {
          title: '处理时间',
          key: 'disposeTime',
          align: 'center',
        },

        {
          title: '巡查的河道',
          key: 'riverName',
          align: 'center'
        },
        {
          title: '失效状态',
          key: 'isDel',
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('Button', {
                props: {
                  type: 'error',
                  // size: 'small'
                },
                style: {
                  marginRight: '5px'
                },
                on: {
                  click: () => {
                    this.showisDel(params.row.proId,params.row.isDel)
                  }
                }
              }, '恢复'),
            ]);
          }
        },
      ],
      tableData: [],
    }
  },
  methods: {
    changePageNumber(page) {
      console.log(page)
      this.post('listRiver_i', {
        isDel: 1,
        page: page,
      }).then(resp => {
        this.tableData = resp.data.data;
        this.total = resp.data.count
      })
    },
    goback() {
      this.$router.push({ name: 'problemHandling' })
    },
    showisDel(proId,isDel) {
      this.post('isDel', {
        proId: proId,
        isDel: isDel ? '0' : '1'
      }).then(resp => {
        this.$Message.success('更改成功');
        let page = this.page
        this.changePageNumber(page)
      })


    }
  },
  mouted() {

  },
  created() {
    this.changePageNumber()
  }
}

</script>
