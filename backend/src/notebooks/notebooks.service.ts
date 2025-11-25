import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotebookDto } from './dto/notebook.dto';

@Injectable()
export class NotebooksService {
    constructor(private prisma: PrismaService) { }

    /**
     * 获取用户的所有单词本
     */
    async getUserNotebooks(userId: number) {
        const notebooks = await this.prisma.notebook.findMany({
            where: { userId },
            include: {
                _count: {
                    select: { notebookWords: true },
                },
            },
            orderBy: [
                { isDefault: 'desc' }, // 默认单词本排在前面
                { createdAt: 'desc' },
            ],
        });

        return notebooks.map(nb => ({
            id: nb.id,
            name: nb.name,
            description: nb.description,
            isDefault: nb.isDefault,
            createdAt: nb.createdAt,
            wordCount: nb._count.notebookWords,
        }));
    }

    /**
     * 创建单词本
     */
    async createNotebook(userId: number, dto: CreateNotebookDto) {
        return this.prisma.notebook.create({
            data: {
                userId,
                name: dto.name,
                description: dto.description,
            },
        });
    }

    /**
     * 获取或创建默认单词本
     */
    async getDefaultNotebook(userId: number) {
        // 1. 查找现有的默认单词本
        const existingDefault = await this.prisma.notebook.findFirst({
            where: {
                userId,
                isDefault: true,
            },
        });

        if (existingDefault) {
            return existingDefault;
        }

        // 2. 如果没有，创建一个新的默认单词本
        return this.prisma.notebook.create({
            data: {
                userId,
                name: '默认单词本',
                description: '系统自动创建的默认单词本',
                isDefault: true,
            },
        });
    }

    /**
     * 获取单词本详情（包含单词列表）
     */
    async getNotebookDetail(userId: number, notebookId: number) {
        const notebook = await this.prisma.notebook.findUnique({
            where: { id: notebookId },
            include: {
                notebookWords: {
                    include: {
                        word: true,
                    },
                    orderBy: {
                        addedAt: 'desc',
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

        return {
            id: notebook.id,
            name: notebook.name,
            description: notebook.description,
            isDefault: notebook.isDefault,
            createdAt: notebook.createdAt,
            words: notebook.notebookWords.map(nw => ({
                wordId: nw.word.id,
                spelling: nw.word.spelling,
                phoneticUk: nw.word.phoneticUk,
                phoneticUs: nw.word.phoneticUs,
                addedAt: nw.addedAt,
            })),
        };
    }

    /**
     * 添加单词到单词本
     */
    async addWordToNotebook(userId: number, notebookId: number, wordId: number) {
        // 1. 检查单词本归属
        const notebook = await this.prisma.notebook.findUnique({
            where: { id: notebookId },
        });

        if (!notebook) {
            throw new NotFoundException('单词本不存在');
        }

        if (notebook.userId !== userId) {
            throw new ForbiddenException('无权操作该单词本');
        }

        // 2. 检查单词是否存在
        const word = await this.prisma.word.findUnique({
            where: { id: wordId },
        });

        if (!word) {
            throw new NotFoundException('单词不存在');
        }

        // 3. 尝试添加（利用数据库唯一索引避免重复）
        try {
            return await this.prisma.notebookWord.create({
                data: {
                    notebookId,
                    wordId,
                },
            });
        } catch (error) {
            if (error.code === 'P2002') {
                // 唯一约束冲突，说明已存在，直接返回成功或抛出特定错误
                // 这里选择抛出 ConflictException，让前端知道已经添加过了
                throw new ConflictException('该单词已在单词本中');
            }
            throw error;
        }
    }

    /**
     * 从单词本移除单词
     */
    async removeWordFromNotebook(userId: number, notebookId: number, wordId: number) {
        // 1. 检查单词本归属
        const notebook = await this.prisma.notebook.findUnique({
            where: { id: notebookId },
        });

        if (!notebook) {
            throw new NotFoundException('单词本不存在');
        }

        if (notebook.userId !== userId) {
            throw new ForbiddenException('无权操作该单词本');
        }

        // 2. 查找关联记录
        const notebookWord = await this.prisma.notebookWord.findFirst({
            where: {
                notebookId,
                wordId,
            },
        });

        if (!notebookWord) {
            throw new NotFoundException('单词不在该单词本中');
        }

        // 3. 删除
        return this.prisma.notebookWord.delete({
            where: { id: notebookWord.id },
        });
    }
}
