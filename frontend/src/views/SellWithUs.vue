<template>
  <div class="sell-container animate-fade-in">
    <div class="sell-hero">
      <div class="sell-hero-content">
        <span class="sell-badge">Parceria & Vendas</span>
        <h1 class="sell-title">Vender Connosco</h1>
        <p class="sell-subtitle">Quer leiloar o seu veículo, imóvel ou outro artigo? Envie os detalhes e fotos. A nossa equipa analisará e entrará em contacto para activar o leilão.</p>
      </div>
    </div>

    <div class="container sell-content">
      <!-- Success Card -->
      <div v-if="submitted" class="success-card text-center animate-scale-in">
        <div class="success-icon">🎉</div>
        <h2 class="success-title">Proposta Submetida!</h2>
        <p class="success-text">A sua proposta de leilão para <strong>{{ form.title }}</strong> foi registada com sucesso.</p>
        <p class="success-note">A nossa equipa administrativa irá analisar as fotos e especificações. Entraremos em contacto brevemente.</p>
        <div class="success-actions">
          <router-link to="/profile" class="btn btn-primary btn-pill">Ver Minhas Propostas</router-link>
          <router-link to="/" class="btn btn-secondary btn-pill">Voltar ao Início</router-link>
        </div>
      </div>

      <!-- Form Card -->
      <div v-else class="sell-card">
        <form @submit.prevent="submitProposal" class="sell-form">
          <h3 class="form-section-title">📦 Detalhes do Artigo</h3>
          
          <div class="form-grid-2">
            <div class="form-group">
              <label class="form-label" for="title">Título do Artigo / Veículo</label>
              <input 
                type="text" 
                id="title" 
                v-model="form.title" 
                class="form-input" 
                placeholder="Ex: Toyota Hilux D4D 2018" 
                required 
              />
            </div>
            
            <div class="form-group">
              <label class="form-label" for="category">Categoria</label>
              <select id="category" v-model="form.category" class="form-input" required>
                <option value="" disabled>Seleccione uma categoria</option>
                <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
              </select>
            </div>
          </div>

          <div class="form-grid-2">
            <div class="form-group">
              <label class="form-label" for="condition">Estado de Conservação</label>
              <select id="condition" v-model="form.condition" class="form-input" required>
                <option value="Usado">Usado</option>
                <option value="Novo">Novo / Como Novo</option>
                <option value="Acidentado">Acidentado / Salvado</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label" for="value">Valor Estimado / Preço Mínimo (MZN)</label>
              <input 
                type="number" 
                id="value" 
                v-model="form.estimatedValue" 
                class="form-input" 
                placeholder="Ex: 850000" 
                required 
              />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="description">Descrição Detalhada</label>
            <textarea 
              id="description" 
              v-model="form.description" 
              class="form-input form-textarea" 
              placeholder="Indique a marca, modelo, ano, quilometragem, histórico de revisões ou qualquer detalhe importante para os licitantes..." 
              required
            ></textarea>
          </div>

          <h3 class="form-section-title" style="margin-top: 2.5rem;">📞 Informações de Contacto</h3>
          
          <div class="form-grid-2">
            <div class="form-group">
              <label class="form-label" for="phone">Telemóvel de Contacto</label>
              <input 
                type="text" 
                id="phone" 
                v-model="form.contactPhone" 
                class="form-input" 
                placeholder="Ex: +258 84 123 4567" 
                required 
              />
            </div>

            <div class="form-group">
              <label class="form-label" for="email">E-mail de Contacto</label>
              <input 
                type="email" 
                id="email" 
                v-model="form.contactEmail" 
                class="form-input" 
                placeholder="Ex: seuemail@dominio.com" 
                required 
              />
            </div>
          </div>

          <h3 class="form-section-title" style="margin-top: 2.5rem;">📷 Fotografias do Artigo</h3>
          <p class="section-subtitle-small">Adicione até 5 fotografias nítidas para ajudar na avaliação do seu artigo.</p>
          
          <!-- Image Upload Area -->
          <div 
            class="upload-dropzone" 
            :class="{ 'dragging': isDragging }"
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @drop.prevent="handleDrop"
            @click="triggerFileInput"
          >
            <input 
              type="file" 
              ref="fileInput" 
              style="display: none;" 
              multiple 
              accept="image/*"
              @change="handleFileChange"
            />
            
            <div class="upload-prompt">
              <span class="upload-icon">📤</span>
              <span class="upload-text">Arraste as fotos para aqui ou <strong>clique para escolher</strong></span>
              <span class="upload-formats">Formatos permitidos: JPG, PNG, WEBP (máx. 5 fotos)</span>
            </div>
          </div>

          <!-- Image Previews -->
          <div v-if="form.images.length > 0 || uploadingImages" class="image-previews-grid">
            <!-- Uploading placeholder -->
            <div v-if="uploadingImages" class="preview-item uploading">
              <div class="spinner-small"></div>
              <span>A carregar...</span>
            </div>

            <!-- Previews -->
            <div 
              v-for="(url, idx) in form.images" 
              :key="idx" 
              class="preview-item"
              :style="{ backgroundImage: `url(${url})` }"
            >
              <button 
                type="button" 
                class="btn-remove-preview" 
                @click="removeImage(idx)"
                title="Remover imagem"
              >
                ✕
              </button>
            </div>
          </div>

          <div class="form-actions-row">
            <button 
              type="submit" 
              class="btn btn-primary btn-pill btn-large" 
              :disabled="submitting || uploadingImages"
            >
              <span v-if="submitting" class="spinner-inline"></span>
              {{ submitting ? 'A submeter proposta...' : 'Submeter Proposta de Venda' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useAuthStore } from '../stores/authStore';
import { useToastStore } from '../stores/toastStore';

const authStore = useAuthStore();
const toastStore = useToastStore();

const categories = ['Veículos', 'Imóveis e Equipamentos', 'Electrónica e Tecnologia', 'Mobiliário e Decoração', 'Maquinaria Industrial', 'Outros'];

const form = ref({
  title: '',
  category: '',
  condition: 'Usado',
  estimatedValue: null,
  description: '',
  contactPhone: '',
  contactEmail: '',
  images: []
});

const isDragging = ref(false);
const uploadingImages = ref(false);
const submitting = ref(false);
const submitted = ref(false);
const fileInput = ref(null);

onMounted(() => {
  // Prefill contact fields if authenticated
  if (authStore.isAuthenticated && authStore.user) {
    form.value.contactEmail = authStore.user.email || '';
    form.value.contactPhone = authStore.user.phone || '';
  }
});

const triggerFileInput = () => {
  fileInput.value.click();
};

const handleFileChange = (e) => {
  const files = e.target.files;
  if (files.length > 0) {
    uploadFiles(files);
  }
};

const handleDrop = (e) => {
  isDragging.value = false;
  const files = e.dataTransfer.files;
  if (files.length > 0) {
    uploadFiles(files);
  }
};

const uploadFiles = async (files) => {
  const currentCount = form.value.images.length;
  if (currentCount + files.length > 5) {
    toastStore.error('Pode fazer upload de no máximo 5 imagens.');
    return;
  }

  uploadingImages.value = true;
  const formData = new FormData();
  
  for (let i = 0; i < files.length; i++) {
    formData.append('images', files[i]);
  }

  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const res = await axios.post(`${apiUrl}/api/proposals/upload-images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${authStore.token}`
      }
    });

    if (res.data && res.data.success) {
      form.value.images = [...form.value.images, ...res.data.data];
      toastStore.success('Fotos carregadas com sucesso! ✓');
    }
  } catch (err) {
    console.error('Image upload failed:', err);
    toastStore.error(err.response?.data?.error || 'Erro ao carregar imagens.');
  } finally {
    uploadingImages.value = false;
  }
};

