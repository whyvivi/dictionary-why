import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FlashCard } from '../components/FlashCard';
import { FlashCardController } from '../components/FlashCardController';
import { flashcardApi, Flashcard } from '../utils/flashcardApi';
import { Toast } from '../components/Toast';

function FlashcardReviewPage() {
    const navigate = useNavigate();
    const [cards, setCards] = useState<Flashcard[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
    const [isFinished, setIsFinished] = useState(false);

    // 加载闪卡
    const loadCards = async () => {
        setIsLoading(true);
        try {
            // 默认加载最近的或者需要复习的
            const list = await flashcardApi.getReviewList('recent');
            setCards(list);
            setCurrentIndex(0);
            setIsFlipped(false);
            setIsFinished(false);
        } catch (error) {
            console.error('加载闪卡失败:', error);
            setToast({ message: '加载失败', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadCards();
    }, []);

    // 处理复习结果
    const handleReview = async (result: 'good' | 'again') => {
        const currentCard = cards[currentIndex];
        if (!currentCard) return;

        try {
            await flashcardApi.review(currentCard.id, result);

            // 切换到下一张
            setIsFlipped(false);
            setTimeout(() => {
                if (currentIndex < cards.length - 1) {
                    setCurrentIndex(prev => prev + 1);
                } else {
                    // 本轮复习完成
                    setIsFinished(true);
                }
            }, 300); // 等待翻转动画
        } catch (error) {
            console.error('提交复习结果失败:', error);
            setToast({ message: '提交失败', type: 'error' });
        }
    };

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto min-h-[calc(100vh-140px)] flex flex-col justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                <p className="text-gray-500">正在准备复习卡片...</p>
            </div>
        );
    }

    if (isFinished) {
        return (
            <div className="max-w-4xl mx-auto min-h-[calc(100vh-140px)] flex flex-col justify-center items-center animate-fade-in-up">
                <div className="bg-white/40 backdrop-blur-md rounded-3xl border border-white/50 shadow-xl p-12 text-center max-w-lg w-full">
                    <div className="text-8xl mb-6">🎉</div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">今日复习完成！</h2>
                    <p className="text-gray-600 mb-8 text-lg">
                        太棒了！你已经完成了所有待复习的卡片。
                        <br />
                        保持这个节奏，你的词汇量会突飞猛进！
                    </p>
                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={() => navigate('/flashcards/list')}
                            className="px-6 py-3 bg-white text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                        >
                            查看列表
                        </button>
                        <button
                            onClick={() => navigate('/search')}
                            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                        >
                            继续查词
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (cards.length === 0) {
        return (
            <div className="max-w-4xl mx-auto min-h-[calc(100vh-140px)] flex flex-col justify-center items-center">
                <div className="bg-white/40 backdrop-blur-md rounded-3xl border border-white/50 shadow-xl p-12 text-center max-w-lg w-full">
                    <div className="text-6xl mb-6">😴</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">暂时没有需要复习的卡片</h2>
                    <p className="text-gray-600 mb-8">
                        去查词页面添加一些新单词，或者稍后再来看看吧。
                    </p>
                    <button
                        onClick={() => navigate('/search')}
                        className="px-6 py-3 bg-blue-500 text-white rounded-xl shadow-lg hover:bg-blue-600 transition-colors"
                    >
                        去添加单词
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto min-h-[calc(100vh-140px)] flex flex-col">
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            {/* 顶部进度条 */}
            <div className="mb-8 px-4">
                <div className="flex justify-between text-sm text-gray-500 mb-2">
                    <span>复习进度</span>
                    <span>{currentIndex + 1} / {cards.length}</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-blue-500 transition-all duration-300"
                        style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
                    ></div>
                </div>
            </div>

            {/* 主内容区域 */}
            <div className="flex-1 flex flex-col justify-center pb-12">
                <FlashCard
                    card={cards[currentIndex]}
                    isFlipped={isFlipped}
                    onFlip={() => setIsFlipped(!isFlipped)}
                />

                {isFlipped && (
                    <div className="animate-fade-in-up">
                        <FlashCardController
                            onReview={handleReview}
                            remainingCount={cards.length - currentIndex - 1}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

export default FlashcardReviewPage;
