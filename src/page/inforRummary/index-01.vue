<template lang="html">
  <div class="dashboard">
    <div class="flex-container column">
      <div class="item one" @click="clickChart('1')" style="top: 0;left: 2%;width: 30%;height: 28vh;">
        <div id="mainwaterpolo" style="width: 100%;height: 100%;">

        </div>
      </div>
      <div class="item two" @click="clickChart('2')" style="top: 29vh;left: 2%;width: 30%;height: 28vh;">
        <div id="mainpie" style="width: 100%;height: 100%;">

        </div>
      </div>
      <div class="item three" @click="clickChart('3')" style="top:58vh;left: 2%;width: 30%;height: 28vh;">
        <div id="mainradar" style="width: 100%;height: 100%;">

        </div>
      </div>
      <div class="item four active" @click="clickChart('4')" style="top: 0px;left: 34%;width: 64%;height: 87vh;">
        <div id="mainbar" style="width: 100%;height: 100%;position: relative;">

        </div>
        <!--<DatePicker id="sltime" @on-change="changetime" type="year" placeholder="请选择年" style="width: 200px"></DatePicker>-->
      </div>
    </div>
  </div>
</template>

<script>
  import {mapMutations} from 'vuex'
  import Cookies from 'js-cookie';
  import echarts from 'echarts'
  export default {
    data() {
      return {
        items: [],
        charts: [],
        ranklist: [],
        top5rank: [],
        countByDispose: [],
        countByDisposetop5: [],
        countHZ: []
      }
    },
    created() {
      // 河长巡查排行榜
      this.post('/topByHZ', {}).then(resp => {
        this.ranklist = resp.data.data || '';
        this.top5rank = this.ranklist.slice(0, 5).sort(function (a, b) {
          return a.walkExtent > b.walkExtent
        });
        this.setRanklist(this.ranklist)  //store 映射
      }).then(() => {
        this.createdbar();

      });
      // 查询已处理问题百分比
      this.post('/disposePercent', {}).then(resp => {
        this.countByDispose = resp.data.data;
        this.countByDisposetop5 = this.countByDispose.slice(0,5);
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
      this.createdrader();
      this._inititem();
    },
    methods: {
      ...mapMutations([
        'setRanklist',
        // 将`this.setRanklist(this.ranklist)` 映射为 `this.$store.commit('setRanklist', this.ranklist)`
        'setcountHZ',
        // 将`this.setcountHZ(this.countHZ)` 映射为 `this.$store.commit('setcountHZ', this.countHZ)`
      ]),
      changetime(date){
        console.log(date);
      },
      createdbar() {
        let chart = echarts.init(document.getElementById('mainbar'));
        this.charts.push(chart);
        let xData = [],
          yData = [];
        let min = 0;
        this.top5rank.map(function(a, b) {
          xData.push(a.userName);
          if (a.walkExtent === 0) {
            yData.push(a.walkExtent + min);
          } else {
            yData.push(a.walkExtent);
          }
        });
        let option =  {
          title: {
            text: '巡查距离排行TOP5',
            subtext: "",
            textStyle: {
              color: '#fff',
              fontSize: '26'
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
            formatter: function(prams) {
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
            bottom: '5%',
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
            axisLine: {
              lineStyle: {
                color: '#0c3b71'
              }
            },
            axisLabel: {
              show: true,
              color: 'rgb(170,170,170)',
              fontSize:16
            }
          }],
          yAxis: [{
            type: 'value',
            name:'（千米）',
            nameTextStyle: {
              color: '#fff',
              fontSize: 16
            },
            gridIndex: 0,
            splitLine: {
              show: false
            },
            axisTick: {
              show: false
            },
            axisLine: {
              lineStyle: {
                color: '#0c3b71'
              }
            },
            axisLabel: {
              color: 'rgb(170,170,170)',
              formatter: '{value} '
            }
          },
          ],
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
        var vm=this;
        chart.on('click', function (params) {
          console.log(params.name);
          vm.top5rank.map((item) => { //名字
            if(item.userName == params.name){
              vm.post('/countHZ', {
                userID:item.oneUserId
              }).then(resp => {
                // this.countHZ = resp.data.data || ''
              })
            }
          });
        });
        setTimeout(function () {
          chart.resize()
        }, 177)
      },
      createdpie() {

        let chart = echarts.init(document.getElementById('mainpie'));
        this.charts.push(chart);
        var vm = this;

        let option = {
          title: {
            text: '河长信息',
            textStyle: {
              color: '#fff',
              fontSize: '26'
            }
          },
          tooltip: {
            trigger: 'item',
            formatter: "{a} <br/>{b}: {c} 人 ({d}%)",

          },
          series: [
            {
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
                {value: vm.countHZ[0].hzCount, name: '区级', selected: true},
                {value: vm.countHZ[1].hzCount, name: '街道级'},
                {value: vm.countHZ[2].hzCount, name: '社区级'},

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
                {value: vm.countHZ[0].hzCount, name: '区级', selected: true},
                {value: vm.countHZ[1].hzCount, name: '街道级'},
                {value: vm.countHZ[2].hzCount, name: '社区级'},

              ]
            }
          ]
        };
        // 使用刚指定的配置项和数据显示图表。
        chart.setOption(option);
        setTimeout(function () {
          chart.resize()
        }, 177)
      },
      createdwaterpolo() {
        let chart = echarts.init(document.getElementById('mainwaterpolo'));
        this.charts.push(chart);
        var vm = this;
        let xData = [],
          yData = [];
        let min = 0;
        this.countByDisposetop5.map(function(a, b) {
          xData.push(a.userName);
          if (a.disposecount === 0) {
            yData.push(a.disposecount + min);
          } else {
            yData.push(a.disposecount);
          }
        });
        let option =  {
          title: {
            text: '问题处理率TOP5',
            subtext: "",
            textStyle: {
              color: '#fff',
              fontSize: '22'
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
            formatter: function(prams) {
              if (prams[0].data === min) {
                return "处理率：0%"
              } else {
                return "处理率：" + prams[0].data + "%"
              }
            }
          },
          legend: {
            data: ['处理率', '背景'],
            show: false
          },
          grid: {
            left: '10',
            right: '10',
            bottom: '5%',
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
            axisLine: {
              lineStyle: {
                color: '#0c3b71'
              }
            },
            axisLabel: {
              show: true,
              color: 'rgb(170,170,170)',
              fontSize:16
            }
          }],
          yAxis: [{
            type: 'value',
            gridIndex: 0,
            splitLine: {
              show: false
            },
            axisTick: {
              show: false
            },
            min: min,
            max: 100,
            axisLine: {
              lineStyle: {
                color: '#0c3b71'
              }
            },
            axisLabel: {
              color: 'rgb(170,170,170)',
              formatter: '{value} %'
            }
          },
            {
              type: 'value',
              gridIndex: 0,
              min: min,
              max: 100,
              splitNumber: 12,
              splitLine: {
                show: false
              },
              axisLine: {
                show: false
              },
              axisTick: {
                show: false
              },
              axisLabel: {
                show: false
              },
              splitArea: {
                show: true,
                areaStyle: {
                  color: ['rgba(250,250,250,0.0)', 'rgba(250,250,250,0.05)']
                }
              }
            }
          ],
          series: [{
            name: '处理率',
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
              formatter: '{c}%'
            },
            itemStyle: {
              normal: {
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

          },
            {
              name: '背景',
              type: 'bar',
              barWidth: '50%',
              xAxisIndex: 0,
              yAxisIndex: 1,
              barGap: '-135%',
              data: [100, 100, 100, 100, 100, 100, 100],
              itemStyle: {
                normal: {
                  color: 'rgba(255,255,255,0.1)'
                }
              },
              zlevel: 9
            },

          ]
        };
        // 使用刚指定的配置项和数据显示图表。
        chart.setOption(option);
        setTimeout(function () {
          chart.resize()
        }, 177)
      },
      createdrader() {

        let chart = echarts.init(document.getElementById('mainradar'));
        this.charts.push(chart);
        let option = {
          title: {
            text: '河道水质',
            subtext: "水质达标率80%",
            textStyle: {
              color: '#fff',
              fontSize: '26'
            },
            subtextStyle: {
              color: 'red',
              fontSize: '16'
            }
          },
          radar: [{
            indicator: [{
              name: 'I类'
            }, {
              name: '二类',
              axisLabel: {
                show: false
              }
            }, {
              name: '三类',
              axisLabel: {
                show: false
              }
            }, {
              name: '四类',
              axisLabel: {
                show: false
              }
            }, {
              name: '五类',
              axisLabel: {
                show: false
              }
            },],

            startAngle: 90,
            splitNumber: 6,
            shape: 'polygon',
            triggerEvent: true,
            silent: true,
            scale: true,
            nameGap: 2,
            name: {
              formatter: '{value}',
              textStyle: {
                color: '#fff',
                fontSize: 12
              }
            },
            splitArea: {
              show: false
            },
            axisLine: {
              lineStyle: {
                color: '#449cff'
              }
            },
            axisTick: {
              show: true
            },

            splitLine: {
              lineStyle: {
                color: '#449cff'
              }
            }
          }],
          series: [{
            name: '雷达图',
            type: 'radar',
            areaStyle: {
              normal: {
                color: {
                  type: 'linear',
                  x: 0,
                  y: 0,
                  x2: 0,
                  y2: 1,
                  colorStops: [{
                    offset: 0,
                    color: '#44ff86'
                  }, {
                    offset: 1,
                    color: '#0060ff'
                  }],
                  globalCoord: false
                }
              }
            },
            lineStyle: {
              normal: {
                color: '#00ffff',
                width: 3
              }
            },
            data: [{
              value: [500, 600, 700, 800, 900],
              symbol: 'circle',
              symbolSize: 6,
              itemStyle: {
                normal: {
                  color: '#01eef0'
                }
              }
            }]
          }]
        };
        // 使用刚指定的配置项和数据显示图表。
        chart.setOption(option);
        setTimeout(function () {
          chart.resize()
        }, 177)

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
      clickChart(clickIndex) {
        var vm = this;
        let activeItem = document.querySelector('.flex-container .active');
        let activeIndex = activeItem.dataset.order;
        let clickItem = this.items[clickIndex - 1];
        if (activeIndex === clickIndex) {
          return
        }
        activeItem.classList.remove('active');
        clickItem.classList.add('active');
        this._setStyle(clickItem, activeItem);
        vm.createdbar();
        vm.createdpie();
        vm.createdwaterpolo();
        vm.createdrader();
        setTimeout(function () {
          vm.charts.map(function (item) {
            item.resize()
          })
        },277)

      },
      _setStyle(el1, el2) {
        let left1 = el1.style.left;
        let left2 = el2.style.left;

        let top1 = el1.style.top;
        let top2 = el2.style.top;

        let width1 = el1.style.width;
        let width2 = el2.style.width;

        let height1 = el1.style.height;
        let height2 = el2.style.height;

        el1.style.left = left2;
        el2.style.left = left1;
        el1.style.top = top2;
        el2.style.top = top1;
        el1.style.height = height2;
        el2.style.height = height1;
        el1.style.width = width2;
        el2.style.width = width1;

      },

    },
    components: {}
  }
</script>

<style lang="scss" scoped>

  .item {
    padding: 0px;
    margin: 0px;

    position: absolute;

    text-align: center;
    transition: all 0.3s;
    background: rgba(32, 32, 35, 0.5);
  }

  .dashboard {
    position: relative;
    width: 100%;
    height: 100%;
    margin: 0px;
    padding: 0px;
    overflow: hidden;
    padding-top: 30px;

  }

  .flex-container.column {
    position: relative;
    height: calc(100% - 20px);
    width: 95%;
    margin: 0 auto;
    box-sizing: content-box;
  }

  .active {

    margin-left: 10px;
    line-height: 300px;
  }

  .item {
    background: url("../../assets/images/bg.jpg") center no-repeat;
    background-size: cover;
  }
  #sltime{
    position: absolute;
    right: 5px;
    top: 5px;
    width: 200px;
    background: red;
    z-index: 1000000;
  }
</style>
