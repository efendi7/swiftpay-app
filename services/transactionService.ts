import { db } from './firebaseConfig';
import { 
  runTransaction, 
  doc, 
  collection, 
  serverTimestamp,
  increment 
} from 'firebase/firestore';

/**
 * Fungsi untuk menangani proses checkout transaksi
 * Mencatat transaksi ke Firestore dan membuat log aktivitas otomatis
 */
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
      // 1. Validasi Stok secara Atomik
      for (const item of cartItems) {
        const productRef = doc(db, 'products', item.id);
        const productDoc = await transaction.get(productRef);
        
        if (!productDoc.exists()) {
          throw new Error(`Produk ${item.name} tidak ditemukan!`);
        }

        const currentStock = productDoc.data().stock;
        if (currentStock < item.qty) {
          throw new Error(`Stok ${item.name} tidak cukup. Tersisa: ${currentStock}`);
        }
      }

      // 2. Generate Nomor Transaksi dari Counter
      const counterRef = doc(db, 'counters', 'transactions');
      const counterSnap = await transaction.get(counterRef);
      let nextNumber = 1;
      if (counterSnap.exists()) {
        nextNumber = (counterSnap.data()?.count || 0) + 1;
      }
      transaction.set(counterRef, { count: increment(1) }, { merge: true });

      const year = new Date().getFullYear();
      const transactionNumber = `TRX-${year}-${String(nextNumber).padStart(4, '0')}`;

      // 3. Update Stok Produk
      cartItems.forEach((item) => {
        const pRef = doc(db, 'products', item.id);
        transaction.update(pRef, { stock: increment(-item.qty) });
      });

      // 4. Simpan Data Transaksi Utama
      const transactionRef = doc(collection(db, 'transactions'));
      transaction.set(transactionRef, {
        transactionNumber,
        cashierId: user.uid,
        cashierName: user.displayName || user.email?.split('@')[0] || 'Kasir',
        cashierEmail: user.email,
        total: total,
        cashAmount: cashAmount,
        changeAmount: changeAmount,
        paymentMethod: paymentMethod,
        date: serverTimestamp(),
        createdAt: serverTimestamp(),
        items: cartItems.map(item => ({
          productId: item.id,
          productName: item.name,
          qty: item.qty,
          price: item.price,
          subtotal: item.qty * item.price
        }))
      });

      // 5. LOG AKTIVITAS - Format Kalimat Sesuai Permintaan
      const activityRef = doc(collection(db, 'activities'));
      
      // Hitung total quantity produk yang keluar
      const totalQty = cartItems.reduce((sum, item) => sum + item.qty, 0);

      // Format daftar produk: 2 unit "Indomie", 1 unit "Susu"
      const productList = cartItems.map(item => `${item.qty} unit "${item.name}"`).join(', ');
      
      // Format nominal harga ke Rupiah
      const formattedPrice = `Rp ${total.toLocaleString('id-ID')}`;
      const method = paymentMethod.toUpperCase();
      
      // Susun pesan utama
      let message = `Kasir Checkout total ${totalQty} produk yaitu ${productList} via ${method} seharga ${formattedPrice}`;
      
      // Tambahkan detail kembalian jika ada
      if (paymentMethod === 'cash' && changeAmount > 0) {
        const formattedChange = `Rp ${changeAmount.toLocaleString('id-ID')}`;
        message += ` dengan kembalian ${formattedChange}`;
      }

      // Simpan log ke koleksi activities
      transaction.set(activityRef, {
        type: 'OUT',
        message: message,
        userName: user.displayName || user.email?.split('@')[0] || 'Kasir',
        createdAt: serverTimestamp(),
      });

      return { success: true, transactionNumber };
    });
  } catch (e) {
    console.error("Transaction Error: ", e);
    throw e;
  }
};