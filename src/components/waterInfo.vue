<template>
  <div id="main">
    <template v-for="(item,index) in waterfactor">
      <div :id="'main'+ index">
      </div>
    </template>
  </div>
</template>
<script>
  import echarts from 'echarts'

  export default {
    data() {
      return {
        waterfactor: ['CODmn', 'DO', 'NH3H', 'WT', 'ph', 'transp'],
      }
    },
    props: ['waterdata'],
    created() {
    },
    methods: {
      filter(t) {
        switch (t) {
          case 'CODmn':
            return '高锰酸钾指数';
            break;
          case 'DO':
            return '溶解氧';
            break;
          case 'NH3H':
            return '氨氮';
            break;
          case 'WT':
            return '水温';
            break;
          case 'ph':
            return '酸碱度';
            break;
          case 'transp':
            return '浊度';
            break;
        }
      },
      createdline() {
        var that = this;
        this.waterfactor.map(function (item, index) {
          var option = {
            title: {
              text: that.filter(item)
            },
            legend: {},
            toolbox: {
              feature: {
                magicType: {type: ['bar', 'line']},
                saveAsImage: {show: true}
              }
            },
            yAxis: {
              type: 'value',
              splitLine: {
                lineStyle: {
                  color: '#5486ee',
                  type: 'dashed',
                },
                show: true,

              },
              axisLabel: {
                textStyle: {
                  color: "#5486ee"
                }
              },
              axisTick: {
                show: true,
                lineStyle: {
                  color: '#5486ee',
                  type: 'dashed',
                },
              },
              axisLine: {
                show: true,
                lineStyle: {
                  color: "#5486ee",
                  width: 2,
                }

              }
            },
            xAxis: {
              type: 'category',
              data: that.waterdata.time ? that.waterdata.time.split(',') : '',
              boundaryGap: false,
              axisLabel: {
                interval: 0,//横轴信息全部显示
                rotate: -30,//-30度角倾斜显示
              },
              splitLine: {
                lineStyle: {
                  color: '#5486ee',
                  type: 'dashed',
                },
                show: true,

              },
              axisTick: {
                show: true,
                lineStyle: {
                  color: '#5486ee',
                  type: 'dashed',
                },
              },
              axisLine: {
                show: true,
                lineStyle: {
                  color: "#5486ee",
                  width: 2,
                }
              },
            },
            // visualMap : {
            //   top : 0,
            //   right : 120,
            //   orient : "horizontal",
            //   // text:['High','Low'],
            //   pieces : [ {
            //     gt : 0,
            //     lte : parseInt(standard[0]),
            //     color : '#21d773',
            //     label : '0-' + standard[0] + '\n\n良好'
            //   }, {
            //     gt : parseInt(standard[0]),
            //     lte : parseInt(standard[1]),
            //     color : '#f79e47',
            //     label : '' + standard[0] + '-' + standard[1] + '\n\n轻度污染'
            //   }, {
            //     gt : parseInt(standard[1]),
            //     lte : parseInt(standard[2]),
            //     color : '#ff564e',
            //     label : '' + standard[1] + '-' + standard[2] + '\n\n中度污染'
            //   }, {
            //     gt : parseInt(standard[2]),
            //     lte : parseInt(standard[3]),
            //     color : '#d33392',
            //     label : '' + standard[2] + '-' + standard[3] + '\n\n重度污染'
            //   }, {
            //     gt : parseInt(standard[3]),
            //     lte : parseInt(standard[4]),
            //     color : '#920b40',
            //     label : '' + standard[3] + '-' + standard[4] + '\n\n严重污染'
            //   } ],
            //   outOfRange : {
            //     color : '#999'
            //   }
            // },
            series: [{
              type: "line", // #d81ab5
              symbolSize: "6",
              smooth: true,
              barWidth: '50%',
              markPoint: {
                data: [
                  {type: 'max', name: '最大值'},
                  {type: 'min', name: '最小值'}
                ]
              },
              markLine: {
                data: [
                  {type: 'average', name: '平均值'}
                ]
              },
              data: that.waterdata[item] ? that.waterdata[item].split(',') : ''
            }]
          };

          // 使用刚指定的配置项和数据显示图表。
          echarts.init(document.getElementById('main' + index)).setOption(option);
        })

        // this.$Notice.error({
        //   title: '查看水质详情',
        //   desc: this.riverName + '没有数据',
        //   duration: 3
        // });


      }
    },
    mounted() {

    }
  }
</script>

<style lang="scss">
  #main {
    margin: 0;
    padding: 0;
    div {
      height: 220px;
      width: 100%;
      margin: 0px auto;
    }

  }
</style>
