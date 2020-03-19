const logins = '/user/login'	//登录
const logout = '/user/logout'	//退出

const getUserOrder = '/workOrder/getUserOrder'	//获取工单

//显示照片
const pictures = "/pictureInfo/show/"
//缩略图
const compression = "/pictureInfo/show/compression/"

//获取用户菜单
const getUserMenu = '/user/getUserMenu'

//工单详情
const addOrderPic = '/pictureInfo/addOrderPic' //上传照片
const pictureDelete = '/pictureInfo/delete'		//删除照片
const uploadOrderFile = '/fileInfo/uploadOrderFile' //上传录音
const getOrderCosts = '/workOrder/getOrderCosts'	//获取费用信息
const selectById = '/farmingItem/selectById'		//获取工单详情
const fileDelete = '/fileInfo/delete'				//删除录音
const executingOrder = '/workOrder/executingOrder'	//执行工单
const getAudio = '/fileInfo/getAudio'				//播放录音
const selectByIdwork = '/workOrder/selectById'		//获取农户反馈详情
const getBaseTreeByUid = '/base/getBaseTreeByUid'	//获取下拉框数据
const getOrderIsLocal = '/workOrder/getOrderIsLocal'	//获取是否需要定位

//环控中心
const getBaseByUid = '/base/getBaseByUid'		//获取所属基地
const getTodayEnv = '/env/getTodayEnv'			//获取echarts数据
const getSpecialByTime = '/env/getSpecialByTime'	//获取平均值

//调查任务
const addFeedBackPic = '/pictureInfo/addFeedBackPic'		//上传巡视照片
const feedBackAdd = '/feedBack/add'							//提交巡视反馈
const illFeedbackList= '/illFeedback/list'					//获取病虫害列表
const addillFeedback = '/illFeedback/add'					//添加病虫害反馈
const addIllFeedbackPic= '/pictureInfo/addIllFeedbackPic'	//上传病虫害照片

//预警任务
const getWarnRecord = '/env/getWarnRecord'			//获取预警列表
const getNormalEnv = '/env/getNormalEnv'			//获取预警详情
const getWarnRecord2   = '/env/getWarnRecord2'

//个人中心
const getUserInfo = '/user/getUserInfo'			//获取用户资料
const updatePassword = '/user/updatePassword'	//修改用户密码

//天气预报
const getAreaByName = '/weather/getAreaByName'		//获取城市
const getWeatherArea = '/weather/getWeatherArea'	//列表获取城市天气情况
const getLocationWeather = '/weather/getLocationWeather'	//定位获取城市天气情况

//推送类
const addCid = '/push/addCid'	//获取app的cid

export default {
	logins,
	logout,
	
	getUserOrder,
	
	pictures,
	compression,
	
	getUserMenu,
	
	addOrderPic,
	pictureDelete,
	uploadOrderFile,
	getOrderCosts,
	selectById,
	fileDelete,
	executingOrder,
	getAudio,
	selectByIdwork,
	getBaseTreeByUid,
	getOrderIsLocal,
	
	getBaseByUid,
	getTodayEnv,
	getSpecialByTime,
	
	addFeedBackPic,
	feedBackAdd,
	illFeedbackList,
	addillFeedback,
	addIllFeedbackPic,
	
	getWarnRecord,
	getNormalEnv,
	getWarnRecord2,
	
	getUserInfo,
	updatePassword,
	
	getAreaByName,
	getWeatherArea,
	getLocationWeather,
	
	addCid
}