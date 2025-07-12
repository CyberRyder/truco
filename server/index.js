import express from 'express';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST']
    }
});

const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(express.static(join(__dirname, 'dist')));

app.get('*', (req, res) => {
    res.sendFile(join(__dirname, 'dist', 'index.html'));
});

server.listen(3001, () => {
    console.log('Server is running on port 3001');
});