<template>
  <div class="main">
    <div id="content" class="margintop0">

      <!-- 筛选部分 -->
      <Row class="search" type="flex" justify="start">
        <Col>
        <Form inline :model="search">
          <!-- 选择地区 -->
          <FormItem label="">
            <!-- v-model可动态绑定所选的项 在data里 -->
            <Select v-model="search.layer" style="width: 120px;" placeholder="请选择区划">
              <Option :value="1" :key="1">区级</Option>
              <Option :value="2" :key="2">街道级</Option>
              <Option :value="3" :key="3">社区级</Option>
            </Select>
          </FormItem>
          <!-- 选择街道 （如果第一个选择了街道级） -->
          <FormItem label="" v-show="search.layer!=1">
            <Select v-model="search.street" placeholder="请选择街道" filterable @on-change="getcommunityList">
              <Option v-for="item in streetList" :value="item.id" :key="item.id">{{ item.streetName }}
              </Option>
            </Select>
          </FormItem>
          <!-- 选择社区 （如果第一个选择了社区级） -->
          <FormItem label="" prop="communityID" v-show="search.layer==3">
            <Select v-model="search.communityID" placeholder="请选择社区" filterable>
              <Option v-for="item in communityList" :value="item.id" :key="item.id">{{ item.communityName }}
              </Option>
            </Select>
          </FormItem>
          <!--  <FormItem label="">
              <Checkbox v-model="search.isdel">已删除</Checkbox>
            </FormItem> -->
          <FormItem>
            <!--<Button type="primary" icon="android-search" @click="querysearch()">查询</Button>-->
            <Button v-if="showhzb" type="success" icon="plus" @click="add()">新增河长</Button>
            <Button v-if="showhzb" type="success" icon="plus" @click="streetDialog()">新增街道</Button>
            <Button v-if="showhzb" type="success" icon="plus" @click="shequDialog()">新增社区</Button>
            <Button type="error" icon="android-refresh" @click="resetform()">重置</Button>
            <Button type="primary" icon="ios-download-outline" @click="exportData(1)">导出原始数据</Button>
            <Button type="primary" icon="ios-download-outline" @click="exportData(2)">导出排序后数据</Button>
          </FormItem>
        </Form>
        </Col>
      </Row>
      <!--已登录，未登录  表格 -->
      <Row>
        <Col>
        <div class="loginsel" style="text-align:left;padding-bottom:10px;" v-if="showhzb">
          <RadioGroup v-model="radiodGroup" @on-change="getLable">
            <Radio v-for="(item,index) in radiodata" :key="index" :label="index+1">{{item}}</Radio>
          </RadioGroup>
        </div>
        <Table ref="table1" id="tb1" border :columns="column1" :data="tableData1" @on-expand="tbexpand" @on-start="handleOnstart1"
          @on-end="handleOnend1"></Table>
        </Col>
      </Row>
    </div>

    <!-- 弹出框-新增河长 -->
    <Modal v-model="showmodname1flag" :styles="{top: atuomodeltop}">
      <p slot="header" style="color:#f60;text-align:center">
        <span> {{titlename1}} </span>
      </p>
      <Form ref="formCustom" :model="formCustom" :rules="ruleCustom" :label-width="80">
        <FormItem label="级别" prop="type">
          <Select v-model="formCustom.type" placeholder="请选择级别">
            <Option :value="1" :key="1">区级</Option>
            <Option :value="2" :key="2">街道级</Option>
            <Option :value="3" :key="3">社区级</Option>
          </Select>
        </FormItem>
        <FormItem label="街道" prop="streetID" v-show="formCustom.type!=1" required>
          <Select v-model="formCustom.streetID" placeholder="请选择街道" filterable @on-change="modstreetchange">
            <Option v-for="item in streetList" :value="item.id" :key="item.id">{{ item.streetName }}
            </Option>
          </Select>
        </FormItem>
        <FormItem label="社区" prop="communityID" v-show="formCustom.type==3&&formCustom.streetID?true:false" required>
          <Select v-model="formCustom.communityID" placeholder="请选择社区" filterable @on-change="modsshequchange">
            <Option v-for="item in communityList" :value="item.id" :key="item.id">{{ item.communityName }}
            </Option>
          </Select>
        </FormItem>
        <p v-if="showerror" style="color:red;padding-bottom:20px;text-align:center">该级别下已经有相关的河长人(河长人：
          <span>{{showhzname}}</span>)，</br>如果您还要新增将会替换之前的河长信息,</p>
        <FormItem label="河长名字" prop="userName">
          <Input type="text" v-model="formCustom.userName" :disabled="addormodflag?false:true"></Input>
        </FormItem>
        <FormItem label="职务" prop="duty">
          <Input type="text" v-model="formCustom.duty"></Input>
        </FormItem>
        <FormItem label="电话" prop="tel">
          <Input type="text" v-model="formCustom.tel" :maxlength="maxlength"></Input>
        </FormItem>
        <!--<FormItem label="是否删除" prop="idDel">-->
        <!--<Checkbox v-model="formCustom.idDel">已删除</Checkbox>-->
        <!--</FormItem>-->
        <FormItem>
          <Button type="primary" @click="handleSubmit('formCustom')">提交</Button>
          <Button type="ghost" @click="handleReset('formCustom')" style="margin-left: 8px">重置</Button>
        </FormItem>
      </Form>
      <div slot="footer">
      </div>
    </Modal>

    <!-- 弹出框-新增街道 -->
    <Modal v-model="showmodstreetflag">
      <p slot="header" style="color:#f60;text-align:center">
        <span> 新增街道</span>
      </p>
      <Form :model="formstreet" :label-width="80">
        <FormItem label="街道名称">
          <Input v-model="formstreet.streetname" placeholder="输入街道名称"></Input>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="primary" @click="addstreet()">提交</Button>
      </div>
    </Modal>

    <!-- 弹出框-新增社区 -->
    <Modal v-model="showmodshequflag">
      <p slot="header" style="color:#f60;text-align:center">
        <span> 新增社区</span>
      </p>
      <Form :model="formshequ" :label-width="80">
        <FormItem label="选择街道">
          <Select v-model="formshequ.streetID" placeholder="请选择街道" filterable @on-change="selstreetid">
            <Option v-for="item in streetList" :value="item.id" :key="item.id">{{ item.streetName }}
            </Option>
          </Select>
        </FormItem>
        <FormItem label="社区名称">
          <Input v-model="formshequ.shequname" placeholder="输入社区名称"></Input>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="primary" @click="addshequ()">提交</Button>
      </div>
    </Modal>

    <!-- 弹出框-新增河湖 -->
    <Modal v-model="formhehuinfoflag">
      <p slot="header" style="color:#f60;text-align:center">
        <span> 新增河湖</span>
      </p>
      <Form ref="formHehuinfo" :rules="ruleHehu" :model="formhehuinfo" :label-width="80">
        <FormItem label="河湖" prop="riverID" required>
          <Select v-model="formhehuinfo.riverID" placeholder="选择河湖" filterable>
            <Option v-for="item in riverList" :value="item.id" :key="item.id">{{ item.riverName }}
            </Option>
          </Select>
        </FormItem>
        <FormItem label="起点" prop="origin">
          <Input v-model="formhehuinfo.origin"></Input>
        </FormItem>
        <FormItem label="终点" prop="destination">
          <Input v-model="formhehuinfo.destination"></Input>
        </FormItem>
        <FormItem label="长度/面积" prop="riverChief">
          <Input style="width:200px;margin-right:20px;" v-model="formhehuinfo.riverChief"></Input>公里/平方公里
        </FormItem>
        <FormItem label="备注" prop="remark">
          <Input v-model="formhehuinfo.remark" type="textarea" :rows="4" placeholder="备注"></Input>
        </FormItem>
        <FormItem>
          <Button type="primary" @click="hehuSubmit('formHehuinfo')">提交</Button>
          <Button type="ghost" @click="hehuReset('formHehuinfo')" style="margin-left: 8px">重置</Button>
        </FormItem>
      </Form>
      <div slot="footer">
      </div>
    </Modal>


  </div>
