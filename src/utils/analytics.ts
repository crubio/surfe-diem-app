/**
 * Analytics utility for tracking A/B test performance with Google Analytics
 */

export interface ABTestEvent {
  variation: string;
  event: string;
  timestamp: number;
  sessionId: string;
  userId?: string;
  metadata?: Record<string, any>;
}

// Generate a simple session ID
const getSessionId = (): string => {
  let sessionId = localStorage.getItem('surfe-diem-session-id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('surfe-diem-session-id', sessionId);
  }
  return sessionId;
};

// Google Analytics tracking
const trackGAEvent = (eventName: string, parameters: Record<string, any> = {}): void => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, parameters);
  }
};

// Track events to both localStorage and Google Analytics
const trackEvent = (event: ABTestEvent): void => {
  try {
    // Store locally for debug purposes
    const events = JSON.parse(localStorage.getItem('surfe-diem-analytics') || '[]');
    events.push(event);
    
    // Keep only last 100 events to prevent localStorage from getting too large
    if (events.length > 100) {
      events.splice(0, events.length - 100);
    }
    
    localStorage.setItem('surfe-diem-analytics', JSON.stringify(events));
    
    // Track to Google Analytics
    trackGAEvent('ab_test_event', {
      variation: event.variation,
      event_type: event.event,
      session_id: event.sessionId,
      ...event.metadata
    });
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      // Analytics event logged
    }
  } catch (error) {
    console.error('Failed to track analytics event:', error);
  }
};

// Track page view with variation
export const trackPageView = (variation: string, page = 'home'): void => {
  trackEvent({
    variation,
    event: 'page_view',
    timestamp: Date.now(),
    sessionId: getSessionId(),
    metadata: { page }
  });

  // Also track as a standard GA page view with custom parameters
  trackGAEvent('page_view', {
    page_title: `Home - ${variation}`,
    page_location: window.location.href,
    custom_parameter_variation: variation
  });
};

// Track user interaction
export const trackInteraction = (
  variation: string, 
  interaction: string, 
  metadata?: Record<string, any>
): void => {
  trackEvent({
    variation,
    event: 'interaction',
    timestamp: Date.now(),
    sessionId: getSessionId(),
    metadata: { interaction, ...metadata }
  });

  // Track as GA event
  trackGAEvent('user_interaction', {
    variation,
    interaction_type: interaction,
    ...metadata
  });
};

// Track conversion (e.g., clicking on a spot, using search)
export const trackConversion = (
  variation: string, 
  conversion: string, 
  metadata?: Record<string, any>
): void => {
  trackEvent({
    variation,
    event: 'conversion',
    timestamp: Date.now(),
    sessionId: getSessionId(),
    metadata: { conversion, ...metadata }
  });

  // Track as GA conversion event
  trackGAEvent('conversion', {
    variation,
    conversion_type: conversion,
    ...metadata
  });
};

// Track engagement metrics
export const trackEngagement = (
  variation: string,
  engagementType: 'scroll' | 'time_on_page' | 'click' | 'search',
  value?: number,
  metadata?: Record<string, any>
): void => {
  trackGAEvent('engagement', {
    variation,
    engagement_type: engagementType,
    value,
    ...metadata
  });
};

// Get analytics data (local storage fallback)
export const getAnalyticsData = (): ABTestEvent[] => {
  try {
    return JSON.parse(localStorage.getItem('surfe-diem-analytics') || '[]');
  } catch (error) {
    console.error('Failed to get analytics data:', error);
    return [];
  }
};

// Clear analytics data
export const clearAnalyticsData = (): void => {
  localStorage.removeItem('surfe-diem-analytics');
  localStorage.removeItem('surfe-diem-session-id');
};

// Get basic A/B test metrics (local storage fallback)
export const getABTestMetrics = () => {
  const events = getAnalyticsData();
  const metrics: Record<string, any> = {};
  
  // Group events by variation
  const variationEvents: Record<string, ABTestEvent[]> = {};
  events.forEach(event => {
    if (!variationEvents[event.variation]) {
      variationEvents[event.variation] = [];
    }
    variationEvents[event.variation].push(event);
  });
  
  // Calculate metrics for each variation
  Object.entries(variationEvents).forEach(([variation, variationEvents]) => {
    const pageViews = variationEvents.filter(e => e.event === 'page_view').length;
    const interactions = variationEvents.filter(e => e.event === 'interaction').length;
    const conversions = variationEvents.filter(e => e.event === 'conversion').length;
    
    metrics[variation] = {
      pageViews,
      interactions,
      conversions,
      conversionRate: pageViews > 0 ? (conversions / pageViews * 100).toFixed(2) + '%' : '0%',
      interactionRate: pageViews > 0 ? (interactions / pageViews * 100).toFixed(2) + '%' : '0%'
    };
  });
  
  return metrics;
}; 