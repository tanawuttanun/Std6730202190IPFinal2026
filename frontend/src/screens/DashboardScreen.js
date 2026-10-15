import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { api, getAuthToken, setAuthToken } from '../services/api';
import { colors } from '../constants/theme';
import { formatMoney } from '../utils/format';
import EmployeeCard from '../components/employees/EmployeeCard';
import AddEmployeeForm from '../components/employees/AddEmployeeForm';
import SalaryClusters from '../components/analytics/SalaryClusters';
import StatCard from '../components/common/StatCard';

export default function DashboardScreen({ navigation }) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [busyIds, setBusyIds] = useState({});
  // In-flight ids (ref = updated immediately, so a double tap can't send 2 requests)
  const busyRef = useRef(new Set());
  const [storage, setStorage] = useState(null);

  const [clusterResult, setClusterResult] = useState(null);
  const [clusterLoading, setClusterLoading] = useState(false);
  const [clusterError, setClusterError] = useState(null);
  const [clustersStale, setClustersStale] = useState(false);

  const logout = useCallback(() => {
    setAuthToken(null);
    navigation.replace('Login');
  }, [navigation]);

  // Block access to the dashboard without a token.
  useEffect(() => {
    if (!getAuthToken()) navigation.replace('Login');
  }, [navigation]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={() =>
            Alert.alert('Log out', 'Do you want to log out?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Log out', style: 'destructive', onPress: logout },
            ])
          }
          hitSlop={10}
        >
          <Text style={{ color: '#FCA5A5', fontWeight: '700' }}>Logout</Text>
        </Pressable>
      ),
    });
  }, [navigation, logout]);

  // Session expired / server restarted with auth enabled -> back to login.
  const handleError = useCallback(
    (title, e) => {
      if (e.status === 401) {
        Alert.alert('Session expired', 'Please log in again.');
        logout();
        return;
      }
      Alert.alert(title, e.message);
    },
    [logout]
  );

  const fetchEmployees = useCallback(async () => {
    try {
      const res = await api.getEmployees();
      setEmployees(Array.isArray(res?.data) ? res.data : []);
      setLoadError(null);
    } catch (e) {
      setLoadError(e.message);
      if (e.status === 401) handleError('', e);
    }
  }, [handleError]);

  useEffect(() => {
    fetchEmployees().finally(() => setLoading(false));
    api
      .health()
      .then((res) => setStorage(res?.storage || null))
      .catch(() => {});
  }, [fetchEmployees]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchEmployees();
    setRefreshing(false);
  };

  const markChanged = () => {
    if (clusterResult) setClustersStale(true);
  };

  const setBusy = (id, value) => {
    if (value) busyRef.current.add(id);
    else busyRef.current.delete(id);
    setBusyIds((prev) => ({ ...prev, [id]: value }));
  };

  // ---- CRUD actions (UI updates automatically by re-fetching the list) ----
  const handleAdd = async (employee) => {
    try {
      await api.addEmployee(employee);
      await fetchEmployees();
      markChanged();
      return true;
    } catch (e) {
      handleError('Could not add employee', e);
      return false;
    }
  };

  const handleToggle = async (employee) => {
    if (busyRef.current.has(employee.id)) return;
    setBusy(employee.id, true);
    try {
      await api.toggleStatus(employee.id);
      await fetchEmployees();
    } catch (e) {
      handleError('Could not update status', e);
      await fetchEmployees();
    } finally {
      setBusy(employee.id, false);
    }
  };

  const handleDelete = (employee) => {
    if (busyRef.current.has(employee.id)) return;
    // Confirmation BEFORE sending the delete request.
    Alert.alert('Delete employee', `Are you sure? "${employee.name}" will be permanently removed.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          if (busyRef.current.has(employee.id)) return;
          setBusy(employee.id, true);
          try {
            await api.deleteEmployee(employee.id);
            markChanged();
          } catch (e) {
            handleError('Could not delete employee', e);
          } finally {
            await fetchEmployees();
            setBusy(employee.id, false);
          }
        },
      },
    ]);
  };

  // ---- Phase 2: K-Means ----
  const handleAnalyze = async () => {
    setClusterLoading(true);
    setClusterError(null);
    try {
      const res = await api.getSalaryClusters();
      setClusterResult(res);
      setClustersStale(false);
    } catch (e) {
      setClusterResult(null);
      setClusterError(e.message);
      if (e.status === 401) handleError('', e);
    } finally {
      setClusterLoading(false);
    }
  };

  const stats = useMemo(() => {
    const active = employees.filter((e) => e.status === 'Active').length;
    const avg = employees.length ? employees.reduce((s, e) => s + Number(e.salary || 0), 0) / employees.length : 0;
    return { total: employees.length, active, onLeave: employees.length - active, avg };
  }, [employees]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.muted}>Loading employees…</Text>
      </View>
    );
  }

  // Passed as an element (not a component) so the TextInputs keep focus while typing.
  const header = (
    <View>
      <View style={styles.statsRow}>
        <StatCard label="Total" value={stats.total} />
        <StatCard label="Active" value={stats.active} color={colors.success} />
        <StatCard label="On Leave" value={stats.onLeave} color={colors.warning} />
      </View>
      <View style={styles.avgBox}>
        <Text style={styles.muted}>Average salary</Text>
        <Text style={styles.avgValue}>{formatMoney(Math.round(stats.avg))}</Text>
        {storage && (
          <Text style={styles.muted}>Storage: {storage === 'mysql' ? 'MySQL database' : 'In-memory (resets on server restart)'}</Text>
        )}
      </View>

      <SalaryClusters
        loading={clusterLoading}
        result={clusterResult}
        error={clusterError}
        stale={clustersStale}
        onAnalyze={handleAnalyze}
      />

      <AddEmployeeForm onSubmit={handleAdd} />

      <Text style={styles.sectionTitle}>Employees ({employees.length})</Text>
      {loadError && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>⚠️ {loadError}</Text>
          <Pressable onPress={onRefresh} style={styles.retry}>
            <Text style={{ color: colors.text, fontWeight: '700' }}>Retry</Text>
          </Pressable>
        </View>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <FlatList
        style={styles.container}
        contentContainerStyle={styles.content}
        data={employees}
        keyExtractor={(item) => String(item.id)}
        ListHeaderComponent={header}
        renderItem={({ item }) => (
          <EmployeeCard
            employee={item}
            busy={!!busyIds[item.id]}
            onToggle={handleToggle}
            onDelete={handleDelete}
          />
        )}
        ListEmptyComponent={!loadError ? <Text style={styles.empty}>No employees yet. Add one above.</Text> : null}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        keyboardShouldPersistTaps="handled"
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, paddingBottom: 40 },
  center: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  muted: { color: colors.textMuted, fontSize: 12, marginTop: 4 },
  statsRow: { flexDirection: 'row', marginBottom: 10 },
  avgBox: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avgValue: { color: colors.text, fontSize: 22, fontWeight: '800', marginTop: 2 },
  sectionTitle: { color: colors.text, fontSize: 17, fontWeight: '700', marginBottom: 10 },
  errorBox: {
    backgroundColor: '#450A0A',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorText: { color: '#FCA5A5', flex: 1 },
  retry: { backgroundColor: colors.surfaceAlt, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  empty: { color: colors.textMuted, textAlign: 'center', marginTop: 20 },
});
