<template>
	<view class="qiun-charts">
		<canvas canvas-id="canvasLineA" id="canvasLineA" class="charts" @touchstart="touchLineA"></canvas>
	</view>
</template>

<script>
	import uCharts from '../../js_sdk/u-charts/u-charts/u-charts.js';
	var _self;
	var canvaLineA = null;
	export default {
		data(){
			return{
				cWidth: '',
				cHeight: '',
				pixelRatio: 1
			}
		},
		mounted() {
			_self = this;
			this.createchart();
		},
		methods:{
			createchart() {
				uni.getSystemInfo({
					success: function(res) {
						if (res.pixelRatio > 1) {
							//正常这里给2就行，如果pixelRatio=3性能会降低一点
							//_self.pixelRatio =res.pixelRatio;
							_self.pixelRatio = 2;
						}
					}
				});
				this.cWidth = uni.upx2px(635);
				this.cHeight = uni.upx2px(448);
				this.getServerData();
			},
			getServerData() {
				let that = this;
				this.$http.get(this.$appurl.getBaseByUid).then(res => {
					this.$http.get(this.$appurl.getTodayEnv + '?baseId=' + res.result[0].id + '&typeId=1').then(res => {
						if (res.success) {
							let LineA = { categories: [], series: [] };
							LineA.categories = res.result.monitorTime;
							(LineA.series = [{ name: '大气温度', data: res.result.soilTemperature }]),
							 _self.showLineA('canvasLineA', LineA);
						}
					});
				});
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
					animation: true,
					xAxis: {
						type: 'grid',
						gridColor: '#CCCCCC',
						gridType: 'dash',
						dashLength: 8,
						labelCount: 5,
						splitNumber:5,
						disableGrid:true
					},
					yAxis: {
						gridType: 'dash',
						gridColor: '#CCCCCC',
						dashLength: 8,
						splitNumber: 5,
						min: 0,
						format: val => {
							return val.toFixed(0) + '°C';
						}
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
				canvaLineA.showToolTip(e, {
					format: function(item, category) {
						return category + ' ' + item.name + ':' + item.data;
					}
				});
			},
		}
	}
</script>

<style>
	.qiun-charts {
		width: 635rpx;
		height: 448rpx;
		background-color: #ffffff;
	}
	
	.charts {
		width: 635rpx;
		height: 448rpx;
		background-color: #ffffff;
	}
</style>
