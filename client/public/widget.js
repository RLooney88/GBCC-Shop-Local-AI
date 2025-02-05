(function() {
  // Create and inject styles
  const styles = document.createElement('style');
  styles.textContent = `
    #shop-local-assistant {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 2147483647;
      width: 400px;
      height: 600px;
      max-height: 90vh;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    }

    #shop-local-assistant iframe {
      border: none;
      width: 100%;
      height: 100%;
      border-radius: 12px;
      background: white;
      box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 6px -1px, rgba(0, 0, 0, 0.06) 0px 2px 4px -1px;
      transition: opacity 0.3s ease;
      transform: translateZ(0);
      -webkit-transform: translateZ(0);
      -webkit-backface-visibility: hidden;
    }

    @media (max-width: 480px) {
      #shop-local-assistant {
        width: 100% !important;
        height: 100vh !important;
        max-height: 100vh !important;
        bottom: 0 !important;
        right: 0 !important;
        margin: 0 !important;
      }

      #shop-local-assistant iframe {
        border-radius: 0 !important;
      }
    }
  `;
  document.head.appendChild(styles);

  // Create container div
  const container = document.createElement('div');
  container.id = 'shop-local-assistant';

  // Create iframe
  const iframe = document.createElement('iframe');
  iframe.src = "https://ai-local-buddy-rlooney.replit.app";
  iframe.title = 'Shop Local Assistant Chat';
  iframe.setAttribute('allow', 'microphone');

  // Handle iframe loading
  iframe.onload = function() {
    iframe.style.display = 'block';
    setTimeout(() => {
      iframe.classList.add('loaded');
    }, 100);
  };

  // Error handling
  iframe.onerror = function() {
    console.error('Failed to load Shop Local Assistant');
    if (container) {
      container.innerHTML = '<div style="color: #666; text-align: center; padding: 20px;">Unable to load chat assistant</div>';
    }
  };

  // Add iframe to container
  container.appendChild(iframe);

  // Add container to body
  document.body.appendChild(container);

  // Add window message listener for potential future cross-origin communication
  window.addEventListener('message', function(event) {
    if (event.origin === window.location.origin) {
      // Handle any messages from the chat widget
      console.log('Message received from chat widget:', event.data);
    }
  }, false);
})();