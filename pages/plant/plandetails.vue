<template>
	<view style="background: white;padding: 20rpx">
		<view style="margin-top: 10rpx;" v-html="getStr(datasAll.method)">{{getStr(datasAll.method)}}</view>
		<view style="padding-bottom: 100rpx;" v-if="pictureInfoList!=''">
			<view class="box-imgView" v-for="(list,index) in pictureInfoList" :key="index" @click="imageTap(index)">
				<image :src="getShows(list.pictureUrl)"></image>
				<image :src="getShow(list.pictureUrl)" class="box-images"></image>
			</view>
		</view>
		<button class="buttons main-bg-color" type="primary" @click="gotasks">执行工单</button>
	</view>
</template>
<script>
	export default {
		data() {
			return {
				orderid: -1,
				farmId: -1,
				datasAll: {},
				pictureInfoList: [],
				pictureUrlList: [],
			}
		},
		methods: {
			getStr(str) {
				if (str != undefined) {
					str = str.replace(/\r\n/g, "<br>")
					str = str.replace(/\n/g, "<br>");
					str = str.replace(/\s/g, "&nbsp;");
					return str;
				}
			},
			getShow(url) {
				return this.$http.common.baseUrl + this.$appurl.pictures + url;
			},
			getShows(url) {
				return this.$http.common.baseUrl + this.$appurl.compression + url + "/100/100";
			},
			gotasks() {
				uni.navigateTo({
					url: '../plant/tasks?id=' + this.orderid + "&farmId=" + this.farmId
				});
			},
			imageTap(i) { // 图片点击事件
				this.previewImage(i);
			},
			previewImage(i) { // 预览图片
				uni.previewImage({
					current: this.pictureUrlList[i],
					urls: this.pictureUrlList,
					loop: "true",
					indicator:'default'
				})
			},
		},
		onLoad: function(option) {
			let that = this;
			this.orderid = option.id;
			this.farmId = option.farmId;
			this.$http.get(this.$appurl.selectById + "?id=" + this.farmId).then((res) => {
				if (res.success) {
					this.datasAll = res.result;
					if (res.result.pictureInfoList != "" && res.result.pictureInfoList != []) {
						that.pictureInfoList = res.result.pictureInfoList;
						for (let index in that.pictureInfoList) {
							that.pictureUrlList.push(this.$http.common.baseUrl + this.$appurl.pictures + that.pictureInfoList[index].pictureUrl)
						}
					}
				}
			})
		}
	}
</script>

<style>
	.box-text {
		font-size: 16px;
	}

	.box-imgView {
		margin-top: 10rpx;
		position: relative;
	}

	.box-images {
		position: absolute;
		top: 0px;
		left: 0px;
	}
	.buttons{
		margin-top: 20rpx;
		position: fixed;
		bottom: 0;
		height: 98rpx;
		width: 100%;
		left: 0;
		background: white;
		border-top: 1px solid #F4F4F4;
		text-align: center;
		line-height: 98rpx;
		font-size: 16px;
		color: black !important;
	}
</style>
