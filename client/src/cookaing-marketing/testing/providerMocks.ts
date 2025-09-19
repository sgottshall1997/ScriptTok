/**
 * Provider Test Harness - Phase 6
 * Deterministic mocks for all CookAIng Marketing providers
 */

// Simple deterministic hash function for consistent mock data
function hashInput(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

// Deterministic mock responses for consistent testing
export const providerMocks = {
  // Content generation providers
  contentGeneration: {
    generateContent: (niche: string, platform: string, tone: string) => ({
      content: `Delicious ${niche} recipe perfect for ${platform}! ${tone === 'friendly' ? 'Hope you enjoy!' : tone === 'professional' ? 'This demonstrates culinary excellence.' : 'Amazing results every time!'}`,
      platformCaptions: {
        instagram: `Amazing ${niche} content! 🔥 #${niche} #${platform} #recipe`,
        tiktok: `${niche.toUpperCase()} that hits different! #${niche}tok #recipe`,
        youtube: `How to make perfect ${niche} - detailed tutorial for ${platform}`,
        twitter: `Quick ${niche} tip that will change everything! #${niche}`,
        facebook: `Incredible ${niche} recipe that everyone needs to try!`
      },
      metadata: {
        niche,
        platform,
        tone,
        aiModel: 'mock',
        template: 'general'
      },
      mode: 'mock'
    }),
    
    openai: {
      mode: 'mock',
      generateContent: (prompt: string, options?: any) => ({
        content: `Mock content generated for: ${prompt.substring(0, 50)}...`,
        tokens: 150,
        model: 'gpt-3.5-turbo',
        mode: 'mock'
      })
    },
    
    anthropic: {
      mode: 'mock',
      generateContent: (prompt: string, options?: any) => ({
        content: `Claude mock response for: ${prompt.substring(0, 50)}...`,
        tokens: 165,
        model: 'claude-3-sonnet',
        mode: 'mock'
      })
    }
  },

  // Enhancement providers
  enhancement: {
    imageGeneration: {
      mode: 'mock',
      generateImage: (prompt: string) => ({
        imageUrl: `https://mock-images.example.com/generated/${encodeURIComponent(prompt)}.jpg`,
        prompt,
        model: 'dall-e-3',
        mode: 'mock'
      })
    },
    
    videoGeneration: {
      mode: 'mock',
      generateVideo: (prompt: string) => ({
        videoUrl: `https://mock-videos.example.com/generated/${encodeURIComponent(prompt)}.mp4`,
        thumbnailUrl: `https://mock-images.example.com/thumbs/${encodeURIComponent(prompt)}.jpg`,
        duration: 30,
        prompt,
        mode: 'mock'
      })
    },
    
    ttsGeneration: {
      mode: 'mock',
      generateAudio: (text: string, voice?: string) => ({
        audioUrl: `https://mock-audio.example.com/tts/${encodeURIComponent(text.substring(0, 20))}.mp3`,
        duration: Math.ceil(text.length / 10), // ~10 chars per second
        voice: voice || 'default',
        mode: 'mock'
      })
    },
    
    contentRewrite: {
      mode: 'mock',
      rewriteContent: (content: string, style?: string) => ({
        rewrittenContent: `Rewritten (${style || 'default'}): ${content}`,
        changes: ['tone adjustment', 'clarity improvement'],
        mode: 'mock'
      })
    }
  },

  // Intelligence providers
  intelligence: {
    competitor: {
      analyzeCompetitors: (niche: string, platform: string) => ({
        competitors: [
          { 
            name: `Top ${niche} Creator`,
            handle: `@${niche}master`,
            engagementRate: 8.5 + (hashInput(niche + platform + '1') % 20) / 10,
            followerCount: 50000 + (hashInput(niche + platform + '1') % 100000),
            platform
          },
          {
            name: `${niche} Expert`,
            handle: `@${niche}expert`,
            engagementRate: 7.2 + (hashInput(niche + platform + '2') % 25) / 10,
            followerCount: 75000 + (hashInput(niche + platform + '2') % 150000),
            platform
          },
          {
            name: `Daily ${niche}`,
            handle: `@daily${niche}`,
            engagementRate: 6.8 + (hashInput(niche + platform + '3') % 30) / 10,
            followerCount: 30000 + (hashInput(niche + platform + '3') % 80000),
            platform
          }
        ],
        insights: {
          averageEngagement: 7.5 + (hashInput(niche + platform) % 20) / 10,
          topContentTypes: ['recipe', 'tutorial', 'tips'],
          bestPostingTimes: ['18:00', '19:00', '20:00']
        },
        mode: 'mock'
      })
    },
    
    competitors: {
      mode: 'mock',
      scanCompetitors: (niche: string, platform: string) => ({
        posts: [
          {
            id: `mock-${niche}-${platform}-1`,
            platform,
            contentType: 'reel',
            caption: `Mock ${niche} content from competitor analysis`,
            engagementRate: 0.075 + (hashInput(niche + platform) % 50) / 1000,
            metrics: {
              likes: hashInput(niche + platform + 'likes') % 2000 + 500,
              comments: hashInput(niche + platform + 'comments') % 200 + 50,
              shares: hashInput(niche + platform + 'shares') % 300 + 100
            },
            contentAnalysis: {
              topics: [niche, 'trending', 'viral'],
              sentiment: 'positive',
              hooks: ['attention-grabbing', 'relatable'],
              cta: 'save this recipe'
            }
          }
        ],
        insights: [`${niche} content performs best on ${platform} with video format`],
        mode: 'mock'
      })
    },
    
    sentiment: {
      mode: 'mock',
      analyzeSentiment: (niche: string, platform: string) => ({
        sentiment: 'positive',
        score: 0.76 + (hashInput(niche + platform) % 19) / 100,
        insights: {
          topEmotions: ['joy', 'excitement', 'satisfaction'],
          keywords: ['delicious', 'amazing', 'perfect'],
          trends: `Growing positive sentiment around ${niche} content`
        },
        recommendations: [
          `Capitalize on positive ${niche} sentiment`,
          'Use emotional trigger words',
          'Post during high-engagement periods'
        ],
        mode: 'mock'
      })
    },
    
    viral: {
      mode: 'mock',
      calculateViralScore: (contentType: string, platform: string) => ({
        score: (hashInput(contentType + platform) % 30) + 70, // 70-100 range
        factors: {
          timing: 0.8 + (hashInput(contentType + platform + 'timing') % 20) / 100,
          hashtags: 0.75 + (hashInput(contentType + platform + 'hashtags') % 25) / 100,
          hook: 0.8 + (hashInput(contentType + platform + 'hook') % 20) / 100,
          length: 0.85 + (hashInput(contentType + platform + 'length') % 15) / 100,
          engagement_rate: 0.7 + (hashInput(contentType + platform + 'engagement') % 30) / 100
        },
        recommendations: [
          `Optimize ${contentType} for ${platform}`,
          'Use trending hashtags',
          'Post at peak engagement times',
          'Include strong hook in first 3 seconds'
        ],
        mode: 'mock'
      })
    },
    
    fatigue: {
      mode: 'mock',
      calculateFatigue: (topics: string[]) => ({
        fatigueLevel: (hashInput(topics.join(',')) % 30) / 100, // 0-30% fatigue
        signals: topics.map(topic => ({
          topic,
          slope: -0.1 + (hashInput(topic + 'slope') % 20) / 100, // -10% to +10%
          confidence: 0.7 + (hashInput(topic + 'confidence') % 30) / 100
        })),
        recommendations: topics.length > 2 ? [
          'Consider diversifying content topics',
          'Rotate between trending and evergreen content'
        ] : [
          'Topic diversity looks healthy',
          'Continue current content strategy'
        ],
        mode: 'mock'
      })
    }
  },

  // Social automation providers
  social: {
    publishing: {
      mode: 'mock',
      publishPost: (platform: string, content: any) => ({
        postId: `mock-${platform}-${hashInput(platform + content)}`,
        url: `https://${platform}.com/post/mock-${hashInput(platform + content)}`,
        status: 'published',
        scheduledFor: content.scheduledFor || new Date(),
        mode: 'mock'
      }),
      
      schedulePost: (platform: string, niche: string, content: string) => ({
        postId: `mock-${platform}-${hashInput(platform + niche)}`,
        url: `https://${platform}.com/post/mock-${hashInput(platform + niche)}`,
        status: 'scheduled',
        scheduledFor: new Date(1640000000000 + (hashInput(platform + niche) % 86400000)), // Deterministic date
        mode: 'mock'
      })
    },
    
    hashtags: {
      mode: 'mock',
      suggestHashtags: (niche: string, platform: string) => ({
        suggestions: [
          { tag: `#${niche}`, popularity: 90 + (hashInput(niche + '1') % 10), competition: 'high' },
          { tag: '#recipe', popularity: 85 + (hashInput(niche + '2') % 10), competition: 'high' },
          { tag: `#${niche}lover`, popularity: 70 + (hashInput(niche + '3') % 15), competition: 'medium' },
          { tag: `#homemade${niche}`, popularity: 60 + (hashInput(niche + '4') % 20), competition: 'low' }
        ],
        performanceScore: 80 + (hashInput(niche + platform) % 15),
        mode: 'mock'
      })
    },
    
    timing: {
      mode: 'mock',
      getOptimalTimes: (platform: string, niche: string) => ({
        recommendations: [
          { dayOfWeek: 'sunday', hour: 18, engagementScore: 0.9 + (hashInput(platform + niche + 'sun') % 10) / 100 },
          { dayOfWeek: 'wednesday', hour: 19, engagementScore: 0.85 + (hashInput(platform + niche + 'wed') % 10) / 100 },
          { dayOfWeek: 'friday', hour: 17, engagementScore: 0.8 + (hashInput(platform + niche + 'fri') % 15) / 100 },
          { dayOfWeek: 'saturday', hour: 11, engagementScore: 0.75 + (hashInput(platform + niche + 'sat') % 20) / 100 }
        ],
        timezone: 'America/New_York',
        confidence: 0.8 + (hashInput(platform + niche) % 20) / 100,
        mode: 'mock'
      })
    }
  },

  // Personalization providers
  personalization: {
    insights: {
      getPersonalizationInsights: (userId: string, niche: string, platform: string) => ({
        confidence: 0.85 + (hashInput(userId + niche) % 15) / 100,
        recommendations: [
          niche,
          `Focus on ${niche} content`,
          `Optimize for ${platform} audience`,
          'Increase posting frequency'
        ],
        userProfile: {
          interests: [niche, 'cooking', 'lifestyle'],
          activeHours: ['18:00-21:00'],
          preferredFormat: platform === 'tiktok' ? 'short-form' : 'long-form'
        },
        mode: 'mock'
      })
    },
    
    abTesting: {
      analyzeResults: (metrics: any) => ({
        winner: hashInput(JSON.stringify(metrics)) % 2 === 0 ? 'A' : 'B',
        confidence: 0.85 + (hashInput(JSON.stringify(metrics)) % 15) / 100,
        improvement: 15 + (hashInput(JSON.stringify(metrics)) % 25),
        significance: true,
        results: {
          variantA: {
            conversions: metrics.clicks || 100,
            rate: 0.15 + (hashInput('A' + JSON.stringify(metrics)) % 10) / 100
          },
          variantB: {
            conversions: (metrics.clicks || 100) * 1.2,
            rate: 0.18 + (hashInput('B' + JSON.stringify(metrics)) % 10) / 100
          }
        },
        mode: 'mock'
      })
    },
    
    audienceAdaptation: {
      mode: 'mock',
      adaptForAudience: (content: string, rules: any) => {
        const adaptations = {
          diet: rules.diet ? `[Adapted for ${rules.diet.join(', ')} diet]` : '',
          skill: rules.skill ? `[${rules.skill} level instructions]` : '',
          time: rules.time ? `[${rules.time} preparation]` : '',
          geo: rules.geo ? `[Localized for ${rules.geo}]` : ''
        };
        
        const adaptedContent = `${content} ${Object.values(adaptations).filter(Boolean).join(' ')}`;
        
        return {
          adaptedContent,
          adaptations,
          confidence: 0.85 + (hashInput(content.substring(0, 10)) % 15) / 100,
          mode: 'mock'
        };
      }
    },
    
    brandVoice: {
      mode: 'mock',
      learnVoice: (corpus: string) => ({
        analysis: {
          tone: 'friendly and encouraging',
          style: 'conversational',
          phrases: ['absolutely delicious', 'so simple', 'perfect for'],
          vocabulary: 'casual but confident'
        },
        confidence: 0.8 + (hashInput(corpus.substring(0, 10)) % 20) / 100,
        examplePhrases: [
          'This recipe is absolutely foolproof!',
          'Your family will absolutely love this',
          'So simple, yet so delicious'
        ],
        mode: 'mock'
      }),
      
      applyVoice: (content: string, profile: any) => ({
        styledContent: `${content} [Applied ${profile.name} voice style]`,
        changes: ['tone adjustment', 'vocabulary enhancement', 'style consistency'],
        confidence: 0.9,
        mode: 'mock'
      })
    }
  },

  // Multimodal providers  
  multimodal: {
    realtimeOptimization: {
      mode: 'mock',
      optimizeContent: (content: any, metrics: any) => ({
        optimizedContent: `${content} [Real-time optimized based on ${JSON.stringify(metrics)}]`,
        improvements: ['engagement boost', 'clarity enhancement', 'call-to-action optimization'],
        expectedLift: 0.15 + (hashInput(JSON.stringify(metrics)) % 20) / 100,
        mode: 'mock'
      })
    }
  },

  // Compliance providers
  compliance: {
    moderation: {
      mode: 'mock',
      moderateContent: (content: string) => ({
        approved: true,
        confidence: 0.95,
        flags: [],
        suggestions: [],
        mode: 'mock'
      })
    },
    
    plagiarism: {
      mode: 'mock',
      checkPlagiarism: (content: string) => ({
        originalityScore: 0.9 + (hashInput(content.substring(0, 10)) % 10) / 100,
        matches: [],
        confidence: 0.85 + (hashInput(content.substring(0, 10)) % 15) / 100,
        mode: 'mock'
      })
    }
  },

  // Integration providers
  integrations: {
    crm: {
      mode: 'mock',
      syncContacts: () => ({
        synced: (hashInput('sync') % 100) + 50,
        errors: 0,
        mode: 'mock'
      })
    },
    
    ecommerce: {
      mode: 'mock',
      getProducts: (category?: string) => ({
        products: Array.from({ length: 5 }, (_, i) => ({
          id: `mock-product-${i + 1}`,
          name: `Mock ${category || 'Recipe'} Product ${i + 1}`,
          price: 19.99 + (hashInput(`product-${i}`) % 30),
          category: category || 'general',
          url: `https://example.com/product-${i + 1}`
        })),
        mode: 'mock'
      })
    },
    
    messaging: {
      mode: 'mock',
      sendMessage: (to: string, content: string) => ({
        messageId: `mock-msg-${hashInput(userId + 'msg')}`,
        status: 'sent',
        deliveredAt: new Date(),
        mode: 'mock'
      })
    }
  }
};

// Provider test utilities
export const mockUtils = {
  // Reset all provider states
  resetAllMocks: () => {
    console.log('[MOCK-UTILS] Resetting all provider mocks to initial state');
    // In a real implementation, this would clear any stateful mock data
    return {
      providers: Object.keys(providerMocks),
      resetAt: new Date().toISOString(),
      status: 'success'
    };
  },

  // Get deterministic response for input
  getDeterministicResponse: (provider: string, method: string, input: any) => {
    const hash = btoa(JSON.stringify({ provider, method, input })).slice(0, 8);
    return `deterministic-response-${hash}`;
  },

  // Validate mock provider response format
  validateMockResponse: (response: any) => {
    return {
      isValid: response && typeof response === 'object' && response.mode,
      requiredFields: ['mode'],
      hasMode: !!response?.mode,
      mode: response?.mode
    };
  }
};

export default providerMocks;