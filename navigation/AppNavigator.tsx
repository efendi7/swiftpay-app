import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

// Screens
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import AdminDashboard from '../screens/Main/AdminDashboard';
import CashierDashboard from '../screens/Main/CashierDashboard';

import CashierScreen from '../screens/Main/CashierScreen';
import ProductScreen from '../screens/Main/ProductScreen';
import TransactionScreen from '../screens/Main/TransactionScreen';

// Firebase
import { auth } from '../services/firebaseConfig';
import { onAuthStateChanged, User } from 'firebase/auth';

// --- KONSTANTA WARNA ---
const COLORS = {
  primary: '#1C3A5A',
  secondary: '#00A79D',
  accent: '#F58220',
  background: '#F5F5F5',
  cardBg: '#FFFFFF',
  textDark: '#444444',
  textLight: '#7f8c8d',
};

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  AdminDashboard: undefined;
  CashierDashboard: undefined;
  Cashier: undefined;
  Product: undefined;
  Transaction: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const getUserRole = async (user: User): Promise<string> => {
  try {
    const token = await user.getIdTokenResult();
    return (token.claims.role as string) || 'kasir';
  } catch (error) {
    console.error('Gagal ambil role:', error);
    return 'kasir';
  }
};

const AppNavigator = () => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<'admin' | 'kasir' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const userRole = await getUserRole(currentUser);
        setRole(userRole as 'admin' | 'kasir');
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={COLORS.secondary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        // ✅ HEADER DINONAKTIFKAN SECARA GLOBAL DISINI
        screenOptions={{
          headerShown: false, 
          contentStyle: { backgroundColor: COLORS.background }
        }}
      >
        {user ? (
          <>
            {role === 'admin' ? (
              <Stack.Screen
                name="AdminDashboard"
                component={AdminDashboard}
              />
            ) : (
              <Stack.Screen
                name="CashierDashboard"
                component={CashierDashboard}
              />
            )}

            <Stack.Screen name="Cashier" component={CashierScreen} />
            <Stack.Screen name="Product" component={ProductScreen} />
            <Stack.Screen name="Transaction" component={TransactionScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
});

export default AppNavigator;