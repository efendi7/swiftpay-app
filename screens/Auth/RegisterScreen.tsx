import React from 'react';
import {
  Text,
  StyleSheet,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../navigation/types';
import { COLORS } from '../../constants/theme';
import { useRegister } from '../../hooks/auth/useRegister';
import { useKeyboardVisibility } from '../../hooks/auth/useKeyboardVisibility';
import { useFadeScaleAnimation } from '../../hooks/auth/useFadeScaleAnimation';
import RegisterForm from '../../components/auth/RegisterForm';

type NavProp =
  NativeStackNavigationProp<RootStackParamList, 'Register'>;

const RegisterScreen = () => {
  const navigation = useNavigation<NavProp>();
  const keyboardVisible = useKeyboardVisibility();
  const { fade, scale } = useFadeScaleAnimation();

  const register = useRegister(() =>
    navigation.replace('Login')
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Animated.View
          style={[
            styles.card,
            { opacity: fade, transform: [{ scale }] },
          ]}
        >
          <Image
            source={require('../../assets/iconmain.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          <Text style={styles.title}>Daftar Akun Baru</Text>
          <Text style={styles.subtitle}>
            Bergabung dengan SwiftStock dan mulai kelola produk Anda dengan mudah!
          </Text>

          <RegisterForm
            fullName={register.fullName}
            email={register.email}
            password={register.password}
            confirmPassword={register.confirmPassword}
            loading={register.loading}
            onFullNameChange={register.setFullName}
            onEmailChange={register.setEmail}
            onPasswordChange={register.setPassword}
            onConfirmPasswordChange={register.setConfirmPassword}
            onSubmit={register.submit}
            onLoginPress={() => navigation.navigate('Login')}
          />
        </Animated.View>

        {!keyboardVisible && (
          <Text style={styles.footer}>
            Swiftstock by Efendi • © 2025
          </Text>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 24,
    elevation: 8,
  },
  logo: {
    height: 60,
    alignSelf: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    color: COLORS.primary,
    fontFamily: 'MontserratBold',
  },
  subtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 24,
    color: COLORS.textLight,
    fontFamily: 'PoppinsRegular',
  },
  footer: {
    marginTop: 28,
    textAlign: 'center',
    fontSize: 12,
    color: COLORS.textLight,
    fontFamily: 'PoppinsRegular',
  },
});
