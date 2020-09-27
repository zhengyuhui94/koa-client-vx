<template>
	<view class="wrap">
		<u-image width="100%" height="600rpx" :src="goodInfo.img" :lazy-load="true">
			<u-loading slot="loading"></u-loading>
		</u-image>
		<view class="demo-price">
			{{goodInfo.price}}元
		</view>
		<view class="demo-title">
			{{goodInfo.name}}
		</view>
		<view class="demo-remark">
			商品描述：{{goodInfo.remark}}
		</view>
		<view class="pingjia-wrap">
			<view class="header">
				<span class="left">宝贝评价({{evaluateTotal}})</span>
				<span class="right" @click="jumpEvaluate">查看全部</span>
			</view>
			<view class="content">
				<div class="item" v-for="(item, index) in evaluateList" :key="index">
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
					<div class="text">{{item.remark}}</div>
				</div>
			</view>
		</view>
		<view class="foot-wrap">
			<span class="chat" @click="jumpMessageDetail">
				<u-icon name="kefu-ermai" class="kefu-icon"></u-icon>
				<em>客服</em>
			</span>
			<u-number-box style="margin-right: 20rpx;" :min="1" v-model="total"></u-number-box>
			<u-button style="margin-right: 20rpx;" type="warning" shape="square" @click="addGood2Cart">购物车</u-button>
			<u-button style="margin-right: 20rpx;" type="error" shape="square" @click="addGood2Order">立即购买</u-button>
		</view>
		<u-toast ref="uToast" />
	</view>
</template>

<script>
	import dateTool from '../../util/dateTool.js';
	
	export default {
		data() {
			return {
				total: 1,
				goodInfo: {},
				evaluateList: [],
				evaluateTotal: 0
			}
		},
		filters:{
			disposeTime(date){
				return dateTool.formatDate(new Date(date), true);
			}
		},
		methods: {
			showToast(msg) {
				this.$refs.uToast.show({
					title: msg,
					type: 'success'
				})
			},
			async jumpMessageDetail(){
				const {data} = await this.$requestTool.post('message/getMessageId', {
					user_id: this.$store.state.userId,
					admin_id: this.goodInfo.admin_id
				});
				const messageId = data.length > 0 ? data[0].id : -1;
				uni.navigateTo({
					url:`/pages/message/detail?adminId=${this.goodInfo.admin_id}&messageId=${messageId}`,
					animationType:'slide-in-right',
					animationDuration:500
				});
			},
			// 添加商品到购物车
			// 添加商品之前，会获取用户信息和微信用户唯一标识
			async addGood2Cart(){
				// 添加商品到购物车
				const {msg} = await this.$requestTool.post('/cart/addGood', {
					user_id: this.$store.state.userId,
					admin_id: this.goodInfo.admin_id,
					good_id: this.goodInfo.id,
					good_count: this.total,
					good_price: this.goodInfo.price,
					good_name: this.goodInfo.name,
					good_img: this.goodInfo.img
				});
				this.showToast(msg);
			},
			// 立即下单
			addGood2Order(){
				uni.navigateTo({
					url:`/pages/order/detail?good_id=${this.goodInfo.id}&good_total=${this.total}&admin_id=${this.goodInfo.admin_id}`,
					animationType:'slide-in-right',
					animationDuration:500
				});
			},
			async getGoodInfo(option){
				const {data} = await this.$requestTool.get('/good/infoById', {
					params: {
						id: option.id
					}
				}); 
				this.goodInfo = data;
			},
			// 查询前两条好的评价
			async getEvaluateList(){
				const {data} = await this.$requestTool.get('/evaluate/queryByGoodId/twoGood', {
					params: {
						good_id: this.goodInfo.id
					}
				}); 
				this.evaluateList = data; 
			},
			// 查询宝贝评价的数量
			async getEvaluateTotal(){
				const {data} = await this.$requestTool.get('/evaluate/queryByGoodId/total', {
					params: {
						good_id: this.goodInfo.id
					}
				}); 
				this.evaluateTotal = data; 
			},
			jumpEvaluate(){
				uni.navigateTo({
					url:`/pages/evaluate/evaluate?good_id=${this.goodInfo.id}`,
					animationType:'slide-in-right',
					animationDuration:500
				});
			}
		},
		async onLoad (option) {
			await this.getGoodInfo(option);
			this.getEvaluateList();
			this.getEvaluateTotal();
		}
	}
</script>

<style lang="scss" scoped>
	.wrap {
		padding-bottom: 100rpx;
	}
	
	.demo-price {
		font-size: 30rpx;
		color: $u-type-error;
		margin-top: 16rpx;
		padding-left: 20rpx;
	}
	
	.demo-title {
		font-size: 34rpx;
		margin-top: 16rpx;
		padding-left: 20rpx;
		color: $u-main-color;
		font-weight: bold;
	}
	
	.demo-remark {
		font-size: 30rpx;
		margin-top: 16rpx;
		padding-left: 20rpx;
		color: $u-main-color;
	}
	
	.foot-wrap {
		height: 100rpx;
		width: 100%;
		border: 1px solid #F1F1F1;
		box-shadow: 0 1px 1px 0 rgba(0,0,0,.1);
		position: fixed;
		bottom: 0;
		background-color: #FFFFFF;
		display: flex;
		align-items: center;
		// flex-direction: row-reverse;
		justify-content: flex-end;
		// padding: 0 20rpx;
		
		.chat {
			text-align: center;
			margin-right: 24px;
			color: #606266;
			
			.kefu-icon {
				font-size: 34rpx;
			}
			
			em {
				font-size: 28rpx;
			}
		}
	}
	
	.pingjia-wrap {
		margin: 20rpx 20rpx;
		border: 1px solid #F1F1F1;
		box-shadow: 0 1px 1px 0 rgba(0,0,0,.1);
		border-radius: 8px;
		padding: 0 20rpx;
		
		.header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			height: 70rpx;
			
			.left {
				// float: left;
				color: $u-main-color;
				font-size: 32rpx;
				font-weight: bold;
			}
			
			.right {
				// float: right;
				color: $u-type-error;
				font-size: 30rpx;
			}
		}
	
		.content {
			// height: 60px;
			display: flex;
			justify-content: center;
			flex-direction: column;
			
			.item {
				margin-top: 10rpx;
				margin-bottom: 20rpx;
				
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
			
				.text {
					font-size: 30rpx;
					color: $u-main-color;
					margin-top: 10rpx;
				}
			}
		}
	}
</style>
