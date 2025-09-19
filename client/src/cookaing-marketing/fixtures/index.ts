/**
 * Test Fixtures - Phase 6
 * Comprehensive test data for all CookAIng Marketing features
 */

export const testFixtures = {
  // Core entities
  organizations: [
    {
      id: 1,
      name: 'Test Kitchen Co.',
      email: 'hello@testkitchen.com',
      phone: '+1-555-0199',
      website: 'https://testkitchen.com',
      industry: 'Food & Beverage',
      size: '10-50',
      country: 'US',
      timezone: 'America/New_York'
    }
  ],

  contacts: [
    {
      id: 1,
      orgId: 1,
      email: 'chef@testkitchen.com',
      firstName: 'Chef',
      lastName: 'Martinez',
      preferences: {
        diet: ['vegetarian', 'gluten-free'],
        skill: 'intermediate',
        time: 'moderate',
        geo: 'US',
        device: 'mobile',
        language: 'en'
      }
    },
    {
      id: 2,
      orgId: 1,
      email: 'baker@testkitchen.com',
      firstName: 'Baker',
      lastName: 'Johnson',
      preferences: {
        diet: ['vegan'],
        skill: 'advanced',
        time: 'extended',
        geo: 'US',
        device: 'desktop',
        language: 'en'
      }
    }
  ],

  campaigns: [
    {
      id: 1,
      orgId: 1,
      name: 'Holiday Baking Series',
      type: 'seasonal',
      status: 'active',
      configJson: {
        audience: 'home-bakers',
        objective: 'engagement',
        channels: ['instagram', 'tiktok', 'youtube'],
        duration: '4-weeks'
      }
    },
    {
      id: 2,
      orgId: 1,
      name: 'Quick Weeknight Meals',
      type: 'standard',
      status: 'draft',
      configJson: {
        audience: 'busy-families',
        objective: 'conversion',
        channels: ['instagram', 'facebook'],
        duration: '2-weeks'
      }
    }
  ],

  // Content and enhancements
  contentVersions: [
    {
      id: 1,
      title: 'Perfect Chocolate Chip Cookies',
      content: 'Learn to make the most delicious chocolate chip cookies with this foolproof recipe. Perfect for beginners and guaranteed to impress!',
      metadata: {
        niche: 'desserts',
        platform: 'instagram',
        tone: 'enthusiastic',
        difficulty: 'easy',
        cookingTime: 30,
        servings: 24
      }
    },
    {
      id: 2,
      title: 'Quick Pasta Primavera',
      content: 'A colorful and nutritious pasta dish that comes together in just 20 minutes. Perfect for busy weeknight dinners!',
      metadata: {
        niche: 'dinner',
        platform: 'tiktok',
        tone: 'casual',
        difficulty: 'easy',
        cookingTime: 20,
        servings: 4
      }
    }
  ],

  cookaingContentVersions: [
    {
      id: 1,
      title: 'Perfect Chocolate Chip Cookies',
      mainContent: 'The ultimate chocolate chip cookie recipe that never fails. Crispy edges, chewy centers, and loaded with chocolate chips!',
      platformCaptions: {
        instagram: 'The BEST chocolate chip cookies you\'ll ever make! 🍪✨ Recipe in bio! #baking #cookies #homemade #recipe',
        tiktok: 'POV: You found the perfect chocolate chip cookie recipe 🤌 #cookietok #baking #recipe #fyp',
        youtube: 'How to Make Perfect Chocolate Chip Cookies Every Time | Foolproof Recipe',
        facebook: 'Nothing beats homemade chocolate chip cookies! This recipe is tried and true - perfect every single time. 🍪',
        twitter: 'The secret to perfect chocolate chip cookies? This recipe! 🍪 #baking #cookies'
      },
      metadata: {
        niche: 'desserts',
        difficulty: 'easy',
        cookingTime: 30,
        servings: 24,
        tags: ['baking', 'dessert', 'cookies', 'chocolate']
      },
      aiEvaluationScore: 92,
      userRating: 5,
      topRatedStyleUsed: true,
      brandVoiceProfileId: 1
    }
  ],

  // Intelligence data
  competitorPosts: [
    {
      id: 1,
      platform: 'instagram',
      contentType: 'reel',
      caption: 'Easy 5-ingredient pasta! Perfect for busy nights 🍝',
      engagementRate: 8.5,
      metrics: {
        likes: 1250,
        comments: 89,
        shares: 156,
        saves: 445
      },
      contentAnalysis: {
        topics: ['pasta', 'quick-meals', 'easy-recipes'],
        sentiment: 'positive',
        hooks: ['5-ingredient', 'easy', 'busy nights'],
        cta: 'save this recipe'
      }
    }
  ],

  sentimentSnapshots: [
    {
      id: 1,
      niche: 'desserts',
      platform: 'instagram',
      sentiment: 'positive',
      score: 0.8,
      insights: {
        topEmotions: ['joy', 'excitement', 'satisfaction'],
        keywords: ['delicious', 'amazing', 'perfect'],
        trends: 'increasing positivity around comfort baking'
      }
    }
  ],

  viralScores: [
    {
      id: 1,
      contentType: 'recipe-video',
      platform: 'tiktok',
      score: 85,
      factors: {
        timing: 0.9,
        hashtags: 0.8,
        hook: 0.85,
        length: 0.9,
        engagement_rate: 0.8
      },
      recommendations: [
        'Post between 6-9 PM for maximum reach',
        'Use trending hashtags: #FoodTok #EasyRecipe',
        'Start with a strong hook in first 3 seconds'
      ]
    }
  ],

  // Social automation
  socialQueue: [
    {
      id: 1,
      platform: 'instagram',
      contentId: 1,
      scheduledFor: new Date('2024-12-15T18:00:00Z'),
      status: 'scheduled',
      action: 'publish',
      metadata: {
        caption: 'Perfect chocolate chip cookies coming your way! 🍪',
        hashtags: ['#baking', '#cookies', '#homemade'],
        mediaUrls: ['https://example.com/cookie-video.mp4']
      }
    }
  ],

  hashtagSuggestions: [
    {
      id: 1,
      niche: 'desserts',
      platform: 'instagram',
      hashtags: [
        { tag: '#baking', popularity: 95, competition: 'high' },
        { tag: '#cookies', popularity: 88, competition: 'medium' },
        { tag: '#homemadecookies', popularity: 72, competition: 'low' },
        { tag: '#dessertlover', popularity: 85, competition: 'medium' }
      ],
      performanceScore: 87
    }
  ],

  optimalTimes: [
    {
      id: 1,
      platform: 'instagram',
      niche: 'desserts',
      dayOfWeek: 'sunday',
      hour: 18,
      engagementScore: 0.92,
      audienceSize: 'high',
      competition: 'medium'
    },
    {
      id: 2,
      platform: 'tiktok',
      niche: 'dinner',
      dayOfWeek: 'wednesday',
      hour: 19,
      engagementScore: 0.89,
      audienceSize: 'high',
      competition: 'low'
    }
  ],

  // Personalization & collaboration
  brandVoiceProfiles: [
    {
      id: 1,
      name: 'Friendly Home Chef',
      corpusJson: {
        analysis: {
          tone: 'warm and encouraging',
          style: 'conversational and approachable',
          phrases: [
            'absolutely delicious',
            'so simple to make',
            'perfect for any occasion',
            'your family will love this',
            'trust me on this one'
          ],
          vocabulary: 'casual but confident',
          personality: 'enthusiastic food lover who wants to help others succeed in the kitchen'
        }
      }
    }
  ],

  userRoles: [
    {
      id: 1,
      user: 'admin@test.com',
      role: 'admin',
      scopes: {
        read: true,
        write: true,
        approve: true,
        publish: true,
        export: true,
        admin: true
      }
    },
    {
      id: 2,
      user: 'editor@test.com',
      role: 'editor',
      scopes: {
        read: true,
        write: true,
        approve: false,
        publish: true,
        export: true,
        admin: false
      }
    },
    {
      id: 3,
      user: 'client@test.com',
      role: 'client',
      scopes: {
        read: true,
        write: false,
        approve: false,
        publish: false,
        export: false,
        admin: false
      }
    }
  ],

  approvals: [
    {
      id: 1,
      entityType: 'campaign',
      entityId: 1,
      status: 'review',
      assignee: 'admin@test.com',
      submittedBy: 'editor@test.com',
      notes: 'Please review the Holiday Baking Series campaign for approval',
      submittedAt: new Date('2024-12-01T10:00:00Z')
    }
  ],

  // Calendar and scheduling
  calendarItems: [
    {
      id: 1,
      title: 'Cookie Recipe Post',
      startAt: new Date('2024-12-15T18:00:00Z'),
      endAt: new Date('2024-12-15T19:00:00Z'),
      channel: 'instagram',
      status: 'scheduled',
      refId: 1
    },
    {
      id: 2,
      title: 'Pasta Video Upload',
      startAt: new Date('2024-12-16T19:00:00Z'),
      endAt: new Date('2024-12-16T20:00:00Z'),
      channel: 'tiktok',
      status: 'scheduled',
      refId: 2
    }
  ],

  // Analytics and ratings
  analyticsEvents: [
    {
      id: 1,
      orgId: 1,
      eventType: 'content_generate',
      entityType: 'version',
      entityId: '1',
      properties: {
        mode: 'mock',
        duration: 1500,
        niche: 'desserts',
        platform: 'instagram'
      }
    },
    {
      id: 2,
      orgId: 1,
      eventType: 'social_publish',
      entityType: 'post',
      entityId: '1',
      properties: {
        platform: 'instagram',
        engagement_rate: 0.085,
        reach: 5420
      }
    },
    {
      id: 3,
      orgId: 1,
      eventType: 'web_vitals',
      entityType: 'page',
      entityId: 'dashboard',
      properties: {
        lcp: 1200,
        cls: 0.1,
        tti: 800,
        url: '/cookaing-marketing'
      }
    }
  ],

  cookaingContentRatings: [
    {
      id: 1,
      versionId: 1,
      userRating: 5,
      aiEvaluationScore: 92,
      feedback: 'Perfect balance of detailed instructions and engaging tone. Great for beginners!',
      qualityScore: 94,
      isWinner: true,
      scope: 'desserts-instagram'
    }
  ]
};

// Full-stack connected fixture that demonstrates end-to-end flow
export const fullStackFixture = {
  // Start with an organization and contact
  organization: testFixtures.organizations[0],
  contact: testFixtures.contacts[0],
  
  // Create a campaign
  campaign: testFixtures.campaigns[0],
  
  // Generate content
  content: testFixtures.cookaingContentVersions[0],
  
  // Apply brand voice
  brandVoice: testFixtures.brandVoiceProfiles[0],
  
  // Submit for approval
  approval: testFixtures.approvals[0],
  
  // Schedule for publishing
  calendarItem: testFixtures.calendarItems[0],
  
  // Queue for social media
  socialPost: testFixtures.socialQueue[0],
  
  // Track analytics
  analytics: testFixtures.analyticsEvents.slice(0, 2),
  
  // Rate content
  rating: testFixtures.cookaingContentRatings[0],
  
  // Intelligence insights
  competitor: testFixtures.competitorPosts[0],
  sentiment: testFixtures.sentimentSnapshots[0],
  viral: testFixtures.viralScores[0]
};

export default testFixtures;