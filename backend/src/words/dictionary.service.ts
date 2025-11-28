import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WordDetailDto, UnifiedWordDetailDto } from './dto/word.dto';
import { SiliconFlowProvider, CompleteWordInfo } from '../llm/siliconflow.provider';

/**
 * 字典服务
 * 负责处理单词查询的完整业务逻辑
 * 
 * 核心流程（LLM 优先）：
 * 1. 优先从数据库查询（如果有完整数据则直接返回）
 * 2. 如果没有或数据不完整，直接调用 LLM 生成完整的单词信息（音标、释义、例句）
 * 3. 将完整数据保存到数据库
 * 4. 返回统一格式的 DTO
 */
@Injectable()
export class DictionaryService {
    private readonly logger = new Logger(DictionaryService.name);

    constructor(
        private prisma: PrismaService,
        private siliconFlowProvider: SiliconFlowProvider,
    ) { }

    /**
     * 获取单词详情（统一返回格式）
     * 这是对外暴露的主要接口，返回统一的 DTO 格式
     * 
     * @param spelling 单词拼写
     * @returns 统一格式的单词详情 DTO
     */
    async getWordDetail(spelling: string): Promise<UnifiedWordDetailDto> {
        // 步骤 1：标准化输入
        const normalizedSpelling = spelling.trim().toLowerCase();

        this.logger.log(`收到查询请求: ${normalizedSpelling}`);
        // 检查 API Key 是否配置
        if (!process.env.SILICONFLOW_API_KEY) {
            this.logger.error('严重错误: SILICONFLOW_API_KEY 环境变量未配置！');
        } else {
            this.logger.log('SILICONFLOW_API_KEY 已配置');
        }

        // 步骤 2：优先从数据库查询
        const cachedWord = await this.findWordInDatabase(normalizedSpelling);
        if (cachedWord) {
            // 检查是否有完整的中文释义和例句
            const hasCompleteData = this.checkIfDataIsComplete(cachedWord);

            if (hasCompleteData) {
                this.logger.log(`从本地缓存获取单词（完整数据）: ${normalizedSpelling}`);
                return this.convertToUnifiedDto(cachedWord, true);
            }
        }

        // 步骤 3：数据库没有该单词或数据不完整，直接调用 LLM 生成完整信息
        this.logger.log(`本地缓存未找到或数据不完整，调用 LLM 生成完整信息: ${normalizedSpelling}`);
        try {
            // 调用 LLM 生成完整单词信息（包括音标、词性、释义、例句）
            const llmWordInfo = await this.siliconFlowProvider.generateCompleteWordInfo(normalizedSpelling);

            // 将 LLM 生成的信息保存到数据库
            await this.saveLLMWordToDatabase(llmWordInfo);

            // 重新查询以获取最新数据
            const finalWord = await this.findWordInDatabase(normalizedSpelling);
            if (!finalWord) {
                throw new Error('保存单词后查询失败');
            }
            return this.convertToUnifiedDto(finalWord, false);

        } catch (error: any) {
            this.logger.error(`查询单词失败: ${normalizedSpelling}`, error.stack);

            // 处理未找到的情况
            if (error.message === 'Word not found') {
                throw new Error('请仔细检查单词拼写');
            }

            // 临时：写入错误日志到文件
            try {
                // eslint-disable-next-line @typescript-eslint/no-var-requires
                const fs = require('fs');
                const logMessage = `${new Date().toISOString()} - Error querying ${normalizedSpelling}: ${error.message}\nStack: ${error.stack}\n\n`;
                fs.appendFileSync('error.log', logMessage);
            } catch (e) {
                console.error('无法写入错误日志文件', e);
            }
            throw new Error(`查询单词失败: ${normalizedSpelling}。错误: ${error.message}`);
        }
    }

    /**
     * 检查数据库中的单词数据是否完整
     * 完整的定义：每个词义都有中文释义，并且至少有一个例句
     */
    private checkIfDataIsComplete(wordDetail: WordDetailDto): boolean {
        if (!wordDetail.senses || wordDetail.senses.length === 0) {
            return false;
        }

        // 检查每个词义是否都有中文释义和例句
        return wordDetail.senses.every(sense => {
            return sense.definitionZh && sense.examples && sense.examples.length > 0;
        });
    }

