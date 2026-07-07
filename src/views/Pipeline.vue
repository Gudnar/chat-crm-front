<template>
  <div class="pl-page">

    <!-- ── Header ── -->
    <div class="pl-header">
      <div>
        <h1 class="pl-title">Pipeline de Ventas</h1>
        <p class="pl-subtitle">{{ totalContactos }} contactos · Arrastra para mover entre etapas</p>
      </div>
      <div class="pl-header-actions">
        <button class="pl-btn-sec" @click="showFiltros = !showFiltros">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
          Filtrar
        </button>
        <button class="pl-btn-pri" @click="abrirNuevoLead">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Nuevo Lead
        </button>
      </div>
    </div>

    <!-- ── Filtros rápidos ── -->
    <div v-if="showFiltros" class="pl-filtros-panel">
      <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
        <span style="font-size:11px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.5px;">Canal:</span>
        <button v-for="c in canalesFiltro" :key="c.id" class="pl-chip-filter"
          :class="{ 'pl-chip-filter--active': filtroCan === c.id }"
          @click="filtroCan = filtroCan === c.id ? '' : c.id">{{ c.label }}</button>
        <span style="font-size:11px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.5px; margin-left:10px;">Score:</span>
        <button class="pl-chip-filter" :class="{ 'pl-chip-filter--active': filtroScore === 'hot' }" @click="filtroScore = filtroScore === 'hot' ? '' : 'hot'" style="color:#ef4444; border-color:#ef444433;">🔥 Hot</button>
        <button class="pl-chip-filter" :class="{ 'pl-chip-filter--active': filtroScore === 'warm' }" @click="filtroScore = filtroScore === 'warm' ? '' : 'warm'" style="color:#f59e0b; border-color:#f59e0b33;">🌡 Warm</button>
        <button class="pl-chip-filter" :class="{ 'pl-chip-filter--active': filtroScore === 'cold' }" @click="filtroScore = filtroScore === 'cold' ? '' : 'cold'" style="color:#3b82f6; border-color:#3b82f633;">❄ Cold</button>
        <button class="pl-chip-filter" style="margin-left:auto; color:#475569;" @click="filtroCan=''; filtroScore=''">Limpiar</button>
      </div>
    </div>

    <!-- ── Stage tabs ── -->
    <div class="pl-tabs-row">
      <button v-for="etapa in etapas" :key="etapa.id"
        class="pl-stage-tab"
        :style="{ borderColor: etapa.color+'55', color: etapa.color }"
        :class="{ 'pl-stage-tab--active': tabActivo === etapa.id }"
        @click="tabActivo = tabActivo === etapa.id ? null : etapa.id">
        {{ etapa.label }} ({{ convsXEtapa(etapa.id).length }})
      </button>
    </div>

    <!-- ── Loading ── -->
    <div v-if="loading" style="display:flex; justify-content:center; padding:60px;">
      <div class="pl-spinner"></div>
    </div>

    <!-- ── Kanban board ── -->
    <div v-else class="pl-board" ref="board">
      <div
        v-for="etapa in etapas"
        v-show="!tabActivo || tabActivo === etapa.id"
        :key="etapa.id"
        class="pl-col"
        :class="{ 'pl-col--dragover': dragOver === etapa.id }"
        @dragover.prevent="dragOver = etapa.id"
        @dragleave="dragOver = null"
        @drop.prevent="onDrop(etapa.id)"
      >
        <!-- Column header -->
        <div class="pl-col-hd">
          <div style="display:flex; align-items:center; gap:8px;">
            <span class="pl-col-dot" :style="{ background: etapa.color }"></span>
            <span class="pl-col-name">{{ etapa.label }}</span>
          </div>
          <span class="pl-col-count" :style="{ background: etapa.color+'22', color: etapa.color }">
            {{ convsXEtapa(etapa.id).length }}
          </span>
        </div>

        <!-- Cards list -->
        <div class="pl-cards-list" :class="{ 'pl-cards-list--empty': convsXEtapa(etapa.id).length === 0 }">
          <!-- Empty placeholder -->
          <div v-if="convsXEtapa(etapa.id).length === 0" class="pl-drop-placeholder">
            Arrastra aquí
          </div>

          <!-- Contact cards -->
          <div
            v-for="conv in convsXEtapa(etapa.id)"
            :key="conv.id"
            class="pl-card"
            draggable="true"
            :class="{ 'pl-card--dragging': dragCard && dragCard.id === conv.id }"
            @dragstart="onDragStart(conv, etapa.id)"
            @dragend="onDragEnd"
            @click="abrirDetalle(conv)"
          >
            <!-- Name + Score -->
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;">
              <div style="display:flex; align-items:center; gap:8px; min-width:0;">
                <div class="pl-avatar" :style="{ background: canalColor(conv.canal)+'44', color: canalColor(conv.canal) }">
                  {{ iniciales(conv.contacto) }}
                </div>
                <div style="min-width:0;">
                  <div class="pl-card-name">{{ obtenerNombreContacto(conv) }}</div>
                  <div class="pl-card-canal">
                    <span v-html="canalIcono(conv.canal)" style="display:flex; width:10px; height:10px; flex-shrink:0;"></span>
                    <span style="text-transform:capitalize;">{{ conv.canal }}</span>
                  </div>
                </div>
              </div>
              <span class="pl-score" :style="{ color: scoreColor(conv.score) }">{{ conv.score }}</span>
            </div>

            <!-- Tags -->
            <div style="display:flex; flex-wrap:wrap; gap:4px; margin-bottom:10px;">
              <span v-for="tag in etiquetas(conv)" :key="tag.label" class="pl-tag" :style="{ background: tag.color+'18', color: tag.color, border: '1px solid '+tag.color+'33' }">
                {{ tag.label }}
              </span>
            </div>

            <!-- Agent + date -->
            <div class="pl-card-footer">
              <div style="display:flex; align-items:center; gap:5px;">
                <div class="pl-agent-avatar" :style="conv.agente ? { background:'#6366f122', color:'#818cf8' } : { background:'#1e293b', color:'#475569' }">
                  {{ conv.agente ? conv.agente.slice(0,2).toUpperCase() : '—' }}
                </div>
                <span class="pl-agent-name">{{ conv.agente || 'Sin' }}</span>
              </div>
              <span class="pl-card-date">{{ formatTime(conv.fechaCreacion) }}</span>
            </div>

            <!-- Acciones -->
            <div style="display:flex; gap:6px; margin-top:10px; padding-top:10px; border-top:1px solid #1e3a5f;">
              <button @click.stop="abrirSoporte(conv)" style="flex:1; background:#f59e0b33; color:#f59e0b; border:1px solid #f59e0b44; border-radius:6px; padding:6px; font-size:11px; font-weight:600; cursor:pointer; font-family:inherit; transition:all 0.15s;">
                📋 Soporte
              </button>
            </div>
          </div>
        </div>

        <!-- Add button -->
        <button class="pl-add-btn" @click="abrirNuevoLeadEtapa(etapa.id)">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Agregar
        </button>
      </div>
    </div>

    <!-- ── Modal: Nuevo Lead ── -->
    <div v-if="dialogNuevo" class="pl-overlay" @click.self="dialogNuevo = false">
      <div class="pl-modal">
        <div class="pl-modal-hd">
          <span>Nuevo Lead</span>
          <button class="pl-modal-close" @click="dialogNuevo = false">✕</button>
        </div>
        <div class="pl-modal-body">
          <div class="pl-field">
            <label>Nombre o número de contacto *</label>
            <input v-model="formNuevo.contacto" class="pl-input" placeholder="Ej: Juan García o +52 55 1234 5678" @keydown.enter="crearLead" />
          </div>
          <div class="pl-field">
            <label>Canal *</label>
            <select v-model="formNuevo.canal" class="pl-input-sel">
              <option value="whatsapp">WhatsApp</option>
              <option value="instagram">Instagram</option>
              <option value="facebook">Facebook</option>
              <option value="tiktok">TikTok</option>
              <option value="chat">Chat Web</option>
            </select>
          </div>
          <div class="pl-field">
            <label>Etapa inicial</label>
            <select v-model="formNuevo.etapa" class="pl-input-sel">
              <option v-for="e in etapas" :key="e.id" :value="e.id">{{ e.label }}</option>
            </select>
          </div>
          <div class="pl-field">
            <label>Agente IA asignado</label>
            <select v-model="formNuevo.agenteId" class="pl-input-sel">
              <option value="">— Sin agente —</option>
              <option v-for="ag in agentes" :key="ag.id" :value="ag.id">{{ ag.nombre }}</option>
            </select>
          </div>
        </div>
        <div class="pl-modal-ft">
          <button class="pl-btn-sec" @click="dialogNuevo = false">Cancelar</button>
          <button class="pl-btn-pri" @click="crearLead" :disabled="!formNuevo.contacto || creando">
            {{ creando ? 'Creando...' : 'Crear Lead' }}
          </button>
        </div>
      </div>
    </div>

    <!-- ── Modal: Detalle conversación ── -->
    <div v-if="detalleConv" class="pl-overlay" @click.self="detalleConv = null">
      <div class="pl-modal">
        <div class="pl-modal-hd">
          <div style="display:flex; align-items:center; gap:10px;">
            <div class="pl-avatar" :style="{ background: canalColor(detalleConv.canal)+'44', color: canalColor(detalleConv.canal), width:'32px', height:'32px', fontSize:'11px' }">
              {{ iniciales(detalleConv.contacto) }}
            </div>
            <div>
              <div style="font-size:14px; font-weight:700; color:#f1f5f9;">{{ formatNombre(detalleConv.contacto) }}</div>
              <div style="font-size:11px; color:#64748b; text-transform:capitalize;">{{ detalleConv.canal }}</div>
            </div>
          </div>
          <button class="pl-modal-close" @click="detalleConv = null">✕</button>
        </div>
        <div class="pl-modal-body">
          <!-- Score bar -->
          <div style="margin-bottom:14px;">
            <div style="display:flex; justify-content:space-between; margin-bottom:6px; font-size:11px; color:#64748b;">
              <span>Lead Score</span>
              <span style="font-weight:700;" :style="{ color: scoreColor(detalleConv.score) }">{{ detalleConv.score }}/100</span>
            </div>
            <div style="height:6px; border-radius:3px; background:#1e293b; overflow:hidden;">
              <div :style="{ width: detalleConv.score+'%', height:'100%', background: scoreColor(detalleConv.score), borderRadius:'3px', transition:'width 0.4s' }"></div>
            </div>
          </div>
          <!-- Etapa selector -->
          <div class="pl-field">
            <label>Etapa del pipeline</label>
            <div style="display:flex; flex-wrap:wrap; gap:6px;">
              <button v-for="e in etapas" :key="e.id"
                class="pl-etapa-chip"
                :style="detalleConv.estadoConversacion === e.id
                  ? { background: e.color+'22', color: e.color, border: '1px solid '+e.color+'55' }
                  : { background: 'transparent', color: '#64748b', border: '1px solid #1e3a5f44' }"
                @click="moverAEtapa(detalleConv, e.id); detalleConv = { ...detalleConv, estadoConversacion: e.id }">
                {{ e.label }}
              </button>
            </div>
          </div>
          <!-- Info -->
          <div style="display:flex; flex-direction:column; gap:8px; margin-top:8px; font-size:12px; color:#94a3b8;">
            <div style="display:flex; gap:8px; align-items:center;">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
              {{ detalleConv.totalMensajes || 0 }} mensajes
            </div>
            <div style="display:flex; gap:8px; align-items:center;">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              {{ formatDate(detalleConv.fechaCreacion) }}
            </div>
            <div v-if="detalleConv.resolucion" style="display:flex; gap:8px; align-items:flex-start;">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" style="margin-top:2px;flex-shrink:0;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {{ detalleConv.resolucion }}
            </div>
          </div>
        </div>
        <div class="pl-modal-ft">
          <button class="pl-btn-sec" @click="detalleConv = null">Cerrar</button>
          <button class="pl-btn-pri" @click="irAConversacion(detalleConv)">Ver conversación →</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
