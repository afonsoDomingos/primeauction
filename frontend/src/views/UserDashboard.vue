<template>
  <div class="dashboard-container">
    <div class="container animate-fade-in" style="padding-top: 105px; padding-bottom: 80px;">

      <!-- Profile Header -->
      <div class="profile-header">
        <div class="avatar-container" @click="triggerPhotoUpload" title="Clique para alterar a foto de perfil">
          <img v-if="authStore.user?.profilePhoto" :src="authStore.user.profilePhoto" alt="Foto de Perfil" class="profile-avatar-img" />
          <div v-else class="profile-avatar">{{ authStore.user?.name?.charAt(0)?.toUpperCase() }}</div>
          
          <div class="avatar-overlay">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
          </div>
          <div v-if="photoLoading" class="avatar-spinner-wrap">
            <div class="spinner-sm"></div>
          </div>
          <input type="file" ref="photoInput" style="display: none" accept="image/*" @change="handlePhotoUpload" />
        </div>

        <div class="profile-info">
          <h2 class="page-title" style="margin-bottom: 0.25rem; font-size: 1.75rem;">{{ authStore.user?.name }}</h2>
          <p class="profile-email">{{ authStore.user?.email }}</p>
          <p v-if="authStore.user?.phone" class="profile-phone">📞 {{ authStore.user.phone }}</p>
          <p v-if="authStore.user?.bio" class="profile-bio">“{{ authStore.user.bio }}”</p>
          <div style="margin-top: 0.5rem; display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center;">
            <span class="status-badge" :class="authStore.user?.status">
              {{ authStore.user?.status === 'active' ? 'Activo' : 'Bloqueado' }}
            </span>
            <span class="status-badge role-badge">
              {{ authStore.user?.role === 'admin' ? 'Administrador' : 'Cliente' }}
            </span>
            <StarRating :rating="authStore.user?.averageRating || 0" :count="authStore.user?.ratingsCount || 0" size="sm" />
            <span v-if="authStore.user?.province" class="status-badge province-badge">
              <svg xmlns="http://www.w3.org/2000/svg" class="badge-icon-small" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {{ authStore.user.province }}
            </span>
            <span v-if="authStore.user?.gender" class="status-badge gender-badge">
              <svg v-if="authStore.user.gender === 'Masculino'" xmlns="http://www.w3.org/2000/svg" class="badge-icon-small" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <svg v-else-if="authStore.user.gender === 'Feminino'" xmlns="http://www.w3.org/2000/svg" class="badge-icon-small" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="badge-icon-small" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {{ authStore.user.gender }}
            </span>
            <span v-if="authStore.user?.age" class="status-badge age-badge">
              <svg xmlns="http://www.w3.org/2000/svg" class="badge-icon-small" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {{ authStore.user.age }} anos
            </span>
          </div>
        </div>
        <button @click="logout" class="btn btn-logout">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Sair
        </button>
      </div>

      <!-- Navigation Tabs -->
      <div class="tabs-nav">
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'activity' }" 
          @click="activeTab = 'activity'"
        >
          Actividade & Lances
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'watchlist' }" 
          @click="changeTab('watchlist')"
        >
          Favoritos
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'proposals' }" 
          @click="changeTab('proposals')"
        >
          Minhas Vendas
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'payments' }" 
          @click="changeTab('payments')"
        >
          👛 Carteira & Finanças
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'chat' }" 
          @click="activeTab = 'chat'"
        >
          Mensagens
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'reviews' }" 
          @click="changeTab('reviews')"
        >
          Reputação & Avaliações
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'edit-profile' }" 
          @click="activeTab = 'edit-profile'"
        >
          Editar Perfil
        </button>
      </div>

      <!-- TAB Content: Activity -->
      <div v-if="activeTab === 'activity'">
        <!-- Stats Row -->
        <div class="stats-row">
          <div class="stat-card">
            <span class="stat-value">{{ bids.length }}</span>
            <span class="stat-label">Lances Dados</span>
          </div>
          <div class="stat-card">
            <span class="stat-value">{{ uniqueAuctions }}</span>
            <span class="stat-label">Leilões Activos</span>
          </div>
          <div class="stat-card">
            <span class="stat-value">{{ formatCurrencyCompact(totalBid) }}</span>
            <span class="stat-label">Total Licitado</span>
          </div>
        </div>

        <!-- Bid History -->
        <div class="card bids-card">
          <div class="bids-header">
            <h3 class="section-title">Histórico de Lances</h3>
            <router-link v-if="bids.length > 0" to="/auctions" class="btn btn-primary btn-pill btn-sm">
              Explorar Mais
            </router-link>
          </div>

          <div v-if="loading" class="loading-state">
            <div class="spinner"></div>
            <p>A carregar lances...</p>
          </div>

          <div v-else-if="bids.length === 0" class="empty-state">
            <svg xmlns="http://www.w3.org/2000/svg" class="empty-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <h4>Ainda não fez nenhum lance</h4>
            <p>Explore os leilões activos e faça o seu primeiro lance!</p>
            <router-link to="/auctions" class="btn btn-primary btn-pill" style="margin-top: 1.5rem;">
              Ver Leilões Activos
            </router-link>
          </div>

          <ul v-else class="bid-list">
            <li v-for="bid in bids" :key="bid._id" class="bid-item">
              <div class="bid-img-wrap" v-if="bid.auction?.imageUrl">
                <img :src="bid.auction.imageUrl" :alt="bid.auction.title" class="bid-img" />
              </div>
              <div class="bid-img-wrap placeholder-img" v-else>
                <svg xmlns="http://www.w3.org/2000/svg" class="placeholder-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>

              <div class="bid-details">
                <strong class="bid-auction-title">{{ bid.auction?.title || 'Leilão Removido' }}</strong>
                <span class="bid-date">{{ new Date(bid.createdAt).toLocaleString('pt-MZ') }}</span>
              </div>

              <div class="bid-right">
                <span class="bid-amount">{{ formatCurrency(bid.amount) }}</span>
                <router-link
                  v-if="bid.auction"
                  :to="`/auction/${bid.auction._id}`"
                  class="btn btn-secondary btn-sm btn-pill"
                >Ver</router-link>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <!-- TAB Content: Watchlist -->
      <div v-else-if="activeTab === 'watchlist'">
        <div class="card bids-card">
          <div class="bids-header">
            <h3 class="section-title">Os Meus Favoritos</h3>
          </div>

          <div v-if="loadingWatchlist" class="loading-state">
            <div class="spinner"></div>
            <p>A carregar favoritos...</p>
          </div>

          <div v-else-if="watchlist.length === 0" class="empty-state">
            <svg xmlns="http://www.w3.org/2000/svg" class="empty-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <h4>Sem leilões nos favoritos</h4>
            <p>Clique no coração dos leilões que deseja acompanhar para os ver aqui!</p>
            <router-link to="/auctions" class="btn btn-primary btn-pill" style="margin-top: 1.5rem;">
              Explorar Leilões
            </router-link>
          </div>

          <ul v-else class="bid-list">
            <li v-for="item in watchlist" :key="item._id" class="bid-item">
              <div class="bid-img-wrap" v-if="item.imageUrl">
                <img :src="item.imageUrl" :alt="item.title" class="bid-img" />
              </div>
              
              <div class="bid-details">
                <strong class="bid-auction-title">{{ item.title }}</strong>
                <span class="bid-date">
                  Estado: 
                  <strong :style="{ color: item.status === 'active' ? '#10b981' : (item.status === 'upcoming' ? '#f57c00' : '#6b7280') }">
                    {{ item.status === 'active' ? 'Activo' : (item.status === 'upcoming' ? 'Agendado' : 'Terminado') }}
                  </strong>
                </span>
              </div>

              <div class="bid-right">
                <span class="bid-amount">{{ formatCurrency(item.currentPrice) }}</span>
                <div style="display: flex; gap: 0.25rem;">
                  <router-link :to="`/auction/${item._id}`" class="btn btn-primary btn-sm btn-pill">
                    Licitar
                  </router-link>
                  <button @click="removeFromWatchlist(item._id)" class="btn btn-logout" style="padding: 0.25rem 0.5rem; border-radius: 50%;">
                    ✕
                  </button>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <!-- TAB Content: Proposals -->
      <div v-else-if="activeTab === 'proposals'">
        <div class="card bids-card">
          <div class="bids-header">
            <h3 class="section-title">Minhas Propostas de Venda</h3>
            <router-link to="/vender" class="btn btn-primary btn-pill btn-sm">
              + Nova Proposta
            </router-link>
          </div>

          <div v-if="loadingProposals" class="loading-state">
            <div class="spinner"></div>
            <p>A carregar propostas...</p>
          </div>

          <div v-else-if="proposals.length === 0" class="empty-state">
            <svg xmlns="http://www.w3.org/2000/svg" class="empty-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <h4>Nenhuma proposta enviada</h4>
            <p>Tem artigos ou viaturas que gostaria de leiloar? Envie-nos já uma proposta!</p>
            <router-link to="/vender" class="btn btn-primary btn-pill" style="margin-top: 1.5rem;">
              Vender Connosco
            </router-link>
          </div>

          <div v-else class="table-responsive">
            <table class="proposal-table">
              <thead>
                <tr>
                  <th>Artigo</th>
                  <th>Categoria</th>
                  <th>Valor Estimado</th>
                  <th>Estado</th>
                  <th>Data</th>
                  <th>Notas Admin</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="prop in proposals" :key="prop._id">
                  <td>
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                      <img v-if="prop.images && prop.images[0]" :src="prop.images[0]" class="prop-table-img" />
                      <div class="prop-table-title-wrap">
                        <span class="prop-table-title">{{ prop.title }}</span>
                        <span class="prop-table-condition">{{ prop.condition }}</span>
                      </div>
                    </div>
                  </td>
                  <td>{{ prop.category }}</td>
                  <td><strong>{{ formatCurrency(prop.estimatedValue) }}</strong></td>
                  <td>
                    <span class="status-badge" :class="prop.status">
                      {{ prop.status === 'pending' ? 'Pendente' : (prop.status === 'approved' ? 'Aprovado' : 'Rejeitado') }}
                    </span>
                  </td>
                  <td>{{ new Date(prop.createdAt).toLocaleDateString('pt-MZ') }}</td>
                  <td class="admin-notes-cell">{{ prop.adminNotes || '—' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- TAB Content: Wallet & Finances (Requisitos 2, 3 e 5) -->
      <div v-else-if="activeTab === 'payments'" class="wallet-dashboard-pane animate-fade-in">
        
        <!-- Header & Action Row -->
        <div class="wallet-pane-header">
          <div>
            <h3 class="section-title" style="margin: 0; font-size: 1.45rem;">Carteira & Gestão Financeira</h3>
            <p style="color: #64748b; font-size: 0.875rem; margin-top: 0.25rem;">
              Acompanhe os seus saldos, cauções de leilões, garantias reembolsáveis e solicite levantamentos.
            </p>
          </div>
          <div class="wallet-header-actions">
            <button 
              @click="openWithdrawModal" 
              class="btn btn-pill btn-withdraw-action"
              :disabled="(walletSummary.availableBalance || 0) < 50"
              title="Solicitar transferência do saldo disponível para conta bancária ou M-Pesa"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="btn-icon-svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Solicitar Levantamento
            </button>
            <button @click="refreshWalletData" class="btn btn-pill btn-refresh-wallet" title="Actualizar dados">
              🔄
            </button>
          </div>
        </div>

        <!-- Financial Summary KPI Cards (Requisito 2) -->
        <div class="financial-kpi-grid">
          <!-- Card 1: Saldo Disponível -->
          <div class="fin-card card-available">
            <div class="fin-card-top">
              <span class="fin-card-label">Saldo Disponível</span>
              <span class="fin-card-icon">👛</span>
            </div>
            <div class="fin-card-value">{{ formatCurrency(walletSummary.availableBalance || 0) }}</div>
            <div class="fin-card-desc">Livre para licitar em leilões ou para levantamento bancário/M-Pesa.</div>
          </div>

          <!-- Card 2: Saldo Reservado em Leilões -->
          <div class="fin-card card-reserved">
            <div class="fin-card-top">
              <span class="fin-card-label">Garantias Reservadas</span>
              <span class="fin-card-icon">🔒</span>
            </div>
            <div class="fin-card-value">{{ formatCurrency(walletSummary.reservedBalance || 0) }}</div>
            <div class="fin-card-desc">Retido em {{ walletSummary.activeReservedAuctionsCount || 0 }} leilão(ões) ativo(s). Libertado no término.</div>
          </div>

          <!-- Card 3: Em Levantamento / Processamento -->
          <div class="fin-card card-pending">
            <div class="fin-card-top">
              <span class="fin-card-label">Em Levantamento</span>
              <span class="fin-card-icon">⏳</span>
            </div>
            <div class="fin-card-value">{{ formatCurrency(walletSummary.pendingWithdrawals || 0) }}</div>
            <div class="fin-card-desc">Pedidos de transferência em validação administrativa.</div>
          </div>

          <!-- Card 4: Total Reembolsado -->
          <div class="fin-card card-refunded">
            <div class="fin-card-top">
              <span class="fin-card-label">Total Reembolsado</span>
              <span class="fin-card-icon">💰</span>
            </div>
            <div class="fin-card-value">{{ formatCurrency(walletSummary.totalRefunded || 0) }}</div>
            <div class="fin-card-desc">Garantias devolvidas com sucesso à sua carteira.</div>
          </div>
        </div>

        <!-- Transparency Notice Banner: Como funciona a caução de garantia -->
        <div class="wallet-transparency-banner">
          <div class="wtb-icon">🛡️</div>
          <div class="wtb-content">
            <h4 class="wtb-title">Garantia Reembolsável de Participação</h4>
            <p class="wtb-text">
              Na Prime Auction, as taxas de inscrição não são taxas administrativas não reembolsáveis. Funcionam como uma <strong>garantia temporária de participação</strong> que é <strong>100% devolvida à sua carteira</strong> logo após o encerramento de cada leilão.
            </p>
            <div class="wtb-choices">
              <span class="wtb-choice-item">✓ <strong>Opção A:</strong> Deixar o saldo na carteira para participar em novos leilões sem novo pagamento.</span>
              <span class="wtb-choice-item">✓ <strong>Opção B:</strong> Solicitar o levantamento gratuito para a sua conta bancária ou M-Pesa.</span>
            </div>
          </div>
        </div>

        <!-- Sub Tabs Navigation: Extrato | Levantamentos | Pagamentos M-Pesa -->
        <div class="wallet-subtabs-nav">
          <button 
            type="button" 
            class="subtab-btn" 
            :class="{ active: walletSubTab === 'transactions' }"
            @click="walletSubTab = 'transactions'"
          >
            📊 Extrato Financeiro & Garantias
          </button>
          <button 
            type="button" 
            class="subtab-btn" 
            :class="{ active: walletSubTab === 'withdrawals' }"
            @click="walletSubTab = 'withdrawals'"
          >
            🏦 Pedidos de Levantamento ({{ withdrawals.length }})
          </button>
          <button 
            type="button" 
            class="subtab-btn" 
            :class="{ active: walletSubTab === 'mpesa' }"
            @click="walletSubTab = 'mpesa'"
          >
            📱 Pagamentos M-Pesa / Operadoras ({{ payments.length }})
          </button>
        </div>

        <!-- SUBTAB 1: Extrato de Transações e Garantias -->
        <div v-if="walletSubTab === 'transactions'" class="card bids-card" style="margin-top: 1rem;">
          <div class="bids-header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;">
            <h4 style="margin: 0; font-size: 1.1rem; color: #1e293b; font-weight: 700;">Histórico de Movimentos da Carteira</h4>
            
            <!-- Filters -->
            <div class="tx-filter-pills">
              <button 
                type="button" 
                class="filter-pill" 
                :class="{ active: txFilterType === 'all' }"
                @click="filterTransactions('all')"
              >
                Todos
              </button>
              <button 
                type="button" 
                class="filter-pill" 
                :class="{ active: txFilterType === 'fee_reservation' }"
                @click="filterTransactions('fee_reservation')"
              >
                Garantias Reservadas
              </button>
              <button 
                type="button" 
                class="filter-pill" 
                :class="{ active: txFilterType === 'fee_release' }"
                @click="filterTransactions('fee_release')"
              >
                Garantias Devolvidas
              </button>
              <button 
                type="button" 
                class="filter-pill" 
                :class="{ active: txFilterType === 'withdrawal' }"
                @click="filterTransactions('withdrawal')"
              >
                Levantamentos
              </button>
            </div>
          </div>

          <div v-if="loadingWalletTransactions" class="loading-state">
            <div class="spinner"></div>
            <p>A carregar extrato financeiro...</p>
          </div>

          <div v-else-if="filteredWalletTransactions.length === 0" class="empty-state">
            <span style="font-size: 2.5rem; display: block; margin-bottom: 0.5rem;">👛</span>
            <h4>Sem movimentos registados</h4>
            <p>Os seus depósitos, cauções de leilões, devoluções e levantamentos aparecerão aqui com auditoria completa.</p>
            <router-link to="/auctions" class="btn btn-primary btn-pill" style="margin-top: 1rem;">
              Ver Leilões Disponíveis
            </router-link>
          </div>

          <div v-else class="table-responsive">
            <table class="proposal-table">
              <thead>
                <tr>
                  <th>Data & Hora</th>
                  <th>Operação / Descrição</th>
                  <th>Leilão Associado</th>
                  <th>Tipo</th>
                  <th>Montante</th>
                  <th>Saldo Resultante</th>
                  <th>Estado</th>
                  <th>Comprovativo</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="tx in filteredWalletTransactions" :key="tx._id">
                  <td style="white-space: nowrap; font-size: 0.8rem; color: #64748b;">
                    {{ new Date(tx.createdAt).toLocaleString('pt-MZ') }}
                  </td>
                  <td>
                    <div style="display: flex; flex-direction: column;">
                      <strong style="color: #0f172a; font-size: 0.85rem;">{{ tx.description }}</strong>
                      <span style="font-size: 0.72rem; color: #94a3b8; font-family: monospace;">Ref: {{ tx.reference }}</span>
                    </div>
                  </td>
                  <td>
                    <span v-if="tx.auction" style="font-size: 0.85rem; font-weight: 600; color: #1e40af;">
                      {{ tx.auction.title }}
                    </span>
                    <span v-else style="color: #94a3b8; font-size: 0.8rem;">—</span>
                  </td>
                  <td>
                    <span class="tx-type-badge" :class="'type-' + tx.type">
                      {{ getTransactionTypeLabel(tx.type) }}
                    </span>
                  </td>
                  <td>
                    <strong 
                      :style="{ 
                        color: tx.type === 'fee_release' || tx.type === 'deposit' ? '#16a34a' : '#0f172a',
                        fontWeight: '800'
                      }"
                    >
                      {{ tx.type === 'fee_release' || tx.type === 'deposit' ? '+' : '-' }}{{ formatCurrency(tx.amount) }}
                    </strong>
                  </td>
                  <td style="font-size: 0.85rem; color: #334155; font-weight: 600;">
                    {{ formatCurrency(tx.balanceAfter?.available || 0) }}
                  </td>
                  <td>
                    <span class="status-badge" :class="'status-' + tx.status">
                      {{ getTxStatusLabel(tx.status) }}
                    </span>
                  </td>
                  <td>
                    <button 
                      @click="openReceiptModal(tx)" 
                      class="btn btn-sm btn-pill btn-receipt-view"
                      title="Ver e Imprimir Comprovativo Digital"
                    >
                      📜 Comprovativo
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- SUBTAB 2: Pedidos de Levantamento -->
        <div v-else-if="walletSubTab === 'withdrawals'" class="card bids-card" style="margin-top: 1rem;">
          <div class="bids-header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;">
            <div>
              <h4 style="margin: 0; font-size: 1.1rem; color: #1e293b; font-weight: 700;">Histórico de Levantamentos</h4>
              <p style="margin: 2px 0 0 0; font-size: 0.78rem; color: #64748b;">
                Transferências bancárias e pagamentos por M-Pesa solicitados a partir do seu saldo disponível.
              </p>
            </div>
            <button @click="openWithdrawModal" class="btn btn-sm btn-primary btn-pill" :disabled="(walletSummary.availableBalance || 0) < 50">
              + Novo Levantamento
            </button>
          </div>

          <div v-if="loadingWithdrawals" class="loading-state">
            <div class="spinner"></div>
            <p>A carregar histórico de levantamentos...</p>
          </div>

          <div v-else-if="withdrawals.length === 0" class="empty-state">
            <span style="font-size: 2.5rem; display: block; margin-bottom: 0.5rem;">🏦</span>
            <h4>Sem pedidos de levantamento</h4>
            <p>Ainda não efetuou nenhum pedido de levantamento de saldo.</p>
            <button 
              @click="openWithdrawModal" 
              class="btn btn-primary btn-pill" 
              style="margin-top: 1rem;"
              :disabled="(walletSummary.availableBalance || 0) < 50"
            >
              Solicitar Primeiro Levantamento
            </button>
          </div>

          <div v-else class="table-responsive">
            <table class="proposal-table">
              <thead>
                <tr>
                  <th>Referência</th>
                  <th>Data</th>
                  <th>Método</th>
                  <th>Conta / Destino</th>
                  <th>Valor</th>
                  <th>Estado</th>
                  <th>Notas / Observações</th>
                  <th>Acções</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="w in withdrawals" :key="w._id">
                  <td><code style="font-weight: 700; color: #3b82f6;">{{ w.reference }}</code></td>
                  <td style="font-size: 0.8rem; color: #64748b;">{{ new Date(w.createdAt).toLocaleString('pt-MZ') }}</td>
                  <td>
                    <span class="method-tag-pill" :class="'method-' + w.method">
                      {{ w.method === 'mpesa' ? 'Vodacom M-Pesa' : w.method === 'emola' ? 'Movitel eMola' : 'Conta Bancária' }}
                    </span>
                  </td>
                  <td style="font-size: 0.85rem;">
                    <div v-if="w.method === 'bank'">
                      <strong>{{ w.destinationAccount?.bankName }}</strong>
                      <div style="font-size: 0.75rem; color: #64748b;">Conta: {{ w.destinationAccount?.accountNumber }}</div>
                      <div v-if="w.destinationAccount?.holderName" style="font-size: 0.75rem; color: #64748b;">Titular: {{ w.destinationAccount?.holderName }}</div>
                    </div>
                    <div v-else>
                      <strong>+258 {{ w.destinationAccount?.phoneNumber }}</strong>
                    </div>
                  </td>
                  <td><strong style="color: #0f172a; font-size: 0.95rem;">{{ formatCurrency(w.amount) }}</strong></td>
                  <td>
                    <span class="status-badge" :class="'withdrawal-status-' + w.status">
                      {{ getWithdrawalStatusLabel(w.status) }}
                    </span>
                  </td>
                  <td style="font-size: 0.8rem; color: #475569; max-width: 200px;">
                    <span v-if="w.rejectionReason" style="color: #b91c1c; font-weight: 600;">Motivo: {{ w.rejectionReason }}</span>
                    <span v-else>{{ w.adminNotes || 'Em processamento...' }}</span>
                  </td>
                  <td>
                    <button 
                      v-if="w.status === 'pending'" 
                      @click="handleCancelWithdrawal(w._id)"
                      class="btn btn-sm btn-cancel-withdraw"
                      title="Cancelar este pedido e devolver o saldo à carteira"
                    >
                      Cancelar
                    </button>
                    <span v-else style="font-size: 0.75rem; color: #94a3b8;">—</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- SUBTAB 3: Pagamentos M-Pesa Legados / C2B -->
        <div v-else-if="walletSubTab === 'mpesa'" class="card bids-card" style="margin-top: 1rem;">
          <div class="bids-header" style="display: flex; justify-content: space-between; align-items: center;">
            <h4 style="margin: 0; font-size: 1.1rem; color: #1e293b; font-weight: 700;">Pagamentos Diretos por Telemóvel</h4>
            <span style="background: #e60000; color: white; padding: 0.25rem 0.75rem; border-radius: 99px; font-weight: 700; font-size: 0.75rem;">
              Vodacom M-Pesa & Movitel
            </span>
          </div>

          <div v-if="loadingPayments" class="loading-state">
            <div class="spinner"></div>
            <p>A carregar pagamentos...</p>
          </div>

          <div v-else-if="payments.length === 0" class="empty-state">
            <span style="font-size: 2.5rem; display: block; margin-bottom: 0.5rem;">📱</span>
            <h4>Sem pagamentos externos registados</h4>
            <p>Ainda não efetuou pagamentos através do M-Pesa.</p>
          </div>

          <div v-else class="table-responsive">
            <table class="proposal-table">
              <thead>
                <tr>
                  <th>Leilão</th>
                  <th>ID Transação</th>
                  <th>Referência</th>
                  <th>Telemóvel</th>
                  <th>Valor Pago</th>
                  <th>Natureza</th>
                  <th>Estado</th>
                  <th>Data</th>
                  <th>Certificado</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="pay in payments" :key="pay._id">
                  <td>
                    <strong class="prop-table-title">{{ pay.auction?.title || 'Leilão' }}</strong>
                  </td>
                  <td><code style="color: #e60000; font-weight: 700; background: #fff1f2; padding: 0.25rem 0.5rem; border-radius: 4px;">{{ pay.mpesaTransactionId }}</code></td>
                  <td>{{ pay.reference }}</td>
                  <td>{{ pay.phoneNumber }}</td>
                  <td><strong style="color: #16a34a;">{{ formatCurrency(pay.amount) }}</strong></td>
                  <td>
                    <span style="font-size: 0.75rem; color: #059669; font-weight: 700; background: #dcfce7; padding: 2px 6px; border-radius: 4px;">
                      Garantia Reembolsável ✓
                    </span>
                  </td>
                  <td>
                    <span class="status-badge" :style="{ background: pay.status === 'completed' ? '#dcfce7' : '#fef3c7', color: pay.status === 'completed' ? '#15803d' : '#b45309', padding: '0.25rem 0.6rem', borderRadius: '6px', fontWeight: '700', fontSize: '0.75rem' }">
                      {{ pay.status === 'completed' ? 'COMPLETADO ✓' : 'PENDENTE' }}
                    </span>
                  </td>
                  <td>{{ new Date(pay.createdAt).toLocaleString('pt-MZ') }}</td>
                  <td>
                    <button 
                      @click="openCertModal(pay)"
                      class="btn btn-sm btn-pill"
                      style="padding: 0.3rem 0.65rem; font-size: 0.75rem; font-weight: 700; background: var(--btn-primary-bg); color: white; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; white-space: nowrap;"
                    >
                      📜 Ver Certificado
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>

      <!-- TAB Content: Edit Profile -->
      <div v-else-if="activeTab === 'edit-profile'" class="edit-profile-layout">
        <!-- Profile Info Form -->
        <div class="card edit-card">
          <h3 class="edit-title">
            <svg xmlns="http://www.w3.org/2000/svg" class="edit-title-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Informações Pessoais
          </h3>
          
          <form @submit.prevent="handleUpdateProfile" class="edit-form">
            <div class="form-group">
              <label class="form-label" for="edit-name">Nome Completo</label>
              <input type="text" id="edit-name" v-model="profileForm.name" class="form-input" required />
            </div>
            
            <div class="form-group">
              <label class="form-label" for="edit-email">Endereço de Email</label>
              <input type="email" id="edit-email" v-model="profileForm.email" class="form-input" required />
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="edit-province">Província</label>
                <select id="edit-province" v-model="profileForm.province" class="form-input">
                  <option value="">— Selecionar Província —</option>
                  <option>Maputo Cidade</option>
                  <option>Maputo Província</option>
                  <option>Gaza</option>
                  <option>Inhambane</option>
                  <option>Sofala</option>
                  <option>Manica</option>
                  <option>Tete</option>
                  <option>Zambézia</option>
                  <option>Nampula</option>
                  <option>Cabo Delgado</option>
                  <option>Niassa</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label" for="edit-gender">Sexo</label>
                <select id="edit-gender" v-model="profileForm.gender" class="form-input">
                  <option value="">— Selecionar Sexo —</option>
                  <option>Masculino</option>
                  <option>Feminino</option>
                  <option>Outro</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label" for="edit-age">Idade</label>
                <input type="number" id="edit-age" v-model.number="profileForm.age" class="form-input" min="16" max="120" placeholder="Ex: 30" />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="edit-phone">Contacto Telefónico</label>
              <input type="text" id="edit-phone" v-model="profileForm.phone" class="form-input" placeholder="Ex: +258 84 123 4567" />
            </div>
            
            <div class="form-group">
              <label class="form-label" for="edit-bio">Biografia / Nota</label>
              <textarea id="edit-bio" v-model="profileForm.bio" class="form-input" rows="3" placeholder="Escreva algo sobre si (máx. 200 caracteres)..." maxlength="200"></textarea>
            </div>
            
            <button type="submit" class="btn btn-primary btn-pill submit-btn" :disabled="updatingProfile">
              <span v-if="updatingProfile" class="btn-spinner"></span>
              {{ updatingProfile ? 'A guardar...' : 'Guardar Alterações' }}
            </button>
          </form>
        </div>

        <!-- Security Form -->
        <div class="card edit-card">
          <h3 class="edit-title">
            <svg xmlns="http://www.w3.org/2000/svg" class="edit-title-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Segurança & Palavra-passe
          </h3>
          
          <form @submit.prevent="handleUpdatePassword" class="edit-form">
            <div class="form-group">
              <label class="form-label" for="edit-curr-pass">Palavra-passe Actual</label>
              <input type="password" id="edit-curr-pass" v-model="securityForm.currentPassword" class="form-input" required />
            </div>
            
            <div class="form-group">
              <label class="form-label" for="edit-new-pass">Nova Palavra-passe</label>
              <input type="password" id="edit-new-pass" v-model="securityForm.newPassword" class="form-input" minlength="6" placeholder="Mínimo 6 caracteres" required />
            </div>
            
            <div class="form-group">
              <label class="form-label" for="edit-conf-pass">Confirmar Nova Palavra-passe</label>
              <input type="password" id="edit-conf-pass" v-model="securityForm.confirmPassword" class="form-input" minlength="6" required />
            </div>
            
            <button type="submit" class="btn btn-primary btn-pill submit-btn" :disabled="updatingSecurity">
              <span v-if="updatingSecurity" class="btn-spinner"></span>
              {{ updatingSecurity ? 'A alterar...' : 'Actualizar Palavra-passe' }}
            </button>
          </form>
        </div>
      </div>

      <!-- TAB Content: Chat -->
      <div v-else-if="activeTab === 'chat'">
        <Chat />
      </div>

    <!-- Certificado de Arrematação / Recibo Modal -->
    <Transition name="modal-fade">
      <div v-if="showCertModal" class="custom-modal-overlay" @click.self="closeCertModal">
        <div class="custom-modal-card animate-scale-in" style="max-width: 620px; width: 92%; padding: 0; overflow: hidden; border-radius: 16px;">
          <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: white; padding: 1.25rem 1.5rem; display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <img src="/logo prime.png" alt="Prime Auction" style="height: 28px; width: auto;" />
              <span style="font-weight: 800; font-size: 1rem; color: #60a5fa; border-left: 1px solid #475569; padding-left: 10px;">
                Certificado Oficial
              </span>
            </div>
            <button type="button" @click="closeCertModal" style="background: transparent; border: none; color: #94a3b8; font-size: 1.25rem; cursor: pointer;">✕</button>
          </div>

          <div style="padding: 1.5rem; background: #ffffff; text-align: left;">
            <!-- Top Partner Logos Bar -->
            <div style="display: flex; align-items: center; justify-content: space-between; background: #f8fafc; border: 1px solid #e2e8f0; padding: 0.75rem 1rem; border-radius: 10px; margin-bottom: 1.25rem;">
              <span style="font-size: 0.75rem; font-weight: 700; color: #475569;">Parceiros de Liquidação:</span>
              <div style="display: flex; align-items: center; gap: 8px;">
                <img src="/mpesa-logo.png" alt="M-Pesa" style="height: 20px; width: auto; border-radius: 4px; border: 1px solid #e2e8f0; padding: 1px 4px; background: white;" title="Vodacom M-Pesa" />
                <img src="/emola-logo.png" alt="eMola" style="height: 20px; width: auto; border-radius: 4px; border: 1px solid #e2e8f0; padding: 1px 4px; background: white;" title="Movitel eMola" />
                <img src="/visa-logo.png" alt="Visa" style="height: 20px; width: auto; border-radius: 4px; border: 1px solid #e2e8f0; padding: 1px 4px; background: white;" title="Visa Secure" />
              </div>
            </div>

            <!-- Certificate Body -->
            <div style="border: 2px dashed #cbd5e1; border-radius: 12px; padding: 1.25rem; background: #fdfdfd;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; border-bottom: 1px solid #f1f5f9; padding-bottom: 0.75rem;">
                <div>
                  <h4 style="margin: 0; font-size: 1.1rem; font-weight: 800; color: #0f172a;">Certificado de Arrematação & Liquidação</h4>
                  <span style="font-size: 0.75rem; color: #64748b;">Doc. Nº {{ selectedCertPay?.mpesaTransactionId }}</span>
                </div>
                <span style="background: #dcfce7; color: #15803d; font-size: 0.75rem; font-weight: 800; padding: 0.25rem 0.6rem; border-radius: 6px;">
                  AUTENTICADO ✓
                </span>
              </div>

              <div style="display: flex; flex-direction: column; gap: 0.6rem; font-size: 0.85rem;">
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #64748b;">Arrematante:</span>
                  <strong style="color: #0f172a;">{{ authStore.user?.name }} ({{ authStore.user?.email }})</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #64748b;">Leilão / Artigo:</span>
                  <strong style="color: #0f172a;">{{ selectedCertPay?.auction?.title || 'Artigo Leiloado' }}</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #64748b;">ID Transação M-Pesa:</span>
                  <strong style="font-family: monospace; color: #e60000;">{{ selectedCertPay?.mpesaTransactionId }}</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #64748b;">Referência:</span>
                  <span style="color: #334155; font-weight: 600;">{{ selectedCertPay?.reference }}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #64748b;">Telemóvel:</span>
                  <span style="color: #334155;">{{ selectedCertPay?.phoneNumber }}</span>
                </div>
                <div style="display: flex; justify-content: space-between; border-top: 1px solid #f1f5f9; padding-top: 0.5rem; margin-top: 0.25rem;">
                  <span style="color: #64748b; font-weight: 700;">Valor Total Liquidado:</span>
                  <strong style="color: #16a34a; font-size: 1.1rem; font-weight: 900;">{{ formatCurrency(selectedCertPay?.amount) }}</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #64748b;">Data de Emissão:</span>
                  <span style="color: #334155;">{{ new Date(selectedCertPay?.createdAt).toLocaleString('pt-MZ') }}</span>
                </div>
              </div>

              <!-- Bottom Financial Partner Logos & Legal Footer -->
              <div style="margin-top: 1rem; border-top: 1px solid #f1f5f9; padding-top: 0.75rem;">
                <span style="font-size: 0.7rem; font-weight: 700; color: #64748b; display: block; margin-bottom: 0.3rem;">Bancos & Parceiros Financeiros Associados:</span>
                <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                  <span style="font-size: 0.68rem; font-weight: 700; background: #f1f5f9; color: #334155; padding: 2px 6px; border-radius: 4px; border: 1px solid #cbd5e1;">BCI</span>
                  <span style="font-size: 0.68rem; font-weight: 700; background: #f1f5f9; color: #334155; padding: 2px 6px; border-radius: 4px; border: 1px solid #cbd5e1;">Millennium bim</span>
                  <span style="font-size: 0.68rem; font-weight: 700; background: #f1f5f9; color: #334155; padding: 2px 6px; border-radius: 4px; border: 1px solid #cbd5e1;">Standard Bank</span>
                  <span style="font-size: 0.68rem; font-weight: 700; background: #f1f5f9; color: #334155; padding: 2px 6px; border-radius: 4px; border: 1px solid #cbd5e1;">Santam</span>
                  <span style="font-size: 0.68rem; font-weight: 700; background: #f1f5f9; color: #334155; padding: 2px 6px; border-radius: 4px; border: 1px solid #cbd5e1;">MFC</span>
                </div>
                <p style="font-size: 0.7rem; color: #94a3b8; margin-top: 0.5rem; margin-bottom: 0; line-height: 1.35;">
                  <svg xmlns="http://www.w3.org/2000/svg" class="security-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="width: 12px; height: 12px; vertical-align: middle; margin-right: 4px;">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Documento e selo de arrematação emitidos e validados eletronicamente em conformidade com as instituições parceiras da Prime Auction em Moçambique.
                </p>
              </div>
            </div>

            <!-- Actions -->
            <div style="display: flex; gap: 0.75rem; margin-top: 1.25rem;">
              <button type="button" @click="printCert" class="btn btn-outline" style="flex: 1; padding: 0.75rem; font-weight: 700; border-radius: 10px; border: 1px solid #cbd5e1; background: white; cursor: pointer;">
                🖨️ Imprimir / Guardar PDF
              </button>
              <button type="button" @click="closeCertModal" class="btn btn-primary" style="flex: 1; padding: 0.75rem; font-weight: 700; border-radius: 10px; cursor: pointer;">
                Fechar
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Modal: Solicitar Levantamento (Requisito 3) -->
    <Transition name="modal-fade">
      <div v-if="showWithdrawModal" class="custom-modal-overlay" @click.self="closeWithdrawModal">
        <div class="custom-modal-card animate-scale-in" style="max-width: 480px; width: 92%; padding: 0; overflow: hidden; border-radius: 16px;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); color: white; padding: 1.25rem 1.5rem; display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 1.3rem;">🏦</span>
              <h4 style="margin: 0; font-size: 1.1rem; font-weight: 800; color: #ffffff;">Solicitar Levantamento</h4>
            </div>
            <button type="button" @click="closeWithdrawModal" style="background: transparent; border: none; color: #94a3b8; font-size: 1.25rem; cursor: pointer;">✕</button>
          </div>

          <form @submit.prevent="handleSubmitWithdrawal" style="padding: 1.5rem; background: #ffffff;">
            <!-- Available balance indicator -->
            <div style="background: #f0fdf4; border: 1.5px solid #bbf7d0; border-radius: 12px; padding: 0.85rem 1rem; margin-bottom: 1.25rem; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <span style="font-size: 0.72rem; color: #166534; font-weight: 700; text-transform: uppercase;">Saldo Disponível para Levantamento</span>
                <div style="font-size: 1.25rem; font-weight: 900; color: #15803d;">{{ formatCurrency(walletSummary.availableBalance || 0) }}</div>
              </div>
              <button 
                type="button" 
                @click="withdrawForm.amount = walletSummary.availableBalance" 
                class="btn btn-sm btn-pill" 
                style="background: #22c55e; color: white; border: none; font-size: 0.75rem; font-weight: 700; padding: 0.35rem 0.75rem;"
              >
                Levantar Tudo
              </button>
            </div>

            <!-- Amount Input -->
            <div class="form-group" style="margin-bottom: 1rem;">
              <label class="form-label" style="font-weight: 700; font-size: 0.85rem;">Valor a Levantar (MZN) *</label>
              <div style="position: relative;">
                <input 
                  type="number" 
                  v-model.number="withdrawForm.amount" 
                  :max="walletSummary.availableBalance || 0" 
                  min="50" 
                  step="1"
                  placeholder="Ex: 500" 
                  class="form-input" 
                  style="font-size: 1.1rem; font-weight: 700; padding-left: 3.5rem;"
                  required 
                />
                <span style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); font-weight: 800; color: #64748b;">MZN</span>
              </div>
              <span style="font-size: 0.72rem; color: #64748b; margin-top: 4px; display: block;">Mínimo: 50 MZN • Sem comissões ocultas</span>
            </div>

            <!-- Method Selection -->
            <div class="form-group" style="margin-bottom: 1rem;">
              <label class="form-label" style="font-weight: 700; font-size: 0.85rem;">Método de Destino *</label>
              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
                <button 
                  type="button" 
                  class="method-tab-btn" 
                  :class="{ active: withdrawForm.method === 'mpesa' }" 
                  @click="withdrawForm.method = 'mpesa'"
                  style="padding: 0.5rem;"
                >
                  <img src="/mpesa-logo.png" alt="M-Pesa" style="height: 22px; object-fit: contain;" />
                  <span style="font-size: 0.7rem; font-weight: 700;">M-Pesa</span>
                </button>
                <button 
                  type="button" 
                  class="method-tab-btn" 
                  :class="{ active: withdrawForm.method === 'emola' }" 
                  @click="withdrawForm.method = 'emola'"
                  style="padding: 0.5rem;"
                >
                  <img src="/emola-logo.png" alt="eMola" style="height: 22px; object-fit: contain;" />
                  <span style="font-size: 0.7rem; font-weight: 700;">eMola</span>
                </button>
                <button 
                  type="button" 
                  class="method-tab-btn" 
                  :class="{ active: withdrawForm.method === 'bank' }" 
                  @click="withdrawForm.method = 'bank'"
                  style="padding: 0.5rem;"
                >
                  <span style="font-size: 1.15rem;">🏛️</span>
                  <span style="font-size: 0.7rem; font-weight: 700;">Banco</span>
                </button>
              </div>
            </div>

            <!-- Destination Account Details -->
            <div v-if="withdrawForm.method === 'mpesa' || withdrawForm.method === 'emola'" class="form-group" style="margin-bottom: 1rem;">
              <label class="form-label" style="font-weight: 700; font-size: 0.85rem;">
                Número de Telemóvel {{ withdrawForm.method === 'mpesa' ? 'Vodacom' : 'Movitel' }} (9 dígitos) *
              </label>
              <div style="display: flex; align-items: center; border: 1.5px solid #cbd5e1; border-radius: 10px; overflow: hidden;">
                <span style="background: #f1f5f9; padding: 0.65rem 0.85rem; font-weight: 700; color: #475569; font-size: 0.85rem;">🇲🇿 +258</span>
                <input 
                  type="tel" 
                  v-model="withdrawForm.destinationAccount.phoneNumber" 
                  placeholder="84XXXXXXX / 86XXXXXXX" 
                  maxlength="9" 
                  required 
                  style="border: none; padding: 0.65rem 0.85rem; width: 100%; outline: none; font-size: 0.95rem; font-weight: 600;" 
                />
              </div>
            </div>

            <div v-else-if="withdrawForm.method === 'bank'" style="display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1rem;">
              <div class="form-group">
                <label class="form-label" style="font-weight: 700; font-size: 0.8rem;">Banco de Destino *</label>
                <select v-model="withdrawForm.destinationAccount.bankName" class="form-input" required>
                  <option>Millennium bim</option>
                  <option>BCI (Banco Comercial e de Investimentos)</option>
                  <option>Standard Bank</option>
                  <option>Absa Bank Moçambique</option>
                  <option>Moza Banco</option>
                  <option>FNB Moçambique</option>
                  <option>Nedbank Moçambique</option>
                  <option>Access Bank</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label" style="font-weight: 700; font-size: 0.8rem;">Número de Conta / NIB / IBAN *</label>
                <input 
                  type="text" 
                  v-model="withdrawForm.destinationAccount.accountNumber" 
                  placeholder="Insira o NIB ou Conta" 
                  class="form-input" 
                  required 
                />
              </div>
              <div class="form-group">
                <label class="form-label" style="font-weight: 700; font-size: 0.8rem;">Nome Completo do Titular *</label>
                <input 
                  type="text" 
                  v-model="withdrawForm.destinationAccount.holderName" 
                  placeholder="Nome do titular da conta" 
                  class="form-input" 
                  required 
                />
              </div>
            </div>

            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 0.75rem; font-size: 0.72rem; color: #64748b; line-height: 1.4; margin-bottom: 1.25rem;">
              🔒 <strong>Processamento Financeiro:</strong> O pedido será validado pela equipa financeira em até 24 horas úteis. O montante fica reservado com garantia de segurança.
            </div>

            <div style="display: flex; gap: 0.75rem;">
              <button type="button" @click="closeWithdrawModal" class="btn btn-outline" style="flex: 1; padding: 0.75rem; font-weight: 700; border-radius: 10px;" :disabled="submittingWithdraw">
                Cancelar
              </button>
              <button type="submit" class="btn btn-primary" style="flex: 1.5; padding: 0.75rem; font-weight: 700; border-radius: 10px; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); border: none;" :disabled="submittingWithdraw || !withdrawForm.amount || withdrawForm.amount < 50 || withdrawForm.amount > (walletSummary.availableBalance || 0)">
                <span v-if="submittingWithdraw" class="spinner-sm" style="display: inline-block; vertical-align: middle; margin-right: 6px;"></span>
                <span>{{ submittingWithdraw ? 'A processar...' : 'Confirmar Pedido' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>

    <!-- Modal: Comprovativo Digital Oficial de Movimento da Carteira (Requisito 5) -->
    <Transition name="modal-fade">
      <div v-if="showReceiptModal && selectedReceiptTx" class="custom-modal-overlay" @click.self="showReceiptModal = false">
        <div class="custom-modal-card animate-scale-in" style="max-width: 580px; width: 92%; padding: 0; overflow: hidden; border-radius: 16px;">
          <!-- Top Header -->
          <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: white; padding: 1.25rem 1.5rem; display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <img src="/logo prime.png" alt="Prime Auction" style="height: 28px; width: auto;" />
              <span style="font-weight: 800; font-size: 0.95rem; color: #60a5fa; border-left: 1px solid #475569; padding-left: 10px;">
                Comprovativo Digital de Operação
              </span>
            </div>
            <button type="button" @click="showReceiptModal = false" style="background: transparent; border: none; color: #94a3b8; font-size: 1.25rem; cursor: pointer;">✕</button>
          </div>

          <div style="padding: 1.5rem; background: #ffffff;">
            <!-- Receipt Certificate Box -->
            <div id="receipt-print-area" style="border: 2px dashed #cbd5e1; border-radius: 12px; padding: 1.25rem; background: #fafafa;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.75rem;">
                <div>
                  <h4 style="margin: 0; font-size: 1.1rem; font-weight: 800; color: #0f172a;">Recibo de Movimento Financeiro</h4>
                  <span style="font-size: 0.75rem; color: #64748b; font-family: monospace;">Ref: {{ selectedReceiptTx.reference }}</span>
                </div>
                <span class="status-badge" :class="'status-' + selectedReceiptTx.status" style="font-weight: 800; font-size: 0.75rem; padding: 0.25rem 0.6rem;">
                  {{ getTxStatusLabel(selectedReceiptTx.status) }} ✓
                </span>
              </div>

              <div style="display: flex; flex-direction: column; gap: 0.65rem; font-size: 0.85rem;">
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #64748b;">Titular da Carteira:</span>
                  <strong style="color: #0f172a;">{{ authStore.user?.name }} ({{ authStore.user?.email }})</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #64748b;">Tipo de Operação:</span>
                  <strong style="color: #1d4ed8;">{{ getTransactionTypeLabel(selectedReceiptTx.type) }}</strong>
                </div>
                <div v-if="selectedReceiptTx.auction" style="display: flex; justify-content: space-between;">
                  <span style="color: #64748b;">Leilão Associado:</span>
                  <strong style="color: #0f172a;">{{ selectedReceiptTx.auction?.title }}</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #64748b;">Descrição:</span>
                  <span style="color: #334155; text-align: right; max-width: 65%;">{{ selectedReceiptTx.description }}</span>
                </div>
                <div style="display: flex; justify-content: space-between; border-top: 1px solid #e2e8f0; padding-top: 0.6rem; margin-top: 0.25rem;">
                  <span style="color: #0f172a; font-weight: 800;">Valor da Operação:</span>
                  <strong style="color: #16a34a; font-size: 1.15rem; font-weight: 900;">{{ formatCurrency(selectedReceiptTx.amount) }}</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #64748b;">Natureza da Taxa:</span>
                  <span style="color: #059669; font-weight: 700;">Garantia Reembolsável (Caução) ✓</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #64748b;">Saldo Disponível Resultante:</span>
                  <strong style="color: #0f172a;">{{ formatCurrency(selectedReceiptTx.balanceAfter?.available || 0) }}</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #64748b;">Data & Hora de Registo:</span>
                  <span style="color: #334155;">{{ new Date(selectedReceiptTx.createdAt).toLocaleString('pt-MZ') }}</span>
                </div>
              </div>

              <!-- Endorsement partners -->
              <div style="margin-top: 1rem; border-top: 1px solid #e2e8f0; padding-top: 0.75rem;">
                <span style="font-size: 0.68rem; font-weight: 700; color: #64748b; display: block; margin-bottom: 0.35rem;">Rede de Pagamentos e Custódia:</span>
                <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                  <span style="font-size: 0.68rem; font-weight: 700; background: #ffffff; color: #334155; padding: 2px 6px; border-radius: 4px; border: 1px solid #cbd5e1;">Vodacom M-Pesa</span>
                  <span style="font-size: 0.68rem; font-weight: 700; background: #ffffff; color: #334155; padding: 2px 6px; border-radius: 4px; border: 1px solid #cbd5e1;">Movitel eMola</span>
                  <span style="font-size: 0.68rem; font-weight: 700; background: #ffffff; color: #334155; padding: 2px 6px; border-radius: 4px; border: 1px solid #cbd5e1;">Visa</span>
                  <span style="font-size: 0.68rem; font-weight: 700; background: #ffffff; color: #334155; padding: 2px 6px; border-radius: 4px; border: 1px solid #cbd5e1;">Millennium bim</span>
                  <span style="font-size: 0.68rem; font-weight: 700; background: #ffffff; color: #334155; padding: 2px 6px; border-radius: 4px; border: 1px solid #cbd5e1;">BCI</span>
                </div>
                <p style="font-size: 0.68rem; color: #94a3b8; margin-top: 0.5rem; margin-bottom: 0; line-height: 1.35;">
                  🔒 Documento financeiro gerado eletronicamente com registo atómico e auditável pelo sistema Prime Auction Moçambique.
                </p>
              </div>
            </div>

            <!-- Modal Actions -->
            <div style="display: flex; gap: 0.75rem; margin-top: 1.25rem;">
              <button type="button" @click="printReceiptTx" class="btn btn-outline" style="flex: 1; padding: 0.75rem; font-weight: 700; border-radius: 10px; border: 1px solid #cbd5e1; background: white; cursor: pointer;">
                🖨️ Imprimir / Guardar PDF
              </button>
              <button type="button" @click="showReceiptModal = false" class="btn btn-primary" style="flex: 1; padding: 0.75rem; font-weight: 700; border-radius: 10px; cursor: pointer;">
                Fechar
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
      <!-- TAB Content: Reviews & Reputation -->
      <div v-if="activeTab === 'reviews'" class="tab-pane animate-fade-in">
        <div style="background: white; border-radius: 16px; padding: 1.5rem; border: 1px solid #e2e8f0; margin-bottom: 1.5rem;">
          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid #f1f5f9;">
            <div>
              <h3 style="font-size: 1.25rem; font-weight: 700; color: #1e293b; margin: 0;">Sua Reputação & Avaliações</h3>
              <p style="font-size: 0.875rem; color: #64748b; margin-top: 0.25rem;">Opiniões e pontuações deixadas por compradores e vendedores com quem fez negócios.</p>
            </div>
            <div style="display: flex; align-items: center; gap: 0.75rem; background: #f8fafc; padding: 0.75rem 1.25rem; border-radius: 12px; border: 1px solid #e2e8f0;">
              <StarRating :rating="authStore.user?.averageRating || 0" :count="authStore.user?.ratingsCount || 0" size="lg" />
            </div>
          </div>

          <!-- Loading state -->
          <div v-if="loadingReviews" style="text-align: center; padding: 2rem;">
            <div class="spinner-sm" style="margin: 0 auto 0.5rem auto;"></div>
            <span style="color: #64748b; font-size: 0.9rem;">A carregar avaliações...</span>
          </div>

          <!-- Reviews List -->
          <div v-else-if="userReviews.length > 0" style="display: flex; flex-direction: column; gap: 1rem;">
            <div 
              v-for="rev in userReviews" 
              :key="rev._id" 
              style="padding: 1.25rem; border-radius: 12px; border: 1px solid #e2e8f0; background: #f8fafc;"
            >
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                  <div style="width: 40px; height: 40px; border-radius: 50%; background: #3b82f6; color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; overflow: hidden;">
                    <img v-if="rev.reviewer?.profilePhoto" :src="rev.reviewer.profilePhoto" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover;" />
                    <span v-else>{{ rev.reviewer?.name?.charAt(0)?.toUpperCase() || 'U' }}</span>
                  </div>
                  <div>
                    <h5 style="margin: 0; font-size: 0.95rem; font-weight: 700; color: #1e293b;">{{ rev.reviewer?.name || 'Utilizador' }}</h5>
                    <span style="font-size: 0.75rem; color: #64748b;">
                      Avaliação como {{ rev.type === 'seller' ? 'Vendedor' : 'Comprador' }} • {{ new Date(rev.createdAt).toLocaleDateString('pt-MZ') }}
                    </span>
                  </div>
                </div>
                <StarRating :rating="rev.rating" size="sm" :showText="false" />
              </div>

              <p v-if="rev.comment" style="margin: 0 0 0.5rem 0; font-size: 0.9rem; color: #334155; line-height: 1.4;">
                "{{ rev.comment }}"
              </p>

              <div v-if="rev.auction" style="font-size: 0.75rem; color: #64748b; background: white; padding: 0.35rem 0.65rem; border-radius: 6px; display: inline-block; border: 1px solid #e2e8f0;">
                <svg xmlns="http://www.w3.org/2000/svg" class="review-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="width: 14px; height: 14px; vertical-align: middle; margin-right: 4px;">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                Referente ao leilão: <strong>{{ rev.auction.title }}</strong>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else style="text-align: center; padding: 3rem 1rem;">
            <svg xmlns="http://www.w3.org/2000/svg" style="width: 48px; height: 48px; stroke-width: 2; display: block; margin: 0 auto 0.5rem auto;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.54 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.784.57-1.838-.197-1.539-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            <h4 style="margin: 0 0 0.25rem 0; font-size: 1.1rem; color: #1e293b;">Ainda não tem avaliações</h4>
            <p style="margin: 0; font-size: 0.875rem; color: #64748b;">Participe e conclua leilões para começar a receber opiniões e construir a sua reputação na plataforma.</p>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useAuthStore } from '../stores/authStore';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { useToastStore } from '../stores/toastStore';
import Chat from '../components/Chat.vue';
import StarRating from '../components/StarRating.vue';

const authStore = useAuthStore();
const router = useRouter();
const toastStore = useToastStore();
const bids = ref([]);
const loading = ref(true);
const activeTab = ref('activity');

const watchlist = ref([]);
const loadingWatchlist = ref(false);
const proposals = ref([]);
const loadingProposals = ref(false);
const payments = ref([]);
const loadingPayments = ref(false);
const userReviews = ref([]);
const loadingReviews = ref(false);

// --- Wallet & Financial Hub State (Requisitos 2, 3 e 5) ---
const walletSummary = ref({
  availableBalance: 0,
  reservedBalance: 0,
  totalRefunded: 0,
  pendingWithdrawals: 0,
  activeReservedAuctionsCount: 0
});
const walletTransactions = ref([]);
const loadingWalletTransactions = ref(false);
const withdrawals = ref([]);
const loadingWithdrawals = ref(false);
const walletSubTab = ref('transactions'); // 'transactions' | 'withdrawals' | 'mpesa'
const txFilterType = ref('all');

// Modals
const showWithdrawModal = ref(false);
const submittingWithdraw = ref(false);
const withdrawForm = ref({
  amount: null,
  method: 'mpesa',
  destinationAccount: {
    phoneNumber: '',
    bankName: 'Millennium bim',
    accountNumber: '',
    holderName: ''
  }
});

const showReceiptModal = ref(false);
const selectedReceiptTx = ref(null);

const filterTransactions = (type) => {
  txFilterType.value = type;
};

const filteredWalletTransactions = computed(() => {
  if (txFilterType.value === 'all') return walletTransactions.value;
  return walletTransactions.value.filter(t => t.type === txFilterType.value);
});

const getTransactionTypeLabel = (type) => {
  const map = {
    deposit: 'Depósito',
    fee_reservation: 'Garantia Reservada',
    fee_release: 'Garantia Devolvida',
    fee_retention_winner: 'Caução de Arrematação',
    fee_deduction: 'Inscrição via Saldo',
    withdrawal: 'Levantamento',
    manual_adjustment: 'Ajuste Administrativo'
  };
  return map[type] || type;
};

const getTxStatusLabel = (status) => {
  const map = {
    completed: 'Concluído',
    pending: 'Pendente',
    rejected: 'Rejeitado',
    cancelled: 'Cancelado'
  };
  return map[status] || status;
};

const getWithdrawalStatusLabel = (status) => {
  const map = {
    pending: 'Pendente (Em Fila)',
    processing: 'Em Processamento Bancário',
    completed: 'Concluído (Transferido) ✓',
    rejected: 'Rejeitado',
    cancelled: 'Cancelado'
  };
  return map[status] || status;
};

const fetchWalletSummary = async () => {
  if (!authStore.isAuthenticated) return;
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const res = await axios.get(`${apiUrl}/api/wallet/summary`, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    });
    if (res.data?.success) {
      walletSummary.value = res.data.data;
    }
  } catch (err) {
    console.error('Error fetching wallet summary:', err);
  }
};

