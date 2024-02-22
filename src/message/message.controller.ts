import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { MessageService } from './message.service';
import { JwtGuard } from 'src/auth/guard';

@Controller('message')
@UseGuards(JwtGuard)
export class MessageController {
  constructor(private messageService: MessageService) {}
  @Get('chats')
  async allChatBetweenTwoUsers(
    @Query('sender_user_id') sender_user_id: number,
    @Query('receiver_user_id') receiver_user_id: number,
  ) {
    return await this.messageService.allChatsHistoryBetweenTwoUsers(
      sender_user_id,
      receiver_user_id,
    );
  }
}
