<template>
  <div class="main">
    <div id="content" class="margintop0">
      <Row class="search" type="flex" justify="start">
        <Col>
        <Form inline :model="search">
          <FormItem label="">
            <Select v-model="search.layer" style="width: 120px;" placeholder="请选择区划">
              <Option :value="1" :key="1">区级</Option>
              <Option :value="2" :key="2">街道级</Option>
              <Option :value="3" :key="3">社区级</Option>
            </Select>
          </FormItem>
          <FormItem label="" v-show="search.layer!=1">
            <Select v-model="search.street" placeholder="请选择街道" filterable @on-change="getcommunityList">
              <Option v-for="item in streetList" :value="item.id" :key="item.id">{{ item.streetName }}
              </Option>
            </Select>
          </FormItem>
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
            <Button v-if="showhzb" type="success" icon="plus" @click="add()">新增</Button>
            <Button type="error" icon="android-refresh" @click="resetform()">重置</Button>
            <Button type="primary" icon="ios-download-outline" @click="exportData(1)">导出原始数据</Button>
            <Button type="primary" icon="ios-download-outline" @click="exportData(2)">导出排序后数据</Button>
          </FormItem>
        </Form>
        </Col>
      </Row>
      <Row>
        <Col>
        <div class="loginsel" style="text-align:left;padding-bottom:10px;" v-if="showhzb">
          <RadioGroup v-model="radiodGroup" @on-change="getLable">
            <Radio v-for="(item,index) in radiodata" :key="index" :label="index+1">{{item}}</Radio>
          </RadioGroup>
        </div>
        <Table ref="table1" id="tb1" border :columns="column1" :data="tableData1" @on-expand="tbexpand" @on-start="handleOnstart1" @on-end="handleOnend1"></Table>
        </Col>
      </Row>
    </div>
    <Modal v-model="showmodname1flag" :styles="{top: atuomodeltop}">
      <p slot="header" style="color:#f60;text-align:center">
        <span> {{titlename1}} </span>
      </p>
      <Form ref="formCustom" :model="formCustom" :rules="ruleCustom" :label-width="80">
        <!--<FormItem label="管理河流" prop="manage">-->
        <!--<Input type="text" v-model="formCustom.manage"></Input>-->
        <!--</FormItem>-->
        <FormItem label="河长名字" prop="userName">
          <Input type="text" v-model="formCustom.userName" :disabled="addormodflag?false:true"></Input>
        </FormItem>
        <FormItem label="职务" prop="duty">
          <Input type="text" v-model="formCustom.duty"></Input>
        </FormItem>
        <FormItem label="电话" prop="tel">
          <Input type="text" v-model="formCustom.tel" :maxlength="maxlength"></Input>
        </FormItem>
        <FormItem label="部门" prop="departmentID">
          <Input type="text" v-model="formCustom.departmentID"></Input>
        </FormItem>
        <FormItem label="级别" prop="type">
          <Select v-model="formCustom.type" style="width:200px" placeholder="请选择级别">
            <Option :value="1" :key="1">区级</Option>
            <Option :value="2" :key="2">街道级</Option>
            <Option :value="3" :key="3">社区级</Option>
          </Select>
        </FormItem>
        <FormItem label="街道" prop="streetID" v-show="formCustom.type!=1">
          <Select v-model="formCustom.streetID" style="width:200px" placeholder="请选择街道" filterable @on-change="modstreetchange">
            <Option v-for="item in streetList" :value="item.id" :key="item.id">{{ item.streetName }}
            </Option>
          </Select>
        </FormItem>
        <FormItem label="社区" prop="communityID" v-show="formCustom.type==3">
          <Select v-model="formCustom.communityID" style="width:200px" placeholder="请选择社区" filterable>
            <Option v-for="item in communityList" :value="item.id" :key="item.id">{{ item.communityName }}
            </Option>
          </Select>
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
    <Modal v-model="showaddriverflag" :styles="{top: atuomodeltop}">
      <p slot="header" style="color:#f60;text-align:center">
        <span> 新增河湖</span>
      </p>
      <Form ref="formCustom2" :model="formCustom2" :rules="ruleCustom2" :label-width="80" inline>
        <!--<FormItem label="管理河流" prop="manage">-->
        <!--<Input type="text" v-model="formCustom2.manage"></Input>-->
        <!--</FormItem>-->
        <FormItem label="河长名字" prop="userName">
          <Input type="text" v-model="formCustom2.userName"></Input>
        </FormItem>
        <FormItem label="河湖" prop="duty">
          <Input type="text" v-model="formCustom2.duty"></Input>
        </FormItem>
        <FormItem label="上级河长" prop="tel">
          <Input type="text" v-model="formCustom2.tel" :maxlength="maxlength"></Input>
        </FormItem>
        <FormItem label="起终点" prop="departmentID">
          <Input type="text" v-model="formCustom2.departmentID"></Input>
        </FormItem>
        <FormItem label="级别" prop="type">
          <Select v-model="formCustom2.type" style="width:200px" placeholder="请选择级别">
            <Option :value="1" :key="1">区级</Option>
            <Option :value="2" :key="2">街道级</Option>
            <Option :value="3" :key="3">社区级</Option>
          </Select>
        </FormItem>
        <FormItem label="街道" prop="streetID">
          <Select v-model="formCustom2.streetID" style="width:200px" placeholder="请选择街道" filterable @on-change="getcommunityList">
            <Option v-for="item in streetList" :value="item.id" :key="item.id">{{ item.streetName }}
            </Option>
          </Select>
        </FormItem>
        <FormItem label="社区" prop="communityID">
          <Select v-model="formCustom2.communityID" style="width:200px" placeholder="请选择社区" filterable>
            <Option v-for="item in communityList" :value="item.id" :key="item.id">{{ item.communityName }}
            </Option>
          </Select>
        </FormItem>
        <FormItem label="备注" prop="communityID">
          <Input type="text" v-model="formCustom2.communityID"></Input>
        </FormItem>
        <FormItem label="长度/面积" prop="communityID">
          <Input type="text" v-model="formCustom2.communityID"></Input>
        </FormItem>
        <FormItem label="是否删除" prop="idDel">
          <Checkbox v-model="formCustom2.idDel">已删除</Checkbox>
        </FormItem>
        <FormItem>
          <Button type="primary" @click="handleSubmit2('formCustom2')">提交</Button>
          <Button type="ghost" @click="handleReset('formCustom2')" style="margin-left: 8px">重置</Button>
        </FormItem>
      </Form>
      <div slot="footer">
      </div>
    </Modal>
  </div>
