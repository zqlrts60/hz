<template>
  <div id="main">
    <!-- 左侧栏  -->
    <div id="side">
      <!-- 开关 iview -->
      <i-switch id="sidectrl" size="large" v-model="rivertListShowflag" @on-change="changerivertList">
        <span slot="open">开启</span>
        <span slot="close">关闭</span>
      </i-switch>

      <!-- tap 切换  -->
      <Tabs value="name1">
        <TabPane label="河道" name="name1">
          <!-- <Button type="success" icon="plus" @click="add()" style="position: absolute;right: 15px;">新增河湖</Button> -->
          <!-- 树形菜单 -->
          <Tree :data="basetreeData" id="rivertreelist" @on-select-change="treelistclick"></Tree>
        </TabPane>
        <!-- <TabPane label="排口" name="name2"></TabPane>
        <TabPane label="泵站" name="name3"></TabPane> -->
      </Tabs>
    </div>
    <!-- 地图 -->
    <div id="gaodeMap">
    </div>
    <!-- <div id="ctrl">
      <i-switch size="large" v-model="riverShowflag" @on-change="changehedao">
        <span slot="open">开启河道</span>
        <span slot="close">关闭河道</span>
      </i-switch>
      <i-switch size="large" v-model="paikoushowflag" @on-change="changepaikou">
        <span slot="open"><img src="http://www.njhezhang.com/hzz/resource/image/entrance.png" height="22"
                               alt="">开启排口</span>
        <span slot="close"><img src="http://www.njhezhang.com/hzz/resource/image/entrance-red.png" height="22"
                                alt="">关闭排口</span>
      </i-switch>
      <i-switch size="large" v-model="bengzhanflag" @on-change="changebengzhan">
        <span slot="open"><img src="http://www.njhezhang.com/hzz/resource/image/pumpstation.png" height="20" alt="">开启泵站</span>
        <span slot="close"><img src="http://www.njhezhang.com/hzz/resource/image/pumpstation-red.png" height="20"
                                alt="">关闭泵站</span>
      </i-switch>
    </div> -->
    <Modal v-model="showmdflag" width="600" height="600" :styles="{top: atuomodeltop}">
      <p slot="header" style="color:#f60;text-align:center">
      </p>
      <img v-if="picPath" :src="picPath" width="570" height="600" />
      <p>{{bengzhanname}}</p>
      <div slot="footer">
      </div>
    </Modal>
    <Modal v-model="showriverflag" width="1120" :styles="{top: atuomodeltop}">
      <p slot="header" style="color:#f60;text-align:center">
        河道： {{rivername}}
      </p>
      <Tabs value="name1">
        <TabPane label="水质详情" name="name1">
          <riverinfo ref="riverinfo"></riverinfo>
        </TabPane>
        <TabPane label="河道信息" name="name2">
          <Form :model="formItem" :label-width="80">
            <FormItem label="河长">
              <Input v-model="formItem.input" placeholder="..."></Input>
            </FormItem>
            <FormItem label="电话">
              <Input v-model="formItem.tel" placeholder="..." :maxlength="maxlength"></Input>
            </FormItem>
            <FormItem label="起点">
              <Input v-model="formItem.start" placeholder="..."></Input>
            </FormItem>
            <FormItem label="终点">
              <Input v-model="formItem.end" placeholder="..."></Input>
            </FormItem>
            <FormItem label="河流描述">
              <Input v-model="formItem.textarea" type="textarea" :autosize="{minRows: 2,maxRows: 5}" placeholder="..."></Input>
            </FormItem>
          </Form>
        </TabPane>
      </Tabs>
      <div slot="footer">
      </div>
    </Modal>
    <Modal v-model="showaddriverflag" :styles="{top: atuomodeltop}">
      <p slot="header" style="color:#f60;text-align:center">
        <span> 新增河湖</span>
      </p>
      <Form ref="formCustom2" :model="formCustom2" :rules="ruleCustom2" :label-width="80" inline>
        <FormItem label="河道名字" prop="riverName">
          <Input type="text" v-model="formCustom2.riverName"></Input>
        </FormItem>
        <FormItem label="起点" prop="origin">
          <Input type="text" v-model="formCustom2.origin"></Input>
        </FormItem>
        <FormItem label="终点" prop="bXY">
          <Input type="text" v-model="formCustom2.bXY"></Input>
        </FormItem>
        <FormItem label="级别" prop="riverType">
          <Select v-model="formCustom2.riverType" style="width:200px" placeholder="请选择级别">
            <Option :value="1" :key="1">区级</Option>
            <Option :value="2" :key="2">街道级</Option>
            <Option :value="3" :key="3">社区级</Option>
          </Select>
        </FormItem>
        <FormItem label="街道" prop="streetID" v-show="formCustom2.riverType!=1">
          <Select v-model="formCustom2.streetID" style="width:200px" placeholder="请选择街道" filterable @on-change="getcommunityList">
            <Option v-for="item in streetList" :value="item.id" :key="item.id">{{ item.streetName }}
            </Option>
          </Select>
        </FormItem>
        <FormItem label="社区" prop="communityID" v-show="formCustom2.riverType==3">
          <Select v-model="formCustom2.communityID" style="width:200px" placeholder="请选择社区" filterable>
            <Option v-for="item in communityList" :value="item.id" :key="item.id">{{ item.communityName }}
            </Option>
          </Select>
        </FormItem>
        <FormItem label="备注" prop="destination">
          <Input type="text" v-model="formCustom2.destination"></Input>
        </FormItem>
        <FormItem label="长度/面积" prop="riverChief">
          <Input type="text" v-model="formCustom2.riverChief"></Input>
        </FormItem>
        <FormItem>
          <Button type="primary" @click="handleSubmit2('formCustom2')">提交</Button>
          <Button type="ghost" @click="handleReset('formCustom2')" style="margin-left: 8px">重置</Button>
        </FormItem>
      </Form>
      <div slot="footer">
      </div>
    </Modal>
  </div>
