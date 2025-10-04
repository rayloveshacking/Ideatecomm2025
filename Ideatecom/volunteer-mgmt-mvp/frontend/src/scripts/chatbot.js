(() => {
  const CONFIG = {
    endpoint: '/api/chatbot',
    historyLimit: 10,
    greeting: "Hi there! I'm the Anchor assistant. Ask me anything about volunteering, onboarding, or how to support your cycling buddy.",
    busyMessage: 'Anchor Assistant is thinking...'
  };

  const sanitize = (value) => {
    if (typeof value !== 'string') {
      return '';
    }
    return value.replace(/[&<>"']/g, (char) => {
      const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      };
      return map[char] || char;
    });
  };

  const buildMarkup = () => {
    if (!document.body || document.querySelector('[data-anchor-chatbot]')) {
      return null;
    }

    const wrapper = document.createElement('div');
    wrapper.className = 'chatbot';
    wrapper.setAttribute('data-anchor-chatbot', 'true');
    wrapper.innerHTML = `
      <button id="chatbot-toggle" class="chatbot__toggle" type="button" aria-haspopup="dialog" aria-expanded="false" aria-label="Open Anchor assistant chat">
        <i class="fa-solid fa-robot"></i>
        <span class="chatbot__toggle-text">Ask Anchor</span>
      </button>
      <section id="chatbot-panel" class="chatbot__panel" aria-hidden="true" aria-label="Anchor assistant chat panel">
        <header class="chatbot__header">
          <div>
            <p class="chatbot__title">Anchor Assistant</p>
            <p class="chatbot__subtitle">Need help? I'm right here.</p>
          </div>
          <button id="chatbot-close" class="chatbot__close" type="button" aria-label="Close chat">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </header>
        <div id="chatbot-messages" class="chatbot__messages" aria-live="polite"></div>
        <p id="chatbot-status" class="chatbot__status" role="status" aria-live="polite"></p>
        <form id="chatbot-form" class="chatbot__form">
          <label for="chatbot-input" class="sr-only">Ask the Anchor assistant</label>
          <textarea id="chatbot-input" name="message" rows="2" placeholder="Ask anything about volunteering, onboarding, or event support..." required></textarea>
          <div class="chatbot__form-actions">
            <button class="chatbot__send" type="submit">
              <i class="fa-solid fa-paper-plane"></i>
              <span>Send</span>
            </button>
          </div>
        </form>
      </section>
    `;

    document.body.appendChild(wrapper);
    return wrapper;
  };

  const init = () => {
    const container = buildMarkup();
    if (!container) {
      return;
    }

    const toggleButton = container.querySelector('#chatbot-toggle');
    const panel = container.querySelector('#chatbot-panel');
    const closeButton = container.querySelector('#chatbot-close');
    const form = container.querySelector('#chatbot-form');
    const textarea = container.querySelector('#chatbot-input');
    const messagesWrapper = container.querySelector('#chatbot-messages');
    const statusEl = container.querySelector('#chatbot-status');
    const sendButton = form ? form.querySelector('button[type="submit"]') : null;

    if (!toggleButton || !panel || !closeButton || !form || !textarea || !messagesWrapper || !statusEl || !sendButton) {
      return;
    }

    const state = {
      messages: [],
      busy: false,
      panelOpen: false
    };

    const addToHistory = (role, text) => {
      state.messages.push({ role, text });
      const excess = state.messages.length - (CONFIG.historyLimit * 2);
      if (excess > 0) {
        state.messages.splice(0, excess);
      }
    };

    const appendMessage = (role, text) => {
      const messageEl = document.createElement('div');
      messageEl.className = `chatbot-message chatbot-message--${role === 'model' ? 'ai' : 'user'}`;

      const bubble = document.createElement('div');
      bubble.className = 'chatbot-message__bubble';
      bubble.innerHTML = sanitize(text).replace(/\n/g, '<br>');

      messageEl.appendChild(bubble);
      messagesWrapper.appendChild(messageEl);
      messagesWrapper.scrollTop = messagesWrapper.scrollHeight;
    };

    const setBusy = (isBusy, statusText = '') => {
      state.busy = isBusy;
      textarea.disabled = isBusy;
      sendButton.disabled = isBusy;
      toggleButton.classList.toggle('chatbot__toggle--busy', isBusy);
      statusEl.textContent = statusText;
    };

    const ensureGreeting = () => {
      if (state.messages.length === 0) {
        appendMessage('model', CONFIG.greeting);
        addToHistory('model', CONFIG.greeting);
      }
    };

    const setPanelOpen = (isOpen) => {
      state.panelOpen = isOpen;
      panel.classList.toggle('chatbot__panel--open', isOpen);
      panel.setAttribute('aria-hidden', String(!isOpen));
      toggleButton.setAttribute('aria-expanded', String(isOpen));

      if (isOpen) {
        ensureGreeting();
        window.setTimeout(() => textarea.focus({ preventScroll: true }), 160);
      }
    };

    toggleButton.addEventListener('click', () => setPanelOpen(!state.panelOpen));
    closeButton.addEventListener('click', () => setPanelOpen(false));

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && state.panelOpen) {
        setPanelOpen(false);
      }
    });

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (state.busy) return;

      const userMessage = textarea.value.trim();
      if (!userMessage) {
        textarea.value = '';
        return;
      }

      const historyPayload = state.messages.slice(-CONFIG.historyLimit);

      appendMessage('user', userMessage);
      addToHistory('user', userMessage);
      textarea.value = '';
      setBusy(true, CONFIG.busyMessage);

      try {
        const response = await fetch(CONFIG.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: userMessage,
            history: historyPayload
          })
        });

        let payload = null;
        try {
          payload = await response.json();
        } catch (parseError) {
          payload = null;
        }

        if (!response.ok) {
          const errorMessage = (payload && payload.error) || "I'm having trouble responding right now. Please try again in a moment.";
          appendMessage('model', errorMessage);
          addToHistory('model', errorMessage);
          return;
        }

        const replyText = payload && typeof payload.reply === 'string' ? payload.reply.trim() : '';
        if (!replyText) {
          const fallback = "I didn't catch that, but I'm here to help with anything volunteer-related!";
          appendMessage('model', fallback);
          addToHistory('model', fallback);
          return;
        }

        appendMessage('model', replyText);
        addToHistory('model', replyText);
      } catch (error) {
        const message = error && error.message ? error.message : 'Unexpected network error. Please try again soon.';
        const errorCopy = `Oops, something went wrong: ${message}`;
        appendMessage('model', errorCopy);
        addToHistory('model', errorCopy);
      } finally {
        setBusy(false, '');
      }
    });

    textarea.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        if (!state.busy) {
          form.requestSubmit();
        }
      }
    });

    ensureGreeting();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
