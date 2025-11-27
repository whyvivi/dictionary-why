import { IsArray, IsString, IsNotEmpty, IsIn, ArrayMinSize } from 'class-validator';

/**
 * 根据单词列表生成文章的 DTO
 */
export class GenerateArticleFromWordsDto {
    // 单词列表（至少1个单词）
    @IsArray({ message: '单词列表必须是数组' })
    @ArrayMinSize(1, { message: '单词列表不能为空' })
    @IsString({ each: true, message: '每个单词必须是字符串' })
    words: string[];

    // 难度级别
    @IsNotEmpty({ message: '难度级别不能为空' })
    @IsIn(['primary', 'highschool', 'cet4', 'cet6'], {
        message: '难度级别必须是 primary, highschool, cet4 或 cet6'
    })
    level: 'primary' | 'highschool' | 'cet4' | 'cet6';
}
