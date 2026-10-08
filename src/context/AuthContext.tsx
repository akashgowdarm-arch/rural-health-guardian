import React, { createContext, useContext, useState } from 'react';
import { User, UserRole } from '../types';
import { MOCK_USERS } from '../services/mockData';

interface AuthContextType {
  currentUser: User;
  allUsers: User[];
  role: UserRole;
  isAuthenticated: boolean;
  switchUser: (userId: string) => void;
  switchRole: (newRole: UserRole) => void;
  login: (phone: string, role: UserRole) => boolean;
  register: (userData: Partial<User>) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [currentUser, setCurrentUser] = useState<User>(MOCK_USERS[0]); // Default: Ramesh Kumar (Patient)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);

  const switchUser = (userId: string) => {
    const found = users.find(u => u.id === userId);
    if (found) {
      setCurrentUser(found);
      setIsAuthenticated(true);
    }
  };

  const switchRole = (newRole: UserRole) => {
    const matchingUser = users.find(u => u.role === newRole);
    if (matchingUser) {
      setCurrentUser(matchingUser);
    } else {
      // Fallback
      setCurrentUser(prev => ({ ...prev, role: newRole }));
    }
  };

  const login = (phone: string, role: UserRole): boolean => {
    const existing = users.find(u => u.phone.includes(phone) || u.role === role);
    if (existing) {
      setCurrentUser(existing);
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const register = (userData: Partial<User>) => {
    const newUser: User = {
      id: `user_${Date.now()}`,
      name: userData.name || 'New Citizen',
      age: userData.age || 35,
      gender: userData.gender || 'male',
      phone: userData.phone || '+91 99000 11222',
      village: userData.village || 'Rampur',
      district: userData.district || 'Varanasi',
      state: userData.state || 'Uttar Pradesh',
      role: userData.role || 'patient',
      emergency_contact: userData.emergency_contact || {
        name: 'Family Member',
        relationship: 'Relative',
        phone: '+91 99000 11223',
      },
      blood_group: userData.blood_group || 'B+',
      known_conditions: userData.known_conditions || [],
      asha_worker_id: 'worker_sunita',
      created_at: new Date().toISOString(),
    };

    setUsers(prev => [newUser, ...prev]);
    setCurrentUser(newUser);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        allUsers: users,
        role: currentUser.role,
        isAuthenticated,
        switchUser,
        switchRole,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
