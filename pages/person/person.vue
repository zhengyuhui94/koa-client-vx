<template>
	<view>
		<u-empty class="empty" mode="permission" v-if="modalShow">
			<view slot="bottom">
				<u-button type="primary" open-type="getUserInfo" @getuserinfo="getuserinfo">获取用户权限</u-button>
			</view>
		</u-empty>
		<view class="wrap" v-else>
			<div class="center mt20">
				<image class="avatar" :src="avatar" shape="circle"></image>
			</div>
			<div class="text-center mt20">{{userName}}</div>
			<div class="text-center mt10 money">账户余额：{{money}}元</div>
			<div class="card-wrap mt20">
				<u-card :title-size="36" :full="true">
					<view class="card-head" slot="head">
						<span class="name">我的收货地址</span>
						<span class="del-btn" @click="jumpAddress">查看更多<u-icon name="arrow-right"></u-icon></span>
					</view>
					<view class="card-body" slot="body" v-if="addressData">
						<view class="u-body-item u-flex u-col-between u-p-t-0">
							<view class="u-body-item-title u-line-2">
								<div class="item-title">
									<span class="name">{{addressData.name}}</span>
									<span class="mobile">{{addressData.mobile}}</span>
								</div>
								<div class="item-info"><span class="default">默认</span>{{addressData.area}} {{addressData.address}}</div>
							</view>
						</view>
					</view>
				</u-card>
			</div>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				modalShow: true,
				money: 0,
				addressData: null
			}
		},
		computed: {
			avatar(){
				return this.$store.state.avatar;
			},
			userName(){
				return this.$store.state.userName;
			}
		},
		methods: {
			async getuserinfo(res){
				this.setUserInfo(res.detail.userInfo);
			},
			// 获取并设置用户信息以及更新用户信息
			async setUserInfo(userInfo){
				const {nickName, avatarUrl} = userInfo;
				this.$store.commit('setUserName', nickName);
				this.$store.commit('setAvatar', avatarUrl);
				this.modalShow = false;
				await this.$requestTool.post('/info/updateById', {
					id: this.$store.state.userId,
					name: nickName,
					avatar: avatarUrl
				});
				// 获取用户信息并从中取得用户余额信息
				const {data} = await this.$requestTool.get('/info/queryById', {
					params: {
						id: this.$store.state.userId
					}
				});
				this.money = data.money;
			},
			jumpAddress(){
				uni.navigateTo({
					url:`/pages/address/address`,
					animationType:'slide-in-right',
					animationDuration:500
				});
			},
			async getDefaultAddress(){
				const {data} = await this.$requestTool.get('/address/queryDefault', {
					params: {
						user_id: this.$store.state.userId
					}
				});
				this.addressData = data;
			}
		},
		// onLoad() {
		// 	uni.getUserInfo({
		// 		success: async (res) => {
		// 			await this.setUserInfo(res.userInfo);
		// 		},
		// 		fail: () => {
		// 			this.modalShow = true;
		// 		}
		// 	});
		// },
		onShow() {
			uni.getUserInfo({
				success: async (res) => {
					await this.setUserInfo(res.userInfo);
					await this.getDefaultAddress();
				},
				fail: () => {
					this.modalShow = true;
				}
			});
		}
	}
</script>

<style lang="scss" scoped>
	.wrap {
		padding: 20rpx;
		
		.money {
			font-size: 32rpx;
		}
		
		.mt20 {
			margin-top: 20rpx;
		}
		
		.mt10 {
			margin-top: 10rpx;
		}
		
		.center {
			display: flex;
			justify-content: center;
		}
		
		.text-center {
			text-align: center;
		}
		
		.avatar {
			width: 140rpx;
			height: 140rpx;
			border-radius: 50%;
			border: 1px solid #C8C7CC;
		}
		
		.u-card-wrap {
			background-color: $u-bg-color;
			padding: 1px;
		}
		
		.card-wrap {
			border: 1px solid #F1F1F1;
			box-shadow: 0 1px 1px 0 rgba(0,0,0,.1);
		}
		
		.u-body-item {
			font-size: 32rpx;
			color: #333;
			// padding: 20rpx 0;
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
			// margin-left: 12rpx;
			font-size: 34rpx;
			
			span {
				font-size: 30rpx;
				color: $u-type-error;
			}
		}
		
		.del-btn {
			position: absolute;
			right: 0;
			font-size: 30rpx;
			// color: $u-type-error;
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
