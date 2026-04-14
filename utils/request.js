// 网络请求工具
import api from './api.js';

class Request {
    constructor() {
        this.baseUrl = 'http://localhost:3000';
    }

    // 统一请求方法
    request(options) {
        return new Promise((resolve, reject) => {
            wx.request({
                url: this.baseUrl + options.url,
                method: options.method || 'GET',
                data: options.data,
                header: {
                    'content-type': 'application/json',
                    ...options.header
                },
                success: (res) => {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(res.data);
                    } else {
                        reject({
                            code: res.statusCode,
                            message: '请求失败',
                            data: res.data
                        });
                    }
                },
                fail: (err) => {
                    reject({
                        code: -1,
                        message: '网络请求失败',
                        data: err
                    });
                }
            });
        });
    }

    // 获取Mock数据
    getMockData(type) {
        return this.request({
            url: `/mock-data/${type}`,
            method: 'GET'
        });
    }

    // 保存Mock数据
    saveMockData(type, data) {
        return this.request({
            url: `/mock-data/${type}`,
            method: 'POST',
            data: data
        });
    }
}

const request = new Request();

export default request;