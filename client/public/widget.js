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
      z-index: 2147483648;
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
      max-height: calc(100vh - 120px);
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      display: none;
      overflow: hidden;
      transition: all 0.3s ease;
      flex-direction: column;
    }

    .shop-local-chat.open {
      display: flex;
      animation: chatFadeIn 0.3s ease;
    }

    .shop-local-header {
      background: #00A7B7;
      color: white;
      padding: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .shop-local-title {
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
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .shop-local-close:hover {
      opacity: 1;
    }

    .shop-local-content {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      background: #f8f9fa;
    }

    .shop-local-form {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .shop-local-input {
      padding: 10px 12px;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      font-size: 14px;
      background: white;
      transition: border-color 0.2s ease;
    }

    .shop-local-input:focus {
      outline: none;
      border-color: #00A7B7;
    }

    .shop-local-button-submit {
      background: #00A7B7;
      color: white;
      border: none;
      padding: 10px;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.2s ease;
    }

    .shop-local-button-submit:hover {
      background: #008A99;
    }

    .shop-local-button-submit:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    .shop-local-messages {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .shop-local-message {
      padding: 12px;
      border-radius: 8px;
      max-width: 80%;
      word-wrap: break-word;
      line-height: 1.4;
    }

    .shop-local-message.user {
      background: #00A7B7;
      color: white;
      align-self: flex-end;
    }

    .shop-local-message.assistant {
      background: white;
      color: #1a202c;
      align-self: flex-start;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }

    .shop-local-message-time {
      font-size: 11px;
      opacity: 0.7;
      margin-top: 4px;
      display: block;
    }

    .shop-local-input-container {
      padding: 16px;
      background: white;
      border-top: 1px solid #e2e8f0;
      display: flex;
      gap: 8px;
    }

    .shop-local-typing {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 8px;
      color: #4a5568;
      font-size: 13px;
    }

    .shop-local-typing-dot {
      width: 4px;
      height: 4px;
      background: currentColor;
      border-radius: 50%;
      animation: typing 1s infinite;
    }

    .shop-local-typing-dot:nth-child(2) { animation-delay: 0.2s; }
    .shop-local-typing-dot:nth-child(3) { animation-delay: 0.4s; }

    @keyframes typing {
      0%, 100% { opacity: 0.4; }
      50% { opacity: 1; }
    }

    @keyframes chatFadeIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @media (max-width: 480px) {
      .shop-local-widget {
        bottom: 0;
        right: 0;
        width: 100%;
      }

      .shop-local-button {
        bottom: 20px;
        right: 20px;
        position: fixed;
      }

      .shop-local-chat {
        width: 100%;
        height: 100vh;
        max-height: 100vh;
        bottom: 0;
        right: 0;
        border-radius: 0;
      }

      .shop-local-chat.open {
        animation: chatSlideUp 0.3s ease;
      }

      @keyframes chatSlideUp {
        from {
          transform: translateY(100%);
        }
        to {
          transform: translateY(0);
        }
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

  // Create chat header
  const header = document.createElement('div');
  header.className = 'shop-local-header';
  header.innerHTML = `
    <h2 class="shop-local-title">Shop Local Assistant</h2>
    <button class="shop-local-close">✕</button>
  `;

  // Create chat content
  const content = document.createElement('div');
  content.className = 'shop-local-content';

  // Initial form for user details
  const form = document.createElement('form');
  form.className = 'shop-local-form';
  form.innerHTML = `
    <input type="text" class="shop-local-input" placeholder="Your name" required>
    <input type="email" class="shop-local-input" placeholder="Your email" required>
    <button type="submit" class="shop-local-button-submit">Start Chat</button>
  `;

  content.appendChild(form);
  chat.appendChild(header);
  chat.appendChild(content);

  // Add elements to the page
  widget.appendChild(button);
  widget.appendChild(chat);
  document.body.appendChild(widget);

  let chatId = null;
  const apiBase = 'https://ai-local-buddy-rlooney.replit.app';

  // Handle chat visibility
  button.addEventListener('click', () => {
    chat.classList.toggle('open');
    button.style.transform = chat.classList.contains('open') ? 'scale(0)' : 'scale(1)';
  });

  // Handle close button
  header.querySelector('.shop-local-close').addEventListener('click', () => {
    chat.classList.remove('open');
    button.style.transform = 'scale(1)';
  });

  // Handle escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && chat.classList.contains('open')) {
      chat.classList.remove('open');
      button.style.transform = 'scale(1)';
    }
  });

  // Handle form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nameInput = form.querySelector('input[type="text"]');
    const emailInput = form.querySelector('input[type="email"]');
    const submitButton = form.querySelector('button');

    try {
      submitButton.disabled = true;
      const response = await fetch(`${apiBase}/api/chat/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: nameInput.value,
          email: emailInput.value
        })
      });

      if (!response.ok) throw new Error('Failed to start chat');
      const data = await response.json();
      chatId = data.chatId;

      // Switch to chat interface
      content.innerHTML = `
        <div class="shop-local-messages"></div>
        <div class="shop-local-input-container">
          <input type="text" class="shop-local-input" placeholder="Type your message..." style="flex: 1">
          <button class="shop-local-button-submit" style="padding: 10px 16px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      `;

      // Initialize chat with welcome message
      addMessage('assistant', 'Hi! What kind of business are you looking for?');

      // Set up message input handling
      const messageInput = content.querySelector('.shop-local-input');
      const sendButton = content.querySelector('.shop-local-button-submit');

      async function sendMessage() {
        const message = messageInput.value.trim();
        if (!message) return;

        messageInput.value = '';
        messageInput.disabled = true;
        sendButton.disabled = true;

        addMessage('user', message);
        showTyping();

        try {
          const response = await fetch(`${apiBase}/api/chat/message`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chatId, message })
          });

          if (!response.ok) throw new Error('Failed to send message');
          const data = await response.json();

          hideTyping();
          addMessage('assistant', data.message);

          if (data.businesses && !data.isClosing) {
            const business = data.businesses;
            addMessage('assistant', formatBusinessInfo(business));
          }
        } catch (error) {
          console.error('Error sending message:', error);
          hideTyping();
          addMessage('assistant', 'Sorry, there was an error. Please try again.');
        } finally {
          messageInput.disabled = false;
          sendButton.disabled = false;
          messageInput.focus();
        }
      }

      sendButton.addEventListener('click', sendMessage);
      messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          sendMessage();
        }
      });

    } catch (error) {
      console.error('Error starting chat:', error);
      submitButton.disabled = false;
      alert('Failed to start chat. Please try again.');
    }
  });

  function addMessage(role, content) {
    const messages = content.querySelector('.shop-local-messages');
    const message = document.createElement('div');
    message.className = `shop-local-message ${role}`;
    message.innerHTML = `
      ${content}
      <span class="shop-local-message-time">${new Date().toLocaleTimeString()}</span>
    `;
    messages.appendChild(message);
    messages.scrollTop = messages.scrollHeight;
  }

  function showTyping() {
    const messages = content.querySelector('.shop-local-messages');
    const typing = document.createElement('div');
    typing.className = 'shop-local-typing';
    typing.innerHTML = `
      <div class="shop-local-typing-dot"></div>
      <div class="shop-local-typing-dot"></div>
      <div class="shop-local-typing-dot"></div>
    `;
    messages.appendChild(typing);
    messages.scrollTop = messages.scrollHeight;
  }

  function hideTyping() {
    const typing = content.querySelector('.shop-local-typing');
    if (typing) typing.remove();
  }

  function formatBusinessInfo(business) {
    return `
      Here's the contact information for ${business.name}:
      ${business.phone ? `📞 ${business.phone}` : ''}
      ${business.email ? `📧 ${business.email}` : ''}
      ${business.website ? `🌐 ${business.website}` : ''}
    `.trim();
  }
})();