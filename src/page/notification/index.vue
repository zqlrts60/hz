<template>
  <div class="main">
    <div id="content" class="margintop0">
      <Row class="search" type="flex" justify="start">
        <Col>
        <Button v-if="showadd" type="success" icon="edit" @click="add()">新增</Button>
        </Col>
      </Row>
      <Row justify="center" class="notifice">
        <Col>
        <Table ref="table" border :columns="column" :data="tableData"></Table>
        <Page :total="total" show-total @on-change="changePageNumber"></Page>
        </Col>
      </Row>

      <Modal title="新增消息通知" v-model="editflag" class-name="vertical-center-modal">
        <Form ref="form" :model="form" :rules="rules">
          <FormItem label="标题" prop="title">
            <Input v-model="form.title" placeholder="请输入标题" autocomplete="off">
            </Input>
          </FormItem>
          <!--<FormItem label="消息类型" prop="type">-->
          <!--<Select v-model="form.type" style="width:200px">-->
          <!--<Option :value="1" :key="1">通知</Option>-->
          <!--<Option :value="2" :key="2">公告</Option>-->
          <!--</Select>-->
          <!--</FormItem>-->
          <FormItem label="内容" prop="desc">
            <Input v-model="form.desc" type="textarea" :autosize="{minRows: 2,maxRows: 8}" placeholder="编辑公告内容..."></Input>
          </FormItem>
          <FormItem>
            <Button @click="handleSubmit" type="primary" long>提交</Button>
          </FormItem>
        </Form>
        <div slot="footer">
        </div>
      </Modal>
    </div>
  </div>
</template>

<script>
  import Cookies from 'js-cookie';

  export default {
    data() {
      return {
        showadd: true,//如果是街道的隐藏新增按钮
        editflag: false,
        form: {
          title: '',
          desc: '',
          type: 1
        },
        rules: {
          title: [
            { required: true, message: '标题不能为空', trigger: 'blur' }
          ],
          desc: [
            { required: true, message: '内容不能为空', trigger: 'blur' }
          ]
        },
        column: [
          {
            type: 'index',
            title: '序号',
            width: 80,
            align: 'center'
          },
          {
            title: '通知人',
            key: 'userName',
            align: 'center',
          },
          {
            title: '消息标题',
            key: 'title',
            align: 'center',

          },

          {
            title: '通知时间',
            key: 'recordTime',
            align: 'center',
            sortable: true
          },
          {
            title: '通知内容',
            key: 'content',
            className: 'userSelectText',
            align: 'center',
            render: (h, params) => {
              return h('div', [
                h('p', {
                  style: {
                    marginRight: '5px'
                  },
                }, params.row.content),
              ]);
            }

          },
        ],
        total: 0,
        page: 1,
        pageSize: 10,
        tableData: [],
      }
    },
    
    components: {},
    
    methods: {
      exportData(type) {
        if (type === 1) {
          this.$refs.table.exportCsv({
            filename: '消息通知'
          });
        } else if (type === 2) {
          this.$refs.table.exportCsv({
            filename: '消息通知(排序后)',
            original: false
          });
        }
      },
      query() {
        this.changePageNumber()
      },
      add() {
        this.$refs.form.resetFields();
        this.editflag = true;
      },
      handleSubmit() {
        this.$refs.form.validate((valid) => {
          if (valid) {
            this.post('/addNotification', {
              title: this.form.title,
              content: this.form.desc,
              type: 1,
              fromWho: Cookies.get('userid') ? Cookies.get('userid') : 31
            }).then(resp => {
              this.editflag = false;
              this.$Message.success('Success!');
              this.$refs.form.resetFields();
              this.changePageNumber()
            });

          }
        });
      },
      changePageNumber(page) {
        if (page) {
          this.page = page;
        } else {
          this.page = 1;
        }

        this.post('/notification', {
          userID: Cookies.get('userid') ? Cookies.get('userid') : 31,
          type: 1,
          page: this.page,
        })
          .then(resp => {
            this.tableData = resp.data.data;
            this.total = +resp.data.count
          })
      },
    },
    
    created() {
      this.showadd = Cookies.get('type') == "8" ? false : true;
      this.changePageNumber()

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
    .notifice {
      margin-top: 20px;
    }
  }
</style>