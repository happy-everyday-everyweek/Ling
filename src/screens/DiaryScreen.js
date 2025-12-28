import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  Dimensions,
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
import { AIService } from '../services/AIService';

const { width, height } = Dimensions.get('window');

const DiaryScreen = () => {
  const [diaryEntries, setDiaryEntries] = useState([]);
  const [aiDiaries, setAiDiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewDiary, setShowNewDiary] = useState(false);
  const [newDiaryTitle, setNewDiaryTitle] = useState('');
  const [newDiaryContent, setNewDiaryContent] = useState('');
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [categories, setCategories] = useState(['全部', 'AI的日记']);

  const modalOpacity = useSharedValue(0);
  const modalScale = useSharedValue(0.8);

  useEffect(() => {
    loadDiaryEntries();
    generateAIDiaryIfNeeded();
  }, []);

  const loadDiaryEntries = async () => {
    try {
      const entries = await StorageService.getDiaryEntries();
      const aiEntries = await StorageService.getAIDiaries();
      
      setDiaryEntries(entries);
      setAiDiaries(aiEntries);
      
      // 更新分类列表
      const userCategories = [...new Set(entries.map(entry => entry.category).filter(Boolean))];
      setCategories(['全部', 'AI的日记', ...userCategories]);
    } catch (error) {
      console.error('加载日记失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateAIDiaryIfNeeded = async () => {
    try {
      const today = new Date().toDateString();
      const lastAIDiary = await StorageService.getLastAIDiary();
      const conversationHistory = await StorageService.getConversationHistory();
      
      // 检查是否需要生成AI日记
      if ((!lastAIDiary || new Date(lastAIDiary.timestamp).toDateString() !== today) 
          && conversationHistory.length > 0) {
        
        const aiDiaryContent = await AIService.generateAIDiary(conversationHistory);
        const aiDiary = await StorageService.saveAIDiary({
          title: `${new Date().toLocaleDateString('zh-CN')} 的思考`,
          content: aiDiaryContent,
          timestamp: new Date().toISOString(),
        });
        
        if (aiDiary) {
          setAiDiaries(prev => [aiDiary, ...prev]);
        }
      }
    } catch (error) {
      console.error('生成AI日记失败:', error);
    }
  };

  const handleNewDiary = () => {
    setShowNewDiary(true);
    modalOpacity.value = withTiming(1, { duration: 300 });
    modalScale.value = withSpring(1);
  };

  const handleCloseDiary = () => {
    modalOpacity.value = withTiming(0, { duration: 300 });
    modalScale.value = withSpring(0.8);
    setTimeout(() => {
      setShowNewDiary(false);
      setNewDiaryTitle('');
      setNewDiaryContent('');
    }, 300);
  };

  const handleSaveDiary = async () => {
    if (!newDiaryTitle.trim() || !newDiaryContent.trim()) {
      Alert.alert('提示', '请填写标题和内容');
      return;
    }

    try {
      // 自动分类和命名
      const category = await AIService.categorizeDiary(newDiaryContent);
      const autoTitle = newDiaryTitle.trim() || await AIService.generateDiaryTitle(newDiaryContent);
      
      const newEntry = await StorageService.saveDiaryEntry({
        title: autoTitle,
        content: newDiaryContent.trim(),
        category: category,
        mood: await analyzeMood(newDiaryContent),
        summary: newDiaryContent.length > 20 ? await AIService.summarizeDiary(newDiaryContent) : null,
      });

      if (newEntry) {
        setDiaryEntries(prev => [newEntry, ...prev]);
        
        // 更新分类
        if (category && !categories.includes(category)) {
          setCategories(prev => [...prev, category]);
        }
        
        handleCloseDiary();
        
        // 保存心情数据
        await StorageService.saveMoodEntry({
          source: 'diary',
          content: newDiaryContent,
          mood: newEntry.mood,
        });
      }
    } catch (error) {
      console.error('保存日记失败:', error);
      Alert.alert('错误', '保存失败，请重试');
    }
  };

  const analyzeMood = async (content) => {
    try {
      const moodAnalysis = await AIService.analyzeMood(content);
      return moodAnalysis;
    } catch (error) {
      console.error('情感分析失败:', error);
      return { mood: 'neutral', intensity: 5, keywords: [] };
    }
  };

  const handleViewEntry = (entry) => {
    setSelectedEntry(entry);
    setShowDetail(true);
    modalOpacity.value = withTiming(1, { duration: 300 });
    modalScale.value = withSpring(1);
  };

  const handleCloseDetail = () => {
    modalOpacity.value = withTiming(0, { duration: 300 });
    modalScale.value = withSpring(0.8);
    setTimeout(() => {
      setShowDetail(false);
      setSelectedEntry(null);
    }, 300);
  };

  const handleDeleteEntry = async (entryId) => {
    Alert.alert(
      '确认删除',
      '确定要删除这篇日记吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            const success = await StorageService.deleteDiaryEntry(entryId);
            if (success) {
              setDiaryEntries(prev => prev.filter(entry => entry.id !== entryId));
              if (selectedEntry?.id === entryId) {
                handleCloseDetail();
              }
            }
          },
        },
      ]
    );
  };

  // 过滤日记
  const getFilteredDiaries = () => {
    let allDiaries = [];
    
    if (selectedCategory === '全部') {
      allDiaries = [...diaryEntries, ...aiDiaries.map(diary => ({...diary, isAIDiary: true}))];
    } else if (selectedCategory === 'AI的日记') {
      allDiaries = aiDiaries.map(diary => ({...diary, isAIDiary: true}));
    } else {
      allDiaries = diaryEntries.filter(entry => entry.category === selectedCategory);
    }
    
    // 搜索过滤
    if (searchText.trim()) {
      allDiaries = allDiaries.filter(diary => 
        diary.title.includes(searchText) || diary.content.includes(searchText)
      );
    }
    
    return allDiaries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  };

  const getMoodColor = (mood) => {
    switch (mood?.mood) {
      case 'happy':
        return '#FFD700';
      case 'sad':
        return '#4A90E2';
      case 'excited':
        return '#FF4757';
      case 'calm':
        return '#2ECC71';
      case 'anxious':
        return '#FF6B9D';
      default:
        return '#8E8E93';
    }
  };

  const modalAnimatedStyle = useAnimatedStyle(() => ({
    opacity: modalOpacity.value,
    transform: [{ scale: modalScale.value }],
  }));

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  };

  const renderDiaryEntry = ({ item, index }) => (
    <Animated.View 
      style={[
        styles.diaryCard,
        { 
          transform: [{ translateX: (index % 2) * 5 - 2.5 }], // 轻微错位
          backgroundColor: item.isAIDiary ? 'rgba(108, 99, 255, 0.1)' : getMoodBackgroundColor(item.mood),
        }
      ]}
    >
      <TouchableOpacity onPress={() => handleViewEntry(item)}>
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
          style={styles.cardGradient}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.diaryTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <View style={styles.cardMeta}>
              {item.isAIDiary && (
                <View style={styles.aiTag}>
                  <Text style={styles.aiTagText}>AI</Text>
                </View>
              )}
              <View
                style={[
                  styles.moodIndicator,
                  { backgroundColor: getMoodColor(item.mood) }
                ]}
              />
            </View>
          </View>
          <Text style={styles.diaryPreview} numberOfLines={2}>
            {item.summary || item.content}
          </Text>
          <View style={styles.cardFooter}>
            <Text style={styles.diaryDate}>{formatDate(item.timestamp)}</Text>
            {item.category && (
              <View style={styles.categoryTag}>
                <Text style={styles.categoryText}>{item.category}</Text>
              </View>
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  const getMoodBackgroundColor = (mood) => {
    const moodBgColors = {
      'happy': 'rgba(255, 224, 102, 0.1)',
      'sad': 'rgba(120, 144, 156, 0.1)',
      'excited': 'rgba(255, 107, 157, 0.1)',
      'calm': 'rgba(46, 204, 113, 0.1)',
      'anxious': 'rgba(161, 136, 127, 0.1)',
      'proud': 'rgba(156, 39, 176, 0.1)',
      'peaceful': 'rgba(129, 199, 132, 0.1)',
      'loving': 'rgba(244, 143, 177, 0.1)',
    };
    return moodBgColors[mood?.mood] || 'rgba(255, 255, 255, 0.05)';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>加载中...</Text>
      </View>
    );
  }

  const filteredDiaries = getFilteredDiaries();

  return (
    <View style={styles.container}>
      {/* 头部搜索和操作 */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color="#8E8E93" />
          <TextInput
            style={styles.searchInput}
            placeholder="搜索日记..."
            placeholderTextColor="#8E8E93"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
        <TouchableOpacity style={styles.newDiaryButton} onPress={handleNewDiary}>
          <Icon name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* 分类标签 */}
      <View style={styles.categoriesContainer}>
        <FlatList
          horizontal
          data={categories}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryButton,
                selectedCategory === item && styles.categoryButtonActive
              ]}
              onPress={() => setSelectedCategory(item)}
            >
              <Text style={[
                styles.categoryButtonText,
                selectedCategory === item && styles.categoryButtonTextActive
              ]}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* 日记列表 */}
      {filteredDiaries.length > 0 ? (
        <FlatList
          data={filteredDiaries}
          renderItem={renderDiaryEntry}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.diaryList}
          numColumns={1}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Icon name="book" size={80} color="#8E8E93" />
          <Text style={styles.emptyText}>
            {searchText ? '没有找到相关日记' : '还没有日记'}
          </Text>
          <Text style={styles.emptySubtext}>
            {searchText ? '试试其他关键词' : '记录你的美好时光'}
          </Text>
        </View>
      )}

      {/* 新建日记模态框 */}
      <Modal
        visible={showNewDiary}
        transparent
        animationType="none"
        onRequestClose={handleCloseDiary}
      >
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.modalContent, modalAnimatedStyle]}>
            <LinearGradient
              colors={['#1A1A2E', '#0A0A0F']}
              style={styles.modalGradient}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>新日记</Text>
                <TouchableOpacity onPress={handleCloseDiary}>
                  <Icon name="close" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.titleInput}
                placeholder="日记标题..."
                placeholderTextColor="#8E8E93"
                value={newDiaryTitle}
                onChangeText={setNewDiaryTitle}
                maxLength={50}
              />

              <TextInput
                style={styles.contentInput}
                placeholder="今天发生了什么..."
                placeholderTextColor="#8E8E93"
                value={newDiaryContent}
                onChangeText={setNewDiaryContent}
                multiline
                textAlignVertical="top"
                maxLength={1000}
              />

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelButton} onPress={handleCloseDiary}>
                  <Text style={styles.cancelButtonText}>取消</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={handleSaveDiary}>
                  <LinearGradient
                    colors={['#6C63FF', '#FF6B9D']}
                    style={styles.saveButtonGradient}
                  >
                    <Text style={styles.saveButtonText}>保存</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </Animated.View>
        </View>
      </Modal>

      {/* 日记详情模态框 */}
      <Modal
        visible={showDetail}
        transparent
        animationType="none"
        onRequestClose={handleCloseDetail}
      >
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.modalContent, modalAnimatedStyle]}>
            <LinearGradient
              colors={['#1A1A2E', '#0A0A0F']}
              style={styles.modalGradient}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle} numberOfLines={1}>
                  {selectedEntry?.title}
                </Text>
                <View style={styles.headerActions}>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteEntry(selectedEntry?.id)}
                  >
                    <Icon name="delete" size={20} color="#FF6B9D" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleCloseDetail}>
                    <Icon name="close" size={24} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={styles.detailDate}>
                {selectedEntry && formatDate(selectedEntry.timestamp)}
              </Text>

              <Text style={styles.detailContent}>
                {selectedEntry?.content}
              </Text>

              {selectedEntry?.mood && (
                <View style={styles.moodSection}>
                  <Text style={styles.moodTitle}>情感分析</Text>
                  <View style={styles.moodInfo}>
                    <View
                      style={[
                        styles.moodDot,
                        { backgroundColor: getMoodColor(selectedEntry.mood) }
                      ]}
                    />
                    <Text style={styles.moodText}>
                      {selectedEntry.mood.mood} (强度: {selectedEntry.mood.intensity}/10)
                    </Text>
                  </View>
                </View>
              )}
            </LinearGradient>
          </Animated.View>
        </View>
      </Modal>

      {/* 底部提示 */}
      <View style={styles.hintContainer}>
        <Text style={styles.hintText}>左滑返回首页 • 右滑查看心情</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    color: '#333333',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 15,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#333333',
  },
  newDiaryButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoriesContainer: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  categoryButtonActive: {
    backgroundColor: '#6C63FF',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#666666',
  },
  categoryButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  diaryList: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    paddingBottom: 100,
  },
  diaryCard: {
    marginVertical: 8,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardGradient: {
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  diaryTitle: {
    color: '#333333',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiTag: {
    backgroundColor: '#6C63FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 8,
  },
  aiTagText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  moodIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  diaryPreview: {
    color: '#666666',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  diaryDate: {
    color: '#999999',
    fontSize: 12,
  },
  categoryTag: {
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  categoryText: {
    color: '#6C63FF',
    fontSize: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#333333',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
  },
  emptySubtext: {
    color: '#999999',
    fontSize: 16,
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.9,
    maxHeight: height * 0.8,
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalGradient: {
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    color: '#333333',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteButton: {
    marginRight: 15,
    padding: 5,
  },
  titleInput: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    color: '#333333',
    fontSize: 16,
    marginBottom: 15,
  },
  contentInput: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    color: '#333333',
    fontSize: 16,
    minHeight: 200,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 10,
  },
  cancelButtonText: {
    color: '#999999',
    fontSize: 16,
  },
  saveButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  detailDate: {
    color: '#999999',
    fontSize: 14,
    marginBottom: 15,
  },
  detailContent: {
    color: '#333333',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  moodSection: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    paddingTop: 15,
  },
  moodTitle: {
    color: '#333333',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  moodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moodDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  moodText: {
    color: '#666666',
    fontSize: 14,
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

export default DiaryScreen;