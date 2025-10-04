/**
 * Performance Monitoring Utilities
 * 
 * Provides utilities for monitoring and measuring application performance.
 * Includes Web Vitals tracking, custom metrics, and performance budgets.
 */

// ============================================================================
// Types
// ============================================================================

export interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  unit: string;
}

export interface WebVitalsMetrics {
  FCP?: PerformanceMetric; // First Contentful Paint
  LCP?: PerformanceMetric; // Largest Contentful Paint
  FID?: PerformanceMetric; // First Input Delay
  CLS?: PerformanceMetric; // Cumulative Layout Shift
  TTFB?: PerformanceMetric; // Time to First Byte
}

// ============================================================================
// Performance Thresholds (Web Vitals)
// ============================================================================

const THRESHOLDS = {
  FCP: { good: 1800, poor: 3000 }, // ms
  LCP: { good: 2500, poor: 4000 }, // ms
  FID: { good: 100, poor: 300 }, // ms
  CLS: { good: 0.1, poor: 0.25 }, // score
  TTFB: { good: 800, poor: 1800 }, // ms
};

// ============================================================================
// Rating Functions
// ============================================================================

function getRating(
  value: number,
  thresholds: { good: number; poor: number }
): 'good' | 'needs-improvement' | 'poor' {
  if (value <= thresholds.good) return 'good';
  if (value <= thresholds.poor) return 'needs-improvement';
  return 'poor';
}

// ============================================================================
// Web Vitals Monitoring
// ============================================================================

/**
 * Monitor and report Web Vitals metrics
 * Uses the browser's Performance API
 */
export const monitorWebVitals = (
  callback: (metrics: WebVitalsMetrics) => void
): void => {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
    console.warn('Performance monitoring not supported in this browser');
    return;
  }

  const metrics: WebVitalsMetrics = {};

  // Observe Largest Contentful Paint (LCP)
  try {
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as any;
      const value = lastEntry.renderTime || lastEntry.loadTime;
      metrics.LCP = {
        name: 'LCP',
        value,
        rating: getRating(value, THRESHOLDS.LCP),
        unit: 'ms',
      };
      callback(metrics);
    });
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
  } catch (e) {
    // LCP not supported
  }

  // Observe First Input Delay (FID)
  try {
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        const value = entry.processingStart - entry.startTime;
        metrics.FID = {
          name: 'FID',
          value,
          rating: getRating(value, THRESHOLDS.FID),
          unit: 'ms',
        };
        callback(metrics);
      });
    });
    fidObserver.observe({ entryTypes: ['first-input'] });
  } catch (e) {
    // FID not supported
  }

  // Observe Cumulative Layout Shift (CLS)
  try {
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
          metrics.CLS = {
            name: 'CLS',
            value: clsValue,
            rating: getRating(clsValue, THRESHOLDS.CLS),
            unit: 'score',
          };
          callback(metrics);
        }
      });
    });
    clsObserver.observe({ entryTypes: ['layout-shift'] });
  } catch (e) {
    // CLS not supported
  }

  // Get Paint Timing (FCP)
  if ('performance' in window && 'getEntriesByType' in window.performance) {
    const paintEntries = window.performance.getEntriesByType('paint');
    const fcpEntry = paintEntries.find((entry) => entry.name === 'first-contentful-paint');
    if (fcpEntry) {
      const value = fcpEntry.startTime;
      metrics.FCP = {
        name: 'FCP',
        value,
        rating: getRating(value, THRESHOLDS.FCP),
        unit: 'ms',
      };
      callback(metrics);
    }
  }

  // Get Navigation Timing (TTFB)
  if ('performance' in window && 'getEntriesByType' in window.performance) {
    const navEntries = window.performance.getEntriesByType('navigation');
    if (navEntries.length > 0) {
      const navEntry = navEntries[0] as PerformanceNavigationTiming;
      const value = navEntry.responseStart - navEntry.requestStart;
      metrics.TTFB = {
        name: 'TTFB',
        value,
        rating: getRating(value, THRESHOLDS.TTFB),
        unit: 'ms',
      };
      callback(metrics);
    }
  }
};

// ============================================================================
// Custom Performance Marks
// ============================================================================

/**
 * Mark a performance point in time
 */
export const markPerformance = (name: string): void => {
  if ('performance' in window && 'mark' in window.performance) {
    window.performance.mark(name);
  }
};

/**
 * Measure the time between two performance marks
 */
