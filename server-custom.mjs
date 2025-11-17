// Custom server that combines Next.js and WebSocket server for Railway
// This runs both services on the same port (Railway requirement)

import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server } from 'socket.io';
import cors from 'cors';
import express from 'express';

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = parseInt(process.env.PORT || '8080', 10);

// Create Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  // Create Express server
  const expressApp = express();
  const server = createServer(expressApp);

  // Get allowed origins from environment
  const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ["http://localhost:4000", "http://localhost:4001", "http://localhost:3000", "http://localhost:3003"];

  // Add CORS middleware
  expressApp.use(cors({
    origin: allowedOrigins,
    credentials: true
  }));
  expressApp.use(express.json());

  // API Routes
  expressApp.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
  });

  // Create Socket.IO server (WebSocket)
  const io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"],
      credentials: true
    },
    transports: ['websocket', 'polling']
  });

  // Store data (same as server/index.ts)
  const conversationMessages = new Map();
  const registeredUsers = new Map();
  const userContacts = new Map();
  const activeUsers = new Map();
  const roomUserData = new Map();

  io.on('connection', (socket) => {

    const socketActiveUsers = new Map();
    const socketRoomUserData = new Map();

    // Join a conversation
    socket.on('join_conversation', (data) => {
      const conversationId = typeof data === 'string' ? data : data.conversationId;
      const userId = typeof data === 'object' ? data.userId : undefined;
      const userName = typeof data === 'object' ? data.userName : undefined;
      const userAvatar = typeof data === 'object' ? data.userAvatar : undefined;
      const userFrame = typeof data === 'object' ? data.userFrame : undefined;
      const userNameEffect = typeof data === 'object' ? data.userNameEffect : undefined;
      const userStatus = typeof data === 'object' ? data.userStatus : 'online';
      const isPremiumSubscriber = typeof data === 'object' ? data.isPremiumSubscriber : false;
      
      socket.join(conversationId);
      
      if (userId && userName) {
        if (!socketRoomUserData.has(conversationId)) {
          socketRoomUserData.set(conversationId, new Map());
        }
        const userDataMap = socketRoomUserData.get(conversationId);
        userDataMap.set(userId, {
          userId,
          userName,
          userAvatar: userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
          userFrame: userFrame || null,
          userNameEffect: userNameEffect || null,
          userStatus: userStatus || 'online',
          isPremiumSubscriber: isPremiumSubscriber || false,
          socketId: socket.id,
          joinedAt: new Date()
        });
        
        socketActiveUsers.set(socket.id, { userId, userName, socketId: socket.id, joinedAt: new Date() });
        
        io.to(conversationId).emit('user_joined', { 
          userId, 
          userName,
          userAvatar: userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
          userFrame: userFrame || null,
          userNameEffect: userNameEffect || null,
          userStatus: userStatus || 'online',
          isPremiumSubscriber: isPremiumSubscriber || false,
          timestamp: new Date() 
        });
        
        const usersInRoom = Array.from(io.sockets.adapter.rooms.get(conversationId) || [])
          .map(socketId => {
            const userInfo = socketActiveUsers.get(socketId);
            if (!userInfo) return null;
            const userData = userDataMap.get(userInfo.userId);
            return userData ? {
              userId: userData.userId,
              userName: userData.userName,
              userAvatar: userData.userAvatar,
              userFrame: userData.userFrame,
              userNameEffect: userData.userNameEffect,
              userStatus: userData.userStatus,
              isPremiumSubscriber: userData.isPremiumSubscriber
            } : {
              userId: userInfo.userId,
              userName: userInfo.userName,
              userAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userInfo.userId}`,
              userFrame: null,
              userNameEffect: null,
              userStatus: 'online',
              isPremiumSubscriber: false
            };
          })
          .filter((u) => u !== null);
        
        socket.emit('active_users', usersInRoom);
        
        const messages = conversationMessages.get(conversationId) || [];
        if (messages.length > 0) {
          const recentMessages = messages.slice(-100);
          socket.emit('conversation_history', {
            conversationId,
            messages: recentMessages
          });
        }
      }
    });

    // Send and receive messages
    socket.on('send_message', (message) => {
      const messageTimestamp = message.timestamp 
        ? (typeof message.timestamp === 'string' ? new Date(message.timestamp) : message.timestamp)
        : new Date();
      
      const messageWithTimestamp = {
        ...message,
        timestamp: messageTimestamp,
        status: 'sent',
        reactions: message.reactions || [],
        replyTo: message.replyTo || null,
        senderName: message.senderName || 'Unknown',
        senderAvatar: message.senderAvatar,
        attachments: message.attachments || []
      };
      
      const conversationId = message.conversationId;
      if (!conversationMessages.has(conversationId)) {
        conversationMessages.set(conversationId, []);
      }
      const messages = conversationMessages.get(conversationId);
      const existingIndex = messages.findIndex(m => m.id === messageWithTimestamp.id);
      if (existingIndex >= 0) {
        messages[existingIndex] = messageWithTimestamp;
      } else {
        messages.push(messageWithTimestamp);
      }
      if (messages.length > 1000) {
        messages.splice(0, messages.length - 1000);
      }
      
      io.to(conversationId).emit('receive_message', messageWithTimestamp);
    });

    // Handle message reactions
    socket.on('react_to_message', (data) => {
      io.to(data.conversationId).emit('message_reaction', {
        messageId: data.messageId,
        emoji: data.emoji,
        userId: data.userId,
        userName: data.userName,
        action: 'add',
        timestamp: new Date()
      });
    });

    // Handle message edit
    socket.on('edit_message', (data) => {
      const messages = conversationMessages.get(data.conversationId);
      if (messages) {
        const messageIndex = messages.findIndex(m => m.id === data.messageId);
        if (messageIndex >= 0) {
          messages[messageIndex] = {
            ...messages[messageIndex],
            content: data.content,
            edited: true
          };
        }
      }
      io.to(data.conversationId).emit('message_edited', {
        messageId: data.messageId,
        content: data.content,
        timestamp: new Date()
      });
    });

    // Handle message delete
    socket.on('delete_message', (data) => {
      const messages = conversationMessages.get(data.conversationId);
      if (messages) {
        const messageIndex = messages.findIndex(m => m.id === data.messageId);
        if (messageIndex >= 0) {
          messages.splice(messageIndex, 1);
        }
      }
      io.to(data.conversationId).emit('message_deleted', {
        messageId: data.messageId,
        timestamp: new Date()
      });
    });

    // Update user frame
    socket.on('update_user_frame', (data) => {
      if (socketRoomUserData.has(data.conversationId)) {
        const userDataMap = socketRoomUserData.get(data.conversationId);
        const userData = userDataMap.get(data.userId);
        if (userData) {
          userData.userFrame = data.frameConfig;
          userDataMap.set(data.userId, userData);
        }
      }
      io.to(data.conversationId).emit('user_frame_updated', {
        userId: data.userId,
        userName: data.userName,
        frameConfig: data.frameConfig,
        timestamp: new Date()
      });
    });

    // Update user name effect
    socket.on('update_user_name_effect', (data) => {
      if (socketRoomUserData.has(data.conversationId)) {
        const userDataMap = socketRoomUserData.get(data.conversationId);
        const userData = userDataMap.get(data.userId);
        if (userData) {
          userData.userNameEffect = data.nameEffect;
          userDataMap.set(data.userId, userData);
        }
      }
      io.to(data.conversationId).emit('user_name_effect_updated', {
        userId: data.userId,
        userName: data.userName,
        nameEffect: data.nameEffect,
        timestamp: new Date()
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      const userInfo = socketActiveUsers.get(socket.id);
      if (userInfo) {
        socket.rooms.forEach(room => {
          socket.to(room).emit('user_left', {
            userId: userInfo.userId,
            timestamp: new Date()
          });
        });
        socketActiveUsers.delete(socket.id);
      }
    });
  });

  // Handle Next.js requests (must be last)
  expressApp.all('*', (req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  server.listen(port, hostname, () => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`> Ready on http://${hostname}:${port}`);
    }
  });
});

