/**
 * Feature flags utility for checking ENABLE_* environment variables
 */

// Helper function to get environment variable value
const getEnvVar = (key: string): string | undefined => {
  // Check window.__env first (runtime config), then import.meta.env (build-time config)
  if (typeof window !== 'undefined' && (window as any).__env) {
    return (window as any).__env[key];
  }
  return import.meta.env[`VITE_${key}`];
};

// Feature flag checker functions
export const isEmailEnabled = (): boolean => {
  return getEnvVar('ENABLE_EMAIL') === 'true';
};

export const isSocialEnabled = (): boolean => {
  return getEnvVar('ENABLE_SOCIAL') === 'true';
};

export const isBlogEnabled = (): boolean => {
  return getEnvVar('ENABLE_BLOG') === 'true';
};

export const isPushEnabled = (): boolean => {
  return getEnvVar('ENABLE_PUSH') === 'true';
};

export const isDigestEnabled = (): boolean => {
  return getEnvVar('ENABLE_DIGEST') === 'true';
};

export const isTrendsEnabled = (): boolean => {
  return getEnvVar('ENABLE_TRENDS') === 'true';
};

// Get all enabled features
export const getEnabledFeatures = (): string[] => {
  const features = [];
  if (isEmailEnabled()) features.push('Email');
  if (isSocialEnabled()) features.push('Social');
  if (isBlogEnabled()) features.push('Blog');
  if (isPushEnabled()) features.push('Push Notifications');
  if (isDigestEnabled()) features.push('Digest');
  if (isTrendsEnabled()) features.push('Trends');
  return features;
};

// Get disabled features
export const getDisabledFeatures = (): string[] => {
  const features = [];
  if (!isEmailEnabled()) features.push('Email');
  if (!isSocialEnabled()) features.push('Social');
  if (!isBlogEnabled()) features.push('Blog');
  if (!isPushEnabled()) features.push('Push Notifications');
  if (!isDigestEnabled()) features.push('Digest');
  if (!isTrendsEnabled()) features.push('Trends');
  return features;
};

// Check if a specific feature is disabled
export const isFeatureDisabled = (feature: string): boolean => {
  switch (feature.toLowerCase()) {
    case 'email':
      return !isEmailEnabled();
    case 'social':
      return !isSocialEnabled();
    case 'blog':
      return !isBlogEnabled();
    case 'push':
      return !isPushEnabled();
    case 'digest':
      return !isDigestEnabled();
    case 'trends':
      return !isTrendsEnabled();
    default:
      return false;
  }
};

// Get feature flag warning message
export const getFeatureFlagWarning = (features: string[]): string | null => {
  const disabledFeatures = features.filter(feature => isFeatureDisabled(feature));
  if (disabledFeatures.length === 0) return null;
  
  if (disabledFeatures.length === 1) {
    return `The ${disabledFeatures[0]} feature is currently disabled by feature flag.`;
  }
  
  return `The following features are currently disabled by feature flags: ${disabledFeatures.join(', ')}.`;
};