</template>
<script>
  import Cookies from 'js-cookie';
  import riverinfo from './mydata/riverinfo.vue';
  import { AmapUtils } from '@/config/amapUtils'
  import bengzhan from './mydata/bengzhan.js' //泵站
  import paikou from './mydata/paikou.js' //排口

  export default {
    props: {
      maxlength: {
        type: Number,
        default: 11
      },
    },
    data() {
      return {
        paikou0: [],
        paikouArrar0: [],
        paikoupage: 1,
        paikousize: 10,
        formItem: {
          input: '',
          textarea: '',
          tel: "",
          start: "",
          end: "",
        },
        showaddriverflag: false,
        formCustom2: {
          userId: Cookies.get('userid') || '',
          riverType: 1,
          riverName: '',
          origin: '',
          bXY: '',
          destination: '',
          streetID: '',
          riverChief: '',
          communityID: '',
        },
        ruleCustom2: {

          riverName: [
            { trigger: 'blur', required: true, message: '河道名字必填', }
          ],

          origin: [
            { trigger: 'blur', required: true, message: '起点必填', }
          ],
          destination: [
            { trigger: 'blur', required: true, message: '终点必填', }
          ],
          type: [
            { trigger: 'blur', required: true, message: '级别必填', }
          ],
        },
        streetList: [],
        communityList: [],
        map: null,
        basetreeData: [], //河流树
        picPath: null,
        bengzhanname: '',
        showmdflag: false,
        showriverflag: false, //河道详情model
        rivertListShowflag: true, //河长side table
        rivername: '', //河道详情名字
        paikoushowflag: false,
        bengzhanflag: false,
        riverShowflag: true,
        paikouMarkers: [],
        bengzhanMarkers: [],
        riverPolygons: [],
        bmarker: null, // 起终点
        emarker: null,
        mmarker: null, //中点
        oversettings: {
          strokeColor: "#00DB00", // 线颜色
          fillColor: "#00DB00",
        },
        outsettings: {
          strokeColor: "#3366FF", // 线颜色
          fillColor: "#3366FF",
        },

      }
    },

    methods: {

      //获取河流树数据
      inittree() {
        this.post('/riverTree', {}).then(resp => {
          this.getTree(resp.data.data)
        })
      },
      //新增河湖提交
      handleSubmit2(name) {
        this.$refs[name].validate((valid) => {
          if (valid) {
            this.post('addRiver', {
              ...this.formCustom2
            }).then(resp => {
              this.$Message.success('Success!');
              this.$refs[name].resetFields();
              this.showaddriverflag = false;
              this.inittree();
            })

          } else {
            this.$Message.error('Fail!');
          }
        })
      },

      // 街道查询社区
      getcommunityList(id) {
        this.post('getCommunity', {
          streetID: id
        }).then(resp => {
          this.communityList = resp.data.data;
          this.search.communityID = resp.data.data[0].id;
        })
      },

      //新增
      add() {
        this.$refs['formCustom2'].resetFields();
        this.showaddriverflag = true;

      },

      //河流树 数据处理 basetreeData
      getTree(tree) {
        let authTree = [];
        // 一层
        tree.map((item) => {
          item.title = `${item.riverName}（区级）`;
          // 设置自定义属性
          item.attr = item.connectriverId;
          // 二层
          item.child.map((e) => {
            e.title = `${e.riverName} （街道级）`;
            e.attr = e.connectriverId;
            // 三层
            e.child.map((b) => {
              b.title = `${b.riverName}（社区级）`;
              b.attr = b.connectriverId;
            });
            e.children = e.child;
          });
          item.children = item.child;
          authTree.push(item);
        });
        authTree[0].expand = true;
        authTree[0].children[0].expand = true;
        return this.basetreeData = authTree;
      },

      //按钮控制 河流树菜单隐藏与否
      changerivertList(value) {
        this.rivertListShowflag = value;
        if (value) {
          document.getElementById('side').style.width = '400px'
        } else {
          document.getElementById('side').style.width = '0px'
        }
      },

      // 点击树形菜单时 on-select-change
      treelistclick(row) {
        console.log(row)
        var vm = this;
        this.riverPolygons && this.map.remove(this.riverPolygons);
        this.bmarker && this.map.remove(this.bmarker);
        this.emarker && this.map.remove(this.emarker);
        this.mmarker && this.map.remove(this.mmarker);
        this.riverPolygons = [];
        this.$refs.riverinfo.changeriver(row[0].attr)
        this.post('/OneRiverMes', {
          connectRiverId: row[0].attr
        }).then(resp => {

          var resdata = resp.data.data[0];
          if (resdata.xy) { //如果有很多坐标
            let points = resdata.xy.split('#');
            let pointsArr = [];
            points.map(function (marker) {
              if (marker.includes('@')) {
                pointsArr.push(marker.split('@').sort())
              }
            });
            let polygon = AmapUtils.addPolygon(vm.map, {
              path: pointsArr,
              extData: resdata.connectriverId
            }, vm.riverShowflag,
              function () {
                vm.riverPolygons.map(function (v, index) {
                  v.setOptions(vm.outsettings);
                });
                polygon.setOptions(vm.oversettings);
                vm.rivername = resdata.riverName;
                vm.formItem.input = resdata.userName;
                vm.formItem.start = resdata.origin;
                vm.formItem.end = resdata.destination;
                vm.formItem.tel = resdata.tel;
                vm.showriverflag = true;
                vm.rivername = resdata.riverName;
              });
            if (polygon.getPath().length > 0) {
              var pt = polygon.getPath()[Math.round(polygon.getPath().length / 2)];
              vm.map.setZoomAndCenter(15, [pt.lng, pt.lat]);
            }
            vm.riverPolygons.push(polygon);
          } else if (resdata.bXY && resdata.eXY) { //只有起终点时
            var bmarker = AmapUtils.addMarker(
              vm.map, {
                position: [resdata.bXY.split('#')[0], resdata.bXY.split('#')[1]],

                content: '<div class="marker-route marker-marker-bus-from"></div>', //自定义点标记覆盖物内容
                label: {
                  content: resdata.riverName + '起点',
                  offset: new AMap.Pixel(-10, -20), //相对于基点的偏移位置
                },
                extData: resdata.connectriverId
              }, {},
              function () {

                vm.rivername = resdata.riverName;
                vm.formItem.input = resdata.userName;
                vm.formItem.start = resdata.origin;
                vm.formItem.end = resdata.destination;
                vm.formItem.tel = resdata.tel;
                vm.showriverflag = true;
              }
            );
            vm.bmarker = bmarker;
            var emarker = AmapUtils.addMarker(
              vm.map, {
                position: [resdata.eXY.split('#')[0], resdata.eXY.split('#')[1]],

                content: '<div class="marker-route marker-marker-bus-to"></div>', //自定义点标记覆盖物内容
                label: {
                  content: resdata.riverName + '终点',
                  offset: new AMap.Pixel(-10, -20), //相对于基点的偏移位置
                },
                extData: resdata.connectriverId
              }, {},
              function () {
                vm.rivername = resdata.riverName;
                vm.formItem.input = resdata.userName;
                vm.formItem.start = resdata.origin;
                vm.formItem.end = resdata.destination;
                vm.formItem.tel = resdata.tel;
                vm.showriverflag = true;
              }
            );
            vm.emarker = emarker;
            if (resdata.mXY) {
              var mmarker = AmapUtils.addMarker(
                vm.map, {
                  position: [resdata.mXY.split('#')[0], resdata.mXY.split('#')[1]],

                  content: '<div class="amap-lib-marker-mid"></div>', //自定义点标记覆盖物内容
                  label: {
                    content: resdata.riverName + '中点',
                    offset: new AMap.Pixel(-10, -20), //相对于基点的偏移位置
                  },
                  extData: resdata.connectriverId
                }, {},
                function () {
                  vm.rivername = resdata.riverName;
                  vm.formItem.input = resdata.userName;
                  vm.formItem.start = resdata.origin;
                  vm.formItem.end = resdata.destination;
                  vm.formItem.tel = resdata.tel;
                  vm.showriverflag = true;
                }
              );
              vm.mmarker = mmarker;
            }
            vm.map.setZoomAndCenter(15, [resdata.bXY.split('#')[0], resdata.bXY.split('#')[1]]);
          };
        })
        // let polygon;
        // let vm = this;
        // this.riverPolygons.map(function (v, index) {
        //   v.setOptions(vm.outsettings);
        //   if (v.getExtData() == row.managerId)
        //     polygon = v;
        // });
        // polygon.setOptions(this.oversettings);
        // if (polygon.getPath().length > 0) {
        //   var points = polygon.getPath()[Math.round(polygon.getPath().length / 2)];
        //   this.map.setZoomAndCenter(14, [points.lng, points.lat]);
        // }
      },

      
      changehedao(value) {
        this.riverPolygons.map(function (k) {
          if (value) {
            k.show();
          } else {
            k.hide();
          }
        });
      },
      changepaikou(value) {
        this.paikouMarkers.map(function (k) {
          if (value) {
            k.show();
          } else {
            k.hide();
          }
        });
      },
      changebengzhan(value) {
        this.bengzhanMarkers.map(function (k) {
          if (value) {
            k.show();
          } else {
            k.hide();
          }
        });
      },
     
      createdmap() {
        let map = AmapUtils.create("gaodeMap", {
          resizeEnable: true,
          mapStyle: 'amap://styles/3e0ccecdd9900597de7f62ff9cd6483d',
          features: ['bg', 'road', 'point']
        });
        this.map = map;
        //排口展示接口
        this.post('listOutlet', {
          page: this.paikoupage,
          size: this.paikousize
        }).then(resp => {
          if (resp.data.code) {
            console.log(typeof (resp.data.count))
            let pagenum = Math.ceil(resp.data.count / this.paikousize)
            console.log("fdfdfd", pagenum)

            for (let j = 1; j <= pagenum; j++) {
              this.paikoupage = j;
              this.post('listOutlet', {
                page: this.paikoupage,
                size: this.paikousize
              }).then(resp => {
                if (resp.data.code) {
                  this.paikou0 = resp.data.data
                  for (let i = 0; i < this.paikou0.length; i++) {
                    let outletCode = this.paikou0[i].outletCode
                    let outletName = this.paikou0[i].outletName
                    let outletType = this.paikou0[i].outletType
                    let remark = this.paikou0[i].remark

                    let marker0 = new AMap.Marker({
                      map: map,
                      title: this.paikou0[i].outletName,
                      position: [this.paikou0[i].xy.split(",")[0], this.paikou0[i].xy.split(",")[1]],
                      icon: new AMap.Icon({
                        size: new AMap.Size(30, 30), //图标大小
                        //image: "https://webapi.amap.com/theme/v1.3/images/newpc/way_btn2.png",
                        image: "../static/yvshui0.png",
                      })
                    })
                    marker0.on('click', function (e) {
                      console.log(e)
                      var html = '<div style="width:200px;"><p>编码：' + outletCode + '</p><p>名字：' + outletName + '</p><p>类型：' + outletType + '</p><p>出流形式：</p><p>备注：' + remark + '</p> </div>'
                      let infoWindow = new AMap.InfoWindow({
                        content: html //使用默认信息窗体框样式，显示信息内容
                      });
                      infoWindow.open(map, e.target.getPosition())

                    })
                  }
                }
              })
            }
          }
        })

        AMap.plugin(['AMap.MapType'],
          function () {
            map.addControl(new AMap.MapType());
          });
        // AmapUtils.addBounds(map, "玄武区", {
        //   map: map,
        //   strokeWeight: 2,
        //   fillOpacity: 0.1,
        //   fillColor: '#CCF3FF',
        //   strokeColor: '#CC66CC'
        // });
        AmapUtils.addBounds(map, "秦淮区", {
          map: map,
          strokeWeight: 2,
          fillOpacity: 0.1,
          fillColor: '#f3fff2',
          strokeColor: '#cc2850'
        });

        var vm = this;
        paikou.map(function (v, index) {
          if (v.longitude != "" && v.latitude != "") {
            var marker = AmapUtils.addMarker(
              map, {
                position: [v.longitude, v.latitude],
                icon: "http://www.njhezhang.com/hzz/resource/image/entrance.png"
              },
              vm.paikoushowflag,
              function () {
                vm.showmdflag = true;
                vm.picPath = v.picPath;
                vm.paikouMarkers.map(function (v) {
                  v.setIcon("http://www.njhezhang.com/hzz/resource/image/entrance.png");
                });
                marker.setIcon("http://www.njhezhang.com/hzz/resource/image/entrance-red.png");
              }
            );
            marker.setTitle(v.name);
            marker.setExtData(v.id);
            vm.paikouMarkers.push(marker);
          }
        });
        bengzhan.map(function (v, index) {
          if (v.longitude != "" && v.latitude != "") {
            var marker = AmapUtils.addMarker(
              map, {
                position: [v.longitude, v.latitude],
                icon: "http://www.njhezhang.com/hzz/resource/image/pumpstation.png"
              },
              vm.bengzhanflag,
              function () {
                vm.showriverflag = true;
                vm.bengzhanname = v.name;
                vm.bengzhanMarkers.map(function (v) {
                  v.setIcon("http://www.njhezhang.com/hzz/resource/image/pumpstation.png");
                });
                marker.setIcon("http://www.njhezhang.com/hzz/resource/image/pumpstation-red.png");
              }
            );
            marker.setTitle(v.name);
            marker.setExtData(v.id);
            vm.bengzhanMarkers.push(marker);
          }
        });
        // hedao.map(function (v, index) {
        //   let arr = [];
        //   v.mapInfoList.map(function (k, index) {
        //     arr.push([k.x, k.y]);
        //   });
        //   let polygon = AmapUtils.addPolygon(map, {path: arr, extData: v.managerId}, vm.riverShowflag,
        //     function () {
        //       vm.riverPolygons.map(function (v, index) {
        //         v.setOptions(vm.outsettings);
        //       });
        //       polygon.setOptions(vm.oversettings);
        //
        //       vm.showriverflag = true;
        //       vm.rivername = v.end;
        //     });
        //   vm.riverPolygons.push(polygon);
        // });

        AmapUtils.setCity(map, "秦淮区")
      }
    },
    components: {
      riverinfo
    },
    computed: {
      atuomodeltop() {
        return document.documentElement.clientHeight > 660 ? '120px' : '2px'
      }
    },
    mounted() {
      //确定河流树菜单高度
      document.getElementById('rivertreelist').style.height = (document.documentElement.clientHeight - 130) + 'px'
      this.createdmap();
      //街道选择框
      this.post('getAllinfo?infoId=1', {}).then(resp => {
        this.streetList = resp.data.data;
      })
    },
    
    created() {
      this.inittree();
    },

  }