export const measurePerformance = (
  name: string,
  startMark: string,
  endMark?: string
): number | null => {
  if ('performance' in window && 'measure' in window.performance) {
    try {
      if (endMark) {
        window.performance.measure(name, startMark, endMark);
      } else {
        window.performance.measure(name, startMark);
      }
      const measure = window.performance.getEntriesByName(name)[0];
      return measure ? measure.duration : null;
    } catch (e) {
      console.warn(`Failed to measure performance: ${name}`, e);
      return null;
    }
  }
  return null;
};

/**
 * Clear performance marks and measures
 */
export const clearPerformanceMarks = (name?: string): void => {
  if ('performance' in window) {
    if (name) {
      window.performance.clearMarks(name);
      window.performance.clearMeasures(name);
    } else {
      window.performance.clearMarks();
      window.performance.clearMeasures();
    }
  }
};

// ============================================================================
// Resource Timing
// ============================================================================

/**
 * Get resource loading statistics
 */
export const getResourceStats = (): {
  total: number;
  byType: Record<string, number>;
  largestResources: Array<{ name: string; size: number; duration: number }>;
} => {
  if (!('performance' in window) || !('getEntriesByType' in window.performance)) {
    return { total: 0, byType: {}, largestResources: [] };
  }

  const resources = window.performance.getEntriesByType('resource') as PerformanceResourceTiming[];

  const byType: Record<string, number> = {};
  const resourceDetails: Array<{ name: string; size: number; duration: number }> = [];

  resources.forEach((resource) => {
    // Count by type
    const type = resource.initiatorType || 'other';
    byType[type] = (byType[type] || 0) + 1;

    // Collect resource details
    const size = resource.transferSize || 0;
    const duration = resource.duration || 0;
    resourceDetails.push({
      name: resource.name,
      size,
      duration,
    });
  });

  // Sort by size and get top 10
  const largestResources = resourceDetails
    .sort((a, b) => b.size - a.size)
    .slice(0, 10);

  return {
    total: resources.length,
    byType,
    largestResources,
  };
};

// ============================================================================
// Performance Budget Checking
// ============================================================================

export interface PerformanceBudget {
  maxBundleSize?: number; // KB
  maxLCP?: number; // ms
  maxFID?: number; // ms
  maxCLS?: number; // score
  maxTTFB?: number; // ms
}

/**
 * Check if current performance meets budget
 */
export const checkPerformanceBudget = (
  metrics: WebVitalsMetrics,
  budget: PerformanceBudget
): { passed: boolean; violations: string[] } => {
  const violations: string[] = [];

  if (budget.maxLCP && metrics.LCP && metrics.LCP.value > budget.maxLCP) {
    violations.push(`LCP ${metrics.LCP.value}ms exceeds budget of ${budget.maxLCP}ms`);
  }

  if (budget.maxFID && metrics.FID && metrics.FID.value > budget.maxFID) {
    violations.push(`FID ${metrics.FID.value}ms exceeds budget of ${budget.maxFID}ms`);
  }

  if (budget.maxCLS && metrics.CLS && metrics.CLS.value > budget.maxCLS) {
    violations.push(`CLS ${metrics.CLS.value} exceeds budget of ${budget.maxCLS}`);
  }

  if (budget.maxTTFB && metrics.TTFB && metrics.TTFB.value > budget.maxTTFB) {
    violations.push(`TTFB ${metrics.TTFB.value}ms exceeds budget of ${budget.maxTTFB}ms`);
  }

  return {
    passed: violations.length === 0,
    violations,
  };
};

// ============================================================================
// Development Helpers
// ============================================================================

/**
 * Log performance metrics to console (development only)
 */
export const logPerformanceMetrics = (metrics: WebVitalsMetrics): void => {
  if (process.env.NODE_ENV !== 'development') return;

  console.group('🚀 Performance Metrics');
  Object.entries(metrics).forEach(([key, metric]) => {
    if (metric) {
      const icon = metric.rating === 'good' ? '✅' : metric.rating === 'needs-improvement' ? '⚠️' : '❌';
      console.log(`${icon} ${key}: ${metric.value.toFixed(2)}${metric.unit} (${metric.rating})`);
    }
  });
  console.groupEnd();
};

/**
 * Initialize performance monitoring in development
 */
export const initPerformanceMonitoring = (): void => {
  if (process.env.NODE_ENV === 'development') {
    monitorWebVitals((metrics) => {
      logPerformanceMetrics(metrics);
    });
  }
};

