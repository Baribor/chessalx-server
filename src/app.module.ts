import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { NestjsFormDataModule, FileSystemStoredFile } from 'nestjs-form-data';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    NestjsFormDataModule.config({
      storage: FileSystemStoredFile,
      isGlobal: true,
    }),
    JwtModule.register({
      global: true,
    }),
    PrismaModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
