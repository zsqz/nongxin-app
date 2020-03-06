mui.plusReady(function() {        
	plus.navigator.setStatusBarStyle('light');
	plus.navigator.setStatusBarBackground('#13B482'); //设置状态栏的颜色				
});

var tokens = localStorage.getItem("tokens");
console.log(tokens)
//api域名	app.scddwb.com/app 192.168.101.20:8081	
var api = "http://app.scddwb.com/app"

 // var api = "http://47.112.125.164:8099/api/app"

//显示照片
var pictures = api + "/pictureInfo/show/"
//缩略图
var compression = api + "/pictureInfo/show/compression/"

//url
var logins = '/user/login'
var getUserInfo = '/user/getUserInfo'
var getWorkOrderStatusEnum = '/enum/getWorkOrderStatusEnum'
var getUserOrder = '/workOrder/getUserOrder'
var uploadOrderFile = '/fileInfo/uploadOrderFile'
var addOrderPic = '/pictureInfo/addOrderPic'
var pictureDelete = '/pictureInfo/delete'
var getOrderCosts = '/workOrder/getOrderCosts'
var executingOrder = '/workOrder/executingOrder'
var selectByIdwork = '/workOrder/selectById'
var getAudio = '/fileInfo/getAudio'
var batchAll = '/batch/getBatchByUid'
var getBaseByUid = '/base/getBaseByUid'
var addFeedBackPic = '/pictureInfo/addFeedBackPic'
var base64ToMultipart = '/fileInfo/base64ToMultipart'
var feedBackAdd = '/feedBack/add'
var fileDelete = '/fileInfo/delete'
var getTodayEnv = '/env/getTodayEnv'
var getWarnRecord = '/env/getWarnRecord'
var getOrderIsLocal = '/workOrder/getOrderIsLocal'
var updatePassword = '/user/updatePassword'
var getBaseTreeByUid = '/base/getBaseTreeByUid'
var getUserMenu = '/user/getUserMenu'
var logout = '/user/logout'
var getNormalEnv = '/env/getNormalEnv'
var addillFeedback = '/illFeedback/add'
var illFeedbackList= '/illFeedback/list'
var addIllFeedbackPic= '/pictureInfo/addIllFeedbackPic'
var addCid = '/push/addCid'
var deleteCid = '/push/delete'
var getSequExecuteOrder= '/workOrder/getSequExecuteOrder'
var getfeedBacklists= '/feedBack/list'
var uploadOrderApplyFile= '/fileInfo/uploadOrderApplyFile'
var addOrderApply= '/workOrder/addOrderApply'
var getOrderApply= '/workOrder/getOrderApply'
var getBaseByUidAndEqui = '/base/getBaseByUidAndEqui'

//封装请求
function ajaxs(url, type, datas) {
	return new Promise(function(resolve, reject) {
		mui.ajax(api + url, {
			data: datas,
			dataType: 'json', //服务器返回json格式数据
			type: type, //HTTP请求类型
			timeout: 5000, //超时时间设置为5秒；
			headers: {
				'Content-Type': 'application/json;charset=UTF-8',
				'X-Access-Token': tokens
			},
			success: function(data) {
				resolve(data);
			},
			error: function(xhr, type, errorThrown) {
				reject(xhr);
				var shownetmsg = true;
				console.log(xhr.responseText + " " + xhr.status + " " + xhr.statusText)
				if(xhr.status == 500) {
					var info = JSON.parse(xhr.responseText)
					if(info.message == "Token失效，请重新登录") {
						mui.toast("请登录账号");
						return;
					}
					if(info.message == "鉴权失败，请重新登录") {
						mui.toast("鉴权失败，请重新登录");
						return;
					}
				}
				//if(showwait)
				//appUI.closeWaiting();
				console.log(xhr.status);
				if(type == 'timeout' || type == 'abort') {
					//setRequestMsg("请求超时：请检查网络");
				} else {
					//setRequestMsg("服务器累了");
				}
			}
		});
	})
}

//扩展mui.showLoading
(function($, window) {
	//显示加载框
	$.showLoading = function(message, type) {
		if($.os.plus && type !== 'div') {
			$.plusReady(function() {
				plus.nativeUI.showWaiting(message);
			});
		} else {
			var html = '';
			html += '<i class="mui-spinner mui-spinner-white"></i>';
			html += '<p class="text">' + (message || "数据加载中") + '</p>';

			//遮罩层
			var mask = document.getElementsByClassName("mui-show-loading-mask");
			if(mask.length == 0) {
				mask = document.createElement('div');
				mask.classList.add("mui-show-loading-mask");
				document.body.appendChild(mask);
				mask.addEventListener("touchmove", function(e) {
					e.stopPropagation();
					e.preventDefault();
				});
			} else {
				mask[0].classList.remove("mui-show-loading-mask-hidden");
			}
			//加载框
			var toast = document.getElementsByClassName("mui-show-loading");
			if(toast.length == 0) {
				toast = document.createElement('div');
				toast.classList.add("mui-show-loading");
				toast.classList.add('loading-visible');
				document.body.appendChild(toast);
				toast.innerHTML = html;
				toast.addEventListener("touchmove", function(e) {
					e.stopPropagation();
					e.preventDefault();
				});
			} else {
				toast[0].innerHTML = html;
				toast[0].classList.add("loading-visible");
			}
		}
	};

	//隐藏加载框
	$.hideLoading = function(callback) {
		if($.os.plus) {
			$.plusReady(function() {
				plus.nativeUI.closeWaiting();
			});
		}
		var mask = document.getElementsByClassName("mui-show-loading-mask");
		var toast = document.getElementsByClassName("mui-show-loading");
		if(mask.length > 0) {
			mask[0].classList.add("mui-show-loading-mask-hidden");
		}
		if(toast.length > 0) {
			toast[0].classList.remove("loading-visible");
			callback && callback();
		}
	}
})(mui, window);