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
    }
  `;
  document.head.appendChild(styles);

  // Create iframe
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none'; // Hide initially
  iframe.onload = function() {
    iframe.style.display = 'block'; // Show when loaded
  };
  
  // Get the current script's domain
  const scriptElement = document.getElementById('shop-local-assistant-script');
  const scriptDomain = new URL(scriptElement.src).origin;
  
  // Set iframe source to the chat application
  iframe.src = `${scriptDomain}/`;
  
  // Add iframe to the container
  const container = document.getElementById('shop-local-assistant');
  if (container) {
    container.appendChild(iframe);
  }
})();
