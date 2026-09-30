import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(EventsGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected to WebSocket: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join:dispatchers')
  handleJoinDispatchers(@ConnectedSocket() client: Socket) {
    client.join('dispatchers');
    return { event: 'joined', room: 'dispatchers' };
  }

  @SubscribeMessage('join:courier')
  handleJoinCourier(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { courierId: string },
  ) {
    if (data?.courierId) {
      client.join(`courier_${data.courierId}`);
      return { event: 'joined', room: `courier_${data.courierId}` };
    }
  }

  @SubscribeMessage('join:order')
  handleJoinOrder(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { orderId: string },
  ) {
    if (data?.orderId) {
      client.join(`order_${data.orderId}`);
      return { event: 'joined', room: `order_${data.orderId}` };
    }
  }

  // Emitters for business events
  emitOrderCreated(order: any) {
    this.server.to('dispatchers').emit('order.created', order);
  }

  emitOrderAssigned(orderId: string, courierId: string, payload: any) {
    this.server.to(`courier_${courierId}`).emit('order.assigned', payload);
    this.server.to('dispatchers').emit('order.assigned', payload);
    this.server.to(`order_${orderId}`).emit('order.assigned', payload);
  }

  emitOrderAccepted(orderId: string, payload: any) {
    this.server.to('dispatchers').emit('order.accepted', payload);
    this.server.to(`order_${orderId}`).emit('order.accepted', payload);
  }

  emitOrderStatusChanged(orderId: string, payload: any) {
    this.server.to('dispatchers').emit('order.status_changed', payload);
    this.server.to(`order_${orderId}`).emit('order.status_changed', payload);
    if (payload.courierId) {
      this.server.to(`courier_${payload.courierId}`).emit('order.status_changed', payload);
    }
  }

  emitOrderCancelled(orderId: string, payload: any) {
    this.server.to('dispatchers').emit('order.cancelled', payload);
    this.server.to(`order_${orderId}`).emit('order.cancelled', payload);
    if (payload.courierId) {
      this.server.to(`courier_${payload.courierId}`).emit('order.cancelled', payload);
    }
  }

  emitCourierStatus(courierId: string, status: string, payload: any) {
    const eventName = status === 'AVAILABLE' ? 'courier.online' : status === 'OFFLINE' ? 'courier.offline' : 'courier.status_changed';
    this.server.to('dispatchers').emit(eventName, { courierId, status, ...payload });
  }

  emitCourierLocation(courierId: string, location: any) {
    this.server.to('dispatchers').emit('courier.location_updated', { courierId, ...location });
    if (location.orderId) {
      this.server.to(`order_${location.orderId}`).emit('courier.location_updated', { courierId, ...location });
    }
  }

  emitNotification(userId: string, notification: any) {
    this.server.emit(`notification:${userId}`, notification);
  }
}