const fetchWalletTransactions = async () => {
  if (!authStore.isAuthenticated) return;
  loadingWalletTransactions.value = true;
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const res = await axios.get(`${apiUrl}/api/wallet/transactions`, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    });
    if (res.data?.success) {
      walletTransactions.value = res.data.data;
    }
  } catch (err) {
    console.error('Error fetching wallet transactions:', err);
  } finally {
    loadingWalletTransactions.value = false;
  }
};

const fetchWithdrawals = async () => {
  if (!authStore.isAuthenticated) return;
  loadingWithdrawals.value = true;
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const res = await axios.get(`${apiUrl}/api/wallet/withdrawals`, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    });
    if (res.data?.success) {
      withdrawals.value = res.data.data;
    }
  } catch (err) {
    console.error('Error fetching withdrawals:', err);
  } finally {
    loadingWithdrawals.value = false;
  }
};

const refreshWalletData = async () => {
  await Promise.all([
    fetchWalletSummary(),
    fetchWalletTransactions(),
    fetchWithdrawals(),
    fetchMyPayments()
  ]);
  toastStore.info('Dados da carteira actualizados.');
};

const openWithdrawModal = () => {
  withdrawForm.value = {
    amount: null,
    method: 'mpesa',
    destinationAccount: {
      phoneNumber: authStore.user?.phone ? authStore.user.phone.replace(/\D/g, '').slice(-9) : '',
      bankName: 'Millennium bim',
      accountNumber: '',
      holderName: authStore.user?.name || ''
    }
  };
  showWithdrawModal.value = true;
};

