<template>
	<view class="wrap">
		<u-tabs-swiper ref="tabs" :list="list" :is-scroll="false" active-color="#2979ff" :current="current" @change="tabsChange"></u-tabs-swiper>
		<div class="card-wrap mt20" v-for="(item, index) in evaluateList" :key="item.id" v-if="evaluateList.length > 0">
			<u-card :thumb-circle="true" :title-size="36" :full="true">
				<view class="card-head" slot="head">
					<div class="user-wrap">
						<div class="avatar">
							<u-image width="60rpx" height="60rpx" shape="circle" :src="item.avatar" :lazy-load="true">
								<u-loading slot="loading"></u-loading>
							</u-image>
						</div>
						<div class="info">
							<span>{{item.name}}</span>
							<span>{{item.create_time | disposeTime}}</span>
						</div>
					</div>
				</view>
				<view class="card-body" slot="body">
					<view class="u-body-item u-flex u-border-bottom u-col-between u-p-t-0">
						<div class="text">{{item.remark}}</div>
						<div class="img-wrap mt20">
							<u-image v-for="(imgItem, imgIndex) in item.imgs" :key="imgIndex" style="margin: 10rpx 10rpx 10rpx 0;"
							width="210rpx" height="210rpx" :src="imgItem" :border-radius="6" :lazy-load="true">
								<u-loading slot="loading"></u-loading>
							</u-image>
						</div>
					</view>
				</view>
			</u-card>
		</div>
		<u-empty class="empty" mode="list" v-if="evaluateList.length === 0"></u-empty>
		<u-toast ref="uToast" />
	</view>
</template>

<script>
	import dateTool from '../../util/dateTool.js';
	
	export default {
		data() {
			return {
				current: 0,
				list: [
					{
						name: '全部',
						statu: ''
					},
					{
						name: '好评',
						statu: 3
					}, 
					{
						name: '一般',
						statu: 2
					}, 
					{
						name: '差评',
						statu: 1
					}
				],
				evaluateList: []
			}
		},
		filters:{
			disposeTime(date){
				return dateTool.formatDate(new Date(date), true);
			}
		},
		methods: {
			tabsChange(index) {
				this.current = index;
				this.evaluateList = [];
				this.getEvaluateList();
			},
			async getEvaluateList(){
				const {data} = await this.$requestTool.get('/evaluate/queryByGoodId/list', {
					params: {
						good_id: this.$data.good_id,
						statu: this.list[this.current].statu
					}
				});
				this.evaluateList = data;
			},
		},
		async onLoad(option) {
			this.$data.good_id = Number(option.good_id);
			await this.getEvaluateList();
		},
		async onShow() {
			
		}
	}
</script>

<style lang="scss" scoped>
	.wrap {
		padding: 20rpx;
		background-color: #F1F1F1;
		
		.mt20 {
			margin-top: 20rpx;
		}
		
		.more-btn {
			float: right;
			color: #C8C7CC;
		}
		
		.user-wrap {
			display: flex;
			align-items: center;
			
			.avatar {
				margin-right: 10rpx;
				border-radius: 50%;
				border: 1px solid rgba(200,199,204,.5);
			}
			
			.info {
				display: flex;
				flex-direction: column;
				font-size: 30rpx;
				color: $u-main-color;
			}
		}
	}
	
	.u-card-wrap { 
		background-color: $u-bg-color;
		padding: 1px;
	}
	
	.u-body-item {
		font-size: 32rpx;
		color: #333;
		// display: flex;
		// justify-content: space-between;
		// align-items: center;
			
		image {
			width: 120rpx;
			flex: 0 0 120rpx;
			height: 120rpx;
			border-radius: 8rpx;
			margin-right: 12rpx;
		}
		
		.img-wrap {
			display: flex;
			flex-wrap: wrap;
			// justify-content: space-between;
			// align-items: center;
		}
	}
	
	/deep/.u-card__head--left__title {
		position: relative;
		top: -5px;
	}
	
	.item-price-wrap {
		display: flex;
		justify-content: space-between;
		
		.item-price {
			color: $u-type-error;
		}
		
		.item-total {
			color: #C8C7CC;
		}
	}
	
	.card-head {
		display: flex;
		align-items: center;
		position: relative;
		
		.avatar {
			width: 60rpx;
			height: 60rpx;
			border-radius: 50%;
		}
		
		.name {
			margin-left: 12rpx;
			font-size: 34rpx;
			
			span {
				font-size: 30rpx;
				color: $u-type-error;
			}
		}
		
		.address-name {
			font-size: 34rpx;
		}
		
		.del-btn {
			position: absolute;
			right: 0;
			font-size: 30rpx;
			color: $u-type-error;
			// color: #C8C7CC;
		}
	}
	
	.card-foot {
		display: flex;
		align-items: center;
		justify-content: space-between;
		
		.total {
			font-size: 34rpx;
			
			span {
				color: $u-type-error;
			}
		}
		
		.foot-text {
			font-size: 34rpx;
			color: $u-type-error;
		}
	}
	
	/deep/.u-empty {
		height: 100vh!important;
	}
	
	/deep/.u-card-full {
		margin-top: 0!important;
		margin-bottom: 0!important;
	}
	
	/deep/.u-card__head {
		padding-bottom: 0!important;
	}
	
	.u-body-item-title {
		flex: 1;
		padding-right: 20rpx;
		
		.item-title {
			.name {
				font-size: 34rpx;
			}
			
			.mobile {
				margin-left: 16rpx;
				font-size: 30rpx;
				color: #C8C7CC;
			}
		}
		
		.item-info {
			font-size: 30rpx;
			margin-top: 10rpx;
			
			.default {
				display: inline-block;
				padding: 0 10rpx;
				height: 40rpx;
				line-height: 40rpx;
				background-color: rgba(240, 128, 128, 0.2);
				color: #ec7259;
				margin-right: 10rpx;
			}
		}
	}
</style>
