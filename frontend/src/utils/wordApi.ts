import api from './api';

/**
 * 单词详情接口返回类型
 */
/**
 * 单词详情接口返回类型 (对应后端的 UnifiedWordDetailDto)
 */
export interface WordDetail {
    id: number;
    word: string;
    phonetic: {
        uk?: string | null;
        ukAudio?: string | null;
        us?: string | null;
        usAudio?: string | null;
        general?: string | null;
    };
    senses: WordSense[];
    source?: string;
    cached?: boolean;
}

export interface WordSense {
    id: number;
    pos: string;
    cn: string;
    enDefinition?: string | null;
    examples: Example[];
}

export interface Example {
    en: string;
    cn: string;
}

export interface WordSearchResult {
    id: number;
    spelling: string;
}

/**
 * 查询单词详情
 * @param spelling 单词拼写
 * @returns 单词详情
 */
export async function fetchWordDetail(spelling: string): Promise<WordDetail> {
    const response = await api.get(`/words/${spelling}`);
    return response.data;
}

/**
 * 搜索单词(前缀匹配)
 * @param query 搜索关键词
 * @returns 匹配的单词列表
 */
export async function searchWords(query: string): Promise<WordSearchResult[]> {
    const response = await api.get('/words/search', {
        params: { query },
    });
    return response.data;
}