const closeWithdrawModal = () => {
  showWithdrawModal.value = false;
};

const handleSubmitWithdrawal = async () => {
  if (!withdrawForm.value.amount || withdrawForm.value.amount < 50) {
    toastStore.warning('O valor mínimo para levantamento é de 50 MZN.');
    return;
  }
  if (withdrawForm.value.amount > walletSummary.value.availableBalance) {
    toastStore.error('Saldo disponível insuficiente.');
    return;
  }

  submittingWithdraw.value = true;
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const res = await axios.post(`${apiUrl}/api/wallet/withdraw`, withdrawForm.value, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    });

    if (res.data?.success) {
      toastStore.success(res.data.message || 'Pedido de levantamento registado com sucesso! 🎉');
      showWithdrawModal.value = false;
      await Promise.all([
        fetchWalletSummary(),
        fetchWalletTransactions(),
        fetchWithdrawals()
      ]);
      walletSubTab.value = 'withdrawals';
    }
  } catch (err) {
    console.error('Error submitting withdrawal:', err);
    toastStore.error(err.response?.data?.message || 'Erro ao submeter pedido de levantamento');
  } finally {
    submittingWithdraw.value = false;
  }
};

const handleCancelWithdrawal = async (id) => {
  if (!confirm('Deseja realmente cancelar este pedido de levantamento? O valor retornará imediatamente ao seu saldo disponível.')) {
    return;
  }
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const res = await axios.put(`${apiUrl}/api/wallet/withdrawals/${id}/cancel`, {}, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    });
    if (res.data?.success) {
      toastStore.success('Pedido cancelado e saldo restituído com sucesso! ✓');
      await Promise.all([
        fetchWalletSummary(),
        fetchWalletTransactions(),
        fetchWithdrawals()
      ]);
    }
  } catch (err) {
    console.error('Error cancelling withdrawal:', err);
    toastStore.error(err.response?.data?.message || 'Erro ao cancelar levantamento');
  }
};

