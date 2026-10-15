import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../constants/theme';
import { formatCompactMoney } from '../../utils/format';
import { tierIndexFor } from '../../utils/analytics';
import { FadeInView } from '../common/Motion';

const HEIGHT = 120;
const DOT = 14;
const LANES = 4; // vertical lanes so dots with similar salaries don't overlap

// Every employee as a dot on a salary axis, coloured by K-Means tier,
// with a dashed marker at each tier's centroid.
export default function SalaryScatter({ employees, clusters }) {
  const salaries = employees.map((e) => Number(e.salary)).filter(Number.isFinite);
  if (salaries.length === 0) return <Text style={styles.empty}>No salary data</Text>;

  const min = Math.min(...salaries);
  const max = Math.max(...salaries);
  const span = max - min || 1;
  const pos = (s) => ((s - min) / span) * 100;
  const sorted = [...employees].sort((a, b) => a.salary - b.salary);

  return (
    <View>
      <View style={styles.plot}>
        <View style={styles.axis} />
        {clusters.map((c, i) => (
          <View key={c.group} style={[styles.centroid, { left: `${pos(c.centroid)}%`, borderColor: colors.tiers[i] }]} />
        ))}
        {sorted.map((e, idx) => {
          const tier = tierIndexFor(Number(e.salary), clusters);
          const color = tier >= 0 ? colors.tiers[tier % colors.tiers.length] : colors.textMuted;
          const lane = idx % LANES;
          return (
            <FadeInView
              key={e.id}
              delay={idx * 40}
              distance={8}
              style={[
                styles.dot,
                {
                  left: `${pos(Number(e.salary))}%`,
                  top: 12 + lane * ((HEIGHT - 40) / (LANES - 1)),
                  backgroundColor: color,
                  shadowColor: color,
                },
              ]}
            />
          );
        })}
      </View>
      <View style={styles.scale}>
        <Text style={styles.scaleText}>{formatCompactMoney(min)}</Text>
        <Text style={styles.scaleText}>{formatCompactMoney((min + max) / 2)}</Text>
        <Text style={styles.scaleText}>{formatCompactMoney(max)}</Text>
      </View>
      <View style={styles.legend}>
        {clusters.map((c, i) => (
          <View key={c.group} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.tiers[i] }]} />
            <Text style={styles.legendText}>{c.group}</Text>
          </View>
        ))}
        <View style={styles.legendItem}>
          <View style={styles.legendDash} />
          <Text style={styles.legendText}>centroid</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  plot: { height: HEIGHT, marginHorizontal: DOT / 2 },
  axis: { position: 'absolute', left: 0, right: 0, bottom: 8, height: 1, backgroundColor: colors.border },
  centroid: {
    position: 'absolute',
    top: 0,
    bottom: 8,
    width: 0,
    borderLeftWidth: 2,
    borderStyle: 'dashed',
    opacity: 0.6,
  },
  dot: {
    position: 'absolute',
    width: DOT,
    height: DOT,
    borderRadius: DOT / 2,
    marginLeft: -DOT / 2,
    borderWidth: 2,
    borderColor: colors.bg,
    shadowOpacity: 0.7,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  scale: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  scaleText: { color: colors.textMuted, fontSize: 11 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginRight: 14, marginTop: 4 },
  legendDot: { width: 9, height: 9, borderRadius: 5, marginRight: 6 },
  legendDash: { width: 12, height: 0, borderTopWidth: 2, borderStyle: 'dashed', borderColor: colors.textMuted, marginRight: 6 },
  legendText: { color: colors.textMuted, fontSize: 12 },
  empty: { color: colors.textMuted },
});
