import { Injectable, NotFoundException, ForbiddenException, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { PrismaService } from '../prisma/prisma.service';
import { GenerateArticleDto } from './dto/article.dto';
import { lastValueFrom } from 'rxjs';

// 难度级别配置（用于生成提示语）
const DIFFICULTY_CONFIG = {
    primary: { label: '小学生难度', emoji: '🧸', minWords: 80, maxWords: 140 },
    highschool: { label: '高中生难度', emoji: '👦', minWords: 150, maxWords: 260 },
    cet4: { label: 'CET4', emoji: '📚', minWords: 220, maxWords: 350 },
    cet6: { label: 'CET6', emoji: '🎓', minWords: 280, maxWords: 450 },
};

// 各难度专属提示，强调纯文本输出及全词覆盖
const DIFFICULTY_PROMPTS: Record<
    'primary' | 'highschool' | 'cet4' | 'cet6',
    string
> = {
    primary: `
你现在是一个温柔的中国小学英语老师，面向大概三、四年级学生。

请根据「单词本」里的所有英文单词，写一段简短的英文故事，并在故事后给出一段中文翻译。

【难度要求（必须遵守）】：
1. 故事主题要轻松、贴近日常生活或校园生活，可以是关于朋友、动物、游戏、上学的一天等。
2. 所有句子尽量使用一般现在时或一般过去时，禁止使用复杂从句（尽量避免 although, however, therefore, moreover 等）。
3. 单句长度尽量控制在 6～12 个单词之间，不要出现特别长的句子。
4. 只能使用非常基础、简单的英语词汇，整体水平接近 CEFR A1～A2。不要写 economy、investor、policy 这种抽象词。
5. 【非常重要】：必须使用「单词本」中的每一个单词，每个单词至少在文中自然地出现一次，可以在不同句子里分散使用，但不要生硬堆砌。

【篇幅要求】：
- 整篇文章用 4～7 句英文组成，尽量写成 1 个自然段即可。
- 如果单词本里的单词特别多，可以适当增加句子数量，但不要写得像学术文章。

【输出格式（必须遵守）】：
1. 先输出英文段落，再输出一个空行，然后输出对应的中文翻译。
2. 只输出纯文本，不要使用任何 Markdown 格式，不要用 ** 单词 **、不要用列表符号（- 或 1. 2. 等）。
3. 不要对单词加粗，不要添加标题、不要额外加“英文：”“翻译：”这样的标签。
`,
    highschool: `
你现在是一个认真负责的高中英语老师。

请根据「单词本」里的所有英文单词，写一篇适合中国高中生阅读的英语短文，并在文后给出中文翻译。

【难度要求】：
1. 文章可以稍微正式一些，但主题仍然贴近日常生活、学习、兴趣、成长等，不要太学术。
2. 句子结构可以适当使用从句，但整体难度不要超过常见高中阅读理解水平。
3. 【非常重要】：必须使用「单词本」中的每一个单词，每个单词至少自然出现一次，可以重复使用。
4. 其他词汇水平控制在 CEFR B1 左右，避免太多生僻高级词。

【篇幅要求】：
- 2～3 个自然段，总共大约 8～14 句英文。
- 整体篇幅要明显比“小学生难度”长，但明显短于 CET-6 难度。

【输出格式（必须遵守，与小学难度相同）】：
1. 先输出完整英文，再输出一个空行，然后输出完整中文翻译。
2. 严禁使用 Markdown，禁止出现 **word** 这种格式，所有单词只以普通文本形式出现。
3. 不要加标题、不加项目符号。
`,
    cet4: `
你现在是一个大学英语老师，目标水平大致为大学英语四级（CET-4）。

请根据「单词本」里的所有英文单词，写一篇难度相当于 CET-4 阅读的英文短文，然后给出中文翻译。

【难度要求】：
1. 使用正式但不过分学术的文体，可以讨论校园生活、未来规划、社会现象的简单观察等。
2. 使用一定数量的高级词汇和复合句，但整体难度不超过常见 CET-4 阅读。
3. 【非常重要】：必须使用「单词本」中的每一个单词，每个单词至少出现一次。
4. 相比高中难度，可以适当提高抽象程度和逻辑性。

【篇幅要求】：
- 2～4 个自然段，总共大约 10～18 句英文。
- 篇幅要明显长于高中难度，但略短于或接近 CET-6 难度。

【输出格式要求】：
- 同上：英文全文 + 空行 + 中文全文，纯文本，不使用任何 Markdown，不加粗单词。
`,
    cet6: `
你现在是一个大学高年级英语教师，目标水平接近大学英语六级（CET-6）。

请根据「单词本」里的所有英文单词，写一篇难度相当于 CET-6 阅读理解的英文短文，然后给出中文翻译。

【难度要求】：
1. 可以讨论更抽象或宏观的话题，例如科技变迁、学习方法、个人成长与社会环境、文化差异等。
2. 可以使用较复杂的句式、一些正式学术化表达，但整体可读性要保持在高级大学生能理解的水平。
3. 【非常重要】：必须使用「单词本」中的每一个单词，每个单词至少自然出现一次。
4. 其他词汇和结构水平大致对应 CEFR B2～C1。

【篇幅要求】：
- 3～5 个自然段，大约 14～24 句英文。
- 篇幅、抽象程度和逻辑复杂度都要明显高于 CET-4 难度。

【输出格式要求】：
- 与其它难度保持完全一致：只输出英文正文 + 空行 + 中文翻译。
- 严禁使用任何 Markdown 语法（包括 ** 加粗、_ 斜体、项目符号等）。
- 不要加标题、不要加“英文：”“翻译：”等前缀。
`,
};

/**
 * 清理模型输出中的 Markdown 标记，确保返回纯文本
 */
function sanitizePlainText(text: string): string {
    if (!text) return text;
    return text
        // 去除 **bold** 或 __bold__
        .replace(/\*\*(.+?)\*\*/g, '$1')
        .replace(/__(.+?)__/g, '$1')
        // 去除残留的 * 或 _ 斜体/列表符号
        .replace(/(^|\s)[*_]+(\S)/g, '$1$2');
}

/**
 * 解析并兜底处理 LLM 返回内容，避免因 Markdown/非 JSON 导致报错
 * - 优先尝试提取 JSON 中的 english/chinese 字段
 * - 若无合法 JSON，则尝试按首个中文字符切分为英文/中文
 * - 最后兜底全部当英文返回，中文为空
 */
function parseLlmResult(rawContent: string): { english: string; chinese: string } {
    const cleaned = rawContent?.trim() ?? '';

    // 1) 尝试提取 JSON 代码块
    const jsonMatch = cleaned.match(/{[\s\S]*}/);
    if (jsonMatch) {
        try {
            const parsed = JSON.parse(jsonMatch[0]);
            if (parsed.english || parsed.chinese) {
                return {
                    english: sanitizePlainText(parsed.english || ''),
                    chinese: sanitizePlainText(parsed.chinese || ''),
                };
            }
        } catch {
            // 忽略，进入下一步兜底
        }
    }

    // 2) 若无合法 JSON，尝试按首个中文字符切分
    const firstZhIndex = cleaned.search(/[\u4e00-\u9fa5]/);
    if (firstZhIndex > 0) {
        const enPart = cleaned.slice(0, firstZhIndex).trim();
        const zhPart = cleaned.slice(firstZhIndex).trim();
        return {
            english: sanitizePlainText(enPart),
            chinese: sanitizePlainText(zhPart),
        };
    }

    // 3) 再尝试按双换行分段：若分成两段，第二段作为中文
    const parts = cleaned.split(/\n\s*\n/);
    if (parts.length >= 2) {
        const enPart = parts[0].trim();
        const zhPart = parts.slice(1).join('\n').trim();
        return {
            english: sanitizePlainText(enPart),
            chinese: sanitizePlainText(zhPart),
        };
    }

    // 4) 兜底：仅返回英文，中文为空（由调用方决定是否视为错误）
    return {
        english: sanitizePlainText(cleaned),
        chinese: '',
    };
}

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

        // 4. 构造 prompt：强调不同难度的语体/篇幅，并确保所有单词出现
        const config = DIFFICULTY_CONFIG[level];
        const wordListText = words.map(w => `- ${w}`).join('\n');
        const prompt = `${DIFFICULTY_PROMPTS[level]}

当前难度：${config.label} ${config.emoji}
参考篇幅：约 ${config.minWords}-${config.maxWords} 个英文单词（如单词较多，为覆盖全部单词可适度加长）

下面是单词本中的所有单词（请务必全部使用，且每个至少出现一次）：
${wordListText}

【统一格式要求】：
- 严禁使用任何 Markdown 语法（包括 **、_、列表等），只输出纯文本。
- 先输出英文正文，再输出一个空行，然后输出中文翻译。
`;

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
                        timeout: 120000, // 防止长时间挂起，前端可恢复 loading 状态
                    },
                ),
            );

            // 6. 解析返回结果
            const rawContent =
                response.data?.choices?.[0]?.message?.content ??
                response.data?.choices?.[0]?.text ??
                response.data?.output_text ??
                response.data?.text ??
                '';
            if (!rawContent || String(rawContent).trim().length === 0) {
                throw new Error('LLM 返回内容为空');
            }

            // 7. 解析内容（允许非 JSON，增加兜底拆分）
            const parsed = parseLlmResult(String(rawContent));
            const contentEn = parsed.english;
            // 若中文缺失，使用提示文本兜底，避免前端直接失败
            const contentZh =
                parsed.chinese && parsed.chinese.trim().length > 0
                    ? parsed.chinese
                    : '（模型未返回中文翻译，请参考英文内容或稍后重试）';

            // 9. 缓存结果
            this.cache.set(cacheKey, {
                english: contentEn,
                chinese: contentZh,
                expiresAt: Date.now() + CACHE_TTL_MS,
            });

            return { english: contentEn, chinese: contentZh };
        } catch (error) {
            throw new HttpException(
                `生成文章失败：${error.response?.data?.message || error.message}`,
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
