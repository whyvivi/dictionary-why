import api from './api';

export interface Notebook {
    id: number;
    name: string;
    description?: string;
    isDefault: boolean;
    createdAt: string;
    wordCount?: number;
}

export interface NotebookDetail extends Notebook {
    words: NotebookWord[];
}

export interface NotebookWord {
    wordId: number;
    spelling: string;
    phoneticUk?: string;
    phoneticUs?: string;
    addedAt: string;
}

export interface Article {
    id: number;
    title: string;
    notebookId: number;
    createdAt: string;
}

export interface ArticleDetail extends Article {
    content: string;
}

export const notebookApi = {
    // 获取所有单词本
    getAll: async (): Promise<Notebook[]> => {
        const response = await api.get('/notebooks');
        return response.data;
    },

    // 创建单词本
    create: async (name: string, description?: string): Promise<Notebook> => {
        const response = await api.post('/notebooks', { name, description });
        return response.data;
    },

    // 获取/创建默认单词本
    getDefault: async (): Promise<Notebook> => {
        const response = await api.post('/notebooks/default');
        return response.data;
    },

    // 获取单词本详情
    getDetail: async (id: number): Promise<NotebookDetail> => {
        const response = await api.get(`/notebooks/${id}`);
        return response.data;
    },

    // 添加单词到单词本
    addWord: async (notebookId: number, wordId: number): Promise<any> => {
        const response = await api.post(`/notebooks/${notebookId}/words`, { wordId });
        return response.data;
    },

    // 从单词本移除单词
    removeWord: async (notebookId: number, wordId: number): Promise<any> => {
        const response = await api.delete(`/notebooks/${notebookId}/words/${wordId}`);
        return response.data;
    },

    // 生成文章
    generateArticle: async (notebookId: number, style: string = 'story'): Promise<ArticleDetail> => {
        const response = await api.post('/articles/generate', { notebookId, style });
        return response.data;
    },
};
