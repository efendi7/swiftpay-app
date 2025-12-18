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
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';

import { Mail, User, Lock } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { registerUser } from '../../services/authService';
import FloatingLabelInput from '../../components/FloatingLabelInput';

type RegisterNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Register'>;

const { height } = Dimensions.get('window');

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
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 7, tension: 40, useNativeDriver: true }),
    ]).start();

    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const keyboardDidShowListener = Keyboard.addListener(showEvent, () => setKeyboardVisible(true));
    const keyboardDidHideListener = Keyboard.addListener(hideEvent, () => setKeyboardVisible(false));

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

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
      Alert.alert('Error', 'Password tidak cocok.');
      return;
    }

    setIsLoading(true);
    try {
      await registerUser(email.trim(), password, fullName.trim());
      Alert.alert('Sukses', 'Akun berhasil dibuat!', [{ text: 'OK', onPress: () => navigation.replace('Login') }]);
    } catch (error: any) {
      Alert.alert('Registrasi Gagal', error.message || 'Terjadi kesalahan.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[
          styles.card, 
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
        ]}>
          <Image 
            source={require('../../assets/iconmain.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          
          <Text style={styles.title}>Daftar Akun Baru</Text>
          <Text style={styles.subtitle}>
            Bergabung dengan SwiftStock dan mulai kelola produk Anda dengan mudah!
          </Text>

          <FloatingLabelInput
            label="Email Kasir"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            icon={<Mail size={20} color="#7f8c8d" />}
          />

          <FloatingLabelInput
            label="Nama Lengkap Kasir"
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
            icon={<User size={20} color="#7f8c8d" />}
          />

          <FloatingLabelInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            isPassword
            icon={<Lock size={20} color="#7f8c8d" />}
          />

          <FloatingLabelInput
            label="Konfirmasi Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            isPassword
            icon={<Lock size={20} color="#7f8c8d" />}
          />

          <TouchableOpacity
            onPress={handleRegister}
            disabled={isLoading}
            activeOpacity={0.8}
            style={[styles.registerButton, isLoading && styles.registerButtonDisabled]}
          >
            {isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.registerButtonText}>Daftar Sekarang</Text>}
          </TouchableOpacity>

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
        
        {/* Footer diletakkan di dalam Scroll agar ada jarak natural */}
        {!isKeyboardVisible && (
          <Text style={styles.footerText}>Swiftstock by Efendi | © 2025</Text>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center', // Membuat konten tetap di tengah jika layar besar
    alignItems: 'center',
    paddingVertical: 40, // Memberi ruang atas dan bawah agar tidak mentok
    paddingHorizontal: 20,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: COLORS.cardBg,
    borderRadius: 25,
    padding: 25,
    // Shadow tetap ada
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: { elevation: 8 },
    }),
  },
  logo: {
    width: '100%',
    height: 60,
    alignSelf: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    color: COLORS.primary,
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: 'MontserratBold',
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textLight,
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 18,
    fontFamily: 'PoppinsRegular',
  },
  registerButton: {
    backgroundColor: COLORS.secondary,
    height: 55,
    borderRadius: 12,
    marginTop: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerButtonDisabled: {
    backgroundColor: COLORS.disabled,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'PoppinsSemiBold',
  },
  loginLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  loginText: {
    color: COLORS.textLight,
    fontSize: 14,
    fontFamily: 'PoppinsRegular',
  },
  loginTextHighlight: {
    color: COLORS.primary,
    fontFamily: 'PoppinsSemiBold',
  },
  footerText: {
    marginTop: 30, // Memberi jarak dari card
    fontSize: 12,
    color: COLORS.textLight,
    fontFamily: 'PoppinsRegular',
    textAlign: 'center',
  },
});

export default RegisterScreen;