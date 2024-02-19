import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RegisteredUser } from 'src/auth/entity/registered.user.entity';
import { Repository } from 'typeorm';
import { MessageStructure } from './entity/message.entity';
import { MessageDto } from './dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(RegisteredUser)
    private userRepository: Repository<RegisteredUser>,
    @InjectRepository(MessageStructure)
    private msgRepository: Repository<MessageStructure>,
  ) {}

  async retrieve(email: string, id: number) {
    try {
      //Check if email from jwt token is valid and exists in user repository..
      const response = await this.userRepository.findOneByOrFail({
        email,
      });
      delete response.password;
      // tried to find some info from another table with id field as provided .. for searching into that table ..
      //   write down code for another table search with given id , passed as param above
      const msgInfo = await this.msgRepository.findOneByOrFail({
        id,
      });
      return {
        response,
        msgInfo,
      };
    } catch (err) {
      throw new NotFoundException(err.message);
    }
  }

  async create(email: string, msgDto: MessageDto) {
    try {
      //Check if email from jwt token is valid and exists in user repository..
      const response = await this.userRepository.findOneByOrFail({
        email,
      });
      delete response.password;
      //Now , storing the message into the table .
      msgDto['email'] = email;
      console.log('Inside create  ', msgDto);
      const msgInfo = await this.msgRepository.save(msgDto);
      return {
        response,
        msgInfo,
      };
    } catch (err) {
      throw new NotFoundException(err.message);
    }
  }

  async update(email: string, msgDto: MessageDto, msgId: number) {
    try {
      //Check if email from jwt token is valid and exists in user repository..
      const response = await this.userRepository.findOneByOrFail({
        email,
      });
      delete response.password;
      // check if msg with given id is present in the table.
      const msg = await this.msgRepository.findOneBy({
        email,
        id: msgId,
      });
      //Now , storing the message into the table .
      // Updating for that user email and given id
      // console.log('message id and messageDto ', msgId, '   ', msgDto);
      msgDto['email'] = email;
      msgDto.sentAt = msg.sentAt;
      msgDto.updatedAt = new Date();
      // console.log(msgDto);
      const msgInfo = await this.msgRepository
        .createQueryBuilder()
        .update(MessageStructure, msgDto)
        .where('id = :id', { id: msgId })
        .returning('*')
        .updateEntity(true)
        .execute();
      return {
        response,
        msgInfo,
      };
    } catch (err) {
      throw new NotFoundException(err.message);
    }
  }

  async delete(email: string, id: number) {
    try {
      //Check if email from jwt token is valid and exists in user repository..
      const response = await this.userRepository.findOneByOrFail({
        email,
      });
      delete response.password;
      //Delete msg with given id.
      const del = await this.msgRepository.delete({
        id,
        email,
      });
      return del;
    } catch (err) {
      throw new NotFoundException(err.message);
    }
  }

  async deleteAll(email: string) {
    try {
      //Check if email from jwt token is valid and exists in user repository..
      const response = await this.userRepository.findOneByOrFail({
        email,
      });
      delete response.password;
      //Delete All messages of one user with given email ID.
      const del = await this.msgRepository.delete({
        email,
      });
      return del;
    } catch (err) {
      throw new NotFoundException(err.message);
    }
  }

  async clear(email: string) {
    try {
      //Check if email from jwt token is valid and exists in user repository..
      const response = await this.userRepository.findOneByOrFail({
        email,
      });
      delete response.password;
      //Delete All messages , clear chat of group or between two!! .
      await this.msgRepository.clear();
      return 'All Deleted';
    } catch (err) {
      throw new NotFoundException(err.message);
    }
  }
}
