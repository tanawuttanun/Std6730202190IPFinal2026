import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { api, setAuthToken } from '../services/api';
import { API_URL } from '../config/api';
import { colors } from '../constants/theme';
import { validateLogin } from '../utils/validation';

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const loadingRef = useRef(false); // blocks double submit (keyboard "go" + button)

  const handleLogin = async () => {
    if (loadingRef.current) return;
    const error = validateLogin({ username, password });
    if (error) {
      Alert.alert('Missing information', error);
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
      Alert.alert(
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
      <View style={styles.header}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>HR</Text>
        </View>
        <Text style={styles.title}>HR Manager</Text>
        <Text style={styles.subtitle}>Employee & Salary Analytics System</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          placeholder="admin"
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

        <Pressable
          style={({ pressed }) => [styles.button, (pressed || loading) && styles.buttonPressed]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Log in</Text>}
        </Pressable>
      </View>

      <Text style={styles.footer}>API: {API_URL}</Text>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 32 },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoText: { color: '#fff', fontSize: 28, fontWeight: '800' },
  title: { color: colors.text, fontSize: 28, fontWeight: '800' },
  subtitle: { color: colors.textMuted, fontSize: 14, marginTop: 6 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: { color: colors.textMuted, fontSize: 13, marginBottom: 6, marginTop: 8, fontWeight: '600' },
  input: {
    backgroundColor: colors.bg,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonPressed: { backgroundColor: colors.primaryDark },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  footer: { color: colors.textMuted, fontSize: 11, textAlign: 'center', marginTop: 24 },
});
