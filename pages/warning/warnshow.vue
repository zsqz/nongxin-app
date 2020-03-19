<template>
	<view>
		<view class="header-nav main-bg-color">
			<view class="header-nav-content">
				<uni-icon type="arrowleft" size="28" @click="back()" style="position: absolute;left: 20rpx;top: 120rpx;" />
				<view style="width: 90%;display: inline-block;padding: 0rpx 15rpx;">
					<text style="font-size: 18px;">{{ optiondata.baseName }}</text>
				</view>
			</view>
		</view>
		<view class="content-box">
			<view class="content-boxtitle">
				<image src="../../static/images/warnshow01.png" class="content-boximg"></image>
				<text>{{ alldata.monitorTime }}</text>
			</view>
			<view style="padding: 0rpx 26rpx;">
				<view class="warn-box" v-for="(item, index) in warnDatas" :key="index">
					<view class="warn-boxs" :class="getColor(item.content) ? 'colorBlue' : 'colorRed'">
						<text>{{ getString(item.content) }}&nbsp;&nbsp;{{ item.value }}{{ item.unit }}{{ getStr(item.content) }}</text>
					</view>
					<view class="warn-boxs" style="flex: 1.2;">
						<text>对照范围:&nbsp;&nbsp;{{ item.contrastVo.lowValue }}{{ item.unit }}-{{ item.contrastVo.highValue }}{{ item.unit }}</text>
					</view>
				</view>
				<view class="warn-box" v-for="(item, index) in normaldata" :key="index">
					<view class="warn-boxs">
						<text>{{ getTitle(item.text) }}&nbsp;&nbsp;{{ item.value }}{{ getUnit(item.text) }}</text>
					</view>
					<view class="warn-boxs" style="flex: 1.2;">
						<text>对照范围:&nbsp;&nbsp;{{ item.warnEnv.lowValue }}{{ getUnit(item.text) }}-{{ item.warnEnv.highValue }}{{ getUnit(item.text) }}</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import uniIcon from '@/components/uni-icon/uni-icon.vue';
