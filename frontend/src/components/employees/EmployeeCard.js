import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../constants/theme';
import { formatMoney } from '../../utils/format';

export default function EmployeeCard({ employee, busy, onToggle, onDelete }) {
  const active = employee.status === 'Active';

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{(employee.name || '?').trim().charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>{employee.name}</Text>
          <Text style={styles.position} numberOfLines={1}>{employee.position}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: active ? '#14532D' : '#78350F' }]}>
          <View style={[styles.dot, { backgroundColor: active ? colors.success : colors.warning }]} />
          <Text style={[styles.badgeText, { color: active ? '#86EFAC' : '#FCD34D' }]}>{employee.status}</Text>
        </View>
      </View>

      <View style={styles.bottomRow}>
        <View>
          <Text style={styles.salaryLabel}>Salary</Text>
          <Text style={styles.salary}>{formatMoney(employee.salary)}</Text>
        </View>

        <View style={styles.actions}>
          {busy ? (
            <ActivityIndicator color={colors.primary} style={{ marginRight: 12 }} />
          ) : (
            <>
              <Pressable
                style={({ pressed }) => [styles.btn, styles.toggleBtn, pressed && styles.pressed]}
                onPress={() => onToggle(employee)}
              >
                <Text style={styles.btnText}>Toggle Status</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.btn, styles.deleteBtn, pressed && styles.pressed]}
                onPress={() => onDelete(employee)}
              >
                <Text style={[styles.btnText, { color: '#FCA5A5' }]}>Delete</Text>
              </Pressable>
            </>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  topRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: { color: colors.primary, fontWeight: '800', fontSize: 18 },
  info: { flex: 1, marginRight: 8 },
  name: { color: colors.text, fontSize: 16, fontWeight: '700' },
  position: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
  badge: { flexDirection: 'row', alignItems: 'center', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  dot: { width: 7, height: 7, borderRadius: 4, marginRight: 6 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  salaryLabel: { color: colors.textMuted, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 },
  salary: { color: colors.text, fontSize: 18, fontWeight: '800', marginTop: 2 },
  actions: { flexDirection: 'row', alignItems: 'center' },
  btn: { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, marginLeft: 8 },
  toggleBtn: { backgroundColor: colors.surfaceAlt },
  deleteBtn: { backgroundColor: '#450A0A' },
  pressed: { opacity: 0.7 },
  btnText: { color: colors.text, fontSize: 13, fontWeight: '600' },
});
