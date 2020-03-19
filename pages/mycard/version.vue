<template>
	<view class="container">
		<view class="mask" v-if="isUpdata" @touchmove.stop.prevent="moveHandle"></view>
		<!-- #ifdef APP-PLUS || MP -->
		<view class="tui-header">
			Hi，欢迎使用农芯App！当前版本：
			<text class="tui-version">V{{ version }}</text>
			<text class="tui-updowns" v-if="updowns" @click="openUpdown()">下载最新</text>
		</view>
		<!-- #endif -->
		<view class="tui-log">
			<tui-time-axis>
				<tui-timeaxis-item v-for="(item, index) in logList" :key="index">
					<template v-slot:node>
						<view class="tui-node"><tui-icon name="explore-fill" :color="version == item.version ? '#5c8dff' : ''" :size="18"></tui-icon></view>
					</template>
					<template v-slot:content>
						<view class="tui-content-log" :class="[version == item.version ? '' : 'tui-log-gray']">
							<view class="tui-version-date">{{ logList.length - 1 == index ? item.version : 'V' + item.version }}（{{ item.date }}）</view>
							<view v-for="(model, index2) in item.log" :key="index2" class="tui-log-text">{{ model }}</view>
						</view>
					</template>
				</tui-timeaxis-item>
			</tui-time-axis>
		</view>
		<view class="updataDiv" v-if="isUpdata">
			<view style="margin: 0rpx 54rpx;">
				<image src="../../static/images/updateApp.png" class="updataimg"></image>
				<view style="position: relative;">
					<text style="margin-left: 102rpx;">最新版本</text>
					<view class="updatecode">{{ vercode }}</view>
				</view>
				<view style="height: 170rpx;overflow:auto;margin-top: 20rpx;">
					<view class="updatecont" v-for="(item, index) in updacontent" :key="index">
						<text>{{ item }}</text>
					</view>
				</view>
				<view class="updataView" v-if="updataing">
					<view class="updataview-text" style="color: #6A6A75;" @click.native="noUpdata()">取消</view>
					<view class="updataview-text" style="color: #7DA4F3;" @click.native="goUpdata()">立即更新</view>
				</view>
				<cmd-progress :percent="jindu" status="active" stroke-width="10" v-if="!updataing" :isbgwhite="true"></cmd-progress>
				<view v-if="!updataing" style="width: 100%;text-align: center;">
					<text>{{ downloadedSize }}M / {{ totalSize }}M</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import tuiIcon from '@/components/icon/icon.vue';
