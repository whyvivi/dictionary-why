import axios from 'axios';

// 创建 axios 实例
const api = axios.create({
    baseURL: '/api',  // 使用 Vite 代理,会自动转发到 http://localhost:3000/api
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 请求拦截器:自动添加 JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 响应拦截器:处理错误
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // 401 未授权:清除 token 并跳转到登录页
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/auth';
        }
        return Promise.reject(error);
    }
);

export default api;