export default {
	components: {
		uniIcon
	},
	data() {
		return {
			optiondata: {},
			alldata: {},
			normaldata: [],
			warnDatas: []
		};
	},
	onLoad(options) {
		let that = this;
		var data = JSON.parse(options.datas); // 字符串转对象
		that.optiondata = data;
		var time = data.warnTime;
		time = encodeURIComponent(time);
		that._loading(time);
	},
	methods: {
		_loading(time) {
			let that = this;
			this.$http.get(this.$appurl.getNormalEnv + '?baseId=' + that.optiondata.baseId + '&time=' + time).then(res => {
				if (res.success) {
					that.warnDatas = res.result.warnRecordList;
					that.alldata = res.result;
					for (let index in that.alldata) {
						if (
							index != 'monitorTime' &&
							index != 'equipmentId' &&
							index != 'factoryId' &&
							index != 'warnEnv' &&
							index != 'warnRecordList' &&
							index != 'windDirection'
						) {
							if (index == 'airTemperature') {
								that.normaldata.push({
									text: index,
									value: that.alldata[index],
									warnEnv: {
										lowValue: that.alldata.warnEnv.minairtemperature,
										highValue: that.alldata.warnEnv.maxairtemperature
									}
								});
							} else if (index == 'airHumidity') {
								that.normaldata.push({
									text: index,
									value: that.alldata[index],
									warnEnv: {
										lowValue: that.alldata.warnEnv.minairhumidity,
										highValue: that.alldata.warnEnv.maxairhumidity
									}
								});
							} else if (index == 'soilTemperature') {
								that.normaldata.push({
									text: index,
									value: that.alldata[index],
									warnEnv: {
										lowValue: that.alldata.warnEnv.minsoiltemperature,
										highValue: that.alldata.warnEnv.maxsoiltemperature
									}
								});
							} else if (index == 'soilHumidity') {
								that.normaldata.push({
									text: index,
									value: that.alldata[index],
									warnEnv: {
										lowValue: that.alldata.warnEnv.minsoilhumidity,
										highValue: that.alldata.warnEnv.maxsoilhumidity
									}
								});
							} else if (index == 'soilPh') {
								that.normaldata.push({
									text: index,
									value: that.alldata[index],
									warnEnv: {
										lowValue: that.alldata.warnEnv.minsoilph,
										highValue: that.alldata.warnEnv.maxsoilph
									}
								});
							} else if (index == 'illIntensity') {
								that.normaldata.push({
									text: index,
									value: that.alldata[index],
									warnEnv: {
										lowValue: that.alldata.warnEnv.minillIntensity,
										highValue: that.alldata.warnEnv.maxillIntensity
									}
								});
							} else if (index == 'rainfall') {
								that.normaldata.push({
									text: index,
									value: that.alldata[index],
									warnEnv: {
										lowValue: that.alldata.warnEnv.minrainfall,
										highValue: that.alldata.warnEnv.maxrainfall
									}
								});
							} else if (index == 'co2Value') {
								that.normaldata.push({
									text: index,
									value: that.alldata[index],
									warnEnv: {
										lowValue: that.alldata.warnEnv.minco2,
										highValue: that.alldata.warnEnv.maxco2
									}
								});
							} else if (index == 'pm25Value') {
								that.normaldata.push({
									text: index,
									value: that.alldata[index],
									warnEnv: {
										lowValue: that.alldata.warnEnv.minpm25,
										highValue: that.alldata.warnEnv.maxpm25
									}
								});
							} else if (index == 'pm10Value') {
								that.normaldata.push({
									text: index,
									value: that.alldata[index],
									warnEnv: {
										lowValue: that.alldata.warnEnv.minpm10,
										highValue: that.alldata.warnEnv.maxpm10
									}
								});
							} else if (index == 'windSpeed') {
								that.normaldata.push({
									text: index,
									value: that.alldata[index],
									warnEnv: {
										lowValue: that.alldata.warnEnv.minwindspeed,
										highValue: that.alldata.warnEnv.maxwindspeed
									}
								});
							} else if (index == 'soilEc') {
								that.normaldata.push({
									text: index,
									value: that.alldata[index],
									warnEnv: {
										lowValue: that.alldata.warnEnv.minsoilec,
										highValue: that.alldata.warnEnv.maxsoilec
									}
								});
							} else if (index == 'soilS') {
								that.normaldata.push({
									text: index,
									value: that.alldata[index],
									warnEnv: {
										lowValue: that.alldata.warnEnv.minsoils,
										highValue: that.alldata.warnEnv.maxsoils
									}
								});
							}
						}
					}

					var repeAll = [];

					for (var i = 0; i < that.warnDatas.length; i++) {
						for (var j = 0; j < that.normaldata.length; j++) {
							if (that.warnDatas[i].type == that.normaldata[j].text) {
								repeAll.push(j);
							}
						}
					}

					var dataSave = [];

					for (var index = 0; index < repeAll.length; index++) {
						dataSave.push(that.normaldata[repeAll[index]]);
					}

					that.normaldata = that.array_diff(that.normaldata, dataSave);
				}
			});
		},
		back() {
			uni.navigateBack({});
		},
		getUnit(title) {
			var units = '';
			switch (title) {
				case 'airTemperature':
					units = '°C';
					break;
				case 'soilTemperature':
					units = '°C';
					break;
				case 'airHumidity':
					units = '%';
					break;
				case 'airPressure':
					units = 'kpa';
					break;
				case 'windSpeed':
					units = 'm/s';
					break;
				case 'co2Value':
					units = 'ppm';
					break;
				case 'pm25Value':
					units = 'ug/ms';
					break;
				case 'pm10Value':
					units = 'ug/ms';
					break;
				case 'soilEc':
					units = 'uS/cm';
					break;
				case 'soilS':
					units = 'ppm';
					break;
				case 'soilHumidity':
					units = '%';
					break;
				case 'soilPh':
					units = ' ';
					break;
				case 'rainfall':
					units = 'mm';
					break;
				case 'illIntensity':
					units = 'Lux';
					break;
			}
			return units;
		},
		getTitle(title) {
			var titles = '';
			switch (title) {
				case 'airTemperature':
					titles = '空气温度:';
					break;
				case 'airHumidity':
					titles = '空气湿度:';
					break;
				case 'airPressure':
					titles = '大气压力:';
					break;
				case 'windSpeed':
					titles = '风速:';
					break;
				case 'co2Value':
					titles = '二氧化碳浓度:';
					break;
				case 'pm25Value':
					titles = 'PM2.5浓度:';
					break;
				case 'pm10Value':
					titles = 'PM10浓度:';
					break;
				case 'soilTemperature':
					titles = '土壤温度:';
					break;
				case 'soilHumidity':
					titles = '土壤湿度:';
					break;
				case 'soilPh':
					titles = '土壤PH值:';
					break;
				case 'soilEc':
					titles = '土壤EC值:';
					break;
				case 'soilS':
					titles = '土壤盐分:';
					break;
				case 'rainfall':
					titles = '雨量:';
					break;
				case 'illIntensity':
					titles = '光照强度:';
					break;
			}
			return titles;
		},
		getColor(str) {
			var strs = str.slice(-2);
			if (strs == '偏低') {
				return true;
			} else {
				return false;
			}
		},
		getString(str) {
			var strs = str.slice(0, -2) + ':';
			return strs;
		},
		getStr(str) {
			var strs = str.slice(-2);
			if (strs == '偏低') {
				return '↓';
			} else {
				return '↑';
			}
		},
		array_diff(a, b) {
			for (var i = 0; i < b.length; i++) {
				for (var j = 0; j < a.length; j++) {
					if (a[j].text == b[i].text) {
						a.splice(j, 1);
						j = j - 1;
					}
				}
			}
			return a;
		}
	}
};
</script>

<style>
.header-nav {
	height: 370rpx;
	width: 100%;
}
.header-nav-content {
	padding-top: 114rpx;
	padding-left: 48rpx;
	position: relative;
	text-align: center;
}
.content-box {
	margin: -124rpx 20rpx 0rpx 20rpx;
	background: white;
	border-radius: 20rpx;
}
.content-boximg {
	height: 40rpx;
	width: 40rpx;
	position: absolute;
	left: 120rpx;
	top: 40rpx;
}
.content-boxtitle {
	position: relative;
	width: 100%;
	text-align: center;
	line-height: 124rpx;
	height: 124rpx;
}
.warn-box {
	height: 74rpx;
	border-bottom: 1px solid #eeeeee;
	margin-bottom: 40rpx;
	display: flex;
}
.warn-boxs {
	flex: 1;
	font-size: 12px;
}
.colorBlue {
	color: #2b95ff;
}
.colorRed {
	color: red;
}
</style>
