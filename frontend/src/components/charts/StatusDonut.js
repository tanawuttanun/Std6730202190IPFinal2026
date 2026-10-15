import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors } from '../../constants/theme';

const SIZE = 130;
const STROKE = 16;
const R = (SIZE - STROKE) / 2;
const CIRC = 2 * Math.PI * R;

// Donut: Active vs On Leave.
export default function StatusDonut({ active, onLeave }) {
  const total = active + onLeave;
  const activeShare = total ? active / total : 0;

  return (
    <View style={styles.row}>
      <View style={{ width: SIZE, height: SIZE }}>
        {/* rotated so the arc starts at 12 o'clock */}
        <Svg width={SIZE} height={SIZE} style={{ transform: [{ rotate: '-90deg' }] }}>
          <Circle cx={SIZE / 2} cy={SIZE / 2} r={R} stroke={colors.warning} strokeWidth={STROKE} fill="none" opacity={total ? 0.9 : 0.15} />
          {total > 0 && (
            <Circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={R}
              stroke={colors.success}
              strokeWidth={STROKE}
              fill="none"
              strokeDasharray={`${CIRC * activeShare} ${CIRC}`}
              strokeLinecap={activeShare > 0 && activeShare < 1 ? 'round' : 'butt'}
            />
          )}
        </Svg>
        <View style={styles.center}>
          <Text style={styles.percent}>{Math.round(activeShare * 100)}%</Text>
          <Text style={styles.centerLabel}>active</Text>
        </View>
      </View>

      <View style={styles.legend}>
        <Legend color={colors.success} label="Active" value={active} />
        <Legend color={colors.warning} label="On Leave" value={onLeave} />
      </View>
    </View>
  );
}

function Legend({ color, label, value }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={styles.legendLabel}>{label}</Text>
      <Text style={styles.legendValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  center: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  percent: { color: colors.text, fontSize: 24, fontWeight: '800' },
  centerLabel: { color: colors.textMuted, fontSize: 11 },
  legend: { flex: 1, marginLeft: 20 },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginVertical: 6 },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  legendLabel: { color: colors.textMuted, flex: 1, fontSize: 13 },
  legendValue: { color: colors.text, fontWeight: '800', fontSize: 16 },
});
