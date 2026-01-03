import React, { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AdminDashboard from '../screens/Main/dashboard/admin/AdminDashboard';
import ProductScreen from '../screens/Main/product/ProductScreen';
import TransactionScreen from '../screens/Main/transaction/TransactionScreen';
import ProfileScreen from '../screens/Main/profile/ProfileScreen'; 
// --- Import Screen Create Cashier ---
import CreateCashierScreen from '../screens/Main/profile/CreateCashierScreen'; 
import CashierManagementScreen from '../screens/Main/profile/CashierManagementScreen';

import { AdminTabParamList } from './types';
import { BottomNavigation } from '../components/common/BottomNavigation';
import AddProductModal from '../screens/Main/product/modal/AddProductModal';

const Tab = createBottomTabNavigator<AdminTabParamList>();

const AdminTabsLayout = () => {
  const insets = useSafeAreaInsets();
  const [showAddProduct, setShowAddProduct] = useState(false);

  const handleProductAdded = () => {
    setShowAddProduct(false);
  };

  return (
    <>
      <Tab.Navigator
        tabBar={(props) => (
          <BottomNavigation
            {...props}
            onFabPress={() => setShowAddProduct(true)}
          />
        )}
        screenOptions={{ headerShown: false }}
      >
        <Tab.Screen name="AdminDashboard" component={AdminDashboard} />
        <Tab.Screen name="Product" component={ProductScreen} />
        <Tab.Screen name="Transaction" component={TransactionScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} /> 
        
        {/* --- Tambahkan Screen CreateCashier di sini --- */}
        {/* Note: Jika ditaruh di sini, screen ini akan memiliki 
           bottom tabs di bagian bawahnya. 
        */}
        <Tab.Screen 
          name="CreateCashier" 
          component={CreateCashierScreen}
          options={{
            tabBarButton: () => null, // Sembunyikan tombolnya dari Bottom Bar
          }} 
        /> 
        <Tab.Screen 
          name="CashierManagement" 
          component={CashierManagementScreen}
          options={{
            tabBarButton: () => null, // Sembunyikan tombolnya dari Bottom Bar
          }} 
        />
      </Tab.Navigator>

      <AddProductModal
        visible={showAddProduct}
        onClose={() => setShowAddProduct(false)}
        onSuccess={handleProductAdded}
      />
    </>
  );
};

export default AdminTabsLayout;