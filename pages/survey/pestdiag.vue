<template>
	<view>
		<view class="contents">
			<view style="position: relative;">
				<image src="../../static/images/survey01.png" class="content-image"></image>
				<text v-if="dataList.user" style="margin-left: 66rpx;" class="content-text">{{dataList.user.realName}}</text>
			</view>
			<view class="content-text" style="color: #666666;margin: 20rpx 0rpx;">
				<text  v-html="getStr(dataList.content)">{{getStr(dataList.content)}}</text>
			</view>
			<view class="square"  v-if="dataList.pictureInfoList!=[]">
				<view class="square-inner flex">
					<view v-for="(list, index) in dataList.pictureInfoList" :key="index" style="height: 245rpx;max-width: 350rpx;" @click="previewImage(index)">
						<image :src="getShow(list.pictureUrl)" style="width: 100%;height: 100%;"></image>
					</view>
				</view>
			</view>
			<view style="color: #999999;">
				<text v-if="dataList.baseInfo">{{dataList.baseInfo.baseName}}</text><text style="float: right;">{{dataList.feedbackTime}}</text>
			</view>
		</view>
		<view class="contents">
			<view style="position: relative;">
				<image src="../../static/images/survey03.png" class="content-image"></image>
				<text style="margin-left: 66rpx;" class="content-text">解决方案</text>
			</view>
			<view v-for="(item,index) in dataList.illFeedbackPlans" :key="index" style="margin-top: 20rpx;">
				<text class="text-color">[病虫害名称]</text>
				<view class="text-sizes"><text>{{item.illName}}</text></view>
				<text class="text-color" style="margin-top: 20rpx;">[治疗方案]</text>
				<view class="text-sizes"><text>{{item.planName}}</text></view>
				<view class="text-sizes" v-html="getStr(item.method)"><text>{{getStr(item.method)}}</text></view>
			</view>
			<view v-if="!dataList.answerContent" style="text-align: center;color: #888888;font-size: 16px;margin-top: 20rpx;">
				<text>暂无回答</text>
			</view>
			<view v-if="dataList.answerContent" style="border-top: 1px solid #EEEEEE;padding-top: 10rpx;">
				<text class="text-color">[备注]</text>
				<view v-html="getStr(dataList.answerContent)" class="text-sizes">{{getStr(dataList.answerContent)}}</view>
			</view>
			<view style="text-align: right;color: #999999;" v-if="dataList.answerTime"><text>{{dataList.answerTime}}</text></view>
		</view>
	</view>
</template>

<script>
	export default {
		data(){
			return{
				dataList: {},
				pictureUrlList:[],
				farmpicList:[],
			}
		},
		onLoad(options){
			let that = this;
			var data = JSON.parse(options.datas); // 字符串转对象
			this.dataList = data;
			this.farmpicList = this.dataList.pictureInfoList;
			if (that.farmpicList != '' || that.farmpicList != []) {
				for (let index in that.farmpicList) {
					that.pictureUrlList.push(that.$http.common.baseUrl + that.$appurl.pictures + that.farmpicList[index].pictureUrl);
				}
			}
		},
		methods:{
			getStr(str) {
				if (str != undefined) {
					str = str.replace(/\r\n/g, '<br>');
					str = str.replace(/\n/g, '<br>');
					str = str.replace(/\s/g, '&nbsp;');
					return str;
				}
			},
			getShow(url) {
				return this.$http.common.baseUrl + this.$appurl.pictures + url;
			},
			previewImage(i) {
				// 预览图片
				uni.previewImage({
					current: this.pictureUrlList[i],
					urls: this.pictureUrlList,
					loop: 'true',
					indicator: 'default'
				});
			},
		}
	}
</script>

<style>
	page{
		background: #F1F1F2;
		font-size: 14px;
	}
	.contents{
		background: white;
		margin-top: 10rpx;
		padding: 20rpx 48rpx;
	}
	.content-image{
		height: 44rpx;
		width: 44rpx;
		position: absolute;
		top: 5rpx;
		left: 0rpx;
	}
	.content-text{
		font-size: 16px;
		color: #333333;
	}
	.content-texts{
		font-size: 14px;
	}
	.text-color{
		color: #999999;
	}
	.text-sizes{
		font-size: 14px;
	}
	.square {
		margin: 40rpx 0rpx;
	}
	
	.square-inner {
		/* 铺满父元素容器，这时候宽高就始终相等了 */
		padding: 0px;
		margin-bottom: 0px;
		position: relative;
	}
	
	.square-inner > view {
		width: calc(97% / 3);
		/* calc里面的运算符两边要空格 */
		height: calc(97% / 3);
		margin-right: 1.5%;
		margin-bottom: 1.5%;
		overflow: hidden;
	}
	
	.flex {
		display: flex;
		flex-wrap: wrap;
	}
	
	.flex > view {
		flex-grow: 1;
		/* 子元素按1/n的比例进行拉伸 */
		text-align: center;
		color: #fff;
		font-size: 50px;
		line-height: 2;
		position: relative;
		overflow: hidden;
	}
	
	.flex > view:nth-of-type(3n) {
		/* 选择个数是3的倍数的元素 */
		margin-right: 0;
	}
	
	.flex > view:nth-of-type(n + 6) {
		/* 选择倒数的三个元素，n可以取0 */
		margin-bottom: 0;
	}
	.img-box-src {
		display: block;
		transform: translate(-50%, -50%);
		position: absolute;
		top: 50%;
		left: 50%;
		height: 110%;
		width: 100%;
	}
</style>
