<template>
  <div class="chat-assistant-container" :class="{ 'is-open': isOpen }">
    <!-- Pulsing Trigger Button -->
    <button @click="toggleChat" class="chat-trigger-btn" aria-label="Abrir assistente de suporte">
      <span class="pulse-ring"></span>
      <span class="trigger-icon">
        <svg v-if="!isOpen" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        <svg v-else viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </span>
      <span v-if="unreadCount > 0 && !isOpen" class="unread-badge">{{ unreadCount }}</span>
    </button>

    <!-- Chat Window -->
    <div class="chat-window">
      <!-- Chat Header -->
      <div class="chat-header">
        <div class="bot-profile">
          <div class="bot-avatar-wrap">
            <span class="bot-avatar">🤖</span>
            <span class="online-indicator"></span>
          </div>
          <div class="bot-meta">
            <h4 class="bot-name">PrimeAssist</h4>
            <p class="bot-status">Assistente Virtual</p>
          </div>
        </div>
        <button @click="toggleChat" class="chat-close-btn" aria-label="Fechar painel de chat">✕</button>
      </div>

      <!-- Chat Messages Area -->
      <div class="chat-messages" ref="messagesArea">
        <div 
          v-for="msg in messages" 
          :key="msg.id" 
          :class="['message-row', msg.sender === 'user' ? 'msg-user' : 'msg-bot']"
        >
          <!-- Message Bubble -->
          <div class="message-bubble">
            <!-- Text Content -->
            <p v-if="msg.text" class="msg-text" v-html="msg.text"></p>

            <!-- Support Ticket Form (Rendered inside chat if selected) -->
            <div v-if="msg.isForm" class="support-ticket-form-wrap">
              <div v-if="!formSubmitted" class="ticket-form">
                <div class="form-field">
                  <label class="field-label">E-mail</label>
                  <input 
                    type="email" 
                    v-model="ticketForm.email" 
                    class="field-input" 
                    placeholder="o-seu-email@dominio.com" 
                    required
                  />
                </div>
                <div class="form-field">
                  <label class="field-label">Telemóvel (Opcional)</label>
                  <input 
                    type="text" 
                    v-model="ticketForm.phone" 
                    class="field-input" 
                    placeholder="+258 8X XXX XXXX" 
                  />
                </div>
                <div class="form-field">
                  <label class="field-label">Mensagem detalhada</label>
                  <textarea 
                    v-model="ticketForm.message" 
                    class="field-textarea" 
                    rows="3" 
                    placeholder="Descreva o seu problema ou dúvida..." 
                    required
                  ></textarea>
                </div>
                <button 
                  @click="submitTicket" 
                  class="btn-submit-ticket" 
                  :disabled="sendingForm || !ticketForm.message"
                >
                  <span v-if="sendingForm" class="spinner-inline"></span>
                  {{ sendingForm ? 'A submeter...' : '✉ Enviar Pedido' }}
                </button>
              </div>

              <!-- Success Check Animation -->
              <div v-else class="ticket-success-message">
                <div class="success-icon-animate">✓</div>
                <h5>Pedido Enviado!</h5>
                <p>Obrigado pelo seu contacto. Um assistente humano entrará em contacto muito brevemente.</p>
              </div>
            </div>
          </div>
          <!-- Time stamp -->
          <span class="message-time">{{ formatTime(msg.timestamp) }}</span>
        </div>

        <!-- Typing Indicator -->
        <div v-if="isTyping" class="message-row msg-bot">
          <div class="message-bubble typing-indicator-bubble">
            <div class="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Suggestion Chips -->
      <div v-if="showChips && !isTyping" class="chat-suggestion-scroll">
        <div class="suggestion-chips-container">
          <button 
            v-for="(chip, index) in suggestionChips" 
            :key="index" 
            @click="handleChipClick(chip)"
            class="suggestion-chip-btn"
          >
            {{ chip.label }}
          </button>
        </div>
      </div>

      <!-- Chat Input Area -->
      <form @submit.prevent="handleMessageSubmit" class="chat-input-form">
        <input 
          type="text" 
          v-model="inputText" 
          placeholder="Escreva a sua mensagem..." 
          class="chat-input-field"
          :disabled="isTyping"
          maxlength="500"
        />
        <button type="submit" class="chat-send-btn" :disabled="!inputText.trim() || isTyping" aria-label="Enviar">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue';
