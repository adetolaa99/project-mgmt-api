import { IsOptional, IsString, IsBoolean, IsDateString } from 'class-validator';

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsBoolean()
  is_completed?: boolean;

  @IsOptional()
  @IsDateString()
  due_date?: string;
}
