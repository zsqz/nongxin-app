<template>
	<view style="background: white;padding-bottom: 20rpx;">
		<view class="person-box">
			<image src="../../static/images/personcen01.png"></image>
			<text>姓名</text>
			<text class="person-text" style="margin-left: 76rpx;">{{ userinfo.realName }}</text>
		</view>
		<view class="person-box">
			<image src="../../static/images/personcen02.png"></image>
			<text>手机号</text>
			<text class="person-text">{{ userinfo.phone }}</text>
		</view>
		<view class="person-box">
			<image src="../../static/images/personcen03.png"></image>
			<text>职务</text>
			<view class="clearfix">
				<text v-for="(v, index) in roleListAll" :key="index" class="roles">{{ v.name }}</text>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			userinfo: {},
			roleListAll: []
		};
	},
	onLoad(options) {
		var data = JSON.parse(options.data); // 字符串转对象
		this.userinfo = data;
		this.roleListAll = this.userinfo.roleList;
	}
};
</script>

<style>
.person-box {
	min-height: 100rpx;
	line-height: 100rpx;
	font-size: 16px;
}
.person-box image {
	width: 40rpx;
	height: 40rpx;
	margin: -5rpx 0rpx 0rpx 40rpx;
	vertical-align: middle;
}
.person-box text {
	margin-left: 40rpx;
	vertical-align: middle;
}
.person-text {
	color: rgba(102, 102, 102, 1);
}
.clearfix:after {
	content: '\20';
	display: block;
	height: 0;
	clear: both;
	visibility: hidden;
	overflow: hidden;
}
.roles {
	margin-right: 6px;
	float: left;
}
.clearfix {
	margin-top: -80rpx;
	margin-left: 220rpx;
	font-size: 16px;
	color: rgba(102, 102, 102, 1);
}
</style>
