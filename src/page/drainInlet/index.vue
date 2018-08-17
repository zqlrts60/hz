<template>
  <div class="index">
    <div class="leftbar">
      <div><img src="../../assets/images/logo.png">
      </div>
    </div>
    <div class="right-cont">
      <Row class="mainHeader">
        <Col :sm="{ span:20}" :md="{ span:20}" :lg="{ span:20}">
        </Col>
        <Col :sm="{ span:4}" :md="{ span:4}" :lg="{ span:4}">
        <Dropdown class="mainUser" trigger="click" placement="bottom-end">
          <a href="javascript:void(0)">
            <span>{{userMes?userMes:'admin'}}</span>
            <Icon type="arrow-down-b"></Icon>
          </a>
          <Dropdown-menu slot="list">
            <router-link to="/login">
              <Dropdown-item @click.native="signOut">退出</Dropdown-item>
            </router-link>
          </Dropdown-menu>
        </Dropdown>
        </Col>
      </Row>
      <div class="mainContent" :sm="{ span:18}" :md="{ span:18}" :lg="{ span:18}">
        <div class="main">
          <div id="content">
            <Row class="search" type="flex" justify="start">
              <Col>
              <Form inline>
                <FormItem>
                  <Button type="success" icon="ios-cloud-upload-outline" @click="add()">上传文件</Button>
                  <Button type="success" icon="plus" @click="addlabel()">添加标签</Button>
                  <Button type="success" @click="showshili()">示例模板</Button>
                  <Button type="success" icon="arrow-down-c" @click="topullexcel()">模板下载</Button>
                </FormItem>
              </Form>
              </Col>
            </Row>
            <Row>
              <Col>
              <Table ref="table1" border :columns="column1" :data="tableData1"></Table>
              <Page :total="total" placement="top" :current="page" @on-change="changePageNumber" show-total></Page>
              </Col>
            </Row>
          </div>
          <Modal v-model="showdemobox" title="示例模块" :width="1200">
            <div><img src="../../../static/shili.png" style="width:100%;"></div>
          </Modal>
          <Modal v-model="showmodflag" :styles="{top: atuomodeltop}">
            <p slot="header" style="color:#f60;text-align:center">
              <span>请选择上传文件</span>
            </p>
            <Upload ref="Upload" :before-upload="beforeUpload" :on-success="UploadSuccess" :on-error="Uploaderror" :format="['xlsx']" :on-format-error="FormatError" type="drag" :action=" baseUrl + 'upload'">
              <div style="padding: 20px 0">
                <Icon type="ios-cloud-upload" size="52" style="color: #3399ff"></Icon>
                <p>请点击或者拖拽文件到此处上传</p>
              </div>
            </Upload>
            <div slot="footer">
            </div>
          </Modal>
          <Modal v-model="showinfoflag" :styles="{top: atuomodeltop}" width="98%">
            <p slot="header" style="color:#f60;text-align:center;height: 30px;">
              <Button type="success" v-show="!isauditflag" style="float: left;" @click="audit">审核通过</Button>
              <label style="float:left;color:red;line-height:34px;margin-left:10px;">注：点击审核通过之前请确认是否都已经匹配完成</label> <span>{{clicktitle}}详情</span>
            </p>
            <Table :row-class-name="rowClassName" ref="table2" height="600" border :columns="column2" :data="tableData2"></Table>
            <div slot="footer">
            </div>
          </Modal>
          <Modal v-model="showaddlabelflag" @on-ok="ok" :styles="{top: atuomodeltop}">
            <p slot="header" style="color:#f60;text-align:center">
              <span>添加标签</span>
            </p>
            <Form ref="pointCustom3" :model="pointCustom3" :label-width="80">
              <FormItem label="请添加标签" prop="label">
                <Input v-model="pointCustom3.label" type="text" placeholder="请输入新的标签"></Input>
              </FormItem>
            </Form>
            <h3>已有标签列表</h3>
            <template>
              <Tag v-for="item in labelList" :key="item.id">{{ item.labelName }}</Tag>
            </template>
          </Modal>
        </div>
      </div>
    </div>
    <Spin fix v-if="spinShow" style="z-index:1000001">上传的文件正在处理中...请稍等一会儿再操作</Spin>
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
import { baseImgpath, baseUrl } from '@/config/env';
import Cookies from 'js-cookie';
export default {
  data() {
    return {
      selrivervalue: "",
      mpriverdata: [], //创建之前获取河流的信息
      mpoptiondata: [],
      showdemobox: false,
      spinShow: false,
      showmatchpointflag: false, //匹配监测点
      showmatchriverflag: false, //匹配水体
      inMpName: '', //新监测点
      inriverName: '', //新水体
      riverID: '', //
      id: '',
      mvID: '', //那个文件id
      isauditflag: false, //是否已经审核
      pointCustom: {
        point: '',
      },
      pointCustom2: {
        river: '',
      },
      pointList: [],
      riverList: [],
      showaddlabelflag: false,
      showmodflag: false,
      showinfoflag: false,
      baseUrl: baseUrl,
      baseImgpath: baseImgpath,
      userMes: null,
      search: {
        label: '',
      },
      pointCustom3: {
        label: '',
      },
      labelList: [],
      column1: [{
          type: 'index',
          title: '序号',
          width: 80,
          align: 'center'
        },

        {
          title: '标题',
          key: 'title',
          align: 'center',
          sortable: true,
          render: (h, params) => {
            return [h('span', {
              style: {
                marginRight: '5px'
              },

            }, params.row.title), ]
          }
        },
        {
          title: '上传时间',
          key: 'time',
          align: 'center',

        }, {
          title: '审核状态',
          key: 'isAudit',
          align: 'center',
          render: (h, params) => {

            return [h('Button', {
              props: {
                type: params.row.isAudit ? 'success' : 'error',
                size: 'small'
              },
              style: {
                marginRight: '5px'
              },
            }, params.row.isAudit ? '审核通过' : '未审核'), ]
          }
        },
        {
          title: '操作',
          key: '',
          width: 200,
          align: 'center',
          render: (h, params) => {
            return [h('Button', {
                props: {
                  type: 'info',
                  // size: 'small'
                },
                style: {
                  marginRight: '5px'
                },
                on: {
                  click: () => {
                    this.notice(params.row)
                  }
                }
              }, '查看详情'),

              h('Button', {
                props: {
                  type: 'error',
                  // size: 'small'
                },
                style: {
                  marginRight: '5px'
                },
                on: {
                  click: () => {
                    this.delete(params.row)
                  }
                }
              }, '删除')
            ]
          }
        },
      ],
      column2: [{
          type: 'index',
          title: '序号',
          width: 80,
          align: 'center'
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
                    //width: 200,
                    display: params.row.riverID && params.row.isChange != "2" ? 'inline-block' : 'none',
                  },
                },
                params.row.riverName),
              h('Select', {
                  props: {
                    value: params.row.riverID,
                    disabled: this.isauditflag
                  },
                  style: {
                    display: params.row.isChange != "2" ? 'none' : 'inline-block',
                  },
                  on: {
                    'on-change': (event) => {
                      this.getoptions(event)
                      console.log("params", params.row)
                      this.mpriverSubmit(params.row, event)
                    }
                  },
                },
                this.mpriverdata.map(item => {
                  return h('Option', {
                    props: { value: item.riverId }
                  }, item.riverName);
                }),

              ),
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
              // h('Button', {
              //   props: {
              //     type: 'primary',
              //     shape: "circle",
              //     icon: "plus",
              //     size: 'small'
              //   },
              //   style: {
              //     display: params.row.mpID ? 'none' : 'inline-block',
              //   },
              // }),

              h('span', {
                style: {
                  marginRight: '5px',
                  display: params.row.mpID && params.row.isChange == "0" ? 'inline-block' : 'none',
                },
              }, params.row.inMpName),
              // h('Select', {
              //     props: {
              //       value: "",
              //     },
              //     style: {
              //       display: params.row.mpID ? 'none' : 'inline-block',
              //     },
              //     on: {
              //       'on-change': (event) => {
              //         console.log("dddd", event)
              //         this.mpoptionSubmit(params.row.id, params.row.riverID0, params.row.riverID, params.row.mvID, event)
              //       },
              //       click: () => {
              //       alert(1)
              //     }
              //     },
              //   },
              //   this.mpoptiondata.map(item => {
              //     return h('Option', {
              //       props: { value: item.id }
              //     }, item.mpName);
              //   })
              // ),

              h('span', {
                style: {
                  marginRight: '5px',
                  color: "red",
                  display: params.row.isChange == 0 ? 'none' : 'inline-block',
                },
              }, params.row.mpName),
              h('Button', {
                props: {
                  type: 'error',
                  size: 'small'
                },
                style: {
                  display: params.row.isChange == 0 ? 'none' : 'inline-block',
                  float: 'right'
                },
                on: {
                  click: () => {
                    this.matchpoint(params.row.id, params.row.riverID, params.row.inMpName)
                  }
                }
              }, '匹配监测点位'),

            ]
          }
        },

        {
          title: '时间',
          key: 'time',
          align: 'center',

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
          title: '水深 (cm)',
          key: '水深',
          align: 'center',
          sortable: true,
        },
        {
          title: 'pH值',
          key: 'pH值',
          align: 'center',
          sortable: true,
        },


      ],
      total: 0,
      page: 1,
      pageSize: 10,
      tableData1: [],
      tableData2: [],
      clicktitle: ''
    }
  },

  watch: {
    search: {
      handler: function(val, oldval) {
        this.changePageNumber(false)
      },
      deep: true, //对象内部的属性监听，也叫深度监听
      immediate: true //表示创建组件时立马执行一次。(立即以表达式的当前值触发回调)
    },

  },
  methods: {
    rowClassName(row, index) {
      if (row.riverID && row.mpID) {
        return 'demo-table-info-row'
      } else {
        return 'red'
      }
    }, //区别要修改的行
    getoptions(val) {
      this.post('/listMonitorPointDetail', {
          riverId: val,
        })
        .then(resp => {
          console.log("dfd", resp)
          this.mpoptiondata = resp.data.data
        })
    },
    mpoptionSubmit(id, riverID0, riverID, mvID, event) {
      let val = riverID0 || riverID
    },
    mpriverSubmit(row, event) {
      let params = {
        id: row.id,
        //inRiverName: row.inRiverName,
        riverID: event,
      }
      this.post('/mpManage', {
          ...params
        })
        .then(resp => {
          row.riverID = event
          if (resp.data.code == 1) {
            this.getoptions(event)
            // this.selrivervalue = event;
            //this.$Message.success('匹配成功!');
            this.post('listMPNbyID', { //查看详情
              mvID: this.mvID
            }).then(resp => {
              this.tableData2 = resp.data.data;
            })
          }
        });

    },
    delete(row) {
      console.log(row)
      this.$Modal.confirm({
        title: '删除',
        content: '<p>你确定要删除吗？</p>',
        onOk: () => {
          this.post('/delMPV', {
              id: row.id,
            })
            .then(resp => {
              console.log("02")
              if (resp.data.code == "1") {
                console.log("01")
                this.changePageNumber(this.page)
              }
            })
        },
        onCancel: () => {

        }
      });
    }, //删除接口
    showshili() {
      this.showdemobox = true;
    },
    topullexcel() { //下载模板
      window.open('http://hzz.cstor.cn:8967/hzzfile/uploaded/template/a_template.xlsx')
    },
    matchpoint(rowid, id, inMpName) {
      if (!this.isauditflag) {
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
          if (resp.data.code == 1) {
            this.showmatchpointflag = false;
            this.$Message.success('更新新监测点成功!');
            this.post('listMPNbyID', { //查看详情
              mvID: this.mvID
            }).then(resp => {
              this.tableData2 = resp.data.data;
              this.showinfoflag = true;
            })
          }
        })

    },

    pointCustomSubmit(name) {
      // 提交
      let params = {};
      if (name == 'pointCustom2') { //水体
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
          if (resp.data.code == 1) {
            this.post('listMPNbyID', { //查看详情
              mvID: this.mvID
            }).then(resp => {
              this.$Message.success('匹配成功!');
              this.tableData2 = resp.data.data;
              this.showinfoflag = true;
            })
          }

        });
    },
    signOut() {
      Cookies.remove('user');
      Cookies.remove('password');
      Cookies.remove('userid');
      this.$router.push({ name: 'login' });
    },
    notice(row) {
      this.$Spin.show({
        render: (h) => {
          return h('div', [
            h('Icon', {
              'class': 'demo-spin-icon-load',
              props: {
                type: 'load-c',
                size: 18
              }
            }),
            h('div', '正在打开页面,请耐心等待')
          ])
        }
      });
      this.clicktitle = row.title;
      this.mvID = row.id
      this.isauditflag = row.isAudit=="1" ? true : false
      this.post('listMPNbyID', { //查看详情
        mvID: this.mvID
      }).then(resp => {
        console.log("mvID", this.mvID)
        this.$Spin.hide();
        this.tableData2 = resp.data.data;
        this.showinfoflag = true;
      }).catch(error => {
        this.$Spin.hide();
      });
    },
    add() {
      this.$refs.Upload.clearFiles()
      this.showmodflag = true;
    },
    audit() {
      let page = this.page
      this.post('upMPV', { //审核
        id: this.mvID,
        isAudit: 1
      }).then(resp => {
        this.changePageNumber(page);
        this.$Message.success('审核通过!');
        this.showinfoflag = false;
      })
    },
    ok() {
      this.post('addlabel', { //增加新的标签
        labelName: this.pointCustom3.label,

      }).then(resp => {
        this.$Message.success('Success!');
      })


    },

    changePageNumber(page) {

      this.post('mpv', {
        page: this.page = page ? page : 1,
      }).then(resp => {
        this.tableData1 = resp.data.data;
        this.total = resp.data.count
      })

    },
    addlabel() {
      this.pointCustom3.label = '';
      //已有标签列表
      this.post('labels', {}).then(resp => {
        this.labelList = resp.data.list;
        this.showaddlabelflag = true
      })
    },
    beforeUpload() {
      this.spinShow = true
    },
    UploadSuccess(res, file, fileList) {
      console.log("成功")
      // 因为上传过程为实例，这里模拟添加 url
      // console.log(fileList);
      if (res.code == 0) {
        this.$Notice.error({
          title: '上传文件错误',
          desc: res.mes,
          duration: 0
        });
        this.showmodflag = false;
      } else {
        this.$Notice.success({
          title: '上传文件结果',
          desc: res.mes,
        });
        this.showmodflag = false;
        console.log(file);
        this.mvID = res.mvID;
        this.isauditflag=false;
        this.clicktitle = file.name;
        this.post('listMPNbyID', { //查看详情
          mvID: res.mvID
        }).then(resp => {
          console.log("idxiansh", this.mvID, res)
          this.tableData2 = resp.data.data;
          this.showinfoflag = true;
        })
      }
      this.spinShow = false
      this.changePageNumber(false)
    },
    Uploaderror(res, file, fileList) {
      console.log("异常", res)
      this.$Notice.open({
        title: '上传文件结果',
        //desc: res.mes,
        desc: "上传异常",
        duration: 0
      });
      this.showmodflag = false;
      this.spinShow = false
      this.changePageNumber(false)
    },
    FormatError() {
      this.$Message.warning('文件类型错误，请选择.xlsx文件.')
      this.showmodflag = false;
      this.spinShow = false

    },
  },
  created() {
    this.post('/mpRiver', {})
      .then(resp => {
        this.mpriverdata = resp.data.data;
        console.log(this.mpriverdata)
      });

    this.userMes = Cookies.get('user') ? Cookies.get('user') : {};
    if (!this.userMes) {
      this.$router.push({ name: 'login' });
    }
  },
  computed: {
    atuomodeltop() {
      return document.documentElement.clientHeight > 660 ? '120px' : '2px'
    },

  },
  mounted() {
    //

  }
}

