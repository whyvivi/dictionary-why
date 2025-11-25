// 用户信息接口
export interface User {
    id: number;
    email: string;
    nickname: string;
    avatarUrl: string;
}

/**
 * 保存 JWT token 到 localStorage
 */
export const setToken = (token: string): void => {
    localStorage.setItem('token', token);
};

/**
 * 获取 JWT token
 */
export const getToken = (): string | null => {
    return localStorage.getItem('token');
};

/**
 * 删除 JWT token
 */
export const removeToken = (): void => {
    localStorage.removeItem('token');
};

/**
 * 保存用户信息到 localStorage
 */
export const setUser = (user: User): void => {
    localStorage.setItem('user', JSON.stringify(user));
};

/**
 * 获取用户信息
 */
export const getUser = (): User | null => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
        return JSON.parse(userStr);
    } catch {
        return null;
    }
};

/**
 * 删除用户信息
 */
export const removeUser = (): void => {
    localStorage.removeItem('user');
};

/**
 * 清除所有认证信息
 */
export const clearAuth = (): void => {
    removeToken();
    removeUser();
};

/**
 * 检查是否已登录
 */
export const isAuthenticated = (): boolean => {
    return !!getToken();
};
