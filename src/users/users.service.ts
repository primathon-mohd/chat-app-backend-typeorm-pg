import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RegisteredUser } from 'src/auth/entity/registered.user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(RegisteredUser)
    private userRepository: Repository<RegisteredUser>,
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
      return {
        response,
        id,
      };
    } catch (err) {
      throw new NotFoundException(err.message);
    }
  }
}
