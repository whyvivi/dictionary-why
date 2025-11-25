import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { getUser, clearAuth, User } from '../utils/auth';

/**
 * 顶部 Header 组件
 * 包含 Logo、应用名称、用户头像和下拉菜单
 */
function Header() {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [showMenu, setShowMenu] = useState(false);

    useEffect(() => {
        // 从 localStorage 加载用户信息
        const cachedUser = getUser();
        if (cachedUser) {
            setUser(cachedUser);
        }

        // 从后端获取最新用户信息
        fetchUserInfo();
    }, []);

    // 获取用户信息
    const fetchUserInfo = async () => {
        try {
            const response = await api.get('/auth/me');
            setUser(response.data);
        } catch (error) {
            console.error('获取用户信息失败:', error);
        }
    };

    // 退出登录
    const handleLogout = () => {
        clearAuth();
        navigate('/auth');
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 glass shadow-glass">
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                {/* 左侧:Logo + 应用名称 */}
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-lavender-400 rounded-xl flex items-center justify-center shadow-md">
                        <span className="text-white text-xl font-bold">W</span>
                    </div>
                    <h1 className="text-xl font-bold text-gray-800">Why Dictionary</h1>
                </div>

                {/* 右侧:用户信息 */}
                {user && (
                    <div className="relative">
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
                        >
                            <span className="text-gray-700 font-medium hidden sm:block">
                                {user.nickname}
                            </span>
                            <img
                                src={user.avatarUrl}
                                alt={user.nickname}
                                className="w-10 h-10 rounded-full border-2 border-white shadow-md"
                            />
                        </button>

                        {/* 下拉菜单 */}
                        {showMenu && (
                            <>
                                {/* 遮罩层,点击关闭菜单 */}
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setShowMenu(false)}
                                />

                                {/* 菜单内容 */}
                                <div className="absolute right-0 mt-2 w-48 glass-strong rounded-xl shadow-glass-hover overflow-hidden z-50">
                                    <div className="py-2">
                                        <button
                                            className="w-full px-4 py-2 text-left text-gray-700 hover:bg-white/30 transition-colors"
                                            onClick={() => {
                                                setShowMenu(false);
                                                // TODO: 跳转到个人资料页
                                                alert('个人资料功能待实现');
                                            }}
                                        >
                                            📝 个人资料
                                        </button>
                                        <hr className="my-1 border-white/30" />
                                        <button
                                            className="w-full px-4 py-2 text-left text-red-600 hover:bg-white/30 transition-colors"
                                            onClick={() => {
                                                setShowMenu(false);
                                                handleLogout();
                                            }}
                                        >
                                            🚪 退出登录
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
}

export default Header;
