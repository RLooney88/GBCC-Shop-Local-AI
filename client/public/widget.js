// Shop Local Assistant Widget
(function() {
  // Create the root element for our React app
  const root = document.createElement('div');
  root.id = 'shop-local-root';
  document.body.appendChild(root);

  // Create and append styles
  const styles = document.createElement('style');
  styles.textContent = `
    .shop-local-widget {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 2147483647;
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
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    }

    .shop-local-chat.open {
      display: block;
    }

    .shop-local-header {
      background: #00A7B7;
      color: white;
      padding: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .shop-local-header h2 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }

    .shop-local-close {
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      padding: 4px;
      opacity: 0.8;
      transition: opacity 0.2s ease;
    }

    .shop-local-close:hover {
      opacity: 1;
    }

    .shop-local-content {
      height: calc(100% - 56px);
      overflow: auto;
      padding: 16px;
    }

    .shop-local-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .shop-local-input {
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 14px;
    }

    .shop-local-button-submit {
      background: #00A7B7;
      color: white;
      border: none;
      padding: 10px;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
      transition: background 0.2s ease;
    }

    .shop-local-button-submit:hover {
      background: #008A99;
    }

    @media (max-width: 480px) {
      .shop-local-chat {
        width: 100%;
        height: 100vh;
        bottom: 0;
        right: 0;
        border-radius: 0;
      }
    }
  `;
  document.head.appendChild(styles);

  // Create the widget elements
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
  chat.innerHTML = `
    <div class="shop-local-header">
      <h2>The Shop Local Assistant</h2>
      <button class="shop-local-close">✕</button>
    </div>
    <div class="shop-local-content">
      <form class="shop-local-form">
        <input type="text" class="shop-local-input" placeholder="Your name" required>
        <input type="email" class="shop-local-input" placeholder="Your email" required>
        <button type="submit" class="shop-local-button-submit">Start Chat</button>
      </form>
    </div>
  `;

  // Add elements to the page
  widget.appendChild(button);
  widget.appendChild(chat);
  document.body.appendChild(widget);

  // Add event listeners
  button.addEventListener('click', () => {
    chat.classList.toggle('open');
  });

  chat.querySelector('.shop-local-close').addEventListener('click', () => {
    chat.classList.remove('open');
  });

  // Handle form submission
  const form = chat.querySelector('.shop-local-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = form.querySelector('input[type="text"]').value;
    const email = form.querySelector('input[type="email"]').value;

    try {
      const response = await fetch('https://ai-local-buddy-rlooney.replit.app/api/chat/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email })
      });

      if (!response.ok) {
        throw new Error('Failed to start chat');
      }

      const data = await response.json();
      // Initialize chat interface here with data.chatId
      chat.querySelector('.shop-local-content').innerHTML = `
        <div style="text-align: center;">
          <p>Welcome ${name}!</p>
          <p>Chat ID: ${data.chatId}</p>
          <!-- Add chat interface here -->
        </div>
      `;
    } catch (error) {
      console.error('Error starting chat:', error);
      alert('Failed to start chat. Please try again.');
    }
  });
})();