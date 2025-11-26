import api from './api';

export interface Flashcard {
    id: number;
    wordId: number;
    spelling: string;
    phoneticUk?: string;
    phoneticUs?: string;
    status: string;
    proficiency: number;
    nextReviewDate: string;
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

    // 获取所有闪卡（列表模式）
    getAll: async (): Promise<Flashcard[]> => {
        const response = await api.get('/flashcards/all');
        return response.data;
    },

    // 获取今日需要复习的闪卡
    getTodayFlashcards: async (): Promise<Flashcard[]> => {
        const response = await api.get('/flashcards/today');
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

    // 删除闪卡
    delete: async (id: number): Promise<any> => {
        const response = await api.delete(`/flashcards/${id}`);
        return response.data;
    },
};
