import { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients, radius } from '../../constants/theme';
import { formatMoney } from '../../utils/format';
import { buildInsights, tierBreakdown } from '../../utils/analytics';
import GradientButton from '../common/GradientButton';
import { FadeInView } from '../common/Motion';
import ChartCard from '../charts/ChartCard';
import TierBarChart from '../charts/TierBarChart';
import SalaryScatter from '../charts/SalaryScatter';
import PayrollShareBar from '../charts/PayrollShareBar';

// Phase 2: "Analyze Salary Structure" button, loading state, tier summary
// cards and executive charts built from the K-Means result.
export default function SalaryClusters({ loading, result, error, stale, onAnalyze, employees }) {
  const clusters = result?.clusters || [];
  const breakdown = useMemo(() => tierBreakdown(employees, clusters), [employees, clusters]);
  const insights = useMemo(() => buildInsights(breakdown), [breakdown]);

  return (
    <View>
      <GradientButton
        title={result ? '↻  Re-analyze Salary Structure' : '📊  Analyze Salary Structure'}
        colors={gradients.accent}
        onPress={onAnalyze}
        loading={loading}
      />

      {loading && (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.muted}>Running K-Means clustering (k = 3)…</Text>
        </View>
      )}

      {!loading && error && <Text style={styles.error}>⚠️ {error}</Text>}

      {!loading && !result && !error && (
        <Text style={[styles.muted, { textAlign: 'center', marginTop: 12 }]}>
          Group salaries into 3 tiers with K-Means to see the charts.
        </Text>
      )}

      {!loading && result && (
        <View style={{ marginTop: 16 }}>
          {stale && (
            <Text style={styles.stale}>Employee data changed since this analysis. Tap Re-analyze to refresh.</Text>
          )}
          {result.message ? <Text style={styles.muted}>{result.message}</Text> : null}

          {/* Summary cards: tier name, employee count, average base salary */}
          <View style={styles.tierRow}>
            {clusters.map((c, i) => (
              <FadeInView key={c.group} delay={i * 120} style={styles.tierWrap}>
                <View style={[styles.tierCard, { borderColor: `${colors.tiers[i]}55` }]}>
                  <LinearGradient
                    colors={[`${colors.tiers[i]}33`, 'transparent']}
                    style={StyleSheet.absoluteFill}
                  />
                  <Text style={[styles.tierName, { color: colors.tiers[i] }]}>{c.group}</Text>
                  <Text style={styles.tierLabel}>Avg. base salary</Text>
                  <Text style={styles.tierValue} numberOfLines={1} adjustsFontSizeToFit>
                    {formatMoney(c.centroid)}
                  </Text>
                  <Text style={styles.tierCount}>
                    👥 {c.count} {c.count === 1 ? 'employee' : 'employees'}
                  </Text>
                  {c.minSalary !== undefined && (
                    <Text style={styles.tierRange} numberOfLines={1}>
                      {formatMoney(c.minSalary)} – {formatMoney(c.maxSalary)}
                    </Text>
                  )}
                </View>
              </FadeInView>
            ))}
          </View>

          {insights.length > 0 && (
            <FadeInView delay={300} style={styles.insights}>
              <Text style={styles.insightsTitle}>💡 Key insights</Text>
              {insights.map((text) => (
                <Text key={text} style={styles.insight}>• {text}</Text>
              ))}
            </FadeInView>
          )}

          <ChartCard title="Headcount by tier" subtitle="Bar height = employees · label = average salary" delay={350}>
            <TierBarChart clusters={clusters} />
          </ChartCard>

          <ChartCard title="Salary distribution" subtitle="Each dot is one employee, coloured by tier" delay={450}>
            <SalaryScatter employees={employees} clusters={clusters} />
          </ChartCard>

          <ChartCard title="Payroll share" subtitle="Monthly payroll per tier" delay={550}>
            <PayrollShareBar breakdown={breakdown} />
          </ChartCard>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  loading: { alignItems: 'center', paddingVertical: 24 },
  muted: { color: colors.textMuted, fontSize: 12, marginTop: 6 },
  stale: { color: colors.warning, fontSize: 12, marginBottom: 8 },
  error: { color: colors.danger, marginTop: 12 },
  tierRow: { flexDirection: 'row', marginHorizontal: -4, marginBottom: 12 },
  tierWrap: { flex: 1, paddingHorizontal: 4 },
  tierCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 12,
    borderWidth: 1,
    overflow: 'hidden',
    minHeight: 130,
  },
  tierName: { fontSize: 15, fontWeight: '800' },
  tierLabel: { color: colors.textMuted, fontSize: 10, marginTop: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  tierValue: { color: colors.text, fontSize: 17, fontWeight: '800', marginTop: 2 },
  tierCount: { color: colors.text, fontSize: 12, marginTop: 8, fontWeight: '600' },
  tierRange: { color: colors.textMuted, fontSize: 10, marginTop: 4 },
  insights: {
    backgroundColor: colors.bgSoft,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 12,
  },
  insightsTitle: { color: colors.text, fontWeight: '800', marginBottom: 6 },
  insight: { color: colors.textMuted, fontSize: 13, lineHeight: 20 },
});
