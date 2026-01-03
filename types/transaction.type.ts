import { Timestamp } from 'firebase/firestore';

export type FilterMode = 'all' | 'specificMonth' | 'today';
export type SortType = 'latest' | 'oldest';

export interface Transaction {
  id: string;
  transactionNumber: string; // ✅ Buat wajib karena setiap TRX pasti punya nomor
  cashierId: string;
  cashierName: string;       // ✅ Buat wajib untuk tampilan List
  cashierEmail?: string; 
  total: number;
  
  cashAmount: number;        // ✅ Buat wajib sesuai data Firestore Anda
  changeAmount: number;      // ✅ Buat wajib sesuai data Firestore Anda
  paymentMethod: 'cash' | 'qris'; 
  
  // ✅ Gunakan 'date' sebagai primary karena query kita menggunakan ini
  date: Timestamp;      
  createdAt: Timestamp;  
  items: TransactionItem[];
}

export interface TransactionItem {
  productId: string;
  productName: string; // ✅ Buat wajib agar List Produk di detail TRX aman
  qty: number;
  price: number;
  subtotal: number;
}