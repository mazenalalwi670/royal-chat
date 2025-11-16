export interface Subscription {
  id: string;
  userId: string;
  status: 'active' | 'inactive' | 'pending' | 'expired';
  plan: 'lifetime';
  amount: number; // 30 USD
  currency: string; // USD
  purchaseDate: Date;
  expiryDate?: Date; // null for lifetime
  paymentMethod: 'stripe' | 'paypal' | 'bank_transfer' | 'credit_card' | 'admin' | 'other';
  paymentId: string;
  transactionId: string;
}

export interface PaymentIntent {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed' | 'canceled';
  clientSecret?: string;
  paymentMethod?: string;
  createdAt: Date;
}

export interface PremiumChat {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  isActive: boolean;
  memberCount: number;
  maxMembers?: number;
}

