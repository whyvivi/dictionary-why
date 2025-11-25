import { Controller, Get, Post, Body, Param, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ArticlesService } from './articles.service';
import { GenerateArticleDto } from './dto/article.dto';

@Controller('articles')
@UseGuards(JwtAuthGuard)
export class ArticlesController {
    constructor(private readonly articlesService: ArticlesService) { }

    /**
     * 生成文章
     */
    @Post('generate')
    async generateArticle(@Request() req, @Body() dto: GenerateArticleDto) {
        return this.articlesService.generateArticle(req.user.id, dto);
    }

    /**
     * 获取文章列表
     */
    @Get()
    async getUserArticles(@Request() req) {
        return this.articlesService.getUserArticles(req.user.id);
    }

    /**
     * 获取文章详情
     */
    @Get(':id')
    async getArticleDetail(@Request() req, @Param('id', ParseIntPipe) id: number) {
        return this.articlesService.getArticleDetail(req.user.id, id);
    }
}
