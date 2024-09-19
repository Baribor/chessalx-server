import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class RequestGameDTO {
  @IsNotEmpty()
  @IsString()
  username: string;
}

export class AcceptGameDTO {
  @IsNotEmpty()
  @IsNumber()
  gameId: number;
}
