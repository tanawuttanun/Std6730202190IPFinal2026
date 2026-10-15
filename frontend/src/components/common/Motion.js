import { useEffect, useRef } from 'react';
import { Animated, Easing, Platform, Pressable } from 'react-native';

const useNative = Platform.OS !== 'web';

// Fades + slides its children up on mount. `delay` staggers lists of cards.
export function FadeInView({ delay = 0, distance = 16, duration = 450, style, children }) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: useNative,
    }).start();
  }, [progress, delay, duration]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: progress,
          transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [distance, 0] }) }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

// Pressable that shrinks slightly while pressed (tactile feedback).
// containerStyle styles the outer touch area (e.g. flex: 1 inside a row).
export function PressableScale({ onPress, disabled, style, containerStyle, children, scaleTo = 0.96, hitSlop }) {
  const scale = useRef(new Animated.Value(1)).current;
  const animate = (toValue) =>
    Animated.spring(scale, { toValue, useNativeDriver: useNative, speed: 40, bounciness: 6 }).start();

  return (
    <Pressable
      style={containerStyle}
      onPress={onPress}
      disabled={disabled}
      hitSlop={hitSlop}
      onPressIn={() => animate(scaleTo)}
      onPressOut={() => animate(1)}
    >
      <Animated.View style={[style, { transform: [{ scale }] }, disabled && { opacity: 0.6 }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}

// Animated 0 -> 1 value, used for bars that "grow" into place.
export function useGrow(deps = [], { delay = 0, duration = 700 } = {}) {
  const value = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    value.setValue(0);
    Animated.timing(value, {
      toValue: 1,
      duration,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false, // animates width/height
    }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return value;
}
