// components/dashboard/DashboardHeader.tsx
import React from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Bell, LogOut } from 'lucide-react-native';
import { COLORS } from '../../constants/colors';

interface BaseDashboardHeaderProps {
  headerHeight: Animated.AnimatedInterpolation<number | string>;
  contentOpacity?: Animated.AnimatedInterpolation<number | string>; // ← Tambahkan ini
  topPadding: number;
  displayName: string;
  role: string;
  gradientColors?: readonly [string, string]; // ← Ubah ke readonly tuple
  children?: React.ReactNode;
  onNotificationPress?: () => void;
  onLogoutPress?: () => void;
  showNotification?: boolean;
  showLogout?: boolean;
}

export const DashboardHeader: React.FC<BaseDashboardHeaderProps> = ({
  headerHeight,
  contentOpacity,
  topPadding,
  displayName,
  role,
  gradientColors = [COLORS.primary, COLORS.primary] as const, // ← Tambahkan 'as const'
  children,
  onNotificationPress,
  onLogoutPress,
  showNotification = true,
  showLogout = false,
}) => {
  return (
    <Animated.View style={[styles.headerContainer, { height: headerHeight }]}>
      <LinearGradient
        colors={gradientColors as any} // ← Atau gunakan type assertion
        style={StyleSheet.absoluteFillObject}
      />
      
      <View style={[styles.headerContent, { paddingTop: topPadding }]}>
        {/* Top Bar - Nama & Action Button */}
        <View style={styles.topBar}>
          <View style={styles.userInfo}>
            <Text style={styles.greeting}>
              {showLogout ? 'Selamat Datang, ' : 'Halo, '}{role}
            </Text>
            <Text style={styles.userName}>{displayName}</Text>
          </View>
          
          {/* Conditional Action Button */}
          {showNotification && onNotificationPress && (
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={onNotificationPress}
            >
              <Bell size={20} color="#FFF" />
              <View style={styles.notificationDot} />
            </TouchableOpacity>
          )}
          
          {showLogout && onLogoutPress && (
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={onLogoutPress}
            >
              <LogOut size={18} color="#FFF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Content Area - Konten custom dari child */}
        <Animated.View style={{ opacity: contentOpacity || 1 }}>
          {children}
        </Animated.View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    overflow: 'hidden',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 5,
  },
  headerContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 50,
  },
  userInfo: {
    flex: 1,
  },
  greeting: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    fontFamily: 'PoppinsRegular',
  },
  userName: {
    fontSize: 18,
    fontFamily: 'MontserratBold',
    color: '#FFF',
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
    borderWidth: 2,
    borderColor: '#FFF',
  },
});