</template>

<script>
  import Sortable from 'sortablejs';   //拖拽插件
  import rivermanageinfoexpand from './rivermanageinfoexpand.vue';
  import Cookies from 'js-cookie';
  export default {
    props: {
      maxlength: {
        type: Number,
        default: 11
      },
    },
    
    data() {
      return {
        formhehuinfoflag: false,
        formhehuinfo: {
          userID: "",
          riverID: "",
          origin: "",
          destination: '',
          riverChief: '',
          remark: '',
        },
        showerror: false,
        formshequ: {
          shequname: "",
          streetID: "",
        },
        formstreet: {
          streetname: "",
        },
        radiodGroup: "",
        radiodata: ['已登录', '未登录'],
        showhzb: true,
        addormodflag: false, // true是新增  ，flase是修改
        showmodname1flag: false,
        showmodstreetflag: false,
        showmodshequflag: false,
        titlename1: '',
        name: 'name1',
        formCustom: {
          id: '',
          userName: '',
          duty: '',
          tel: '',
          type: 1,
          streetID: '',
          communityID: '',
          // idDel: '',
        },
        //ivew 正则验证
        ruleCustom: {
          userName: [
            { trigger: 'blur', required: true, message: '河长名字必填', }
          ],
          tel: [
            { trigger: 'blur', required: true, message: '电话必填', },
            {
              validator(rule, value, callback, source, options) {
                var errors = [];
                if (!/^1\d{10}$/.test(value)) {

                  callback('请输入正确的手机号码....');
                }
                callback(errors);

              }
            }
          ],
          duty: [
            { trigger: 'blur', required: true, message: '职务必填', }
          ],
          streetID: [
            { required: false, message: '街道必填', }
          ],
          communityID: [
            { required: false, message: '社区必填', }
          ]
        },
        ruleHehu: {
          origin: [
            { trigger: 'blur', required: true, message: '起点必填', }
          ],
          destination: [
            { trigger: 'blur', required: true, message: '终点必填', }
          ],
          riverID: [
            { required: true, message: '河湖必填', }
          ],


        },
        //筛选菜单
        search: {
          layer: 1, //区划
          street: '', //街道
          communityID: '', //社区
          isdel: '',
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
        rowchange: true,

        //配置表格内容
        column1: [
          
          {
            type: 'expand',  //开启扩展功能  箭头
            width: 50,
            //渲染展开的内容
            render: (h, params) => {
              return h(rivermanageinfoexpand, {
                props: {
                  row: params.row,
                  rowchange: this.rowchange,
                },
              })
            }
          },

          //配置表头 序号
          {
            type: 'index',
            title: '序号',
            width: 80,
            align: 'center'
          },

          //配置表头 河长名字  render
          {
            title: '河长名字',
            key: 'userName',
            align: 'center',
            sortable: true,  //sortable: true 排序
            //自定义渲染的列(姓名+时间)，这里定义了，下面data里没有这列了
            render: (h, params) => {
              return [
                h('span', {}, params.row.userName),
                h('span', {
                  style: {
                    color: '#41B18B',
                    padding: '0 15px'
                  },
                }, params.row.loginTime ? "(" + params.row.loginTime + ")" : "")
              ]
            }
          },
          
          //配置表头 管理河流
          {
            title: '管理河流',
            key: 'riverName',
            align: 'center',
            sortable: true,
          },
          
          //配置表头 职务
          {
            title: '职务',
            key: 'duty',
            align: 'center',
            sortable: true
          },
          
          //配置表头 电话
          {
            title: '电话',
            key: 'tel',
            align: 'center',
            sortable: true,
          },
          
          //配置表头 操作  render
          {
            title: '操作',
            key: '',
            width: 400,
            align: 'center',
            render: (h, params) => {
              return [
                h('Button', {
                  props: {
                    type: 'success',
                    icon: 'plus-round'
                  },
                  style: {
                    marginRight: '5px',
                  },
                  on: {
                    click: () => {
                      this.addriver(params.row)
                    }
                  }
                }, '新增河湖'),
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
                      this.getinfo(params.row)
                    }
                  }
                }, '巡查信息'),
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
                      this.modname1(params.row)
                    }
                  }
                }, '修改'),
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

                      this.delname1(params.row)
                    }
                  }
                }, '删除'),
                h('Button', [
                  h('poptip', {
                    props: {
                      content: '只有区级可拖拽排序',
                      trigger: 'hover',
                      type: 'error',
                      size: 'small'
                    },
                    style: {
                      marginRight: '3px'
                    }
                  }, [
                      h('Icon', {
                        props: {
                          type: 'arrow-move',
                          size: 16
                        },
                        style: {
                          marginLeft: '5px',
                        },
                      })
                    ])
                ])

              ]
            }
          },
        ],


        total1: 0,
        page: 1,
        pageSize: 10,
        //此处是表格的数据
        tableData1: [],

        riverList: [],
        streetList: [],
        communityList: [],
        sortable: null,
        table1: {
          hasDragged: false,
          isDragging: false,
          oldIndex: 0,
          newIndex: 0,
          draggingRecord: []
        },
        loginStatus: 0,
        showhzname: "",
      }
    },
    
    
    // computed: mapState({
    //   // 箭头函数可使代码更简练
    //   ranklist: state => state.ranklist
    // }),

    watch: {
      getjbType: { //监测选择的级别
        handler: function (val, oldval) {
          this.ruleCustom.streetID[0].required = val != 1 ? true : false
          this.ruleCustom.communityID[0].required = val == 3 ? true : false
          this.formCustom.streetID = val != 1 ? this.formCustom.streetID : ""
          this.formCustom.communityID = val == 3 ? this.formCustom.communityID : ""
          console.log("type", this.ruleCustom)
          if (val == 1) {
            this.showerror = false;
          }
        },
        deep: true, //对象内部的属性监听，也叫深度监听
      },
      search: {
        handler: function (val, oldval) {
          console.log(val)
          this.querysearch();
          // this.sortable.option("disabled", this.search.layer != 1);
          // var state =  this.sortable.option("disabled"); // get
          // console.log(state)
          // this.sortable.sortable.option("disabled", !state); // set
        },
        deep: true, //对象内部的属性监听，也叫深度监听
        immediate: true //表示创建组件时立马执行一次。(立即以表达式的当前值触发回调)
      },
    },
    
    methods: {
      
      //表格列-新增河湖按钮-模态框显示
      addriver(row) {
        console.log(row)
        this.formhehuinfo.userID = row.id
        this.$refs['formHehuinfo'].resetFields();
        console.log(row)
        this.formhehuinfoflag = true
        this.post('getOutMANRiver', {
          userID: row.id,
        }).then(resp => {
          console.log(resp)
          if (resp.data.code) {
            this.riverList = resp.data.data
          }
        })
      },
      
      //判断 该河道是否有河长
      getvaildInfo() {
        this.post('haveHZ', {
          type: this.formCustom.type,
          streetID: this.formCustom.streetID,
          communityID: this.formCustom.communityID
        }).then(resp => {
          if (resp.data.code == 0) {
            this.showerror = true;
            this.showhzname = resp.data.mes
          } else {
            this.showerror = false;
          }

        })
      },
      
      //新增社区按钮 模态框显示
      shequDialog() {
        this.showmodshequflag = true;
        this.formshequ.streetID = "";
        this.formshequ.shequname = "";
      },
      
      //新增社区-获得街道id
      selstreetid(e) {
        this.formshequ.streetID = e
        console.log(this.formshequ.streetID)
      },
     
      //model-新增社区 提交
      addshequ() {
        if (this.formshequ.streetID && this.formshequ.shequname) {
          this.post('addCommunity', {
            streetId: this.formshequ.streetID,
            communityName: this.formshequ.shequname
          }).then(resp => {
            if (resp.data.code) {
              this.$Message.success({
                content: resp.data.mes,
              });
            } else {
              this.$Message.error({
                content: resp.data.mes,
              });
            }
            this.showmodshequflag = false;
          })
        } else {
          this.$Message.error({
            content: "请完善你的信息",
          });
        }
      },
      
      //model-新增街道 提交
      addstreet() {
        let streetName = this.formstreet.streetname
        if (streetName) {
          this.post('addStreet', {
            streetName: streetName
          }).then(resp => {
            if (resp.data.code) {
              this.$Message.success({
                content: resp.data.mes,
              });
              this.getstreetinfo()
            } else {
              this.$Message.error({
                content: resp.data.mes,
              });
            }
            this.showmodstreetflag = false
          })
        } else {
          console.log(streetName)
          this.$Message.error({
            content: "请输入街道名称",
          });
        }


      },
      
      //新增河道按钮 模态框显示
      streetDialog() {
        this.formstreet.streetName = ""
        this.showmodstreetflag = true
      },
     
      //表格列按钮 巡查信息
      getinfo(row) {
        // 命名的路由 另外打开
        console.log("wwww", row)
        const { href } = this.$router.resolve({
          name: 'inspectionList',
          query: { userId: row.id }
        })
        console.log("wrere", { href })
        window.open(href, '_blank')
        // this.$router.push({ name: 'inspectionList', params: { userId: row.oneUserId }})
      },
      
      //按钮 切换登录状态 改变loginStatus
      getLable(id) {
        this.loginStatus = +id;
        this.querysearch();
      },
      
      // <----拖拽排序
      handleOnstart1(from) {
        this.table1.oldIndex = from;
        this.table1.hasDragged = true;
        this.table1.isDragging = true;
      },  
      handleOnend1(e) {
        this.table1.isDragging = false;
        this.table1.draggingRecord.unshift({
          from: e.from + 1,
          to: e.to + 1
        });
      }, 
      startFunc(e) {
        console.log("star", e)
        // this.$emit('on-start', e.oldIndex);
      },  
      endFunc(e) {
        let movedRow = this.tableData1[e.oldIndex];
        this.tableData1.splice(e.oldIndex, 1);
        this.tableData1.splice(e.newIndex, 0, movedRow);
        this.$emit('on-end', {
          value: this.tableData1,
          from: e.oldIndex,
          to: e.newIndex
        });
        let ids = this.tableData1.map((item) => {
          return item.id
        }).join(',')

        // 拖拽排序后
        this.search.layer == 1 && this.post('orderBy', {
          usersID: ids
        }).then(resp => {
          resp.data && this.querysearch();
        })
      },   
      chooseFunc(e) {
        this.$emit('on-choose', e.oldIndex);
      },
      //拖拽排序---->

      // 如果选择了街道 则更新社区列表 （选的街道不同社区也不同）  on-change 触发
      
      
      getcommunityList(id) {
        this.post('getCommunity', {
          streetID: id
        }).then(resp => {
          this.communityList = resp.data.data;
          //this.search.communityID = resp.data.data[0].id;
        })
      },

      //Model-新增河长-更改街道
      modstreetchange(id) {
        console.log("woyaodeid", id)
        this.post('getCommunity', {
          streetID: id
        }).then(resp => {
          this.communityList = resp.data.data;
        })

        if (this.formCustom.type == 2 && this.formCustom.streetID) {
          this.getvaildInfo()
        }
      },
      
      //Model-新增河长-更改社区
      modsshequchange(id) {
        if (this.formCustom.type == 3 && this.formCustom.communityID) {
          this.getvaildInfo()
        }
      },

      //新增河长按钮，模块框显示
      add() {
        console.log(this.getjbType)
        this.$refs['formCustom'].resetFields();
        this.addormodflag = true;
        this.titlename1 = '河长信息新增';
        this.showmodname1flag = true;
        this.formCustom.id = "";
      },
      
      // 表格列按钮 修改
      modname1(row) {
        this.$refs['formCustom'].resetFields();
        this.titlename1 = '河长信息修改';
        this.addormodflag = false;
        this.formCustom.id = row.id;
        this.formCustom.userName = row.userName;
        this.formCustom.duty = row.duty;
        this.formCustom.tel = row.tel;
        this.formCustom.type = this.search.layer;
        this.formCustom.streetID = this.search.street;
        this.formCustom.communityID = this.search.communityID;
        // this.formCustom.idDel = row.idDel;
        this.showmodname1flag = true
      },
      
      //表格列按钮 删除
      delname1(row) {
        this.$Modal.confirm({
          title: '标题',
          content: '<p>确定要删除该条信息？</p>',
          onOk: () => {
            this.post('delUser', {
              userID: row.id,
            }).then(resp => {
              this.$Message.success('删除成功!');
              this.querysearch();
            })
          },
          onCancel: () => {

          }
        });
      },

      //modal-新增河湖 提交
      hehuSubmit(name) {
        this.$refs[name].validate((valid) => {
          if (valid) {
            let params = this.formhehuinfo
            this.post('manUserRiver', {
              ...params
            }).then(resp => {
              if (resp.data.code) {
                this.$Message.success('新增成功');
                this.formhehuinfoflag = false
                console.log("xinzeng")
                this.rowchange = !this.rowchange
              }

            })
          } else {
            this.$Message.error('Fail!');
          }
        })

      },

      //model-新增河长 提交
      handleSubmit(name) {
        this.$refs[name].validate((valid) => {
          if (valid) {
            let params = {};
            params = {
              userID: this.formCustom.id,
              userName: this.formCustom.userName,
              duty: this.formCustom.duty,
              tel: this.formCustom.tel,
              streetID: this.formCustom.streetID,
              communityID: this.formCustom.communityID,
              type: this.formCustom.type
            }
            this.post('insertUser', {
              ...params
            }).then(resp => {
              if (resp.data.code) {
                var mes = resp.data.mes
                this.$Message.success(mes);
                this.$refs[name].resetFields();
                this.showmodname1flag = false;
                this.querysearch();
              } else {
                this.$Message.error(resp.data.mes);
                this.showmodname1flag = false;
              }
            })
          }
        })
      },
      
      tbexpand(row, status) { },

      handleReset(name) {
        this.$refs[name].resetFields();
      },
      //筛选功能=> 此处不是tap切换
      //实现原理是每次，点击筛选条件（改变params参数） 会重新发送请求，重新渲染页面（表格把内容）
      querysearch() {
        //params 是queryHZ请求的参数，通过选择 产生--因此会根据选择渲染不同页面
        let params = {};
        if (this.search.layer == 1) {
          params = {
            type: this.search.layer,
            loginStatus: this.loginStatus,
            isDel: this.search.isdel ? '1' : '0'
          }
        } else if (this.search.layer == 2) {
          params = {
            type: this.search.layer,
            loginStatus: this.loginStatus,
            streetID: this.search.street,
            isDel: this.search.isdel ? '1' : '0'
          }
        } else if (this.search.layer == 3) {
          params = {
            type: this.search.layer,
            loginStatus: this.loginStatus,
            streetID: this.search.street,
            communityID: this.search.communityID,
            isDel: this.search.isdel ? '1' : '0'
          }
        };
        this.post('queryHZ', {
          ...params
        }).then(resp => {
          this.tableData1 = resp.data.data;
          this.total1 = this.tableData1.length
        })

      },
      
      //重置按钮 
      resetform() {
        this.radiodGroup = "";
        this.loginStatus = 0;
        this.search.layer = 1;
        this.search.street = "";
        this.search.streetList = [];
        this.search.communityList = [];
        this.search.isdel = false;
        this.querysearch()
      },
      
      //导出原始/排序数据按钮
      exportData(type) { // 导出
        if (type === 1) {
          this.$refs.table1.exportCsv({
            filename: '河长信息'
          });
        } else if (type === 2) {
          this.$refs.table1.exportCsv({
            filename: '河长信息(排序后)',
            original: false
          });
        }
      },
      
      //请求所有街道信息
      getstreetinfo() {
        //请求 所有街道
        this.post('getAllinfo?infoId=1', {}).then(resp => {
          this.streetList = resp.data.data;
        })
      }
    },


    created() {
      this.showhzb = Cookies.get('type') == "8" ? false : true;
      if (Cookies.get('type') == "8") {
        console.log(this.column1)
        this.column1.splice(this.column1.length - 1, 1)
      }
    },
    components: {
      rivermanageinfoexpand
    },
    computed: {
      getjbType() { //定义中间层，监测选择的级别
        return this.formCustom.type
      },
      atuomodeltop() {
        return document.documentElement.clientHeight > 660 ? '120px' : '2px'
      }
    },
    mounted() {
      this.getstreetinfo()
      console.log(this.$refs.table1)
      //拖拽
      var el = this.$refs.table1.$children[1].$el.children[1];
      let vm = this;
      this.sortable = Sortable.create(el, {
        onStart: vm.startFunc,
        onEnd: vm.endFunc,
        onChoose: vm.chooseFunc
      });
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