import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { generatePrompt } from '../prompts';
import * as templates from '../prompts/templates';
import { TemplateType, ToneOption } from '@shared/constants';

// Mock the template loading functions
vi.mock('../prompts/templates', () => ({
  loadPromptTemplates: vi.fn(),
  loadTemplateMetadata: vi.fn(),
  loadNicheInfo: vi.fn(),
  getTemplateMetadata: vi.fn(),
}));

// Mock console methods to track logging
const originalConsoleLog = console.log;
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

describe('Template Fallback System', () => {
  let consoleWarnMock: any;
  let consoleLogMock: any;
  let consoleErrorMock: any;
  
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
    
    // Mock console methods to track what's being logged
    console.log = vi.fn();
    console.warn = vi.fn();
    console.error = vi.fn();
    
    consoleWarnMock = vi.spyOn(console, 'warn');
    consoleLogMock = vi.spyOn(console, 'log');
    consoleErrorMock = vi.spyOn(console, 'error');
  });
  
  afterEach(() => {
    // Restore original console methods
    console.log = originalConsoleLog;
    console.warn = originalConsoleWarn;
    console.error = originalConsoleError;
  });
  
  it('should use exact template when niche and template type match', async () => {
    // Mock templates to include the requested niche and template
    const mockTemplates = {
      skincare: {
        seo_blog: 'Create an SEO blog about {product} with a {tone} tone. {trendContext}'
      }
    };
    
    (templates.loadPromptTemplates as any).mockResolvedValue(mockTemplates);
    
    const params = {
      niche: 'skincare',
      productName: 'Test Product',
      templateType: 'seo_blog' as TemplateType,
      tone: 'friendly' as ToneOption,
    };
    
    const prompt = await generatePrompt(params);
    
    // Should use the exact template
    expect(prompt).toContain('Create an SEO blog about Test Product');
    expect(params.fallbackLevel).toBe('exact');
    expect(consoleWarnMock).not.toHaveBeenCalled();
  });
  
  it('should fall back to default template when niche specific template is missing', async () => {
    // Mock templates to include only default template for the requested type
    const mockTemplates = {
      default: {
        seo_blog: 'Default template for {product} with a {tone} tone. {trendContext}'
      },
      tech: {} // Empty template set for the requested niche
    };
    
    (templates.loadPromptTemplates as any).mockResolvedValue(mockTemplates);
    
    const params = {
      niche: 'tech',
      productName: 'Tech Gadget',
      templateType: 'seo_blog' as TemplateType,
      tone: 'professional' as ToneOption,
    };
    
    const prompt = await generatePrompt(params);
    
    // Should fall back to default template
    expect(prompt).toContain('Default template for Tech Gadget');
    expect(params.fallbackLevel).toBe('default');
    expect(consoleWarnMock).toHaveBeenCalledWith(
      expect.stringContaining('[PromptFactory] Fallback used')
    );
  });
  
  it('should use generic fallback when both niche and default templates are missing', async () => {
    // Mock templates to not include the requested type in any niche
    const mockTemplates = {
      skincare: {
        influencer_caption: 'Some other template' // Not the requested template type
      },
      default: {
        product_comparison: 'Some default template' // Not the requested template type
      }
    };
    
    (templates.loadPromptTemplates as any).mockResolvedValue(mockTemplates);
    
    const params = {
      niche: 'pet',
      productName: 'Dog Toy',
      templateType: 'routine_kit' as TemplateType, // Not available in any niche
      tone: 'enthusiastic' as ToneOption,
    };
    
    const prompt = await generatePrompt(params);
    
    // Should use generic fallback
    expect(prompt).toContain('Write about Dog Toy for the pet niche');
    expect(prompt).toContain('generic fallback');
    expect(params.fallbackLevel).toBe('generic');
    expect(consoleWarnMock).toHaveBeenCalledWith(
      expect.stringContaining('[PromptFactory] Fallback used')
    );
  });
  
  it('should handle malformed template files with clear error messages', async () => {
    // Mock loadPromptTemplates to throw an error like a malformed JSON would
    (templates.loadPromptTemplates as any).mockImplementation(() => {
      throw new Error('JSON parse error in template file');
    });
    
    const params = {
      niche: 'skincare',
      productName: 'Test Product',
      templateType: 'seo_blog' as TemplateType,
      tone: 'friendly' as ToneOption,
    };
    
    // Should not throw but fall back to generic template
    const prompt = await generatePrompt(params);
    
    expect(prompt).toContain('Write about Test Product');
    expect(params.fallbackLevel).toBe('generic');
    expect(consoleErrorMock).toHaveBeenCalled();
  });
  
  it('should log appropriate warnings for each fallback level', async () => {
    // Mock templates to trigger different fallback levels for different niches
    const mockTemplates = {
      skincare: {
        seo_blog: 'Skincare specific template'
      },
      default: {
        short_video: 'Default short video template'
      }
      // No template for 'product_comparison' in any niche
    };
    
    (templates.loadPromptTemplates as any).mockResolvedValue(mockTemplates);
    
    // Test exact match - no warning
    await generatePrompt({
      niche: 'skincare',
      productName: 'Test Product',
      templateType: 'seo_blog' as TemplateType,
      tone: 'friendly' as ToneOption,
    });
    
    expect(consoleWarnMock).not.toHaveBeenCalled();
    
    // Test default fallback - should log warning
    await generatePrompt({
      niche: 'tech',
      productName: 'Gadget',
      templateType: 'short_video' as TemplateType,
      tone: 'friendly' as ToneOption,
    });
    
    expect(consoleWarnMock).toHaveBeenCalledWith(
      expect.stringContaining('fallbackLevel=default')
    );
    
    // Reset counter
    consoleWarnMock.mockClear();
    
    // Test generic fallback - should log warning
    await generatePrompt({
      niche: 'pet',
      productName: 'Dog Toy',
      templateType: 'product_comparison' as TemplateType,
      tone: 'friendly' as ToneOption,
    });
    
    expect(consoleWarnMock).toHaveBeenCalledWith(
      expect.stringContaining('fallbackLevel=generic')
    );
  });
});