const ETAPAS = [
  { id: 'nuevo_lead',   label: 'Nuevo Lead',  color: '#818cf8' },
  { id: 'contactado',   label: 'Contactado',  color: '#60a5fa' },
  { id: 'calificado',   label: 'Calificado',  color: '#60a5fa' },
  { id: 'propuesta',    label: 'Propuesta',   color: '#f59e0b' },
  { id: 'negociacion',  label: 'Negociación', color: '#f97316' },
  { id: 'ganado',       label: 'Ganado',      color: '#22c55e' },
  { id: 'perdido',      label: 'Perdido',     color: '#ef4444' },
];

const ESTADO_TO_ETAPA = {
  abierto:    'nuevo_lead',
  pendiente:  'contactado',
  resuelto:   'ganado',
  cerrado:    'perdido',
};

export default {
  name: 'Pipeline',
  data() {
    return {
      conversaciones: [],
      agentes: [],
      loading: true,
      etapas: ETAPAS,
      tabActivo: null,
      showFiltros: false,
      filtroCan: '',
      filtroScore: '',
      dragCard: null,
      dragSource: null,
      dragOver: null,
      detalleConv: null,
      dialogNuevo: false,
      creando: false,
      formNuevo: { contacto: '', canal: 'whatsapp', etapa: 'nuevo_lead', agenteId: '' },
      canalesFiltro: [
        { id: 'whatsapp',  label: 'WhatsApp'  },
        { id: 'instagram', label: 'Instagram' },
        { id: 'facebook',  label: 'Facebook'  },
        { id: 'tiktok',    label: 'TikTok'    },
      ],
    };
  },
  computed: {
    convsFiltradas() {
      let list = this.conversaciones;
      if (this.filtroCan) list = list.filter(c => c.canal === this.filtroCan);
      if (this.filtroScore === 'hot')  list = list.filter(c => c.score >= 70);
      if (this.filtroScore === 'warm') list = list.filter(c => c.score >= 40 && c.score < 70);
      if (this.filtroScore === 'cold') list = list.filter(c => c.score < 40);
      return list;
    },
    totalContactos() { return this.convsFiltradas.length; },
  },
  async mounted() {
    await Promise.all([this.cargar(), this.cargarAgentes()]);
  },
  methods: {
    async cargar() {
      this.loading = true;
      try {
        const data = await this.$service.list('conversaciones');
        this.conversaciones = (data || []).map(c => ({
          ...c,
          estadoConversacion: this.normalizeEtapa(c.estadoConversacion),
        }));
      } catch { this.conversaciones = []; } finally {
        this.loading = false;
      }
    },
    async cargarAgentes() {
      try {
        const data = await this.$service.list('agentes');
        this.agentes = data || [];
      } catch { this.agentes = []; }
    },

    normalizeEtapa(estado) {
      if (ETAPAS.find(e => e.id === estado)) return estado;
      return ESTADO_TO_ETAPA[estado] || 'nuevo_lead';
    },

    convsXEtapa(etapaId) {
      return this.convsFiltradas.filter(c => c.estadoConversacion === etapaId);
    },

    // ── Drag & Drop ──
    onDragStart(conv, etapaId) {
      this.dragCard = conv;
      this.dragSource = etapaId;
    },
    onDragEnd() {
      this.dragCard = null;
      this.dragSource = null;
      this.dragOver = null;
    },
    onDrop(etapaId) {
      this.dragOver = null;
      if (this.dragCard && this.dragSource !== etapaId) {
        this.moverAEtapa(this.dragCard, etapaId);
      }
    },

    async moverAEtapa(conv, etapaId) {
      const anterior = conv.estadoConversacion;
      conv.estadoConversacion = etapaId;
      try {
        await this.$service.patch(`conversaciones/${conv.id}/estado`, { estadoConversacion: etapaId });
      } catch {
        conv.estadoConversacion = anterior;
        this.$message && this.$message.error('Error al mover el lead');
      }
    },

    // ── Forms ──
    abrirNuevoLead() {
      this.formNuevo = { contacto: '', canal: 'whatsapp', etapa: 'nuevo_lead', agenteId: '' };
      this.dialogNuevo = true;
    },
    abrirNuevoLeadEtapa(etapaId) {
      this.formNuevo = { contacto: '', canal: 'whatsapp', etapa: etapaId, agenteId: '' };
      this.dialogNuevo = true;
    },

    async crearLead() {
      if (!this.formNuevo.contacto || this.creando) return;
      this.creando = true;
      try {
        const agenteId = this.formNuevo.agenteId;
        const agente = this.agentes.find(a => String(a.id) === String(agenteId));
        const payload = {
          contacto: this.formNuevo.contacto,
          canal: this.formNuevo.canal,
          estadoConversacion: this.formNuevo.etapa,
          agenteId: agenteId || (agente ? agente.id : (this.agentes[0]?.id || null)),
        };
        await this.$service.post('conversaciones', payload);
        this.$message && this.$message.success('Lead creado');
        this.dialogNuevo = false;
        await this.cargar();
      } catch (e) {
        this.$message && this.$message.error(e?.mensaje || 'Error al crear lead');
      } finally {
        this.creando = false;
      }
    },

    abrirDetalle(conv) { this.detalleConv = { ...conv }; },
    irAConversacion() {
      this.detalleConv = null;
      this.$router.push({ name: 'conversaciones' });
    },

    // ── UI helpers ──
    iniciales(nombre) {
      if (!nombre) return '??';
      const partes = nombre.trim().split(/\s+/);
      if (partes.length >= 2) return (partes[0][0] + partes[1][0]).toUpperCase();
      return nombre.slice(0, 2).toUpperCase();
    },
    formatNombre(nombre) {
      if (!nombre) return 'Sin nombre';
      if (/^\+?[\d\s\-()]{7,}$/.test(nombre.trim())) {
        return nombre.slice(0, 16) + (nombre.length > 16 ? '...' : '');
      }
      return nombre.length > 22 ? nombre.slice(0, 22) + '…' : nombre;
    },
    etiquetas(conv) {
      const tags = [];
      if (conv.score >= 70)  tags.push({ label: 'Hot',  color: '#ef4444' });
      else if (conv.score >= 40) tags.push({ label: 'Warm', color: '#f59e0b' });
      else tags.push({ label: 'Cold', color: '#3b82f6' });
      if (conv.score >= 65) tags.push({ label: 'Venta', color: '#f97316' });
      if (conv.escalado) tags.push({ label: 'Reclamo', color: '#ef4444' });
      if (conv.estadoConversacion === 'pendiente') tags.push({ label: 'Info', color: '#8b5cf6' });
      return tags;
    },
    scoreColor(s) { return s >= 70 ? '#22c55e' : s >= 40 ? '#f59e0b' : '#ef4444'; },
    canalColor(c) {
      const m = { whatsapp: '#25D366', instagram: '#E1306C', facebook: '#1877F2', tiktok: '#69C9D0', chat: '#818cf8' };
      return m[c] || '#64748b';
    },
    canalIcono(c) {
      if (c === 'whatsapp') return `<svg width="10" height="10" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>`;
      if (c === 'instagram') return `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#E1306C" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/></svg>`;
      if (c === 'facebook') return `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#1877F2" stroke-width="2.5"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>`;
      if (c === 'tiktok') return `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#69C9D0" stroke-width="2"><path d="M9 12a4 4 0 104 4V4a5 5 0 005 5"/></svg>`;
      return `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#818cf8" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>`;
    },
    formatTime(d) {
      if (!d) return '';
      const date = new Date(d);
      const now = new Date();
      if (date.toDateString() === now.toDateString()) return 'Hoy';
      const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1);
      if (date.toDateString() === yesterday.toDateString()) return 'Ayer';
      return date.toLocaleDateString('es-MX', { weekday: 'short' });
    },
    formatDate(d) {
      if (!d) return '';
      return new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    },

    obtenerNombreContacto(conv) {
      if (conv.canal === 'whatsapp' && conv.notas && conv.notas.startsWith('Nombre:')) {
        const nombre = conv.notas.replace('Nombre:', '').trim();
        return nombre.length > 22 ? nombre.slice(0, 22) + '…' : nombre;
      }
      return this.formatNombre(conv.contacto);
    },

    abrirSoporte(conv) {
      const nombre = this.obtenerNombreContacto(conv);
      const contacto = conv.contacto;
      const conversacionId = conv.id;

      this.$router.push({
        name: 'soporte',
        query: {
          nombre: nombre,
          contacto: contacto,
          conversacionId: conversacionId,
          crear: '1'
        }
      }).catch(() => {});
    },
  },
};
</script>

