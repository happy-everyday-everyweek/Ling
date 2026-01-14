import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';

class StorageServiceClass {
  // 存储键名常量
  static KEYS = {
    CONVERSATION_HISTORY: 'conversation_history',
    POSTS: 'posts',
    DIARY_ENTRIES: 'diary_entries',
    AI_DIARIES: 'ai_diaries',
    MOOD_ENTRIES: 'mood_entries',
    USER_PROFILE: 'user_profile',
    AI_PERSONALITY: 'ai_personality',
    NOTIFICATIONS: 'notifications',
    FAVORITES: 'favorites',
    VIEWED_POSTS: 'viewed_posts',
  };

  // 对话历史管理
  async getConversationHistory() {
    try {
      const history = await AsyncStorage.getItem(StorageServiceClass.KEYS.CONVERSATION_HISTORY);
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('获取对话历史失败:', error);
      return [];
    }
  }

  async saveConversationHistory(history) {
    try {
      // 确保每条消息都有时间戳
      const historyWithTimestamp = history.map(msg => ({
        ...msg,
        timestamp: msg.timestamp || new Date().toISOString()
      }));
      
      await AsyncStorage.setItem(
        StorageServiceClass.KEYS.CONVERSATION_HISTORY,
        JSON.stringify(historyWithTimestamp)
      );
    } catch (error) {
      console.error('保存对话历史失败:', error);
    }
  }

  async clearConversationHistory() {
    try {
      await AsyncStorage.removeItem(StorageServiceClass.KEYS.CONVERSATION_HISTORY);
    } catch (error) {
      console.error('清除对话历史失败:', error);
    }
  }

  // 帖子管理
  async getPosts() {
    try {
      const posts = await AsyncStorage.getItem(StorageServiceClass.KEYS.POSTS);
      return posts ? JSON.parse(posts) : [];
    } catch (error) {
      console.error('获取帖子失败:', error);
      return [];
    }
  }

  async savePosts(posts) {
    try {
      await AsyncStorage.setItem(
        StorageServiceClass.KEYS.POSTS,
        JSON.stringify(posts)
      );
    } catch (error) {
      console.error('保存帖子失败:', error);
    }
  }

  async addPost(postData) {
    try {
      const posts = await this.getPosts();
      const newPost = {
        id: uuidv4(),
        ...postData,
        timestamp: new Date().toISOString(),
        likes: 0,
        comments: [],
        isUserPost: postData.isUserPost || false,
      };
      
      posts.unshift(newPost);
      await this.savePosts(posts);
      return newPost;
    } catch (error) {
      console.error('添加帖子失败:', error);
      return null;
    }
  }

  async updatePost(postId, updates) {
    try {
      const posts = await this.getPosts();
      const postIndex = posts.findIndex(post => post.id === postId);
      
      if (postIndex !== -1) {
        posts[postIndex] = { ...posts[postIndex], ...updates };
        await this.savePosts(posts);
        return posts[postIndex];
      }
      return null;
    } catch (error) {
      console.error('更新帖子失败:', error);
      return null;
    }
  }

  async likePost(postId) {
    try {
      const posts = await this.getPosts();
      const postIndex = posts.findIndex(post => post.id === postId);
      
      if (postIndex !== -1) {
        posts[postIndex].likes += 1;
        posts[postIndex].isLiked = true;
        await this.savePosts(posts);
        return posts[postIndex];
      }
      return null;
    } catch (error) {
      console.error('点赞失败:', error);
      return null;
    }
  }

  async addComment(postId, commentData) {
    try {
      const posts = await this.getPosts();
      const postIndex = posts.findIndex(post => post.id === postId);
      
      if (postIndex !== -1) {
        const newComment = {
          id: uuidv4(),
          ...commentData,
          timestamp: new Date().toISOString(),
        };
        
        if (!posts[postIndex].comments) {
          posts[postIndex].comments = [];
        }
        posts[postIndex].comments.push(newComment);
        await this.savePosts(posts);
        return newComment;
      }
      return null;
    } catch (error) {
      console.error('添加评论失败:', error);
      return null;
    }
  }

  // 日记管理
  async getDiaryEntries() {
    try {
      const entries = await AsyncStorage.getItem(StorageServiceClass.KEYS.DIARY_ENTRIES);
      return entries ? JSON.parse(entries) : [];
    } catch (error) {
      console.error('获取日记失败:', error);
      return [];
    }
  }

  async saveDiaryEntry(entry) {
    try {
      const entries = await this.getDiaryEntries();
      const newEntry = {
        id: uuidv4(),
        ...entry,
        timestamp: new Date().toISOString(),
      };
      
      entries.unshift(newEntry);
      await AsyncStorage.setItem(
        StorageServiceClass.KEYS.DIARY_ENTRIES,
        JSON.stringify(entries)
      );
      return newEntry;
    } catch (error) {
      console.error('保存日记失败:', error);
      return null;
    }
  }

