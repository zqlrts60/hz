<template>
  <div>
    <Row class="search" type="flex" justify="start">
      <Col>
        <Form inline :model="search">

          <FormItem label="">
            <Select v-model="search.point" placeholder="请选择监测点" filterable
                    @on-change="changepoint">
              <Option v-for="item in pointList" :value="item.id" :key="item.id">{{ item.mpName }}</Option>
            </Select>
          </FormItem>
          <FormItem label="">
            <Select v-model="search.date" placeholder="请选择日期" filterable @on-change="changedate">
              <Option value="1" key="1">近一年</Option>
              <Option value="2" key="2">近一月</Option>
            <!--   <Option value="3" key="3">近一周</Option>
              <Option value="4" key="4">近一天</Option> -->
            </Select>
          </FormItem>
          <FormItem label="">
            <RadioGroup v-model="button1" type="button" @on-change="changelabel">
              <Radio :label="item.labelName" :key="index.id" v-for="(item,index) in waterfactor">{{item.labelName}}
              </Radio>
            </RadioGroup>
          </FormItem>
        </Form>
      </Col>
    </Row>
    <water-info ref="waterInfo" :button1="button1" :waterfactor="waterfactor"
                :waterlinedata="waterlinedata"></water-info>
  </div>
</template>
<script>
  import waterInfo from './waterline';
  export default {
    data() {
      return {
        search: {
          point: '1',
          river: '',
          date: '1'
        },
        pointList: [],
        waterlinedata: [],
        riverName: '',
        rivertList: [],
        button1: '',
        waterfactor: [],
      }
    },
    components: {waterInfo},
    methods: {
      changeriver(value) {
        this.search.river = value;
        //查询监测点名字
        this.post('/listMonitorPointDetail', {
          riverId: value,
        })
          .then(resp => {
            this.pointList = resp.data.data;
            this.search.point = resp.data.data[0].id;
            this.changepoint(resp.data.data[0].id)
          })


      },
      //改变监测点
      changepoint(value) {
        if (value) { //有值才动

          this.post('/MPNbyMpID', {
            mpID: value,
            // riverId: this.search.river,
            timeType: this.search.date
          })
            .then(resp => {
              this.waterlinedata = resp.data.data;
            }).then(() => {
            this.$refs.waterInfo.createdline();
          })
        }
      },
      //改变监测点日期
      changedate(value) {
        if (value > 0) { //有值才动
          this.post('/MPNbyMpID', {
            mpID: this.search.point,
            // riverId: this.search.river,
            timeType: this.search.date
          })
            .then(resp => {
              this.waterlinedata = resp.data.data;
            }).then(() => {
            this.$refs.waterInfo.createdline();
          })
        }
      },
      changelabel() {
        this.post('/MPNbyMpID', {
          mpID: this.search.point,
          // riverId: this.search.river,
          timeType: this.search.date
        })
          .then(resp => {
            this.waterlinedata = resp.data.data;
          }).then(() => {
          this.$refs.waterInfo.createdline();
        })
      },

    },
    computed: {
      // ...mapGetters([
      //  'allRiverList','newsList'
      // ])
    },
    created() {

    },
    mounted() {
      //水质因子标签
      this.post('/getlbName', {})
        .then(resp => {
          this.waterfactor = resp.data.data;
          this.button1 = this.waterfactor[0].labelName
        })
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
      .warp {
        width: 100%;
        overflow: hidden;
      }
      .warp ul {
        list-style: none;
        padding: 0;
        margin: 0 auto;
      }
      .warp li {
        height: 30px;
        line-height: 30px;
        display: flex;
        justify-content: space-between;
        font-size: 15px;
      }
    }
    .search {
      margin-top: 10px;
    }
    img {
      width: 100%;
      vertical-align: middle
    }
    .ivu-page li {
      display: none;
    }

  }
</style>
