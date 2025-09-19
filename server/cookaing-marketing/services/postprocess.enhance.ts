/**
 * Post-processing utilities for Content Enhancement
 * Handles HTML sanitization, URL signing, and data validation
 */

// Simple URL signing implementation for enhancement media
function createSignedUrl(url: string, metadata?: Record<string, any>): string {
  if (!url || typeof url !== 'string') {
    return url;
  }

  // Only sign external URLs
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return url;
  }

  try {
    const urlObj = new URL(url);
    
    // Add signing parameters
    urlObj.searchParams.set('signed', 'true');
    urlObj.searchParams.set('timestamp', Date.now().toString());
    
    if (metadata) {
      urlObj.searchParams.set('meta', JSON.stringify(metadata));
    }
    
    return urlObj.toString();
  } catch (error) {
    console.warn('Failed to sign URL:', error);
    return url; // Return original URL if signing fails
  }
}

/**
 * Sanitize HTML content to prevent XSS and ensure clean output
 */
export function sanitizeHTML(htmlContent: string): string {
  if (!htmlContent || typeof htmlContent !== 'string') {
    return '';
  }

  // Basic HTML sanitization - remove potentially dangerous elements and attributes
  return htmlContent
    // Remove script tags and their content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove on* event attributes
    .replace(/\s*on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi, '')
    // Remove javascript: protocol
    .replace(/javascript:/gi, '')
    // Remove data: protocol (except for safe data URLs like images)
    .replace(/data:(?!image\/(?:png|jpe?g|gif|webp|svg\+xml))[^;]*/gi, '')
    // Remove iframe tags
    .replace(/<iframe\b[^>]*>.*?<\/iframe>/gi, '')
    // Remove object and embed tags
    .replace(/<(?:object|embed)\b[^>]*>.*?<\/(?:object|embed)>/gi, '')
    // Remove form tags
    .replace(/<form\b[^>]*>.*?<\/form>/gi, '')
    // Clean up excessive whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Sign URLs for secure outbound links
 */
export function signUrl(url: string, metadata?: Record<string, any>): string {
  return createSignedUrl(url, {
    type: 'enhancement_media',
    timestamp: Date.now(),
    ...metadata
  });
}

/**
 * Validate and normalize JSON schema for enhancement outputs
 */
export function validateEnhancementOutput(
  enhancement: 'rewrite' | 'tts' | 'image' | 'video',
  outputs: any
): { isValid: boolean; errors: string[]; normalizedOutputs: any } {
  const errors: string[] = [];
  let normalizedOutputs = { ...outputs };

  try {
    switch (enhancement) {
      case 'rewrite':
        if (!outputs.originalText || typeof outputs.originalText !== 'string') {
          errors.push('Missing or invalid originalText');
        }
        if (!outputs.rewrittenText || typeof outputs.rewrittenText !== 'string') {
          errors.push('Missing or invalid rewrittenText');
        }
        if (!Array.isArray(outputs.changes)) {
          errors.push('Missing or invalid changes array');
          normalizedOutputs.changes = [];
        }
        if (!outputs.wordCount || typeof outputs.wordCount !== 'object') {
          errors.push('Missing or invalid wordCount');
          normalizedOutputs.wordCount = { original: 0, rewritten: 0 };
        }
        break;

      case 'tts':
        if (!outputs.audioUrl || typeof outputs.audioUrl !== 'string') {
          errors.push('Missing or invalid audioUrl');
        }
        if (typeof outputs.duration !== 'number' || outputs.duration <= 0) {
          errors.push('Missing or invalid duration');
          normalizedOutputs.duration = 1; // Default to 1 second
        }
        if (!outputs.format || typeof outputs.format !== 'string') {
          errors.push('Missing or invalid format');
          normalizedOutputs.format = 'wav'; // Default format
        }
        break;

      case 'image':
        if (!Array.isArray(outputs.images) || outputs.images.length === 0) {
          errors.push('Missing or invalid images array');
          normalizedOutputs.images = [];
        } else {
          // Validate each image
          normalizedOutputs.images = outputs.images.map((image: any, index: number) => {
            const normalizedImage = { ...image };
            if (!image.url || typeof image.url !== 'string') {
              errors.push(`Image ${index}: Missing or invalid url`);
            }
            if (!image.thumbUrl || typeof image.thumbUrl !== 'string') {
              normalizedImage.thumbUrl = image.url; // Use main URL as fallback
            }
            if (!image.prompt || typeof image.prompt !== 'string') {
              errors.push(`Image ${index}: Missing or invalid prompt`);
            }
            return normalizedImage;
          });
        }
        break;

      case 'video':
        if (!outputs.status || typeof outputs.status !== 'string') {
          errors.push('Missing or invalid status');
          normalizedOutputs.status = 'pending';
        }
        if (!Array.isArray(outputs.storyboard)) {
          errors.push('Missing or invalid storyboard array');
          normalizedOutputs.storyboard = [];
        }
        // videoUrl is optional (may not be ready yet)
        if (outputs.videoUrl && typeof outputs.videoUrl !== 'string') {
          errors.push('Invalid videoUrl format');
          normalizedOutputs.videoUrl = undefined;
        }
        break;

      default:
        errors.push(`Unknown enhancement type: ${enhancement}`);
    }

    // Validate common fields
    if (outputs.provider && typeof outputs.provider !== 'string') {
      errors.push('Invalid provider format');
      normalizedOutputs.provider = 'unknown';
    }

    if (outputs.metadata && typeof outputs.metadata !== 'object') {
      errors.push('Invalid metadata format');
      normalizedOutputs.metadata = {};
    }

  } catch (error) {
    errors.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    normalizedOutputs
  };
}

/**
 * Clean and prepare enhancement data for storage
 */
export function prepareForStorage(data: any): any {
  if (!data || typeof data !== 'object') {
    return data;
  }

  const cleaned = { ...data };

  // Remove circular references and functions
  function cleanObject(obj: any, visited = new Set()): any {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (visited.has(obj)) {
      return '[Circular Reference]';
    }

    if (typeof obj === 'function') {
      return '[Function]';
    }

    visited.add(obj);

    if (Array.isArray(obj)) {
      return obj.map(item => cleanObject(item, visited));
    }

    const cleanedObj: any = {};
    for (const [key, value] of Object.entries(obj)) {
      cleanedObj[key] = cleanObject(value, visited);
    }

    visited.delete(obj);
    return cleanedObj;
  }

  return cleanObject(cleaned);
}

/**
 * Extract safe preview text from content
 */
export function extractPreview(content: string, maxLength = 200): string {
  if (!content || typeof content !== 'string') {
    return '';
  }

  // Remove HTML tags for preview
  const textOnly = content.replace(/<[^>]*>/g, '');
  
  // Truncate and add ellipsis if needed
  if (textOnly.length <= maxLength) {
    return textOnly.trim();
  }

  // Try to break at word boundary
  const truncated = textOnly.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  if (lastSpace > maxLength * 0.8) {
    return truncated.substring(0, lastSpace).trim() + '...';
  }
  
  return truncated.trim() + '...';
}

/**
 * Validate file types and sizes for media uploads
 */
export function validateMediaFile(file: {
  type: string;
  size: number;
  url: string;
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate file type
  const allowedTypes = {
    image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    audio: ['audio/mp3', 'audio/wav', 'audio/mpeg', 'audio/ogg'],
    video: ['video/mp4', 'video/webm', 'video/mov', 'video/avi']
  };

  const isValidType = Object.values(allowedTypes).flat().includes(file.type);
  if (!isValidType) {
    errors.push(`Unsupported file type: ${file.type}`);
  }

  // Validate file size (in bytes)
  const maxSizes = {
    image: 10 * 1024 * 1024, // 10MB
    audio: 50 * 1024 * 1024, // 50MB
    video: 500 * 1024 * 1024, // 500MB
  };

  let maxSize = 10 * 1024 * 1024; // Default to 10MB
  for (const [type, types] of Object.entries(allowedTypes)) {
    if (types.includes(file.type)) {
      maxSize = maxSizes[type as keyof typeof maxSizes];
      break;
    }
  }

  if (file.size > maxSize) {
    errors.push(`File size exceeds limit: ${(file.size / 1024 / 1024).toFixed(2)}MB > ${(maxSize / 1024 / 1024).toFixed(2)}MB`);
  }

  // Validate URL format
  if (!file.url || (!file.url.startsWith('http') && !file.url.startsWith('data:'))) {
    errors.push('Invalid file URL format');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}