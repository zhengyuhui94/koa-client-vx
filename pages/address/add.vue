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
		<u-button @click="submit">保存</u-button>
		<u-toast ref="uToast" />
	</view>
</template>

<script>
	export default {
		data(){
			return {
				pickerShow: false,
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
						const params = {...this.form, user_id: this.$store.state.userId};
						this.$requestTool.post('/address/add', params).then(() => {
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
			}
		},
		// 必须要在onReady生命周期，因为onLoad生命周期组件可能尚未创建完毕
		onReady() {
			this.$refs.uForm.setRules(this.rules);
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
	}
</style>
