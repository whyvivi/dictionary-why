import { Controller, Get, Param, Query, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DictionaryService } from './dictionary.service';
import { WordSearchResultDto, UnifiedWordDetailDto } from './dto/word.dto';

/**
 * 单词查询控制器
 * 提供查词和搜索建议接口
 * 所有接口都需要 JWT 鉴权
 */
@Controller('words')
@UseGuards(JwtAuthGuard)  // 所有接口都需要登录
export class WordsController {
    constructor(private readonly dictionaryService: DictionaryService) { }

    /**
     * 搜索单词（前缀匹配）
     * GET /api/words/search?query=app
     * @param query 搜索关键词
     * @returns 匹配的单词列表
     */
    @Get('search')
    async searchWords(@Query('query') query: string): Promise<WordSearchResultDto[]> {
        if (!query || query.trim().length === 0) {
            return [];
        }

        const results = await this.dictionaryService.searchWords(query);
        return results;
    }

    /**
     * 获取今日一词
     * GET /api/words/word-of-the-day
     * 
     * 返回一个推荐学习的单词（优先从用户收藏中随机选择）
     * @returns 今日一词数据（单词ID、拼写、简短释义、例句）
     */
    @Get('word-of-the-day')
    async getWordOfTheDay(@Req() req): Promise<{
        wordId: number;
        text: string;
        simpleChinese: string;
        exampleSentence: string;
    }> {
        const userId = req.user?.id; // 从 JWT 中获取用户ID
        return await this.dictionaryService.getWordOfTheDay(userId);
    }

    /**
     * 获取单词详情
     * GET /api/words/:spelling
     * 
     * 返回统一的单词详情结构，包含：
     * - word: 单词原文
     * - phonetic: 音标（英式、美式、通用）
     * - senses: 词义列表（包含词性、中文释义、英文释义、例句）
     * - source: 数据来源
     * - cached: 是否来自缓存
     * 
     * @param spelling 单词拼写
     * @returns 单词详情（统一格式）
     */
    @Get(':spelling')
    async getWordDetail(@Param('spelling') spelling: string): Promise<UnifiedWordDetailDto> {
        return await this.dictionaryService.getWordDetail(spelling);
    }
}
