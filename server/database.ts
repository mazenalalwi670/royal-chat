import mongoose from 'mongoose';

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/royal-chat';

export async function connectDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
}

// User Schema
const UserSchema = new mongoose.Schema({
  phoneNumber: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  avatar: { type: String, default: '' },
  email: { type: String, default: '' },
  status: { type: String, enum: ['online', 'offline', 'away', 'busy', 'invisible'], default: 'offline' },
  lastSeen: { type: Date, default: Date.now },
  bio: { type: String, default: '' },
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// OTP Schema
const OTPSchema = new mongoose.Schema({
  phoneNumber: { type: String, required: true, index: true },
  email: { type: String, required: true },
  code: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  verified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Conversation Schema
const ConversationSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isGroup: { type: Boolean, default: false },
  name: { type: String, default: '' },
  avatar: { type: String, default: '' },
  lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
  lastMessageTime: { type: Date },
  isPinned: { type: Boolean, default: false },
  isMuted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Message Schema
const MessageSchema = new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, default: '' },
  status: { type: String, enum: ['sending', 'sent', 'delivered', 'read'], default: 'sent' },
  replyTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
  reactions: [{
    emoji: String,
    userIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    userNames: [String]
  }],
  edited: { type: Boolean, default: false },
  attachments: [{
    id: String,
    type: String,
    url: String,
    name: String,
    size: Number,
    data: mongoose.Schema.Types.Mixed
  }],
  timestamp: { type: Date, default: Date.now, index: true }
});

// Contact Schema (for syncing contacts)
const ContactSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  phoneNumber: { type: String, required: true },
  name: { type: String, required: true },
  registeredUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // If this contact is registered
  isInvited: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export const User = mongoose.models.User || mongoose.model('User', UserSchema);
export const OTP = mongoose.models.OTP || mongoose.model('OTP', OTPSchema);
export const Conversation = mongoose.models.Conversation || mongoose.model('Conversation', ConversationSchema);
export const Message = mongoose.models.Message || mongoose.model('Message', MessageSchema);
export const Contact = mongoose.models.Contact || mongoose.model('Contact', ContactSchema);

