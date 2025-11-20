'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useWebSocket } from './WebSocketContext';
import { useUser } from './UserContext';
import { useLanguage } from './LanguageContext';

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
  const { dir } = useLanguage();
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
      let contactsData: PhoneContact[] = [];

      // Method 1: Try Contact Picker API (Chrome/Edge - requires HTTPS)
      if ('contacts' in navigator && 'select' in (navigator.contacts as any)) {
        try {
          const contacts = await (navigator.contacts as any).select(['name', 'tel'], { multiple: true });
          if (contacts && contacts.length > 0) {
            contactsData = contacts.map((c: any) => ({
              name: c.name?.[0] || 'Unknown',
              phoneNumber: c.tel?.[0] || '',
              phoneNumbers: c.tel || []
            })).filter((c: PhoneContact) => c.phoneNumber);
          }
        } catch (apiError: any) {
          console.log('Contact Picker API not available or denied:', apiError);
        }
      }

      // Method 2: Try Web Share API with contacts (if available)
      if (contactsData.length === 0 && 'share' in navigator) {
        try {
          // This is a fallback - Web Share doesn't directly access contacts
          // But we can try to use it if Contact Picker fails
          console.log('Web Share API available but cannot directly access contacts');
        } catch (error) {
          console.log('Web Share API error:', error);
        }
      }

      // Method 3: Use file input for vCard import (works on all browsers)
      if (contactsData.length === 0) {
        contactsData = await importContactsFromFile();
      }

      // Method 4: Manual entry as last resort
      if (contactsData.length === 0) {
        const useManual = confirm(
          dir === 'rtl' 
            ? 'لا يمكن الوصول إلى جهات الاتصال تلقائيًا.\n\nهل تريد إدخال جهات الاتصال يدويًا؟\n\nاضغط OK للإدخال اليدوي، أو Cancel للإلغاء.'
            : 'Cannot access contacts automatically.\n\nWould you like to manually enter contacts?\n\nClick OK to enter manually, or Cancel to skip.'
        );

        if (useManual) {
          await manualContactEntry();
          return;
        }
      }

      // Process the contacts we found
      if (contactsData.length > 0) {
        await processPhoneContacts(contactsData);
        
        // Show success message
        alert(
          dir === 'rtl'
            ? `تم مزامنة ${contactsData.length} جهة اتصال بنجاح!`
            : `Successfully synced ${contactsData.length} contacts!`
        );
      } else {
        alert(
          dir === 'rtl'
            ? 'لم يتم العثور على جهات اتصال. يرجى المحاولة مرة أخرى أو استخدام الإدخال اليدوي.'
            : 'No contacts found. Please try again or use manual entry.'
        );
      }
    } catch (error: any) {
      console.error('Error syncing contacts:', error);
      alert(
        dir === 'rtl'
          ? `خطأ في المزامنة: ${error.message || 'خطأ غير معروف'}. يرجى المحاولة مرة أخرى.`
          : `Sync error: ${error.message || 'Unknown error'}. Please try again.`
      );
    } finally {
      setIsSyncing(false);
    }
  };

  // Import contacts from vCard file
  const importContactsFromFile = (): Promise<PhoneContact[]> => {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.vcf,.vcard,text/vcard';
      input.style.display = 'none';
      
      input.onchange = async (e: any) => {
        const file = e.target.files?.[0];
        if (!file) {
          resolve([]);
          return;
        }

        try {
          const text = await file.text();
          const contacts = parseVCard(text);
          resolve(contacts);
        } catch (error) {
          console.error('Error parsing vCard:', error);
          resolve([]);
        } finally {
          document.body.removeChild(input);
        }
      };

      input.oncancel = () => {
        resolve([]);
        document.body.removeChild(input);
      };

      document.body.appendChild(input);
      input.click();
    });
  };

  // Parse vCard format
  const parseVCard = (vcardText: string): PhoneContact[] => {
    const contacts: PhoneContact[] = [];
    const vcards = vcardText.split(/BEGIN:VCARD/i);
    
    for (const vcard of vcards) {
      if (!vcard.trim()) continue;
      
      const nameMatch = vcard.match(/FN:(.+)/i);
      const telMatches = vcard.matchAll(/TEL[;:]([^:\n]+)?:([^\n]+)/gi);
      
      const name = nameMatch ? nameMatch[1].trim() : 'Unknown';
      const phoneNumbers: string[] = [];
      
      for (const telMatch of telMatches) {
        const phoneNumber = telMatch[2]?.trim();
        if (phoneNumber) {
          phoneNumbers.push(phoneNumber);
        }
      }
      
      if (phoneNumbers.length > 0) {
        contacts.push({
          name,
          phoneNumber: phoneNumbers[0],
          phoneNumbers
        });
      }
    }
    
    return contacts;
  };

  // Manual contact entry (fallback)
  const manualContactEntry = async (): Promise<void> => {
    const name = prompt(dir === 'rtl' ? 'أدخل اسم جهة الاتصال:' : 'Enter contact name:');
    if (!name) return;

    const phoneNumber = prompt(dir === 'rtl' ? 'أدخل رقم الهاتف (مع رمز الدولة، مثال: +967712345678):' : 'Enter phone number (with country code, e.g., +967712345678):');
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

  // Process phone contacts and match with registered users using real API
  const processPhoneContacts = async (phoneContactsData: PhoneContact[]) => {
    if (!phoneContactsData || phoneContactsData.length === 0) return;

    const synced: SyncedContact[] = [];
    const invitedNumbers = new Set(
      JSON.parse(localStorage.getItem('royal_chat_invited_numbers') || '[]')
    );

    // Collect all unique phone numbers
    const allPhoneNumbers: string[] = [];
    const phoneNumberToContact = new Map<string, PhoneContact>();

    for (const phoneContact of phoneContactsData) {
      const phoneNumbers = phoneContact.phoneNumbers || [phoneContact.phoneNumber];
      
      for (const phoneNumber of phoneNumbers) {
        const cleanNumber = phoneNumber.replace(/[\s\-\(\)]/g, '');
        
        // Skip if it's the current user's number
        if (cleanNumber === currentUser?.phoneNumber?.replace(/[\s\-\(\)]/g, '')) {
          continue;
        }

        if (!allPhoneNumbers.includes(cleanNumber)) {
          allPhoneNumbers.push(cleanNumber);
          phoneNumberToContact.set(cleanNumber, phoneContact);
        }
      }
    }

    // Call real API to find registered users by phone numbers
    try {
      const response = await fetch('/api/users/find-by-phones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumbers: allPhoneNumbers }),
      });

      if (response.ok) {
        const data = await response.json();
        const registeredUsers = data.users || [];

        // Create a map of phone number to registered user
        const phoneToUserMap = new Map<string, Contact>();
        registeredUsers.forEach((user: Contact) => {
          const cleanPhone = user.phoneNumber.replace(/[\s\-\(\)]/g, '');
          phoneToUserMap.set(cleanPhone, user);
        });

        // Build synced contacts list
        for (const phoneNumber of allPhoneNumbers) {
          const phoneContact = phoneNumberToContact.get(phoneNumber);
          const registeredUser = phoneToUserMap.get(phoneNumber);

          synced.push({
            name: phoneContact?.name || phoneNumber,
            phoneNumber: phoneNumber,
            phoneNumbers: phoneContact?.phoneNumbers || [phoneNumber],
            isRegistered: !!registeredUser,
            registeredUser: registeredUser,
            invited: invitedNumbers.has(phoneNumber)
          });
        }

        // Update allUsers with found registered users
        setAllUsers(prev => {
          const existingIds = new Set(prev.map(u => u.id));
          const newUsers = registeredUsers.filter((u: Contact) => !existingIds.has(u.id));
          return [...prev, ...newUsers];
        });
      } else {
        console.error('Failed to find users by phone numbers:', response.statusText);
        // Fallback to local search
        for (const phoneNumber of allPhoneNumbers) {
          const phoneContact = phoneNumberToContact.get(phoneNumber);
          const registeredUser = allUsers.find(u => 
            u.phoneNumber.replace(/[\s\-\(\)]/g, '') === phoneNumber
          );

          synced.push({
            name: phoneContact?.name || phoneNumber,
            phoneNumber: phoneNumber,
            phoneNumbers: phoneContact?.phoneNumbers || [phoneNumber],
            isRegistered: !!registeredUser,
            registeredUser: registeredUser,
            invited: invitedNumbers.has(phoneNumber)
          });
        }
      }
    } catch (error) {
      console.error('Error finding users by phone numbers:', error);
      // Fallback to local search
      for (const phoneNumber of allPhoneNumbers) {
        const phoneContact = phoneNumberToContact.get(phoneNumber);
        const registeredUser = allUsers.find(u => 
          u.phoneNumber.replace(/[\s\-\(\)]/g, '') === phoneNumber
        );

        synced.push({
          name: phoneContact?.name || phoneNumber,
          phoneNumber: phoneNumber,
          phoneNumbers: phoneContact?.phoneNumbers || [phoneNumber],
          isRegistered: !!registeredUser,
          registeredUser: registeredUser,
          invited: invitedNumbers.has(phoneNumber)
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

