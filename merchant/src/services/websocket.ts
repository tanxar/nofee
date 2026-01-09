import { io, Socket } from 'socket.io-client';

// For physical devices/emulators, use your computer's IP address instead of localhost
// Find your IP: ifconfig | grep "inet " | grep -v 127.0.0.1
const SOCKET_URL = __DEV__
  ? 'http://192.168.2.6:3000' // Development - use IP for physical devices/emulators
  : 'https://api.nofee.gr'; // Production

class WebSocketService {
  private socket: Socket | null = null;
  private storeId: string | null = null;

  connect(storeId: string) {
    if (this.socket?.connected && this.storeId === storeId) {
      return; // Already connected to this store
    }

    // Disconnect if already connected to different store
    if (this.socket) {
      this.disconnect();
    }

    this.storeId = storeId;
    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('🔌 WebSocket connected');
      // Join store room
      this.socket?.emit('join-store', storeId);
    });

    this.socket.on('disconnect', () => {
      console.log('🔌 WebSocket disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔌 WebSocket connection error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      if (this.storeId) {
        this.socket.emit('leave-store', this.storeId);
      }
      this.socket.disconnect();
      this.socket = null;
      this.storeId = null;
      console.log('🔌 WebSocket disconnected');
    }
  }

  on(event: string, callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event: string, callback?: (data: any) => void) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const websocketService = new WebSocketService();

