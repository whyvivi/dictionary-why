/**
 * 学习统计工具
 * 使用 localStorage 保存用户的学习进度信息，为吉祥物气泡和学习概览提供数据
 */

// localStorage 键名
const STORAGE_KEY = 'dictionary_learning_stats';

/**
 * 学习统计数据结构
 */
export interface LearningStats {
    /** 最近一次已知的收藏单词总数 */
    totalCollectedWords?: number;

    /** 最近一次已知的待复习闪卡数量 */
    pendingFlashcards?: number;

    /** 最近一次查询的单词 */
    lastQueryWord?: string | null;

    /** 最近一次查询时间戳（毫秒） */
    lastQueryAt?: number | null;

    /** 当天生成文章次数（每日凌晨自动清零） */
    generatedArticlesToday?: number;

    /** 生成文章计数对应的日期（YYYY-MM-DD） */
    generatedArticlesDate?: string | null;
}

/** 获取当天的日期字符串（YYYY-MM-DD） */
function getTodayDateString(): string {
    return new Date().toISOString().slice(0, 10);
}

/**
 * 从 localStorage 加载学习统计
 * - 若跨天则重置“今日生成文章次数”，避免旧数据干扰提示逻辑
 */
export function loadLearningStats(): LearningStats {
    try {
        const savedData = localStorage.getItem(STORAGE_KEY);
        const today = getTodayDateString();

        if (!savedData) {
            return {};
        }

        const parsed: LearningStats = JSON.parse(savedData);

        // 跨天时重置生成文章次数，以便当天重新计数
        if (parsed.generatedArticlesDate && parsed.generatedArticlesDate !== today) {
            return {
                ...parsed,
                generatedArticlesToday: 0,
                generatedArticlesDate: today,
            };
        }

        return parsed;
    } catch (error) {
        console.error('加载学习统计失败:', error);
        return {};
    }
}

/**
 * 保存学习统计（部分更新）
 * - 查词成功：更新 lastQueryWord、lastQueryAt
 * - 单词本页面：更新 totalCollectedWords
 * - 闪卡页面：更新 pendingFlashcards
 * - 生成文章：累加 generatedArticlesToday
 */
export function saveLearningStats(partial: Partial<LearningStats>): void {
    try {
        // 读取当前统计，并应用跨天重置规则
        const current = loadLearningStats();

        // 合并更新
        const updated = { ...current, ...partial };

        // 写回 localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
        console.error('保存学习统计失败:', error);
    }
}

/**
 * 清除学习统计
 */
export function clearLearningStats(): void {
    localStorage.removeItem(STORAGE_KEY);
}