  async updateDiaryEntry(entryId, updates) {
    try {
      const entries = await this.getDiaryEntries();
      const entryIndex = entries.findIndex(entry => entry.id === entryId);
      
      if (entryIndex !== -1) {
        entries[entryIndex] = { ...entries[entryIndex], ...updates };
        await AsyncStorage.setItem(
          StorageServiceClass.KEYS.DIARY_ENTRIES,
          JSON.stringify(entries)
        );
        return entries[entryIndex];
      }
      return null;
    } catch (error) {
      console.error('更新日记失败:', error);
      return null;
    }
  }

  async deleteDiaryEntry(entryId) {
    try {
      const entries = await this.getDiaryEntries();
      const filteredEntries = entries.filter(entry => entry.id !== entryId);
      await AsyncStorage.setItem(
        StorageServiceClass.KEYS.DIARY_ENTRIES,
        JSON.stringify(filteredEntries)
      );
      return true;
    } catch (error) {
      console.error('删除日记失败:', error);
      return false;
    }
  }

  // AI日记管理
  async getAIDiaries() {
    try {
      const diaries = await AsyncStorage.getItem(StorageServiceClass.KEYS.AI_DIARIES);
      return diaries ? JSON.parse(diaries) : [];
    } catch (error) {
      console.error('获取AI日记失败:', error);
      return [];
    }
  }

  async saveAIDiary(diaryData) {
    try {
      const diaries = await this.getAIDiaries();
      const newDiary = {
        id: uuidv4(),
        ...diaryData,
        timestamp: new Date().toISOString(),
      };
      
      diaries.unshift(newDiary);
      await AsyncStorage.setItem(
        StorageServiceClass.KEYS.AI_DIARIES,
        JSON.stringify(diaries)
      );
      return newDiary;
    } catch (error) {
      console.error('保存AI日记失败:', error);
      return null;
    }
  }

  async getLastAIDiary() {
    try {
      const diaries = await this.getAIDiaries();
      return diaries.length > 0 ? diaries[0] : null;
    } catch (error) {
      console.error('获取最新AI日记失败:', error);
      return null;
    }
  }

  // 通知管理
  async getNotifications() {
    try {
      const notifications = await AsyncStorage.getItem(StorageServiceClass.KEYS.NOTIFICATIONS);
      return notifications ? JSON.parse(notifications) : [];
    } catch (error) {
      console.error('获取通知失败:', error);
      return [];
    }
  }

  async addNotification(notificationData) {
    try {
      const notifications = await this.getNotifications();
      const newNotification = {
        id: uuidv4(),
        ...notificationData,
        timestamp: new Date().toISOString(),
        read: false,
      };
      
      notifications.unshift(newNotification);
      // 只保留最近50条通知
      if (notifications.length > 50) {
        notifications.splice(50);
      }
      
      await AsyncStorage.setItem(
        StorageServiceClass.KEYS.NOTIFICATIONS,
        JSON.stringify(notifications)
      );
      return newNotification;
    } catch (error) {
      console.error('添加通知失败:', error);
      return null;
    }
  }

  async markNotificationAsRead(notificationId) {
    try {
      const notifications = await this.getNotifications();
      const notificationIndex = notifications.findIndex(n => n.id === notificationId);
      
      if (notificationIndex !== -1) {
        notifications[notificationIndex].read = true;
        await AsyncStorage.setItem(
          StorageServiceClass.KEYS.NOTIFICATIONS,
          JSON.stringify(notifications)
        );
        return true;
      }
      return false;
    } catch (error) {
      console.error('标记通知已读失败:', error);
      return false;
    }
  }

  // 收藏管理
  async getFavorites() {
    try {
      const favorites = await AsyncStorage.getItem(StorageServiceClass.KEYS.FAVORITES);
      return favorites ? JSON.parse(favorites) : [];
    } catch (error) {
      console.error('获取收藏失败:', error);
      return [];
    }
  }

  async addToFavorites(item) {
    try {
      const favorites = await this.getFavorites();
      const favoriteItem = {
        id: uuidv4(),
        originalId: item.id,
        type: item.comments ? 'post' : 'comment',
        content: item.content,
        author: item.author,
        timestamp: new Date().toISOString(),
        originalData: item,
      };
      
      // 检查是否已收藏
      const exists = favorites.some(fav => fav.originalId === item.id);
      if (!exists) {
        favorites.unshift(favoriteItem);
        await AsyncStorage.setItem(
          StorageServiceClass.KEYS.FAVORITES,
          JSON.stringify(favorites)
        );
      }
      return favoriteItem;
    } catch (error) {
      console.error('添加收藏失败:', error);
      return null;
    }
  }

