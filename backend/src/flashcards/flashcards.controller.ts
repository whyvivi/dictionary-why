import { Controller, Get, Post, Delete, Body, Query, Param, UseGuards, Request, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FlashcardsService } from './flashcards.service';
import { CreateFlashcardDto, ReviewFlashcardDto } from './dto/flashcard.dto';

@Controller('flashcards')
@UseGuards(JwtAuthGuard)
export class FlashcardsController {
    constructor(private readonly flashcardsService: FlashcardsService) { }

    /**
     * 创建闪卡
     */
    @Post()
    async createFlashcard(@Request() req, @Body() dto: CreateFlashcardDto) {
        return this.flashcardsService.createFlashcard(req.user.id, dto);
    }

    /**
     * 获取所有闪卡（列表模式）
     */
    @Get('all')
    async getAllFlashcards(@Request() req) {
        return this.flashcardsService.getAllFlashcards(req.user.id);
    }

    /**
     * 获取今日需要复习的闪卡
     */
    @Get('today')
    async getTodayFlashcards(@Request() req) {
        return this.flashcardsService.getTodayFlashcards(req.user.id);
    }

    /**
     * 获取复习闪卡列表
     */
    @Get()
    async getFlashcards(
        @Request() req,
        @Query('mode') mode: string = 'recent',
        @Query('notebookId') notebookId?: string,
        @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number = 20
    ) {
        const nbId = notebookId ? parseInt(notebookId) : undefined;
        return this.flashcardsService.getFlashcardsToReview(req.user.id, mode, nbId, limit);
    }

    /**
     * 提交复习结果
     */
    @Post('review')
    async reviewFlashcard(@Request() req, @Body() dto: ReviewFlashcardDto) {
        return this.flashcardsService.reviewFlashcard(req.user.id, dto);
    }

    /**
     * 删除闪卡
     */
    @Delete(':id')
    async deleteFlashcard(@Request() req, @Param('id', ParseIntPipe) id: number) {
        return this.flashcardsService.deleteFlashcard(req.user.id, id);
    }
}
