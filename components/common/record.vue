<template>
	<view>
		<view
			style="height: 75rpx;width: 200rpx;background: #F1F1F1;border-radius: 10px;position: relative;margin-top: 15px;margin-bottom: 15px;line-height: 75rpx;padding-left: 40px;"
			v-if="isShows"
			@click="playVoice"
		>
			<image src="../../static/images/video01.png" style="position: absolute;width: 18px;top: 9px;left: 10px;height: 40rpx;width: 40rpx;" v-if="isrecbo"></image>
			<image src="../../static/images/yuyin.gif" style="position: absolute;width: 18px;top: 9px;left: 10px;" mode="widthFix" v-if="!isrecbo"></image>
			{{ recordtotalTime }}"
			<view class="recordRemove" @click.stop="recDel" style="position: absolute;right: 0;top: 15rpx;"><icon type="clear" size="20" /></view>
		</view>
		<image v-if="!isShows" src="../../static/images/video01.png" style="width: 48rpx;height: 50rpx;position: absolute;"></image>
		<button
			v-if="!isShows"
			class="voice-mode"
			style="line-height: 60rpx;height: 60rpx;width: 376rpx;font-size: 12px;color: rgba(102,102,102,1);border-radius: 20rpx;margin-left: 88rpx;"
			:class="[isVoice ? '' : 'hidden', recording ? 'recording' : '']"
			@touchstart="voiceBegin"
			@touchmove.stop.prevent="voiceIng"
			@touchend="voiceEnd"
			@touchcancel="voiceCancel"
		>
			{{ voiceTis }}
		</button>
		<!-- 录音UI效果 -->
		<view class="record" :class="recording ? '' : 'hidden'">
			<view class="ing" :class="willStop ? 'hidden' : ''"><view class="icon luyin2"></view></view>
			<view class="cancel" :class="willStop ? '' : 'hidden'"><view class="icon chehui"></view></view>
			<view class="tis" :class="willStop ? 'change' : ''">{{ recordTis }}</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			//录音相关参数
			//H5不能录音
			RECORDER: uni.getRecorderManager(),
			isVoice: true,
			voiceTis: '按住录音',
			recordTis: '手指上滑 取消发送',
			recording: false,
			willStop: false,
			initPoint: {
				identifier: 0,
				Y: 0
			},
			recordTimer: null,
			recordLength: 0,
			//播放语音相关参数
			AUDIO: uni.createInnerAudioContext(),
			playMsgid: null,
			VoiceTimer: null,
			totalTime: null,
			isShows: false,
			recordIds: 0,
			voicePath: null,
			isrecbo: true,
			startTimestamp:null,
			stopTimestamp:null,
			removerecord:null,
			recordtotalTime:null,
		};
	},
	props: {
		orderId: Number,
		fileInfo: Object
	},
	mounted() {
		if (this.fileInfo != null) {
			if (this.fileInfo.fileUrl != undefined) {
				this.isShows = true;
				this.voicePath = this.fileInfo.fileUrl;
				this.totalTime = this.fileInfo.remark + '"';
				this.recordIds = this.fileInfo.id;
			}
		}
		//语音自然播放结束
		this.AUDIO.onEnded(res => {
			this.playMsgid = null;
			this.isrecbo = true;
		});
		//录音开始事件
		this.RECORDER.onStart(e => {
			this.recordBegin(e);
		});
		//录音结束事件
		this.RECORDER.onStop(e => {
			this.recordEnd(e);
		});
	},
	onShow() {
		this.scrollTop = 9999999;
	},
	methods: {
		// 播放语音
		playVoice() {
			console.log(this.$http.common.baseUrl + this.$appurl.getAudio + '?fileUrl=' + this.voicePath);
			this.isrecbo = false;
			this.AUDIO.src = this.$http.common.baseUrl + this.$appurl.getAudio + '?fileUrl=' + this.voicePath;
			this.AUDIO.play();
		},
		// 录音开始
		voiceBegin(e) {
			if (e.touches.length > 1) {
				return;
			}
			if (this.isShows) {
				uni.showToast({
					icon: 'none',
					position: 'bottom',
					title: '已存在录音'
				});
				return;
			}
			this.initPoint.Y = e.touches[0].clientY;
			this.initPoint.identifier = e.touches[0].identifier;
			this.RECORDER.start({
				format: 'mp3'
			}); //录音开始,
			this.startTimestamp = (new Date()).getTime();
		},
		//录音开始UI效果
		recordBegin(e) {
			this.recording = true;
			this.voiceTis = '松开 结束';
			this.recordLength = 0;
			this.recordTimer = setInterval(() => {
				this.recordLength++;
			}, 1000);
		},
		// 录音被打断
		voiceCancel() {
			this.recording = false;
			this.voiceTis = '按住 说话';
			this.recordTis = '手指上滑 取消发送';
			this.willStop = true; //不发送录音
			this.RECORDER.stop(); //录音结束
		},
		// 录音中(判断是否触发上滑取消发送)
		voiceIng(e) {
			if (!this.recording) {
				return;
			}
			let touche = e.touches[0];
			//上滑一个导航栏的高度触发上滑取消发送
			if (this.initPoint.Y - touche.clientY >= uni.upx2px(100)) {
				this.willStop = true;
				this.recordTis = '松开手指 取消发送';
			} else {
				this.willStop = false;
				this.recordTis = '手指上滑 取消发送';
			}
		},
		// 结束录音
		voiceEnd(e) {
			if (!this.recording) {
				return;
			}
			this.recording = false;
			this.voiceTis = '按住 说话';
			this.recordTis = '手指上滑 取消发送';
			this.RECORDER.stop(); //录音结束
		},
		//录音结束(回调文件)
		recordEnd(e) {
			let _that = this;
			// 判断录音时间
			this.stopTimestamp = (new Date()).getTime();
			clearInterval(this.recordTimer);
			if (!this.willStop) {
				if(this.stopTimestamp-this.startTimestamp<800){
					uni.showToast({
						icon: 'none',
						position: 'bottom',
						title: '录音时长太短'
					});
				}else{
					_that.recordtotalTime = Math.round((_that.stopTimestamp-_that.startTimestamp)/1000);
					if(e.tempFilePath.slice(-3)=='aac'){
						return
					}
					uni.uploadFile({
						url: this.$http.common.baseUrl + this.$appurl.uploadOrderFile,
						name: 'file',
						filePath: e.tempFilePath,
						formData: {
							file: e.tempFilePath,
							orderId: this.orderId,
							remark:this.recordtotalTime
						},
						success: function(uploadFileRes) {
							_that.isShows = true;
							uni.showToast({
								icon: 'none',
								position: 'bottom',
								title: '录音完成'
							});
							_that.voicePath = JSON.parse(uploadFileRes.data).result.fileUrl;
							_that.totalTime = JSON.parse(uploadFileRes.data).result.remark + '"';
							_that.recordIds = JSON.parse(uploadFileRes.data).result.id;
							_that.removerecord = JSON.parse(uploadFileRes.data).result.id;
						}
					});
				}
			} else {
				uni.showToast({
					icon: 'none',
					position: 'bottom',
					title: '取消发送录音'
				});
			}
			this.willStop = false;
		},
		// 切换语音/文字输入
		switchVoice() {
			this.hideDrawer();
			this.isVoice = this.isVoice ? false : true;
		},
		discard() {
			return;
		},
		getremove() {
			this.$emit('func', this.removerecord)
		},
		recDel() {
			let _that = this;
			this.$http.get(this.$appurl.fileDelete + '?id=' + this.recordIds).then(res => {
				if (res.success) {
					_that.isShows = false;
					uni.showToast({
						icon: 'none',
						position: 'bottom',
						title: res.message
					});
					_that.removerecord = null;
				}
			});
		}
	}
};
</script>
<style lang="scss">
@import '@/static/HM-chat/css/style.scss';
</style>
