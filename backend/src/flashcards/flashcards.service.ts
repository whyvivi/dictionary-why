import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFlashcardDto, ReviewFlashcardDto } from './dto/flashcard.dto';

@Injectable()
export class FlashcardsService {
    constructor(private prisma: PrismaService) { }

    /**
     * 创建闪卡
     */
    async createFlashcard(userId: number, dto: CreateFlashcardDto) {
        // 1. 检查单词是否存在
        const word = await this.prisma.word.findUnique({
            where: { id: dto.wordId },
        });

        if (!word) {
            throw new NotFoundException('单词不存在');
        }

        // 2. 检查是否已存在该单词的闪卡
        const existingFlashcard = await this.prisma.flashcard.findFirst({
            where: {
                userId,
                wordId: dto.wordId,
            },
        });

        if (existingFlashcard) {
            // 如果已存在，直接返回现有的（或者抛出异常，视需求而定）
            // 这里选择返回现有的，避免重复创建报错
            return existingFlashcard;
        }

        // 3. 创建新闪卡
        return this.prisma.flashcard.create({
            data: {
                userId,
                wordId: dto.wordId,
                source: dto.source,
                notebookId: dto.notebookId,
                status: 'new',
            },
        });
    }

    /**
     * 删除闪卡
     */
    async deleteFlashcard(userId: number, id: number) {
        const flashcard = await this.prisma.flashcard.findUnique({
            where: { id },
        });

        if (!flashcard) {
            throw new NotFoundException('闪卡不存在');
        }

        if (flashcard.userId !== userId) {
            throw new ForbiddenException('无权操作该闪卡');
        }

        return this.prisma.flashcard.delete({
            where: { id },
        });
    }

    /**
     * 获取所有闪卡（列表模式）
     */
    async getAllFlashcards(userId: number) {
        const flashcards = await this.prisma.flashcard.findMany({
            where: { userId },
            include: {
                word: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return flashcards.map(fc => ({
            id: fc.id,
            wordId: fc.wordId,
            spelling: fc.word.spelling,
            phoneticUk: fc.word.phoneticUk,
            phoneticUs: fc.word.phoneticUs,
            status: fc.status,
            proficiency: fc.proficiency,
            nextReviewDate: fc.nextReviewDate,
        }));
    }

    /**
     * 获取复习闪卡列表
     */
    async getFlashcardsToReview(userId: number, mode: string = 'recent', notebookId?: number, limit: number = 20) {
        const whereClause: any = {
            userId,
            // 只获取下次复习时间 <= 现在的卡片
            nextReviewDate: {
                lte: new Date(),
            },
        };

        // 如果是单词本模式，过滤 notebookId
        if (mode === 'notebook' && notebookId) {
            whereClause.notebookId = notebookId;
        }

        const flashcards = await this.prisma.flashcard.findMany({
            where: whereClause,
            include: {
                word: {
                    include: {
                        senses: {
                            include: {
                                examples: true,
                            },
                            orderBy: {
                                senseOrder: 'asc',
                            },
                        },
                    },
                },
            },
            orderBy: [
                { nextReviewDate: 'asc' }, // 逾期最久的优先
                { proficiency: 'asc' },    // 不熟练的优先
            ],
            take: limit,
        });

        // 转换为前端友好的格式
        return flashcards.map(fc => ({
            id: fc.id,
            wordId: fc.wordId,
            spelling: fc.word.spelling,
            phoneticUk: fc.word.phoneticUk,
            phoneticUs: fc.word.phoneticUs,
            status: fc.status,
            proficiency: fc.proficiency,
            senses: fc.word.senses.map(s => ({
                partOfSpeech: s.partOfSpeech,
                definitionEn: s.definitionEn,
                definitionZh: s.definitionZh,
                examples: s.examples.map(e => ({
                    sentenceEn: e.sentenceEn,
                    sentenceZh: e.sentenceZh,
                })),
            })),
        }));
    }

    /**
     * 提交复习结果
     */
    async reviewFlashcard(userId: number, dto: ReviewFlashcardDto) {
        const flashcard = await this.prisma.flashcard.findUnique({
            where: { id: dto.flashcardId },
        });

        if (!flashcard) {
            throw new NotFoundException('闪卡不存在');
        }

        if (flashcard.userId !== userId) {
            throw new ForbiddenException('无权操作该闪卡');
        }

        let newProficiency = flashcard.proficiency;
        let nextReviewDate = new Date();

        if (dto.result === 'good') {
            // 认识：熟练度 +1
            newProficiency += 1;

            // 如果熟练度达到 5，自动移除
            if (newProficiency >= 5) {
                await this.prisma.flashcard.delete({
                    where: { id: flashcard.id },
                });
                return { status: 'deleted', message: '已完全掌握，移除闪卡' };
            }

            // 计算下次复习时间：2^proficiency 天后
            // 0 -> 1天, 1 -> 2天, 2 -> 4天, 3 -> 8天, 4 -> 16天
            const daysToAdd = Math.pow(2, newProficiency - 1); // proficiency 已经是+1后的值了，这里稍微调整算法
            // 修正算法：
            // proficiency 0 (new) -> good -> 1 => 1 day
            // proficiency 1 -> good -> 2 => 2 days
            // proficiency 2 -> good -> 3 => 4 days
            // proficiency 3 -> good -> 4 => 8 days
            const days = Math.max(1, Math.pow(2, newProficiency - 1));
            nextReviewDate.setDate(nextReviewDate.getDate() + days);

        } else if (dto.result === 'again') {
            // 不认识：熟练度重置或保持低位
            // 策略：重置为 0，立即复习（nextReviewDate 保持为 now）
            newProficiency = 0;
            // nextReviewDate 默认为 now，所以不需要改变
        }

        return this.prisma.flashcard.update({
            where: { id: dto.flashcardId },
            data: {
                status: newProficiency > 0 ? 'learning' : 'new',
                proficiency: newProficiency,
                lastReviewedAt: new Date(),
                nextReviewDate: nextReviewDate,
            },
        });
    }
}
