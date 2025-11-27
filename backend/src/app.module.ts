import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { WordsModule } from './words/words.module';
import { NotebooksModule } from './notebooks/notebooks.module';
import { FlashcardsModule } from './flashcards/flashcards.module';
import { ArticlesModule } from './articles/articles.module';
import { LlmModule } from './llm/llm.module';
import { ImagesModule } from './images/images.module';

@Module({
  imports: [
    // 加载环境变量
    ConfigModule.forRoot({
      isGlobal: true, // 使配置在全局可用
    }),
    PrismaModule, // 数据库模块
    LlmModule, // LLM 模块
    AuthModule, // 认证模块
    UserModule, // 用户模块
    WordsModule, // 单词模块
    NotebooksModule,
    FlashcardsModule,
    ArticlesModule,
    ImagesModule, // 图片生成模块
  ],
})
export class AppModule {}
