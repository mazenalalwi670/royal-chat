'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useWebSocket } from './WebSocketContext';
import { useUser } from './UserContext';

export interface Contact {
  id: string;
  phoneNumber: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline' | 'away';
  lastSeen?: Date;
  isContact: boolean; // Whether this user is in my contacts
  addedAt?: Date;
}

interface PhoneContact {
  name: string;
  phoneNumber: string;
  phoneNumbers?: string[];
}

interface SyncedContact extends PhoneContact {
  isRegistered: boolean; // Is user registered in app
  registeredUser?: Contact; // User data if registered
  invited: boolean; // Has invitation been sent
}

interface ContactsContextType {
  contacts: Contact[];
  allUsers: Contact[]; // All registered users (for search)
  phoneContacts: SyncedContact[]; // Contacts from phone
  isLoading: boolean;
  isSyncing: boolean;
  searchUser: (phoneNumber: string) => Promise<Contact | null>;
  addContact: (phoneNumber: string) => Promise<void>;
  removeContact: (phoneNumber: string) => void;
  updateContactStatus: (userId: string, status: Contact['status']) => void;
  refreshContacts: () => Promise<void>;
  syncPhoneContacts: () => Promise<void>;
  inviteContact: (phoneNumber: string, name: string) => Promise<void>;
}

const ContactsContext = createContext<ContactsContextType | undefined>(undefined);

const STORAGE_KEY = 'royal_chat_contacts';
const USERS_STORAGE_KEY = 'royal_chat_all_users';

