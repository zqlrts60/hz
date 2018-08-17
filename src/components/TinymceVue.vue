<template>
  <div>
    <textarea :id="id">{{ content }}</textarea>
  </div>
</template>
<script>
// Import TinyMCE
import tinymce from 'tinymce/tinymce'
import { baseUrl } from '@/config/env'

// A theme is also required
import 'tinymce/themes/modern/theme'

// Any plugins you want to use has to be imported
import 'tinymce/plugins/advlist'
import 'tinymce/plugins/wordcount'
import 'tinymce/plugins/autolink'
import 'tinymce/plugins/autosave'
import 'tinymce/plugins/charmap'
import 'tinymce/plugins/codesample'
import 'tinymce/plugins/contextmenu'
import 'tinymce/plugins/emoticons'
import 'tinymce/plugins/fullscreen'
import 'tinymce/plugins/hr'
import 'tinymce/plugins/imagetools'
import 'tinymce/plugins/insertdatetime'
import 'tinymce/plugins/link'
import 'tinymce/plugins/media'
import 'tinymce/plugins/noneditable'
import 'tinymce/plugins/paste'
import 'tinymce/plugins/print'
import 'tinymce/plugins/searchreplace'
import 'tinymce/plugins/tabfocus'
import 'tinymce/plugins/template'
import 'tinymce/plugins/textpattern'
import 'tinymce/plugins/visualblocks'
import 'tinymce/plugins/anchor'
import 'tinymce/plugins/autoresize'
import 'tinymce/plugins/bbcode'
import 'tinymce/plugins/code'
import 'tinymce/plugins/colorpicker'
import 'tinymce/plugins/directionality'
import 'tinymce/plugins/fullpage'
import 'tinymce/plugins/help'
import 'tinymce/plugins/image'
import 'tinymce/plugins/importcss'
import 'tinymce/plugins/legacyoutput'
import 'tinymce/plugins/lists'
import 'tinymce/plugins/nonbreaking'
import 'tinymce/plugins/pagebreak'
import 'tinymce/plugins/preview'
import 'tinymce/plugins/save'
import 'tinymce/plugins/spellchecker'
import 'tinymce/plugins/table'
import 'tinymce/plugins/textcolor'
import 'tinymce/plugins/toc'
import 'tinymce/plugins/visualchars'

import 'tinymce/skins/lightgray/skin.min.css'

