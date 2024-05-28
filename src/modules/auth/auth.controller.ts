import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ForgotPasswordDTO,
  GoogleAuthDTO,
  LoginDTO,
  ResetPasswordDTO,
  SignUpDTO,
  VerifyPasswordResetDTO,
} from './dto/auth.dto';
import { AuthUser, BaseResponseDTO } from 'src/utils/types/utils.types';
import { CurrentUser } from 'src/schematics/decorators/custom.decorator';
import { AuthGuard } from 'src/schematics/gaurds/auth.gaurd';
import { Response } from 'express';

@Controller('/api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signup')
  async signup(@Body() payload: SignUpDTO): Promise<BaseResponseDTO> {
    return await this.authService.signup(payload);
  }

  @Post('/login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() payload: LoginDTO,
    @Res({ passthrough: true }) response: Response,
  ): Promise<BaseResponseDTO> {
    const res = await this.authService.login(payload);
    response.cookie('token', res.data.token, {
      expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      httpOnly: true,
      sameSite: 'none',
      secure: true,
    });
    return res;
  }

  @Post('/login/google')
  @HttpCode(HttpStatus.OK)
  async loginWithGoogle(
    @Body() payload: GoogleAuthDTO,
    @Res({ passthrough: true }) response: Response,
  ): Promise<BaseResponseDTO> {
    const res = await this.authService.loginWithGoogle(payload);
    response.cookie('token', res.data.token, {
      expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      httpOnly: true,
      sameSite: 'none',
      secure: true,
    });
    return res;
  }

  @Post('/signup/google')
  async signupWithGoogle(
    @Body() payload: GoogleAuthDTO,
    @Res({ passthrough: true }) response: Response,
  ): Promise<BaseResponseDTO> {
    const res = await this.authService.signupWithGoogle(payload);
    response.cookie('token', res.data.token, {
      expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      httpOnly: true,
      sameSite: 'none',
      secure: true,
    });
    return res;
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgorPassword(
    @Body() payload: ForgotPasswordDTO,
  ): Promise<BaseResponseDTO> {
    return await this.authService.forgotPassword(payload.email);
  }

  @Post('verify-password-reset-code')
  @HttpCode(HttpStatus.OK)
  async verifyPasswordResetCode(
    @Body() payload: VerifyPasswordResetDTO,
  ): Promise<BaseResponseDTO> {
    return await this.authService.verifyPasswordResetCode(payload);
  }

  @Patch('reset-password')
  @UseGuards(AuthGuard)
  async resetPassword(
    @CurrentUser() user: AuthUser,
    @Body() payload: ResetPasswordDTO,
  ): Promise<BaseResponseDTO> {
    return this.authService.resetPassword(user.id, payload.newPassword);
  }

  @Get('logout')
  async logout(
    @Res({ passthrough: true }) response: Response,
  ): Promise<BaseResponseDTO> {
    response.cookie('token', null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    });

    return {
      status: true,
      message: 'logged out successfully',
    };
  }
}
