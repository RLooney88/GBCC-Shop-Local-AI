(function() {
  // Create and inject styles
  const styles = document.createElement('style');
  styles.textContent = `
    #shop-local-assistant {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 9999;
    }

    #shop-local-assistant iframe {
      border: none;
      width: 400px;
      height: 600px;
      max-height: 90vh;
      border-radius: 10px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    #shop-local-assistant iframe.loaded {
      opacity: 1;
    }

    @media (max-width: 480px) {
      #shop-local-assistant iframe {
        width: 100vw;
        height: 100vh;
        max-height: 100vh;
        position: fixed;
        bottom: 0;
        right: 0;
        border-radius: 0;
      }
    }
  `;
  document.head.appendChild(styles);

  // Create iframe
  const iframe = document.createElement('iframe');

  // Set iframe attributes
  iframe.style.display = 'none';
  iframe.setAttribute('title', 'Shop Local Assistant Chat');
  iframe.setAttribute('aria-label', 'Shop Local Assistant Chat Interface');

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
    const container = document.getElementById('shop-local-assistant');
    if (container) {
      container.innerHTML = '<div style="color: #666; text-align: center; padding: 20px;">Unable to load chat assistant</div>';
    }
  };

  // Set iframe source to the chat application
  iframe.src = 'https://chamber.prmthe.us/';

  // Add iframe to the container
  const container = document.getElementById('shop-local-assistant');
  if (container) {
    container.appendChild(iframe);
  }

  // Add window message listener for potential future cross-origin communication
  window.addEventListener('message', function(event) {
    if (event.origin === 'https://chamber.prmthe.us') {
      // Handle any messages from the chat widget
      console.log('Message received from chat widget:', event.data);
    }
  }, false);
})();