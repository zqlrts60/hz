<template>
  <div class="main">
    <div id="content" class="margintop0">
      <Row class="search" type="flex" justify="start">
        <Col>
        <Form inline :model="search">
          <FormItem label="" v-show="name=='name1'">
            <Select v-model="search.waterType" style="width:200px" placeholder="请选择排水许可证类型" filterable>
              <Option v-for="(item,index) in waterTypeList" :value="item.type" :key="item.type">{{ item.type }}
              </Option>
            </Select>
          </FormItem>
          <FormItem label="" v-show="name=='name2'">
            <Select v-model="search.pcWaterType" style="width:200px" placeholder="请选择排水户普查类型" filterable>
              <Option v-for="(item,index) in pcWaterTypeList" :value="item.type" :key="item.type">{{ item.type }}
              </Option>
            </Select>
          </FormItem>
          <FormItem label="">
            <Input v-model="search.text" placeholder="模糊查询"></Input>
          </FormItem>
          <FormItem>
            <!-- <Button type="success" icon="plus" @click="add()">新增</Button> -->
            <Button type="primary" icon="android-search" @click="querysearch()">查询</Button>
            <Button type="error" icon="android-refresh" @click="reset()">重置</Button>
            <Button type="primary" icon="ios-download-outline" @click="exportData(1)">导出原始数据</Button>
            <Button type="primary" icon="ios-download-outline" @click="exportData(2)">导出排序后数据</Button>
          </FormItem>
        </Form>
        </Col>
      </Row>
      <Row type="flex" justify="start">
        <Tabs :value="name" v-model="name">
          <TabPane label="排水许可统计" name="name1">
            <Row>
              <Col>
              <Table ref="table1" border :columns="column1" :data="tableData1"></Table>
              <Page :total="total1" placement="top" show-total @on-change="querysearch"></Page>
              </Col>
            </Row>
          </TabPane>
          <TabPane label="排水户普查统计" name="name2">
            <Row>
              <Col>
              <Table ref="table2" border :columns="column2" :data="tableData2"></Table>
              <Page :total="total2" placement="top" show-total @on-change="querysearch"></Page>
              </Col>
            </Row>
          </TabPane>
        </Tabs>
      </Row>
    </div>
    <Modal v-model="showmodname1flag" :styles="{top: atuomodeltop}">
      <p slot="header" style="color:#f60;text-align:center">
        <span> {{titlename1}} </span>
      </p>
      <Form ref="formCustom" :model="formCustom" :rules="ruleCustom" :label-width="80">
        <FormItem label="排水项目" prop="project">
          <Input type="text" v-model="formCustom.project"></Input>
        </FormItem>
        <FormItem label="类型" prop="type">
          <Input type="text" v-model="formCustom.type"></Input>
        </FormItem>
        <FormItem label="申请单位" prop="company">
          <Input type="text" v-model="formCustom.company"></Input>
        </FormItem>
        <FormItem label="地址" prop="address">
          <Input type="text" v-model="formCustom.address"></Input>
        </FormItem>
        <FormItem label="流域" prop="river">
          <Input type="text" v-model="formCustom.river"></Input>
        </FormItem>
        <FormItem label="负责人" prop="contact">
          <Input type="text" v-model="formCustom.contact"></Input>
        </FormItem>
        <FormItem label="联系电话" prop="tel">
          <Input type="text" v-model="formCustom.tel" :maxlength="maxlength"></Input>
        </FormItem>
        <FormItem label="是否许可" prop="xk">
          <Input type="text" v-model="formCustom.xk"></Input>
        </FormItem>
        <FormItem label="许可时间" prop="xksj">
          <DatePicker type="date" placeholder="Select date" v-model="formCustom.xksj"></DatePicker>
        </FormItem>
        <FormItem label="许可编号" prop="code">
          <Input type="text" v-model="formCustom.code"></Input>
        </FormItem>
        <FormItem label="备注" prop="remark">
          <Input type="textarea" :autosize="{minRows: 2,maxRows: 5}" v-model="formCustom.remark"></Input>
        </FormItem>
        <FormItem>
          <Button type="primary" @click="handleSubmit('formCustom')">提交</Button>
          <Button type="ghost" @click="handleReset('formCustom')" style="margin-left: 8px">重置</Button>
        </FormItem>
      </Form>
      <div slot="footer">
      </div>
    </Modal>
    <Modal v-model="showmodname2flag" :styles="{top: atuomodeltop}">
      <p slot="header" style="color:#f60;text-align:center">
        <span> {{titlename2}}</span>
      </p>
      <Form ref="formCustom2" :model="formCustom2" :rules="ruleCustom2" :label-width="145">
        <FormItem label="单位名称" prop="company">
          <Input type="text" v-model="formCustom2.company"></Input>
        </FormItem>
        <FormItem label="排水量（吨）" prop="psl">
          <Input type="text" v-model="formCustom2.psl"></Input>
        </FormItem>
        <FormItem label="排水户类别及所属行业" prop="sshy">
          <Input type="text" v-model="formCustom2.sshy"></Input>
        </FormItem>
        <FormItem label="证书已发放情况" prop="ffqk">
          <Input type="text" v-model="formCustom2.ffqk"></Input>
        </FormItem>
        <FormItem label="整改许可" prop="zgxk">
          <Input type="text" v-model="formCustom2.zgxk"></Input>
        </FormItem>
        <FormItem label="证书有效期" prop="zsyxq">
          <Input type="text" v-model="formCustom2.zsyxq"></Input>
        </FormItem>
        <FormItem>
          <Button type="primary" @click="handleSubmit2('formCustom2')">提交</Button>
          <Button type="ghost" @click="handleReset2('formCustom2')" style="margin-left: 8px">重置</Button>
        </FormItem>
      </Form>
      <div slot="footer">
      </div>
    </Modal>
  </div>
