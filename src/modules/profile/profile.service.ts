import { Injectable } from '@nestjs/common';
import { GAME_STATUS } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { BaseResponseDTO } from 'src/utils/types/utils.types';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(id: string): Promise<BaseResponseDTO> {
    const user = await this.prisma.user.findFirstOrThrow({
      where: {
        id: id,
      },
    });

    const activeGame = await this.prisma.game.findFirst({
      where: {
        OR: [
          {
            whitePlayerId: user.id,
          },
          {
            blackPlayerId: user.id,
          },
        ],
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

    return {
      status: true,
      message: 'OK',
      type: 'object',
      data: {
        ...user,
        activeGame,
      },
    };
  }

  async searchProfile(query: string): Promise<BaseResponseDTO> {
    const users = await this.prisma.user.findMany({
      where: {
        username: {
          startsWith: query,
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        username: true,
        email: true,
        profilePic: true,
      },
    });

    return {
      status: true,
      message: 'OK',
      type: 'array',
      data: users,
    };
  }
}
