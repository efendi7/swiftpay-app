import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { X } from 'lucide-react-native';
import {
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
  QueryDocumentSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../../../../../services/firebaseConfig';
import { Activity } from '../../../../../types/activity';
import { COLORS } from '../../../../../constants/colors';
import {
  getActivityTitle,
  formatActivityMessage,
} from '../../../../../utils/activityHelpers';

interface ActivityModalProps {
  visible: boolean;
  onClose: () => void;
  currentUserName?: string;
}

const ITEMS_PER_PAGE = 20;

export const ActivityModal: React.FC<ActivityModalProps> = ({
  visible,
  onClose,
  currentUserName = 'Admin',
}) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | null>(null);

  // Reset dan load data saat modal dibuka
  useEffect(() => {
    if (visible) {
      loadActivities(true);
    } else {
      setActivities([]);
      setLastDoc(null);
      setHasMore(true);
    }
  }, [visible]);

  // Fungsi format waktu manual (Tanpa library date-fns)
  const getRelativeTime = (createdAt: any) => {
    if (!createdAt) return 'Baru saja';

    let date: Date;
    if (createdAt instanceof Timestamp) {
      date = createdAt.toDate();
    } else {
      date = new Date(createdAt);
    }

    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Baru saja';

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} mnt yang lalu`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} jam yang lalu`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Kemarin';
    if (diffInDays < 7) return `${diffInDays} hari yang lalu`;

    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const loadActivities = async (isInitial = false) => {
    if (!isInitial && !hasMore) return;

    try {
      if (isInitial) setLoading(true);
      else setLoadingMore(true);

      let q = query(
        collection(db, 'activities'),
        orderBy('createdAt', 'desc'),
        limit(ITEMS_PER_PAGE),
      );

      if (!isInitial && lastDoc) {
        q = query(
          collection(db, 'activities'),
          orderBy('createdAt', 'desc'),
          startAfter(lastDoc),
          limit(ITEMS_PER_PAGE),
        );
      }

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        if (isInitial) setActivities([]);
        setHasMore(false);
        return;
      }

      const newActivities = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Activity[];

      if (isInitial) setActivities(newActivities);
      else setActivities(prev => [...prev, ...newActivities]);

      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      if (snapshot.docs.length < ITEMS_PER_PAGE) setHasMore(false);
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setLastDoc(null);
    setHasMore(true);
    loadActivities(true);
  };

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    const isMe = item.userName === currentUserName;
    const displayName = isMe ? 'Anda' : item.userName;
    const title = getActivityTitle(item.type, item.message);
    const messageParts = formatActivityMessage(item.message);
    const isLast = index === activities.length - 1;

    const getTitleStyle = () => {
      if (title === 'PRODUK BARU') return { color: '#3B82F6' };
      if (title === 'STOK MASUK') return { color: '#10B981' };
      if (title === 'PENJUALAN' || title === 'STOK KELUAR')
        return { color: '#EF4444' };
      return { color: '#F59E0B' };
    };

    return (
      <View style={[styles.activityItem, isLast && styles.lastItem]}>
        <View style={styles.activityContent}>
          <Text style={[styles.activityTitle, getTitleStyle()]}>{title}</Text>

          <Text style={styles.activityMessage}>
            {messageParts.map((part, idx) => (
              <Text
                key={idx}
                style={[
                  part.styleType === 'product' && styles.productText,
                  part.styleType === 'price' && styles.priceText,
                  part.styleType === 'qty' && styles.qtyText,
                  part.styleType === 'normal' && styles.normalText,
                ]}>
                {part.text}
              </Text>
            ))}
          </Text>

          <Text style={styles.timestamp}>
            {getRelativeTime(item.createdAt)} • {displayName}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <View>
              <Text style={styles.modalTitle}>Riwayat Aktivitas</Text>
              <Text style={styles.modalSubtitle}>
                Menampilkan semua riwayat toko
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : (
            <FlatList
              data={activities}
              renderItem={renderItem}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              onEndReached={() => {
                if (!loadingMore && hasMore) loadActivities(false);
              }}
              onEndReachedThreshold={0.4}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor={COLORS.primary}
                />
              }
              ListFooterComponent={() =>
                loadingMore ? (
                  <View style={styles.footerLoading}>
                    <ActivityIndicator size="small" color={COLORS.primary} />
                  </View>
                ) : (
                  <View style={{ height: 30 }} />
                )
              }
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  modalTitle: { fontSize: 18, fontFamily: 'PoppinsBold', color: '#1E293B' },
  modalSubtitle: {
    fontSize: 11,
    fontFamily: 'PoppinsRegular',
    color: '#64748B',
  },
  closeButton: { padding: 4 },
  listContent: { paddingHorizontal: 20, paddingTop: 10 },

  // Styling disamakan persis dengan ActivityItem Anda
  activityItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  lastItem: { borderBottomWidth: 0 },
  activityContent: { flex: 1 },
  activityTitle: {
    fontSize: 10,
    fontFamily: 'PoppinsBold',
    marginBottom: 2,
    letterSpacing: 0.8,
  },
  activityMessage: {
    fontSize: 13,
    lineHeight: 20,
    fontFamily: 'PoppinsRegular',
    color: '#444',
  },
  timestamp: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
    fontFamily: 'PoppinsRegular',
  },
  productText: { fontFamily: 'PoppinsBold', color: '#000000' },
  priceText: { fontFamily: 'PoppinsBold', color: '#16a34a' },
  qtyText: { fontFamily: 'PoppinsSemiBold', color: '#333' },
  normalText: { fontFamily: 'PoppinsRegular', color: '#444' },

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  footerLoading: { paddingVertical: 20, alignItems: 'center' },
});
