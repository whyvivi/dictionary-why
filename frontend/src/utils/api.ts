import axios from 'axios';

/**
 * 统一的后端 API 客户端配置
 * 
 * 环境说明：
 * 1. 本地开发环境：
 *    - VITE_API_BASE_URL 默认为 http://localhost:3000
 *    - 最终 baseURL 为 http://localhost:3000/api
 * 
 * 2. 云端部署环境（Vercel）：
 *    - 需要在 Vercel 环境变量中设置 VITE_API_BASE_URL
 *    - 例如：VITE_API_BASE_URL="https://dictionary-backend-z9k0.onrender.com"
 *    - 最终 baseURL 为 https://dictionary-backend-z9k0.onrender.com/api
 * 
 * 注意：环境变量中只存储后端根域名，不要包含 /api 路径，代码会自动拼接
 */

// 从环境变量读取后端根地址（不含 /api）
// 本地开发默认为 http://localhost:3000
const BACKEND_ROOT = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// 拼接完整的 API 基础地址（根地址 + /api）
const API_BASE_URL = `${BACKEND_ROOT}/api`;

// 创建 axios 实例
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 60000,
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
