import { db } from './firebaseConfig';
import { 
  runTransaction, 
  doc, 
  collection, 
  serverTimestamp,
  increment,
  getDocs,
  writeBatch 
} from 'firebase/firestore';

/**
 * 1. FUNGSI MIGRASI DATA LAMA (Jalankan sekali dari Profile)
 */
export const migrateSoldCount = async () => {
  try {
    console.log("Memulai migrasi soldCount...");
    const transactionsSnap = await getDocs(collection(db, 'transactions'));
    const soldMap: Record<string, number> = {};

    // Hitung total dari semua transaksi lama
    transactionsSnap.forEach(docSnap => {
      const data = docSnap.data();
      const items = data.items || [];
      items.forEach((item: any) => {
        if (item.productId) {
          soldMap[item.productId] = (soldMap[item.productId] || 0) + (item.qty || 0);
        }
      });
    });

    // Update dokumen produk menggunakan Batch
    const batch = writeBatch(db);
    const productsSnap = await getDocs(collection(db, 'products'));
    
    productsSnap.forEach(prodDoc => {
      const totalSold = soldMap[prodDoc.id] || 0;
      batch.update(prodDoc.ref, { soldCount: totalSold });
    });

    await batch.commit();
    return { success: true };
  } catch (error) {
    console.error("Migrasi Gagal:", error);
    throw error;
  }
};

/**
 * 2. FUNGSI CHECKOUT (Update Stok & SoldCount Real-time)
 */
// ... (import tetap sama)

export const handleCheckoutProcess = async (
  cartItems: any[], 
  total: number, 
  user: any,
  cashAmount: number,
  changeAmount: number,
  paymentMethod: 'cash' | 'qris' = 'cash'
) => {
  try {
    return await runTransaction(db, async (transaction) => {
      // 1. Validasi Stok
      for (const item of cartItems) {
        const productRef = doc(db, 'products', item.id);
        const productDoc = await transaction.get(productRef);
        if (!productDoc.exists()) throw new Error(`Produk ${item.name} tidak ditemukan!`);
        const currentStock = productDoc.data().stock;
        if (currentStock < item.qty) throw new Error(`Stok ${item.name} tidak cukup.`);
      }

      // 2. Nomor Transaksi
      const counterRef = doc(db, 'counters', 'transactions');
      const counterSnap = await transaction.get(counterRef);
      let nextNumber = (counterSnap.data()?.count || 0) + 1;
      transaction.set(counterRef, { count: increment(1) }, { merge: true });

      const transactionNumber = `TRX-${new Date().getFullYear()}-${String(nextNumber).padStart(4, '0')}`;

      // 3. Update Stok & SoldCount
      cartItems.forEach((item) => {
        const pRef = doc(db, 'products', item.id);
        transaction.update(pRef, { 
          stock: increment(-item.qty),
          soldCount: increment(item.qty) 
        });
      });

      // 4. Simpan Transaksi
      // 4. Simpan Transaksi
const transactionRef = doc(collection(db, 'transactions'));
transaction.set(transactionRef, {
  transactionNumber,
  // TAMBAHKAN FIELD INI AGAR MANAGEMENT SCREEN TIDAK 0
  cashierId: user.uid, 
  cashierEmail: user.email,
  cashierName: user.displayName || 'Kasir',
  total,
  date: serverTimestamp(),
  cashAmount,      // Tambahkan juga agar data transaksi lengkap
  changeAmount,    // Tambahkan juga agar data transaksi lengkap
  paymentMethod,
  items: cartItems.map(item => ({
    productId: item.id, // Pastikan productId disimpan di sini juga
    productName: item.name,
    qty: item.qty,
    price: item.price,
    subtotal: item.qty * item.price
  }))
});

      // 5. Simpan Log Aktivitas (DIPERBAIKI)
const activityRef = doc(collection(db, 'activities'));

const productDetails = cartItems.map(item => 
  `${item.qty} unit "${item.name}" seharga Rp ${item.price.toLocaleString('id-ID')}`
).join(', ');

const message = `Penjualan ${transactionNumber}: ${productDetails}. Total Rp ${total.toLocaleString('id-ID')}`;

transaction.set(activityRef, {
  type: 'KELUAR',
  message: message,
  userName: user.displayName || 'Kasir',
  userId: user.uid,           // <--- TAMBAHKAN INI (ID User yang sedang login)
  createdAt: serverTimestamp(), // <--- SUDAH BENAR (Pastikan terkirim ke Firestore)
});

      return { success: true, transactionNumber };
    });
  } catch (e) {
    console.error(e);
    throw e;
  }
};