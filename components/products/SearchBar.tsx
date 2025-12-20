import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Search, X } from 'lucide-react-native';
import { COLORS } from '../../constants/colors';

interface Props {
  value: string;
  onChange: (text: string) => void;
  userRole?: 'admin' | 'kasir'; // Mengikuti pola isAdmin pada transaksi
}

const SearchBar = ({ value, onChange, userRole }: Props) => {
  return (
    <View style={styles.container}>
      <Search size={20} color={COLORS.textLight} />

      <TextInput
        style={styles.input}
        placeholder={
          userRole === 'admin'
            ? 'Cari produk, kategori, pemasok...'
            : 'Cari nama produk...'
        }
        value={value}
        onChangeText={onChange}
        placeholderTextColor="#94A3B8"
      />

      {value.length > 0 && (
        <TouchableOpacity onPress={() => onChange('')}>
          <View style={styles.clear}>
            <X size={14} color="#FFF" />
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    // DISAMAKAN: Menggunakan margin 16 dan radius 14 seperti TransactionSearchBar
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8, 
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    // Menambahkan height agar konsisten
    height: 50,
  },
  input: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 10,
    fontFamily: 'PoppinsRegular',
    fontSize: 14,
    color: '#1E293B',
  },
  clear: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default SearchBar;