<template>
	<view class="wrap">
		<view v-if="userList.length > 0">
			<view class="card-head" v-for="(item, index) in userList" :key="index" @click="jumpDetail(item)">
				<div class="user-wrap">
					<div class="avatar">
						<u-image width="60rpx" height="60rpx" shape="circle" :src="item.avatar" :lazy-load="true">
							<u-loading slot="loading"></u-loading>
						</u-image>
					</div>
					<div class="info">
						<span class="name">{{item.name}}</span>
						<span class="text">{{item.remark}}</span>
					</div>
					<span class="time">{{item.create_time | disposeTime}}</span>
				</div>
			</view>
		</view>
		<u-empty class="empty" mode="message" v-if="userList.length === 0"></u-empty>
	</view>
</template>

<script>
	import dateTool from '../../util/dateTool.js';
	
	export default {
		data() {
			return {
				userList: []
			}
		},
		filters:{
			disposeTime(date){
				return dateTool.formatLineDate(new Date(date), true, true);
			}
		},
		methods: {
			jumpDetail(item){
				uni.navigateTo({
					url:`/pages/message/detail?adminId=${item.admin_id}&messageId=${item.id}`,
					animationType:'slide-in-right',
					animationDuration:500
				});
			},
			setParams(){
				return this.userList.map(item => {
					return item.id;
				});
			},
			async getUserList(){
				const {data} = await this.$requestTool.get('/message/adminList', {
					params: {
						user_id: this.$store.state.userId
					}
				});
				this.userList = data;
			},
			async getLastInfo(){
				const {data} = await this.$requestTool.post('/message/lastInfoByIds', {
					message_ids: this.setParams()
				});
				this.userList.forEach((item, index) => {
					this.$set(this.userList[index], 'remark', data[index].remark);
					this.$set(this.userList[index], 'create_time', data[index].create_time);
				});
			}
		},
		async onShow() {
			await this.getUserList();
			await this.getLastInfo();
		}
	}
</script>

<style lang="scss" scoped>
	.wrap {
		padding: 20rpx;
		// background-color: #F1F1F1;
		
		.card-head {
			display: flex;
			align-items: center;
			position: relative;
			padding: 20rpx 0;
			border-bottom: 1px solid rgba(200,199,204,.5);
			
			.user-wrap {
				display: flex;
				align-items: center;
				
				.avatar {
					width: 60rpx;
					height: 60rpx;
					margin-right: 20rpx;
					border-radius: 50%;
					border: 1px solid rgba(200,199,204,.5);
				}
				
				.info {
					display: flex;
					flex-direction: column;
					width: 480rpx;
					
					.name {
						font-size: 34rpx;
						color: $u-main-color;
					}
					
					.text {
						font-size: 30rpx;
						color: #C8C7CC;
						white-space: nowrap;
						text-overflow: ellipsis;
						overflow: hidden;
						word-break: break-all;
					}
				}
			}
			
			.time {
				position: absolute;
				right: 0;
				font-size: 30rpx;
				// color: $u-type-error;
				color: #C8C7CC;
				text-align: right;
				// width: 90rpx;
			}
		}
	}
	
	/deep/.u-empty {
		height: 100vh!important;
	}
</style>
