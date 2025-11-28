/**
 * 文章生成难度类型定义
 * 仅用于前端标记四种难度及对应的展示文案/emoji
 */
export type ArticleDifficulty = 'primary' | 'highschool' | 'cet4' | 'cet6';

/** 难度对应的标题文案和图标，供文章卡片及提示使用 */
export const ARTICLE_DIFFICULTY_LABELS: Record<ArticleDifficulty, { icon: string; label: string }> = {
    primary: {
        icon: '🧸',
        label: '小学生难度',
    },
    highschool: {
        icon: '👦',
        label: '高中生难度',
    },
    cet4: {
        icon: '📚',
        label: 'CET-4',
    },
    cet6: {
        icon: '🎓',
        label: 'CET-6',
    },
};
