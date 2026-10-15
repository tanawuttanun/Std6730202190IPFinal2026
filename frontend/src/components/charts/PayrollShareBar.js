import { Animated, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../constants/theme';
import { formatCompactMoney } from '../../utils/format';
import { useGrow } from '../common/Motion';

// Stacked bar: share of total payroll per tier, plus per-tier rows.
export default function PayrollShareBar({ breakdown }) {
  const grow = useGrow([breakdown]);
  const width = grow.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <View>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, { width }]}>
          {breakdown.map((t, i) => (
            <View key={t.group} style={{ flex: t.payrollShare || 0.0001, backgroundColor: colors.tiers[i] }} />
          ))}
        </Animated.View>
      </View>

      {breakdown.map((t, i) => (
        <View key={t.group} style={styles.row}>
          <View style={[styles.dot, { backgroundColor: colors.tiers[i] }]} />
          <Text style={styles.group}>{t.group}</Text>
          <Text style={styles.amount}>{formatCompactMoney(t.payroll)}</Text>
          <Text style={[styles.share, { color: colors.tiers[i] }]}>{Math.round(t.payrollShare * 100)}%</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { height: 16, borderRadius: 8, backgroundColor: colors.bg, overflow: 'hidden', marginBottom: 12 },
  fill: { flexDirection: 'row', height: '100%' },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  group: { color: colors.text, flex: 1, fontWeight: '600' },
  amount: { color: colors.textMuted, marginRight: 14 },
  share: { fontWeight: '800', width: 44, textAlign: 'right' },
});
