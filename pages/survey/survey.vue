<template>
	<view class="container">
		<tui-loading :visible="isloading"></tui-loading>
		<view class="mask" v-if="isloading"></view>
		<tui-tipss ref="toast"></tui-tipss>
		<view class="slfiter">
			<sl-filter :themeColor="themeColor" :menuList="menuList" @result="result"></sl-filter>
		</view>
		<view>
			<scroll-view scroll-x scroll-with-animation class="tab-view" :scroll-left="scrollLeft">
				<view style="display: flex;">
					<view
						v-for="(item, index) in tabbar"
						:key="index"
						class="tab-bar-item"
						:class="[currentTab == index ? 'active' : '']"
						:data-current="index"
						@tap.stop="swichNav"
					>
						<text class="tab-bar-title">{{ item }}</text>
					</view>
				</view>
			</scroll-view>

			<swiper class="tab-content" :current="currentTab" duration="150" @change="switchTab" :style="{ height: winHeight - 89 + 'px' }">
				<swiper-item v-for="(item, index) in newsitems" :key="index">
					<view id="addImg" @click.stop="goaddpest" v-if="index == 0"></view>
					<you-scroll v-if="index == 0" ref="scroll" @onPullDown="onPullDown" @onScroll="onScroll" @onLoadMore="loadmore(index)" :refresh="refresh">
						<view style="padding:0rpx 44rpx;">
							<view v-if="item.list == ''"><tui-tips :fixed="false" imgUrl="../../static/images/img_nodata.png">暂无反馈信息</tui-tips></view>
							<view class="scroll-box" v-if="item.list != []" v-for="(items, indexs) in item.list" :key="indexs" @click="gopestdiag(items)">
								<view class="scoll-box-top">
									<image src="../../static/images/survey01.png" class="scoll-box-img"></image>
									{{ items.content }}
								</view>
								<view class="scoll-box-top">
									<image v-if="items.answerContent" src="../../static/images/survey02.png" class="scoll-box-img"></image>
									<text v-if="items.answerContent">专家已回答</text>
									<image v-if="!items.answerContent" src="../../static/images/survey03.png" class="scoll-box-img"></image>
									<text v-if="!items.answerContent" style="color: #666666;">暂无回答</text>
								</view>
							</view>
						</view>
						<!-- 上拉加载更多 -->
						<view class="d-flex a-center j-center text-light-muted font-md py-3">{{ item.loadtext }}</view>
					</you-scroll>

					<view v-show="index == 1" style="background: white;padding: 0rpx 40rpx;">
						<view class="uni-textarea"><textarea placeholder="请输入文字" v-model="textareas" maxlength="-1" /></view>
						<view style="min-height: 250rpx;">
							<uploadImgs ref="upImgs" :uploadsur="true"  @func="getupimgList"></uploadImgs>
						</view>
						<view class="buttons" @click="submits">提交</view>
					</view>
				</swiper-item>
			</swiper>
		</view>
	</view>
</template>

