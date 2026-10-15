import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../constants/theme';

export default function StatCard({ label, value, color = colors.text }) {
  return (
    <View style={styles.stat}>
      <Text style={[styles.value, { color }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  stat: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: 12,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  value: { fontSize: 24, fontWeight: '800' },
  label: { color: colors.textMuted, fontSize: 12, marginTop: 4 },
});
