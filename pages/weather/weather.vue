<template>
	<view id="weathers" :style="weatherbg">
		<tui-loading :visible="isloading" :text="texts"></tui-loading>
		<view class="mask" v-if="isloading"></view>
		<tui-tips position="center" ref="toast"></tui-tips>
		<view class="header-nav texts-col">
			<view class="header-nav-content"><uni-icon color="white" type="arrowleft" size="30" @click="back()" /></view>
			<view class="header-boxs">
				<navigator :url="geturl()">
					<view class="header-boxstop">
						<image src="../../static/images/weather01.png"></image>
						<text style="margin-left: 35rpx;">{{ districts }}</text>
					</view>
				</navigator>
				<view class="header-boxwen">
					<text v-if="now">{{ now.airTem }}°C</text>
					<text v-if="!now"></text>
				</view>
				<view class="header-boxriqi">
					<text>{{ datetime }}</text>
				</view>
				<view class="header-boxtianqi">
					<text>{{ now.weather }}</text>
				</view>
				<view class="header-boxdushu" v-if="now">
					<text>湿度 {{ now.airHum }}\n</text>
					<text>{{ now.windDirection }} {{ now.windPower }}</text>
				</view>
			</view>
		</view>
		<view class="header-cen texts-col">
			<scroll-view scroll-x scroll-with-animation class="tab-view">
				<view v-for="(item, index) in weatherHour" :key="index" class="tab-bar-item">
					<view style="margin-top: 10rpx;">
						<text class="tab-bar-title" v-if="index == 0">现在</text>
						<text class="tab-bar-title" v-if="index != 0">{{ item.time }}</text>
						<view class="tab-bar-img"><image :src="getimgs(item.weatherCode)" style="width: 50rpx;height: 45rpx;"></image></view>
					</view>
				</view>
			</scroll-view>
		</view>
		<view class="header-bottom">
			<view class="header-bottomblur" :style="weatherbg"></view>
			<view style="margin: 0rpx 30rpx;">
				<view class="bottom-riqi">
					<view v-for="(item, index) in weatherDay" :key="index" class="bottom-riqiList">
						<view class="texts-col">{{ getriqi(index, item.day) }}</view>
						<view class="texts-col">{{ getxingqi(item.day) }}</view>
						<view><image :src="getimgstr(item.dayWeather)" style="width: 50rpx;height: 45rpx;"></image></view>
						<view class="texts-col">{{ item.dayWeather }}</view>
					</view>
				</view>
				<view class="bottom-uchars">
					<view class="qiun-charts"><canvas canvas-id="canvasLine" class="charts"></canvas></view>
				</view>
				<view class="bottom-nriqi">
					<view v-for="(item, index) in weatherDay" :key="index" class="bottom-nriqiList">
						<view><image :src="getimgstr(item.nightWeather)" style="width: 55rpx;height: 45rpx;"></image></view>
						<view class="texts-col">{{ item.nightWeather }}</view>
						<view class="texts-col">{{ windDirection(item.nightWindDirection) }}</view>
						<view class="texts-col">{{ windPowers(item.nightWindPower) }}</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import uniIcon from '@/components/uni-icon/uni-icon.vue';
