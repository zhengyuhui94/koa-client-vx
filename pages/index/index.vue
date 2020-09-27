<template>
	<view class="wrap">
		<u-button type="primary" style="display: none;">主要按钮</u-button>
		<!-- <u-search placeholder="请输入关键字" v-model="keyword"></u-search> -->
		<u-sticky offset-top="200">
			<view class="sticky">
				<u-search placeholder="请输入关键字" v-model="keyword" @search="search"></u-search>
			</view>
		</u-sticky>
		<!-- <button class="btn" type="primary" open-type="getUserInfo" @getuserinfo="goJoin" withCredentials="true" >我要报名</button> -->
		<u-waterfall v-model="flowList" ref="uWaterfall">
			<template v-slot:left="{leftList}">
				<view class="demo-warter" v-for="(item, index) in leftList" :key="index" @click="jumpGoodDetail(item)">
					<!-- 警告：微信小程序不支持嵌入lazyload组件，请自行如下使用image标签 -->
					<!-- #ifndef MP-WEIXIN -->
					<u-lazy-load threshold="-450" border-radius="10" :image="item.image" :index="index"></u-lazy-load>
					<!-- #endif -->
					<!-- #ifdef MP-WEIXIN -->
					<view class="demo-img-wrap">
						<image class="demo-image" :src="item.img" mode="widthFix"></image>
					</view>
					<!-- #endif -->
					<view class="demo-title">
						{{item.name}}
					</view>
					<view class="demo-price">
						{{item.price}}元
					</view>
				</view>
			</template>
			<template v-slot:right="{rightList}">
				<view class="demo-warter" v-for="(item, index) in rightList" :key="index" @click="jumpGoodDetail(item)">
					<!-- #ifndef MP-WEIXIN -->
					<u-lazy-load threshold="-450" border-radius="10" :image="item.image" :index="index"></u-lazy-load>
					<!-- #endif -->
					<!-- #ifdef MP-WEIXIN -->
					<view class="demo-img-wrap">
						<image class="demo-image" :src="item.img" mode="widthFix"></image>
					</view>
					<!-- #endif -->
					<view class="demo-title">
						{{item.name}}
					</view>
					<view class="demo-price">
						{{item.price}}元
					</view>
				</view>
			</template>
		</u-waterfall>
		<u-loadmore bg-color="rgb(240, 240, 240)" :status="loadStatus" @loadmore="addGoodToList"></u-loadmore>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				keyword: '',
				loadStatus: 'loadmore',
				flowList: [],
				currentPage: 1
			}
		},
		onLoad() {
			uni.login({
				success: async (loginRes) => {
					const {data} = await this.$requestTool.post('/info/getOpenid', {
						code: loginRes.code
					});
					// 将微信用户唯一标识存储到 vuex 中
					this.$store.commit('setOpenid', data.openid);
					// 根据 openid 获取用户 userid
					const userInfo = await this.$requestTool.post('/info/qureyByOpenid', {
						openid: data.openid
					});
					// 设置用户 id
					this.$store.commit('setUserId', userInfo.data.id);
				}
			})
			this.addGoodToList();
		},
		onReachBottom() {
			this.loadStatus = 'loading';
			// 模拟数据加载
			setTimeout(async () => {
				this.currentPage += 1;
				const data = await this.addGoodToList();
				if(data.length === 0){
					this.loadStatus = 'nomore';
				}else{
					this.loadStatus = 'loadmore';
				}
			}, 1000)
		},
		methods: {
			async search(){
				this.currentPage = 1;
				this.$refs.uWaterfall.clear();
				this.loadStatus = 'loading';
				await this.addGoodToList();
				this.loadStatus = 'loadmore';
			},
			// 添加商品信息到商品列表中
			async addGoodToList(){
				const {data} = await this.$requestTool.get('/good/list', {
					params: {
						currentPage: this.currentPage,
						keyword: this.keyword
					}
				});
				this.flowList.push(...data);
				return data;
			},
			// 跳转商品详情页面
			jumpGoodDetail(item){
				uni.navigateTo({
					url:`/pages/good/good?id=${item.id}`,
					animationType:'slide-in-right',
					animationDuration:500
				})
			}
		}
	}
</script>

<style lang="scss" scoped>	
	.demo-warter {
		border: 1px solid #F1F1F1;
		box-shadow: 0 1px 1px 0 rgba(0,0,0,.1);
		border-radius: 8px;
		margin: 5px;
		background-color: #ffffff;
		padding: 8px;
		position: relative;
	}
	
	.u-close {
		position: absolute;
		top: 32rpx;
		right: 32rpx;
	}
	
	.demo-image {
		width: 100%;
		border-radius: 4px;
	}
	
	.demo-title {
		font-size: 30rpx;
		margin-top: 5px;
		color: $u-main-color;
	}
	
	.demo-tag {
		display: flex;
		margin-top: 5px;
	}
	
	.demo-tag-owner {
		background-color: $u-type-error;
		color: #FFFFFF;
		display: flex;
		align-items: center;
		padding: 4rpx 14rpx;
		border-radius: 50rpx;
		font-size: 20rpx;
		line-height: 1;
	}
	
	.demo-tag-text {
		border: 1px solid $u-type-primary;
		color: $u-type-primary;
		margin-left: 10px;
		border-radius: 50rpx;
		line-height: 1;
		padding: 4rpx 14rpx;
		display: flex;
		align-items: center;
		border-radius: 50rpx;
		font-size: 20rpx;
	}
	
	.demo-price {
		font-size: 30rpx;
		color: $u-type-error;
		margin-top: 5px;
	}
	
	.demo-shop {
		font-size: 22rpx;
		color: $u-tips-color;
		margin-top: 5px;
	}
	
	.sticky {
		padding: 24rpx;
	}
</style>
