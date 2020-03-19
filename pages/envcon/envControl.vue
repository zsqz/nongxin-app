<template>
	<view class="container">
		<tui-loading :visible="isloading"></tui-loading>
		<sl-filter :themeColor="themeColor" :menuList="menuList" @result="result"></sl-filter>
		<scroll-view scroll-x scroll-with-animation class="tab-view" :scroll-left="scrollLeft">
			<view v-for="(item, index) in tabbar" :key="index" class="tab-bar-item" :class="[currentTab == index ? 'active' : '']" :data-current="index" @tap.stop="swichNav">
				<text class="tab-bar-title">{{ item }}</text>
			</view>
		</scroll-view>
		<swiper class="tab-content" :current="currentTab" duration="10" @change="switchTab" :style="{ height: winHeight - 89 + 'px' }">
			<swiper-item v-for="(item, index) in tabbar" :key="index">
				<scroll-view scroll-y class="scoll-y">
					<view class="envcon-box">
						<view class="envcon-top">
							<view style="height: 70rpx;">
								<text style="">
									{{ item }}
									<text v-if="item != '土壤ph值'">({{ getunit(item) }})</text>
								</text>
								<view class="envcon-select" @click="showmodel">
									<text style="margin-left: 46rpx;">{{ selecttext }}</text>
									<image src="../../static/images/envcontrol04.png" class="env-select-img"></image>
								</view>
							</view>
							<view style="width: 100%;height: 448rpx;position: relative;">
								<view class="qiun-charts">
									<canvas :canvas-id="getcanvaid(index)" class="charts" @touchstart="touchLineA"></canvas>
								</view>
								<view class="qiun-nocharts" v-if="!isshowech">
									<image src="../../static/images/img_nodata.png"></image>
									<text>\n暂无数据</text>
								</view>
							</view>
						</view>
						<view class="envcon-bottom">
							<view
								class="envcon-bottombox"
								style="background:linear-gradient(180deg,rgba(243,113,151,1) 0%,rgba(235,72,119,1) 100%);box-shadow:0px 8px 15px rgba(255,46,106,0.3);"
							>
								<image src="../../static/images/envcontrol01.png" class="envcon-img"></image>
								<view><text>{{meantext}}\n最高值</text></view>
								<view style="margin-top: 15rpx;">
									<text v-if="meanvalue.max_value">{{meanvalue.max_value}}{{ getunit(item) }}</text>
									<text v-if="!meanvalue.max_value">暂无数据</text>
								</view>
							</view>
							<view
								class="envcon-bottombox"
								style="background:linear-gradient(180deg,rgba(113,178,243,1) 0%,rgba(113,152,243,1) 100%);box-shadow:0px 8px 15px rgba(21,82,244,0.3);"
							>
								<image src="../../static/images/envcontrol02.png" class="envcon-img"></image>
								<view><text>{{meantext}}\n最低值</text></view>
								<view style="margin-top: 15rpx;">
									<text v-if="meanvalue.min_value">{{meanvalue.min_value}}{{ getunit(item) }}</text>
									<text v-if="!meanvalue.min_value">暂无数据</text>
								</view>
							</view>
							<view
								class="envcon-bottombox"
								style="margin-right: 0rpx;background:linear-gradient(180deg,rgba(81,236,172,1) 0%,rgba(51,220,152,1) 100%);box-shadow:0px 8px 15px rgba(18,209,131,0.3);"
							>
								<image src="../../static/images/envcontrol03.png" class="envcon-img"></image>
								<view><text>{{meantext}}\n平均值</text></view>
								<view style="margin-top: 15rpx;">
									<text v-if="meanvalue.avg_value">{{meanvalue.avg_value}}{{ getunit(item) }}</text>
									<text v-if="!meanvalue.avg_value">暂无数据</text>
								</view>
							</view>
						</view>
					</view>
				</scroll-view>
			</swiper-item>
		</swiper>
		<tui-modal :show="modal" @click="handleClick" @cancel="hide" content="请选择查询天数" :button="button"></tui-modal>
	</view>
</template>