import axios from 'axios';

const isOpen = ref(false);
const isTyping = ref(false);
const unreadCount = ref(0);
const inputText = ref('');
const showChips = ref(true);
const messagesArea = ref(null);

const messages = ref([]);
const suggestionChips = [
  { label: '🔨 Como licitar?', value: 'Como posso licitar num produto?' },
  { label: '📦 Que produtos existem?', value: 'Que categorias de produtos existem nos leilões?' },
  { label: '💰 Formas de pagamento?', value: 'Quais são as formas de pagamento disponíveis?' },
  { label: '📍 Levantamento de produto?', value: 'Como funciona o levantamento do produto depois de ganhar o leilão?' },
  { label: '🤝 Suporte Humano', value: 'Falar com suporte humano' }
];

// Support ticket state
const ticketForm = ref({
  email: '',
  phone: '',
  message: ''
});
const sendingForm = ref(false);
const formSubmitted = ref(false);

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const toggleChat = () => {
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    unreadCount.value = 0;
    scrollToBottom();
  }
};

const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit' });
};

const scrollToBottom = async () => {
  await nextTick();
  if (messagesArea.value) {
    messagesArea.value.scrollTop = messagesArea.value.scrollHeight;
  }
};

const saveHistory = () => {
  localStorage.setItem('prime_chat_messages', JSON.stringify(messages.value));
};

const handleChipClick = (chip) => {
  sendMessage(chip.value);
};

const handleMessageSubmit = () => {
  if (!inputText.value.trim() || isTyping.value) return;
  sendMessage(inputText.value.trim());
  inputText.value = '';
};

const sendMessage = (text) => {
  // Push user message
  const userMsg = {
    id: 'user-' + Date.now(),
    sender: 'user',
    text: text,
    timestamp: new Date()
  };
  messages.value.push(userMsg);
  saveHistory();
  scrollToBottom();

  // Show typing indicator
  isTyping.value = true;
  showChips.value = false;

  // Process response after delay
  const delay = 800 + Math.random() * 800;
  setTimeout(() => {
    isTyping.value = false;
    generateBotResponse(text);
  }, delay);
};

const generateBotResponse = (userText) => {
  const text = userText.toLowerCase();
  let botText = '';
  let isForm = false;

  if (text.includes('licitar') || text.includes('licitação') || text.includes('lance') || text.includes('como funciona') || text.includes('como posso')) {
    botText = 'Para licitar num produto, primeiro precisa de <strong>criar uma conta gratuita</strong> e iniciar sessão. Depois, aceda ao leilão pretendido, introduza um valor superior ao "Lance Atual" e clique em <strong>Licitar</strong>. Se for superado por outro utilizador, receberá um alerta na plataforma para relicitar.';
  } else if (text.includes('categorias') || text.includes('produto') || text.includes('que produtos') || text.includes('o que vendem') || text.includes('tipos')) {
    botText = 'Na Prime Auction leiloamos produtos de <strong>diversas categorias</strong>, incluindo:<br/>• 🚗 <strong>Veículos</strong> (automóveis, motos, comerciais)<br/>• 🏠 <strong>Imóveis e Equipamentos</strong><br/>• 💻 <strong>Electrónica e Tecnologia</strong><br/>• 🪑 <strong>Mobiliário e Decoração</strong><br/>• 🏭 <strong>Maquinaria Industrial</strong><br/>• 📦 <strong>Outros bens e artigos</strong><br/><br/>Consulte a página de <a href="/auctions" style="color:#1a56db">Leilões</a> para ver todos os produtos disponíveis.';
  } else if (text.includes('pagamento') || text.includes('pagar') || text.includes('banco') || text.includes('conta') || text.includes('transferência')) {
    botText = 'Aceitamos pagamento por <strong>transferência bancária direta (MZN)</strong> ou depósito. Trabalhamos com o <strong>BCI</strong>, <strong>Millennium bim</strong> e <strong>Standard Bank</strong>. Os dados bancários detalhados ser-lhe-ão enviados por e-mail assim que ganhar qualquer leilão.';
  } else if (text.includes('levantar') || text.includes('levantamento') || text.includes('recolha') || text.includes('instalações') || text.includes('produto ganho') || text.includes('depois de ganhar')) {
    botText = 'Após a confirmação do pagamento, a nossa equipa entra em contacto consigo em até <strong>24 horas</strong> para agendar a entrega ou recolha do produto nas nossas instalações em <strong>Maputo</strong>. Para produtos volumosos (ex: veículos, maquinaria), poderá ser necessário deslocação às nossas instalações.';
  } else if (text.includes('humano') || text.includes('assistente') || text.includes('falar') || text.includes('contacto') || text.includes('mensagem') || text.includes('ajuda')) {
    botText = 'Perfeito! Deixe os seus dados de contacto e a sua mensagem no formulário abaixo, e um agente de apoio ao cliente entrará em contacto muito brevemente.';
    isForm = true;
  } else if (text.includes('ola') || text.includes('olá') || text.includes('bom dia') || text.includes('boa tarde') || text.includes('boa noite') || text.includes('hello') || text.includes('hi')) {
    botText = 'Olá! Sou o <strong>PrimeAssist</strong>, o assistente virtual da Prime Auction. Leiloamos produtos de <strong>diversas categorias</strong> — veículos, electrónica, imóveis, maquinaria e muito mais! Como o posso ajudar hoje?';
  } else if (text.includes('regist') || text.includes('criar conta') || text.includes('cadastr')) {
    botText = 'Para se registar na Prime Auction, clique em <strong>"Criar Conta"</strong> no menu de navegação. O registo é gratuito e permite-lhe licitar em todos os nossos leilões de diversas categorias de produtos.';
  } else {
    botText = 'Não consegui compreender a sua questão. Quer falar com um assistente humano ou prefere ver as perguntas frequentes?';
  }

  const botMsg = {
    id: 'bot-' + Date.now(),
    sender: 'bot',
    text: botText,
    isForm: isForm,
    timestamp: new Date()
  };

  messages.value.push(botMsg);
  saveHistory();
  showChips.value = true;
  scrollToBottom();

  if (!isOpen.value) {
    unreadCount.value++;
  }
};