const removeImage = (idx) => {
  form.value.images.splice(idx, 1);
};

const submitProposal = async () => {
  if (form.value.images.length === 0) {
    toastStore.error('Por favor, adicione pelo menos uma fotografia do artigo.');
    return;
  }

  submitting.value = true;
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const res = await axios.post(`${apiUrl}/api/proposals`, form.value, {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    });

    if (res.data && res.data.success) {
      submitted.value = true;
      toastStore.success('A sua proposta foi enviada! ✓');
    }
  } catch (err) {
    console.error('Proposal submission failed:', err);
    toastStore.error(err.response?.data?.error || 'Erro ao submeter a proposta.');
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
.sell-container {
  min-height: 100vh;
  background-color: #f9fafb;
  padding-bottom: 5rem;
}

/* Hero Section */
.sell-hero {
  background: linear-gradient(135deg, #171a20 0%, #1a56db 100%);
  color: white;
  padding: 8rem 2rem 5rem;
  text-align: center;
  position: relative;
}

.sell-hero-content {
  max-width: 800px;
  margin: 0 auto;
}

.sell-badge {
  background-color: rgba(255, 255, 255, 0.15);
  padding: 0.35rem 0.85rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  display: inline-block;
  margin-bottom: 1.25rem;
  border: 1px solid rgba(255, 255, 255, 0.25);
}

.sell-title {
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 700;
  margin-bottom: 1rem;
  line-height: 1.2;
}

.sell-subtitle {
  font-size: clamp(0.9rem, 2vw, 1.15rem);
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
}

.sell-content {
  margin-top: -3rem;
  position: relative;
  z-index: 5;
  max-width: 800px;
  padding: 0 1rem;
}

/* Card */
.sell-card {
  background-color: white;
  border-radius: 16px;
  padding: 2.5rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.02);
  border: 1px solid #e5e7eb;
}

.form-section-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 1.25rem;
  border-bottom: 1px solid #f3f4f6;
  padding-bottom: 0.5rem;
}

