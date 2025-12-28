import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  Linking,
} from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width, height } = Dimensions.get('window');

const ApiKeySetup = ({ onApiKeySet }) => {
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  
  const ballScale = useSharedValue(1);
  const ballOpacity = useSharedValue(0.6);

  React.useEffect(() => {
    // 球体呼吸动画
    ballScale.value = withRepeat(
      withSpring(1.1, { duration: 2000 }),
      -1,
      true
    );
    ballOpacity.value = withRepeat(
      withTiming(0.8, { duration: 2000 }),
      -1,
      true
    );
  }, []);

  const ballAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ballScale.value }],
    opacity: ballOpacity.value,
  }));

  const handleOpenDeepSeek = async () => {
    try {
      const url = 'https://platform.deepseek.com/api_keys';
      const supported = await Linking.canOpenURL(url);
      
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('提示', '无法打开浏览器，请手动访问：platform.deepseek.com/api_keys');
      }
    } catch (error) {
      Alert.alert('错误', '打开链接失败');
    }
  };

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      Alert.alert('提示', '请输入API密钥');
      return;
    }

    setLoading(true);
    try {
      await AsyncStorage.setItem('deepseek_api_key', apiKey.trim());
      onApiKeySet();
    } catch (error) {
      Alert.alert('错误', '保存API密钥失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#0A0A0F', '#1A1A2E', '#0A0A0F']}
      style={styles.container}
    >
      {/* 背景球体 */}
      <Animated.View style={[styles.backgroundBall, ballAnimatedStyle]}>
        <LinearGradient
          colors={['rgba(108, 99, 255, 0.3)', 'rgba(255, 107, 157, 0.3)']}
          style={styles.ballGradient}
        />
      </Animated.View>

      <View style={styles.content}>
        <Text style={styles.title}>给我注入灵魂吧</Text>
        <Text style={styles.subtitle}>需要DeepSeek API密钥来开启智能对话</Text>
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="请输入DeepSeek API密钥"
            placeholderTextColor="#8E8E93"
            value={apiKey}
            onChangeText={setApiKey}
            secureTextEntry
            multiline={false}
          />
        </View>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={handleOpenDeepSeek}
        >
          <Icon name="open-in-new" size={20} color="#6C63FF" />
          <Text style={styles.linkText}>获取DeepSeek API密钥</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSaveApiKey}
          disabled={loading}
        >
          <LinearGradient
            colors={['#6C63FF', '#FF6B9D']}
            style={styles.buttonGradient}
          >
            <Text style={styles.buttonText}>
              {loading ? '保存中...' : '开始陪伴'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
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
  backgroundBall: {
    position: 'absolute',
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    top: height * 0.2,
  },
  ballGradient: {
    flex: 1,
    borderRadius: width * 0.4,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 40,
    zIndex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 50,
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 15,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    marginBottom: 30,
  },
  linkText: {
    color: '#6C63FF',
    fontSize: 16,
    marginLeft: 8,
    textDecorationLine: 'underline',
  },
  button: {
    width: '100%',
    borderRadius: 25,
    overflow: 'hidden',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonGradient: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ApiKeySetup;