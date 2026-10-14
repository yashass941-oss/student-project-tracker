import { createApp } from './app.js';
import { db } from './database.js';

const app = createApp(db);
const port = Number(process.env.PORT || 3000);

const server = app.listen(port, () => {
  console.log(`Open http://localhost:${port}`);
  console.log('Server listening:', server.listening);
});

server.on('close', () => {
  console.log('Server closed unexpectedly.');
});

server.on('error', error => {
  console.error('Server error:', error.message);
});