import axios from 'axios';

// 配置 axios 实例
const api = axios.create({
    baseURL: '/api',
});

// 添加请求拦截器，自动附加 Token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export interface Flashcard {
    id: number;
    wordId: number;
    spelling: string;
    phoneticUk?: string;
    phoneticUs?: string;
    status: string;
    senses: {
        partOfSpeech: string;
        definitionEn: string;
        definitionZh?: string;
        examples: {
            sentenceEn?: string;
            sentenceZh?: string;
        }[];
    }[];
}

export const flashcardApi = {
    // 创建闪卡
    create: async (wordId: number, source: string = 'search', notebookId?: number): Promise<Flashcard> => {
        const response = await api.post('/flashcards', { wordId, source, notebookId });
        return response.data;
    },

    // 获取复习列表
    getReviewList: async (mode: 'recent' | 'notebook' = 'recent', notebookId?: number): Promise<Flashcard[]> => {
        const params: any = { mode };
        if (notebookId) {
            params.notebookId = notebookId;
        }
        const response = await api.get('/flashcards', { params });
        return response.data;
    },

    // 提交复习结果
    review: async (flashcardId: number, result: 'good' | 'again'): Promise<any> => {
        const response = await api.post('/flashcards/review', { flashcardId, result });
        return response.data;
    },
};
