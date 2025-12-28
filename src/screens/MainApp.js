import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  PanResponder,
} from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';

import HomeScreen from './HomeScreen';
import PostsScreen from './PostsScreen';
import DiaryScreen from './DiaryScreen';
import MoodScreen from './MoodScreen';

const { width, height } = Dimensions.get('window');

const MainApp = () => {
  const [currentScreen, setCurrentScreen] = useState(0); // 0: 首页, 1: 帖子, -1: 日记, -2: 心情
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const changeScreen = (newScreen) => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    
    // 平滑过渡动画
    scale.value = withTiming(0.95, { duration: 200 });
    opacity.value = withTiming(0.8, { duration: 200 });
    
    setTimeout(() => {
      setCurrentScreen(newScreen);
      scale.value = withSpring(1, { damping: 15, stiffness: 150 });
      opacity.value = withTiming(1, { duration: 300 });
      setIsTransitioning(false);
    }, 200);
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return !isTransitioning && (Math.abs(gestureState.dx) > 20 || Math.abs(gestureState.dy) > 20);
      },
      onPanResponderMove: (evt, gestureState) => {
        if (isTransitioning) return;
        
        const { dx, dy } = gestureState;
        
        // 限制滑动范围，增加阻力效果
        const maxTranslate = 100;
        const resistance = 0.6;
        
        translateX.value = Math.max(-maxTranslate, Math.min(maxTranslate, dx * resistance));
        translateY.value = Math.max(-maxTranslate, Math.min(maxTranslate, dy * resistance));
        
        // 根据滑动距离调整缩放和透明度
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = 150;
        const scaleValue = interpolate(
          distance,
          [0, maxDistance],
          [1, 0.95],
          Extrapolate.CLAMP
        );
        const opacityValue = interpolate(
          distance,
          [0, maxDistance],
          [1, 0.8],
          Extrapolate.CLAMP
        );
        
        scale.value = scaleValue;
        opacity.value = opacityValue;
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (isTransitioning) return;
        
        const { dx, dy, vx, vy } = gestureState;
        const threshold = 60;
        const velocityThreshold = 0.5;
        
        let shouldChangeScreen = false;
        let newScreen = currentScreen;
        
        if (Math.abs(dx) > Math.abs(dy)) {
          // 水平滑动
          if ((dx > threshold || vx > velocityThreshold) && currentScreen >= -1) {
            // 右滑 - 日记或心情
            if (currentScreen === 0) {
              newScreen = -1;
              shouldChangeScreen = true;
            } else if (currentScreen === -1) {
              newScreen = -2;
              shouldChangeScreen = true;
            }
          } else if ((dx < -threshold || vx < -velocityThreshold) && currentScreen <= 0) {
            // 左滑 - 返回
            if (currentScreen === -2) {
              newScreen = -1;
              shouldChangeScreen = true;
            } else if (currentScreen === -1) {
              newScreen = 0;
              shouldChangeScreen = true;
            }
          }
        } else {
          // 垂直滑动
          if ((dy < -threshold || vy < -velocityThreshold) && currentScreen === 0) {
            // 上滑 - 帖子
            newScreen = 1;
            shouldChangeScreen = true;
          } else if ((dy > threshold || vy > velocityThreshold) && currentScreen === 1) {
            // 下滑 - 首页
            newScreen = 0;
            shouldChangeScreen = true;
          }
        }
        
        if (shouldChangeScreen) {
          runOnJS(changeScreen)(newScreen);
        } else {
          // 回弹动画
          translateX.value = withSpring(0, { damping: 15, stiffness: 150 });
          translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
          scale.value = withSpring(1, { damping: 15, stiffness: 150 });
          opacity.value = withTiming(1, { duration: 300 });
        }
      },
    })
  ).current;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  const renderScreen = () => {
    switch (currentScreen) {
      case 1:
        return <PostsScreen />;
      case -1:
        return <DiaryScreen />;
      case -2:
        return <MoodScreen />;
      default:
        return <HomeScreen />;
    }
  };

  // 根据当前屏幕获取背景渐变
  const getBackgroundGradient = () => {
    switch (currentScreen) {
      case 1: // 帖子页面 - 纯白背景
        return ['#FFFFFF', '#FFFFFF', '#FFFFFF'];
      case -1: // 日记页面 - 纯白背景
        return ['#FFFFFF', '#FFFFFF', '#FFFFFF'];
      case -2: // 心情页面 - 纯白背景
        return ['#FFFFFF', '#FFFFFF', '#FFFFFF'];
      default: // 首页 - 动态背景
        return ['#0A0A0F', '#1A1A2E', '#16213E'];
    }
  };

  return (
    <LinearGradient
      colors={getBackgroundGradient()}
      style={styles.container}
    >
      <Animated.View
        style={[styles.screenContainer, animatedStyle]}
        {...panResponder.panHandlers}
      >
        {renderScreen()}
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  screenContainer: {
    flex: 1,
  },
});

export default MainApp;