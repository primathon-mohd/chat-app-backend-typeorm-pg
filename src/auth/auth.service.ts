import { ConfigService } from '@nestjs/config';
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AccessToken, PayloadDto, SignInDto, SignUpDto } from './dto';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { RegisteredUser } from './entity/registered.user.entity';
import { EntityManager, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
    private jwtService: JwtService,
    @InjectRepository(RegisteredUser)
    private userRepository: Repository<RegisteredUser>,
    private entityManager: EntityManager,
  ) {}

  async signup(dto: SignUpDto) {
    let user: RegisteredUser;
    //Encryption of password using bcrypt
    const saltOrRounds = 10;
    const hash = await bcrypt.hash(dto.password, saltOrRounds);
    dto.password = hash;
    try {
      user = await this.userRepository.save(dto);
    } catch (err) {
      console.log(err.message, err.error);
      //   throw new HttpException(err, HttpStatus.BAD_REQUEST);
      throw new BadRequestException(err.message);
    }
    delete user.password;
    const payload = {
      sub: user.id,
      email: user.email,
    };
    let token: AccessToken;
    try {
      token = await this.signToken(payload);
    } catch (err) {
      //   throw new HttpException(err, HttpStatus.EXPECTATION_FAILED);
      throw new BadRequestException(err.message);
    }

    // const wstoken = await this.signTokenWs(payload);
    return {
      user,
      token,
      // wstoken,
    };
  }

  async signin(dto: SignInDto) {
    let user: RegisteredUser;
    //Check if user exists
    try {
      user = await this.userRepository.findOneByOrFail({
        email: dto.email,
      });
    } catch (err) {
      console.log(err.message);
      //   throw new HttpException(err, HttpStatus.NOT_FOUND);
      throw new NotFoundException(err.message);
    }

    // Check if password is correct
    const isRightPassword = await bcrypt.compare(dto.password, user.password);
    if (!isRightPassword) {
      throw new HttpException('Incorrect Password', HttpStatus.FORBIDDEN);
    }
    delete user.password;

    const payload = {
      sub: user.id,
      email: user.email,
    };
    const token = await this.signToken(payload);

    // const wstoken = await this.signTokenWs(payload);
    return {
      user,
      token,
      // wstoken,
    };
  }

  async signToken(payload: PayloadDto): Promise<AccessToken> {
    const token = await this.jwtService.signAsync(payload, {
      expiresIn: this.configService.get('TOKEN_EXPIRES_IN'),
      secret: this.configService.get('JWT_SECRET'),
    });
    return {
      access_token: token,
    };
  }

  async signTokenWs(payload: PayloadDto): Promise<AccessToken> {
    let token: string;
    try {
      token = await this.jwtService.signAsync(payload, {
        expiresIn: this.configService.get('TOKEN_EXPIRES_IN'),
        secret: this.configService.get('JWT_SECRET_WS'),
      });
    } catch (err) {
      throw new WsException(' ERROR ---  in WS sign token --');
    }
    return {
      access_token: token,
    };
  }
}
