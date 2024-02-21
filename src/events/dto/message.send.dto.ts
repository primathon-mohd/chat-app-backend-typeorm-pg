import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class MessageSendDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  senderName: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  receiverName: string;

  @IsString()
  @IsNotEmpty()
  msg: string;
}
