import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { GAME_STATUS, TERMINATION } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { PusherService } from 'src/pusher/pusher.service';
import { BaseResponseDTO } from 'src/utils/types/utils.types';

@Injectable()
export class GameService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pusherApp: PusherService,
  ) {}

  async requestGame(
    requester_id: string,
    username: string,
  ): Promise<BaseResponseDTO> {
    const user = await this.prisma.user.findFirst({
      where: {
        username,
      },
    });

    if (!user) {
      throw new NotFoundException('user with the username was not found');
    }

    if (
      await this.prisma.game.findFirst({
        where: {
          blackPlayerId: user.id,
          status: GAME_STATUS.ongoing,
        },
      })
    ) {
      throw new BadRequestException('user currently playing a game');
    }

    const game = await this.prisma.game.create({
      data: {
        whitePlayerId: requester_id,
        blackPlayerId: user.id,
      },
      include: {
        whitePlayer: true,
      },
    });
    // this.pusherApp.getPusher().trigger(user.id, 'game-request', game);
    this.pusherApp.getPusher().sendToUser(user.id, 'game-request', game);

    return {
      status: true,
      message: 'OK',
      type: 'object',
      data: game,
    };
  }

  async acceptGame(gameId: number, userId: string): Promise<BaseResponseDTO> {
    const game = await this.prisma.game.findFirst({
      where: {
        id: gameId,
      },
    });

    if (!game) {
      throw new NotFoundException('game with the id was not found');
    }

    const newGame = await this.prisma.game.update({
      where: {
        id: gameId,
      },
      data: {
        status: GAME_STATUS.ongoing,
      },
      include: {
        blackPlayer: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        whitePlayer: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    const opponentId =
      userId === game.blackPlayerId ? game.whitePlayerId : game.blackPlayerId;

    await this.pusherApp
      .getPusher()
      .sendToUser(opponentId, 'request-accepted', game);
    return {
      status: true,
      message: 'Game started',
      type: 'object',
      data: newGame,
    };
  }

  async resignGame(gameId: number): Promise<BaseResponseDTO> {
    const game = await this.prisma.game.findFirst({
      where: {
        id: gameId,
      },
    });

    if (!game) {
      throw new NotFoundException('game with the id was not found');
    }

    await this.prisma.game.update({
      where: {
        id: game.id,
      },
      data: {
        status: GAME_STATUS.completed,
        termination: TERMINATION.resignation,
      },
    });

    await this.pusherApp
      .getPusher()
      .trigger('private-move', 'game-resign', game);
    return {
      status: true,
      message: 'Game resigned',
    };
  }
}
