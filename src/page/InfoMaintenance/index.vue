<template>
  <div class="main">
    <div id="content">
      <Row class="search" type="flex" justify="start">
        <Col>
          <Form inline :model="search">
            <FormItem label="">
            </FormItem>
            <FormItem>
              <Button type="success" icon="ios-compose" @click="add()">审核</Button>
              <Button type="primary" icon="ios-download-outline" @click="exportData(1)">导出原始数据</Button>
              <Button type="primary" icon="ios-download-outline" @click="exportData(2)">导出排序后数据</Button>
            </FormItem>
          </Form>
        </Col>
      </Row>
      <Row>
        <Col>
          <Table ref="table1" border :columns="column1" :data="tableData1"></Table>
        </Col>
      </Row>
    </div>

    <Modal v-model="showmatchpointflag" :styles="{top: atuomodeltop}" @on-ok="pointCustomSubmit('pointCustom')">
      <p slot="header" style="color:#f60;text-align:center">
        <span> 匹配监测点位</span>
      </p>
      <div style="padding: 10px;color: #2db7f5;font-size: 16px;"> {{inMpName}}
        <Button style="margin-left: 30px;" type="primary" icon="plus" @click="setnewpoint">设为新监测点</Button>
      </div>

      <Form ref="pointCustom" :model="pointCustom" :label-width="80">
        <FormItem label="选择监测点">
          <Select v-model="pointCustom.point" placeholder="请选择监测点" filterable>
            <Option v-for="item in pointList" :value="item.id" :key="item.id">{{ item.mpName }}</Option>
          </Select>
        </FormItem>
      </Form>
    </Modal>
    <Modal v-model="showmatchriverflag" :styles="{top: atuomodeltop}" @on-ok="pointCustomSubmit('pointCustom2')">
      <p slot="header" style="color:#f60;text-align:center">
        <span> 匹配水体</span>
      </p>
      <div style="padding: 10px;color: #2db7f5;font-size: 16px;"> {{inriverName}}

      </div>

      <Form ref="pointCustom2" :model="pointCustom2" :label-width="80">
        <FormItem label="选择水体">
          <Select v-model="pointCustom2.river" placeholder="请选择水体" filterable>
            <Option v-for="item in riverList" :value="item.riverId" :key="item.id">{{ item.riverName }}</Option>
          </Select>
        </FormItem>
      </Form>
    </Modal>
  </div>
</template>

