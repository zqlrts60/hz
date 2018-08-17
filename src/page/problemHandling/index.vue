<template>
  <div class="main">
    <div id="content" class="margintop0">

      <!-- 搜索与筛选 -->
      <Row class="search" type="flex" justify="start">
        <Col>
        <Form inline :model="search">
          <!-- 时间选择框 -->
          <FormItem label="">
            <DatePicker split-panels v-model="search.date" format="yyyy-MM-dd" type="daterange" :options="options2" placement="bottom-end"
              placeholder="请选择时间" style="width: 200px"></DatePicker>
          </FormItem>
          <!-- 是否处理 -->
          <FormItem label="">
            <Select v-model="search.dispose" style="width:120px" placeholder="是否处理">
              <Option value="0">未处理</Option>
              <Option value="2">已处理</Option>
            </Select>
          </FormItem>
          <!-- <FormItem label="">
            <Select v-model="search.isRead" style="width:120px" placeholder="养护是否读到">
              <Option value="0">未读</Option>
              <Option value="1">已读</Option>
            </Select>
          </FormItem> -->
          <!--  <FormItem label="" v-if="ishzb">
            <Select v-model="search.departtype" style="width:130px" placeholder="请选择部门类型">
              <Option value="4">建设局</Option>
              <Option value="5">环保局</Option>
              <Option value="6">城管局</Option>
            </Select>
          </FormItem> -->

          <!-- 选择水体 -->
          <FormItem label="">
            <Select v-model="search.river" placeholder="请选择水体" filterable>
              <Option v-for="item in riverList" :value="item.riverId" :key="item.id">{{ item.riverName }}</Option>
            </Select>
          </FormItem>

          <!-- 重置和查看失效问题 -->
          <FormItem>
            <Button type="error" icon="android-refresh" @click="reset()">重置</Button>
            <Button type="warning" icon="android-lock" @click="getInvalid()" v-if="ishzb">查看失效问题</Button>
            <!-- <Button type="primary" icon="ios-download-outline" @click="exportData(1)">导出原始数据</Button>
              <Button type="primary" icon="ios-download-outline" @click="exportData(2)">导出排序后数据</Button> -->
          </FormItem>

        </Form>
        </Col>
      </Row>

      <!-- 表格和分页 -->
      <Row>
        <Col>
        <Table ref="table" border :columns="column" :data="tableData"></Table>
        <Page :total="total" placement="top" :current="page" @on-change="changePageNumber" show-total></Page>
        </Col>
      </Row>
    </div>


    <!-- modal  分发按钮- -->
    <Modal v-model="showhandleflag" width="700" height="400" :styles="{top: atuomodeltop}" @on-ok="handletype">
      <p slot="header" style="color:#f60;text-align:center">
        <span>问题类型</span>
      </p>
      <RadioGroup vertical :value="problemtype" @on-change="handleSwitch">
        <Radio v-for="(item,index) in problemdata" :label="item.id" :key="index">
          <span>{{item.userName}}</span>
        </Radio>
      </RadioGroup>
    </Modal>

    <Modal v-model="showtreatflag" width="400" height="400" :styles="{top: atuomodeltop}" @on-ok="handle">
      <p slot="header" style="color:#f60;text-align:center">
        <span>问题处理</span>
      </p>
      <Upload ref="Upload" multiple :format="['jpg','jpeg','png']" :max-size="2048" :on-success="handleSuccess" :on-progress="handleProgress"
        :before-upload="handleBeforeUpload" :on-format-error="handleFormatError" :on-exceeded-size="handleMaxSize" type="drag"
        :action=" baseUrl + 'updateRiver_i'">
        <Button type="ghost" icon="ios-cloud-upload-outline">请选择上传文件</Button>
      </Upload>
      <Input v-model="summary" type="textarea" :autosize="{minRows: 2,maxRows: 5}" placeholder="处理措施"></Input>
    </Modal>

    <Modal v-model="showdampflag" width="80%" height="600" :styles="{top: atuomodeltop}">
      <p slot="header" style="color:#f60;text-align:center">
        <span>地址详情</span>
      </p>
      <!-- 地图框 -->
      <div id="makeramp" style="width: 100%;height: 520px;"></div>
      <div slot="footer">
      </div>
    </Modal>
  </div>
