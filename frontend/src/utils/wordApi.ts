import axios from 'axios';

/**
 * 单词详情接口返回类型
 */
export interface WordDetail {
    id: number;
    spelling: string;
    phoneticUk?: string;
    phoneticUs?: string;
    audioUkUrl?: string;
    audioUsUrl?: string;
    senses: WordSense[];
}

export interface WordSense {
    senseOrder: number;
    partOfSpeech: string;
    definitionEn: string;
    definitionZh?: string;
    examples: Example[];
}

export interface Example {
    sentenceEn?: string;
    sentenceZh?: string;
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
    const token = localStorage.getItem('token');

    const response = await axios.get(`/api/words/${spelling}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    return response.data;
}

/**
 * 搜索单词(前缀匹配)
 * @param query 搜索关键词
 * @returns 匹配的单词列表
 */
export async function searchWords(query: string): Promise<WordSearchResult[]> {
    const token = localStorage.getItem('token');

    const response = await axios.get('/api/words/search', {
        params: { query },
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    return response.data;
}
