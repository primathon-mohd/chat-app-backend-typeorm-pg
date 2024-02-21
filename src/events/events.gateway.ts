import { OnModuleInit, Req, UseGuards } from '@nestjs/common';
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
import { MessageSendDto } from './dto';

@WebSocketGateway(3001, {
  cors: {
    // origin: ['http://localhost:5500', 'http://localhost:8080'],
    origin: '*',
    // methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD'],
    // preflightContinue: false,
    // optionsSuccessStatus: 204,
    // credentials: true,
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
  async handleEvent(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: any,
    @Req() req: Request,
  ) {
    const socketId = socket.id;
    console.log('inside handle events EVENTS ', data);
    console.log(' Req user ', req.user['email'], 'socket id ', socketId);
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

  @SubscribeMessage('send')
  handleSendMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() body: MessageSendDto,
    // @Req() req: Request,
  ) {
    // const senderId = socket.id;
    //Using object destructuring .
    // console.log('req info ', req.user['email']);
    const { senderName, receiverName, msg } = body;
    console.log(
      'senderName ',
      senderName,
      ' receiverName ',
      receiverName,
      ' msg ',
      msg,
    );
    const senderId = socket.id;
    // either provided some receiverId here , or if stored into database , fetch it and then use it . here.
    const receiverId = 'Unknown';
    console.log(' senderId ', senderId, ' receiver Id ', receiverId);
    // For now , sending to the same senderId
    this.server.to(senderId).emit('receive', {
      status: 'msg received',
      content: msg,
    });
  }
}
