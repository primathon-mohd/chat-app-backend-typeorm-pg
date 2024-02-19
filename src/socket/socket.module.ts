import { Module } from '@nestjs/common';
import { SocketClient } from './socket.client';
import { AuthModule } from 'src/auth/auth.module';
import { RegisteredUser } from 'src/auth/entity/registered.user.entity';
import { MessageStructure } from 'src/users/entity/message.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    AuthModule,
    // UsersModule,
    TypeOrmModule.forFeature([RegisteredUser, MessageStructure]),
  ],
  providers: [SocketClient],
  controllers: [],
  exports: [],
})
export class SocketModule {}