<script>
import tuiLoading from '@/components/loading/loading.vue';
import tuiTips from '@/components/tips/tips.vue';
import uniIcon from '@/components/uni-icon/uni-icon.vue';
import youScroll from '@/components/you-scroll.vue';
import tuiTipss from '@/components/messtips/messtips.vue';
import slFilter from '@/components/songlazy-sl-filter/sl-filter/sl-filter.vue';
import uploadImgs from '@/components/common/uploadImg.vue';
export default {
	components: {
		tuiLoading,
		tuiTips,
		uniIcon,
		youScroll,
		tuiTipss,
		slFilter,
		uploadImgs
	},
	data() {
		return {
			isloading: false,
			tabbar: ['病虫害反馈', '巡视反馈'],
			winHeight: '', //窗口高度
			currentTab: 0, //预设当前项的值
			scrollLeft: 0, //tab标题的滚动条位置
			surveydata: [],
			multiArray: [],
			menuList: [
				{
					title: '单选',
					key: 'single',
					isMutiple: false,
					detailTitle: '请选择基地（单选）',
					reflexTitle: true,
					defaultSelectedIndex: 0,
					detailList: [
						{
							title: '全部',
							value: '-1'
						}
					]
				}
			],
			value: [0, 0],
			basename: null,
			batchname: null,
			isnoarr: true,
			baseId: -1,
			indexs: 0,
			refresh: false,
			newsitems: [],
			allpage: 0,
			currpage: 1,
			pagesize: 5,
			themeColor: '#FFD700',
			imgidAll: [],
			textareas:null,
		};
	},
	onLoad: function() {
		let that = this;
		//  高度自适应
		uni.getSystemInfo({
			success: function(res) {
				let calc = res.windowHeight;
				that.winHeight = calc;
			}
		});
		this.$http.get(this.$appurl.getBaseByUid).then(res => {
			if (res.success) {
				if (res.result.length > 0) {
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
		this.__init();
	},
	methods: {
		// 初始化事件
		__init() {
			let arr = [];
			for (var i = 0; i < this.tabbar.length; i++) {
				let obj = {
					list: [],
					// 1.上拉加载更多 2.加载中... 3.没有更多了
					loadtext: ''
				};
				// 获取首屏数据
				if (i === 0) {
					obj.list = this.surveydata;
				}

				arr.push(obj);
			}
			this.newsitems = arr;
		},
		onPullDown(done) {
			// 下拉刷新
			let that = this;
			var data = null;
			this.currpage = 1;
			if (this.baseId == -1) {
				data = '?pageNo=' + this.currpage + '&pageSize=' + this.pagesize;
			} else {
				data = '?baseId=' + this.baseId + '&pageNo=' + this.currpage + '&pageSize=' + this.pagesize;
			}
			this.$http.get(this.$appurl.illFeedbackList + data).then(
				res => {
					if (res.success) {
						if (res.result.list != undefined) {
							this.surveydata = res.result.list;
							let index = that.indexs;
							this.newsitems[index].list = this.surveydata;
							let item = this.newsitems[index];
							if (res.result.list.length == 0) {
								item.loadtext = '';
							} else if (res.result.list.length < 5) {
								item.loadtext = '---没有更多了---';
							} else {
								item.loadtext = '上拉加载更多';
							}
						}
						this.allpage = res.result.lastPage;
					}
					setTimeout(() => {
						this.refresh = true;
						let options = {
							msg: '刷新成功',
							duration: 1500,
							type: 'green'
						};
						that.$refs.toast.showTips(options);
						done();
					}, 500);
				},
				error => {
					setTimeout(() => {
						done();
					}, 500);
				}
			);
		},
		onScroll(e) {
			// 监听滚动
		},
		onLoadMore(e) {
			// 加载更多
			setTimeout(() => {
				let len = this.list.length;
				for (let i = 1; i <= 10; i++) {
					this.list.push(len + i);
				}
			}, 1000 * 1);
		},
		scrollTo() {
			this.$refs.scroll.goTop();
		},
		//滚动到顶部时触发
		scrollFn: function(e) {},
		// 滚动切换标签样式
		switchTab: function(e) {
			let that = this;
			this.currentTab = e.detail.current;
			this.checkCor();
			this.changeTab();
		},
		// 点击标题切换当前页时改变样式
		swichNav: function(e) {
			let cur = e.currentTarget.dataset.current;
			if (this.currentTab == cur) {
				return false;
			} else {
				this.currentTab = cur;
			}
		},
		//判断当前滚动超过一屏时，设置tab标题滚动条。
		checkCor: function() {
			if (this.currentTab > 3) {
				//这里距离按实际计算
				this.scrollLeft = 300;
			} else {
				this.scrollLeft = 0;
			}
		},
		gopestdiag(data) {
			var navData = JSON.stringify(data); // 这里转换成 字符串
			uni.navigateTo({
				url: 'pestdiag?datas=' + navData
			});
		},
		changeTab() {
			if (this.currentTab == 0) {
				this.loading(this.currentTab);
			}
		},
		loading(index) {
			let that = this;
			this.indexs = index;
			this.ispullodwn = false;
			var data = null;
			this.currpage = 1;
			if (this.baseId == -1) {
				data = '?pageNo=' + this.currpage + '&pageSize=' + this.pagesize;
			} else {
				data = '?baseId=' + this.baseId + '&pageNo=' + this.currpage + '&pageSize=' + this.pagesize;
			}
			this.isloading = true;
			this.$http.get(this.$appurl.illFeedbackList + data).then(
				res => {
					if (res.success) {
						if (res.result.list != undefined) {
							that.surveydata = res.result.list;
							let index = that.indexs;
							that.newsitems[index].list = that.surveydata;
							let item = that.newsitems[index];
							if (res.result.list.length == 0) {
								item.loadtext = '';
							} else if (res.result.list.length < 5) {
								item.loadtext = '---没有更多了---';
							} else {
								item.loadtext = '上拉加载更多';
							}
						}
						that.allpage = res.result.lastPage;
					}
					that.isloading = false;
				},
				error => {
					that.isloading = false;
				}
			);
		},
		toArr(object) {
			let arr = [];
			if (object[0].name != undefined) {
				for (let i in object) {
					arr.push(object[i].name);
				}
			}
			if (object[0].batchName != undefined) {
				for (let i in object) {
					arr.push(object[i].batchName);
				}
			}
			return arr;
		},
		result(val) {
			this.baseId = val.single;
			this.loading(this.currentTab);
		},
		loadmore(index) {
			let that = this;
			let item = this.newsitems[index];
			if (item.loadtext !== '上拉加载更多') return;
			item.loadtext = '加载中...';
			this.currpage += 1;
			if (this.currpage > this.allpage) {
				item.loadtext = '---没有更多了---';
				return;
			}
			var data = null;
			if (this.baseId == -1) {
				data = '?pageNo=' + this.currpage + '&pageSize=' + this.pagesize;
			} else {
				data = '?baseId=' + this.baseId + '&pageNo=' + this.currpage + '&pageSize=' + this.pagesize;
			}
			this.$http.get(this.$appurl.illFeedbackList + data).then(
				res => {
					if (res.success) {
						if (res.result.list != undefined) {
							let index = that.indexs;
							that.surveydata = [...that.surveydata, ...res.result.list];
							that.newsitems[index].list = that.surveydata;
							if (res.result.list.length < 5) {
								item.loadtext = '---没有更多了---';
							} else {
								item.loadtext = '上拉加载更多';
							}
						}
						this.allpage = res.result.lastPage;
					}
				},
				error => {
					setTimeout(() => {
						done();
					}, 500);
				}
			);
		},
		goaddpest() {
			uni.navigateTo({
				url: 'addpestDiag'
			});
		},
		getupimgList(data) {
			this.imgidAll = data;
		},
		submits() {
			if (this.baseId == -1) {
				uni.showToast({
					position: 'bottom',
					title: '请选择一个基地'
				});
				return;
			}
			this.$refs.upImgs[1].upsurvey();
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
			var data = {
				baseId: this.baseId,
				content: this.textareas,
				pictureInfoList: this.imgidAll
			};
			console.log(this.imgidAll);
			this.$http.post(this.$appurl.feedBackAdd, data).then(res => {
				if (res.success) {
					uni.showToast({
						position: 'bottom',
						title: res.message
					});
					this.textareas = null;
					this.$refs.upImgs[1].clearsurvey();
				}
			});
		},
	}
};
</script>

<style>
page {
	background-color: #eff0f5;
}
/*tabbar start*/
::-webkit-scrollbar {
	width: 0;
	height: 0;
	color: transparent;
}

.tab-view::before {
	content: '';
	position: absolute;
	border-bottom: 1upx solid #eaeef1;
	-webkit-transform: scaleY(0.5);
	transform: scaleY(0.5);
	bottom: 0;
	right: 0;
	left: 0;
}

.tab-view {
	width: 100%;
	height: 100upx;
	overflow: hidden;
	box-sizing: border-box;
	position: fixed;
	top: 40px;
	/* #ifdef H5 */
	top: 84px;
	/* #endif */
	left: 0;
	z-index: 99;
	background: #fff;
	white-space: nowrap;
}

.tab-bar-item {
	padding: 0;
	height: 100upx;
	min-width: 80upx;
	line-height: 100upx;
	margin: 0 28upx;
	display: inline-block;
	text-align: center;
	box-sizing: border-box;
}

.tab-bar-title {
	height: 100upx;
	line-height: 100upx;
	font-size: 32upx;
	color: #999;
	font-weight: 400;
}

.active {
	border-bottom: 6upx solid #fbd855;
}

.active .tab-bar-title {
	color: black !important;
	font-size: 36upx;
	font-weight: bold;
}

/*tabbar end*/
.scoll-y {
	height: 100%;
}

.list-view {
	margin-top: 100upx;
	width: 100%;
	background: #fff;
	box-sizing: border-box;
	padding-bottom: env(safe-area-inset-bottom);
}

.list-cell {
	padding: 30upx;
	box-sizing: border-box;
}

.cell-title-box {
	display: flex;
	justify-content: space-between;
}

.cell-title {
	font-size: 36upx;
	line-height: 56upx;
	word-break: break-all;
	overflow: hidden;
	text-overflow: ellipsis;
	display: -webkit-box;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 2;
	/* padding-bottom: 30upx; */
}

.img-container {
	width: 100%;
	padding-top: 24upx;
	display: flex;
	height: 160upx;
	justify-content: space-between;
}

.cell-img {
	width: 32%;
	overflow: hidden;
	position: relative;
}

.img {
	width: 100%;
	height: 160upx;
	display: block;
	/* position: absolute;
		  left: 50%;
		  top:50%;
		  transform: translate(-50%,-50%);
		*/
	border-radius: 4upx;
}

.sub-title {
	padding-top: 24upx;
	font-size: 28upx;
	color: #bcbcbc;
	display: flex;
	align-items: center;
}

.badge {
	padding: 5upx 10upx;
	font-size: 24upx;
	border-radius: 4upx;
	margin-right: 20upx;
}

.b-red {
	background: #fcebef;
	color: #8a5966;
}

.b-blue {
	background: #ecf6fd;
	color: #4dabeb;
}

.b-orange {
	background: #fef5eb;
	color: #faa851;
}

.b-green {
	background: #e8f6e8;
	color: #44cf85;
}
.tab-bar-item {
	flex: 1;
}
.mask {
	position: fixed;
	top: 0;
	left: 0;
	z-index: 999;
	width: 100%;
	height: 100vh;
	background: rgba(255, 255, 255, 0);
}
.slfiter {
	/* height: 40px;
	line-height: 40px;
	background: white;
	position: fixed;
	width: 100%;
	overflow: hidden;
	box-sizing: border-box;
	top: 0px;
	left: 0;
	z-index: 99;
	background: #fff;
	white-space: nowrap; */
	/* border-bottom: 1px solid #FBD855;
		border-top: 1px solid #FBD855; */
}
.tab-content {
	margin-top: 38px;
}
.container {
	overflow: auto;
}
.scroll-box {
	border-radius: 20rpx;
	background: white;
	height: 158rpx;
	margin-top: 40rpx;
	position: relative;
}
.scoll-box-top {
	height: 79rpx;
	position: relative;
	line-height: 79rpx;
	padding-left: 96rpx;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}
.scoll-box-bottom {
	height: 164rpx;
	padding: 0rpx 20rpx;
}
.scoll-box-bottomtop {
	height: 148rpx;
	background: #f8f9fd;
	border-radius: 20rpx;
	display: flex;
	flex-direction: column;
}
.circle {
	background: #55b9fb;
	width: 18rpx;
	height: 18rpx;
	border-radius: 50%;
	-webkit-border-radius: 50%;
	-moz-border-radius: 50%;
	position: absolute;
	left: 40rpx;
	top: 36rpx;
}
.scoll-box-contont {
	flex: 1;
	padding-left: 64rpx;
	color: #bcbcc8;
	line-height: 72rpx;
	position: relative;
}
.scoll-box-img {
	height: 36rpx;
	width: 36rpx;
	position: absolute;
	left: 40rpx;
	top: 20rpx;
}
#addImg {
	position: fixed;
	z-index: 999;
	right: 40rpx;
	bottom: 104rpx;
	width: 110rpx;
	height: 110rpx;
	background: url(data:image/png;base64,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);
	background-repeat: no-repeat;
	background-size: 100% 100%;
}
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
	color: #13b482;
}
</style>
