<template>
	<view>
		<view style="padding: 0rpx 40rpx 40rpx 40rpx;background: white;">
			<view class="uni-textarea"><textarea placeholder="请输入文字" v-model="textareas" maxlength="-1" /></view>
			<view style="min-height: 250rpx;">
				<upload-img :recordId="orderid" ref="upImg" @func="getupimgList" :imgdata="pictureUrlList" :picturIds="picturIds"></upload-img>
			</view>
			<view class="recordbox">
				<record :orderId="orderid" :fileInfo="fileInfo" ref="removes" @func="getremoveid"></record>
			</view>
			<view style="margin-top: 40rpx;">
				<tables :ids="orderid" ref="uptable" @func="gettableList" @funcs="isovers"></tables>
			</view>
		</view>
		<button class="buttons main-bg-color" type="primary"  :loading="issubmit" :disabled="issubmit" @click="submit">提交</button>
	</view>
</template>
<script>
import uploadImg from '@/components/common/uploadImg.vue';
import record from '@/components/common/record.vue';
import tables from '@/components/common/tables.vue';
export default {
	data() {
		return {
			orderid: -1,
			isuploadImg: false,
			textareas: null,
			tablaData: {},
			alldatas: {},
			farmpicList: [],
			pictureUrlList: [],
			picturIds: [],
			fileInfo: {},
			isover: false,
			removeAll: [],
			removerecordId: null,
			longitude: null,
			latitude: null,
			issubmit:false,
		};
	},
	onLoad: function(option) {
		let that = this;
		this.orderid = option.id;
		this.startRecord();
		var data = JSON.parse(option.datas);
		if (data != undefined) {
			this.alldatas = data;
			this.orderid = this.alldatas.id;
			this.textareas = this.alldatas.orderContent.content;
			this.fileInfo = this.alldatas.fileInfo;
			this.farmpicList = this.alldatas.pictureInfoList;
			if (this.farmpicList != '' || this.farmpicList != []) {
				for (let index in that.farmpicList) {
					that.picturIds.push({ id: that.farmpicList[index].id });
					that.pictureUrlList.push(this.$http.common.baseUrl + this.$appurl.pictures + that.farmpicList[index].pictureUrl);
				}
			}
		}
	},
	onReady() {
		this.isgetlocal();
	},
	onBackPress() {
		this.$refs.upImg.uptasks();
		if (this.removeAll.length > 0) {
			for (var i = 0; i < this.removeAll.length; i++) {
				this.$http.get(this.$appurl.pictureDelete + '?id=' + this.removeAll[i]).then(res => {});
			}
		}
		this.$refs.removes.getremove();
		if (this.removerecordId != null) {
			this.$http.get(this.$appurl.fileDelete + '?id=' + this.removerecordId).then(res => {});
		}
	},
	components: {
		uploadImg,
		record,
		tables
	},
	methods: {
		submit() {
			if (this.textareas == null) {
				uni.showToast({
					position: 'bottom',
					title: '内容不能为空'
				});
				return;
			}
			this.$refs.upImg.uptasks();
			if (!this.isuploadImg) {
				uni.showToast({
					position: 'bottom',
					title: '图片不能为空'
				});
				return;
			}
			this.$refs.uptable.uptasks();
			if (!this.isover) {
				return;
			}
			this.issubmit = true;
			var dataAll = {
				id: this.orderid,
				materialActList: this.tablaData.mat,
				personnelActList: this.tablaData.per,
				deviceActList: this.tablaData.dev,
				orderContent: {
					content: this.textareas,
					longitude: this.longitude,
					latitude: this.latitude
				},
			};
			this.$http.post(this.$appurl.executingOrder, dataAll).then(res => {
				if (res.success) {
					uni.showToast({
						position: 'bottom',
						title: res.message
					});
					uni.switchTab({
						url: '../index/index',
						success() {
							let page = getCurrentPages().pop(); //跳转页面成功之后
							if (!page) return;
							page.onLoad(); //如果页面存在，则重新刷新页面
						}
					});
				}
				this.issubmit = false;
			});
		},
		getupimgList(data) {
			if (data.lists != '') {
				this.isuploadImg = true;
			} else {
				this.isuploadImg = false;
			}
			this.removeAll = data.removeAllid;
		},
		gettableList(data) {
			this.tablaData = data;
		},
		isovers(data) {
			this.isover = data;
		},
		getremoveid(data) {
			this.removerecordId = data;
		},
		isgetlocal() {
			let that = this;
			this.$http.get(this.$appurl.getOrderIsLocal + '?orderId=' + this.orderid).then(res => {
				if (res.result.isLocation.code == 'YES') {
					uni.getLocation({
						type: 'wgs84',
						success: function(res) {
							that.longitude = res.longitude;
							that.latitude = res.latitude;
						}
					});
				}
			});
		},
		//进入时先提示请求授权
		startRecord(){
			uni.getRecorderManager().start();
			uni.getRecorderManager().stop();
		}
	}
};
</script>

<style>
page {
	background: #f4f5f9 !important;
}
.uni-textarea {
	margin: 20rpx 0rpx;
}
.buttons {
	height: 98rpx;
	width: 100%;
	background: white;
	border-top: 1px solid #f4f4f4;
	text-align: center;
	line-height: 98rpx;
	font-size: 16px;
	color: black !important;
}
.recordbox {
	border-top: 1px solid rgba(238, 238, 238, 1);
	padding: 30rpx 0rpx;
}
</style>
