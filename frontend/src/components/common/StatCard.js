import { StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '../../constants/theme';
import { FadeInView } from './Motion';

// KPI tile: icon, big value, label and optional hint line.
export default function StatCard({ icon, label, value, hint, color = colors.text, delay = 0 }) {
  return (
    <FadeInView delay={delay} style={styles.wrap}>
      <View style={styles.card}>
        <View style={[styles.iconBubble, { backgroundColor: `${color}22` }]}>
          <Text style={styles.icon}>{icon}</Text>
        </View>
        <Text style={[styles.value, { color }]} numberOfLines={1} adjustsFontSizeToFit>
          {value}
        </Text>
        <Text style={styles.label}>{label}</Text>
        {hint ? <Text style={styles.hint} numberOfLines={1}>{hint}</Text> : null}
      </View>
    </FadeInView>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '50%', padding: 5 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 120,
  },
  iconBubble: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  icon: { fontSize: 17 },
  value: { fontSize: 22, fontWeight: '800' },
  label: { color: colors.textMuted, fontSize: 12, marginTop: 2, fontWeight: '600' },
  hint: { color: colors.textMuted, fontSize: 11, marginTop: 4, opacity: 0.8 },
});
