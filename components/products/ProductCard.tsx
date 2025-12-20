import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Edit2, Package, AlertTriangle } from 'lucide-react-native';
import { COLORS } from '../../constants/colors';
import { Product } from '../../types/product.types';

interface ProductCardProps {
  product: Product;
  onEditPress: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onEditPress }) => {
  // Logika stok rendah (misal: di bawah 10 unit)
  const isLowStock = product.stock < 10;

  return (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => onEditPress(product)}
      activeOpacity={0.8}
    >
      {/* 1. IMAGE CONTAINER (SISI KIRI) */}
      <View style={styles.imageContainer}>
        {product.imageUrl ? (
          <Image source={{ uri: product.imageUrl }} style={styles.productImage} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Package size={24} color="#CBD5E1" />
          </View>
        )}
      </View>

      {/* 2. CONTENT AREA */}
      <View style={styles.content}>
        
        {/* ROW ATAS: NAMA & BADGE STOK RENDAH */}
        <View style={styles.headerRow}>
          <Text style={styles.productName} numberOfLines={1}>
            {product.name}
          </Text>
          
          {isLowStock && (
            <View style={styles.lowStockBadge}>
              <AlertTriangle size={10} color="#EF4444" />
              <Text style={styles.lowStockText}>Stok Rendah</Text>
            </View>
          )}
        </View>

        {/* ROW TENGAH: BARCODE & INFO UNIT */}
        <View style={styles.infoRow}>
          <Text style={styles.barcodeText} numberOfLines={1}>
            {product.barcode}
          </Text>
          <View style={styles.stockBadge}>
            <Package size={12} color="#64748B" />
            <Text style={styles.stockText}>{product.stock} stok</Text>
          </View>
        </View>

        {/* ROW BAWAH: HARGA & ICON EDIT */}
        <View style={styles.footerRow}>
          <Text style={styles.priceText}>
            Rp {product.price.toLocaleString('id-ID')}
          </Text>
          <Edit2 size={16} color="#CBD5E1" />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 20,
    marginBottom: 12,
    flexDirection: 'row', // Membuat Gambar dan Konten berjejer ke samping
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  imageContainer: {
    width: 70,
    height: 70,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    marginRight: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Memaksa Badge Stok Rendah ke kanan
    alignItems: 'center',
    marginBottom: 4,
  },
  productName: {
    fontSize: 15,
    fontFamily: 'PoppinsSemiBold',
    color: '#1E293B',
    flex: 1, // Mengambil ruang sisa agar badge tetap di ujung kanan
    marginRight: 8,
  },
  lowStockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  lowStockText: {
    fontSize: 8,
    fontFamily: 'PoppinsBold',
    color: '#EF4444',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  barcodeText: {
    fontSize: 11,
    fontFamily: 'PoppinsMedium',
    color: '#64748B',
    flex: 1,
  },
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  stockText: {
    fontSize: 11,
    fontFamily: 'PoppinsSemiBold',
    color: '#64748B',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  priceText: {
    fontSize: 16,
    fontFamily: 'PoppinsBold',
    color: '#000',
  },
});

export default ProductCard;