import { createServer } from 'node:http';
import { createApp } from './app.js';
import { registerRealtimeServer } from './realtime/wsServer.js';
import { config } from './config.js';

const app = createApp();
const server = createServer(app);

registerRealtimeServer(server);

server.listen(config.port, () => {
  console.log(`vvoice backend listening on http://localhost:${config.port}`);
  console.log(`WebSocket target: ws://localhost:${config.port}/ws`);
});
