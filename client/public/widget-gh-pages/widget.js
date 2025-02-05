(() => {
  // Create styles
  const styles = document.createElement('style');
  styles.textContent = `
    .shop-local-widget {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 2147483647;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
    }

    .shop-local-button {
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
    }

    .shop-local-button:hover {
      transform: scale(1.1);
      background: #008A99;
    }

    .shop-local-chat {
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
      overflow: hidden;
    }

    .shop-local-chat.open {
      display: block;
    }

    @media (max-width: 480px) {
      .shop-local-chat {
        width: 100%;
        height: 100vh;
        max-height: 100vh;
        bottom: 0;
        right: 0;
        border-radius: 0;
      }
    }
  `;
  document.head.appendChild(styles);

  // Create widget elements
  const widget = document.createElement('div');
  widget.className = 'shop-local-widget';

  const button = document.createElement('button');
  button.className = 'shop-local-button';
  button.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
    </svg>
  `;

  const chat = document.createElement('div');
  chat.className = 'shop-local-chat';

  // Create iframe for chat content
  const iframe = document.createElement('iframe');
  iframe.src = 'https://ai-local-buddy-rlooney.replit.app';
  iframe.style.cssText = `
    border: none;
    width: 100%;
    height: 100%;
    border-radius: inherit;
  `;

  // Add elements to the page
  chat.appendChild(iframe);
  widget.appendChild(button);
  widget.appendChild(chat);
  document.body.appendChild(widget);

  // Add event listeners
  button.addEventListener('click', () => {
    chat.classList.toggle('open');
    button.style.transform = chat.classList.contains('open') ? 'scale(0)' : 'scale(1)';
  });
})();
