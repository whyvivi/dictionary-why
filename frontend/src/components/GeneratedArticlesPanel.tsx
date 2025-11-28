import { useEffect, useState } from 'react';
import { loadCachedArticles, removeCachedArticle, CachedArticle } from '../utils/articleCache';
import { ARTICLE_DIFFICULTY_LABELS, ArticleDifficulty } from '../types/articleDifficulty';

interface GeneratedArticlesPanelProps {
    /** 是否存在生成中的请求，用于展示顶栏提示 */
    isGenerating?: boolean;
    /** 当前生成的难度（可选） */
    generatingDifficulty?: ArticleDifficulty | null;
    /** 外部传入的最新缓存文章列表（可选，方便父组件同步状态） */
    externalArticles?: CachedArticle[];
    /** 当内部文章列表变化时回调父组件，便于同步状态 */
    onArticlesChange?: (articles: CachedArticle[]) => void;
}

/**
 * Notebook 右侧：AI 生成文章面板
 * - 展示本地缓存的 0~4 篇文章
 * - 支持手动删除指定难度的文章
 */
export function GeneratedArticlesPanel({
    isGenerating,
    generatingDifficulty,
    externalArticles,
    onArticlesChange,
}: GeneratedArticlesPanelProps) {
    // 内部维护的文章列表；如果父组件传 externalArticles 则优先使用父状态
    const [articles, setArticles] = useState<CachedArticle[]>([]);

    // 首次挂载时读取缓存
    useEffect(() => {
        if (!externalArticles) {
            const cached = loadCachedArticles();
            setArticles(cached);
            onArticlesChange?.(cached);
        }
    }, [externalArticles, onArticlesChange]);

    // 当父组件传入最新列表时同步到内部显示
    useEffect(() => {
        if (externalArticles) {
            setArticles(externalArticles);
        }
    }, [externalArticles]);

    const handleDelete = (difficulty: ArticleDifficulty) => {
        removeCachedArticle(difficulty);
        setArticles(prev => {
            const next = prev.filter(item => item.difficulty !== difficulty);
            onArticlesChange?.(next);
            return next;
        });
    };

    return (
        <div className="bg-white/70 backdrop-blur-md rounded-3xl p-4 shadow-lg border border-white/60 min-h-[200px]">
            <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <span>📝</span>
                    <span>AI 生成的文章</span>
                </div>
                {isGenerating && generatingDifficulty && (
                    <div className="text-xs text-purple-500 whitespace-nowrap">
                        正在生成 {ARTICLE_DIFFICULTY_LABELS[generatingDifficulty].label}...
                    </div>
                )}
            </div>

            {articles.length === 0 && !isGenerating && (
                <p className="text-sm text-gray-400">
                    暂无缓存文章，先在左侧选择难度点击“一键生成文章”试试吧。
                </p>
            )}

            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                {articles.map(article => {
                    const meta = ARTICLE_DIFFICULTY_LABELS[article.difficulty];
                    return (
                        <article
                            key={article.difficulty}
                            className="bg-white/90 rounded-2xl p-3 shadow-sm border border-white/70"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="text-xs font-semibold text-gray-600 flex items-center gap-1">
                                    <span>{meta.icon}</span>
                                    <span>{meta.label}</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleDelete(article.difficulty)}
                                    className="text-xs text-gray-400 hover:text-red-400 transition-colors"
                                >
                                    删除
                                </button>
                            </div>
                            <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap mb-2">
                                {article.contentEn}
                            </div>
                            <div className="text-xs text-gray-500 leading-relaxed whitespace-pre-wrap">
                                {article.contentZh}
                            </div>
                        </article>
                    );
                })}

                {isGenerating && (
                    <div className="flex items-center justify-center py-6 text-sm text-purple-500">
                        <span className="inline-block w-4 h-4 mr-2 rounded-full border-2 border-purple-400 border-t-transparent animate-spin" />
                        正在生成文章，请稍候...
                    </div>
                )}
            </div>
        </div>
    );
}

export default GeneratedArticlesPanel;
