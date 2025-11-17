/**
 * Mobile Design Checker Utility
 * أداة فحص تصميم الموبايل
 * 
 * هذه الأداة تساعد في فحص وتحسين التصميم للهاتف
 */

export interface MobileCheckResult {
  element: string;
  issue: string;
  severity: 'error' | 'warning' | 'info';
  suggestion: string;
}

/**
 * Check if touch target is large enough (minimum 44px)
 */
export function checkTouchTarget(element: HTMLElement): MobileCheckResult | null {
  const rect = element.getBoundingClientRect();
  const minSize = 44; // Apple and Google recommend 44-48px
  
  if (rect.width < minSize || rect.height < minSize) {
    return {
      element: element.tagName,
      issue: `Touch target too small: ${Math.round(rect.width)}x${Math.round(rect.height)}px (minimum ${minSize}px)`,
      severity: 'error',
      suggestion: `Add min-h-[${minSize}px] min-w-[${minSize}px] to the element`
    };
  }
  
  return null;
}

/**
 * Check if spacing is adequate (minimum 8px)
 */
export function checkSpacing(element: HTMLElement, sibling: HTMLElement | null): MobileCheckResult | null {
  if (!sibling) return null;
  
  const rect1 = element.getBoundingClientRect();
  const rect2 = sibling.getBoundingClientRect();
  
  // Calculate distance between elements
  const distance = Math.abs(rect1.bottom - rect2.top) || Math.abs(rect1.right - rect2.left);
  const minSpacing = 8; // Minimum spacing between interactive elements
  
  if (distance < minSpacing && distance > 0) {
    return {
      element: element.tagName,
      issue: `Spacing too small: ${Math.round(distance)}px (minimum ${minSpacing}px)`,
      severity: 'warning',
      suggestion: `Add gap-2 sm:gap-3 or mb-2 sm:mb-3 to increase spacing`
    };
  }
  
  return null;
}

/**
 * Check if text is readable (minimum 14px)
 */
export function checkTextSize(element: HTMLElement): MobileCheckResult | null {
  const computedStyle = window.getComputedStyle(element);
  const fontSize = parseFloat(computedStyle.fontSize);
  const minSize = 14; // Minimum readable text size
  
  if (fontSize < minSize) {
    return {
      element: element.tagName,
      issue: `Text too small: ${fontSize}px (minimum ${minSize}px)`,
      severity: 'warning',
      suggestion: `Use text-sm sm:text-base (14px-16px) for better readability`
    };
  }
  
  return null;
}

/**
 * Check if input fields are large enough
 */
export function checkInputSize(element: HTMLElement): MobileCheckResult | null {
  if (element.tagName !== 'INPUT' && element.tagName !== 'TEXTAREA') return null;
  
  const rect = element.getBoundingClientRect();
  const minHeight = 44; // Minimum height for input fields
  
  if (rect.height < minHeight) {
    return {
      element: element.tagName,
      issue: `Input field too small: ${Math.round(rect.height)}px (minimum ${minHeight}px)`,
      severity: 'error',
      suggestion: `Add h-11 sm:h-12 (44px-48px) to the input field`
    };
  }
  
  return null;
}

/**
 * Run all mobile checks on an element
 */
export function runMobileChecks(element: HTMLElement): MobileCheckResult[] {
  const results: MobileCheckResult[] = [];
  
  // Check if it's an interactive element
  const isInteractive = element.tagName === 'BUTTON' || 
                       element.tagName === 'A' || 
                       element.hasAttribute('role') && element.getAttribute('role') === 'button';
  
  if (isInteractive) {
    const touchCheck = checkTouchTarget(element);
    if (touchCheck) results.push(touchCheck);
  }
  
  // Check text size
  if (element.textContent && element.textContent.trim().length > 0) {
    const textCheck = checkTextSize(element);
    if (textCheck) results.push(textCheck);
  }
  
  // Check input size
  const inputCheck = checkInputSize(element);
  if (inputCheck) results.push(inputCheck);
  
  return results;
}

/**
 * Get mobile viewport info
 */
export function getMobileViewportInfo() {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
    devicePixelRatio: window.devicePixelRatio,
    isMobile: window.innerWidth < 640,
    isTablet: window.innerWidth >= 640 && window.innerWidth < 1024,
    isDesktop: window.innerWidth >= 1024,
    viewportHeight: window.visualViewport?.height || window.innerHeight,
    safeAreaInsets: {
      top: CSS.supports('padding-top: env(safe-area-inset-top)') ? 0 : 0,
      bottom: CSS.supports('padding-bottom: env(safe-area-inset-bottom)') ? 0 : 0,
    }
  };
}

/**
 * Log mobile design issues to console (for development)
 */
export function logMobileIssues(componentName: string) {
  if (typeof window === 'undefined' || process.env.NODE_ENV === 'production') return;
  
  const viewport = getMobileViewportInfo();
  console.group(`📱 Mobile Design Check: ${componentName}`);
  console.log('Viewport:', viewport);
  
  // Check all interactive elements
  const interactiveElements = document.querySelectorAll('button, a, [role="button"], input, textarea');
  const issues: MobileCheckResult[] = [];
  
  interactiveElements.forEach((el) => {
    const results = runMobileChecks(el as HTMLElement);
    issues.push(...results);
  });
  
  if (issues.length > 0) {
    console.warn('⚠️ Found mobile design issues:');
    issues.forEach(issue => {
      console[issue.severity === 'error' ? 'error' : 'warn'](
        `[${issue.severity.toUpperCase()}] ${issue.element}: ${issue.issue}`,
        `\n💡 Suggestion: ${issue.suggestion}`
      );
    });
  } else {
    console.log('✅ No mobile design issues found!');
  }
  
  console.groupEnd();
}

