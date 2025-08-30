import { MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: { origin: '*' }
})
export class NotificationsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;


  afterInit(server: Server) {
  }

  handleConnection(client: Socket) {
  }

  handleDisconnect(client: Socket) {
  }

  @SubscribeMessage('createNotification')
  handleNotification(@MessageBody() message: string) {
    this.server.emit('newNotification', `Server got: ${message}`);
    return { status: 'ok' };
  }
}