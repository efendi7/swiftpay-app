// components/products/ProductList.tsx
import React from 'react';
import { FlatList, Text, StyleSheet, View } from 'react-native';
import ProductCard from './ProductCard';
import { Product } from '../../types/product.types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
  data: Product[];
  refreshing: boolean;
  onRefresh: () => void;
  onEditPress?: (product: Product) => void;
}

const ProductList = ({ data, refreshing, onRefresh, onEditPress }: Props) => {
  const insets = useSafeAreaInsets();

  return (
    <FlatList<Product>
      data={data}
      renderItem={({ item }) => {
        // Hanya pass onEditPress jika ada
        const cardProps: any = { item };
        if (onEditPress) {
          cardProps.onEditPress = onEditPress;
        }
        
        return <ProductCard {...cardProps} />;
      }}
      keyExtractor={item => item.id}
      contentContainerStyle={[
        styles.contentContainer,
        {
          paddingBottom: insets.bottom + 100,
          paddingTop: 20,
        },
      ]}
      refreshing={refreshing}
      onRefresh={onRefresh}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={styles.empty}>Belum ada produk. Tambah produk baru!</Text>
        </View>
      }
    />
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
  },
  empty: {
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: 16,
  },
});

export default ProductList;