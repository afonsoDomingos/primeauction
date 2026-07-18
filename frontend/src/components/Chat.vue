<template>
  <div class="chat-container">
    <div class="chat-sidebar">
      <div class="chat-header">
        <h3>Mensagens</h3>
        <span v-if="unreadCount > 0" class="unread-badge">{{ unreadCount }}</span>
      </div>
      <div class="conversations-list">
        <div
          v-for="conv in conversations"
          :key="conv.user.id"
          class="conversation-item"
          :class="{ active: selectedUser?.id === conv.user.id }"
          @click="selectConversation(conv.user)"
        >
          <div class="conversation-avatar">
            <img v-if="conv.user.profilePhoto" :src="conv.user.profilePhoto" :alt="conv.user.name" />
            <span v-else class="avatar-initial">{{ conv.user.name.charAt(0).toUpperCase() }}</span>
            <span v-if="conv.unreadCount > 0" class="unread-dot">{{ conv.unreadCount }}</span>
          </div>
          <div class="conversation-info">
            <div class="conversation-name">{{ conv.user.name }}</div>
            <div class="conversation-preview">
              {{ conv.lastMessage ? (conv.lastMessage.sender === authStore.user?.id ? 'Você: ' : '') + conv.lastMessage.content : 'Sem mensagens' }}
            </div>
          </div>
          <div v-if="conv.lastMessage" class="conversation-time">
            {{ formatTime(conv.lastMessage.createdAt) }}
          </div>
        </div>
        <div v-if="conversations.length === 0" class="no-conversations">
          <p>Nenhuma conversa ainda</p>
        </div>
      </div>
    </div>

    <div v-if="selectedUser" class="chat-main">
      <div class="chat-main-header">
        <div class="chat-user-info">
          <img v-if="selectedUser.profilePhoto" :src="selectedUser.profilePhoto" :alt="selectedUser.name" class="chat-header-avatar" />
          <span v-else class="chat-header-initial">{{ selectedUser.name.charAt(0).toUpperCase() }}</span>
          <div>
            <div class="chat-header-name">{{ selectedUser.name }}</div>
            <div class="chat-header-email">{{ selectedUser.email }}</div>
          </div>
        </div>
        <button @click="closeChat" class="close-chat-btn">×</button>
      </div>

      <div class="messages-container" ref="messagesContainer">
        <div
          v-for="message in messages"
          :key="message._id"
          class="message"
          :class="{ 'message-sent': message.sender._id === authStore.user?.id, 'message-received': message.sender._id !== authStore.user?.id }"
        >
          <div class="message-avatar">
            <img v-if="message.sender.profilePhoto" :src="message.sender.profilePhoto" :alt="message.sender.name" />
            <span v-else class="avatar-initial">{{ message.sender.name.charAt(0).toUpperCase() }}</span>
          </div>
          <div class="message-content">
            <div class="message-text">{{ message.content }}</div>
            <div class="message-time">{{ formatTime(message.createdAt) }}</div>
          </div>
        </div>
        <div v-if="messages.length === 0" class="no-messages">
          <p>Inicie a conversa</p>
        </div>
      </div>

      <div class="chat-input-container">
        <form @submit.prevent="sendMessage" class="chat-form">
          <input
            v-model="newMessage"
            type="text"
            placeholder="Escreva uma mensagem..."
            class="chat-input"
            maxlength="1000"
          />
          <button type="submit" class="send-btn" :disabled="!newMessage.trim()">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </form>
      </div>
    </div>

    <div v-else class="chat-placeholder">
      <div class="placeholder-content">
        <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        <h3>Selecione uma conversa</h3>
        <p>Escolha um usuário para começar a conversar</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { useAuthStore } from '../stores/authStore';
import { useToastStore } from '../stores/toastStore';
import axios from 'axios';
import { io } from 'socket.io-client';

const authStore = useAuthStore();
const toastStore = useToastStore();

const conversations = ref([]);
const messages = ref([]);
const selectedUser = ref(null);
const newMessage = ref('');
const unreadCount = ref(0);
const messagesContainer = ref(null);

let socket = null;

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const fetchConversations = async () => {
  try {
    const res = await axios.get(`${apiUrl}/api/chat/conversations`, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    });
    conversations.value = res.data.data;
  } catch (err) {
    console.error('Error fetching conversations:', err);
  }
};

const fetchMessages = async (userId) => {
  try {
    const res = await axios.get(`${apiUrl}/api/chat/messages/${userId}`, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    });
    messages.value = res.data.data;
    await nextTick();
    scrollToBottom();
  } catch (err) {
    console.error('Error fetching messages:', err);
  }
};

const fetchUnreadCount = async () => {
  try {
    const res = await axios.get(`${apiUrl}/api/chat/unread`, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    });
    unreadCount.value = res.data.count;
  } catch (err) {
    console.error('Error fetching unread count:', err);
  }
};

const selectConversation = (user) => {
  selectedUser.value = user;
  fetchMessages(user.id);
};

