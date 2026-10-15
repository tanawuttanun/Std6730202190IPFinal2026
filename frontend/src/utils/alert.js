import { Alert, Platform } from 'react-native';

// React Native's Alert does nothing on web (react-native-web), so in the
// browser fall back to window.alert / window.confirm.

export const showAlert = (title, message) => {
  if (Platform.OS === 'web') {
    window.alert(message ? `${title}\n\n${message}` : title);
    return;
  }
  Alert.alert(title, message);
};

// Cancel / confirm dialog. onConfirm runs only when the user confirms.
export const confirmAction = ({ title, message, confirmText = 'OK', onConfirm }) => {
  if (Platform.OS === 'web') {
    if (window.confirm(message ? `${title}\n\n${message}` : title)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: 'Cancel', style: 'cancel' },
    { text: confirmText, style: 'destructive', onPress: onConfirm },
  ]);
};
