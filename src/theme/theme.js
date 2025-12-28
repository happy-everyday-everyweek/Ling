import { DefaultTheme } from 'react-native-paper';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#6C63FF',
    accent: '#FF6B9D',
    background: '#0A0A0F',
    surface: '#1A1A2E',
    text: '#FFFFFF',
    placeholder: '#8E8E93',
    disabled: '#3A3A3C',
    backdrop: 'rgba(0, 0, 0, 0.5)',
  },
  roundness: 20,
};