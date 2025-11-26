import React, { useState, useEffect } from 'react';
import { notebookApi } from '../utils/notebookApi';
import { flashcardApi } from '../utils/flashcardApi';
import { Toast } from './Toast';
import { StarIcon } from './StarIcon';

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
    const [isLoading, setIsLoading] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
    const [defaultNotebookId, setDefaultNotebookId] = useState<number | null>(null);

    // 初始化检查收藏状态
    useEffect(() => {
        if (!wordId) return;
        checkStatus();
    }, [wordId]);

    const checkStatus = async () => {
        if (!wordId) return;
        try {
            // 检查是否已收藏（从默认单词本获取）
            const nb = await notebookApi.getDefault();
            setDefaultNotebookId(nb.id);
            const detail = await notebookApi.getDetail(nb.id);
            const foundInNotebook = detail.words.some(w => w.wordId === wordId);
            setIsCollected(foundInNotebook);
        } catch (error) {
            console.error('检查收藏状态失败:', error);
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

    /**
     * 收藏/取消收藏按钮处理
     * 收藏 = 加入单词本 + 自动创建闪卡（后端处理）
     * 取消收藏 = 移除单词本 + 自动删除闪卡（后端处理）
     */
    const handleCollect = async () => {
        if (!wordId) return;

        // 如果没有默认单词本ID，尝试重新获取
        let targetNotebookId = defaultNotebookId;
        if (!targetNotebookId) {
            try {
                const nb = await notebookApi.getDefault();
                targetNotebookId = nb.id;
                setDefaultNotebookId(nb.id);
            } catch (error: any) {
                console.error('获取默认单词本失败:', error);
                const status = error.response?.status;
                const message = error.response?.data?.message || error.message;
                setToast({ message: `获取默认单词本失败 (${status}): ${message}`, type: 'error' });
                return;
            }
        }

        setIsLoading(true);
        try {
            if (isCollected) {
                // 取消收藏：移除单词本，后端会自动删除闪卡
                await notebookApi.removeWord(targetNotebookId, wordId);
                setIsCollected(false);
                setToast({ message: '已取消收藏并移除闪卡', type: 'info' });
            } else {
                // 收藏：加入单词本，后端会自动创建闪卡
                await notebookApi.addWord(targetNotebookId, wordId);
                setIsCollected(true);
                setToast({ message: '已收藏并加入闪卡', type: 'success' });
            }
        } catch (error: any) {
            console.error('操作失败:', error);
            // 如果是重复添加错误，也算成功
            if (error.response?.status === 409) {
                setIsCollected(true);
                setToast({ message: '该单词已在收藏中', type: 'info' });
            } else {
                setToast({ message: '操作失败，请稍后重试', type: 'error' });
            }
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

                {/* 收藏按钮（收藏 = 收藏 + 闪卡） */}
                <div className="flex gap-3">
                    <button
                        onClick={handleCollect}
                        disabled={isLoading}
                        className={`px-5 py-3 rounded-xl transition-all shadow-md flex items-center gap-2 font-medium ${isCollected
                            ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white hover:from-yellow-500 hover:to-orange-500'
                            : 'bg-white/60 text-gray-700 hover:bg-white/90'
                            }`}
                        title={isCollected ? "取消收藏（同时移除闪卡）" : "收藏（同时加入闪卡）"}
                    >
                        <StarIcon filled={isCollected} className="w-5 h-5" />
                        <span>{isCollected ? '已收藏' : '收藏'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WordHeader;

