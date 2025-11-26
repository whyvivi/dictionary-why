import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import { WordHeader } from '../components/WordHeader';
import DefinitionCard from '../components/DefinitionCard';
import ExampleCard from '../components/ExampleCard';
import MemoryImageCard from '../components/MemoryImageCard';
import { fetchWordDetail, WordDetail } from '../utils/wordApi';

/**
 * 查词页面
 * 提供单词查询功能,展示单词详情、释义、例句等
 */
function SearchPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [wordDetail, setWordDetail] = useState<WordDetail | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 监听 URL 参数变化
    useEffect(() => {
        const query = searchParams.get('q');
        if (query) {
            handleSearch(query);
        }
    }, [searchParams]);

    // 处理查词请求
    const handleSearch = async (query: string) => {
        setIsLoading(true);
        setError(null);
        setWordDetail(null);

        // 更新 URL
        setSearchParams({ q: query });

        try {
            const result = await fetchWordDetail(query);
            setWordDetail(result);
        } catch (err: any) {
            console.error('查词失败:', err);

            // 友好的错误提示
            if (err.response?.status === 404 || err.message?.includes('未找到')) {
                setError(`未找到单词 "${query}",请检查拼写是否正确`);
            } else if (err.response?.status === 401) {
                setError('登录已过期,请重新登录');
            } else {
                setError('查询失败,请稍后重试');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            {/* 搜索栏(固定在顶部) */}
            <div className="mb-8">
                <SearchBar onSearch={handleSearch} isLoading={isLoading} />
            </div>

            {/* 加载状态 */}
            {isLoading && (
                <div className="glass-strong rounded-3xl shadow-glass p-12 text-center">
                    <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-600 text-lg">正在查询中...</p>
                </div>
            )}

            {/* 错误状态 */}
            {error && !isLoading && (
                <div className="glass-strong rounded-3xl shadow-glass p-12 text-center">
                    <div className="text-6xl mb-4">😕</div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">查询失败</h3>
                    <p className="text-gray-600">{error}</p>
                    <p className="text-gray-500 text-sm mt-4">
                        提示:请输入正确的英文单词拼写
                    </p>
                </div>
            )}

            {/* 查询结果 */}
            {wordDetail && !isLoading && !error && (
                <div className="space-y-6 animate-fade-in-up">
                    {/* 单词头部信息 */}
                    <WordHeader
                        word={wordDetail.spelling}
                        phoneticUk={wordDetail.phoneticUk}
                        phoneticUs={wordDetail.phoneticUs}
                        audioUk={wordDetail.audioUkUrl}
                        audioUs={wordDetail.audioUsUrl}
                        wordId={wordDetail.id}
                    />

                    {/* 释义卡片 */}
                    <DefinitionCard senses={wordDetail.senses} />

                    {/* 例句卡片 */}
                    <ExampleCard senses={wordDetail.senses} />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* 记忆联想图(占位) */}
                        <MemoryImageCard word={wordDetail.spelling} />
                    </div>
                </div>
            )}

            {/* 初始状态(未查询) */}
            {!wordDetail && !isLoading && !error && (
                <div className="glass-strong rounded-3xl shadow-glass p-12 text-center min-h-[60vh] flex flex-col items-center justify-center">
                    <div className="text-6xl mb-6">🔍</div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">开始查词</h2>
                    <p className="text-gray-600 text-lg mb-2">
                        在上方输入英文单词,即可查看详细释义
                    </p>
                    <p className="text-gray-500 text-sm">
                        支持查看音标、发音、释义、例句等信息
                    </p>

                    {/* 示例单词建议 */}
                    <div className="mt-8">
                        <p className="text-gray-500 text-sm mb-3">试试这些单词:</p>
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
                </div>
            )}
        </div>
    );
}

export default SearchPage;
