import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
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
import { v4 as uuidv4 } from 'uuid';

import { StorageService } from '../services/StorageService';
import { AIService } from '../services/AIService';
import PostCard from '../components/PostCard';

const { width, height } = Dimensions.get('window');

const PostsScreen = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [viewedPosts, setViewedPosts] = useState(new Set());

  const newPostOpacity = useSharedValue(0);
  const newPostTranslateY = useSharedValue(50);

  useEffect(() => {
    loadPosts();
    loadNotifications();
    loadFavorites();
    loadViewedPosts();
  }, []);

  const loadPosts = async () => {
    try {
      let existingPosts = await StorageService.getPosts();
      
      // 过滤已查看两次且未互动的帖子
      const filteredPosts = existingPosts.filter(post => {
        if (post.isUserPost) return true; // 用户帖子始终显示
        
        const viewCount = viewedPosts.get(post.id) || 0;
        const hasInteraction = post.userLiked || post.userCommented;
        
        // 如果查看超过2次且没有互动，检查是否应该删除
        if (viewCount >= 2 && !hasInteraction) {
          const daysSinceCreated = (Date.now() - new Date(post.timestamp).getTime()) / (1000 * 60 * 60 * 24);
          if (daysSinceCreated >= 7) {
            return false; // 一周后删除
          }
        }
        
        // 同一帖子每天最多主动展示一次
        const today = new Date().toDateString();
        const lastShown = post.lastShownDate;
        if (lastShown === today && viewCount > 0) {
          return false;
        }
        
        return true;
      });
      
      // 如果过滤后帖子不足，生成新帖子
      if (filteredPosts.length < 10) {
        await generateNewPosts(10 - filteredPosts.length);
        existingPosts = await StorageService.getPosts();
      }
      
      setPosts(existingPosts);
    } catch (error) {
      console.error('加载帖子失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadNotifications = async () => {
    try {
      const notifs = await StorageService.getNotifications();
      setNotifications(notifs);
    } catch (error) {
      console.error('加载通知失败:', error);
    }
  };

  const loadFavorites = async () => {
    try {
      const favs = await StorageService.getFavorites();
      setFavorites(favs);
    } catch (error) {
      console.error('加载收藏失败:', error);
    }
  };

  const loadViewedPosts = async () => {
    try {
      const viewed = await StorageService.getViewedPosts();
      setViewedPosts(new Map(viewed));
    } catch (error) {
      console.error('加载浏览记录失败:', error);
    }
  };

  const generateNewPosts = async (count = 10) => {
    setIsGenerating(true);
    try {
      for (let i = 0; i < count; i++) {
        const content = await AIService.generatePost();
        const likes = Math.floor(Math.random() * 50) + 5;
        
        const newPost = await StorageService.addPost({
          content,
          author: `AI用户${Math.floor(Math.random() * 100) + 1}`,
          likes,
          isUserPost: false,
          lastShownDate: new Date().toDateString(),
        });

        // 为每个帖子生成1-3个评论
        if (newPost) {
          const commentCount = Math.floor(Math.random() * 3) + 1;
          for (let j = 0; j < commentCount; j++) {
            const comment = await AIService.generateComment(content, true);
            await StorageService.addComment(newPost.id, comment);
          }
        }
      }
    } catch (error) {
      console.error('生成新帖子失败:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // 记录帖子浏览
  const markPostAsViewed = async (postId) => {
    const currentCount = viewedPosts.get(postId) || 0;
    const newCount = currentCount + 1;
    
    viewedPosts.set(postId, newCount);
    setViewedPosts(new Map(viewedPosts));
    
    await StorageService.updateViewedPosts(Array.from(viewedPosts.entries()));
  };

  const handleLike = async (postId) => {
    try {
      const updatedPost = await StorageService.likePost(postId);
      if (updatedPost) {
        setPosts(prevPosts =>
          prevPosts.map(post =>
            post.id === postId ? { ...updatedPost, userLiked: true } : post
          )
        );

        // 添加到收藏
        await StorageService.addToFavorites(updatedPost);
        loadFavorites();

        // 记录浏览
        await markPostAsViewed(postId);

        // 延迟生成AI反应
        setTimeout(async () => {
          await generateAIReaction(postId, 'like');
        }, 2000 + Math.random() * 3000);
      }
    } catch (error) {
      console.error('点赞失败:', error);
    }
  };

  const handleComment = async (postId, comment) => {
    try {
      const newComment = await StorageService.addComment(postId, {
        ...comment,
        isUserComment: true,
      });
      
      if (newComment) {
        // 更新帖子标记用户已评论
        await StorageService.updatePost(postId, { userCommented: true });
        
        const updatedPosts = await StorageService.getPosts();
        setPosts(updatedPosts);

        // 添加通知
        await StorageService.addNotification({
          type: 'comment',
          postId,
          message: '你的评论收到了回复',
          timestamp: new Date().toISOString(),
        });
        loadNotifications();

        // 记录浏览
        await markPostAsViewed(postId);

        // 延迟生成AI回复
        setTimeout(async () => {
          await generateAIReaction(postId, 'comment', comment.content);
        }, 3000 + Math.random() * 4000);
      }
    } catch (error) {
      console.error('评论失败:', error);
    }
  };

  const generateAIReaction = async (postId, type, userComment = '') => {
    try {
      const posts = await StorageService.getPosts();
      const post = posts.find(p => p.id === postId);
      
      if (!post) return;

      if (type === 'like') {
        // 生成额外的点赞
        const additionalLikes = Math.floor(Math.random() * 3) + 1;
        await StorageService.updatePost(postId, {
          likes: post.likes + additionalLikes
        });
      } else if (type === 'comment') {
        // 生成AI回复评论
        const aiReply = await AIService.generateComment(userComment, true);
        const aiComment = {
          id: uuidv4(),
          content: aiReply,
          timestamp: new Date().toISOString(),
          isUserComment: false,
          author: `AI用户${Math.floor(Math.random() * 100) + 1}`,
        };
        
        post.comments.push(aiComment);
        await StorageService.updatePost(postId, { comments: post.comments });
      }

      // 刷新帖子列表
      const updatedPosts = await StorageService.getPosts();
      setPosts(updatedPosts);
    } catch (error) {
      console.error('生成AI反应失败:', error);
    }
  };

  const toggleNewPost = () => {
    setShowNewPost(!showNewPost);
    if (!showNewPost) {
      newPostOpacity.value = withTiming(1, { duration: 300 });
      newPostTranslateY.value = withSpring(0);
    } else {
      newPostOpacity.value = withTiming(0, { duration: 300 });
      newPostTranslateY.value = withSpring(50);
    }
  };

  const handlePublishPost = async () => {
    if (!newPostContent.trim()) {
      Alert.alert('提示', '请输入帖子内容');
      return;
    }

    try {
      const newPost = await StorageService.addPost({
        content: newPostContent.trim(),
        author: '我',
        isUserPost: true,
      });

      if (newPost) {
        const updatedPosts = await StorageService.getPosts();
        setPosts(updatedPosts);
        setNewPostContent('');
        toggleNewPost();

        // 延迟生成AI点赞和评论
        setTimeout(async () => {
          await generateAIReaction(newPost.id, 'like');
          const encouragingComment = await AIService.generateComment(newPostContent, true);
          await StorageService.addComment(newPost.id, {
            ...encouragingComment,
            isUserComment: false,
          });
          
          // 添加通知
          await StorageService.addNotification({
            type: 'like',
            postId: newPost.id,
            message: '你的帖子收到了点赞和评论',
            timestamp: new Date().toISOString(),
          });
          
          const finalPosts = await StorageService.getPosts();
          setPosts(finalPosts);
          loadNotifications();
        }, 2000 + Math.random() * 3000);
      }
    } catch (error) {
      console.error('发布帖子失败:', error);
      Alert.alert('错误', '发布失败，请重试');
    }
  };

  // 过滤帖子
  const getFilteredPosts = () => {
    if (!searchText.trim()) return posts;
    
    return posts.filter(post => 
      post.content.includes(searchText) || 
      post.author.includes(searchText)
    );
  };

  // 检查是否需要生成更多帖子
  const handleEndReached = async () => {
    const remainingPosts = posts.length - 5; // 当剩余5个帖子时生成新的
    if (remainingPosts <= 0 && !isGenerating) {
      await generateNewPosts(5);
      const updatedPosts = await StorageService.getPosts();
      setPosts(updatedPosts);
    }
  };

  const newPostAnimatedStyle = useAnimatedStyle(() => ({
    opacity: newPostOpacity.value,
    transform: [{ translateY: newPostTranslateY.value }],
  }));

  const renderPost = ({ item, index }) => {
    // 记录帖子展示
    React.useEffect(() => {
      markPostAsViewed(item.id);
    }, []);

    return (
      <PostCard
        post={item}
        onLike={() => handleLike(item.id)}
        onComment={(comment) => handleComment(item.id, comment)}
      />
    );
  };

  if (loading || isGenerating) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>
          {isGenerating ? '正在生成精彩内容...' : '加载中...'}
        </Text>
      </View>
    );
  }

  const filteredPosts = getFilteredPosts();

  return (
    <View style={styles.container}>
      {/* 头部搜索和功能 */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color="#8E8E93" />
          <TextInput
            style={styles.searchInput}
            placeholder="搜索帖子..."
            placeholderTextColor="#8E8E93"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
        
        <TouchableOpacity 
          style={styles.headerButton} 
          onPress={() => setShowNotifications(!showNotifications)}
        >
          <Icon name="notifications" size={24} color="#333333" />
          {notifications.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{notifications.length}</Text>
            </View>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.headerButton} 
          onPress={() => setShowFavorites(!showFavorites)}
        >
          <Icon name="favorite" size={24} color="#333333" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.newPostButton} onPress={toggleNewPost}>
          <Icon name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* 新帖子输入框 */}
      {showNewPost && (
        <Animated.View style={[styles.newPostContainer, newPostAnimatedStyle]}>
          <TextInput
            style={styles.newPostInput}
            placeholder="分享你的想法..."
            placeholderTextColor="#8E8E93"
            value={newPostContent}
            onChangeText={setNewPostContent}
            multiline
            maxLength={200}
          />
          <View style={styles.newPostActions}>
            <TouchableOpacity style={styles.cancelButton} onPress={toggleNewPost}>
              <Text style={styles.cancelButtonText}>取消</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.publishButton} onPress={handlePublishPost}>
              <LinearGradient
                colors={['#6C63FF', '#FF6B9D']}
                style={styles.publishButtonGradient}
              >
                <Text style={styles.publishButtonText}>发布</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      {/* 帖子列表 */}
      <FlatList
        data={filteredPosts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.postsList}
        refreshing={loading}
        onRefresh={loadPosts}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.1}
      />

      {/* 底部提示 */}
      <View style={styles.hintContainer}>
        <Text style={styles.hintText}>下滑返回首页</Text>
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
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#333333',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#FF6B9D',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  newPostButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  newPostContainer: {
    margin: 20,
    padding: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 20,
  },
  newPostInput: {
    color: '#333333',
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  newPostActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  cancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginRight: 10,
  },
  cancelButtonText: {
    color: '#999999',
    fontSize: 16,
  },
  publishButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  publishButtonGradient: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  publishButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  postsList: {
    paddingHorizontal: 20,
    paddingBottom: 100,
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

export default PostsScreen;