/**
 * 每日一语文案定义与选取逻辑
 * - 固定 7 条温柔治愈型文案
 * - 通过 localStorage 记录当日选择以及最近 7 天使用过的句子，尽量避免连续重复
 */

export interface DailyQuote {
    /** 唯一编号，用于持久化与去重 */
    id: number;
    /** 英文句子（含 emoji） */
    en: string;
    /** 中文释义（含 emoji） */
    zh: string;
}

/** 固定的 7 条每日一语文案（内容严禁改动） */
export const DAILY_QUOTES: DailyQuote[] = [
    {
        id: 1,
        en: "🌱 It's okay to walk slowly; you're still moving toward the light.",
        zh: '🌱 走得慢一点也没关系，你依然在朝着光走。',
    },
    {
        id: 2,
        en: "☁️ On heavy days, you don't have to soar—just staying afloat is brave enough.",
        zh: '☁️ 状态很沉的时候，不必飞得多高，只是不沉下去就已经很勇敢了。',
    },
    {
        id: 3,
        en: '📖 Learning one small thing today is already a gentle gift to your future self.',
        zh: '📖 今天多学一点点，都是在温柔地照顾未来的自己。',
    },
    {
        id: 4,
        en: '🌸 You are allowed to rest; flowers also need quiet time before they bloom.',
        zh: '🌸 你可以停下来休息，花开放之前也要先安静一阵子。',
    },
    {
        id: 5,
        en: '✨ Even on an ordinary day, choosing to keep going is a tiny kind of miracle.',
        zh: '✨ 在很普通的一天里，还愿意继续向前，本身就是一种小小的奇迹。',
    },
    {
        id: 6,
        en: "🌙 If today felt messy, it's okay—tomorrow is still ready to give you a brand-new start.",
        zh: '🌙 今天过得乱一点也没关系，明天还是会愿意给你一个新的开始。',
    },
    {
        id: 7,
        en: "🕊️ You don't have to be perfect to be worthy of patience and gentleness.",
        zh: '🕊️ 不必变得完美，你现在就已经值得被温柔和耐心对待。',
    },
];

/** localStorage 键名 */
const STORAGE_KEY = 'WHY_DAILY_QUOTE_STATE';

/** 本地存储结构 */
interface DailyQuoteState {
    /** 最近一次选择的日期（YYYY-MM-DD） */
    date: string;
    /** 当日选择的句子 ID */
    quoteId: number;
    /** 最近 7 天使用过的句子 ID（新→旧） */
    recentIds: number[];
}

/** 获取今天的日期字符串，格式 YYYY-MM-DD */
function getToday(): string {
    return new Date().toISOString().slice(0, 10);
}

/** 尝试从 localStorage 读取状态，解析失败则返回 null */
function loadState(): DailyQuoteState | null {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        return JSON.parse(raw) as DailyQuoteState;
    } catch (err) {
        console.warn('读取每日一语状态失败，已忽略:', err);
        return null;
    }
}

/** 将最新状态写回 localStorage，出现异常时静默失败 */
function saveState(state: DailyQuoteState): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
        console.warn('保存每日一语状态失败，已忽略:', err);
    }
}

/**
 * 根据当前日期和历史状态选择今日的句子
 * - 尽量避免 recentIds（最近 7 天用过的句子）
 * - 如果排除 recentIds 后没有可选项，则在全部文案中随机
 */
function selectQuoteForToday(prevState: DailyQuoteState | null, today: string): { quoteId: number; updatedState: DailyQuoteState } {
    const recentIds = prevState?.recentIds ?? [];

    // 优先从“未出现在最近 7 天”的池子里随机
    const available = DAILY_QUOTES.filter(q => !recentIds.includes(q.id));
    const pool = available.length > 0 ? available : DAILY_QUOTES;
    const picked = pool[Math.floor(Math.random() * pool.length)];

    // 维护最多 7 条最近使用记录，去重后截断
    const newRecent = [picked.id, ...recentIds.filter(id => id !== picked.id)].slice(0, 7);

    return {
        quoteId: picked.id,
        updatedState: {
            date: today,
            quoteId: picked.id,
            recentIds: newRecent,
        },
    };
}

/**
 * 获取今天应该展示的每日一语
 * - 同一天内多次刷新保持一致
 * - 跨天时重新选择，并尽量避开最近 7 天用过的句子
 */
export function getTodayQuote(): DailyQuote {
    const today = getToday();
    const state = loadState();

    // 如果已存在当日选择，直接返回对应句子
    if (state?.date === today) {
        const current = DAILY_QUOTES.find(q => q.id === state.quoteId);
        if (current) {
            return current;
        }
        // 如果找不到（极端情况下 ID 异常），重新选择
    }

    // 跨天或无状态时重新选择，并写回存储
    const { quoteId, updatedState } = selectQuoteForToday(state, today);
    saveState(updatedState);

    // 根据选中的 ID 返回具体句子（理论上必定存在）
    const quote = DAILY_QUOTES.find(q => q.id === quoteId) ?? DAILY_QUOTES[0];
    return quote;
}
