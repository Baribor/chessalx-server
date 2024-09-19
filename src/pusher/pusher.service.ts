import { Inject, Injectable } from '@nestjs/common';
import Pusher from 'pusher';

@Injectable()
export class PusherService {
  private pusher: Pusher;

  constructor(@Inject('PUSHER_APP') private pusherApp: Pusher) {
    this.pusher = pusherApp;
  }

  getPusher(): Pusher {
    return this.pusher;
  }
}
