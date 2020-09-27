<template>
	<view class="wrap">
		<u-tabs-swiper ref="tabs" :list="list" :is-scroll="false" active-color="#2979ff" :current="current" @change="tabsChange"></u-tabs-swiper>
		<div class="card-wrap mt20" v-for="(orderItem, orderIndex) in orderList" :key="orderIndex" v-if="orderList.length > 0">
			<u-card :thumb-circle="true" :title-size="36" :full="true">
				<view class="card-head" slot="head">
					<image class="avatar" :src="orderItem.avatar" shape="circle"></image>
					<span class="name">{{orderItem.name}}</span>
					<span class="del-btn" v-if="orderItem.statu === 0" @click="showCancelOrderModal(orderItem)">取消订单</span>
				</view>
				<view class="card-body" slot="body">
					<view v-for="(item, index) in orderItem.list" :key="index"
					class="u-body-item u-flex u-border-bottom u-col-between u-p-t-0" style="padding: 20rpx 0;">
						<image :src="item.good_img" mode="aspectFill"></image>
						<view class="u-body-item-title u-line-2">
							<div class="item-title">{{item.good_name}}</div>
							<div class="item-price-wrap">
								<span class="item-price">{{item.good_price}}元</span>
								<span class="item-total">x{{item.good_count}}</span>
							</div>
						</view>
					</view>
				</view>
				<view class="card-foot" slot="foot">
					<span class="total">合计：<span>{{orderItem.total_price}}元</span></span>
					<u-button type="error" size="medium" v-if="orderItem.statu === 0" @click="showModal(orderItem)">付款</u-button>
					<u-button type="error" size="medium" v-else-if="orderItem.statu === 1" @click="jumpEvaluate(orderItem)">评价</u-button>
					<span class="foot-text" v-else-if="orderItem.statu === 2">交易成功</span>
					<span class="foot-text" v-else>交易已取消</span>
				</view>
			</u-card>
		</div>
		<u-empty class="empty" mode="order" v-if="orderList.length === 0"></u-empty>
		<u-modal v-model="modalShow" title="付款详情" :content="totalPrice + '元'"
		confirm-text="继续付款" cancel-text="放弃" @confirm="confirm"
		:async-close="true" :show-cancel-button="true" :content-style="{fontSize: '44rpx'}">
		</u-modal>
		<u-modal v-model="cancelOrderModalShow" title="取消订单" content="宝贝这么好，您确定要取消订单吗？"
		confirm-text="确定" cancel-text="放弃" @confirm="cancelOrderConfirm"
		:async-close="true" :show-cancel-button="true">
		</u-modal>
		<u-toast ref="uToast" />
	</view>
</template>

<script>
	export default {
		data() {
			return {
				current: 0,
				infoSubmit: {},
				modalShow: false,
				cancelOrderModalShow: false,
				totalPrice: 0,
				list: [
					{
						name: '全部',
						statu: ''
					},
					{
						name: '待付款',
						statu: 0
					}, 
					{
						name: '待评价',
						statu: 1
					}, 
					{
						name: '已评价',
						statu: 2
					},
					{
						name: '已取消',
						statu: 3
					}
				],
				orderList: []
			}
		},
		methods: {
			async getOrderList(statu){
				const {data} = await this.$requestTool.get('/order/list', {
					params: {
						user_id: this.$store.state.userId,
						statu
					}
				});
				this.resetOrderList(data);
			},
			resetOrderList(data){
				let results = [];
				data.forEach(item => {
					const {id, admin_id, name, avatar, total_price, statu, good_id, good_count, good_name, good_img, good_price} = item;
					const goodItem = {
						good_id,
						good_count,
						good_price,
						good_name,
						good_img
					};
					if(results.every(result => result.id !== item.id)){
						results.push({
							id,
							admin_id,
							avatar,
							name,
							total_price,
							statu,
							list: [goodItem]
						});
					}else{
						for(let result of results){
							if(result.id === item.id){
								result.list.push(goodItem);
								break;
							}
						}
					}
				});
				this.orderList = results;
			},
			tabsChange(index) {
				this.current = index;
				this.orderList = [];
				this.getOrderList(this.list[index].statu);
			},
			showModal(orderItem){
				this.modalShow = true;
				this.totalPrice = orderItem.total_price;
				this.infoSubmit = {
					id: orderItem.id,
					statu: 1,
					total_price: orderItem.total_price,
					user_id: this.$store.state.userId,
					admin_id: orderItem.admin_id
				};
			},
			showCancelOrderModal(orderItem){
				console.log(orderItem);
				this.cancelOrderModalShow = true;
				this.infoSubmit = {
					id: orderItem.id,
					statu: 3
				};
			},
			async confirm(){
				await this.$requestTool.post('/order/changeStatu', this.infoSubmit);
				this.modalShow = false;
				this.$refs.uToast.show({
					title: '付款成功',
					type: 'success'
				});
				this.getOrderList(this.list[this.current].statu);
			},
			async cancelOrderConfirm(){
				await this.$requestTool.post('/order/changeStatu', this.infoSubmit);
				this.cancelOrderModalShow = false;
				this.$refs.uToast.show({
					title: '取消成功',
					type: 'success'
				});
				this.getOrderList(this.list[this.current].statu);
			},
			jumpEvaluate(orderItem){
				const ids = orderItem.list.map(item => {
					return item.good_id;
				}).join(',');
				uni.navigateTo({
					url:`/pages/evaluate/submit?ids=${ids}&order_id=${orderItem.id}`,
					animationType:'slide-in-right',
					animationDuration:500
				});
			}
		},
		async onShow() {
			await this.getOrderList(this.list[this.current].statu);
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
	}
	
	.u-card-wrap { 
		background-color: $u-bg-color;
		padding: 1px;
	}
	
	.u-body-item {
		font-size: 32rpx;
		color: #333;
		display: flex;
		justify-content: space-between;
		align-items: center;
			
		image {
			width: 120rpx;
			flex: 0 0 120rpx;
			height: 120rpx;
			border-radius: 8rpx;
			margin-right: 12rpx;
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
