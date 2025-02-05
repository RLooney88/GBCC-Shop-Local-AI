// Shop Local Assistant Widget
(function() {
  // Create styles
  const styles = document.createElement('style');
  styles.textContent = `
    .shop-local-widget-button {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 60px;
      height: 60px;
      border-radius: 30px;
      background: #00A7B7;
      color: white;
      border: none;
      cursor: pointer;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s ease;
      z-index: 2147483647;
    }

    .shop-local-widget-button:hover {
      transform: scale(1.1);
      background: #008A99;
    }

    .shop-local-widget-button svg {
      width: 24px;
      height: 24px;
    }

    .shop-local-chat-container {
      position: fixed;
      bottom: 90px;
      right: 20px;
      width: 400px;
      height: 600px;
      max-height: calc(100vh - 100px);
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      display: none;
      flex-direction: column;
      overflow: hidden;
      z-index: 2147483647;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    }

    .shop-local-chat-container.open {
      display: flex;
    }

    .shop-local-chat-header {
      background: #00A7B7;
      color: white;
      padding: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .shop-local-chat-header h2 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }

    .shop-local-chat-close {
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0.8;
      transition: opacity 0.2s ease;
    }

    .shop-local-chat-close:hover {
      opacity: 1;
    }

    .shop-local-chat-content {
      flex: 1;
      overflow: hidden;
      position: relative;
    }

    @media (max-width: 480px) {
      .shop-local-chat-container {
        width: 100%;
        height: calc(100% - 20px);
        max-height: none;
        bottom: 0;
        right: 0;
        border-radius: 0;
      }

      .shop-local-widget-button {
        bottom: 20px;
        right: 20px;
      }
    }
  `;

  // Inject styles
  document.head.appendChild(styles);

  // Create chat button with message icon
  const button = document.createElement('button');
  button.className = 'shop-local-widget-button';
  button.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
    </svg>
  `;

  // Create chat container
  const container = document.createElement('div');
  container.className = 'shop-local-chat-container';
  container.innerHTML = `
    <div class="shop-local-chat-header">
      <h2>The Shop Local Assistant</h2>
      <button class="shop-local-chat-close">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
    <div class="shop-local-chat-content">
      <div id="shop-local-root"></div>
    </div>
  `;

  // Add button and container to body
  document.body.appendChild(button);
  document.body.appendChild(container);

  // Initialize React app
  const script = document.createElement('script');
  script.type = 'module';
  script.src = 'https://ai-local-buddy-rlooney.replit.app/src/main.tsx';
  document.head.appendChild(script);

  // Toggle chat visibility
  button.addEventListener('click', () => {
    container.classList.toggle('open'); //Corrected to toggle
  });

  container.querySelector('.shop-local-chat-close').addEventListener('click', () => {
    container.classList.remove('open');
  });

  // Listen for messages from the React app
  window.addEventListener('message', (event) => {
    // Add any custom message handling here
    console.log('Message from chat:', event.data);
  });
})();