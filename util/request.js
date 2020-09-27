import Vue from 'vue';
import Request from 'luch-request'

const http = new Request({
	baseURL: 'https://koamall.top/api/user', 
	timeout: 60000 // 请求超时时间
})

// 请求类
class RequestTool {
    // RequestTool 中间件的安装调用方法
    install(){
        Vue.prototype.$requestTool = {
            get: this.get,
            getOpenid: this.getOpenid,
            post: this.post
        };
    }
	
	get(url, config){
        return new Promise((resolve, reject) => {
            http.get(url, config).then((res) => {
                const data = res.data;
                if(data.code === 0){
                    resolve(data);
                }else{
                    const msg = data.retMessage ? data.retMessage : data.msg;
					console.log(msg);
                    // Vue.prototype.$message.error(msg);
                    reject(msg);
                }
            }).catch((e) => { // 500 默认走 catch
                reject(e);
            });
        });
    }

    // post 请求，requestData、config 跟 axios 参数配置一致
    post(url, requestData, config){
        return new Promise((resolve, reject) => {
            http.post(url, requestData, config).then((res) => {
                const data = res.data;
                if(data.code === 0){
                    resolve(data);
                }else{
                    const msg = data.retMessage ? data.retMessage : data.msg;
					console.log(msg);
                    // Vue.prototype.$message.error(msg);
                    reject(msg);
                }
            }).catch((e) => { // 500 默认走 catch
                reject(e);
            });
        });
    }
}

const requestTool = new RequestTool();

export default requestTool;

