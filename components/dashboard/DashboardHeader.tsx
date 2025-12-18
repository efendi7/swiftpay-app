import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  LogOut,
  TrendingUp,
  TrendingDown,
} from 'lucide-react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../../services/firebaseConfig';
import { COLORS } from '../../constants/colors';
import { DashboardService } from '../../services/dashboardService';

interface DashboardHeaderProps {
  headerHeight: Animated.AnimatedInterpolation<number>;
  revenueOpacity: Animated.AnimatedInterpolation<number>;
  topPadding: number;
  totalRevenue: number;
  totalExpense: number;
  totalProfit: number;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  headerHeight,
  revenueOpacity,
  topPadding,
  totalRevenue,
  totalExpense,
  totalProfit,
}) => {
  const isProfit = totalProfit >= 0;

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <Animated.View
      style={[
        styles.header,
        { height: headerHeight, paddingTop: topPadding },
      ]}
    >
      <LinearGradient
        colors={[COLORS.primary, '#2c537a']}
        style={StyleSheet.absoluteFill}
      />

      {/* HEADER TOP */}
      <View style={styles.headerTop}>
        <View>
          <Text style={styles.greeting}>Selamat Datang,</Text>
          <Text style={styles.adminName}>Administrator</Text>
        </View>

        <TouchableOpacity
          style={styles.logoutCircle}
          onPress={handleLogout}
        >
          <LogOut size={20} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* PROFIT CARD */}
      <Animated.View
        style={[
          styles.profitCard,
          { opacity: revenueOpacity },
        ]}
      >
        <View style={styles.profitLeft}>
          <Text
            style={[
              styles.profitValue,
              { color: isProfit ? '#A5FFB0' : '#FFB3B3' },
            ]}
          >
            {DashboardService.formatCurrency(totalProfit)}
          </Text>

          <Text
            style={[
              styles.profitMessage,
              { color: isProfit ? '#A5FFB0' : '#FFB3B3' },
            ]}
          >
            {isProfit
              ? 'wah lagi untung nih!'
              : 'belum balik modal nih!'}
          </Text>
        </View>

        {/* IMAGE (BEBAS KELUAR WRAPPER) */}
        <View style={styles.profitImageWrapper}>
          <Image
            source={
              isProfit
                ? require('../../assets/images/dashboard/good.png')
                : require('../../assets/images/dashboard/sad.png')
            }
            style={styles.profitImage}
            resizeMode="contain"
          />
        </View>
      </Animated.View>

      {/* BOTTOM STATS (COMPACT HORIZONTAL) */}
<View style={styles.bottomStats}>
  <View style={styles.bottomCardCompact}>
    <View style={styles.iconBoxGreen}>
      <TrendingUp size={16} color={COLORS.secondary} />
    </View>

    <View style={styles.bottomTextWrap}>
      <Text style={styles.bottomLabel}>Pendapatan</Text>
      <Text style={styles.bottomValue}>
        {DashboardService.formatCurrency(totalRevenue)}
      </Text>
    </View>
  </View>

  <View style={styles.bottomCardCompact}>
    <View style={styles.iconBoxRed}>
      <TrendingDown size={16} color="#E74C3C" />
    </View>

    <View style={styles.bottomTextWrap}>
      <Text style={styles.bottomLabel}>Pengeluaran</Text>
      <Text style={styles.bottomValue}>
        {DashboardService.formatCurrency(totalExpense)}
      </Text>
    </View>
  </View>
</View>


    </Animated.View>
  );
};

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
    elevation: 5,
  },

  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 50,
  },

  greeting: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontFamily: 'PoppinsRegular',
  },

  adminName: {
    color: '#FFF',
    fontSize: 20,
    fontFamily: 'MontserratBold',
  },

  logoutCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* ===== PROFIT ===== */
  profitCard: {
    marginTop: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'visible', // 🔥 penting: image boleh keluar
  },

  profitLeft: {
    flex: 1,
  },

  profitValue: {
    fontSize: 18,
    fontFamily: 'PoppinsBold',
  },

  profitMessage: {
    fontSize: 11,
    marginTop: 2,
    fontFamily: 'PoppinsMedium',
  },

  /* WRAPPER TANPA PEMBATAS */
  profitImageWrapper: {
    width: 60,
    height: 56,
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'visible', // ❌ jangan hidden
  },

  /* IMAGE BEBAS */
  profitImage: {
    width: 90,
    height: 90,
    position: 'absolute',
    right: -12,
    top: -18,
  },

 bottomStats: {
  marginTop: 10,
  flexDirection: 'row',
  justifyContent: 'space-between',
},

bottomCardCompact: {
  flex: 1,
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: 'rgba(255,255,255,0.12)',
  paddingVertical: 8,
  paddingHorizontal: 10,
  marginHorizontal: 5,
  borderRadius: 14,
},

/* KOTAK ICON SAJA */
iconBox: {
  width: 32,
  height: 32,
  borderRadius: 10,
  justifyContent: 'center',
  alignItems: 'center',
},

/* TEKS DI KANAN */
bottomTextWrap: {
  marginLeft: 8,
  flex: 1,
},

bottomLabel: {
  fontSize: 10,
  color: '#FFF',
  opacity: 0.75,
  fontFamily: 'PoppinsRegular',
},

bottomValue: {
  fontSize: 12,
  color: '#FFF',
  marginTop: 1,
  fontFamily: 'PoppinsBold',
},


/* WARNA MUDA SOLID (BUKAN TRANSPARAN) */
iconBoxGreen: {
  backgroundColor: '#E9F9EF', // hijau muda solid
  width: 32,
  height: 32,
  borderRadius: 10,
  justifyContent: 'center',
  alignItems: 'center',
},

iconBoxRed: {
  backgroundColor: '#FDECEA', // merah muda solid
  width: 32,
  height: 32,
  borderRadius: 10,
  justifyContent: 'center',
  alignItems: 'center',
},


});
