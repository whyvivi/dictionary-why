import { useLocation, useNavigate } from 'react-router-dom';

/**
 * 底部导航栏组件
 * 包含 3 个 Tab:查词、单词本、闪卡
 */
function TabBar() {
    const location = useLocation();
    const navigate = useNavigate();

    const tabs = [
        {
            id: 'search',
            path: '/search',
            label: '查词',
            icon: '🔍',
        },
        {
            id: 'wordbook',
            path: '/wordbook',
            label: '单词本',
            icon: '📚',
        },
        {
            id: 'flashcard',
            path: '/flashcard',
            label: '闪卡',
            icon: '🎴',
        },
    ];

    const currentPath = location.pathname;

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 glass shadow-glass">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-around">
                    {tabs.map((tab) => {
                        const isActive = currentPath === tab.path;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => navigate(tab.path)}
                                className={`flex-1 flex flex-col items-center py-3 transition-all ${isActive ? 'text-sky-600' : 'text-gray-600 hover:text-gray-800'
                                    }`}
                            >
                                <span className="text-2xl mb-1">{tab.icon}</span>
                                <span className="text-sm font-medium">{tab.label}</span>
                                {/* 选中指示器 */}
                                {isActive && (
                                    <div className="absolute bottom-0 w-12 h-1 bg-gradient-to-r from-sky-400 to-lavender-400 rounded-t-full" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}

export default TabBar;
