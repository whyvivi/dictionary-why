import { getTodayQuote } from '../utils/dailyQuote';

/**
 * 每日一语卡片
 * - 展示当天固定的英文 + 中文句子（含 emoji）
 * - 文案选取逻辑由 getTodayQuote 负责，保证同一天不变、7 天内尽量不重复
 */
export function DailyQuoteCard() {
    // 渲染时获取今日文案（内部已处理 localStorage 持久化）
    const quote = getTodayQuote();

    return (
        <div
            className="
                mt-6
                max-w-md
                mx-auto
                bg-white/80
                backdrop-blur-md
                rounded-3xl
                px-6
                py-5
                shadow-lg
                border border-white/60
            "
        >
            {/* 标题：固定为「每日一语」，带前缀 emoji，字号略小 */}
            <div className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <span>✨</span>
                <span>每日一语</span>
            </div>

            {/* 英文句子：加粗、稍大字号，颜色偏深 */}
            <p className="text-lg font-semibold text-gray-800 mb-2 leading-relaxed">
                {quote.en}
            </p>

            {/* 中文释义：字号略小、颜色更柔和 */}
            <p className="text-sm text-gray-500 leading-relaxed">
                {quote.zh}
            </p>
        </div>
    );
}
