import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const token = await result.user.getIdToken();
      
      // Sync with backend
      const res = await axios.post('http://localhost:5000/api/users/sync', {
        name: result.user.displayName,
        email: result.user.email,
        picture: result.user.photoURL,
        uid: result.user.uid
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setUserData(res.data);
      return result;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const logout = () => {
    setUserData(null);
    return signOut(auth);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const token = await user.getIdToken();
          const res = await axios.post('http://localhost:5000/api/users/sync', {
            name: user.displayName,
            email: user.email,
            picture: user.photoURL,
            uid: user.uid
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUserData(res.data);
        } catch (error) {
          console.error("Error syncing user:", error);
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userData,
    loginWithGoogle,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
