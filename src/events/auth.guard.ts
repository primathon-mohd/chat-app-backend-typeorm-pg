import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { RegisteredUser } from 'src/auth/entity/registered.user.entity';

@Injectable()
export class WsJwtGuard implements CanActivate {
  private logger: Logger = new Logger(WsJwtGuard.name);

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client: Socket = context.switchToWs().getClient<Socket>();
      const authToken: string = client.handshake.headers.authorization;
      console.log(authToken, 'Inside canActivate!!! ');
      const user: RegisteredUser = await this.jwtService.verifyAsync(
        authToken.split(' ')[1],
        {
          secret: this.configService.get('JWT_SECRET'),
          ignoreExpiration: true,
        },
      );
      //   client.join(`house_${user?.house?.id}`);
      console.log(user, '--found ---', Boolean(user));
      context.switchToHttp().getRequest().user = user;

      return Boolean(user);
    } catch (err) {
      throw new WsException(err.message);
    }
  }
}
