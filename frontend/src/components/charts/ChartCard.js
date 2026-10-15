import { StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '../../constants/theme';
import { FadeInView } from '../common/Motion';

export default function ChartCard({ title, subtitle, delay = 0, children }) {
  return (
    <FadeInView delay={delay} style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      <View style={styles.body}>{children}</View>
    </FadeInView>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  title: { color: colors.text, fontSize: 16, fontWeight: '800' },
  subtitle: { color: colors.textMuted, fontSize: 12, marginTop: 3 },
  body: { marginTop: 14 },
});
