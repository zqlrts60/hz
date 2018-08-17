<template>
  <Row>
    <Col>
      <div>
        <Transfer
          :data="data2"
          :target-keys="targetKeys2"
          filterable
          :titles="['可以管理河流','已经管理河流']"
          :filter-method="filterMethod"
          @on-change="handleChange2"></Transfer>
      </div>
    </Col>

  </Row>


</template>
<script>
  export default {
    props: ['row'],
    data() {
      return {
        data2: [],
        targetKeys2: [],
        types: [],
      }
    },
    created() {
      this.post('findRiverByType', {
        userID: this.row.id
      }).then(resp => {
          resp.data.data.map((item) =>{
           return this.targetKeys2.push(item.riverId.toString())  // keys 为字符串
        });
          console.log(this.targetKeys2)

      });
      this.post('findRiverByUser', {
        userID: this.row.id
      }).then(resp => {
        resp.data.data.map((item) => {
          item.key = item.riverId,
            item.label = item.riverName
          return this.data2.push(item);
        })
        console.log(this.data2)

      })
    },
    methods: {
      handleChange2(newTargetKeys) {
        this.targetKeys2 = newTargetKeys;
      },
      filterMethod(data, query) {
        return data.label.indexOf(query) > -1;
      }
    }
  }
</script>
