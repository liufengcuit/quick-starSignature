<template>
  <div class="container">
    <div class="header">
      <div class="coin">{{ coin }}</div>
      <img :src="textInfo.imgUrl" alt="" class="sign">
      <div class="text-no">
        第&nbsp;<span>{{ textInfo.sort }}</span>&nbsp;题
      </div>
    </div>
    <div class="content">
      <div class="content-btn" v-if="first">
        <button class="btn btn-pink" open-type="share" @click="ald()">求助</button>
        <button class="btn btn-gray" @click="tips();">提示</button>
      </div>
      <div class="content-tip" v-else>
        {{ textInfo.hint }}
      </div>
    </div>
    <div class="footer">
      <div class="text-zone">
        <div class="text">
          <span class="text-list text-answer" v-for="(answer,index) in answerArr" :key="index" @click="backText(answer)">{{ answer.value }}</span>
        </div>
        <div class="answer-tips" @click="lookAnswer()" v-if="viewBtn">查看答案</div>
      </div>

      <div class="con">
        <div class="test" v-for="(list,index) in textList" :key="index">
          <span class="text-list text-select" 
                :class="{show: list.value === '?'}"
                @click="selectText(list.value, index)">{{ list.value }}
          </span>
        </div>
      </div>
    </div>
    <modal :names="answerText" v-if="modal" v-on:options="modalOption"></modal>
    {{ logs }}
  </div>
</template>

<script>
import Modal from '../../components/modal.vue'

