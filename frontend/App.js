import { useEffect } from 'react';
import { Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';

// Manrope on the web build (loaded from Google Fonts); phones keep the system font.
function useWebFont() {
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap';
    document.head.appendChild(link);

    const style = document.createElement('style');
    style.textContent =
      "html, body { background:#050505; } body, input, textarea, button, div, span { font-family: 'Manrope', system-ui, -apple-system, 'Segoe UI', sans-serif !important; -webkit-font-smoothing: antialiased; text-rendering: geometricPrecision; }";
    document.head.appendChild(style);
    return () => {
      link.remove();
      style.remove();
    };
  }, []);
}

export default function App() {
  useWebFont();
  return (
    <>
      <StatusBar style="light" />
      <AppNavigator />
    </>
  );
}
