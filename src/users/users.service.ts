import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RegisteredUser } from 'src/auth/entity/registered.user.entity';
import { Repository } from 'typeorm';
import { MessageStructure } from './entity/message.entity';
import { MessageDto } from './dto';
import { SignUpDto } from 'src/auth/dto';
import * as bcrypt from 'bcrypt';

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

  async getAllUsers() {
    try {
      // await this.userRepository.findOneByOrFail({
      //   email,
      // });
      return await this.userRepository.find();
    } catch (err) {
      if (err.status) {
        throw err;
      }
      throw new HttpException(
        'Failed to retrieve all users',
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async registerOrLoginUser(createUserDto: SignUpDto) {
    try {
      let user = await this.userRepository.findOne({
        where: { username: createUserDto.username },
      });
      console.log(' inside userService , registerOrLogin ', user);
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
      if (user) {
        const passwordMatch = await bcrypt.compare(
          createUserDto.password,
          user.password,
        );
        if (!passwordMatch) {
          console.log(' Password does not match !!');
          throw new HttpException(
            ' Password Not match !! ',
            HttpStatus.FORBIDDEN,
          );
        }
        console.log(' Password matched !! ', passwordMatch);
        user.socketId = createUserDto.socketId;
        await this.updateUserInfo(createUserDto.email, user);
      } else {
        user = await this.userRepository.create({
          email: createUserDto.email,
          username: createUserDto.username,
          socketId: createUserDto.socketId,
          password: hashedPassword,
        });
        await this.userRepository.save(user);
      }
      return true;
    } catch (error) {
      // throw new HttpException(' Password Not match !! ', HttpStatus.FORBIDDEN);
      console.log('Error in registerOrLoginUser:', error.message);
      return false;
    }
  }

  async updateUserInfo(email: string, createUserDto: RegisteredUser) {
    //Check if email from jwt token is valid and exists in user repository..
    const response = await this.userRepository.findOneByOrFail({
      email,
    });
    const updateResult = await this.userRepository
      .createQueryBuilder()
      .update(RegisteredUser, createUserDto)
      .where('email = :email', { email: email })
      .returning('*')
      .updateEntity(true)
      .execute();
    console.log(' update result :: ', updateResult);
    delete response.password;
  }

  async findUserIdByUserName(username: string) {
    try {
      // await this.userRepository.findOneByOrFail({
      //   email,
      // });
      const user = await this.userRepository.findOne({
        where: { username },
      });
      console.log(' findUserId By Username ', user);
      return user.id;
    } catch (err) {
      if (err.status) {
        throw err;
      }
      throw new HttpException(
        'Failed to retrieve Username',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async findSocketIdByUsername(username: string) {
    try {
      const user = await this.userRepository.findOne({
        where: { username },
      });
      const id = user.socketId;
      return id;
    } catch (err) {
      if (err.status) {
        throw err;
      }
      throw new HttpException(
        'Failed to retrieve SocketId',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findUsernameUsingSocketId(socketId: string) {
    try {
      const user = await this.userRepository.findOne({
        where: { socketId },
      });
      return user.username;
    } catch (err) {
      if (err.status) {
        throw err;
      }
      throw new HttpException(
        'Failed to retrieve Username',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
