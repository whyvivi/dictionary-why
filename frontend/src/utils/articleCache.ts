import { ArticleDifficulty } from '../types/articleDifficulty';

/**
 * 单篇缓存文章结构
 * - 使用 localStorage 记录，按难度最多各一篇
 */
export interface CachedArticle {
    difficulty: ArticleDifficulty; // 难度标识（区分四张卡片）
    contentEn: string; // 英文正文
    contentZh: string; // 中文翻译
    createdAt: number; // 创建时间戳（毫秒）
    expiresAt: number; // 过期时间戳（毫秒）
}

// localStorage 键名
const STORAGE_KEY = 'WHY_DICTIONARY_GENERATED_ARTICLES';

// 文章缓存有效期：24 小时，如需调整只改此常量
const ARTICLE_TTL_MS = 24 * 60 * 60 * 1000;

// 生成状态 key 与超时时间
const GEN_STATUS_KEY = 'WHY_DICTIONARY_ARTICLE_GEN_STATUS';
const MAX_GENERATING_MS = 120 * 1000; // 120 秒内仍视为进行中

/** 生成状态结构，用于持久化“正在生成哪种难度” */
export interface ArticleGenerationStatus {
    difficulty: ArticleDifficulty;
    startedAt: number;
    status: 'pending' | 'done' | 'error';
}

/**
 * 从 localStorage 中加载未过期的文章缓存
 * - 自动过滤过期记录
 * - 同一难度只保留最新一篇
 */
export function loadCachedArticles(): CachedArticle[] {
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];

        const now = Date.now();
        const parsed: CachedArticle[] = JSON.parse(raw);

        const valid = parsed.filter(item => item.expiresAt > now);

        const byDifficulty = new Map<ArticleDifficulty, CachedArticle>();
        for (const item of valid) {
            const existing = byDifficulty.get(item.difficulty);
            if (!existing || existing.createdAt < item.createdAt) {
                byDifficulty.set(item.difficulty, item);
            }
        }

        return Array.from(byDifficulty.values());
    } catch (e) {
        console.error('加载 AI 生成文章缓存失败:', e);
        return [];
    }
}

/**
 * 写入/覆盖某个难度的文章缓存
 * - 同一 difficulty 总是用最新一篇覆盖
 */
export function saveCachedArticle(article: {
    difficulty: ArticleDifficulty;
    contentEn: string;
    contentZh: string;
}): void {
    try {
        const now = Date.now();
        const existing = loadCachedArticles();

        const updated: CachedArticle[] = [
            ...existing.filter(item => item.difficulty !== article.difficulty),
            {
                difficulty: article.difficulty,
                contentEn: article.contentEn,
                contentZh: article.contentZh,
                createdAt: now,
                expiresAt: now + ARTICLE_TTL_MS,
            },
        ];

        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
        console.error('保存 AI 生成文章缓存失败:', e);
    }
}

/**
 * 删除指定难度的文章缓存（供用户手动清理）
 */
export function removeCachedArticle(difficulty: ArticleDifficulty): void {
    try {
        const existing = loadCachedArticles();
        const updated = existing.filter(item => item.difficulty !== difficulty);
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
        console.error('删除 AI 生成文章缓存失败:', e);
    }
}

/**
 * 标记某个难度开始生成（pending），用于跨页面保留 loading 状态
 */
export function markArticleGenerating(difficulty: ArticleDifficulty): void {
    const status: ArticleGenerationStatus = {
        difficulty,
        startedAt: Date.now(),
        status: 'pending',
    };
    try {
        window.localStorage.setItem(GEN_STATUS_KEY, JSON.stringify(status));
    } catch (e) {
        console.error('保存文章生成状态失败:', e);
    }
}

/**
 * 标记生成结束（成功/失败），结束后不再显示 loading
 */
export function markArticleGenerateFinished(ok: boolean): void {
    try {
        const raw = window.localStorage.getItem(GEN_STATUS_KEY);
        if (!raw) return;
        const status: ArticleGenerationStatus = JSON.parse(raw);
        status.status = ok ? 'done' : 'error';
        window.localStorage.setItem(GEN_STATUS_KEY, JSON.stringify(status));
    } catch (e) {
        console.error('更新文章生成状态失败:', e);
    }
}

/**
 * 读取当前生成状态；若已超时或非 pending 则返回 null
 */
export function loadArticleGenerationStatus(): ArticleGenerationStatus | null {
    try {
        const raw = window.localStorage.getItem(GEN_STATUS_KEY);
        if (!raw) return null;
        const status: ArticleGenerationStatus = JSON.parse(raw);
        const now = Date.now();
        if (status.status !== 'pending') return null;
        if (now - status.startedAt > MAX_GENERATING_MS) return null;
        return status;
    } catch (e) {
        console.error('读取文章生成状态失败:', e);
        return null;
    }
}

/**
 * 清理生成状态（彻底移除）
 */
export function clearArticleGenerationStatus(): void {
    try {
        window.localStorage.removeItem(GEN_STATUS_KEY);
    } catch (e) {
        console.error('清理文章生成状态失败:', e);
    }
}
