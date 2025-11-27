import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

interface CachedImage {
  /** 图片的访问 URL */
  url: string;
  /** 过期时间戳（毫秒） */
  expiresAt: number;
}

/**
 * 负责与硅基流动图像生成 API 交互的服务
 * - 根据单词生成记忆插画
 * - 使用内存 Map 做 1 小时缓存（不落数据库）
 */
@Injectable()
export class ImagesService {
  /** key 为小写单词的简单内存缓存 */
  private cache = new Map<string, CachedImage>();

  /** 缓存有效期：1 小时（毫秒） */
  private readonly IMAGE_TTL_MS = 60 * 60 * 1000;

  constructor(private readonly httpService: HttpService) {}

  /**
   * 为指定单词生成（或从缓存获取）配图 URL
   */
  async generateWordImage(word: string): Promise<string> {
    const normalizedWord = word.trim().toLowerCase();
    if (!normalizedWord) {
      throw new HttpException('单词不能为空', HttpStatus.BAD_REQUEST);
    }

    // 每次请求顺手清理一次过期缓存
    this.cleanupExpired();

    const now = Date.now();
    const cached = this.cache.get(normalizedWord);
    if (cached && cached.expiresAt > now) {
      // 命中缓存，直接返回
      return cached.url;
    }

    const apiKey = process.env.SILICONFLOW_API_KEY;
    const baseUrl =
      process.env.SILICONFLOW_BASE_URL || 'https://api.siliconflow.cn/v1';

    if (!apiKey) {
      throw new HttpException(
        '服务器未配置 SILICONFLOW_API_KEY，请在 backend/.env 中添加该环境变量',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const prompt = `A high-quality, visually clear illustration that helps remember the English word "${word}".
The style is slightly anime-like, warm and clean, no text, no watermark, single main subject, simple background.`;

    const negativePrompt =
      'low quality, blurry, distorted, watermark, text, words, logo, noisy background';

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${baseUrl}/images/generations`,
          {
            model: 'Kwai-Kolors/Kolors',
            prompt,
            negative_prompt: negativePrompt,
            image_size: '1024x1024',
            batch_size: 1,
            num_inference_steps: 20,
            guidance_scale: 7.5,
          },
          {
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            timeout: 60_000,
          },
        ),
      );

      const imageUrl: string | undefined =
        response.data?.images?.[0]?.url ?? undefined;

      if (!imageUrl) {
        throw new HttpException(
          '硅基流动未返回有效图片 URL',
          HttpStatus.BAD_GATEWAY,
        );
      }

      const expiresAt = now + this.IMAGE_TTL_MS;
      this.cache.set(normalizedWord, { url: imageUrl, expiresAt });

      return imageUrl;
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        '调用硅基流动图片生成接口失败';

      throw new HttpException(
        `生成图片失败：${message}`,
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  /**
   * 清理已过期缓存，防止内存无限增长
   */
  private cleanupExpired() {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (value.expiresAt <= now) {
        this.cache.delete(key);
      }
    }
  }
}
