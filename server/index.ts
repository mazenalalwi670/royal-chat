import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Use CommonJS approach for __dirname and __filename
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Type declaration for process.env
declare const process: {
  env: {
    PORT?: string;
    [key: string]: string | undefined;
  };
};

const app = express();
const server = http.createServer(app);
// Get allowed origins from environment or use defaults
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ["http://localhost:4000", "http://localhost:4001", "http://localhost:3000", "http://localhost:3003"];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../dist')));

// Store all registered users (in-memory, in production use database)
const registeredUsers = new Map<string, {
  id: string;
  phoneNumber: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline' | 'away';
  lastSeen?: Date;
  socketId?: string;
  createdAt: Date;
}>();

// Store user contacts (in-memory, in production use database)
const userContacts = new Map<string, Set<string>>(); // userId -> Set of contactIds

// Store messages for each conversation (in-memory, in production use database)
const conversationMessages = new Map<string, Array<{
  id: string;
  conversationId: string;
  senderId: string;
  senderName?: string;
  senderAvatar?: string;
  content: string;
  timestamp: Date;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  replyTo?: string | null;
  reactions?: Array<{ emoji: string; userIds: string[]; userNames?: string[] }>;
  edited?: boolean;
  attachments?: Array<{
    id: string;
    type: string;
    url: string;
    name?: string;
    size?: number;
    data?: any;
  }>;
}>>(); // conversationId -> Array of messages

