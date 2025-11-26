import React, { useState, useEffect } from 'react';
import { notebookApi } from '../utils/notebookApi';
import { flashcardApi } from '../utils/flashcardApi';
import { Toast } from './Toast';

interface WordHeaderProps {
    word: string;
    phoneticUk?: string;
    phoneticUs?: string;
    audioUk?: string;
    audioUs?: string;
    wordId?: number;
}

export const WordHeader: React.FC<WordHeaderProps> = ({ word, phoneticUk, phoneticUs, audioUk, audioUs, wordId }) => {
    const [isPlaying, setIsPlaying] = useState<'uk' | 'us' | null>(null);
    const [isCollected, setIsCollected] = useState(false);
    const [isInFlashcard, setIsInFlashcard] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
    const [defaultNotebookId, setDefaultNotebookId] = useState<number | null>(null);
    const [flashcardId, setFlashcardId] = useState<number | null>(null);

    // 初始化检查状态
    useEffect(() => {
        if (!wordId) return;
        checkStatus();
    }, [wordId]);

    const checkStatus = async () => {
        if (!wordId) return;
        try {
            // 1. 检查收藏状态
            const nb = await notebookApi.getDefault();
            setDefaultNotebookId(nb.id);
            const detail = await notebookApi.getDetail(nb.id);
            const foundInNotebook = detail.words.some(w => w.wordId === wordId);
            setIsCollected(foundInNotebook);

            // 2. 检查闪卡状态
            const flashcards = await flashcardApi.getAll();
            const foundCard = flashcards.find(fc => fc.wordId === wordId);
            setIsInFlashcard(!!foundCard);
            if (foundCard) setFlashcardId(foundCard.id);

        } catch (error) {
            console.error('检查状态失败:', error);
        }
    };

    const playAudio = (url: string, type: 'uk' | 'us') => {
        if (!url) return;
        setIsPlaying(type);
        const audio = new Audio(url);
        audio.onended = () => setIsPlaying(null);
        audio.play().catch(e => {
            console.error('播放失败:', e);
            setIsPlaying(null);
        });
    };

    const handleCollect = async () => {
        if (!wordId || !defaultNotebookId) return;
        setIsLoading(true);
        try {
            if (isCollected) {
                // 取消收藏
                await notebookApi.removeWord(defaultNotebookId, wordId);
                setIsCollected(false);
                setToast({ message: '收藏已取消', type: 'info' });
            } else {
                // 加入收藏
                await notebookApi.addWord(defaultNotebookId, wordId);
                setIsCollected(true);
                setToast({ message: '已加入收藏', type: 'success' });
            }
        } catch (error) {
            console.error('操作失败:', error);
            setToast({ message: '操作失败', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleFlashcard = async () => {
        if (!wordId) return;
        setIsLoading(true);
        try {
            if (isInFlashcard) {
                // 移除闪卡 (Step 5)
                if (flashcardId) {
                    await flashcardApi.delete(flashcardId);
                    setIsInFlashcard(false);
                    setFlashcardId(null);
                    setToast({ message: '已从闪卡移除', type: 'info' });
                }
            } else {
                // 加入闪卡
                const newCard = await flashcardApi.create(wordId);
                setIsInFlashcard(true);
                setFlashcardId(newCard.id);
                setToast({ message: '已加入闪卡', type: 'success' });
            }
        } catch (error) {
            console.error('操作失败:', error);
            setToast({ message: '操作失败', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white/40 backdrop-blur-md rounded-2xl p-6 border border-white/50 shadow-lg mb-6 animate-fade-in-down relative">
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">{word}</h1>
                    <div className="flex gap-4 text-gray-600 font-mono">
                        {phoneticUk && (
                            <div className="flex items-center gap-2">
                                <span>UK /{phoneticUk}/</span>
                                {audioUk && (
                                    <button
                                        onClick={() => playAudio(audioUk, 'uk')}
                                        className={`p-1 rounded-full hover:bg-white/50 transition-colors ${isPlaying === 'uk' ? 'text-blue-500' : 'text-gray-500'}`}
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        )}
                        {phoneticUs && (
                            <div className="flex items-center gap-2">
                                <span>US /{phoneticUs}/</span>
                                {audioUs && (
                                    <button
                                        onClick={() => playAudio(audioUs, 'us')}
                                        className={`p-1 rounded-full hover:bg-white/50 transition-colors ${isPlaying === 'us' ? 'text-blue-500' : 'text-gray-500'}`}
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* 按钮组 */}
                <div className="flex gap-3">
                    <button
                        onClick={handleCollect}
                        disabled={isLoading}
                        className={`px-4 py-2 rounded-xl transition-all shadow-sm flex items-center gap-2 ${isCollected
                                ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                                : 'bg-white/50 text-gray-600 hover:bg-white/80'
                            }`}
                        title={isCollected ? "取消收藏" : "加入收藏"}
                    >
                        <span>{isCollected ? '⭐ 已收藏' : '⭐ 收藏'}</span>
                    </button>

                    <button
                        onClick={handleFlashcard}
                        disabled={isLoading}
                        className={`px-4 py-2 rounded-xl transition-all shadow-sm flex items-center gap-2 ${isInFlashcard
                                ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                                : 'bg-pink-500 text-white hover:bg-pink-600'
                            }`}
                        title={isInFlashcard ? "移除闪卡" : "加入闪卡"}
                    >
                        <span>{isInFlashcard ? '🃏 已加入' : '🃏 加入闪卡'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WordHeader;