import tuiLoading from '@/components/loading/loading.vue';
import uCharts from '@/js_sdk/u-charts/u-charts/u-charts.js';
import tuiTips from '@/components/messtips/messtips.vue';
var _self;
var canvaLineA = null;
export default {
	components: {
		uniIcon,
		tuiLoading,
		tuiTips
	},
	data() {
		return {
			isloading: false,
			province: '',
			citys: '',
			districts: '',
			scrollLeft: 0, //tab标题的滚动条位置
			tabbar: ['17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00', '24:00', '01:00'],
			now: {},
			weatherHour: {},
			weatherDay: {},
			datetime: '',
			daytempData: [],
			nighttempData: [],
			chartsname: '',
			chartsnames: '',
			pixelRatio: 1,
			weatherbg: '',
			texts: '查找城市天气中...',
			addressList: [],
			address: ''
		};
	},
	onLoad() {
		let that = this;
		_self = this;
		this.$eventHub.$on('emit', data => {
			setTimeout(() => {
				that.getWeatherArea(data, 2);
				that.districts = data;
			}, 350);
		});
		this.$eventHub.$on('emits', data => {
			setTimeout(() => {
				that.getWeatherArea(data.areaCode, 1);
				var districts = data.citys.split('·')[0];
				that.districts = districts;
			}, 350);
		});
		this.createchart();
		// uni.getLocation({
		// 	type: 'wgs84',
		// 	success: function(res) {
		// 		var point = new plus.maps.Point(res.longitude, res.latitude);
		// 		plus.maps.Map.reverseGeocode(
		// 			point,
		// 			{},
		// 			function(event) {
		// 				var address = event.address; // 转换后的地理位置
		// 				var point = event.coord; // 转换后的坐标信息
		// 				var coordType = event.coordType; // 转换后的坐标系类型
		// 				var reg = /.+?(省|市|自治区|自治州|县|区)/g;
		// 				var str = address.match(reg);
		// 				_self.addressList = address
		// 					.match(reg)
		// 					.toString()
		// 					.split(',');
		// 				_self.address = _self.addressList[1];
		// 				that.districts = _self.addressList[2];
		// 				that.citys = _self.addressList[1];
		// 				that.province = _self.addressList[0];
		// 				that.getLocationWeather(str);
		// 			},
		// 			function(e) {}
		// 		);
		// 	}
		// });
		uni.getLocation({
			type: 'gcj02',
			geocode: 'true',
			success: function(res) {
				that.districts = res.address.district;
				that.citys = res.address.city;
				that.province = res.address.province;
				var str = that.province + ',' + that.citys + ',' + that.districts;
				console.log(str)
				that.getLocationWeather(str);
			}
		});
		this.datetime = this.getDates();
	},
	methods: {
		createchart() {
			//#ifdef MP-ALIPAY
			uni.getSystemInfo({
				success: function(res) {
					if (res.pixelRatio > 1) {
						//正常这里给2就行，如果pixelRatio=3性能会降低一点
						//_self.pixelRatio =res.pixelRatio;
						_self.pixelRatio = 2;
					}
				}
			});
			//#endif
			this.cWidth = uni.upx2px(685);
			this.cHeight = uni.upx2px(358);
		},
		getLocationWeather(data) {
			let that = this;
			that.isloading = true;
			var datas = '';
			datas = encodeURI(data);
			this.$http.get(this.$appurl.getLocationWeather + '?fullName=' + datas).then(res => {
				if (res.success) {
					this.now = res.result.now;
					this.weatherHour = res.result.weatherHour;
					this.weatherDay = res.result.weatherDay;
					for (let index in this.weatherDay) {
						this.daytempData.push(this.weatherDay[index].dayAirTemperature);
						this.nighttempData.push(this.weatherDay[index].nightAirTemperature);
					}
					this.getweatherbg();
					this.getServerData();
				}
			});
		},
		getWeatherArea(data, leves) {
			let that = this;
			that.isloading = true;
			this.daytempData = [];
			this.nighttempData = [];
			var url = '';
			if (leves == 2) {
				var datas = '';
				datas = encodeURI(data);
				url = '?areaName=' + datas + '&areaLevel=' + 2;
			} else if (leves == 1) {
				url = '?areaCode=' + data;
			}
			this.$http.get(this.$appurl.getWeatherArea + url).then(res => {
				if (res.success) {
					if (!res.result.now&&!res.result.weatherHour&&!res.result.weatherDay) {
						let options = {
							msg: '暂无该城市天气数据',
							duration: 3000,
							type: 'danger'
						};
						that.$refs.toast.showTips(options);
					}
					this.now = res.result.now;
					this.weatherHour = res.result.weatherHour;
					this.weatherDay = res.result.weatherDay;
					for (let index in this.weatherDay) {
						this.daytempData.push(this.weatherDay[index].dayAirTemperature);
						this.nighttempData.push(this.weatherDay[index].nightAirTemperature);
					}
					this.getweatherbg();
					this.getServerData();
				}
				this.isloading = false;
			});
		},
		getweatherbg() {
			if (this.now.weather == '晴') {
				this.weatherbg = 'background-image: url(../../static/images/weather-bg01.png);';
			} else if (this.now.weather == '多云') {
				this.weatherbg = 'background-image: url(../../static/images/weather-bg02.png);';
			} else if (this.now.weather == '阴') {
				this.weatherbg = 'background-image: url(../../static/images/weather-bg03.png);';
			} else if (this.now.weather.indexOf('雨') != -1) {
				this.weatherbg = 'background-image: url(../../static/images/weather-bg04.png);';
			} else if (this.now.weather.indexOf('雪') != -1) {
				this.weatherbg = 'background-image: url(../../static/images/weather-bg05.png);';
			} else {
				this.weatherbg = 'background-image: url(../../static/images/weather-bg06.png);';
			}
			let that = this;
			setTimeout(function() {
				that.isloading = false;
			}, 1500);
		},
		getServerData() {
			let LineA = { categories: [], series: [] };
			LineA.categories = [' ', ' ', ' ', ' ', ' ', ' '];
			(LineA.series = [
				{
					name: this.chartsname,
					data: this.daytempData,
					textColor: 'white',
					format: val => {
						return val + '°C';
					}
				},
				{
					name: this.chartsnames,
					data: this.nighttempData,
					textColor: 'white',
					format: val => {
						return val + '°C';
					}
				}
			]),
				this.showLineA('canvasLine', LineA);
		},
		showLineA(canvasId, chartData) {
			canvaLineA = new uCharts({
				$this: _self,
				canvasId: canvasId,
				legend: { show: false },
				type: 'line',
				colors: ['#FFA200', '#00DCFF'],
				textColor: ['white', 'white'],
				fontSize: 11,
				padding: [30, 0, 0, 0],
				dataLabel: true,
				dataPointShape: true,
				background: '#FFFFFF',
				pixelRatio: _self.pixelRatio,
				categories: chartData.categories,
				series: chartData.series,
				animation: false,
				xAxis: {
					type: 'grid',
					gridColor: '#CCCCCC',
					gridType: 'dash',
					dashLength: 8,
					disableGrid: true,
					disabled: true,
					axisLineColor: '#ffffff',
					fontColor: '#CECBCB',
					axisLine: false
				},
				yAxis: {
					gridType: 'dash',
					gridColor: '#CCCCCC',
					dashLength: 8,
					disableGrid: true,
					disabled: true
				},
				width: _self.cWidth * _self.pixelRatio,
				height: _self.cHeight * _self.pixelRatio,
				extra: {
					line: {
						type: 'straight'
					}
				}
			});
		},
		back() {
			uni.navigateBack({});
		},
		getDates() {
			var myDate = new Date();
			var month = myDate.getMonth() + 1;
			var date = myDate.getDate();
			var str = '星期' + '日一二三四五六'.charAt(new Date().getDay());
			return month + '月' + date + '日' + '  ' + str;
		},
		getriqi(index, day) {
			if (index == 0) {
				return '今天';
			} else if (index == 1) {
				return '明天';
			} else {
				return '周' + '日一二三四五六'.charAt(this.parserDate(day).getDay());
			}
		},
		getxingqi(day) {
			return day.split('-')[1] + '月' + day.split('-')[2] + '日';
		},
		windPowers(item) {
			return item.split(' ')[0];
		},
		windDirection(item) {
			if (item == '无持续风向') {
				return '微风';
			}
			return item;
		},
		parserDate(date) {
			var t = Date.parse(date);
			if (!isNaN(t)) {
				return new Date(Date.parse(date.replace(/-/g, '/')));
			} else {
				return new Date();
			}
		},
		getimgs(code) {
			return '../../static/weather-icon/' + code + '.png';
		},
		getimgstr(code) {
			var codes = this.getcodes(code);
			return '../../static/weather-icon/' + codes + '.png';
		},
		getcodes(code) {
			var codes = '';
			switch (code) {
				case '晴':
					codes = '00';
					break;
				case '多云':
					codes = '01';
					break;
				case '阴':
					codes = '02';
					break;
				case '阵雨':
					codes = '03';
					break;
				case '雷阵雨':
					codes = '04';
					break;
				case '雷阵雨伴有冰雹':
					codes = '05';
					break;
				case '雨夹雪':
					codes = '06';
					break;
				case '小雨':
					codes = '07';
					break;
				case '中雨':
					codes = '08';
					break;
				case '大雨':
					codes = '09';
					break;
				case '暴雨':
					codes = '10';
					break;
				case '大暴雨':
					codes = '11';
					break;
				case '特大暴雨':
					codes = '12';
					break;
				case '阵雪':
					codes = '13';
					break;
				case '小雪':
					codes = '14';
					break;
				case '中雪':
					codes = '15';
					break;
				case '大雪':
					codes = '16';
					break;
				case '暴雪':
					codes = '17';
					break;
				case '雾':
					codes = '18';
					break;
				case '冻雨':
					codes = '19';
					break;
				case '沙尘暴':
					codes = '20';
					break;
				case '小到中雨':
					codes = '21';
					break;
				case '中到大雨':
					codes = '22';
					break;
				case '大到暴雨':
					codes = '23';
					break;
				case '暴雨到大暴雨':
					codes = '24';
					break;
				case '大暴雨到特大暴雨':
					codes = '25';
					break;
				case '小到中雪':
					codes = '26';
					break;
				case '中到大雪':
					codes = '27';
					break;
				case '大到暴雪':
					codes = '27';
					break;
				case '浮尘':
					codes = '28';
					break;
				case '扬沙':
					codes = '30';
					break;
				case '强沙尘暴':
					codes = '31';
					break;
				case '霾':
					codes = '53';
					break;
				case '无':
					codes = '99';
					break;
				case '雨':
					codes = '301';
					break;
				case '雪':
					codes = '302';
					break;
			}
			return codes;
		},
		geturl() {
			return 'selectCity?city=' + this.citys;
		}
	}
};
</script>