    /**
     * 将内部 DTO 转换为统一的对外 DTO 格式
     */
    private convertToUnifiedDto(wordDetail: WordDetailDto, cached: boolean): UnifiedWordDetailDto {
        return {
            id: wordDetail.id,
            word: wordDetail.spelling,
            phonetic: {
                uk: wordDetail.phoneticUk || null,
                ukAudio: wordDetail.audioUkUrl || null,
                us: wordDetail.phoneticUs || null,
                usAudio: wordDetail.audioUsUrl || null,
                general: null,
            },
            senses: wordDetail.senses.map(sense => ({
                id: sense.senseOrder, // 使用 senseOrder 作为前端展示的 ID
                pos: this.formatPartOfSpeech(sense.partOfSpeech),
                cn: sense.definitionZh || sense.definitionEn || '', // 优先使用中文
                enDefinition: sense.definitionEn || null,
                examples: sense.examples.map(ex => ({
                    en: ex.sentenceEn || '',
                    cn: ex.sentenceZh || '',
                })),
            })),
            source: 'dictionary+llm',
            cached,
        };
    }

    /**
     * 格式化词性
     */
    private formatPartOfSpeech(partOfSpeech: string): string {
        const posMap: Record<string, string> = {
            'noun': 'n.',
            'verb': 'v.',
            'adjective': 'adj.',
            'adverb': 'adv.',
            'pronoun': 'pron.',
            'preposition': 'prep.',
            'conjunction': 'conj.',
            'interjection': 'interj.',
        };
        return posMap[partOfSpeech.toLowerCase()] || partOfSpeech;
    }

    /**
     * 将 LLM 生成的完整单词信息保存到数据库
     * 
     * @param wordInfo LLM 生成的完整单词信息
     */
    private async saveLLMWordToDatabase(wordInfo: CompleteWordInfo): Promise<void> {
        await this.prisma.$transaction(async (prisma) => {
            // 1. 检查单词是否已存在
            let word = await prisma.word.findUnique({
                where: { spelling: wordInfo.word },
            });

            if (word) {
                // 更新现有单词的音标
                word = await prisma.word.update({
                    where: { id: word.id },
                    data: {
                        phoneticUk: wordInfo.phonetic.uk,
                        phoneticUs: wordInfo.phonetic.us,
                    },
                });
                // 删除旧的词义，重新覆盖（简单策略）
                await prisma.wordSense.deleteMany({
                    where: { wordId: word.id },
                });
            } else {
                // 创建新单词
                word = await prisma.word.create({
                    data: {
                        spelling: wordInfo.word,
                        phoneticUk: wordInfo.phonetic.uk,
                        phoneticUs: wordInfo.phonetic.us,
                    },
                });
            }

            // 2. 创建词义和例句
            let senseOrder = 1;
            for (const sense of wordInfo.senses) {
                const wordSense = await prisma.wordSense.create({
                    data: {
                        wordId: word.id,
                        senseOrder,
                        partOfSpeech: sense.pos,
                        definitionZh: sense.cn,
                        definitionEn: sense.enDefinition,
                    },
                });

                // 保存例句
                for (const example of sense.examples) {
                    await prisma.example.create({
                        data: {
                            senseId: wordSense.id,
                            sentenceEn: example.en,
                            sentenceZh: example.cn,
                        },
                    });
                }
                senseOrder++;
            }
        });

        this.logger.log(`已保存单词 "${wordInfo.word}" 到数据库`);
    }

    /**
     * 从数据库查询单词
     */
    private async findWordInDatabase(spelling: string): Promise<WordDetailDto | null> {
        const word = await this.prisma.word.findUnique({
            where: { spelling },
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
        });

        if (!word) {
            return null;
        }

        // 转换为 DTO 格式
        return {
            id: word.id,
            spelling: word.spelling,
            phoneticUk: word.phoneticUk,
            phoneticUs: word.phoneticUs,
            audioUkUrl: word.audioUkUrl,
            audioUsUrl: word.audioUsUrl,
            senses: word.senses.map(sense => ({
                senseOrder: sense.senseOrder,
                partOfSpeech: sense.partOfSpeech,
                definitionEn: sense.definitionEn,
                definitionZh: sense.definitionZh,
                examples: sense.examples.map(ex => ({
                    sentenceEn: ex.sentenceEn,
                    sentenceZh: ex.sentenceZh,
                })),
            })),
        };
    }

