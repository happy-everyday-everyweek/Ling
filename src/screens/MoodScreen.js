import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { StorageService } from '../services/StorageService';

const { width, height } = Dimensions.get('window');

const MoodScreen = () => {
  const [moodEntries, setMoodEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('week'); // week, month, all
  const [moodStats, setMoodStats] = useState({});

  const chartOpacity = useSharedValue(0);

  useEffect(() => {
    loadMoodData();
  }, []);

  useEffect(() => {
    calculateMoodStats();
    chartOpacity.value = withTiming(1, { duration: 800 });
  }, [moodEntries, selectedPeriod]);

  const loadMoodData = async () => {
    try {
      const entries = await StorageService.getMoodEntries();
      setMoodEntries(entries);
    } catch (error) {
      console.error('加载心情数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateMoodStats = () => {
    if (moodEntries.length === 0) return;

    const now = new Date();
    let filteredEntries = moodEntries;

    // 根据选择的时间段过滤数据
    if (selectedPeriod === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filteredEntries = moodEntries.filter(entry => 
        new Date(entry.timestamp) >= weekAgo
      );
    } else if (selectedPeriod === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filteredEntries = moodEntries.filter(entry => 
        new Date(entry.timestamp) >= monthAgo
      );
    }

    // 统计心情分布
    const moodCounts = {};
    const moodIntensities = {};
    let totalIntensity = 0;
    let totalCount = 0;

    filteredEntries.forEach(entry => {
      if (entry.mood && entry.mood.mood) {
        const mood = entry.mood.mood;
        const intensity = entry.mood.intensity || 5;
        
        moodCounts[mood] = (moodCounts[mood] || 0) + 1;
        moodIntensities[mood] = (moodIntensities[mood] || []).concat(intensity);
        totalIntensity += intensity;
        totalCount++;
      }
    });

    // 计算平均强度
    const avgIntensity = totalCount > 0 ? totalIntensity / totalCount : 5;

    // 找出主要心情
    const dominantMood = Object.keys(moodCounts).reduce((a, b) => 
      moodCounts[a] > moodCounts[b] ? a : b, 'neutral'
    );

    setMoodStats({
      moodCounts,
      moodIntensities,
      avgIntensity,
      dominantMood,
      totalEntries: filteredEntries.length,
    });
  };

  const getMoodInfo = (mood) => {
    const moodMap = {
      happy: { name: '开心', color: '#FFD700', icon: 'sentiment-very-satisfied' },
      sad: { name: '难过', color: '#4A90E2', icon: 'sentiment-very-dissatisfied' },
      excited: { name: '兴奋', color: '#FF4757', icon: 'sentiment-satisfied' },
      calm: { name: '平静', color: '#2ECC71', icon: 'sentiment-neutral' },
      anxious: { name: '焦虑', color: '#FF6B9D', icon: 'sentiment-dissatisfied' },
      angry: { name: '愤怒', color: '#E74C3C', icon: 'sentiment-very-dissatisfied' },
      neutral: { name: '平常', color: '#8E8E93', icon: 'sentiment-neutral' },
    };
    return moodMap[mood] || moodMap.neutral;
  };

  const getPeriodText = () => {
    switch (selectedPeriod) {
      case 'week': return '最近一周';
      case 'month': return '最近一月';
      case 'all': return '全部时间';
      default: return '最近一周';
    }
  };

  const renderMoodChart = () => {
    if (!moodStats.moodCounts || Object.keys(moodStats.moodCounts).length === 0) {
      return (
        <View style={styles.emptyChart}>
          <Icon name="mood" size={60} color="#8E8E93" />
          <Text style={styles.emptyText}>暂无心情数据</Text>
        </View>
      );
    }

    const maxCount = Math.max(...Object.values(moodStats.moodCounts));
    
    return (
      <View style={styles.chartContainer}>
        {Object.entries(moodStats.moodCounts).map(([mood, count]) => {
          const moodInfo = getMoodInfo(mood);
          const percentage = (count / maxCount) * 100;
          
          return (
            <View key={mood} style={styles.chartItem}>
              <View style={styles.chartBar}>
                <View style={styles.chartBarBackground}>
                  <Animated.View
                    style={[
                      styles.chartBarFill,
                      {
                        backgroundColor: moodInfo.color,
                        width: `${percentage}%`,
                      }
                    ]}
                  />
                </View>
                <Text style={styles.chartCount}>{count}</Text>
              </View>
              <View style={styles.chartLabel}>
                <Icon name={moodInfo.icon} size={20} color={moodInfo.color} />
                <Text style={styles.chartLabelText}>{moodInfo.name}</Text>
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  const renderMoodInsights = () => {
    if (!moodStats.dominantMood || moodStats.totalEntries === 0) {
      return null;
    }

    const dominantMoodInfo = getMoodInfo(moodStats.dominantMood);
    
    return (
      <View style={styles.insightsContainer}>
        <Text style={styles.insightsTitle}>心情洞察</Text>
        
        <View style={styles.insightCard}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
            style={styles.insightGradient}
          >
            <View style={styles.insightHeader}>
              <Icon name={dominantMoodInfo.icon} size={24} color={dominantMoodInfo.color} />
              <Text style={styles.insightMainText}>
                {getPeriodText()}你主要的心情是{dominantMoodInfo.name}
              </Text>
            </View>
            
            <Text style={styles.insightDetail}>
              平均情感强度: {moodStats.avgIntensity?.toFixed(1)}/10
            </Text>
            
            <Text style={styles.insightDetail}>
              记录了 {moodStats.totalEntries} 次心情变化
            </Text>
          </LinearGradient>
        </View>
      </View>
    );
  };

  const renderRecentMoods = () => {
    const recentEntries = moodEntries.slice(0, 5);
    
    if (recentEntries.length === 0) {
      return null;
    }

    return (
      <View style={styles.recentContainer}>
        <Text style={styles.recentTitle}>最近心情</Text>
        
        {recentEntries.map((entry, index) => {
          const moodInfo = getMoodInfo(entry.mood?.mood);
          const date = new Date(entry.timestamp);
          
          return (
            <View key={entry.id || index} style={styles.recentItem}>
              <View style={styles.recentMood}>
                <Icon name={moodInfo.icon} size={20} color={moodInfo.color} />
                <Text style={styles.recentMoodText}>{moodInfo.name}</Text>
              </View>
              
              <View style={styles.recentInfo}>
                <Text style={styles.recentSource}>
                  来自{entry.source === 'diary' ? '日记' : '聊天'}
                </Text>
                <Text style={styles.recentTime}>
                  {date.toLocaleDateString('zh-CN')}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  const chartAnimatedStyle = useAnimatedStyle(() => ({
    opacity: chartOpacity.value,
  }));

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>分析心情中...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 头部 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>心情统计</Text>
      </View>

      {/* 时间段选择 */}
      <View style={styles.periodSelector}>
        {['week', 'month', 'all'].map(period => (
          <TouchableOpacity
            key={period}
            style={[
              styles.periodButton,
              selectedPeriod === period && styles.periodButtonActive
            ]}
            onPress={() => setSelectedPeriod(period)}
          >
            <Text style={[
              styles.periodButtonText,
              selectedPeriod === period && styles.periodButtonTextActive
            ]}>
              {period === 'week' ? '一周' : period === 'month' ? '一月' : '全部'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 心情图表 */}
        <Animated.View style={[styles.section, chartAnimatedStyle]}>
          <Text style={styles.sectionTitle}>心情分布</Text>
          {renderMoodChart()}
        </Animated.View>

        {/* 心情洞察 */}
        {renderMoodInsights()}

        {/* 最近心情 */}
        {renderRecentMoods()}
      </ScrollView>

      {/* 底部提示 */}
      <View style={styles.hintContainer}>
        <Text style={styles.hintText}>左滑返回日记</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  periodSelector: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  periodButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  periodButtonActive: {
    backgroundColor: 'rgba(108, 99, 255, 0.3)',
  },
  periodButtonText: {
    color: '#8E8E93',
    fontSize: 14,
  },
  periodButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  section: {
    marginVertical: 10,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  chartContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
    padding: 20,
  },
  chartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  chartBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  chartBarBackground: {
    flex: 1,
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    overflow: 'hidden',
  },
  chartBarFill: {
    height: '100%',
    borderRadius: 10,
  },
  chartCount: {
    color: '#FFFFFF',
    fontSize: 12,
    marginLeft: 8,
    minWidth: 20,
    textAlign: 'center',
  },
  chartLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 80,
  },
  chartLabelText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginLeft: 5,
  },
  emptyChart: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#8E8E93',
    fontSize: 16,
    marginTop: 10,
  },
  insightsContainer: {
    marginVertical: 20,
  },
  insightsTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  insightCard: {
    borderRadius: 15,
    overflow: 'hidden',
  },
  insightGradient: {
    padding: 20,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  insightMainText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
    flex: 1,
  },
  insightDetail: {
    color: '#CCCCCC',
    fontSize: 14,
    marginVertical: 2,
  },
  recentContainer: {
    marginVertical: 20,
  },
  recentTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  recentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    marginVertical: 4,
  },
  recentMood: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  recentMoodText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginLeft: 8,
  },
  recentInfo: {
    alignItems: 'flex-end',
  },
  recentSource: {
    color: '#8E8E93',
    fontSize: 12,
  },
  recentTime: {
    color: '#8E8E93',
    fontSize: 10,
    marginTop: 2,
  },
  hintContainer: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
  },
  hintText: {
    color: '#6C63FF',
    fontSize: 14,
  },
});

export default MoodScreen;