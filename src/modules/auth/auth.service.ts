import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  GoogleAuthDTO,
  LoginDTO,
  SignUpDTO,
  VerifyPasswordResetDTO,
} from './dto/auth.dto';
import { AuthUser, BaseResponseDTO } from 'src/utils/types/utils.types';
import { PrismaService } from 'src/prisma/prisma.service';
import { sendMail } from 'src/utils/utils.mail';
import { GENDER, SIGNUP_MODE } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { genSalt, compareSync, hash } from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import { omit } from 'src/utils/functions/utills.functions';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  generateAuthToken(payload: AuthUser): string {
    const token = this.jwtService.sign(payload, {
      expiresIn: '3d',
      secret: process.env.JWT_SECRET,
    });
    return token;
  }

  async generateHash(password: string): Promise<string> {
    const salt = await genSalt(10);
    return await hash(password, salt);
  }

  comparePassword(password: string, passwordHash: string): boolean {
    return compareSync(password, passwordHash);
  }

  async getGoogleUserData(access_token: string): Promise<any> {
    try {
      const client = new OAuth2Client(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
      );

      client.setCredentials({ access_token });

      const { data } = await client.request({
        url: 'https://www.googleapis.com/oauth2/v3/userinfo', // URL for user info endpoint
        method: 'GET',
      });

      return data;
    } catch (error) {
      throw new BadRequestException('invalid or expired token');
    }
  }

  async signup(payload: SignUpDTO): Promise<BaseResponseDTO> {
    if (
      await this.prisma.user.findFirst({
        where: {
          email: {
            equals: payload.email,
            mode: 'insensitive',
          },
        },
      })
    ) {
      throw new ConflictException('user with email already exist');
    }
    const user = await this.prisma.user.create({
      data: {
        email: payload.email.toLowerCase(),
        firstName: payload.firstName,
        lastName: payload.lastName,
        gender: payload.gender,
        username: payload.username,
        passwordHash: await this.generateHash(payload.password),
      },
    });

    await sendMail({
      to: user.email,
      subject: 'WELCOME TO CHESSALX 🚀🚀',
      message: 'we are glad to have you on board',
      html: 'we are glad to have you on board',
    });

    return {
      status: true,
      message: 'Signup Successful',
      type: 'object',
      data: user,
    };
  }

  async login(payload: LoginDTO): Promise<BaseResponseDTO> {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          {
            email: {
              equals: payload.identifier,
              mode: 'insensitive',
            },
          },
          {
            username: {
              equals: payload.identifier,
              mode: 'insensitive',
            },
          },
        ],
      },
      select: {
        email: true,
        profilePic: true,
        firstName: true,
        lastName: true,
        id: true,
        role: true,
        signupMode: true,
        createdAt: true,
        passwordHash: true,
      },
    });
    // eslint-disable-next-line prettier/prettier
    if(!user || !this.comparePassword(payload.password, user.passwordHash)){
      throw new ForbiddenException('incorrect email or password');
    }

    return {
      status: true,
      message: 'Login successful',
      type: 'object',
      data: {
        ...omit(user, ['passwordHash']),
        token: this.generateAuthToken({
          email: user.email,
          id: user.id,
          role: user.role,
        }),
      },
    };
  }

  async forgotPassword(email: string): Promise<BaseResponseDTO> {
    const user = await this.prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: 'insensitive',
        },
      },
    });

    if (!user) {
      throw new NotFoundException('account does not exist');
    }

    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now());
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    const verificationCode = await this.prisma.verificationCode.findFirst({
      where: {
        email,
      },
    });

    if (verificationCode) {
      await this.prisma.verificationCode.update({
        where: {
          email: email.toLowerCase(),
        },
        data: {
          code: await this.generateHash(code),
        },
      });
    } else {
      await this.prisma.verificationCode.create({
        data: {
          code: await this.generateHash(code),
          email,
        },
      });
    }
    await sendMail({
      to: email,
      subject: 'PASSWORD RESET',
      message: 'Use the code below to reset your password',
      html: `Use the code below to reset your password ${code}`,
    });

    return {
      status: true,
      message: 'Password reset set',
    };
  }

  async verifyCode(email: string, code: string): Promise<boolean> {
    const verificationCode = await this.prisma.verificationCode.findFirst({
      where: {
        email: {
          equals: email,
          mode: 'insensitive',
        },
      },
    });

    if (
      !verificationCode ||
      !this.comparePassword(code, verificationCode.code)
    ) {
      return false;
    }

    return true;
  }

  async verifyPasswordResetCode(
    payload: VerifyPasswordResetDTO,
  ): Promise<BaseResponseDTO> {
    const isVerified = await this.verifyCode(payload.email, payload.code);

    if (!isVerified) {
      throw new BadRequestException('invalid code');
    }

    const user = await this.prisma.user.findFirst({
      where: {
        email: {
          equals: payload.email,
          mode: 'insensitive',
        },
      },
    });
    return {
      status: true,
      message: 'success',
      type: 'object',
      data: {
        token: this.generateAuthToken({
          email: user.email,
          id: user.id,
          role: user.role,
        }),
      },
    };
  }

  async resetPassword(
    userId: string,
    newPassword: string,
  ): Promise<BaseResponseDTO> {
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        passwordHash: await this.generateHash(newPassword),
      },
    });

    return {
      status: true,
      message: 'password reset successfully',
    };
  }

  async loginWithGoogle(payload: GoogleAuthDTO): Promise<BaseResponseDTO> {
    const userInfo = await this.getGoogleUserData(payload.accessToken);

    const user = await this.prisma.user.findFirst({
      where: {
        signupMode: SIGNUP_MODE.google,
        email: userInfo.email,
      },
      select: {
        email: true,
        profilePic: true,
        firstName: true,
        lastName: true,
        gender: true,
        username: true,
        id: true,
        role: true,
        signupMode: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('no user found');
    }

    return {
      status: true,
      message: 'login successful',
      type: 'object',
      data: {
        ...user,
        token: this.generateAuthToken({
          email: user.email,
          id: user.id,
          role: user.role,
        }),
      },
    };
  }

  async signupWithGoogle(payload: GoogleAuthDTO): Promise<BaseResponseDTO> {
    const userInfo = await this.getGoogleUserData(payload.accessToken);

    const user = await this.prisma.user.findFirst({
      where: {
        email: {
          mode: 'insensitive',
          equals: userInfo.email,
        },
      },
    });

    if (user) {
      throw new ConflictException('account with email already exist');
    }

    const newUser = await this.prisma.user.create({
      data: {
        firstName: userInfo.given_name,
        lastName: userInfo.family_name,
        email: userInfo.email,
        profilePic: userInfo.picture,
        signupMode: SIGNUP_MODE.google,
        username: 'jdks',
        gender: GENDER.other,
      },
      select: {
        email: true,
        firstName: true,
        lastName: true,
        username: true,
        gender: true,
        id: true,
        profilePic: true,
        createdAt: true,
        role: true,
        signupMode: true,
      },
    });

    await sendMail({
      to: newUser.email,
      subject: 'WELCOME TO CHESSALX 🚀🚀',
      message: 'we are glad to have you on board',
      html: 'we are glad to have you on board',
    });

    return {
      status: true,
      message: 'sign up successful',
      data: {
        ...newUser,
        token: this.generateAuthToken({
          id: newUser.id,
          role: newUser.role,
          email: newUser.email,
        }),
      },
    };
  }
}