    /**
     * 搜索单词（前缀匹配）
     */
    async searchWords(query: string, limit: number = 20): Promise<{ id: number; spelling: string }[]> {
        const normalizedQuery = query.trim().toLowerCase();

        const words = await this.prisma.word.findMany({
            where: {
                spelling: {
                    startsWith: normalizedQuery,
                },
            },
            select: {
                id: true,
                spelling: true,
            },
            take: limit,
            orderBy: {
                spelling: 'asc',
            },
        });

        return words;
    }

    /**
     * 获取「今日一词」
     * 优先从用户收藏的单词中随机选择，若无收藏则从 Word 表随机选择
     * 
     * @param userId 用户ID（可选）
     * @returns 今日推荐单词（包含单词ID、拼写、简短中文释义、例句）
     */
    async getWordOfTheDay(userId?: number): Promise<{
        wordId: number;
        text: string;
        simpleChinese: string;
        exampleSentence: string;
    }> {
        try {
            let selectedWord: { id: number; spelling: string } | null = null;

            // 1. 优先从用户收藏的单词中随机选择
            if (userId) {
                const collectedWords = await this.prisma.notebookWord.findMany({
                    where: {
                        notebook: {
                            userId: userId,
                        },
                    },
                    include: {
                        word: {
                            select: {
                                id: true,
                                spelling: true,
                            },
                        },
                    },
                    take: 100, // 限制查询数量，避免性能问题
                });

                if (collectedWords.length > 0) {
                    // 随机选择一个收藏的单词
                    const randomIndex = Math.floor(Math.random() * collectedWords.length);
                    selectedWord = collectedWords[randomIndex].word;
                    this.logger.log(`今日一词从用户收藏中选择: ${selectedWord.spelling}`);
                }
            }

            // 2. 若用户没有收藏或未登录，从 Word 表中随机选择
            if (!selectedWord) {
                const totalCount = await this.prisma.word.count();
                if (totalCount > 0) {
                    const randomSkip = Math.floor(Math.random() * totalCount);
                    const randomWord = await this.prisma.word.findFirst({
                        skip: randomSkip,
                        select: {
                            id: true,
                            spelling: true,
                        },
                    });
                    if (randomWord) {
                        selectedWord = randomWord;
                        this.logger.log(`今日一词从 Word 表随机选择: ${selectedWord.spelling}`);
                    }
                }
            }

            // 3. 获取选中单词的详细信息
            if (selectedWord) {
                const wordDetail = await this.findWordInDatabase(selectedWord.spelling);

                if (wordDetail && wordDetail.senses && wordDetail.senses.length > 0) {
                    const firstSense = wordDetail.senses[0];

                    // 提取简短中文释义
                    const simpleChinese = firstSense.definitionZh ||
                        firstSense.definitionEn?.substring(0, 50) ||
                        '暂无释义';

                    // 提取例句（优先中文，否则英文）
                    let exampleSentence = 'No example available.';
                    if (firstSense.examples && firstSense.examples.length > 0) {
                        const firstExample = firstSense.examples[0];
                        exampleSentence = firstExample.sentenceZh ||
                            firstExample.sentenceEn ||
                            'No example available.';
                    }

                    return {
                        wordId: selectedWord.id,
                        text: selectedWord.spelling,
                        simpleChinese,
                        exampleSentence,
                    };
                }
            }

            // 4. Fallback：默认返回 hello
            this.logger.warn('今日一词未能从数据库选择，使用 fallback');
            return {
                wordId: -1,
                text: 'hello',
                simpleChinese: '你好；问候用语',
                exampleSentence: 'Hello! It is nice to see you here.',
            };

        } catch (error) {
            this.logger.error('获取今日一词失败', error);
            // 出错时返回 fallback
            return {
                wordId: -1,
                text: 'hello',
                simpleChinese: '你好；问候用语',
                exampleSentence: 'Hello! It is nice to see you here.',
            };
        }
    }
}
