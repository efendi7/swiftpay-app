import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { db, auth } from '../../services/firebaseConfig';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  runTransaction,
  serverTimestamp,
  increment,
} from 'firebase/firestore';
import BarcodeScannerScreen from './BarcodeScannerScreen';

interface Product {
  id: string;
  name: string;
  barcode: string;
  price: number;
  stock: number;
}

interface CartItem extends Product {
  qty: number;
}

const CashierScreen = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showScanner, setShowScanner] = useState(false);
  const [loading, setLoading] = useState(false);

  // =========================
  // GET PRODUCT BY BARCODE
  // =========================
  const getProductByBarcode = async (barcode: string) => {
    try {
      setLoading(true);
      const q = query(
        collection(db, 'products'),
        where('barcode', '==', barcode)
      );

      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        Alert.alert('Error', 'Produk tidak ditemukan');
        return;
      }

      const docSnap = snapshot.docs[0];
      const product = { id: docSnap.id, ...docSnap.data() } as Product;
      addToCart(product);
    } catch (e) {
      Alert.alert('Error', 'Gagal mengambil produk');
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // CART LOGIC
  // =========================
  const addToCart = (product: Product) => {
    const exist = cart.find(i => i.id === product.id);
    if (exist) {
      if (exist.qty + 1 > product.stock) {
        Alert.alert('Error', 'Stok tidak cukup');
        return;
      }
      setCart(cart.map(i =>
        i.id === product.id ? { ...i, qty: i.qty + 1 } : i
      ));
    } else {
      if (product.stock < 1) {
        Alert.alert('Error', 'Stok habis');
        return;
      }
      setCart([...cart, { ...product, qty: 1 }]);
    }
  };

  const updateQty = (id: string, qty: number) => {
    if (qty < 1) {
      setCart(cart.filter(i => i.id !== id));
      return;
    }
    setCart(cart.map(i => i.id === id ? { ...i, qty } : i));
  };

  const calculateTotal = () =>
    cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  // =========================
  // CHECKOUT DENGAN NOMOR URUT RAPI
  // =========================
  const handleCheckout = async () => {
    if (cart.length === 0) {
      Alert.alert('Error', 'Keranjang kosong');
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Error', 'User belum login');
      return;
    }

    try {
      setLoading(true);

      let transactionNumber = '';

      await runTransaction(db, async (transaction) => {
        // 1️⃣ Baca semua produk untuk validasi stok
        const productRefs = cart.map(item => doc(db, 'products', item.id));
        const productSnaps = await Promise.all(
          productRefs.map(ref => transaction.get(ref))
        );

        // Validasi stok
        productSnaps.forEach((snap, index) => {
          if (!snap.exists()) {
            throw new Error(`Produk ${cart[index].name} tidak ditemukan`);
          }
          const stock = snap.data()?.stock || 0;
          if (stock < cart[index].qty) {
            throw new Error(`Stok ${cart[index].name} tidak cukup (sisa: ${stock})`);
          }
        });

        // 2️⃣ Increment counter transaksi
        const counterRef = doc(db, 'counters', 'transactions');
        const counterSnap = await transaction.get(counterRef);

        let nextNumber = 1;
        if (counterSnap.exists()) {
          nextNumber = (counterSnap.data()?.count || 0) + 1;
        }

        // Update counter
        transaction.set(counterRef, { count: increment(1) }, { merge: true });

        // 3️⃣ Format nomor transaksi: TRX-2025-0001
        const year = new Date().getFullYear();
        const padded = String(nextNumber).padStart(4, '0');
        transactionNumber = `TRX-${year}-${padded}`;

        // 4️⃣ Update stok produk
        productSnaps.forEach((snap, index) => {
          const currentStock = snap.data()?.stock || 0;
          transaction.update(productRefs[index], {
            stock: currentStock - cart[index].qty,
          });
        });

        // 5️⃣ Simpan transaksi dengan nomor urut
        const newTransRef = doc(collection(db, 'transactions'));
        transaction.set(newTransRef, {
          cashierId: user.uid,
          total: calculateTotal(),
          date: serverTimestamp(),
          transactionNumber: transactionNumber, // ← NOMOR URUT RAPI
          items: cart.map(item => ({
            productId: item.id,
            productName: item.name,
            qty: item.qty,
            price: item.price,
          })),
        });
      });

      // Sukses!
      Alert.alert(
        'Transaksi Berhasil!',
        `Nomor Transaksi:\n#${transactionNumber}\n\nTotal: Rp ${calculateTotal().toLocaleString('id-ID')}`,
        [{ text: 'OK', onPress: () => setCart([]) }]
      );
    } catch (e: any) {
      Alert.alert('Transaksi Gagal', e.message || 'Terjadi kesalahan');
      console.error('Checkout error:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kasir</Text>

      <TouchableOpacity
        style={styles.scanButton}
        onPress={() => setShowScanner(true)}
      >
        <Text style={styles.scanText}>📷 Scan Barcode</Text>
      </TouchableOpacity>

      <FlatList
        data={cart}
        keyExtractor={i => i.id}
        renderItem={({ item }) => (
          <View style={styles.cartItem}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text>Rp {item.price.toLocaleString('id-ID')}</Text>
            <View style={styles.qtyRow}>
              <TouchableOpacity onPress={() => updateQty(item.id, item.qty - 1)}>
                <Text style={styles.qtyBtn}>-</Text>
              </TouchableOpacity>
              <Text style={styles.qtyText}>{item.qty}</Text>
              <TouchableOpacity onPress={() => updateQty(item.id, item.qty + 1)}>
                <Text style={styles.qtyBtn}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Keranjang kosong</Text>}
      />

      <View style={styles.totalContainer}>
        <Text style={styles.totalLabel}>Total:</Text>
        <Text style={styles.totalAmount}>
          Rp {calculateTotal().toLocaleString('id-ID')}
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.checkout, loading && styles.checkoutDisabled]}
        onPress={handleCheckout}
        disabled={loading || cart.length === 0}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.checkoutText}>Checkout</Text>
        )}
      </TouchableOpacity>

      <BarcodeScannerScreen
        visible={showScanner}
        onClose={() => setShowScanner(false)}
        onScan={getProductByBarcode}
      />
    </View>
  );
};

export default CashierScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f9f9f9' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  scanButton: { backgroundColor: '#2196F3', padding: 14, borderRadius: 10, marginBottom: 16 },
  scanText: { color: '#fff', textAlign: 'center', fontSize: 16, fontWeight: '600' },
  cartItem: { 
    padding: 12, 
    backgroundColor: '#fff', 
    marginBottom: 8, 
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 1,
  },
  itemName: { fontSize: 16, fontWeight: '600', flex: 1 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  qtyBtn: { fontSize: 20, fontWeight: 'bold', color: '#2196F3' },
  qtyText: { fontSize: 16, width: 30, textAlign: 'center' },
  empty: { textAlign: 'center', color: '#999', marginTop: 30 },
  totalContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginVertical: 16,
    elevation: 2,
  },
  totalLabel: { fontSize: 18, fontWeight: 'bold' },
  totalAmount: { fontSize: 20, fontWeight: 'bold', color: '#4CAF50' },
  checkout: { 
    backgroundColor: '#4CAF50', 
    padding: 16, 
    borderRadius: 10,
    alignItems: 'center',
  },
  checkoutDisabled: { backgroundColor: '#95a5a6' },
  checkoutText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});