'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Input } from '@/ui/input';
import { Button } from '@/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/ui/avatar';
import { Badge } from '@/ui/badge';
import { ScrollArea } from '@/ui/scroll-area';
import { Search, UserPlus, UserMinus, Phone, CheckCircle2, XCircle, Loader2, RefreshCw, Mail, Smartphone } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useContacts } from '@/contexts/ContactsContext';
import { useUser } from '@/contexts/UserContext';
import { cn } from '@/lib/utils';
import { useWebSocket } from '@/contexts/WebSocketContext';

export function ContactsPage() {
  const { dir, t } = useLanguage();
  const { 
    contacts, 
    allUsers, 
    phoneContacts, 
    isLoading, 
    isSyncing,
    searchUser, 
    addContact, 
    removeContact, 
    refreshContacts,
    syncPhoneContacts,
    inviteContact
  } = useContacts();
  const { user: currentUser } = useUser();
  const { socket, isConnected } = useWebSocket();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [addingContact, setAddingContact] = useState<string | null>(null);
  const [invitingContact, setInvitingContact] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'app' | 'phone'>('app');

  useEffect(() => {
    if (isConnected) {
      refreshContacts();
    }
  }, [isConnected, refreshContacts]);

  // Update phone contacts when allUsers changes
  useEffect(() => {
    if (phoneContacts.length > 0 && allUsers.length > 0) {
      // This will be handled by ContactsContext, but we can force a refresh here
      refreshContacts();
    }
  }, [allUsers.length]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // Search by phone number
      const foundUser = await searchUser(searchQuery.trim());
      if (foundUser) {
        setSearchResults([foundUser]);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddContact = async (phoneNumber: string) => {
    setAddingContact(phoneNumber);
    try {
      await addContact(phoneNumber);
      setSearchResults([]);
      setSearchQuery('');
    } catch (error: any) {
      alert(error.message || (dir === 'rtl' ? 'فشل إضافة جهة الاتصال' : 'Failed to add contact'));
    } finally {
      setAddingContact(null);
    }
  };

  const handleRemoveContact = (phoneNumber: string) => {
    if (confirm(dir === 'rtl' ? 'هل تريد إزالة جهة الاتصال؟' : 'Remove this contact?')) {
      removeContact(phoneNumber);
    }
  };

  const isContact = (phoneNumber: string) => {
    return contacts.some(c => c.phoneNumber === phoneNumber);
  };

  const getStatusBadge = (status: 'online' | 'offline' | 'away') => {
    switch (status) {
      case 'online':
        return (
          <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-1" />
            {dir === 'rtl' ? 'أونلاين' : 'Online'}
          </Badge>
        );
      case 'away':
        return (
          <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
            <div className="w-2 h-2 bg-yellow-500 rounded-full mr-1" />
            {dir === 'rtl' ? 'بعيد' : 'Away'}
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="bg-gray-500/10 text-gray-600 border-gray-500/20">
            <div className="w-2 h-2 bg-gray-500 rounded-full mr-1" />
            {dir === 'rtl' ? 'غير متصل' : 'Offline'}
          </Badge>
        );
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full" dir={dir}>
      <Card className="flex flex-col h-full border-r rounded-none">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Phone className="w-6 h-6" />
              {dir === 'rtl' ? 'جهات الاتصال' : 'Contacts'}
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={syncPhoneContacts}
                disabled={isSyncing}
                className="gap-2"
              >
                {isSyncing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                {dir === 'rtl' ? 'مزامنة الهاتف' : 'Sync Phone'}
              </Button>
              {activeTab === 'phone' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    const name = prompt(dir === 'rtl' ? 'أدخل اسم جهة الاتصال:' : 'Enter contact name:');
                    if (!name) return;

                    const phoneNumber = prompt(dir === 'rtl' ? 'أدخل رقم الهاتف (مع رمز الدولة، مثال: +967712345678):' : 'Enter phone number (with country code, e.g., +967712345678):');
                    if (!phoneNumber) return;

                    // Clean phone number
                    const cleanNumber = phoneNumber.replace(/[\s\-\(\)]/g, '');

                    // Check if user is registered
                    const foundUser = await searchUser(cleanNumber);
                    
                    const invitedNumbers = new Set(
                      JSON.parse(localStorage.getItem('royal_chat_invited_numbers') || '[]')
                    );

                    const newContact = {
                      name,
                      phoneNumber: cleanNumber,
                      phoneNumbers: [cleanNumber],
                      isRegistered: !!foundUser,
                      registeredUser: foundUser || undefined,
                      invited: invitedNumbers.has(cleanNumber)
                    };

                    // Add to phone contacts
                    const saved = localStorage.getItem('royal_chat_phone_contacts');
                    const contacts = saved ? JSON.parse(saved) : [];
                    const updated = contacts.filter((c: any) => c.phoneNumber !== cleanNumber);
                    updated.push(newContact);
                    localStorage.setItem('royal_chat_phone_contacts', JSON.stringify(updated));

                    // Refresh to show new contact
                    window.location.reload();
                  }}
                  className="gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  {dir === 'rtl' ? 'إضافة يدوية' : 'Add Manual'}
                </Button>
              )}
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex gap-2 mt-4">
            <Button
              variant={activeTab === 'app' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('app')}
              className="flex-1"
            >
              {dir === 'rtl' ? 'المستخدمون المسجلون' : 'App Users'}
            </Button>
            <Button
              variant={activeTab === 'phone' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('phone')}
              className="flex-1"
            >
              <Smartphone className="w-4 h-4 mr-2" />
              {dir === 'rtl' ? 'جهات الهاتف' : 'Phone Contacts'}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
          {/* Search Section */}
          <div className="p-4 border-b space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className={cn(
                  "absolute top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground",
                  dir === 'rtl' ? 'right-3' : 'left-3'
                )} />
                <Input
                  placeholder={dir === 'rtl' ? 'ابحث برقم الهاتف...' : 'Search by phone number...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch();
                    }
                  }}
                  className={dir === 'rtl' ? 'pr-10' : 'pl-10'}
                  dir="ltr"
                />
              </div>
              <Button
                onClick={handleSearch}
                disabled={isSearching || !searchQuery.trim()}
                size="icon"
              >
                {isSearching ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </Button>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="space-y-2">
                {searchResults.map((user) => {
                  const alreadyContact = isContact(user.phoneNumber);
                  const isCurrentUser = user.phoneNumber === currentUser?.phoneNumber;

                  return (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-3 border rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback>
                            {user.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold truncate">{user.name}</p>
                            {getStatusBadge(user.status)}
                          </div>
                          <p className="text-sm text-muted-foreground font-mono">{user.phoneNumber}</p>
                        </div>
                      </div>
                      {!isCurrentUser && (
                        <Button
                          size="sm"
                          variant={alreadyContact ? 'outline' : 'default'}
                          onClick={() => {
                            if (alreadyContact) {
                              handleRemoveContact(user.phoneNumber);
                            } else {
                              handleAddContact(user.phoneNumber);
                            }
                          }}
                          disabled={addingContact === user.phoneNumber}
                          className="ml-2"
                        >
                          {addingContact === user.phoneNumber ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : alreadyContact ? (
                            <>
                              <UserMinus className="w-4 h-4 mr-1" />
                              {dir === 'rtl' ? 'إزالة' : 'Remove'}
                            </>
                          ) : (
                            <>
                              <UserPlus className="w-4 h-4 mr-1" />
                              {dir === 'rtl' ? 'إضافة' : 'Add'}
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {searchQuery && searchResults.length === 0 && !isSearching && (
              <div className="text-center py-4 text-muted-foreground">
                {dir === 'rtl' ? 'لم يتم العثور على مستخدم' : 'User not found'}
              </div>
            )}
          </div>

          {/* Contacts List */}
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-2">
              {activeTab === 'app' ? (
                // App Users Tab
                contacts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <UserPlus className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>{dir === 'rtl' ? 'لا توجد جهات اتصال' : 'No contacts yet'}</p>
                    <p className="text-sm mt-2">
                      {dir === 'rtl' 
                        ? 'ابحث برقم الهاتف لإضافة جهات الاتصال'
                        : 'Search by phone number to add contacts'}
                    </p>
                  </div>
                ) : (
                  contacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="relative">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={contact.avatar} alt={contact.name} />
                            <AvatarFallback>
                              {contact.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          {contact.status === 'online' && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold truncate">{contact.name}</p>
                            {getStatusBadge(contact.status)}
                          </div>
                          <p className="text-sm text-muted-foreground font-mono">{contact.phoneNumber}</p>
                          {contact.lastSeen && contact.status === 'offline' && (
                            <p className="text-xs text-muted-foreground">
                              {dir === 'rtl' ? 'آخر ظهور: ' : 'Last seen: '}
                              {new Date(contact.lastSeen).toLocaleString(dir === 'rtl' ? 'ar-SA' : 'en-US')}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveContact(contact.phoneNumber)}
                        className="ml-2"
                      >
                        <UserMinus className="w-4 h-4" />
                      </Button>
                    </div>
                  ))
                )
              ) : (
                // Phone Contacts Tab
                phoneContacts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Smartphone className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>{dir === 'rtl' ? 'لا توجد جهات اتصال من الهاتف' : 'No phone contacts synced'}</p>
                    <p className="text-sm mt-2">
                      {dir === 'rtl' 
                        ? 'اضغط على "مزامنة الهاتف" لمزامنة جهات الاتصال'
                        : 'Click "Sync Phone" to sync your phone contacts'}
                    </p>
                  </div>
                ) : (
                  phoneContacts.map((phoneContact, index) => {
                    const isRegistered = phoneContact.isRegistered;
                    const registeredUser = phoneContact.registeredUser;
                    const isInvited = phoneContact.invited;

                    return (
                      <div
                        key={`${phoneContact.phoneNumber}-${index}`}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="relative">
                            <Avatar className="w-12 h-12">
                              <AvatarImage 
                                src={registeredUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${phoneContact.phoneNumber}`} 
                                alt={phoneContact.name} 
                              />
                              <AvatarFallback>
                                {phoneContact.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            {isRegistered && registeredUser?.status === 'online' && (
                              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold truncate">{phoneContact.name}</p>
                              {isRegistered && registeredUser && getStatusBadge(registeredUser.status)}
                              {!isRegistered && isInvited && (
                                <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                                  {dir === 'rtl' ? 'تمت الدعوة' : 'Invited'}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground font-mono">{phoneContact.phoneNumber}</p>
                            {isRegistered ? (
                              <p className="text-xs text-green-600">
                                {dir === 'rtl' ? '✓ مسجل في التطبيق' : '✓ Registered in app'}
                              </p>
                            ) : (
                              <p className="text-xs text-muted-foreground">
                                {dir === 'rtl' ? 'غير مسجل' : 'Not registered'}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {isRegistered && registeredUser ? (
                            <>
                              {!isContact(registeredUser.phoneNumber) ? (
                                <Button
                                  size="sm"
                                  onClick={() => handleAddContact(registeredUser.phoneNumber)}
                                  disabled={addingContact === registeredUser.phoneNumber}
                                >
                                  {addingContact === registeredUser.phoneNumber ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <>
                                      <UserPlus className="w-4 h-4 mr-1" />
                                      {dir === 'rtl' ? 'إضافة' : 'Add'}
                                    </>
                                  )}
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleRemoveContact(registeredUser.phoneNumber)}
                                >
                                  <UserMinus className="w-4 h-4" />
                                </Button>
                              )}
                            </>
                          ) : (
                            <Button
                              size="sm"
                              variant={isInvited ? 'outline' : 'default'}
                              onClick={async () => {
                                if (!isInvited) {
                                  setInvitingContact(phoneContact.phoneNumber);
                                  try {
                                    await inviteContact(phoneContact.phoneNumber, phoneContact.name);
                                    alert(dir === 'rtl' ? 'تم إرسال الدعوة!' : 'Invitation sent!');
                                  } catch (error: any) {
                                    alert(error.message || (dir === 'rtl' ? 'فشل إرسال الدعوة' : 'Failed to send invitation'));
                                  } finally {
                                    setInvitingContact(null);
                                  }
                                }
                              }}
                              disabled={isInvited || invitingContact === phoneContact.phoneNumber}
                            >
                              {invitingContact === phoneContact.phoneNumber ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : isInvited ? (
                                <>
                                  <CheckCircle2 className="w-4 h-4 mr-1" />
                                  {dir === 'rtl' ? 'تمت الدعوة' : 'Invited'}
                                </>
                              ) : (
                                <>
                                  <Mail className="w-4 h-4 mr-1" />
                                  {dir === 'rtl' ? 'إرسال دعوة' : 'Invite'}
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

