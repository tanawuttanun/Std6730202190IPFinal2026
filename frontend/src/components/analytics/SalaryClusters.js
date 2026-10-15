import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../constants/theme';
import { formatMoney } from '../../utils/format';

export default function SalaryClusters({ loading, result, error, stale, onAnalyze }) {
  const clusters = result?.clusters || [];
  const total = clusters.reduce((s, c) => s + c.count, 0) || 1;

  return (
    <View style={styles.wrapper}>
      <Pressable
        style={({ pressed }) => [styles.button, (pressed || loading) && { opacity: 0.8 }]}
        onPress={onAnalyze}
        disabled={loading}
      >
        <Text style={styles.buttonText}>📊  Analyze Salary Structure</Text>
      </Pressable>

      {loading && (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.muted}>Running K-Means clustering…</Text>
        </View>
      )}

      {!loading && error && <Text style={styles.error}>⚠️ {error}</Text>}

      {!loading && result && (
        <View>
          <Text style={styles.sectionTitle}>
            Salary Tiers (K-Means, k=3) · {result.totalEmployees} employees
          </Text>
          {stale && <Text style={styles.stale}>Employee data changed — tap Analyze again to refresh.</Text>}
          {result.message && <Text style={styles.muted}>{result.message}</Text>}

          {clusters.map((c, i) => (
            <View key={c.group} style={[styles.card, { borderLeftColor: colors.tiers[i % colors.tiers.length] }]}>
              <View style={styles.cardHeader}>
                <Text style={[styles.tierName, { color: colors.tiers[i % colors.tiers.length] }]}>{c.group}</Text>
                <Text style={styles.count}>
                  {c.count} {c.count === 1 ? 'employee' : 'employees'}
                </Text>
              </View>
              <Text style={styles.label}>Average base salary</Text>
              <Text style={styles.centroid}>{formatMoney(c.centroid)}</Text>
              {c.minSalary !== undefined && (
                <Text style={styles.muted}>
                  Range: {formatMoney(c.minSalary)} – {formatMoney(c.maxSalary)}
                </Text>
              )}
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    { width: `${(c.count / total) * 100}%`, backgroundColor: colors.tiers[i % colors.tiers.length] },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 16 },
  button: {
    backgroundColor: '#0EA5E9',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  loading: { alignItems: 'center', paddingVertical: 20 },
  sectionTitle: { color: colors.text, fontWeight: '700', fontSize: 15, marginTop: 14, marginBottom: 8 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 5,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tierName: { fontSize: 17, fontWeight: '800' },
  count: { color: colors.text, fontWeight: '600' },
  label: { color: colors.textMuted, fontSize: 11, marginTop: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  centroid: { color: colors.text, fontSize: 22, fontWeight: '800', marginVertical: 2 },
  muted: { color: colors.textMuted, fontSize: 12, marginTop: 4 },
  stale: { color: colors.warning, fontSize: 12, marginBottom: 6 },
  error: { color: '#FCA5A5', marginTop: 12 },
  barTrack: { height: 6, backgroundColor: colors.bg, borderRadius: 3, marginTop: 10, overflow: 'hidden' },
  barFill: { height: 6, borderRadius: 3 },
});
