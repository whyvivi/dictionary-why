import { useState, FormEvent } from 'react';

interface SearchBarProps {
    onSearch: (query: string) => void;
    isLoading?: boolean;
}

/**
 * 搜索栏组件
 * 玻璃拟态风格的搜索输入框
 */
function SearchBar({ onSearch, isLoading = false }: SearchBarProps) {
    const [query, setQuery] = useState('');

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        // 验证输入不为空
        if (query.trim().length === 0) {
            alert('请输入要查询的英文单词');
            return;
        }

        onSearch(query.trim());
    };

    return (
        <form onSubmit={handleSubmit} className="w-full">
            <div className="glass-strong rounded-full shadow-glass p-2 flex items-center gap-2">
                {/* 搜索图标 */}
                <div className="pl-4 text-gray-500">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>

                {/* 输入框 */}
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="输入英文单词进行查询……"
                    className="flex-1 bg-transparent outline-none text-gray-800 placeholder-gray-400 text-lg px-2"
                    disabled={isLoading}
                />

                {/* 查词按钮 */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-3 rounded-full font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? '查询中...' : '查词'}
                </button>
            </div>
        </form>
    );
}

export default SearchBar;
