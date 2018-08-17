<template lang="html">
  <div class="dashboard">
    <div class="flex-container column">
      <div class="home-top">
        <!-- 巡查距离排行 top50 表-->
        <div class="chart-left">
          <div class="bg">
            <div id="mainbar" style="width: 100%;height: 100%;position: relative;">
            </div>
          </div>
        </div>
        <!-- 河长信息 表 -->
        <div class="chart-right">
          <div class="bg">
            <div id="mainpie" style="width: 100%;height: 100%;">
            </div>
          </div>
        </div>
      </div>
      <!-- 问题处理路top50 表 -->
      <div class="home-bottom">
        <div class="bg">
          <div id="mainwaterpolo" style="width: 100%;height: 100%;">
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  import { mapMutations } from 'vuex'
  import Cookies from 'js-cookie';
  import echarts from 'echarts'

  export default {
    data() {
      return {
        items: [],
        charts: [],
        //巡查榜
        ranklist: [],
        //巡查榜前五
        top5rank: [],
        //已处理问题百分比
        countByDispose: [],
        countByDisposetop5: [],
        //各种类河长数量
        countHZ: []
      }
    },
    
    created() {
      // 河长巡查排行榜
      this.post('/topByHZ', {}).then(resp => {
        //console.log(resp.data.data)
        this.ranklist = resp.data.data || '';
        this.top5rank = this.ranklist.slice(0, 5).sort(function (a, b) {
          return a.walkExtent > b.walkExtent
        });
        this.setRanklist(this.ranklist) //store 映射
      }).then(() => {
        this.createdbar();

      });
      // 查询已处理问题百分比
      this.post('/disposePercent', {}).then(resp => {
        this.countByDispose = resp.data.data;
        this.countByDisposetop5 = this.countByDispose.slice(0, 5);
      }).then(() => {
        this.createdwaterpolo();
      });
      // 各种类河长数量
      this.post('/countHZ', {}).then(resp => {
        this.countHZ = resp.data.data || '';
        this.setcountHZ(this.countHZ) //store 映射
      }).then(() => {
        this.createdpie();
      })
    },
    
    mounted() {
      this._inititem();
    },
    
    methods: {
      ...mapMutations([
        'setRanklist',
        // 将`this.setRanklist(this.ranklist)` 映射为 `this.$store.commit('setRanklist', this.ranklist)`
        'setcountHZ',
        // 将`this.setcountHZ(this.countHZ)` 映射为 `this.$store.commit('setcountHZ', this.countHZ)`
      ]),

      changetime(date) {
        console.log(date);
      },
      //表一 巡查距离排行
      createdbar() {
        let chart = echarts.init(document.getElementById('mainbar'));
        this.charts.push(chart);
        let xData = [],
          yData = [];
        let min = 0;
        this.top5rank.map(function (a, b) {
          xData.push(a.userName);
          if (a.walkExtent === 0) {
            yData.push(a.walkExtent + min);
          } else {
            yData.push(a.walkExtent);
          }
        });
        let option = {
          title: {
            text: '巡查距离排行TOP5',
            subtext: "",
            top: "24",
            left: "48",
            textStyle: {
              color: '#3b4152',
              fontSize: '16'
            },
            subtextStyle: {
              color: 'red',
              fontSize: '16'
            }
          },
          color: ['#3398DB'],
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'line',
              lineStyle: {
                opacity: 0
              }
            },
            formatter: function (prams) {
              if (prams[0].data === min) {
                return "巡查距离：0"
              } else {
                return "巡查距离：" + prams[0].data + "千米"
              }
            }
          },
          legend: {
            data: ['巡查距离'],
            show: false
          },
          grid: {
            left: '10',
            right: '10',
            bottom: '40',
            top: '15%',
            containLabel: true,
            z: 22
          },
          xAxis: [{
            type: 'category',
            gridIndex: 0,
            data: xData,
            axisTick: {
              alignWithLabel: true
            },
            axisLabel: {
              show: true,
              color: '#000',

            },
            axisLine: {
              lineStyle: {
                color: "transparent",
                width: 2,
              }
            },
            axisTick: {
              lineStyle: {
                color: "transparent",
                width: 2,
              }
            },
            splitLine: {
              show: true,
              lineStyle: {
                color: "transparent",
                width: 1,
                type: 'dashed'
              }
            },
          }],
          yAxis: [{
            type: 'value',
            name: '（千米）',
            nameTextStyle: {
              color: '#fff',
              fontSize: 16
            },
            gridIndex: 0,
            axisLine: {
              lineStyle: {
                color: 'transparent',
                width: 2,
              }
            },
            axisTick: {
              lineStyle: {
                color: 'transparent',
                width: 2,
              }
            },
            splitLine: {
              show: true,
              lineStyle: {
                color: "#eaeaea",
                width: 2,
                type: 'dashed'
              }
            },
            axisLabel: {
              color: 'rgb(170,170,170)',
              formatter: '{value} '
            }
          },],
          series: [{
            name: '巡查距离',
            type: 'bar',
            barWidth: '30%',
            xAxisIndex: 0,
            yAxisIndex: 0,
            label: {
              show: true,
              position: 'top',
              padding: 10,
              color: '#fff',
              fontSize: 14,
              formatter: '{c}'
            },
            itemStyle: {
              normal: {
                //柱状图圆角
                barBorderRadius: 30,
                color: new echarts.graphic.LinearGradient(
                  0, 0, 0, 1, [{
                    offset: 0,
                    color: '#00feff'
                  },
                  {
                    offset: 0.5,
                    color: '#027eff'
                  },
                  {
                    offset: 1,
                    color: '#0286ff'
                  }
                  ]
                )
              }
            },
            data: yData,
            zlevel: 11

          }

          ]
        };
        // 使用刚指定的配置项和数据显示图表。
        chart.setOption(option);
        var vm = this;
        chart.on('click', params => {
          this.jumpto("distance")
        });
      },
      
      //表二 河长信息
      createdpie() {

        let chart = echarts.init(document.getElementById('mainpie'));
        // this.charts.push(chart);
        var vm = this;

        let option = {
          title: {
            text: '河长信息',
            textStyle: {
              color: '#3b4152',
              fontSize: '16'
            },
            top: "24",
            left: "48",
          },
          tooltip: {
            trigger: 'item',
            formatter: "{a} <br/>{b}: {c} 人 ({d}%)",

          },
          series: [{
            name: '河长信息',
            type: 'pie',
            hoverAnimation: false,
            legendHoverLink: false,
            radius: ['20%', '65%'],
            color: ['#59e395', '#07bdff', '#b26dfe'],
            label: {
              normal: {
                position: 'inner',
                formatter: "{c} 人({d}%)"
              }
            },
            labelLine: {
              normal: {
                show: false
              },
            },
            tooltip: {
              show: false,

            },

            data: [
              { value: vm.countHZ[0].hzCount, name: '区级', selected: true },
              { value: vm.countHZ[1].hzCount, name: '街道级' },
              { value: vm.countHZ[2].hzCount, name: '社区级' },

            ]
          },
          {
            name: '河长信息',
            type: 'pie',
            radius: ['20%', '65%'],
            color: ['#59e395', '#07bdff', '#b26dfe'],
            label: {
              normal: {
                formatter: "{b}"
              },

            },
            data: [
              { value: vm.countHZ[0].hzCount, name: '区级', selected: true },
              { value: vm.countHZ[1].hzCount, name: '街道级' },
              { value: vm.countHZ[2].hzCount, name: '社区级' },

            ]
          }
          ]
        };
        // 使用刚指定的配置项和数据显示图表。
        chart.setOption(option);
        chart.on('click', params => {
          this.$router.push({ name: 'riverManageinfo' })
        });
      },
     
      //表三 问题处理率
      createdwaterpolo() {
        let chart = echarts.init(document.getElementById('mainwaterpolo'));
        this.charts.push(chart);
        var vm = this;
        let xData = [],
          yData = [];
        let min = 0;
        this.countByDisposetop5.map(function (a, b) {
          xData.push(a.userName);
          if (a.disposecount === 0) {
            yData.push(a.disposecount + min);
          } else {
            yData.push(a.disposecount);
          }
        });
        let option = {
          title: {
            text: '问题处理率TOP5',
            subtext: "",
            textStyle: {
              color: '#3b4152',
              fontSize: '16'
            },
            top: "24",
            left: "48",
            subtextStyle: {
              color: 'red',
              fontSize: '16'
            }
          },
          color: ['#3398DB'],
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'line',
              lineStyle: {
                opacity: 0
              }
            },
            formatter: function (prams) {
              if (prams[0].data === min) {
                return "处理率：0%"
              } else {
                return "处理率：" + prams[0].data + "%"
              }
            }
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '40',
            top: '80',
            containLabel: true
          },
          xAxis: [{
            type: 'category',
            data: xData,
            axisTick: {
              alignWithLabel: true
            },
            axisLabel: {
              show: true,
              color: '#000',

            },
            axisLine: {
              lineStyle: {
                color: "transparent",
                width: 2,
              }
            },
            axisTick: {
              lineStyle: {
                color: "transparent",
                width: 2,
              }
            },
            splitLine: {
              show: true,
              lineStyle: {
                color: "transparent",
                width: 1,
                type: 'dashed'
              }
            },

          }],
          yAxis: [{
            type: 'value',
            splitNumber: '5',
            axisLine: {
              lineStyle: {
                color: 'transparent',
                width: 2,
              }
            },
            axisTick: {
              lineStyle: {
                color: 'transparent',
                width: 2,
              }
            },
            splitLine: {
              show: true,
              lineStyle: {
                color: "#eaeaea",
                width: 2,
                type: 'dashed'
              }
            },
            axisLabel: {
              color: 'rgb(170,170,170)',
              formatter: '{value} '
            }
          },],
          series: [{
            name: '处理率',
            type: 'bar',
            barWidth: '20%',
            xAxisIndex: 0,
            yAxisIndex: 0,
            label: {
              show: true,
              position: 'top',
              padding: 10,
              color: '#fff',
              fontSize: 14,
              formatter: '{c}%'
            },
            itemStyle: {
              normal: {
                //barBorderRadius: 30,
                color: new echarts.graphic.LinearGradient(
                  0, 0, 0, 1, [{
                    offset: 0,
                    color: '#fff'
                  },
                  {
                    offset: 0.5,
                    color: '#dbe5f8'
                  },
                  {
                    offset: 1,
                    color: '#ceddf0'
                  }
                  ]
                )
              }
            },
            data: yData,
            zlevel: 11

          },


          ]
        };
        // 使用刚指定的配置项和数据显示图表。
        chart.setOption(option);
        chart.on('click', params => {
          this.jumpto("problem")
        });

      },

      _inititem() {
        this.items = document.querySelectorAll('.flex-container .item');
        for (let i = 0; i < this.items.length; i++) {
          this.items[i].dataset.order = i + 1;
        }
        var vm = this;
        window.addEventListener('resize', function () {
          vm.charts.map(function (item) {
            item.resize()
          })
        })
      },
      
      jumpto(tabsname) {
        this.$router.push({ name: 'ranking', query: { totabname: tabsname } })
      },
    },
   
    components: {}
  }

</script>
<style scoped>
  .home-top {
    width: 100%;
    position: relative;
    height: 450px;
  }

  .chart-left {
    padding-left: 45px;
    padding-right: 17px;
    width: 60%;
    height: 450px;
    float: left;
  }

  .chart-left .bg {
    background: #fff;
    height: 100%
  }

  .chart-right {
    padding-right: 45px;
    width: 40%;
    height: 450px;
    float: left;
  }

  .chart-right .bg {
    background: #fff;
    height: 100%;
    padding-right: 45px;
  }


  .home-bottom {
    padding-left: 45px;
    padding-right: 45px;
    padding-top: 20px;
    padding-bottom: 20px;
    height: 400px;
    width: 100%;
  }

  .home-bottom .bg {
    background: #fff;
    height: 100%;
  }
</style>