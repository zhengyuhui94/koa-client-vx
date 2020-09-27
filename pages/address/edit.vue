<template>
	<view class="wrap">
		<u-form :model="form" ref="uForm" :label-width="140" label-align="right" :label-style="{marginRight:'10px'}" :border-bottom="true">
			<u-form-item label="收货人" prop="name">
				<u-input v-model="form.name" placeholder="请输入姓名" />
			</u-form-item>
			<u-form-item label="手机号码" prop="mobile">
				<u-input v-model="form.mobile" placeholder="请输入手机号" />
			</u-form-item>
			<u-form-item label="所在地区" prop="area">
				<view class="show-picker" @click="showPicker">
					<span class="area" v-if="form.area">{{form.area}}</span>
					<span v-else>请选择地区</span>
					<u-icon class="picker-icon" name="arrow-down-fill"></u-icon>
				</view>
				<u-picker v-model="pickerShow" mode="region" @confirm="confirm" :default-region="areaArr"></u-picker>
			</u-form-item>
			<u-form-item label="详细地址" prop="address">
				<u-input v-model="form.address" placeholder="请输入详细地址" />
			</u-form-item>
		</u-form>
		<div class="default-wrap">
			<span>设为默认地址</span>
			<u-switch v-model="defaultChecked" :size="28" @change="defaultChange"></u-switch>
		</div>
		<u-gap height="20" bg-color="rgba(200, 199, 204, 0.2)"></u-gap>
		<div class="del-wrap">
			<span @click="delAddress">删除收货地址</span>
		</div>
		<u-button @click="submit">保存</u-button>
		<u-toast ref="uToast" />
	</view>
</template>

<script>
	export default {
		data(){
			return {
				pickerShow: false,
				defaultChecked: false,
				statu: 1,
				areaArr: [],
				form: {
					name: '',
					mobile: '',
					area: '',
					address: ''
				},
				rules: {
					name: [
						{
							required: true,
							message: '请输入姓名',
							// 可以单个或者同时写两个触发验证方式
							trigger: 'blur,change'
						}
					],
					mobile: [
						{
							required: true, 
							message: '请输入手机号',
							trigger: ['change','blur'],
						}
					],
					area: [
						{
							required: true, 
							message: '请选择所在地区',
							trigger: ['change']
						}
					],
					address: [
						{
							required: true, 
							message: '请填写详细地址',
							trigger: ['change','blur']
						}
					]
				}
			}
		},
		methods:{
			submit() {
				this.$refs.uForm.validate(valid => {
					if (valid) {
						const params = {...this.form, id: this.$data.address_id, user_id: this.$store.state.userId, statu: this.statu};
						this.$requestTool.post('/address/update', params).then(() => {
							this.$refs.uToast.show({
								title: '添加成功',
								type: 'success',
								callback(){
									uni.navigateBack({
										animationDuration:500,
										animationType:'slide-in-left'
									});
								}	
							});
						});
					} else {
						console.log('验证失败');
					}
				});
			},
			showPicker(){
				this.pickerShow = true;
			},
			confirm(value){
				this.areaArr = [value.province.label, value.city.label, value.area.label];
				this.form.area = this.areaArr.join('-');
			},
			async delAddress(){
				await this.$requestTool.post('/address/del', {
					id: this.$data.address_id
				});
				this.$refs.uToast.show({
					title: '删除成功',
					type: 'success',
					callback(){
						uni.navigateBack({
							animationDuration:500,
							animationType:'slide-in-left'
						});
					}	
				});
				
			},
			defaultChange(value){
				if(value){
					this.statu = 0;
				}else{
					this.statu = 1;
				}
			}
		},
		// 必须要在onReady生命周期，因为onLoad生命周期组件可能尚未创建完毕
		onReady() {
			this.$refs.uForm.setRules(this.rules);
		},
		async onLoad(option) {
			const {data} = await this.$requestTool.get('/address/queryById', {
				params: {
					id: option.id
				}
			});
			const {id, name, mobile, area, address, statu} = data;
			this.form = {
				name,
				mobile,
				area,
				address
			};
			this.$data.address_id = id;
			this.areaArr = area.split('-');
			this.statu = statu;
			this.defaultChecked = statu === 0 ? true : false;
		}
	}
</script>

<style lang="scss" scoped>
	.wrap {
		padding: 20rpx;
		
		.show-picker {
			display: flex;
			justify-content: space-between;
			color: #C8C7CC;
			
			.area {
				color: #303133;
			}
		}
		
		.default-wrap {
			margin-top: 20rpx;
			margin-bottom: 20rpx;
			display: flex;
			font-size: 30rpx;
			justify-content: space-between;
		}
		
		.del-wrap {
			margin-top: 20rpx;
			margin-bottom: 20rpx;
			height: 40rpx;
			display: flex;
			align-items: center;
			font-size: 30rpx;
			color: $u-type-error;
		}
	}
</style>
