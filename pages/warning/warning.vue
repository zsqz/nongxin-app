<template>
	<view class="container">
		<tui-loading :visible="isloading"></tui-loading>
		<view class="mask" v-if="isloading"></view>
		<tui-tipss ref="toast"></tui-tipss>
		<view class="slfiter"><sl-filter :themeColor="themeColor" :menuList="menuList" @result="result"></sl-filter></view>
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
				<swiper-item v-if="newsitems.length" v-for="(item, index) in newsitems" :key="index">
					<you-scroll ref="scroll" @onPullDown="onPullDown" @onScroll="onScroll" @onLoadMore="loadmore(index)" :refresh="refresh">
						<view style="padding:0rpx 44rpx;">
							<view v-if="item.list == ''"><tui-tips :fixed="false" imgUrl="../../static/images/img_nodata.png">暂无工单数据</tui-tips></view>
							<view class="scroll-box" v-if="item.list != []" v-for="(items, indexs) in item.list" :key="indexs" @click="gowarnshow(items)">
								<view class="scoll-box-top" style="padding-top: 10rpx;">
									<view class="scollbox-warn">
										{{ items.warnRecord[0].content }}
										<text :class="getStringWarn(items.warnRecord[0].content) ? 'blueColors' : ''" style="margin-left: 20rpx;color: red;">
											{{ items.warnRecord[0].value }}{{ items.warnRecord[0].unit }}
										</text>
									</view>
									<view v-if="items.warnRecord.length>1" class="scollbox-warn">
										{{ items.warnRecord[1].content }}
										<text :class="getStringWarns(items) ? 'blueColors' : ''" style="margin-left: 20rpx;color: red;">
											{{ items.warnRecord[1].value }}{{ items.warnRecord[1].unit }}
										</text>
									</view>
								</view>
								<view class="scoll-box-bottom">
									<view class="scoll-box-bottomtop">
										<view class="scoll-box-contont">
											<image src="../../static/images/plant02.png" class="scoll-box-img"></image>
											{{ items.warnTime }}
										</view>
										<view class="scoll-box-contont">
											<image src="../../static/images/plant01.png" class="scoll-box-img" style="height: 22rpx;width: 16rpx;"></image>
											{{ items.baseName }}
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
</template>

<script>
import tuiLoading from '@/components/loading/loading.vue';
import tuiTips from '@/components/tips/tips.vue';
import uniIcon from '@/components/uni-icon/uni-icon.vue';
import youScroll from '@/components/you-scroll.vue';
import tuiTipss from '@/components/messtips/messtips.vue';
import slFilter from '@/components/songlazy-sl-filter/sl-filter/sl-filter.vue';
export default {
	components: {
		tuiLoading,
		tuiTips,
		uniIcon,
		youScroll,
		tuiTipss,
		slFilter
	},
	data() {
		return {
			isloading: false,
			tabbar: ['当天', '本周', '本月'],
			winHeight: '', //窗口高度
			currentTab: 0, //预设当前项的值
			scrollLeft: 0, //tab标题的滚动条位置
			warndata: [],
			multiArray: [],
			menuList: [
				{
					title: '基地选择',
					detailTitle: '请选择基地（可多选）',
					isMutiple: true,
				    'key': 'baseIds',
					defaultSelectedIndex: [0],
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
			baseIds: [],
			indexs: 0,
			refresh: false,
			newsitems: [],
			allpage: 0,
			currpage: 1,
			pagesize: 5,
			themeColor: '#FFD700',
			textareas: null,
			savebaseIds:null,
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
					obj.list = this.warndata;
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
			var type = this.currentTab + 1;
			if (this.baseIds.length == 0) {
				data = "?pageNo=" + this.currpage + "&pageSize=" + this.pagesize +"&typeId=" +type 
			} else {
				data = "?pageNo=" + this.currpage + "&pageSize=" + this.pagesize +"&typeId=" +type + "&baseId=" + this.baseIds
			}
			this.$http.get(this.$appurl.getWarnRecord2+data).then(
				res => {
					if (res.success) {
						if (res.result.list != undefined) {
							this.warndata = res.result.list;
							let index = that.indexs;
							this.newsitems[index].list = this.warndata;
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
			this.loading(this.currentTab);
		},
		loading(index) {
			let that = this;
			this.indexs = index;
			this.ispullodwn = false;
			var data = null;
			this.currpage = 1;
			var type = this.currentTab + 1;
			if (this.baseIds.length == 0) {
				data = "?pageNo=" + this.currpage + "&pageSize=" + this.pagesize +"&typeId=" +type 
			} else {
				data = "?pageNo=" + this.currpage + "&pageSize=" + this.pagesize +"&typeId=" +type + "&baseId=" + this.baseIds
			}
			this.isloading = true;
			this.$http.get(this.$appurl.getWarnRecord2+data).then(
				res => {
					if (res.success) {
						if (res.result.list != undefined) {
							that.warndata = res.result.list;
							let index = that.indexs;
							that.newsitems[index].list = that.warndata;
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
			this.baseIds = [];
			for(let index in val.baseIds){
				if(val.baseIds[index]==-1){
					val.baseIds.splice(index,1)
				}
			}
			if(val.baseIds==''){
				this.baseIds= []
			}
			if(val.baseIds.length>0){
				for(let index in val.baseIds){
					this.baseIds.push(val.baseIds[index])
				}
				this.savebaseIds = JSON.stringify(this.baseIds);
			}
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
			var type = this.currentTab + 1;
			if (this.baseIds.length == 0) {
				data = "?pageNo=" + this.currpage + "&pageSize=" + this.pagesize +"&typeId=" +type 
			} else {
				data = "?pageNo=" + this.currpage + "&pageSize=" + this.pagesize +"&typeId=" +type + "&baseId=" + this.baseIds
			}
			this.$http.get(this.$appurl.getWarnRecord2+data).then(
				res => {
					if (res.success) {
						if (res.result.list != undefined) {
							let index = that.indexs;
							that.warndata = [...that.warndata, ...res.result.list];
							that.newsitems[index].list = that.warndata;
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
		getStringWarn(value) {
			return value.indexOf('偏低') > -1
		},
		getStringWarns(item){
			if(item.warnRecord.length>1){
				return item.warnRecord[1].content.indexOf('低') >-1
			 }
			return false
		},
		gowarnshow(item){
			var datas = JSON.stringify(item);
			uni.navigateTo({
				url: 'warnshow?datas=' + datas
			});
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
.scoll-box-bottom {
	height: 164rpx;
	padding: 0rpx 20rpx;
}
.scroll-box {
	border-radius: 20rpx;
	background: white;
	margin-top: 40rpx;
	position: relative;
}
.scoll-box-top {
	position: relative;
	padding-left: 40rpx;
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
	height: 20rpx;
	width: 20rpx;
	position: absolute;
	left: 20rpx;
	top: 26rpx;
}
.select-tab .select-tab-item {
	width: calc(100%) !important;
}
.blueColors {
	color: #2b95ff !important;
}
.scollbox-warn{
	margin: 20rpx 0rpx;
}
</style>
