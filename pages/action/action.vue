<template>
	<view class="animated fadeIn faster" style="overflow: auto;">
		<loadings v-if="beforeReady"></loadings>
		<view class="titles">功能模块</view>
		<view class="action-box">
			<view class="action-boxs" @click="gopage(item)" v-for="(item,index) in menus" :key='index' :style="{background:colors[index]}">
				<text class="action-content">#{{item}}</text>
				<view class="action-icon">
					<uni-icon type="arrowright" size="28" color="white"/>
				</view>
			</view>
			<!-- <view class="action-boxs" @click="gopage('视频')" style="background: 	#00FF7F;">
				<text class="action-content">视频监控</text>
				<view class="action-icon">
					<uni-icon type="arrowright" size="28" color="white"/>
				</view>
			</view> -->
		</view>
	</view>
</template>

<script>
import loading from '@/common/loadings/loading.js';
import uniIcon from '@/components/uni-icon/uni-icon.vue';
export default {
	mixins: [loading],
	data() {
		return {
			beforeReady: true,
			menus:[],
			colors:['#FE6467','#B164FE','#FF8D60','#60C5FF'],
		};
	},
	onLoad() {
		try {
			this.menus = uni.getStorageSync('menuList');
		} catch (e) {
			// error
		}
	},
	components: {
		uniIcon
	},
	methods: {
		gopage(name){
			if(name=='调查任务'){
				uni.navigateTo({
					url: '../survey/survey'
				});
			}else if(name=='预警任务'){
				uni.navigateTo({
					url: '../warning/warning'
				});
			}else if(name=='环控中心'){
				uni.navigateTo({
					url: '../envcon/envControl'
				});
			}else if(name=='天气预报'){
				uni.navigateTo({
					url: '../weather/weather'
				});
			}else if(name=='视频'){
				uni.navigateTo({
					url: 'testsss'
				});
			}
		}
	}
};
</script>

<style>
page {
	background: white;
}
.titles {
	margin: 66rpx 0rpx 0rpx 40rpx;
	font-size: 22px;
}
.action-box {
	width: 100%;
	margin-top: 78rpx;
}
.action-boxs {
	height: 200rpx;
	border-radius: 20rpx;
	width: 544rpx;
	margin-left: 102rpx;
	margin-bottom: 40rpx;
	background: red;
	line-height: 200rpx;
	color: white;
	position: relative;
	box-shadow:0px 2px 15px rgba(158,175,243,0.2)
}
.action-icon{
	position: absolute;
	right: 18rpx;
	top: 66rpx;
}
.action-content{
	margin-left: 56rpx;
	font-size: 16px;
}
</style>
