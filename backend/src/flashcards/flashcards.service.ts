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
     * 获取复习闪卡列表
     */
    async getFlashcardsToReview(userId: number, mode: string = 'recent', notebookId?: number, limit: number = 20) {
        const whereClause: any = { userId };

        // 如果是单词本模式，过滤 notebookId
        if (mode === 'notebook' && notebookId) {
            whereClause.notebookId = notebookId;
        }

        // 简单的复习逻辑：获取所有闪卡，按创建时间或上次复习时间排序
        // 实际应用中这里应该有更复杂的间隔重复算法（如 SM-2）
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
                { status: 'asc' }, // 先复习 new/learning，后 reviewed
                { lastReviewedAt: 'asc' }, // 久未复习的优先
                { createdAt: 'desc' },
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

        // 简单的状态更新逻辑
        let newStatus = flashcard.status;
        if (dto.result === 'good') {
            newStatus = 'reviewed';
        } else if (dto.result === 'again') {
            newStatus = 'learning'; // 或者保持 new，视具体逻辑而定
        }

        return this.prisma.flashcard.update({
            where: { id: dto.flashcardId },
            data: {
                status: newStatus,
                lastReviewedAt: new Date(),
            },
        });
    }
}
