import { IsNumberString, IsOptional } from 'class-validator';

export class PaginationRequestDTO {
  @IsNumberString()
  @IsOptional()
  limit?: number;

  @IsNumberString()
  @IsOptional()
  cursor?: number;
}