const submitTicket = async () => {
  if (!ticketForm.value.message) return;
  
  sendingForm.value = true;
  try {
    const res = await axios.post(`${apiUrl}/api/support`, {
      email: ticketForm.value.email,
      phone: ticketForm.value.phone,
      message: ticketForm.value.message
    });
    
    if (res.data && res.data.success) {
      formSubmitted.value = true;
      ticketForm.value = { email: '', phone: '', message: '' };
      
      // Save formSubmitted status in chat history so it remains rendered as submitted
      const formMsg = messages.value.find(m => m.isForm);
      if (formMsg) {
        formMsg.text = 'Pedido enviado com sucesso! ✓';
        formMsg.isForm = false;
      }
      
      // Add success confirmation message from bot
      setTimeout(() => {
        const ticketId = res.data.data._id;
        const confirmMsg = {
          id: 'bot-confirm-' + Date.now(),
          sender: 'bot',
          text: `Confirmado! O seu pedido de apoio foi registado com sucesso com o identificador de ticket: <strong>#${ticketId.substring(ticketId.length - 6).toUpperCase()}</strong>. Um agente irá contactá-lo brevemente.`,
          timestamp: new Date()
        };
        messages.value.push(confirmMsg);
        saveHistory();
        scrollToBottom();
      }, 500);
    }
  } catch (err) {
    console.error('Failed to submit support ticket:', err);
    alert('Ocorreu um erro ao submeter o pedido de suporte. Por favor, tente novamente.');
  } finally {
    sendingForm.value = false;
  }
};

onMounted(() => {
  const saved = localStorage.getItem('prime_chat_messages');
  if (saved) {
    try {
      messages.value = JSON.parse(saved);
    } catch (e) {
      messages.value = [];
    }
  }
  
  // If no message history exists, load initial greeting
  if (messages.value.length === 0) {
    messages.value.push({
      id: 'bot-init',
      sender: 'bot',
      text: 'Olá! Sou o <strong>PrimeAssist</strong> 🤖, o assistente virtual da <strong>Prime Auction</strong>.<br/><br/>Leiloamos produtos de <strong>múltiplas categorias</strong>: veículos, electrónica, imóveis, maquinaria e muito mais!<br/><br/>Como posso ajudá-lo hoje?',
      timestamp: new Date()
    });
    saveHistory();
  }
  
  scrollToBottom();
});
</script>

<style scoped>
/* Floating Container */
.chat-assistant-container {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 9999;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}

