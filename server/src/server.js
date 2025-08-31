require('dotenv').config();
const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const { Server } = require('socket.io');
const socketHandler = require('./socket');

const PORT = process.env.PORT || 5000;

(async () => {
  await connectDB(process.env.MONGO_URI);

  const server = http.createServer(app);
  const io = new Server(server, {
    cors: { origin: process.env.CLIENT_URL }
  });

  app.set('io', io);
  socketHandler(io);

  server.listen(PORT, () => console.log(`Server running on ${PORT}`));
})();
