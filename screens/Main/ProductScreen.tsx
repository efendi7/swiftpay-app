import React, { useState, useEffect, useCallback } from 'react';
import { SafeAreaView, StatusBar, View, ActivityIndicator, Text } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore'; // Tambah doc & getDoc
import { auth, db } from '../../services/firebaseConfig'; // Pastikan auth diimport
import { COLORS } from '../../constants/colors';

import { ScreenHeader } from '../../components/common/ScreenHeader';
import { RoundedContentScreen } from '../../components/common/RoundedContentScreen';

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

  // ✅ PERBAIKAN: State role sekarang dinamis
  const [userRole, setUserRole] = useState<'admin' | 'kasir'>('kasir'); // Default ke kasir untuk keamanan

  // State untuk Edit Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [sortType, setSortType] = useState<SortType>('newest');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // ✅ FUNGSI BARU: Ambil Role dari Firestore
  const fetchUserRole = useCallback(async () => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        // Ambil dokumen user berdasarkan UID dari koleksi 'users'
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserRole(userData.role); // Set role sesuai data di Firestore ("admin" atau "kasir")
          console.log("Current User Role:", userData.role);
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

  // ✅ Ambil role dan data produk saat komponen dimuat
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

  const handleSortChange = (newSort: SortType) => {
    setSortType(newSort);
  };

  const handleFilterModeChange = (newMode: FilterMode) => {
    setFilterMode(newMode);
  };

  const handleEditPress = (product: Product) => {
    setSelectedProduct(product);
    setShowEditModal(true);
  };

  const handleEditSuccess = () => {
    loadProducts();
  };

  const filterProps = {
    products,
    searchQuery,
    filterMode,
    sortType,
    selectedMonth,
    selectedYear,
    onFiltered: setFilteredProducts,
    onFilterModeChange: handleFilterModeChange,
    onSortChange: handleSortChange,
    onMonthChange: setSelectedMonth,
    onYearChange: setSelectedYear,
  };

  if (loading && products.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
        <ActivityIndicator size="large" color={COLORS.secondary} />
        <Text style={{ marginTop: 10, color: COLORS.textLight, fontFamily: 'PoppinsRegular' }}>Memuat produk...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.primary }}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <ScreenHeader title="Daftar Produk" subtitle="Manajemen Stok & Harga" />

      <RoundedContentScreen>
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
        
        <FilterSection {...filterProps} />
        
        <ProductList 
          data={filteredProducts} 
          refreshing={refreshing} 
          onRefresh={loadProducts}
          onEditPress={handleEditPress}
        />
      </RoundedContentScreen>

      {/* ✅ Tombol Tambah hanya muncul untuk admin */}
      {userRole === 'admin' && (
        <FloatingAddButton onPress={() => navigation?.navigate('AddProduct')} />
      )}

      <EditProductModal
        visible={showEditModal}
        product={selectedProduct}
        userRole={userRole} // ✅ Role dikirim secara dinamis
        onClose={() => {
          setShowEditModal(false);
          setSelectedProduct(null);
        }}
        onSuccess={handleEditSuccess}
      />
    </SafeAreaView>
  );
};

export default ProductScreen;