</template>
<script>
  // import disposePercentarr from './a';
  import Cookies from 'js-cookie';

  export default {
    props: {
      maxlength: {
        type: Number,
        default: 11
      },
      type: {
        type: String,
      },
    },
    data() {
      const validatecontact = (rule, value, callback) => {
        if (!value) {
          return callback(new Error('负责人必填'));
        } else {
          callback();
        }
      };
      const validatecompany = (rule, value, callback) => {
        if (!value) {
          return callback(new Error('申请单位必填'));
        } else {
          callback();
        }
      };
      const validatetel = (rule, value, callback) => {
        if (!value) {
          return callback(new Error('电话必填'));
        } else {
          callback();
        }
      };
      return {
        titlename1: '排水许可统计修改',
        titlename2: '排水户普查统计修改',
        addormodflag: false, // true是新增  ，flase是修改
        formCustom: {
          id: '',
          project: '',
          type: '',
          company: '',
          address: '',
          river: '',
          contact: '',
          tel: '',
          xk: '',
          xksj: '',
          code: '',
          remark: ''
        },
        formCustom2: {
          id: '',
          company: '',
          psl: '',
          sshy: '',
          ffqk: '',
          zgxk: '',
          zsyxq: '',
        },
        ruleCustom: {
          contact: [
            { validator: validatecontact, trigger: 'blur', required: true }
          ],
          company: [
            { validator: validatecompany, trigger: 'blur', required: true }
          ],
          tel: [
            { validator: validatetel, trigger: 'blur', required: true },
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
          address: [
            { trigger: 'blur', required: true, message: '地址必填', }
          ],
        },
        ruleCustom2: {
          company: [
            { message: '单位名称必填', trigger: 'blur', required: true }
          ],
          psl: [
            { message: '排水量必填', trigger: 'blur', required: true }
          ],
          sshy: [
            { message: '排水户类别及所属行业必填', trigger: 'blur', required: true }
          ],
          ffqk: [
            { message: '必填', required: true, message: '证书已发放情况必填', }
          ],
          zsyxq: [
            { trigger: 'blur', required: true, message: '证书有效期必填', }
          ],
        },
        name: 'name1',
        showmodname1flag: false,
        showmodname2flag: false,
        search: {
          pcWaterType: '',
          waterType: '',
          text: ''
        },
        column1: [{
          type: 'index',
          title: '序号',
          width: 80,
          align: 'center'
        },
        {
          title: '排水项目',
          key: 'project',
          align: 'center'
        }, {
          title: '类型',
          key: 'type',
          align: 'center',
          sortable: true
        }, {
          title: '申请单位',
          key: 'company',
          align: 'center'

        },
        {
          title: '地点',
          key: 'address',
          align: 'center'
        }, {
          title: '流域',
          key: 'river ',
          align: 'center'
        },
        {
          title: '负责人',
          key: 'contact',
          align: 'center',
          sortable: true
        },
        {
          title: '联系电话',
          key: 'tel',
          align: 'center'
        }, {
          title: '是否许可',
          key: 'xk',
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

            }, params.row.xk),]
          }
        }, {
          title: '许可时间',
          key: 'xksj',
          align: 'center',
          sortable: true
        }, {
          title: '许可编号',
          key: 'code',
          align: 'center',
          sortable: true
        }, {
          title: '备注',
          key: 'remark',
          align: 'center'

        },


        {
          title: '操作',
          key: '',
          width: 100,
          align: 'center',
          render: (h, params) => {

            return [h('Button', {
              props: {
                type: 'info',
                // size: 'small'
              },
              style: {
                marginRight: '5px',
              },
              on: {
                click: () => {
                  this.modname1(params.row)
                }
              }
            }, '修改'),
              // h('Button', {
              //   props: {
              //     type: 'error',
              //     // size: 'small'
              //   },
              //   style: {
              //     marginRight: '5px'
              //   },
              //   on: {
              //     click: () => {
              //
              //       // this.delDevice(params.row)
              //     }
              //   }
              // }, '删除')
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
          title: '单位名称',
          key: 'company',
          align: 'center',
          sortable: true
        },

        {
          title: '排水量（吨）',
          key: 'psl',
          align: 'center',
          sortable: true
          // sortMethod: function(a, b, type) {
          //   return type === 'asc' ? a.psl > b.psl : a.psl < b.psl
          // }
        }, {
          title: '排水户类别及所属行业',
          key: 'sshy',
          align: 'center',
          sortable: true
        },
        {
          title: '整改许可',
          key: 'zgxk',
          align: 'center'
        }, {
          title: '证书已发放情况',
          key: 'ffqk',
          align: 'center'
        },
        {
          title: '证书有效期',
          key: 'zsyxq',
          align: 'center',
          sortable: true,
        },
        {
          title: '操作',
          key: '',
          width: 100,
          align: 'center',
          render: (h, params) => {

            return [h('Button', {
              props: {
                type: 'info',
                // size: 'small'
              },
              style: {
                marginRight: '5px',
              },
              on: {
                click: () => {
                  this.modname2(params.row)
                }
              }
            }, '修改'),
              // h('Button', {
              //   props: {
              //     type: 'error',
              //     // size: 'small'
              //   },
              //   style: {
              //     marginRight: '5px'
              //   },
              //   on: {
              //     click: () => {
              //
              //       // this.delDevice(params.row)
              //     }
              //   }
              // }, '删除')
            ]
          }
        },
        ],
        total1: 0,
        total2: 0,
        page: 1,
        pageSize: 10,
        tableData1: [],
        tableData2: [],
        pcWaterTypeList: [],
        waterTypeList: [],
      }
    },
    // computed: mapState({
    //   // 箭头函数可使代码更简练
    //   ranklist: state => state.ranklist
    // }),
    watch: {
      search: {
        handler: function (val, oldval) {
          this.querysearch()
        },
        deep: true, //对象内部的属性监听，也叫深度监听
        // immediate: true  //表示创建组件时立马执行一次。(立即以表达式的当前值触发回调)
      },
    },
    components: {},
    methods: {
      //新增
      add() {

        this.addormodflag = true;
        if (this.name == 'name1') {
          this.$refs['formCustom'].resetFields();
          this.titlename1 = '排水许可统计新增';
          this.showmodname1flag = true;

        } else if (this.name == 'name2') {
          this.$refs['formCustom2'].resetFields();
          this.titlename2 = '排水户普查统计新增';
          this.showmodname2flag = true;
        }
      },
      // 修改
      modname1(row) {
        this.name == 'name1' ? this.$refs['formCustom'].resetFields() : this.$refs['formCustom2'].resetFields()
        this.addormodflag = false;
        this.formCustom.id = row.id;
        this.formCustom.project = row.project;
        this.formCustom.type = row.type;
        this.formCustom.company = row.company;
        this.formCustom.address = row.address;
        this.formCustom.contact = row.contact;
        this.formCustom.tel = row.tel;
        this.formCustom.xk = row.xk;
        this.formCustom.xksj = row.xksj;
        this.formCustom.code = row.code;
        this.formCustom.remark = row.remark;
        this.showmodname1flag = true
      },
      modname2(row) {
        this.name == 'name1' ? this.$refs['formCustom'].resetFields() : this.$refs['formCustom2'].resetFields()
        this.addormodflag = false;
        this.formCustom2.company = row.company;
        this.formCustom2.psl = row.psl;
        this.formCustom2.sshy = row.sshy;
        this.formCustom2.ffqk = row.ffqk;
        this.formCustom2.zgxk = row.zgxk;
        this.formCustom2.zsyxq = row.zsyxq;
        this.formCustom2.id = row.id;
        this.showmodname2flag = true
      },
      handleSubmit(name) {
        let url = '';
        url = this.addormodflag ? 'insertWater ' : 'updateWater ' //新增or 修改
        this.$refs[name].validate((valid) => {
          if (valid) {
            this.post(url, {
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
      handleSubmit2(name) {
        let url = '';
        url = this.addormodflag ? 'insertPcWater  ' : 'updatePcWater ' //新增or 修改
        this.$refs[name].validate((valid) => {
          if (valid) {
            this.post(url, {
              ...this.formCustom2
            }).then(resp => {
              this.$Message.success('Success!');
              this.$refs[name].resetFields();
              this.showmodname2flag = false;
              this.querysearch()
            })
          } else {
            this.$Message.error('Fail!');
          }
        })
      },
      handleReset2(name) {
        this.$refs[name].resetFields();
      },
      querysearch(pageNumber) {
        this.pageNumber = pageNumber ? pageNumber : 1;
        if (this.name == 'name1') {
          this.post('waterlist', {
            type: this.search.waterType,
            page: this.pageNumber,
            text: this.search.text
          }).then(resp => {
            this.tableData1 = resp.data.data.list;

            this.total1 = resp.data.data.count
          })
        } else if (this.name == 'name2') {
          this.post('pcWaterlist', {
            type: this.search.pcWaterType,
            page: this.pageNumber,
            text: this.search.text
          }).then(resp => {
            this.tableData2 = resp.data.data.list;
            this.total2 = resp.data.data.count
          })
        }
      },
      reset() {
        this.search.pcWaterType = '';
        this.search.waterType = '';
        this.search.text = '';
        this.querysearch()
      },
      getstreet() {
        this.post('waterlist', {}).then(resp => {
          this.tableData1 = resp.data.data.list;
          this.total1 = resp.data.data.count
        });
        this.post('pcWaterlist', {}).then(resp => {
          this.tableData2 = resp.data.data.list;
          this.total2 = resp.data.data.count
        })
        //普查菜单
        this.post('pcWaterType', {}).then(resp => {
          this.pcWaterTypeList = resp.data.data;
        });
        this.post('waterType  ', {} //许可证菜单
        ).then(resp => {
          this.waterTypeList = resp.data.data;
        });
      },

      exportData(type) { // 导出
        if (this.name == 'name1') {
          if (type === 1) {
            this.$refs.table1.exportCsv({
              filename: '排水许可统计'
            });
          } else if (type === 2) {
            this.$refs.table1.exportCsv({
              filename: '排水许可统计(排序后)',
              original: false
            });
          }
        } else if (this.name == 'name2') {
          if (type === 1) {
            this.$refs.table2.exportCsv({
              filename: '排水户普查统计'
            });
          } else if (type === 2) {
            this.$refs.table2.exportCsv({
              filename: '排水户普查统计(排序后)',
              original: false
            });
          }
        }

      },

    },
    computed: {
      atuomodeltop() {
        return document.documentElement.clientHeight > 660 ? '120px' : '2px'
      }
    },
    created() {
      if (Cookies.get('type') == "8") {
        this.column1.splice(this.column1.length - 1, 1)
        this.column2.splice(this.column2.length - 1, 1)
      }
      this.getstreet()
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
  }
</style>