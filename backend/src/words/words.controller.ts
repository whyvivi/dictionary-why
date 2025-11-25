import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DictionaryService } from './dictionary.service';
import { WordDetailDto, WordSearchResultDto } from './dto/word.dto';

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
     * 搜索单词(前缀匹配)
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
     * 获取单词详情
     * GET /api/words/:spelling
     * @param spelling 单词拼写
     * @returns 单词详情(包括音标、释义、例句)
     */
    @Get(':spelling')
    async getWordDetail(@Param('spelling') spelling: string): Promise<WordDetailDto> {
        return await this.dictionaryService.getWordDetail(spelling);
    }
}
