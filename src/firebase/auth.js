import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut
} from 'firebase/auth';
import { auth } from './config';

// Password Validation
export const validatePassword = (password) => {
  if (!password || password.length < 6) {
    return 'Password must be at least 6 characters long.';
  }
  return null;
};

// Friendly error messages mapper
export const getFriendlyAuthErrorMessage = (error) => {
  if (!error) return 'An unexpected error occurred. Please try again.';
  
  const code = error.code || '';
  switch (code) {
    case 'auth/invalid-email':
      return 'The email address is invalid.';
    case 'auth/user-disabled':
      return 'This user account has been disabled.';
    case 'auth/user-not-found':
      return 'No user found with this email address.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/email-already-in-use':
      return 'This email address is already in use by another account.';
    case 'auth/weak-password':
      return 'The password is too weak. It must be at least 6 characters.';
    case 'auth/network-request-failed':
      return 'A network error occurred. Please check your internet connection.';
    case 'auth/too-many-requests':
      return 'Too many login attempts. Please try again later.';
    case 'auth/invalid-credential':
      return 'Invalid email or password credentials.';
    case 'auth/configuration-not-found':
      return 'Email/Password sign-in is not enabled in your Firebase Console. Please go to Firebase Console > Build > Authentication > Sign-in method, and enable the Email/Password provider.';
    default:
      return error.message || 'An error occurred during authentication.';
  }
};

// Email Registration
export const registerUser = async (email, password) => {
  const passwordError = validatePassword(password);
  if (passwordError) {
    throw new Error(passwordError);
  }
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    const friendlyMessage = getFriendlyAuthErrorMessage(error);
    throw new Error(friendlyMessage);
  }
};

// Email Login
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    const friendlyMessage = getFriendlyAuthErrorMessage(error);
    throw new Error(friendlyMessage);
  }
};

// Logout
export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    const friendlyMessage = getFriendlyAuthErrorMessage(error);
    throw new Error(friendlyMessage);
  }
};
