import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  withSequence,
  runOnJS,
} from 'react-native-reanimated';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import Voice from '@react-native-voice/voice';

import { AIService } from '../services/AIService';
import { StorageService } from '../services/StorageService';
import SoulBall from '../components/SoulBall';

const { width, height } = Dimensions.get('window');

const HomeScreen = () => {
  const [isListening, setIsListening] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [currentMood, setCurrentMood] = useState('neutral');
  const [isPressed, setIsPressed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(80); // 默认打字速度

  const ballScale = useSharedValue(1);
  const ballOpacity = useSharedValue(0.7);
  const responseOpacity = useSharedValue(0);
  const typingIntervalRef = useRef(null);

  useEffect(() => {
    initializeVoice();
    loadConversationHistory();
    
    // 球体呼吸动画
    ballScale.value = withRepeat(
      withSpring(1.05, { duration: 3000 }),
      -1,
      true
    );
    ballOpacity.value = withRepeat(
      withTiming(0.9, { duration: 3000 }),
      -1,
      true
    );

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const initializeVoice = async () => {
    try {
      Voice.onSpeechStart = onSpeechStart;
      Voice.onSpeechEnd = onSpeechEnd;
      Voice.onSpeechResults = onSpeechResults;
      Voice.onSpeechError = onSpeechError;
    } catch (error) {
      console.error('语音初始化失败:', error);
    }
  };

  const loadConversationHistory = async () => {
    try {
      const history = await StorageService.getConversationHistory();
      setConversationHistory(history);
    } catch (error) {
      console.error('加载对话历史失败:', error);
    }
  };

  const onSpeechStart = () => {
    setIsListening(true);
    ballScale.value = withSpring(1.2);
  };

  const onSpeechEnd = () => {
    setIsListening(false);
    ballScale.value = withSpring(1);
  };

  const onSpeechResults = async (event) => {
    const spokenText = event.value[0];
    if (spokenText) {
      await handleUserInput(spokenText);
    }
  };

  const onSpeechError = (error) => {
    console.error('语音识别错误:', error);
    setIsListening(false);
    ballScale.value = withSpring(1);
    Alert.alert('语音识别失败', '请重试');
  };

  const handleUserInput = async (userText) => {
    try {
      const newHistory = [...conversationHistory, { role: 'user', content: userText }];
      
      // 添加当前时间到系统提示
      const currentTime = new Date().toLocaleString('zh-CN');
      const response = await AIService.getChatResponse(newHistory, currentTime);
      
      const updatedHistory = [...newHistory, { role: 'assistant', content: response }];
      setConversationHistory(updatedHistory);
      await StorageService.saveConversationHistory(updatedHistory);
      
      setAiResponse(response);
      await typewriterEffect(response);
      
      // 保存心情数据
      await StorageService.saveMoodEntry({
        userInput: userText,
        aiResponse: response,
        timestamp: new Date().toISOString(),
      });
      
    } catch (error) {
      console.error('处理用户输入失败:', error);
      Alert.alert('错误', 'AI响应失败，请重试');
    }
  };

  // 分析文本中的情感并动态设置心情
  const analyzeMoodFromText = (text) => {
    const moodKeywords = {
      'happy': ['开心', '高兴', '快乐', '哈哈', '😊', '😄'],
      'excited': ['激动', '兴奋', '太棒了', 'amazing', '🎉'],
      'joyful': ['欢乐', '愉快', '美好', 'wonderful'],
      'proud': ['自豪', '骄傲', '成功', '厉害'],
      'sad': ['难过', '伤心', '失落', '😢', '😭'],
      'anxious': ['焦虑', '紧张', '担心', '不安'],
      'tired': ['累', '疲惫', '困', '睡觉'],
      'confused': ['困惑', '不懂', '迷茫', '？'],
      'loving': ['爱', '喜欢', '❤️', '💕'],
      'peaceful': ['平静', '安静', '宁静', '放松'],
    };

    for (const [mood, keywords] of Object.entries(moodKeywords)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        return mood;
      }
    }
    return 'neutral';
  };

  const typewriterEffect = async (text) => {
    setIsTyping(true);
    setDisplayText('');
    responseOpacity.value = withTiming(1, { duration: 300 });
    
    let currentIndex = 0;
    let currentSpeed = typingSpeed;
    
    const typeNextChar = () => {
      if (currentIndex <= text.length) {
        const currentChar = text[currentIndex];
        const currentText = text.substring(0, currentIndex + 1);
        
        // 分析当前文本的情感并更新心情
        const detectedMood = analyzeMoodFromText(currentText);
        if (detectedMood !== 'neutral') {
          setCurrentMood(detectedMood);
        }
        
        setDisplayText(currentText);
        
        // 根据标点符号调整速度
        let nextDelay = currentSpeed;
        if (currentChar === '。' || currentChar === '！' || currentChar === '？') {
          nextDelay = 300; // 句号停顿
        } else if (currentChar === '，' || currentChar === '、') {
          nextDelay = 150; // 逗号停顿
        }
        
        currentIndex++;
        
        if (currentIndex <= text.length) {
          typingIntervalRef.current = setTimeout(typeNextChar, nextDelay);
        } else {
          setIsTyping(false);
          // 3秒后淡出
          setTimeout(() => {
            responseOpacity.value = withTiming(0, { duration: 1000 });
          }, 3000);
        }
      }
    };
    
    typeNextChar();
  };

  // 点击文字加速
  const handleTextPress = () => {
    if (isTyping) {
      setTypingSpeed(20); // 加速到20ms
      setTimeout(() => setTypingSpeed(80), 800); // 0.8秒后恢复正常速度
    }
  };

  const startListening = async () => {
    try {
      setIsPressed(true);
      await Voice.start('zh-CN');
    } catch (error) {
      console.error('开始语音识别失败:', error);
      Alert.alert('错误', '无法启动语音识别');
      setIsPressed(false);
    }
  };

  const stopListening = async () => {
    try {
      setIsPressed(false);
      await Voice.stop();
    } catch (error) {
      console.error('停止语音识别失败:', error);
      setIsPressed(false);
    }
  };

  const handlePanGesture = (event) => {
    if (event.nativeEvent.state === State.BEGAN) {
      setIsDragging(true);
    } else if (event.nativeEvent.state === State.END || event.nativeEvent.state === State.CANCELLED) {
      setIsDragging(false);
    }
  };

  // 获取动态背景颜色
  const getBackgroundGradient = () => {
    const moodGradients = {
      'happy': ['#0A0A0F', '#1A1A2E', '#16213E'],
      'excited': ['#0A0A0F', '#2D1B69', '#1A1A2E'],
      'joyful': ['#0A0A0F', '#1A1A2E', '#2D1B69'],
      'proud': ['#0A0A0F', '#1A1A2E', '#16213E'],
      'sad': ['#0A0A0F', '#1A1A2E', '#0F3460'],
      'anxious': ['#0A0A0F', '#1A1A2E', '#16213E'],
      'peaceful': ['#0A0A0F', '#0F3460', '#16213E'],
      'loving': ['#0A0A0F', '#1A1A2E', '#2D1B69'],
      'tired': ['#0A0A0F', '#1A1A2E', '#16213E'],
      'confused': ['#0A0A0F', '#1A1A2E', '#16213E'],
      'default': ['#0A0A0F', '#1A1A2E', '#16213E'],
    };
    
    return moodGradients[currentMood] || moodGradients.default;
  };

  const ballAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ballScale.value }],
    opacity: ballOpacity.value,
  }));

  const responseAnimatedStyle = useAnimatedStyle(() => ({
    opacity: responseOpacity.value,
  }));

  // 清理定时器
  useEffect(() => {
    return () => {
      if (typingIntervalRef.current) {
        clearTimeout(typingIntervalRef.current);
      }
    };
  }, []);

  return (
    <LinearGradient
      colors={getBackgroundGradient()}
      style={styles.container}
    >
      {/* 主要的灵魂球 */}
      <View style={styles.ballContainer}>
        <PanGestureHandler onHandlerStateChange={handlePanGesture}>
          <TouchableOpacity
            style={styles.ballTouchArea}
            onPressIn={startListening}
            onPressOut={stopListening}
            activeOpacity={0.8}
          >
            <Animated.View style={[styles.ball, ballAnimatedStyle]}>
              <SoulBall 
                isListening={isListening} 
                mood={currentMood}
                isPressed={isPressed}
                isDragging={isDragging}
              />
            </Animated.View>
          </TouchableOpacity>
        </PanGestureHandler>
        
        {/* AI回复显示区域 */}
        <Animated.View style={[styles.responseContainer, responseAnimatedStyle]}>
          <TouchableOpacity onPress={handleTextPress} activeOpacity={0.8}>
            <Text style={styles.responseText} numberOfLines={3}>
              {displayText}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* 状态指示 */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          {isListening ? '正在聆听...' : '按住球体与我对话'}
        </Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ballContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  ballTouchArea: {
    width: width * 0.6,
    height: width * 0.6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ball: {
    width: width * 0.5,
    height: width * 0.5,
    borderRadius: width * 0.25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  responseContainer: {
    position: 'absolute',
    bottom: -100,
    width: width * 0.85,
    paddingHorizontal: 25,
    paddingVertical: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    backdropFilter: 'blur(10px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  responseText: {
    color: '#FFFFFF',
    fontSize: 20,
    textAlign: 'center',
    lineHeight: 28,
    fontWeight: '500',
  },
  statusContainer: {
    position: 'absolute',
    bottom: 120,
    alignItems: 'center',
  },
  statusText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default HomeScreen;