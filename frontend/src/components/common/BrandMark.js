import Svg, { Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

// Abstract angular "S" / bolt mark with two bright notches.
export default function BrandMark({ width = 32, height = 49 }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 31.5 48.5">
      <Defs>
        <LinearGradient id="bg1" x1="8" y1="0" x2="34.1" y2="28.9" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#9e9e9e" />
          <Stop offset="0.28" stopColor="#a6a6a6" />
          <Stop offset="0.34" stopColor="#a3a3a3" />
          <Stop offset="0.4" stopColor="#3a3a3a" />
          <Stop offset="0.55" stopColor="#414141" />
          <Stop offset="0.6" stopColor="#7a7a7a" />
          <Stop offset="0.68" stopColor="#8e8e8e" />
          <Stop offset="0.8" stopColor="#a9a9a9" />
          <Stop offset="0.95" stopColor="#c4c4c4" />
          <Stop offset="1" stopColor="#cccccc" />
        </LinearGradient>
      </Defs>
      <Path d="M21.5 0 L21.5 19.5 L31.5 19.5 L31.5 29 L10 48.5 L10 28.5 L0.5 28.5 L0.5 18.5 Z" fill="url(#bg1)" />
      <Rect x="0.5" y="18.5" width="9" height="10" fill="#fdfdfd" />
      <Rect x="22" y="19.5" width="9.5" height="9.5" fill="#fdfdfd" />
    </Svg>
  );
}
