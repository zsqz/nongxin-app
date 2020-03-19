<template>
	<view class="warp">
		<view v-if="deviceActList!=[]&&deviceActList!=''">
			<view v-for="(item,index) in deviceActList" :key="item.id"  class="box" style="height: 704rpx;">
				<view class="boxtitle">设备信息</view>
				<view class="boxcontont">
					<view class="contont-text">名称</view>
					<view class="contont-texts">{{ item.deviceName }}</view>
				</view>
				<view class="boxcontont">
					<view class="contont-text">单位</view>
					<view class="contont-texts">{{ item.company }}</view>
				</view>
				<view class="boxcontont">
					<view class="contont-text">计划单价</view>
					<view class="contont-texts">{{ item.preUnitPrice }}</view>
				</view>
				<view class="boxcontont">
					<view class="contont-text">计划总量</view>
					<view class="contont-texts">{{ item.preUnitCount }}</view>
				</view>
				<view class="boxcontont">
					<view class="contont-text">实际单价</view>
					<view class="contont-texts">
						<input type="number" v-model="devNumber01[index]" placeholder="请填写" class="contont-inputs"/>
					</view>
				</view>
				<view class="boxcontont" style="border: 0rpx;height: 114rpx;">
					<view class="contont-text">实际总量</view>
					<view class="contont-texts">
						<input type="number" v-model="devNumber02[index]" placeholder="请填写" class="contont-inputs"/>
					</view>
				</view>
			</view>
		</view>
		<view v-if="personnelActList!=[]&&personnelActList!=''">
			<view v-for="(item,index) in personnelActList" :key="item.id" class="box">
				<view class="boxtitle">人员信息</view>
				<view class="boxcontont">
					<view class="contont-text">名称</view>
					<view class="contont-texts">{{ item.personName }}</view>
				</view>
				<view class="boxcontont">
					<view class="contont-text">计划人天数</view>
					<view class="contont-texts">{{ item.preUnitCount }}</view>
				</view>
				<view class="boxcontont">
					<view class="contont-text">计划工资(元/人天)</view>
					<view class="contont-texts">{{ item.preUnitPrice }}</view>
				</view>
				<view class="boxcontont">
					<view class="contont-text">实际人天数</view>
					<view class="contont-texts">
						<input type="number" v-model="perNumber01[index]" placeholder="请填写" class="contont-inputs"/>
					</view>
				</view>
				<view class="boxcontont" style="border: 0rpx;height: 114rpx;">
					<view class="contont-text">实际工资</view>
					<view class="contont-texts">
						<input type="number" v-model="perNumber02[index]" placeholder="请填写" class="contont-inputs"/>
					</view>
				</view>
			</view>
		</view>
		<view v-if="materialActList!=''&&materialActList!=[]">
			<view v-for="(item,index) in materialActList" :key="item.id" class="box" style="height: 704rpx;">
				<view class="boxtitle">物料信息</view>
				<view class="boxcontont">
					<view class="contont-text">名称</view>
					<view class="contont-texts">{{ item.materialName }}</view>
				</view>
				<view class="boxcontont">
					<view class="contont-text">单位</view>
					<view class="contont-texts">{{ item.company }}</view>
				</view>
				<view class="boxcontont">
					<view class="contont-text">计划单价</view>
					<view class="contont-texts">{{ item.preUnitPrice }}</view>
				</view>
				<view class="boxcontont">
					<view class="contont-text">计划总量</view>
					<view class="contont-texts">{{ item.preUnitCount }}</view>
				</view>
				<view class="boxcontont">
					<view class="contont-text">实际单价</view>
					<view class="contont-texts">
						<input type="number" v-model="matNumber01[index]" placeholder="请填写" class="contont-inputs"/>
					</view>
				</view>
				<view class="boxcontont" style="border: 0rpx;height: 114rpx;">
					<view class="contont-text">实际总量</view>
					<view class="contont-texts">
						<input type="number" v-model="matNumber02[index]" placeholder="请填写" class="contont-inputs"/>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import tTable from '@/components/t-table/t-table.vue';
	import tTh from '@/components/t-table/t-th.vue';
	import tTr from '@/components/t-table/t-tr.vue';
	import tTd from '@/components/t-table/t-td.vue';
	export default {
		components: {
			tTable,
			tTh,
			tTr,
			tTd
		},
		data() {
			return {
				devNumber01: [],
				devNumber02: [],
				perNumber01: [],
				perNumber02: [],
				matNumber01: [],
				matNumber02: [],
				deviceActList: [],
				personnelActList: [],
				materialActList: [],
				deviceActLists: [],
				personnelActLists: [],
				materialActLists: [],
				devAll: [],
				perAll: [],
				materAll: [],
				isover:false,
			};
		},
		props: {
			ids: Number
		},
		mounted() {
			let that = this;
			this.$http.get(this.$appurl.getOrderCosts + "?id=" + this.ids).then((res) => {
				this.deviceActList = res.result.deviceActList;
				this.personnelActList = res.result.personnelActList;
				this.materialActList = res.result.materialActList;
				if(this.deviceActList!=''){
					for(let index in that.deviceActList){
						that.devNumber01.push(that.deviceActList[index].actUnitPrice)
						that.devNumber02.push(that.deviceActList[index].actUnitCount)
					}
				}
				if(this.personnelActList!=''){
					for(let index in that.personnelActList){
						that.perNumber01.push(that.personnelActList[index].actUnitCount)
						that.perNumber02.push(that.personnelActList[index].actUnitPrice)
					}
				}
				if(this.materialActList!=''){
					for(let index in that.materialActList){
						that.matNumber01.push(that.materialActList[index].actUnitPrice)
						that.matNumber02.push(that.materialActList[index].actUnitCount)
					}
				}
			})
		},
		methods: {
			change(e) {
				console.log(e.detail);
			},
			edit(item) {
				uni.showToast({
					title: item.name,
					icon: 'none'
				});
			},
			trimSpace(array) {
				for (var i = 0; i < array.length; i++) {
					if (array[i]=="" || typeof(array[i]) == "undefined" || array[i]==null) {
						array.splice(i, 1);
						i = i - 1;
					}
				}
				return array;
			},
			uptasks() {
				let _that = this;
				if (this.deviceActList != [] && this.deviceActList != '') {
					this.trimSpace(this.devNumber01);
					this.trimSpace(this.devNumber02);
					if (this.devNumber01.length != this.deviceActList.length || this.devNumber02.length != this.deviceActList.length) {
						uni.showToast({
							position: 'bottom',
							title: '设备信息未填写完成'
						})
						_that.isover=false
						return false;
					}{
						_that.isover=true
					}
					for (let index in this.deviceActList) {
						_that.devAll.push(_that.deviceActList[index].id);
					}
					for (let i = 0; i < this.devNumber01.length; i++) {
						_that.deviceActLists.push({
							actUnitCount: _that.devNumber01[i],
							actUnitPrice: _that.devNumber02[i],
							actCal: _that.devNumber01[i] * _that.devNumber02[i],
							id: _that.devAll[i]
						})
					}
				}
				if (this.personnelActList != [] && this.personnelActList != '') {
					this.trimSpace(this.perNumber01);
					this.trimSpace(this.perNumber02);
					if (this.perNumber01.length != this.personnelActList.length || this.perNumber02.length != this.personnelActList.length) {
						uni.showToast({
							position: 'bottom',
							title: '人员信息未填写完成'
						})
						_that.isover=false
						return false;
					}{
						_that.isover=true
					}
					for (let index in this.personnelActList) {
						_that.perAll.push(_that.personnelActList[index].id);
					}
					for (let i = 0; i < this.perNumber01.length; i++) {
						_that.personnelActLists.push({
							actUnitCount: _that.perNumber02[i],
							actUnitPrice: _that.perNumber01[i],
							actCal: _that.perNumber01[i] * _that.perNumber02[i],
							id: _that.perAll[i]
						})
					}
				}
				if (this.materialActList != [] && this.materialActList != '') {
					this.trimSpace(this.matNumber01);
					this.trimSpace(this.matNumber02);
					if (this.matNumber01.length != this.materialActList.length || this.matNumber02.length != this.materialActList.length) {
						uni.showToast({
							position: 'bottom',
							title: '物料信息未填写完成'
						})
						_that.isover=false
						return false;
					}{
						_that.isover=true
					}
					for (let index in this.materialActList) {
						_that.materAll.push(_that.materialActList[index].id);
					}
					for (let i = 0; i < this.matNumber01.length; i++) {
						_that.materialActLists.push({
							actUnitCount: _that.matNumber01[i],
							actUnitPrice: _that.matNumber02[i],
							actCal: _that.matNumber01[i] * _that.matNumber02[i],
							id: _that.materAll[i]
						})
					}
				}
				var datas = {};
				datas.dev = this.deviceActLists
				datas.per = this.personnelActLists
				datas.mat = this.materialActLists
				this.$emit('func', datas)
				this.$emit('funcs', this.isover)
			}
		}
	};
</script>

<style scoped>
	.box {
		background-color: white;
		height: 600rpx;
		border-radius: 20rpx;
		margin: 40rpx 0rpx;
		box-shadow:0px 1px 5px rgba(0,0,0,0.16);
	}

	.textTitle {
		font-size: 16px;
		font-weight: 700;
	}
	.boxtitle{
		height: 74rpx;
		background: rgba(242,251,247,1);
		border-radius: 20rpx;
		color: rgba(19,180,130,1);
		font-size: 16px;
		padding-left: 40rpx;
		line-height: 74rpx;
	}
	.boxcontont{
		height: 104rpx;
		display: flex;
		font-size: 16px;
		padding-left: 32rpx;
		border-bottom: 1px solid rgba(238,238,238,1);
	}
	.contont-text{
		flex: 2;
		line-height: 104rpx;
	}
	.contont-texts{
		flex: 1;
		line-height: 104rpx;
	}
	.contont-inputs{
		margin-top: 25rpx;
		font-weight: 700;
	}
</style>
