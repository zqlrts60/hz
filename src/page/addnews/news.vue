<style lang="scss">
@import './message.scss';

</style>
<template>
  <div class="news-list">
    <div class="to-open-edit" v-if="showEdit">
      <div class="clearfix">
        <Button class="cancelbtn" type="ghost" icon="ios-arrow-left" @click="cancelsave()">返回</Button>
        <Button class="savebtn" type="success" icon="android-folder" @click="tosavecont()">保存</Button>
      </div>
      <Form :model="search" ref="form" :rules="ruleCustom">
        <FormItem label="新闻标题:" prop="title">
          <Input v-model="search.title" placeholder="请输入新闻标题"></Input>
        </FormItem>
      </Form>
      <UEditor :config=config ref="ueditor"></UEditor>
    </div>
    <div class="to-show-news" v-if="!showEdit">
      <transition name="view-news">
        <div class="newslist" v-if="shownews">
          <div class="text-left">
            <Button type="success" icon="plus" @click="addnews()">发布新闻</Button>
          </div>
          <ul class="newlist-ul">
            <li class="newlist-li" v-for="item in newsData" @click="getnewsid(item.id)">
              <p>
                <label>{{item.title}}</label> <span>{{item.time}}</span></p>
            </li>
          </ul>
          <Page :total="newscont" @on-change="getpage" show-total></Page>
        </div>
      </transition>
      <transition name="view-new-info">
        <div class="news-info" v-if="!shownews">
          <div class="news-content-top-header">
            <Button class="goback-btn" type="text" @click="backNewsTitleList">
              <Icon type="chevron-left"></Icon>&nbsp;&nbsp;返回</Button>
            <h3 class="news-title">{{ newtitle }}</h3>
          </div>
          <p class="news-time-con">
            <Icon type="android-time"></Icon>&nbsp;&nbsp;{{ newttime }}</p>
          <div class="message-content-body" v-html="newcontent">
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>
<script>
import UEditor from '@/components/ueditor/ueditor.vue'
export default {
  components: { UEditor },
  data() {
    return {
      showEdit: false,
      shownews: true,
      show: true,
      newscont: 1,
      page: 1,
      newtitle: "",
      newttime: "",
      newcontent: "",
      noNewsText: "暂无新闻",
      newsData: [],
      search: {
        title: ""
      },
      editcontent: "<h2>请在此输入内容。。。</h2>",
      ruleCustom: {
        title: [
          { trigger: 'blur', required: true, message: '新闻标题必填', }
        ],
      },
      config: {
        //可以在此处定义工具栏的内容
        toolbars: [
          [
            'fullscreen', 'source', '|', 'undo', 'redo', '|',
            'bold', 'italic', 'underline', 'fontborder', 'strikethrough', 'superscript', 'subscript', 'removeformat', 'formatmatch', 'autotypeset', 'blockquote', 'pasteplain', '|', 'forecolor', 'backcolor', 'insertorderedlist', 'insertunorderedlist', 'selectall', 'cleardoc', '|',
            'rowspacingtop', 'rowspacingbottom', 'lineheight', '|',
            'customstyle', 'paragraph', 'fontfamily', 'fontsize', '|',
            'directionalityltr', 'directionalityrtl', 'indent', '|',
            'justifyleft', 'justifycenter', 'justifyright', 'justifyjustify', '|', 'touppercase', 'tolowercase', '|',
            'link', 'unlink', 'anchor', '|', 'imagenone', 'imageleft', 'imageright', 'imagecenter', '|',
            'insertimage', 'emotion', 'scrawl', 'attachment', 'map', 'gmap', 'insertframe', 'insertcode', 'webapp', 'pagebreak', 'template', 'background', '|',
            'horizontal', 'date', 'time', 'spechars', 'snapscreen', 'wordimage', '|',
            'inserttable', 'deletetable', 'insertparagraphbeforetable', 'insertrow', 'deleterow', 'insertcol', 'deletecol', 'mergecells', 'mergeright', 'mergedown', 'splittocells', 'splittorows', 'splittocols', 'charts', '|',
            'print', 'preview', 'searchreplace', 'drafts', 'help'
          ]
        ],
        autoHeightEnabled: false,
        autoFloatEnabled: true,
        initialContent: '请输入内容', //初始化编辑器的内容,也可以通过textarea/script给值，看官网例子
        autoClearinitialContent: true, //是否自动清除编辑器初始内容，注意：如果focus属性设置为true,这个也为真，那么编辑器一上来就会触发导致初始化的内容看不到了
        initialFrameWidth: null,
        initialFrameHeight: 650,
        BaseUrl: '',
        UEDITOR_HOME_URL: 'static/ueditor/'
      },
    }
  },
  methods: {
    addnews() {
      this.showEdit = true
    },
    cancelsave() {
      this.showEdit = false
    },
    tosavecont() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.editcontent = this.$refs.ueditor.getUEContent();
          console.log(this.editcontent);
          this.post('insertNews', {
              news: this.editcontent,
              title: this.search.title
            })
            .then(resp => {
              if (resp.data.result) {
                let page = this.page;
                this.showmessage(page)
                setTimeout(() => {
                  this.$Message.success('发布成功!');
                  this.showEdit = false
                }, 1000);


                this.$refs.ueditor.setContent(this.editcontent); //赋值给UEditor
              }

            })
        }
      })
      // this.showEdit = false
    },
    getnewsid(id) {
      this.shownews = false;
      this.post('oneNews', {
          id: id,
        })
        .then(resp => {
          let data = resp.data.data
          console.log(data)
          this.newtitle = data[0].title;
          this.newttime = data[0].time;
          this.newcontent = data[0].news;
        })

    },
    backNewsTitleList() {
      this.shownews = "false"
    }, //返回新闻列表页面
    getInfoList(id) {
      this.post('oneNews', {
          id: id,
        })
        .then(resp => {

          let data = resp.data.data
          console.log(data)
          this.newtitle = data[0].title;
          this.newttime = data[0].time;
          this.newcontent = data[0].news;
        })
    },
    getpage(page) {
      this.page = page;
      this.showmessage(page)
    },
    showmessage(page) {
      this.post('listNews', {
          page: this.page = page ? page : 1,
        })
        .then(resp => {
          this.newscont = resp.data.count
          this.newsData = resp.data.data
          console.log(this.newsData)
        })
    }

  },
  mounted() {
    this.showmessage()
  },
}

</script>
