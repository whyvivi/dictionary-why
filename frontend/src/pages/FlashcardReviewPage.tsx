import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { flashcardApi, Flashcard } from '../utils/flashcardApi';

/**
 * 闪卡复习页面 - 翻牌式UI
 * 支持遗忘曲线复习，显示单词正反面，认识/不认识按钮
 */
function FlashcardReviewPage() {
    const navigate = useNavigate();
    const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isReviewing, setIsReviewing] = useState(false);

    // 加载今日需要复习的闪卡
    useEffect(() => {
        loadTodayFlashcards();
    }, []);

    const loadTodayFlashcards = async () => {
        setIsLoading(true);
        try {
            const cards = await flashcardApi.getTodayFlashcards();
            setFlashcards(cards);
        } catch (error) {
            console.error('加载今日闪卡失败:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // 处理翻牌
    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    // 处理复习结果
    const handleReview = async (result: 'good' | 'again') => {
        if (isReviewing) return;
        const currentCard = flashcards[currentIndex];
        if (!currentCard) return;

        setIsReviewing(true);
        try {
            await flashcardApi.review(currentCard.id, result);

            // 移动到下一张
            if (currentIndex < flashcards.length - 1) {
                setCurrentIndex(currentIndex + 1);
                setIsFlipped(false);
            } else {
                // 全部完成
                setCurrentIndex(flashcards.length);
            }
        } catch (error) {
            console.error('提交复习结果失败:', error);
        } finally {
            setIsReviewing(false);
        }
    };

    // 重新洗牌
    const handleShuffle = () => {
        const shuffled = [...flashcards].sort(() => Math.random() - 0.5);
        setFlashcards(shuffled);
        setCurrentIndex(0);
        setIsFlipped(false);
    };

    const currentCard = flashcards[currentIndex];
    const isCompleted = currentIndex >= flashcards.length;

    return (
        <div className="max-w-4xl mx-auto min-h-[calc(100vh-140px)] flex flex-col">
            {/* 加载状态 */}
            {isLoading && (
                <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="animate-spin w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full mb-4"></div>
                    <p className="text-gray-600 text-lg">加载今日闪卡...</p>
                </div>
            )}

            {/* 空状态 - 今日无需复习 */}
            {!isLoading && flashcards.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="bg-white/40 backdrop-blur-sm rounded-3xl shadow-xl p-16 text-center max-w-md">
                        <div className="text-6xl mb-6">🎉</div>
                        <h2 className="text-3xl font-semibold text-gray-800 mb-4 tracking-wide">今日无需复习</h2>
                        <p className="text-gray-600 mb-8">
                            太棒了！今天没有需要复习的闪卡。
                        </p>
                        <button
                            onClick={() => navigate('/flashcards/list')}
                            className="px-8 py-3 bg-gradient-to-r from-blue-400 to-indigo-400 text-white rounded-full hover:from-blue-500 hover:to-indigo-500 transition-all shadow-md font-medium"
                        >
                            返回闪卡列表
                        </button>
                    </div>
                </div>
            )}

            {/* 复习完成状态 */}
            {!isLoading && flashcards.length > 0 && isCompleted && (
                <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="bg-white/40 backdrop-blur-sm rounded-3xl shadow-xl p-16 text-center max-w-md">
                        <div className="text-6xl mb-6">✨</div>
                        <h2 className="text-3xl font-semibold text-gray-800 mb-4 tracking-wide">今日复习完成！</h2>
                        <p className="text-gray-600 mb-8">
                            太棒了，今日闪卡复习全部完成！
                            <br />
                            共复习了 {flashcards.length} 张卡片
                        </p>
                        <button
                            onClick={() => navigate('/flashcards/list')}
                            className="px-8 py-3 bg-gradient-to-r from-blue-400 to-indigo-400 text-white rounded-full hover:from-blue-500 hover:to-indigo-500 transition-all shadow-md font-medium"
                        >
                            返回闪卡列表
                        </button>
                    </div>
                </div>
            )}

            {/* 复习中 */}
            {!isLoading && currentCard && !isCompleted && (
                <div className="flex-1 flex flex-col">
                    {/* 顶部导航栏 */}
                    <div className="flex items-center justify-between mb-8">
                        {/* 左侧：返回按钮 */}
                        <button
                            onClick={() => navigate('/flashcards/list')}
                            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-white/40 rounded-lg transition-colors"
                            title="返回"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>

                        {/* 中间：进度 */}
                        <div className="text-lg font-medium text-gray-700">
                            {currentIndex + 1} / {flashcards.length}
                        </div>

                        {/* 右侧：洗牌按钮 */}
                        <button
                            onClick={handleShuffle}
                            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-white/40 rounded-lg transition-colors"
                            title="重新洗牌"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </button>
                    </div>

                    {/* 中间：卡片 */}
                    <div className="flex-1 flex items-center justify-center mb-8">
                        <div
                            onClick={handleFlip}
                            className="relative w-full max-w-2xl cursor-pointer"
                            style={{ minHeight: '400px' }}
                        >
                            {/* 卡片容器 */}
                            <div className={`w-full h-full transition-all duration-500 transform-gpu ${isFlipped ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
                                <div className="bg-white/50 backdrop-blur-lg rounded-3xl shadow-2xl p-12 border border-white/60 h-full flex flex-col items-center justify-center">
                                    {/* 正面：单词 + 音标 */}
                                    <h1 className="text-6xl font-bold text-gray-800 mb-6">{currentCard.spelling}</h1>
                                    {currentCard.phoneticUk && (
                                        <p className="text-2xl text-gray-600 font-mono">
                                            /{currentCard.phoneticUk}/
                                        </p>
                                    )}
                                    <p className="text-gray-400 mt-8 text-sm">点击翻转</p>
                                </div>
                            </div>

                            {/* 背面：释义 + 例句 */}
                            <div className={`absolute inset-0 transition-all duration-500 transform-gpu ${isFlipped ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
                                <div className="bg-white/50 backdrop-blur-lg rounded-3xl shadow-2xl p-12 border border-white/60 h-full overflow-y-auto custom-scrollbar">
                                    <h2 className="text-4xl font-semibold text-gray-800 mb-6">{currentCard.spelling}</h2>

                                    {/* 释义列表 */}
                                    <div className="space-y-4">
                                        {currentCard.senses && currentCard.senses.map((sense, idx) => (
                                            <div key={idx} className="pb-4 border-b border-gray-200 last:border-0">
                                                <div className="flex items-baseline gap-2 mb-2">
                                                    <span className="text-sm font-medium text-blue-600">{sense.partOfSpeech}</span>
                                                    <p className="text-gray-700">{sense.definitionZh || sense.definitionEn}</p>
                                                </div>
                                                {sense.examples && sense.examples.length > 0 && (
                                                    <div className="ml-4 mt-2 space-y-1">
                                                        {sense.examples.slice(0, 2).map((example, exIdx) => (
                                                            <p key={exIdx} className="text-sm text-gray-600 italic">
                                                                {example.sentenceZh || example.sentenceEn}
                                                            </p>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    <p className="text-gray-400 mt-6 text-sm text-center">点击翻转</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 底部：按钮 */}
                    <div className="flex gap-4 justify-center pb-8">
                        <button
                            onClick={() => handleReview('again')}
                            disabled={isReviewing || !isFlipped}
                            className={`flex-1 max-w-xs py-4 rounded-2xl font-medium text-lg shadow-lg transition-all ${isFlipped
                                    ? 'bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                }`}
                        >
                            ❌ 不认识
                        </button>
                        <button
                            onClick={() => handleReview('good')}
                            disabled={isReviewing || !isFlipped}
                            className={`flex-1 max-w-xs py-4 rounded-2xl font-medium text-lg shadow-lg transition-all ${isFlipped
                                    ? 'bg-gradient-to-r from-teal-400 to-green-400 hover:from-teal-500 hover:to-green-500 text-white'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                }`}
                        >
                            ✅ 认识
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default FlashcardReviewPage;
