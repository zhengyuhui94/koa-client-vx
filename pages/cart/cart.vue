<template>
	<view class="wrap">
		<u-card v-for="(cartItem, cartIndex) in cartList" :title="cartItem.name" :thumb-circle="true" :title-size="36" :full="true" :thumb="cartItem.avatar" :key="cartIndex">
			<view class="card-head" slot="head">
				<u-checkbox-group shape="circle" @change="batchCheckbox(cartItem)">
					<u-checkbox v-model="cartItem.checked"></u-checkbox>
				</u-checkbox-group>
				<image class="avatar" :src="cartItem.avatar" shape="circle"></image>
				<span class="name">{{cartItem.name}}</span>
				<span class="del-btn" v-show="cartItem.total > 0" @click="delCartGood(cartItem, cartIndex)">删除</span>
			</view>
			<view class="card-body" slot="body">
				<view class="u-body-item u-flex u-border-bottom u-col-between u-p-t-0" v-for="(item, index) in cartItem.list" :key="item.id">
					<u-checkbox-group shape="circle" @change="checkbox(cartItem, item)">
						<u-checkbox v-model="item.checked"></u-checkbox>
					</u-checkbox-group>
					<image :src="item.good_img" mode="aspectFill"></image>
					<view class="u-body-item-title u-line-2">
						<div class="item-title">{{item.good_name}}</div>
						<div class="item-price-wrap">
							<span class="item-price">{{item.good_price}}元</span>
							<u-number-box style="margin-right: 20rpx;" :min="1" v-model="item.good_count" @change="updateGoodCount(item)"></u-number-box>
						</div>
					</view>
				</view>
			</view>
			<view class="card-foot" slot="foot">
				<span class="total">合计：{{cartItem.total_price}}</span>
				<u-button type="error" size="medium" @click="submit(cartItem, cartIndex)">结算({{cartItem.total}})</u-button>
			</view>
		</u-card>
		<u-card :title-size="36" :full="true" v-if="failureCartList.length > 0">
			<view class="card-head" slot="head">
				<span class="name">失效宝贝{{failureCartList.length}}件<span>(宝贝已不能购买)</span></span>
				<span class="del-btn" @click="delAllFailureCartGood">清空失效宝贝</span>
			</view>
			<view class="card-body" slot="body">
				<view class="u-body-item u-flex u-border-bottom u-col-between u-p-t-0" v-for="(item, index) in failureCartList" :key="item.id">
					<image :src="item.good_img" mode="aspectFill"></image>
					<view class="u-body-item-title u-line-2">
						<div class="item-title">{{item.good_name}}</div>
					</view>
				</view>
			</view>
		</u-card>
		<u-empty class="empty" text="暂无购物车数据" mode="car" v-if="cartList.length === 0 && failureCartList.length === 0"></u-empty>
		<u-toast ref="uToast" />
	</view>
</template>

