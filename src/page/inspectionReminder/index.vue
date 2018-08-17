<template>
  <div class="main">

    <div id="content" class="margintop0">
      <Tabs value="name1">

        <TabPane label="河长信息" name="name1">

          <Row class="search" type="flex" justify="start">
            <Col>
            <Form inline :model="search">
              <FormItem label="">
                <Select v-model="search.layer" style="width:200px" placeholder="请选择区划">
                  <Option :value="1" :key="1">区级</Option>
                  <Option :value="2" :key="2">街道级</Option>
                  <Option :value="3" :key="3">社区级</Option>
                </Select>
              </FormItem>
              <FormItem v-if="showstreet">
                <Select v-model="search.getstreetid" style="width:200px" placeholder="请选择街道">
                  <Option v-for="item in streetList" :value="item.id" :key="item.id">{{ item.streetName }}</Option>
                </Select>
              </FormItem>
              <!--<DatePicker v-model="search.date"   type="daterange" :options="options2" placement="bottom-end" placeholder="请选择时间"  style="width: 200px"></DatePicker>-->
              <!--</FormItem>-->
              <FormItem>
                <!--<Button type="success"  icon="plus"  @click="add()">新增</Button>-->
                <!--<Button type="error" icon="android-refresh" @click="reset()">重置</Button>-->
                <Button type="primary" icon="ios-download-outline" @click="exportData(1)">导出原始数据</Button>
                <Button type="primary" icon="ios-download-outline" @click="exportData(2)">导出排序后数据</Button>
              </FormItem>
            </Form>
            </Col>
          </Row>

          <Row>
            <Col>
            <Table ref="table" border :columns="column1" :data="tableData1"></Table>
            </Col>
          </Row>

        </TabPane>

        <TabPane label="通知提醒" name="name2">
          <div style="padding:10px;">
            <Table ref="txtable" border :columns="txcolumn" :data="txtableData"></Table>
            <Page :total="txtotal" show-total @on-change="txchangePageNumber"></Page>
          </div>
        </TabPane>
      </Tabs>
    </div>

    <Modal v-model="showmodflag" :styles="{top: atuomodeltop}" @on-ok="ok">
      <p slot="header" style="color:#f60;text-align:center">
        <span>请选择巡查河流</span>
      </p>
      <RadioGroup v-model="checkriverid" style="padding-bottom:6px;margin-bottom:6px;">
        <Radio v-for="item in riversIdarr" :label="item.riverId" :key="item.riverId">{{ item.riverName }}</Radio>
      </RadioGroup>
      <!--{{checkriverid}}-->
    </Modal>
  </div>
