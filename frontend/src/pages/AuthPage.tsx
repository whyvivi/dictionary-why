import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { setToken, setUser } from '../utils/auth';

/**
 * 登录/注册页面
 * 采用新海诚风格的天空渐变背景和玻璃拟态卡片
 */
function AuthPage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // 处理登录
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.post('/auth/login', { email, password });
            const { user, token } = response.data;

            // 保存 token 和用户信息
            setToken(token);
            setUser(user);

            // 跳转到主应用
            navigate('/search');
        } catch (err: any) {
            setError(err.response?.data?.message || '登录失败,请检查邮箱和密码');
        } finally {
            setLoading(false);
        }
    };

    // 处理注册
    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // 验证密码
        if (password !== confirmPassword) {
            setError('两次输入的密码不一致');
            return;
        }

        if (password.length < 6) {
            setError('密码长度至少为 6 位');
            return;
        }

        setLoading(true);

        try {
            const response = await api.post('/auth/register', { email, password });
            const { user, token } = response.data;

            // 保存 token 和用户信息
            setToken(token);
            setUser(user);

            // 跳转到主应用
            navigate('/search');
        } catch (err: any) {
            setError(err.response?.data?.message || '注册失败,请稍后重试');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen sky-gradient flex items-center justify-center p-4">
            {/* 玻璃拟态卡片 */}
            <div className="glass-strong rounded-3xl shadow-glass p-8 w-full max-w-md card-float">
                {/* 应用标题 */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">
                        Why Dictionary
                    </h1>
                    <p className="text-gray-600">为你一个人定制的智能英语词典</p>
                </div>

                {/* Tab 切换 */}
                <div className="flex mb-6 bg-white/30 rounded-xl p-1">
                    <button
                        className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${activeTab === 'login'
                                ? 'bg-white text-gray-800 shadow-md'
                                : 'text-gray-600 hover:text-gray-800'
                            }`}
                        onClick={() => {
                            setActiveTab('login');
                            setError('');
                        }}
                    >
                        登录
                    </button>
                    <button
                        className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${activeTab === 'register'
                                ? 'bg-white text-gray-800 shadow-md'
                                : 'text-gray-600 hover:text-gray-800'
                            }`}
                        onClick={() => {
                            setActiveTab('register');
                            setError('');
                        }}
                    >
                        注册
                    </button>
                </div>

                {/* 错误提示 */}
                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                {/* 登录表单 */}
                {activeTab === 'login' && (
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">
                                邮箱
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-white/50 border border-white/30 focus:bg-white focus:border-sky-400 transition-all"
                                placeholder="请输入邮箱"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">
                                密码
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-white/50 border border-white/30 focus:bg-white focus:border-sky-400 transition-all"
                                placeholder="请输入密码"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-4 bg-gradient-to-r from-sky-400 to-lavender-400 text-white font-medium rounded-xl shadow-lg btn-hover disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? '登录中...' : '登录'}
                        </button>
                    </form>
                )}

                {/* 注册表单 */}
                {activeTab === 'register' && (
                    <form onSubmit={handleRegister} className="space-y-4">
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">
                                邮箱
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-white/50 border border-white/30 focus:bg-white focus:border-sky-400 transition-all"
                                placeholder="请输入邮箱"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">
                                密码
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-white/50 border border-white/30 focus:bg-white focus:border-sky-400 transition-all"
                                placeholder="至少 6 位"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">
                                确认密码
                            </label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-white/50 border border-white/30 focus:bg-white focus:border-sky-400 transition-all"
                                placeholder="再次输入密码"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-4 bg-gradient-to-r from-lavender-400 to-peach-400 text-white font-medium rounded-xl shadow-lg btn-hover disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? '注册中...' : '注册'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}

export default AuthPage;
