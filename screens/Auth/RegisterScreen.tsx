// RegisterScreen.tsx - COMPLETE FIXED VERSION

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Alert,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Animated,
  Dimensions,
  Keyboard,
  Platform,
  Image,
} from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { registerUser } from '../../services/authService';
import FloatingLabelInput from '../../components/FloatingLabelInput';

type RegisterNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Register'>;

const { height } = Dimensions.get('window');

// --- KONSTANTA WARNA DARI LOGO (SAMA SEPERTI LOGIN) ---
const COLORS = {
  primary: '#1C3A5A',
  secondary: '#00A79D',
  accent: '#F58220',
  background: '#F5F5F5',
  cardBg: '#FFFFFF',
  textDark: '#444444',
  textLight: '#7f8c8d',
  disabled: '#95a5a6',
};

const RegisterScreen = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  const navigation = useNavigation<RegisterNavigationProp>();

  // --- Hooks Animasi ---
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    // Animasi Pintu Masuk
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 7,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Listener untuk Keyboard
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setKeyboardVisible(true),
    );
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardVisible(false),
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [fadeAnim, scaleAnim]);

  // --- Fungsi Register ---
const handleRegister = async () => {
  if (!email || !password || !confirmPassword || !fullName.trim()) {
    Alert.alert('Error', 'Semua field harus diisi.');
    return;
  }

  if (password.length < 6) {
    Alert.alert('Error', 'Password minimal 6 karakter.');
    return;
  }

  if (password !== confirmPassword) {
    Alert.alert('Error', 'Password dan Konfirmasi Password tidak sama.');
    return;
  }

  setIsLoading(true);


    try {
    // Kirim fullName ke registerUser
    await registerUser(email.trim(), password, fullName.trim());

    Alert.alert(
      'Pendaftaran Sukses',
      'Akun kasir berhasil dibuat!',
      [{ text: 'OK', onPress: () => navigation.replace('Login') }]
    );
  } catch (error: any) {
      let errorMessage = 'Pendaftaran gagal.';

      if (error.code) {
        switch (error.code) {
          case 'auth/email-already-in-use':
            errorMessage = 'Email ini sudah terdaftar.';
            break;
          case 'auth/invalid-email':
            errorMessage = 'Format email tidak valid.';
            break;
          case 'auth/weak-password':
            errorMessage = 'Password terlalu lemah (minimal 6 karakter).';
            break;
          default:
            errorMessage = error.message || 'Terjadi kesalahan.';
        }
      }

      Alert.alert('Registrasi Gagal', errorMessage);
      console.error('Registration Error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // --- Komponen Tombol Kustom dengan Animasi Sentuhan - FIXED ---
  const AnimatedRegisterButton = ({ title, onPress, disabled }: any) => {
    const pressAnim = useRef(new Animated.Value(1)).current;

    const onPressIn = () => {
      Animated.spring(pressAnim, { 
        toValue: 0.96, 
        useNativeDriver: true,
        speed: 50,
        bounciness: 0,
      }).start();
    };
    
    const onPressOut = () => {
      Animated.spring(pressAnim, { 
        toValue: 1, 
        useNativeDriver: true,
        speed: 50,
        bounciness: 0,
      }).start();
    };

    return (
      <TouchableOpacity
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        disabled={disabled}
        activeOpacity={0.9}
        style={[styles.registerButtonContainer, disabled && styles.registerButtonDisabled]}
      >
        <Animated.View 
          style={{ 
            transform: [{ scale: pressAnim }],
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {disabled ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.registerButtonText}>{title}</Text>
          )}
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Container utama untuk Register Card */}
      <Animated.View style={[
        styles.card, 
        { 
          opacity: fadeAnim, 
          transform: [
            { scale: scaleAnim },
            { translateY: isKeyboardVisible ? (Platform.OS === 'ios' ? -height * 0.12 : -height * 0.08) : 0 },
          ]
        }
      ]}>
        {/* Logo Image */}
        <Image 
          source={require('../../assets/login.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        
        <Text style={styles.title}>Daftar Akun Baru</Text>
        <Text style={styles.subtitle}>Buat akun kasir untuk aplikasi POS</Text>

        

        {/* Input Email */}
        <FloatingLabelInput
          label="Email Kasir"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {/* Input Nama Lengkap */}
<FloatingLabelInput
  label="Nama Lengkap Kasir"
  value={fullName}
  onChangeText={setFullName}
  autoCapitalize="words"
/>

        {/* Input Password */}
        <FloatingLabelInput
          label="Password (min 6 karakter)"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {/* Input Konfirmasi Password */}
        <FloatingLabelInput
          label="Konfirmasi Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        {/* Tombol Register */}
        <AnimatedRegisterButton
          title="Daftar Sekarang"
          onPress={handleRegister}
          disabled={isLoading}
        />

        {/* Link Kembali ke Login */}
        <TouchableOpacity
          style={styles.loginLink}
          onPress={() => navigation.navigate('Login')}
          disabled={isLoading}
        >
          <Text style={styles.loginText}>
            Sudah punya akun? <Text style={styles.loginTextHighlight}>Masuk di sini</Text>
          </Text>
        </TouchableOpacity>
      </Animated.View>
      
      {/* Teks Footer */}
      {!isKeyboardVisible && (
        <Animated.Text 
          style={[styles.footerText, { opacity: fadeAnim }]}
        >
          Swiftpay | © 2025
        </Animated.Text>
      )}
    </View>
  );
};

// --- STYLING DENGAN SKEMA WARNA LOGO ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    padding: 30,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 15,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  logo: {
    width: 120,
    height: 120,
    alignSelf: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    color: COLORS.primary,
    marginBottom: 5,
    textAlign: 'center',
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textDark,
    marginBottom: 25,
    textAlign: 'center',
    fontWeight: '500',
  },
  // --- Styling Tombol Register - FIXED ---
  registerButtonContainer: {
    backgroundColor: COLORS.accent,
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.accent,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  registerButtonDisabled: {
    backgroundColor: COLORS.disabled,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  // --- Styling Link Login ---
  loginLink: {
    marginTop: 25,
    alignItems: 'center',
  },
  loginText: {
    color: COLORS.textLight,
    fontSize: 15,
  },
  loginTextHighlight: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  footerText: {
    marginTop: 40,
    fontSize: 12,
    color: COLORS.textLight,
    position: 'absolute',
    bottom: 20,
  }
});

export default RegisterScreen;