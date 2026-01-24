import { useEffect } from 'react';

/**
 * Component to handle external links in WebView
 * Opens external links in device browser (Safari/Chrome) instead of WebView
 * Required for Apple App Store compliance
 */
export default function ExternalLinkHandler() {
  useEffect(() => {
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
          
          // Open in device browser
          window.open(href, '_blank', 'noopener,noreferrer');
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