const openReceiptModal = (tx) => {
  selectedReceiptTx.value = tx;
  showReceiptModal.value = true;
};

const printReceiptTx = () => {
  window.print();
};

// Certificate Modal State
const showCertModal = ref(false);
const selectedCertPay = ref(null);

const openCertModal = (pay) => {
  selectedCertPay.value = pay;
  showCertModal.value = true;
};

const closeCertModal = () => {
  showCertModal.value = false;
  selectedCertPay.value = null;
};

const printCert = () => {
  window.print();
};

const fetchMyReviews = async () => {
  if (!authStore.user) return;
  loadingReviews.value = true;
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const userId = authStore.user._id || authStore.user.id;
    const res = await axios.get(`${apiUrl}/api/reviews/user/${userId}`);
    userReviews.value = res.data.data;
  } catch (err) {
    console.error('Error fetching user reviews:', err);
  } finally {
    loadingReviews.value = false;
  }
};

const changeTab = (tab) => {
  activeTab.value = tab;
  if (tab === 'watchlist') {
    fetchWatchlist();
  } else if (tab === 'proposals') {
    fetchMyProposals();
  } else if (tab === 'payments') {
    fetchWalletSummary();
    fetchWalletTransactions();
    fetchWithdrawals();
    fetchMyPayments();
  } else if (tab === 'reviews') {
    fetchMyReviews();
  }
};

