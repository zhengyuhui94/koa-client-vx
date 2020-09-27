<template>
	<view class="wrap">
		<view v-if="messageList.length > 0" style="padding: 0 20rpx;">
			<!-- <u-loadmore bg-color="rgb(240, 240, 240)" :status="loadStatus" @loadmore="getMessageList"></u-loadmore> -->
			<view class="card-head" v-for="(item, index) in messageList" :key="index" :class="{'left': item.from_flag !== 'user', 'right': item.from_flag === 'user'}">
				<div class="user-wrap">
					<div class="avatar">
						<u-image width="60rpx" height="60rpx" shape="circle" :src="item.from_flag === 'user' ? item.user_avatar : item.admin_avatar" :lazy-load="true">
							<u-loading slot="loading"></u-loading>
						</u-image>
					</div>
					<div class="info">
						<span class="name" v-text="item.from_flag === 'user' ? item.user_name : item.admin_name"></span>
						<span class="text">{{item.remark}}</span>
					</div>
				</div>
			</view>
		</view>
		<view class="foot">
			<u-input class="foot-input" v-model="content" type="text" />
			<u-button class="foot-btn" type="error" @click="submit">发送</u-button>
		</view>
		<div class="message-tip" v-show="count" @click="closeTip">
			<span>新消息{{count}}条</span>
			<u-icon name="close-circle"></u-icon>
		</div>
	</view>
</template>

<script>
	import dateTool from '../../util/dateTool.js';
	
	export default {
		data() {
			return {
				messageList: [],
				content: '',
				loadStatus: 'loadmore',
				currentPage: 1,
				count: 0
			}
		},
		filters:{
			disposeTime(date){
				return dateTool.formatLineDate(new Date(date), true, true);
			}
		},
		onPullDownRefresh() {
			this.loadStatus = 'loading';
			// 模拟数据加载
			setTimeout(async () => {
				this.currentPage += 1;
				const data = await this.getMessageList();
				if(data.length === 0){
					this.loadStatus = 'nomore';
				}else{
					this.loadStatus = 'loadmore';
				}
			}, 1000)
		},
		computed: {
			userId(){
				return this.$store.state.userId;
			}
		},
		methods: {
			closeTip(){
				this.count = 0;
			},
			submit(){
				this.messageList.push({
					id: -1,
					remark: this.content,
					from_id: this.$store.state.userId,
					to_id: this.$data.admin_id,
					from_flag: 'user',
					message_id: -1,
					create_time: dateTool.formatLineDate(new Date(), true, true),
					user_name: this.$store.state.userName,
					user_avatar: this.$store.state.avatar,
					admin_name: this.$data.admin_name,
					admin_avatar: this.$data.admin_avatar
				});
				uni.sendSocketMessage({
					data: JSON.stringify({
						remark: this.content,
						create_time: dateTool.formatLineDate(new Date(), true, true),
						to: this.$data.admin_id
					})
				});
				this.content = '';
				this.$nextTick(() => {
					uni.pageScrollTo({
						scrollTop: 10000
					});
				});
			},
			async getMessageList(){
				let {data} = await this.$requestTool.post('/message/listById', {
					currentPage: this.currentPage,
					pageSize: 10,
					message_id: this.$data.message_id
				});
				data = data.reverse();
				if(this.currentPage === 1){
					this.messageList = data;
				}else{
					this.messageList.unshift(...data);
				}
				return data;
			}
		},
		async onLoad(option) {
			this.$data.message_id = Number(option.messageId);
			this.$data.admin_id = Number(option.adminId);
			await this.getMessageList();
			if(this.messageList.length > 0){
				this.$data.admin_name = this.messageList[0].admin_name;
				this.$data.admin_avatar = this.messageList[0].admin_avatar;
			}	
			this.$nextTick(() => {
				uni.pageScrollTo({
					scrollTop: 10000
				});
			});
		},
		onShow() {
			uni.connectSocket({
				url:`ws://koamall.top:8081/websocket/user/${this.$store.state.userId}`,
				
			});
			uni.onSocketOpen(res => {
				console.log('WebSocket连接已打开！');
			});
			uni.onSocketMessage(res => {
				const messageInfo = JSON.parse(res.data);
				if(messageInfo.from_id === this.$data.admin_id){
					this.messageList.push(Object.assign(
						{
							user_name: this.$store.state.userName,
							user_avatar: this.$store.state.avatar,
							admin_name: this.$data.admin_name,
							admin_avatar: this.$data.admin_avatar
						},
						messageInfo
					));
					this.count += 1;
				}
			});
		},
		onUnload() {
			uni.closeSocket();
		}
	}
</script>

<style lang="scss" scoped>
	.wrap {
		// padding: 0 20rpx;
		min-height: 100vh;
		background-color: #F1F1F1;
		padding-bottom: 100rpx;
		
		.message-tip {
			position: fixed;
			bottom: 104rpx;
			z-index: 100;
			background: #ffffff;
			color: #b2e281;
			font-size: 32rpx;
			padding: 2px 4px;
			border-radius: 4px;
			cursor: pointer;
			right: 0rpx;

			span {
				margin-right: 10rpx;
			}
		}
		
		.card-head {
			display: flex;
			align-items: center;
			position: relative;
			padding: 20rpx 0;
			
			.user-wrap {
				display: flex;
				// align-items: center;
				
				.avatar {
					width: 60rpx;
					height: 60rpx;
					border-radius: 50%;
					border: 1px solid rgba(200,199,204,.5);
				}
				
				.info {
					display: flex;
					flex-direction: column;
					
					.name {
						font-size: 30rpx;
						color: $u-main-color;
					}
					
					.text {
						margin-top: 10rpx;
						font-size: 34rpx;
						color: $u-main-color;
						// width: 500rpx;
						line-height: 40rpx;
						padding: 20rpx;
						background-color: #FFFFFF;
						border-radius: 14rpx;
					}
				}
			}
		}
		
		.left {
			.user-wrap {				
				.avatar {
					margin-right: 20rpx;
				}
			}
		}
		
		.right {
			justify-content: flex-end;
			
			.user-wrap {
				flex-direction: row-reverse;
				
				.avatar {
					margin-left: 20rpx;
				}
				
				.info {
					align-items: flex-end;
					
					.text {
						background-color: #b2e281;
					}
				}
			}
		}
		
		.foot {
			height: 100rpx;
			width: 100%;
			// border: 1px solid #F1F1F1;
			box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.3);
			position: fixed;
			bottom: 0;
			background-color: #FFFFFF;
			display: flex;
			align-items: center;
			// flex-direction: row-reverse;
			justify-content: flex-end;
			// padding: 0 20rpx;
			background: #eee;
			
			.foot-input {
				width: 550rpx;
				background: #ffffff;
				margin-right: 20rpx;
				border-radius: 10rpx;
			}
			
			.foot-btn {
				margin-right: 20rpx;
			}
		}
	}
</style>