import _wx from '../../utils/wx.js'
export default {
  data () {
    return {
      first: true,
      width: '',
      viewBtn: false,
      answerArr:'',
      answerText:'',
      /*当前题可以获得金币和积分*/
      currText:'',
      logs:''
    }
  },
  computed:{
    textList(){
      return this.$store.state.selects;
    },
    textInfo(){
      console.log(this.$store.state.textInfo)
      return this.$store.state.textInfo;
    },
    coin(){
      return this.$store.state.coin;
    },
    modal(){
      return this.$store.state.modal;
    }
  },
  methods: {
    tips() {
      this.$api.consume({
        type: 3,
        unionid: this.$store.state.loginInfo.unionid
      }, result => {
        switch(result.data.result){
          case -1:
            _wx.showToast('出错误了', 1);
            break;
          case -2:
            _wx.showToast('金币不足', 1);
            break;
          default:
            this.first = false;
            this.viewBtn = true;
            this.$store.commit("setCoin", result.data.result)
            break;
        }
        console.log(result);
      })
    },
    /*查看答案*/
    lookAnswer() {
      this.$api.consume({
        type: 4,
        unionid: this.$store.state.loginInfo.unionid
      }, result => {
        switch(result.data.result){
          case -1:
            _wx.showToast('出错误了', 1);
            break;
          case -2:
            _wx.showToast('金币不足', 1);
            break;
          default:
            this.$store.commit("setModal", true);
            this.$store.commit("setCoin", result.data.result)
            break;
        }
      })
      
    },
    modalOption(res){
      this.submitAnswer({q:1});
    },
    /*选择答案*/
    selectText(value, index){
      let answer = false;    //判断选择的按钮
      for(let i=0, len=this.answerArr.length; i<len; i++){
        if(this.answerArr[i].value === '?'){
          this.answerArr[i].value = value;
          this.answerArr[i].key = index;
          answer = true;
          break;
        }
      }
      if(answer){
        let tmp =  this.$store.state.selects;
        tmp.splice(index, 1, {key: '', value:'?'})
        this.$store.commit("selects", tmp);

        let answerStr = '';
        this.answerArr.forEach(function(item, index){
          answerStr += item.value;
        })
          
        if(answerStr === this.$store.state.textInfo.answer){
          console.log(this.$store.state.num);
          console.log(this.$store.state.textInfo.sort);
          if(this.currText.isNew || ++this.$store.state.num <= this.$store.state.textInfo.sort){
            /*判断是否是已经打过的题*/
            wx.showModal({
              title: '猜对啦',
              content: `恭喜获得${this.currText.coin}金币奖励`,
              showCancel: false,
              confirmText: '继续',
              success: function(res) {
                if (res.confirm) {
                  
                  this.submitAnswer();
                } else if (res.cancel) {
                  console.log('用户点击取消')
                }
              }.bind(this)
            })
          }else{
            _wx.showToast('猜对了', 0);
            setTimeout(function(){
              this.submitAnswer();
            }.bind(this), 1500) 
          }
        }else if(!/\?/g.test(answerStr) && answerStr !== this.$store.state.textInfo.answer){
          _wx.showToast('猜错了', 1)
        }
          
      }
    },
    /*回退答案*/
    backText(response){
      if(response.value !== "?"){
        for(let i=0, len=this.answerArr.length; i<len; i++){
          if(this.answerArr[i].value === response.value){
            let tmp = this.$store.state.selects;
            tmp.splice(response.key, 1, {key: response.key, value:response.value});
            this.$store.commit("selects", tmp)
            this.answerArr[i].value = "?";
            this.answerArr[i].key = "";
            return false;
          }
        }
      }
    },
    /*答题上报成功*/
    submitAnswer(extraParam){
      wx.showLoading({
        title: '加载中',
        mask: true
      })
      let _q = typeof extraParam == 'object'? extraParam.q: 0;
      this.first = true;
      this.viewBtn = false;
      this.$api.answerSuccess({
        level: this.$store.state.textInfo.level,
        sort: this.$store.state.textInfo.sort,
        unionid: this.$store.state.loginInfo.unionid,
        query: _q
      }, result => {
        wx.hideLoading()
        this.answerText = result.data.sign.answer
        this.$store.commit("setPoint", result.data.sign.point)
        /*设置猜对的签名数量*/
        let num = this.$store.state.num;
        if(result.data.sign.sort > num){
          this.$store.commit("setNum", (result.data.sign.sort-1))
        }
        this.currText = result.data.extra
        if(result.data.length === 0){
          wx.showModal({
              title: '恭喜您',
              content: '这已经是最后一题了',
              showCancel: false,
              confirmText: '确定',
              success: function(res) {
                if (res.confirm) {
                  console.log("确定")
                } else if (res.cancel) {
                  console.log('用户点击取消')
                }
              }.bind(this)
            })
          return false;
        }
        
        let textList = result.data.sign.items;
        this.$store.commit("selects", textList);
        let textInfo = result.data.sign;
        delete textInfo.items
        this.$store.commit("setTextInfo", textInfo)
        this.$store.commit("setCoin", textInfo.coin)
        this.answerArr = [];
        for(let i = 0,len = result.data.sign.answer.length; i< len; i++){
          this.answerArr.push({key: '', value: '?'})
        }
        console.log(result);
      }, fail => {
        wx.hideLoading()
        console.log(fail)
      })
    },
    ald(){
      var app = getApp();
      app.aldstat.sendEvent('求助好友')
    }
  },
  onLoad(option) {
    this.$api.getAnswer({
        unionid:this.$store.state.loginInfo.unionid,
        level: option.level?option.level:'',
        sort: option.sort?option.sort:''
      }, result => {
        console.log(result.data)
        this.answerText = result.data.sign.answer
        this.currText = result.data.extra
        wx.hideLoading()
        if(result.data.sign.length === 0){
          wx.showModal({
              title: '恭喜您',
              content: '这已经是最后一题了',
              showCancel: false,
              confirmText: '确定',
              success: function(res) {
                if (res.confirm) {
                  console.log("确定")
                } else if (res.cancel) {
                  console.log('用户点击取消')
                }
              }.bind(this)
            })
          return false;
        }
        let textList = result.data.sign.items;
        this.$store.commit("selects", textList);
        let textInfo = result.data.sign;
        delete textInfo.items
        this.$store.commit("setTextInfo", textInfo)
        this.$store.commit("setCoin", textInfo.coin)
        this.answerArr = [];
        for(let i = 0,len = result.data.sign.answer.length; i< len; i++){
          this.answerArr.push({key: '', value: '?'})
        }
        console.log(result);
      }, err => {
        console.log(err)
      }),
    /*获取更多的信息*/
    wx.showShareMenu({
      withShareTicket: true
    })
  },
  onShareAppMessage(res) {
    
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }else{
      var app = getApp();
      app.aldstat.sendEvent('分享');
    }
    let self = this;
    return {
      title: '猜签名',
      path:"/pages/home/main",
      success: function(res) {
        self.logs = res;
        console.log(res)
        if(res.shareTickets === undefined){
          console.log('个人')
          self.$api.share({
              unionid:self.$store.state.loginInfo.unionid
            }, success => {
              console.log(success);
              let value = success.data.coin - self.$store.state.coin
              self.$store.commit("setCoin", success.data.coin)
              _wx.showToast('分享成功 +'+ value)
            })
          return false;
        }
        wx.getShareInfo({
          shareTicket:res.shareTickets[0],
          success:function(result){
            // 转发成功
            self.$api.share({
              unionid:self.$store.state.loginInfo.unionid,
              group_id: result.encryptedData,
              iv: result.iv
            }, success => {
              console.log(success);
              let value = success.data.coin - self.$store.state.coin
              self.$store.commit("setCoin", success.data.coin)
              _wx.showToast('分享成功 +'+ value)
            })
        }})
        
      },
      fail: function(res) {
        // 转发失败
        console.log(res)
      }
    }
  },
  components: {
    Modal
  }
}
</script>