const fetchMyPayments = async () => {
  loadingPayments.value = true;
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const res = await axios.get(`${apiUrl}/api/payments/my-payments`, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    });
    payments.value = res.data.data;
  } catch (err) {
    console.error('Error fetching payments:', err);
    toastStore.error('Erro ao carregar pagamentos M-Pesa.');
  } finally {
    loadingPayments.value = false;
  }
};

const fetchWatchlist = async () => {
  loadingWatchlist.value = true;
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const res = await axios.get(`${apiUrl}/api/users/watchlist`, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    });
    watchlist.value = res.data.data;
  } catch (err) {
    console.error('Error fetching watchlist:', err);
    toastStore.error('Erro ao carregar favoritos.');
  } finally {
    loadingWatchlist.value = false;
  }
};

const removeFromWatchlist = async (auctionId) => {
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const res = await axios.post(`${apiUrl}/api/users/watchlist/${auctionId}`, {}, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    });
    if (res.data && res.data.success) {
      toastStore.success('Removido dos favoritos. ✓');
      fetchWatchlist();
    }
  } catch (err) {
    console.error('Failed to remove from watchlist:', err);
    toastStore.error('Erro ao remover dos favoritos.');
  }
};

const fetchMyProposals = async () => {
  loadingProposals.value = true;
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const res = await axios.get(`${apiUrl}/api/proposals/myproposals`, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    });
    proposals.value = res.data.data;
  } catch (err) {
    console.error('Error fetching proposals:', err);
    toastStore.error('Erro ao carregar propostas.');
  } finally {
    loadingProposals.value = false;
  }
};

