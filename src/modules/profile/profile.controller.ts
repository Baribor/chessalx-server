import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { CurrentUser } from 'src/schematics/decorators/custom.decorator';
import { AuthUser } from 'src/utils/types/utils.types';
import { AuthGuard } from 'src/schematics/gaurds/auth.gaurd';

@Controller('/api/profile')
@UseGuards(AuthGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  async getProfile(@CurrentUser() user: AuthUser) {
    return await this.profileService.getProfile(user.id);
  }

  @Get('search')
  async searchUser(@Query('username') query: string) {
    return await this.profileService.searchProfile(query);
  }
}
