<template>
	<view class="forget">
		<tui-tips position="center" ref="toast"></tui-tips>
		<view class="content">
			<!-- 主体 -->
			<view class="main">
				<wInput v-model="oldpass" type="text" maxlength="30" placeholder="请输入旧密码" style="margin-bottom: 40rpx;"></wInput>
				<wInput v-model="passData" type="text" maxlength="30" placeholder="请输入新密码" style="margin-bottom: 40rpx;"></wInput>
				<wInput v-model="passDatas" type="text" maxlength="30" placeholder="请再次确认密码"></wInput>
			</view>
			<wButton text="确认修改" :rotate="isRotate" @click.native="startRePass()"></wButton>
		</view>
	</view>
</template>

<script>
var _this;
import wInput from '@/components/watch-login/watch-input.vue'; //input
import wButton from '@/components/watch-login/watch-button.vue'; //button
import tuiTips from '@/components/messtips/messtips.vue';
export default {
	data() {
		return {
			oldpass: '', //旧密码
			passData: '', //密码
			verCode: '', //验证码
			isRotate: false, //是否加载旋转
			passDatas: ''
		};
	},
	components: {
		wInput,
		wButton,
		tuiTips
	},
	mounted() {
		_this = this;
	},
	methods: {
		startRePass() {
			//修改密码
			if (this.isRotate) {
				//判断是否加载中，避免重复点击请求
				return false;
			}
			if (this.oldpass.length == 0 || this.passData.length == 0 || this.passDatas.length == 0) {
				uni.showToast({
					icon: 'none',
					position: 'bottom',
					title: '密码不能为空'
				});
				return false;
			}
			if (this.passData.length < 6) {
				uni.showToast({
					icon: 'none',
					position: 'bottom',
					title: '密码不能少于6位'
				});
				return false;
			}
			if (this.passData != this.passDatas) {
				uni.showToast({
					icon: 'none',
					position: 'bottom',
					title: '两次密码不一致!!'
				});
				return false;
			}
			_this.isRotate = true;
			this.$http.get(this.$appurl.updatePassword + '?oldPassword=' + this.oldpass + '&newPassword=' + this.passDatas).then(res => {
				setTimeout(function() {
					if (res.success) {
						let options = {
							msg: res.message + '将重新登录',
							duration: 1500,
							type: 'green'
						};
						_this.$refs.toast.showTips(options);
						setTimeout(function() {
							try {
								uni.clearStorageSync();
							} catch (e) {
								// error
							}
							uni.reLaunch({
								url: '../login/login'
							});
						}, 1500);
					} else {
						let options = {
							msg: res.message,
							duration: 1500,
							type: 'danger'
						};
						_this.$refs.toast.showTips(options);
					}
					_this.isRotate = false;
				}, 1000);
			});
		}
	}
};
</script>

<style>
@import url('../../components/watch-login/css/icon.css');
@import url('../../common/main.css');
.main {
	margin: 70rpx 50rpx 0rpx 50rpx;
}
</style>
