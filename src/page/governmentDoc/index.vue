<template>
  <div class="main">
    <div id="content" class="margintop0">
      <Row class="search" type="flex" justify="start">
        <Col>
        <Form inline :model="search">
          <FormItem label="">
            <Input v-model="search.text" placeholder="模糊查询"></Input>
          </FormItem>
          <FormItem>
            <Button v-if="showhzb" type="success" icon="ios-cloud-upload-outline" @click="add()">上传文件</Button>
            <Button type="error" icon="android-refresh" @click="reset()">重置</Button>
            <!--<Button type="primary" icon="ios-download-outline" @click="exportData(1)">导出原始数据</Button>-->
            <!--<Button type="primary" icon="ios-download-outline" @click="exportData(2)">导出排序后数据</Button>-->
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

    <!-- 上传 文件 iview -->
    <Modal v-model="showmodflag" :styles="{top: atuomodeltop}" @on-ok="ok">
      <p slot="header" style="color:#f60;text-align:center">
        <span>请选择上传文件</span>
      </p>
      <Upload ref="Upload" :before-upload="beforeUpload" :on-success="UploadSuccess" :format="['pdf','doc','docx']" :on-format-error="FormatError"
        type="drag" :action=" baseUrl + 'uploadFile'">
        <div style="padding: 20px 0">
          <Icon type="ios-cloud-upload" size="52" style="color: #3399ff"></Icon>
          <p>请点击或者拖拽文件到此处上传</p>
        </div>
      </Upload>
      <div slot="footer">
      </div>
    </Modal>
  </div>
</template>
<script>
  import { baseImgpath, baseUrl } from '@/config/env';
  import Cookies from 'js-cookie';
  export default {
    data() {
      return {
        showhzb: true, //街道的隐藏
        showmodflag: false,
        baseUrl: baseUrl,
        baseImgpath: baseImgpath,
        riversIdarr: [],
        checkriverid: '',
        checkrivername: '',
        toWho: '',
        search: {
          text: ''
        },
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

            }, params.row.title),]
          }
        },
        {
          title: '上传时间',
          key: 'time',
          align: 'center',

        },
        {
          title: '文件名',
          key: 'url',
          align: 'center',
          render: (h, params) => {
            return h('a', {
              attrs: {
                href: baseImgpath + params.row.url,
                target: "_blank"
              },
              style: {
                margin: '5px',
              },
              on: {
                click: () => {

                  // this.modname1(params.row)
                }
              }
            }, params.row.title)
          }
        },

          // {
          //   title: '操作',
          //   key: '',
          //   width: 100,
          //   align: 'center',
          //   render: (h, params) => {
          //
          //     return [h('Button', {
          //       props: {
          //         type: 'info',
          //         // size: 'small'
          //       },
          //       style: {
          //         marginRight: '5px'
          //       },
          //       on: {
          //         click: () => {
          //           this.notice(params.row)
          //         }
          //       }
          //     }, '下载'),
          //     ]
          //   }
          // },
        ],
        total: 0,
        page: 1,
        pageSize: 10,
        tableData1: [],
        streetList: [],
      }
    },
    // computed: mapState({
    //   // 箭头函数可使代码更简练
    //   ranklist: state => state.ranklist
    // }),
    watch: {
      search: {
        handler: function (val, oldval) {
          this.changePageNumber(false)
        },
        deep: true, //对象内部的属性监听，也叫深度监听
        immediate: true //表示创建组件时立马执行一次。(立即以表达式的当前值触发回调)
      },
    },
    
    methods: {
      notice(row) {
        window.open(baseImgpath + row.url)
      },
      add() {
        this.$refs.Upload.clearFiles()
        this.showmodflag = true;
      },
      ok() {
        // this.post('addNotification', {
        //   riverName: this.checkrivername,
        //   riverId: this.checkriverid,
        //   toWho: this.toWho,
        //   fromWho: Cookies.get('userid') ? Cookies.get('userid') : 31,
        //   type: 3,
        //   title: '巡河提醒'
        // }).then(resp => {
        //   this.$Message.success('Success!');
        // })
      },

      changePageNumber(page) {
        this.post('findFile', {
          title: this.search.text,
          page: this.page = page ? page : 1,
        }).then(resp => {
          console.log(resp)
          this.tableData1 = resp.data.data;
          this.total = resp.data.count
        })

      },
      reset() {
        this.search.text = '';
      },
      // exportData(type) {  // 导出
      //   if (type === 1) {
      //     this.$refs.table1.exportCsv({
      //       filename: '河长信息'
      //     });
      //   } else if (type === 2) {
      //     this.$refs.table1.exportCsv({
      //       filename: '河长信息(排序后)',
      //       original: false
      //     });
      //   }
      // },
      beforeUpload() {

      },
      UploadSuccess(res, file, fileList) {
        // 因为上传过程为实例，这里模拟添加 url
        // console.log(fileList);
        this.$Message.info('上传成功');
        this.showmodflag = false;
        this.changePageNumber(false)
      },
      FormatError() {
        this.$Message.warning('文件类型错误，请选择pdf或者word文件.')
      },
    },
    
    created() {
      this.showhzb = Cookies.get('type') == "8" ? false : true;
    },
    
    computed: {
      atuomodeltop() {
        return document.documentElement.clientHeight > 660 ? '120px' : '2px'
      }
    },
    
    mounted() {
      //

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
  }
