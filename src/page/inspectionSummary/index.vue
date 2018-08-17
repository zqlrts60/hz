<template>
  <div class="main">
    <div id="content" class="margintop0">
      <Row class="search" type="flex" justify="start">
        <Col>
        <Form inline :model="Search" style="text-align:left">
          <FormItem label="">
            <DatePicker split-panels v-model="Search.date" format="yyyy-MM-dd" type="daterange" :options="options2" placement="bottom-end"
              placeholder="请选择时间" style="width: 200px" @on-change="datechange"></DatePicker>
          </FormItem>
          <FormItem label="" v-show="layershowflag">
            <Select v-model="Search.layer" style="width:200px" placeholder="请选择区划" @on-change="changelayer">
              <Option :value="1" :key="1">区级</Option>
              <Option :value="2" :key="2">街道级</Option>
              <Option :value="3" :key="3">社区级</Option>
            </Select>
          </FormItem>
          <!--<FormItem label="">-->
          <!--<Select v-model="Search.otherUserID"  multiple :placeholder="placeholder">-->
          <!--<Option v-for="item in streetList" :value="item.otherUserID" :key="item.otherUserID">{{ item.userName +'   (' + item.manage +')'   }}</Option>-->
          <!--</Select>-->
          <!--</FormItem>-->
          <FormItem>
            <!--<Button type="primary" icon="android-search" @click="changePageNumber(false)">查询</Button>-->
            <Button type="error" icon="android-refresh" @click="reset()">重置</Button>
            <!--  <Button type="primary" icon="ios-download-outline" @click="exportData(1)">导出原始数据</Button>
              <Button type="primary" icon="ios-download-outline" @click="exportData(2)">导出排序后数据</Button> -->
          </FormItem>
        </Form>
        <!--   <template>
          <div style="border-bottom: 1px solid #e9e9e9;padding-bottom:6px;margin-bottom:6px;" v-show="streetList.length >1">
            <Checkbox :indeterminate="indeterminate" :value="checkAll" @click.prevent.native="handleCheckAll">全选</Checkbox>
          </div>
          <CheckboxGroup v-model="checkAllGroup" @on-change="checkAllGroupChange" style="padding-bottom:6px;margin-bottom:6px;">
            <Checkbox v-for="item in streetList" :label="item.otherUserID" :key="item.otherUserID">{{item.userName +' (' + item.manage +')' }}</Checkbox>
          </CheckboxGroup>
        </template> -->
        <!--<template >-->
        <!--<Tag v-for="item in streetList" :key="item.otherUserID" checkable   color="blue">{{ item.userName +'   (' + item.manage +')'   }}</Tag>-->
        <!--</template>-->
        </Col>
      </Row>
      <Row>
        <Col>
        <Table ref="table" border :columns="column" :data="tableData"></Table>
        <Page :total="total" placement="top" show-total @on-change="changePageNumber"></Page>
        </Col>
      </Row>
    </div>

    <Modal v-model="showsummaryflag" width="80%" height="600" :styles="{top: atuomodeltop}">
      <p slot="header" style="color:#f60;text-align:center">
        <span>问题列表</span>
      </p>
      <Table border :columns="columnsummary" :data="tableDatasummary"></Table>
      <div slot="footer">
      </div>
    </Modal>
    <Modal v-model="showdampflag" width="100%" height="600" :styles="{top: atuomodeltop}">
      <p slot="header" style="color:#f60;text-align:center">
        <span>巡查轨迹</span>
      </p>
      <div id="damp" style="width: 100%;height: 620px;"></div>
      <div slot="footer">
      </div>
    </Modal>
  </div>
