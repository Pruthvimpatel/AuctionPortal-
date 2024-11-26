import * as dotenv from 'dotenv';
import express from 'express';
dotenv.config();

import {Server} from 'socket.io'
import AuctionSocket from './sockets/auction.socket';
import router from './routes/index.route';
import {REST_API_PREFIX} from './constants/routes.constants'
import apiLimiter from './middleware/rate-limit';
import http from 'http';

const app = express();
app.use(express.json());
app.use(REST_API_PREFIX.API_V1,apiLimiter)
app.use(REST_API_PREFIX.API_V1,router);
import cors from 'cors';

const server = http.createServer(app);

// app.use(cors({
//     origin: "*",
//     methods: ["GET", "POST"],
//     allowedHeaders: ["*"]
//   }))
const io = new Server(server)

console.log('io ', io);

AuctionSocket(io);
app.use((err: any, req: any,res: any, next: any) => {
    if(err.statusCode) {
        res.status(err.statusCode).json({message: err.message, code: err.code});

    } else {
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

io.on('connection', (socket) => {
    console.log('New socket connection:', socket.id);
    
    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  });

export {app,server};