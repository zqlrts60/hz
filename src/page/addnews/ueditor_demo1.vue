<style>
  #list > .ivu-collapse-item > .ivu-collapse-header {
    text-align: left;
  }
  .info {
    border-radius: 10px;
    line-height: 20px;
    padding: 10px;
    margin: 10px;
    background-color: #ffffff;
  }
  #list .ivu-collapse-item p img {
    width: 100%;
    max-height: 600px;
    display: block;
    padding: 5px 18% 10px;
  }
  #list .ivu-collapse-item p {
    text-indent: 2em;
    padding: 10px 0;
    font-size: 16px;
    text-align: left;
  }
</style>
<template>
  <div class="main">
    <div id="content"  class="margintop0"  style="margin-top:0px;">
      <Row class="search" type="flex" justify="start">
        <Col>
          <Button v-show="sendshowflag" type="success" icon="plus" @click="send()">确认发布</Button>
          <Button v-show="!sendshowflag" type="success" icon="plus" @click="before()">开始编辑</Button>
        </Col>
      </Row>
      <Row v-if="sendshowflag">
        <Col>
          <Form :model="search" ref="form" :rules="ruleCustom">
            <FormItem label="新闻标题:" prop="title">
              <Input v-model="search.title" placeholder="请输入新闻标题"></Input>
            </FormItem>
          </Form>
          <UEditor :config=config ref="ueditor"></UEditor>
        </Col>
      </Row>


      <Collapse v-model="value1" id="list" @on-change="panelclike" accordion>
        <Panel :name="item.id +''" :key="item.id" v-for="(item,index) in news">
          第{{++index}}条【 {{ item.title}} 】__ {{ item.time}}
          <p slot="content" v-html="newscontent"></p>
        </Panel>
      </Collapse>
      <Page :total="total" show-total @on-change="initnews"></Page>
    </div>
  </div>
</template>

<script>
  import UEditor from '@/components/ueditor/ueditor.vue'

  export default{

      components: {UEditor},
      data(){
        return {
          config: {
            //可以在此处定义工具栏的内容
            // toolbars: [
            //  ['fullscreen', 'undo', 'redo','|','bold', 'italic', 'underline',
            //  '|','superscript','subscript','|', 'insertorderedlist', 'insertunorderedlist',
            //  '|','fontfamily','fontsize','justifyleft','justifyright','justifycenter','justifyjustify']
            // ],
            autoHeightEnabled: false,
            autoFloatEnabled: true,
            initialContent:'请输入内容',   //初始化编辑器的内容,也可以通过textarea/script给值，看官网例子
            autoClearinitialContent:true, //是否自动清除编辑器初始内容，注意：如果focus属性设置为true,这个也为真，那么编辑器一上来就会触发导致初始化的内容看不到了
            initialFrameWidth: null,
            initialFrameHeight: 450,
            BaseUrl: '',
            UEDITOR_HOME_URL: 'static/ueditor/'
          },
          addFormVisible: false,
          search: {
            title: ''
          },
          value1: '1',
          sendshowflag: false,
          visible: false,
          ruleCustom: {
            title: [
              {trigger: 'blur', required: true, message: '新闻标题必填',}
            ],
          },
          content: '<h2>请在此输入内容。。。</h2>',
          news: [],
          newscontent: '',
          total: 0,
          page: 1,
        }
      },
    mounted() {
      this.initnews()
    },
      methods: {
        panelclike(key) {
          this.post('oneNews', {
            id: key[0]
          })
            .then(resp => {
              this.newscontent = resp.data.data[0].news
            })
        },
        initnews(page) {
          this.post('listNews', {
            page: this.page = page ? page : 1,
          })
            .then(resp => {
              this.news = resp.data.data;
              this.total = resp.data.count
            })
        },
        before() {
          this.search.title='';
          this.sendshowflag = !this.sendshowflag;
        },
        send() {
          this.$refs.form.validate((valid) => {
            if (valid) {
              this.content = this.$refs.ueditor.getUEContent();
              console.log( this.content);
              this.post('insertNews', {
                news: this.content,
                title: this.search.title
              })
                .then(resp => {
                  this.initnews();

                  this.$Message.success('发布成功!');
                  this.sendshowflag = !this.sendshowflag;

                  this.$refs.ueditor.setContent(this.content);  //赋值给UEditor

                })
            }
          })
        },

      }
  }

</script>
<style lang="scss" scoped>
  .main {
    height: 100%;
    width: 100%;
    position: relative;
    img {
      width: auto;
    }
    #content {
      width:80%;
      margin: 50px auto;
      &.margintop0 {
        margin-top: 0px;
      }
      .search {
        margin-bottom: 20px;
      }
    }
  }
</style>
