import { useEffect, useState } from 'react';
import { LearningStats } from '../utils/learningStats';

/**
 * 吉祥物对话气泡组件
 * 只负责渲染文字气泡，不渲染吉祥物图片；由父级的 relative 容器控制定位
 */
interface MascotBubbleProps {
    /** 学习统计数据，用于驱动气泡文案选择 */
    stats: LearningStats;
    /** 是否处于 LLM 加载中（查词、生成等） */
    isLLMLoading?: boolean;
}

/**
 * 不同场景的提示文案集合
 */
const MESSAGES = {
    firstVisit: [
        '👋 欢迎回来～今天打算从哪个单词开始下手？',
        '🌤 新的一天，多认识一个单词就不亏哦',
        '📘 我已经帮你把词典擦亮了，随时可以开始查词啦',
    ],
    emptyNotebook: [
        '📂 你的单词本还是空空的，要不先收藏几个常用词？',
        '🧩 查到喜欢的单词，点一下⭐就能收入囊中哦',
        '🎯 小目标：今天先收集 3 个新单词，如何？',
    ],
    hasNotebookAndFlashcards: [
        '📚 你已经收藏了不少单词了，拿几张闪卡翻翻吧',
        '🔁 今天还有 {n} 个单词在等你复习～快去闪卡打个招呼！',
        '🧠 记忆不会自己变牢靠，多翻几张闪卡准没错',
    ],
    afterLookup: [
        '✨ 这个单词搞定了，要不要顺手加入单词本？',
        '✍️ 你可以用刚才那个单词去生成一篇文章试试',
        '🕵️‍♂️ 还有哪个单词总在脑子边上打转？查它吧',
    ],
    llmLoading: [
        '🔍 我正在帮你翻词典和资料，稍等一下下',
        '🧮 这个单词有点东西，我再确认一下细节',
        '🤔 想清楚再告诉你，绝不胡说八道',
    ],
    idleTooLong: [
        '⏸ 先歇一会儿也行，不过别把我一个人留在这儿太久哦',
        '📌 有想不起来的单词，直接敲上面就行，我在呢',
        '🌙 如果今天准备收工，也可以先把待复习清一清',
    ],
    timeMorning: [
        '☀️ 早～早上记的单词比晚上更牢一点',
    ],
    timeEvening: [
        '🌙 晚上适合轻松过一遍单词，把今天学的捋一捋',
    ],
    timeLateNight: [
        '😴 这么晚还在查词？记得睡觉比多背两个单词更重要哦',
    ],
};

/** 安全地从数组中随机返回一条文案（数组为空则返回空字符串） */
function randomFrom(arr: string[]): string {
    if (!arr || arr.length === 0) return '';
    const idx = Math.floor(Math.random() * arr.length);
    return arr[idx];
}

/**
 * 按优先级 + 概率分配挑选提示文案
 * 逻辑说明：
 * 1) LLM 加载优先级最高，每次加载必然返回“加载中”文案
 * 2) 待复习/单词本为空采用概率触发，避免提示过于单一
 * 3) “刚查过词”窗口缩短到 10 分钟，防止 afterLookup 长时间占满
 * 4) 长时间未操作时提示回到学习状态
 * 5) 最后按时间段问候，兜底使用欢迎语
 */
function pickMessage(stats: LearningStats, isLLMLoading: boolean): string {
    const now = Date.now();
    const hour = new Date().getHours();

    const pending = typeof stats.pendingFlashcards === 'number' ? stats.pendingFlashcards : 0;
    const hasFewCollected = !stats.totalCollectedWords || stats.totalCollectedWords < 5;
    const lastQueryAt = stats.lastQueryAt ?? null;
    const msSinceQuery = lastQueryAt ? now - lastQueryAt : null;

    // 1) 模型正在思考：优先显示加载文案（不做随机跳过）
    if (isLLMLoading) {
        return randomFrom(MESSAGES.llmLoading);
    }

    // 2) 有待复习闪卡：50% 概率提示去复习
    if (pending > 0 && Math.random() < 0.5) {
        const base = randomFrom(MESSAGES.hasNotebookAndFlashcards);
        return base.replace('{n}', String(pending));
    }

    // 3) 单词本为空或很少：40% 概率提示去收藏
    if (hasFewCollected && Math.random() < 0.4) {
        return randomFrom(MESSAGES.emptyNotebook);
    }

    // 4) 10 分钟内刚查过词：30% 概率用 afterLookup 文案
    if (msSinceQuery !== null && msSinceQuery < 10 * 60 * 1000 && Math.random() < 0.3) {
        return randomFrom(MESSAGES.afterLookup);
    }

    // 5) 超过 30 分钟未操作（但少于 12 小时）：提醒继续学习
    if (msSinceQuery !== null && msSinceQuery > 30 * 60 * 1000 && msSinceQuery < 12 * 60 * 60 * 1000) {
        return randomFrom(MESSAGES.idleTooLong);
    }

    // 6) 按时间段问候
    if (hour >= 5 && hour < 11) {
        return randomFrom(MESSAGES.timeMorning);
    }
    if (hour >= 18 && hour < 23) {
        return randomFrom(MESSAGES.timeEvening);
    }
    if (hour >= 23 || hour < 5) {
        return randomFrom(MESSAGES.timeLateNight);
    }

    // 7) 兜底欢迎
    return randomFrom(MESSAGES.firstVisit);
}

/**
 * 贴在吉祥物右上方的对话气泡
 * - 仅展示提示文案，不渲染吉祥物图片
 * - 通过 effect 监听关键事件，每次事件触发都会重新弹出
 */
export default function MascotBubble({ stats, isLLMLoading = false }: MascotBubbleProps) {
    // 当前是否展示气泡 & 要展示的文案，默认不显示，等待事件触发
    const [visible, setVisible] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
        // 关键事件触发时（查词加载/结束、收藏数或待复习数量变化），重新选择文案并展示
        const msg = pickMessage(stats, isLLMLoading);
        if (!msg) return;

        setMessage(msg);
        setVisible(true);

        // 停留时间延长到 8 秒，便于用户阅读
        const timer = window.setTimeout(() => setVisible(false), 8000);
        return () => window.clearTimeout(timer);
    }, [
        isLLMLoading,
        stats.lastQueryAt,
        stats.totalCollectedWords,
        stats.pendingFlashcards,
    ]);

    // 手动关闭仅影响当前这一条，不做永久关闭
    if (!visible || !message) {
        return null;
    }

    return (
        <div className="absolute -top-2 left-24 max-w-xs min-w-[220px] animate-fade-in">
            {/* 白色圆角气泡，文字适度放大，保持正常横排与自动换行 */}
            <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg px-3 py-2 border border-white/70 text-base leading-relaxed text-gray-800 whitespace-normal break-words">
                <div className="pr-4">
                    {message}
                </div>
                <button
                    type="button"
                    onClick={() => setVisible(false)}
                    className="absolute right-1 top-1 text-gray-400 hover:text-gray-600 transition-colors text-[10px]"
                    aria-label="关闭提示"
                >
                    ×
                </button>
                <div className="absolute bottom-[-8px] left-8 w-4 h-4 bg-white/90 border-r border-b border-white/70 transform rotate-45" />
            </div>
        </div>
    );
}
