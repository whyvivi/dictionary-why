/**
 * 查词页面状态存储工具
 * 使用 sessionStorage 实现 5 分钟内的状态记忆
 * 
 * 功能：
 * - 用户切换页面后，5 分钟内返回时可以看到上次的查询状态
 * - 超过 5 分钟后自动清除，回到初始状态
 * - 使用 sessionStorage（关闭标签页自动清空）
 */

import { WordDetail } from './wordApi';

// sessionStorage 的键名
const STORAGE_KEY = 'dictionary_word_page_state';

// 状态有效期：5 分钟（毫秒）
const STATE_TTL_MS = 5 * 60 * 1000;

/**
 * 查词页面的完整状态结构
 */
export interface WordPageState {
    /** 搜索框内容 */
    wordInput: string;

    /** 当前查询的单词 */
    currentWord: string | null;

    /** 页面状态 */
    status: 'idle' | 'loading' | 'success' | 'error';

    /** 查询结果（完整的单词详情） */
    result: WordDetail | null;

    /** 错误信息 */
    errorMessage: string | null;

    /** 上次访问时间（毫秒时间戳） */
    lastVisitedAt: number | null;
}

/**
 * 从 sessionStorage 加载查词页面状态
 * 
 * 逻辑：
 * 1. 从 sessionStorage 读取保存的状态
 * 2. 检查是否过期（超过 5 分钟）
 * 3. 如果过期或数据无效，返回 null 并清理存储
 * 
 * @returns 如果存在且未过期，返回保存的状态；否则返回 null
 */
export function loadWordPageState(): WordPageState | null {
    try {
        const savedData = sessionStorage.getItem(STORAGE_KEY);
        if (!savedData) {
            return null;
        }

        const state: WordPageState = JSON.parse(savedData);

        // 检查是否过期（5 分钟）
        if (state.lastVisitedAt) {
            const timeElapsed = Date.now() - state.lastVisitedAt;
            if (timeElapsed > STATE_TTL_MS) {
                // 已过期，清除存储
                sessionStorage.removeItem(STORAGE_KEY);
                return null;
            }
        }

        return state;
    } catch (error) {
        console.error('加载查词页面状态失败:', error);
        // 出错时清除存储
        sessionStorage.removeItem(STORAGE_KEY);
        return null;
    }
}

/**
 * 将查词页面状态保存到 sessionStorage
 * 
 * 逻辑：
 * 1. 更新状态的 lastVisitedAt 为当前时间
 * 2. 序列化为 JSON 并保存到 sessionStorage
 * 
 * @param state 要保存的状态
 */
export function saveWordPageState(state: WordPageState): void {
    try {
        const dataToSave: WordPageState = {
            ...state,
            lastVisitedAt: Date.now(), // 更新最后访问时间
        };

        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (error) {
        console.error('保存查词页面状态失败:', error);
    }
}

/**
 * 清除保存的查词页面状态
 * 
 * 使用场景：
 * - 用户主动清空搜索
 * - 发生错误需要重置状态
 */
export function clearWordPageState(): void {
    sessionStorage.removeItem(STORAGE_KEY);
}