export function ContactsProvider({ children }: { children: ReactNode }) {
  const { socket, isConnected } = useWebSocket();
  const { user: currentUser } = useUser();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [allUsers, setAllUsers] = useState<Contact[]>([]);
  const [phoneContacts, setPhoneContacts] = useState<SyncedContact[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Load contacts from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedContacts = localStorage.getItem(STORAGE_KEY);
      if (savedContacts) {
        try {
          const parsed = JSON.parse(savedContacts);
          setContacts(parsed.map((c: any) => ({
            ...c,
            lastSeen: c.lastSeen ? new Date(c.lastSeen) : undefined,
            addedAt: c.addedAt ? new Date(c.addedAt) : undefined
          })));
        } catch (error) {
          console.error('Error loading contacts:', error);
        }
      }

      const savedUsers = localStorage.getItem(USERS_STORAGE_KEY);
      if (savedUsers) {
        try {
          const parsed = JSON.parse(savedUsers);
          setAllUsers(parsed.map((u: any) => ({
            ...u,
            lastSeen: u.lastSeen ? new Date(u.lastSeen) : undefined
          })));
        } catch (error) {
          console.error('Error loading users:', error);
        }
      }
    }
  }, []);

  // Listen for user status updates via WebSocket
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleUserStatusUpdate = (data: { userId: string; status: Contact['status']; lastSeen?: Date }) => {
      setContacts(prev => prev.map(contact => 
        contact.id === data.userId 
          ? { ...contact, status: data.status, lastSeen: data.lastSeen ? new Date(data.lastSeen) : contact.lastSeen }
          : contact
      ));
      setAllUsers(prev => prev.map(user => 
        user.id === data.userId 
          ? { ...user, status: data.status, lastSeen: data.lastSeen ? new Date(data.lastSeen) : user.lastSeen }
          : user
      ));
    };

    const handleUserProfileUpdate = (data: { userId: string; name?: string; avatar?: string }) => {
      setContacts(prev => prev.map(contact => 
        contact.id === data.userId 
          ? { ...contact, ...(data.name && { name: data.name }), ...(data.avatar && { avatar: data.avatar }) }
          : contact
      ));
      setAllUsers(prev => prev.map(user => 
        user.id === data.userId 
          ? { ...user, ...(data.name && { name: data.name }), ...(data.avatar && { avatar: data.avatar }) }
          : user
      ));
    };

    socket.on('user_status_update', handleUserStatusUpdate);
    socket.on('user_profile_update', handleUserProfileUpdate);

    return () => {
      socket.off('user_status_update', handleUserStatusUpdate);
      socket.off('user_profile_update', handleUserProfileUpdate);
    };
  }, [socket, isConnected]);

  // Register current user when connected
  useEffect(() => {
    if (!socket || !isConnected || !currentUser) return;

    // Register user with server
    socket.emit('register_user', {
      userId: currentUser.id,
      phoneNumber: currentUser.phoneNumber,
      name: currentUser.name,
      avatar: currentUser.avatar
    });

    // Request all registered users
    socket.emit('get_all_users');

    // Listen for all users list
    const handleAllUsers = (users: Contact[]) => {
      setAllUsers(users.map(u => ({
        ...u,
        lastSeen: u.lastSeen ? new Date(u.lastSeen) : undefined
      })));
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
      }
    };

    socket.on('all_users', handleAllUsers);

    return () => {
      socket.off('all_users', handleAllUsers);
    };
  }, [socket, isConnected, currentUser]);

  const searchUser = async (phoneNumber: string): Promise<Contact | null> => {
    if (!socket || !isConnected) {
      // Fallback: search in local storage
      const allUsers = typeof window !== 'undefined' 
        ? JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]')
        : [];
      const found = allUsers.find((u: Contact) => u.phoneNumber === phoneNumber);
      return found || null;
    }

    return new Promise((resolve) => {
      socket.emit('search_user', { phoneNumber }, (response: { user: Contact | null; error?: string }) => {
        if (response.user) {
          resolve(response.user);
        } else {
          resolve(null);
        }
      });
    });
  };

  const addContact = async (phoneNumber: string): Promise<void> => {
    if (!currentUser) return;

    const foundUser = await searchUser(phoneNumber);
    if (!foundUser) {
      throw new Error('User not found');
    }

    // Don't add yourself
    if (foundUser.phoneNumber === currentUser.phoneNumber) {
      throw new Error('Cannot add yourself as a contact');
    }

    // Check if already in contacts
    const existingContact = contacts.find(c => c.phoneNumber === phoneNumber);
    if (existingContact) {
      throw new Error('Contact already exists');
    }

    const newContact: Contact = {
      ...foundUser,
      isContact: true,
      addedAt: new Date()
    };

    const updatedContacts = [...contacts, newContact];
    setContacts(updatedContacts);

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedContacts));
    }

    // Notify server
    if (socket && isConnected) {
      socket.emit('add_contact', {
        userId: currentUser.id,
        contactId: foundUser.id
      });
    }
  };

  const removeContact = (phoneNumber: string) => {
    const updatedContacts = contacts.filter(c => c.phoneNumber !== phoneNumber);
    setContacts(updatedContacts);

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedContacts));
    }

    // Notify server
    if (socket && isConnected && currentUser) {
      const contact = contacts.find(c => c.phoneNumber === phoneNumber);
      if (contact) {
        socket.emit('remove_contact', {
          userId: currentUser.id,
          contactId: contact.id
        });
      }
    }
  };

  const updateContactStatus = (userId: string, status: Contact['status']) => {
    setContacts(prev => prev.map(contact => 
      contact.id === userId ? { ...contact, status } : contact
    ));
    setAllUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, status } : user
    ));
  };

  const refreshContacts = async (): Promise<void> => {
    if (!socket || !isConnected) return;

    setIsLoading(true);
    try {
      socket.emit('get_all_users');
      // Wait a bit for response
      await new Promise(resolve => setTimeout(resolve, 500));
    } finally {
      setIsLoading(false);
    }
  };

  // Sync phone contacts with app users
  const syncPhoneContacts = async (): Promise<void> => {
    if (typeof window === 'undefined') return;

    setIsSyncing(true);
    try {
      // Try Contacts API first (if available)
      if ('contacts' in navigator && 'select' in (navigator.contacts as any)) {
        try {
          // Use Contacts API (Chrome/Edge - requires HTTPS)
          const contacts = await (navigator.contacts as any).select(['name', 'tel'], { multiple: true });
          if (contacts && contacts.length > 0) {
            await processPhoneContacts(contacts.map((c: any) => ({
              name: c.name?.[0] || '',
              phoneNumber: c.tel?.[0] || '',
              phoneNumbers: c.tel || []
            })));
            return;
          }
        } catch (apiError: any) {
          console.log('Contacts API not available or denied:', apiError);
        }
      }

      // Fallback: Manual entry option
      const useManual = confirm(
        'Contacts API is not available in this browser.\n\n' +
        'Would you like to manually enter contacts?\n\n' +
        'Click OK to enter manually, or Cancel to skip.'
      );

      if (useManual) {
        await manualContactEntry();
      }
    } catch (error: any) {
      console.error('Error syncing contacts:', error);
      alert('Unable to sync contacts. Please try again or use manual entry.');
    } finally {
      setIsSyncing(false);
    }
  };

  // Manual contact entry (fallback)
  const manualContactEntry = async (): Promise<void> => {
    const name = prompt('Enter contact name:');
    if (!name) return;

    const phoneNumber = prompt('Enter phone number (with country code, e.g., +967712345678):');
    if (!phoneNumber) return;

    // Clean phone number
    const cleanNumber = phoneNumber.replace(/[\s\-\(\)]/g, '');

    // Check if user is registered
    const registeredUser = allUsers.find(u => 
      u.phoneNumber.replace(/[\s\-\(\)]/g, '') === cleanNumber
    );

    const invitedNumbers = new Set(
      JSON.parse(localStorage.getItem('royal_chat_invited_numbers') || '[]')
    );

    const newContact: SyncedContact = {
      name,
      phoneNumber: cleanNumber,
      phoneNumbers: [cleanNumber],
      isRegistered: !!registeredUser,
      registeredUser: registeredUser,
      invited: invitedNumbers.has(cleanNumber)
    };

    setPhoneContacts(prev => {
      // Check if contact already exists
      const exists = prev.find(c => c.phoneNumber === cleanNumber);
      if (exists) {
        return prev.map(c => c.phoneNumber === cleanNumber ? newContact : c);
      }
      return [...prev, newContact];
    });

    // Save to localStorage
    const saved = localStorage.getItem('royal_chat_phone_contacts');
    const contacts = saved ? JSON.parse(saved) : [];
    const updated = contacts.filter((c: SyncedContact) => c.phoneNumber !== cleanNumber);
    updated.push(newContact);
    localStorage.setItem('royal_chat_phone_contacts', JSON.stringify(updated));
  };

  // Process phone contacts and match with registered users
  const processPhoneContacts = async (phoneContactsData: PhoneContact[]) => {
    if (!phoneContactsData || phoneContactsData.length === 0) return;

    const synced: SyncedContact[] = [];
    const invitedNumbers = new Set(
      JSON.parse(localStorage.getItem('royal_chat_invited_numbers') || '[]')
    );

    for (const phoneContact of phoneContactsData) {
      // Normalize phone number
      const phoneNumbers = phoneContact.phoneNumbers || [phoneContact.phoneNumber];
      
      for (const phoneNumber of phoneNumbers) {
        // Clean phone number (remove spaces, dashes, etc.)
        const cleanNumber = phoneNumber.replace(/[\s\-\(\)]/g, '');
        
        // Skip if it's the current user's number
        if (cleanNumber === currentUser?.phoneNumber?.replace(/[\s\-\(\)]/g, '')) {
          continue;
        }

        // Check if user is registered
        const registeredUser = allUsers.find(u => 
          u.phoneNumber.replace(/[\s\-\(\)]/g, '') === cleanNumber
        );

        synced.push({
          name: phoneContact.name || cleanNumber,
          phoneNumber: cleanNumber,
          phoneNumbers: phoneNumbers,
          isRegistered: !!registeredUser,
          registeredUser: registeredUser,
          invited: invitedNumbers.has(cleanNumber)
        });
      }
    }

    setPhoneContacts(synced);
    
    // Save to localStorage
    localStorage.setItem('royal_chat_phone_contacts', JSON.stringify(synced));
  };

  // Invite contact (send invitation)
  const inviteContact = async (phoneNumber: string, name: string): Promise<void> => {
    if (!socket || !isConnected || !currentUser) {
      throw new Error('Not connected');
    }

    // Send invitation via WebSocket
    socket.emit('send_invitation', {
      fromUserId: currentUser.id,
      fromUserName: currentUser.name,
      fromUserPhone: currentUser.phoneNumber,
      toPhoneNumber: phoneNumber,
      toName: name,
      timestamp: new Date()
    });

    // Mark as invited
    const invitedNumbers = new Set(
      JSON.parse(localStorage.getItem('royal_chat_invited_numbers') || '[]')
    );
    invitedNumbers.add(phoneNumber);
    localStorage.setItem('royal_chat_invited_numbers', JSON.stringify(Array.from(invitedNumbers)));

    // Update phone contacts
    setPhoneContacts(prev => prev.map(contact =>
      contact.phoneNumber === phoneNumber
        ? { ...contact, invited: true }
        : contact
    ));

    console.log(`Invitation sent to ${name} (${phoneNumber})`);
  };

  // Load phone contacts from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('royal_chat_phone_contacts');
      if (saved) {
        try {
          setPhoneContacts(JSON.parse(saved));
        } catch (error) {
          console.error('Error loading phone contacts:', error);
        }
      }
    }
  }, []);

  // Re-sync phone contacts when allUsers changes
  useEffect(() => {
    if (phoneContacts.length > 0 && allUsers.length > 0) {
      setPhoneContacts(prev => prev.map(contact => {
        const registeredUser = allUsers.find(u => 
          u.phoneNumber.replace(/[\s\-\(\)]/g, '') === contact.phoneNumber.replace(/[\s\-\(\)]/g, '')
        );
        return {
          ...contact,
          isRegistered: !!registeredUser,
          registeredUser: registeredUser
        };
      }));
    }
  }, [allUsers]);

  return (
    <ContactsContext.Provider
      value={{
        contacts,
        allUsers,
        phoneContacts,
        isLoading,
        isSyncing,
        searchUser,
        addContact,
        removeContact,
        updateContactStatus,
        refreshContacts,
        syncPhoneContacts,
        inviteContact
      }}
    >
      {children}
    </ContactsContext.Provider>
  );
}

export function useContacts() {
  const context = useContext(ContactsContext);
  if (context === undefined) {
    throw new Error('useContacts must be used within a ContactsProvider');
  }
  return context;
}

