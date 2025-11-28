import { LearningStats } from '../utils/learningStats';

/**
 * 今日学习概览组件
 * 展示收藏、待复习两项统计，并提供跳转功能
 */
interface SummaryBarProps {
    /** 学习统计数据 */
    stats: LearningStats;
    /** 点击"已收藏"跳转到单词本 */
    onGoNotebook?: () => void;
    /** 点击"今日待复习"跳转到闪卡复习页面 */
    onGoFlashcards?: () => void;
}

/**
 * 学习概览条组件
 * - 半透明胶囊设计，居中显示
 * - 三个统计指标横向排列
 * - 每项可点击跳转
 */
export default function SummaryBar({
    stats,
    onGoNotebook,
    onGoFlashcards,
}: SummaryBarProps) {
    // 提取统计数据，未定义时默认为 0
    const collectedWords = stats.totalCollectedWords ?? 0;
    const pendingFlashcards = stats.pendingFlashcards ?? 0;

    return (
        <div className="w-full max-w-3xl mx-auto mb-4 px-4 py-2 rounded-full bg-white/50 backdrop-blur-sm border border-white/70 shadow-sm flex items-center justify-center gap-4 text-xs text-gray-700">
            {/* 已收藏 */}
            <button
                onClick={onGoNotebook}
                className="flex items-center gap-1 px-2 py-1 rounded-full hover:bg-white/60 transition-colors cursor-pointer"
                type="button"
            >
                <span>📚</span>
                <span className="whitespace-nowrap">
                    已收藏：<span className="font-semibold">{collectedWords}</span>
                </span>
            </button>

            {/* 分隔线 */}
            <div className="w-px h-4 bg-gray-300"></div>

            {/* 今日待复习 */}
            <button
                onClick={onGoFlashcards}
                className="flex items-center gap-1 px-2 py-1 rounded-full hover:bg-white/60 transition-colors cursor-pointer"
                type="button"
            >
                <span>🔁</span>
                <span className="whitespace-nowrap">
                    今日待复习：<span className="font-semibold">{pendingFlashcards}</span>
                </span>
            </button>

            {/* 仅展示两项，无需第三项 */}
        </div>
    );
}
