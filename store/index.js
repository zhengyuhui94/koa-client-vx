import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store = new Vuex.Store({
	state: {
		// 微信用户唯一标识
		openid: '',
		// 用户 id
		userId: '',
		// 用户名
		userName: '',
		// 用户头像
		avatar: '',
		// 地址 id
		addressId: -1
	},
	mutations: {
		setOpenid(state, openid){
			state.openid = openid;
		},
		setUserId(state, userId){
			state.userId = userId;
		},
		setUserName(state, userName){
			state.userName = userName;
		},
		setAvatar(state, avatar){
			state.avatar = avatar;
		},
		setAddressId(state, addressId){
			state.addressId = addressId;
		}
	},
	actions: {
		
	}
})

export default store