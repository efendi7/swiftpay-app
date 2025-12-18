import React, { useEffect } from 'react';
import { View } from 'react-native'; // Tambahan untuk layouting jika perlu
import AppNavigator from './navigation/AppNavigator';

// 1. Import SafeAreaProvider
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import font
import { useFonts } from 'expo-font';
import {
  Montserrat_300Light,
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
  Montserrat_800ExtraBold,
  Montserrat_900Black,
} from '@expo-google-fonts/montserrat';

import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';

import * as SplashScreen from 'expo-splash-screen';

// Mencegah splash screen hilang sebelum font siap
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    // Montserrat untuk title (bold & modern)
    MontserratLight: Montserrat_300Light,
    MontserratRegular: Montserrat_400Regular,
    MontserratMedium: Montserrat_500Medium,
    MontserratSemiBold: Montserrat_600SemiBold,
    MontserratBold: Montserrat_700Bold,
    MontserratExtraBold: Montserrat_800ExtraBold,
    MontserratBlack: Montserrat_900Black,

    // Poppins untuk subtitle & body
    PoppinsRegular: Poppins_400Regular,
    PoppinsMedium: Poppins_500Medium,
    PoppinsSemiBold: Poppins_600SemiBold,
    PoppinsBold: Poppins_700Bold,
  });

  useEffect(() => {
    // Sembunyikan splash screen jika font sudah loading atau ada error
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Jika font belum siap, jangan render apapun (Splash screen tetap tampil)
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    // 2. Bungkus dengan SafeAreaProvider agar insets bisa digunakan di semua screen
    <SafeAreaProvider>
      <AppNavigator />
    </SafeAreaProvider>
  );
}