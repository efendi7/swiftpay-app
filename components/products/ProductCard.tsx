import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Package, ChevronRight } from 'lucide-react-native';
import { COLORS } from '../../constants/colors';
import { Product } from '../../types/product.types';

interface Props {
  item: Product;
  onEditPress: (product: Product) => void; 
}

const ProductCard = ({ item, onEditPress }: Props) => {
  const isLowStock = item.stock < 10;

  return (
    <TouchableOpacity 
      style={styles.card}
      // SEKARANG: Langsung panggil onEditPress (yang akan membuka EditProductModal sebagai detail)
      onPress={() => onEditPress(item)} 
      activeOpacity={0.8}
    >
      {/* GAMBAR PRODUK */}
      <View style={styles.imageContainer}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
        ) : (
          <View style={[styles.placeholderImage, { backgroundColor: isLowStock ? '#FFF5F5' : '#F0F9FF' }]}>
            <Package size={24} color={isLowStock ? COLORS.danger : COLORS.primary} />
          </View>
        )}
      </View>
      
      <View style={styles.content}>
        <Text style={styles.categoryText}>{item.category || 'Tanpa Kategori'}</Text>
        <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
        
        <View style={styles.footerRow}>
          <Text style={styles.priceText}>Rp {item.price.toLocaleString('id-ID')}</Text>
          <View style={[styles.stockBadgeSmall, { backgroundColor: isLowStock ? '#FFF5F5' : '#F0FDF4' }]}>
            <View style={[styles.dot, { backgroundColor: isLowStock ? COLORS.danger : COLORS.success }]} />
            <Text style={[styles.stockValue, { color: isLowStock ? COLORS.danger : COLORS.success }]}>
              {item.stock} stok
            </Text>
          </View>
        </View>
      </View>

      <ChevronRight size={18} color="#CBD5E1" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 20,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
  },
  imageContainer: {
    width: 64,
    height: 64,
    borderRadius: 14,
    overflow: 'hidden',
    marginRight: 14,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  categoryText: {
    fontSize: 10,
    fontFamily: 'PoppinsSemiBold',
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  name: {
    fontSize: 15,
    fontFamily: 'PoppinsBold',
    color: '#1E293B',
    marginBottom: 4,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 10,
  },
  priceText: {
    fontSize: 14,
    fontFamily: 'PoppinsBold',
    color: COLORS.secondary,
  },
  stockBadgeSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  stockValue: {
    fontSize: 11,
    fontFamily: 'PoppinsSemiBold',
  },
});

export default ProductCard;