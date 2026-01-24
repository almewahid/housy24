import { useEffect } from 'react';

/**
 * Component to handle external links in WebView
 * Opens external links in device browser (Safari/Chrome) instead of WebView
 * Required for Apple App Store compliance
 */
export default function ExternalLinkHandler() {
  useEffect(() => {
    // Detect iOS WebView
    const isIOSWebView = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isIOS = /iphone|ipad|ipod/.test(userAgent);
      const isWebView = !/(safari|crios|fxios)/.test(userAgent) && isIOS;
      return isWebView;
    };

    // Disable Service Worker in iOS WebView only
    if (isIOSWebView() && 'serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          registration.unregister();
        });
      });
    }

    const handleClick = (e) => {
      const target = e.target.closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      if (!href) return;

      // Check if it's an external link
      try {
        const currentDomain = window.location.hostname;
        const url = new URL(href, window.location.origin);
        
        // If external domain, prevent default and open in browser
        if (url.hostname !== currentDomain && (url.protocol === 'http:' || url.protocol === 'https:')) {
          e.preventDefault();
          
          // For iOS WebView, open in device browser using location.href
          if (isIOSWebView()) {
            window.location.href = href;
          } else {
            // For web and other platforms, open in new tab
            window.open(href, '_blank', 'noopener,noreferrer');
          }
        }
      } catch (error) {
        // If URL parsing fails, let it proceed normally
        console.error('Error parsing URL:', error);
      }
    };

    // Add event listener to document
    document.addEventListener('click', handleClick, true);

    // Cleanup
    return () => {
      document.removeEventListener('click', handleClick, true);
    };
  }, []);

  return null; // This component doesn't render anything
}