<template>
  <div>
    <p class="imglist" v-for="(item,index) in myimg" :key="index">
      <img v-if="item?true:false" height="30" width="30" :src='baseImgpath+item'   @click="showbigpic(baseImgpath+item)" />
    </p>
    <modal title="View Image" v-model="bigpicvisible">
      <img :src="showmybigpicurl" v-if="bigpicvisible" style="width: 100%">
    </modal>
  </div>
</template>
<script>
import { baseImgpath, baseUrl } from '@/config/env';
export default {
  props: {
    row: String
  },

  data() {
    return {
      bigpicvisible: false,
      baseUrl: baseUrl,
      baseImgpath: baseImgpath,
      openImg: '',
    }
  },
  methods: {
    showbigpic(url) {
      this.bigpicvisible = true;
      this.showmybigpicurl = url
    }
  },
  computed: {
    myimg() {
      let str = this.row
      console.log("555", str.split(','))
      console.log(str.split(',').length)
      return str.split(',')
    },


  },

};

</script>
<style lang="scss" scoped>
.imglist {
  width: 40px;
  height: 40px;
  float: left;
  margin-left:10px;
}

</style>
