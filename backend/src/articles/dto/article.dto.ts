import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';

/**
 * 生成文章 DTO
 */
export class GenerateArticleDto {
    @IsNotEmpty({ message: '单词本 ID 不能为空' })
    @IsNumber()
    notebookId: number;

    @IsOptional()
    @IsString()
    style?: string; // "story" | "diary" | "essay"

    @IsOptional()
    @IsString()
    length?: string; // "short" | "medium" | "long"
}
