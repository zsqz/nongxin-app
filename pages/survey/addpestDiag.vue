<template>
	<view style="background: white;padding: 0rpx 40rpx;margin-top: 10rpx;">
		<sl-filter :themeColor="themeColor" :menuList="menuList" @result="result"></sl-filter>
		<view class="uni-textarea"><textarea placeholder="请输入文字" v-model="textareas" maxlength="-1" /></view>
		<view style="min-height: 250rpx;"><upload-img :uploadpest="true" ref="upImg" @func="getupimgList"></upload-img></view>
		<button class="buttons main-bg-color"  type="primary" :loading="issubmit" :disabled="issubmit" @click="submits">提交</button>
	</view>
</template>

<script>
import slFilter from '@/components/songlazy-sl-filter/sl-filter/sl-filter.vue';
import uploadImg from '@/components/common/uploadImg.vue';
export default {
	components: {
		slFilter,
		uploadImg
	},
	data() {
		return {
			textareas: null,
			themeColor: '#FFD700',
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
			baseId: -1,
			imgidAll: [],
			issubmit:false,
		};
	},
	onLoad: function() {
		let that = this;
		this.$http.get(this.$appurl.getBaseByUid).then(res => {
			if (res.success) {
				if (res.result.length > 0) {
					this.baseId = res.result[0].id;
					for (let i = 0; i < res.result.length; i++) {
						that.menuList[0].detailList.push({
							title: res.result[i].baseName,
							value: res.result[i].id
						});
					}
				} else {
					_that.menuList[0].detailList = [{ title: '暂无基地', value: '-1' }];
				}
				that.loading(that.indexs);
			}
		});
	},
	methods: {
		submits() {
			if (this.baseId == -1) {
				uni.showToast({
					position: 'bottom',
					title: '请选择一个基地'
				});
				return;
			}
			this.$refs.upImg.upsurvey();
			if (this.imgidAll.length == 0) {
				uni.showToast({
					position: 'bottom',
					title: '图片不能为空'
				});
				return;
			}
			if (this.textareas == null) {
				uni.showToast({
					position: 'bottom',
					title: '内容不能为空'
				});
				return;
			}
			console.log(this.imgidAll);
			this.issubmit = true;
			var data = {
				baseId: this.baseId,
				content: this.textareas,
				pictureInfoList: this.imgidAll
			};
			this.$http.post(this.$appurl.addillFeedback, data).then(res => {
				if (res.success) {
					uni.showToast({
						position: 'bottom',
						title: res.message
					});
					this.textareas = null;
					uni.navigateBack({
						success() {
							let page = getCurrentPages().pop(); //跳转页面成功之后
							if (!page) return;
							page.onLoad(); //如果页面存在，则重新刷新页面
						}
					});
					this.$ref.upImg.clearsurvey();
				}
				this.issubmit = false;
			});
		},
		result(val) {
			this.baseId = val.single;
		},
		getupimgList(data) {
			this.imgidAll = data;
		}
	}
};
</script>

<style>
.select-tab .select-tab-item {
	width: calc(100%) !important;
}
.buttons {
	position: fixed;
	bottom: 0;
	left: 0;
	height: 98rpx;
	width: 100%;
	background: white;
	border-top: 1px solid #f4f4f4;
	text-align: center;
	line-height: 98rpx;
	font-size: 16px;
	color: black !important;
}
</style>