</script>
<style>
  .ivu-tree>.ivu-tree-children>li {
    list-style: none;
    margin: 8px 0;
    padding: 0;
    white-space: nowrap;
    outline: 0;
    text-align: left !important;
  }

  .amap-marker .marker-route {
    position: absolute;
    width: 40px;
    height: 44px;
    color: #e90000;
    background: url(http://webapi.amap.com/theme/v1.3/images/newpc/poi-1.png) no-repeat;
    cursor: pointer;
  }

  .amap-marker .marker-marker-bus-from {
    background-position: -334px -180px;
  }

  .amap-marker .marker-marker-bus-to {
    background-position: -334px -140px;
  }

  .amap-lib-marker-mid {
    position: absolute;
    width: 19px;
    height: 31px;
    background: url(http://webapi.amap.com/theme/v1.3/markers/n/mid.png) no-repeat;
  }
</style>
<style lang="scss" scoped>
  #ctrl {
    width: 125px;
    position: absolute;
    right: 5px;
    bottom: 5px;
    background: #fff;
    border: 1px solid #4e72cd;

    .ivu-switch-large {
      width: 115px;
      margin: 5px;
    }
    .ivu-switch-large.ivu-switch-checked:after {
      left: 90px;
    }
    .ivu-switch-checked {
      .ivu-switch-inner {
        font-size: 15px;
        span {
          color: #fff;
        }
        img {
          vertical-align: middle;
          display: inline-block;
        }
      }
    }
    .ivu-switch-inner {
      font-size: 15px;
      span {
        color: red;
      }
      img {
        vertical-align: middle;
        display: inline-block;
      }
    }
  }

  #side {
    position: absolute;
    left: 0;
    top: 5px;
    bottom: 50px;
    width: 400px;
    background: #fff;
    z-index: 1000;
    height: 100%;
    #rivertreelist {
      padding: 5px;
      overflow: scroll;
    }

    #sidectrl {
      position: absolute;
      top: 5px;
      right: -50px;
      z-index: 1001;
    }
  }

  #gaodeMap,
  #main {
    height: 100%;
    width: 100%;
    margin: 0;
    padding: 0;
    position: relative;
    overflow: hidden;
    .amap-logo {
      display: none !important;
    }

    .my-marker .amap-simple-marker-label {
      color: #fff;
    } // 高德的样式
    .amap-marker-label {
      transform: translateX(-50%);
      border: 1px solid black;
      border-radius: 5px;
      .success {
        color: #1d8ce0;
      }
      .danger {
        color: #FF4949;
      }
    }
    .my-svg-marker .amap-simple-marker-label {
      color: #fff;
      top: 10px;
      font-size: 20px;
    }
  }
</style>