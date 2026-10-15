import { StyleSheet, View } from 'react-native';
import { VIDEO_URL } from '../../constants/theme';

// Web: full-bleed looping <video> behind the content.
export default function VideoBackground({ children }) {
  return (
    <View style={styles.fill} pointerEvents="none">
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '43% center', pointerEvents: 'none' }}
      >
        <source src={VIDEO_URL} type="video/mp4" />
      </video>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { ...StyleSheet.absoluteFillObject, backgroundColor: '#050505' },
});