</template>
<script>
  import Cookies from 'js-cookie';
  // import disposePercentarr from './a';

  export default {
    data() {
      return {
        showstreet: false,
        txtotal: 0,
        txpage: 1,
        txpageSize: 10,
        txtableData: [],
        showmodflag: false,
        riversIdarr: [],
        checkriverid: '',
        checkrivername: '',
        toWho: '',
        search: {
          date: [, ,],
          getstreetid: '',
          layer: 1 //区划
        },
        options2: {
          shortcuts: [{
            text: '近 1 星期',
            value() {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              return [start, end];
            }
          },
          {
            text: '近 1个月',
            value() {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              return [start, end];
            }
          }, {
            text: '近 3个月',
            value() {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
              return [start, end];
            }
          },
          {
            text: '近 1   年',
            value() {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 365);
              return [start, end];
            }
          }
          ]
        },
        txcolumn: [ //通知提醒表头

          {
            type: 'index',
            title: '序号',
            width: 80,
            align: 'center'
          },
          {
            title: '通知人',
            key: 'userName',
            align: 'center',
          },
          // {
          //   title: '消息类型',
          //   key: 'type',
          //   align: 'center',
          //   render: (h, params) => {
          //     return h('div', [
          //       h('span', {
          //         style: {
          //           marginRight: '5px'
          //         },
          //       }, params.row.type == 1 ? '公告' : '提醒'),
          //     ]);
          //   }
          // },

          {
            title: '通知时间',
            key: 'recordTime',
            align: 'center',
            sortable: true
          },
          {
            title: '通知内容',
            key: 'content',
            className: 'userSelectText',
            align: 'center',
            render: (h, params) => {
              return h('div', [
                h('p', {
                  props: {
                    type: 'primary',

                  },
                  style: {
                    marginRight: '5px'
                  },
                }, params.row.content),
              ]);
            }

          },
        ],
        column1: [{
          type: 'index',
          title: '序号',
          width: 80,
          align: 'center'
        },

        {
          title: '河长名字',
          key: 'userName',
          align: 'center',
          sortable: true,
        },
        {
          title: '职务',
          key: 'duty',
          align: 'center',
          sortable: true
        },
        {
          title: '上次巡查河道',
          key: 'riverName',
          align: 'center',
          sortable: true,
        },
        {
          title: '上次巡查时间',
          key: 'recordTime',
          align: 'center',
          sortable: true
        },
        {
          title: '电话',
          key: 'tel',
          align: 'center',
          sortable: true,

        },
        {
          title: '操作',
          key: '',
          width: 100,
          align: 'center',
          render: (h, params) => {

            return [h('Button', {
              props: {
                type: 'info',
                // size: 'small'
              },
              style: {
                marginRight: '5px'
              },
              on: {
                click: () => {
                  this.notice(params.row)
                }
              }
            }, '提醒'),
              // h('Button', {
              //   props: {
              //     type: 'error',
              //     // size: 'small'
              //   },
              //   style: {
              //     marginRight: '5px'
              //   },
              //   on: {
              //     click: () => {
              //
              //       this.modname1(params.row)
              //     }
              //   }
              // }, '删除')
            ]
          }
        },
        ],
        total1: 0,
        page: 1,
        pageSize: 10,
        tableData1: [],
        streetList: [],
      }
    },
    // computed: mapState({
    //   // 箭头函数可使代码更简练
    //   ranklist: state => state.ranklist
    // }),
    watch: {
      search: {
        handler: function (val, oldval) {
          if (val.layer == "3") {
            this.showstreet = true
          } else {
            this.showstreet = false;
            val.getstreetid = "";
          }
          this.querysearch()
        },
        deep: true, //对象内部的属性监听，也叫深度监听
        immediate: true //表示创建组件时立马执行一次。(立即以表达式的当前值触发回调)
      },
    },
    methods: {
      notice(row) {
        // myRiver
        this.post('myRiver', {
          userId: row.id,
        }).then(resp => {
          this.riversIdarr = resp.data.data.myRiverList;
          this.toWho = row.id;
          this.checkrivername = row.riverName;
          this.showmodflag = true;

        })

      },
      ok() {
        this.post('addNotification', {
          riverName: this.checkrivername,
          riverId: this.checkriverid,
          toWho: this.toWho,
          fromWho: Cookies.get('userid') ? Cookies.get('userid') : 31,
          type: 3,
          title: '巡河提醒'
        }).then(resp => {
          this.$Message.success('发送成功!');
        })
      },
      querysearch() {
        this.post('queryHZ', {
          type: this.search.layer,
          streetID: this.search.getstreetid,
        }).then(resp => {
          this.tableData1 = resp.data.data;
          this.total1 = this.tableData1.length
        })

      },
      reset() {
        this.search.date = [, ,];
        this.search.street = '';
      },

      exportData(type) { // 导出
        if (type === 1) {
          this.$refs.table.exportCsv({
            filename: '巡查提醒'
          });
        } else if (type === 2) {
          this.$refs.table.exportCsv({
            filename: '巡查提醒(排序后)',
            original: false
          });
        }
      },
      getnoticedata() {
        this.post('/notification', {
          userID: Cookies.get('userid') ? Cookies.get('userid') : 31,
          page: this.page,
          type: 3,
        })
          .then(resp => {
            this.txtableData = resp.data.data;
            this.txtotal = +resp.data.count
          })
      },
      txchangePageNumber(page) {
        this.page = page;
        this.post('/notification', {
          userID: Cookies.get('userid') ? Cookies.get('userid') : 31,
          type: 3,
          page: this.page,
        })
          .then(resp => {
            this.txtableData = resp.data.data;
            this.txtotal = +resp.data.count
          })
        console.log("xianshfi", page)
      }
    },
    created() {
      this.getnoticedata()
    },
    computed: {
      atuomodeltop() {
        return document.documentElement.clientHeight > 660 ? '120px' : '2px'
      }
    },
    mounted() {
      //街道选择框
      this.post('getAllinfo?infoId=1', {}).then(resp => {
        this.streetList = resp.data.data;
      })
    }
  }

</script>
<style lang="scss" scoped>
  .main {
    height: 100%;
    width: 100%;
    position: relative;
    #content {
      width: 95%;
      margin: 50px auto;
      &.margintop0 {
        margin-top: 0px;
      }
    }
  }
</style>