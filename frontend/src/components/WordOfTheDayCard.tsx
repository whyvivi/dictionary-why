import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { notebookApi } from '../utils/notebookApi';

/**
 * 今日一词数据结构（来自后端）
 */
interface WordOfTheDayData {
    wordId: number;
    text: string;
    simpleChinese: string;
    exampleSentence: string;
}

/**
 * 今日一词卡片组件
 * - 调用后端 /words/word-of-the-day 获取每日推荐单词
 * - 显示单词、释义、例句
 * - 提供"加入单词本"和"用它生成文章"功能
 */
export default function WordOfTheDayCard() {
    const navigate = useNavigate();

    // 组件状态
    const [wordData, setWordData] = useState<WordOfTheDayData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [addSuccess, setAddSuccess] = useState(false);

    /**
     * 组件挂载时加载今日一词
     */
    useEffect(() => {
        loadWordOfTheDay();
    }, []);

    /**
     * 调用后端接口获取今日一词
     */
    const loadWordOfTheDay = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await api.get<WordOfTheDayData>('/words/word-of-the-day');
            setWordData(response.data);
        } catch (err: any) {
            console.error('获取今日一词失败:', err);
            setError('暂时获取不到今日一词，请稍后再试');
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * 加入单词本
     * 1. 获取默认单词本
     * 2. 添加该单词到单词本
     * 3. 显示成功提示
     */
    const handleAddToNotebook = async () => {
        if (!wordData || wordData.wordId === -1) {
            return; // fallback 单词不允许添加
        }

        try {
            setIsAdding(true);

            // 获取默认单词本
            const notebook = await notebookApi.getDefault();

            // 添加单词到单词本
            await notebookApi.addWord(notebook.id, wordData.wordId);

            // 显示成功提示
            setAddSuccess(true);
            setTimeout(() => setAddSuccess(false), 2000);
        } catch (err: any) {
            console.error('加入单词本失败:', err);

            // 判断是否为重复添加
            if (err.response?.status === 400 || err.message?.includes('已存在')) {
                alert('该单词已在单词本中了~');
            } else {
                alert('加入单词本失败，请稍后重试');
            }
        } finally {
            setIsAdding(false);
        }
    };

    /**
     * 跳转到单词本页面（用于生成文章功能）
     */
    const handleGenerateArticle = () => {
        navigate('/wordbook');
    };

    // 加载中状态
    if (isLoading) {
        return (
            <div className="mt-6 bg-white/60 rounded-2xl p-4 border border-white/70 shadow-inner">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">✨</span>
                    <h3 className="text-sm font-semibold text-gray-800">今日一词</h3>
                </div>
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                </div>
            </div>
        );
    }

    // 错误状态
    if (error) {
        return (
            <div className="mt-6 bg-white/60 rounded-2xl p-4 border border-white/70 shadow-inner">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">✨</span>
                    <h3 className="text-sm font-semibold text-gray-800">今日一词</h3>
                </div>
                <p className="text-sm text-gray-500">{error}</p>
            </div>
        );
    }

    // 正常显示
    if (!wordData) return null;

    return (
        <div className="mt-6 bg-white/60 rounded-2xl p-4 border border-white/70 shadow-inner">
            {/* 标题 */}
            <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">✨</span>
                <h3 className="text-sm font-semibold text-gray-800">今日一词</h3>
            </div>

            {/* 单词 */}
            <div className="mb-3">
                <h4 className="text-2xl font-semibold text-gray-900 mb-1">
                    {wordData.text}
                </h4>
                {/* 简短中文释义 */}
                <p className="text-sm text-gray-700">
                    {wordData.simpleChinese}
                </p>
            </div>

            {/* 例句 */}
            <div className="mb-4">
                <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
                    {wordData.exampleSentence}
                </p>
            </div>

            {/* 成功提示 */}
            {addSuccess && (
                <div className="mb-3 px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm">
                    ✅ 已加入单词本
                </div>
            )}

            {/* 底部按钮 */}
            <div className="flex gap-2 justify-end">
                {wordData.wordId !== -1 && (
                    <button
                        onClick={handleAddToNotebook}
                        disabled={isAdding || addSuccess}
                        className="px-4 py-2 bg-gradient-to-r from-blue-400 to-indigo-400 text-white rounded-full hover:from-blue-500 hover:to-indigo-500 transition-all shadow-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isAdding ? '添加中...' : addSuccess ? '已添加' : '加入单词本'}
                    </button>
                )}
                <button
                    onClick={handleGenerateArticle}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-full hover:bg-white/80 transition-all text-sm font-medium"
                >
                    用它生成文章
                </button>
            </div>
        </div>
    );
}
