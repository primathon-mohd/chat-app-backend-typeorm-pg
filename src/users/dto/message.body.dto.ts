import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class MessageDto {
  @IsOptional()
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @IsOptional()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  msg: string;

  @IsNumber()
  @IsNotEmpty()
  sender_user_id: number;

  @IsNumber()
  @IsNotEmpty()
  receiver_user_id: number;

  @IsOptional()
  @IsNotEmpty()
  @IsDateString()
  sentAt: Date;

  @IsOptional()
  @IsNotEmpty()
  @IsDateString()
  updatedAt: Date;
}
