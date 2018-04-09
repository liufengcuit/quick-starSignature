import { request } from './index.js'

export default {
	/*登录*/
	login(params, success, fail) {
		return request('/v1/auth/login', params, success, fail)
	},
	/*用户答题进度*/
	getAnswer(params, success, fail){
		return request('/v1/sign/progress', params, success, fail)
	},
	/*分享回调*/
	shareBack(params, success, fail) {
		return request('/api/share', params, success, fail)
	},
	/*消费金币上报*/
	consume(params, success, fail) {
		return request('/v1/sign/cus-coin', params, success, fail)
	},
	/*更新用户信息*/
	updateUserInfo(params, success, fail) {
		return request('/v1/user/update-userinfo', params, success, fail)
	},
	/*答题成功上报*/
	answerSuccess(params, success, fail) {
		return request('/v1/sign/answer', params, success, fail)
	},
	/*每日签到*/
	check(params, success, fail) {
		return request('/v1/user/check', params, success, fail)
	},
	/*是否签到*/
	isCheck(params, success, fail) {
		return request('/v1/user/is-check', params, success, fail)
	},
	/*用户信息*/
	userInfo(params, success, fail) {
		return request('/v1/user/info', params, success, fail)
	},
	/*关卡地图*/
	level(params, success, fail) {
		return request('/v1/sign/level', params, success, fail)
	},
	/*分享上报*/
	share(params, success, fail) {
		return request('/v1/sign/share', params, success, fail)
	}
}