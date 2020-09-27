<template>
	<view class="wrap">
		<div class="card-wrap mt20">
			<u-card :title-size="36" :full="true">
				<view class="card-head" slot="head" @click="jumpAddress">
					<span class="address-name">收货地址</span>
					<span class="del-btn"><u-icon name="arrow-right"></u-icon></span>
				</view>
				<view class="card-body" slot="body">
					<view class="u-body-item u-flex u-col-between u-p-t-0">
						<view class="u-body-item-title u-line-2">
							<div class="item-title">
								<span class="name">{{addressInfo.name}}</span>
								<span class="mobile">{{addressInfo.mobile}}</span>
							</div>
							<div class="item-info">{{addressInfo.area}} {{addressInfo.address}}</div>
						</view>
					</view>
				</view>
			</u-card>
		</div>
		<div class="card-wrap mt20">
			<u-card :thumb-circle="true" :title-size="36" :full="true">
				<view class="card-head" slot="head">
					<image class="avatar" :src="adminInfo.avatar" shape="circle"></image>
					<span class="name">{{adminInfo.name}}</span>
				</view>
				<view class="card-body" slot="body">
					<view class="u-body-item u-flex u-border-bottom u-col-between u-p-t-0" style="padding: 20rpx 0;">
						<image :src="goodInfo.img" mode="aspectFill"></image>
						<view class="u-body-item-title u-line-2">
							<div class="item-title">{{goodInfo.name}}</div>
							<div class="item-price-wrap">
								<span class="item-price">{{goodInfo.price}}元</span>
								<span class="item-total">x{{total}}</span>
							</div>
						</view>
					</view>
				</view>
				<view class="card-foot" slot="foot">
					<span class="total">合计：<span>{{goodInfo.price * total}}元</span></span>
					<u-button type="error" size="medium" @click="showModal">提交订单</u-button>
				</view>
			</u-card>
		</div>
		<u-modal v-model="modalShow" title="付款详情" :content="goodInfo.price * total + '元'" 
		confirm-text="继续付款" cancel-text="放弃" @confirm="confirm" @cancel="cancel" 
		:async-close="true" :show-cancel-button="true" :content-style="{fontSize: '44rpx'}">
		</u-modal>
		<u-toast ref="uToast" />
	</view>
</template>

<script>
	import dateTool from '../../util/dateTool.js';
	
	export default {
		data() {
			return {
				goodInfo: {},
				adminInfo: {},
				addressInfo: {},
				total: 1,
				modalShow: false
			}
		},
		methods: {
			// 获取商品信息
			async getGoodInfo(good_id){
				const {data} = await this.$requestTool.get('/good/infoById', {
					params: {
						id: good_id
					}
				});
				this.goodInfo = data;
				console.log(this.goodInfo)
			},
			// 获取管理员信息
			async getAdminInfo(admin_id){
				const {data} = await this.$requestTool.get('/admin/getInfoByAdminId', {
					params: {
						admin_id
					}
				});
				this.adminInfo = data;
				console.log(this.adminInfo)
			},
			// 获取地址信息
			async getAddressInfo(){
				const {data} = await this.$requestTool.get('/address/queryDefault', {
					params: {
						user_id: this.$store.state.userId
					}
				});
				this.addressInfo = data;
				console.log(this.addressInfo)
			},
			jumpAddress(){
				uni.navigateTo({
					url:`/pages/address/address?fromOrder=1`,
					animationType:'slide-in-right',
					animationDuration:500
				});
			},
			showModal(){
				this.modalShow = true;
			},
			// 设置订单接口请求参数
			setOrderParams(statu){
				const params = {
					user_id: this.addressInfo.user_id,
					admin_id: this.adminInfo.id,
					total_price: this.total * this.goodInfo.price,
					address_mobile: this.addressInfo.mobile,
					address_name: this.addressInfo.name,
					address_area: this.addressInfo.area,
					address: this.addressInfo.address,
					create_time: dateTool.formatLineDate(new Date(), true, true),
					good_info: [
						{
							good_id: this.goodInfo.id,
							good_count: Number(this.total)
						}
					],
					statu
				};
				return params;
			},
			async confirm(){
				const params = this.setOrderParams(1);
				await this.$requestTool.post('/order/add', params);
				this.modalShow = false;
				this.$refs.uToast.show({
					title: '付款成功',
					type: 'success',
					callback(){
						uni.switchTab({
							url:`/pages/order/order`
						});
					}
				});
			},
			async cancel(){
				const params = this.setOrderParams(0);
				await this.$requestTool.post('/order/add', params);
				uni.switchTab({
					url:`/pages/order/order`
				});
			}
		},
		onLoad(option) {
			const {good_id, good_total, admin_id} = option;
			this.getAddressInfo();
			this.getAdminInfo(admin_id);
			this.getGoodInfo(good_id);
			this.total = good_total;
		},
		async onShow() {
			if(this.$store.state.addressId !== -1){
				const {data} = await this.$requestTool.get('/address/queryById', {
					params: {
						id: this.$store.state.addressId
					}
				});
				this.addressInfo = data;
				this.$store.commit('setAddressId', -1);
			}
		}
	}
</script>

<style scoped lang="scss">
	.wrap {
		padding: 20rpx;
		background-color: #F1F1F1;
		
		.mt20 {
			margin-top: 20rpx;
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
			// color: $u-type-error;
			color: #C8C7CC;
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
