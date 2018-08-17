<style lang="scss" scoped>
  @import './login.scss';
</style>
<template>
  <div class="login" @keydown.enter="handleSubmit">
    <div class="login-con">
     <!-- iview Card -->
      <Card :bordered="true" >
        <p slot="title">
          <Icon type="log-in"></Icon>
          欢迎登录
        </p>
        <div class="form-con">
          <Form ref="loginForm" :model="form" :rules="rules">
            <FormItem prop="userName">
              <Input v-model="form.userName" placeholder="请输入用户名" autocomplete="off">
              <span slot="prepend">
                <Icon :size="16" type="person"></Icon>
              </span>
              </Input>
            </FormItem>
            <FormItem prop="password">
              <Input type="password" v-model="form.password" placeholder="请输入密码" autocomplete="off">
              <span slot="prepend">
                <Icon :size="14" type="locked"></Icon>
              </span>
              </Input>
            </FormItem>
            <FormItem>
              <Button @click="handleSubmit" :loading="loading" type="primary" long>登录</Button>
            </FormItem>
          </Form>
        </div>
      </Card>
    </div>
    <canvas id="canvas"></canvas>
  </div>
</template>
<script>
  import Cookies from 'js-cookie';

  export default {
    data() {
      return {
        loading: false,
        form: {
          userName: '',
          password: ''
        },
        rules: {
          userName: [
            { required: true, message: '账号不能为空', trigger: 'blur' }
          ],
          password: [
            { required: true, message: '密码不能为空', trigger: 'blur' }
          ]
        }
      };
    },
    methods: {
      handleSubmit() {
        //正则校验通过-iview
        this.$refs.loginForm
          .validate((valid) => {
            //如果通过正则验证
            if (valid) {
              this.loading = true
              this.post('/login', {
                nickName: this.form.userName,
                password: this.form.password
              }).then(resp => {
                if (resp.data.code == 1) {
                  Cookies.set('user', this.form.userName);
                  Cookies.set('userid', resp.data.date[0].id);
                  Cookies.set('type', resp.data.date[0].type);
                  //路由跳转
                  this.$router.push({ name: 'home' });
                } else if (resp.data.code == 0) {
                  this.$Message.error('没有此账号，请重新输入');
                  this.$refs.loginForm.resetFields();
                  setTimeout(function () {
                    window.location.reload()
                  }, 300)

                }
              });
            } else {
              this.$Message.error('验证不通过，请重新输入');
              setTimeout(function () {
                window.location.reload()
              }, 300)
            }
          });
      }
    },
    
    
    //canvas 绘图
    mounted() {
      var ctx = canvas.getContext("2d");
      var body = [];
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      var mouse_pos_x = canvas.width / 2;
      var mouse_pos_y = canvas.height / 2;
      var delta = 1;
      var step = 0;
      var loop = 0;
      var line = 0;
      var lineMax = 20;
      var lineMin = 5;
      var TWO_PI = 2 * Math.PI;
      var t = 0;
      var animate = true;
      var op = 1;
      var bodyLength = 20;
      canvas.addEventListener('mouseleave', mouse_leave);
      canvas.addEventListener('mousemove', mouse_track);

      function mouse_leave() {
        animate = true;
      }

      function mouse_track(event) {
        animate = false;
        if ((Math.abs(mouse_pos_x - event.clientX) > delta) || (Math.abs(mouse_pos_y - event.clientY) > delta)) {
          mouse_pos_x = event.clientX;
          mouse_pos_y = event.clientY;
        }
      }
      var red = [];
      var grn = [];
      var blu = [];

      var center = 128;
      var width = 127;
      var frequency1 = 0.3;
      var frequency2 = 0.3;
      var frequency3 = 0.3;

      var phase1 = 0;
      var phase2 = 2;
      var phase3 = 4;

      for (var s = 0; s < bodyLength; s++) {
        red[s] = Math.round(Math.sin(frequency1 * s + phase1) * width + center);
        grn[s] = Math.round(Math.sin(frequency2 * s + phase2) * width + center);
        blu[s] = Math.round(Math.sin(frequency3 * s + phase3) * width + center);
      }
      var size = Math.min(canvas.width, canvas.height) / 50;
      var startX = canvas.width / 2 + size * (16 * Math.sin(0) * Math.sin(0) * Math.sin(0));
      var startY = canvas.height - (canvas.height / 2 + (size * (13 * Math.cos(0) - 5 * Math.cos(0) - 2 * Math.cos(0) - Math.cos(0))));
      for (var i = 0; i < bodyLength; i++) {
        var b = {
          x: startX,
          y: startY
        };
        body.push(b);
      }

      function draw() {
        t += 0.08;
        t = t % TWO_PI;
        if (line <= lineMin) {
          op = 1;
          line = lineMin + 1;
        }
        if (line >= lineMax) {
          op = -1;
          line = lineMax - 1;
        }
        loop++;
        if (loop == 5) {
          step++;
          step = step % bodyLength;
          loop = 0;
        }

        line = op + line;

        if (animate) {
          size = Math.min(canvas.width, canvas.height) / 50;
          //Heart curve from:
          mouse_pos_x = canvas.width / 2 + size * (16 * Math.sin(t) * Math.sin(t) * Math.sin(t));
          mouse_pos_y = canvas.height - (canvas.height / 2 + (size * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t))));
        }
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        for (var i = (body.length - 1); i > 0; i--) {
          body[i].x = body[i - 1].x;
          body[i].y = body[i - 1].y;
        }
        body[0].x = mouse_pos_x;
        body[0].y = mouse_pos_y;
        ctx.lineWidth = line;
        ctx.strokeStyle = "rgb(" + red[step] + "," + grn[step] + "," + blu[step] + ")";
        ctx.fillStyle = "rgb(" + red[step] + "," + grn[step] + "," + blu[step] + ")";
        //Draw leading circle
        ctx.beginPath();
        ctx.arc((body[0].x), (body[0].y), line / 2, 0, TWO_PI);
        ctx.fill();
        //Draw line
        ctx.beginPath();
        ctx.moveTo(body[0].x, body[0].y);
        for (var s = 0; s < body.length - 2; s++) {
          //Bezier curve along points taken from:
          var xc = (body[s].x + body[s + 1].x) / 2;
          var yc = (body[s].y + body[s + 1].y) / 2;
          ctx.quadraticCurveTo(body[s].x, body[s].y, xc, yc);
        }
        ctx.stroke();
        //Draw trailing circle
        ctx.beginPath();
        ctx.arc(xc, yc, line / 2, 0, TWO_PI);
        ctx.fill();
        window.requestAnimationFrame(draw);
      }
      window.requestAnimationFrame(draw);
    },
  };

</script>
<style>
</style>