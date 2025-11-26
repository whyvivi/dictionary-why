import { Module } from '@nestjs/common';
import { NotebooksController } from './notebooks.controller';
import { NotebooksService } from './notebooks.service';
import { PrismaModule } from '../prisma/prisma.module';
import { FlashcardsModule } from '../flashcards/flashcards.module';

@Module({
    imports: [PrismaModule, FlashcardsModule],
    controllers: [NotebooksController],
    providers: [NotebooksService],
    exports: [NotebooksService],
})
export class NotebooksModule { }