const sendMessage = async () => {
  if (!newMessage.value.trim() || !selectedUser.value) return;

  try {
    const res = await axios.post(
      `${apiUrl}/api/chat/messages/${selectedUser.value.id}`,
      { content: newMessage.value },
      { headers: { Authorization: `Bearer ${authStore.token}` } }
    );
    messages.value.push(res.data.data);
    newMessage.value = '';
    await nextTick();
    scrollToBottom();
  } catch (err) {
    toastStore.error('Erro ao enviar mensagem');
  }
};

const closeChat = () => {
  selectedUser.value = null;
  messages.value = [];
};

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

const formatTime = (date) => {
  const d = new Date(date);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  
  if (isToday) {
    return d.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' });
};

const setupSocket = () => {
  socket = io(apiUrl);
  
  socket.on('connect', () => {
    if (authStore.user?.id) {
      socket.emit('join_user', authStore.user.id);
    }
  });

  socket.on('new_message', (message) => {
    if (selectedUser.value && message.sender._id === selectedUser.value.id) {
      messages.value.push(message);
      nextTick(() => scrollToBottom());
    } else {
      fetchConversations();
      fetchUnreadCount();
      toastStore.info(`Nova mensagem de ${message.sender.name}`);
    }
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });
};

onMounted(() => {
  fetchConversations();
  fetchUnreadCount();
  setupSocket();
});

onUnmounted(() => {
  if (socket) {
    socket.disconnect();
  }
});

watch(selectedUser, (newUser) => {
  if (newUser) {
    fetchMessages(newUser.id);
  }
});
</script>

<style scoped>
.chat-container {
  display: flex;
  height: 600px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.chat-sidebar {
  width: 320px;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
}

.chat-header {
  padding: 1.25rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.chat-header h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
}

.unread-badge {
  background: #3e6ae1;
  color: white;
  padding: 0.25rem 0.625rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.conversations-list {
  flex: 1;
  overflow-y: auto;
}

.conversation-item {
  padding: 1rem 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  transition: background-color 0.2s;
  border-bottom: 1px solid #f3f4f6;
}

.conversation-item:hover,
.conversation-item.active {
  background-color: #f9fafb;
}

.conversation-avatar {
  position: relative;
  width: 48px;
  height: 48px;
  flex-shrink: 0;
}

.conversation-avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-initial {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(135deg, #3e6ae1, #7c3aed);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.125rem;
}

.unread-dot {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #ef4444;
  color: white;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  border: 2px solid white;
}

.conversation-info {
  flex: 1;
  min-width: 0;
}

.conversation-name {
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.conversation-preview {
  font-size: 0.875rem;
  color: #6b7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.conversation-time {
  font-size: 0.75rem;
  color: #9ca3af;
  flex-shrink: 0;
}

.no-conversations {
  padding: 2rem;
  text-align: center;
  color: #9ca3af;
}

.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.chat-main-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.chat-user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.chat-header-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.chat-header-initial {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3e6ae1, #7c3aed);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.chat-header-name {
  font-weight: 600;
  color: #1f2937;
}

.chat-header-email {
  font-size: 0.875rem;
  color: #6b7280;
}

.close-chat-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #9ca3af;
  cursor: pointer;
  padding: 0.25rem;
  line-height: 1;
}

.close-chat-btn:hover {
  color: #1f2937;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.message {
  display: flex;
  gap: 0.75rem;
  max-width: 70%;
}

.message-sent {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.message-received {
  align-self: flex-start;
}

.message-avatar img {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
}

.message-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.message-text {
  padding: 0.75rem 1rem;
  border-radius: 12px;
  line-height: 1.5;
}

.message-sent .message-text {
  background: #3e6ae1;
  color: white;
  border-bottom-right-radius: 4px;
}

.message-received .message-text {
  background: #f3f4f6;
  color: #1f2937;
  border-bottom-left-radius: 4px;
}

.message-time {
  font-size: 0.75rem;
  color: #9ca3af;
}

.message-sent .message-time {
  text-align: right;
}

.no-messages {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
}

.chat-input-container {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.chat-form {
  display: flex;
  gap: 0.75rem;
}

.chat-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 24px;
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s;
}

.chat-input:focus {
  border-color: #3e6ae1;
}

.send-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #3e6ae1;
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.send-btn:hover:not(:disabled) {
  background: #3457b2;
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.chat-placeholder {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f9fafb;
}

.placeholder-content {
  text-align: center;
  color: #9ca3af;
}

.placeholder-content svg {
  margin-bottom: 1rem;
  opacity: 0.5;
}

.placeholder-content h3 {
  margin: 0 0 0.5rem;
  color: #6b7280;
}

.placeholder-content p {
  margin: 0;
  font-size: 0.95rem;
}

@media (max-width: 768px) {
  .chat-container {
    height: 100vh;
    border-radius: 0;
  }

  .chat-sidebar {
    width: 100%;
  }

  .chat-main {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: white;
    z-index: 10;
  }

  .chat-main.hidden {
    display: none;
  }
}
</style>
