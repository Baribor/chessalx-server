import { Body, Controller, Post } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Controller('webhook')
export class WebhookController {
  constructor(
    private readonly webhookService: WebhookService,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  async pusherEvent(@Body() payload: any) {
    /* 
    {
      channel: 'private-move',
      data: '{"pgn":"1. e4 e5 2. Nc3 Nc6 3. d4 exd4 4. Nd5 d6 5. Nf3 Bg4","fen":"r2qkbnr/ppp2ppp/2np4/3N4/3pP1b1/5N2/PPP2PPP/R1BQKB1R w KQkq - 2 6","gameId":3}',
      event: 'client-new-move',
      name: 'client_event',
      socket_id: '194107.651404'
    }
    */
    for (const event of payload.events) {
      if (event.event === 'client-new-move') {
        const data = JSON.parse(event.data);
        await this.prisma.game.update({
          where: {
            id: data.gameId,
          },
          data: {
            fen: data.fen,
            pgn: data.pgn,
          },
        });
      }
    }

    return {
      status: true,
    };
  }
}
