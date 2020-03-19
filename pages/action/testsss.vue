<template>
	<view class="testsss">
		<tui-loading :visible="isloading"></tui-loading>
		<view class="mask" v-if="isloading"></view>
		<view class="headers" @click="openpicker()">
			<view class="header-fixed" style="flex: 2;">{{basenames}}</view>
			<view class="header-fixed">{{gallery}}</view>
		</view>
		<view class="uni-padding-wrap uni-common-mt">
			<view>
				<video id="myVideo" :src="src"  v-if="isshowvid"
					webkit-playsinline="true"   
					x-webkit-airplay="true"  
					playsinline="true"  
					x5-video-player-type="h5"
                    @error="videoErrorCallback" controls autoplay>
				</video>
			</view>
		</view>
		<w-picker
			mode="linkage"
			:level="2"
			@confirm="onConfirm"
			@cancel="videocancel"
			:defaultVal="[linkList[0].label,linkList[0].children[0].label]"
			ref="linkage"
			:linkList="linkList"
			themeColor="#f00"
		></w-picker>
	</view>
</template>

<script>
import wPicker from '@/components/w-picker/w-picker.vue';
import tuiLoading from '@/components/loading/loading.vue';
export default {
	components: {
		wPicker,
		tuiLoading
	},
	data() {
		return {
			src: '',
			linkList: [],
			curLock: false,
			isshowvid:false,
			isloading: false,
			basenames:'',
			gallery:''
		};
	},
	onReady: function(res) {
		this.isloading = true;
		// #ifndef MP-ALIPAY
		this.videoContext = uni.createVideoContext('myVideo');
		// #endif
		this._getAddress();
	},
	methods: {
		videoErrorCallback: function(e) {
			uni.showModal({
				content: e.target.errMsg,
				showCancel: false
			});
		},
		_getAddress(token) {
			let that = this;
			var xhr_svn = new plus.net.XMLHttpRequest();
			xhr_svn.onreadystatechange = function() {
				if (xhr_svn.readyState == 4) {
					if (xhr_svn.status == 200) {
						var res = JSON.parse(xhr_svn.responseText);
						if (res.code == 200) {
							if (res.data && res.data.length) {
								for (let i = 0; i < res.data.length; i++) {
									if (res.data[i].deviceName != '鲜言') {
										that.linkList.push({
											label: res.data[i].deviceName,
											value: res.data[i].deviceSerial,
											children: []
										});
										break;
									}
								}
								for (let i = 0; i < res.data.length; i++) {
									for (let j = 0; j < that.linkList.length; j++) {
										if (that.linkList[j].label === res.data[i].deviceName) {
											that.curLock = true
											that.linkList[j].children.push({
												label: '通道' + res.data[i].channelNo,
												value: res.data[i].liveAddress,
												name: res.data[i].deviceName
											});
										}
									}
									if (!that.curLock && res.data[i].deviceName != '鲜言') {
										that.linkList.push({
											label: res.data[i].deviceName,
											value: res.data[i].deviceSerial,
											children: [
												{
													label: '通道' + res.data[i].channelNo,
													value: res.data[i].liveAddress
												}
											]
										});
									}
									that.curLock = false;
								}
								that.src = that.linkList[0].children[0].value
								that.basenames = that.linkList[0].label
								that.gallery = that.linkList[0].children[0].label
								that.isshowvid = true;
								that.isloading = false;
							}
						} else if (res.code == 10001) {
							that.gettokens();
						} else if (res.code == 10002) {
							that.gettokens();
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
			let videotoken = '';
			try {
				videotoken = uni.getStorageSync('videotoken');
			} catch (e) {
				// error
			}
			let curToken = token ? token : videotoken;
			xhr_svn.open('POST', 'https://open.ys7.com/api/lapp/live/video/list?' + curToken);
			xhr_svn.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
			xhr_svn.send();
		},
		gettokens() {
			let that = this;
			var xhr_svn = new plus.net.XMLHttpRequest();
			xhr_svn.onreadystatechange = function() {
				if (xhr_svn.readyState == 4) {
					if (xhr_svn.status == 200) {
						var res = JSON.parse(xhr_svn.responseText);
						if (res.code == 200) {
							let tokens = 'accessToken=' + res.data.accessToken + '&pageStart=0&pageSize=50';
							try {
								uni.setStorageSync('videotoken', tokens);
							} catch (e) {
								// error
							}
							that._getAddress(tokens);
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
			let param = 'appKey=c949347ff85947d39f0749143b0a76f6&appSecret=83a5afbe9249c08698e53a92e97edc53';
			xhr_svn.open('POST', 'https://open.ys7.com/api/lapp/token/get?' + param);
			xhr_svn.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
			xhr_svn.send();
		},
		onConfirm(val) {
			this.src = val.checkValue[1]
			this.basenames=val.checkArr[0]
			this.gallery=val.checkArr[1]
		},
		openpicker() {
			this.$refs['linkage'].show();
		},
		videocancel(){
			
			console.log('11')
		}
	}
};
</script>

<style>
#myVideo {
	width: 700rpx;
	height: 500rpx;
	z-index: 10 !important;
}
.headers {
	width: 100%;
	height: 100rpx;
	text-align: center;
	display: flex;
	background: white;
}
.header-fixed{
	flex: 1;
	text-align: center;
	line-height: 100rpx;
}
.testsss /deep/ .w-picker-hd {
	background-color: #FBD855;
}
.testsss /deep/ .w-picker-btn {
	color: white !important;
}
.mask {
	position: fixed;
	top: 0;
	left: 0;
	z-index: 999;
	width: 100%;
	height: 100vh;
	background: rgba(255, 255, 255, 1);
}
.w-picker-view{
	height: 400rpx !important;
}
</style>
