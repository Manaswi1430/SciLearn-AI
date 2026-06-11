import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';
import { 
  registerUser, 
  loginUser, 
  logoutUser 
} from '../firebase/auth';
import { 
  createUserProfile, 
  getUserProfile 
} from '../firebase/firestore';

const AuthContext = createContext(null);

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  // Sync auth state with Firestore profile
  useEffect(() => {
    console.log('[AuthSync] Initializing onAuthStateChanged subscriber.');
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('[AuthSync] onAuthStateChanged listener triggered. user:', user ? user.email : 'null');
      if (user) {
        setCurrentUser(user);
        try {
          console.log('[AuthSync] Fetching Firestore profile for UID:', user.uid);
          let profile = await getUserProfile(user.uid);
          if (!profile) {
            console.log('[AuthSync] Profile not found. Executing fallback creation.');
            profile = await createUserProfile(user.uid, user.displayName || '', user.email);
          }
          console.log('[AuthSync] Firestore profile successfully loaded:', profile.username);
          setUserProfile(profile);
        } catch (error) {
          console.error('[AuthSync] Error in profile fetch hook:', error);
        }
      } else {
        console.log('[AuthSync] No active session. Resetting states.');
        setCurrentUser(null);
        setUserProfile(null);
      }
      setInitializing(false);
      console.log('[AuthSync] Sync resolved. initializing: false');
    });

    return unsubscribe;
  }, []);

  // Register function
  const register = async (email, password, username) => {
    console.log('[AuthContext] register called:', email, username);
    setLoading(true);
    try {
      const user = await registerUser(email, password);
      console.log('[AuthContext] Firebase Auth register user created:', user.uid);
      const profile = await createUserProfile(user.uid, username, email);
      console.log('[AuthContext] Firestore profile created:', profile);
      setCurrentUser(user);
      setUserProfile(profile);
      setLoading(false);
      return user;
    } catch (error) {
      console.error('[AuthContext] register failed:', error);
      setLoading(false);
      throw error;
    }
  };

  // Login function
  const login = async (email, password) => {
    console.log('[AuthContext] login called:', email);
    setLoading(true);
    try {
      const user = await loginUser(email, password);
      console.log('[AuthContext] Firebase Auth sign-in success:', user.uid);
      const profile = await getUserProfile(user.uid);
      console.log('[AuthContext] Firestore profile retrieved:', profile);
      setCurrentUser(user);
      setUserProfile(profile);
      setLoading(false);
      return user;
    } catch (error) {
      console.error('[AuthContext] login failed:', error);
      setLoading(false);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    console.log('[AuthContext] logout called.');
    setLoading(true);
    try {
      await logoutUser();
      console.log('[AuthContext] Firebase Auth sign-out success.');
      setCurrentUser(null);
      setUserProfile(null);
    } catch (error) {
      console.error('[AuthContext] logout failed:', error);
      throw error;
    } finally {
      setLoading(false);
      console.log('[AuthContext] Logout resolved. loading: false');
    }
  };

  // Refresh profile details (e.g. after lesson complete or profile update)
  const refreshProfile = async () => {
    if (currentUser) {
      try {
        const profile = await getUserProfile(currentUser.uid);
        setUserProfile(profile);
        return profile;
      } catch (error) {
        console.error('Error refreshing profile:', error);
      }
    }
  };

  const value = {
    currentUser,
    userProfile,
    loading,
    login,
    register,
    logout,
    refreshProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!initializing && children}
    </AuthContext.Provider>
  );
};
