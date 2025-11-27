import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { notebookApi, NotebookWord } from '../utils/notebookApi';

// 难度选项配置
const DIFFICULTY_OPTIONS = [
    { value: 'primary', label: '小学生', emoji: '🧒📘' },
    { value: 'highschool', label: '高中生', emoji: '🎓📙' },
    { value: 'cet4', label: 'CET4', emoji: '📘🇬🇧' },
    { value: 'cet6', label: 'CET6', emoji: '📚🔥' },
];

/**
 * 单词本页面 - 显示所有收藏的单词
 * 直接显示默认单词本的内容（收藏列表）
 */
function WordbookPage() {
    const navigate = useNavigate();
    const [words, setWords] = useState<(NotebookWord & { definition?: string })[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [notebookId, setNotebookId] = useState<number | null>(null);

    // 生成文章相关状态
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedArticle, setGeneratedArticle] = useState<{ english: string; chinese: string } | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // 加载默认单词本的单词列表
    const loadWords = async () => {
        setIsLoading(true);
        try {
            // 获取默认单词本
            const notebook = await notebookApi.getDefault();
            setNotebookId(notebook.id);

            // 获取单词详情
            const detail = await notebookApi.getDetail(notebook.id);
            setWords(detail.words);
        } catch (error) {
            console.error('加载收藏单词失败:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadWords();
    }, []);

    // 移除单词（取消收藏）
    const handleRemoveWord = async (wordId: number) => {
        if (!notebookId) return;
        try {
            await notebookApi.removeWord(notebookId, wordId);
            // 刷新列表
            await loadWords();
        } catch (error) {
            console.error('移除单词失败:', error);
        }
    };

    // 点击单词跳转到查词页
    const handleWordClick = (word: string) => {
        navigate(`/search?q=${word}`);
    };

    // 格式化日期
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return '今天';
        if (diffDays === 1) return '昨天';
        if (diffDays < 7) return `${diffDays}天前`;
        return date.toLocaleDateString('zh-CN');
    };

    /**
     * 处理生成文章
     */
    const handleGenerate = async (level: string) => {
        // 关闭难度选择 Modal
        setShowGenerateModal(false);

        // 提取单词列表
        const wordList = words.map(w => w.spelling);

        // 校验单词列表
        if (wordList.length === 0) {
            setErrorMessage('当前单词本没有单词，无法生成文章');
            return;
        }

        // 开始生成
        setIsGenerating(true);
        setErrorMessage(null);
        setGeneratedArticle(null);

        try {
            // 使用统一的 api 实例，会自动添加 JWT token
            const response = await api.post('/articles/generate-from-words', {
                words: wordList,
                level
            });

            setGeneratedArticle(response.data);
        } catch (error: any) {
            const msg = error.response?.data?.message || '生成文章失败，请稍后重试';
            setErrorMessage(msg);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            {/* 页面标题 */}
            <div className="mb-6">
                <h1 className="text-3xl font-semibold text-gray-800 tracking-wider">我的单词本</h1>
                <p className="text-gray-600 mt-2">已收藏 {words.length} 个单词</p>
            </div>

            {/* 生成文章按钮 */}
            {words.length > 0 && (
                <button
                    onClick={() => setShowGenerateModal(true)}
                    className="mb-4 px-6 py-3 bg-gradient-to-r from-purple-400 to-pink-400 text-white rounded-full hover:from-purple-500 hover:to-pink-500 transition-all shadow-md font-medium flex items-center gap-2"
                >
                    <span>📝</span>
                    <span>一键生成文章</span>
                </button>
            )}

            {/* 加载状态 */}
            {isLoading && (
                <div className="bg-white/40 backdrop-blur-sm rounded-3xl shadow-xl p-12 text-center">
                    <div className="animate-spin w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-600">加载中...</p>
                </div>
            )}

            {/* 单词列表 */}
            {!isLoading && words.length > 0 && (
                <div className="space-y-3">
                    {words.map((word) => (
                        <div
                            key={word.wordId}
                            className="bg-white/40 backdrop-blur-sm rounded-2xl p-5 border border-white/50 shadow-md hover:shadow-lg transition-all group"
                        >
                            <div className="flex items-center justify-between">
                                {/* 左侧：单词信息 - 点击可跳转 */}
                                <div
                                    onClick={() => handleWordClick(word.spelling)}
                                    className="flex-1 cursor-pointer"
                                >
                                    <div className="flex items-baseline gap-3 mb-1">
                                        <h3 className="text-xl font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                                            {word.spelling}
                                        </h3>
                                        {word.phoneticUk && (
                                            <span className="text-sm text-gray-500 font-mono">
                                                /{word.phoneticUk}/
                                            </span>
                                        )}
                                    </div>
                                    {word.definition && (
                                        <p className="text-gray-600 text-sm line-clamp-2">
                                            {word.definition}
                                        </p>
                                    )}
                                    <p className="text-gray-400 text-xs mt-1">
                                        收藏于 {formatDate(word.addedAt)}
                                    </p>
                                </div>

                                {/* 右侧：删除按钮 */}
                                <button
                                    onClick={() => handleRemoveWord(word.wordId)}
                                    className="ml-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    title="移除收藏"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* 空状态 */}
            {!isLoading && words.length === 0 && (
                <div className="bg-white/40 backdrop-blur-sm rounded-3xl shadow-xl p-16 text-center">
                    <div className="text-6xl mb-4">📚</div>
                    <h3 className="text-2xl font-semibold text-gray-800 mb-3">你还没有收藏任何单词~</h3>
                    <p className="text-gray-600 mb-6">
                        去查词页面试着收藏一个吧！
                    </p>
                    <button
                        onClick={() => navigate('/search')}
                        className="px-8 py-3 bg-gradient-to-r from-blue-400 to-indigo-400 text-white rounded-full hover:from-blue-500 hover:to-indigo-500 transition-all shadow-md font-medium"
                    >
                        开始查词
                    </button>
                </div>
            )}

            {/* 生成的文章展示区域 */}
            {(isGenerating || generatedArticle || errorMessage) && (
                <section className="mt-6 bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/60">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <span>📄</span>
                        <span>AI 生成的文章</span>
                    </h2>

                    {isGenerating && (
                        <div className="text-center py-8">
                            <div className="animate-spin w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full mx-auto mb-4"></div>
                            <p className="text-gray-600">正在生成文章，请稍候…</p>
                        </div>
                    )}

                    {errorMessage && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                            {errorMessage}
                        </div>
                    )}

                    {generatedArticle && (
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-600 mb-2 flex items-center gap-1">
                                    <span>🇬🇧</span>
                                    <span>英文原文</span>
                                </h3>
                                <p className="whitespace-pre-wrap text-gray-800 text-sm leading-relaxed bg-white/50 rounded-lg p-4">
                                    {generatedArticle.english}
                                </p>
                            </div>

                            <div>
                                <h3 className="text-sm font-semibold text-gray-600 mb-2 flex items-center gap-1">
                                    <span>🇨🇳</span>
                                    <span>中文翻译</span>
                                </h3>
                                <p className="whitespace-pre-wrap text-gray-800 text-sm leading-relaxed bg-white/50 rounded-lg p-4">
                                    {generatedArticle.chinese}
                                </p>
                            </div>
                        </div>
                    )}
                </section>
            )}

            {/* 难度选择 Modal */}
            {showGenerateModal && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                    <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-md w-full mx-4">
                        <h2 className="text-2xl font-semibold mb-6 text-center">选择生成文章的难度</h2>

                        <div className="grid grid-cols-2 gap-4">
                            {DIFFICULTY_OPTIONS.map(option => (
                                <button
                                    key={option.value}
                                    onClick={() => handleGenerate(option.value)}
                                    className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl hover:from-blue-100 hover:to-purple-100 transition-all border-2 border-transparent hover:border-purple-300 text-center"
                                >
                                    <div className="text-3xl mb-2">{option.emoji}</div>
                                    <div className="font-semibold text-gray-800">{option.label}</div>
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => setShowGenerateModal(false)}
                            className="mt-6 w-full py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            取消
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default WordbookPage;
