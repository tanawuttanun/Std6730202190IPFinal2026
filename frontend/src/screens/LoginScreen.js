import { useRef, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { api, setAuthToken } from '../services/api';
import { API_URL } from '../config/api';
import { colors } from '../constants/theme';
import { validateLogin } from '../utils/validation';
import { showAlert } from '../utils/alert';
import GradientButton from '../components/common/GradientButton';
import VideoBackground from '../components/common/VideoBackground';
import { FadeInView } from '../components/common/Motion';

export default function LoginScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const wide = width >= 900;

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
      showAlert('Login failed', e.status === 401 ? 'Invalid username or password.' : e.message);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  };

  const sidePad = wide ? 75 : 24;

  return (
    <View style={styles.container}>
      <VideoBackground />
      {/* side + bottom fades keep the type readable over the video */}
      <LinearGradient
        colors={wide ? ['rgba(5,5,5,0.88)', 'rgba(5,5,5,0.55)', 'rgba(5,5,5,0.05)'] : ['rgba(5,5,5,0.78)', 'rgba(5,5,5,0.5)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <LinearGradient
        colors={['rgba(5,5,5,0)', 'rgba(5,5,5,0.55)', '#050505']}
        locations={[0.55, 0.82, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingHorizontal: sidePad }]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.hero}>
            <FadeInView delay={60}>
              <Image
                source={require('../../assets/hr-logo.png')}
                style={[styles.logo, wide && styles.logoWide]}
                resizeMode="contain"
                accessibilityLabel="HR Management System logo"
              />
              <Text style={[styles.headline, wide && styles.headlineWide]}>HR MANAGEMENT SYSTEM</Text>
            </FadeInView>

            <FadeInView delay={140}>
              <Text style={styles.sub}>
                HR Manager &amp; Salary Analytics — manage your team and see your salary structure in one place.
              </Text>
            </FadeInView>

            <FadeInView delay={220} style={styles.form}>
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                placeholder="Username"
                placeholderTextColor={colors.strip}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                placeholderTextColor={colors.strip}
                secureTextEntry
                autoCapitalize="none"
                returnKeyType="go"
                onSubmitEditing={handleLogin}
              />
              <GradientButton title="Get Started" onPress={handleLogin} loading={loading} style={styles.cta} />
            </FadeInView>
          </View>

          <FadeInView delay={340}>
            <Text style={styles.footer}>API: {API_URL}</Text>
          </FadeInView>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { flexGrow: 1, paddingTop: 27, paddingBottom: 28 },
  hero: { flex: 1, justifyContent: 'center', paddingVertical: 32, maxWidth: 560 },
  // 560x440 crop of the HR logo (aspect 1.273)
  logo: { width: 190, height: 149, marginLeft: -6, marginBottom: 14 },
  logoWide: { width: 260, height: 204 },
  headline: { color: colors.text, fontSize: 20, lineHeight: 28, fontWeight: '500', letterSpacing: 4 },
  headlineWide: { fontSize: 26, lineHeight: 34, letterSpacing: 6 },
  sub: { color: colors.textMuted, fontSize: 16, lineHeight: 24, marginTop: 18, maxWidth: 440 },
  form: { marginTop: 28, maxWidth: 360 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 13,
    color: colors.text,
    fontSize: 16,
    marginBottom: 12,
  },
  cta: { marginTop: 6, alignSelf: 'flex-start', minWidth: 190 },
  footer: { color: colors.strip, fontSize: 11 },
});
