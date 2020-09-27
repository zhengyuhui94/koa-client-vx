<template>
	<view class="wrap">
		<div class="card-wrap mt20" v-for="(item, index) in evaluateList" :key="item.id">
			<u-card :thumb-circle="true" :title-size="36" :full="true">
				<view class="card-body" slot="body">
					<view class="u-body-item u-flex u-border-bottom u-col-between u-p-t-0" style="padding: 20rpx 0;">
						<image :src="item.img" mode="aspectFill"></image>
						<view class="u-body-item-title u-line-2">
							<div class="item-title">{{item.name}}</div>
						</view>
					</view>
				</view>
				<view class="card-foot" slot="foot">
					<div class="rate-wrap">
						<span class="rate-title">描述相符</span>
						<u-rate :count="3" v-model="item.evaluateInfo.value" :size="38"></u-rate>
						<span class="rate-text" v-text="item.evaluateInfo.value === 3 ? '好' : item.evaluateInfo.value === 2 ? '一般' : '差'"></span>
					</div>
					<div class="mt20">
						<u-input v-model="item.evaluateInfo.remark" type="textarea" :border="false" :height="200" placeholder="从多个角度对宝贝进行评价，可以帮助更多想买的人" />
					</div>
					<div class="mt20">
						<u-upload action="https://koamall.top/upload/upload/uploadfile" :file-list="fileList"
						@on-success="handleSuccess($event, item.evaluateInfo)" @on-remove="handleRemove($event, item.evaluateInfo)" :show-progress="false"></u-upload>
					</div>
				</view>
			</u-card>
		</div>
		<div class="mt20 submit-wrap">
			<u-button @click="submit" size="medium" type="error">发布</u-button>
		</div>
		<u-toast ref="uToast" />
	</view>
</template>

<script>
	import dateTool from '../../util/dateTool.js';
	
	export default {
		data() {
			return {
				evaluateList: [],
				fileList: []
			}
		},
		methods: {
			async getGoodList(ids){
				const {data} = await this.$requestTool.post('/good/listByIds', {
					ids
				});
				return data;
			},
			resetEvaluateList(data){
				this.evaluateList = data.map(item => {
					item.evaluateInfo = {
						remark: '',
						imgs: [],
						value: 3
					};
					return item;
				});
			},
			handleSuccess($event, evaluateInfo){
				evaluateInfo.imgs.push($event.data);
			},
			handleRemove($event, evaluateInfo){
				evaluateInfo.imgs.splice($event, 1);
			},
			setParams(){
				let params = {
					order_id: Number(this.$data.order_id),
					user_id: this.$store.state.userId,
					create_time: dateTool.formatLineDate(new Date(), true, true),
					list: []
				};
				this.evaluateList.forEach(item => {
					if(item.evaluateInfo.remark !== ''){
						const data = {
							good_id: item.id,
							remark: item.evaluateInfo.remark,
							statu: item.evaluateInfo.value,
							imgs: item.evaluateInfo.imgs
						};
						params.list.push(data);
					}
				});
				console.log(params);
				return params;
			},
			async submit(){
				const params = this.setParams();
				if(params.list.length === 0){
					this.$refs.uToast.show({
						title: '请填写商品评价',
						type: 'error'
					});
					return;
				}
				await this.$requestTool.post('/evaluate/add', params);
				this.$refs.uToast.show({
					title: '发布成功',
					type: 'success',
					callback(){
						uni.switchTab({
							url:`/pages/order/order`
						});
					}
				});
			}
		},
		async onLoad(option) {
			const data = await this.getGoodList(option.ids.split(','));
			this.resetEvaluateList(data);
			this.$data.order_id = option.order_id;
		}
	}
</script>

<style lang="scss" scoped>
	.wrap {
		padding: 20rpx;
		min-height: 100vh;
		background-color: #F1F1F1;
		margin-bottom: 100rpx;
		
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
	
	/deep/.u-list-item {
		margin: 0!important;
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
		// display: flex;
		// flex-direction: column;
		// align-items: center;
		// justify-content: space-between;
		margin-top: -48rpx;
		
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
		
		.rate-wrap {
			.rate-title {
				font-size: 34rpx;
				margin-right: 40rpx;
			}
			
			.rate-text {
				font-size: 32rpx;
				color: #C8C7CC;
				margin-left: 40rpx;
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
	
	.submit-wrap {
		height: 100rpx;
		width: 100%;
		border: 1px solid #F1F1F1;
		box-shadow: 0 1px 1px 0 rgba(0,0,0,.1);
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: #FFFFFF;
		display: flex;
		justify-content: center;
		align-items: center;
	}
</style>
