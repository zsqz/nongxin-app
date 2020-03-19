<template>
	<view>
		<view class="header-nav main-bg-color">
			<view class="header-nav-content">
				<uni-icon type="arrowleft" size="30" @click="back()" />
				<text style="font-size: 18px;">农事工单</text>
				<text style="font-size: 16px;float: right;margin-right: 32rpx;" @click="goplant" v-if="isredact">编辑</text>
			</view>
		</view>
		<view class="content-box">
			<view class="content">
				<view class="content-title"><text>工单详情</text></view>
				<view v-html="getStr(dataAll.farmingItem.method)">{{ getStr(dataAll.farmingItem.method) }}</view>
				<view v-if="farmpicList != ''" style="margin-top: 20rpx;margin-bottom: 40rpx;">
					<view class="square-inner flex">
						<view v-for="(list, index) in farmpicList" :key="index" style="height: 245rpx;max-width: 350rpx;" @click="previewImage(index)">
							<image :src="getShow(list.pictureUrl)" style="width: 100%;height: 100%;"></image>
						</view>
					</view>
				</view>
				<text>{{ dataAll.batchName }}</text>
			</view>
			<view class="content">
				<view class="content-title"><text>农户反馈</text></view>
				<view v-html="getStr(farmData.orderContent.content)">{{ getStr(farmData.orderContent.content) }}</view>
				<view class="records" v-if="fileInfo!=null" @click="playVoice">
					<image src="../../static/images/video02.png" style="height: 28rpx;width: 28rpx;position: absolute;top: 30%;left: 20rpx;"></image>
					<view style="position: absolute;width: 165rpx;top: 7rpx;left: 68rpx;">
						<cmd-progress :percent="audioTimes" :showInfo="false"></cmd-progress>
					</view>
					<view style="position: absolute;right: 20rpx;top: 10rpx;">
						{{fileInfo.remark}}"
					</view>
				</view>
				<view v-if="farmpicList01 != ''" style="margin-top: 20rpx;margin-bottom: 40rpx;">
					<view class="square-inner flex">
						<view v-for="(list, index) in farmpicList01" :key="index" style="height: 245rpx;max-width: 350rpx;" @click="previewImages(index)">
							<image :src="getShow(list.pictureUrl)" style="width: 100%;height: 100%;"></image>
						</view>
					</view>
				</view>
				<text>
					审核结果:
					<text style="color: #C6C6C6;margin-left: 20rpx;">{{ farmData.status.displayName }}</text>
				</text>
			</view>
			<view class="content">
				<view class="content-title"><text>费用信息</text></view>
				<view v-if="deviceActList!=''">
					<view class="costs-title">设备信息</view>
					<view v-for="(item,index) in deviceActList" :key="index" style="margin-top: 15rpx;">
						<view><text>名称:{{item.deviceName}}</text></view>
						<view><text>计划单价:{{item.preUnitCount}}元</text></view>
						<view><text>计划总量:{{item.preUnitPrice}}{{item.company}}</text></view>
						<view><text>实际单价:{{item.actUnitPrice}}元</text></view>
						<view><text>实际总量:{{item.actUnitCount}}{{item.company}}</text></view>
					</view>
				</view>
				<view v-if="personnelActList!=''" >
					<view class="costs-title">人员信息</view>
					<view v-for="(item,index) in personnelActList" :key="index" style="margin-top: 15rpx;">
						<view><text>名称:{{item.personName}}</text></view>
						<view><text>计划人天数:{{item.preUnitCount}}人/天</text></view>
						<view><text>计划工资:{{item.preUnitPrice}}元/人天</text></view>
						<view><text>实际人天数:{{item.actUnitCount}}人/天</text></view>
						<view><text>实际工资:{{item.actUnitPrice}}元/人天</text></view>
					</view>
				</view>
				<view v-if="materialActList!=''">
					<view class="costs-title">物料信息</view>
					<view v-for="(item,index) in materialActList" :key="index" style="margin-top: 15rpx;">
						<view><text>名称:{{item.materialName}}</text></view>
						<view><text>计划单价:{{item.preUnitCount}}元</text></view>
						<view><text>计划总量:{{item.preUnitPrice}}{{item.company}}</text></view>
						<view><text>实际单价:{{item.actUnitPrice}}元</text></view>
						<view><text>实际总量:{{item.actUnitCount}}{{item.company}}</text></view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import uniIcon from '@/components/uni-icon/uni-icon.vue';
