<template>
	<view class="image-drag-sort">
		<view class="inner">
			<movable-area class="movable-area">
				<view class="item" v-for="(item, index) in lists" :key="index" @click="imageTap(index)">
					<view class="imgRemove" @click.stop="imageDel(index)">
						<icon type="clear" size="20" />
					</view>
					<image class="img" :src="item" mode="aspectFill"></image>
				</view>
				<view class="img-upload-btn item" @click="imageUpload" v-if="lists.length < 9 && !active">
					<view class="icon">
						<image class="img" src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDIzLjAuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IuWbvuWxgl8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCIKCSB2aWV3Qm94PSIwIDAgNDggNDgiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDQ4IDQ4OyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+CjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI+Cgkuc3Qwe2ZpbGw6I0NDQ0NDQzt9Cgkuc3Qxe2ZpbGw6bm9uZTt9Cjwvc3R5bGU+Cjx0aXRsZT5SZWN0YW5nbGUtcGF0aDwvdGl0bGU+CjxkZXNjPkNyZWF0ZWQgd2l0aCBTa2V0Y2guPC9kZXNjPgo8cGF0aCBpZD0iU2hhcGUiIGNsYXNzPSJzdDAiIGQ9Ik0yNCwzLjNDMTIuNSwzLjMsMy4yLDEyLjYsMy4yLDI0UzEyLjUsNDQuNywyNCw0NC43UzQ0LjgsMzUuNCw0NC44LDI0UzM1LjUsMy4zLDI0LDMuM0wyNCwzLjN6CgkgTTM0LjUsMjYuMmgtOC4zdjguM2MwLDEuMi0xLDIuMi0yLjIsMi4yYy0xLjIsMC0yLjItMS0yLjItMi4ydi04LjNoLTguM2MtMS4yLDAtMi4yLTEtMi4yLTIuMnMxLTIuMiwyLjItMi4yaDguM3YtOC4zCgljMC0xLjIsMS0yLjIsMi4yLTIuMmMxLjIsMCwyLjIsMSwyLjIsMi4ydjguM2g4LjNjMS4yLDAsMi4yLDEsMi4yLDIuMlMzNS43LDI2LjIsMzQuNSwyNi4yeiIvPgo8cmVjdCBpZD0iUmVjdGFuZ2xlLXBhdGgiIHk9IjAiIGNsYXNzPSJzdDEiIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIvPgo8L3N2Zz4K"></image>
					</view>
					<text class="text">添加新图片</text>
				</view>
				<movable-view class="movable-view" :x="x" :y="y" direction="all" damping="5000" friction="1" v-show="active">
					<view class="item-move" :class="{'item-move-active': active}">
						<image class="img" :src="lists[beginIndex]" mode="aspectFill"></image>
					</view>
				</movable-view>
			</movable-area>
		</view>
	</view>