<style>
#weathers {
	background-repeat: no-repeat;
	background-size: 100% 100%;
	position: relative;
	height: 100vh;
}
.mask {
	position: fixed;
	top: 0;
	left: 0;
	z-index: 999;
	width: 100%;
	height: 100vh;
	background: rgba(255, 255, 255, 0.5);
}
.header-nav {
	height: 440rpx;
	width: 100%;
	position: relative;
}
.header-nav image {
	position: absolute;
	width: 100%;
	height: 440rpx;
	z-index: 1;
}
.header-nav-content {
	position: absolute;
	top: 74rpx;
	left: 40rpx;
}
.header-boxs {
	width: 288rpx;
	height: 440rpx;
	margin: 0 auto;
}
.header-boxstop {
	padding-top: 90rpx;
	text-align: center;
	position: relative;
	font-size: 12px;
}
.header-boxstop image {
	width: 22rpx;
	height: 30rpx;
}
.header-boxwen {
	font-size: 24px;
	text-align: center;
	height: 106rpx;
	width: 100%;
	line-height: 106rpx;
}
.header-boxriqi {
	font-size: 12px;
	text-align: center;
}
.header-boxtianqi {
	text-align: center;
	height: 80rpx;
	line-height: 80rpx;
	font-size: 14px;
}
.header-boxdushu {
	text-align: center;
	font-size: 12px;
	height: 40rpx;
	line-height: 40rpx;
	overflow: hidden;
}
.header-boxdushu text {
	height: 40rpx;
	line-height: 40rpx;
	position: relative;
	animation: myfirst 4s infinite;
	text-align: center;
}
@keyframes myfirst {
	0% {
		top: 0px;
	}
	50% {
		top: 0rpx;
	}
	75% {
		top: -40rpx;
	}
	100% {
		top: -40rpx;
	}
}
.header-cen {
	width: 670rpx;
	height: 140rpx;
	margin-top: 10rpx;
	padding: 0rpx 40rpx;
	position: relative;
	overflow: hidden;
}
.header-cen:before {
	content: '';
	position: absolute;
	top: 0;
	right: 0;
	bottom: 0;
	left: 0;
	background: white;
	opacity: 0.3;
}
.header-bottom {
	height: 838rpx;
	margin: 20rpx 0rpx 0rpx 0rpx;
	width: 750rpx;
	position: relative;
	background-attachment: fixed;
	overflow: hidden;
}
.header-bottomblur {
	height: 100%;
	width: 130%;
	position: absolute;
	left: -10rpx;
	background-repeat: no-repeat;
	background-position: 0 -588rpx;
	background-size: 100% 1426rpx;
	filter: contrast(80%) blur(2px);
}
.tab-view {
	width: 100%;
	height: 100%;
	overflow: hidden;
	box-sizing: border-box;
	z-index: 99;
	white-space: nowrap;
}
.tab-bar-item {
	display: inline-block;
	text-align: center;
	box-sizing: border-box;
	height: 100%;
	width: 110rpx;
	margin-right: 30rpx;
}
.bottom-riqi {
	height: 230rpx;
	width: 100%;
	display: flex;
}
.bottom-riqiList {
	flex: 1;
	position: relative;
}
.bottom-riqiList view:first-child {
	height: 72rpx;
	width: 109.66rpx;
	text-align: center;
	line-height: 72rpx;
	z-index: 9;
}
.bottom-riqiList view:nth-child(2) {
	font-size: 12px;
	width: 109.66rpx;
	text-align: center;
}
.bottom-riqiList view:nth-child(3) {
	height: 80rpx;
	width: 109.66rpx;
	text-align: center;
	display: table-cell;
	vertical-align: middle;
}
.bottom-riqiList view:nth-child(4) {
	width: 109.66rpx;
	text-align: center;
}
.bottom-uchars {
	height: 358rpx;
	width: 100%;
}
.qiun-charts {
	height: 358rpx;
	width: 100%;
}
.charts {
	height: 358rpx;
	width: 100%;
	background: rgba(0, 0, 0, 0);
}
.bottom-nriqi {
	width: 100%;
	height: 200rpx;
	display: flex;
}
.bottom-nriqiList {
	flex: 1;
	position: relative;
}
.bottom-nriqiList view:first-child {
	height: 80rpx;
	width: 109.66rpx;
	text-align: center;
	display: table-cell;
	vertical-align: middle;
}
.bottom-nriqiList view:nth-child(2) {
	width: 109.66rpx;
	text-align: center;
}
.bottom-nriqiList view:nth-child(3) {
	width: 109.66rpx;
	text-align: center;
}
.bottom-nriqiList view:nth-child(4) {
	width: 109.66rpx;
	text-align: center;
}
.texts-col {
	color: white;
}
.tab-bar-img {
	width: 110rpx;
	height: 80rpx;
	display: table-cell;
	vertical-align: middle;
}
</style>
