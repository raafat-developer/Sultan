import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || 'http://localhost:4000';

class SocketService {
  private socket: Socket | null = null;

  connect() {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 2000,
      });

      this.socket.on('connect', () => {
        console.log('Connected to FAST MAN real-time gateway');
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from real-time gateway');
      });
    }
    return this.socket;
  }

  joinCourier(courierId: string) {
    if (this.socket) {
      this.socket.emit('join:courier', { courierId });
    }
  }

  joinDispatchers() {
    if (this.socket) {
      this.socket.emit('join:dispatchers');
    }
  }

  joinOrder(orderId: string) {
    if (this.socket) {
      this.socket.emit('join:order', { orderId });
    }
  }

  on(event: string, callback: (...args: any[]) => void) {
    this.socket?.on(event, callback);
  }

  off(event: string, callback?: (...args: any[]) => void) {
    this.socket?.off(event, callback);
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const socketService = new SocketService();
