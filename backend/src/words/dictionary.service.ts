import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WordDetailDto, WordSenseDto, ExampleDto } from './dto/word.dto';

/**
 * 字典服务
 * 封装免费字典 API 调用和本地缓存逻辑
 * 
 * 注意:当前使用 https://api.dictionaryapi.dev 免费 API 仅作开发/演示用途
 * 将来需要替换为正式授权的词典 API 或导入本地词典数据
 */
@Injectable()
export class DictionaryService {
    private readonly logger = new Logger(DictionaryService.name);
    // 免费字典 API 地址(仅用于开发和演示)
    private readonly FREE_DICT_API = 'https://api.dictionaryapi.dev/api/v2/entries/en';

    constructor(private prisma: PrismaService) { }

    /**
     * 获取单词详情
     * 优先从本地数据库查询,如果没有则调用外部 API 并缓存
     * @param spelling 单词拼写
     * @returns 单词详情 DTO
     */
    async getWordDetail(spelling: string): Promise<WordDetailDto> {
        // 1. 将输入转换为小写,去掉首尾空格
        const normalizedSpelling = spelling.trim().toLowerCase();

        // 2. 先查询本地数据库
        const cachedWord = await this.findWordInDatabase(normalizedSpelling);
        if (cachedWord) {
            this.logger.log(`从本地缓存获取单词: ${normalizedSpelling}`);
            return cachedWord;
        }

        // 3. 本地没有,调用免费字典 API
        this.logger.log(`本地缓存未找到,调用外部 API 查询: ${normalizedSpelling}`);
        try {
            const apiResult = await this.fetchFromFreeApi(normalizedSpelling);

            // 4. 将 API 结果写入本地数据库
            const savedWord = await this.saveWordToDatabase(normalizedSpelling, apiResult);

            return savedWord;
        } catch (error) {
            this.logger.error(`查询单词失败: ${normalizedSpelling}`, error.stack);
            throw new Error(`未找到单词: ${normalizedSpelling}`);
        }
    }

    /**
     * 从本地数据库查询单词
     * @param spelling 单词拼写(已标准化)
     * @returns 单词详情 DTO 或 null
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
     * 调用免费字典 API 获取单词信息
     * @param spelling 单词拼写
     * @returns API 返回的原始数据
     */
    private async fetchFromFreeApi(spelling: string): Promise<any> {
        const url = `${this.FREE_DICT_API}/${spelling}`;

        try {
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`API 返回错误状态: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            this.logger.error(`调用免费字典 API 失败: ${url}`, error.stack);
            throw error;
        }
    }

    /**
     * 将 API 返回的数据保存到本地数据库
     * @param spelling 单词拼写
     * @param apiData API 返回的原始数据
     * @returns 保存后的单词详情 DTO
     */
    private async saveWordToDatabase(spelling: string, apiData: any[]): Promise<WordDetailDto> {
        // 解析 API 返回的第一个结果
        const firstResult = apiData[0];
        if (!firstResult) {
            throw new Error('API 返回数据为空');
        }

        // 提取音标信息
        const phonetics = firstResult.phonetics || [];
        let phoneticUk = null;
        let phoneticUs = null;
        let audioUkUrl = null;
        let audioUsUrl = null;

        // 尝试找到英式和美式音标
        for (const p of phonetics) {
            if (p.text) {
                // 简单判断:如果有 audio 且包含 'uk',认为是英式
                if (p.audio && p.audio.includes('uk')) {
                    phoneticUk = p.text;
                    audioUkUrl = p.audio;
                } else if (p.audio && p.audio.includes('us')) {
                    phoneticUs = p.text;
                    audioUsUrl = p.audio;
                } else if (!phoneticUk) {
                    // 如果没有明确标识,第一个作为英式
                    phoneticUk = p.text;
                    audioUkUrl = p.audio || null;
                }
            }
        }

        // 如果只有一个音标,同时用作英式和美式
        if (phoneticUk && !phoneticUs) {
            phoneticUs = phoneticUk;
            audioUsUrl = audioUkUrl;
        }

        // 使用事务创建单词及其关联数据
        const savedWord = await this.prisma.$transaction(async (prisma) => {
            // 1. 创建单词
            const word = await prisma.word.create({
                data: {
                    spelling,
                    phoneticUk,
                    phoneticUs,
                    audioUkUrl,
                    audioUsUrl,
                },
            });

            // 2. 创建义项和例句
            const meanings = firstResult.meanings || [];
            let senseOrder = 1;

            for (const meaning of meanings) {
                const partOfSpeech = meaning.partOfSpeech || 'unknown';
                const definitions = meaning.definitions || [];

                for (const def of definitions) {
                    const definitionEn = def.definition;

                    // 创建义项记录
                    const sense = await prisma.wordSense.create({
                        data: {
                            wordId: word.id,
                            senseOrder,
                            partOfSpeech,
                            definitionEn,
                            definitionZh: null, // 当前阶段中文释义为空
                        },
                    });

                    // 保存例句（如果有）
                    if (def.example) {
                        await prisma.example.create({
                            data: {
                                senseId: sense.id,
                                sentenceEn: def.example,
                                sentenceZh: null,
                            },
                        });
                    }
                    senseOrder++;
                }
            }
            return word;
        });

        // 重新查询以返回完整结构
        return this.findWordInDatabase(savedWord.spelling);
    }

    /**
     * 搜索单词(前缀匹配)
     * @param query 搜索关键词
     * @param limit 返回数量限制
     * @returns 匹配的单词列表
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
}
