import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut 
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, COLLECTIONS } from '../firebase/config';

const googleProvider = new GoogleAuthProvider();

export const registerWithEmail = async (name, email, password) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  
  // Save user data to Firestore
  await setDoc(doc(db, COLLECTIONS.USERS, user.uid), {
    name: name,
    email: email,
    isGoogleAuth: false,
    createdAt: new Date().toISOString(),
    uid: user.uid
  });
  
  return user;
};

export const loginWithEmail = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

export const loginWithGoogle = async () => {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;
  
  // Check if user document exists, if not create it
  const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, user.uid));
  if (!userDoc.exists()) {
    await setDoc(doc(db, COLLECTIONS.USERS, user.uid), {
      name: user.displayName,
      email: user.email,
      isGoogleAuth: true,
      createdAt: new Date().toISOString(),
      uid: user.uid
    });
  }
  
  return user;
};

export const logout = async () => {
  await signOut(auth);
};

export const getUserData = async (uid) => {
  const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, uid));
  return userDoc.exists() ? userDoc.data() : null;
};