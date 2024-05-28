import { PickType } from '@nestjs/mapped-types';
import { GENDER } from '@prisma/client';
import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';

export class SignUpDTO {
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

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

  @IsNotEmpty()
  @IsIn(Object.values(GENDER))
  gender: GENDER;
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
