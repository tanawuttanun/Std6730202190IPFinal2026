import { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { api, setAuthToken } from '../services/api';
import { API_URL } from '../config/api';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients, shadow } from '../constants/theme';
import GradientButton from '../components/common/GradientButton';
import { FadeInView } from '../components/common/Motion';
import { validateLogin } from '../utils/validation';
import { showAlert } from '../utils/alert';

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const loadingRef = useRef(false); // blocks double submit (keyboard "go" + button)

  const handleLogin = async () => {
    if (loadingRef.current) return;
    const error = validateLogin({ username, password });
    if (error) {
      showAlert('Missing information', error);
      return;
    }

    loadingRef.current = true;
    setLoading(true);
    try {
      const res = await api.login(username.trim(), password);
      if (!res?.success || !res?.token) throw new Error('Login failed');
      setAuthToken(res.token);
      setPassword('');
      // replace: the user cannot go "back" to the login screen without logging out
      navigation.replace('Dashboard');
    } catch (e) {
      showAlert(
        'Login failed',
        e.status === 401 ? 'Invalid username or password.' : e.message
      );
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <LinearGradient colors={gradients.hero} style={StyleSheet.absoluteFill} />
      <View style={styles.inner}>
      <FadeInView style={styles.header}>
        <LinearGradient colors={gradients.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.logo}>
          <Text style={styles.logoText}>HR</Text>
        </LinearGradient>
        <Text style={styles.title}>HR Manager</Text>
        <Text style={styles.subtitle}>Employee & Salary Analytics System</Text>
      </FadeInView>

      <FadeInView delay={150} style={styles.card}>
        <Text style={styles.cardTitle}>Welcome back 👋</Text>
        <Text style={styles.cardSubtitle}>Sign in to manage your team</Text>
        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          placeholder="Username"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="next"
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          placeholderTextColor={colors.textMuted}
          secureTextEntry
          autoCapitalize="none"
          returnKeyType="go"
          onSubmitEditing={handleLogin}
        />

        <GradientButton title="Log in" onPress={handleLogin} loading={loading} style={{ marginTop: 24 }} />
      </FadeInView>

      <Text style={styles.footer}>API: {API_URL}</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, justifyContent: 'center' },
  inner: { padding: 24, width: '100%', maxWidth: 440, alignSelf: 'center' },
  header: { alignItems: 'center', marginBottom: 32 },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoText: { color: '#fff', fontSize: 28, fontWeight: '800' },
  title: { color: colors.text, fontSize: 28, fontWeight: '800' },
  subtitle: { color: colors.textMuted, fontSize: 14, marginTop: 6 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 22,
    ...shadow,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: { color: colors.text, fontSize: 20, fontWeight: '800' },
  cardSubtitle: { color: colors.textMuted, fontSize: 13, marginTop: 4, marginBottom: 8 },
  label: { color: colors.textMuted, fontSize: 13, marginBottom: 6, marginTop: 8, fontWeight: '600' },
  input: {
    backgroundColor: colors.bg,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  footer: { color: colors.textMuted, fontSize: 11, textAlign: 'center', marginTop: 24 },
});
