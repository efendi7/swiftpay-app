import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  // Tambahkan Onboarding di sini
  Onboarding: undefined; 
  
  Login: undefined;
  Register: undefined;
  
  // NavigatorScreenParams digunakan untuk navigasi antar nested navigator
  AdminTabs: NavigatorScreenParams<AdminTabParamList>; 
  CashierTabs: NavigatorScreenParams<CashierTabParamList>; 
  
  // Screen mandiri (Full Screen)
  Cashier: undefined;   
  CreateCashier: undefined; 
};

export type AdminTabParamList = {
  AdminDashboard: undefined;
  Product: undefined;
  Transaction: undefined;
  Profile: undefined;
  CreateCashier: undefined;  
  CashierManagement: undefined;
};

export type CashierTabParamList = {
  CashierDashboard: undefined;
  Product: undefined;
  Transaction: undefined;
  Profile: undefined;
};