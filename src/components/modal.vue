<template>
	<div class="modal-container">
		<div class="modal">
			<div class="modal-title">正确答案：{{ names }}</div>
			<div class="modal-content">惊不惊喜！意不意外？让好友也来猜猜看吧！</div>
			<div class="modal-footer">
				<button class="modal-btn examination" open-type="share" @click="examination()">考考好友</button>
				<button class="modal-btn go-on" @click="next()">继续</button>
			</div>
		</div>
	</div>
	
</template>

<script>
export default {
	methods:{
		examination(){
			this.$store.commit("setModal", false);
			var app = getApp();
			app.aldstat.sendEvent('考考好友');
		},
		next(){
			this.$emit("options", 1)
			this.$store.commit("setModal", false);
		}
	},
 	props: ['names']
}
</script>

<style>
.modal-container{
	position: fixed;
	width: 100vw;
	height: 100vh;
	background: rgba(0,0,0,.4);
	left: 0;
	top: 0;
	z-index: 222;
	display: flex;
	justify-content: center;
	align-items: center;
}
.modal {
  width: 312px;
  background: #fff url("http://l.test.81youxi.com/public/image/pic04@2x.png") no-repeat right top;
  background-size: 72px 40px;
  border-radius: 8px;
  overflow: hidden;
  padding: 24px 24px 22px;
  -webkit-box-sizing: border-box;
}
.modal-title{
	font-size: 18px;
	font-weight: bolder;
	color: rgb(75,55,94);
}
.modal-content{
	margin: 15px 0 20px;
	font-size: 14px;
	color: rgb(75,55,94);
	font-weight: bolder;
}
.modal-btn{
	width: 120px;
	padding: 4px 0;
	border-radius: 16px;
	font-size: 16px;
	text-align: center;
	line-height: 32px;
	display: inline-block;
	outline: none;
	font-weight: bolder;
}
.modal-btn::after{
	border: none;
}
.examination{
	color: #A18FB2;
	background: rgb(234,227,240);
	margin-right: 24px;
}
.go-on{
	color: #FFFFFF;
	background:rgb(255,74,151);
}
</style>
