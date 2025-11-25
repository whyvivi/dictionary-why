import React from 'react';
import { NotebookDetail as NotebookDetailType } from '../utils/notebookApi';

interface NotebookDetailProps {
    detail: NotebookDetailType;
    onRemoveWord: (wordId: number) => void;
    onGenerateArticle: () => void;
    isGenerating: boolean;
}

export const NotebookDetail: React.FC<NotebookDetailProps> = ({ detail, onRemoveWord, onGenerateArticle, isGenerating }) => {
    return (
        <div className="h-full flex flex-col">
            {/* 头部信息 */}
            <div className="mb-6">
                <div className="flex justify-between items-start mb-2">
                    <h2 className="text-2xl font-bold text-gray-800">{detail.name}</h2>
                    <button
                        onClick={onGenerateArticle}
                        disabled={isGenerating || detail.words.length === 0}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${isGenerating || detail.words.length === 0
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md hover:shadow-lg hover:scale-105'
                            }`}
                    >
                        {isGenerating ? '生成中...' : '✨ 生成文章'}
                    </button>
                </div>
                {detail.description && <p className="text-gray-600">{detail.description}</p>}
                <div className="text-xs text-gray-400 mt-2">
                    创建于 {new Date(detail.createdAt).toLocaleDateString()} · 共 {detail.words.length} 个单词
                </div>
            </div>

            {/* 单词列表 */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                {detail.words.length === 0 ? (
                    <div className="text-center py-10 text-gray-400 bg-white/20 rounded-xl border border-white/30 border-dashed">
                        <p>单词本还是空的</p>
                        <p className="text-sm mt-1">快去查词页添加单词吧</p>
                    </div>
                ) : (
                    detail.words.map((word) => (
                        <div
                            key={word.wordId}
                            className="group flex items-center justify-between p-3 bg-white/40 rounded-lg border border-white/30 hover:bg-white/60 transition-colors"
                        >
                            <div className="flex items-baseline gap-3">
                                <span className="font-bold text-lg text-gray-800">{word.spelling}</span>
                                <span className="text-sm text-gray-500 font-mono">
                                    {word.phoneticUk ? `/${word.phoneticUk}/` : word.phoneticUs ? `/${word.phoneticUs}/` : ''}
                                </span>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (window.confirm(`确定要从单词本中移除 "${word.spelling}" 吗？`)) {
                                        onRemoveWord(word.wordId);
                                    }
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"
                                title="移除单词"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
