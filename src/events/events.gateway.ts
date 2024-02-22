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
import { UsersService } from 'src/users/users.service';
import { MessageService } from 'src/message/message.service';
import { SignUpDto } from 'src/auth/dto';

@WebSocketGateway({
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
    private userService: UsersService,
    private messageService: MessageService,
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

  @SubscribeMessage('new-user-joined')
  async handleNewAndExistingUserJoined(client: any, data: any) {
    const createUserDto = new SignUpDto();
    createUserDto.email = data.email;
    createUserDto.username = data.username;
    createUserDto.password = data.password;
    createUserDto.socketId = client.id;
    console.log(' Inside new-user-joined !! ', createUserDto);
    const registrationStatus =
      await this.userService.registerOrLoginUser(createUserDto);
    console.log(' registrationStatus ', registrationStatus);
    client.emit('registration-response', { success: registrationStatus });
  }

  @SubscribeMessage('send')
  async handleSend(
    @ConnectedSocket() client: Socket,
    @MessageBody() messageBody: any,
    @Req() req: Request,
  ) {
    console.log(' Req user ', req.user['email'], ' json ', messageBody);
    console.log(JSON.parse(JSON.stringify(messageBody)));
    const { receiverName, senderName, message } = messageBody;
    console.log(
      'Inside handle send ',
      receiverName,
      ' ',
      senderName,
      ' ',
      message,
    );
    const socketId =
      await this.userService.findSocketIdByUsername(receiverName);
    const senderUserId = await this.userService.findUserIdByUserName(
      senderName,
      // req.user['email'],
    );
    const receiverUserId = await this.userService.findUserIdByUserName(
      receiverName,
      // req.user['email'],
    );
    const messageDto = new MessageDto();
    messageDto.sender_user_id = senderUserId;
    messageDto.receiver_user_id = receiverUserId;
    messageDto.msg = message;
    console.log(' handle send --- ', messageDto);
    await this.messageService.addChatHistory(messageDto);
    this.server
      .to(socketId)
      .emit('receive', { receiverName, senderName, message });
  }
}
