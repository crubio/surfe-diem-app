/**
 * Simple A/B Testing Utility
 * Assigns users to different home page variations for testing
 */

export type HomePageVariation = 'dashboard' | 'discovery' | 'data-rich';

interface ABTestConfig {
  variation: HomePageVariation;
  weight: number; // Percentage (0-100)
}

const HOME_PAGE_VARIATIONS: ABTestConfig[] = [
  { variation: 'dashboard', weight: 33 },  // 33% - Current Conditions Dashboard
  { variation: 'discovery', weight: 33 },  // 33% - Discovery-Focused
  { variation: 'data-rich', weight: 34 },  // 34% - Data-Rich Overview
];

/**
 * Get the home page variation for the current user
 * Uses localStorage to maintain consistency across sessions
 */
export function getHomePageVariation(): HomePageVariation {
  const storageKey = 'surfe-diem-homepage-variation';
  
  try {
    // Check if localStorage is available
    if (typeof window === 'undefined' || !window.localStorage) {
      return 'data-rich'; // Fallback if localStorage is not available
    }
    
    // Check if user already has an assigned variation
    const existingVariation = localStorage.getItem(storageKey) as HomePageVariation;
    if (existingVariation && HOME_PAGE_VARIATIONS.some(v => v.variation === existingVariation)) {
      return existingVariation;
    }
    
    // If existing variation is not in current config, clear it and reassign
    if (existingVariation && !HOME_PAGE_VARIATIONS.some(v => v.variation === existingVariation)) {
      localStorage.removeItem(storageKey);
    }
    
    // Assign new variation based on weights
    const random = Math.random() * 100;
    let cumulativeWeight = 0;
    
    for (const config of HOME_PAGE_VARIATIONS) {
      cumulativeWeight += config.weight;
      if (random <= cumulativeWeight) {
        localStorage.setItem(storageKey, config.variation);
        return config.variation;
      }
    }
    
    // Fallback to data-rich if no valid variation is assigned
    localStorage.setItem(storageKey, 'data-rich');
    return 'data-rich';
  } catch (error) {
    console.warn('Error accessing localStorage for A/B testing:', error);
    return 'data-rich'; // Fallback on any error
  }
}

/**
 * Force a specific variation (for testing)
 */
export function setHomePageVariation(variation: HomePageVariation): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('surfe-diem-homepage-variation', variation);
    }
  } catch (error) {
    console.warn('Error setting A/B test variation:', error);
  }
}

/**
 * Reset the A/B test assignment
 */
export function resetHomePageVariation(): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('surfe-diem-homepage-variation');
    }
  } catch (error) {
    console.warn('Error resetting A/B test variation:', error);
  }
}

/**
 * Get analytics data for the current variation
 */
export function getVariationAnalytics(): { variation: HomePageVariation; timestamp: number } {
  return {
    variation: getHomePageVariation(),
    timestamp: Date.now(),
  };
} 