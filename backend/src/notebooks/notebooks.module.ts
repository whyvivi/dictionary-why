import { Module } from '@nestjs/common';
import { NotebooksController } from './notebooks.controller';
import { NotebooksService } from './notebooks.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [NotebooksController],
    providers: [NotebooksService],
    exports: [NotebooksService],
})
export class NotebooksModule { }
