<template>
  <div class="main">
    <div id="content">

      <Row>
        <Col>
          <Table ref="table" border :columns="column" :data="tableData"></Table>
          <!-- <Page :total="total" placement="top"
                show-total @on-change="changePageNumber"></Page> -->
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
  import {AmapUtils} from '@/config/amapUtils'
  import {baseUrl} from '@/config/env';

  export default {
    data() {
      return {
        showdampflag: false,
        markerarr: [],
        lineArr: '',
        showsummaryflag: false,
        columnsummary: [
          {
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
            className: 'userSelectText',
            align: 'center',
            sortable: true,
          },
          {
            title: '整改措施',
            key: 'summary',
            align: 'center',
            sortable: true,
            className: 'userSelectText',
          },
          {
            title: '现场图片',
            key: 'pic',
            align: 'center',
            className: 'userSelectText',
            render: (h, params) => {
              return h(imgexpand, {
                props: {
                  row: params.row
                },
              })
            }
          },
        ],
        tableDatasummary: [],
        column: [
          {
            type: 'expand',
            width: 50,
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
            className: 'userSelectText',
            align: 'center',
            sortable: true,
          },
          {
            title: '职务',
            key: 'duty',
            className: 'userSelectText',
            align: 'center',
            sortable: true,
          },
          {
            title: '河流名字',
            key: 'riverName',
            className: 'userSelectText',
            align: 'center',
            sortable: true,
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
            className: 'userSelectText',
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
                }, params.row.summary),
              ]);
            }
          },
          {
            title: '手机号',
            key: 'tel',
            align: 'center',
            sortable: true,
            className: 'userSelectText',
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
            title: '巡查轨迹',
            key: 'xy',
            align: 'center',
            className: 'userSelectText',
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

        total: 0,
        page: 1,
        pageSize: 10,
        tableData: [],

      }
    },
    components: {
      imgexpand,
    },
    methods: {
      showdamap(id) {
        this.markerarr = []
        this.post('xyList', {
            rrID: id
          }
        ).then(resp => {
          this.pageCount = resp.data.data.count;  //坐标页数
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
                }
              ).then(resp => {
                if (resp.data.data.xylist) {
                  this.markerarr.push(resp.data.data.xylist[0].xy);
                }
                // console.log(this.markerarr.join('@'));
                let dmarkers = this.markerarr.join('@').split('@');
                let dlineArr = [];
                dmarkers.map(function (marker) {
                  if (marker.includes('#')) {
                    dlineArr.push(marker.split('#').sort())
                  }
                });
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
      showsummary(id) {
        this.post('listRiver_i', {
            rrID: id
          }
        ).then(resp => {
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

      changePageNumber(page) {

        this.post('listOneUserRiver_r', {
          userId: this.$route.query.userId,
          //page: this.page = page ? page : 1,
        })
          .then(resp => {
            this.tableData = resp.data.data;
            this.total = this.tableData.length
          })

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

    }
  }
</script>

<style lang="scss">
  .main {
    height: 100%;
    width: 100%;
    position: relative;
    #content {
      width:95%;
      margin: 50px auto;

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
