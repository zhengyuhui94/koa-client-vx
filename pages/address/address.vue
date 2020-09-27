<template>
	<view class="u-card-wrap">
		<u-card :title-size="36" :full="true" v-if="addressList.length > 0">
			<view class="card-head" slot="head">
				<span class="name">我的收货地址</span>
				<span class="add-btn" @click="addAddress">添加新地址</span>
			</view>
			<view class="card-body" slot="body">
				<view class="u-body-item u-flex u-col-between u-p-t-0" v-for="(item, index) in addressList" :key="item.id" @click="goback(item.id)">
					<view class="u-body-item-title u-line-2">
						<div class="item-title">
							<span class="name">{{item.name}}</span>
							<span class="mobile">{{item.mobile}}</span>
						</div>
						<div class="item-info"><span class="default" v-if="item.statu === 0">默认</span>{{item.area}} {{item.address}}</div>
					</view>
					<view class="u-body-item-right" v-if="!fromOrder">
						<span class="edit" @click="editAddress(item.id)">编辑</span>
					</view>
				</view>
			</view>
		</u-card>
		<u-empty class="empty" mode="address" v-if="addressList.length === 0">
			<view slot="bottom">
				<u-button type="primary" @click="addAddress">添加新地址</u-button>
			</view>
		</u-empty>
		<u-toast ref="uToast" />
	</view>
</template>

<script>
	export default {
		data() {
			return {
				addressList: [],
				fromOrder: false
			}
		},
		methods: {
			async addAddress(){
				uni.navigateTo({
					url: '/pages/address/add',
					animationType:'slide-in-right',
					animationDuration:500
				})
			},
			editAddress(id){
				uni.navigateTo({
					url:`/pages/address/edit?id=${id}`,
					animationType:'slide-in-right',
					animationDuration:500
				});
			},
			goback(id){
				// 只有当从订单页面进来的时候，点击才有反应
				if(this.fromOrder){
					this.$store.commit('setAddressId', id);
					uni.navigateBack({
						animationDuration:500,
						animationType:'slide-in-left'
					});
				}
			}
		},
		async onShow() {
			const {data} = await this.$requestTool.get('/address/list', {
				params: {
					user_id: this.$store.state.userId
				}
			});
			if(data.length > 0){
				for(let i=0;i<data.length;i++){
					if(data[i].statu === 0){
						const temp = data[i];
						data.splice(i, 1);
						data.unshift(temp);
						break;
					}
				}
			}
			this.addressList = data;
			console.log(this.addressList);
		},
		onLoad(option) {
			if(option.fromOrder){
				this.fromOrder = true;
			}
		}
	}
</script>

<style lang="scss" scoped>
	.u-card-wrap {
		background-color: $u-bg-color;
		// padding: 1px;
	}
	
	.u-body-item {
		font-size: 32rpx;
		color: #333;
		padding: 20rpx 0;
		display: flex;
		justify-content: space-between;
		align-items: center;
		border-bottom: 1px solid rgba(200, 199, 204, 0.5);
			
		image {
			width: 120rpx;
			flex: 0 0 120rpx;
			height: 120rpx;
			border-radius: 8rpx;
			margin-right: 12rpx;
		}
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
	
	.u-body-item-right {
		width: 100rpx;
		color: #C8C7CC;
		font-size: 30rpx;
		position: relative;
		padding-left: 20rpx;
		
		&::before {
			content: '';
			display: inline-block;
			background-color: #C8C7CC;
			width: 4rpx;
			height: 40rpx;
			position: absolute;
			left: 0;
			top: 50%;
			transform: translateY(-50%);
		}
		
		.edit {
			
		}
	}
	
	/deep/.u-empty {
		height: 100vh!important;
	}
	
	/deep/.u-card-full {
		margin-top: 0!important;
		margin-bottom: 0!important;
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
			font-size: 34rpx;
			
			span {
				font-size: 30rpx;
				color: $u-type-error;
			}
		}
		
		.add-btn {
			position: absolute;
			right: 0;
			font-size: 30rpx;
			color: $u-type-error;
		}
	}
</style>
