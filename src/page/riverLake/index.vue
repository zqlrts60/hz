<template>
  <div class="main">
    <div id="content" class="margintop0">
      
      <!-- 筛选框 -->
      <Row class="search" type="flex" justify="start">
        <Col>
        <Form inline :model="search">
          <Select v-model="search.river" style="width:200px" placeholder="请选择街道" filterable>
            <Option v-for="item in rivertList" :value="item.id" :key="item.id">{{ item.streetName }}
            </Option>
          </Select>
          <DatePicker split-panels transfer v-model="search.date" type="daterange" placement="bottom-end" placeholder="请选择日期" style="width: 200px"></DatePicker>
          <Button type="error" icon="android-refresh" @click="reset()">重置</Button>
          <Button type="primary" icon="android-refresh" @click="exporttabel">导出月报表</Button>
        </Form>
        </Col>
      </Row>

      <Row>
        <!-- 巡河次数 -->
        <div id="countRrbar">
        </div>
        <!-- 巡河上报问题数 -->
        <div id="countRibar">
        </div>
        <Row>
          <Col span="12" style="padding-right:10px;">
            <!--河湖数量-->
          <div id="countRiverbar">          
          </div>
          </Col>
          <Col span="12" style="padding-left:10px;">
             <!--河长信息-->
          <div id="countRiverpie">      
          </div>
          </Col>
        </Row>
      </Row>
    </div>
  </div>
