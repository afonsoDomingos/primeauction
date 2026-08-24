<template>
  <div class="admin-container">
    <div class="container animate-fade-in" style="padding-top: 105px; padding-bottom: 80px;">
      <div class="page-header">
        <h2 class="page-title">Painel de Administração</h2>
        <p class="page-subtitle">Gerencie leilões, utilizadores e toda a plataforma</p>
      </div>



      <!-- KPI Stats Row -->
      <div class="kpi-row">
        <div class="kpi-card">
          <div class="kpi-icon-wrap user-kpi">👥</div>
          <div class="kpi-info">
            <span class="kpi-label">Utilizadores</span>
            <h3 class="kpi-value">{{ users.length }}</h3>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon-wrap auction-kpi">🏷️</div>
          <div class="kpi-info">
            <span class="kpi-label">Total Leilões</span>
            <h3 class="kpi-value">{{ auctions.length }}</h3>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon-wrap active-kpi">⚡</div>
          <div class="kpi-info">
            <span class="kpi-label">Leilões Activos</span>
            <h3 class="kpi-value">{{ kpiStats.activeAuctions }}</h3>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon-wrap value-kpi">💰</div>
          <div class="kpi-info">
            <span class="kpi-label">Valorização</span>
            <h3 class="kpi-value">{{ formatCurrencyCompact(kpiStats.totalValueGenerated) }}</h3>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon-wrap ticket-kpi">✉</div>
          <div class="kpi-info">
            <span class="kpi-label">Tickets Pendentes</span>
            <h3 class="kpi-value">{{ kpiStats.pendingTickets }}</h3>
          </div>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="charts-row">
        <!-- Donut Chart: Leilões -->
        <div class="card chart-card">
          <h3 class="chart-title">📊 Estado dos Leilões</h3>
          <div class="chart-content">
            <div class="donut-wrapper">
              <svg width="100%" height="150" viewBox="0 0 120 120" class="donut-svg">
                <!-- Background circle -->
                <circle cx="60" cy="60" r="40" fill="transparent" stroke="#f3f4f6" stroke-width="10" />
                
                <!-- Active circle segment -->
                <circle 
                  v-if="donutStats.total > 0 && donutStats.activeCount > 0"
                  cx="60" 
                  cy="60" 
                  r="40" 
                  fill="transparent" 
                  stroke="var(--btn-primary-bg)" 
                  stroke-width="10" 
                  :stroke-dasharray="donutStats.activeDash"
                  stroke-dashoffset="0"
                  transform="rotate(-90 60 60)"
                  class="donut-segment active-segment"
                />
                
                <!-- Ended circle segment -->
                <circle 
                  v-if="donutStats.total > 0 && donutStats.endedCount > 0"
                  cx="60" 
                  cy="60" 
                  r="40" 
                  fill="transparent" 
                  stroke="#9ca3af" 
                  stroke-width="10" 
                  :stroke-dasharray="donutStats.endedDash"
                  :stroke-dashoffset="donutStats.endedOffset"
                  transform="rotate(-90 60 60)"
                  class="donut-segment ended-segment"
                />
                
                <!-- Inner Text -->
                <g class="donut-text">
                  <text x="60" y="58" class="donut-number" text-anchor="middle">{{ donutStats.total }}</text>
                  <text x="60" y="74" class="donut-label" text-anchor="middle">Leilões</text>
                </g>
              </svg>
            </div>
            
            <div class="donut-legend">
              <div class="legend-item">
                <span class="legend-dot active-dot"></span>
                <span class="legend-label">Activos</span>
                <span class="legend-value">{{ donutStats.activeCount }} ({{ donutStats.activePercent }}%)</span>
              </div>
              <div class="legend-item">
                <span class="legend-dot ended-dot"></span>
                <span class="legend-label">Terminados</span>
                <span class="legend-value">{{ donutStats.endedCount }} ({{ donutStats.endedPercent }}%)</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Bar Chart: Crescimento de Utilizadores -->
        <div class="card chart-card">
          <h3 class="chart-title">📈 Registos (Últimos 7 Dias)</h3>
          <div class="chart-content">
            <div class="bar-chart-wrapper">
              <svg width="100%" height="150" viewBox="0 0 300 120" class="bar-svg">
                <!-- X-Axis Line -->
                <line x1="10" y1="92" x2="290" y2="92" stroke="#e5e7eb" stroke-width="1" />
                
                <!-- Grid Lines -->
                <line x1="10" y1="52" x2="290" y2="52" stroke="#f3f4f6" stroke-dasharray="2 2" stroke-width="1" />
                <line x1="10" y1="12" x2="290" y2="12" stroke="#f3f4f6" stroke-dasharray="2 2" stroke-width="1" />

                <!-- Bars -->
                <g v-for="(bar, idx) in userRegistrationsStats" :key="idx" class="bar-group">
                  <!-- Bar Rect -->
                  <rect 
                    :x="20 + idx * 38" 
                    :y="92 - bar.heightPercent" 
                    width="22" 
                    :height="bar.heightPercent" 
                    rx="4" 
                    fill="url(#barGradient)" 
                    class="chart-bar"
                  />
                  <!-- Hover tooltip value inside/above bar -->
                  <text 
                    :x="31 + idx * 38" 
                    :y="87 - bar.heightPercent" 
                    class="bar-value" 
                    text-anchor="middle"
                  >
                    {{ bar.count }}
                  </text>
                  <!-- X-Axis label -->
                  <text 
                    :x="31 + idx * 38" 
                    y="105" 
                    class="bar-label" 
                    text-anchor="middle"
                  >
                    {{ bar.label }}
                  </text>
                  <!-- Small subtitle for date -->
                  <text 
                    :x="31 + idx * 38" 
                    y="115" 
                    class="bar-date-label" 
                    text-anchor="middle"
                  >
                    {{ bar.dateStr }}
                  </text>
                </g>

                <!-- Gradients -->
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="var(--btn-primary-bg)" />
                    <stop offset="100%" stop-color="#7b5ea7" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div class="dashboard-grid">

        <!-- ── Criar Leilão ── -->
        <div class="card admin-card">
          <div class="card-header-row">
            <span class="card-icon">➕</span>
            <h3 class="section-title">Criar Novo Leilão</h3>
          </div>
          <form @submit.prevent="handleCreate" class="create-form">
            <div class="form-row">
              <div class="form-group half">
                <label class="form-label">Título</label>
                <input type="text" v-model="form.title" class="form-input" placeholder="Nome do item" required />
              </div>
              <div class="form-group half">
                <label class="form-label">Preço Inicial (MZN)</label>
                <input type="number" v-model="form.startingPrice" class="form-input" placeholder="0" min="0" required />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group half">
                <label class="form-label">Categoria</label>
                <select v-model="form.category" class="form-input" required>
                  <option value="" disabled>Selecione uma categoria</option>
                  <option v-for="cat in categories" :key="cat._id" :value="cat.name">
                    {{ cat.name }}
                  </option>
                </select>
              </div>
              <div class="form-group half">
                <label class="form-label">Província / Localização 📍</label>
                <select v-model="form.location" class="form-input" required>
                  <option v-for="prov in provincesList" :key="prov" :value="prov">
                    {{ prov }}
                  </option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Imagens do Produto (Capa e Galeria)</label>
              <div class="image-upload-wrapper">
                <div class="upload-dropzone" @click="triggerImageUpload" title="Clique para carregar múltiplas imagens">
                  <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" style="margin-bottom: 0.5rem; color: var(--text-light)">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                  <span>Clique para carregar imagens (pode selecionar várias)</span>
                  <input type="file" ref="fileInput" multiple accept="image/*" style="display: none" @change="handleImagesUpload" />
                </div>
                
                <div v-if="uploadingImages" class="upload-progress-bar">
                  <div class="spinner-sm"></div>
                  <span>A enviar imagens para o Cloudinary...</span>
                </div>
              </div>
              
              <div style="margin-top: 0.75rem;">
                <label class="form-label-secondary" style="font-size:0.75rem; color:var(--text-light); display:block; margin-bottom:0.25rem;">Ou introduza a URL da capa manualmente:</label>
                <input type="url" v-model="form.imageUrl" class="form-input" placeholder="https://... (URL da imagem principal)" />
              </div>

              <!-- Uploaded Thumbnails list -->
              <div v-if="form.images && form.images.length > 0" class="uploaded-thumbnails-grid">
                <div 
                  v-for="(imgUrl, idx) in form.images" 
                  :key="idx" 
                  class="thumb-wrapper"
                  :class="{ 'is-cover': form.imageUrl === imgUrl }"
                >
                  <img :src="imgUrl" class="thumb-img" alt="Miniatura" />
                  <button type="button" class="btn-remove-thumb" @click="removeImage(idx)" title="Remover imagem">×</button>
                  <button type="button" class="btn-set-cover" @click="setCoverImage(imgUrl)" title="Definir como imagem de capa">
                    {{ form.imageUrl === imgUrl ? '★ Principal' : 'Definir Capa' }}
                  </button>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Descrição</label>
              <textarea v-model="form.description" class="form-input" rows="3" placeholder="Descreva o item..." required></textarea>
            </div>

            <div class="form-group-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.25rem;">
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">Data e Hora de Início (opcional)</label>
                <input type="datetime-local" v-model="form.startTime" class="form-input" />
                <small class="form-help" style="font-size: 0.75rem; color: #666; margin-top: 0.25rem; display: block;">Vazio = Inicia imediatamente</small>
              </div>
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">Data e Hora de Fim</label>
                <input type="datetime-local" v-model="form.endTime" class="form-input" required />
              </div>
            </div>

            <button type="submit" class="btn btn-primary btn-pill" :disabled="creating">
              {{ creating ? 'A criar...' : '✓ Criar Leilão' }}
            </button>
          </form>
        </div>

        <!-- ── Propostas de Venda ── -->
        <div class="card admin-card">
          <div class="card-header-row">
            <span class="card-icon">📦</span>
            <h3 class="section-title">Propostas de Venda</h3>
            <span class="record-count">{{ proposals.length }}</span>
          </div>
          <p class="settings-hint">Análise propostas enviadas por utilizadores para leilões e aprove para convertê-las em leilões activos.</p>
          
          <div class="table-container">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Artigo</th>
                  <th>Contacto</th>
                  <th>Valor</th>
                  <th>Estado</th>
                  <th>Acções</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="proposals.length === 0">
                  <td colspan="5" class="empty-row">Nenhuma proposta de venda recebida.</td>
                </tr>
                <tr v-for="prop in proposals" :key="prop._id">
                  <td>
                    <div style="display: flex; gap: 0.5rem; align-items: center;">
                      <img v-if="prop.images && prop.images[0]" :src="prop.images[0]" style="width: 40px; height: 40px; border-radius: 4px; object-fit: cover;" />
                      <div style="display: flex; flex-direction: column;">
                        <span style="font-weight: 600; font-size: 0.85rem;">{{ prop.title }}</span>
                        <span style="font-size: 0.75rem; color: var(--text-light)">{{ prop.category }} &bull; {{ prop.condition }}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style="display: flex; flex-direction: column; font-size: 0.8rem; gap: 2px;">
                      <span>👤 {{ prop.user?.name }}</span>
                      <span>📞 {{ prop.contactPhone }}</span>
                    </div>
                  </td>
                  <td class="price-cell">{{ formatCurrency(prop.estimatedValue) }}</td>
                  <td>
                    <span :class="['badge', prop.status === 'approved' ? 'badge-active' : (prop.status === 'pending' ? 'badge-upcoming' : 'badge-ended')]">
                      {{ prop.status === 'pending' ? 'Pendente' : (prop.status === 'approved' ? 'Aprovado' : 'Rejeitado') }}
                    </span>
                  </td>
                  <td>
                    <div class="action-btns" v-if="prop.status === 'pending'">
                      <button @click="approveProposalAndPrefill(prop)" class="btn btn-sm btn-primary">Aprovar & Criar</button>
                      <button @click="rejectProposal(prop)" class="btn btn-sm btn-danger">Rejeitar</button>
                    </div>
                    <span v-else style="font-size: 0.8rem; color: var(--text-light); font-style: italic;">
                      {{ prop.status === 'approved' ? 'Aprovado' : 'Rejeitado' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- ── Utilizadores ── -->
        <div class="card admin-card">
          <div class="card-header-row">
            <span class="card-icon">👥</span>
            <h3 class="section-title">Gerir Utilizadores</h3>
            <span class="record-count">{{ users.length }}</span>
          </div>
          <div class="table-container">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Estado</th>
                  <th>Acção</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="users.length === 0">
                  <td colspan="4" class="empty-row">Nenhum utilizador encontrado.</td>
                </tr>
                <tr v-for="user in users" :key="user._id">
                  <td>
                    <div class="user-cell">
                      <div class="user-avatar">
                        <img v-if="user.profilePhoto" :src="user.profilePhoto" alt="Avatar" class="user-avatar-img" />
                        <span v-else>{{ user.name?.charAt(0)?.toUpperCase() }}</span>
                      </div>
                      <div>
                        <span class="user-name">{{ user.name }}</span>
                        <span v-if="user.role === 'admin'" class="badge badge-admin">Admin</span>
                      </div>
                    </div>
                  </td>
                  <td class="email-cell">{{ user.email }}</td>
                  <td>
                    <span :class="['badge', user.status === 'active' ? 'badge-active' : 'badge-blocked']">
                      {{ user.status === 'active' ? 'Activo' : 'Bloqueado' }}
                    </span>
                  </td>
                  <td>
                    <button
                      v-if="user._id !== authStore.user?.id"
                      @click="toggleBlock(user._id)"
                      :class="['btn', 'btn-sm', user.status === 'active' ? 'btn-danger' : 'btn-primary']"
                    >
                      {{ user.status === 'active' ? 'Bloquear' : 'Desbloquear' }}
                    </button>
                    <span v-else class="you-badge">Você</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- ── Pagamentos M-Pesa ── -->
        <div class="card admin-card">
          <div class="card-header-row" style="display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span class="card-icon" style="background: #e60000; color: white; border-radius: 50%; width: 28px; height: 28px; display: inline-flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 900;">M</span>
              <h3 class="section-title">Controlo de Transações M-Pesa</h3>
              <span class="record-count">{{ mpesaPayments.length }}</span>
            </div>
            <span style="background: #e60000; color: white; font-size: 0.75rem; font-weight: 700; padding: 0.2rem 0.6rem; border-radius: 99px;">
              Vodacom M-Pesa Sandbox C2B
            </span>
          </div>
          <div class="table-container">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Utilizador / Cliente</th>
                  <th>Leilão / Artigo</th>
                  <th>ID Transação M-Pesa</th>
                  <th>Referência</th>
                  <th>Telemóvel</th>
                  <th>Valor Pago</th>
                  <th>Estado</th>
                  <th>Data</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="mpesaPayments.length === 0">
                  <td colspan="8" class="empty-row">Nenhum pagamento M-Pesa registado até ao momento.</td>
                </tr>
                <tr v-for="pay in mpesaPayments" :key="pay._id">
                  <td>
                    <div style="display: flex; flex-direction: column;">
                      <strong style="font-size: 0.85rem;">{{ pay.user?.name || 'Cliente' }}</strong>
                      <span style="font-size: 0.75rem; color: var(--text-light)">{{ pay.user?.email }}</span>
                    </div>
                  </td>
                  <td>
                    <span style="font-weight: 600; font-size: 0.85rem;">{{ pay.auction?.title || 'Leilão' }}</span>
                  </td>
                  <td><code style="color: #e60000; font-weight: 700; background: #fff1f2; padding: 0.2rem 0.4rem; border-radius: 4px;">{{ pay.mpesaTransactionId }}</code></td>
                  <td>{{ pay.reference }}</td>
                  <td>{{ pay.phoneNumber }}</td>
                  <td class="price-cell" style="color: #16a34a; font-weight: 700;">{{ formatCurrency(pay.amount) }}</td>
                  <td>
                    <span :class="['badge', pay.status === 'completed' ? 'badge-active' : 'badge-upcoming']">
                      {{ pay.status === 'completed' ? 'COMPLETADO ✓' : 'PENDENTE' }}
                    </span>
                  </td>
                  <td>{{ new Date(pay.createdAt).toLocaleString('pt-MZ') }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- ── Leilões ── -->
        <div class="card admin-card" style="grid-column: 1 / -1;">
          <div class="card-header-row">
            <span class="card-icon">🏷️</span>
            <h3 class="section-title">Gerir Todos os Leilões</h3>
            <span class="record-count">{{ filteredAuctions.length }} / {{ auctions.length }}</span>
          </div>
          
          <!-- Filtros e Busca -->
          <div class="auction-filters-bar">
            <div class="filter-group">
              <input 
                type="text" 
                v-model="auctionSearchQuery" 
                placeholder="🔍 Buscar leilões..." 
                class="filter-input"
              />
            </div>
            <div class="filter-group">
              <select v-model="auctionStatusFilter" class="filter-select">
                <option value="">Todos os Estados</option>
                <option value="active">Activos</option>
                <option value="upcoming">Agendados</option>
                <option value="finished">Terminados</option>
              </select>
            </div>
            <div class="filter-group">
              <select v-model="auctionCategoryFilter" class="filter-select">
                <option value="">Todas as Categorias</option>
                <option v-for="cat in categories" :key="cat._id" :value="cat.name">
                  {{ cat.name }}
                </option>
              </select>
            </div>
            <div class="filter-group">
              <select v-model="auctionLocationFilter" class="filter-select">
                <option value="">Todas as Localizações</option>
                <option v-for="prov in provincesList" :key="prov" :value="prov">
                  {{ prov }}
                </option>
              </select>
            </div>
            <button @click="clearAuctionFilters" class="btn btn-sm btn-secondary">Limpar Filtros</button>
          </div>

          <div class="table-container">
            <table class="admin-table auctions-table">
              <thead>
                <tr>
                  <th style="width: 40px;">Img</th>
                  <th>Título</th>
                  <th>Categoria</th>
                  <th>Localização</th>
                  <th>Estado</th>
                  <th>Preço Inicial</th>
                  <th>Lance Actual</th>
                  <th>Data Início</th>
                  <th>Data Fim</th>
                  <th>Lances</th>
                  <th>Acções</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="filteredAuctions.length === 0">
                  <td colspan="11" class="empty-row">Nenhum leilão encontrado com os filtros actuais.</td>
                </tr>
                <tr v-for="auction in filteredAuctions" :key="auction._id" class="auction-row">
                  <td class="image-cell">
                    <img :src="auction.imageUrl" :alt="auction.title" class="auction-thumb" />
                  </td>
                  <td class="auction-title-cell">
                    <div class="auction-title-main">{{ auction.title }}</div>
                    <div class="auction-id">ID: {{ auction._id.toString().slice(-6) }}</div>
                  </td>
                  <td class="category-cell">{{ auction.category }}</td>
                  <td class="location-cell">{{ auction.location }}</td>
                  <td>
                    <span :class="['badge', auction.status === 'active' ? 'badge-active' : (auction.status === 'upcoming' ? 'badge-upcoming' : 'badge-ended')]">
                      {{ auction.status === 'active' ? 'Activo' : (auction.status === 'upcoming' ? 'Agendado' : 'Terminado') }}
                    </span>
                  </td>
                  <td class="price-cell">{{ formatCurrency(auction.startingPrice) }}</td>
                  <td class="price-cell">{{ formatCurrency(auction.currentPrice) }}</td>
                  <td class="date-cell">{{ formatDate(auction.startTime) }}</td>
                  <td class="date-cell">{{ formatDate(auction.endTime) }}</td>
                  <td class="bids-count">{{ auction.bids?.length || 0 }}</td>
                  <td>
                    <div class="action-btns">
                      <button
                        @click="openEditModal(auction)"
                        class="btn btn-sm btn-primary"
                        title="Editar leilão"
                      >✏️</button>
                      <button
                        v-if="auction.status === 'active'"
                        @click="openExtendModal(auction)"
                        class="btn btn-sm btn-extend"
                        title="Estender prazo do leilão"
                      >⏱</button>
                      <button
                        v-if="auction.status === 'active'"
                        @click="endAuction(auction._id)"
                        class="btn btn-sm btn-warning"
                        title="Terminar leilão"
                      >🛑</button>
                      <button
                        @click="deleteAuction(auction._id)"
                        class="btn btn-sm btn-danger"
                        title="Apagar leilão"
                      >🗑️</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- ── Gerir Página Inicial ── -->
        <div class="card admin-card">
          <div class="card-header-row">
            <span class="card-icon">🏠</span>
            <h3 class="section-title">Gerir Página Inicial</h3>
          </div>
          <p class="settings-hint">Personalize o conteúdo visível na página inicial da plataforma sem precisar alterar o código.</p>

          <div class="home-settings-layout">
            <!-- Left: Text fields -->
            <div class="home-settings-fields">
              <div class="form-group">
                <label class="form-label">Título Principal (Hero)</label>
                <input type="text" v-model="homepageForm.heroTitle" class="form-input" placeholder="Ex: Prime Auctions" />
              </div>
              <div class="form-group">
                <label class="form-label">Subtítulo / Descrição</label>
                <textarea v-model="homepageForm.heroSubtitle" class="form-input" rows="3" placeholder="Ex: Leilões Exclusivos. Preços Competitivos."></textarea>
              </div>
              
              <!-- Desktop Images Group -->
              <div class="settings-group-card">
                <span class="group-title-label">🖥️ Imagens para Desktop / Geral</span>
                
                <div class="form-group">
                  <div style="display: flex; gap: 0.5rem;">
                    <input type="url" v-model="manualHeroImageUrl" class="form-input" placeholder="https://... (URL da imagem)" style="margin-bottom: 0;" />
                    <button type="button" class="btn btn-pill" @click="addManualHeroImageUrl" style="flex-shrink: 0; padding: 0 1rem; height: 42px; background-color: var(--text-primary); color: white; border: none; font-size: 0.75rem; font-weight: 600;">Adicionar</button>
                  </div>
                </div>

                <div class="form-group">
                  <div class="upload-dropzone" @click="triggerHeroImageUpload" title="Clique para carregar imagens do hero">
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--text-light); margin-bottom: 0.2rem;">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                    <span style="font-size: 0.8rem;">{{ uploadingHeroImage ? 'A enviar...' : 'Carregar fotos para Desktop' }}</span>
                    <input type="file" ref="heroImageInput" multiple accept="image/*" style="display: none" @change="handleHeroImageUpload" />
                  </div>
                </div>

                <!-- Desktop slide list -->
                <div v-if="homepageForm.heroImageUrls && homepageForm.heroImageUrls.length > 0" class="uploaded-thumbnails-grid" style="margin-top: 0.5rem; margin-bottom: 0.5rem;">
                  <div v-for="(imgUrl, idx) in homepageForm.heroImageUrls" :key="idx" class="thumb-wrapper" style="aspect-ratio: 16/9; height: auto;">
                    <img :src="imgUrl" class="thumb-img" style="height: 100%; width: 100%; object-fit: cover;" alt="Desktop Hero" />
                    <button type="button" class="btn-remove-thumb" @click="removeHeroImage(idx)" title="Remover">×</button>
                  </div>
                </div>
              </div>

              <!-- Mobile Images Group -->
              <div class="settings-group-card" style="margin-top: 1rem; margin-bottom: 1.5rem;">
                <span class="group-title-label">📱 Imagens para Telemóvel / Mobile</span>
                
                <div class="form-group">
                  <div style="display: flex; gap: 0.5rem;">
                    <input type="url" v-model="manualHeroMobileImageUrl" class="form-input" placeholder="https://... (URL da imagem)" style="margin-bottom: 0;" />
                    <button type="button" class="btn btn-pill" @click="addManualHeroMobileImageUrl" style="flex-shrink: 0; padding: 0 1rem; height: 42px; background-color: var(--text-primary); color: white; border: none; font-size: 0.75rem; font-weight: 600;">Adicionar</button>
                  </div>
                </div>

                <div class="form-group">
                  <div class="upload-dropzone" @click="triggerHeroMobileImageUpload" title="Clique para carregar imagens mobile">
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--text-light); margin-bottom: 0.2rem;">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                    <span style="font-size: 0.8rem;">{{ uploadingHeroMobileImage ? 'A enviar...' : 'Carregar fotos para Telemóvel' }}</span>
                    <input type="file" ref="heroMobileImageInput" multiple accept="image/*" style="display: none" @change="handleHeroMobileImageUpload" />
                  </div>
                </div>

                <!-- Mobile slide list -->
                <div v-if="homepageForm.heroMobileImageUrls && homepageForm.heroMobileImageUrls.length > 0" class="uploaded-thumbnails-grid" style="margin-top: 0.5rem; margin-bottom: 0.5rem;">
                  <div v-for="(imgUrl, idx) in homepageForm.heroMobileImageUrls" :key="idx" class="thumb-wrapper" style="aspect-ratio: 9/16; height: auto; max-width: 60px;">
                    <img :src="imgUrl" class="thumb-img" style="height: 100%; width: 100%; object-fit: cover;" alt="Mobile Hero" />
                    <button type="button" class="btn-remove-thumb" @click="removeHeroMobileImage(idx)" title="Remover">×</button>
                  </div>
                </div>
              </div>

              <button class="btn btn-primary btn-pill" @click="saveHomepageSettings" :disabled="savingHomepage">
                <span v-if="savingHomepage" class="btn-spinner"></span>
                {{ savingHomepage ? 'A guardar...' : '💾 Guardar Configurações da Home' }}
              </button>
            </div>

            <!-- Right: Live Preview -->
            <div class="home-settings-preview">
              <p class="preview-label">Pré-visualização (Carrossel Activo)</p>
              
              <!-- Preview Viewport Switcher -->
              <div class="preview-mode-selector">
                <button 
                  type="button" 
                  class="btn-mode" 
                  :class="{ active: previewMode === 'desktop' }" 
                  @click="previewMode = 'desktop'"
                >🖥️ Desktop</button>
                <button 
                  type="button" 
                  class="btn-mode" 
                  :class="{ active: previewMode === 'mobile' }" 
                  @click="previewMode = 'mobile'"
                >📱 Telemóvel</button>
              </div>

              <div
                class="hero-preview"
                :class="{ 'is-mobile-preview': previewMode === 'mobile' }"
                :style="{ backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.6) 100%), url(${activePreviewImage})` }"
              >
                <p class="preview-eyebrow">Plataforma de Leilões #1 em Moçambique</p>
                <h2 class="preview-title">{{ homepageForm.heroTitle || 'Prime Auctions' }}</h2>
                <p class="preview-subtitle">{{ homepageForm.heroSubtitle || 'Leilões Exclusivos. Preços Competitivos.' }}</p>
              </div>
            </div>
          </div>
        </div>

      </div>

        <!-- ── Gerir Parceiros ── -->
        <div class="card admin-card">
          <div class="card-header-row">
            <span class="card-icon">🤝</span>
            <h3 class="section-title">Gerir Parceiros</h3>
            <span class="record-count">{{ partnersForm.length }}</span>
          </div>
          <p class="settings-hint">Adicione, edite ou remova os logótipos e nomes dos parceiros visíveis na página inicial.</p>

          <!-- Existing Partners List -->
          <div v-if="partnersForm.length > 0" class="partners-admin-list">
            <div v-for="(partner, idx) in partnersForm" :key="idx" class="partner-admin-item">
              <!-- Logo Preview -->
              <div class="partner-logo-preview">
                <img v-if="partner.logoUrl" :src="partner.logoUrl" :alt="partner.name" class="partner-logo-img" />
                <div v-else class="partner-logo-placeholder">{{ partner.name?.charAt(0) }}</div>
              </div>

              <!-- Fields -->
              <div class="partner-fields">
                <input type="text" v-model="partner.name" class="form-input partner-input" placeholder="Nome do Parceiro" />
                <input type="text" v-model="partner.description" class="form-input partner-input" placeholder="Descrição (ex: Seguros, Financiamento...)" />
                <div style="display: flex; gap: 0.5rem; align-items: center;">
                  <input type="url" v-model="partner.logoUrl" class="form-input partner-input" placeholder="URL do Logótipo" style="margin-bottom: 0;" />
                  <button type="button" @click="triggerPartnerLogoUpload(idx)" class="btn btn-sm" style="flex-shrink: 0; white-space: nowrap; background: #f3f4f6; border: 1px solid #e5e7eb; color: var(--text-secondary); font-size:0.75rem;">📂 Carregar</button>
                  <input type="file" :ref="el => partnerFileInputs[idx] = el" accept="image/*" style="display:none" @change="handlePartnerLogoUpload($event, idx)" />
                </div>
              </div>

              <!-- Remove Button -->
              <button type="button" @click="removePartner(idx)" class="btn btn-sm btn-danger" style="flex-shrink:0; align-self: flex-start;">✕</button>
            </div>
          </div>

          <div v-else class="empty-partners-hint">Ainda não existem parceiros. Adicione o primeiro abaixo.</div>

          <!-- Add New Partner -->
          <div class="add-partner-row">
            <button type="button" @click="addPartner" class="btn btn-secondary btn-pill btn-sm">+ Adicionar Parceiro</button>
            <button type="button" @click="savePartners" :disabled="savingPartners" class="btn btn-primary btn-pill btn-sm">
              <span v-if="savingPartners" class="btn-spinner"></span>
              {{ savingPartners ? 'A guardar...' : '💾 Guardar Parceiros' }}
            </button>
          </div>
        </div>

        <!-- ── Gerir Suporte (Tickets) ── -->
        <div class="card admin-card">
          <div class="card-header-row">
            <span class="card-icon">✉</span>
            <h3 class="section-title">Tickets de Suporte</h3>
            <span class="record-count">{{ tickets.length }}</span>
          </div>
          <p class="settings-hint">Visualize e faça a gestão dos pedidos de contacto submetidos pelo assistente virtual de chat.</p>

          <div class="table-container">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Contacto</th>
                  <th>Mensagem</th>
                  <th>Data</th>
                  <th>Estado</th>
                  <th>Acções</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="tickets.length === 0">
                  <td colspan="5" class="empty-row">Nenhum ticket de suporte encontrado.</td>
                </tr>
                <tr v-for="ticket in tickets" :key="ticket._id">
                  <td>
                    <div style="display: flex; flex-direction: column; gap: 2px;">
                      <span v-if="ticket.email" style="font-weight: 600; font-size: 0.85rem; color: var(--text-primary);">📧 {{ ticket.email }}</span>
                      <span v-if="ticket.phone" style="font-size: 0.8rem; color: var(--text-light);">📞 {{ ticket.phone }}</span>
                      <span v-if="!ticket.email && !ticket.phone" style="font-style: italic; font-size: 0.8rem; color: var(--text-light);">Anónimo</span>
                    </div>
                  </td>
                  <td style="max-width: 300px; white-space: normal; word-break: break-all; font-size: 0.85rem;">
                    {{ ticket.message }}
                  </td>
                  <td style="font-size: 0.8rem; color: var(--text-light); white-space: nowrap;">
                    {{ formatTicketDate(ticket.createdAt) }}
                  </td>
                  <td>
                    <span :class="['badge', ticket.status === 'resolved' ? 'badge-active' : 'badge-ended']" style="font-size: 0.7rem;">
                      {{ ticket.status === 'resolved' ? 'Resolvido' : 'Pendente' }}
                    </span>
                  </td>
                  <td>
                    <div class="action-btns">
                      <button
                        @click="toggleTicketStatus(ticket._id, ticket.status)"
                        :class="['btn', 'btn-sm', ticket.status === 'resolved' ? 'btn-secondary' : 'btn-primary']"
                        style="padding: 0.25rem 0.5rem; font-size: 0.75rem;"
                      >
                        {{ ticket.status === 'resolved' ? 'Reabrir' : '✓ Resolver' }}
                      </button>
                      <button
                        @click="confirmDeleteTicket(ticket._id)"
                        class="btn btn-sm btn-danger"
                        style="padding: 0.25rem 0.5rem; font-size: 0.75rem;"
                      >
                        Apagar
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- ── Subscritores da Newsletter ── -->
        <div class="card admin-card">
          <div class="card-header-row">
            <span class="card-icon">✉</span>
            <h3 class="section-title">Subscritores da Newsletter</h3>
            <span class="record-count">{{ activeSubscribersCount }} / {{ subscribers.length }}</span>
          </div>
          <p class="settings-hint">Gerencie a lista de e-mails subscritos na newsletter para campanhas e comunicações.</p>

          <!-- Search Filter -->
          <div style="margin-bottom: 1.25rem; max-width: 350px;">
            <input 
              type="text" 
              v-model="subscriberSearchQuery" 
              class="form-input" 
              placeholder="Pesquisar subscritor por e-mail..." 
              style="margin-bottom: 0;"
            />
          </div>

          <div class="table-container">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>E-mail</th>
                  <th>Data de Subscrição</th>
                  <th>Estado</th>
                  <th>Acções</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="filteredSubscribers.length === 0">
                  <td colspan="4" class="empty-row">Nenhum subscritor encontrado.</td>
                </tr>
                <tr v-for="sub in filteredSubscribers" :key="sub._id">
                  <td style="font-weight: 600; font-size: 0.85rem; color: var(--text-primary);">
                    📧 {{ sub.email }}
                  </td>
                  <td style="font-size: 0.8rem; color: var(--text-light); white-space: nowrap;">
                    {{ formatTicketDate(sub.createdAt) }}
                  </td>
                  <td>
                    <span :class="['badge', sub.active ? 'badge-active' : 'badge-blocked']" style="font-size: 0.7rem;">
                      {{ sub.active ? 'Activo' : 'Inactivo' }}
                    </span>
                  </td>
                  <td>
                    <div class="action-btns">
                      <button
                        @click="toggleSubscriber(sub._id)"
                        :class="['btn', 'btn-sm', sub.active ? 'btn-secondary' : 'btn-primary']"
                        style="padding: 0.25rem 0.5rem; font-size: 0.75rem;"
                      >
                        {{ sub.active ? 'Desactivar' : 'Activar' }}
                      </button>
                      <button
                        @click="confirmDeleteSubscriber(sub._id)"
                        class="btn btn-sm btn-danger"
                        style="padding: 0.25rem 0.5rem; font-size: 0.75rem;"
                      >
                        Apagar
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

    </div>

    <!-- Custom Confirmation Modal -->
    <Transition name="modal-fade">
      <div v-if="showConfirmModal" class="custom-modal-overlay" @click.self="closeConfirm">
        <div class="custom-modal-card animate-scale-in">
          <div class="modal-header-row">
            <span class="modal-title-icon">⚠️</span>
            <h4>{{ confirmTitle }}</h4>
          </div>
          <div class="modal-body">
            <p>{{ confirmMessage }}</p>
          </div>
          <div class="modal-footer">
            <button type="button" @click="closeConfirm" class="btn btn-secondary btn-pill btn-sm">Cancelar</button>
            <button type="button" @click="executeConfirm" class="btn btn-pill btn-sm" :class="confirmBtnClass">
              {{ confirmBtnText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Extend Auction Modal -->
    <Transition name="modal-fade">
      <div v-if="showExtendModal" class="custom-modal-overlay" @click.self="closeExtendModal">
        <div class="custom-modal-card extend-modal-card animate-scale-in">
          <div class="modal-header-row">
            <span class="modal-title-icon">⏱</span>
            <h4>Estender Leilão</h4>
            <button type="button" class="wizard-close-btn" @click="closeExtendModal" aria-label="Fechar">✕</button>
          </div>
          <div class="modal-body">
            <p class="extend-auction-name">📦 {{ extendTargetAuction?.title }}</p>
            <p class="extend-current-end">
              Termina actualmente em:
              <strong>{{ extendTargetAuction ? new Date(extendTargetAuction.endTime).toLocaleString('pt-MZ') : '' }}</strong>
            </p>

            <div class="extend-quick-btns">
              <span class="extend-label">Adicionar rapidamente:</span>
              <div class="extend-preset-row">
                <button type="button" class="btn-extend-preset" @click="applyPreset(1)">+1 hora</button>
                <button type="button" class="btn-extend-preset" @click="applyPreset(6)">+6 horas</button>
                <button type="button" class="btn-extend-preset" @click="applyPreset(24)">+1 dia</button>
                <button type="button" class="btn-extend-preset" @click="applyPreset(72)">+3 dias</button>
                <button type="button" class="btn-extend-preset" @click="applyPreset(168)">+7 dias</button>
              </div>
            </div>

            <div class="form-group" style="margin-top: 1.25rem;">
              <label class="form-label">Ou definir data/hora exacta:</label>
              <input
                type="datetime-local"
                v-model="extendCustomDateTime"
                class="form-input"
                :min="minExtendDateTime"
              />
            </div>

            <p v-if="extendCustomDateTime" class="extend-preview">
              ✅ Nova data de término: <strong>{{ new Date(extendCustomDateTime).toLocaleString('pt-MZ') }}</strong>
            </p>
          </div>
          <div class="modal-footer">
            <button type="button" @click="closeExtendModal" class="btn btn-secondary btn-pill btn-sm">Cancelar</button>
            <button
              type="button"
              @click="submitExtendAuction"
              class="btn btn-primary btn-pill btn-sm"
              :disabled="!extendCustomDateTime || extendingAuction"
            >
              <span v-if="extendingAuction" class="btn-spinner"></span>
              {{ extendingAuction ? 'A guardar...' : '✓ Confirmar Extensão' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Edit Auction Modal -->
    <Transition name="modal-fade">
      <div v-if="showEditModal" class="custom-modal-overlay" @click.self="closeEditModal">
        <div class="custom-modal-card extend-modal-card animate-scale-in" style="max-width: 680px; width: 90%;">
          <div class="modal-header-row">
            <span class="modal-title-icon">✏️</span>
            <h4>Editar Leilão</h4>
            <button type="button" class="wizard-close-btn" @click="closeEditModal" aria-label="Fechar">✕</button>
          </div>
          
          <form @submit.prevent="submitEditAuction" class="modal-body" style="display: flex; flex-direction: column; gap: 1rem; max-height: 75vh; overflow-y: auto; padding-right: 0.5rem; text-align: left;">
            <!-- Title & Category & Location -->
            <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem;">
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">Título</label>
                <input type="text" v-model="editForm.title" class="form-input" required />
              </div>
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">Categoria</label>
                <select v-model="editForm.category" class="form-input" required>
                  <option v-for="cat in categories" :key="cat._id" :value="cat.name">
                    {{ cat.name }}
                  </option>
                </select>
              </div>
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">Província 📍</label>
                <select v-model="editForm.location" class="form-input" required>
                  <option v-for="prov in provincesList" :key="prov" :value="prov">
                    {{ prov }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Prices -->
            <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">Preço Inicial (MZN)</label>
                <input type="number" v-model.number="editForm.startingPrice" class="form-input" min="0" required />
              </div>
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">Preço Actual (MZN)</label>
                <input type="number" v-model.number="editForm.currentPrice" class="form-input" min="0" required />
              </div>
            </div>

            <!-- Description -->
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label">Descrição</label>
              <textarea v-model="editForm.description" class="form-input" rows="3" required></textarea>
            </div>

            <!-- Images Upload -->
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label">Imagens do Produto (Capa e Galeria)</label>
              <div class="image-upload-wrapper">
                <div class="upload-dropzone" @click="triggerEditImageUpload" title="Clique para carregar novas imagens">
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" style="margin-bottom: 0.25rem; color: var(--text-light)">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                  <span>{{ uploadingEditImages ? 'A enviar...' : 'Clique para carregar/adicionar imagens' }}</span>
                  <input type="file" ref="editFileInput" multiple accept="image/*" style="display: none" @change="handleEditImagesUpload" />
                </div>
              </div>

              <div style="margin-top: 0.5rem;">
                <label class="form-label-secondary" style="font-size:0.75rem; color:var(--text-light); display:block; margin-bottom:0.25rem;">URL da imagem principal (Capa):</label>
                <input type="url" v-model="editForm.imageUrl" class="form-input" placeholder="https://..." />
              </div>

              <!-- Uploaded Thumbnails list -->
              <div v-if="editForm.images && editForm.images.length > 0" class="uploaded-thumbnails-grid" style="margin-top: 0.5rem;">
                <div 
                  v-for="(imgUrl, idx) in editForm.images" 
                  :key="idx" 
                  class="thumb-wrapper"
                  :class="{ 'is-cover': editForm.imageUrl === imgUrl }"
                >
                  <img :src="imgUrl" class="thumb-img" alt="Miniatura" />
                  <button type="button" class="btn-remove-thumb" @click="removeEditImage(idx)" title="Remover imagem">×</button>
                  <button type="button" class="btn-set-cover" @click="setEditCoverImage(imgUrl)" title="Definir como imagem de capa">
                    {{ editForm.imageUrl === imgUrl ? '★ Principal' : 'Definir Capa' }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Dates & Status -->
            <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.75rem;">
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">Início</label>
                <input type="datetime-local" v-model="editForm.startTime" class="form-input" />
              </div>
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">Fim</label>
                <input type="datetime-local" v-model="editForm.endTime" class="form-input" required />
              </div>
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">Estado</label>
                <select v-model="editForm.status" class="form-input">
                  <option value="active">Activo</option>
                  <option value="upcoming">Agendado</option>
                  <option value="ended">Terminado</option>
                </select>
              </div>
            </div>

            <div class="modal-footer" style="padding-top: 0.75rem; border-top: 1px solid #e5e7eb; margin-top: 0.5rem;">
              <button type="button" @click="closeEditModal" class="btn btn-secondary btn-pill btn-sm">Cancelar</button>
              <button type="submit" class="btn btn-primary btn-pill btn-sm" :disabled="updatingAuction">
                <span v-if="updatingAuction" class="btn-spinner"></span>
                {{ updatingAuction ? 'A guardar...' : '💾 Guardar Alterações' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import axios from 'axios';
import { useAuthStore } from '../stores/authStore';
import { useToastStore } from '../stores/toastStore';

const authStore = useAuthStore();
const toastStore = useToastStore();
const users = ref([]);

// ── Partners ──
const defaultPartners = [
  { name: 'BCI',            description: 'Apoio Financeiro', logoUrl: '' },
  { name: 'Millennium bim', description: '',                  logoUrl: '' },
  { name: 'Standard Bank',  description: '',                  logoUrl: '' },
  { name: 'Santam',         description: 'Seguros',           logoUrl: '' },
  { name: 'MFC',            description: 'Financiamento',     logoUrl: '' }
];
const partnersForm = ref([]);
const savingPartners = ref(false);
const partnerFileInputs = ref([]);
const auctions = ref([]);
const tickets = ref([]);
const proposals = ref([]);
const proposalBeingConverted = ref(null);

// ── Auction Filters ──
const auctionSearchQuery = ref('');
const auctionStatusFilter = ref('');
const auctionCategoryFilter = ref('');
const auctionLocationFilter = ref('');

const filteredAuctions = computed(() => {
  return auctions.value.filter(auction => {
    const matchesSearch = !auctionSearchQuery.value || 
      auction.title.toLowerCase().includes(auctionSearchQuery.value.toLowerCase()) ||
      auction.description.toLowerCase().includes(auctionSearchQuery.value.toLowerCase());
    
    const matchesStatus = !auctionStatusFilter.value || auction.status === auctionStatusFilter.value;
    const matchesCategory = !auctionCategoryFilter.value || auction.category === auctionCategoryFilter.value;
    const matchesLocation = !auctionLocationFilter.value || auction.location === auctionLocationFilter.value;
    
    return matchesSearch && matchesStatus && matchesCategory && matchesLocation;
  });
});

const clearAuctionFilters = () => {
  auctionSearchQuery.value = '';
  auctionStatusFilter.value = '';
  auctionCategoryFilter.value = '';
  auctionLocationFilter.value = '';
};

// ── Homepage Settings ──
const defaultHeroImage = 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80';
const homepageForm = ref({ heroTitle: '', heroSubtitle: '', heroImageUrl: '', heroImageUrls: [], heroMobileImageUrls: [] });
const manualHeroImageUrl = ref('');
const manualHeroMobileImageUrl = ref('');
const savingHomepage = ref(false);
const uploadingHeroImage = ref(false);
const uploadingHeroMobileImage = ref(false);
const heroImageInput = ref(null);
const heroMobileImageInput = ref(null);
const previewActiveIndex = ref(0);
const previewMode = ref('desktop');
let previewIntervalId = null;

const activePreviewImage = computed(() => {
  const isMob = previewMode.value === 'mobile';
  const urls = isMob ? homepageForm.value.heroMobileImageUrls : homepageForm.value.heroImageUrls;
  if (urls && urls.length > 0) {
    return urls[previewActiveIndex.value % urls.length];
  }
  if (isMob && homepageForm.value.heroImageUrls && homepageForm.value.heroImageUrls.length > 0) {
    return homepageForm.value.heroImageUrls[previewActiveIndex.value % homepageForm.value.heroImageUrls.length];
  }
  return homepageForm.value.heroImageUrl || defaultHeroImage;
});

const kpiStats = computed(() => {
  const activeAuctions = auctions.value.filter(a => a.status === 'active').length;
  const totalValueGenerated = auctions.value.reduce((sum, a) => sum + Math.max(0, a.currentPrice - a.startingPrice), 0);
  const pendingTickets = tickets.value.filter(t => t.status === 'pending').length;
  return {
    activeAuctions,
    totalValueGenerated,
    pendingTickets
  };
});

const donutStats = computed(() => {
  const total = auctions.value.length;
  if (total === 0) {
    return { activeDash: '0 251.2', endedDash: '0 251.2', activePercent: 0, endedPercent: 0, total: 0, activeCount: 0, endedCount: 0, endedOffset: 0 };
  }
  const activeCount = auctions.value.filter(a => a.status === 'active').length;
  const endedCount = total - activeCount;
  const C = 251.2;
  const activeDash = `${(activeCount / total) * C} ${C}`;
  const endedDash = `${(endedCount / total) * C} ${C}`;
  const endedOffset = -((activeCount / total) * C);
  return {
    total,
    activeCount,
    endedCount,
    activePercent: Math.round((activeCount / total) * 100),
    endedPercent: Math.round((endedCount / total) * 100),
    activeDash,
    endedDash,
    endedOffset
  };
});

const userRegistrationsStats = computed(() => {
  const stats = [];
  const daysName = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    
    const dayLabel = daysName[d.getDay()];
    const dayStr = d.toLocaleDateString('pt-MZ', { day: '2-digit', month: '2-digit' });
    
    const count = users.value.filter(u => {
      const uDate = new Date(u.createdAt);
      return uDate.toDateString() === d.toDateString();
    }).length;
    
    stats.push({
      label: dayLabel,
      dateStr: dayStr,
      count
    });
  }
  
  const maxCount = Math.max(...stats.map(s => s.count), 1);
  return stats.map(s => ({
    ...s,
    heightPercent: (s.count / maxCount) * 75
  }));
});

const formatCurrencyCompact = (value) => {
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(1) + 'M MZN';
  if (value >= 1_000) return (value / 1_000).toFixed(1) + 'K MZN';
  const formatted = new Intl.NumberFormat('pt-MZ', { maximumFractionDigits: 0 }).format(value);
  return `${formatted} MZN`;
};
const creating = ref(false);
const showAlert = (message, type = 'success', duration = 4000) => {
  toastStore.add(message, type, duration);
};

const form = ref({
  title: '',
  description: '',
  imageUrl: '',
  images: [],
  startingPrice: 0,
  startTime: '',
  endTime: '',
  category: '',
  location: 'Maputo'
});

const provincesList = [
  'Maputo Cidade',
  'Maputo Província',
  'Gaza',
  'Inhambane',
  'Sofala (Beira)',
  'Manica',
  'Tete',
  'Zambézia',
  'Nampula',
  'Niassa',
  'Cabo Delgado (Pemba)'
];

const categories = ref([]);
const newCategoryName = ref('');
const creatingCategory = ref(false);

const subscribers = ref([]);
const subscriberSearchQuery = ref('');

const fileInput = ref(null);
const uploadingImages = ref(false);

const triggerImageUpload = () => {
  fileInput.value.click();
};

const handleImagesUpload = async (e) => {
  const files = Array.from(e.target.files);
  if (files.length === 0) return;

  const formData = new FormData();
  files.forEach(file => {
    formData.append('images', file);
  });

  uploadingImages.value = true;
  try {
    const res = await axios.post(`${apiUrl}/api/auctions/upload-images`, formData, {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
        'Content-Type': 'multipart/form-data'
      }
    });

    if (res.data.success) {
      const urls = res.data.imageUrls;
      form.value.images = [...form.value.images, ...urls];
      if (!form.value.imageUrl && form.value.images.length > 0) {
        form.value.imageUrl = form.value.images[0];
      }
      showAlert('Imagens carregadas com sucesso! ✓');
    }
  } catch (err) {
    showAlert('Erro ao carregar imagens: ' + (err.response?.data?.error || err.message), 'error');
  } finally {
    uploadingImages.value = false;
    if (fileInput.value) fileInput.value.value = '';
  }
};

const removeImage = (index) => {
  const removedUrl = form.value.images[index];
  form.value.images.splice(index, 1);
  if (form.value.imageUrl === removedUrl) {
    form.value.imageUrl = form.value.images.length > 0 ? form.value.images[0] : '';
  }
};

const setCoverImage = (url) => {
  form.value.imageUrl = url;
};

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// showAlert defined above

const formatCurrency = (value) => {
  if (value === undefined || value === null) return '0,00 MZN';
  const formatted = new Intl.NumberFormat('pt-MZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
  return `${formatted} MZN`;
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const mpesaPayments = ref([]);

const fetchData = async () => {
  try {
    const [usersRes, auctionsRes, ticketsRes, categoriesRes, subscribersRes, proposalsRes, paymentsRes] = await Promise.all([
      axios.get(`${apiUrl}/api/users`, { headers: { Authorization: `Bearer ${authStore.token}` } }),
      axios.get(`${apiUrl}/api/auctions`),
      axios.get(`${apiUrl}/api/support`, { headers: { Authorization: `Bearer ${authStore.token}` } }),
      axios.get(`${apiUrl}/api/categories`),
      axios.get(`${apiUrl}/api/newsletter/subscribers`, { headers: { Authorization: `Bearer ${authStore.token}` } }),
      axios.get(`${apiUrl}/api/proposals`, { headers: { Authorization: `Bearer ${authStore.token}` } }),
      axios.get(`${apiUrl}/api/payments/all`, { headers: { Authorization: `Bearer ${authStore.token}` } }).catch(() => ({ data: { data: [] } }))
    ]);
    users.value = usersRes.data.data;
    auctions.value = auctionsRes.data.data;
    tickets.value = ticketsRes.data.data;
    categories.value = categoriesRes.data.data;
    subscribers.value = subscribersRes.data.data;
    proposals.value = proposalsRes.data.data;
    mpesaPayments.value = paymentsRes.data?.data || [];
  } catch (err) {
    console.error('Error fetching admin data:', err);
  }
};

const updateProposalStatus = async (id, status, adminNotes = '') => {
  try {
    const res = await axios.put(`${apiUrl}/api/proposals/${id}/status`, { status, adminNotes }, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    });
    if (res.data.success) {
      showAlert('Estado da proposta atualizado! ✓');
      fetchData();
    }
  } catch (err) {
    showAlert('Erro ao atualizar proposta: ' + (err.response?.data?.error || err.message), 'error');
  }
};

const approveProposalAndPrefill = (prop) => {
  proposalBeingConverted.value = prop;
  form.value.title = prop.title;
  form.value.description = prop.description;
  form.value.category = prop.category;
  form.value.startingPrice = prop.estimatedValue;
  form.value.images = [...prop.images];
  form.value.imageUrl = prop.images.length > 0 ? prop.images[0] : '';
  
  const target = document.querySelector('.create-form');
  if (target) {
    target.scrollIntoView({ behavior: 'smooth' });
  }
  showAlert('Proposta carregada no formulário de criação! Defina as datas e confirme.', 'success');
};

const rejectProposal = (prop) => {
  openConfirm({
    title: 'Rejeitar Proposta',
    message: `Tem a certeza que deseja rejeitar a proposta "${prop.title}"?`,
    btnText: 'Rejeitar',
    btnClass: 'btn-danger',
    action: async () => {
      const notes = prompt('Motivo da rejeição (opcional):') || 'Não cumpre os requisitos mínimos da plataforma.';
      await updateProposalStatus(prop._id, 'rejected', notes);
    }
  });
};

const filteredSubscribers = computed(() => {
  if (!subscriberSearchQuery.value.trim()) return subscribers.value;
  const q = subscriberSearchQuery.value.toLowerCase().trim();
  return subscribers.value.filter(s => s.email.toLowerCase().includes(q));
});

const activeSubscribersCount = computed(() => {
  return subscribers.value.filter(s => s.active).length;
});

const toggleSubscriber = async (id) => {
  try {
    const res = await axios.put(`${apiUrl}/api/newsletter/subscribers/${id}/toggle`, {}, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    });
    if (res.data && res.data.success) {
      const updated = res.data.data;
      const index = subscribers.value.findIndex(s => s._id === id);
      if (index !== -1) {
        subscribers.value[index] = updated;
      }
      showAlert('Estado do subscritor atualizado! ✓', 'success');
    }
  } catch (err) {
    console.error('Failed to toggle subscriber:', err);
    showAlert('Erro ao atualizar o estado do subscritor: ' + (err.response?.data?.error || err.message), 'error');
  }
};

const confirmDeleteSubscriber = (id) => {
  const sub = subscribers.value.find(s => s._id === id);
  openConfirm({
    title: 'Apagar Subscritor',
    message: `Tem a certeza que deseja remover permanentemente o e-mail "${sub?.email}" da newsletter? Esta acção não pode ser desfeita.`,
    btnText: 'Apagar',
    btnClass: 'btn-danger',
    action: async () => {
      try {
        await axios.delete(`${apiUrl}/api/newsletter/subscribers/${id}`, {
          headers: { Authorization: `Bearer ${authStore.token}` }
        });
        subscribers.value = subscribers.value.filter(s => s._id !== id);
        showAlert('Subscritor removido com sucesso. ✓', 'success');
      } catch (err) {
        console.error('Failed to delete subscriber:', err);
        showAlert('Erro ao remover subscritor: ' + (err.response?.data?.error || err.message), 'error');
      }
    }
  });
};

const handleAddCategory = async () => {
  const name = newCategoryName.value.trim();
  if (!name) return;

  creatingCategory.value = true;
  try {
    const res = await axios.post(`${apiUrl}/api/categories`, { name }, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    });
    if (res.data.success) {
      categories.value.push(res.data.data);
      form.value.category = res.data.data.name;
      newCategoryName.value = '';
      showAlert('Categoria adicionada e selecionada com sucesso! ✓');
    }
  } catch (err) {
    showAlert('Erro ao adicionar categoria: ' + (err.response?.data?.error || err.message), 'error');
  } finally {
    creatingCategory.value = false;
  }
};

onMounted(async () => {
  fetchData();
  // Load current homepage settings
  try {
    const res = await axios.get(`${apiUrl}/api/settings/homepage`);
    if (res.data && res.data.success && res.data.data) {
      const d = res.data.data;
      homepageForm.value = {
        heroTitle: d.heroTitle || '',
        heroSubtitle: d.heroSubtitle || '',
        heroImageUrl: d.heroImageUrl || '',
        heroImageUrls: d.heroImageUrls || [],
        heroMobileImageUrls: d.heroMobileImageUrls || []
      };
    }
  } catch (err) {
    // No saved settings yet, leave defaults
  }

  // Load partners settings — fall back to defaults if none saved yet
  try {
    const resPartners = await axios.get(`${apiUrl}/api/settings/partners`);
    if (resPartners.data && resPartners.data.success && Array.isArray(resPartners.data.data) && resPartners.data.data.length > 0) {
      partnersForm.value = resPartners.data.data;
    } else {
      // No partners in DB yet — pre-load defaults so admin can see and edit them
      partnersForm.value = defaultPartners.map(p => ({ ...p }));
    }
  } catch (err) {
    // API error (e.g. 404) — pre-load defaults
    partnersForm.value = defaultPartners.map(p => ({ ...p }));
  }

  // Setup preview cycling interval
  previewIntervalId = setInterval(() => {
    previewActiveIndex.value++;
  }, 3000);
});

onUnmounted(() => {
  if (previewIntervalId) clearInterval(previewIntervalId);
});

const handleCreate = async () => {
  creating.value = true;
  try {
    if (form.value.imageUrl && !form.value.images.includes(form.value.imageUrl)) {
      form.value.images.unshift(form.value.imageUrl);
    }
    
    await axios.post(`${apiUrl}/api/auctions`, form.value, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    });

    if (proposalBeingConverted.value) {
      await axios.put(`${apiUrl}/api/proposals/${proposalBeingConverted.value._id}/status`, {
        status: 'approved',
        adminNotes: 'Convertido em leilão público com sucesso.'
      }, {
        headers: { Authorization: `Bearer ${authStore.token}` }
      });
      proposalBeingConverted.value = null;
    }

    form.value = { title: '', description: '', imageUrl: '', images: [], startingPrice: 0, startTime: '', endTime: '', category: '' };
    showAlert('Leilão criado com sucesso! ✓');
    fetchData();
  } catch (err) {
    showAlert('Erro ao criar leilão: ' + (err.response?.data?.error || err.message), 'error');
  } finally {
    creating.value = false;
  }
};

const showConfirmModal = ref(false);
const confirmTitle = ref('');
const confirmMessage = ref('');
const confirmAction = ref(null);

// ── Extend Auction ──
const showExtendModal = ref(false);
const extendTargetAuction = ref(null);
const extendCustomDateTime = ref('');
const extendingAuction = ref(false);

const minExtendDateTime = computed(() => {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
});

const openExtendModal = (auction) => {
  extendTargetAuction.value = auction;
  // Pre-fill with current endTime
  const current = new Date(auction.endTime);
  current.setMinutes(current.getMinutes() - current.getTimezoneOffset());
  extendCustomDateTime.value = current.toISOString().slice(0, 16);
  showExtendModal.value = true;
};

const closeExtendModal = () => {
  showExtendModal.value = false;
  extendTargetAuction.value = null;
  extendCustomDateTime.value = '';
};

const applyPreset = (hours) => {
  const base = extendTargetAuction.value
    ? new Date(Math.max(new Date(extendTargetAuction.value.endTime).getTime(), Date.now()))
    : new Date();
  base.setHours(base.getHours() + hours);
  base.setMinutes(base.getMinutes() - base.getTimezoneOffset());
  extendCustomDateTime.value = base.toISOString().slice(0, 16);
};

const submitExtendAuction = async () => {
  if (!extendTargetAuction.value || !extendCustomDateTime.value) return;
  extendingAuction.value = true;
  try {
    const newEndTime = new Date(extendCustomDateTime.value).toISOString();
    await axios.put(
      `${apiUrl}/api/auctions/${extendTargetAuction.value._id}`,
      { endTime: newEndTime, status: 'active' },
      { headers: { Authorization: `Bearer ${authStore.token}` } }
    );
    showAlert(`Leilão "${extendTargetAuction.value.title}" estendido com sucesso! ✓`);
    closeExtendModal();
    fetchData();
  } catch (err) {
    showAlert('Erro ao estender leilão: ' + (err.response?.data?.error || err.message), 'error');
  } finally {
    extendingAuction.value = false;
  }
};

// ── Edit Auction ──
const showEditModal = ref(false);
const editTargetAuction = ref(null);
const updatingAuction = ref(false);
const editFileInput = ref(null);
const uploadingEditImages = ref(false);
const editForm = ref({
  title: '',
  description: '',
  category: '',
  location: 'Maputo',
  startingPrice: 0,
  currentPrice: 0,
  imageUrl: '',
  images: [],
  startTime: '',
  endTime: '',
  status: 'active'
});

const formatDateForInput = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

const openEditModal = (auction) => {
  editTargetAuction.value = auction;
  const imgs = Array.isArray(auction.images) && auction.images.length > 0
    ? [...auction.images]
    : (auction.imageUrl ? [auction.imageUrl] : []);
  
  editForm.value = {
    title: auction.title || '',
    description: auction.description || '',
    category: auction.category || '',
    location: auction.location || 'Maputo',
    startingPrice: auction.startingPrice || 0,
    currentPrice: auction.currentPrice || 0,
    imageUrl: auction.imageUrl || (imgs.length > 0 ? imgs[0] : ''),
    images: imgs,
    startTime: formatDateForInput(auction.startTime),
    endTime: formatDateForInput(auction.endTime),
    status: auction.status || 'active'
  };
  showEditModal.value = true;
};

const closeEditModal = () => {
  showEditModal.value = false;
  editTargetAuction.value = null;
};

const triggerEditImageUpload = () => {
  if (editFileInput.value) editFileInput.value.click();
};

const handleEditImagesUpload = async (e) => {
  const files = Array.from(e.target.files);
  if (files.length === 0) return;

  const formData = new FormData();
  files.forEach(file => formData.append('images', file));

  uploadingEditImages.value = true;
  try {
    const res = await axios.post(`${apiUrl}/api/auctions/upload-images`, formData, {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
        'Content-Type': 'multipart/form-data'
      }
    });

    if (res.data.success) {
      const urls = res.data.imageUrls;
      editForm.value.images = [...editForm.value.images, ...urls];
      if (!editForm.value.imageUrl && editForm.value.images.length > 0) {
        editForm.value.imageUrl = editForm.value.images[0];
      }
      showAlert('Imagens carregadas com sucesso! ✓');
    }
  } catch (err) {
    showAlert('Erro ao carregar imagens: ' + (err.response?.data?.error || err.message), 'error');
  } finally {
    uploadingEditImages.value = false;
    if (editFileInput.value) editFileInput.value.value = '';
  }
};

const removeEditImage = (index) => {
  const removedUrl = editForm.value.images[index];
  editForm.value.images.splice(index, 1);
  if (editForm.value.imageUrl === removedUrl) {
    editForm.value.imageUrl = editForm.value.images.length > 0 ? editForm.value.images[0] : '';
  }
};

const setEditCoverImage = (url) => {
  editForm.value.imageUrl = url;
};

const submitEditAuction = async () => {
  if (!editTargetAuction.value) return;
  updatingAuction.value = true;
  try {
    const payload = {
      title: editForm.value.title,
      description: editForm.value.description,
      category: editForm.value.category,
      startingPrice: Number(editForm.value.startingPrice),
      currentPrice: Number(editForm.value.currentPrice),
      imageUrl: editForm.value.imageUrl,
      images: editForm.value.images,
      status: editForm.value.status,
      endTime: editForm.value.endTime ? new Date(editForm.value.endTime).toISOString() : editTargetAuction.value.endTime
    };
    if (editForm.value.startTime) {
      payload.startTime = new Date(editForm.value.startTime).toISOString();
    }

    if (payload.images.length > 0 && !payload.imageUrl) {
      payload.imageUrl = payload.images[0];
    } else if (payload.imageUrl && !payload.images.includes(payload.imageUrl)) {
      payload.images.unshift(payload.imageUrl);
    }

    const res = await axios.put(`${apiUrl}/api/auctions/${editTargetAuction.value._id}`, payload, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    });

    if (res.data.success) {
      showAlert(`Leilão "${payload.title}" actualizado com sucesso! ✓`);
      closeEditModal();
      fetchData();
    }
  } catch (err) {
    showAlert('Erro ao actualizar leilão: ' + (err.response?.data?.error || err.message), 'error');
  } finally {
    updatingAuction.value = false;
  }
};
const confirmBtnText = ref('Confirmar');
const confirmBtnClass = ref('btn-primary');

const openConfirm = (options) => {
  confirmTitle.value = options.title;
  confirmMessage.value = options.message;
  confirmBtnText.value = options.btnText || 'Confirmar';
  confirmBtnClass.value = options.btnClass || 'btn-primary';
  confirmAction.value = options.action;
  showConfirmModal.value = true;
};

const closeConfirm = () => {
  showConfirmModal.value = false;
  confirmAction.value = null;
};

const executeConfirm = async () => {
  if (confirmAction.value) {
    await confirmAction.value();
  }
  closeConfirm();
};

const toggleBlock = (userId) => {
  const user = users.value.find(u => u._id === userId);
  const actionText = user?.status === 'active' ? 'bloquear' : 'desbloquear';
  const modalTitle = user?.status === 'active' ? 'Bloquear Utilizador' : 'Desbloquear Utilizador';
  const btnClass = user?.status === 'active' ? 'btn-danger' : 'btn-primary';
  
  openConfirm({
    title: modalTitle,
    message: `Tem a certeza que deseja ${actionText} o utilizador "${user?.name}"?`,
    btnText: user?.status === 'active' ? 'Bloquear' : 'Desbloquear',
    btnClass: btnClass,
    action: async () => {
      try {
        await axios.put(`${apiUrl}/api/users/${userId}/block`, {}, {
          headers: { Authorization: `Bearer ${authStore.token}` }
        });
        showAlert('Estado do utilizador actualizado. ✓');
        fetchData();
      } catch (err) {
        showAlert('Erro: ' + (err.response?.data?.error || err.message), 'error');
      }
    }
  });
};

const endAuction = (auctionId) => {
  const item = auctions.value.find(a => a._id === auctionId);
  openConfirm({
    title: 'Terminar Leilão',
    message: `Tem a certeza que deseja terminar o leilão "${item?.title}" imediatamente? O vencedor será determinado com base no lance mais alto actual.`,
    btnText: 'Terminar',
    btnClass: 'btn-warning',
    action: async () => {
      try {
        await axios.put(`${apiUrl}/api/auctions/${auctionId}`, { status: 'finished' }, {
          headers: { Authorization: `Bearer ${authStore.token}` }
        });
        showAlert('Leilão terminado. ✓');
        fetchData();
      } catch (err) {
        showAlert('Erro ao terminar leilão: ' + (err.response?.data?.error || err.message), 'error');
      }
    }
  });
};

const deleteAuction = (auctionId) => {
  const item = auctions.value.find(a => a._id === auctionId);
  openConfirm({
    title: 'Apagar Leilão',
    message: `Tem a certeza que deseja apagar permanentemente o leilão "${item?.title}"? Esta acção não pode ser desfeita e removerá todos os lances associados.`,
    btnText: 'Apagar',
    btnClass: 'btn-danger',
    action: async () => {
      try {
        await axios.delete(`${apiUrl}/api/auctions/${auctionId}`, {
          headers: { Authorization: `Bearer ${authStore.token}` }
        });
        showAlert('Leilão apagado. ✓');
        fetchData();
      } catch (err) {
        showAlert('Erro ao apagar: ' + (err.response?.data?.error || err.message), 'error');
      }
    }
  });
};

// ── Homepage Settings Handlers ──
const triggerHeroImageUpload = () => {
  heroImageInput.value.click();
};

const handleHeroImageUpload = async (e) => {
  const files = Array.from(e.target.files);
  if (files.length === 0) return;

  const formData = new FormData();
  files.forEach(file => {
    formData.append('images', file);
  });

  uploadingHeroImage.value = true;
  try {
    const res = await axios.post(`${apiUrl}/api/auctions/upload-images`, formData, {
      headers: { Authorization: `Bearer ${authStore.token}`, 'Content-Type': 'multipart/form-data' }
    });
    if (res.data.success) {
      const urls = res.data.imageUrls;
      if (!homepageForm.value.heroImageUrls) {
        homepageForm.value.heroImageUrls = [];
      }
      homepageForm.value.heroImageUrls = [...homepageForm.value.heroImageUrls, ...urls];
      if (!homepageForm.value.heroImageUrl && homepageForm.value.heroImageUrls.length > 0) {
        homepageForm.value.heroImageUrl = homepageForm.value.heroImageUrls[0];
      }
      showAlert('Imagens carregadas com sucesso! ✓');
    }
  } catch (err) {
    showAlert('Erro ao carregar imagens: ' + (err.response?.data?.error || err.message), 'error');
  } finally {
    uploadingHeroImage.value = false;
    if (heroImageInput.value) heroImageInput.value.value = '';
  }
};

const addManualHeroImageUrl = () => {
  if (!manualHeroImageUrl.value.trim()) return;
  if (!homepageForm.value.heroImageUrls) {
    homepageForm.value.heroImageUrls = [];
  }
  homepageForm.value.heroImageUrls.push(manualHeroImageUrl.value.trim());
  if (!homepageForm.value.heroImageUrl && homepageForm.value.heroImageUrls.length > 0) {
    homepageForm.value.heroImageUrl = homepageForm.value.heroImageUrls[0];
  }
  manualHeroImageUrl.value = '';
  showAlert('URL da imagem adicionada! ✓');
};

const removeHeroImage = (index) => {
  const removedUrl = homepageForm.value.heroImageUrls[index];
  homepageForm.value.heroImageUrls.splice(index, 1);
  if (homepageForm.value.heroImageUrl === removedUrl) {
    homepageForm.value.heroImageUrl = homepageForm.value.heroImageUrls.length > 0 ? homepageForm.value.heroImageUrls[0] : '';
  }
};

const triggerHeroMobileImageUpload = () => {
  heroMobileImageInput.value.click();
};

const handleHeroMobileImageUpload = async (e) => {
  const files = Array.from(e.target.files);
  if (files.length === 0) return;

  const formData = new FormData();
  files.forEach(file => {
    formData.append('images', file);
  });

  uploadingHeroMobileImage.value = true;
  try {
    const res = await axios.post(`${apiUrl}/api/auctions/upload-images`, formData, {
      headers: { Authorization: `Bearer ${authStore.token}`, 'Content-Type': 'multipart/form-data' }
    });
    if (res.data.success) {
      const urls = res.data.imageUrls;
      if (!homepageForm.value.heroMobileImageUrls) {
        homepageForm.value.heroMobileImageUrls = [];
      }
      homepageForm.value.heroMobileImageUrls = [...homepageForm.value.heroMobileImageUrls, ...urls];
      showAlert('Imagens para Telemóvel carregadas! ✓');
    }
  } catch (err) {
    showAlert('Erro ao carregar imagens: ' + (err.response?.data?.error || err.message), 'error');
  } finally {
    uploadingHeroMobileImage.value = false;
    if (heroMobileImageInput.value) heroMobileImageInput.value.value = '';
  }
};

const addManualHeroMobileImageUrl = () => {
  if (!manualHeroMobileImageUrl.value.trim()) return;
  if (!homepageForm.value.heroMobileImageUrls) {
    homepageForm.value.heroMobileImageUrls = [];
  }
  homepageForm.value.heroMobileImageUrls.push(manualHeroMobileImageUrl.value.trim());
  manualHeroMobileImageUrl.value = '';
  showAlert('URL da imagem mobile adicionada! ✓');
};

const removeHeroMobileImage = (index) => {
  homepageForm.value.heroMobileImageUrls.splice(index, 1);
};

const saveHomepageSettings = async () => {
  savingHomepage.value = true;
  try {
    await axios.put(`${apiUrl}/api/settings/homepage`, {
      heroTitle: homepageForm.value.heroTitle,
      heroSubtitle: homepageForm.value.heroSubtitle,
      heroImageUrl: homepageForm.value.heroImageUrl,
      heroImageUrls: homepageForm.value.heroImageUrls,
      heroMobileImageUrls: homepageForm.value.heroMobileImageUrls
    }, { headers: { Authorization: `Bearer ${authStore.token}` } });
    showAlert('Configurações da página inicial guardadas com sucesso! ✓');
  } catch (err) {
    showAlert('Erro ao guardar: ' + (err.response?.data?.error || err.message), 'error');
  } finally {
    savingHomepage.value = false;
  }
};

// ── Partners Handlers ──
const addPartner = () => {
  partnersForm.value.push({ name: '', description: '', logoUrl: '' });
};

const removePartner = (index) => {
  partnersForm.value.splice(index, 1);
};

const triggerPartnerLogoUpload = (idx) => {
  const input = partnerFileInputs.value[idx];
  if (input) input.click();
};

const handlePartnerLogoUpload = async (e, idx) => {
  const file = e.target.files[0];
  if (!file) return;
  const formData = new FormData();
  formData.append('images', file);
  try {
    const res = await axios.post(`${apiUrl}/api/auctions/upload-images`, formData, {
      headers: { Authorization: `Bearer ${authStore.token}`, 'Content-Type': 'multipart/form-data' }
    });
    if (res.data.success && res.data.imageUrls?.length > 0) {
      partnersForm.value[idx].logoUrl = res.data.imageUrls[0];
      showAlert('Logo carregado com sucesso! ✓');
    }
  } catch (err) {
    showAlert('Erro ao carregar logo: ' + (err.response?.data?.error || err.message), 'error');
  }
  e.target.value = '';
};

const savePartners = async () => {
  savingPartners.value = true;
  try {
    await axios.put(`${apiUrl}/api/settings/partners`,
      partnersForm.value,
      { headers: { Authorization: `Bearer ${authStore.token}` } }
    );
    showAlert('Parceiros guardados com sucesso! ✓');
  } catch (err) {
    showAlert('Erro ao guardar parceiros: ' + (err.response?.data?.error || err.message), 'error');
  } finally {
    savingPartners.value = false;
  }
};

// ── Support Tickets Handlers ──
const toggleTicketStatus = async (id, currentStatus) => {
  const newStatus = currentStatus === 'pending' ? 'resolved' : 'pending';
  try {
    await axios.put(`${apiUrl}/api/support/${id}`, { status: newStatus }, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    });
    showAlert(newStatus === 'resolved' ? 'Ticket resolvido. ✓' : 'Ticket reaberto.');
    fetchData();
  } catch (err) {
    showAlert('Erro ao atualizar ticket: ' + (err.response?.data?.error || err.message), 'error');
  }
};

const confirmDeleteTicket = (id) => {
  openConfirm({
    title: 'Apagar Ticket',
    message: 'Tem a certeza que deseja apagar permanentemente este ticket de suporte? Esta acção não pode ser desfeita.',
    btnText: 'Apagar',
    btnClass: 'btn-danger',
    action: async () => {
      try {
        await axios.delete(`${apiUrl}/api/support/${id}`, {
          headers: { Authorization: `Bearer ${authStore.token}` }
        });
        showAlert('Ticket apagado. ✓');
        fetchData();
      } catch (err) {
        showAlert('Erro ao apagar ticket: ' + (err.response?.data?.error || err.message), 'error');
      }
    }
  });
};

const formatTicketDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-MZ', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' + date.toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit' });
};
</script>

<style scoped>
.admin-container {
  min-height: 100vh;
  background-color: #f5f6fa;
}

.page-header {
  margin-bottom: 2rem;
}

.page-title {
  font-size: clamp(1.6rem, 4vw, 2.25rem);
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.35rem;
}

.page-subtitle {
  font-size: 0.9rem;
  color: var(--text-light);
}



/* ── Grid ── */
.dashboard-grid {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* ── Card ── */
.admin-card {
  padding: 1.75rem;
  border-radius: 12px;
  overflow: visible;
}

.card-header-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.card-icon {
  font-size: 1.25rem;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  flex-grow: 1;
}

.record-count {
  background-color: #f0f0f0;
  color: var(--text-secondary);
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.15rem 0.6rem;
  border-radius: 20px;
}

/* ── Form ── */
.create-form {
  display: flex;
  flex-direction: column;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

/* ── Table ── */
.table-container {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  border-radius: var(--radius-md);
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
  min-width: 520px;
}

.admin-table th {
  padding: 0.75rem 1rem;
  text-align: left;
  font-weight: 600;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-light);
  background-color: #f9fafb;
  border-bottom: 1px solid #eee;
}

.admin-table td {
  padding: 0.875rem 1rem;
  border-bottom: 1px solid #f5f5f5;
  vertical-align: middle;
}

.admin-table tr:last-child td {
  border-bottom: none;
}

.admin-table tr:hover td {
  background-color: #fafafa;
}

.empty-row {
  text-align: center;
  color: var(--text-light);
  padding: 2rem !important;
  font-style: italic;
}

/* ── User Cell ── */
.user-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: var(--btn-primary-bg);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 700;
  flex-shrink: 0;
  overflow: hidden;
}

.user-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-name {
  font-weight: 500;
}

.email-cell {
  color: var(--text-secondary);
  font-size: 0.83rem;
}

.auction-title-cell {
  font-weight: 500;
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.price-cell {
  font-weight: 600;
  color: var(--btn-primary-bg);
  white-space: nowrap;
}

/* ── Badges ── */
.badge {
  display: inline-block;
  padding: 0.2rem 0.55rem;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.badge-admin   { background-color: #e3eafe; color: #3e6ae1; }
.badge-active  { background-color: #e8f5e9; color: #2e7d32; }
.badge-blocked { background-color: #fdecea; color: #c62828; }
.badge-upcoming{ background-color: #fff8e1; color: #f57f17; }
.badge-ended   { background-color: #f0f0f0; color: #666;    }

.you-badge {
  font-size: 0.75rem;
  color: var(--text-light);
  font-style: italic;
}

/* ── Action buttons ── */
.btn-sm {
  padding: 0.3rem 0.75rem;
  font-size: 0.75rem;
  border-radius: var(--radius-md);
}

.btn-warning {
  background-color: #ff9800;
  color: white;
}

.btn-warning:hover {
  background-color: #e65100;
}

.action-btns {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.btn-extend {
  background-color: #5c6bc0;
  color: white;
}
.btn-extend:hover {
  background-color: #3949ab;
}

/* ── Extend Modal Specifics ── */
.extend-modal-card {
  max-width: 480px;
}

.extend-auction-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.35rem;
}

.extend-current-end {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 1.25rem;
  padding: 0.6rem 0.9rem;
  background: rgba(0,0,0,0.04);
  border-radius: 8px;
}

.extend-label {
  font-size: 0.78rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  color: var(--text-light);
  display: block;
  margin-bottom: 0.6rem;
}

.extend-preset-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.btn-extend-preset {
  padding: 0.4rem 0.85rem;
  border-radius: 20px;
  border: 2px solid #5c6bc0;
  background: transparent;
  color: #5c6bc0;
  font-weight: 600;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.18s ease;
}
.btn-extend-preset:hover {
  background: #5c6bc0;
  color: white;
}

.extend-preview {
  font-size: 0.85rem;
  color: #2e7d32;
  margin-top: 0.75rem;
  padding: 0.5rem 0.85rem;
  background: rgba(76, 175, 80, 0.08);
  border-radius: 8px;
  border: 1px solid rgba(76, 175, 80, 0.2);
}


/* ── Mobile ── */
@media (max-width: 640px) {
  .admin-card {
    padding: 1.25rem;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}

/* ── Image Upload & Thumbnails ── */
.image-upload-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.upload-dropzone {
  border: 2px dashed #d1d5db;
  border-radius: var(--radius-md);
  padding: 1.25rem;
  text-align: center;
  background-color: #f9fafb;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  color: var(--text-secondary);
  transition: all 0.3s ease;
  user-select: none;
}

.upload-dropzone:hover {
  border-color: var(--btn-primary-bg);
  background-color: #f5f8ff;
}

.upload-progress-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.75rem;
  color: var(--btn-primary-bg);
  margin-top: 0.5rem;
}

.spinner-sm {
  width: 16px;
  height: 16px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid var(--btn-primary-bg);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.uploaded-thumbnails-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
  gap: 0.5rem;
  margin-top: 1rem;
}

.thumb-wrapper {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
  background-color: #f3f4f6;
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  transition: all 0.2s ease;
}

.thumb-wrapper.is-cover {
  border-color: var(--btn-primary-bg);
  box-shadow: 0 0 0 2px rgba(62, 106, 225, 0.15);
}

.thumb-img {
  width: 100%;
  height: 70%;
  object-fit: cover;
}

.btn-remove-thumb {
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  cursor: pointer;
  line-height: 1;
  transition: background 0.2s;
  z-index: 2;
}

.btn-remove-thumb:hover {
  background: rgba(220, 38, 38, 0.9);
}

.btn-set-cover {
  width: 100%;
  height: 30%;
  background: white;
  border: none;
  border-top: 1px solid #e5e7eb;
  font-size: 0.6rem;
  font-weight: 600;
  color: var(--text-secondary);
  cursor: pointer;
  text-align: center;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-set-cover:hover {
  background: #f9fafb;
}

.thumb-wrapper.is-cover .btn-set-cover {
  background: var(--btn-primary-bg);
  color: white;
  border-top-color: var(--btn-primary-bg);
}

/* ── Custom Modal Confirmation ── */
.custom-modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.custom-modal-card {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 440px;
  padding: 1.75rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border: 1px solid #e5e7eb;
}

.modal-header-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.modal-title-icon {
  font-size: 1.5rem;
}

.custom-modal-card h4 {
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.modal-body p {
  font-size: 0.92rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

/* Animations */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.25s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

@keyframes scaleIn {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.animate-scale-in {
  animation: scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

/* ── KPI Stats Row ── */
.kpi-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.25rem;
  margin-bottom: 2rem;
}

.kpi-card {
  background: white;
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  border: 1px solid #f1f1f1;
}

.kpi-icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.user-kpi { background-color: #e8f0fe; }
.auction-kpi { background-color: #fef3c7; }
.active-kpi { background-color: #ecfdf5; }
.value-kpi { background-color: #f3e8ff; }
.ticket-kpi { background-color: #ffe4e6; color: #e11d48; }

.kpi-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.kpi-label {
  font-size: 0.75rem;
  color: var(--text-light);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.kpi-value {
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.2;
}

/* ── Charts Row ── */
.charts-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}

.chart-card {
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  border: 1px solid #f1f1f1;
  overflow: hidden;
}

.chart-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1.25rem;
  color: var(--text-primary);
}

.chart-content {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 160px;
  width: 100%;
}

/* Donut Chart Custom styles */
.donut-wrapper {
  flex: 1;
  display: flex;
  justify-content: center;
}

.donut-svg {
  max-width: 150px;
}

.donut-segment {
  transform-origin: center;
  transition: stroke-dasharray 0.3s ease;
}

.active-segment {
  stroke-linecap: round;
}

.ended-segment {
  stroke-linecap: round;
}

.donut-text {
  transition: opacity 0.2s;
}

.donut-number {
  font-size: 20px;
  font-weight: 700;
  fill: var(--text-primary);
}

.donut-label {
  font-size: 7px;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  fill: var(--text-light);
  font-weight: 600;
}

.donut-legend {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  flex-shrink: 0;
  margin-left: 1.5rem;
  min-width: 130px;
}

.legend-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  position: relative;
  padding-left: 1.25rem;
}

.legend-dot {
  position: absolute;
  left: 0;
  top: 4px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.active-dot { background-color: var(--btn-primary-bg); }
.ended-dot { background-color: #9ca3af; }

.legend-label {
  font-size: 0.72rem;
  color: var(--text-light);
  font-weight: 500;
  text-transform: uppercase;
}

.legend-value {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-primary);
}

/* Bar Chart Custom styles */
.bar-chart-wrapper {
  width: 100%;
  padding: 0.5rem;
}

.bar-svg {
  width: 100%;
}

.chart-bar {
  transition: height 0.6s cubic-bezier(0.16, 1, 0.3, 1), y 0.6s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s;
  cursor: pointer;
}

.chart-bar:hover {
  opacity: 0.85;
}

.bar-value {
  font-size: 9px;
  font-weight: 700;
  fill: var(--btn-primary-bg);
  opacity: 0;
  transition: opacity 0.2s, y 0.2s;
  pointer-events: none;
}

.bar-group:hover .bar-value {
  opacity: 1;
}

.bar-label {
  font-size: 8px;
  font-weight: 600;
  fill: var(--text-secondary);
}

.bar-date-label {
  font-size: 7px;
  fill: var(--text-light);
}

/* Media Queries for dashboard charts */
@media (max-width: 1024px) {
  .kpi-row {
    grid-template-columns: repeat(2, 1fr);
  }
  .charts-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .kpi-row {
    grid-template-columns: 1fr;
  }
  .chart-content {
    flex-direction: column;
    gap: 1.5rem;
  }
  .donut-legend {
    margin-left: 0;
    flex-direction: row;
    justify-content: center;
    gap: 1.5rem;
  }
}

/* ── Homepage Settings ── */
.settings-hint {
  font-size: 0.875rem;
  color: var(--text-light);
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.home-settings-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  align-items: start;
}

.home-settings-fields {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.home-settings-preview {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.preview-label {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-light);
  margin-bottom: 0.25rem;
}

.hero-preview {
  border-radius: 12px;
  overflow: hidden;
  min-height: 220px;
  background-size: cover;
  background-position: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 2rem 1.5rem;
  gap: 0.5rem;
  transition: background-image 0.4s ease;
}

.preview-eyebrow {
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: rgba(255,255,255,0.7);
}

.preview-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #fff;
  line-height: 1.2;
  margin: 0;
  text-shadow: 0 2px 8px rgba(0,0,0,0.4);
}

.preview-subtitle {
  font-size: 0.8rem;
  color: rgba(255,255,255,0.85);
  max-width: 260px;
  line-height: 1.5;
}

.btn-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  display: inline-block;
  margin-right: 6px;
  vertical-align: middle;
}

@keyframes spin { to { transform: rotate(360deg); } }

.hero-preview.is-mobile-preview {
  max-width: 260px;
  min-height: 460px;
  margin: 0 auto;
  border: 8px solid #334155;
  border-radius: 24px;
}

.preview-mode-selector {
  display: flex;
  gap: 0.25rem;
  margin-bottom: 0.5rem;
  background: #e2e8f0;
  padding: 3px;
  border-radius: 8px;
  width: fit-content;
}

.btn-mode {
  padding: 0.25rem 0.6rem;
  font-size: 0.7rem;
  font-weight: 600;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  color: var(--text-light);
  transition: all 0.2s ease;
}

.btn-mode.active {
  background: white;
  color: var(--text-primary);
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.settings-group-card {
  background: #f8fafc;
  border: 1px dashed #cbd5e1;
  border-radius: 12px;
  padding: 1rem;
}

.group-title-label {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--text-primary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: block;
  margin-bottom: 0.75rem;
}

@media (max-width: 900px) {
  .home-settings-layout {
    grid-template-columns: 1fr;
  }
}

/* ── Gestão de Parceiros no Admin ── */
.partners-admin-list {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  margin-bottom: 1.5rem;
}

.partner-admin-item {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
}

.partner-logo-preview {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.partner-logo-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 4px;
}

.partner-logo-placeholder {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-light);
}

.partner-fields {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex-grow: 1;
}

.partner-input {
  margin-bottom: 0 !important;
}

.empty-partners-hint {
  text-align: center;
  padding: 2rem;
  color: var(--text-light);
  font-style: italic;
  background: #f8fafc;
  border: 1px dashed #cbd5e1;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.add-partner-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* ── Auction Filters Bar ── */
.auction-filters-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.filter-group {
  flex: 1;
  min-width: 150px;
}

.filter-input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: border-color 0.2s;
}

.filter-input:focus {
  outline: none;
  border-color: var(--btn-primary-bg);
}

.filter-select {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 0.875rem;
  background: white;
  cursor: pointer;
}

/* ── Enhanced Auctions Table ── */
.auctions-table {
  font-size: 0.85rem;
}

.auctions-table th {
  padding: 0.75rem 0.5rem;
  font-weight: 600;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  background: #f8fafc;
  border-bottom: 2px solid #e2e8f0;
}

.auction-row {
  transition: background-color 0.2s;
}

.auction-row:hover {
  background-color: #f8fafc;
}

.image-cell {
  padding: 0.5rem;
  text-align: center;
}

.auction-thumb {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid #e2e8f0;
}

.auction-title-cell {
  padding: 0.75rem 0.5rem;
  min-width: 200px;
}

.auction-title-main {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 2px;
}

.auction-id {
  font-size: 0.75rem;
  color: var(--text-light);
  font-family: monospace;
}

.category-cell,
.location-cell {
  padding: 0.75rem 0.5rem;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.date-cell {
  padding: 0.75rem 0.5rem;
  font-size: 0.8rem;
  color: var(--text-secondary);
  white-space: nowrap;
}

.bids-count {
  padding: 0.75rem 0.5rem;
  text-align: center;
  font-weight: 600;
  color: var(--btn-primary-bg);
}

/* ── Responsive Table ── */
@media (max-width: 1200px) {
  .auctions-table {
    font-size: 0.75rem;
  }
  
  .auctions-table th,
  .auctions-table td {
    padding: 0.5rem 0.25rem;
  }
  
  .auction-thumb {
    width: 30px;
    height: 30px;
  }
  
  .auction-title-main {
    font-size: 0.85rem;
  }
}

@media (max-width: 768px) {
  .auction-filters-bar {
    flex-direction: column;
  }
  
  .filter-group {
    width: 100%;
  }
  
  .auctions-table {
    display: block;
    overflow-x: auto;
    white-space: nowrap;
  }
}
</style>
