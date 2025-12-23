import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Mail, User, Lock } from 'lucide-react-native';

import FloatingLabelInput from '../FloatingLabelInput';
import { COLORS } from '../../constants/theme';

type Props = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  loading: boolean;
  onFullNameChange: (v: string) => void;
  onEmailChange: (v: string) => void;
  onPasswordChange: (v: string) => void;
  onConfirmPasswordChange: (v: string) => void;
  onSubmit: () => void;
  onLoginPress: () => void;
};

const RegisterForm = ({
  fullName,
  email,
  password,
  confirmPassword,
  loading,
  onFullNameChange,
  onEmailChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onSubmit,
  onLoginPress,
}: Props) => {
  return (
    <View>
      <FloatingLabelInput
        label="Email Kasir"
        value={email}
        onChangeText={onEmailChange}
        keyboardType="email-address"
        autoCapitalize="none"
        icon={<Mail size={20} color={COLORS.textLight} />}
      />

      <FloatingLabelInput
        label="Nama Lengkap Kasir"
        value={fullName}
        onChangeText={onFullNameChange}
        autoCapitalize="words"
        icon={<User size={20} color={COLORS.textLight} />}
      />

      <FloatingLabelInput
        label="Password"
        value={password}
        onChangeText={onPasswordChange}
        secureTextEntry
        isPassword
        icon={<Lock size={20} color={COLORS.textLight} />}
      />

      <FloatingLabelInput
        label="Konfirmasi Password"
        value={confirmPassword}
        onChangeText={onConfirmPasswordChange}
        secureTextEntry
        isPassword
        icon={<Lock size={20} color={COLORS.textLight} />}
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.disabled]}
        onPress={onSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.buttonText}>Daftar Sekarang</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.loginLink}
        onPress={onLoginPress}
        disabled={loading}
      >
        <Text style={styles.loginText}>
          Sudah punya akun?{' '}
          <Text style={styles.loginHighlight}>Masuk di sini</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default RegisterForm;

const styles = StyleSheet.create({
  button: {
    height: 55,
    marginTop: 16,
    borderRadius: 12,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabled: {
    backgroundColor: COLORS.disabled,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'PoppinsSemiBold',
  },
  loginLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
    color: COLORS.textLight,
    fontFamily: 'PoppinsRegular',
  },
  loginHighlight: {
    color: COLORS.primary,
    fontFamily: 'PoppinsSemiBold',
  },
});