</template>
<script>
	export default {
		name: 'image-drag-sort',
		data() {
			return {
				lists: this.list,
				active: false, // 是否拖拽状态
				flag: false, // 是否可拖拽
				x: 0,
				y: 0,
				dataImg: [],
				saveData: [],
				imgidAll: [],
				saveImglength: 0,
				removeAllid:[],
			}
		},
		props: {
			list: {
				type: Array,
				default: function() {
					return []
				}
			},
			recordId: Number,
			uploadsur: Boolean,
			uploadpest: Boolean,
			imgdata:Array,
			picturIds:Array
		},
		mounted() {
			let l = this.imgdata.length
			if (l) { // 有图片时初始化
				this.lists=this.imgdata.concat();
				this.saveImglength = l;
				this.dataImg=this.imgdata.concat();
				this.imgidAll=this.picturIds;
				this.init()
			}
		},
		methods: {
			imageTap(i) { // 图片点击事件
				this.previewImage(i);
			},
			previewImage(i) { // 预览图片
				uni.previewImage({
					current: this.lists[i],
					urls: this.lists,
					loop: "true",
					indicator: 'default'
				})
			},
			imageUpload() {
				// let itemList = ['图片（从手机相册选择）', '图片（拍摄）']
				// uni.showActionSheet({
				// 	itemList: itemList,
				// 	success: res => {
				// 		this.chooseImage(res.tapIndex)
				// 	}
				// })
				this.chooseImage();
			},
			chooseImage() { // 选择图片
				const count = 9 - this.lists.length
				uni.chooseImage({
					count: count,
					sizeType: ['original', 'compressed'],
					sourceType: ['camera', 'album'],
					success: res => {
						this.upload(res.tempFilePaths)
					}
				})
			},
			upload(e) { // 可多图上传，不需要的可改成单一上传
				let that = this;
				uni.hideLoading()
				let data = this.lists
				for (let i = 0, l = e.length; i < l; i++) {
					data.push(e[i])
				}
				// let arr = this.getArrDifference(data, this.saveData);
				var completeImages = 0;
				if (data.length > this.saveImglength) {
					var lengths = that.saveImglength
					for (let i = this.saveImglength; i < data.length; i++) {
						var url = null;
						var formdata = null;
						if(this.uploadsur){
							url = this.$http.common.baseUrl + this.$appurl.addFeedBackPic
							formdata={
								'file': data[i]
							}
						}else if(this.uploadpest){
							url = this.$http.common.baseUrl + this.$appurl.addIllFeedbackPic
							formdata={
								'file': data[i]
							}
						}else{
							url = this.$http.common.baseUrl + this.$appurl.addOrderPic;
							formdata={
								'file': data[i],
								'recordId': that.recordId
							}
						}
						uni.uploadFile({
							url: url,
							filePath: data[i],
							name: 'file',
							formData: formdata,
							success: function(uploadFileRes) {
								var showLen = data.length-lengths
								completeImages++
								uni.showToast({
									title: '上传进度：' + completeImages + '/' + showLen ,
									icon: 'none',
									mask: false
								});
								var objects = JSON.parse(uploadFileRes.data);
								that.imgidAll.push({id:objects.result.id});
								that.removeAllid.push(objects.result.id);
							    that.dataImg.push(data[i]);
								that.lists = that.dataImg.concat();
							}
						});
					}
				}
				this.saveImglength = data.length;
				let arr = data;
				this.saveData = data;
			},
			getArrDifference(arr1, arr2) {
				return arr1.concat(arr2).filter(function(v, i, arr) {
					return arr.indexOf(v) === arr.lastIndexOf(v);
				});
			},
			imageDel(index) {
				 this.$http.get(this.$appurl.pictureDelete + "?id=" + this.imgidAll[index].id).then((res) => {
				 	this.saveImglength -= 1;
					this.imgidAll.splice(index, 1);
					this.lists.splice(index, 1);
					this.dataImg.splice(index, 1);
					this.removeAllid.splice(index,1);
					uni.showToast({
						icon: 'none',
						position: 'bottom',
						title: res.message
					});
				})
			},
			uptasks() {
				var data = {
					lists:this.lists,
					removeAllid: this.removeAllid
				}
				this.$emit('func', data)
			},
			upsurvey() {
				this.$emit('func', this.imgidAll)
			},
			clearsurvey(){
				this.saveImglength=0;
				this.imgidAll=[];
				this.lists=[];
				this.dataImg=[];
			}
		},
		watch: {
			lists() { // 监听数组变化
				let l = this.lists.length
				if (l) { // 有图片或图片数量改变时重新初始化
					this.init()
				}
			}
		}
	}
</script>

<style scoped>
	.img {
		width: 100%;
		height: 100%;
	}

	.image-drag-sort {
		width: 100%;
		padding: 30upx 30upx 30upx 0upx;
		box-sizing: border-box;
	}

	.movable-area {
		width: 100%;
		height: auto;
		display: flex;
		flex-flow: wrap;
	}

	.item {
		flex: 0 0 31%;
		height: calc(31vw * .7);
		overflow: hidden;
		border-radius: 12upx;
		position: relative;
	}

	.item:not(:nth-child(3n + 3)) {
		margin-right: 3.4%;
	}

	.item:nth-child(n + 4) {
		margin-top: 3.4%;
	}

	.img-upload-btn {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		background-color: #F5F5F5;
	}

	.img-upload-btn .icon {
		width: 48upx;
		height: 48upx;
	}

	.img-upload-btn .text {
		font-size: 28upx;
		color: #9C9C9C;
		margin-top: 10upx;
	}

	.movable-view {
		width: 31%;
		height: calc(31vw * .7);
	}

	.item-move {
		width: 100%;
		height: 100%;
		overflow: hidden;
		border-radius: 12upx;
	}

	.item-move-active {
		box-shadow: 0 0 30px #000;
	}

	.prompt {
		font-size: 28upx;
		line-height: 40upx;
		color: #999;
		margin-top: 28upx;
	}

	.imgRemove {
		position: absolute;
		right: 0;
		z-index: 10;
	}
</style>
