import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegisteredUser } from './entity/registered.user.entity';

@Module({
  controllers: [AuthController],
  providers: [AuthService, ConfigService],
  imports: [
    ConfigModule,
    JwtModule.register({}),
    TypeOrmModule.forFeature([RegisteredUser]),
  ],
  exports: [AuthService],
})
export class AuthModule {}
