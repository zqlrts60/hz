<template>
  <div class="main">
    <div id="content" class="margintop0">
      <Row class="search" type="flex" justify="start">
        <Col>
          <Form inline :model="search">
            <FormItem label="">
              <DatePicker split-panels v-model="search.date" format="yyyy-MM-dd" type="daterange" :options="options2"
                          placement="bottom-end" placeholder="请选择时间" style="width: 200px"></DatePicker>
            </FormItem>
            <FormItem label="">
              <Select v-model="search.dispose" style="width:120px" placeholder="是否处理">
                <Option value="0">未处理</Option>
                <Option value="2">已处理</Option>
              </Select>
            </FormItem>
            <FormItem label="">
              <Select v-model="search.isRead" style="width:120px" placeholder="养护是否读到">
                <Option value="0">未读</Option>
                <Option value="1">已读</Option>
              </Select>
            </FormItem>
            <FormItem label="" v-if="ishzb">
              <Select v-model="search.departtype" style="width:130px" placeholder="请选择部门类型">
                <Option value="4">建设局</Option>
                <Option value="5">环保局</Option>
                <Option value="6">城管局</Option>
              </Select>
            </FormItem>
            <FormItem label="">
              <Select v-model="search.river" placeholder="请选择水体" filterable>
                <Option v-for="item in riverList" :value="item.riverId" :key="item.id">{{ item.riverName }}</Option>
              </Select>
            </FormItem>
            <FormItem>
              <Button type="error" icon="android-refresh" @click="reset()">重置</Button>
              <!-- <Button type="primary" icon="ios-download-outline" @click="exportData(1)">导出原始数据</Button>
              <Button type="primary" icon="ios-download-outline" @click="exportData(2)">导出排序后数据</Button> -->
            </FormItem>
          </Form>
        </Col>
      </Row>
      <Row>
        <Col>
          <Table ref="table" border :columns="column" :data="tableData"></Table>
          <Page :total="total" placement="top" :current="page" @on-change="changePageNumber" show-total></Page>
        </Col>
      </Row>
    </div>
    <Modal v-model="showhandleflag" width="700" height="400" :styles="{top: atuomodeltop}" @on-ok="handle">
      <p slot="header" style="color:#f60;text-align:center">
        <span>问题类型</span>
      </p>
      <RadioGroup v-model="problemtype" vertical>
        <Radio label="0">
          <span>是否存在污水直排口，是否有偷排、漏排、超排(城管局)</span>
        </Radio>
        <Radio label="1">
          <span>河岸是否存在垃圾、渣土、废弃物堆积、是否存在泥浆渣土、工业废液等废物入水（环保局）</span>
        </Radio>
        <Radio label="2">
          <span>水域是否出现成片漂浮物（浮萍、水草、垃圾等）（环保局）</span>
        </Radio>
        <Radio label="3">
          <span>河岸是否存在涉水违法建筑物，以及未经审批同意，在河道管理范围内违法建设项目的行为（建设局）</span>
        </Radio>
        <Radio label="4">
          <span>其他</span>
        </Radio>
      </RadioGroup>
    </Modal>
    <Modal v-model="showtreatflag" width="400" height="400" :styles="{top: atuomodeltop}" @on-ok="handle">
      <p slot="header" style="color:#f60;text-align:center">
        <span>问题处理</span>
      </p>
      <Upload ref="Upload" multiple type="drag" :action=" baseUrl + 'updateRiver_i'">
        <div style="padding: 20px 0">
          <Icon type="ios-cloud-upload" size="52" style="color: #3399ff"></Icon>
          <p>点击或者拖拽上传图片</p>
        </div>
      </Upload>
      <Input v-model="summary" type="textarea" :autosize="{minRows: 2,maxRows: 5}" placeholder="处理措施"></Input>
    </Modal>
    <Modal v-model="showdampflag" width="80%" height="600" :styles="{top: atuomodeltop}">
      <p slot="header" style="color:#f60;text-align:center">
        <span>地址详情</span>
      </p>
      <div id="makeramp" style="width: 100%;height: 520px;"></div>
      <div slot="footer">
      </div>
    </Modal>
  </div>
