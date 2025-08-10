// Performance monitoring utilities
import React from 'react';

// Track component render times
export const withPerformanceTracking = (WrappedComponent, componentName) => {
  return React.forwardRef((props, ref) => {
    const renderStartTime = performance.now();
    
    React.useEffect(() => {
      const renderEndTime = performance.now();
      const renderTime = renderEndTime - renderStartTime;
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`${componentName} render time: ${renderTime.toFixed(2)}ms`);
        
        // Log slow renders (>16ms for 60fps)
        if (renderTime > 16) {
          console.warn(`Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
        }
      }
    });
    
    return React.createElement(WrappedComponent, { ...props, ref });
  });
};

// Hook to measure component render performance
export const useRenderPerformance = (componentName) => {
  const renderStartTime = React.useRef(performance.now());
  const renderCount = React.useRef(0);
  
  React.useEffect(() => {
    renderCount.current += 1;
    const renderEndTime = performance.now();
    const renderTime = renderEndTime - renderStartTime.current;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`${componentName} render #${renderCount.current}: ${renderTime.toFixed(2)}ms`);
      
      if (renderTime > 16) {
        console.warn(`Slow render in ${componentName}: ${renderTime.toFixed(2)}ms`);
      }
    }
    
    // Reset for next render
    renderStartTime.current = performance.now();
  });
  
  return { renderCount: renderCount.current };
};

// Track API call performance
export const trackAPIPerformance = async (apiCall, operationName) => {
  const startTime = performance.now();
  
  try {
    const result = await apiCall();
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`API ${operationName}: ${duration.toFixed(2)}ms`);
      
      // Log slow API calls (>1000ms)
      if (duration > 1000) {
        console.warn(`Slow API call detected - ${operationName}: ${duration.toFixed(2)}ms`);
      }
    }
    
    // Track in performance observer if available
    if (window.performance && window.performance.mark) {
      window.performance.mark(`api-${operationName}-start`);
      window.performance.mark(`api-${operationName}-end`);
      window.performance.measure(`api-${operationName}`, `api-${operationName}-start`, `api-${operationName}-end`);
    }
    
    return result;
  } catch (error) {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    if (process.env.NODE_ENV === 'development') {
      console.error(`API ${operationName} failed after ${duration.toFixed(2)}ms:`, error);
    }
    
    throw error;
  }
};

// Monitor bundle size and loading performance
export const trackLoadingPerformance = () => {
  if (typeof window !== 'undefined' && window.performance) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = window.performance.getEntriesByType('navigation')[0];
        
        if (perfData) {
          const metrics = {
            domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
            loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
            totalLoadTime: perfData.loadEventEnd - perfData.fetchStart,
            dnsLookup: perfData.domainLookupEnd - perfData.domainLookupStart,
            tcpConnection: perfData.connectEnd - perfData.connectStart,
            serverResponse: perfData.responseEnd - perfData.requestStart,
            domProcessing: perfData.domComplete - perfData.domLoading,
          };
          
          if (process.env.NODE_ENV === 'development') {
            console.group('Loading Performance Metrics');
            Object.entries(metrics).forEach(([key, value]) => {
              console.log(`${key}: ${value.toFixed(2)}ms`);
            });
            console.groupEnd();
            
            // Warn about slow loading
            if (metrics.totalLoadTime > 3000) {
              console.warn(`Slow page load detected: ${metrics.totalLoadTime.toFixed(2)}ms`);
            }
          }
        }
      }, 0);
    });
  }
};

// Memory usage monitoring
export const trackMemoryUsage = () => {
  if (process.env.NODE_ENV === 'development' && window.performance && window.performance.memory) {
    const memory = window.performance.memory;
    
    console.group('Memory Usage');
    console.log(`Used: ${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Total: ${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Limit: ${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`);
    console.groupEnd();
    
    // Warn about high memory usage
    const usagePercentage = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
    if (usagePercentage > 80) {
      console.warn(`High memory usage detected: ${usagePercentage.toFixed(2)}%`);
    }
  }
};

// Performance observer for Core Web Vitals
export const observeWebVitals = () => {
  if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
    // Largest Contentful Paint (LCP)
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`LCP: ${lastEntry.startTime.toFixed(2)}ms`);
        
        if (lastEntry.startTime > 2500) {
          console.warn(`Poor LCP detected: ${lastEntry.startTime.toFixed(2)}ms (should be < 2.5s)`);
        }
      }
    });
    
    try {
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      // LCP not supported
    }
    
    // First Input Delay (FID) - approximated with first-input
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        const fid = entry.processingStart - entry.startTime;
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`FID: ${fid.toFixed(2)}ms`);
          
          if (fid > 100) {
            console.warn(`Poor FID detected: ${fid.toFixed(2)}ms (should be < 100ms)`);
          }
        }
      });
    });
    
    try {
      fidObserver.observe({ entryTypes: ['first-input'] });
    } catch (e) {
      // FID not supported
    }
  }
};

// Initialize performance monitoring
export const initPerformanceMonitoring = () => {
  if (process.env.NODE_ENV === 'development') {
    trackLoadingPerformance();
    observeWebVitals();
    
    // Track memory usage every 30 seconds
    setInterval(trackMemoryUsage, 30000);
    
    console.log('Performance monitoring initialized');
  }
};
