<template>
  <div id="main">
    <div :id="'amap'+ name" style="width:100%;height:100%;" @click="showdamap(xy,name)">

    </div>

    <Modal v-model="showdampflag" width="100%" height="600" :styles="{top: atuomodeltop}">
      <p slot="header" style="color:#f60;text-align:center">
        <span>巡查轨迹</span>
      </p>
      <div id="amp" style="width: 100%;height: 620px;"></div>
      <div slot="footer">
      </div>
    </Modal>
  </div>
</template>

<script>
  import {AmapUtils} from '@/config/amapUtils'

  export default {
    name: "amap",
    data() {
      return {
        showdampflag: false,
        markerarr: [],
        lineArr: '',
      }
    },
    props: ['xy', 'name'],
    created() {
      var objRegExp = /.txt$/;
      var vm=this.xy;
      if (this.xy.match(objRegExp)) {
        var fs = require("fs");
        fs.readFile("http://58.213.47.166:9013/hzz/uploaded/xy/ea290f43c2c9455b900b38b93a14e899.txt", "utf-8", function(error, config) {
          if (error) {
            console.log(error);
            console.log("config文件读入出错");
          }
          console.log(config.toString());
        })
        }
        },
        // console.log(this.xy);
      // }

      // $('#file').change(function() {
      //   // console.log(this.files[0])
      //   if (this.files[0]) {
      //     var file = this.files[0];
      //     var reader = new FileReader(); //new一个FileReader实例
      //     if (/text+/.test(file.type)) { //判断文件类型，是不是text类型
      //       reader.onload = function() {
      //         $('#pre').html('');
      //         $('#pre').append('<pre>' + this.result + '</pre>');
      //         $('#pre').css({opacity:0,left:50}).animate({opacity:1,left:0})
      //       }
      //       reader.readAsText(file);
      //     } else { //判断文件是不是imgage类型
      //       // alert('请上传txt格式文件');
      //       $('#pre').html('');
      //       $('#modal .modal-body').text('请上传txt格式文件');
      //       $('#modal').modal('show');
      //     }
      //   }


    methods: {
      showdamap(xy) {

        // if (xy.length > 50) {
        //   this.showdampflag = true;
        //   let dmarkers = xy.split('#');
        //   let dlineArr = [];
        //   dmarkers.map(function (marker) {
        //     if (marker.includes('@')) {
        //       dlineArr.push(marker.split('@').sort())
        //     }
        //   });
        //   let dmap = new AMap.Map("amp", {
        //     resizeEnable: true,
        //     layers: [new AMap.TileLayer.Satellite()],
        //     center: [dlineArr[0][0], dlineArr[0][1]],
        //     zoom: 20,
        //     mapStyle:'amap://styles/3e0ccecdd9900597de7f62ff9cd6483d'
        //   });
        //   AMapUI.load(['ui/misc/PathSimplifier', 'lib/$'], function (PathSimplifier, $) {
        //
        //     if (!PathSimplifier.supportCanvas) {
        //       alert('当前环境不支持 Canvas，无法进行轨迹动态回放！推荐使用Chrome浏览器。');
        //       return;
        //     }
        //     var pathSimplifierIns = new PathSimplifier({
        //       zIndex: 150,
        //       //autoSetFitView:false,
        //       map: dmap, //所属的地图实例
        //       getPath: function (pathData, pathIndex) {
        //
        //         return pathData.path;
        //       },
        //       getHoverTitle: function(pathData, pathIndex, pointIndex) {
        //         if (pointIndex >= 0) {
        //           //point
        //           return '点：' + pointIndex + '/' + pathData.path.length;
        //         }
        //
        //         return '点数量' + pathData.path.length;
        //       },
        //       renderOptions: {
        //         pathLineStyle: {
        //           dirArrowStyle: true
        //         },
        //         getPathStyle: function (pathItem, zoom) {
        //           return {
        //             pathLineStyle: {
        //               strokeStyle: '#3366FF',
        //               lineWidth: 8
        //             },
        //             pathLineSelectedStyle: {
        //               strokeStyle: '#3366FF',
        //               lineWidth: 10
        //             }
        //           };
        //         }
        //       }
        //     });
        //     window.pathSimplifierIns = pathSimplifierIns;
        //     pathSimplifierIns.setData([{
        //       name: '轨迹1',
        //       path: dlineArr
        //     }]);
        //
        //     var navg1 = pathSimplifierIns.createPathNavigator(0, {
        //       loop: true,
        //       speed: 100,
        //       pathNavigatorStyle: {
        //         width: 60,
        //         height: 60,
        //         lineJoin: 'round',
        //       //使用图片
        //        content: PathSimplifier.Render.Canvas.getImageContent('./static/gogo.gif', onload, onerror),
        //         autoRotate: true,
        //         //经过路径的样式
        //         pathLinePassedStyle: {
        //           lineWidth: 8,
        //           strokeStyle: 'red',
        //           dirArrowStyle: {
        //             stepSpace: 15,
        //             strokeStyle: '#0003ff'
        //           }
        //         }
        //       }
        //     });
        //     navg1.start();
        //     function onload() {
        //       pathSimplifierIns.renderLater();
        //     }
        //     function onerror(e) {
        //       alert('图片加载失败！');
        //     }
        //
        //   });
        //   // let marker = new AMap.Marker({
        //   //   map: dmap,
        //   //   position: [dlineArr[0][0], dlineArr[0][1]],
        //   //   // icon: new AMap.Icon({
        //   //   //   image: "http://58.213.47.166:9013/hzz/dist/static/img/gogo.gif",
        //   //   //   imageSize: new AMap.Size(30, 40),  //图标大小
        //   //   //   // imageOffset: new AMap.Pixel(-26, -13)
        //   //   // }),
        //   //   icon: "http://58.213.47.166:9013/hzz/dist/static/img/gogo.gif",
        //   //   offset: new AMap.Pixel(-56, 43),
        //   //   angle:'45'
        //   //   // autoRotation: true
        //   // });
        //   // let dpolyline = AmapUtils.addLine(dmap, {path: dlineArr});
        //   //
        //   // let passedPolyline = AmapUtils.addLine(dmap, {
        //   //   strokeColor: "#F00",  //线颜色})
        //   // });
        //   // marker.on('moving', function (e) {
        //   //   passedPolyline.setPath(e.passedPath);
        //   // });
        //   // setTimeout(function () {
        //   //   marker.moveAlong(dlineArr, 200);
        //   // }, 1000);
        //   // dpolyline.setMap(dmap);
        //   // 自适应
        //   // dmap.setFitView();
        //   dmap.plugin(["AMap.ToolBar"], function () {
        //     dmap.addControl(new AMap.ToolBar());
        //   });
        // } else {
        //   this.$Notice.error({
        //     title: '',
        //     desc: '没有数据 '
        //   });
        // }

      },
      createdmap() {

        let lineArr = [];
        this.markerarr.map(function (marker) {
          if (marker.includes('@')) {

            lineArr.push(marker.split('@').sort())
          }
        });
        let map = new AMap.Map("amap" + this.name, {
          resizeEnable: true,
          center: [118.8745, 32.0187],
          zoom: 12,
          // mapStyle:'amap://styles/3e0ccecdd9900597de7f62ff9cd6483d',
          features: ['bg', 'road', 'point']
        });

        let polyline = new AMap.Polyline({
          path: lineArr,          //设置线覆盖物路径
          strokeColor: "#3366FF", //线颜色
          strokeOpacity: 1, //线透明度
          strokeWeight: 5, //线宽
          strokeStyle: "solid", //线样式
          strokeDasharray: [10, 10], //补充线样式
          bubble: false,
          geodesic: false,
          isOutline: false,
          lineJoin: "miter",//折线拐点的绘制样式，默认值为'miter'尖角，其他可选值：'round'圆角、'bevel'斜角
          showDir: true,//是否延路径显示白色方向箭头,默认false。Canvas绘制时有效，建议折线宽度大于6时使用
        });
        polyline.setMap(map);
        // 自适应
        map.setFitView();
      }
    },
    computed: {
      atuomodeltop() {
        return document.documentElement.clientHeight > 660 ? '120px' : '2px'
      }
    },
    mounted() {
      // this.createdmap()
    }
  }
</script>

<style lang="scss" scoped>
  #main {
    height: 120px;
    width: 100%;
    margin: 5px 0;
    padding: 0;
    overflow: hidden;
    position: relative;
    .amap-logo {
      display: none !important;
    }

    .my-marker .amap-simple-marker-label {
      color: #fff;
    }
    // 高德的样式
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

  #sun {
    width: 400px;
    height: 300px;
  }
</style>
