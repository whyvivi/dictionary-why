import { Module } from '@nestjs/common';
import { WordsController } from './words.controller';
import { DictionaryService } from './dictionary.service';
import { PrismaModule } from '../prisma/prisma.module';

/**
 * 单词模块
 * 提供查词和单词管理功能
 */
@Module({
    imports: [PrismaModule],  // 导入 Prisma 模块以使用数据库
    controllers: [WordsController],
    providers: [DictionaryService],
    exports: [DictionaryService],  // 导出服务供其他模块使用
})
export class WordsModule { }