</template>
<script>
  import imgexpand from '../../components/imgexpand.vue';

  import { baseImgpath, baseUrl } from '@/config/env';
  import { dateFormat } from '@/config/mUtils';
  import Cookies from 'js-cookie';
  import { AmapUtils } from '@/config/amapUtils'

  export default {
    data() {
      return {
        showdampflag: false,
        markerarr: [],
        lineArr: '',
        indeterminate: false,
        checkAll: true,
        checkAllGroup: [],
        showsummaryflag: false,
        placeholder: '请选择具体人员',
        streetList: [],
        Search: {
          date: [],
          otherUserID: '',
          layer: '' //区划
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
          width: 40,
          render: (h, params) => {
            return h(imgexpand, {
              props: {
                row: params.row
              },
            })
          }
        },
        {
          type: 'index',
          title: '序号',
          width: 70,
          align: 'center'
        },
        {
          title: '河长名字',
          key: 'userName',
          width: 100,
          align: 'center',

        },
        {
          title: '职务',
          key: 'duty',
          width: 100,
          align: 'center',
        },
        {
          title: '手机号',
          key: 'tel',
          align: 'center',
          sortable: true,
          render: (h, params) => {
            let alarmTel = params.row.tel.split(',');
            let tagArr = [];
            for (let i = 0; i < alarmTel.length; i++) {
              tagArr.push(h('span', {
                style: {
                  margin: '3px'
                },
              }, alarmTel[i]));
              if ((i + 1) % 2 == 0) {
                tagArr.push(h('br'))
              }
            }
            return tagArr
          }
        },
        {
          title: '河流名字',
          key: 'riverName',
          sortable: true,
          align: 'center',
        },
        {
          title: '上报地址',
          key: 'address',
          align: 'center',
          sortable: true,
        },
        {
          title: '上报时间',
          key: 'recordTime',
          width: '150',
          align: 'center',
          sortable: true
        },
        {
          title: '问题数量',
          key: 'count',
          align: 'center',
          sortable: true,
          render: (h, params) => {
            return h('div', [
              h('span', {
                style: {
                  margin: '0px',
                  color: 'red',
                  cursor: 'pointer'
                },
                on: {
                  click: () => {
                    this.showsummary(params.row.id)
                  }
                }
              }, params.row.count),
            ]);
          }
        },
        {
          title: '问题描述',
          key: 'summary',

          align: 'center',

          render: (h, params) => {
            return h('div', [
              h('span', {
                style: {
                  margin: '0px',
                  color: 'red',
                  cursor: 'pointer'
                },
                on: {
                  click: () => {
                    this.showsummary(params.row.id)
                  }
                }
              }, params.row.summary),
            ]);
          }
        },

        {
          title: '巡查距离（千米）',
          key: 'walkExtent',
          sortable: true,
          width: '150',
          align: 'center',
        },
        // walkExtent
        {
          title: '巡查轨迹',
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
                    this.showdamap(params.row.id)
                  }
                }
              }, '查看轨迹'),
            ]);
          }
        },
        ],
        columnsummary: [{
          type: 'index',
          title: '序号',
          width: 80,
          align: 'center'
        },
        {
          title: '上报地址',
          key: 'address',
          align: 'center',
          sortable: true,
        }, {
          title: '上报时间',
          key: 'recordTime',
          align: 'center',
          width: '150',
          sortable: true
        },
        {
          title: '问题描述',
          key: 'issue',

          align: 'center',
          sortable: true,
        },
        {
          title: '整改措施',
          key: 'summary',
          align: 'center',
          sortable: true,

        },
        {
          title: '现场图片',
          key: 'pic',
          align: 'center',

          render: (h, params) => {
            return h(imgexpand, {
              props: {
                row: params.row
              },
            })
          }
        },
        ],
        total: 0,
        page: 1,
        pageSize: 10,
        tableData: [],
        tableDatasummary: [],
        layershowflag: Cookies.get('type') == 8 ? false : true,
        pageCount: 1
      }
    },
    watch: {
      checkAllGroup: {
        handler: function (val, oldval) {
          this.changePageNumber(false)
        },
        deep: true, //对象内部的属性监听，也叫深度监听
        // immediate: true  //表示创建组件时立马执行一次。(立即以表达式的当前值触发回调)
      },

    },
    components: {
      imgexpand,
    },
    
    methods: {
      dateFormat,
      
      datechange() {
        this.changePageNumber(false)
      },
      
      showdamap(id) {
        //console.log("id",id)获取点击的id
        this.markerarr = []
        this.post('xyList', {
          rrID: id
        }).then(resp => {
          this.pageCount = resp.data.data.count; //坐标页数
          if (this.pageCount == 0) {
            this.$Notice.error({
              title: '',
              desc: '没有数据 '
            });
          } else {
            for (var i = 1; i <= this.pageCount; i++) {
              this.post('xyList', {
                rrID: id,
                page: i
              }).then(resp => {
                console.log(resp)
                if (resp.data.data.xylist) {
                  this.markerarr.push(resp.data.data.xylist[0].xy);
                }
                //console.log(this.markerarr.join('@').split('@'));
                let dmarkers = this.markerarr.join('@').split('@');
                let dlineArr = [];
                dmarkers.map(function (marker) {
                  if (marker.includes('#')) {
                    dlineArr.push(marker.split('#').sort())
                  }
                });
                console.log(dlineArr)
                let dmap = new AMap.Map("damp", {
                  resizeEnable: true,
                  layers: [new AMap.TileLayer.Satellite()],
                  center: [dlineArr[0][0], dlineArr[0][1]],
                  zoom: 20,
                  mapStyle: 'amap://styles/3e0ccecdd9900597de7f62ff9cd6483d'
                });
                AMapUI.load(['ui/misc/PathSimplifier', 'lib/$'], function (PathSimplifier, $) {

                  if (!PathSimplifier.supportCanvas) {
                    alert('当前环境不支持 Canvas，无法进行轨迹动态回放！推荐使用Chrome浏览器。');
                    return;
                  }
                  var pathSimplifierIns = new PathSimplifier({
                    zIndex: 150,
                    //autoSetFitView:false,
                    map: dmap, //所属的地图实例
                    getPath: function (pathData, pathIndex) {

                      return pathData.path;
                    },
                    getHoverTitle: function (pathData, pathIndex, pointIndex) {
                      if (pointIndex >= 0) {
                        //point
                        return '点：' + pointIndex + '/' + pathData.path.length;
                      }

                      return '点数量' + pathData.path.length;
                    },
                    renderOptions: {
                      pathLineStyle: {
                        dirArrowStyle: true
                      },
                      getPathStyle: function (pathItem, zoom) {
                        return {
                          pathLineStyle: {
                            strokeStyle: '#3366FF',
                            lineWidth: 8
                          },
                          pathLineSelectedStyle: {
                            strokeStyle: '#3366FF',
                            lineWidth: 10
                          }
                        };
                      }
                    }
                  });
                  window.pathSimplifierIns = pathSimplifierIns;
                  pathSimplifierIns.setData([{
                    name: '轨迹1',
                    path: dlineArr
                  }]);

                  var navg1 = pathSimplifierIns.createPathNavigator(0, {
                    loop: true,
                    speed: 100,
                    pathNavigatorStyle: {
                      width: 60,
                      height: 60,
                      lineJoin: 'round',
                      //使用图片
                      content: PathSimplifier.Render.Canvas.getImageContent('./static/gogo.gif', onload, onerror),
                      autoRotate: true,
                      //经过路径的样式
                      pathLinePassedStyle: {
                        lineWidth: 8,
                        strokeStyle: 'red',
                        dirArrowStyle: {
                          stepSpace: 15,
                          strokeStyle: '#0003ff'
                        }
                      }
                    }
                  });
                  navg1.start();

                  function onload() {
                    pathSimplifierIns.renderLater();
                  }

                  function onerror(e) {
                    alert('图片加载失败！');
                  }
                });
                dmap.plugin(["AMap.ToolBar"], function () {
                  dmap.addControl(new AMap.ToolBar());
                });
                this.showdampflag = true
              })
            }
          }
        })

      },
      
      handleCheckAll() {
        if (this.indeterminate) {
          this.checkAll = false;
        } else {
          this.checkAll = !this.checkAll;
        }
        this.indeterminate = false;

        if (this.checkAll) {
          this.checkAllGroup = this.streetList.map((item) => {
            return item.otherUserID
          });
        } else {
          this.checkAllGroup = [];
        }
      },
      
      checkAllGroupChange(data) {

        if (data.length === this.streetList.length) {
          this.indeterminate = false;
          this.checkAll = true;
        } else if (data.length > 0) {
          this.indeterminate = true;
          this.checkAll = false;
        } else {
          this.indeterminate = false;
          this.checkAll = false;
        }
      },
      
      changelayer(val) {
        if (val) {
          this.post('userType', {
            userType: val
          }).then(resp => {
            this.placeholder = val == 1 ? '请选择具体人员' : val == 2 ? '请选择具体街道' : '请选择具体社区';
            this.streetList = resp.data.data;
            this.checkAllGroup = this.streetList.map((item) => {
              return item.otherUserID
            });
            this.indeterminate = false;
            this.checkAll = true;
          })
        }
      },
      
      exportData(type) {
        if (type === 1) {
          this.$refs.table.exportCsv({
            filename: '巡查总结'
          });
        } else if (type === 2) {
          this.$refs.table.exportCsv({
            filename: '巡查总结(排序后)',
            original: false
          });
        }
      },

      showsummary(id) {
        this.post('listRiver_i', {
          rrID: id
        }).then(resp => {
          if (resp.data.data.length > 0) {
            this.tableDatasummary = resp.data.data;
            this.showsummaryflag = true;
          } else {
            this.$Notice.error({
              title: '',
              desc: '没有数据 '
            });
          }

        })
      },

      reset() {
        this.Search.date = [];
        this.Search.otherUserID = '';
        this.Search.layer = '';
        this.checkAllGroup = []
        this.streetList = []
        this.changePageNumber(false)
      },
      
      changePageNumber(page) {
        if (this.Search.date[0]) {
          this.post('listRiver_r', {
            begin: this.dateFormat(this.Search.date[0], 'yyyy-MM-dd'),
            end: this.dateFormat(this.Search.date[1], 'yyyy-MM-dd'),
            users: this.checkAllGroup.join(","),
            userID: Cookies.get('userid'),
            page: this.page = page ? page : 1,
          })
            .then(resp => {
              this.tableData = resp.data.data;
              this.total = this.tableData.length
            })
        } else {
          this.post('listRiver_r', {
            users: this.checkAllGroup.join(","),
            page: this.page = page ? page : 1,
            userID: Cookies.get('userid')
          })
            .then(resp => {
              this.tableData = resp.data.data;
              this.total = resp.data.count
            })
        }

      },
    },
    created() {
      this.changePageNumber();
    },
    
    computed: {
      atuomodeltop() {
        return document.documentElement.clientHeight > 660 ? '120px' : '2px'
      }
    },
    
    mounted() {
      if (!this.layershowflag) { //街道级别 直接显示所有人
        this.post('userType', {
          userID: Cookies.get('userid')
        }).then(resp => {
          this.streetList = resp.data.data;
          this.checkAllGroup = this.streetList.map((item) => {
            return item.otherUserID
          });
        })
      }
    }
  }

</script>
<style lang="scss">
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
    .notifice {
      margin-top: 20px;
    }
  }
</style>