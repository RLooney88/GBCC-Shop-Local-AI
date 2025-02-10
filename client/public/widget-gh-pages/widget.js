(() => {
  // Create styles
  const styles = document.createElement('style');
  styles.textContent = `
    .shop-local-widget {
      position: fixed;
      bottom: 0;
      right: 0;
      width:100vw;
      height: 100vh;
      background: transparent;
      z-index: 2147483647;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
      pointer-events: all
    }
  `;
  document.head.appendChild(styles);

  // Create iframe for chat content
  const iframe = document.createElement('iframe');
  iframe.src = 'https://ai-local-buddy-1-rlooney.replit.app';
  iframe.className = 'shop-local-widget';
  iframe.title = 'Shop Local Assistant Chat';
  iframe.setAttribute('loading', 'lazy');
  iframe.setAttribute(
    'sandbox',
    'allow-same-origin allow-scripts allow-forms allow-popups'
  );
  document.body.appendChild(iframe);
})();
