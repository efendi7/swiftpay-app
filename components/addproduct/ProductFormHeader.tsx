import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';

interface ProductFormHeaderProps {
  onClose: () => void;
  isModal?: boolean;
  title?: string;
  subtitle?: string;
}

export const ProductFormHeader: React.FC<ProductFormHeaderProps> = ({
  onClose,
  isModal = false,
  title = "Tambah Produk",
  subtitle = "Manajemen Produk"
}) => {
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={[COLORS.primary, '#2c537a']}
      // Menggunakan logika padding yang sama persis dengan ScreenHeader
      style={[
        styles.header, 
        { paddingTop: isModal ? 16 : insets.top + 12 }
      ]}
    >
      {/* Drag Handle diposisikan absolut agar tidak mendorong konten utama ke bawah */}
      {isModal && (
        <View style={styles.dragHandleContainer}>
          <View style={styles.dragHandle} />
        </View>
      )}

      <View style={styles.headerContent}>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerSubtitle}>{subtitle}</Text>
          <Text style={styles.headerTitle}>{title}</Text>
        </View>

        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <X size={26} color="#FFF" />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  header: {
    // DISAMAKAN: Padding bawah 36 mengikuti ScreenHeader
    paddingBottom: 36, 
    paddingHorizontal: 20,
  },
  dragHandleContainer: {
    position: 'absolute',
    top: 8,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // DISAMAKAN: Margin top 20 mengikuti ScreenHeader
    marginTop: 20, 
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontFamily: 'MontserratSemiBold',
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 22,
    fontFamily: 'PoppinsBold',
    marginTop: 4,
    lineHeight: 28,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ProductFormHeader;