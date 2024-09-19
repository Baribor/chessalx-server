import { PickType } from '@nestjs/mapped-types';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class SignUpDTO {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;
}

export class LoginDTO extends PickType(SignUpDTO, ['password'] as const) {
  @IsString()
  @IsNotEmpty()
  identifier: string;
}

export class ForgotPasswordDTO extends PickType(SignUpDTO, ['email']) {}

export class VerifyPasswordResetDTO extends ForgotPasswordDTO {
  @IsNotEmpty()
  @IsString()
  code: string;
}

export class ResetPasswordDTO {
  @IsNotEmpty()
  @MinLength(6)
  newPassword: string;
}

export class GoogleAuthDTO {
  @IsString()
  @IsNotEmpty()
  accessToken: string;
}