</style>
<!--<template>
 <div id="main">
   <Row>
     <Upload
       multiple
       :before-upload="beforeUpload"
       :on-success="UploadSuccess"
       :format="['pfd','doc']"
       :on-format-error="FormatError"
       type="drag"
       :action=" baseUrl + 'uploadFile'">
       <div style="padding: 20px 0">
         <Icon type="ios-cloud-upload" size="52" style="color: #3399ff"></Icon>
         <p>请点击或者拖拽文件到此处上传</p>
       </div>
     </Upload>
   </Row>
 </div>
<!--</template>
<!--<script>
 import {baseUrl} from '@/config/env';

 export default {
   data() {
     return {
       baseUrl: baseUrl,


     }
   },
   created() {
     this.post('/riverTree', {}).then(resp => {

     })
   },
   methods: {
     beforeUpload() {

     },
     UploadSuccess(res, file, fileList) {
       // 因为上传过程为实例，这里模拟添加 url
       console.log(fileList);
       this.$Message.info('上传成功')
     },
     FormatError() {
       this.$Message.warning('文件类型错误，请选择pdf或者word文件.')
     },

   },
   mounted() {
   }
 }
<!--</script>

<!--<style lang="scss" scoped>
 #main {
   height: 100%;
   width: 100%;
   margin: 0;
   padding: 0;
   position: relative;
   overflow: hidden;

   #rivertreelist {
     /*height: 300px;*/
     padding: 5px;
     overflow: scroll;
   }
   .demo-upload-list {
     display: inline-block;
     width: 60px;
     height: 60px;
     line-height: 60px;
     border: 1px solid transparent;
     border-radius: 4px;
     overflow: hidden;
     background: #fff;
     position: relative;
     box-shadow: 0 1px 1px rgba(0, 0, 0, .2);
     margin-right: 4px;
   }

   .demo-upload-list img {
     width: 100%;
     height: 100%;
   }

   .demo-upload-list-cover {
     display: none;
     position: absolute;
     top: 0;
     bottom: 0;
     left: 0;
     right: 0;
     background: rgba(0, 0, 0, .6);
   }
   .demo-upload-list:hover .demo-upload-list-cover {
     display: block;
   }
   .demo-upload-list-cover i {
     color: #fff;
     font-size: 20px;
     cursor: pointer;
     margin: 0 2px;
   }
 }
<!--</style>