<style scoped>
/* ── Page ── */
.pl-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  padding: 20px 24px 0;
  gap: 14px;
  box-sizing: border-box;
}

/* ── Header ── */
.pl-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  gap: 16px; flex-shrink: 0;
}
.pl-title { font-size: 22px; font-weight: 800; color: #f1f5f9; margin: 0 0 4px; }
.pl-subtitle { font-size: 12px; color: #64748b; margin: 0; }
.pl-header-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }

/* ── Buttons ── */
.pl-btn-pri {
  display: flex; align-items: center; gap: 6px; padding: 7px 14px; border-radius: 8px;
  background: #6366f1; border: none; color: #fff; font-size: 13px; font-weight: 600;
  cursor: pointer; font-family: inherit; transition: background 0.15s;
}
.pl-btn-pri:hover:not(:disabled) { background: #4f46e5; }
.pl-btn-pri:disabled { opacity: 0.5; cursor: not-allowed; }
.pl-btn-sec {
  display: flex; align-items: center; gap: 6px; padding: 7px 12px; border-radius: 8px;
  background: #1e293b; border: 1px solid #334155; color: #94a3b8; font-size: 12px;
  font-weight: 600; cursor: pointer; font-family: inherit; transition: all 0.15s;
}
.pl-btn-sec:hover { border-color: #6366f1; color: #818cf8; }

/* ── Filtros ── */
.pl-filtros-panel {
  background: #1e293b; border: 1px solid #1e3a5f44; border-radius: 10px;
  padding: 12px 16px; flex-shrink: 0;
}
.pl-chip-filter {
  background: #0f172a; border: 1px solid #334155; border-radius: 999px;
  color: #64748b; font-size: 11px; font-weight: 600; padding: 3px 10px;
  cursor: pointer; font-family: inherit; transition: all 0.15s;
}
.pl-chip-filter:hover { border-color: #6366f155; }
.pl-chip-filter--active { background: #6366f122; border-color: #6366f155; color: #818cf8; }

/* ── Stage tabs ── */
.pl-tabs-row {
  display: flex; gap: 6px; overflow-x: auto; flex-shrink: 0;
  padding-bottom: 2px;
}
.pl-stage-tab {
  background: transparent; border: 1px solid; border-radius: 999px;
  font-size: 11px; font-weight: 700; padding: 4px 12px;
  cursor: pointer; font-family: inherit; transition: all 0.15s; white-space: nowrap;
  opacity: 0.6;
}
.pl-stage-tab--active, .pl-stage-tab:hover { opacity: 1; }

/* ── Board ── */
.pl-board {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  overflow-y: hidden;
  flex: 1;
  padding-bottom: 16px;
  align-items: flex-start;
}

/* ── Column ── */
.pl-col {
  width: 230px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  background: #111827;
  border-radius: 12px;
  border: 1px solid #1e3a5f44;
  max-height: 100%;
  transition: border-color 0.15s;
  overflow: hidden;
}
.pl-col--dragover {
  border-color: #6366f166;
  background: #6366f108;
}

.pl-col-hd {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 14px; flex-shrink: 0; border-bottom: 1px solid #1e3a5f33;
}
.pl-col-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.pl-col-name { font-size: 13px; font-weight: 700; color: #e2e8f0; }
.pl-col-count {
  min-width: 20px; height: 20px; border-radius: 999px;
  font-size: 11px; font-weight: 700;
  display: flex; align-items: center; justify-content: center; padding: 0 6px;
}

.pl-cards-list {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 80px;
}
.pl-cards-list--empty { align-items: center; justify-content: center; }

.pl-drop-placeholder {
  font-size: 12px; color: #334155; text-align: center;
  border: 2px dashed #1e3a5f; border-radius: 8px;
  padding: 24px; width: 100%; box-sizing: border-box;
}

/* ── Contact card ── */
.pl-card {
  background: #1e293b; border: 1px solid #1e3a5f44; border-radius: 10px;
  padding: 12px; cursor: grab; transition: all 0.15s;
}
.pl-card:hover { border-color: #6366f155; box-shadow: 0 4px 16px #0005; }
.pl-card:active { cursor: grabbing; }
.pl-card--dragging { opacity: 0.4; }

.pl-avatar {
  width: 34px; height: 34px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 700; flex-shrink: 0;
}
.pl-card-name {
  font-size: 13px; font-weight: 700; color: #f1f5f9;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 120px;
}
.pl-card-canal {
  display: flex; align-items: center; gap: 4px;
  font-size: 10px; color: #64748b; margin-top: 2px;
}
.pl-score { font-size: 15px; font-weight: 900; flex-shrink: 0; }

.pl-tag {
  font-size: 10px; font-weight: 600; padding: 2px 7px; border-radius: 999px;
}

.pl-card-footer {
  display: flex; align-items: center; justify-content: space-between;
  padding-top: 8px; border-top: 1px solid #1e3a5f22;
}
.pl-agent-avatar {
  width: 18px; height: 18px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 8px; font-weight: 700; flex-shrink: 0;
}
.pl-agent-name { font-size: 10px; color: #64748b; }
.pl-card-date { font-size: 10px; color: #475569; }

/* ── Add button ── */
.pl-add-btn {
  width: 100%; display: flex; align-items: center; justify-content: center; gap: 5px;
  padding: 10px; background: none; border: none; border-top: 1px solid #1e3a5f33;
  color: #475569; font-size: 12px; font-weight: 600; cursor: pointer;
  font-family: inherit; transition: all 0.15s; flex-shrink: 0;
}
.pl-add-btn:hover { background: #6366f10a; color: #818cf8; }

/* ── Modal ── */
.pl-overlay {
  position: fixed; inset: 0; background: #00000088; z-index: 1000;
  display: flex; align-items: center; justify-content: center; padding: 20px;
}
.pl-modal {
  background: #0d1526; border: 1px solid #1e3a5f55; border-radius: 14px;
  width: 100%; max-width: 460px; max-height: 90vh; overflow: hidden;
  display: flex; flex-direction: column;
}
.pl-modal-hd {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 20px; border-bottom: 1px solid #1e3a5f44;
  font-size: 14px; font-weight: 700; color: #e2e8f0; flex-shrink: 0;
}
.pl-modal-close {
  background: none; border: none; cursor: pointer; color: #475569;
  font-size: 16px; padding: 4px 8px; border-radius: 6px; transition: color 0.15s;
}
.pl-modal-close:hover { color: #94a3b8; }
.pl-modal-body { padding: 20px; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 14px; }
.pl-modal-ft { display: flex; justify-content: flex-end; gap: 8px; padding: 14px 20px; border-top: 1px solid #1e3a5f44; flex-shrink: 0; }

.pl-field { display: flex; flex-direction: column; gap: 5px; }
.pl-field label { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
.pl-input, .pl-input-sel {
  background: #1e293b; border: 1px solid #334155; border-radius: 8px;
  color: #e2e8f0; font-size: 13px; padding: 9px 12px; outline: none;
  font-family: inherit; transition: border-color 0.15s; width: 100%; box-sizing: border-box;
}
.pl-input:focus, .pl-input-sel:focus { border-color: #6366f1; }
.pl-input-sel { appearance: none; cursor: pointer; }
.pl-etapa-chip {
  padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 600;
  cursor: pointer; font-family: inherit; transition: all 0.15s;
}

/* ── Spinner ── */
.pl-spinner {
  width: 32px; height: 32px; border-radius: 50%;
  border: 3px solid #6366f1; border-top-color: transparent;
  animation: pl-spin 0.75s linear infinite;
}
@keyframes pl-spin { to { transform: rotate(360deg); } }
</style>