// WebSocket Connection
io.on('connection', (socket) => {
  console.log('A user connected');

  // Store active users
  const activeUsers = new Map<string, { userId: string; userName: string; socketId: string; joinedAt: Date }>();

  // Store user data in room
  const roomUserData = new Map<string, Map<string, any>>(); // conversationId -> userId -> userData

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
      // Store user data for this room
      if (!roomUserData.has(conversationId)) {
        roomUserData.set(conversationId, new Map());
      }
      const userDataMap = roomUserData.get(conversationId)!;
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
      
      activeUsers.set(socket.id, { userId, userName, socketId: socket.id, joinedAt: new Date() });
      
      // Notify others that user joined with complete info (real-time)
      socket.to(conversationId).emit('user_joined', { 
        userId, 
        userName,
        userAvatar: userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
        userFrame: userFrame || null,
        userNameEffect: userNameEffect || null,
        userStatus: userStatus || 'online',
        isPremiumSubscriber: isPremiumSubscriber || false,
        timestamp: new Date() 
      });
      
             // Send current active users to the new user with complete info
             const usersInRoom = Array.from(io.sockets.adapter.rooms.get(conversationId) || [])
               .map(socketId => {
                 const userInfo = activeUsers.get(socketId);
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
               .filter((u): u is any => u !== null);
             
             socket.emit('active_users', usersInRoom);
             
             // Send conversation message history to the new user (real-time sync)
             const messages = conversationMessages.get(conversationId) || [];
             if (messages.length > 0) {
               // Send last 100 messages to the new user
               const recentMessages = messages.slice(-100);
               socket.emit('conversation_history', {
                 conversationId,
                 messages: recentMessages
               });
               console.log(`📨 Sent ${recentMessages.length} messages from conversation ${conversationId} to user ${userName}`);
             }
           }
    
    console.log(`User ${userName || userId || 'unknown'} joined conversation: ${conversationId} with avatar: ${userAvatar || 'default'}`);
  });

  // Send and receive messages - Real-time messaging
  socket.on('send_message', (message) => {
    // Use the timestamp from the message (actual time when sent), or current time if not provided
    const messageTimestamp = message.timestamp 
      ? (typeof message.timestamp === 'string' ? new Date(message.timestamp) : message.timestamp)
      : new Date();
    
    // Update timestamp and ensure all required fields
    const messageWithTimestamp = {
      ...message,
      timestamp: messageTimestamp, // Use actual timestamp from message
      status: 'sent' as const, // Update status from 'sending' to 'sent'
      // Ensure reactions array exists
      reactions: message.reactions || [],
      // Ensure replyTo is null if not provided
      replyTo: message.replyTo || null,
      // Include sender info for display
      senderName: message.senderName || 'Unknown',
      senderAvatar: message.senderAvatar,
      // Ensure attachments are included
      attachments: message.attachments || []
    };
    
    // Store the message in conversation history
    const conversationId = message.conversationId;
    if (!conversationMessages.has(conversationId)) {
      conversationMessages.set(conversationId, []);
    }
    const messages = conversationMessages.get(conversationId)!;
    // Check if message already exists (avoid duplicates)
    const existingIndex = messages.findIndex(m => m.id === messageWithTimestamp.id);
    if (existingIndex >= 0) {
      // Update existing message
      messages[existingIndex] = messageWithTimestamp;
    } else {
      // Add new message
      messages.push(messageWithTimestamp);
    }
    // Keep only last 1000 messages per conversation (to prevent memory issues)
    if (messages.length > 1000) {
      messages.splice(0, messages.length - 1000);
    }
    
    // Broadcast the message to everyone in the conversation room (including sender)
    // This ensures all users see the message in real-time with updated status
    io.to(conversationId).emit('receive_message', messageWithTimestamp);
    
    console.log(`✅ Message sent in conversation ${conversationId} by user ${message.senderId || message.senderName}: "${message.content.substring(0, 50)}..."`);
    console.log(`   Broadcasting to all users in room: ${conversationId}`);
    console.log(`   Total messages in conversation: ${messages.length}`);
  });

  // Handle typing indicator
  socket.on('typing', (data) => {
    socket.broadcast.to(data.conversationId).emit('user_typing', {
      userId: data.userId,
      isTyping: data.isTyping
    });
  });

  // Handle message reactions
  socket.on('react_to_message', (data) => {
    const { messageId, emoji, userId, userName, conversationId } = data;
    
    // Broadcast reaction to everyone in the conversation
    io.to(conversationId).emit('reaction_received', {
      messageId,
      emoji,
      userId,
      userName,
      timestamp: new Date()
    });
    
    console.log(`User ${userName} (${userId}) reacted ${emoji} to message ${messageId} in conversation ${conversationId}`);
  });

  // Handle message edit
  socket.on('edit_message', (data) => {
    const { messageId, content, conversationId } = data;
    
    // Update message in conversation history
    const messages = conversationMessages.get(conversationId);
    if (messages) {
      const messageIndex = messages.findIndex(m => m.id === messageId);
      if (messageIndex >= 0) {
        messages[messageIndex] = {
          ...messages[messageIndex],
          content,
          edited: true
        };
      }
    }
    
    // Broadcast edited message to everyone in the conversation
    io.to(conversationId).emit('message_edited', {
      messageId,
      content,
      timestamp: new Date()
    });
    
    console.log(`Message ${messageId} edited in conversation ${conversationId}`);
  });

  // Handle message delete
  socket.on('delete_message', (data) => {
    const { messageId, conversationId } = data;
    
    // Remove message from conversation history
    const messages = conversationMessages.get(conversationId);
    if (messages) {
      const messageIndex = messages.findIndex(m => m.id === messageId);
      if (messageIndex >= 0) {
        messages.splice(messageIndex, 1);
      }
    }
    
    // Broadcast message deletion to everyone in the conversation
    io.to(conversationId).emit('message_deleted', {
      messageId,
      timestamp: new Date()
    });
    
    console.log(`Message ${messageId} deleted in conversation ${conversationId}`);
  });

  // Handle user leaving conversation
  socket.on('leave_conversation', (conversationId) => {
    socket.leave(conversationId);
    const userInfo = activeUsers.get(socket.id);
    if (userInfo) {
      socket.to(conversationId).emit('user_left', { 
        userId: userInfo.userId, 
        timestamp: new Date() 
      });
      activeUsers.delete(socket.id);
    }
    console.log(`User left conversation: ${conversationId}`);
  });

  // Handle typing indicator
  socket.on('typing', (data) => {
    socket.broadcast.to(data.conversationId).emit('user_typing', {
      userId: data.userId,
      userName: data.userName,
      isTyping: data.isTyping,
      timestamp: new Date()
    });
  });

  // Handle speaking (voice chat)
  socket.on('speaking', (data) => {
    socket.broadcast.to(data.conversationId).emit('user_speaking', {
      userId: data.userId,
      isSpeaking: data.isSpeaking,
      timestamp: new Date()
    });
  });

  // Handle voice chat join
  socket.on('join_voice_chat', (data: { userId: string; userName: string; conversationId: string }) => {
    const { userId, userName, conversationId } = data;
    socket.join(`voice_${conversationId}`);
    
    // Notify others in voice chat
    socket.to(`voice_${conversationId}`).emit('voice_chat_joined', {
      userId,
      userName,
      timestamp: new Date()
    });
    
    console.log(`User ${userName} (${userId}) joined voice chat in conversation ${conversationId}`);
  });

  // Handle voice chat leave
  socket.on('leave_voice_chat', (data: { userId: string; conversationId: string }) => {
    const { userId, conversationId } = data;
    socket.leave(`voice_${conversationId}`);
    
    // Notify others in voice chat
    socket.to(`voice_${conversationId}`).emit('voice_chat_left', {
      userId,
      timestamp: new Date()
    });
    
    console.log(`User ${userId} left voice chat in conversation ${conversationId}`);
  });

  // Handle voice audio chunks (real-time voice streaming)
  socket.on('voice_audio_chunk', (data: {
    userId: string;
    userName: string;
    conversationId: string;
    audioData: string;
    timestamp: Date;
  }) => {
    const { userId, userName, conversationId, audioData } = data;
    
    // Broadcast audio chunk to all other users in the voice chat room (except sender)
    socket.to(`voice_${conversationId}`).emit('voice_audio_chunk', {
      userId,
      userName,
      audioData,
      timestamp: new Date()
    });
    
    // Log for debugging (only first few chunks to avoid spam)
    if (Math.random() < 0.01) { // Log 1% of chunks
      console.log(`🎤 Audio chunk from ${userName} (${userId}) in conversation ${conversationId}`);
    }
  });

  // Handle points update
  socket.on('update_points', (data) => {
    // Broadcast points update (for leaderboard, etc.)
    io.to(data.conversationId).emit('points_updated', {
      userId: data.userId,
      points: data.points,
      level: data.level,
      rank: data.rank,
      timestamp: new Date()
    });
  });

  // Register user
  socket.on('register_user', (data: { userId: string; phoneNumber: string; name: string; avatar: string }) => {
    const { userId, phoneNumber, name, avatar } = data;
    
    // Update or create user
    const existingUser = registeredUsers.get(userId);
    registeredUsers.set(userId, {
      id: userId,
      phoneNumber,
      name,
      avatar,
      status: 'online',
      socketId: socket.id,
      lastSeen: new Date(),
      createdAt: existingUser?.createdAt || new Date()
    });

    // Broadcast user status update
    io.emit('user_status_update', {
      userId,
      status: 'online',
      lastSeen: new Date()
    });

    console.log(`User registered: ${name} (${phoneNumber})`);
  });

  // Search user by phone number
  socket.on('search_user', (data: { phoneNumber: string }, callback) => {
    const { phoneNumber } = data;
    
    // Find user by phone number
    const foundUser = Array.from(registeredUsers.values()).find(
      u => u.phoneNumber === phoneNumber
    );

    if (foundUser) {
      callback({
        user: {
          id: foundUser.id,
          phoneNumber: foundUser.phoneNumber,
          name: foundUser.name,
          avatar: foundUser.avatar,
          status: foundUser.status,
          lastSeen: foundUser.lastSeen,
          isContact: false
        }
      });
    } else {
      callback({ user: null });
    }
  });

  // Get all registered users
  socket.on('get_all_users', () => {
    const allUsers = Array.from(registeredUsers.values()).map(u => ({
      id: u.id,
      phoneNumber: u.phoneNumber,
      name: u.name,
      avatar: u.avatar,
      status: u.status,
      lastSeen: u.lastSeen,
      isContact: false
    }));
    
    socket.emit('all_users', allUsers);
  });

  // Add contact
  socket.on('add_contact', (data: { userId: string; contactId: string }) => {
    const { userId, contactId } = data;
    
    if (!userContacts.has(userId)) {
      userContacts.set(userId, new Set());
    }
    userContacts.get(userId)!.add(contactId);
    
    console.log(`User ${userId} added contact ${contactId}`);
  });

  // Remove contact
  socket.on('remove_contact', (data: { userId: string; contactId: string }) => {
    const { userId, contactId } = data;
    
    if (userContacts.has(userId)) {
      userContacts.get(userId)!.delete(contactId);
    }
    
    console.log(`User ${userId} removed contact ${contactId}`);
  });

  // Send invitation to contact
  socket.on('send_invitation', (data: { 
    fromUserId: string; 
    fromUserName: string; 
    fromUserPhone: string;
    toPhoneNumber: string;
    toName: string;
    timestamp: Date;
  }) => {
    const { fromUserId, fromUserName, fromUserPhone, toPhoneNumber, toName } = data;
    
    // Check if the invited user is registered
    const invitedUser = Array.from(registeredUsers.values()).find(
      u => u.phoneNumber === toPhoneNumber || u.phoneNumber.replace(/[\s\-\(\)]/g, '') === toPhoneNumber.replace(/[\s\-\(\)]/g, '')
    );
    
    if (invitedUser) {
      // User is already registered - notify them about the invitation
      if (invitedUser.socketId) {
        io.to(invitedUser.socketId).emit('invitation_received', {
          fromUserId,
          fromUserName,
          fromUserPhone,
          toPhoneNumber,
          toName,
          timestamp: new Date()
        });
      }
      console.log(`Invitation sent to registered user ${toName} (${toPhoneNumber}) from ${fromUserName}`);
    } else {
      // User is not registered - store invitation for when they register
      // In production, you would store this in a database
      console.log(`Invitation sent to unregistered user ${toName} (${toPhoneNumber}) from ${fromUserName}`);
      console.log(`   User will receive invitation when they register with this phone number`);
    }
    
    // Broadcast invitation event (for logging/analytics)
    io.emit('invitation_sent', {
      fromUserId,
      fromUserName,
      fromUserPhone,
      toPhoneNumber,
      toName,
      timestamp: new Date()
    });
  });

  // Update user profile (name, avatar)
  socket.on('update_user_profile', (data: { userId: string; name?: string; avatar?: string }) => {
    const { userId, name, avatar } = data;
    const user = registeredUsers.get(userId);
    
    if (user) {
      if (name) user.name = name;
      if (avatar) user.avatar = avatar;
      registeredUsers.set(userId, user);
      
      // Broadcast profile update to all users
      io.emit('user_profile_update', {
        userId,
        name,
        avatar
      });
      
      console.log(`User ${userId} updated profile: name=${name}, avatar=${avatar}`);
    }
  });

  // Update user frame (for premium chat)
  socket.on('update_user_frame', (data: { userId: string; userName: string; frameConfig: any; conversationId: string }) => {
    const { userId, userName, frameConfig, conversationId } = data;
    
    // Update stored user data in room
    if (roomUserData.has(conversationId)) {
      const userDataMap = roomUserData.get(conversationId)!;
      const userData = userDataMap.get(userId);
      if (userData) {
        userData.userFrame = frameConfig;
        userDataMap.set(userId, userData);
      }
    }
    
    // Broadcast frame update to all users in the conversation (real-time)
    io.to(conversationId).emit('user_frame_updated', {
      userId,
      userName,
      frameConfig,
      timestamp: new Date()
    });
    
    console.log(`User ${userName} (${userId}) updated frame in conversation ${conversationId}`);
  });

  // Update user name effect (for premium chat)
  socket.on('update_user_name_effect', (data: { userId: string; userName: string; nameEffect: any; conversationId: string }) => {
    const { userId, userName, nameEffect, conversationId } = data;
    
    // Update stored user data in room
    if (roomUserData.has(conversationId)) {
      const userDataMap = roomUserData.get(conversationId)!;
      const userData = userDataMap.get(userId);
      if (userData) {
        userData.userNameEffect = nameEffect;
        userDataMap.set(userId, userData);
      }
    }
    
    // Broadcast name effect update to all users in the conversation (real-time)
    io.to(conversationId).emit('user_name_effect_updated', {
      userId,
      userName,
      nameEffect,
      timestamp: new Date()
    });
    
    console.log(`User ${userName} (${userId}) updated name effect in conversation ${conversationId}`);
  });

  // Handle user leaving conversation
  socket.on('leave_conversation', (conversationId) => {
    socket.leave(conversationId);
    const userInfo = activeUsers.get(socket.id);
    
    // Remove user data from room
    if (roomUserData.has(conversationId)) {
      if (userInfo) {
        roomUserData.get(conversationId)!.delete(userInfo.userId);
      }
    }
    
    if (userInfo) {
      socket.to(conversationId).emit('user_left', { 
        userId: userInfo.userId, 
        timestamp: new Date() 
      });
    }
    console.log(`User left conversation: ${conversationId}`);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    const userInfo = activeUsers.get(socket.id);
    
    // Update user status to offline
    const user = Array.from(registeredUsers.values()).find(u => u.socketId === socket.id);
    if (user) {
      user.status = 'offline';
      user.lastSeen = new Date();
      user.socketId = undefined;
      registeredUsers.set(user.id, user);
      
      // Broadcast status update
      io.emit('user_status_update', {
        userId: user.id,
        status: 'offline',
        lastSeen: user.lastSeen
      });
    }
    
    if (userInfo) {
      // Notify all rooms that user left and clean up room data
      socket.rooms.forEach(room => {
        socket.to(room).emit('user_left', {
          userId: userInfo.userId,
          timestamp: new Date()
        });
        
        // Clean up room user data
        if (roomUserData.has(room)) {
          roomUserData.get(room)!.delete(userInfo.userId);
        }
      });
      activeUsers.delete(socket.id);
    }
    console.log('User disconnected');
  });
});

const PORT = (process.env.PORT ? parseInt(process.env.PORT, 10) : undefined) || 4002;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
