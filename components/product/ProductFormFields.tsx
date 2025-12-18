import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Tag, Zap, Layers, Barcode, Wallet, Truck, LayoutGrid } from 'lucide-react-native';
import { COLORS } from '../../constants/colors';

interface InputLabelProps {
  label: string;
  icon: any;
}

const InputLabel: React.FC<InputLabelProps> = ({ label, icon: Icon }) => (
  <View style={styles.labelContainer}>
    <Icon size={16} color={COLORS.primary} />
    <Text style={styles.label}>{label}</Text>
  </View>
);

interface Props {
  name: string;
  price: string;
  purchasePrice: string;
  supplier: string;
  category: string; // Tambahan field kategori
  stock: string;
  barcode: string;
  onChangeName: (t: string) => void;
  onChangePrice: (t: string) => void;
  onChangePurchasePrice: (t: string) => void;
  onChangeSupplier: (t: string) => void;
  onChangeCategory: (t: string) => void; // Tambahan handler kategori
  onChangeStock: (t: string) => void;
  onChangeBarcode: (t: string) => void;
  onScanPress: () => void;
  onAutoGeneratePress: () => void;
}

export const ProductFormFields: React.FC<Props> = ({
  name,
  price,
  purchasePrice,
  supplier,
  category,
  stock,
  barcode,
  onChangeName,
  onChangePrice,
  onChangePurchasePrice,
  onChangeSupplier,
  onChangeCategory,
  onChangeStock,
  onChangeBarcode,
  onScanPress,
  onAutoGeneratePress,
}) => (
  <View style={styles.card}>
    <InputLabel label="Nama Produk" icon={Tag} />
    <TextInput 
      style={styles.input} 
      value={name} 
      onChangeText={onChangeName} 
      placeholder="Masukkan nama produk"
    />

    <View style={styles.row}>
      <View style={styles.flex}>
        <InputLabel label="Kategori" icon={LayoutGrid} />
        <TextInput
          style={styles.input}
          value={category}
          onChangeText={onChangeCategory}
          placeholder="Minuman, dll"
        />
      </View>
      <View style={styles.flex}>
        <InputLabel label="Pemasok" icon={Truck} />
        <TextInput
          style={styles.input}
          value={supplier}
          onChangeText={onChangeSupplier}
          placeholder="Nama supplier"
        />
      </View>
    </View>

    <View style={styles.row}>
      <View style={styles.flex}>
        <InputLabel label="Harga Jual" icon={Zap} />
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={price}
          onChangeText={onChangePrice}
          placeholder="0"
        />
      </View>
      <View style={styles.flex}>
        <InputLabel label="Harga Beli" icon={Wallet} />
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={purchasePrice}
          onChangeText={onChangePurchasePrice}
          placeholder="0"
        />
      </View>
    </View>

    <View style={styles.row}>
      <View style={styles.flex}>
        <InputLabel label="Stok" icon={Layers} />
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={stock}
          onChangeText={onChangeStock}
          placeholder="0"
        />
      </View>
      <View style={styles.flex}>
        <InputLabel label="Barcode" icon={Barcode} />
        <TextInput
          style={[styles.input, styles.barcode]}
          value={barcode}
          onChangeText={onChangeBarcode}
          placeholder="Klik SCAN/AUTO"
        />
      </View>
    </View>

    <View style={styles.actions}>
      <TouchableOpacity style={styles.btn} onPress={onScanPress}>
        <Text style={styles.btnText}>SCAN</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.btnAlt} onPress={onAutoGeneratePress}>
        <Text style={styles.btnText}>AUTO</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 20 },
  labelContainer: { flexDirection: 'row', gap: 6, marginBottom: 6 },
  label: { fontWeight: '700', color: COLORS.textDark },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: Platform.OS === 'ios' ? 14 : 10,
    marginBottom: 14,
    color: COLORS.textDark,
  },
  row: { flexDirection: 'row', gap: 10 },
  flex: { flex: 1 },
  barcode: { textAlign: 'center', fontWeight: 'bold' },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 5 },
  btn: { backgroundColor: COLORS.secondary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  btnAlt: { backgroundColor: '#FF8A65', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  btnText: { color: '#fff', fontWeight: '700' },
});