</script>
<style lang="scss">
.ivu-spin-fix {
  z-index: 100000000001;
}

.ivu-menu-horizontal .ivu-menu-item,
.ivu-menu-horizontal .ivu-menu-submenu {
  padding: 0 12px;
}

 ::-webkit-scrollbar {
  /*滚动条整体样式*/
  width: 10px;
  /*高宽分别对应横竖滚动条的尺寸*/
  height: 1px;
}

 ::-webkit-scrollbar-thumb {
  /*滚动条里面小方块*/
  border-radius: 10px;
  -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
  background: #535353;
}

 ::-webkit-scrollbar-track {
  /*滚动条里面轨道*/
  -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  background: #EDEDED;
}

.index {
  height: 100%;
  .leftbar {
    padding-top: 35px;
    background: #1ac9c5;
    float: left;
    width: 240px;
    height: 100%;
    overflow-y: auto;
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    .mainNav {
      margin-top: 24px;
      background: #1ac9c5;
      color: #fff;
    }
  }
  .right-cont {
    left: 0;
    box-sizing: border-box;
    padding-left: 240px;
    height: 100%; // overflow-y:auto;
    background: #faf9ff;
    &:after {
      content: "";
      clear: both;
      overflow: hidden;
      display: block;
    }
    .mainHeader {
      position: relative!important;
      height: 60px;
      width: 100%;
      background: none;
      z-index: 10;
      .message-con {
        display: inline-block;
        width: 30px;
        padding: 15px 0px;
        margin-right: 20px;
        text-align: center;
        cursor: pointer;
      }
      &.ivu-row {
        .ivu-col {
          height: 60px !important;
        }
      }
      .mainLogo {
        // width: 100px;
        position: relative;
        height: 100%;
        img {
          display: block;
          position: absolute;
          top: 0;
          left: 20px;
          bottom: 0;
          margin: auto;
        }
      }
      .mainNav {
        background: #41b18b;
        a.router {
          height: 100%;

          display: inline-block;
          .ivu-menu-item {
            box-sizing: border-box;
            color: #fff;
          }
          .ivu-menu-item-active.ivu-menu-item-selected {
            border-bottom: 2px solid transparent;
            color: #fff;
          }
        }
        a.router-link-exact-active {
          .ivu-menu-item {
            color: red!important;
            border-bottom: 2px solid #2d8cf0!important;
          }
        }
      }
      .mainUser {
        height: 100%;
        float: right;
        margin-right: 30px;
        .ivu-dropdown-rel {
          height: 100%;
          &>i {
            display: inline-block;
            position: relative;
            float: left;
            width: 60px;
            height: 100%;
            img {
              position: absolute;
              top: 0;
              bottom: 0;
              margin: auto;
            }
          }
          a {
            display: inline-block;
            position: relative;
            top: 0;
            height: 100%;
            line-height: 60px;
            color: #000;
            font-size: 18px;
            img {
              position: absolute;
              display: inline-block;
              top: 0;
              bottom: 0;
              margin: auto;
            }
          }
        }
      }
    }
    .mainContent {
      position: relative;
      width: 100%;
      height: calc(100% - 60px);
      overflow-y: auto;
      top: 0!important;
    }
  }
}

.ivu-table-row {
  &.red {
    td {
      background: #fff7c9;
    }
  }
}

</style>
<style lang="scss" scoped>
.main {
  height: 100%;
  width: 100%;
  position: relative;
  #content {
    width: 95%;
    margin: 0px auto;
  }
}

</style>
