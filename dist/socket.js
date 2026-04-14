const { getAllowedOrigins } = require('./config/corsOrigins');

let io;

module.exports = {
  init: (httpServer) => {
    const { Server } = require('socket.io');
    io = new Server(httpServer, {
      cors: {
        origin: getAllowedOrigins(),
        methods: ['GET', 'POST'],
        credentials: true,
      },
      pingInterval: 25000,
      pingTimeout: 20000,
      upgradeTimeout: 10000,
      transports: ['websocket', 'polling'],
    });

    console.log('[Socket] Initialized');

    io.on('connection', (socket) => {
      console.log('[Socket] Web client connected:', socket.id);

      socket.on('join', (userId) => {
        socket.join(userId);
        console.log(`[Socket] User ${userId} joined room`);
      });

      socket.on('disconnect', () => {
        console.log('[Socket] Web client disconnected');
      });
    });

    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error('Socket.io not initialized!');
    }
    return io;
  },
};
