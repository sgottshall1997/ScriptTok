/**
 * Rewrite Provider - Content rewriting and spinning
 * Supports live (OpenAI/Claude) and mock modes
 */

export interface RewriteInput {
  text: string;
  style?: 'professional' | 'casual' | 'engaging' | 'formal' | 'creative';
  length?: 'shorter' | 'longer' | 'same';
  voiceProfileId?: number;
  constraints?: string[];
  brandVoice?: {
    tone: string;
    personality: string;
    guidelines: string[];
  };
}

export interface RewriteOutput {
  originalText: string;
  rewrittenText: string;
  changes: Array<{
    type: 'tone' | 'length' | 'structure' | 'vocabulary';
    description: string;
  }>;
  wordCount: {
    original: number;
    rewritten: number;
  };
  mode: 'live' | 'mock';
  provider: string;
  metadata: {
    processingTime: number;
    confidence?: number;
    suggestions?: string[];
  };
}

export class RewriteProvider {
  private hasLiveKeys(): boolean {
    return !!(process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY);
  }

  async rewrite(input: RewriteInput): Promise<RewriteOutput> {
    const startTime = Date.now();

    if (this.hasLiveKeys()) {
      return this.runLiveRewrite(input, startTime);
    } else {
      return this.runMockRewrite(input, startTime);
    }
  }

  private async runLiveRewrite(input: RewriteInput, startTime: number): Promise<RewriteOutput> {
    // TODO: Implement live OpenAI/Claude integration
    // For now, fall back to mock mode even if keys are present
    return this.runMockRewrite(input, startTime);
  }

  private async runMockRewrite(input: RewriteInput, startTime: number): Promise<RewriteOutput> {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));

    const originalWords = input.text.split(/\s+/).filter(w => w.length > 0);
    const originalWordCount = originalWords.length;

    let rewrittenText = input.text;
    const changes: Array<{ type: 'tone' | 'length' | 'structure' | 'vocabulary'; description: string }> = [];

    // Apply style transformations
    switch (input.style) {
      case 'professional':
        rewrittenText = this.makeProfessional(rewrittenText);
        changes.push({ type: 'tone', description: 'Converted to professional tone' });
        break;
      case 'casual':
        rewrittenText = this.makeCasual(rewrittenText);
        changes.push({ type: 'tone', description: 'Converted to casual tone' });
        break;
      case 'engaging':
        rewrittenText = this.makeEngaging(rewrittenText);
        changes.push({ type: 'tone', description: 'Enhanced for engagement' });
        break;
      case 'creative':
        rewrittenText = this.makeCreative(rewrittenText);
        changes.push({ type: 'tone', description: 'Added creative flair' });
        break;
    }

    // Apply length transformations
    switch (input.length) {
      case 'shorter':
        rewrittenText = this.makeShorter(rewrittenText);
        changes.push({ type: 'length', description: 'Condensed content for brevity' });
        break;
      case 'longer':
        rewrittenText = this.makeLonger(rewrittenText);
        changes.push({ type: 'length', description: 'Expanded content with details' });
        break;
    }

    // Apply voice profile if provided
    if (input.voiceProfileId) {
      changes.push({ type: 'tone', description: `Applied voice profile #${input.voiceProfileId}` });
    }

    // Apply brand voice if provided
    if (input.brandVoice) {
      changes.push({ type: 'tone', description: `Aligned with ${input.brandVoice.tone} brand voice` });
    }

    const rewrittenWords = rewrittenText.split(/\s+/).filter(w => w.length > 0);
    const processingTime = Date.now() - startTime;

    return {
      originalText: input.text,
      rewrittenText,
      changes,
      wordCount: {
        original: originalWordCount,
        rewritten: rewrittenWords.length
      },
      mode: 'mock',
      provider: 'mock-rewriter',
      metadata: {
        processingTime,
        confidence: 0.85 + Math.random() * 0.1,
        suggestions: [
          'Consider A/B testing this variation',
          'Check brand voice alignment',
          'Review for target audience fit'
        ]
      }
    };
  }

  private makeProfessional(text: string): string {
    return text
      .replace(/\b(awesome|amazing|super|really)\b/gi, 'excellent')
      .replace(/\b(cool|neat)\b/gi, 'impressive')
      .replace(/\b(stuff|things)\b/gi, 'elements')
      .replace(/!/g, '.')
      .replace(/\b(gonna|going to)\b/gi, 'will')
      .replace(/\b(wanna|want to)\b/gi, 'wish to');
  }

  private makeCasual(text: string): string {
    return text
      .replace(/\b(excellent|outstanding)\b/gi, 'awesome')
      .replace(/\b(impressive|remarkable)\b/gi, 'cool')
      .replace(/\b(elements|components)\b/gi, 'things')
      .replace(/\b(will)\b/gi, 'gonna')
      .replace(/\./g, '!')
      .replace(/\b(wish to)\b/gi, 'wanna');
  }

  private makeEngaging(text: string): string {
    // Add engaging elements
    const engagingStarters = ['Imagine', 'Picture this:', 'Here\'s the thing:', 'Want to know a secret?'];
    const randomStarter = engagingStarters[Math.floor(Math.random() * engagingStarters.length)];
    
    return `${randomStarter} ${text}`
      .replace(/\./g, '!')
      .replace(/\b(you)\b/gi, 'YOU')
      .replace(/\b(can)\b/gi, 'CAN');
  }

  private makeCreative(text: string): string {
    // Add creative metaphors and imagery
    return text
      .replace(/\b(success)\b/gi, 'triumph')
      .replace(/\b(good)\b/gi, 'magnificent')
      .replace(/\b(help)\b/gi, 'empower')
      .replace(/\b(make)\b/gi, 'craft')
      .replace(/\b(use)\b/gi, 'harness');
  }

  private makeShorter(text: string): string {
    // Remove redundant words and phrases
    return text
      .replace(/\b(very|really|quite|rather|pretty|fairly)\s+/gi, '')
      .replace(/\b(in order to)\b/gi, 'to')
      .replace(/\b(due to the fact that)\b/gi, 'because')
      .replace(/\b(a large number of)\b/gi, 'many')
      .replace(/\b(in the event that)\b/gi, 'if')
      .split('. ')
      .slice(0, Math.max(1, Math.floor(text.split('. ').length * 0.7)))
      .join('. ');
  }

  private makeLonger(text: string): string {
    // Add descriptive details and explanations
    const expansions = [
      'Additionally, this approach',
      'Furthermore, it\'s important to note that',
      'In other words,',
      'To put it another way,',
      'What this means is that'
    ];

    const sentences = text.split('. ');
    const expandedSentences = sentences.map((sentence, index) => {
      if (index < sentences.length - 1 && Math.random() > 0.5) {
        const expansion = expansions[Math.floor(Math.random() * expansions.length)];
        return `${sentence}. ${expansion} ${sentence.toLowerCase()}`;
      }
      return sentence;
    });

    return expandedSentences.join('. ');
  }
}