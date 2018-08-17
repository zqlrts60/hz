<template>
  <div class="main">
    <div id="content" class="margintop0">
      <Row class="search" type="flex" justify="start">
        <Col>
        <Form inline :model="search">
          <FormItem label="" prop="city">
            <Select class="selectdiv" v-model="search.street" placeholder="选择街道" @on-change="getstreetid">
              <Option v-for="item in streetList" :value="item.id" :key="item.id">{{ item.streetName }}
              </Option>
            </Select>
          </FormItem>
          <FormItem label="" prop="city">
            <Select class="selectdiv" v-model="search.river" :disabled="search.street?false:true" placeholder="选择河" @on-change="getriverid">
              <Option v-for="(item,index) in riverList" :value="item.riverID" :key="index">{{ item.riverName }}
              </Option>
            </Select>
          </FormItem>
          <FormItem label="">
            <DatePicker split-panels v-model="search.date" format="yyyy-MM-dd" type="daterange" placement="bottom-end" placeholder="请选择时间"
              style="width: 200px"></DatePicker>
          </FormItem>
          <FormItem>
            <Button type="error" icon="android-refresh" @click="reset()">重置</Button>
            <Button v-if="showhzb" type="primary" icon="android-refresh" @click="exporttabel">导出</Button>
          </FormItem>
        </Form>
        </Col>
      </Row>
      <Row type="flex" justify="start">
        <Table ref="problemtable" border :columns="column" :data="problemData"></Table>
        <Page :total="total" :current="page" @on-change="changePageNumber" show-total></Page>
      </Row>
    </div>
    <modal title="View Image" v-model="bigpicvisible">
      <img :src="showmybigpicurl" v-if="bigpicvisible" style="width: 100%">
    </modal>
  </div>
</template>
<script type="text/javascript">
  import imglist from './imglist.vue'
  import Cookies from 'js-cookie';
  import { baseImgpath } from '@/config/env';
  import { dateFormat } from '@/config/mUtils';
  export default {
    components: {
      imglist
    },
    data() {
      return {
        showhzb: true,
        showmybigpicurl: "",
        bigpicvisible: false,
        search: {
          street: "",
          river: "",
          date: [,],
        },
        testdata: [],
        streetid: "",
        revierid: "",
        disableval: true,
        streetList: [],
        riverList: [],
        problemData: [],
        column: [{
          key: 'recordTime',
          title: '巡河时间',
          width: 100,
          align: 'center'
        },
        {
          key: 'riverName',
          title: '河道',
          align: 'center'
        },
        {
          key: 'userName',
          title: '河长',
          align: 'center'
        },
        {
          key: 'duty',
          title: '职务',
          align: 'center'
        },
        {
          key: 'type',
          title: '问题类型',
          align: 'center'
        },
        {
          key: 'issue',
          title: '问题描述',
          align: 'center',
        },
        {
          key: 'furl',
          title: '问题照片',
          align: 'center',
          render: (h, params) => {
            return h(imglist, {
              props: {
                row: params.row.furl
              },
            })
          }
        },
        // {
        //   key: 'furl',
        //   title: '问题照片',
        //   align: 'center',
        //   render: (h, params) => {
        //     if (params.row.furl) {
        //       return [h('img', {
        //         attrs: {
        //           'src': baseImgpath + params.row.furl,
        //         },
        //         style: {
        //           width: '55px',
        //           height: '55px'
        //         },
        //         on: {
        //           click: (e) => {
        //             this.showbigpic(params.row.furl)
        //           }
        //         }

        //       }, params.row.xk), ]
        //     } else {
        //       return " "
        //     }


        //   }
        // },
        {
          key: 'surl',
          title: '整改照片',
          align: 'center',
          render: (h, params) => {
            if (params.row.surl) {
              return [h('img', {
                attrs: {
                  'src': baseImgpath + params.row.surl,
                },
                style: {
                  width: '55px',
                  height: '55px'
                },
                on: {
                  click: (e) => {
                    this.showbigpic(params.row.surl)
                  }
                }

              }, params.row.xk),]
            } else {
              return " "
            }

          }
        },

        ],
        page: 1,
        pageSize: 10, //每页显示
        total: 0,
      }

    },
    watch: {
      search: {
        handler: function (val, oldval) {
          this.changePageNumber()
        },
        deep: true, //对象内部的属性监听，也叫深度监听}
      },
      streetList: {
        handler: function (val, oldval) { },
        deep: true, //对象内部的属性监听，也叫深度监听
      },

    },
    methods: {
      dateFormat,
      reset() {
        this.search.street = "";
        this.search.river = "";
        this.search.date = [,];
      },
      getstreetid(streetID) { //街道Option变化时触发
        console.log("werer", streetID)
        console.log(streetID)
        this.streetid = streetID
        this.getriverList(streetID) //通过街道id获取河流信息
      },
      getriverid(revierID) { //河流Option变化时触发
        this.revierid = revierID;
        console.log(revierID)
      },
      getriverList(streetID) {
        this.post('getStreetRiver', {
          streetID: streetID,
        }).then(resp => {
          console.log(resp)
          this.riverList = resp.data.data;
          //this.search.river = resp.data.data[0].riverID
          console.log("sfs", this.search.river)
        })
      },

      exporttabel() {
        console.log(11222)
        let params = {
          streetId: this.search.street,
          riverId: this.search.river,
          startTime: this.search.date[0] ? this.dateFormat(this.search.date[0], 'yyyy-MM-dd') : "",
          deadline: this.search.date[1] ? this.dateFormat(this.search.date[1], 'yyyy-MM-dd') : "",
        };
        this.post('excelExport', { ...params }).then(resp => {
          if (resp.data.code) {
            console.log("chagkdg ")
            console.log(baseImgpath + resp.data.data)
            // window.open("https://www.baidu.com/",'_blank')
            window.open(baseImgpath + resp.data.data)
          }
        })
      },
      changePageNumber(page) {
        if (page) {
          this.page = page;
        }
        let params = {
          streetId: this.search.street,
          riverId: this.search.river,
          type: 1,
          page: this.page,
          startTime: this.search.date[0] ? this.dateFormat(this.search.date[0], 'yyyy-MM-dd') : "",
          deadline: this.search.date[1] ? this.dateFormat(this.search.date[1], 'yyyy-MM-dd') : "",
        };
        this.post('excelExport', { ...params }).then(resp => {
          if (resp.data.code) {
            this.problemData = resp.data.list;
            this.total = +resp.data.count
          }
        })

      },
      showbigpic(url) {

        this.bigpicvisible = true;
        this.showmybigpicurl = baseImgpath + url
      }
    },
    created() {
      this.showhzb = Cookies.get('type') == "8" ? false : true
      this.problemData = [];
      this.post('getStreetByuser', {
        userID: Cookies.get('userid'),
      }).then(resp => {
        if (resp.data.code) {
          this.streetList = resp.data.data
          console.log("xs", this.streetList)
          //this.search.street = this.streetList[0].id
          console.log(this.search.street)
        }
      })
      this.getstreetid(this.search.street)
      this.getriverid(this.search.river)
    },
    mounted() {
      this.changePageNumber()
    },
    computed: {

    }
  }

</script>
<style lang="scss" scoped>
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
      .selectdiv {
        width: 200px;
        text-align: left;
      }
    }
  }
</style>