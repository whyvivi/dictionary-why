import { Body, Controller, Post } from '@nestjs/common';
import { ImagesService } from './images.service';
import { GenerateWordImageDto } from './dto/generate-word-image.dto';

/**
 * 与“图片生成”相关的控制器
 */
@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  /**
   * 根据单词生成或获取缓存的配图
   * 请求体：{ word: string }
   * 返回：{ imageUrl: string }
   */
  @Post('word')
  async generateWordImage(@Body() dto: GenerateWordImageDto) {
    const imageUrl = await this.imagesService.generateWordImage(dto.word);
    return { imageUrl };
  }
}
