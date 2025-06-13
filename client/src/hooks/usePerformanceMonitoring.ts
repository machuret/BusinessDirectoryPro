import { useEffect, useCallback } from 'react';

interface PerformanceMetrics {
  lcp?: number;
  fid?: number;
  cls?: number;
  ttfb?: number;
  fcp?: number;
}

interface PerformanceOptions {
  reportUrl?: string;
  sampleRate?: number;
  debug?: boolean;
}

export function usePerformanceMonitoring(options: PerformanceOptions = {}) {
  const { reportUrl = '/api/analytics/performance', sampleRate = 0.1, debug = false } = options;

  const reportMetric = useCallback(
    (metric: { name: string; value: number; rating: string }) => {
      // Only sample a percentage of users for performance tracking
      if (Math.random() > sampleRate) return;

      if (debug) {
        console.log('Performance Metric:', metric);
      }

      // Send to analytics endpoint
      fetch(reportUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...metric,
          url: window.location.href,
          timestamp: Date.now(),
          userAgent: navigator.userAgent,
        }),
      }).catch(() => {
        // Silently fail to avoid impacting user experience
      });
    },
    [reportUrl, sampleRate, debug]
  );

  useEffect(() => {
    // Largest Contentful Paint (LCP)
    const observeLCP = () => {
      if ('PerformanceObserver' in window) {
        try {
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            const lcp = lastEntry.startTime;
            
            let rating = 'good';
            if (lcp > 4000) rating = 'poor';
            else if (lcp > 2500) rating = 'needs-improvement';

            reportMetric({ name: 'LCP', value: lcp, rating });
          });
          
          observer.observe({ entryTypes: ['largest-contentful-paint'] });
        } catch (e) {
          // Observer not supported
        }
      }
    };

    // First Input Delay (FID)
    const observeFID = () => {
      if ('PerformanceObserver' in window) {
        try {
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry: any) => {
              const fid = entry.processingStart - entry.startTime;
              
              let rating = 'good';
              if (fid > 300) rating = 'poor';
              else if (fid > 100) rating = 'needs-improvement';

              reportMetric({ name: 'FID', value: fid, rating });
            });
          });
          
          observer.observe({ entryTypes: ['first-input'] });
        } catch (e) {
          // Observer not supported
        }
      }
    };

    // Cumulative Layout Shift (CLS)
    const observeCLS = () => {
      if ('PerformanceObserver' in window) {
        try {
          let clsValue = 0;
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry: any) => {
              if (!entry.hadRecentInput) {
                clsValue += entry.value;
              }
            });
          });
          
          observer.observe({ entryTypes: ['layout-shift'] });

          // Report CLS when page is hidden
          const reportCLS = () => {
            let rating = 'good';
            if (clsValue > 0.25) rating = 'poor';
            else if (clsValue > 0.1) rating = 'needs-improvement';

            reportMetric({ name: 'CLS', value: clsValue, rating });
          };

          window.addEventListener('beforeunload', reportCLS);
          document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
              reportCLS();
            }
          });
        } catch (e) {
          // Observer not supported
        }
      }
    };

    // Time to First Byte (TTFB)
    const measureTTFB = () => {
      if ('navigation' in performance && 'timing' in performance) {
        const navigationTiming = performance.timing;
        const ttfb = navigationTiming.responseStart - navigationTiming.requestStart;
        
        let rating = 'good';
        if (ttfb > 1500) rating = 'poor';
        else if (ttfb > 800) rating = 'needs-improvement';

        reportMetric({ name: 'TTFB', value: ttfb, rating });
      }
    };

    // First Contentful Paint (FCP)
    const observeFCP = () => {
      if ('PerformanceObserver' in window) {
        try {
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry) => {
              const fcp = entry.startTime;
              
              let rating = 'good';
              if (fcp > 3000) rating = 'poor';
              else if (fcp > 1800) rating = 'needs-improvement';

              reportMetric({ name: 'FCP', value: fcp, rating });
            });
          });
          
          observer.observe({ entryTypes: ['paint'] });
        } catch (e) {
          // Observer not supported
        }
      }
    };

    // Initialize observers
    observeLCP();
    observeFID();
    observeCLS();
    observeFCP();
    measureTTFB();

    // Track page load time
    window.addEventListener('load', () => {
      const loadTime = performance.now();
      let rating = 'good';
      if (loadTime > 4000) rating = 'poor';
      else if (loadTime > 2000) rating = 'needs-improvement';

      reportMetric({ name: 'PageLoad', value: loadTime, rating });
    });

  }, [reportMetric]);

  const trackInteraction = useCallback(
    (interactionName: string, startTime: number) => {
      const duration = performance.now() - startTime;
      let rating = 'good';
      if (duration > 500) rating = 'poor';
      else if (duration > 200) rating = 'needs-improvement';

      reportMetric({ name: `Interaction_${interactionName}`, value: duration, rating });
    },
    [reportMetric]
  );

  return { trackInteraction };
}