</template>
<script>
  import Cookies from 'js-cookie';
  import echarts from 'echarts'
  import { mapState } from 'vuex'
  import { dateFormat } from '@/config/mUtils';
  import { baseImgpath } from '@/config/env';
  export default {
    data() {
      return {
        search: {
          river: '',
          date: []
        },
        rivertList: [], //街道
        waterdata: [],
        riverName: '',
        countRr: [],
        countRi: [],
        countRiver: [],
        countHezhang: [],
      }
    },
    components: {},
    computed: mapState({
      // 箭头函数可使代码更简练
      countHZ: state => state.countHZ
    }),
    watch: {
      search: {
        handler: function (val, oldval) {
          console.log("dfd", val)
          this.inittwo()
        },
        deep: true, //对象内部的属性监听，也叫深度监听
        immediate: true //表示创建组件时立马执行一次。(立即以表达式的当前值触发回调)
      },
    },
    methods: {
      dateFormat,
      inittwo() {
        if (this.search.date[0]) {
          this.post('countRi', {
            begin: this.search.date[0] ? this.dateFormat(this.search.date[0], 'yyyy-MM-dd') : "",
            end: this.search.date[1] ? this.dateFormat(this.search.date[1], 'yyyy-MM-dd') : "",
            streetID: this.search.river,
          })
            .then(resp => {
              this.countRi = resp.data.data
            }).then(() => {
              this.initcountRibar();
            })
        } else {
          this.post('countRi', {
            streetID: this.search.river,
          })
            .then(resp => {
              this.countRi = resp.data.data

            }).then(() => {
              this.initcountRibar();
            })
        }
        // 统计巡河次数
        if (this.search.date[0]) {
          this.post('countRr', {
            begin: this.dateFormat(this.search.date[0], 'yyyy-MM-dd'),
            end: this.dateFormat(this.search.date[1], 'yyyy-MM-dd'),
            streetID: this.search.river,
          })
            .then(resp => {
              this.countRr = resp.data.data
            }).then(() => {
              this.initcountRrbar();
            })
        } else {
          this.post('countRr', {
            streetID: this.search.river,
          })
            .then(resp => {
              this.countRr = resp.data.data
            }).then(() => {
              this.initcountRrbar();
            })
        }
      },
      exporttabel() { //导出月报表
        if (this.search.river) {
          console.log(this.search.river)
          let params = {
            streetId: this.search.river,
            startTime: this.search.date[0] ? this.dateFormat(this.search.date[0], 'yyyy-MM-dd') : "",
            deadline: this.search.date[1] ? this.dateFormat(this.search.date[1], 'yyyy-MM-dd') : "",
          };
          console.log(params)
          this.post('streetCount', { ...params }).then(resp => {
            if (resp.data.code) {
              window.open(baseImgpath + resp.data.data, )
            } else {
              this.$Message.error("连接超时时,稍后再试")
            }
          })

        } else {
          this.$Message.warning("请选择街道")
        }
      },
      
      
      initcountRrbar() {
        var mychart = echarts.init(document.getElementById('countRrbar'));
        var vm = this;
        var option = {
          title: {
            text: '巡河次数',
            subtext: "",
            left: '10',
            top: 0,
            textStyle: {
              color: '#000',
              fontSize: '18',

            },
            subtextStyle: {
              color: 'red',
              fontSize: '16'
            }
          },
          color: ['#16b6d2', '#12ea1c'],
          toolbox: {
            show: true,
            feature: {
              dataView: { show: true, readOnly: false },
              magicType: { show: true, type: ['line', 'bar'] },
              restore: { show: true },
              saveAsImage: { show: true }
            }
          },
          tooltip: {
            trigger: 'axis',
          },
          grid: {
            left: '30',
            right: '50',
            bottom: '5%',
            top: '40',
            containLabel: true,
            z: 22
          },
          legend: {
            data: ['街道级', '社区级'],
            left: 'center',
            top: '0',
            textStyle: {
              color: '#000'
            }
          },
          xAxis: [{
            type: 'category',
            axisLabel: {
              interval: 0,
              rotate: 40,
              color: '#6d8ca6',
            },
            axisLine: {
              lineStyle: {
                color: '#6d8ca6'
              }
            },
            axisTick: {
              alignWithLabel: true
            },
            data: vm.countRr.map(function (a) {
              return a.tapName
            })
          }],
          yAxis: [{
            splitLine: { show: false },
            type: 'value',
            name: '',
            position: 'left',
            axisLabel: {
              interval: 0,
              color: '#6d8ca6',
              formatter: '{value} '
            },
            axisLine: {
              lineStyle: {
                color: '#6d8ca6'
              }
            },
          }],

          series: [{
            name: '街道级',
            stack: '总量',
            type: 'bar',
            barWidth: 30,
            label: {
              show: true,
              position: 'inside',
              padding: 10,
              color: '#fff',
              fontSize: 14,
              formatter: function (params) {
                if (params.value > 0) {
                  return params.value;
                } else {
                  return '';
                }
              },

            },
            data: vm.countRr.map(function (a) {
              return a.streetCount
            })
          },
          {
            name: '社区级',
            stack: '总量',
            type: 'bar',
            barWidth: 30,
            label: {
              show: true,
              position: 'inside',
              padding: 10,
              color: '#fff',
              fontSize: 14,
              formatter: function (params) {
                if (params.value > 0) {
                  return params.value;
                } else {
                  return '';
                }
              },
            },
            data: vm.countRr.map(function (a) {
              return a.communityCount
            })
          },
          ]
        };
        // 使用刚指定的配置项和数据显示图表。
        mychart.setOption(option);
        mychart.on('click', function (params) {
          console.log(params);

        });

      },
      
      
      initcountRibar() {
        var mychart = echarts.init(document.getElementById('countRibar'));
        var colors = ['red', '#16b6d2', '#12ea1c'];

        var vm = this;
        let option = {

          title: {
            text: '巡河上报问题数',
            subtext: "",
            left: '10',
            top: 0,
            textStyle: {
              color: '#000',
              fontSize: '20',

            },
            subtextStyle: {
              color: 'red',
              fontSize: '16'
            }
          },

          toolbox: {
            show: true,
            feature: {
              dataView: { show: true, readOnly: false },
              magicType: { show: true, type: ['line', 'bar'] },
              restore: { show: true },
              saveAsImage: { show: true }
            }
          },

          color: colors,
          tooltip: {
            trigger: 'axis',
          },
          grid: {
            left: '50',
            right: '50',
            bottom: '5%',
            top: '50',
            containLabel: true,
            z: 22
          },
          legend: {
            data: ['未处理', '已处理'],
            right: 'center',
            textStyle: {
              color: '#000'
            }
          },
          xAxis: [{
            type: 'category',
            axisLabel: {
              interval: 0,
              rotate: 40,
              color: '#6d8ca6',
            },
            axisLine: {
              lineStyle: {
                color: '#6d8ca6'
              }
            },

            axisTick: {
              alignWithLabel: true
            },
            data: vm.countRi.map(function (a) {
              return a.tapName
            })
          }],
          yAxis: [

            {
              splitLine: { show: false },
              type: 'value',
              name: '',
              position: 'left',
              axisLabel: {
                interval: 0,
                color: '#6d8ca6',
                formatter: '{value} '
              },
              axisLine: {
                lineStyle: {
                  color: '#6d8ca6'
                }
              },
            }
          ],

          series: [{
            name: '未处理',
            stack: '总量',
            type: 'bar',
            barWidth: 30,
            label: {
              show: true,
              position: 'inside',
              padding: 10,
              color: '#000',
              fontSize: 14,
              formatter: function (params) {
                if (params.value > 0) {
                  return params.value;
                } else {
                  return '';
                }
              },
            },
            data: vm.countRi.map(function (a) {
              return a.dispose0
            })
          },
          {
            name: '已处理',
            stack: '总量',
            type: 'bar',
            barWidth: 30,
            label: {
              show: true,
              position: 'inside',
              padding: 10,
              color: '#000',
              fontSize: 14,
              formatter: function (params) {
                if (params.value > 0) {
                  return params.value;
                } else {
                  return '';
                }
              },
            },
            data: vm.countRi.map(function (a) {
              return a.dispose2
            })
          }
          ]
        };
        // 使用刚指定的配置项和数据显示图表。
        mychart.setOption(option);
        mychart.on('click', function (params) {

          // alert(params.name + params.seriesName);
        });

      },
      
      
      initcountRiverbar() {
        var mychart = echarts.init(document.getElementById('countRiverbar'));
        var vm = this;
        let option = {
          title: {
            text: '河湖数量',
            subtext: "",
            left: '10',
            top: 0,
            textStyle: {
              color: '#000',
              fontSize: '20',

            },
            subtextStyle: {
              color: 'red',
              fontSize: '16'
            }
          },
          toolbox: {
            feature: {
              dataView: { readOnly: false },
              restore: {},
              saveAsImage: {}
            }
          },
          color: ['#efbb1a', '#d77169', '#c14f60', '#953f61', '#72355f',],
          series: [{
            name: '漏斗图',
            type: 'funnel',
            x: '10%',
            y: 60,
            //x2: 80,
            y2: 60,
            width: '80%',
            // height: {totalHeight} - y - y2,
            // min: 0,
            // max: 100,
            // minSize: '0%',
            // maxSize: '100%',
            sort: 'descending', // 'ascending', 'descending'
            gap: 2,
            data: [
              { value: vm.countRiver[0].riverCount, name: '区' },
              { value: vm.countRiver[1].riverCount, name: '街道' },
              { value: vm.countRiver[2].riverCount, name: '社区' },

            ].sort(function (a, b) {
              return a.value - b.value
            }),
            // roseType: true,
            label: {
              normal: {
                formatter: function (params) {
                  return params.name + ' ' + params.value + '';
                },
                position: 'center'
              }
            },
            itemStyle: {
              normal: {
                borderWidth: 0,
                shadowBlur: 30,
                shadowOffsetX: 0,
                shadowOffsetY: 10,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }

          }

          ]
        };
        // 使用刚指定的配置项和数据显示图表。
        mychart.setOption(option);
        mychart.on('click', function (params) {

          //alert(params.name + params.seriesName);
        });

      },
      
      
      initcountRiverpie() {
        var mychart = echarts.init(document.getElementById('countRiverpie'));
        var vm = this;
        let option = {
          title: {
            text: '河长信息',
            textStyle: {
              color: '#000',
              fontSize: '20'
            }
          },
          tooltip: {
            trigger: 'item',
            formatter: "{a} <br/>{b}: {c} 人 ({d}%)",
          },
          toolbox: {
            feature: {
              dataView: { readOnly: false },
              restore: {},
              saveAsImage: {}
            }
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
              show: true,

            },

            data: [
              { value: vm.countHezhang[0].hzCount, name: '区', selected: true },
              { value: vm.countHezhang[1].hzCount, name: '街道' },
              { value: vm.countHezhang[2].hzCount, name: '社区' },
            ]
          },]
        };
        // 使用刚指定的配置项和数据显示图表。
        mychart.setOption(option);
        mychart.on('click', function (params) {

          //alert(params.name + params.seriesName);
        });

      },
      reset() {
        this.search.date = [];
        this.search.river = '';
      }
    },
    
    created() {
      //街道下拉框
      this.post('getStreetByuser', {
        userID: Cookies.get('userid'),
      }).then(resp => {
        if (resp.data.code) {
          this.rivertList = resp.data.data
          this.search.river = Cookies.get('type') == '8' ? this.rivertList[0].id : ""
        }
      })

      // 统计河流数量
      this.post('countRiver', {})
        .then(resp => {
          if (resp.data.code == "1") {
            this.countRiver = resp.data.data
          }
        }).then(() => {
          this.initcountRiverbar()
        })


      //河长信息
      this.post('countHZ', {})
        .then(resp => {
          this.countHezhang = resp.data.data
          console.log("hez", resp)
        }).then(() => {
          this.initcountRiverpie()
        })
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
      width: 95%;
      margin: 50px auto;
      &.margintop0 {
        margin-top: 0px;
      }
      #countRrbar,
      #countRibar {
        height: 400px;
        width: 100%;
        margin: 20px 0;
        background: #fff;
        padding: 10px;
      }
      #countRiverpie,
      #countRiverbar {
        height: 400px;
        width: 100%;
        padding: 10px;
        background: #fff;
      }
    }
    img {
      width: 100%;
      vertical-align: middle
    }
  }
</style>