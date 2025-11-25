import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

/**
 * 创建单词本 DTO
 */
export class CreateNotebookDto {
    @IsNotEmpty({ message: '单词本名称不能为空' })
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    description?: string;
}

/**
 * 添加单词到单词本 DTO
 */
export class AddWordDto {
    @IsNotEmpty({ message: '单词 ID 不能为空' })
    wordId: number;
}

/**
 * 单词本详情 DTO
 */
export class NotebookDto {
    id: number;
    name: string;
    description?: string;
    isDefault: boolean;
    createdAt: Date;
    wordCount?: number;
}
