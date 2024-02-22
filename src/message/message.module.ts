import { Module } from '@nestjs/common';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { UsersModule } from 'src/users/users.module';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegisteredUser } from 'src/auth/entity/registered.user.entity';
import { MessageStructure } from 'src/users/entity/message.entity';

@Module({
  controllers: [MessageController],
  providers: [MessageService],
  imports: [
    UsersModule,
    AuthModule,
    TypeOrmModule.forFeature([RegisteredUser, MessageStructure]),
  ],
})
export class MessageModule {}