</template>
<script>
  import {baseUrl} from '@/config/env';
  import Cookies from 'js-cookie';
  import imgexpand from '../../components/imgexpand.vue';
  import amap from '../../components/amap.vue';
  import {dateFormat} from '@/config/mUtils';
  import { AmapUtils } from '@/config/amapUtils'

  export default {
    data() {
      return {
        baseUrl: baseUrl,
        problemtype: '0', //分发类型
        handleid: '', //问题列表id
        summary: '', //问题处理描述
        disposeXy: '', //问题经纬度
        disposeAddress: '', //问题地址
        showhandleflag: false, //河长办
        showtreatflag: false, //养护
        ishzb: false,
        showdampflag: false,
        riverList: [],
        search: {
          //dispose: this.$route.query.flag ? '' + this.$route.query.flag : '', //要字符串类型
          dispose: this.$route.query.flag != undefined ? '' + this.$route.query.flag : '', //要字符串类型
          isRead: '',
          date: [],
          departtype: '',
          river: this.$route.query.riverID ? this.$route.query.riverID : '',
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
        column: [{
          type: 'expand',
          width: 30,
          render: (h, params) => {
            return h(imgexpand, {
              props: {
                row: params.row
              },
            })
          }
        },
          // {
          //   type: 'index',
          //   title: '序号',
          //   width: 70,
          //   align: 'center'
          // },
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
            key: 'type',
            align: 'center',
            className: 'userSelectText',
            render: (h, params) => {
              return h('div', [
                h('span', {
                  style: {
                    marginRight: '5px'
                  },
                  // on: {
                  //   click: () => {
                  //     this.showhandle(params.row.proId)
                  //   }
                  // }

                }, params.row.type == 0 ? '建设局' : (params.row.type == 1 ? '城管局' : '环保局'))
              ]);
            }
          },
          {
            title: '是否处理',
            key: 'dispose',
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
            title: '处理描述',
            key: 'summary',
            className: 'userSelectText',
            align: 'center',
            render: (h, params) => {
              return h('div', [
                h('span', {
                  style: {
                    margin: '0px',
                    color: 'red',
                  },
                }, params.row.summary),
              ]);
            }

          },
          {
            title: '处理地址',
            key: 'xy',
            align: 'center',
            render: (h, params) => {

              return h('div', [
                h('Button', {
                  props: {
                    type: 'info',
                    // size: 'small'
                  },
                  style: {
                    marginRight: '5px'
                  },
                  on: {
                    click: () => {
                      this.showdamap(params.row.xy)
                    }
                  }
                }, '查看地址'),
              ]);
            }
          },
          {
            title: '操作',
            key: 'dispose',
            width: 287,
            align: 'center',
            className: 'userSelectText',
            render: (h, params) => {
              return h('div', [
                h('Button', {
                  props: {
                    type: 'primary',
                    disabled: params.row.dispose == 0 ? false : true
                  },
                  style: {
                    marginRight: '5px'
                  },
                  on: {
                    click: (e) => {
                      this.showhandle(params.row)
                    }
                  }

                }, Cookies.get('type') == '5'||Cookies.get('type') == '6' ? '处理' : '分发'),

                h('Button', {
                  props: {
                    type: 'error',
                    type: params.row.isread == 0 ? 'error' : 'success',
                    disabled: Cookies.get('type') == '5' ? false : true
                  },
                  style: {},
                  on: {
                    click: (e) => {
                      console.log(e);
                      this.readbtn(params.row)
                    }
                  }
                }, params.row.isread == 0 ? '未读' : '已读'),
                h('span', {
                  props: {
                    type: 'primary',
                    display: params.row.supervise == 0 ? 'none' : 'inline-block',
                    disabled:  true
                  },
                  style: {
                    marginLeft: '15px',
                    color:'red'
                  },
                  on: {
                    click: (e) => {
                      this.supervise(params.row)
                    }
                  }

                }, params.row.supervise == 0 ? '' : '已督办'),
              ]);
            }
          }
        ],
        total: 0,
        page: 1,
        pageSize: 10,
        tableData: []
      }
    },
    components: {
      imgexpand,
      amap
    },
    watch: {
      search: {
        handler: function (val, oldval) {
          this.changePageNumber(false)
        },
        deep: true, //对象内部的属性监听，也叫深度监听
        immediate: true //表示创建组件时立马执行一次。(立即以表达式的当前值触发回调)
      },
    },
    methods: {
      dateFormat,
      showdamap(xy) {
        let map = AmapUtils.create("makeramp", {
          resizeEnable: true,
          zoom: 13,
          center: [xy.split('#')[0],xy.split('#')[1]],
          mapStyle: 'amap://styles/3e0ccecdd9900597de7f62ff9cd6483d',
          features: ['bg', 'road', 'point']
        });
        AMap.plugin(['AMap.MapType'],
          function () {
            map.addControl(new AMap.MapType());
          });
        AmapUtils.addBounds(map, "秦淮区", {
          map: map,
          strokeWeight: 2,
          fillOpacity: 0.1,
          fillColor: '#f3fff2',
          strokeColor: '#cc2850'
        });
        this.showdampflag = true
       let marker = new AMap.Marker({
          icon: "http://webapi.amap.com/theme/v1.3/markers/n/mark_b.png",
          position: [xy.split('#')[0],xy.split('#')[1]]
        });
        marker.setMap(map);

      },
      readbtn(row) { //4">建设局   5">环保局  6">城管局    7">河长办"
        if (Cookies.get('type') == '5') {
          this.post('updateRiver_i  ', {
            isRead: 1,
            proId: row.proId,
          }).then(resp => {
            if (resp.data) {
              this.$Message.success('已提交');
              this.supervisestate = false
              console.log()
            }
          }).then(() => {
            this.changePageNumber(false)
          })
        }

      },
      supervise(row) {
        if(Cookies.get('type') != 4 || Cookies.get('type') != 5 || Cookies.get('type') != 6 ){
          let params = {
            type: row.type,
            id: row.id,
            superviseBy: row.superviseBy
          };
          this.post('supervise', {
            ...params
          }).then(resp => {
            console.log("督办", resp)
            if (resp.data) {
              this.$Message.success('已提交');

            }
          }).then(() => {
            this.changePageNumber(false)
          })
        }else {
          return false
        }


      },
      showhandle(row) {
        if (Cookies.get('type') != '5'&&Cookies.get('type') != '4'&&Cookies.get('type') != '6') {
          this.showhandleflag = true;
        } else if (Cookies.get('type') == '5'||Cookies.get('type') == '4'||Cookies.get('type') == '6') {
          this.$refs.Upload.clearFiles()
          this.showtreatflag = true;
        }
        this.proId = row.proId;
        this.summary = row.summary;
        this.disposeXy = row.disposeXy;
        this.disposeAddress = row.disposeAddress;
      },
      handle() {
        let params = {};
        if (Cookies.get('type') != '5') { //河长办
          params = Object.assign({}, {
            id: this.proId,
            type: this.problemtype
          })
        } else {
          params = Object.assign({}, { //养护
            id: this.proId,
            disposeBy: Cookies.get('userid'),
            dispose: 1,
            summary: this.summary,
            disposeAddress: this.disposeAddress,
            disposeXy: this.disposeXy,
          })
        }
        this.post('updateRiver_i  ', {
          ...params
        }).then(resp => {
          if (resp.data) {
            this.$Message.success('已提交');
          }
        }).then(() => {
          this.changePageNumber(false)
        })
      },
      exportData(type) {
        if (type === 1) {
          this.$refs.table.exportCsv({
            filename: '问题处理'
          });
        } else if (type === 2) {
          this.$refs.table.exportCsv({
            filename: '问题处理(排序后)',
            original: false
          });
        }
      },
      reset() {
        this.search.dispose = '';
        this.search.isRead = '';
        this.search.departtype = '';
        this.search.river = '';
        this.search.date = [],
          this.changePageNumber(false)
      },
      changePageNumber(page) {
        let params = {};
        if (this.search.date[0]) {
          params = Object.assign({}, { //4">建设局   5">环保局  6">城管局    7">河长办"
            begin: this.dateFormat(this.search.date[0], 'yyyy-MM-dd'),
            end: this.dateFormat(this.search.date[1], 'yyyy-MM-dd'),
            dispose: this.search.dispose,
            isRead: this.search.isRead,
            riverId: this.$route.query.riverID ? this.$route.query.riverID : this.search.river,
            departtype: Cookies.get('type') == 7 ? this.search.departtype : Cookies.get('type'),
            page: this.page = page ? page : 1,
            //userId: Cookies.get('userid') ? Cookies.get('userid') : 31,
            userId: this.$route.query.userID ? this.$route.query.userID : ""
          })
        } else {
          params = Object.assign({}, {
            dispose: this.search.dispose,
            isRead: this.search.isRead,
            riverId: this.search.river,
            departtype: Cookies.get('type') == 7 ? this.search.departtype : Cookies.get('type'),
            page: this.page = page ? page : 1,
            // userId: Cookies.get('userid') ? Cookies.get('userid') : 31,
            userId: this.$route.query.userID ? this.$route.query.userID : ""
          })
        }
        this.post('listRiver_i', {
          ...params
        })
          .then(resp => {
            this.tableData = resp.data.data;
            this.total = resp.data.count

          })

      },
    },
    computed: {
      atuomodeltop() {
        return document.documentElement.clientHeight > 660 ? '120px' : '2px'
      },

    },
    created() {
      //查询匹配水体,获取河流信息
      this.post('/mpRiver', {})
        .then(resp => {
          this.riverList = resp.data.data;
        });
      this.ishzb = Cookies.get('type') == 7 ? true : false
    },
    mounted() {

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
    img {
      width: 100%;
      vertical-align: middle
    }
  }

</style>
