'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface AdminPermissions {
  canManageUsers: boolean;
  canManageAdmins: boolean;
  canAccessPremiumChat: boolean;
  canViewStatistics: boolean;
  canManageSettings: boolean;
  canAccessDatabase: boolean;
}

export interface AdminUser {
  id: string;
  name: string;
  username: string;
  role: 'admin' | 'owner' | 'user';
  isInvisible: boolean;
  avatar: string;
  status: 'online' | 'offline' | 'away' | 'invisible';
  permissions?: AdminPermissions;
  isOwner?: boolean;
}

interface AuthContextType {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  isOwner: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  toggleInvisibility: () => void;
  setInvisible: (invisible: boolean) => void;
  updateName: (name: string) => void;
  // Admin management functions (only for owner)
  createAdmin: (adminData: { username: string; password: string; name: string; permissions: AdminPermissions }) => Promise<boolean>;
  getAdmins: () => AdminUser[];
  updateAdmin: (adminId: string, updates: Partial<AdminUser>) => Promise<boolean>;
  deleteAdmin: (adminId: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'mazen@771885223'
};

const STORAGE_KEYS = {
  ADMIN_USER: 'admin_user',
  ADMIN_LIST: 'admin_list'
};

// Default permissions for owner
const OWNER_PERMISSIONS: AdminPermissions = {
  canManageUsers: true,
  canManageAdmins: true,
  canAccessPremiumChat: true,
  canViewStatistics: true,
  canManageSettings: true,
  canAccessDatabase: true
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [admins, setAdmins] = useState<AdminUser[]>([]);

  useEffect(() => {
    // FORCE LOGIN: Always show login page on entry
    // Don't auto-load saved admin user from localStorage
    // Owner must explicitly login every time
    if (typeof window !== 'undefined') {
      // Load admins list (still needed for admin management)
      const savedAdmins = localStorage.getItem(STORAGE_KEYS.ADMIN_LIST);
      if (savedAdmins) {
        try {
          setAdmins(JSON.parse(savedAdmins));
        } catch (error) {
          console.error('Error parsing saved admins:', error);
        }
      }
      
      // Always require login - don't auto-load saved admin user
      // Clear saved admin user to force login
      // localStorage.removeItem(STORAGE_KEYS.ADMIN_USER); // Uncomment if you want to clear saved data
      
      // Always show login page
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    // Trim inputs to handle accidental spaces
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();
    
    // Check owner credentials
    if (trimmedUsername === ADMIN_CREDENTIALS.username && trimmedPassword === ADMIN_CREDENTIALS.password) {
      const adminUser: AdminUser = {
        id: 'owner-1',
        name: 'المالك',
        username: 'admin',
        role: 'owner',
        isInvisible: true, // Default to invisible
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
        status: 'invisible',
        permissions: OWNER_PERMISSIONS,
        isOwner: true
      };
      setUser(adminUser);
      setIsAuthenticated(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.ADMIN_USER, JSON.stringify(adminUser));
      }
      return true;
    }
    
    // Check other admins
    if (typeof window !== 'undefined') {
      const savedAdmins = localStorage.getItem(STORAGE_KEYS.ADMIN_LIST);
      if (savedAdmins) {
        try {
          const adminsList = JSON.parse(savedAdmins) as Array<AdminUser & { password: string }>;
          const foundAdmin = adminsList.find(a => a.username.trim() === trimmedUsername && a.password === trimmedPassword);
          if (foundAdmin) {
            const { password: _, ...adminUser } = foundAdmin;
            const userToLogin: AdminUser = {
              ...adminUser,
              role: 'admin',
              permissions: adminUser.permissions || {
                canManageUsers: false,
                canManageAdmins: false,
                canAccessPremiumChat: true,
                canViewStatistics: false,
                canManageSettings: false,
                canAccessDatabase: false
              }
            };
            setUser(userToLogin);
            setIsAuthenticated(true);
            localStorage.setItem(STORAGE_KEYS.ADMIN_USER, JSON.stringify(userToLogin));
            return true;
          }
        } catch (error) {
          console.error('Error checking admin credentials:', error);
        }
      }
    }
    
    return false;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.ADMIN_USER);
    }
  };

  const updateName = (name: string) => {
    if (user) {
      const updatedUser = {
        ...user,
        name
      };
      setUser(updatedUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.ADMIN_USER, JSON.stringify(updatedUser));
      }
    }
  };

  const createAdmin = async (adminData: { username: string; password: string; name: string; permissions: AdminPermissions }): Promise<boolean> => {
    if (!user || user.role !== 'owner') {
      return false;
    }

    const newAdmin: AdminUser & { password: string } = {
      id: `admin-${Date.now()}`,
      name: adminData.name,
      username: adminData.username,
      password: adminData.password,
      role: 'admin',
      isInvisible: false,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${adminData.username}`,
      status: 'offline',
      permissions: adminData.permissions
    };

    const updatedAdmins = [...admins, newAdmin];
    setAdmins(updatedAdmins);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.ADMIN_LIST, JSON.stringify(updatedAdmins));
    }
    
    return true;
  };

  const getAdmins = (): AdminUser[] => {
    return admins.map(admin => {
      const adminWithPassword = admin as AdminUser & { password?: string };
      const { password: _, ...adminWithoutPassword } = adminWithPassword;
      return adminWithoutPassword as AdminUser;
    });
  };

  const updateAdmin = async (adminId: string, updates: Partial<AdminUser>): Promise<boolean> => {
    if (!user || user.role !== 'owner') {
      return false;
    }

    const updatedAdmins = admins.map(admin => {
      if (admin.id === adminId) {
        return { ...admin, ...updates };
      }
      return admin;
    });

    setAdmins(updatedAdmins);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.ADMIN_LIST, JSON.stringify(updatedAdmins));
    }
    
    return true;
  };

  const deleteAdmin = (adminId: string): boolean => {
    if (!user || user.role !== 'owner') {
      return false;
    }

    const updatedAdmins = admins.filter(admin => admin.id !== adminId);
    setAdmins(updatedAdmins);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.ADMIN_LIST, JSON.stringify(updatedAdmins));
    }
    
    return true;
  };

  const toggleInvisibility = () => {
    if (user) {
      const newInvisible = !user.isInvisible;
      const updatedUser: AdminUser = {
        ...user,
        isInvisible: newInvisible,
        status: (newInvisible ? 'invisible' : 'online') as 'online' | 'offline' | 'away' | 'invisible'
      };
      setUser(updatedUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.ADMIN_USER, JSON.stringify(updatedUser));
      }
    }
  };

  const setInvisible = (invisible: boolean) => {
    if (user) {
      const updatedUser: AdminUser = {
        ...user,
        isInvisible: invisible,
        status: (invisible ? 'invisible' : 'online') as 'online' | 'offline' | 'away' | 'invisible'
      };
      setUser(updatedUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.ADMIN_USER, JSON.stringify(updatedUser));
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        isAdmin: user?.role === 'admin' || user?.role === 'owner',
        isOwner: user?.role === 'owner' || false,
        login,
        logout,
        toggleInvisibility,
        setInvisible,
        updateName,
        createAdmin,
        getAdmins,
        updateAdmin,
        deleteAdmin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

