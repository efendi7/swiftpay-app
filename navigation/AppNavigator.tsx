import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { onAuthStateChanged, User } from 'firebase/auth';

import { auth } from '../services/firebaseConfig';
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import CashierScreen from '../screens/Main/CashierScreen';
import AdminTabsLayout from './AdminTabsLayout';
import CashierTabsLayout from './CashierTabsLayout'; // Import ini
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<'admin' | 'kasir' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const token = await currentUser.getIdTokenResult();
        // Fallback ke 'kasir' jika claim role tidak ada
        setRole((token.claims.role as 'admin' | 'kasir') ?? 'kasir');
        setUser(currentUser);
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#00A79D" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : role === 'admin' ? (
          <Stack.Screen name="AdminTabs" component={AdminTabsLayout} />
        ) : (
          <>
            {/* Jalur Kasir menggunakan Tab Layout */}
            <Stack.Screen name="CashierTabs" component={CashierTabsLayout} />
            {/* Screen jualan/scan tetap di Stack agar Full Screen */}
            <Stack.Screen name="Cashier" component={CashierScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default AppNavigator;