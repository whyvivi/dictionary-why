import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NotebooksService } from './notebooks.service';
import { CreateNotebookDto, AddWordDto } from './dto/notebook.dto';

@Controller('notebooks')
@UseGuards(JwtAuthGuard)
export class NotebooksController {
    constructor(private readonly notebooksService: NotebooksService) { }

    /**
     * 获取当前用户的所有单词本
     */
    @Get()
    async getUserNotebooks(@Request() req) {
        return this.notebooksService.getUserNotebooks(req.user.id);
    }

    /**
     * 创建新单词本
     */
    @Post()
    async createNotebook(@Request() req, @Body() dto: CreateNotebookDto) {
        return this.notebooksService.createNotebook(req.user.id, dto);
    }

    /**
     * 获取或创建默认单词本
     */
    @Post('default')
    async getDefaultNotebook(@Request() req) {
        console.log('收到获取默认单词本请求, userId:', req.user.id);
        return this.notebooksService.getDefaultNotebook(req.user.id);
    }

    /**
     * 获取单词本详情
     */
    @Get(':id')
    async getNotebookDetail(@Request() req, @Param('id', ParseIntPipe) id: number) {
        return this.notebooksService.getNotebookDetail(req.user.id, id);
    }

    /**
     * 添加单词到单词本
     */
    @Post(':id/words')
    async addWordToNotebook(
        @Request() req,
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: AddWordDto
    ) {
        return this.notebooksService.addWordToNotebook(req.user.id, id, dto.wordId);
    }

    /**
     * 从单词本移除单词
     */
    @Delete(':id/words/:wordId')
    async removeWordFromNotebook(
        @Request() req,
        @Param('id', ParseIntPipe) id: number,
        @Param('wordId', ParseIntPipe) wordId: number
    ) {
        return this.notebooksService.removeWordFromNotebook(req.user.id, id, wordId);
    }
}