import tuiTimeAxis from '@/components/thorlUI/time-axis/time-axis.vue';
import tuiTimeaxisItem from '@/components/thorlUI/timeaxis-item/timeaxis-item.vue';
import cmdProgress from '@/components/cmd-progress/cmd-progress.vue';
export default {
	components: {
		tuiIcon,
		tuiTimeAxis,
		tuiTimeaxisItem,
		cmdProgress
	},
	data() {
		return {
			version: '',
			logList: [],
			updowns: false,
			isUpdata: false,
			vercode: null,
			updacontent: [],
			updataing: true,
			appUrl: '',
			jindu: '0',
			totalSize: 0,
			downloadedSize: 0
		};
	},
	onLoad() {
		let that = this;
		plus.runtime.getProperty(plus.runtime.appid, function(inf) {
			that.version = inf.version; //获取当前版本号
			that.svn();
		});
	},
	methods: {
		svn() {
			let that = this;
			var xhr_svn = new plus.net.XMLHttpRequest();
			xhr_svn.onreadystatechange = function() {
				if (xhr_svn.readyState == 4) {
					if (xhr_svn.status == 200) {
						var res = JSON.parse(xhr_svn.responseText);
						that.logList = res;
						if (that.version != that.logList[0].version) {
							that.updowns = true;
						}
					} else {
						plus.nativeUI.toast('网络连接错误！');
					}
				}
			};
			xhr_svn.open('GET', this.$http.common.updataUrl + '/version.json'); //这里的地址是上面json文件的地址
			xhr_svn.send();
		},
		svns(t) {
			let _that = this;
			_that.isloading = true;
			var xhr_svn = new plus.net.XMLHttpRequest();
			xhr_svn.onreadystatechange = function() {
				if (xhr_svn.readyState == 4) {
					if (xhr_svn.status == 200) {
						_that.isloading = false;
						var res = JSON.parse(xhr_svn.responseText);
						if (res.state == 'yes') {
							if (res.mark != t) {
								_that.isUpdata = true;
								_that.appUrl = res.url;
								_that.vercode = 'V' + res.mark;
								_that.updacontent = res.updateContent.split(',');
							} else {
								_that.autologin();
							}
						}
					} else {
						uni.showToast({
							icon: 'none',
							position: 'bottom',
							title: '网络连接错误'
						});
					}
				}
			};
			xhr_svn.open('GET', this.$http.common.updataUrl + '/update.json'); //这里的地址是上面json文件的地址
			xhr_svn.send();
		},
		openUpdown() {
			this.svns(this.version);
		},
		noUpdata() {
			this.isUpdata = false;
		},
		bodyScroll(e) {
			e.stopPropagation();
			e.preventDefault();
		},
		goUpdata() {
			this.updataing = false;
			let that = this;
			var url = this.appUrl;
			var dtask = plus.downloader.createDownload(url, {}, function(d, status) {
				if (status == 200) {
					// 下载成功
					var path = d.filename;
					plus.runtime.install(path);
				} else {
					//下载失败
				}
			});
			var sizes = 0;
			dtask.addEventListener('statechanged', function(task, status) {
				if (task.state == 0) {
				} else if (task.state == 2) {
				} else if (task.state == 3) {
					var sizeApp = (task.downloadedSize / task.totalSize) * 100;
					that.jindu = parseInt(sizeApp);
					that.downloadedSize = (task.downloadedSize / 1024 / 1024).toFixed(2);
					that.totalSize = (task.totalSize / 1024 / 1024).toFixed(2);
				} else if (task.state == 4) {
				}
			});
			dtask.start();
		},
		moveHandle() {}
	}
};
</script>

<style>
@import url('../../components/watch-login/css/icon.css');
@import url('../../common/main.css');
.container {
	overflow: hidden;
	position: relative;
}

.tui-header {
	width: 100%;
	padding: 0 30upx;
	box-sizing: border-box;
	font-size: 24upx;
	color: #999;
	height: 54upx;
	line-height: 54upx;
	background: #fff8d5;
	display: flex;
	align-items: center;
	position: fixed;
	top: 0;
	z-index: 999999;
}

.tui-version {
	color: #f54f46;
	font-weight: bold;
}

.tui-log {
	padding: 84upx 80upx 30upx 40upx;
	box-sizing: border-box;
}

.tui-node {
	padding: 3px 0;
	background: #f4f5f9 !important;
}

.tui-content-log {
	border-radius: 10upx;
	position: relative;
	padding: 30upx 36upx;
	margin-left: 20rpx;
	font-size: 32upx;
	color: #fff;
	background: #5c8dff;
	border: 1upx solid #5c8dff;
	display: inline-block;
	width: 500rpx;
}

.tui-log-text {
	/* word-break: break-all;
  word-wrap: break-word;
  text-align: justify; */
}

.tui-content-log::before {
	content: '';
	position: absolute;
	width: 0;
	height: 0;
	top: 20upx;
	border: 16upx solid;
	right: 100%;
	border-color: transparent #5c8dff transparent transparent;
}

.tui-log-gray {
	background: #ededed !important;
	border: 1upx solid #ededed !important;
	color: #999 !important;
}

.tui-log-gray::before {
	border-color: transparent #ededed transparent transparent !important;
}

.tui-version-date {
	font-size: 32upx;
	font-weight: bold;
	padding-bottom: 20upx;
}
.tui-updowns {
	width: 140rpx;
	text-align: center;
	color: #1e90ff;
	margin-left: 40rpx;
}
.updataDiv {
	height: 720rpx;
	top: 220rpx;
	left: 126rpx;
}
.updataView {
	margin-top: 20rpx;
}
.mask {
	position: fixed;
	top: 0;
	left: 0;
	z-index: 999;
	width: 100%;
	height: 100vh;
	background: rgba(0, 0, 0, 0.7);
}
</style>
