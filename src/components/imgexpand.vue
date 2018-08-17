<style lang="scss" scoped>
.expand-row {
  margin-bottom: 16px;
  text-align: center;
}

.pics {
  width: 70px;
  height: 70px;
  margin: 5px;
  cursor: pointer;
}

</style>
<template>
  <div>
    <Row class="expand-row">
    </Row>
    <Row>
      <Col  span="6">
      <span class="expand-key">问题图片: </span>
      <span class="expand-value" :key="index" v-for="(item,index) in pics">
        <Poptip transfer v-if="baseImgpath+item.url" placement="top-start" trigger="hover" title="点击放最大" content="提示内容"
                width="300" height="300">
          <div class="api" slot="content" width="300" height="300">
            <img height="300" width="300" :src=baseImgpath+item.url :alt=item.alt @click="open(baseImgpath+item.url)"/>
            </div>
         <img class="pics" :src=baseImgpath+item.url :alt=item.alt @click="open(baseImgpath+item.url)"/>
           </Poptip>
      </span>
      </Col>
      <Col  span="6">
      <span class="expand-key">已处理图片: </span>
      <span class="expand-value" :key="index" v-for="(item,index) in ypics">
        <Poptip transfer v-if="baseImgpath+item.url" placement="top-start" trigger="hover" title="点击放最大" content="提示内容"
                width="300" height="300">
          <div class="api" slot="content" width="300" height="300">
            <img height="300" width="300" :src=baseImgpath+item.url :alt=item.alt @click="open(baseImgpath+item.url)"/>
            </div>
         <img class="pics" :src=baseImgpath+item.url :alt=item.alt @click="open(baseImgpath+item.url)"/>
           </Poptip>
      </span>
      </Col>
    </Row>
    <Modal v-model="showImgFlag" width="700" height="700" :styles="{top: atuomodeltop}">
      <p slot="header" style="color:#f60;text-align:center">
      </p>
      <img :src="openImg" width="670" height="700" />
      <div slot="footer">
      </div>
    </Modal>
  </div>
</template>
<script>
import { baseImgpath, baseUrl } from '@/config/env';

export default {
  props: {
    row: Object
  },
  data() {
    return {
      baseUrl: baseUrl,
      baseImgpath: baseImgpath,
      showImgFlag: false,
      openImg: '',
    }
  },
  methods: {
    open(src) {
      this.openImg = src;
      this.showImgFlag = true;
    }
  },
  computed: {
    pics() {
      return this.row.pic
      // if (this.row.dispose) {  //问题处理页面
      //   return this.row.dispose == 0 ? this.row.pic : this.row.disposePic
      // } else {
      //   return this.row.pic   //巡查总结页面
      // }

    },

    ypics() {
      return this.row.disposePic
    },
    atuomodeltop() {
      return document.documentElement.clientHeight > 660 ? '120px' : '2px'
    }
  },

};

</script>
