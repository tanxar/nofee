import { Server as HttpServer } from 'http';
import { Server as SocketServer, Socket } from 'socket.io';

let io: SocketServer | null = null;

export const initializeSocket = (httpServer: HttpServer) => {
  io = new SocketServer(httpServer, {
    cors: {
      origin: process.env.NODE_ENV === 'production' 
        ? (process.env.CORS_ORIGIN || 'http://localhost:19006')
        : true, // Allow all origins in development
      credentials: true,
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Join room for specific store
    socket.on('join-store', (storeId: string) => {
      socket.join(`store:${storeId}`);
      console.log(`📦 Socket ${socket.id} joined store:${storeId}`);
    });

    // Leave store room
    socket.on('leave-store', (storeId: string) => {
      socket.leave(`store:${storeId}`);
      console.log(`📦 Socket ${socket.id} left store:${storeId}`);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getSocketIO = (): SocketServer => {
  if (!io) {
    throw new Error('Socket.IO not initialized. Call initializeSocket first.');
  }
  return io;
};

// Helper function to emit to specific store
export const emitToStore = (storeId: string, event: string, data: any) => {
  if (io) {
    io.to(`store:${storeId}`).emit(event, data);
    console.log(`📤 Emitted ${event} to store:${storeId}`);
  }
};

// Helper function to emit to all connected clients
export const emitToAll = (event: string, data: any) => {
  if (io) {
    io.emit(event, data);
    console.log(`📤 Emitted ${event} to all clients`);
  }
};

