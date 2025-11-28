import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import { WordHeader } from '../components/WordHeader';
import DefinitionCard from '../components/DefinitionCard';
import ExampleCard from '../components/ExampleCard';
import MemoryImageCard from '../components/MemoryImageCard';
import MascotBubble from '../components/MascotBubble';
import SummaryBar from '../components/SummaryBar';
import { DailyQuoteCard } from '../components/DailyQuoteCard';
import { fetchWordDetail } from '../utils/wordApi';
import {
    WordPageState,
    loadWordPageState,
    saveWordPageState,
    clearWordPageState,
} from '../utils/wordPageStateStorage';
import { loadLearningStats, saveLearningStats } from '../utils/learningStats';
import mascot from '../assets/image3.png';

/**
 * 初始空白状态
 * 当用户第一次进入或状态过期时使用
 */
const INITIAL_STATE: WordPageState = {
    wordInput: '',
    currentWord: null,
    status: 'idle',
    result: null,
    errorMessage: null,
    lastVisitedAt: null,
};

/**
 * 查词页面
 * 
 * 功能特性：
 * 1. 提供单词查询功能，展示单词详情、释义、例句等
 * 2. 状态记忆：5 分钟内切换页面后返回，仍显示上次的查询结果
 * 3. 超过 5 分钟后自动恢复为初始空白状态
 * 4. "回到首页"按钮：手动清空状态和缓存
 * 5. 吉祥物对话气泡：根据学习状态显示提示
 * 6. 今日学习概览：显示收藏、待复习统计
 * 7. 每日一语：每日展示治愈短句
 */
function SearchPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    // 使用统一的状态结构
    // 初始化时尝试从 sessionStorage 恢复上次的状态
    const [state, setState] = useState<WordPageState>(() => {
        const saved = loadWordPageState();
        if (saved) {
            return saved;
        }
        return INITIAL_STATE;
    });

    // 标记是否是组件首次挂载
    const isInitialMount = useRef(true);

    /**
     * 组件 mount 时的处理
     * 如果恢复的状态是 loading，重新发起请求
     */
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;

            // 如果恢复的状态是 loading，重新发起请求以确保能获取结果
            if (state.status === 'loading' && state.currentWord) {
                handleSearch(state.currentWord);
            }
        }
    }, []);

    /**
     * 每次状态更新后，自动保存到 sessionStorage
     * （除了首次 mount 时）
     */
    useEffect(() => {
        if (!isInitialMount.current) {
            saveWordPageState(state);
        }
    }, [state]);

    /**
     * 组件 unmount 时保存当前状态
     */
    useEffect(() => {
        return () => {
            saveWordPageState(state);
        };
    }, [state]);

    /**
     * 处理查词请求
     * 
     * @param query 要查询的单词
     */
    const handleSearch = async (query: string) => {
        // 更新状态为 loading
        setState(prev => ({
            ...prev,
            currentWord: query,
            status: 'loading',
            errorMessage: null,
            wordInput: query,
            result: null,
        }));

        // 更新 URL 参数
        setSearchParams({ q: query });

        try {
            // 调用后端查词 API
            const result = await fetchWordDetail(query);

            // 成功：更新状态
            setState(prev => ({
                ...prev,
                status: 'success',
                result,
                errorMessage: null,
            }));

            // 【新增】更新学习统计：记录查询的单词和时间
            // 为吉祥物气泡提供数据支持
            saveLearningStats({
                lastQueryWord: query,
                lastQueryAt: Date.now(),
            });
        } catch (err: any) {
            console.error('查词失败:', err);

            // 错误处理：生成友好的错误提示
            let errorMessage = '查询失败，请稍后重试';

            if (err.response?.status === 404 || err.message?.includes('未找到')) {
                errorMessage = `未找到单词 "${query}"，请检查拼写是否正确`;
            } else if (err.response?.status === 401) {
                errorMessage = '登录已过期，请重新登录';
            } else if (err.response?.data?.message) {
                errorMessage = `查询失败: ${err.response.data.message}`;
            } else if (err.message) {
                errorMessage = `查询失败: ${err.message}`;
            }

            // 失败：更新状态
            setState(prev => ({
                ...prev,
                status: 'error',
                result: null,
                errorMessage,
            }));
        }
    };

    /**
     * 回到首页：立即清空状态和缓存
     * 用户无需等待 5 分钟超时即可回到初始空白页
     */
    const handleBackToHome = () => {
        // 重置为初始状态
        setState(INITIAL_STATE);
        // 清空 sessionStorage 缓存
        clearWordPageState();
    };

    /**
     * 监听 URL 参数变化
     * 当 URL 中的 ?q= 参数变化时，自动触发查询
     */
    useEffect(() => {
        const query = searchParams.get('q');
        // 只有当 URL 中的查询词与当前状态不同时才触发查询
        // 避免重复查询
        if (query && query !== state.currentWord) {
            handleSearch(query);
        }
    }, [searchParams]);

    // 加载学习统计（用于吉祥物气泡和学习概览）
    const stats = loadLearningStats();
    // 查词请求是否处于 LLM 加载中，用于驱动吉祥物气泡的“加载中”提示
    const isLLMLoading = state.status === 'loading';

    // 导航函数：跳转到单词本
    const goNotebook = () => navigate('/wordbook');
    // 导航函数：跳转到闪卡复习
    const goFlashcards = () => navigate('/flashcards/review');

    return (
        <div className="max-w-4xl mx-auto">
            {/* 顶部工具栏 */}
            <div className="mb-4 flex items-center justify-between">
                {/* 回到首页按钮（仅在有查询结果时显示） */}
                {state.currentWord && (
                    <button
                        onClick={handleBackToHome}
                        className="text-xs px-3 py-1 rounded-full bg-white/60 hover:bg-white/80 text-gray-700 shadow-sm border border-white/70 transition-all"
                    >
                        🏠 回到首页
                    </button>
                )}
            </div>

            {/* 搜索栏（固定在顶部） */}
            <div className="mb-8">
                <SearchBar
                    onSearch={handleSearch}
                    isLoading={state.status === 'loading'}
                />
            </div>

            {/* 加载状态 */}
            {state.status === 'loading' && (
                <div className="glass-strong rounded-3xl shadow-glass p-12 text-center">
                    <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-600 text-lg">
                        正在查询 {state.currentWord}...
                    </p>
                    <p className="text-gray-400 text-sm mt-2">
                        首次查询需要 AI 生成完整释义，可能需要 10-20 秒，请耐心等待
                    </p>
                </div>
            )}

            {/* 错误状态 */}
            {state.status === 'error' && (
                <div className="glass-strong rounded-3xl shadow-glass p-12 text-center">
                    <div className="text-6xl mb-4">😕</div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">查询失败</h3>
                    <p className="text-gray-600">{state.errorMessage}</p>
                    <p className="text-gray-500 text-sm mt-4">
                        提示：请输入正确的英文单词拼写
                    </p>
                </div>
            )}

            {/* 查询结果 */}
            {state.status === 'success' && state.result && (
                <div className="space-y-6 animate-fade-in-up">
                    {/* 单词头部信息 */}
                    <WordHeader
                        word={state.result.word}
                        phoneticUk={state.result.phonetic.uk || undefined}
                        phoneticUs={state.result.phonetic.us || undefined}
                        audioUk={state.result.phonetic.ukAudio || undefined}
                        audioUs={state.result.phonetic.usAudio || undefined}
                        wordId={state.result.id}
                    />

                    {/* 释义卡片 */}
                    <DefinitionCard senses={state.result.senses} />

                    {/* 例句卡片 */}
                    <ExampleCard senses={state.result.senses} />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* 记忆联想图（占位） */}
                        <MemoryImageCard word={state.result.word} />
                    </div>
                </div>
            )}

            {/* 今日学习概览（仅在初始状态显示） */}
            {state.status === 'idle' && !state.currentWord && (
                <SummaryBar
                    stats={stats}
                    onGoNotebook={goNotebook}
                    onGoFlashcards={goFlashcards}
                />
            )}

            {/* 初始状态（未查询） */}
            {state.status === 'idle' && !state.currentWord && (
                <div className="glass-strong rounded-3xl shadow-glass p-12 text-center min-h-[60vh] flex flex-col items-center justify-center">
                    <div className="text-6xl mb-6">🔍</div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">开始查词</h2>
                    <p className="text-gray-600 text-lg mb-2">
                        在上方输入英文单词，即可查看详细释义
                    </p>
                    <p className="text-gray-500 text-sm">
                        支持查看音标、发音、释义、例句等信息
                    </p>

                    {/* 示例单词建议 */}
                    <div className="mt-8">
                        <p className="text-gray-500 text-sm mb-3">试试这些单词：</p>
                        <div className="flex gap-3 flex-wrap justify-center">
                            {['hello', 'world', 'apple', 'computer', 'beautiful'].map(word => (
                                <button
                                    key={word}
                                    onClick={() => handleSearch(word)}
                                    className="px-4 py-2 bg-white bg-opacity-60 hover:bg-opacity-100 rounded-full text-gray-700 transition-all"
                                >
                                    {word}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 每日一语模块：展示温柔治愈的双语短句 */}
                    <DailyQuoteCard />
                </div>
            )}

            {/* 左下角吉祥物和对话气泡（全局唯一挂载点，使用较高 bottom 避免被底部导航遮挡） */}
            <div className="fixed left-4 bottom-28 z-40">
                {/* 以 relative 作为气泡定位参照 */}
                <div className="relative">
                    {/* 仅保留这一张吉祥物图片，其他位置全部移除 */}
                    <img
                        src={mascot}
                        alt="吉祥物"
                        className="w-24 h-24 drop-shadow-lg object-contain"
                    />

                    {/* 对话气泡贴在图片右上方：查词加载/完成、收藏或待复习数量变化都会触发提示 */}
                    <MascotBubble
                        stats={stats}
                        isLLMLoading={isLLMLoading}
                    />
                </div>
            </div>
        </div>
    );
}

export default SearchPage;
