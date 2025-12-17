// src/services/authService.ts

import { auth, db } from './firebaseConfig';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  User,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

/**
 * Login User + Ambil Role dari Firestore
 */
export const loginUser = async (
  email: string,
  password: string
): Promise<{ user: User; role: 'admin' | 'kasir' }> => {
  try {
    // Login ke Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
    const user = userCredential.user;

    // Ambil dokumen user dari Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));

    // Tentukan role: jika dokumen ada dan role 'admin' → admin, selain itu → kasir
    const role = userDoc.exists() && userDoc.data()?.role === 'admin' 
      ? 'admin' 
      : 'kasir';

    console.log(`Login berhasil: ${user.email} → Role: ${role}`);
    return { user, role };
  } catch (error: any) {
    console.error('Login error:', error);
    throw error; // biarkan error naik ke UI (ditangkap di LoginScreen)
  }
};

/**
 * Register User Baru + Simpan ke Firestore
 */
export const registerUser = async (
  email: string,
  password: string,
  displayName?: string
): Promise<void> => {
  try {
    // Buat user di Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email.trim().toLowerCase(),
      password
    );
    const user = userCredential.user;

    // Simpan data lengkap ke Firestore collection 'users'
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: email.trim().toLowerCase(),
      displayName: displayName?.trim() || email.split('@')[0],
      role: 'kasir', // default semua kasir baru
      createdAt: new Date(),
      photoURL: null,
    });

    console.log('Registrasi sukses + data disimpan ke Firestore:', user.uid);
  } catch (error: any) {
    console.error('Registrasi error:', error);
    throw error; // lempar ke UI
  }
};