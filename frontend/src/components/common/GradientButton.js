import { ActivityIndicator, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PressableScale } from './Motion';
import { gradients, radius } from '../../constants/theme';

export default function GradientButton({ title, onPress, loading, disabled, colors = gradients.primary, style }) {
  return (
    <PressableScale onPress={onPress} disabled={disabled || loading} style={style}>
      <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.button}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.text}>{title}</Text>}
      </LinearGradient>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  button: { borderRadius: radius.md, paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
  text: { color: '#fff', fontWeight: '800', fontSize: 15, letterSpacing: 0.3 },
});