<style scoped>
  .container{
    background: url("http://l.test.81youxi.com/public/image/BJ03@2x.png") no-repeat left top;
    background-size: cover;
    height: 100%;
  }
  .header{
    width: 100%;
    height: 184px;
    background: #4B375E url("https://pomelocul.com/public/image/BJ01@2x.png") no-repeat left top;
    background-size: cover;
    position: relative;
    font-size: 24px;
    color: #FFB81E;
    padding: 48px 88px 32px;
    box-sizing: border-box;
  }
  .coin{
    padding-left: 40px;
    padding-right: 8px;
    border-radius: 16px;
    line-height: 32px;
    box-sizing: border-box;
    -webkit-box-sizing: border-box;
    height: 32px;
    position: absolute;
    background: #ffffff url("http://l.test.81youxi.com/public/image/gold@2x.png") no-repeat left top;
    background-size: 32px 32px;
    position: absolute;
    left: 16px;
    top: 8px;
    overflow: hidden;
    font-weight: bolder;
  }
  .header .sign{
    width: 100%;
    height: 104px;
  }
  .text-no{
    font-size: 16px;
    color: #4B375E;
    position: absolute;
    right: 16px;
    top: 16px;
    font-weight: bolder;
  }
  .text-no span{
    color: #FF4A97
  }
  .content{
    width: 100%;
    height: 172px;
    background: url("http://l.test.81youxi.com/public/image/pic02@2x.png") no-repeat left bottom;
    background-size: 72px 72px
  }
  .content-btn{
    padding-top: 16px;
    height: 100%;
    text-align: center;
    background: url("http://l.test.81youxi.com/public/image/pic01@2x.png") no-repeat right top;
    background-size: 72px 48px
  }
  .btn{
    width: 200px;
    border: 8px solid #534268;
    border-radius: 22px;
    color: #FFFFFF;
    display: inline-block;
    text-align: center;
    font-weight: bolder;
    font-size: 18px;
  }
  .content-tip{
    height: 100%;
    padding: 8px;
    font-size: 16px;
    color: #FFFFFF;
    box-sizing: border-box;
    overflow: auto;
  }
  .btn-pink{
    background-color: #FF4A97;
  }
  .btn-gray{
    background-color: rgba(255,255,255,.8);
    margin-top: 8px;
  }
  .text{
    display: inline-block;
    padding: 8px;
    border-top-right-radius: 50px;
    border-bottom-right-radius: 50px;
    background: #3F2C51;
    box-shadow: 0px 0px 10px #ff4a97;
    font-family:PingFang-SC-Bold;
  }
  .text-list{
    display: inline-block;
    border-radius: 50%;
    font-size: 18px;
    box-sizing: border-box;
  }
  .text-line div{
    flex: 1;
    padding: 2px;
  }
  .text-answer{
    color: #FFFFFF;
    text-align: center;
    background: #FF4A97;
    margin-right: 6px;
    width: calc((100vw - 16px)/7 - 4px);
    width: -webkit-calc((100vw - 16px)/7 - 4px);
    height: -webkit-calc((100vw - 16px)/7 - 4px);
    height: calc((100vw - 16px)/7 - 4px);
    line-height: calc((100vw - 16px)/7 - 4px);
  }
  .answer-tips{
    float: right;
    font-size: 16px;
    padding: 8px 32px;
    background: #FF4A97;
    color: #FFFFFF;
    border-radius: 50px;
    box-shadow: 0px 0px 10px rgba(255,255,255,.4);
    margin: 8px 8px 0 0;
  }
  .text-zone:after{
    content: ".";
    display: block;
    height: 0;
    clear: both;
    visibility: hidden;
  }
  .list{
    padding: 0 8px;
  }
  .text-line{
    display: flex;
    height: 48px;
    margin-top: 5px;
  }
  
  .text-select{
    background: #A89FAF;
    color: #40235A;
    padding: 6px;
    display: flex;
    justify-content: center;
    align-items: center;
    
  }
  .text-select::before{
    content: "";
    display: block;
    padding-top: 100%;
  }
  .text-line .text-selected{
    opacity:0
  }
  .con{
    padding: 8px 8px 0;
  }
  .test{
    display: inline-block;
    width: -webkit-calc((100vw - 16px)/7);
    width: calc((100vw - 16px)/7);
    height: -webkit-calc((100vw - 16px)/7);
    height: calc((100vw - 16px)/7);
    border-radius: 50%;
    padding: 2px;
    box-sizing: border-box;
  }
  .show{
    visibility: hidden;
  }

  /*提示框*/
  .panel{
    width: 168px;
    height: 112px;
    background: rgba(0,0,0,.4);
    border-radius: 8px;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    margin: auto auto;
    color: #FFB81E;
    font-size: 16px;
    text-align: center;
    padding-top: 16px;
    box-sizing: border-box;
    -webkit-box-sizing: border-box;
  }
  .panel img{
    width: 64px;
    height: 64px;
  }
</style>