/* Pulsing circular trigger button */
.chat-trigger-btn {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1a56db 0%, #10b981 100%);
  border: none;
  color: white;
  cursor: pointer;
  box-shadow: 0 8px 25px rgba(26, 86, 219, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  z-index: 10;
}

.chat-trigger-btn:hover {
  transform: scale(1.08) rotate(5deg);
  box-shadow: 0 10px 28px rgba(26, 86, 219, 0.55);
}

.chat-trigger-btn:active {
  transform: scale(0.95);
}

.trigger-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;
}

.pulse-ring {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 50%;
  border: 1px solid rgba(26, 86, 219, 0.5);
  animation: pulse-animation 2.2s cubic-bezier(0.24, 0, 0.38, 1) infinite;
  z-index: -1;
  pointer-events: none;
}

@keyframes pulse-animation {
  0% {
    transform: scale(1);
    opacity: 0.8;
  }
  100% {
    transform: scale(1.6);
    opacity: 0;
  }
}

.unread-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  background-color: #ef4444;
  color: white;
  border-radius: 12px;
  padding: 2px 7px;
  font-size: 0.72rem;
  font-weight: 700;
  border: 2px solid white;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
}

/* Chat Window Frame */
.chat-window {
  position: fixed;
  bottom: 6.2rem;
  right: 2rem;
  width: 375px;
  max-width: calc(100vw - 4rem);
  height: 520px;
  max-height: calc(100vh - 9rem);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.45);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.16);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 9;
  transform-origin: bottom right;
  opacity: 0;
  transform: scale(0.8) translateY(20px);
  pointer-events: none;
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.chat-assistant-container.is-open .chat-window {
  opacity: 1;
  transform: scale(1) translateY(0);
  pointer-events: auto;
}

