<template>
	<view class="container">
		<view v-if="isshowindex">
			<tui-loading :visible="isloading"></tui-loading>
			<view class="mask" v-if="isloading"></view>
			<tui-tipss ref="toast"></tui-tipss>
			<view class="pickers" @click="openpick">
				<picker :value="value" mode="multiSelector" @change="picker" :range="multiArray" @columnchange="columnPicker" @cancel="pickercan">
					<view v-if="isnoarr" style="line-height: 40px;text-align: center;position: relative">
						批次显示:
						<text style="margin-left: 5rpx;">全部</text>
						<view class="sanjiao" v-if="!openpicks"></view>
						<view class="sanjiaos" v-if="openpicks"></view>
					</view>
					<view style="display: flex;text-align: center;height: 40px;" v-if="!isnoarr">
						<view style="flex: 1;line-height: 40px;">基地:{{ basename }}</view>
						<view style="flex: 1;line-height: 40px;">批次:{{ batchname }}</view>
					</view>
				</picker>
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
						<you-scroll ref="scroll" @onPullDown="onPullDown" @onScroll="onScroll" @onLoadMore="loadmore(index)" :refresh="refresh">
							<view style="padding:0rpx 44rpx;">
								<view v-if="item.list == ''"><tui-tips :fixed="false" imgUrl="../../static/images/img_nodata.png">暂无工单数据</tui-tips></view>
								<view class="scroll-box" v-if="item.list != []" v-for="(items, indexs) in item.list" :key="indexs" @click="goplant(items)">
									<view class="scrollwire" v-if="indexs + 1 != item.list.length"></view>
									<view class="scoll-box-top">
										<view class="circle"></view>
										{{ items.farmingItem.farmingName }}
									</view>
									<view class="scoll-box-bottom">
										<view class="scoll-box-bottomtop">
											<view class="scoll-box-contont">
												<image src="../../static/images/plant02.png" class="scoll-box-img"></image>
												{{ items.executionTime }}
											</view>
											<view class="scoll-box-contont">
												<image src="../../static/images/plant01.png" class="scoll-box-img" style="height: 22rpx;width: 16rpx;"></image>
												{{ items.baseName }}
												<text style="margin-left: 20rpx;">{{ items.batchName }}</text>
											</view>
										</view>
									</view>
								</view>
							</view>
							<!-- 上拉加载更多 -->
							<view class="d-flex a-center j-center text-light-muted font-md py-3">{{ item.loadtext }}</view>
						</you-scroll>
					</swiper-item>
				</swiper>
			</view>
		</view>
		<view v-if="!isshowindex">
			<view style="margin-top: 250rpx;text-align: center;">
				<image src="../../static/images/nojur.png" style="width: 450rpx;height: 272rpx;margin: 0 auto;margin-bottom: 116rpx;"></image>
				<text style="color: rgba(43,149,255,1);font-size: 20px;">\n暂无权限访问</text>
			</view>
		</view>
	</view>
</template>