<script>

  export default {
    props: {
      maxlength: {
        type: Number,
        default: 11
      },
    },
    data() {
      return {
        showmatchpointflag: false, //匹配监测点
        showmatchriverflag: false, //匹配水体
        inMpName: '', //新监测点
        inriverName: '',//新水体
        riverID: '',//
        id: '',
        pointCustom: {
          point: '',
        },
        pointCustom2: {
          river: '',
        },
        pointList: [],
        riverList: [],
        search: {},
        column1: [
          {
            type: 'index',
            key: 'id',
            title: '序号',
            width: 70,
            align: 'center'
          },
          {
            title: '监测时间',
            key: 'time',
            align: 'center',
            sortable: true,
          },
          {
            title: '水体',
            key: 'inRiverName',
            align: 'center',
            width: 200,
            render: (h, params) => {
              return [
                h('span', {
                  style: {
                    marginRight: '5px'
                  },
                }, params.row.inRiverName),
                h('Button', {
                  props: {
                    type: 'error',
                    size: 'small'
                  },
                  style: {
                    display: params.row.riverID ? 'none' : 'inline-block',
                    float: 'right'
                  },
                  on: {
                    click: () => {
                      this.matchriver(params.row.id, params.row.riverID, params.row.inRiverName)
                    }
                  }
                }, params.row.riverID ? '' : '匹配水体'),

              ]
            }
          },
          {
            title: '监测点位名称',
            key: 'inMpName',
            align: 'center',
            width: 250,
            render: (h, params) => {
              return [
                h('span', {
                  style: {
                    marginRight: '5px'
                  },
                }, params.row.inMpName),
                h('Button', {
                  props: {
                    type: 'error',
                    size: 'small'
                  },
                  style: {
                    display: (params.row.riverID && params.row.mpID) ? 'none' : 'inline-block',
                    float: 'right'
                  },
                  on: {
                    click: () => {
                      this.matchpoint(params.row.id, params.row.riverID, params.row.inMpName)
                    }
                  }
                }, (params.row.riverID && params.row.mpID) ? '' : '匹配监测点位'),

              ]
            }
          },
          {
            title: '溶解氧(mg/L)',
            key: '溶解氧',
            width: 130,
            align: 'center',
            sortable: true
          },
          {
            title: '氨氮(mg/L)',
            key: '氨氮',
            align: 'center',
            sortable: true,
          },
          {
            title: '透明度(cm)',
            key: '透明度',
            align: 'center',
            sortable: true,
          },
          {
            title: '氧化还原电位(mv)',
            key: '氧化还原电位',
            width: 160,
            align: 'center',
            sortable: true,
          },
          {
            title: '水温(℃)',
            key: '水温',
            align: 'center',
            sortable: true,
          },
          {
            title: 'pH值',
            key: 'pH值',
            align: 'center',
            sortable: true,
          },
          {
            title: '水深 (cm)',
            key: '水深',
            align: 'center',
            sortable: true,
          },

        ],
        total1: 0,
        page: 1,
        pageSize: 10,
        tableData1: [],

      }
    },
    // computed: mapState({
    //   // 箭头函数可使代码更简练
    //   ranklist: state => state.ranklist
    // }),
    // watch:{
    //   search:{
    //     handler:function(val,oldval){
    //       this.querysearch()
    //     },
    //     deep:true,//对象内部的属性监听，也叫深度监听
    //     immediate: true  //表示创建组件时立马执行一次。(立即以表达式的当前值触发回调)
    //   },
    //
    // },
    methods: {
      add() {

      },
      matchpoint(rowid, id, inMpName) {
        if (id) {
          this.id = rowid;
          this.inMpName = inMpName;
          this.riverID = id;
          this.showmatchpointflag = true;
          //查询监测点名字
          this.post('/listMonitorPointDetail', {
            riverId: id,
          })
            .then(resp => {
              this.pointList = resp.data.data;
              this.pointCustom.point = resp.data.data[0].id;
            })
        } else {
          this.$Message.error('请先匹配水体!');
        }

      },
      matchriver(rowid, id, inriverName) {
        this.inriverName = inriverName;
        this.id = rowid;
        //查询匹配水体
        this.post('/mpRiver', {})
          .then(resp => {
            this.riverList = resp.data.data;
            this.pointCustom2.river = resp.data.data[0].riverId;
          });
        this.showmatchriverflag = true;
      },
      //更新新监测点
      setnewpoint() {
        this.post('/addMPdata', {
          mpName: this.inMpName,
          riverID: this.riverID,
          id: this.id,
        })
          .then(resp => {
            this.showmatchpointflag = false;
            this.querysearch()
          })

      },
      pointCustomSubmit(name) {
        // 提交
        let params = {};
        if (name == 'pointCustom2') {  //水体
          params = {
            id: this.id,
            inRiverName: this.inriverName,
            riverID: this.pointCustom2.river,
          }
        } else {
          params = { //监测点
            id: this.id,
            inMpName: this.inMpName,
            mpID: this.pointCustom.point,
          }
        }

        this.post('/mpManage', {
          ...params
        })
          .then(resp => {

            this.querysearch()
          });
      },

      querysearch() {
        this.post('listMPN', {  //查询列表
        }).then(resp => {
          let {keys, values, entries} = Object;
          let columus = resp.data.data[0];  //请求来的数据的columus
          let colsold = ['pH值', '水深', 'riverID', 'isAudit', '溶解氧', '氨氮', 'mpID', 'inMpName', '透明度', , 'inRiverName', '水温', 'id', 'time', '氧化还原电位', 'recordTime']
          for (var key of keys(columus)) {
            if (colsold.includes(key)) {  //说明已有
            } else {
              this.column1.push({  //没有就push
                title: key,
                key: key,
                align: 'center',
                sortable: true,
              })
            }
          }
          this.tableData1 = resp.data.data;
          this.total1 = this.tableData1.length
        })

      },

      exportData(type) {  // 导出
        if (type === 1) {
          this.$refs.table1.exportCsv({
            filename: '信息维护'
          });
        } else if (type === 2) {
          this.$refs.table1.exportCsv({
            filename: '信息维护(排序后)',
            original: false
          });
        }
      }
    },
    created() {
      this.querysearch()
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

<style lang="scss" scoped>
  .main {
    height: 100%;
    width: 100%;
    position: relative;
    #content {
      width:95%;
      margin: 50px auto;
    }
  }
</style>
