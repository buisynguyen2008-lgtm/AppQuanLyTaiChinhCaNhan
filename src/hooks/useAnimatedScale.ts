import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

/**
 * Custom hook for scale animation with proper cleanup
 */
export const useAnimatedScale = (focused: boolean): Animated.Value => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (focused) {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [focused, scaleAnim]);

  return scaleAnim;
};
