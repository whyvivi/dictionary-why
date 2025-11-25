/**
 * 单词详情 DTO
 * 用于返回单词的完整信息给前端
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
 * 义项 DTO
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
 * 例句 DTO
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
