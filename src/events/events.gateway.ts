import { Injectable, OnModuleInit, Req, UseGuards } from '@nestjs/common';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  MessageBody,
  ConnectedSocket,
  WsResponse,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WsJwtGuard } from './auth.guard';
import { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { RegisteredUser } from 'src/auth/entity/registered.user.entity';
import { MessageStructure } from 'src/users/entity/message.entity';
import { MessageDto } from 'src/users/dto';
import { Repository } from 'typeorm';

@WebSocketGateway(3001, {
  cors: {
    origin: '*',
  },
  // transports: ['websocket'],
  // namespace: 'events',
})
@UseGuards(WsJwtGuard)
export class EventsGateway implements OnModuleInit {
  constructor(
    @InjectRepository(RegisteredUser)
    private userRepository: Repository<RegisteredUser>,
    @InjectRepository(MessageStructure)
    private msgRepository: Repository<MessageStructure>,
  ) {}

  @WebSocketServer()
  server: Server;

  onModuleInit() {
    this.server.on('connection', (socket) => {
      console.log(socket.id, 'Connected !! server--- ');
    });
  }

  // @UseGuards(JwtGuard)
  // @UseFilters(new BaseWsExceptionFilter())
  @SubscribeMessage('events')
  async handleEvent(@MessageBody() data: any, @Req() req: Request) {
    console.log('inside handle events EVENTS ', data);
    console.log(' Req user ', req.user['email']);
    this.server.emit('onMessage', {
      msg: 'new message',
      content: data,
    });
    const msgBody = new MessageDto();
    msgBody.email = req.user['email'];
    msgBody.msg = JSON.stringify(data);
    try {
      const response = await this.msgRepository.save(msgBody);
      console.log(response, '------------');
    } catch (error) {
      throw new WsException('Exception occurred, while saving data ! !! ');
    }
    // return data;
  }

  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): string {
    console.log('Inside handle message events !!');
    console.log(typeof client, payload);
    return 'Hello world!';
  }

  @SubscribeMessage('example')
  handleExample(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: unknown,
  ): WsResponse<unknown> {
    console.log('Inside example handle events');
    console.log(typeof socket, data);
    socket.handshake.headers.authorization.split(' ')[1];
    const event = 'example';
    return { event, data };
  }
}
