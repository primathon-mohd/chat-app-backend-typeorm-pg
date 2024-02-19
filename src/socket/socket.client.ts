import { Injectable, OnModuleInit } from '@nestjs/common';
import { io, Socket } from 'socket.io-client';
import { WebSocketServer } from '@nestjs/websockets';
// import { Socket } from 'socket.io';

@Injectable()
export class SocketClient implements OnModuleInit {
  @WebSocketServer()
  socket: Socket;

  constructor() {
    this.socket = io('http://localhost:3001');
  }

  onModuleInit() {
    this.socket.on('connect', () => {
      console.log('Connected !! -- client  -');
    });
    this.registerConsumerEvents();
  }

  private registerConsumerEvents() {
    this.socket.emit('events', { msg: 'Hi buddy !! ' });
    this.socket.on('onMessage', (payload: any) => {
      console.log('Client received !! ', payload);
    });
  }
}
