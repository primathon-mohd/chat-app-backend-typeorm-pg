import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { MessageDto } from 'src/users/dto/message.body.dto';
import { MessageStructure } from 'src/users/entity/message.entity';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { MAX_NUM, MIN_NUM, skipCount } from './constants';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(MessageStructure)
    private messageRepo: Repository<MessageStructure>,
    private userService: UsersService,
  ) {}

  async addChatHistory(messageDto: MessageDto) {
    try {
      const newMsgHistory = {
        sender_user_id: messageDto.sender_user_id,
        receiver_user_id: messageDto.receiver_user_id,
        msg: messageDto.msg,
      };
      console.log(' Inside addChat History !! ', newMsgHistory);
      await this.messageRepo.save(newMsgHistory);
    } catch (err) {
      if (err.status) {
        throw err;
      }
      throw new HttpException('Failed to add chat', HttpStatus.BAD_REQUEST);
    }
  }

  async allChatsHistoryBetweenTwoUsers(sender_user_id, receiver_user_id) {
    try {
      const page = MIN_NUM;
      const limit = MAX_NUM;
      const offset = skipCount(page, limit);
      const [chats, totalCount] = await this.messageRepo.findAndCount({
        where: [
          {
            sender_user_id: sender_user_id,
            receiver_user_id: receiver_user_id,
          },

          {
            sender_user_id: receiver_user_id,
            receiver_user_id: sender_user_id,
          },
        ],
        order: {
          sentAt: 'ASC',
        },
        skip: offset,
        take: limit,
      });
      if (!chats) return [];
      return {
        results: chats,
        page,
        limit,
        totalCount,
      };
    } catch (err) {
      if (err.status) {
        throw err;
      }
      throw new HttpException(
        'Failed to retrieve chat history',
        HttpStatus.NOT_FOUND,
      );
    }
  }
}
