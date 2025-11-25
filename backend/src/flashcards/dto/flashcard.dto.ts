import { IsNotEmpty, IsOptional, IsString, IsNumber, IsIn } from 'class-validator';

/**
 * 创建闪卡 DTO
 */
export class CreateFlashcardDto {
    @IsNotEmpty({ message: '单词 ID 不能为空' })
    @IsNumber()
    wordId: number;

    @IsNotEmpty({ message: '来源不能为空' })
    @IsString()
    source: string; // "search" | "notebook"

    @IsOptional()
    @IsNumber()
    notebookId?: number;
}

/**
 * 提交复习结果 DTO
 */
export class ReviewFlashcardDto {
    @IsNotEmpty({ message: '闪卡 ID 不能为空' })
    @IsNumber()
    flashcardId: number;

    @IsNotEmpty({ message: '复习结果不能为空' })
    @IsIn(['good', 'again'], { message: '复习结果必须是 good 或 again' })
    result: string;
}
