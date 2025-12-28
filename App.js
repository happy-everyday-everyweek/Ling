import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

import ApiKeySetup from './src/screens/ApiKeySetup';
import MainApp from './src/screens/MainApp';
import { theme } from './src/theme/theme';

const Stack = createStackNavigator();

export default function App() {
  const [hasApiKey, setHasApiKey] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkApiKey();
  }, []);

  const checkApiKey = async () => {
    try {
      const apiKey = await AsyncStorage.getItem('deepseek_api_key');
      setHasApiKey(!!apiKey);
    } catch (error) {
      console.error('检查API密钥失败:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return null;
  }

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!hasApiKey ? (
            <Stack.Screen name="ApiKeySetup">
              {props => <ApiKeySetup {...props} onApiKeySet={() => setHasApiKey(true)} />}
            </Stack.Screen>
          ) : (
            <Stack.Screen name="MainApp" component={MainApp} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}