import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, Modal, TextInput, 
  TouchableOpacity, ActivityIndicator, Alert 
} from 'react-native';
import { Info, Save, X } from 'lucide-react-native';
import { COLORS } from '../../../../constants/colors';

interface StockOpnameModalProps {
  visible: boolean;
  onClose: () => void;
  currentStock: number;
  productName: string;
  onSave: (physicalStock: number, reason: string) => Promise<void>;
}

export const StockOpnameModal = ({ 
  visible, onClose, currentStock, productName, onSave 
}: StockOpnameModalProps) => {
  const [physicalStock, setPhysicalStock] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const diff = physicalStock !== '' ? parseInt(physicalStock) - currentStock : 0;

  const handleSave = async () => {
    if (physicalStock === '') return Alert.alert('Gagal', 'Isi stok fisik!');
    setLoading(true);
    await onSave(parseInt(physicalStock), reason);
    setLoading(false);
    setPhysicalStock('');
    setReason('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <View style={styles.header}>
            <Text style={styles.title}>Stock Opname</Text>
            <TouchableOpacity onPress={onClose}><X size={20} color="#64748B" /></TouchableOpacity>
          </View>

          <Text style={styles.productName}>{productName}</Text>

          <View style={styles.row}>
            <View style={styles.box}>
              <Text style={styles.label}>Sistem</Text>
              <Text style={styles.value}>{currentStock}</Text>
            </View>
            <View style={styles.box}>
              <Text style={styles.label}>Fisik</Text>
              <TextInput 
                style={styles.input} 
                keyboardType="numeric" 
                placeholder="0"
                value={physicalStock}
                onChangeText={setPhysicalStock}
              />
            </View>
          </View>

          <View style={[styles.diffBox, diff < 0 ? styles.bgRed : diff > 0 ? styles.bgGreen : styles.bgGray]}>
            <Info size={14} color={diff < 0 ? '#ef4444' : diff > 0 ? '#10b981' : '#64748B'} />
            <Text style={styles.diffText}>
              Selisih: {diff > 0 ? '+' : ''}{diff} ({diff === 0 ? 'Sesuai' : diff > 0 ? 'Kelebihan' : 'Kurang'})
            </Text>
          </View>

          <TextInput 
            style={styles.textArea} 
            placeholder="Alasan selisih (contoh: barang rusak)..." 
            multiline
            value={reason}
            onChangeText={setReason}
          />

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : (
              <>
                <Save size={18} color="#fff" />
                <Text style={styles.saveBtnText}>Simpan Perubahan</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalCard: { backgroundColor: '#fff', borderRadius: 20, padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  title: { fontFamily: 'PoppinsBold', fontSize: 16 },
  productName: { fontFamily: 'PoppinsRegular', color: '#64748B', marginBottom: 20 },
  row: { flexDirection: 'row', gap: 15, marginBottom: 15 },
  box: { flex: 1, backgroundColor: '#F8FAFC', padding: 12, borderRadius: 12, alignItems: 'center' },
  label: { fontSize: 10, color: '#64748B', fontFamily: 'PoppinsMedium' },
  value: { fontSize: 20, fontFamily: 'PoppinsBold' },
  input: { fontSize: 20, fontFamily: 'PoppinsBold', color: COLORS.primary, borderBottomWidth: 1, borderBottomColor: COLORS.primary, width: '60%', textAlign: 'center' },
  diffBox: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, borderRadius: 10, marginBottom: 15 },
  bgRed: { backgroundColor: '#FEF2F2' }, bgGreen: { backgroundColor: '#F0FDF4' }, bgGray: { backgroundColor: '#F1F5F9' },
  diffText: { fontSize: 12, fontFamily: 'PoppinsSemiBold' },
  textArea: { backgroundColor: '#F8FAFC', borderRadius: 12, padding: 12, height: 80, textAlignVertical: 'top', marginBottom: 20, fontFamily: 'PoppinsRegular' },
  saveBtn: { backgroundColor: COLORS.primary, padding: 15, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', gap: 10 },
  saveBtnText: { color: '#fff', fontFamily: 'PoppinsBold' }
});