<script>
import tuiLoading from '@/components/loading/loading.vue';
import tuiTips from '@/components/tips/tips.vue';
import uniIcon from '@/components/uni-icon/uni-icon.vue';
import youScroll from '@/components/you-scroll.vue';
import tuiTipss from '@/components/messtips/messtips.vue';
export default {
	components: {
		tuiLoading,
		tuiTips,
		uniIcon,
		youScroll,
		tuiTipss
	},
	data() {
		return {
			list: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
			isloading: false,
			tabbar: ['未执行', '待审核', '审核未过', '审核通过'],
			winHeight: '', //窗口高度
			currentTab: 0, //预设当前项的值
			scrollLeft: 0, //tab标题的滚动条位置
			userOrder: [],
			multiArray: [],
			selectList: [
				{
					children: [
						{
							batchName: '全部'
						}
					],
					name: '全部'
				}
			],
			value: [0, 0],
			basename: null,
			batchname: null,
			isnoarr: true,
			batchIds: -1,
			openpicks: false,
			indexs: 0,
			codes: null,
			refresh: false,
			pickervalue: [],
			newsitems: [],
			allpage: 0,
			currpage: 1,
			pagesize: 5,
			menus: [],
			isshowindex: true,
			clientid: ''
		};
	},
	onLoad: function() {
		this.getUserMenus();
		let that = this;
		//  高度自适应
		uni.getSystemInfo({
			success: function(res) {
				let calc = res.windowHeight;
				that.winHeight = calc;
			}
		});
		this.getpick();
		this.loading(this.indexs);
		this.__init();
	},
	mounted() {
		this.$http.get(this.$appurl.getUserInfo).then(res => {
			if (res.success) {
				var userid = res.result.uid;
				this.getuid(userid);
			}
		});
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
					obj.list = this.userOrder;
				}

				arr.push(obj);
			}
			this.newsitems = arr;
		},
		getUserMenus() {
			this.menus = [];
			this.$http.get(this.$appurl.getUserMenu).then(res => {
				if (res.success) {
					if (res.result[0].name != '种植任务') {
						this.isshowindex = false;
					}
					for (let index in res.result) {
						if (res.result[index].name == '种植任务') {
							continue;
						}
						this.menus.push(res.result[index].name);
					}
					var menuList = this.menus;
					try {
						uni.setStorageSync('menuList', menuList); //存入缓存
					} catch (e) {
						// error
					}
				}
			});
		},
		onPullDown(done) {
			// 下拉刷新
			let that = this;
			var data = null;
			this.currpage = 1;
			if (this.batchIds == -1) {
				data = '?status=' + this.codes + '&pageNo=' + this.currpage + '&pageSize=' + this.pagesize;
			} else {
				data = '?status=' + this.codes + '&batchId=' + this.batchIds + '&pageNo=' + this.currpage + '&pageSize=' + this.pagesize;
			}
			this.$http.get(this.$appurl.getUserOrder + data).then(
				res => {
					if (res.success) {
						if (res.result.list != undefined) {
							this.userOrder = res.result.list;
							let index = that.indexs;
							this.newsitems[index].list = this.userOrder;
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
		goplant(item) {
			if (item.status.code == 'UNEXECUTED') {
				uni.navigateTo({
					url: '../plant/plandetails?id=' + item.id + '&farmId=' + item.farmingItem.id
				});
			} else {
				var datas = JSON.stringify(item);
				uni.navigateTo({
					url: '../plant/plandetailsAll?datas=' + datas
				});
			}
		},
		changeTab() {
			this.loading(this.currentTab);
		},
		loading(index) {
			let that = this;
			var codes = null;
			this.indexs = index;
			this.ispullodwn = false;
			if (index == 0) {
				codes = 'UNEXECUTED';
			} else if (index == 1) {
				codes = 'NOT_AUDITED';
			} else if (index == 2) {
				codes = 'AUDIT_FAILED';
			} else {
				codes = 'AUDIT_APPROVAL';
			}
			this.codes = codes;
			this.isloading = true;
			var data = null;
			this.currpage = 1;
			if (this.batchIds == -1) {
				data = '?status=' + this.codes + '&pageNo=' + this.currpage + '&pageSize=' + this.pagesize;
			} else {
				data = '?status=' + this.codes + '&batchId=' + this.batchIds + '&pageNo=' + this.currpage + '&pageSize=' + this.pagesize;
			}
			this.$http.get(this.$appurl.getUserOrder + data).then(
				res => {
					if (res.success) {
						if (res.result.list != undefined) {
							this.userOrder = res.result.list;
							let index = that.indexs;
							this.newsitems[index].list = this.userOrder;
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
					this.isloading = false;
				},
				error => {
					this.isloading = false;
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
		getpick() {
			let that = this;
			(that.multiArray = []),
				(that.selectList = [
					{
						children: [
							{
								batchName: '全部'
							}
						],
						name: '全部'
					}
				]),
				this.$http.get(this.$appurl.getBaseTreeByUid).then(res => {
					if (res.success) {
						that.selectList = [...that.selectList, ...res.result];
						if (that.selectList.length > 0) {
							this.multiArray = [that.toArr(that.selectList), that.toArr(that.selectList[0].children)];
						}
					}
				});
		},
		columnPicker: function(e) {
			//第几列 下标从0开始
			let column = e.detail.column;
			//第几行 下标从0开始
			let value = e.detail.value;
			if (column === 0) {
				this.multiArray = [this.multiArray[0], this.toArr(this.selectList[value].children)];
				this.value = [value, 0];
			} else if (column === 1) {
				this.multiArray = [this.multiArray[0], this.multiArray[1]];
				this.value = [this.value[0], value];
			}
		},
		picker: function(e) {
			let value = e.detail.value;
			if (this.selectList.length > 0) {
				this.basename = this.selectList[value[0]].name;
				this.batchname = this.selectList[value[0]].children[value[1]].batchName;
				if (this.basename == '全部') {
					this.isnoarr = true;
					this.openpicks = false;
				} else {
					this.isnoarr = false;
				}
				var ids = this.selectList[value[0]].children[value[1]].id;
				if (ids == undefined) {
					this.batchIds = -1;
				} else {
					this.batchIds = this.selectList[value[0]].children[value[1]].id;
				}
				this.loading(this.indexs);
			}
		},
		pickercan() {
			this.openpicks = false;
		},
		openpick() {
			this.getpick();
			this.openpicks = true;
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
			if (this.batchIds == -1) {
				data = '?status=' + this.codes + '&pageNo=' + this.currpage + '&pageSize=' + this.pagesize;
			} else {
				data = '?status=' + this.codes + '&batchId=' + this.batchIds + '&pageNo=' + this.currpage + '&pageSize=' + this.pagesize;
			}
			this.$http.get(this.$appurl.getUserOrder + data).then(
				res => {
					if (res.success) {
						if (res.result.list != undefined) {
							let index = that.indexs;
							that.userOrder = [...that.userOrder, ...res.result.list];
							that.newsitems[index].list = that.userOrder;
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

			// setTimeout(()=>{
			// 	// 加载数据
			// 	item.list = [ ...item.list, ...demo2 ];
			// 	// 恢复状态
			// 	item.loadtext = '上拉加载更多'
			// }, 2000);
		},
		getuid(userid) {
			let that = this;
			setTimeout(() => {
				uni.subscribePush({
					provider: 'mipush',
					success: function(res) {
						var data = {
							userId: userid,
							cid: res.clientid
						};
						// that.$http.post(that.$appurl.addCid, data).then(res => {
							
						// });
					}
				});
			}, 2000);
		}
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
.pickers {
	height: 40px;
	line-height: 40px;
	background: white;
	width: 100%;
	overflow: hidden;
	box-sizing: border-box;
	position: fixed;
	top: 0px;
	left: 0;
	z-index: 99;
	white-space: nowrap;
	/* border-bottom: 1px solid #FBD855;
		border-top: 1px solid #FBD855; */
}
.sanjiao {
	width: 0;
	height: 0;
	border-width: 14rpx;
	border-style: solid;
	border-color: #808080 transparent transparent transparent;
	position: absolute;
	top: 36rpx;
	left: 480rpx;
}
.sanjiaos {
	width: 0;
	height: 0;
	border-width: 14rpx;
	border-style: solid;
	border-color: transparent transparent #4682b4 transparent;
	position: absolute;
	top: 23rpx;
	left: 480rpx;
}
.tab-content {
	margin-top: 89px;
}
.container {
	overflow: auto;
}
.scroll-box {
	border-radius: 20rpx;
	background: white;
	height: 248rpx;
	margin-top: 40rpx;
	position: relative;
}
.scoll-box-top {
	height: 84rpx;
	position: relative;
	line-height: 84rpx;
	padding-left: 85rpx;
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
.scrollwire {
	position: absolute;
	height: 40rpx;
	width: 100%;
	bottom: -40rpx;
	left: 44rpx;
	border-left: 1px dashed #707070;
}
.scoll-box-img {
	height: 20rpx;
	width: 20rpx;
	position: absolute;
	left: 20rpx;
	top: 26rpx;
}
</style>
