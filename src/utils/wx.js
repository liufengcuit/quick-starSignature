export default {
	showModal(title, content, showCancel, confirmText) {
		wx.showModal({
			title: title,
			content: content,
			showCancel: showCancel,
			confirmText: confirmText,
			success: function(res) {
				if (res.confirm) {
					console.log('用户点击确定')
				} else if (res.cancel) {
					console.log('用户点击取消')
				}
			}
		})
	},
	showToast(title, type){
		let img = '';
		switch(type){
			case 0:
				img = "/static/image/happy@2x.png";
				break;
			case 1:
				img = "/static/image/sad@2x.png";
				break;
			default:
				img = "/static/image/gold@2x.png";
				break;

		}
		wx.showToast({
			title: title,
			image:img,
			duration: 1500,
			mask: true
		})
	}
}