// Edit Forms State
const profileForm = ref({
  name: '',
  email: '',
  phone: '',
  bio: '',
  province: '',
  gender: '',
  age: null
});

const securityForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

const updatingProfile = ref(false);
const updatingSecurity = ref(false);
const photoLoading = ref(false);

const photoInput = ref(null);

// Populate fields when user details load
watch(() => authStore.user, (newVal) => {
  if (newVal) {
    profileForm.value = {
      name: newVal.name || '',
      email: newVal.email || '',
      phone: newVal.phone || '',
      bio: newVal.bio || '',
      province: newVal.province || '',
      gender: newVal.gender || '',
      age: newVal.age || null
    };
  }
}, { immediate: true });

const uniqueAuctions = computed(() => {
  const ids = new Set(bids.value.map(b => b.auction?._id).filter(Boolean));
  return ids.size;
});

const totalBid = computed(() => {
  return bids.value.reduce((sum, b) => sum + (b.amount || 0), 0);
});

const fetchMyBids = async () => {
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const res = await axios.get(`${apiUrl}/api/bids/mybids`, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    });
    bids.value = res.data.data;
  } catch (err) {
    console.error('Error fetching bids:', err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => { 
  fetchMyBids(); 
});

const formatCurrency = (value) => {
  if (value === undefined || value === null) return '0,00 MZN';
  const formatted = new Intl.NumberFormat('pt-MZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
  return `${formatted} MZN`;
};

const formatCurrencyCompact = (value) => {
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(1) + 'M MZN';
  if (value >= 1_000) return (value / 1_000).toFixed(1) + 'K MZN';
  const formatted = new Intl.NumberFormat('pt-MZ', { maximumFractionDigits: 0 }).format(value);
  return `${formatted} MZN`;
};

const logout = () => {
  authStore.logout();
  toastStore.success('Sessão terminada com sucesso! ✓');
  router.push('/');
};

// Update profile logic
const handleUpdateProfile = async () => {
  updatingProfile.value = true;
  
  try {
    const res = await authStore.updateProfile({
      name: profileForm.value.name,
      email: profileForm.value.email,
      phone: profileForm.value.phone,
      bio: profileForm.value.bio,
      province: profileForm.value.province || null,
      gender: profileForm.value.gender || null,
      age: profileForm.value.age || null
    });
    
    if (res.success) {
      toastStore.success('Perfil actualizado com sucesso! ✓');
    } else {
      toastStore.error(res.error || 'Erro ao actualizar o perfil.');
    }
  } catch (err) {
    toastStore.error('Ocorreu um erro no servidor.');
  } finally {
    updatingProfile.value = false;
  }
};

// Update password logic
const handleUpdatePassword = async () => {
  if (securityForm.value.newPassword !== securityForm.value.confirmPassword) {
    toastStore.error('As palavras-passe novas não coincidem.');
    return;
  }
  
  updatingSecurity.value = true;
  
  try {
    const res = await authStore.updateProfile({
      currentPassword: securityForm.value.currentPassword,
      newPassword: securityForm.value.newPassword
    });
    
    if (res.success) {
      toastStore.success('Palavra-passe alterada com sucesso! ✓');
      securityForm.value = { currentPassword: '', newPassword: '', confirmPassword: '' };
    } else {
      toastStore.error(res.error || 'Erro ao alterar a palavra-passe.');
    }
  } catch (err) {
    toastStore.error('Ocorreu um erro no servidor.');
  } finally {
    updatingSecurity.value = false;
  }
};

const triggerPhotoUpload = () => {
  photoInput.value.click();
};

const handlePhotoUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
  if (!file.type.startsWith('image/')) {
    toastStore.error('Por favor seleccione um ficheiro de imagem válido.');
    return;
  }
  
  const formData = new FormData();
  formData.append('photo', file);
  
  photoLoading.value = true;
  
  try {
    const res = await authStore.uploadProfilePhoto(formData);
    if (res.success) {
      toastStore.success('Fotografia de perfil actualizada com sucesso! ✓');
    } else {
      toastStore.error(res.error || 'Erro ao carregar a imagem.');
    }
  } catch (err) {
    toastStore.error('Erro ao carregar a imagem no servidor.');
  } finally {
    photoLoading.value = false;
  }
};
</script>

<style scoped>
.dashboard-container {
  min-height: 100vh;
  background-color: #f5f6fa;
}

/* ── Profile Header ── */
.profile-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  background: white;
  padding: 1.75rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.avatar-container {
  position: relative;
  width: 90px;
  height: 90px;
  border-radius: 50%;
  cursor: pointer;
  overflow: hidden;
  flex-shrink: 0;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  border: 3px solid white;
  outline: 2px solid #e2e8f0;
  transition: transform 0.2s ease, outline-color 0.2s ease;
}

.avatar-container:hover {
  transform: scale(1.02);
  outline-color: var(--btn-primary-bg);
}

.profile-avatar {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, var(--btn-primary-bg), #7b5ea7);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.25rem;
  font-weight: 700;
}

.profile-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-overlay {
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.avatar-container:hover .avatar-overlay {
  opacity: 1;
}

.avatar-spinner-wrap {
  position: absolute;
  inset: 0;
  background-color: rgba(255, 255, 255, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner-sm {
  width: 24px;
  height: 24px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid var(--btn-primary-bg);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.profile-info {
  flex-grow: 1;
}

.profile-email {
  font-size: 0.875rem;
  color: var(--text-light);
  margin-bottom: 0.25rem;
}

.profile-phone {
  font-size: 0.85rem;
  color: var(--text-secondary);
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.profile-bio {
  font-size: 0.875rem;
  color: var(--text-light);
  font-style: italic;
  margin-top: 0.5rem;
  max-width: 500px;
  line-height: 1.4;
}

.status-badge {
  display: inline-block;
  padding: 0.2rem 0.65rem;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.status-badge.active {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.status-badge.blocked {
  background-color: #fdecea;
  color: #c62828;
}

.role-badge {
  background-color: #f3f4f6;
  color: #4b5563;
}

.btn-logout {
  display: flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: 1px solid #e5e7eb;
  color: var(--text-secondary);
  padding: 0.5rem 1rem;
  border-radius: var(--radius-pill);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-logout:hover {
  background-color: #fdecea;
  border-color: var(--danger-color);
  color: var(--danger-color);
}

/* ── Navigation Tabs ── */
.tabs-nav {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 2px;
}

.tab-btn {
  background: none;
  border: none;
  padding: 0.75rem 1.25rem;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-light);
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 2px solid transparent;
  display: flex;
  align-items: center;
  gap: 8px;
}

.tab-btn:hover {
  color: var(--text-primary);
}

.tab-btn.active {
  color: var(--btn-primary-bg);
  border-bottom-color: var(--btn-primary-bg);
}

/* ── Stats Row ── */
.stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.stat-value {
  font-size: clamp(1.25rem, 3vw, 1.75rem);
  font-weight: 700;
  color: var(--btn-primary-bg);
  line-height: 1;
  margin-bottom: 0.4rem;
}

.stat-label {
  font-size: 0.75rem;
  color: var(--text-light);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

/* ── Bids Card ── */
.bids-card {
  padding: 1.75rem;
  border-radius: 12px;
}

.bids-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  gap: 1rem;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

/* ── Loading / Spinners ── */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 3rem;
  color: var(--text-light);
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid #f0f0f0;
  border-top-color: var(--btn-primary-bg);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* ── Empty State ── */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 3rem 1rem;
  color: var(--text-light);
}

.empty-icon {
  width: 48px;
  height: 48px;
  stroke-width: 2;
  margin-bottom: 1rem;
}

.badge-icon-small {
  width: 16px;
  height: 16px;
  stroke-width: 2;
  margin-right: 0.5rem;
  vertical-align: middle;
}

.edit-title-icon {
  width: 20px;
  height: 20px;
  stroke-width: 2;
  margin-right: 0.5rem;
  vertical-align: middle;
}

.placeholder-icon {
  width: 32px;
  height: 32px;
  stroke-width: 2;
  color: #9ca3af;
}

.empty-state h4 {
  font-size: 1.1rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.empty-state p {
  font-size: 0.875rem;
}

/* ── Bid List ── */
.bid-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.bid-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.875rem;
  border-radius: 10px;
  border: 1px solid #f0f0f0;
  transition: background-color 0.2s;
}

.bid-item:hover {
  background-color: #fafafa;
}

.bid-img-wrap {
  width: 52px;
  height: 52px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  background-color: #f0f0f0;
}

.bid-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.placeholder-img {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
}

.bid-details {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.bid-auction-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bid-date {
  font-size: 0.75rem;
  color: var(--text-light);
}

.bid-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.4rem;
  flex-shrink: 0;
}

.bid-amount {
  font-weight: 700;
  font-size: 0.95rem;
  color: var(--btn-primary-bg);
  white-space: nowrap;
}

.btn-sm {
  padding: 0.3rem 0.85rem;
  font-size: 0.75rem;
}

/* ── Edit Profile Tab Layout ── */
.edit-profile-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  align-items: start;
}

.edit-card {
  padding: 1.75rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.04);
}

.edit-title {
  font-size: 1.15rem;
  font-weight: 600;
  margin-bottom: 1.25rem;
  color: var(--text-primary);
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 0.5rem;
}

.edit-form {
  display: flex;
  flex-direction: column;
}

/* 3-column row for province / gender / age */
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1rem;
}

/* make select look like the other inputs */
.form-input select,
select.form-input {
  appearance: none;
  -webkit-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 2rem;
  cursor: pointer;
}

/* Province / gender / age badge colours */
.province-badge { background-color: #e8f4fd; color: #1565c0; }
.gender-badge   { background-color: #f3e8fd; color: #6a1b9a; }
.age-badge      { background-color: #fff8e1; color: #e65100; }

@media (max-width: 640px) {
  .form-row { grid-template-columns: 1fr; }
}


.submit-btn {
  margin-top: 1rem;
  font-weight: 600;
  padding: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

/* Alerts inside form */
.alert {
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 1rem;
}

.error-alert {
  background-color: #fdecea;
  color: #c62828;
  border: 1px solid #fcdad7;
}

.success-alert {
  background-color: #e8f5e9;
  color: #2e7d32;
  border: 1px solid #d4edda;
}

.btn-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

/* ── Mobile Responsive ── */
@media (max-width: 768px) {
  .edit-profile-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .profile-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 1.25rem;
  }

  .profile-bio {
    margin-left: auto;
    margin-right: auto;
  }

  .btn-logout {
    width: 100%;
    justify-content: center;
  }

  .tabs-nav {
    justify-content: center;
  }

  .tab-btn {
    padding: 0.6rem 0.85rem;
    font-size: 0.85rem;
  }

  .stats-row {
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
  }

  .stat-card {
    padding: 0.75rem 0.25rem;
  }

  .bids-card {
    padding: 1.25rem;
  }

  .bid-item {
    flex-wrap: wrap;
  }

  .bid-right {
    flex-direction: row;
    align-items: center;
    flex-grow: 1;
    justify-content: space-between;
    margin-top: 0.5rem;
    margin-left: 68px;
  }
}

@media (max-width: 500px) {
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }
  .stats-row .stat-card:last-child {
    grid-column: span 2;
  }
}

@media (max-width: 380px) {
  .stats-row {
    grid-template-columns: 1fr;
  }
  .stats-row .stat-card:last-child {
    grid-column: auto;
  }
}

/* ── Proposal Table ── */
.table-responsive {
  width: 100%;
  overflow-x: auto;
}

.proposal-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.proposal-table th,
.proposal-table td {
  padding: 1rem 0.75rem;
  border-bottom: 1px solid #f0f0f0;
  font-size: 0.88rem;
}

.proposal-table th {
  font-weight: 700;
  color: var(--text-light);
  text-transform: uppercase;
  font-size: 0.72rem;
  letter-spacing: 0.5px;
  background-color: #fafafa;
}

.prop-table-img {
  width: 48px;
  height: 48px;
  border-radius: 6px;
  object-fit: cover;
  border: 1px solid #e5e7eb;
}

.prop-table-title-wrap {
  display: flex;
  flex-direction: column;
}

.prop-table-title {
  font-weight: 600;
  color: var(--text-primary);
}

.prop-table-condition {
  font-size: 0.75rem;
  color: var(--text-light);
}

.admin-notes-cell {
  color: var(--text-secondary);
  font-style: italic;
  max-width: 250px;
  white-space: normal;
  word-break: break-word;
}

.status-badge.pending {
  background-color: #fff8e1;
  color: #b78103;
}

.status-badge.approved {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.status-badge.rejected {
  background-color: #ffebee;
  color: #c62828;
}

/* --- Financial Hub & Wallet Styles (Requisitos 2, 3 e 5) --- */
.wallet-dashboard-pane {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.wallet-pane-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  background: white;
  padding: 1.25rem 1.5rem;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
}

.wallet-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-withdraw-action {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  font-weight: 700;
  font-size: 0.85rem;
  padding: 0.65rem 1.25rem;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: none;
  border-radius: 99px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
  transition: all 0.2s ease;
}

.btn-withdraw-action:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.35);
}

.btn-withdraw-action:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  box-shadow: none;
}

.btn-refresh-wallet {
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  padding: 0.65rem 0.85rem;
  border-radius: 99px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-refresh-wallet:hover {
  background: #e2e8f0;
}

.financial-kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 1rem;
}

.fin-card {
  background: white;
  border-radius: 16px;
  padding: 1.25rem;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
  transition: all 0.2s ease;
}

.fin-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
}

.fin-card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.fin-card-label {
  font-size: 0.78rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.fin-card-icon {
  font-size: 1.4rem;
}

.fin-card-value {
  font-size: 1.65rem;
  font-weight: 900;
  color: #0f172a;
  margin-bottom: 0.35rem;
}

.fin-card-desc {
  font-size: 0.74rem;
  color: #94a3b8;
  line-height: 1.35;
}

.fin-card.card-available {
  border-left: 4px solid #10b981;
}

.fin-card.card-available .fin-card-value {
  color: #059669;
}

.fin-card.card-reserved {
  border-left: 4px solid #3b82f6;
}

.fin-card.card-reserved .fin-card-value {
  color: #2563eb;
}

.fin-card.card-pending {
  border-left: 4px solid #f59e0b;
}

.fin-card.card-pending .fin-card-value {
  color: #d97706;
}

.fin-card.card-refunded {
  border-left: 4px solid #8b5cf6;
}

.fin-card.card-refunded .fin-card-value {
  color: #7c3aed;
}

.wallet-transparency-banner {
  background: #f0fdf4;
  border: 1.5px solid #bbf7d0;
  border-radius: 16px;
  padding: 1.25rem 1.5rem;
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.wtb-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.wtb-title {
  margin: 0 0 0.35rem 0;
  font-size: 1rem;
  font-weight: 800;
  color: #166534;
}

.wtb-text {
  margin: 0 0 0.6rem 0;
  font-size: 0.82rem;
  color: #14532d;
  line-height: 1.45;
}

.wtb-choices {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 1.5rem;
}

.wtb-choice-item {
  font-size: 0.78rem;
  color: #15803d;
  font-weight: 500;
}

.wallet-subtabs-nav {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 0.5rem;
}

.subtab-btn {
  background: transparent;
  border: none;
  font-size: 0.88rem;
  font-weight: 700;
  color: #64748b;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.subtab-btn.active {
  background: white;
  color: #1d4ed8;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.tx-filter-pills {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.filter-pill {
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  border-radius: 99px;
  padding: 0.25rem 0.65rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-pill.active {
  background: #1d4ed8;
  border-color: #1d4ed8;
  color: white;
}

.tx-type-badge {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.2rem 0.55rem;
  border-radius: 6px;
  display: inline-block;
  white-space: nowrap;
}

.tx-type-badge.type-fee_reservation {
  background: #eff6ff;
  color: #1d4ed8;
}

.tx-type-badge.type-fee_release {
  background: #dcfce7;
  color: #15803d;
}

.tx-type-badge.type-withdrawal {
  background: #fef3c7;
  color: #b45309;
}

.tx-type-badge.type-deposit {
  background: #ede9fe;
  color: #6d28d9;
}

.tx-type-badge.type-fee_retention_winner {
  background: #fef9c3;
  color: #854d0e;
}

.tx-type-badge.type-fee_deduction {
  background: #f1f5f9;
  color: #334155;
}

.status-badge.status-completed {
  background: #dcfce7;
  color: #15803d;
}

.status-badge.status-pending {
  background: #fef3c7;
  color: #b45309;
}

.status-badge.status-rejected {
  background: #fee2e2;
  color: #b91c1c;
}

.status-badge.status-cancelled {
  background: #f1f5f9;
  color: #64748b;
}

.btn-receipt-view {
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  color: #1e293b;
  font-weight: 700;
  font-size: 0.72rem;
  padding: 0.35rem 0.65rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border-radius: 99px;
  transition: all 0.2s;
}

.btn-receipt-view:hover {
  background: #1d4ed8;
  border-color: #1d4ed8;
  color: white;
}

.method-tag-pill {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  display: inline-block;
}

.method-tag-pill.method-mpesa {
  background: #fee2e2;
  color: #dc2626;
}

.method-tag-pill.method-emola {
  background: #ffedd5;
  color: #ea580c;
}

.method-tag-pill.method-bank {
  background: #eff6ff;
  color: #2563eb;
}

.btn-cancel-withdraw {
  background: #fee2e2;
  color: #b91c1c;
  border: 1px solid #fecaca;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.25rem 0.55rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel-withdraw:hover {
  background: #b91c1c;
  color: white;
}

.withdrawal-status-pending {
  background: #fef3c7;
  color: #b45309;
}

.withdrawal-status-processing {
  background: #dbeafe;
  color: #1e40af;
}

.withdrawal-status-completed {
  background: #dcfce7;
  color: #15803d;
}

.withdrawal-status-rejected {
  background: #fee2e2;
  color: #b91c1c;
}

.withdrawal-status-cancelled {
  background: #f1f5f9;
  color: #64748b;
}
</style>
