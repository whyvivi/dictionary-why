import React, { useState } from 'react';
import { notebookApi } from '../utils/notebookApi';

interface WordHeaderProps {
    word: string;
    phoneticUk?: string;
    phoneticUs?: string;
    audioUk?: string;
    audioUs?: string;
    wordId?: number; // 新增 wordId 属性
}

export const WordHeader: React.FC<WordHeaderProps> = ({ word, phoneticUk, phoneticUs, audioUk, audioUs, wordId }) => {
    const [isPlaying, setIsPlaying] = useState<'uk' | 'us' | null>(null);
    const [isCollecting, setIsCollecting] = useState(false);

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
        if (!wordId) {
            alert('无法收藏：缺少单词 ID');
            return;
        }

        setIsCollecting(true);
        try {
            // 1. 获取默认单词本
            const defaultNotebook = await notebookApi.getDefault();
            // 2. 添加单词
            await notebookApi.addWord(defaultNotebook.id, wordId);
            alert('已加入默认单词本');
        } catch (error: any) {
            console.error('收藏失败:', error);
            if (error.response?.status === 409) {
                alert('该单词已在默认单词本中');
            } else {
                alert('收藏失败，请重试');
            }
        } finally {
            setIsCollecting(false);
        }
    };

    return (
        <div className="bg-white/40 backdrop-blur-md rounded-2xl p-6 border border-white/50 shadow-lg mb-6 animate-fade-in-down">
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
                <button
                    onClick={handleCollect}
                    disabled={isCollecting}
                    className="p-2 bg-white/50 hover:bg-white/80 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-sm group"
                    title="收藏到单词本"
                >
                    <svg className={`w-6 h-6 ${isCollecting ? 'text-gray-400' : 'text-yellow-500 group-hover:text-yellow-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default WordHeader;
