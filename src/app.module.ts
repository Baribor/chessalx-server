import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { NestjsFormDataModule, FileSystemStoredFile } from 'nestjs-form-data';
import { FirebaseModule } from './firebase/firebase.module';
import { PusherModule } from './pusher/pusher.module';
import { ProfileModule } from './modules/profile/profile.module';
import { GameModule } from './modules/game/game.module';
import { WebhookModule } from './modules/webhook/webhook.module';

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
    FirebaseModule,
    PusherModule,
    ProfileModule,
    GameModule,
    WebhookModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
