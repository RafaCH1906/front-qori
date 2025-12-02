import { Platform, Dimensions, PixelRatio } from 'react-native';

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

export function isMobileDevice(): boolean {
  // For native platforms, always return true for mobile
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    return true;
  }

  // For web, check multiple indicators
  if (Platform.OS === 'web') {
    // Check if running in browser
    if (typeof window === 'undefined') {
      return false;
    }

    // Check user agent for mobile devices
    const userAgent = window.navigator.userAgent.toLowerCase();
    const mobileKeywords = [
      'android',
      'webos',
      'iphone',
      'ipad',
      'ipod',
      'blackberry',
      'windows phone',
      'mobile',
    ];

    const isMobileUserAgent = mobileKeywords.some(keyword =>
      userAgent.includes(keyword)
    );

    // Check for touch support (most mobile devices)
    const isTouchDevice = 'ontouchstart' in window ||
      navigator.maxTouchPoints > 0;

    // Check screen width (physical device width, not viewport)
    const screenWidth = window.screen.width;
    const hasSmallScreen = screenWidth < 768;

    // If any mobile indicator is true, consider it mobile
    return isMobileUserAgent || (isTouchDevice && hasSmallScreen);
  }

  return false;
}

/**
 * Determines the current device type based on width and platform
 */
export function getDeviceType(width: number): DeviceType {
  const isMobile = isMobileDevice();

  if (isMobile) {
    // Distinguish between mobile phone and tablet based on width
    return width >= 768 ? 'tablet' : 'mobile';
  }

  // For web/desktop
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

/**
 * Gets the appropriate breakpoint for desktop/mobile layout
 * Takes into account whether we're on a mobile device
 */
export function getResponsiveBreakpoint(): number {
  const isMobile = isMobileDevice();

  // If on mobile device, use a much higher breakpoint
  // This ensures mobile devices always get mobile layout
  if (isMobile) {
    return 99999; // Effectively infinity for mobile devices
  }

  // For desktop/tablet, use standard breakpoint
  return 900;
}

/**
 * Hook-friendly function to determine if should use large screen layout
 */
export function shouldUseLargeScreenLayout(windowWidth: number): boolean {
  const deviceType = getDeviceType(windowWidth);
  return deviceType === 'desktop';
}
