import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ArticlesController } from './articles.controller';
import { ArticlesService } from './articles.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule, HttpModule],
    controllers: [ArticlesController],
    providers: [ArticlesService],
    exports: [ArticlesService],
})
export class ArticlesModule { }