</template>
<script>
import Sortable from 'sortablejs';
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
      radiodGroup: "",
      radiodata: ['已登录', '未登录'],
      showhzb: true,
      addormodflag: false, // true是新增  ，flase是修改
      showaddriverflag: false, //新增河湖
      showmodname1flag: false,
      titlename1: '',
      name: 'name1',
      formCustom: {
        id: '',
        manage: '',
        userName: '',
        duty: '',
        tel: '',
        type: 1,
        departmentID: '',
        streetID: '',
        communityID: '',
        // idDel: '',
      },
      ruleCustom: {
        manage: [
          { trigger: 'blur', required: true, message: '管理河流必填', }
        ],
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
        
      },
      formCustom2: {
        id: '',
        manage: '',
        userName: '',
        duty: '',
        tel: '',
        type: '',
        departmentID: '',
        streetID: '',
        communityID: '',
        idDel: '',
      },
      ruleCustom2: {
        manage: [
          { trigger: 'blur', required: true, message: '管理河流必填', }
        ],
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
        type: [
          { trigger: 'blur', required: true, message: '级别必填', }
        ],
      },
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

      column1: [{
          type: 'expand',
          width: 50,
          render: (h, params) => {
            return h(rivermanageinfoexpand, {
              props: {
                row: params.row
              },
            })
          }
        },
        {
          type: 'index',
          title: '序号',
          width: 80,
          align: 'center'
        },

        {
          title: '河长名字',
          key: 'userName',
          align: 'center',
          sortable: true,
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
        }, {
          title: '管理河流',
          key: 'riverName',
          align: 'center',
          sortable: true,
        },
        {
          title: '职务',
          key: 'duty',
          align: 'center',
          sortable: true
        },
        {
          title: '电话',
          key: 'tel',
          align: 'center',
          sortable: true,

        },
        {
          title: '操作',
          key: '',
          width: 280,
          align: 'center',
          render: (h, params) => {
            return [
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
              }, '详情'),
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
      tableData1: [],
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
    }
  },
  // computed: mapState({
  //   // 箭头函数可使代码更简练
  //   ranklist: state => state.ranklist
  // }),
  watch: {
    search: {
      handler: function(val, oldval) {
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
    getLable(id) {
      this.loginStatus = +id;
      this.querysearch();
    },
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
    // 街道查询社区
    getcommunityList(id) {
      this.post('getCommunity', {
        streetID: id
      }).then(resp => {
        this.communityList = resp.data.data;
        this.search.communityID = resp.data.data[0].id;
      })
    },

    modstreetchange(id) {
      this.post('getCommunity', {
        streetID: id
      }).then(resp => {
        this.communityList = resp.data.data;
        this.formCustom2.communityID = resp.data.data[0].id;
      })
    },

    //新增
    add() {
      this.$refs['formCustom'].resetFields();
      this.addormodflag = true;
      this.titlename1 = '河长信息新增';
      this.showmodname1flag = true;
    },
    // 修改
    modname1(row) {
      this.$refs['formCustom'].resetFields();
      this.titlename1 = '河长信息修改';
      this.addormodflag = false;
      this.formCustom.id = row.id;
      this.formCustom.manage = row.manage;
      this.formCustom.userName = row.userName;
      this.formCustom.duty = row.duty;
      this.formCustom.tel = row.tel;
      this.formCustom.type = this.search.layer;
      this.formCustom.departmentID = row.departmentID;
      this.formCustom.streetID = this.search.street;
      this.formCustom.communityID = this.search.communityID;
      // this.formCustom.idDel = row.idDel;
      this.showmodname1flag = true
    },
    //删除
    delname1(row) {
      this.post('insertUser', {
        userID: row.id,
        idDel: 1
      }).then(resp => {
        this.$Message.success('Success!');
        this.querysearch();
      })
    },
    //新增河湖
    addriver() {
      this.showaddriverflag = true;
    },
    //新增和修改提交
    handleSubmit(name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          let params = {};
          if (this.search.layer == 1) {
            params = {
              userID: this.formCustom.id,
              userName: this.formCustom.userName,
              duty: this.formCustom.duty,
              tel: this.formCustom.tel,
              type: this.formCustom.type
            }
          } else if (this.search.layer == 2) {
            params = {
              userID: this.formCustom.id,
              userName: this.formCustom.userName,
              duty: this.formCustom.duty,
              tel: this.formCustom.tel,
              streetID: this.formCustom.streetID,
              manage: this.streetList.map((item) => {
                if (item.id == this.formCustom.streetID) {
                  return item.streetName
                }
              }),
              type: this.formCustom.type
            }
          } else if (this.search.layer == 3) {
            params = {
              userID: this.formCustom.id,
              userName: this.formCustom.userName,
              duty: this.formCustom.duty,
              tel: this.formCustom.tel,
              streetID: this.formCustom.streetID,
              communityID: this.formCustom.communityID,
              manage: this.communityList.map((item) => {
                if (item.id == this.formCustom.communityID) {
                  return item.communityName
                }
              }),
              type: this.formCustom.type
            }
          };
          this.post('insertUser', {
            ...params
          }).then(resp => {
            this.$Message.success('Success!');
            this.$refs[name].resetFields();
            this.showmodname1flag = false;
            this.querysearch();
          })

        } else {
          this.$Message.error('Fail!');
        }
      })
    },
    tbexpand(row, status) {},
    //新增河湖提交
    handleSubmit2(name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          this.post('insertUser', {
            ...this.formCustom
          }).then(resp => {
            this.$Message.success('Success!');
            this.$refs[name].resetFields();
            this.showmodname1flag = false;
            this.querysearch();
          })

        } else {
          this.$Message.error('Fail!');
        }
      })
    },
    handleReset(name) {
      this.$refs[name].resetFields();
    },
    querysearch() {
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
    resetform() {
      this.radiodGroup = "";
      this.loginStatus = 0;
      this.search.layer = 1;
      this.search.streetList = [];
      this.search.communityList = [];
      this.search.isdel = false;
      this.querysearch()
    },
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
    atuomodeltop() {
      return document.documentElement.clientHeight > 660 ? '120px' : '2px'
    }
  },
  mounted() {
    //街道选择框
    this.post('getAllinfo?infoId=1', {}).then(resp => {
      this.streetList = resp.data.data;
    })
    console.log(this.$refs.table1)
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
