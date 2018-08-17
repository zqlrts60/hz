<template>
  <div>
    <Row>
      <Col>
      <div>
        <Table :columns="columns1" :data="data1"></Table>
      </div>
      </Col>
    </Row>
    <Modal v-model="modifyrivermodel">
      <p slot="header" style="color:#f60;text-align:center">
        <span> 修改河湖信息</span>
      </p>
      <Form ref="formHehuinfo" :model="formhehuinfo" :rules="ruleHehu" :label-width="80">
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
export default {
  props: {
    row: Object,
    rowchange: Boolean,
  },
  watch: {
    rowchange: {
      handler: function(val, oldval) {
        console.log("改变了row", val)
        this.getheliu()
      },
      deep: true, //对象内部的属性监听，也叫深度监听
    },
    myrowid: {
      handler: function(val, oldval) {
        console.log("改变了", val)
        this.getheliu()
      },
      deep: true, //对象内部的属性监听，也叫深度监听
    }
  },
  data() {
    return {
      modifyrivermodel: false,
      myrowid: "",
      formhehuinfo: {
        conID: "",
        userID: "",
        riverID: "",
        origin: "",
        destination: '',
        riverChief: '',
        remark: '',
      },
      columns1: [{
          title: '河长名字',
          key: 'userName'
        },
        {
          title: '管理河流',
          key: 'riverName'
        },
        {
          title: '起点',
          key: 'origin'
        },
        {
          title: '终点',
          key: 'destination'
        },
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
                },
                style: {
                  marginRight: '5px',

                },
                on: {
                  click: () => {
                    this.tomodify(params.row)
                  }
                }
              }, '修改'), h('Button', {
                props: {
                  type: 'error',
                },
                style: {
                  marginRight: '5px',

                },
                on: {
                  click: () => {
                    this.todel(params.row)
                  }
                }
              }, '删除')
            ]
          }
        }
      ],
      ruleHehu: {
        origin: [
          { trigger: 'blur', required: true, message: '起点必填', }
        ],
        destination: [
          { trigger: 'blur', required: true, message: '终点必填', }
        ],



      },
      data1: [],

    }

  },

  methods: {
    //修改河湖
    hehuSubmit(name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          console.log(this.formhehuinfo)
          let params = this.formhehuinfo
          this.post('manUserRiver', { ...params
          }).then(resp => {
            if (resp.data.code) {
              this.$Message.success('新增成功');
              this.modifyrivermodel = false
              var id = this.formhehuinfo.userID
              this.getheliu(id)
            }

          })
        } else {
          this.$Message.error('Fail!');
        }
      })

    },
    getheliu(id) {
      this.post('getMANRiver', {
        userID: id ? id : this.myrowid
      }).then(resp => {
        this.data1 = resp.data.data
      })
    },
    todel(row) {
      this.$Modal.confirm({
        title: '标题',
        content: '<p>确定要删除该条信息？</p>',
        onOk: () => {
          this.post('delUserRiver', {
            conID: row.conID
          }).then(resp => {
            this.$Message.success('删除成功');
            this.getheliu(row.userID)
          })
        },
        onCancel: () => {

        }
      });
    },
    tomodify(row) {
      console.log(row)
      this.formhehuinfo.conID = row.conID
      this.formhehuinfo.userID = row.userID
      this.formhehuinfo.riverID = row.riverID
      this.formhehuinfo.origin = row.origin
      this.formhehuinfo.destination = row.destination
      this.formhehuinfo.riverChief = row.riverChief
      this.formhehuinfo.remark = row.remark
      this.modifyrivermodel = true;


    }

  },
  mounted() {
    this.myrowid = this.row.id
  }

}

</script>