.section-subtitle-small {
  font-size: 0.85rem;
  color: var(--text-light);
  margin-top: -0.75rem;
  margin-bottom: 1rem;
}

.form-grid-2 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem;
}

.form-textarea {
  min-height: 120px;
  resize: vertical;
}

.form-actions-row {
  margin-top: 2.5rem;
  display: flex;
  justify-content: flex-end;
}

.btn-large {
  padding: 0.9rem 2rem;
  font-size: 0.95rem;
  font-weight: 600;
  width: 100%;
}

/* Drag & Drop */
.upload-dropzone {
  border: 2px dashed #d1d5db;
  background-color: #f9fafb;
  border-radius: 12px;
  padding: 2.5rem 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.25s ease;
  user-select: none;
}

.upload-dropzone:hover,
.upload-dropzone.dragging {
  border-color: #1a56db;
  background-color: rgba(26, 86, 219, 0.03);
}

.upload-prompt {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.upload-icon {
  font-size: 2.5rem;
  margin-bottom: 0.25rem;
}

.upload-text {
  font-size: 0.95rem;
  color: var(--text-secondary);
}

.upload-text strong {
  color: #1a56db;
}

.upload-formats {
  font-size: 0.75rem;
  color: var(--text-light);
}

/* Image Previews */
.image-previews-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 1rem;
  margin-top: 1.25rem;
}

.preview-item {
  width: 100%;
  aspect-ratio: 1;
  background-size: cover;
  background-position: center;
  border-radius: 8px;
  position: relative;
  border: 1px solid #e5e7eb;
}

.preview-item.uploading {
  background-color: #f3f4f6;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  color: var(--text-light);
  gap: 0.4rem;
}

.btn-remove-preview {
  position: absolute;
  top: -6px;
  right: -6px;
  background-color: #ef4444;
  color: white;
  border: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  font-size: 0.7rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0,0,0,0.15);
  transition: transform 0.2s ease;
}

.btn-remove-preview:hover {
  transform: scale(1.15);
  background-color: #dc2626;
}

/* Success Card */
.success-card {
  background-color: white;
  border-radius: 16px;
  padding: 3.5rem 2.5rem;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
  border: 1px solid #e5e7eb;
}

.success-icon {
  font-size: 4.5rem;
  margin-bottom: 1.5rem;
  animation: scale-up 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes scale-up {
  from { transform: scale(0.5); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.success-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #10b981;
  margin-bottom: 1rem;
}

.success-text {
  font-size: 1.05rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.success-note {
  font-size: 0.9rem;
  color: var(--text-light);
  max-width: 500px;
  margin: 0 auto 2.5rem;
  line-height: 1.5;
}

.success-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

/* Spinners */
.spinner-small {
  width: 24px;
  height: 24px;
  border: 2px solid #e5e7eb;
  border-top-color: #1a56db;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.spinner-inline {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  display: inline-block;
  margin-right: 6px;
  vertical-align: middle;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Mobile responsive */
@media (max-width: 600px) {
  .form-grid-2 {
    grid-template-columns: 1fr;
    gap: 0;
  }
  .sell-card {
    padding: 1.5rem;
  }
  .success-actions {
    flex-direction: column;
  }
  .success-actions .btn {
    width: 100%;
  }
}
</style>