import cmdProgress from "@/components/cmd-progress/cmd-progress.vue"
export default {
	components: {
		uniIcon,
		cmdProgress
	},
	data() {
		return {
			dataAll: {},
			farmpicList: [],
			pictureUrlList: [],
			farmData: {},
			farmpicList01: [],
			pictureUrlList01: [],
			deviceActList: [],
			materialActList: [],
			personnelActList: [],
			fileInfo:null,
			isredact:false,
			innerAudioContext:uni.createInnerAudioContext(),
			audioTimes:0,
			audioTimess:0,
			fileTimes:0,
			setids:null,
			isover:true
		};
	},
	onLoad(options) {
		let that = this;
		var data = JSON.parse(options.datas); // 字符串转对象
		this.dataAll = data;
		if(this.dataAll.status.code!='AUDIT_APPROVAL'){
			this.isredact=true;
		}
		this.farmpicList = data.farmingItem.pictureInfoList;
		if (that.farmpicList != '' || that.farmpicList != []) {
			for (let index in that.farmpicList) {
				that.pictureUrlList.push(that.$http.common.baseUrl + that.$appurl.pictures + that.farmpicList[index].pictureUrl);
			}
		}
		this._loading();
	},
	methods: {
		_loading() {
			let _that = this;
			var id = this.dataAll.id;
			this.$http.get(this.$appurl.selectByIdwork + '?id=' + this.dataAll.id).then(res => {
				if (res.success) {
					_that.farmData = res.result;
					_that.fileInfo = res.result.fileInfo;
					if(_that.fileInfo){
						_that.fileTimes=_that.fileInfo.remark
					}
					_that.farmpicList01 = _that.farmData.pictureInfoList;
					if (_that.farmpicList01 != '' || _that.farmpicList01 != []) {
						for (let index in _that.farmpicList01) {
							_that.pictureUrlList01.push(_that.$http.common.baseUrl + _that.$appurl.pictures + _that.farmpicList01[index].pictureUrl);
						}
					}
				}
			});
			this.$http.get(this.$appurl.getOrderCosts + '?id=' + this.dataAll.id).then(res => {
				if (res.success) {
					_that.deviceActList = res.result.deviceActList;
					_that.materialActList = res.result.materialActList;
					_that.personnelActList = res.result.personnelActList;
				}
			});
		},
		back() {
			uni.navigateBack({});
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
		previewImages(i) {
			// 预览图片
			uni.previewImage({
				current: this.pictureUrlList01[i],
				urls: this.pictureUrlList01,
				loop: 'true',
				indicator: 'default'
			});
		},
		goplant() {
			var datas = JSON.stringify(this.farmData);
			uni.navigateTo({
				url: 'tasks?datas='+datas
			});
		},
		getStr(str) {
			if (str != undefined) {
				str = str.replace(/\r\n/g, '<br>');
				str = str.replace(/\n/g, '<br>');
				str = str.replace(/\s/g, '&nbsp;');
				return str;
			}
		},
		playVoice() {
			let _that = this;
			if(!this.isover){
				return;
			}
			this.innerAudioContext.src = this.$http.common.baseUrl + this.$appurl.getAudio + "?fileUrl=" + this.fileInfo.fileUrl;
			this.innerAudioContext.play();
			this.setids = setInterval(_that.showtime,1000)
			this.audioTimes=0;
			this.audioTimess=0;
		},
		showtime(){
			this.isover=false
			let that = this;
			this.audioTimess+=1;
			this.audioTimes+=100/this.fileTimes;
			if(this.audioTimess==this.fileTimes){
				clearInterval(this.setids);
				that.isover = true;
			}
		},
	}
};
</script>

<style>
.header-nav {
	height: 232rpx;
	width: 100%;
}
.header-nav-content {
	padding-top: 68rpx;
	padding-left: 32rpx;
}
.content-box {
	margin-top: -64rpx;
	padding: 0rpx 32rpx;
}
.content {
	background: white;
	margin-bottom: 20rpx;
	border-radius: 20rpx;
	padding: 0rpx 14rpx 20rpx 14rpx;
}
.content-title {
	font-size: 16px;
	font-weight: 700;
	text-align: center;
	padding: 40rpx 0rpx;
}
.square {
	/* padding百分比是相对父元素宽度计算的 */
	margin-top: 20rpx;
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
.costbox {
	margin-bottom: 40rpx;
}
.records {
	width: 290rpx;
	height: 60rpx;
	background: #f1f1f1;
	border-radius: 20rpx;
	margin: 20rpx 0rpx;
	line-height: 60rpx;
	position: relative;
}
.costs-title {
	text-align: center;
	margin-top: 30rpx;
}
</style>
