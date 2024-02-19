import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegisteredUser } from 'src/auth/entity/registered.user.entity';
import { AuthModule } from 'src/auth/auth.module';
// import { SocketModule } from 'src/socket/socket.module';
import { MessageStructure } from './entity/message.entity';

@Module({
  controllers: [UsersController],
  providers: [UsersService, ConfigService],
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([RegisteredUser, MessageStructure]),
    AuthModule,
    // SocketModule,
  ],
  exports: [UsersService],
})
export class UsersModule {}
