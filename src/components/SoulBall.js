import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';

const SoulBall = ({ isListening, mood = 'neutral', isPressed = false, isDragging = false }) => {
  const pulseScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.6);
  const rotateValue = useSharedValue(0);
  const blurRadius = useSharedValue(10);
  const ballSize = useSharedValue(1);

  useEffect(() => {
    // 根据交互状态调整模糊和大小
    if (isDragging) {
      blurRadius.value = withSpring(20);
      ballSize.value = withSpring(1.3);
    } else if (isPressed) {
      blurRadius.value = withSpring(15);
      ballSize.value = withSpring(1.1);
    } else if (isListening) {
      blurRadius.value = withSpring(5);
      ballSize.value = withSpring(1.05);
      // 监听状态：快速脉冲
      pulseScale.value = withRepeat(
        withSpring(1.1, { duration: 500 }),
        -1,
        true
      );
      glowOpacity.value = withRepeat(
        withTiming(1, { duration: 500 }),
        -1,
        true
      );
    } else {
      blurRadius.value = withSpring(10);
      ballSize.value = withSpring(1);
      // 正常状态：缓慢呼吸
      pulseScale.value = withRepeat(
        withSpring(1.05, { duration: 2000 }),
        -1,
        true
      );
      glowOpacity.value = withRepeat(
        withTiming(0.8, { duration: 2000 }),
        -1,
        true
      );
    }

    // 持续旋转
    rotateValue.value = withRepeat(
      withTiming(360, { duration: 10000 }),
      -1,
      false
    );
  }, [isListening, isPressed, isDragging]);

  const ballAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: pulseScale.value * ballSize.value },
      { rotate: `${rotateValue.value}deg` },
    ],
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const blurAnimatedStyle = useAnimatedStyle(() => ({
    // 这里我们用opacity来模拟blur效果，因为BlurView在某些情况下可能不稳定
    opacity: interpolate(blurRadius.value, [5, 20], [0.9, 0.6]),
  }));

  // 20种心情颜色映射
  const getMoodColors = () => {
    const moodColors = {
      // 积极情绪
      'happy': ['#FFE066', '#FF9A9E'],        // 开心 - 温暖黄粉
      'excited': ['#FF6B9D', '#C471ED'],      // 激动 - 活力粉紫
      'joyful': ['#FFA726', '#FF7043'],       // 兴奋 - 橙红渐变
      'proud': ['#9C27B0', '#E91E63'],        // 自豪 - 紫红渐变
      'grateful': ['#4CAF50', '#8BC34A'],     // 感激 - 清新绿
      'peaceful': ['#81C784', '#A5D6A7'],     // 平静 - 淡绿
      'content': ['#64B5F6', '#90CAF9'],      // 满足 - 天蓝
      'hopeful': ['#FFB74D', '#FFCC02'],      // 希望 - 金黄
      'loving': ['#F48FB1', '#FCE4EC'],       // 爱意 - 粉色
      'confident': ['#7986CB', '#9FA8DA'],    // 自信 - 蓝紫
      
      // 消极情绪（用柔和色彩表达）
      'sad': ['#78909C', '#B0BEC5'],          // 失落 - 柔和灰蓝
      'anxious': ['#A1887F', '#D7CCC8'],      // 焦虑 - 温暖棕
      'lonely': ['#9E9E9E', '#E0E0E0'],       // 孤独 - 中性灰
      'tired': ['#8D6E63', '#BCAAA4'],        // 疲惫 - 暖灰
      'confused': ['#607D8B', '#90A4AE'],     // 困惑 - 蓝灰
      'worried': ['#795548', '#A1887F'],      // 担心 - 深棕
      'disappointed': ['#9C9C9C', '#BDBDBD'], // 失望 - 浅灰
      'frustrated': ['#FF8A65', '#FFAB91'],   // 沮丧 - 柔和橙
      'melancholy': ['#B39DDB', '#D1C4E9'],   // 忧郁 - 淡紫
      'nostalgic': ['#FFCC80', '#FFE0B2'],    // 怀念 - 暖黄
    };

    return moodColors[mood] || ['#6C63FF', '#FF6B9D']; // 默认渐变
  };

  const colors = getMoodColors();

  return (
    <View style={styles.container}>
      {/* 外层光晕 */}
      <Animated.View style={[styles.glow, glowAnimatedStyle]}>
        <LinearGradient
          colors={[...colors, 'transparent']}
          style={styles.glowGradient}
        />
      </Animated.View>

      {/* 主球体 - 使用高斯模糊效果 */}
      <Animated.View style={[styles.ball, ballAnimatedStyle, blurAnimatedStyle]}>
        <LinearGradient
          colors={colors}
          style={styles.ballGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        
        {/* 内层高光 */}
        <View style={styles.highlight}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.3)', 'transparent']}
            style={styles.highlightGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        </View>

        {/* 表情点 - 根据心情调整 */}
        <View style={styles.expressionContainer}>
          <View style={[styles.expressionDot, { opacity: isListening ? 1 : 0.6 }]} />
          <View style={[styles.expressionDot, { opacity: isListening ? 1 : 0.4 }]} />
          <View style={[styles.expressionDot, { opacity: isListening ? 1 : 0.8 }]} />
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  glow: {
    position: 'absolute',
    width: '120%',
    height: '120%',
    borderRadius: 1000,
  },
  glowGradient: {
    flex: 1,
    borderRadius: 1000,
  },
  ball: {
    width: '100%',
    height: '100%',
    borderRadius: 1000,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ballGradient: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 1000,
  },
  highlight: {
    position: 'absolute',
    top: '15%',
    left: '15%',
    width: '40%',
    height: '40%',
    borderRadius: 1000,
  },
  highlightGradient: {
    flex: 1,
    borderRadius: 1000,
  },
  expressionContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '10%',
  },
  expressionDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    marginHorizontal: 2,
  },
});

export default SoulBall;