import api from './api';

/**
 * 与“单词配图生成”相关的 API 封装
 */
export const imageApi = {
    /**
     * 为指定单词生成或获取配图
     * 通过统一的 api 实例，会自动拼接 /api 前缀并携带鉴权头
     */
    async generateWordImage(word: string): Promise<string> {
        const response = await api.post('/images/word', { word });
        return response.data.imageUrl as string;
    },
};
