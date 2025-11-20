'use client';

/**
 * Notification Service - Handles browser notifications for messages
 * Similar to WhatsApp notifications
 */

export class NotificationService {
  private static permission: NotificationPermission = 'default';
  private static soundEnabled: boolean = true;
  private static notificationEnabled: boolean = true;

  /**
   * Request notification permission from user
   */
  static async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return 'denied';
    }

    if (Notification.permission === 'default') {
      try {
        const permission = await Notification.requestPermission();
        this.permission = permission;
        return permission;
      } catch (error) {
        console.error('Error requesting notification permission:', error);
        return 'denied';
      }
    }

    this.permission = Notification.permission;
    return Notification.permission;
  }

  /**
   * Check if notifications are supported and allowed
   */
  static isSupported(): boolean {
    return 'Notification' in window;
  }

  /**
   * Check if notifications are allowed
   */
  static isAllowed(): boolean {
    return this.isSupported() && Notification.permission === 'granted';
  }

  /**
   * Show notification for new message
   */
  static async showMessageNotification(
    senderName: string,
    messageContent: string,
    senderAvatar?: string,
    conversationId?: string,
    dir: 'rtl' | 'ltr' = 'rtl'
  ): Promise<void> {
    // Check if notifications are enabled
    if (!this.notificationEnabled) return;

    // Check if permission is granted
    if (!this.isAllowed()) {
      // Try to request permission
      const permission = await this.requestPermission();
      if (permission !== 'granted') {
        return;
      }
    }

    // Check if page is visible (don't show notification if user is viewing the app)
    if (document.visibilityState === 'visible') {
      // Check if user is in the same conversation
      const currentPath = window.location.pathname;
      const currentHash = window.location.hash;
      if (conversationId && (currentPath.includes(conversationId) || currentHash.includes(conversationId))) {
        // User is viewing this conversation, don't show notification
        return;
      }
    }

    try {
      // Truncate message content for notification
      const truncatedContent = messageContent.length > 100 
        ? messageContent.substring(0, 100) + '...' 
        : messageContent;

      // Create notification options
      const options: NotificationOptions = {
        body: truncatedContent,
        icon: senderAvatar || '/icon-192x192.png',
        badge: '/icon-192x192.png',
        tag: conversationId || `message-${Date.now()}`, // Prevent duplicate notifications
        requireInteraction: false,
        silent: !this.soundEnabled,
        dir: dir,
        lang: dir === 'rtl' ? 'ar' : 'en',
        vibrate: [200, 100, 200], // Vibration pattern
        data: {
          conversationId: conversationId,
          senderName: senderName,
          timestamp: Date.now()
        }
      };

      // Show notification
      const notification = new Notification(
        dir === 'rtl' ? `رسالة جديدة من ${senderName}` : `New message from ${senderName}`,
        options
      );

      // Handle notification click - focus window
      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // Auto close notification after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);

      // Play sound if enabled
      if (this.soundEnabled) {
        this.playNotificationSound();
      }
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }

  /**
   * Play notification sound
   */
  private static playNotificationSound(): void {
    try {
      // Create audio context for notification sound
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // WhatsApp-like notification sound (two beeps)
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);

      // Second beep
      setTimeout(() => {
        const oscillator2 = audioContext.createOscillator();
        const gainNode2 = audioContext.createGain();
        oscillator2.connect(gainNode2);
        gainNode2.connect(audioContext.destination);
        oscillator2.frequency.value = 800;
        oscillator2.type = 'sine';
        gainNode2.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        oscillator2.start(audioContext.currentTime);
        oscillator2.stop(audioContext.currentTime + 0.3);
      }, 150);
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  }

  /**
   * Enable/disable notifications
   */
  static setEnabled(enabled: boolean): void {
    this.notificationEnabled = enabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem('royal_chat_notifications_enabled', String(enabled));
    }
  }

  /**
   * Enable/disable sound
   */
  static setSoundEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem('royal_chat_notifications_sound', String(enabled));
    }
  }

  /**
   * Load settings from localStorage
   */
  static loadSettings(): void {
    if (typeof window !== 'undefined') {
      const enabled = localStorage.getItem('royal_chat_notifications_enabled');
      const sound = localStorage.getItem('royal_chat_notifications_sound');
      
      if (enabled !== null) {
        this.notificationEnabled = enabled === 'true';
      }
      if (sound !== null) {
        this.soundEnabled = sound === 'true';
      }
    }
  }

  /**
   * Close all notifications
   */
  static closeAll(): void {
    // Notifications auto-close, but we can track them if needed
  }
}

// Load settings on initialization
if (typeof window !== 'undefined') {
  NotificationService.loadSettings();
}

