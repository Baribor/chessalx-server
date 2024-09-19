import { Global, Module } from '@nestjs/common';
import { PusherService } from './pusher.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Pusher from 'pusher';

const PusherProvider = {
  provide: 'PUSHER_APP',
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const pusherConfig = {
      appId: configService.get('PUSHER_APPID'),
      key: configService.get('PUSHER_KEY'),
      secret: configService.get('PUSHER_SECRET'),
    };
    return new Pusher({
      ...pusherConfig,
      cluster: 'eu',
    });
  },
};

@Global()
@Module({
  providers: [PusherService, PusherProvider],
  imports: [ConfigModule],
  exports: [PusherService],
})
export class PusherModule {}
