import { Animated, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../constants/theme';
import { formatCompactMoney } from '../../utils/format';
import { useGrow } from '../common/Motion';

const CHART_HEIGHT = 140;

// Vertical bars: employees per tier (bar height) + average salary (label).
export default function TierBarChart({ clusters }) {
  const grow = useGrow([clusters]);
  const maxCount = Math.max(1, ...clusters.map((c) => c.count));

  return (
    <View style={styles.chart}>
      {clusters.map((c, i) => {
        const color = colors.tiers[i % colors.tiers.length];
        const height = grow.interpolate({ inputRange: [0, 1], outputRange: [0, (c.count / maxCount) * CHART_HEIGHT] });
        return (
          <View key={c.group} style={styles.column}>
            <Text style={styles.count}>{c.count}</Text>
            <View style={styles.track}>
              <Animated.View style={[styles.bar, { height, backgroundColor: color, shadowColor: color }]} />
            </View>
            <Text style={[styles.group, { color }]}>{c.group}</Text>
            <Text style={styles.avg}>{formatCompactMoney(c.centroid)}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  chart: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around' },
  column: { alignItems: 'center', flex: 1 },
  count: { color: colors.text, fontWeight: '800', marginBottom: 6 },
  track: { height: CHART_HEIGHT, justifyContent: 'flex-end' },
  bar: {
    width: 42,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    shadowOpacity: 0.5,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  group: { fontWeight: '800', marginTop: 8, fontSize: 13 },
  avg: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
});