export default {
  name: 'tinymce',
  props: {
    id: {
      type: String,
      required: true
    },
    value: { default: '' },
    htmlClass: { default: '', type: String },
    plugins: {
      default: function() {
        return []
      },
      type: Array
    },
    other_options: {
      default: function() {
        return {}
      },
      type: Object
    },
    readonly: { default: false, type: Boolean }
  },
  data() {
    return {
      content: '',
      editor: null,
      cTinyMce: null,
      checkerTimeout: null,
      isTyping: false
    }
  },
  mounted() {
    this.content = this.value
    this.init()
  },
  beforeDestroy() {
    this.editor.destroy()
  },
  watch: {
    value: function(newValue) {
      if (!this.isTyping) {
        if (this.editor !== null) this.editor.setContent(newValue)
        else this.content = newValue
      }
    },
    readonly(value) {
      if (value) {
        this.editor.setMode('readonly')
      } else {
        this.editor.setMode('design')
      }
    }
  },
  methods: {
    init() {
      let options = {
        selector: '#' + this.id,
        skin: false,
        toolbar1: this.toolbar1,
        toolbar2: this.toolbar2,
        plugins: this.plugins,
        init_instance_callback: this.initEditor,
        height: 350,
        language_url: document.location.protocol +
          '//' +
          window.location.host +
          '/static/langs/zh_CN.js',
        // menubar: false,  // 去掉顶部菜单
        branding: false, // 是否显示POWERED BY TINYMCE
        theme: 'modern',
        toolbar_items_size: 'small', // 按钮大小
        // 插件
        plugins: [
          'advlist autolink link image lists charmap print hr anchor pagebreak',
          'searchreplace visualblocks visualchars code fullscreen media nonbreaking',
          'table directionality emoticons textcolor paste textcolor colorpicker textpattern uploadimage '
        ],
        branding: false,
        style_formats: [
          { title: 'Bold', icon: 'bold', format: 'bold' },
          { title: 'Italic', icon: 'italic', format: 'italic' },
          { title: 'Underline', icon: 'underline', format: 'underline' },
          {
            title: 'Strikethrough',
            icon: 'strikethrough',
            format: 'strikethrough'
          },
          { title: 'Superscript', icon: 'superscript', format: 'superscript' },
          { title: 'Subscript', icon: 'subscript', format: 'subscript' },
          { title: 'Code', icon: 'code', format: 'code' }
        ],
        block_formats: 'Paragraph=p;Heading 1=h1;Heading 2=h2;Heading 3=h3;Heading 4=h4;Heading 5=h5;Heading 6=h6;',
        toolbar1: 'insertfile undo redo | formatselect | bullist numlist | link unlink | uploadimg image media | fullscreen',
        toolbar2: 'styleselect fontsizeselect | forecolor backcolor | bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | outdent indent | removeformat| link unlink uploadimage',
        image_advtab: true, //开启图片上传的高级选项功能
        table_default_styles: {
          width: '100%',
          borderCollapse: 'collapse'
        },
        image_title: false, // 是否开启图片标题设置的选择，这里设置否
        images_upload_credentials: true,
        // images_upload_handler: function s(e, t, n) {
        //   var o_n = n;
        //   n = function(s) {
        //     window.alert(s);
        //     o_n(s);
        //   }
        //   var a, s, i = function(e) {
        //     var t, n;
        //     return n = {
        //         "image/jpeg": "jpg",
        //         "image/jpg": "jpg",
        //         "image/gif": "gif",
        //         "image/png": "png"
        //       },
        //       t = n[e.blob().type.toLowerCase()] || "dat", e.id() + "." + t
        //   };
        //     a = new XMLHttpRequest,
        //     //填写postAcceptor的地址  
        //     a.open("POST", "http://58.213.47.166:9013/hzzDemo/ueimg"),
        //     a.withCredentials = true,
        //     a.onload = function() {
        //       var e, o = function(e, t) {
        //         return e ? e.replace(/\/$/, "") + "/" + t.replace(/^\//, "") : t
        //       };
        //       return 200 != a.status ? void n(a.responseText) : (e = JSON.parse(a.responseText), e && "string" == typeof e.location ? void t(o("/", e.location)) : void n("Invalid JSON: " + a.responseText))
        //     },
        //     s = new FormData,
        //     //填写图片存放的目录地址  
        //     s.append("file", e.blob(), i(e)),
        //     a.send(s)
        // }//上传图片选择


      }
      tinymce.init(this.concatAssciativeArrays(options, this.other_options))

    },
    initEditor(editor) {
      this.editor = editor
      editor.on('KeyUp', e => {
        this.submitNewContent('keyup')
      })

      editor.on('Change', e => {
        if (this.editor.getContent() !== this.value) {
          this.submitNewContent('change')
        }
      })
      editor.on('init', e => {
        editor.setContent(this.content)
        this.$emit('input', this.content)
      })
      if (this.readonly) {
        this.editor.setMode('readonly')
      } else {
        this.editor.setMode('design')
      }

      this.$emit('editorInit', editor)
    },
    concatAssciativeArrays(array1, array2) {
      if (array2.length === 0) return array1
      if (array1.length === 0) return array2
      let dest = []
      for (let key in array1) dest[key] = array1[key]
      for (let key in array2) dest[key] = array2[key]
      return dest
    },
    submitNewContent(eventType) {
      this.isTyping = true
      if (this.checkerTimeout !== null) clearTimeout(this.checkerTimeout)
      this.checkerTimeout = setTimeout(() => {
        this.isTyping = false
        this.$emit(eventType, this.editor.getContent())
      }, 300)
    }
  }
}

</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>


</style>
