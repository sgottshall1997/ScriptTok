/**
 * Text-to-Speech Provider - Audio generation from text
 * Supports live (ElevenLabs) and mock modes
 */

export interface TTSInput {
  text: string;
  voice: 'male' | 'female' | 'neutral' | string;
  speed?: 'slow' | 'normal' | 'fast';
  emotion?: 'neutral' | 'happy' | 'sad' | 'excited' | 'professional';
  language?: string;
}

export interface TTSOutput {
  audioUrl: string;
  duration: number; // in seconds
  format: 'mp3' | 'wav' | 'ogg';
  mode: 'live' | 'mock';
  provider: string;
  metadata: {
    voiceId?: string;
    sampleRate: number;
    bitrate: number;
    processingTime: number;
    textLength: number;
    estimatedSize: number; // in bytes
  };
}

export class TTSProvider {
  private hasLiveKeys(): boolean {
    return !!(process.env.ELEVENLABS_API_KEY || process.env.AZURE_SPEECH_KEY);
  }

  async synthesize(input: TTSInput): Promise<TTSOutput> {
    const startTime = Date.now();

    if (this.hasLiveKeys()) {
      return this.runLiveTTS(input, startTime);
    } else {
      return this.runMockTTS(input, startTime);
    }
  }

  private async runLiveTTS(input: TTSInput, startTime: number): Promise<TTSOutput> {
    // TODO: Implement live ElevenLabs/Azure Speech integration
    // For now, fall back to mock mode even if keys are present
    return this.runMockTTS(input, startTime);
  }

  private async runMockTTS(input: TTSInput, startTime: number): Promise<TTSOutput> {
    // Simulate processing delay based on text length
    const baseDelay = 1000;
    const textDelay = Math.min(input.text.length * 10, 3000);
    await new Promise(resolve => setTimeout(resolve, baseDelay + textDelay));

    // Generate mock audio data URL (minimal valid WAV)
    const mockAudioData = this.generateMockWavData(input.text.length);
    const audioUrl = `data:audio/wav;base64,${mockAudioData}`;

    // Calculate estimated duration (average reading speed: 150 words per minute)
    const wordCount = input.text.split(/\s+/).filter(w => w.length > 0).length;
    const baseWordsPerMinute = 150;
    
    // Adjust for speed
    let adjustedWPM = baseWordsPerMinute;
    switch (input.speed) {
      case 'slow':
        adjustedWPM = 120;
        break;
      case 'fast':
        adjustedWPM = 180;
        break;
    }

    const duration = Math.max(1, Math.round((wordCount / adjustedWPM) * 60));
    const processingTime = Date.now() - startTime;

    return {
      audioUrl,
      duration,
      format: 'wav',
      mode: 'mock',
      provider: 'mock-tts',
      metadata: {
        voiceId: this.getVoiceId(input.voice),
        sampleRate: 22050,
        bitrate: 128,
        processingTime,
        textLength: input.text.length,
        estimatedSize: duration * 2048 // rough estimate
      }
    };
  }

  private generateMockWavData(textLength: number): string {
    // Generate a minimal valid WAV file header in base64
    // This creates a very short silence WAV that can be played
    const duration = Math.min(textLength / 100, 5); // max 5 seconds
    const sampleRate = 22050;
    const samples = Math.floor(sampleRate * duration);
    
    // WAV header (44 bytes) + data
    const buffer = new ArrayBuffer(44 + samples * 2);
    const view = new DataView(buffer);
    
    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + samples * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, samples * 2, true);
    
    // Generate simple sine wave data
    for (let i = 0; i < samples; i++) {
      const sample = Math.sin(2 * Math.PI * 440 * i / sampleRate) * 0.1; // quiet 440Hz tone
      view.setInt16(44 + i * 2, sample * 32767, true);
    }
    
    // Convert to base64
    const uint8Array = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < uint8Array.byteLength; i++) {
      binary += String.fromCharCode(uint8Array[i]);
    }
    
    return btoa(binary);
  }

  private getVoiceId(voice: string): string {
    const voiceMap: Record<string, string> = {
      'male': 'mock-voice-male-01',
      'female': 'mock-voice-female-01',
      'neutral': 'mock-voice-neutral-01',
    };
    
    return voiceMap[voice] || `mock-voice-custom-${voice}`;
  }

  async getAvailableVoices(): Promise<Array<{
    id: string;
    name: string;
    gender: 'male' | 'female' | 'neutral';
    language: string;
    preview?: string;
  }>> {
    // Mock available voices
    return [
      {
        id: 'mock-voice-male-01',
        name: 'Professional Male',
        gender: 'male',
        language: 'en-US',
        preview: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMiCSqO3fbSfC8GKHjN8t2QQAoUXrTp66hVFQhGn+DyvmMiCSqO3fbSfC8GJHfH8N2QQAoUXrTp66hVFApGn+DyvmMiCSqO3fbSfC8GKHjN8t2QQAoUXrTp66hVFQhGn+DyvmMiCSqO3fbSfC8GJHfH8N2QQAoUXrTp66hVFApGn+DyvmMiCSqO3fbSfC8GKHjN8t2QQAoUXrTp66hVFQpGn+DyvmMhCSqO3fbSfC8GJHfH8N2QQAoUXrTp66hVFApGn+DyvmMiCSqO3fbSfC8GKHjN8t2QQAoUXrTp66hVFQpGn+DyvmMhCSqO3fbSfC8GJHfH8N2QQAoUXrTp66hVFApGn+DyvmMiCSqO3fbSfC8GKHjN8t2QQA='
      },
      {
        id: 'mock-voice-female-01',
        name: 'Professional Female',
        gender: 'female',
        language: 'en-US'
      },
      {
        id: 'mock-voice-neutral-01',
        name: 'Neutral Voice',
        gender: 'neutral',
        language: 'en-US'
      }
    ];
  }
}