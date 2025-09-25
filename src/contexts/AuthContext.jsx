import React, { createContext, useContext, useEffect, useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // Simple hash for demo, in real app use proper auth
    const hashedPassword = btoa(password); // Not secure, for demo only
    const userRef = doc(db, 'users', email);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const data = userSnap.data();
      if (data.password === hashedPassword) {
        const userData = { email: data.email, id: data.id };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        return true;
      }
    }
    return false;
  };

  const register = async (email, password) => {
    const hashedPassword = btoa(password);
    const userRef = doc(db, 'users', email);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      const userId = Date.now().toString();
      await setDoc(userRef, { email, password: hashedPassword, id: userId });
      const userData = { email, id: userId };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};