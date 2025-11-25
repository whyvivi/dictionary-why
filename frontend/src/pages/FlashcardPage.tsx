import { useState, useEffect } from 'react';
import { FlashCard } from '../components/FlashCard';
import { FlashCardController } from '../components/FlashCardController';
import { flashcardApi, Flashcard } from '../utils/flashcardApi';
import { notebookApi, Notebook } from '../utils/notebookApi';

function FlashcardPage() {
    const [cards, setCards] = useState<Flashcard[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [mode, setMode] = useState<'recent' | 'notebook'>('recent');
    const [notebooks, setNotebooks] = useState<Notebook[]>([]);
    const [selectedNotebookId, setSelectedNotebookId] = useState<number | undefined>(undefined);

    // 加载闪卡
    const loadCards = async () => {
        setIsLoading(true);
        try {
            const list = await flashcardApi.getReviewList(mode, selectedNotebookId);
            setCards(list);
            setCurrentIndex(0);
            setIsFlipped(false);
        } catch (error) {
            console.error('加载闪卡失败:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // 加载单词本列表（用于筛选）
    useEffect(() => {
        notebookApi.getAll().then(setNotebooks).catch(console.error);
    }, []);

    // 监听模式变化重新加载
    useEffect(() => {
        loadCards();
    }, [mode, selectedNotebookId]);

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
                    // 本轮复习完成，清空列表显示完成状态
                    setCards([]);
                }
            }, 300); // 等待翻转动画
        } catch (error) {
            console.error('提交复习结果失败:', error);
        }
    };

    return (
        <div className="max-w-4xl mx-auto min-h-[calc(100vh-140px)] flex flex-col">
            {/* 顶部控制栏 */}
            <div className="flex justify-between items-center mb-8 px-4">
                <h2 className="text-2xl font-bold text-gray-800">单词闪卡</h2>
                <div className="flex gap-4">
                    <select
                        value={mode}
                        onChange={(e) => setMode(e.target.value as 'recent' | 'notebook')}
                        className="bg-white/50 border border-white/60 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                    >
                        <option value="recent">最近添加</option>
                        <option value="notebook">按单词本</option>
                    </select>

                    {mode === 'notebook' && (
                        <select
                            value={selectedNotebookId || ''}
                            onChange={(e) => setSelectedNotebookId(Number(e.target.value))}
                            className="bg-white/50 border border-white/60 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                        >
                            <option value="">选择单词本...</option>
                            {notebooks.map(nb => (
                                <option key={nb.id} value={nb.id}>{nb.name}</option>
                            ))}
                        </select>
                    )}

                    <button
                        onClick={loadCards}
                        className="p-1.5 bg-white/50 rounded-lg hover:bg-white/80 transition-colors"
                        title="刷新"
                    >
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* 主内容区域 */}
            <div className="flex-1 flex flex-col justify-center">
                {isLoading ? (
                    <div className="text-center text-gray-500">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                        加载中...
                    </div>
                ) : cards.length > 0 && currentIndex < cards.length ? (
                    <>
                        <FlashCard
                            card={cards[currentIndex]}
                            isFlipped={isFlipped}
                            onFlip={() => setIsFlipped(!isFlipped)}
                        />
                        {isFlipped && (
                            <div className="animate-fade-in-up">
                                <FlashCardController
                                    onReview={handleReview}
                                    remainingCount={cards.length - currentIndex}
                                />
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-20 bg-white/30 backdrop-blur-md rounded-3xl border border-white/40 shadow-lg mx-auto w-full max-w-2xl">
                        <div className="text-6xl mb-4">🎉</div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">太棒了！</h3>
                        <p className="text-gray-600">当前列表中的闪卡已全部复习完成</p>
                        <button
                            onClick={loadCards}
                            className="mt-6 px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors shadow-lg hover:shadow-xl"
                        >
                            再来一组
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default FlashcardPage;
