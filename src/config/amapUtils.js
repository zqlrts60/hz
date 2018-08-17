export const AmapUtils = {
  create: function (id, options) {
    var map = new AMap.Map(id, options);
    return map;
  },

  //设置城市
  setCity: function (map, cityName) {
    if (map != null && cityName != undefined) {
      if ("玄武区" == cityName) {
        map.setZoom(13);
        map.setCenter(new AMap.LngLat(118.797025, 32.069905));
      } else if ("中山陵园" == cityName) {
        map.setZoom(14);
        map.setCenter(new AMap.LngLat(118.797025, 32.069905));
      } else if ("秦淮区" == cityName) {
        map.setZoom(13);
        map.setCenter(new AMap.LngLat(118.789128, 32.020579));
      } else if ("建邺区" == cityName) {
        map.setZoom(12);
        map.setCenter(new AMap.LngLat(118.731694, 32.003552));
      } else if ("鼓楼区" == cityName) {
        map.setZoom(12);
        map.setCenter(new AMap.LngLat(118.739561, 32.081978));
      } else if ("浦口区" == cityName) {
        map.setZoom(11);
        map.setCenter(new AMap.LngLat(118.448595, 32.057555));
      } else if ("栖霞区" == cityName) {
        map.setZoom(11);
        map.setCenter(new AMap.LngLat(118.789171, 32.111659));
      } else if ("雨花台区" == cityName) {
        map.setZoom(12);
        map.setCenter(new AMap.LngLat(118.72188, 31.99381));
      } else if ("江宁区" == cityName) {
        map.setZoom(11);
        map.setCenter(new AMap.LngLat(118.590044, 31.893008));
      } else if ("六合区" == cityName) {
        map.setZoom(10);
        map.setCenter(new AMap.LngLat(118.520006, 32.369813));
      } else if ("溧水区" == cityName) {
        map.setZoom(10);
        map.setCenter(new AMap.LngLat(118.728746, 31.484015));
      } else if ("高淳区" == cityName) {
        map.setZoom(10);
        map.setCenter(new AMap.LngLat(118.695787, 31.312875));
      } else {
        map.setZoom(9);
        map.setCenter(new AMap.LngLat(118.382677, 31.934974));
      }

    }
  },

  //设置中心点
  setCenter: function (map, lng, lat) {
    map.setCenter(new AMap.LngLat(lng, lat));
  },

  /**
   * map:地图对象
   * options:参数：json格式
   * func：回调函数。点击marker执行的方法
   */
  addMarker: function (map, options, isShow = {}, func = {}) {
    var settings = {
      map: map
    };
    settings = Object.assign(settings, options);
    var marker = new AMap.Marker(settings);
    marker.setMap(map);
    AMap.event.addListener(marker, 'click', function () {
      if (func != null && typeof func == "function") {
        func();
      }
    });
    if (!isShow)
      marker.hide();
    return marker;
  },

  //根据指定的区域，画边界线
  addBounds: function (map, cityName, options) {
    var settings = {
      map: map
    };
    settings = Object.assign(settings, options);
    //加载行政区划插件
    AMap.service('AMap.DistrictSearch', function () {
      var opts = {
        subdistrict: 0, //返回下一级行政区
        extensions: 'all', //返回行政区边界坐标组等具体信息
        level: 'city' //查询行政级别为 市
      };
      var district = new AMap.DistrictSearch(opts);
      district.setLevel('district');
      district.search(cityName, function (status, result) {
        if (result && result.districtList) {
          var bounds = result.districtList[0].boundaries;
          if (bounds) {
            for (var i = 0, l = bounds.length; i < l; i++) {
              settings.path = bounds[i];
              //生成行政区划polygon
              new AMap.Polygon(settings);
            }
          }
        }

      });
    });
  },

  addPolygon: function (map, options, isShow = {}, func = {}) {
    var settings = {
      path: null, //设置线覆盖物路径
      strokeColor: "#3366FF", //线颜色
      strokeOpacity: 1, //线透明度
      strokeWeight: 3, //线宽
      strokeStyle: "solid", //线样式
      strokeDasharray: [10, 5], //补充线样式
      fillColor: "#3366FF",
      fillOpacity: 0.35,
      zIndex: 11,

    };
    settings = Object.assign(settings, options);

    var polygon = new AMap.Polygon(settings);
    polygon.on('click', function () {

      if (func != null && typeof func == "function") {
        func();
      }
    });
    polygon.setMap(map);

    if (!isShow)
      polygon.hide();

    return polygon;
  },

  //根据坐标点划线
  addLine: function (map, options, isShow = {}, func = {}) {
    var settings = {
      path: null, //设置线覆盖物路径
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
    };
    settings = Object.assign(settings, options);

    var polyline = new AMap.Polyline(settings);
    polyline.on('click', function () {
      if (func != null && typeof func == "function") {
        func();
      }
    });
    polyline.setMap(map);

    if (!isShow)
      polyline.hide();

    return polyline;
  }
};
