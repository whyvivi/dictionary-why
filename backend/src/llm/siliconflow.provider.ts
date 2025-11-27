import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * LLM 生成例句的输入参数
 * 包含单词和所有需要生成例句的词义列表
 */
export interface GenerateExamplesInput {
    /** 要生成例句的单词 */
    word: string;
    /** 词义列表，每个词义包含索引、词性、中文释义、英文释义 */
    senses: Array<{
        /** 词义索引（从 0 开始） */
        index: number;
        /** 词性 */
        pos: string;
        /** 中文释义 */
        cn: string;
        /** 英文释义（可选） */
        enDefinition?: string;
    }>;
}

/**
 * LLM 生成例句的输出结果
 * 每个词义对应一个例句（英文 + 中文翻译）
 */
export interface GeneratedExample {
    /** 对应的词义索引 */
    senseIndex: number;
    /** 英文例句 */
    en: string;
    /** 中文翻译 */
    cn: string;
}

/**
 * LLM 生成完整单词信息的输出结果
 * 包含音标、词性、释义和例句
 */
export interface CompleteWordInfo {
    /** 单词原文 */
    word: string;
    /** 音标信息 */
    phonetic: {
        uk?: string | null;
        us?: string | null;
        general?: string | null;
    };
    /** 词义列表 */
    senses: Array<{
        /** 词性（如 n., v., adj.） */
        pos: string;
        /** 中文释义 */
        cn: string;
        /** 英文解释 */
        enDefinition: string;
        /** 例句列表 */
        examples: Array<{
            en: string;
            cn: string;
        }>;
    }>;
}

/**
 * 硅基流动 LLM Provider
 * 负责调用硅基流动的 DeepSeek 模型生成英文例句和中文翻译
 * 
 * 职责：
 * 1. 读取环境变量配置（API Key、Base URL、Model ID）
 * 2. 调用硅基流动的 Chat Completions API
 * 3. 解析 LLM 返回的 JSON 格式例句
 * 4. 提供完善的错误处理和日志记录
 */
@Injectable()
export class SiliconFlowProvider {
    private readonly logger = new Logger(SiliconFlowProvider.name);

    // 从环境变量读取的配置
    private readonly apiKey: string;
    private readonly baseUrl: string;
    private readonly modelId: string;

    constructor(private configService: ConfigService) {
        // 从环境变量读取配置，如果没有则使用默认值
        this.apiKey = this.configService.get<string>('SILICONFLOW_API_KEY', '');
        this.baseUrl = this.configService.get<string>('SILICONFLOW_BASE_URL', 'https://api.siliconflow.cn/v1');
        this.modelId = this.configService.get<string>('LLM_MODEL_ID', 'deepseek-ai/DeepSeek-R1-0528-Qwen3-8B');

        // 如果没有配置 API Key，记录警告
        if (!this.apiKey) {
            this.logger.warn('未配置 SILICONFLOW_API_KEY 环境变量，LLM 功能将无法使用');
        }
    }

