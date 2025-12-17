import React, { useState } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    StyleSheet, 
    TouchableOpacity, 
    Alert, 
    ActivityIndicator,
    Modal 
} from 'react-native';
import { db } from '../../services/firebaseConfig'; // Sesuaikan path jika perlu
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';

// Pastikan Anda mengimpor BarcodeScannerScreen
import BarcodeScannerScreen from './BarcodeScannerScreen'; 

const AdminProductScreen = () => {
    // State untuk form input
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('');
    const [barcode, setBarcode] = useState('');
    
    // State untuk UI dan Loading
    const [loading, setLoading] = useState(false);
    const [showScanner, setShowScanner] = useState(false);

    // Fungsi untuk menghasilkan string angka unik (misal: 15 digit)
    const generateUniqueBarcode = () => {
        // Gabungkan Timestamp (untuk keunikan) dengan angka acak
        // Menghasilkan string sekitar 15-18 digit
        const timestamp = new Date().getTime().toString();
        const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
        
        // Atur agar hasilnya cocok dengan format EAN atau Code 128
        const newBarcode = timestamp + random;
        setBarcode(newBarcode.substring(0, 18)); // Batasi hingga 18 digit
        Alert.alert('Barcode Baru', `Barcode otomatis dihasilkan: ${newBarcode.substring(0, 18)}`);
    };

    // Handler ketika barcode berhasil dipindai
    const handleBarcodeScanned = (scannedData: string) => {
        setShowScanner(false);
        setBarcode(scannedData);
    };

    // Fungsi untuk memvalidasi apakah barcode sudah ada di database
    const checkBarcodeExistence = async (bcode: string) => {
        const q = query(
            collection(db, 'products'),
            where('barcode', '==', bcode.trim())
        );
        const querySnapshot = await getDocs(q);
        return !querySnapshot.empty; // True jika dokumen ditemukan
    };

    // Fungsi utama untuk menyimpan data ke Firestore
    const handleAddProduct = async () => {
        // Validasi Sederhana
        if (!name || !price || !stock || !barcode) {
            Alert.alert('Error', 'Semua field harus diisi!');
            return;
        }
        
        const productData = {
            name: name,
            price: parseFloat(price), 
            stock: parseInt(stock),
            barcode: barcode.trim(),
            createdAt: new Date(), // Tambahkan timestamp pembuatan
        };

        if (isNaN(productData.price) || isNaN(productData.stock)) {
            Alert.alert('Error', 'Harga dan Stok harus berupa angka yang valid.');
            return;
        }

        setLoading(true);
        try {
            // 1. Cek duplikasi Barcode sebelum menyimpan
            const isDuplicate = await checkBarcodeExistence(productData.barcode);
            if (isDuplicate) {
                Alert.alert('Error', 'Kode Barcode ini sudah digunakan oleh produk lain!');
                setLoading(false);
                return;
            }

            // 2. Simpan Dokumen ke Firestore
            await addDoc(collection(db, 'products'), productData);

            Alert.alert('Sukses', `${name} berhasil ditambahkan!`);
            
            // 3. Reset Form
            setName('');
            setPrice('');
            setStock('');
            setBarcode('');

        } catch (error) {
            console.error("Error adding product: ", error);
            Alert.alert('Error', 'Gagal menambahkan produk. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>➕ Tambah Produk Baru</Text>

            {/* Input Form */}
            <TextInput
                style={styles.input}
                placeholder="Nama Produk"
                value={name}
                onChangeText={setName}
            />
            <TextInput
                style={styles.input}
                placeholder="Harga (Rp)"
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
            />
            <TextInput
                style={styles.input}
                placeholder="Stok Awal"
                value={stock}
                onChangeText={setStock}
                keyboardType="numeric"
            />
            
            {/* Input Barcode & Tombol Aksi */}
            <View style={styles.barcodeSection}>
                <TextInput
                    style={[styles.input, styles.barcodeInput, { flex: 1, marginRight: 10 }]}
                    placeholder="Kode Barcode"
                    value={barcode}
                    onChangeText={setBarcode}
                    keyboardType="default"
                />
                <TouchableOpacity 
                    style={styles.scanButton}
                    onPress={() => setShowScanner(true)}
                >
                    <Text style={styles.scanButtonText}>Scan</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={styles.generateButton}
                    onPress={generateUniqueBarcode}
                >
                    <Text style={styles.scanButtonText}>Auto</Text>
                </TouchableOpacity>
            </View>

            {/* Tombol Simpan */}
            <TouchableOpacity 
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleAddProduct}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#FFF" />
                ) : (
                    <Text style={styles.buttonText}>Simpan Produk</Text>
                )}
            </TouchableOpacity>

            {/* Barcode Scanner Modal */}
            <BarcodeScannerScreen
                visible={showScanner}
                onClose={() => setShowScanner(false)}
                onScan={handleBarcodeScanned}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#F5F5F5',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
    },
    input: {
        backgroundColor: '#FFF',
        padding: 15,
        borderRadius: 8,
        marginBottom: 15,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#EEE',
    },
    barcodeSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    barcodeInput: {
        fontWeight: 'bold',
        borderColor: '#2196F3',
        marginBottom: 0, // Dihapus karena ada di dalam row
    },
    scanButton: {
        backgroundColor: '#2196F3',
        padding: 15,
        borderRadius: 8,
        marginLeft: 5,
        alignItems: 'center',
    },
    generateButton: {
        backgroundColor: '#FF9800',
        padding: 15,
        borderRadius: 8,
        marginLeft: 5,
        alignItems: 'center',
    },
    scanButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
    },
    button: {
        backgroundColor: '#4CAF50',
        padding: 18,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonDisabled: {
        backgroundColor: '#A5D6A7',
    },
    buttonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default AdminProductScreen;