import { Controller, Get, Post, Body, Query, UseGuards, Request, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
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
}
