import { Injectable, NotFoundException, ForbiddenException, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { PrismaService } from '../prisma/prisma.service';
import { GenerateArticleDto } from './dto/article.dto';
import { lastValueFrom } from 'rxjs';

// 难度级别配置
const DIFFICULTY_CONFIG = {
    primary: { label: '小学生', emoji: '🧒📘', minWords: 80, maxWords: 120 },
    highschool: { label: '高中生', emoji: '🎓📙', minWords: 150, maxWords: 250 },
    cet4: { label: 'CET4', emoji: '📘🇬🇧', minWords: 200, maxWords: 300 },
    cet6: { label: 'CET6', emoji: '📚🔥', minWords: 300, maxWords: 450 },
};

// 缓存有效期（5分钟）
const CACHE_TTL_MS = 5 * 60 * 1000;

@Injectable()
export class ArticlesService {
    // 内存缓存：key = userId:level:wordsHash, value = { english, chinese, expiresAt }
    private cache = new Map<string, {
        english: string;
        chinese: string;
        expiresAt: number;
    }>();

    constructor(
        private prisma: PrismaService,
        private httpService: HttpService,
    ) { }

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
这是一篇基于单词本 \"${notebook.name}\" 自动生成的占位文章。

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
     * 根据单词列表生成文章（内存缓存，不写数据库）
     */
    async generateArticleFromWords(
        userId: number,
        words: string[],
        level: 'primary' | 'highschool' | 'cet4' | 'cet6',
    ): Promise<{ english: string; chinese: string }> {
        // 1. 清理过期缓存
        this.cleanupExpiredCache();

        // 2. 检查缓存
        const cacheKey = this.generateCacheKey(userId, words, level);
        const cached = this.cache.get(cacheKey);
        if (cached && cached.expiresAt > Date.now()) {
            return { english: cached.english, chinese: cached.chinese };
        }

        // 3. 读取环境变量
        const apiKey = process.env.SILICONFLOW_API_KEY;
        const baseUrl = process.env.SILICONFLOW_BASE_URL || 'https://api.siliconflow.cn/v1';
        const modelId = process.env.LLM_MODEL_ID || 'deepseek-ai/DeepSeek-R1-0528-Qwen3-8B';

        if (!apiKey) {
            throw new HttpException('未配置硅基流动 API Key', HttpStatus.INTERNAL_SERVER_ERROR);
        }

        // 4. 构造 prompt
        const config = DIFFICULTY_CONFIG[level];
        const prompt = `请根据下面的参数生成一篇英文文章，并附上中文翻译：
难度级别：${config.label}
目标篇幅：约 ${config.minWords}-${config.maxWords} 个英文单词
单词列表（必须尽量全部自然融入文章）：${words.join(', ')}

要求：
1. 按自然语境合理使用这些单词，不要生硬逐条罗列。
2. 文章结构完整，有开头、发展和结尾。
3. 句式和用词难度要和难度级别匹配。
4. 在英文文章后，给出整篇的中文翻译。
5. 只按照下面 JSON 格式输出，不要输出任何解释或思考过程：
{
  "english": "这里是英文全文",
  "chinese": "这里是对应的中文翻译"
}`;

        // 5. 调用硅基流动 API
        try {
            const response = await lastValueFrom(
                this.httpService.post(
                    `${baseUrl}/chat/completions`,
                    {
                        model: modelId,
                        temperature: 0.7,
                        max_tokens: 2048,
                        messages: [
                            {
                                role: 'system',
                                content: '你是一名英语写作和翻译老师。请严格按照用户要求生成英文文章和对应的中文翻译。禁止输出任何思考过程、分析过程或多余解释，只能按照指定的 JSON 格式输出。',
                            },
                            {
                                role: 'user',
                                content: prompt,
                            },
                        ],
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${apiKey}`,
                            'Content-Type': 'application/json',
                        },
                    },
                ),
            );

            // 6. 解析返回结果
            const rawContent = response.data.choices[0]?.message?.content;
            if (!rawContent) {
                throw new Error('LLM 返回内容为空');
            }

            // 7. 解析 JSON
            let parsed: { english: string; chinese: string };
            try {
                parsed = JSON.parse(rawContent);
            } catch (e) {
                throw new Error(`LLM 返回格式错误：${rawContent}`);
            }

            // 8. 验证字段
            if (!parsed.english || !parsed.chinese) {
                throw new Error('LLM 返回缺少必要字段');
            }

            // 9. 缓存结果
            this.cache.set(cacheKey, {
                english: parsed.english,
                chinese: parsed.chinese,
                expiresAt: Date.now() + CACHE_TTL_MS,
            });

            return { english: parsed.english, chinese: parsed.chinese };
        } catch (error) {
            throw new HttpException(
                `生成文章失败：${error.message}`,
                HttpStatus.BAD_GATEWAY,
            );
        }
    }

    /**
     * 清理过期缓存
     */
    private cleanupExpiredCache() {
        const now = Date.now();
        for (const [key, value] of this.cache.entries()) {
            if (value.expiresAt < now) {
                this.cache.delete(key);
            }
        }
    }

    /**
     * 生成缓存 key
     */
    private generateCacheKey(userId: number, words: string[], level: string): string {
        const wordsHash = words.sort().join('|');
        return `${userId}:${level}:${wordsHash}`;
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
