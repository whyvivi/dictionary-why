/**
 * 统一的单词查询返回结构
 * 这是对外暴露给前端的标准格式，所有查询接口都返回此结构
 */
export class UnifiedWordDetailDto {
    /** 单词 ID */
    id: number;

    /** 单词原文 */
    word: string;

    /** 音标信息 */
    phonetic: {
        /** 英式音标 */
        uk?: string | null;
        /** 英式发音音频 */
        ukAudio?: string | null;
        /** 美式音标 */
        us?: string | null;
        /** 美式发音音频 */
        usAudio?: string | null;
        /** 通用音标（如果没有明确区分英式美式） */
        general?: string | null;
    };

    /** 词义列表 */
    senses: Array<{
        /** 词义的唯一 ID（数据库主键） */
        id: number;
        /** 词性，例如 "n.", "v.", "adj." */
        pos: string;
        /** 中文释义 */
        cn: string;
        /** 英文解释（可选） */
        enDefinition?: string | null;
        /** 例句列表 */
        examples: Array<{
            /** 英文例句 */
            en: string;
            /** 对应中文翻译 */
            cn: string;
        }>;
    }>;

    /** 数据来源说明，例如 "dictionary+llm" */
    source?: string;

    /** 是否来自本地缓存 */
    cached?: boolean;
}

/**
 * 单词详情 DTO（内部使用）
 * 用于数据库查询结果的映射
 */
export class WordDetailDto {
    /** 单词 ID */
    id: number;

    /** 单词拼写 */
    spelling: string;

    /** 英式音标 */
    phoneticUk?: string;

    /** 美式音标 */
    phoneticUs?: string;

    /** 英式发音音频 URL */
    audioUkUrl?: string;

    /** 美式发音音频 URL */
    audioUsUrl?: string;

    /** 义项列表 */
    senses: WordSenseDto[];
}

/**
 * 义项 DTO（内部使用）
 */
export class WordSenseDto {
    /** 义项顺序 */
    senseOrder: number;

    /** 词性 */
    partOfSpeech: string;

    /** 英文释义 */
    definitionEn: string;

    /** 中文释义(可能为空) */
    definitionZh?: string;

    /** 例句列表 */
    examples: ExampleDto[];
}

/**
 * 例句 DTO（内部使用）
 */
export class ExampleDto {
    /** 英文例句 */
    sentenceEn?: string;

    /** 中文例句翻译 */
    sentenceZh?: string;
}

/**
 * 搜索结果 DTO
 * 用于返回搜索建议列表
 */
export class WordSearchResultDto {
    /** 单词 ID */
    id: number;

    /** 单词拼写 */
    spelling: string;
}
