import { ActivityIndicator, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PressableScale } from './Motion';
import { colors, gradients, radius } from '../../constants/theme';

// White fully-rounded pill with dark text (primary call to action).
export default function GradientButton({ title, onPress, loading, disabled, colors: gradient = gradients.primary, style }) {
  return (
    <PressableScale onPress={onPress} disabled={disabled || loading} style={style}>
      <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.button}>
        {loading ? <ActivityIndicator color={colors.pillInk} /> : <Text style={styles.text}>{title}</Text>}
      </LinearGradient>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  button: { borderRadius: radius.pill, paddingVertical: 14, paddingHorizontal: 22, alignItems: 'center', justifyContent: 'center' },
  text: { color: colors.pillInk, fontWeight: '700', fontSize: 15, letterSpacing: 0.2 },
});
