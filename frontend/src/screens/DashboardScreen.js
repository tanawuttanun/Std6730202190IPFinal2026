import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { api, getAuthToken, setAuthToken } from '../services/api';
import { colors, gradients, radius, shadow } from '../constants/theme';
import { formatCompactMoney, formatMoney } from '../utils/format';
import { computeSummary } from '../utils/analytics';
import { confirmAction, showAlert } from '../utils/alert';
import EmployeeCard from '../components/employees/EmployeeCard';
import AddEmployeeForm from '../components/employees/AddEmployeeForm';
import SalaryClusters from '../components/analytics/SalaryClusters';
import StatCard from '../components/common/StatCard';
import { FadeInView, PressableScale } from '../components/common/Motion';
import ChartCard from '../components/charts/ChartCard';
import StatusDonut from '../components/charts/StatusDonut';

// Re-fetch the list periodically so changes made elsewhere (another device,
// phpMyAdmin) appear without a manual refresh.
const AUTO_REFRESH_MS = 10000;

export default function DashboardScreen({ navigation }) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [busyIds, setBusyIds] = useState({});
  // In-flight ids (ref = updated immediately, so a double tap can't send 2 requests)
  const busyRef = useRef(new Set());
  const [storage, setStorage] = useState(null);
  const [tab, setTab] = useState('executive');
  const [search, setSearch] = useState('');

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
            confirmAction({
              title: 'Log out',
              message: 'Do you want to log out?',
              confirmText: 'Log out',
              onConfirm: logout,
            })
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
        showAlert('Session expired', 'Please log in again.');
        logout();
        return;
      }
      showAlert(title, e.message);
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

  useEffect(() => {
    const timer = setInterval(() => {
      // Skip while a toggle/delete is in flight to avoid flicker.
      if (busyRef.current.size === 0) fetchEmployees();
    }, AUTO_REFRESH_MS);
    return () => clearInterval(timer);
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
    confirmAction({
      title: 'Delete employee',
      message: `Are you sure? "${employee.name}" will be permanently removed.`,
      confirmText: 'Delete',
      onConfirm: async () => {
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
    });
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

  const summary = useMemo(() => computeSummary(employees), [employees]);

  const filteredEmployees = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter(
      (e) => e.name.toLowerCase().includes(q) || e.position.toLowerCase().includes(q) || e.status.toLowerCase().includes(q)
    );
  }, [employees, search]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.muted}>Loading employees…</Text>
      </View>
    );
  }

  const errorBox = loadError ? (
    <View style={styles.errorBox}>
      <Text style={styles.errorText}>⚠️ {loadError}</Text>
      <Pressable onPress={onRefresh} style={styles.retry}>
        <Text style={{ color: colors.text, fontWeight: '700' }}>Retry</Text>
      </Pressable>
    </View>
  ) : null;

  const tabs = (
    <View style={styles.tabs}>
      {[
        { key: 'executive', label: '📈  Executive' },
        { key: 'team', label: `👥  Team (${employees.length})` },
      ].map((t) => (
        <PressableScale key={t.key} onPress={() => setTab(t.key)} containerStyle={styles.tabWrap}>
          {tab === t.key ? (
            <LinearGradient colors={gradients.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.tab}>
              <Text style={styles.tabTextActive}>{t.label}</Text>
            </LinearGradient>
          ) : (
            <View style={styles.tab}>
              <Text style={styles.tabText}>{t.label}</Text>
            </View>
          )}
        </PressableScale>
      ))}
    </View>
  );

  // ---- Executive (CEO) view ----
  const executiveHeader = (
    <View>
      <FadeInView>
        <LinearGradient colors={gradients.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
          <Text style={styles.heroKicker}>EXECUTIVE OVERVIEW</Text>
          <Text style={styles.heroTitle}>Monthly payroll</Text>
          <Text style={styles.heroValue}>{formatMoney(summary.payroll)}</Text>
          <Text style={styles.heroSub}>
            {summary.headcount} employees · median {formatCompactMoney(summary.median)} · range{' '}
            {formatCompactMoney(summary.min)}–{formatCompactMoney(summary.max)}
          </Text>
          {storage && (
            <View style={styles.chip}>
              <Text style={styles.chipText}>
                {storage === 'mysql' ? '● Live: MySQL database' : '● In-memory data (resets on server restart)'} · auto-refresh 10s
              </Text>
            </View>
          )}
        </LinearGradient>
      </FadeInView>

      {tabs}
      {errorBox}

      <View style={styles.kpiGrid}>
        <StatCard icon="👥" label="Headcount" value={summary.headcount} delay={60} />
        <StatCard icon="✅" label="Active rate" value={`${Math.round(summary.activeRate * 100)}%`} hint={`${summary.onLeave} on leave`} color={colors.success} delay={120} />
        <StatCard icon="💰" label="Average salary" value={formatCompactMoney(summary.average)} hint={`median ${formatCompactMoney(summary.median)}`} color={colors.accent} delay={180} />
        <StatCard icon="🏆" label="Highest salary" value={formatCompactMoney(summary.max)} hint={`lowest ${formatCompactMoney(summary.min)}`} color={colors.tiers[2]} delay={240} />
      </View>

      <ChartCard title="Workforce status" subtitle="Active vs On Leave" delay={300}>
        <StatusDonut active={summary.active} onLeave={summary.onLeave} />
      </ChartCard>

      <Text style={styles.sectionTitle}>Salary structure · K-Means</Text>
      <SalaryClusters
        loading={clusterLoading}
        result={clusterResult}
        error={clusterError}
        stale={clustersStale}
        onAnalyze={handleAnalyze}
        employees={employees}
      />
    </View>
  );

  // ---- Team (CRUD) view ----
  // Passed as an element (not a component) so the TextInputs keep focus while typing.
  const teamHeader = (
    <View>
      {tabs}
      {errorBox}
      <AddEmployeeForm onSubmit={handleAdd} />
      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search name, position or status"
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
          autoCorrect={false}
        />
      </View>
      <Text style={styles.sectionTitle}>
        Employees ({filteredEmployees.length}
        {search.trim() ? ` of ${employees.length}` : ''})
      </Text>
    </View>
  );

  const isTeam = tab === 'team';

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <FlatList
        style={styles.container}
        contentContainerStyle={styles.content}
        data={isTeam ? filteredEmployees : []}
        keyExtractor={(item) => String(item.id)}
        ListHeaderComponent={isTeam ? teamHeader : executiveHeader}
        renderItem={({ item, index }) => (
          <FadeInView delay={Math.min(index, 8) * 50}>
            <EmployeeCard
              employee={item}
              busy={!!busyIds[item.id]}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          </FadeInView>
        )}
        ListEmptyComponent={
          isTeam && !loadError ? (
            <Text style={styles.empty}>{search.trim() ? 'No employees match your search.' : 'No employees yet. Add one above.'}</Text>
          ) : null
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        keyboardShouldPersistTaps="handled"
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, paddingBottom: 48, width: '100%', maxWidth: 860, alignSelf: 'center' },
  center: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  muted: { color: colors.textMuted, fontSize: 12, marginTop: 4 },
  hero: { borderRadius: radius.xl, padding: 22, marginBottom: 16, borderWidth: 1, borderColor: colors.border, ...shadow },
  heroKicker: { color: colors.accent, fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },
  heroTitle: { color: colors.textMuted, fontSize: 14, marginTop: 10 },
  heroValue: { color: colors.text, fontSize: 34, fontWeight: '900', marginTop: 2 },
  heroSub: { color: colors.textMuted, fontSize: 12, marginTop: 6 },
  chip: {
    alignSelf: 'flex-start',
    marginTop: 14,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  chipText: { color: colors.text, fontSize: 11, fontWeight: '600' },
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.bgSoft,
    borderRadius: radius.md,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabWrap: { flex: 1 },
  tab: { borderRadius: radius.sm, paddingVertical: 10, alignItems: 'center' },
  tabText: { color: colors.textMuted, fontWeight: '700' },
  tabTextActive: { color: colors.pillInk, fontWeight: '800' },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -5, marginBottom: 7 },
  sectionTitle: { color: colors.text, fontSize: 17, fontWeight: '800', marginBottom: 12, marginTop: 4 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    marginBottom: 14,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, color: colors.text, paddingVertical: 12, fontSize: 15 },
  errorBox: {
    backgroundColor: '#3B0D18',
    borderRadius: radius.md,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorText: { color: '#FCA5A5', flex: 1 },
  retry: { backgroundColor: colors.surfaceAlt, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  empty: { color: colors.textMuted, textAlign: 'center', marginTop: 20 },
});