  async removeFromFavorites(originalId) {
    try {
      const favorites = await this.getFavorites();
      const filteredFavorites = favorites.filter(fav => fav.originalId !== originalId);
      await AsyncStorage.setItem(
        StorageServiceClass.KEYS.FAVORITES,
        JSON.stringify(filteredFavorites)
      );
      return true;
    } catch (error) {
      console.error('移除收藏失败:', error);
      return false;
    }
  }

  // 浏览记录管理
  async getViewedPosts() {
    try {
      const viewed = await AsyncStorage.getItem(StorageServiceClass.KEYS.VIEWED_POSTS);
      return viewed ? JSON.parse(viewed) : [];
    } catch (error) {
      console.error('获取浏览记录失败:', error);
      return [];
    }
  }

  async updateViewedPosts(viewedData) {
    try {
      await AsyncStorage.setItem(
        StorageServiceClass.KEYS.VIEWED_POSTS,
        JSON.stringify(viewedData)
      );
      return true;
    } catch (error) {
      console.error('更新浏览记录失败:', error);
      return false;
    }
  }
  // 心情记录管理
  async getMoodEntries() {
    try {
      const entries = await AsyncStorage.getItem(StorageServiceClass.KEYS.MOOD_ENTRIES);
      return entries ? JSON.parse(entries) : [];
    } catch (error) {
      console.error('获取心情记录失败:', error);
      return [];
    }
  }

  async saveMoodEntry(moodData) {
    try {
      const entries = await this.getMoodEntries();
      const newEntry = {
        id: uuidv4(),
        ...moodData,
        timestamp: new Date().toISOString(),
      };
      
      entries.push(newEntry);
      await AsyncStorage.setItem(
        StorageServiceClass.KEYS.MOOD_ENTRIES,
        JSON.stringify(entries)
      );
      return newEntry;
    } catch (error) {
      console.error('保存心情记录失败:', error);
      return null;
    }
  }

  // 用户档案管理
  async getUserProfile() {
    try {
      const profile = await AsyncStorage.getItem(StorageServiceClass.KEYS.USER_PROFILE);
      return profile ? JSON.parse(profile) : {
        name: '用户',
        preferences: {},
        createdAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('获取用户档案失败:', error);
      return { name: '用户', preferences: {}, createdAt: new Date().toISOString() };
    }
  }

  async saveUserProfile(profile) {
    try {
      await AsyncStorage.setItem(
        StorageServiceClass.KEYS.USER_PROFILE,
        JSON.stringify(profile)
      );
    } catch (error) {
      console.error('保存用户档案失败:', error);
    }
  }

  // AI人格管理
  async getAIPersonality() {
    try {
      const personality = await AsyncStorage.getItem(StorageServiceClass.KEYS.AI_PERSONALITY);
      return personality ? JSON.parse(personality) : {
        traits: ['温暖', '善解人意', '鼓励'],
        adaptationLevel: 0,
        interactionCount: 0,
      };
    } catch (error) {
      console.error('获取AI人格失败:', error);
      return {
        traits: ['温暖', '善解人意', '鼓励'],
        adaptationLevel: 0,
        interactionCount: 0,
      };
    }
  }

  async updateAIPersonality(updates) {
    try {
      const personality = await this.getAIPersonality();
      const updatedPersonality = { ...personality, ...updates };
      await AsyncStorage.setItem(
        StorageServiceClass.KEYS.AI_PERSONALITY,
        JSON.stringify(updatedPersonality)
      );
      return updatedPersonality;
    } catch (error) {
      console.error('更新AI人格失败:', error);
      return null;
    }
  }

  // 数据导出
  async exportAllData() {
    try {
      const data = {
        conversationHistory: await this.getConversationHistory(),
        posts: await this.getPosts(),
        diaryEntries: await this.getDiaryEntries(),
        aiDiaries: await this.getAIDiaries(),
        moodEntries: await this.getMoodEntries(),
        userProfile: await this.getUserProfile(),
        aiPersonality: await this.getAIPersonality(),
        notifications: await this.getNotifications(),
        favorites: await this.getFavorites(),
        viewedPosts: await this.getViewedPosts(),
        exportDate: new Date().toISOString(),
      };
      return data;
    } catch (error) {
      console.error('导出数据失败:', error);
      return null;
    }
  }

  // 清除所有数据
  async clearAllData() {
    try {
      const keys = Object.values(StorageServiceClass.KEYS);
      await AsyncStorage.multiRemove(keys);
      return true;
    } catch (error) {
      console.error('清除数据失败:', error);
      return false;
    }
  }
}

export const StorageService = new StorageServiceClass();