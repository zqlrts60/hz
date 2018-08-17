<style>
#list>.ivu-collapse-item>.ivu-collapse-header {
  text-align: left;
}
.info {
  border-radius: 10px;
  line-height: 20px;
  padding: 10px;
  margin: 10px;
  background-color: #ffffff;
}
#list .ivu-collapse-item p img{
  width: auto;
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
    <div id="content" class="margintop0" style="margin-top:0px;">
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
        <div style="text-align:left;clear:both;overflow: hidden;margin-bottom:10px;">
          <!-- <div class="uploadimgfile" style="text-align:center">
            <Icon type="plus" size="52" style="color: #ccc"></Icon>
            <input type="file" ref="file" class="ufile">
          </div>
          <Button type="primary" @click="getFile">上传</Button>
          <input type="text" v-model="getimgscr"> -->
          <!--  <Upload :before-upload="handleUpload" :action="baseUrl+'ueimg'"> -->
          <Upload :on-success="handleSuccess" :action="baseUrl+'ueimg'" :show-upload-list='false'  accept="image/*" style="float:left">
            <div style="padding: 20px 0;width:100px;height:100px; border:1px dashed #ccc;text-align:center">
              <Icon type="plus" size="52" style="color: #ccc"></Icon>
            </div>
          </Upload>
          <Input v-model="getimgscr" placeholder="您可以拷贝这个地址" style="width:800px;float:left;margin-left:20px;margin-top:20px"></Input>
          
         </div>
        <tinymce id="d1" v-model="content" @keyup="this.keyupHandler" @change="this.changeHandler"></tinymce>
        <!-- <button type="button" @click="clickHandler">Reset</button>
        <div>{{ content }}</div> -->
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
import { baseImgpath, baseUrl } from '@/config/env';
import tinymce from '@/components/TinymceVue'
export default {
  components: {
    tinymce
  },
  data() {
    return {
      getimgscr: "",
      file: [],
      baseImgpath: baseImgpath,
      baseUrl: baseUrl,
      imglisturl: "", //可复制的图片地址
      search: {
        title: ''
      },
      value1: '1',
      sendshowflag: false,
      visible: false,
      ruleCustom: {
        title: [
          { trigger: 'blur', required: true, message: '新闻标题必填', }
        ],
      },
      content: '<h2>请在此输入内容。。。</h2>',
      news: [],
      newscontent: '',
      total: 0,
      page: 1,
      data: '<p>Hello from</p>'
    }

  },

  mounted() {
    this.initnews()
  },
  methods: {
    handleSuccess(res, file) {
      this.imglisturl=res.url[0]
      this.getimgscr=baseImgpath+this.imglisturl
      console.log(res.url[0])

    },
    
    handleUpload(file) {
      this.file = file;
      return false;
    },
  
    clickHandler() {
      this.content = "You reseted 's content"
    },
    keyupHandler(value) {
      this.content = value
    },
    changeHandler(value) {
      this.content = value
    },
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
      this.search.title = '';
      this.sendshowflag = !this.sendshowflag;
    },
    send() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          console.log(this.content);
          this.post('insertNews', {
              news: this.content,
              title: this.search.title
            })
            .then(resp => {
              this.initnews();
              this.$Message.success('发布成功!');
              this.sendshowflag = !this.sendshowflag;

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
    width: 80%;
    margin: 50px auto;
    &.margintop0 {
      margin-top: 0px;
    }
    .search {
      margin-bottom: 20px;
    }

    .uploadimgfile {
      position: relative;
      display: inline-block;
      width: 100px;
      height: 100px;
      padding-top: 20px;
      border: 1px dashed #ccc;
      .ufile {
        width: 100px;
        height: 100px;
        opacity: 0;
        position: absolute;
        left: 0px;
        top: 0px;
      }
    }
  }
}

</style>
