<template>
  <div class="pub-page">

    <!-- ── Header ── -->
    <div class="pub-topbar">
      <div>
        <h1 class="pub-title">Publicaciones</h1>
        <p class="pub-subtitle">
          {{ publicaciones.length }} publicaciones
          <span v-if="totalConvs > 0"> · {{ totalConvs }} conversaciones originadas</span>
        </p>
      </div>
      <div class="pub-topbar-actions">
        <button class="pub-btn-secundario" @click="dialogConfig = true" title="Configurar cuentas">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
          Cuentas
        </button>
        <button class="pub-btn-secundario" @click="abrirFormPost">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Nueva
        </button>
        <button class="pub-btn-sincronizar" @click="sincronizarDesdeMeta" :disabled="loading || sincronizando">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" :style="{ animation: (loading || sincronizando) ? 'pub-spin 1s linear infinite' : 'none' }"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>
          {{ sincronizando ? 'Sincronizando...' : 'Sincronizar' }}
        </button>
        <!-- View toggle -->
        <div class="pub-view-toggle">
          <button :class="{ 'pub-view-btn--active': vistaGrid }" @click="vistaGrid = true" title="Vista cuadrícula">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          </button>
          <button :class="{ 'pub-view-btn--active': !vistaGrid }" @click="vistaGrid = false" title="Vista lista">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
          </button>
        </div>
      </div>
    </div>

    <!-- ── Stats ── -->
    <div class="pub-stats-row">
      <div class="pub-stat-card">
        <div class="pub-stat-label">Total publicaciones</div>
        <div class="pub-stat-value">{{ publicaciones.length }}</div>
      </div>
      <div class="pub-stat-card">
        <div class="pub-stat-label">Conversaciones generadas</div>
        <div class="pub-stat-value">{{ totalConvs }}</div>
      </div>
      <div class="pub-stat-card">
        <div class="pub-stat-label">Mayor engagement</div>
        <div class="pub-stat-value pub-stat-value--text">{{ mayorEngagement }}</div>
      </div>
      <div class="pub-stat-card">
        <div class="pub-stat-label">Conversiones hoy</div>
        <div class="pub-stat-value">{{ conversionesHoy }}</div>
      </div>
    </div>

    <!-- ── Filters ── -->
    <div class="pub-filters-row">
      <div class="pub-select-wrap">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
        <select v-model="filtroPlatform" class="pub-select">
          <option value="">Todas las plataformas</option>
          <option value="instagram">Instagram</option>
          <option value="facebook">Facebook</option>
          <option value="tiktok">TikTok</option>
        </select>
      </div>
      <div class="pub-select-wrap">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
        <select v-model="filtroTipo" class="pub-select">
          <option value="">Todos los tipos</option>
          <option value="reel">Reel</option>
          <option value="post">Post</option>
          <option value="video">Video</option>
          <option value="story">Story</option>
          <option value="tiktok">TikTok</option>
        </select>
      </div>
    </div>

    <!-- ── Loading ── -->
    <div v-if="loading" style="display:flex; justify-content:center; padding:60px;">
      <div class="pub-spinner"></div>
    </div>

    <!-- ── Empty ── -->
    <div v-else-if="pubsFiltradas.length === 0" class="pub-empty">
      <div style="font-size:40px; margin-bottom:14px;">📱</div>
      <div style="font-size:15px; font-weight:700; color:#64748b; margin-bottom:6px;">Sin publicaciones</div>
      <div style="font-size:13px; color:#475569; margin-bottom:20px;">Registra publicaciones de tus redes sociales conectadas</div>
      <button class="pub-btn-sincronizar" @click="abrirFormPost">+ Agregar publicación</button>
    </div>

    <!-- ── Grid view ── -->
    <div v-else-if="vistaGrid" class="pub-grid">
      <div v-for="pub in pubsFiltradas" :key="pub.id" class="pub-card" @click="abrirDetalle(pub)">

        <!-- Media preview area -->
        <div class="pub-card-media" :style="{ background: mediaGradient(pub.plataforma) }">
          <!-- Real image when available -->
          <img v-if="pub.imageUrl" :src="pub.imageUrl" class="pub-card-img" :alt="pub.titulo" />
          <!-- Platform badge -->
          <div class="pub-plataforma-badge" :style="{ background: plataformaColor(pub.plataforma)+'dd', color: '#fff' }">
            <span v-html="plataformaIcono(pub.plataforma)" style="display:flex; width:12px; height:12px; flex-shrink:0;"></span>
            <span style="text-transform:capitalize;">{{ pub.plataforma }}</span>
          </div>
          <!-- Tipo badge -->
          <div class="pub-tipo-badge" :style="{ background: tipoBg(pub.tipo), color: tipoColor(pub.tipo) }">
            {{ pub.tipo || 'post' }}
          </div>
          <!-- Media icon (only when no image) -->
          <div v-if="!pub.imageUrl" class="pub-media-icon">
            <span v-html="mediaIcono(pub.tipo)"></span>
          </div>
          <!-- Conv badge -->
          <div v-if="pub.convCount > 0" class="pub-conv-badge">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
            {{ pub.convCount }} conv.
          </div>
        </div>

        <!-- Card body -->
        <div class="pub-card-body">
          <p class="pub-card-caption">{{ pub.titulo }}</p>
          <!-- Metrics -->
          <div class="pub-metrics">
            <span class="pub-metric">
              <span style="color:#ef4444;">❤</span> {{ fmtNum(pub.likes || 0) }}
            </span>
            <span class="pub-metric">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
              {{ fmtNum(pub.comentarios || 0) }}
            </span>
            <span class="pub-metric">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg>
              {{ fmtNum(pub.compartidos || 0) }}
            </span>
          </div>
          <!-- Date + reach -->
          <div class="pub-card-footer">
            <span style="font-size:10px; color:#475569;">{{ pub.fecha ? formatFecha(pub.fecha) : '—' }}</span>
            <span style="font-size:10px; color:#64748b; display:flex; align-items:center; gap:3px;">
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              {{ fmtNum(pub.alcance || 0) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- ── List view ── -->
    <div v-else class="pub-list">
      <div v-for="pub in pubsFiltradas" :key="pub.id" class="pub-list-row" @click="abrirDetalle(pub)">
        <div class="pub-list-media" :style="{ background: mediaGradient(pub.plataforma) }">
          <span v-html="mediaIcono(pub.tipo)" style="opacity:0.7; display:flex;"></span>
        </div>
        <div style="flex:1; min-width:0;">
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
            <span class="pub-plataforma-chip" :style="{ background: plataformaColor(pub.plataforma)+'22', color: plataformaColor(pub.plataforma) }">{{ pub.plataforma }}</span>
            <span class="pub-tipo-chip" :style="{ background: tipoBg(pub.tipo)+'88', color: tipoColor(pub.tipo) }">{{ pub.tipo || 'post' }}</span>
            <span v-if="pub.convCount > 0" style="font-size:10px; color:#64748b; display:flex; align-items:center; gap:3px;">
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
              {{ pub.convCount }} conv.
            </span>
          </div>
          <p style="margin:0 0 5px; font-size:13px; color:#cbd5e1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">{{ pub.titulo }}</p>
          <div class="pub-metrics" style="gap:12px;">
            <span class="pub-metric"><span style="color:#ef4444;">❤</span> {{ fmtNum(pub.likes || 0) }}</span>
            <span class="pub-metric">💬 {{ fmtNum(pub.comentarios || 0) }}</span>
            <span class="pub-metric">↗ {{ fmtNum(pub.compartidos || 0) }}</span>
            <span class="pub-metric" style="margin-left:auto;">👁 {{ fmtNum(pub.alcance || 0) }}</span>
          </div>
        </div>
        <div style="display:flex; flex-direction:column; align-items:flex-end; gap:8px; flex-shrink:0; margin-left:12px;">
          <span style="font-size:11px; color:#475569;">{{ pub.fecha ? formatFecha(pub.fecha) : '—' }}</span>
          <div style="display:flex; gap:6px;">
            <button class="pub-icon-btn" @click.stop="abrirEditPost(pub)" title="Editar">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="pub-icon-btn pub-icon-btn--del" @click.stop="eliminarPost(pub)" title="Eliminar">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Modal: Add/Edit Publication ── -->
    <div v-if="dialogPost" class="pub-modal-overlay" @click.self="dialogPost = false">
      <div class="pub-modal">
        <div class="pub-modal-hd">
          <span>{{ formPost.id ? 'Editar' : 'Agregar' }} publicación</span>
          <button class="pub-modal-close" @click="dialogPost = false">✕</button>
        </div>
        <div class="pub-modal-body">
          <div class="pub-field">
            <label>Plataforma *</label>
            <select v-model="formPost.plataforma" class="pub-input-sel">
              <option value="instagram">Instagram</option>
              <option value="facebook">Facebook</option>
              <option value="tiktok">TikTok</option>
            </select>
          </div>
          <div class="pub-field">
            <label>Tipo de contenido *</label>
            <select v-model="formPost.tipo" class="pub-input-sel">
              <option value="post">Post / Imagen</option>
              <option value="reel">Reel</option>
              <option value="video">Video</option>
              <option value="story">Story</option>
              <option value="tiktok">TikTok</option>
            </select>
          </div>
          <div class="pub-field">
            <label>Descripción / Caption *</label>
            <textarea v-model="formPost.titulo" class="pub-input-txt" placeholder="Texto de la publicación..." rows="3"></textarea>
          </div>
          <div class="pub-field">
            <label>ID de la publicación *</label>
            <input v-model="formPost.postId" class="pub-input" placeholder="Ej: 123456789_987654321" />
            <div class="pub-hint">ID del post en la plataforma (ver guía de configuración)</div>
          </div>
          <div class="pub-field">
            <label>Fecha de publicación</label>
            <input v-model="formPost.fecha" type="date" class="pub-input" />
          </div>
          <div class="pub-field-row">
            <div class="pub-field">
              <label>❤ Likes</label>
              <input v-model.number="formPost.likes" type="number" class="pub-input" placeholder="0" />
            </div>
            <div class="pub-field">
              <label>💬 Comentarios</label>
              <input v-model.number="formPost.comentarios" type="number" class="pub-input" placeholder="0" />
            </div>
            <div class="pub-field">
              <label>↗ Compartidos</label>
              <input v-model.number="formPost.compartidos" type="number" class="pub-input" placeholder="0" />
            </div>
          </div>
          <div class="pub-field">
            <label>👁 Alcance</label>
            <input v-model.number="formPost.alcance" type="number" class="pub-input" placeholder="0" />
          </div>
          <div class="pub-field">
            <label>Agente IA para comentarios</label>
            <select v-model="formPost.agenteId" class="pub-input-sel">
              <option value="">— Sin agente —</option>
              <option v-for="ag in agentes" :key="ag.id" :value="ag.id">{{ ag.nombre }}</option>
            </select>
          </div>
          <div class="pub-field">
            <label>Cuenta vinculada</label>
            <select v-model="formPost.cuentaId" class="pub-input-sel">
              <option value="">— Sin cuenta —</option>
              <option v-for="c in cuentas.filter(x => x.plataforma === formPost.plataforma)" :key="c.id" :value="c.id">{{ c.nombre }}</option>
            </select>
          </div>
          <div class="pub-toggle-row">
            <span>Publicación activa</span>
            <div class="ide-toggle" :class="{ 'ide-toggle--on': formPost.enabled }" @click="formPost.enabled = !formPost.enabled"><div></div></div>
          </div>
        </div>
        <div class="pub-modal-ft">
          <button class="pub-btn-secundario" @click="dialogPost = false">Cancelar</button>
          <button class="pub-btn-primario" @click="guardarPost" :disabled="guardandoPost">
            <span v-if="guardandoPost">Guardando...</span>
            <span v-else>{{ formPost.id ? 'Guardar cambios' : 'Agregar publicación' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- ── Modal: Configurar cuentas ── -->
    <div v-if="dialogConfig" class="pub-modal-overlay" @click.self="dialogConfig = false">
      <div class="pub-modal pub-modal--wide">
        <div class="pub-modal-hd">
          <span>Cuentas conectadas</span>
          <button class="pub-modal-close" @click="dialogConfig = false">✕</button>
        </div>
        <div class="pub-modal-body">
          <!-- Tabs -->
          <div style="display:flex; gap:4px; margin-bottom:18px;">
            <button v-for="tab in ['instagram','facebook']" :key="tab"
              class="pub-cfg-tab" :class="{ 'pub-cfg-tab--active': cfgTab === tab }"
              @click="cfgTab = tab" style="text-transform:capitalize;">
              {{ tab }}
            </button>
            <button class="pub-btn-secundario" style="margin-left:auto; font-size:12px;" @click="abrirFormCuenta(cfgTab)">
              + Agregar cuenta
            </button>
          </div>
          <!-- Accounts list -->
          <div v-for="c in cuentas.filter(x => x.plataforma === cfgTab)" :key="c.id" class="pub-cfg-row">
            <div class="pub-cfg-icon" :style="{ background: plataformaColor(c.plataforma)+'33', color: plataformaColor(c.plataforma) }">
              <span v-html="plataformaIcono(c.plataforma)"></span>
            </div>
            <div style="flex:1; min-width:0;">
              <div style="font-size:13px; font-weight:700; color:#e2e8f0;">{{ c.nombre }}</div>
              <div style="font-size:11px; color:#475569;">ID: {{ c.pageId }}</div>
            </div>
            <div style="display:flex; align-items:center; gap:8px;">
              <span :style="{ fontSize:'10px', fontWeight:700, color: c.enabled ? '#22c55e' : '#ef4444' }">{{ c.enabled ? 'Activo' : 'Inactivo' }}</span>
              <button class="pub-icon-btn" @click="abrirEditCuenta(c)">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
            </div>
          </div>
          <div v-if="cuentas.filter(x => x.plataforma === cfgTab).length === 0" style="text-align:center; padding:32px; color:#475569; font-size:13px;">
            Sin cuentas de {{ cfgTab }} conectadas
          </div>
        </div>
      </div>
    </div>

    <!-- ── Modal: Cuenta config ── -->
    <div v-if="dialogCuenta" class="pub-modal-overlay" @click.self="dialogCuenta = false">
      <div class="pub-modal">
        <div class="pub-modal-hd">
          <span>{{ formCuenta.id ? 'Editar' : 'Agregar' }} cuenta {{ formCuenta.plataforma }}</span>
          <button class="pub-modal-close" @click="dialogCuenta = false">✕</button>
        </div>
        <div class="pub-modal-body">
          <div class="pub-field">
            <label>Nombre de la página / cuenta *</label>
            <input v-model="formCuenta.nombre" class="pub-input" placeholder="Mi tienda oficial" />
          </div>
          <div class="pub-field">
            <label>{{ formCuenta.plataforma === 'instagram' ? 'Instagram Account ID *' : 'Facebook Page ID *' }}</label>
            <input v-model="formCuenta.pageId" class="pub-input" placeholder="123456789012345" />
          </div>
          <div class="pub-field">
            <label>Page Access Token *</label>
            <div style="position:relative;">
              <input v-model="formCuenta.accessToken" :type="showToken ? 'text' : 'password'" class="pub-input" placeholder="EAAMKq…" style="padding-right:36px;" />
              <button class="pub-eye-btn" @click="showToken = !showToken">{{ showToken ? '🙈' : '👁' }}</button>
            </div>
          </div>
          <div class="pub-field">
            <label>Token de verificación del webhook</label>
            <input v-model="formCuenta.verifyToken" class="pub-input" placeholder="ide_ia_meta_token" />
          </div>
          <div class="pub-field">
            <label>Agente IA asignado</label>
            <select v-model="formCuenta.agenteId" class="pub-input-sel">
              <option value="">— Sin agente —</option>
              <option v-for="ag in agentes" :key="ag.id" :value="ag.id">{{ ag.nombre }}</option>
            </select>
          </div>
          <div v-if="testResult" class="pub-test-result" :class="testResult.valida ? 'pub-test-result--ok' : 'pub-test-result--err'">
            {{ testResult.mensaje }}
          </div>
        </div>
        <div class="pub-modal-ft">
          <button class="pub-btn-secundario" @click="testConexionCuenta" :disabled="testando || !formCuenta.accessToken || !formCuenta.pageId">
            {{ testando ? 'Probando...' : 'Probar conexión' }}
          </button>
          <button class="pub-btn-primario" @click="guardarCuenta" :disabled="guardandoCuenta">
            {{ guardandoCuenta ? 'Guardando...' : (formCuenta.id ? 'Guardar' : 'Agregar') }}
          </button>
        </div>
      </div>
    </div>

    <!-- ── Modal: Detalle publicación ── -->
    <div v-if="detallePost" class="pub-modal-overlay" @click.self="detallePost = null">
      <div class="pub-modal pub-modal--wide">
        <div class="pub-modal-hd">
          <div style="display:flex; align-items:center; gap:10px;">
            <span class="pub-plataforma-chip" :style="{ background: plataformaColor(detallePost.plataforma)+'22', color: plataformaColor(detallePost.plataforma) }">{{ detallePost.plataforma }}</span>
            <span class="pub-tipo-chip" :style="{ background: tipoBg(detallePost.tipo)+'88', color: tipoColor(detallePost.tipo) }">{{ detallePost.tipo || 'post' }}</span>
          </div>
          <div style="display:flex; gap:8px;">
            <button class="pub-icon-btn" @click="abrirEditPost(detallePost); detallePost = null">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="pub-modal-close" @click="detallePost = null">✕</button>
          </div>
        </div>
        <div class="pub-modal-body">
          <!-- Preview area -->
          <div class="pub-detalle-media" :style="{ background: mediaGradient(detallePost.plataforma) }">
            <img v-if="detallePost.imageUrl" :src="detallePost.imageUrl" class="pub-detalle-img" :alt="detallePost.titulo" />
            <span v-else v-html="mediaIcono(detallePost.tipo)" style="display:flex;"></span>
          </div>
          <p style="font-size:14px; color:#cbd5e1; line-height:1.6; margin:16px 0;">{{ detallePost.titulo }}</p>
          <!-- Metrics grid -->
          <div class="pub-detalle-metrics">
            <div class="pub-detalle-metric">
              <div style="font-size:22px; font-weight:900; color:#ef4444;">{{ fmtNum(detallePost.likes || 0) }}</div>
              <div style="font-size:10px; color:#64748b;">❤ Likes</div>
            </div>
            <div class="pub-detalle-metric">
              <div style="font-size:22px; font-weight:900; color:#818cf8;">{{ fmtNum(detallePost.comentarios || 0) }}</div>
              <div style="font-size:10px; color:#64748b;">💬 Comentarios</div>
            </div>
            <div class="pub-detalle-metric">
              <div style="font-size:22px; font-weight:900; color:#22c55e;">{{ fmtNum(detallePost.compartidos || 0) }}</div>
              <div style="font-size:10px; color:#64748b;">↗ Compartidos</div>
            </div>
            <div class="pub-detalle-metric">
              <div style="font-size:22px; font-weight:900; color:#f59e0b;">{{ fmtNum(detallePost.alcance || 0) }}</div>
              <div style="font-size:10px; color:#64748b;">👁 Alcance</div>
            </div>
          </div>
          <div style="display:flex; justify-content:space-between; margin-top:14px; font-size:12px; color:#64748b; padding-top:14px; border-top:1px solid #1e3a5f33;">
            <span>Fecha: {{ detallePost.fechaPost ? formatFecha(detallePost.fechaPost) : (detallePost.fecha ? formatFecha(detallePost.fecha) : '—') }}</span>
            <span>Conversaciones: <strong style="color:#818cf8;">{{ detallePost.convCount || 0 }}</strong></span>
          </div>

          <!-- Comentarios del post -->
          <div v-if="detallePost.comentariosData && detallePost.comentariosData.length" style="margin-top:4px;">
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:10px;">
              <div style="font-size:11px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.5px;">
                Comentarios ({{ detallePost.comentariosData.length }})
              </div>
              <button class="pub-btn-secundario" style="font-size:11px; padding:5px 10px;" @click="importarComentarios(detallePost)" :disabled="importando">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                {{ importando ? 'Importando...' : 'Importar a Bandeja' }}
              </button>
            </div>
            <div v-for="cm in detallePost.comentariosData" :key="cm.id" class="pub-comment-row">
              <div class="pub-comment-avatar">{{ (cm.fromName || '?')[0].toUpperCase() }}</div>
              <div style="flex:1; min-width:0;">
                <div style="display:flex; align-items:baseline; gap:8px; margin-bottom:3px;">
                  <span style="font-size:12px; font-weight:700; color:#cbd5e1;">{{ cm.fromName }}</span>
                  <span style="font-size:10px; color:#475569;">{{ formatFechaHora(cm.createdTime) }}</span>
                </div>
                <p style="margin:0; font-size:13px; color:#94a3b8; line-height:1.5;">{{ cm.message }}</p>
              </div>
            </div>
          </div>
          <div v-else-if="detallePost.comentarios > 0" style="font-size:12px; color:#475569; text-align:center; padding:12px 0;">
            Sincroniza de nuevo para cargar los comentarios
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
const FORM_CUENTA_DEFAULT = () => ({
  id: null, plataforma: 'instagram', nombre: '', pageId: '',
  accessToken: '', verifyToken: 'ide_ia_meta_token', agenteId: '', enabled: true,
});
const FORM_POST_DEFAULT = () => ({
  id: null, plataforma: 'instagram', tipo: 'post', titulo: '', postId: '',
  fecha: '', likes: 0, comentarios: 0, compartidos: 0, alcance: 0,
  agenteId: '', cuentaId: '', enabled: true, convCount: 0,
});

export default {
  name: 'RedesSociales',
  data() {
    return {
      publicaciones: [],
      cuentas: [],
      agentes: [],
      loading: false,
      vistaGrid: true,
      filtroPlatform: '',
      filtroTipo: '',
      dialogPost: false,
      dialogConfig: false,
      dialogCuenta: false,
      detallePost: null,
      formPost: FORM_POST_DEFAULT(),
      formCuenta: FORM_CUENTA_DEFAULT(),
      guardandoPost: false,
      guardandoCuenta: false,
      testando: false,
      testResult: null,
      showToken: false,
      cfgTab: 'instagram',
      conversionesHoy: 0,
      sincronizando: false,
      importando: false,
    };
  },
  computed: {
    clienteId() {
      return this.$store.getters.clienteId || this.$storage.get('user')?.clienteId || null;
    },
    pubsFiltradas() {
      let list = this.publicaciones;
      if (this.filtroPlatform) list = list.filter(p => p.plataforma === this.filtroPlatform);
      if (this.filtroTipo) list = list.filter(p => (p.tipo || 'post') === this.filtroTipo);
      return list;
    },
    totalConvs() {
      return this.publicaciones.reduce((sum, p) => sum + (p.convCount || 0), 0);
    },
    mayorEngagement() {
      if (!this.publicaciones.length) return '—';
      const top = this.publicaciones.reduce((best, p) => {
        const score = (p.likes || 0) + (p.comentarios || 0) * 2;
        const bestScore = (best.likes || 0) + (best.comentarios || 0) * 2;
        return score > bestScore ? p : best;
      }, this.publicaciones[0]);
      return top.titulo ? top.titulo.slice(0, 40) + (top.titulo.length > 40 ? '...' : '') : '—';
    },
  },
  async mounted() {
    await this.cargar(true);
  },
  methods: {
    async cargar(mostrarSpinner = false) {
      if (mostrarSpinner) this.loading = true;
      try {
        await Promise.all([this.cargarPosts(), this.cargarCuentas(), this.cargarAgentes()]);
      } finally {
        this.loading = false;
      }
    },

    async cargarPosts() {
      try {
        const data = await this.$service.list('red-social/posts');
        this.publicaciones = data || [];
      } catch { this.publicaciones = []; }
    },

    async cargarCuentas() {
      try {
        const data = await this.$service.list('red-social/cuentas');
        this.cuentas = data || [];
      } catch { this.cuentas = []; }
    },

    async cargarAgentes() {
      try {
        const data = await this.$service.list('agentes');
        this.agentes = data || [];
      } catch { this.agentes = []; }
    },

    // ── Sync from Meta ──
    async sincronizarDesdeMeta() {
      if (this.sincronizando) return;
      this.sincronizando = true;
      try {
        await this.cargarCuentas();
        const cuentasSync = this.cuentas.filter(c => c.plataforma === 'facebook');
        if (!cuentasSync.length) {
          this.$message.error('No hay cuentas de Facebook/Instagram configuradas');
          return;
        }
        let totalNuevos = 0;
        let totalActualizados = 0;
        for (const cuenta of cuentasSync) {
          try {
            const res = await this.$service.post(`red-social/cuentas/${cuenta.id}/sincronizar`, {});
            totalNuevos += res.sincronizados || 0;
            totalActualizados += res.actualizados || 0;
          } catch (_e) { /* cuenta individual puede fallar sin detener las demás */ }
        }
        this.$message.success(`Sincronizado: ${totalNuevos} nuevos, ${totalActualizados} actualizados`);
        await this.cargarPosts();
      } catch (_e) {
        this.$message.error('Error al sincronizar');
      } finally {
        this.sincronizando = false;
      }
    },

    // ── Posts CRUD ──
    abrirFormPost() {
      this.formPost = FORM_POST_DEFAULT();
      this.dialogPost = true;
    },
    abrirEditPost(post) {
      this.formPost = { ...FORM_POST_DEFAULT(), ...post };
      this.dialogPost = true;
    },

    async guardarPost() {
      if (!this.formPost.titulo || !this.formPost.postId) {
        this.$message.error('El caption y el ID de publicación son obligatorios');
        return;
      }
      this.guardandoPost = true;
      try {
        const payload = { ...this.formPost };
        const id = payload.id;
        delete payload.id;
        if (id) {
          await this.$service.put(`red-social/posts/${id}`, payload);
          this.$message.success('Publicación actualizada');
        } else {
          await this.$service.post('red-social/posts', payload);
          this.$message.success('Publicación registrada');
        }
        this.dialogPost = false;
        await this.cargarPosts();
      } catch (e) {
        this.$message.error(e?.mensaje || 'Error al guardar');
      } finally {
        this.guardandoPost = false;
      }
    },

    async eliminarPost(post) {
      this.$confirm(`¿Eliminar la publicación "${post.titulo.slice(0, 40)}..."?`, async () => {
        try {
          await this.$service.delete(`red-social/posts/${post.id}`);
          this.$message.success('Publicación eliminada');
          await this.cargarPosts();
        } catch (e) {
          this.$message.error(e?.mensaje || 'Error al eliminar');
        }
      });
    },

    abrirDetalle(pub) { this.detallePost = pub; },

    async importarComentarios(post) {
      if (this.importando) return;
      this.importando = true;
      try {
        const res = await this.$service.post(`red-social/posts/${post.id}/importar-comentarios`, {});
        this.$message.success(`${res.importados} comentarios importados a Bandeja`);
      } catch (_e) {
        this.$message.error('Error al importar comentarios');
      } finally {
        this.importando = false;
      }
    },

    // ── Cuentas CRUD ──
    abrirFormCuenta(plataforma) {
      this.formCuenta = { ...FORM_CUENTA_DEFAULT(), plataforma };
      this.testResult = null;
      this.showToken = false;
      this.dialogCuenta = true;
    },
    abrirEditCuenta(cuenta) {
      this.formCuenta = { ...cuenta, accessToken: '' };
      this.testResult = null;
      this.showToken = false;
      this.dialogCuenta = true;
    },
    async testConexionCuenta() {
      this.testando = true;
      this.testResult = null;
      try {
        this.testResult = await this.$service.post('red-social/test-conexion', {
          accessToken: this.formCuenta.accessToken,
          pageId: this.formCuenta.pageId,
          plataforma: this.formCuenta.plataforma,
        });
      } catch (e) {
        this.testResult = { valida: false, mensaje: e?.mensaje || 'Error al conectar' };
      } finally { this.testando = false; }
    },
    async guardarCuenta() {
      if (!this.formCuenta.nombre || !this.formCuenta.pageId) {
        this.$message.error('El nombre y el Page ID son obligatorios');
        return;
      }
      this.guardandoCuenta = true;
      try {
        const payload = { ...this.formCuenta };
        const id = payload.id; delete payload.id;
        if (id) {
          await this.$service.put(`red-social/cuentas/${id}`, payload);
          this.$message.success('Cuenta actualizada');
        } else {
          await this.$service.post('red-social/cuentas', payload);
          this.$message.success('Cuenta agregada');
        }
        this.dialogCuenta = false;
        await this.cargarCuentas();
      } catch (e) {
        this.$message.error(e?.mensaje || 'Error al guardar');
      } finally { this.guardandoCuenta = false; }
    },

    // ── Visual helpers ──
    plataformaColor(p) {
      const m = { instagram: '#E1306C', facebook: '#1877F2', tiktok: '#69C9D0' };
      return m[p] || '#64748b';
    },
    plataformaIcono(p) {
      if (p === 'instagram') return `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" stroke-linecap="round" stroke-width="3"/></svg>`;
      if (p === 'facebook') return `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>`;
      if (p === 'tiktok') return `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 12a4 4 0 104 4V4a5 5 0 005 5"/></svg>`;
      return `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/></svg>`;
    },
    tipoBg(tipo) {
      const m = { reel: '#E1306C', post: '#6366f1', video: '#8b5cf6', story: '#f97316', tiktok: '#1e293b' };
      return m[tipo] || '#6366f1';
    },
    tipoColor(tipo) {
      return tipo === 'tiktok' ? '#69C9D0' : '#fff';
    },
    mediaGradient(p) {
      const m = {
        instagram: 'linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%)',
        facebook: 'linear-gradient(135deg, #1877F2 0%, #4267B2 100%)',
        tiktok: 'linear-gradient(135deg, #010101 0%, #1a1a2e 100%)',
      };
      return m[p] || 'linear-gradient(135deg, #1e293b, #0f172a)';
    },
    mediaIcono(tipo) {
      if (tipo === 'reel' || tipo === 'video') return `<svg width="36" height="36" viewBox="0 0 24 24" fill="rgba(255,255,255,0.5)" stroke="rgba(255,255,255,0.3)" stroke-width="1"><polygon points="5 3 19 12 5 21 5 3"/></svg>`;
      if (tipo === 'post') return `<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="1"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`;
      if (tipo === 'tiktok') return `<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(105,201,208,0.5)" stroke-width="1.5"><path d="M9 12a4 4 0 104 4V4a5 5 0 005 5"/></svg>`;
      if (tipo === 'story') return `<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="1.5"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4" fill="rgba(255,255,255,0.15)"/></svg>`;
      return `<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="1"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>`;
    },
    fmtNum(n) {
      if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
      if (n >= 1000) return (n / 1000).toFixed(1).replace('.0', '') + 'K';
      return String(n);
    },
    formatFecha(d) {
      if (!d) return '';
      return new Date(d).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: '2-digit' });
    },
    formatFechaHora(d) {
      if (!d) return '';
      return new Date(d).toLocaleString('es-MX', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });
    },
  },
};
</script>

<style scoped>
/* ── Page layout ── */
.pub-page {
  padding: 24px 28px;
  overflow-y: auto;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ── Top bar ── */
.pub-topbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}
.pub-title { font-size: 22px; font-weight: 800; color: #f1f5f9; margin: 0 0 4px; }
.pub-subtitle { font-size: 12px; color: #64748b; margin: 0; }
.pub-topbar-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }

/* ── Buttons ── */
.pub-btn-sincronizar {
  display: flex; align-items: center; gap: 6px; padding: 7px 14px; border-radius: 8px;
  background: #6366f1; border: none; color: #fff; font-size: 13px; font-weight: 600;
  cursor: pointer; font-family: inherit; transition: background 0.15s;
}
.pub-btn-sincronizar:hover:not(:disabled) { background: #4f46e5; }
.pub-btn-sincronizar:disabled { opacity: 0.5; cursor: not-allowed; }

.pub-btn-secundario {
  display: flex; align-items: center; gap: 6px; padding: 7px 12px; border-radius: 8px;
  background: #1e293b; border: 1px solid #334155; color: #94a3b8; font-size: 12px;
  font-weight: 600; cursor: pointer; font-family: inherit; transition: all 0.15s;
}
.pub-btn-secundario:hover { border-color: #6366f1; color: #818cf8; }

.pub-btn-primario {
  display: flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 8px;
  background: #6366f1; border: none; color: #fff; font-size: 13px; font-weight: 600;
  cursor: pointer; font-family: inherit; transition: background 0.15s;
}
.pub-btn-primario:hover:not(:disabled) { background: #4f46e5; }
.pub-btn-primario:disabled { opacity: 0.5; cursor: not-allowed; }

/* ── View toggle ── */
.pub-view-toggle {
  display: flex; border-radius: 8px; overflow: hidden;
  border: 1px solid #334155; background: #1e293b;
}
.pub-view-toggle button {
  background: none; border: none; cursor: pointer; color: #64748b;
  padding: 6px 10px; display: flex; align-items: center; transition: all 0.15s;
}
.pub-view-btn--active { background: #6366f122 !important; color: #818cf8 !important; }

/* ── Stats ── */
.pub-stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.pub-stat-card {
  background: #1e293b; border: 1px solid #1e3a5f44; border-radius: 12px;
  padding: 16px 18px;
}
.pub-stat-label { font-size: 11px; color: #64748b; font-weight: 600; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
.pub-stat-value { font-size: 28px; font-weight: 900; color: #f1f5f9; }
.pub-stat-value--text { font-size: 13px; font-weight: 600; color: #94a3b8; line-height: 1.4; }

/* ── Filters ── */
.pub-filters-row { display: flex; gap: 10px; }
.pub-select-wrap {
  position: relative; display: flex; align-items: center;
}
.pub-select-wrap svg { position: absolute; right: 10px; pointer-events: none; color: #64748b; }
.pub-select {
  background: #1e293b; border: 1px solid #334155; border-radius: 8px;
  color: #94a3b8; font-size: 13px; font-weight: 500; padding: 8px 32px 8px 14px;
  outline: none; font-family: inherit; cursor: pointer; appearance: none; min-width: 180px;
  transition: border-color 0.15s;
}
.pub-select:focus { border-color: #6366f1; }

/* ── Grid ── */
.pub-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
  align-content: start;
}

/* ── Card ── */
.pub-card {
  background: #1e293b; border: 1px solid #1e3a5f44; border-radius: 12px;
  overflow: hidden; cursor: pointer; transition: all 0.2s;
}
.pub-card:hover { border-color: #6366f155; transform: translateY(-2px); box-shadow: 0 8px 24px #0009; }

.pub-card-media {
  height: 150px; position: relative; display: flex; align-items: center;
  justify-content: center; overflow: hidden;
}
.pub-card-img {
  position: absolute; inset: 0; width: 100%; height: 100%;
  object-fit: cover; border-radius: 0;
}

.pub-plataforma-badge {
  position: absolute; top: 10px; left: 10px;
  display: flex; align-items: center; gap: 5px;
  padding: 3px 8px; border-radius: 6px;
  font-size: 10px; font-weight: 700;
}
.pub-tipo-badge {
  position: absolute; top: 10px; right: 10px;
  padding: 2px 8px; border-radius: 5px;
  font-size: 10px; font-weight: 700;
}
.pub-media-icon { opacity: 0.8; }
.pub-conv-badge {
  position: absolute; bottom: 10px; right: 10px;
  display: flex; align-items: center; gap: 4px;
  background: #6366f1dd; color: #fff;
  padding: 3px 8px; border-radius: 6px; font-size: 10px; font-weight: 700;
}

.pub-card-body { padding: 12px 14px; }
.pub-card-caption {
  margin: 0 0 10px; font-size: 12px; color: #cbd5e1; line-height: 1.4;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
  overflow: hidden;
}
.pub-metrics {
  display: flex; align-items: center; gap: 10px; margin-bottom: 8px;
}
.pub-metric {
  display: flex; align-items: center; gap: 3px; font-size: 11px; color: #64748b; font-weight: 600;
}
.pub-card-footer {
  display: flex; justify-content: space-between; align-items: center;
  padding-top: 8px; border-top: 1px solid #1e3a5f33;
}

/* ── List view ── */
.pub-list { display: flex; flex-direction: column; gap: 8px; }
.pub-list-row {
  display: flex; align-items: center; gap: 14px; padding: 12px 14px;
  background: #1e293b; border: 1px solid #1e3a5f33; border-radius: 10px;
  cursor: pointer; transition: border-color 0.15s;
}
.pub-list-row:hover { border-color: #6366f144; }
.pub-list-media {
  width: 52px; height: 52px; border-radius: 8px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}

/* ── Chips ── */
.pub-plataforma-chip { font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 5px; text-transform: capitalize; }
.pub-tipo-chip { font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 5px; }

/* ── Modal ── */
.pub-modal-overlay {
  position: fixed; inset: 0; background: #00000088; z-index: 1000;
  display: flex; align-items: center; justify-content: center; padding: 20px;
}
.pub-modal {
  background: #0d1526; border: 1px solid #1e3a5f55; border-radius: 14px;
  width: 100%; max-width: 480px; max-height: 90vh; overflow: hidden;
  display: flex; flex-direction: column;
}
.pub-modal--wide { max-width: 620px; }
.pub-modal-hd {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 20px; border-bottom: 1px solid #1e3a5f44;
  font-size: 14px; font-weight: 700; color: #e2e8f0; flex-shrink: 0;
}
.pub-modal-close {
  background: none; border: none; cursor: pointer; color: #475569;
  font-size: 16px; padding: 4px 8px; border-radius: 6px; transition: color 0.15s;
}
.pub-modal-close:hover { color: #94a3b8; }
.pub-modal-body { padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 14px; flex: 1; }
.pub-modal-ft {
  display: flex; justify-content: flex-end; gap: 8px;
  padding: 14px 20px; border-top: 1px solid #1e3a5f44; flex-shrink: 0;
}

/* ── Form elements ── */
.pub-field { display: flex; flex-direction: column; gap: 5px; }
.pub-field label { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
.pub-field-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.pub-input, .pub-input-sel, .pub-input-txt {
  background: #1e293b; border: 1px solid #334155; border-radius: 8px;
  color: #e2e8f0; font-size: 13px; padding: 9px 12px; outline: none;
  font-family: inherit; transition: border-color 0.15s; width: 100%; box-sizing: border-box;
}
.pub-input:focus, .pub-input-sel:focus, .pub-input-txt:focus { border-color: #6366f1; }
.pub-input-sel { appearance: none; cursor: pointer; }
.pub-input-txt { resize: vertical; }
.pub-hint { font-size: 10px; color: #475569; }
.pub-toggle-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 12px; background: #0f172a; border-radius: 8px; border: 1px solid #1e3a5f33;
  font-size: 13px; color: #cbd5e1;
}
.pub-eye-btn {
  position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
  background: none; border: none; cursor: pointer; font-size: 14px; padding: 4px;
}
.pub-test-result { padding: 10px 14px; border-radius: 8px; font-size: 12px; font-weight: 600; line-height: 1.5; }
.pub-test-result--ok { background: #22c55e18; border: 1px solid #22c55e33; color: #22c55e; }
.pub-test-result--err { background: #ef444418; border: 1px solid #ef444433; color: #ef4444; }

/* ── Config tab ── */
.pub-cfg-tab {
  background: none; border: none; border-bottom: 2px solid transparent;
  color: #64748b; font-size: 12px; font-weight: 600; padding: 6px 12px;
  cursor: pointer; font-family: inherit; transition: all 0.15s;
}
.pub-cfg-tab--active { color: #818cf8; border-bottom-color: #6366f1; }
.pub-cfg-row {
  display: flex; align-items: center; gap: 12px; padding: 12px;
  background: #1e293b; border-radius: 10px; border: 1px solid #1e3a5f33; margin-bottom: 8px;
}
.pub-cfg-icon {
  width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center;
  justify-content: center; flex-shrink: 0;
}

/* ── Detail modal ── */
.pub-detalle-media {
  height: 220px; border-radius: 10px; display: flex; align-items: center;
  justify-content: center; margin-bottom: 0; overflow: hidden; position: relative;
}
.pub-detalle-img {
  position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;
}
.pub-detalle-metrics {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-top: 14px;
}
.pub-detalle-metric {
  text-align: center; padding: 12px 8px; background: #0f172a;
  border-radius: 8px; border: 1px solid #1e3a5f33;
}

/* ── Comments ── */
.pub-comment-row {
  display: flex; gap: 10px; padding: 10px 12px;
  background: #0f172a; border-radius: 8px; border: 1px solid #1e3a5f33;
  margin-bottom: 6px;
}
.pub-comment-avatar {
  width: 30px; height: 30px; border-radius: 50%; background: #6366f133;
  color: #818cf8; font-size: 12px; font-weight: 800; display: flex;
  align-items: center; justify-content: center; flex-shrink: 0;
}

/* ── Icons ── */
.pub-icon-btn {
  background: none; border: none; cursor: pointer; color: #475569;
  padding: 5px; border-radius: 6px; display: flex; align-items: center;
  transition: all 0.15s;
}
.pub-icon-btn:hover { background: #6366f122; color: #818cf8; }
.pub-icon-btn--del:hover { background: #ef444422 !important; color: #ef4444 !important; }

/* ── Empty ── */
.pub-empty { text-align: center; padding: 60px 20px; color: #64748b; }

/* ── Spinner ── */
.pub-spinner {
  width: 32px; height: 32px; border-radius: 50%;
  border: 3px solid #6366f1; border-top-color: transparent;
  animation: pub-spin 0.75s linear infinite;
}
@keyframes pub-spin { to { transform: rotate(360deg); } }
</style>
