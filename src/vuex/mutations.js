export default {
	/*登录信息*/
	setLogin(state, payload) {
		state.loginInfo = payload
	},
	selects(state, payload) {
		state.selects = payload
	},
	setTextInfo(state, payload) {
		state.textInfo = payload
	},
	setCoin(state, payload){
		state.coin = payload;
	},
	setModal(state, payload) {
		state.modal = payload;
	},
	setPoint(state, payload) {
		state.point = payload;
	},
	setNum(state, payload) {
		state.num = payload;
	}
}