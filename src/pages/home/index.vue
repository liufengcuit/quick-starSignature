<template>
	<div class="home">
		<div class="home-coin yellow-theme">{{ coin }}</div>
		<div class="home-content">
			<div class="user-info">
				<div class="head-img">
					<img :src="avatarUrl" alt="">
				</div>
			</div>
			<div class="nick-name">{{ nickName }}</div>
			<a class="guess-right" href="/pages/map/main">已猜对<span>{{ num }}</span> 个签名</a>
			<a class="home-btn start" href="/pages/index/main">开始挑战</a>
			<div class="home-btn point" @click="shop()">{{ point }} 积分</div>
			<div class="description" @click="points()">积分获取说明</div>
			<div class="contact">
				<button open-type="contact">联系客服</button>
			</div>
		</div>
		<!-- 签到 -->
		<div class="sign" v-if="checkSign">
			<div class="sign-box">
				<div class="sign-box-title">每日签到奖励</div>
				<img src="https://pomelocul.com/public/image/gold@2x.png" alt="" class="coin-img">
				<div class="sign-box-coin yellow-theme">金币 +10</div>
				<div class="sign-btn" @click="check()">签到</div>
				<div class="close" @click="close()"></div>
			</div>
		</div>
	</div>
</template>
<script>
	import _wx from '../../utils/wx.js'
	
	export default {
		data() {
			return {
				avatarUrl: '',
				nickName: '',
				checkSign: false
			}
		},
		computed:{
			coin() {
				return this.$store.state.coin
			},
			point() {
				return this.$store.state.point
			},
			num() {
				return this.$store.state.num
			}
		},
		methods:{
			getUserInfo(){
				
				let self = this;
				wx.getUserInfo({
					success: function(res) {
						wx.showLoading({
							mask: true,
							title: '加载中'
						})
						self.nickName = res.userInfo.nickName
						self.avatarUrl = res.userInfo.avatarUrl

						/*更新用户信息*/
						self.$api.updateUserInfo({
							unionid: self.$store.state.loginInfo.unionid,
							nickName: res.userInfo.nickName,
							avatarUrl: res.userInfo.avatarUrl,
							gender: res.userInfo.gender,
							city: res.userInfo.city,
							province: res.userInfo.province
						},result => {
							/*获取用户信息*/
							self.$api.userInfo({
								unionid: self.$store.state.loginInfo.unionid
							}, success => {
								self.$store.commit("setPoint", success.data.point)
								self.$store.commit("setCoin", success.data.coin)
								self.$store.commit("setNum", success.data.num)
								wx.hideLoading()
							})
						})
					},
					fail: function(res){
						wx.showLoading({
							mask: true,
							title: '加载中'
						})
						wx.openSetting({
							success: (res) => {
								wx.authorize({
					                scope: 'scope.userInfo',
					                success() {
					                    self.getUserInfo();
					                },
					                fail() {
					                	console.log("接口调用失败")
					                }
					            })
							 
							}
						})
					}
				})
			},
			isCheck(uid){
				this.$api.isCheck({unionid: uid}, success => {
					if(!success.data){
						this.checkSign = true;
					}
				}, fail => {
				})
			},
			check() {
				this.$api.check({unionid: this.$store.state.loginInfo.unionid}, success => {
					this.checkSign = false;
					this.$store.commit("setCoin", success.data.data)
				}, fail => {
				})
			},
			close() {
				this.checkSign = false;
			},
			shop() {
				_wx.showModal('敬请期待','积分商城正在搭建中，积分可兑换实物商品、话费充值卡等',false,'好的')
			},
			points() {
				_wx.showModal('积分获取规则','每次分享到（不同的）群可获得 5 积分，每猜对1题也可获得 1 积分',false,'好的')
			}
		},
		created() {
			let self = this;
			wx.showLoading({
				mask: true,
				title: '加载中'
			})
		    wx.login({
		      success: function(res) {
		        if (res.code) {
		          self.$api.login({wxCode: res.code}, success => {
		            self.$store.commit("setLogin", success.data);
		            self.getUserInfo();
		            self.isCheck(success.data.unionid)
		          }, error => {
		          })
		        } else {
		          console.log('登录失败！' + res.errMsg)
		        }
		      }
		    });
		    /*获取更多的信息*/
		    wx.showShareMenu({
		      withShareTicket: true
		    })
		},
		onShow() {
			wx.getSetting({
			    success(res) {
			        if (!res.authSetting['scope.userInfo']) {
			            wx.authorize({
			                scope: 'scope.userInfo',
			                success() {
			                    // 用户已经同意小程序使用录音功能，后续调用 wx.startRecord 接口不会弹窗询问
			                    wx.getUserInfo()
			                }
			            })
			        }
			    }
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
	.home{
		position: relative;
	}
	.home-coin{
		position: absolute;
		left: 16px;
    	top: 8px;
		padding-left: 40px;
	    padding-right: 8px;
	    border-radius: 16px;
	    line-height: 32px;
	    box-sizing: border-box;
	    -webkit-box-sizing: border-box;
	    height: 32px;
		background: #3D2B4E url(https://pomelocul.com/public/image/gold@2x.png) no-repeat left top;
		background-size: 32px 32px;
		font-weight: bolder;
	}
	.home-content{
		padding-top: 56px;
		display: flex;
		align-items: center;
		flex-direction: column;
	}
	.user-info{
		width: 208px;
		height: 128px;
		background: url(https://pomelocul.com/public/image/back_bj@2x.png) no-repeat left top;
		background-size: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
		font-size:0;
	}
	.head-img{
		width: 88px;
		height: 88px;
		border-radius: 50%;
		overflow: hidden;
	}
	.head-img img{
		width: 100%;
		height: 100%
	}
	.nick-name{
		color: #FFFFFF;
		font-size: 16px;
		font-weight: bolder;
	}
	.guess-right{
		font-weight: bolder;
		font-size: 22px;
		margin: 60px 0;
		color: #FFB81E;
	}
	.guess-right span{
		color: #FF4A97
	}
	.home-btn{
		width: 288px;
		height: 48px;
		text-align: center;
		line-height: 48px;
		border: 4px solid #534268;
		border-radius: 50px;
		color: #FFFFFF;
		font-size: 18px;
		font-weight: bolder;
		letter-spacing: 2px;
	}
	.home-btn::after{
		border: 0;
	}
	.start{
		background: #FF4A97
	}
	.point{
		background:rgba(255,255,255,.1);
		margin-top: 16px;
	}
	.description{
		margin-top: 8px;
		color: #977EAF;
		font-size: 14px;
	}
	.contact{
		margin-top: 72px;
	}
	.contact button{
		position: fixed;
		color: #977EAF;
		font-size: 12px;
		background: transparent;
		bottom: 24px;
		left: 50%;
		transform: translateX(-50%);
		-ms-transform: translateX(-50%);
		-moz-transform: translateX(-50%);
		-webkit-transform: translateX(-50%);
		-o-transform: translateX(-50%);
		z-index: 221;
	}
	.contact button::after{
		border: none;
	}
	/*签到*/
	.sign{
		width: 100vw;
		height: 100vh;
		background: rgba(0,0,0,.4);
		position: fixed;
		left: 0;
		top: 0;
		display: flex;
		justify-content: center;
	}
	.sign-box{
		width: 224px;
		height: 248px;
		border-radius: 8px;
		background: #FFFFFF;
		display: flex;
		align-items: center;
		flex-direction: column;
		margin-top: calc(100vh * .296);
		position: relative;
	}
	.sign-box-title{
		font-size: 18px;
		color: #4B375E;
		margin: 16px 0;
		font-weight: bolder;
	}
	.coin-img{
		width: 80px;
		height: 80px;
	}
	.sign-box-coin{
		margin: 16px 0 24px;
		font-size: 18px;
		font-weight: bolder;
	}
	.sign-btn{
		width: 120px;
		height: 32px;
		color: #FFFFFF;
		border-radius: 17px;
		background: #FF4A97;
		text-align: center;
		line-height: 32px;
		font-weight: bolder;
	}
	.close{
		width: 32px;
		height: 32px;
		position: absolute;
		top: -40px;
		right: 0;
		background: url(https://pomelocul.com/public/image/close@2x.png) no-repeat left top;
		background-size: 100%;
	}
</style>