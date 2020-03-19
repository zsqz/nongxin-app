export default {
	common: {
		baseUrl: 'http://app.gdnxeco.com/app', //192.168.101.15:8082/app  47.108.66.5/app app.gdnxeco.com/app
		updataUrl: 'http://app.gdnxeco.com',
		header: {
			'Content-Type': 'application/json;charset=UTF-8'
		},
		data: {},
		method: 'GET',
		dataType: 'json'
	},
	request(options = {}) {
		try {
			const token = uni.getStorageSync('setUsertoken');
			if (token) {
				options.header = {
					'Content-Type': 'application/json;charset=UTF-8',
					'X-Access-Token': token
				}
			}
		} catch (e) {
			// error
		}
		options.url = this.common.baseUrl + options.url;
		options.data = options.data || this.common.data;
		options.method = options.method || this.common.method;
		options.dataType = options.dataType || this.common.dataType;
		return new Promise((res, rej) => {
			uni.request({
				...options,
				success: (result) => {
					//服务端失败
					if (result.statusCode != 200) {
						res(result)
						return uni.showToast({
							title: result.message || '服务端失败',
							icon: 'none'
						})
					}
					//成功
					let data = result.data
					res(data);
				},
				fail: (error) => {
					uni.showToast({
						title: error.errMsg || '请求失败',
						icon: 'none'
					})
					return rej()
				}
			})
		})
	},
	//get请求
	get(url, data = {}, options = {}) {
		options.url = url
		options.data = data
		options.method = 'GET'
		return this.request(options)
	},
	//post请求
	post(url, data = {}, options = {}) {
		options.url = url
		options.data = data
		options.method = 'POST'
		return this.request(options)
	}
}
