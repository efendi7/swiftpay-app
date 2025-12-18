import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ClipboardList,
  ArrowDownCircle,
  BarChart2,
  User,
  PlusCircle,
} from 'lucide-react-native';
import { COLORS } from '../../constants/colors';

interface BottomNavigationProps {
  onInventoryPress: () => void;
  onReportPress: () => void;
  onFabPress: () => void;
  bottomInset: number;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  onInventoryPress,
  onReportPress,
  onFabPress,
  bottomInset,
}) => {
  return (
    <View style={[styles.footerWrapper, { paddingBottom: bottomInset }]}>
      <View style={styles.navContainer}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={onInventoryPress}
          accessibilityLabel="Inventaris"
          accessibilityRole="button"
        >
          <ClipboardList size={24} color={COLORS.textLight} />
          <Text style={styles.navLabel}>Inventaris</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          accessibilityLabel="Masuk"
          accessibilityRole="button"
        >
          <ArrowDownCircle size={24} color={COLORS.textLight} />
          <Text style={styles.navLabel}>Masuk</Text>
        </TouchableOpacity>

        {/* Space untuk FAB */}
        <View style={{ width: 75 }} />

        <TouchableOpacity
          style={styles.navItem}
          onPress={onReportPress}
          accessibilityLabel="Laporan"
          accessibilityRole="button"
        >
          <BarChart2 size={24} color={COLORS.textLight} />
          <Text style={styles.navLabel}>Laporan</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          accessibilityLabel="Profil"
          accessibilityRole="button"
        >
          <User size={24} color={COLORS.textLight} />
          <Text style={styles.navLabel}>Profil</Text>
        </TouchableOpacity>
      </View>

      {/* FAB Button */}
      <TouchableOpacity
        style={[styles.fabButton, { bottom: 25 + bottomInset }]}
        activeOpacity={0.9}
        onPress={onFabPress}
        accessibilityLabel="Tambah Produk"
        accessibilityRole="button"
      >
        <LinearGradient
          colors={[COLORS.secondary, '#008e85']}
          style={styles.fabGradient}
        >
          <PlusCircle size={32} color="#FFF" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  footerWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    elevation: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  navContainer: {
    height: 70,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  navItem: {
    alignItems: 'center',
    flex: 1,
  },
  navLabel: {
    fontSize: 10,
    color: COLORS.textLight,
    marginTop: 4,
  },
  fabButton: {
    position: 'absolute',
    alignSelf: 'center',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.background,
    padding: 6,
    zIndex: 100,
  },
  fabGradient: {
    flex: 1,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
});