</template>
<script>
  import { baseUrl } from '@/config/env';
  import Cookies from 'js-cookie';
  import imgexpand from '../../components/imgexpand.vue';
  import amap from '../../components/amap.vue';
  import { dateFormat } from '@/config/mUtils';
  import { AmapUtils } from '@/config/amapUtils'
  export default {
    data() {
      return {
        uploadList: [],
        baseUrl: baseUrl,
        problemtype: '', //分发类型
        problemdata: [],
        handleid: '', //问题列表id
        summary: '', //问题处理描述
        disposeXy: '', //问题经纬度
        disposeAddress: '', //问题地址
        showhandleflag: false, //河长办
        showtreatflag: false, //养护
        ishzb: false,
        showdampflag: false,
        riverList: [],
        search: {
          //dispose: this.$route.query.flag ? '' + this.$route.query.flag : '', //要字符串类型
          dispose: this.$route.query.flag != undefined ? '' + this.$route.query.flag : '', //要字符串类型
          date: [],
          departtype: '',
          river: this.$route.query.riverID ? this.$route.query.riverID : '',
        },
        options2: {
          shortcuts: [{
            text: '近 1 星期',
            value() {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              return [start, end];
            }
          },
          {
            text: '近 1个月',
            value() {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              return [start, end];
            }
          }, {
            text: '近 3个月',
            value() {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
              return [start, end];
            }
          },
          {
            text: '近 1   年',
            value() {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 365);
              return [start, end];
            }
          }
          ]
        },

        // 表格配置项
        column: [
          // 开展扩展项 
          {
            type: 'expand',
            width: 30,
            // fixed: 'left',
            render: (h, params) => {
              return h(imgexpand, {
                props: {
                  row: params.row
                },
              })
            }
          },
          // {
          //   type: 'index',
          //   title: '序号',
          //   width: 70,
          //   align: 'center'
          // },

          //巡查时间
          {
            title: '巡查时间',
            key: 'recordTime',
            width: 150,
            align: 'center',
            sortable: true
          },

          //巡查人员
          {
            title: '巡查人员',
            key: 'userName',
            width: 120,
            align: 'center',
          },

          //职务
          {
            title: '职务',
            key: 'duty',
            width: 120,
            className: 'userSelectText',
            align: 'center',
          },

          //上报位置
          {
            title: '上报位置',
            key: 'address',
            width: 130,
            align: 'center',
          },

          //问题描述  rander
          {
            title: '问题描述',
            key: 'issue',
            width: 120,
            className: 'userSelectText',
            align: 'center',
            render: (h, params) => {
              return h('div', [
                h('span', {
                  style: {
                    margin: '0px',
                    color: 'red',
                  },
                }, params.row.issue),
              ]);
            }
          },

          //问题责任人 rander
          {
            title: '问题责任人',
            key: 'disposeName',
            width: 95,
            align: 'center',
            className: 'userSelectText',
            render: (h, params) => {
              return h('div', [
                h('span', {
                  style: {
                    marginRight: '5px'
                  },
                }, params.row.disposeName)
              ]);
            }
          },


          //是否处理  rander
          {
            title: '是否处理',
            key: 'dispose',
            width: 120,
            align: 'center',
            className: 'userSelectText',
            render: (h, params) => {
              return h('div', [
                h('Button', {
                  props: {
                    type: params.row.dispose == 0 ? 'error' : (params.row.dispose == 1 ? 'warning' : 'success'),
                    icon: params.row.dispose == 0 ? 'close' : (params.row.dispose == 1 ? 'log-in' : 'checkmark-round'),
                    // disabled: params.row.dispose == 0 ? false : true
                  },
                  style: {
                    marginRight: '5px'
                  },
                  // on: {
                  //   click: () => {
                  //     this.showhandle(params.row.proId)
                  //   }
                  // }
                }, params.row.dispose == 0 ? '未处理' : '已处理')
              ]);
            }
          },

          //处理时间
          {
            title: '处理时间',
            width: 120,
            key: 'disposeTime',
            align: 'center',
          },

          //整改描述 1
          {
            title: '整改描述',
            width: 120,
            key: 'summary',
            align: 'center',
          },

          //整改描述 2
          {
            title: '整改描述',
            width: 120,
            key: 'disposeTime',
            align: 'center',
          },

          //巡查的河道
          {
            title: '巡查的河道',
            width: 120,
            key: 'riverName',
            align: 'center'
          },

          //处理地址   rander -model 地图
          {
            title: '处理地址',
            key: 'xy',
            width: 120,
            align: 'center',
            render: (h, params) => {
              return h('div', [
                h('Button', {
                  props: {
                    type: 'info',
                    // size: 'small'
                  },
                  style: {
                    marginRight: '5px'
                  },
                  on: {
                    click: () => {
                      this.showdamap(params.row.xy)
                    }
                  }
                }, '查看地址'),
              ]);
            }
          },

          //操作 rander
          {
            title: '操作',
            key: 'dispose',
            width: 260,
            align: 'center',
            className: 'userSelectText',
            render: (h, params) => {
              return h('div', [
                //分发or处理
                h('Button', {
                  props: {
                    type: 'primary',
                    disabled: params.row.dispose == 0 ? false : true
                  },
                  style: {
                    marginRight: '5px',
                    display: Cookies.get('type') == '8' ? 'none' : 'inline-block',

                  },
                  on: {
                    click: (e) => {
                      this.showhandle(params.row)
                    }
                  }

                }, Cookies.get('type') == '5' || Cookies.get('type') == '6' || Cookies.get('type') == '10' ? '处理' : '分发'),
                //未读or已读
                h('Button', {
                  props: {
                    type: 'error',
                    type: params.row.isread == 0 ? 'error' : 'success',
                    disabled: Cookies.get('type') == 10 ? (params.row.isread == 1 ? true : false) : true

                  },
                  style: {},
                  on: {
                    click: (e) => {
                      console.log(e);
                      this.readbtn(params.row)
                    }
                  }
                }, params.row.isread == 0 ? '未读' : '已读'),
                //督办or已督办
                h('Button', {
                  props: {
                    type: 'info',
                    disabled: Cookies.get('type') == '7' && params.row.supervise == 0 || Cookies.get('type') == '8' && params.row.supervise == 0 ? false : true
                  },
                  style: {
                    marginLeft: '15px',
                    display: Cookies.get('type') != '7' && params.row.supervise == 0 ? (Cookies.get('type') != '8' ? 'none' : 'inline-block') : 'inline-block',
                    color: Cookies.get('type') == '7' && params.row.supervise == 0 || Cookies.get('type') == '8' && params.row.supervise == 0 ? '#fff' : 'red'
                  },
                  on: {
                    click: (e) => {
                      this.supervise(params.row)
                    }
                  }

                }, params.row.supervise == 0 ? '督办' : '已督办'),
              ]);
            }
          },

          //有限状态  rander
          {
            title: '有效状态',
            key: 'isDel',
            width: 120,
            align: 'center',
            render: (h, params) => {
              return h('Button', {
                props: {
                  type: params.row.isDel == 0 ? 'primary' : 'error',
                },
                on: {
                  click: () => {
                    this.todel(params.row.proId, params.row.isDel)
                  }
                }
              }, params.row.isDel == 0 ? '设为无效' : '设为有效');
            }
          },

          //是否公示  rander
          {
            title: '是否公示',
            key: '',
            width: 90,
            align: 'center',
            render: (h, params) => {
              return h('i-switch', {
                props: {
                  type: 'primary',
                  value: params.row.isShow ? true : false
                },
                on: {
                  'on-change': (event) => {
                    this.istoshow(event, params.row.proId)
                  }
                }
              }, '');
            }
          },
        ],


        total: 0,
        page: 1,
        pageSize: 10,
        
        //表格数据
        tableData: [],
        files: [],
        fileLists: [],
        uploadList0: []
      }
    },

    components: {
      imgexpand,
      amap
    },

    watch: {
      search: {
        handler: function (val, oldval) {
          this.changePageNumber(false)
          console.log('页面加载时执行了一次')
        },
        deep: true, //对象内部的属性监听，也叫深度监听
        immediate: true //表示创建组件时立马执行一次。(立即以表达式的当前值触发回调)
      },
    },

    methods: {
      //查看失效问题按钮  跳转到新路由
      getInvalid() {
        this.$router.push({ name: 'failureproblem' })
      },

      //列表项按钮 ，有效状态设为无效
      todel(proId, isDel) {
        console.log(proId, isDel)
        this.post('isDel', {
          proId: proId,
          isDel: isDel ? '0' : '1'
        }).then(resp => {
          this.$Message.success('更改成功');
          let page = this.page
          this.changePageNumber(page)
        })
      },

      //列表项按钮 是否公示
      istoshow(event, proId) {
        this.post('isShow', {
          proId: proId,
          isShow: event ? '1' : '0'
        }).then(resp => {
          if (resp.data.code) {
            this.$Message.success('更改成功');
            let page = this.page
            this.changePageNumber(page)
          }
        })
        console.log(event, proId)
      },
      
      //列表项按钮 分发  Model
      handleSwitch(event) {
        this.problemtype = event
      },
      
      //<----null
      handleSuccess(res, file) {
        console.log(res, file)
      },
      handleProgress(event, file, fileList) {
        console.log(event, file, fileList)
        //this.file=fileList
      },
      handleBeforeUpload(file) {
        // 创建一个 FileReader 对象
        let reader = new FileReader()
        // readAsDataURL 方法用于读取指定 Blob 或 File 的内容
        // 当读操作完成，readyState 变为 DONE，loadend 被触发，此时 result 属性包含数据：URL（以 base64 编码的字符串表示文件的数据）
        // 读取文件作为 URL 可访问地址
        reader.readAsDataURL(file)
        const _this = this
        reader.onloadend = function (e) {
          file.url = reader.result
          if (file.uid) {
            _this.uploadList.push(file)
          }
        }
        const check = this.$refs.Upload.fileList.length < 9;
        if (!check) {
          this.$refs.Upload.fileList.length = 8
          this.$Notice.warning({
            title: '最多只能上传9张.'
          });

        }
        console.log("filererere", this.uploadList)
        console.log("xindnf", this.$refs.Upload.fileList)

      },
      handleFormatError(file) {
        this.$Notice.warning({
          title: '文件格式不正确',
          desc: '文件 ' + file.name + ' 格式不正确，请上传 jpg 或 png 格式的图片。'
        })
      },
      handleMaxSize(file) {
        this.$Notice.warning({
          title: '超出文件大小限制',
          desc: '文件 ' + file.name + ' 太大，不能超过 2M。'
        })
      },
      dateFormat,
     //---->null

      //列表项按钮 查看地址（地图）  Model
      showdamap(xy) {
        let map = AmapUtils.create("makeramp", {
          resizeEnable: true,
          zoom: 13,
          center: [xy.split('#')[0], xy.split('#')[1]],
          mapStyle: 'amap://styles/3e0ccecdd9900597de7f62ff9cd6483d',
          features: ['bg', 'road', 'point']
        });
        AMap.plugin(['AMap.MapType'],
          function () {
            map.addControl(new AMap.MapType());
          });
        AmapUtils.addBounds(map, "秦淮区", {
          map: map,
          strokeWeight: 2,
          fillOpacity: 0.1,
          fillColor: '#f3fff2',
          strokeColor: '#cc2850'
        });
        this.showdampflag = true
        let marker = new AMap.Marker({
          icon: "http://webapi.amap.com/theme/v1.3/markers/n/mark_b.png",
          position: [xy.split('#')[0], xy.split('#')[1]]
        });
        marker.setMap(map);

      },
      
      //列表项按钮 已读/未读---  4">建设局   5">环保局  6">城管局    7">河长办"
      readbtn(row) { 
        if (Cookies.get('type') == '10') {
          this.post('readRiver_i', {
            isRead: 1,
            proId: row.proId,
          }).then(resp => {
            if (resp.data) {
              this.$Message.success('已提交');
              this.supervisestate = false
              console.log()
            }
          }).then(() => {
            let page = this.page
            this.changePageNumber(page)
          })
        }
      },
      
      //列表项按钮 督办
      supervise(row) {
        if (Cookies.get('type') != 10) {
          let params = {
            type: row.type,
            id: row.id,
            superviseBy: row.superviseBy
          };
          this.post('supervise', {
            ...params
          }).then(resp => {
            console.log("督办", resp)
            if (resp.data) {
              this.$Message.success('已提交');
            }
          }).then(() => {
            let page = this.page
            this.changePageNumber(page)

          })
        } else {
          return false
        }


      },

      //列表项按钮 分发
      showhandle(row) {
        if (Cookies.get('type') != '10') {
          this.showhandleflag = true;
        } else if (Cookies.get('type') == '10') {
          this.$refs.Upload.clearFiles()
          this.showtreatflag = true;
          this.uploadList = [];

          this.post('readRiver_i', {
            isRead: 1,
            proId: row.proId,
          }).then(resp => {
            if (resp.data) {
              this.supervisestate = false
              console.log()
            }
          })

        }
        this.proId = row.proId;
        this.summary = row.summary;
        this.disposeXy = row.disposeXy;
        this.disposeAddress = row.disposeAddress;
      },

      handle() {
        console.log("this.file", this.file)
        let formData = new FormData()
        let params = {};
        formData.append("proId", this.proId);
        formData.append("userId", Cookies.get('userid'));
        formData.append("dispose", 2);
        formData.append("summary", this.summary);
        formData.append("disposeAddress", this.disposeAddress);
        formData.append("disposeXy", this.disposeXy);
        this.uploadList.map(item => {
          formData.append("file", item);
        })
        this.postformdata('updateRiver_i', formData).then(resp => {
          if (resp.data.code) {
            this.isread = 1;
            this.$Message.success('已提交');
          } else {
            this.$Message.success('提交失败');
          }
        }).then(() => {
          let page = this.page
          this.changePageNumber(page)
        })
      },


      //model 分发页面确定
      handletype() {
        let params = {
          proId: this.proId,
          disposeBy: this.problemtype
        }
        this.post("updateType", { ...params }).then(resp => {
          console.log(resp)
          this.$Message.success('已提交');
        }).then(() => {
          let page = this.page
          this.changePageNumber(page)
        })
      },

      //null 导出数据按钮
      exportData(type) {
        if (type === 1) {
          this.$refs.table.exportCsv({
            filename: '问题处理'
          });
        } else if (type === 2) {
          this.$refs.table.exportCsv({
            filename: '问题处理(排序后)',
            original: false
          });
        }
      },

      // 重置按钮
      reset() {
        this.search.dispose = '';
        this.search.isRead = '';
        this.search.departtype = '';
        this.search.river = '';
        this.search.date = [],
          this.changePageNumber(false)
      },

      //列表渲染
      changePageNumber(page) {
        //console.log(this.search.date)
        let params = {};
        if (this.search.date[0]) {
          //es6 语法Object.assign 合并多个对象
          params = Object.assign({}, { //4">建设局   5">环保局  6">城管局    7">河长办"
            begin: this.dateFormat(this.search.date[0], 'yyyy-MM-dd'),
            end: this.dateFormat(this.search.date[1], 'yyyy-MM-dd'),
            dispose: this.search.dispose,
            riverId: this.$route.query.riverID ? this.$route.query.riverID : this.search.river,
            departtype: Cookies.get('type') == 7 ? this.search.departtype : Cookies.get('type'),
            page: this.page = page ? page : 1,
            //userId: Cookies.get('userid') ? Cookies.get('userid') : 31,
            userId: this.$route.query.userID ? this.$route.query.userID : Cookies.get('userid')
          })
        } else {
          params = Object.assign({}, {
            dispose: this.search.dispose,
            riverId: this.search.river,
            departtype: Cookies.get('type') == 7 ? this.search.departtype : Cookies.get('type'),
            page: this.page = page ? page : 1,
            // userId: Cookies.get('userid') ? Cookies.get('userid') : 31,
            userId: this.$route.query.userID ? this.$route.query.userID : Cookies.get('userid')
          })
        }
        // 查询 巡查问题
        this.post('listRiver_i', {
          ...params
        })
          .then(resp => {
            console.log(params)
            this.tableData = resp.data.data;
            this.total = resp.data.count
          })
      },
    },
    
    computed: {
      atuomodeltop() {
        return document.documentElement.clientHeight > 660 ? '120px' : '2px'
      },
      // uploadList0(){
      //   let aa=this.$refs.Upload.fileList;
      // }
    },
    
    created() {
      if (Cookies.get('type') != 7) {
        this.column.splice(this.column.length - 2, 2)
      }
      this.post('/getDisposeBy', {}).then(resp => {
        if (resp.data.code == 1) {
          this.problemdata = resp.data.data
        } else {
          this.$Message.error("获取内容失败")
        }
      })
      //查询匹配水体,获取河流信息
      this.post('/mpRiver', {})
        .then(resp => {
          this.riverList = resp.data.data;
        });
      this.ishzb = Cookies.get('type') == 7 ? true : false
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
      width: 95%;
      margin: 50px auto;
      &.margintop0 {
        margin-top: 0px;
      }
    }
    img {
      width: 100%;
      vertical-align: middle
    }
  }
</style>