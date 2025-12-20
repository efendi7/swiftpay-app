import React, { useState, useEffect, useCallback } from 'react';
import { SafeAreaView, StatusBar, View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../services/firebaseConfig';
import { COLORS } from '../../constants/colors';
// Import ikon Package
import { Package } from 'lucide-react-native'; 

import { ScreenHeader } from '../../components/common/ScreenHeader';
import SearchBar from '../../components/products/SearchBar';
import FilterSection from '../../components/products/FilterSection';
import ProductList from '../../components/products/ProductList';
import FloatingAddButton from '../../components/products/FloatingAddButton';
import EditProductModal from '../Main/modal/EditProductModal';
import { Product } from '../../types/product.types';

type SortType = 'newest' | 'oldest' | 'stock-high' | 'stock-low' | 'low-stock-warn' | 'safe-stock';
type FilterMode = 'all' | 'specificMonth' | 'today';

const ProductScreen = ({ navigation }: any) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'kasir'>('kasir');

  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [sortType, setSortType] = useState<SortType>('newest');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const fetchUserRole = useCallback(async () => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserRole(userData.role);
        }
      }
    } catch (error) {
      console.error("Error fetching user role:", error);
    }
  }, []);

  const loadProducts = useCallback(async () => {
    try {
      setRefreshing(true);
      const snapshot = await getDocs(collection(db, 'products'));
      const productsList: Product[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Product));
      setProducts(productsList);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchUserRole();
    loadProducts();
  }, [fetchUserRole, loadProducts]);

  useFocusEffect(
    useCallback(() => {
      fetchUserRole();
      loadProducts();
    }, [fetchUserRole, loadProducts])
  );

  const handleEditPress = (product: Product) => {
    setSelectedProduct(product);
    setShowEditModal(true);
  };

  const filterProps = {
    products,
    searchQuery,
    filterMode,
    sortType,
    selectedMonth,
    selectedYear,
    onFiltered: setFilteredProducts,
    onFilterModeChange: (newMode: FilterMode) => setFilterMode(newMode),
    onSortChange: (newSort: SortType) => setSortType(newSort),
    onMonthChange: setSelectedMonth,
    onYearChange: setSelectedYear,
  };

  if (loading && products.length === 0) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={COLORS.secondary} />
        <Text style={styles.loaderText}>Memuat produk...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Tambahkan ikon Package di sini */}
      <ScreenHeader 
        title="Daftar Produk" 
        subtitle="Manajemen Stok & Harga" 
        icon={<Package size={24} color="#FFFF"  />}
      />

      <View style={styles.contentWrapper}>
        <View style={styles.filterSearchContainer}>
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
          <FilterSection {...filterProps} />
        </View>
        
        <ProductList 
          data={filteredProducts} 
          refreshing={refreshing} 
          onRefresh={loadProducts}
          onEditPress={handleEditPress}
        />
      </View>

      {userRole === 'admin' && (
        <FloatingAddButton onPress={() => navigation?.navigate('AddProduct')} />
      )}

      <EditProductModal
        visible={showEditModal}
        product={selectedProduct}
        userRole={userRole}
        onClose={() => {
          setShowEditModal(false);
          setSelectedProduct(null);
        }}
        onSuccess={loadProducts}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.primary 
  },
  loaderContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#F8FAFC' 
  },
  loaderText: { 
    marginTop: 10, 
    color: COLORS.textLight, 
    fontFamily: 'PoppinsRegular' 
  },
  contentWrapper: { 
    flex: 1, 
    backgroundColor: '#F8FAFC', 
    borderTopLeftRadius: 30, 
    borderTopRightRadius: 30, 
    marginTop: -20, 
    overflow: 'hidden' 
  },
  filterSearchContainer: { 
    paddingTop: 24, 
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 16, 
  }
});

export default ProductScreen;