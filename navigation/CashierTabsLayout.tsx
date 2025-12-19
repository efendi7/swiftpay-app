import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import CashierDashboard from '../screens/Main/CashierDashboard';
import TransactionScreen from '../screens/Main/TransactionScreen';
import ProductScreen from '../screens/Main/ProductScreen'; // Import ProductScreen
import { BottomNavigation } from '../components/dashboard/BottomNavigation';
import { CashierTabParamList, RootStackParamList } from './types';

const Tab = createBottomTabNavigator<CashierTabParamList>();

const CashierTabsLayout = () => {
  const rootNav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <Tab.Navigator
      tabBar={(props) => (
        <BottomNavigation 
          {...props} 
          // Tombol FAB (Scan) akan membuka layar Cashier (Mesin Jualan)
          onFabPress={() => rootNav.navigate('Cashier')} 
        />
      )}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="CashierDashboard" component={CashierDashboard} />
      <Tab.Screen name="Product" component={ProductScreen} />
      <Tab.Screen name="Transaction" component={TransactionScreen} />
    </Tab.Navigator>
  );
};

export default CashierTabsLayout;