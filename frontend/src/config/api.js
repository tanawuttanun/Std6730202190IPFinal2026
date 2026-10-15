import Constants from 'expo-constants';

// The backend runs on port 3000 of the computer that runs `npx expo start`.
// With Expo Go we reuse the IP Metro is served from, so it works on any Wi-Fi/hotspot
// without editing code. Set EXPO_PUBLIC_API_URL to override (e.g. http://192.168.1.10:3000).
const API_PORT = 3000;

const detectHost = () => {
  const hostUri = Constants.expoConfig?.hostUri || Constants.expoGoConfig?.debuggerHost || '';
  const host = hostUri.split(':')[0];
  return host || 'localhost';
};

export const API_URL = process.env.EXPO_PUBLIC_API_URL || `http://${detectHost()}:${API_PORT}`;

export const REQUEST_TIMEOUT_MS = 10000;
