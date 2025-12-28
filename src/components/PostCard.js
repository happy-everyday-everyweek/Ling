import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialIcons';

const PostCard = ({ post, onLike, onComment }) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isLiked, setIsLiked] = useState(post.isLiked || false);

  const likeScale = useSharedValue(1);
  const commentsHeight = useSharedValue(0);

  const handleLike = () => {
    if (!isLiked) {
      setIsLiked(true);
      likeScale.value = withSpring(1.2, {}, () => {
        likeScale.value = withSpring(1);
      });
      onLike();
    }
  };

  const handleComment = () => {
    if (commentText.trim()) {
      onComment(commentText.trim());
      setCommentText('');
    }
  };

  const toggleComments = () => {
    setShowComments(!showComments);
    commentsHeight.value = withTiming(showComments ? 0 : 200, { duration: 300 });
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = now - time;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    return `${days}天前`;
  };

  const likeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: likeScale.value }],
  }));

  const commentsAnimatedStyle = useAnimatedStyle(() => ({
    maxHeight: commentsHeight.value,
    opacity: showComments ? 1 : 0,
  }));

  const renderComment = ({ item }) => (
    <View style={styles.commentItem}>
      <Text style={styles.commentAuthor}>
        {item.isUserComment ? '我' : item.author || 'AI用户'}
      </Text>
      <Text style={styles.commentContent}>{item.content}</Text>
      <Text style={styles.commentTime}>{formatTime(item.timestamp)}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
        style={styles.card}
      >
        {/* 帖子头部 */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {post.isUserPost ? '我' : post.author?.charAt(0) || 'A'}
            </Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.authorName}>
              {post.isUserPost ? '我' : post.author}
            </Text>
            <Text style={styles.timestamp}>{formatTime(post.timestamp)}</Text>
          </View>
        </View>

        {/* 帖子内容 */}
        <Text style={styles.content}>{post.content}</Text>

        {/* 互动按钮 */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
            <Animated.View style={[styles.likeButton, likeAnimatedStyle]}>
              <Icon
                name={isLiked ? 'favorite' : 'favorite-border'}
                size={20}
                color={isLiked ? '#FF6B9D' : '#8E8E93'}
              />
            </Animated.View>
            <Text style={[styles.actionText, isLiked && styles.likedText]}>
              {post.likes}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={toggleComments}>
            <Icon name="chat-bubble-outline" size={20} color="#8E8E93" />
            <Text style={styles.actionText}>{post.comments?.length || 0}</Text>
          </TouchableOpacity>
        </View>

        {/* 评论区域 */}
        <Animated.View style={[styles.commentsContainer, commentsAnimatedStyle]}>
          {showComments && (
            <>
              {/* 评论列表 */}
              {post.comments && post.comments.length > 0 && (
                <FlatList
                  data={post.comments}
                  renderItem={renderComment}
                  keyExtractor={(item) => item.id}
                  style={styles.commentsList}
                  showsVerticalScrollIndicator={false}
                />
              )}

              {/* 评论输入 */}
              <View style={styles.commentInput}>
                <TextInput
                  style={styles.commentTextInput}
                  placeholder="写下你的想法..."
                  placeholderTextColor="#8E8E93"
                  value={commentText}
                  onChangeText={setCommentText}
                  multiline
                  maxLength={100}
                />
                <TouchableOpacity
                  style={[
                    styles.commentSendButton,
                    !commentText.trim() && styles.commentSendButtonDisabled
                  ]}
                  onPress={handleComment}
                  disabled={!commentText.trim()}
                >
                  <Icon
                    name="send"
                    size={20}
                    color={commentText.trim() ? '#6C63FF' : '#8E8E93'}
                  />
                </TouchableOpacity>
              </View>
            </>
          )}
        </Animated.View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  card: {
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(108, 99, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerInfo: {
    flex: 1,
  },
  authorName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  timestamp: {
    color: '#8E8E93',
    fontSize: 12,
    marginTop: 2,
  },
  content: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 15,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  likeButton: {
    marginRight: 5,
  },
  actionText: {
    color: '#8E8E93',
    fontSize: 14,
    marginLeft: 5,
  },
  likedText: {
    color: '#FF6B9D',
  },
  commentsContainer: {
    overflow: 'hidden',
    marginTop: 10,
  },
  commentsList: {
    maxHeight: 120,
    marginBottom: 10,
  },
  commentItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    marginVertical: 2,
  },
  commentAuthor: {
    color: '#6C63FF',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  commentContent: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 18,
  },
  commentTime: {
    color: '#8E8E93',
    fontSize: 10,
    marginTop: 2,
  },
  commentInput: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  commentTextInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    maxHeight: 60,
    textAlignVertical: 'top',
  },
  commentSendButton: {
    marginLeft: 10,
    padding: 5,
  },
  commentSendButtonDisabled: {
    opacity: 0.5,
  },
});

export default PostCard;