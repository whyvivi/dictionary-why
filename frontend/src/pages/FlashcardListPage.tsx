import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { flashcardApi, Flashcard } from '../utils/flashcardApi';
import { Toast } from '../components/Toast';

function FlashcardListPage() {
    const navigate = useNavigate();
    const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

    useEffect(() => {
        loadFlashcards();
    }, []);

    const loadFlashcards = async () => {
        setIsLoading(true);
        try {
            const list = await flashcardApi.getAll();
            setFlashcards(list);
        } catch (error: any) {
            console.error('加载闪卡失败:', error);
            const status = error.response?.status;
            const message = error.response?.data?.message || error.message;
            setToast({ message: `加载闪卡失败 (${status}): ${message}`, type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!window.confirm('确定要移除这张闪卡吗？')) return;

        try {
            await flashcardApi.delete(id);
            setFlashcards(prev => prev.filter(fc => fc.id !== id));
            setToast({ message: '已移除闪卡', type: 'success' });
        } catch (error: any) {
            console.error('删除失败:', error);
            const status = error.response?.status;
            const message = error.response?.data?.message || error.message;
            setToast({ message: `删除失败 (${status}): ${message}`, type: 'error' });
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffTime = date.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 0) return '今天';
        if (diffDays === 1) return '明天';
        if (diffDays === 2) return '后天';
        return `${date.getMonth() + 1}月${date.getDate()}日`;
    };

    const getProficiencyColor = (level: number) => {
        const colors = [
            'bg-gray-200 text-gray-600', // 0
            'bg-red-100 text-red-600',   // 1
            'bg-orange-100 text-orange-600', // 2
            'bg-yellow-100 text-yellow-600', // 3
            'bg-green-100 text-green-600',   // 4
            'bg-blue-100 text-blue-600',     // 5
        ];
        return colors[level] || colors[0];
    };

    return (
        <div className="max-w-4xl mx-auto min-h-[calc(100vh-140px)] flex flex-col">
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            {/* 顶部标题栏 */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-semibold text-gray-800 tracking-wider">我的闪卡</h2>
                    <p className="text-gray-600 mt-1">共 {flashcards.length} 张卡片</p>
                </div>
                <button
                    onClick={() => navigate('/flashcards/review')}
                    className="px-8 py-3 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 text-white rounded-full font-medium shadow-lg hover:shadow-xl hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 transition-all flex items-center gap-2"
                >
                    <span>▶</span>
                    开始今日复习
                </button>
            </div>

            {/* 列表区域 */}
            <div className="flex-1">
                {isLoading ? (
                    <div className="text-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                        <p className="text-gray-500">加载中...</p>
                    </div>
                ) : flashcards.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                        {flashcards.map(fc => (
                            <div
                                key={fc.id}
                                className="bg-white/40 backdrop-blur-md rounded-xl p-4 border border-white/50 shadow-sm hover:shadow-md transition-all flex justify-between items-center group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${getProficiencyColor(fc.proficiency)}`}>
                                        Lv.{fc.proficiency}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-800">{fc.spelling}</h3>
                                        <div className="flex gap-3 text-sm text-gray-500">
                                            <span>UK /{fc.phoneticUk}/</span>
                                            <span className="text-blue-500">下次复习: {formatDate(fc.nextReviewDate)}</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => handleDelete(fc.id, e)}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                    title="移除闪卡"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white/30 backdrop-blur-md rounded-3xl border border-white/40 shadow-lg">
                        <div className="text-6xl mb-4">🍃</div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">这里空空如也</h3>
                        <p className="text-gray-600 mb-6">你还没有加入任何闪卡，去查词页面添加吧~</p>
                        <button
                            onClick={() => navigate('/search')}
                            className="px-6 py-2 bg-white text-blue-500 border border-blue-200 rounded-full hover:bg-blue-50 transition-colors"
                        >
                            去查词
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default FlashcardListPage;
