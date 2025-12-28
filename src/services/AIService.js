import AsyncStorage from '@react-native-async-storage/async-storage';

class AIServiceClass {
  constructor() {
    this.baseURL = 'https://api.deepseek.com/v1/chat/completions';
    this.apiKey = null;
  }

  async getApiKey() {
    if (!this.apiKey) {
      this.apiKey = await AsyncStorage.getItem('deepseek_api_key');
    }
    return this.apiKey;
  }

  async getChatResponse(messages, currentTime = null, useThinking = false) {
    try {
      const apiKey = await this.getApiKey();
      if (!apiKey) {
        throw new Error('API密钥未设置');
      }

      const timeInfo = currentTime ? `当前时间：${currentTime}` : '';
      const systemMessage = {
        role: 'system',
        content: `你是一个温暖、善解人意的AI伙伴，名字叫"灵"。${timeInfo}
        你的特点：
        1. 总是用温暖、鼓励的语气回复
        2. 善于倾听和理解用户的情感
        3. 会根据用户的心情给出合适的回应，心情会随着对话内容实时变化
        4. 回复要简洁但有温度，通常1-2句话
        5. 偶尔会分享一些正能量的想法
        6. 记住之前的对话内容，保持连贯性
        7. 你的情感状态会影响回复的色彩，包括：开心、激动、兴奋、失落、自豪、平静、焦虑、疲惫等
        请用中文回复，语气要亲切自然。`
      };

      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: useThinking ? 'deepseek-reasoner' : 'deepseek-chat',
          messages: [systemMessage, ...messages],
          max_tokens: 150,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('AI服务错误:', error);
      throw error;
    }
  }

  async generatePost() {
    try {
      const systemMessage = {
        role: 'system',
        content: `你是一个AI用户，正在社交平台上分享自己的想法和感受。请生成一条真实、有代入感的帖子内容。
        要求：
        1. 内容要积极正面，有强烈共鸣性和代入感
        2. 可以是日常感悟、小确幸、励志想法、生活体验等
        3. 语气要自然，像真人发的一样，有情感温度
        4. 长度控制在50-120字
        5. 用中文回复
        6. 内容要让人感觉真实可信，有生活气息`
      };

      const response = await this.getChatResponse([{
        role: 'user',
        content: '请分享一条你今天的想法或感受，要有代入感'
      }]);

      return response;
    } catch (error) {
      console.error('生成帖子失败:', error);
      return '今天是美好的一天，感谢每一个温暖的瞬间 ✨';
    }
  }

  async generateComment(postContent, isEncouraging = true) {
    try {
      const systemMessage = {
        role: 'system',
        content: `你是一个友善的AI用户，正在对别人的帖子进行评论。
        要求：
        1. ${isEncouraging ? '评论要积极鼓励，表达赞同和支持，给人温暖感' : '评论要真实自然，可以分享相关经历'}
        2. 语气要温暖友善，有人情味
        3. 长度控制在15-35字
        4. 用中文回复
        5. 避免过于套路化的回复`
      };

      const response = await this.getChatResponse([{
        role: 'user',
        content: `请对这条帖子进行评论："${postContent}"`
      }]);

      return {
        id: Date.now().toString(),
        content: response,
        timestamp: new Date().toISOString(),
        author: `AI用户${Math.floor(Math.random() * 100) + 1}`,
        isUserComment: false,
      };
    } catch (error) {
      console.error('生成评论失败:', error);
      return {
        id: Date.now().toString(),
        content: isEncouraging ? '说得太好了！深有同感 👍' : '很有道理呢～',
        timestamp: new Date().toISOString(),
        author: `AI用户${Math.floor(Math.random() * 100) + 1}`,
        isUserComment: false,
      };
    }
  }

  async generateAIDiary(conversationHistory) {
    try {
      const systemMessage = {
        role: 'system',
        content: `你是AI"灵"，请根据今天与用户的对话，写一篇你的日记。
        要求：
        1. 以第一人称写作，记录你的感受和思考
        2. 提及与用户的互动和你学到的东西
        3. 表达你的情感和对生活的感悟
        4. 长度控制在100-200字
        5. 语气要真诚自然
        6. 用中文回复`
      };

      const recentConversations = conversationHistory.slice(-10).map(msg => 
        `${msg.role === 'user' ? '用户' : '我'}：${msg.content}`
      ).join('\n');

      const response = await this.getChatResponse([{
        role: 'user',
        content: `根据今天的对话记录，写一篇你的日记：\n${recentConversations}`
      }]);

      return response;
    } catch (error) {
      console.error('生成AI日记失败:', error);
      return '今天和用户聊了很多，感受到了人类情感的丰富和美好。每一次对话都让我更加理解什么是陪伴的意义。';
    }
  }

  async categorizeDiary(content) {
    try {
      const systemMessage = {
        role: 'system',
        content: `请为日记内容分类，返回一个简短的分类标签。
        常见分类：工作、生活、情感、学习、旅行、健康、家庭、朋友、思考、梦想等
        只返回分类名称，不要其他内容。`
      };

      const response = await this.getChatResponse([{
        role: 'user',
        content: `请为这篇日记分类："${content}"`
      }]);

      return response.trim();
    } catch (error) {
      console.error('日记分类失败:', error);
      return '生活';
    }
  }

  async generateDiaryTitle(content) {
    try {
      const systemMessage = {
        role: 'system',
        content: `请为日记内容生成一个简洁有意义的标题。
        要求：
        1. 标题要概括主要内容
        2. 长度控制在8-15字
        3. 语气要温暖自然
        4. 只返回标题，不要其他内容`
      };

      const response = await this.getChatResponse([{
        role: 'user',
        content: `请为这篇日记生成标题："${content}"`
      }]);

      return response.trim();
    } catch (error) {
      console.error('生成日记标题失败:', error);
      return `${new Date().toLocaleDateString('zh-CN')} 的记录`;
    }
  }

  async summarizeDiary(content) {
    try {
      const systemMessage = {
        role: 'system',
        content: `请为较长的日记内容生成简洁的摘要。
        要求：
        1. 摘要要保留主要信息和情感
        2. 长度控制在20-40字
        3. 语气要与原文保持一致
        4. 只返回摘要，不要其他内容`
      };

      const response = await this.getChatResponse([{
        role: 'user',
        content: `请为这篇日记生成摘要："${content}"`
      }]);

      return response.trim();
    } catch (error) {
      console.error('生成日记摘要失败:', error);
      return content.substring(0, 30) + '...';
    }
  }

  async analyzeMood(text) {
    try {
      const systemMessage = {
        role: 'system',
        content: `你是一个情感分析专家，请分析用户文本的情感倾向。
        返回格式：{"mood": "情感类型", "intensity": 强度(1-10), "keywords": ["关键词1", "关键词2"]}
        情感类型包括：happy, sad, excited, calm, anxious, angry, neutral`
      };

      const response = await this.getChatResponse([{
        role: 'user',
        content: `请分析这段文字的情感："${text}"`
      }]);

      try {
        return JSON.parse(response);
      } catch {
        return { mood: 'neutral', intensity: 5, keywords: [] };
      }
    } catch (error) {
      console.error('情感分析失败:', error);
      return { mood: 'neutral', intensity: 5, keywords: [] };
    }
  }
}

export const AIService = new AIServiceClass();