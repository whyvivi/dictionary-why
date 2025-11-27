import { IsNotEmpty, IsString } from 'class-validator';

/**
 * 用于请求“根据单词生成图片”的 DTO
 */
export class GenerateWordImageDto {
  /** 要生成图片的单词（前端传入的英文单词） */
  @IsString()
  @IsNotEmpty()
  word: string;
}
