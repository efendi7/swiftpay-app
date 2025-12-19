import { db } from './firebaseConfig';
import { 
  runTransaction, 
  doc, 
  collection, 
  serverTimestamp // <--- Tambahkan impor ini
} from 'firebase/firestore';

/**
 * Fungsi untuk menangani proses checkout transaksi
 * Mengurangi stok produk dan menyimpan riwayat transaksi secara atomik
 */
export const handleCheckout = async (cartItems: any[], total: number, cashierId: string) => {
    try {
        await runTransaction(db, async (transaction) => {
            // 1. Validasi Stok & Dapatkan Product DocRefs
            for (const item of cartItems) {
                const productRef = doc(db, 'products', item.id);
                const productDoc = await transaction.get(productRef);

                if (!productDoc.exists()) {
                    throw "Produk tidak ditemukan!";
                }

                const currentStock = productDoc.data().stock;
                const newStock = currentStock - item.qty;
                
                if (newStock < 0) {
                    throw `Stok ${productDoc.data().name} tidak cukup.`;
                }

                // 2. Update Stok ke Database
                transaction.update(productRef, { stock: newStock });
            }

            // 3. Simpan Data Transaksi
            const transactionRef = doc(collection(db, 'transactions')); 
            const now = new Date();
            
            transaction.set(transactionRef, {
                transactionNumber: `TRX-${now.getTime()}`, // Generator nomor transaksi sederhana
                cashierId: cashierId,
                total: total,
                date: now,
                createdAt: serverTimestamp(), // Menggunakan serverTimestamp dari Firestore
                items: cartItems.map(item => ({ 
                    productId: item.id, 
                    qty: item.qty, 
                    price: item.price,
                    subtotal: item.qty * item.price 
                }))
            });
        });
        
        console.log("Transaksi berhasil disimpan.");
        return { success: true };

    } catch (e) {
        console.error("Checkout gagal: ", e);
        throw e; // Lemparkan error agar bisa ditangkap oleh UI/Component
    }
};