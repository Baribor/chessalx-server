import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { GameService } from './game.service';
import { CurrentUser } from 'src/schematics/decorators/custom.decorator';
import { AuthGuard } from 'src/schematics/gaurds/auth.gaurd';
import { AuthUser } from 'src/utils/types/utils.types';
import { AcceptGameDTO, RequestGameDTO } from './dto/game.dto';

@Controller('/api/game')
@UseGuards(AuthGuard)
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Post('request')
  async requestGame(
    @CurrentUser() user: AuthUser,
    @Body() payload: RequestGameDTO,
  ) {
    return await this.gameService.requestGame(user.id, payload.username);
  }

  @Post('accept')
  async acceptGame(
    @CurrentUser() user: AuthUser,
    @Body() payload: AcceptGameDTO,
  ) {
    return await this.gameService.acceptGame(payload.gameId);
  }
}
