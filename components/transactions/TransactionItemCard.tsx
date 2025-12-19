import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { Receipt, X, ChevronRight, ShoppingBag, User } from 'lucide-react-native';
import { Transaction } from '../../types/transaction.type'; // ✅ FIXED: Import dari type yang benar
import { formatCurrency, getDisplayId, formatDate } from '../../utils/transactionsUtils';

interface Props {
  transaction: Transaction;
  isAdmin: boolean;
  onPress?: () => void;
}

export const TransactionItemCard: React.FC<Props> = ({ transaction, isAdmin }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const displayId = getDisplayId(transaction);
  const itemCount = transaction.items.length;
  
  // ✅ FIXED: Handle both Timestamp and Date
  const getDate = () => {
    if (!transaction.date) {
      return transaction.createdAt?.toDate() || new Date();
    }
    return transaction.date.toDate ? transaction.date.toDate() : new Date();
  };
  
  const date = getDate();

  const formatDateTime = (date: Date) => {
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      <TouchableOpacity
        style={styles.card}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        {/* Content */}
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <Text style={styles.idText}>{displayId}</Text>
            {isAdmin && transaction.cashierName && (
              <View style={styles.cashierBadge}>
                <User size={12} color="#00A79D" />
                <Text style={styles.cashierName}>{transaction.cashierName}</Text>
              </View>
            )}
          </View>
          
          <Text style={styles.dateText}>{formatDateTime(date)}</Text>

          <View style={styles.footerRow}>
            <Text style={styles.totalText}>{formatCurrency(transaction.total)}</Text>
            <View style={styles.itemBadge}>
              <ShoppingBag size={12} color="#64748B" />
              <Text style={styles.itemCount}>{itemCount} item</Text>
            </View>
          </View>
        </View>

        <ChevronRight size={18} color="#CBD5E1" />
      </TouchableOpacity>

   {/* MODAL DETAIL TRANSAKSI */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Detail Transaksi</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <X size={20} color="#1E293B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalBody}>
                
                {/* Transaction Info Card */}
                <View style={styles.infoCard}>
                  {/* Baris 1: ID Transaksi */}
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>ID Transaksi</Text>
                    <Text style={styles.infoValue}>{displayId}</Text>
                  </View>

                  <View style={styles.divider} />

                  {/* Baris 2: Nama Kasir (Selalu muncul jika ada datanya) */}
                  {transaction.cashierName && (
                    <>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Kasir</Text>
                        <View style={styles.cashierInfo}>
                          <User size={14} color="#64748B" />
                          <Text style={styles.infoValue}>{transaction.cashierName}</Text>
                        </View>
                      </View>
                      <View style={styles.divider} />
                    </>
                  )}

                  {/* Baris 3: Tanggal & Waktu */}
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Tanggal & Waktu</Text>
                    <Text style={styles.infoValue}>
                      {formatDate(transaction.date || transaction.createdAt)}
                    </Text>
                  </View>

                  {/* Baris 4: Email Kasir (Opsional) */}
                  {transaction.cashierEmail && (
                    <>
                      <View style={styles.divider} />
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Email</Text>
                        <Text style={[styles.infoValue, styles.emailText]}>
                          {transaction.cashierEmail}
                        </Text>
                      </View>
                    </>
                  )}
                </View>

                {/* Items List */}
                <Text style={styles.sectionTitle}>Produk Dibeli</Text>
                <View style={styles.itemsContainer}>
                  {transaction.items.map((item, index) => (
                    <View key={index} style={styles.itemRow}>
                      <View style={styles.itemLeft}>
                        <View style={styles.itemNumber}>
                          <Text style={styles.itemNumberText}>{index + 1}</Text>
                        </View>
                        <View style={styles.itemDetails}>
                          <Text style={styles.itemName}>{item.productName || 'Produk'}</Text>
                          <Text style={styles.itemQty}>
                            {item.qty} x {formatCurrency(item.price)}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.itemTotal}>
                        {formatCurrency(item.qty * item.price)}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Total Card */}
                <View style={styles.totalCard}>
                  <Text style={styles.totalLabel}>Total Pembayaran</Text>
                  <Text style={styles.totalAmount}>{formatCurrency(transaction.total)}</Text>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  idText: {
    fontSize: 10,
    fontFamily: 'PoppinsSemiBold',
    color: '#00A79D',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cashierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E0F2F1',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  cashierName: {
    fontSize: 10,
    fontFamily: 'PoppinsSemiBold',
    color: '#00A79D',
  },
  dateText: {
    fontSize: 15,
    fontFamily: 'PoppinsBold',
    color: '#1E293B',
    marginBottom: 6,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 10,
  },
  totalText: {
    fontSize: 14,
    fontFamily: 'PoppinsBold',
    color: '#059669',
  },
  itemBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  itemCount: {
    fontSize: 11,
    fontFamily: 'PoppinsSemiBold',
    color: '#64748B',
  },

  /* MODAL STYLES */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'PoppinsBold',
    color: '#1E293B',
  },
  closeBtn: {
    backgroundColor: '#F1F5F9',
    padding: 8,
    borderRadius: 12,
  },
  modalBody: {
    padding: 24,
  },
  infoCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 13,
    fontFamily: 'PoppinsRegular',
    color: '#64748B',
  },
  infoValue: {
    fontSize: 13,
    fontFamily: 'PoppinsSemiBold',
    color: '#1E293B',
    textAlign: 'right',
    flex: 1,
    marginLeft: 12,
  },
  cashierInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    justifyContent: 'flex-end',
  },
  emailText: {
    fontSize: 11,
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'PoppinsBold',
    color: '#1E293B',
    marginBottom: 12,
  },
  itemsContainer: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 20,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemNumber: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#F0F9FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemNumberText: {
    fontSize: 12,
    fontFamily: 'PoppinsBold',
    color: '#00A79D',
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontFamily: 'PoppinsSemiBold',
    color: '#1E293B',
    marginBottom: 2,
  },
  itemQty: {
    fontSize: 12,
    fontFamily: 'PoppinsRegular',
    color: '#64748B',
  },
  itemTotal: {
    fontSize: 14,
    fontFamily: 'PoppinsBold',
    color: '#1E293B',
    marginLeft: 12,
  },
  totalCard: {
    backgroundColor: '#059669',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    fontFamily: 'PoppinsSemiBold',
    color: '#FFF',
  },
  totalAmount: {
    fontSize: 20,
    fontFamily: 'PoppinsBold',
    color: '#FFF',
  },
});