    /**
     * 为单词的每个词义生成例句
     * 
     * 工作流程：
     * 1. 构造 prompt，要求 LLM 根据现有词义生成例句
     * 2. 调用硅基流动的 Chat Completions API
     * 3. 解析返回的 JSON 格式例句
     * 4. 返回例句列表
     * 
     * @param input 输入参数（单词 + 词义列表）
     * @returns 生成的例句列表
     * @throws 如果 API 调用失败或解析失败，抛出错误
     */
    async generateExamplesForWord(input: GenerateExamplesInput): Promise<GeneratedExample[]> {
        // 检查是否配置了 API Key
        if (!this.apiKey) {
            throw new Error('未配置 SILICONFLOW_API_KEY 环境变量，无法调用 LLM');
        }

        this.logger.log(`开始为单词 "${input.word}" 生成例句，共 ${input.senses.length} 个词义`);

        try {
            // 构造 prompt
            const userPrompt = this.buildPrompt(input);

            // 调用硅基流动 API
            const url = `${this.baseUrl}/chat/completions`;
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`,
                },
                body: JSON.stringify({
                    model: this.modelId,
                    messages: [
                        {
                            role: 'system',
                            content: '你是一个英汉词典助手。根据给定的单词和词义，为每个词义生成一条英文例句，并提供对应的中文翻译。注意：不要新增新的词义，不要修改原来的中文释义，只输出指定格式的 JSON。',
                        },
                        {
                            role: 'user',
                            content: userPrompt,
                        },
                    ],
                    temperature: 0.5,
                    max_tokens: 1024,
                }),
            });

            // 检查 HTTP 响应状态
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`硅基流动 API 返回错误状态 ${response.status}: ${errorText}`);
            }

            // 解析响应
            const data = await response.json();
            const content = data.choices?.[0]?.message?.content;

            if (!content) {
                throw new Error('硅基流动 API 返回数据格式异常：缺少 content 字段');
            }

            // 解析 LLM 返回的 JSON
            const examples = this.parseExamples(content);

            this.logger.log(`成功生成 ${examples.length} 个例句`);
            return examples;

        } catch (error) {
            this.logger.error(`调用硅基流动 LLM 失败: ${error.message}`, error.stack);
            throw error;
        }
    }

    /**
     * 构造发送给 LLM 的 prompt
     * 
     * @param input 输入参数
     * @returns 用户 prompt 字符串
     */
    private buildPrompt(input: GenerateExamplesInput): string {
        let prompt = `单词: ${input.word}\n\n`;
        prompt += `请为以下每个词义生成一条英文例句，并提供对应的中文翻译。\n\n`;
        prompt += `词义列表:\n`;

        input.senses.forEach((sense) => {
            prompt += `${sense.index}. [${sense.pos}] ${sense.cn}`;
            if (sense.enDefinition) {
                prompt += ` (${sense.enDefinition})`;
            }
            prompt += `\n`;
        });

        prompt += `\n请以以下 JSON 格式返回结果（只返回 JSON，不要包含其他文字）:\n`;
        prompt += `{\n`;
        prompt += `  "examples": [\n`;
        prompt += `    { "senseIndex": 0, "en": "英文例句", "cn": "中文翻译" },\n`;
        prompt += `    { "senseIndex": 1, "en": "英文例句", "cn": "中文翻译" }\n`;
        prompt += `  ]\n`;
        prompt += `}`;

        return prompt;
    }

    /**
     * 解析 LLM 返回的例句 JSON
     * 
     * @param content LLM 返回的 content 字符串
     * @returns 解析后的例句列表
     * @throws 如果解析失败，抛出错误
     */
    private parseExamples(content: string): GeneratedExample[] {
        try {
            // 尝试直接解析 JSON
            let jsonData: any;

            // 有些模型会返回代码块格式，需要提取 JSON 部分
            const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/```\s*([\s\S]*?)\s*```/);
            if (jsonMatch) {
                jsonData = JSON.parse(jsonMatch[1]);
            } else {
                jsonData = JSON.parse(content);
            }

            // 验证返回格式
            if (!jsonData.examples || !Array.isArray(jsonData.examples)) {
                throw new Error('返回的 JSON 格式不正确：缺少 examples 数组');
            }

            return jsonData.examples.map((ex: any) => {
                if (typeof ex.senseIndex !== 'number' || !ex.en || !ex.cn) {
                    throw new Error('例句格式不正确：缺少必需字段 senseIndex, en, cn');
                }
                return {
                    senseIndex: ex.senseIndex,
                    en: ex.en,
                    cn: ex.cn,
                };
            });

        } catch (error) {
            this.logger.error(`解析 LLM 返回的 JSON 失败: ${error.message}`, error.stack);
            this.logger.error(`原始内容: ${content}`);
            throw new Error(`解析 LLM 返回的例句失败: ${error.message}`);
        }
    }

    /**
     * 直接调用 LLM 生成完整的单词信息
     * 不依赖外部词典 API，让 LLM 根据单词生成所有信息
     * 
     * 工作流程：
     * 1. 构造 prompt，要求 LLM 生成单词的音标、词性、释义和例句
     * 2. 调用硅基流动的 Chat Completions API
     * 3. 解析返回的 JSON 格式单词信息
     * 4. 返回完整的单词信息
     * 
     * @param word 要查询的单词
     * @returns 完整的单词信息
     * @throws 如果 API 调用失败或解析失败，抛出错误
     */
    async generateCompleteWordInfo(word: string): Promise<CompleteWordInfo> {
        // 检查是否配置了 API Key
        if (!this.apiKey) {
            throw new Error('未配置 SILICONFLOW_API_KEY 环境变量，无法调用 LLM');
        }

        this.logger.log(`调用 LLM 生成单词 "${word}" 的完整信息`);

        try {
            // 构造 prompt
            const systemPrompt = `你是一个专业的英汉词典助手。根据用户输入的英文单词，生成完整的词典信息。

要求：
1. 【重要】如果用户输入的是乱码、非英文单词或拼写错误严重的单词（无法识别为有效单词），请直接返回 JSON：{ "error": "not_found" }
2. 如果是有效单词，请提供英式和美式音标（国际音标格式，如 /ˈæpl/）
3. 列出该单词的主要词性（最多 3-4 个常用词性）
4. 每个词性提供：
   - 简洁准确的中文释义（5-15字）
   - 完整的英文解释（definition）
   - 2 个实用的英文例句及其中文翻译
5. 只输出 JSON 格式，不要包含任何其他文字
6. 确保信息准确、地道、实用`;

            const userPrompt = `请为英文单词 "${word}" 生成完整的词典信息。

输出 JSON 格式（如果单词有效）：
{
  "word": "${word}",
  "phonetic": {
    "uk": "英式音标",
    "us": "美式音标",
    "general": null
  },
  "senses": [
    {
      "pos": "词性缩写（如 n., v., adj.）",
      "cn": "中文释义",
      "enDefinition": "英文解释",
      "examples": [
        { "en": "英文例句1", "cn": "中文翻译1" },
        { "en": "英文例句2", "cn": "中文翻译2" }
      ]
    }
  ]
}`;

            // 调用硅基流动 API
            const url = `${this.baseUrl}/chat/completions`;
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`,
                },
                body: JSON.stringify({
                    model: this.modelId,
                    messages: [
                        {
                            role: 'system',
                            content: systemPrompt,
                        },
                        {
                            role: 'user',
                            content: userPrompt,
                        },
                    ],
                    temperature: 0.1, // 降低温度以获得更准确的结果，避免幻觉
                    max_tokens: 2048,
                }),
            });

            // 检查 HTTP 响应状态
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`硅基流动 API 返回错误状态 ${response.status}: ${errorText}`);
            }

            // 解析响应
            const data = await response.json();
            const content = data.choices?.[0]?.message?.content;

            if (!content) {
                throw new Error('硅基流动 API 返回数据格式异常：缺少 content 字段');
            }

            // 检查是否返回了未找到错误
            if (content.includes('"error": "not_found"') || content.includes('"error":"not_found"')) {
                throw new Error('Word not found');
            }

            // 解析 LLM 返回的 JSON
            const wordInfo = this.parseCompleteWordInfo(content, word);

            this.logger.log(`成功生成单词 "${word}" 的完整信息，包含 ${wordInfo.senses.length} 个词义`);
            return wordInfo;

        } catch (error) {
            this.logger.error(`调用 LLM 生成完整单词信息失败: ${error.message}`, error.stack);
            throw error;
        }
    }

    /**
     * 解析 LLM 返回的完整单词信息 JSON
     * 
     * @param content LLM 返回的 content 字符串
     * @param word 单词原文（用于验证）
     * @returns 解析后的完整单词信息
     * @throws 如果解析失败，抛出错误
     */
    private parseCompleteWordInfo(content: string, word: string): CompleteWordInfo {
        try {
            // 尝试直接解析 JSON
            let jsonData: any;

            // 有些模型会返回代码块格式，需要提取 JSON 部分
            const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/```\s*([\s\S]*?)\s*```/);
            if (jsonMatch) {
                jsonData = JSON.parse(jsonMatch[1]);
            } else {
                jsonData = JSON.parse(content);
            }

            // 验证返回格式
            if (!jsonData.word || !jsonData.senses || !Array.isArray(jsonData.senses)) {
                throw new Error('返回的 JSON 格式不正确：缺少必需字段 word 或 senses');
            }

            // 构造返回结果
            const result: CompleteWordInfo = {
                word: jsonData.word,
                phonetic: {
                    uk: jsonData.phonetic?.uk || null,
                    us: jsonData.phonetic?.us || null,
                    general: jsonData.phonetic?.general || null,
                },
                senses: jsonData.senses.map((sense: any) => {
                    if (!sense.pos || !sense.cn || !sense.enDefinition || !sense.examples) {
                        throw new Error('词义格式不正确：缺少必需字段 pos, cn, enDefinition 或 examples');
                    }
                    return {
                        pos: sense.pos,
                        cn: sense.cn,
                        enDefinition: sense.enDefinition,
                        examples: sense.examples.map((ex: any) => {
                            if (!ex.en || !ex.cn) {
                                throw new Error('例句格式不正确：缺少必需字段 en 或 cn');
                            }
                            return {
                                en: ex.en,
                                cn: ex.cn,
                            };
                        }),
                    };
                }),
            };

            return result;

        } catch (error) {
            this.logger.error(`解析 LLM 返回的完整单词信息失败: ${error.message}`, error.stack);
            this.logger.error(`原始内容: ${content}`);
            throw new Error(`解析 LLM 返回的单词信息失败: ${error.message}`);
        }
    }
}