/* Chat Header */
.chat-header {
  padding: 1.15rem 1.25rem;
  background: linear-gradient(135deg, #171a20 0%, #2a2d36 100%);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.bot-profile {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.bot-avatar-wrap {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bot-avatar {
  font-size: 1.5rem;
}

.online-indicator {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background-color: #10b981;
  border: 2px solid #171a20;
}

.bot-meta {
  display: flex;
  flex-direction: column;
}

.bot-name {
  font-size: 0.95rem;
  font-weight: 700;
  margin: 0;
  letter-spacing: -0.1px;
}

.bot-status {
  font-size: 0.72rem;
  color: #a3a3a3;
  margin: 0;
}

.chat-close-btn {
  background: transparent;
  border: none;
  color: rgba(255,255,255,0.6);
  font-size: 1rem;
  cursor: pointer;
  padding: 4px;
  transition: color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chat-close-btn:hover {
  color: white;
}

/* Chat Messages Content Area */
.chat-messages {
  flex-grow: 1;
  padding: 1.25rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
  scroll-behavior: smooth;
  background: rgba(249, 250, 251, 0.35);
}

/* Custom Scrollbar */
.chat-messages::-webkit-scrollbar {
  width: 5px;
}
.chat-messages::-webkit-scrollbar-track {
  background: transparent;
}
.chat-messages::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

.message-row {
  display: flex;
  flex-direction: column;
  max-width: 82%;
  animation: message-slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes message-slide-up {
  0% { opacity: 0; transform: translateY(10px); }
  100% { opacity: 1; transform: translateY(0); }
}

.msg-user {
  align-self: flex-end;
  align-items: flex-end;
}

.msg-bot {
  align-self: flex-start;
  align-items: flex-start;
}

.message-bubble {
  padding: 0.8rem 1rem;
  border-radius: 16px;
  font-size: 0.88rem;
  line-height: 1.45;
  box-shadow: 0 2px 6px rgba(0,0,0,0.02);
}

.msg-user .message-bubble {
  background-color: #1a56db;
  color: white;
  border-bottom-right-radius: 4px;
}

.msg-bot .message-bubble {
  background-color: #ffffff;
  color: #1f2937;
  border: 1px solid rgba(0,0,0,0.06);
  border-bottom-left-radius: 4px;
}

.msg-text {
  margin: 0;
  white-space: pre-line;
}

.message-time {
  font-size: 0.65rem;
  color: #9ca3af;
  margin-top: 0.25rem;
  padding: 0 4px;
}

/* Typing Indicator Animation */
.typing-indicator-bubble {
  padding: 0.8rem 1.1rem;
  background-color: #ffffff;
  border: 1px solid rgba(0,0,0,0.06);
  border-radius: 16px;
  border-bottom-left-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.typing-dots {
  display: flex;
  gap: 4px;
  align-items: center;
}

.typing-dots span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #9ca3af;
  animation: typing-animation 1.4s infinite ease-in-out both;
}

.typing-dots span:nth-child(1) { animation-delay: -0.32s; }
.typing-dots span:nth-child(2) { animation-delay: -0.16s; }

@keyframes typing-animation {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
  40% { transform: scale(1); opacity: 1; }
}

/* Support Form inside Chat */
.support-ticket-form-wrap {
  margin-top: 0.65rem;
  border-top: 1px solid #f3f4f6;
  padding-top: 0.75rem;
  width: 240px;
}

.ticket-form {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.field-label {
  font-size: 0.72rem;
  font-weight: 600;
  color: #4b5563;
}

.field-input {
  padding: 0.45rem 0.6rem;
  font-size: 0.8rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  outline: none;
  background: white;
  transition: border-color 0.2s;
  font-family: inherit;
}

.field-input:focus {
  border-color: #1a56db;
}

.field-textarea {
  padding: 0.45rem 0.6rem;
  font-size: 0.8rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  outline: none;
  background: white;
  resize: none;
  font-family: inherit;
  transition: border-color 0.2s;
}

.field-textarea:focus {
  border-color: #1a56db;
}

.btn-submit-ticket {
  background-color: #1a56db;
  color: white;
  border: none;
  padding: 0.5rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
}

.btn-submit-ticket:hover:not(:disabled) {
  background-color: #1e40af;
}

.btn-submit-ticket:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner-inline {
  width: 12px;
  height: 12px;
  border: 2px solid white;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.ticket-success-message {
  text-align: center;
  padding: 0.75rem 0.25rem;
}

.success-icon-animate {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background-color: #d1fae5;
  color: #059669;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0 auto 0.5rem;
  animation: success-pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes success-pop {
  0% { transform: scale(0.6); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

.ticket-success-message h5 {
  font-size: 0.85rem;
  font-weight: 700;
  color: #065f46;
  margin: 0 0 0.25rem;
}

.ticket-success-message p {
  font-size: 0.75rem;
  color: #374151;
  margin: 0;
  line-height: 1.4;
}

/* Suggestion Chips Section */
.chat-suggestion-scroll {
  padding: 0.5rem 0.75rem;
  background: rgba(255, 255, 255, 0.4);
  border-top: 1px solid rgba(0, 0, 0, 0.04);
  overflow-x: auto;
}

.chat-suggestion-scroll::-webkit-scrollbar {
  height: 3px;
}
.chat-suggestion-scroll::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.06);
  border-radius: 2px;
}

.suggestion-chips-container {
  display: flex;
  gap: 0.5rem;
  width: max-content;
  padding-bottom: 2px;
}

.suggestion-chip-btn {
  padding: 0.45rem 0.75rem;
  font-size: 0.78rem;
  background-color: #ffffff;
  border: 1px solid rgba(26, 86, 219, 0.15);
  color: #1a56db;
  border-radius: 20px;
  cursor: pointer;
  white-space: nowrap;
  font-weight: 500;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
}

.suggestion-chip-btn:hover {
  background-color: #1a56db;
  color: white;
  border-color: #1a56db;
  transform: translateY(-1px);
  box-shadow: 0 3px 6px rgba(26, 86, 219, 0.12);
}

/* Message Input Area Form */
.chat-input-form {
  padding: 0.8rem 1rem;
  background-color: #ffffff;
  border-top: 1px solid rgba(0,0,0,0.06);
  display: flex;
  gap: 0.65rem;
  align-items: center;
}

.chat-input-field {
  flex-grow: 1;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 0.55rem 0.85rem;
  font-size: 0.86rem;
  outline: none;
  background-color: #f9fafb;
  transition: all 0.25s;
  font-family: inherit;
}

.chat-input-field:focus {
  background-color: white;
  border-color: #1a56db;
  box-shadow: 0 0 0 3px rgba(26, 86, 219, 0.1);
}

.chat-input-field:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.chat-send-btn {
  background-color: #1a56db;
  color: white;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.chat-send-btn:hover:not(:disabled) {
  background-color: #1e40af;
  transform: scale(1.05);
}

.chat-send-btn:disabled {
  background-color: #e5e7eb;
  color: #9ca3af;
  cursor: not-allowed;
}
</style>
