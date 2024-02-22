import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegisteredUser } from 'src/auth/entity/registered.user.entity';
import { MessageStructure } from 'src/users/entity/message.entity';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from 'src/auth/auth.service';
import { JwtStrategy } from 'src/auth/strategy';
import { PassportModule } from '@nestjs/passport';
import { WsJwtGuard } from './auth.guard';
import { UsersModule } from 'src/users/users.module';
import { MessageModule } from 'src/message/message.module';
import { MessageService } from 'src/message/message.service';

@Module({
  providers: [
    EventsGateway,
    AuthService,
    JwtStrategy,
    WsJwtGuard,
    MessageService,
  ],
  imports: [
    AuthModule,
    UsersModule,
    MessageModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({ secretOrPrivateKey: process.env.JWT_SECRET }),
    TypeOrmModule.forFeature([RegisteredUser, MessageStructure]),
  ],
  exports: [],
  controllers: [],
})
export class EventsModule {}
