import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { io, Socket } from 'socket.io-client';
import { WebSocketServer } from '@nestjs/websockets';
// import { Socket } from 'socket.io';

@Injectable()
export class SocketClient implements OnModuleInit, OnModuleDestroy {
  @WebSocketServer()
  socket: Socket;

  constructor() {
    this.socket = io('http://localhost:3001', {
      auth: {
        token:
          'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjExLCJlbWFpbCI6ImFyanVuQGdtYWlsLmNvbSIsImlhdCI6MTcwODMyOTU3NSwiZXhwIjoxNzA4NDE1OTc1fQ.Ruv9-FHDqOH7UNX2NvuXqVBwh44NId3zN6ZNc9zo9LU',
      },
    });
  }

  onModuleInit() {
    this.socket.on('connect', () => {
      console.log('Connected !! -- client  -');
    });
    this.socket.on('connection', (socket) => {
      socket.broadcast.emit('connected --- ', socket.id);
    });
    this.registerConsumerEvents();
  }

  onModuleDestroy() {
    this.socket.on('destroy', () => {
      console.log('-disconnected !!! -- client --');
    });
  }

  private registerConsumerEvents() {
    this.socket.emit('events', { msg: 'Hi buddy !! ' });
    this.socket.on('onMessage', (payload: any) => {
      console.log('Client received !! ', payload);
    });
  }
}
