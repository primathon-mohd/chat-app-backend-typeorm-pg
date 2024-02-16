import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { RegisteredUser } from '../entity/registered.user.entity';
import { EntityManager, Repository } from 'typeorm';
import { HttpException, HttpStatus } from '@nestjs/common';
import { PayloadDto } from '../dto';

export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private configService: ConfigService,
    @InjectRepository(RegisteredUser)
    private userRepository: Repository<RegisteredUser>,
    private entityManager: EntityManager,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: PayloadDto) {
    console.log(' Inside validate() method to check for valid token !!');
    let user: RegisteredUser;
    try {
      user = await this.userRepository.findOneBy({
        email: payload.email,
      });
      console.log(' user details ', user);
    } catch (err) {
      throw new HttpException('USER NOT FOUND ---- ', HttpStatus.NOT_FOUND);
    }
    if (!user) {
      throw new HttpException('USER NOT FOUND', HttpStatus.NOT_FOUND);
    }
    return {
      email: user.email,
      payload,
    };
  }
}