<script>
	export default {
		data() {
			return {
				cartList: [],
				failureCartList: []
			}
		},
		methods: {
			showToast(msg) {
				this.$refs.uToast.show({
					title: msg,
					type: 'success'
				})
			},
			async getCartList(){
				const {data} = await this.$requestTool.get('/cart/list', {
					params: {
						user_id: this.$store.state.userId
					}
				});
				this.resetCartList(data);
			},
			resetCartList(data){
				let results = [];
				let failureResults = []; // 失效的宝贝
				data.forEach(item => {
					const {admin_id, user_id, avatar, name, cart_id, id, good_id, good_count, good_price, good_name, good_img, statu} = item;
					const goodItem = {
						id, // 商品订单详情 id
						cart_id,
						good_id,
						good_count,
						good_price,
						good_name,
						good_img,
						statu,
						firstFlag: true,
						checked: false
					};
					if(statu !== 0){ // s失效的宝贝，包含禁售和已删除商品
						failureResults.push(item);
					}else if(results.every(result => result.admin_id !== item.admin_id)){ // 将当前订单信息分成几大类，根据管理员来分
						results.push({
							admin_id,
							avatar,
							name,
							user_id,
							cart_id,
							checked: false,
							total_price: 0,
							total: 0,
							list: [goodItem]
						});
					}else{ // 如果已有的管理员分类数据，则将商品信息添加到相应的 list 中
						for(let result of results){
							if(result.admin_id === item.admin_id){
								result.list.push(goodItem);
								break;
							}
						}
					}
				});
				this.failureCartList = failureResults;
				this.cartList = results;
			},
			// 更新购物车商品数量
			async updateGoodCount(item){
				// 刚进来的第一次不执行
				if(item.firstFlag){
					item.firstFlag = false;
					return;
				}
				const res = await this.$requestTool.post('/cart/changeGoodCount', {
					good_count: item.good_count,
					id: item.id
				});
				this.showToast(res.msg);
			},
			// 复选框批量变化
			batchCheckbox(cartItem){
				let {checked, list} = cartItem;
				list.forEach(item => {
					item.checked = checked;
				});
				if(checked){
					cartItem.total = list.reduce((prev, next) => prev + next.good_count, 0);
					cartItem.total_price = list.reduce((prev, next) => prev + next.good_count * next.good_price, 0);
				}else{
					cartItem.total = 0;
					cartItem.total_price = 0;
				}
			},
			// 复选框单个变化
			checkbox(cartItem, selItem){
				const {list} = cartItem;
				const {checked, good_count, good_price} = selItem;
				cartItem.checked = list.every(item => item.checked === true);
				if(checked){
					cartItem.total += good_count;
					cartItem.total_price += good_count * good_price;
				}else{
					cartItem.total -= good_count;
					cartItem.total_price -= good_count * good_price;
				}
				
			},
			// 删除购物车商品
			async delCartGood(cartItem, cartIndex){
				const {checked, cart_id, list} = cartItem;
				// 如果全部选中则删除购物车 cart 表中的数据以及 cart_detail 中关联的购物车商品详情数据
				// 未全部选中则只删除 cart_detail 中关联的购物车商品详情数据
				if(checked){
					let indexs = [];
					const res = await this.$requestTool.post('/cart/delAll', {
						id: cart_id
					});
					this.showToast(res.msg);
					this.cartList.splice(cartIndex, 1);
					this.failureCartList.forEach((item, index) => {
						if(item.cart_id === cart_id){
							indexs.push(index);
						}
					});
					indexs.forEach(index => {
						this.failureCartList.splice(index, 1);
					});
				}else{
					let ids = [];
					let tempList = [];
					list.forEach((item, index) => {
						if(item.checked){
							ids.push(item.id);
						}else{
							tempList.push(item);
						}
					});
					const res = await this.$requestTool.post('/cart/delSomeGood', {
						ids
					});
					this.showToast(res.msg);
					cartItem.list = tempList;
				}
			},
			// 清空所有失效宝贝
			async delAllFailureCartGood(){
				let ids = [];
				let indexs = [];
				this.failureCartList.forEach((item, index) => {
					ids.push(item.id);
				});
				const res = await this.$requestTool.post('/cart/delSomeGood', {
					ids
				});
				this.showToast(res.msg);
				this.failureCartList = [];
			},
			// 结算
			async submit(cartItem, cartIndex){
				if(cartItem.total === 0){
					return;
				}
				const {cart_id, list, checked} = cartItem;
				let ids = [];
				list.forEach((item, index) => {
					if(item.checked){
						ids.push(item.id);
					}
				});
				uni.navigateTo({
					url:`/pages/order/detail2?cart_detail_ids=${ids.join(',')}&admin_id=${cartItem.admin_id}&cart_id=${checked ? cart_id : -1}`,
					animationType:'slide-in-right',
					animationDuration:500
				});
			}
		},
		async onShow() {
			await this.getCartList();
			uni.pageScrollTo({
				scrollTop: 0,
				duration: 300
			});
		}
	}
</script>

<style scoped lang="scss">
	.wrap {
		padding: 20rpx;
		background-color: #F1F1F1;
	}
	
	.u-card-wrap { 
		background-color: $u-bg-color;
		padding: 1px;
	}
	
	.u-body-item {
		font-size: 32rpx;
		color: #333;
		padding: 20rpx 0;
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
		
		.del-btn {
			position: absolute;
			right: 0;
			font-size: 30rpx;
			color: $u-type-error;
		}
	}
	
	.card-foot {
		display: flex;
		align-items: center;
		justify-content: space-between;
		
		.total {
			font-size: 34rpx;
		}
	}
	
	/deep/.u-empty {
		height: 100vh!important;
	}
</style>
