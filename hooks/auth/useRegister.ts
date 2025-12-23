import { useState } from 'react';
import { Alert } from 'react-native';
import { registerUser } from '../../services/authService';

export const useRegister = (onSuccess?: () => void) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!fullName.trim() || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Semua field harus diisi.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password minimal 6 karakter.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Password tidak cocok.');
      return;
    }

    setLoading(true);
    try {
      await registerUser(email.trim(), password, fullName.trim());
      Alert.alert('Sukses', 'Akun berhasil dibuat!', [
        { text: 'OK', onPress: onSuccess },
      ]);
    } catch (error: any) {
      Alert.alert(
        'Registrasi Gagal',
        error?.message || 'Terjadi kesalahan.'
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    fullName,
    email,
    password,
    confirmPassword,
    loading,
    setFullName,
    setEmail,
    setPassword,
    setConfirmPassword,
    submit,
  };
};
