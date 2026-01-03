import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { ChevronLeft, Power, TrendingUp, ShoppingBag, User } from 'lucide-react-native';
import { COLORS } from '../../../constants/colors';
import { DashboardService } from '../../../services/dashboardService';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../services/firebaseConfig';

const CashierManagementScreen = ({ navigation }: any) => {
  const [cashiers, setCashiers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const data = await DashboardService.fetchCashierPerformance();
    setCashiers(data);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const toggleStatus = async (id: string, currentStatus: string, name: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    Alert.alert(
      newStatus === 'inactive' ? 'Nonaktifkan Kasir' : 'Aktifkan Kasir',
      `Apakah Anda yakin ingin mengubah status akses ${name}?`,
      [
        { text: 'Batal', style: 'cancel' },
        { 
          text: 'Ya, Ubah', 
          style: newStatus === 'inactive' ? 'destructive' : 'default',
          onPress: async () => {
            try {
              await updateDoc(doc(db, 'users', id), { status: newStatus });
              loadData(); // Refresh daftar
            } catch (err) {
              Alert.alert('Error', 'Gagal memperbarui status.');
            }
          }
        }
      ]
    );
  };

  const renderCashier = ({ item }: { item: any }) => (
    <View style={[styles.card, item.status === 'inactive' && styles.inactiveCard]}>
      <View style={styles.cardHeader}>
        <View style={styles.userInfo}>
          {item.photoURL ? (
            <Image source={{ uri: item.photoURL }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}><User color="#CCC" /></View>
          )}
          <View>
            <Text style={styles.nameText}>{item.name}</Text>
            <Text style={styles.emailText}>{item.email}</Text>
          </View>
        </View>
        <TouchableOpacity 
          onPress={() => toggleStatus(item.id, item.status, item.name)}
          style={[styles.statusToggle, { backgroundColor: item.status === 'active' ? '#10B98115' : '#EF444415' }]}
        >
          <Power size={18} color={item.status === 'active' ? '#10B981' : '#EF4444'} />
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <TrendingUp size={16} color={COLORS.primary} />
          <Text style={styles.statLabel}>Omzet Hari Ini</Text>
          <Text style={styles.statValue}>Rp {item.todayRevenue.toLocaleString('id-ID')}</Text>
        </View>
        <View style={styles.statBox}>
          <ShoppingBag size={16} color={COLORS.secondary} />
          <Text style={styles.statLabel}>Transaksi</Text>
          <Text style={styles.statValue}>{item.transactionCount} Sesi</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><ChevronLeft color="#000" /></TouchableOpacity>
        <Text style={styles.headerTitle}>Manajemen Kasir</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator color={COLORS.primary} size="large" /></View>
      ) : (
        <FlatList
          data={cashiers}
          renderItem={renderCashier}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>Belum ada kasir terdaftar.</Text>}
          onRefresh={loadData}
          refreshing={loading}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, backgroundColor: '#FFF', paddingTop: 50 },
  headerTitle: { fontSize: 18, fontFamily: 'PoppinsBold' },
  list: { padding: 20 },
  card: { backgroundColor: '#FFF', borderRadius: 15, padding: 15, marginBottom: 15, elevation: 2 },
  inactiveCard: { opacity: 0.6, backgroundColor: '#F2F2F2' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  userInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 45, height: 45, borderRadius: 22.5 },
  avatarPlaceholder: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: '#EEE', justifyContent: 'center', alignItems: 'center' },
  nameText: { fontSize: 15, fontFamily: 'PoppinsSemiBold' },
  emailText: { fontSize: 12, color: '#666' },
  statusToggle: { padding: 10, borderRadius: 10 },
  divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 12 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statBox: { flex: 1 },
  statLabel: { fontSize: 10, color: '#999', marginVertical: 2 },
  statValue: { fontSize: 13, fontFamily: 'PoppinsBold', color: '#333' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { textAlign: 'center', marginTop: 50, color: '#999' }
});

export default CashierManagementScreen;