<script>
import slFilter from '@/components/songlazy-sl-filter/sl-filter/sl-filter.vue';
import tuiIcon from '@/components/icon/icon.vue';
import tuiButton from '@/components/thorlUI/button/button.vue';
import tuiModal from '@/components/thorlUI/modal/modal.vue';
import uCharts from '@/js_sdk/u-charts/u-charts/u-charts.js';
import tuiLoading from '@/components/loading/loading.vue';
var _self;
var canvaLineA = null;
export default {
	components: {
		slFilter,
		tuiIcon,
		tuiButton,
		tuiModal,
		tuiLoading
	},
	data() {
		return {
			alldata:{},
			isscroll: true,
			tabbar: ['大气温度', '大气湿度', '土壤温度', '土壤湿度', '光照强度', '降雨量', '土壤ph值', '风速'],
			winHeight: '', //窗口高度
			currentTab: 0, //预设当前项的值
			scrollLeft: 0, //tab标题的滚动条位置
			themeColor: '#FBD855',
			menuList: [
				{
					title: '单选',
					key: 'single',
					isMutiple: false,
					detailTitle: '请选择基地（单选）',
					reflexTitle: true,
					defaultSelectedIndex: 0,
					detailList: []
				}
			],
			baseId: 0,
			modal: false,
			button: [
				{
					text: '当天',
					type: 'green',
					plain: true
				},
				{
					text: '近7天',
					plain: true
				},
				{
					text: '近30天',
					type: 'red',
					plain: true
				}
			],
			selecttext: '当天',
			cWidth: '',
			cHeight: '',
			pixelRatio: 1,
			chartsunit:'',
			chartsname:'',
			savebaseid:0,
			typeId:1,
			meantext:'近7天',
			meanvalue:{},
			isloading:true,
			isshowech:true,
		};
	},
	onLoad: function() {
		let that = this;
		_self = this;
		//  高度自适应
		uni.getSystemInfo({
			success: function(res) {
				let calc = res.windowHeight;
				that.winHeight = calc;
			}
		});
		this.$http.get(this.$appurl.getBaseByUid).then(res => {
			if (res.success) {
				if (res.result.length > 0) {
					this.savebaseid = res.result[0].id;
					this.baseId = res.result[0].id;
					for (let i = 0; i < res.result.length; i++) {
						that.menuList[0].detailList.push({
							title: res.result[i].baseName,
							value: res.result[i].id
						});
					}
					this.createchart();
					this.getspecilal();
				} else {
					that.menuList[0].detailList = [{ title: '暂无基地', value: '-1' }];
					that.isshowech = false
				}
			}
			setTimeout(()=>{
				that.isloading =false
			},2000)
		});
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
			this.cWidth = uni.upx2px(635);
			this.cHeight = uni.upx2px(448);
			this.loadings();
			this.getStrchart();
		},
		// 滚动切换标签样式
		switchTab: function(e) {
			let that = this;
			this.currentTab = e.detail.current;
			this.checkCor();
		},
		// 点击标题切换当前页时改变样式
		swichNav: function(e) {
			let cur = e.currentTarget.dataset.current;
			if (this.currentTab == cur) {
				return false;
			} else {
				this.currentTab = cur;
			}
		},
		//判断当前滚动超过一屏时，设置tab标题滚动条。
		checkCor: function() {
			if (this.currentTab > 2) {
				var left = this.currentTab - 2;
				this.scrollLeft = left * 100;
			} else {
				this.scrollLeft = 0;
			}
			this.getStrchart();
			this.getServerData();
			this.getspecilal();
		},
		result(val) {
			if(val.single==''){
				this.baseId = this.savebaseid
			}else{
				this.baseId =val.single;
			}
			this.loadings();
			this.getspecilal();
		},
		getStrchart(){
			if(this.currentTab==0){
				this.chartsname = '大气温度'
			}else if(this.currentTab==1){
				this.chartsname = '大气湿度'
			}else if(this.currentTab==2){
				this.chartsname = '土壤温度'
			}else if(this.currentTab==3){
				this.chartsname = '土壤湿度'
			}else if(this.currentTab==4){
				this.chartsname = '光照强度'
			}else if(this.currentTab==5){
				this.chartsname = '降雨量'
			}else if(this.currentTab==6){
				this.chartsname = '土壤ph值'
			}else if(this.currentTab==7){
				this.chartsname = '风速'
			}
			this.chartsunit = this.getunit(this.chartsname)
		},
		getunit(val) {
			if (val == '大气温度' || val == '土壤温度') {
				return '°C';
			} else if (val == '大气湿度' || val == '土壤湿度') {
				return '%';
			} else if (val == '光照强度') {
				return 'Lux';
			} else if (val == '降雨量') {
				return 'mm';
			} else if (val == '风速') {
				return 'm/s';
			}else if (val == '土壤ph值') {
				return '';
			}
		},
		hide() {
			this.modal = false;
		},
		handleClick(e) {
			let index = e.index;
			if (index == 0) {
				this.selecttext = '当天';
				this.meantext = '近7天'
				this.typeId = 1;
			} else if (index == 1) {
				this.selecttext = '近7天';
				this.meantext = '近7天'
				this.typeId = 2;
			} else {
				this.selecttext = '近30天';
				this.meantext = '近30天'
				this.typeId = 3;
			}
			this.hide();
			this.loadings();
			this.getspecilal();
		},
		showmodel() {
			this.modal = true;
		},
		loadings(){
			let that = this;
			this.$http.get(this.$appurl.getTodayEnv + '?baseId=' + that.baseId  + '&typeId=' + that.typeId).then(res => {
				if (res.success) {
					that.alldata = res.result
					that.getServerData();
				}
			});
		},
		getServerData() {
			let LineA = { categories: [], series: [] };
			LineA.categories = this.alldata.monitorTime;
			var data = this.getDataType()
			LineA.series = [{ name: this.chartsname, data: data }], 
			this.showLineA('canvasLine'+this.currentTab, LineA);
		},
		showLineA(canvasId, chartData) {
			canvaLineA = new uCharts({
				$this: _self,
				canvasId: canvasId,
				type: 'line',
				fontSize: 11,
				legend: { show: false },
				dataLabel: false,
				dataPointShape: false,
				background: '#FFFFFF',
				pixelRatio: _self.pixelRatio,
				categories: chartData.categories,
				series: chartData.series,
				animation: false,
				xAxis: {
					type: 'grid',
					gridColor: '#FFD0D0',
					gridType: 'dash',
					dashLength: 8,
					labelCount: 3,
					splitNumber:5,
					disableGrid:true,
					axisLineColor:'#FFD0D0'
				},
				yAxis: {
					data:[{
						axisLineColor:'#FFD0D0',
						format: val => {
							return val.toFixed(0);
						}
					}],
					gridType: 'solid',
					gridColor: '#FFD0D0',
					dashLength: 8,
					splitNumber: 5,
					min: 0,
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
		touchLineA(e) {
			let that = this;
			canvaLineA.showToolTip(e, {
				format: function(item, category) {
					return category + ' ' + item.name + ':' + item.data + that.chartsunit;
				}
			});
		},
		getcanvaid(index){
			return "canvasLine"+index
		},
		getDataType(){
			this.isshowech = true
			var data = [];
			if(this.currentTab==0){
				data = this.alldata.airTemperature
			}else if(this.currentTab==1){
				data = this.alldata.airHumidity
			}else if(this.currentTab==2){
				data = this.alldata.soilTemperature
			}else if(this.currentTab==3){
				data = this.alldata.soilHumidity
			}else if(this.currentTab==4){
				data = this.alldata.illIntensity
			}else if(this.currentTab==5){
				data = this.alldata.rainfall
			}else if(this.currentTab==6){
				data = this.alldata.soilPh
			}else if(this.currentTab==7){
				data = this.alldata.windSpeed
			}
			if(data==''){
				this.isshowech = false
			}
			return data;
		},
		getspecilal(){
			var typeIds = null;
			let that = this;
			if(this.typeId==1){
				typeIds = 2
			}else{
				typeIds = this.typeId
			}
			this.$http.get(this.$appurl.getSpecialByTime + '?baseId=' + this.baseId  + '&typeId=' + typeIds + '&index=' + this.currentTab).then(res => {
				if (res.success) {
					that.meanvalue = res.result;
				}
			});
		},
	}
};
</script>

<style>
/*tabbar start*/
::-webkit-scrollbar {
	width: 0;
	height: 0;
	color: transparent;
}

.tab-view::before {
	content: '';
	position: absolute;
	border-bottom: 1upx solid #eaeef1;
	-webkit-transform: scaleY(0.5);
	transform: scaleY(0.5);
	bottom: 0;
	right: 0;
	left: 0;
}

.tab-view {
	width: 100%;
	height: 100upx;
	overflow: hidden;
	box-sizing: border-box;
	position: fixed;
	top: 40px;
	/* #ifdef H5 */
	top: 84px;
	/* #endif */
	left: 0;
	z-index: 99;
	background: #ffffff;
	white-space: nowrap;
}

.tab-bar-item {
	padding: 0;
	height: 100upx;
	min-width: 80upx;
	line-height: 100upx;
	margin: 0 28upx;
	display: inline-block;
	text-align: center;
	box-sizing: border-box;
}

.tab-bar-title {
	height: 100upx;
	line-height: 100upx;
	font-size: 32upx;
	color: #999;
	font-weight: 400;
}

.active {
	border-bottom: 6upx solid #fbd855;
}

.active .tab-bar-title {
	color: black !important;
	font-size: 36upx;
	font-weight: bold;
}

/*tabbar end*/
.scoll-y {
	height: 100%;
}

.list-view {
	margin-top: 100upx;
	width: 100%;
	background: #fff;
	box-sizing: border-box;
	padding-bottom: env(safe-area-inset-bottom);
}

.list-cell {
	padding: 30upx;
	box-sizing: border-box;
}

.cell-title-box {
	display: flex;
	justify-content: space-between;
}

.cell-title {
	font-size: 36upx;
	line-height: 56upx;
	word-break: break-all;
	overflow: hidden;
	text-overflow: ellipsis;
	display: -webkit-box;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 2;
	/* padding-bottom: 30upx; */
}

.img-container {
	width: 100%;
	padding-top: 24upx;
	display: flex;
	height: 160upx;
	justify-content: space-between;
}

.cell-img {
	width: 32%;
	overflow: hidden;
	position: relative;
}

.img {
	width: 100%;
	height: 160upx;
	display: block;
	/* position: absolute;
		  left: 50%;
		  top:50%;
		  transform: translate(-50%,-50%);
		*/
	border-radius: 4upx;
}

.sub-title {
	padding-top: 24upx;
	font-size: 28upx;
	color: #bcbcbc;
	display: flex;
	align-items: center;
}

.badge {
	padding: 5upx 10upx;
	font-size: 24upx;
	border-radius: 4upx;
	margin-right: 20upx;
}

.b-red {
	background: #fcebef;
	color: #8a5966;
}

.b-blue {
	background: #ecf6fd;
	color: #4dabeb;
}

.b-orange {
	background: #fef5eb;
	color: #faa851;
}

.b-green {
	background: #e8f6e8;
	color: #44cf85;
}
.select-tab .select-tab-item {
	width: calc(100%) !important;
}
.envcon-box {
	padding: 40rpx;
	overflow: auto;
}
.envcon-top {
	height: 518rpx;
	padding: 20rpx;
	background: #ffffff;
	border-radius: 30rpx;
	box-shadow: 0px 5px 10px rgba(0, 0, 0, 0.05);
	z-index: 20;
}
.tab-content {
	margin-top: 30px;
	overflow: auto;
}
.envcon-bottom {
	margin-top: 80rpx;
	height: 300rpx;
}
.envcon-bottombox {
	display: inline-block;
	height: 100%;
	width: 172rpx;
	border-radius: 30rpx;
	margin-right: 36rpx;
	position: relative;
	padding-left: 28rpx;
	overflow: auto;
	color: white;
}
.envcon-img {
	height: 54rpx;
	width: 54rpx;
	margin: 32rpx 0rpx 10rpx 0rpx;
}
.envcon-select {
	background: #e5f1ff;
	width: 182rpx;
	height: 54rpx;
	border-radius: 20rpx;
	line-height: 54rpx;
	float: right;
	color: #0074ff;
	position: relative;
}
.env-select-img {
	position: absolute;
	top: 11rpx;
	right: 18rpx;
	width: 32rpx;
	height: 32rpx;
}
.qiun-charts {
	width: 635rpx;
	height: 448rpx;
	background-color: #ffffff;
}
.qiun-nocharts{
	position: absolute;
	width: 635rpx;
	height: 448rpx;
	background-color: #ffffff;
	top: 0px;
	text-align: center;
}
.qiun-nocharts image{
	width: 200rpx;
	height: 200rpx;
	margin: 50rpx 0rpx 20rpx 0rpx;
}
.charts {
	width: 635rpx;
	height: 448rpx;
	background-color: #ffffff;
}
</style>
