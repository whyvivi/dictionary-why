import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GenerateArticleDto } from './dto/article.dto';

@Injectable()
export class ArticlesService {
    constructor(private prisma: PrismaService) { }

    /**
     * 生成文章（占位实现）
     */
    async generateArticle(userId: number, dto: GenerateArticleDto) {
        // 1. 获取单词本信息
        const notebook = await this.prisma.notebook.findUnique({
            where: { id: dto.notebookId },
            include: {
                notebookWords: {
                    include: {
                        word: true,
                    },
                },
            },
        });

        if (!notebook) {
            throw new NotFoundException('单词本不存在');
        }

        if (notebook.userId !== userId) {
            throw new ForbiddenException('无权访问该单词本');
        }

        if (notebook.notebookWords.length === 0) {
            throw new NotFoundException('单词本为空，无法生成文章');
        }

        // 2. 提取单词列表
        const words = notebook.notebookWords.map(nw => nw.word.spelling);
        const wordListStr = words.join(', ');

        // 3. 生成占位内容（TODO: 对接真实大模型）
        const title = `【占位生成】${notebook.name} 的练习文章`;
        const style = dto.style || 'story';
        const length = dto.length || 'short';

        const content = `
这是一篇基于单词本 "${notebook.name}" 自动生成的占位文章。

【生成参数】
- 风格：${style}
- 长度：${length}
- 包含单词：${wordListStr}

【文章正文】
Once upon a time, there was a student who wanted to learn English. 
They opened their notebook and saw these words: ${wordListStr}.
They decided to practice every day. 
(此处为占位文本，将来会替换为 AI 生成的真实流畅文章，能够巧妙地将上述单词融入故事情节中。)

The end.
        `.trim();

        // 4. 保存到数据库
        return this.prisma.generatedArticle.create({
            data: {
                userId,
                notebookId: dto.notebookId,
                title,
                content,
            },
        });
    }

    /**
     * 获取用户的文章列表
     */
    async getUserArticles(userId: number) {
        return this.prisma.generatedArticle.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                title: true,
                notebookId: true,
                createdAt: true,
            },
        });
    }

    /**
     * 获取文章详情
     */
    async getArticleDetail(userId: number, articleId: number) {
        const article = await this.prisma.generatedArticle.findUnique({
            where: { id: articleId },
        });

        if (!article) {
            throw new NotFoundException('文章不存在');
        }

        if (article.userId !== userId) {
            throw new ForbiddenException('无权访问该文章');
        }

        return article;
    }
}
