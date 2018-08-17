<template lang="html">
  <div class="dashboard">
    {{str1}}

  </div>
</template>

<script>

  export default {
    data() {
      return {
        str1: '',
      }
    },
    mounted() {
      this.readtxt()
    },
    methods: {
      readtxt() {
        // var reader = new FileReader();
        // //将文件以文本形式读入页面
        // reader.readAsText(txt, "gb2312");
        // reader.onload = function (e) {
        //   this.str1 = e.target.result.split(",");
        // }
      }
    },
    components: {}
  }
</script>

<style lang="scss" scoped>


</style>
