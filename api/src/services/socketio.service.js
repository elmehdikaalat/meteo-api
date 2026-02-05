const { Server } = require('socket.io');

let io;

function initializeWebSocket(server) {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.data.filter = null;

    socket.on('subscribe', (params) => {
      const { measurements } = params || {};
      
      if (measurements && Array.isArray(measurements)) {
        socket.data.filter = measurements;
      }
      
      socket.join('live-data');
      socket.emit('subscribed', { 
        measurements: measurements || 'all' 
      });
      console.log(`Client ${socket.id} subscribed to:`, measurements || 'all');
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
}

function emitLiveData(data) {
  if (!io) return;

  const room = io.to('live-data');
  
  room.fetchSockets().then(sockets => {
    sockets.forEach(socket => {
      const filter = socket.data.filter;
      
      if (!filter) {
        socket.emit('live-update', data);
      } else {
        const filtered = {
          data: {
            date: data.data.date,
            location: data.data.location,
            measurements: {}
          }
        };
        
        filter.forEach(key => {
          if (data.data.measurements[key]) {
            filtered.data.measurements[key] = data.data.measurements[key];
          }
        });
        
        socket.emit('live-update', filtered);
      }
    });
  });
}

module.exports = { initializeWebSocket, emitLiveData };