import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { EventsModule } from './events/events.module';
import { SocketModule } from './socket/socket.module';
import { MessageModule } from './message/message.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forFeature([]),
    // TypeOrmModule.forRoot({
    //   type: 'postgres',
    //   port: 5434,
    //   username: 'postgres',
    //   password: 'secret',
    //   database: 'nest-chat',
    //   host: '127.0.0.1',
    //   synchronize: true,
    //   autoLoadEntities: true,
    //   entities: [],
    // }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: +configService.get('DB_PORT'),
        username: configService.get('DB_USER'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        synchronize: true,
        autoLoadEntities: true,
        entities: [join(process.cwd(), 'dist/**/*.entity.js')],
      }),
    }),
    AuthModule,
    UsersModule,
    EventsModule,
    MessageModule,
    // SocketModule,
  ],
  controllers: [AppController],
  providers: [AppService, ConfigService],
})
export class AppModule {}
