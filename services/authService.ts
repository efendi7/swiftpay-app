// src/services/authService.ts
import { auth, db } from './firebaseConfig';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  User,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

/**
 * Parse Firebase Auth Error ke pesan user-friendly
 */
const parseAuthError = (error: any): { title: string; message: string } => {
  // Di production, jangan expose detail error Firebase
  if (IS_PRODUCTION) {
    return {
      title: 'Login Gagal',
      message: 'Terjadi kesalahan saat login. Silakan coba lagi.',
    };
  }

  // Development: tampilkan pesan spesifik
  let title = 'Login Gagal';
  let message = 'Terjadi kesalahan saat login. Silakan coba lagi.';

  if (error.code) {
    switch (error.code) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        title = 'Password atau Email Salah';
        message = 'Email atau password yang Anda masukkan salah.';
        break;
      case 'auth/invalid-email':
        title = 'Email Tidak Valid';
        message = 'Format email yang Anda masukkan tidak valid.';
        break;
      case 'auth/user-disabled':
        title = 'Akun Dinonaktifkan';
        message = 'Akun Anda telah dinonaktifkan. Silakan hubungi administrator.';
        break;
      case 'auth/too-many-requests':
        title = 'Terlalu Banyak Percobaan';
        message = 'Terlalu banyak percobaan login gagal. Silakan coba lagi nanti.';
        break;
      case 'auth/network-request-failed':
        title = 'Koneksi Bermasalah';
        message = 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
        break;
      default:
        message = error.message || message;
    }
  }

  return { title, message };
};

/**
 * Login User + Ambil Role dari Firestore
 */
export const loginUser = async (
  email: string,
  password: string
): Promise<{ user: User; role: 'admin' | 'kasir' }> => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email.trim().toLowerCase(),
      password
    );
    const user = userCredential.user;

    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const role = userDoc.exists() && userDoc.data()?.role === 'admin' 
      ? 'admin' 
      : 'kasir';

    console.log(`Login berhasil: ${user.email} → Role: ${role}`);
    return { user, role };
  } catch (error: any) {
    console.error('Login error:', error);
    const parsedError = parseAuthError(error);
    const customError = new Error(parsedError.message);
    (customError as any).title = parsedError.title;
    throw customError;
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
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email.trim().toLowerCase(),
      password
    );
    const user = userCredential.user;

    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: email.trim().toLowerCase(),
      displayName: displayName?.trim() || email.split('@')[0],
      role: 'kasir',
      createdAt: new Date(),
      photoURL: null,
    });

    console.log('Registrasi sukses:', user.uid);
  } catch (error: any) {
    console.error('Registrasi error:', error);
    throw error;
  }
};

/**
 * Kirim Email Reset Password
 */
export const sendPasswordReset = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email.trim().toLowerCase());
    console.log('Email reset password terkirim ke:', email);
  } catch (error: any) {
    console.error('Reset password error:', error);
    
    // Parse error untuk reset password
    if (IS_PRODUCTION) {
      throw new Error('Gagal mengirim email reset password.');
    }

    let message = 'Gagal mengirim email reset password.';
    if (error.code === 'auth/user-not-found') {
      message = 'Email tidak terdaftar.';
    } else if (error.code === 'auth/invalid-email') {
      message = 'Format email tidak valid.';
    }
    
    throw new Error(message);
  }
};