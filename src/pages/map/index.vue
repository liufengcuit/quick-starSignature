<template>
	<div class="map">
		<div class="map-list"
			 v-for="list in lists"
			 :key="list" 
			 :class="{ 'map-progress': list.current, 'map-no-progress': list.pass == false }"
			 @click="selectTab(list)"
			 >
			{{ list.sort }}
		</div>
	</div>
</template>
<script>
	import _wx from '../../utils/wx.js'
	export default {
		data() {
			return {
				lists:''
			}
		},
		methods:{
			selectTab(list){
				if(list.pass != false){
					const url = '../index/main?level='+list.level+'&sort='+list.sort;
					wx.navigateTo({ url });
				}else {
					wx.showModal({
						title: '葛大爷说',
						content: '路要一步一步地走，步子迈大了，咔！容易扯着蛋！',
						confirmText: '有道理',
						showCancel: false
					})
				}
			}
		},
		onShow() {
			this.$api.level({unionid: this.$store.state.loginInfo.unionid}, success => {
				this.lists = success.data
				for(let i in success.data){
					if(success.data[i].current === true){
						this.$store.commit("setNum", (success.data[i].sort-1))
					}
				}
			})
		},
		created() {
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
  }
	}
</script>
<style>
	.map{
		padding-bottom: 16px;
	}
	.map-list{
		border-radius: 16rpx;
		width: calc(100vw * (6/47));
		width: -webkit-calc(100vw * (6/47));
		height: -webkit-calc(100vw * (6/47));
		height: calc(100vw * (6/47));
		line-height: calc(100vw * (6/47));
		display: inline-block; 
		margin-left: calc(100vw * (11/329));
		margin-top: calc(100vw * (11/329));
		background-color:#fff; 
		color: #4B375E;
		text-align: center;

	}
	.map-progress{
		color: #FFFFFF;
		background: #FF4A97;
	}
	.map-no-progress{
		background: url("https://pomelocul.com/public/image/lock@2x.png") no-repeat left top;
		background-size: 100% 100%;
		text-indent: -99999999999px
	}
</style>