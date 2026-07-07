<template>
  <div class="ct-page">

    <!-- ── Header ── -->
    <div class="ct-header">
      <div>
        <h1 class="ct-title">Contactos</h1>
        <p class="ct-subtitle">{{ contactosFiltrados.length }} contactos encontrados</p>
      </div>
      <div class="ct-header-actions">
        <button class="ct-btn-sec" @click="exportarCSV">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Exportar
        </button>
        <button class="ct-btn-pri" @click="abrirNuevoContacto">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Nuevo Contacto
        </button>
      </div>
    </div>

    <!-- ── Toolbar ── -->
    <div class="ct-toolbar">
      <div style="position:relative; flex:1; max-width:340px;">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" style="position:absolute; left:11px; top:50%; transform:translateY(-50%); pointer-events:none;"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input v-model="busqueda" class="ct-search" placeholder="Buscar contacto..." />
      </div>

      <!-- Canal dropdown -->
      <div class="ct-dropdown-wrap" v-click-outside="() => dropCanalOpen = false">
        <button class="ct-dropdown-btn" @click="dropCanalOpen = !dropCanalOpen">
          {{ filtroCanalLabel }}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        <div v-if="dropCanalOpen" class="ct-dropdown-menu">
          <button v-for="op in opcionesCanal" :key="op.value" class="ct-dropdown-item"
            :class="{ 'ct-dropdown-item--active': filtroCanal === op.value }"
            @click="filtroCanal = op.value; dropCanalOpen = false">
            {{ op.label }}
          </button>
        </div>
      </div>

      <!-- Sort dropdown -->
      <div class="ct-dropdown-wrap" v-click-outside="() => dropSortOpen = false">
        <button class="ct-dropdown-btn" @click="dropSortOpen = !dropSortOpen">
          {{ sortLabel }}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        <div v-if="dropSortOpen" class="ct-dropdown-menu">
          <button v-for="op in opcionesSort" :key="op.value" class="ct-dropdown-item"
            :class="{ 'ct-dropdown-item--active': sortActivo === op.value }"
            @click="sortActivo = op.value; dropSortOpen = false">
            {{ op.label }}
          </button>
        </div>
      </div>

      <!-- View toggle -->
      <div style="margin-left:auto; display:flex; border:1px solid #334155; border-radius:8px; overflow:hidden; background:#1e293b;">
        <button class="ct-view-btn" :class="{ 'ct-view-btn--active': vista === 'lista' }" @click="vista = 'lista'" title="Vista lista">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6" stroke-linecap="round" stroke-width="3"/><line x1="3" y1="12" x2="3.01" y2="12" stroke-linecap="round" stroke-width="3"/><line x1="3" y1="18" x2="3.01" y2="18" stroke-linecap="round" stroke-width="3"/></svg>
        </button>
        <button class="ct-view-btn" :class="{ 'ct-view-btn--active': vista === 'grid' }" @click="vista = 'grid'" title="Vista cuadrícula">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
        </button>
      </div>
    </div>

    <!-- ── Loading ── -->
    <div v-if="loading" style="display:flex; justify-content:center; padding:60px;">
      <div class="ct-spinner"></div>
    </div>

    <!-- ── Lista (tabla) ── -->
    <div v-else-if="vista === 'lista'" class="ct-table-wrap">
      <table class="ct-table">
        <thead>
          <tr>
            <th>CONTACTO</th>
            <th>CANAL</th>
            <th style="width:120px;">ESTADO</th>
            <th style="width:120px;">PIPELINE</th>
            <th style="width:160px;">PUNTUACIÓN</th>
            <th style="width:160px;">ETIQUETAS</th>
            <th style="width:120px;">AGENTE</th>
            <th style="width:90px; text-align:center;">ACCIONES</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="contactosFiltrados.length === 0">
            <td colspan="8" style="text-align:center; padding:48px; color:#475569; font-size:13px;">
              Sin contactos registrados
            </td>
          </tr>
          <tr v-for="c in contactosFiltrados" :key="c.id" class="ct-row" @click="abrirDetalle(c)">
            <!-- Contacto -->
            <td>
              <div style="display:flex; align-items:center; gap:10px;">
                <div class="ct-avatar" :style="{ background: canalColor(c.canal)+'44', color: canalColor(c.canal) }">
                  {{ iniciales(c.nombre || c.contacto) }}
                </div>
                <div>
                  <div class="ct-nombre">{{ obtenerNombreContacto(c) }}</div>
                  <div class="ct-id">{{ c.contacto }}</div>
                </div>
              </div>
            </td>
            <!-- Canal -->
            <td>
              <div style="display:flex; align-items:center; gap:7px;">
                <span v-html="canalIcono(c.canal)" style="display:flex; width:16px; height:16px; flex-shrink:0;"></span>
                <span class="ct-canal-label" :style="{ color: canalColor(c.canal) }">{{ canalLabel(c.canal) }}</span>
              </div>
            </td>
            <!-- Estado -->
            <td>
              <div style="display:flex; align-items:center; gap:6px;">
                <span class="ct-status-dot" :style="{ background: estadoColor(c.estadoConversacion) }"></span>
                <span style="font-size:12px; color:#94a3b8; text-transform:capitalize;">{{ estadoLabel(c.estadoConversacion) }}</span>
              </div>
            </td>
            <!-- Pipeline -->
            <td>
              <span style="font-size:12px; color:#94a3b8;">{{ pipelineLabel(c.estadoConversacion) }}</span>
            </td>
            <!-- Puntuación -->
            <td>
              <div style="display:flex; align-items:center; gap:8px;">
                <div style="flex:1; height:5px; border-radius:3px; background:#0f172a; overflow:hidden; min-width:60px;">
                  <div :style="{ width: (c.score||0)+'%', height:'100%', background: scoreColor(c.score), borderRadius:'3px', transition:'width 0.4s' }"></div>
                </div>
                <span style="font-size:13px; font-weight:700; min-width:24px; text-align:right;" :style="{ color: scoreColor(c.score) }">{{ c.score || 0 }}</span>
              </div>
            </td>
            <!-- Etiquetas -->
            <td>
              <div style="display:flex; flex-wrap:wrap; gap:4px;">
                <span v-for="tag in etiquetas(c)" :key="tag.label" class="ct-tag" :style="{ background: tag.color+'18', color: tag.color, border: '1px solid '+tag.color+'33' }">{{ tag.label }}</span>
              </div>
            </td>
            <!-- Agente -->
            <td>
              <div style="display:flex; align-items:center; gap:7px;">
                <div class="ct-agent-avatar" :style="c.agente ? { background:'#6366f122', color:'#818cf8' } : { background:'#1e293b', color:'#475569' }">
                  {{ c.agente ? iniciales(c.agente) : '—' }}
                </div>
                <span style="font-size:12px; color:#94a3b8;">{{ c.agente || 'Sin' }}</span>
              </div>
            </td>
            <!-- Acciones -->
            <td @click.stop style="text-align:center;">
              <div style="display:flex; align-items:center; justify-content:center; gap:6px;">
                <button class="ct-action-btn" @click.stop="abrirEditar(c)" title="Editar">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button class="ct-action-btn" @click.stop="irAChat(c)" title="Ver conversación">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ── Vista cuadrícula ── -->
    <div v-else class="ct-grid">
      <div v-if="contactosFiltrados.length === 0" class="ct-empty">Sin contactos registrados</div>
      <div v-for="c in contactosFiltrados" :key="c.id" class="ct-card" @click="abrirDetalle(c)">
        <div style="display:flex; align-items:center; gap:10px; margin-bottom:12px;">
          <div class="ct-avatar ct-avatar--lg" :style="{ background: canalColor(c.canal)+'44', color: canalColor(c.canal) }">
            {{ iniciales(c.nombre || c.contacto) }}
          </div>
          <div style="flex:1; min-width:0;">
            <div class="ct-nombre">{{ obtenerNombreContacto(c) }}</div>
            <div class="ct-id">{{ c.contacto }}</div>
          </div>
          <span style="font-size:16px; font-weight:900;" :style="{ color: scoreColor(c.score) }">{{ c.score || 0 }}</span>
        </div>
        <div style="display:flex; align-items:center; gap:6px; margin-bottom:10px;">
          <span v-html="canalIcono(c.canal)" style="display:flex;"></span>
          <span style="font-size:11px; font-weight:600;" :style="{ color: canalColor(c.canal) }">{{ canalLabel(c.canal) }}</span>
          <span class="ct-status-dot" :style="{ background: estadoColor(c.estadoConversacion), marginLeft:'auto' }"></span>
          <span style="font-size:11px; color:#64748b;">{{ estadoLabel(c.estadoConversacion) }}</span>
        </div>
        <div style="display:flex; flex-wrap:wrap; gap:4px; margin-bottom:10px;">
          <span v-for="tag in etiquetas(c)" :key="tag.label" class="ct-tag" :style="{ background: tag.color+'18', color: tag.color, border: '1px solid '+tag.color+'33' }">{{ tag.label }}</span>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; padding-top:10px; border-top:1px solid #1e3a5f33;">
          <span style="font-size:11px; color:#64748b;">{{ pipelineLabel(c.estadoConversacion) }}</span>
          <div style="display:flex; gap:6px;">
            <button class="ct-action-btn" @click.stop="abrirEditar(c)" title="Editar">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="ct-action-btn" @click.stop="irAChat(c)" title="Chat">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Modal: Detalle / Editar contacto ── -->
    <div v-if="modal" class="ct-overlay" @click.self="modal = null">
      <div class="ct-modal">
        <div class="ct-modal-hd">
          <div style="display:flex; align-items:center; gap:10px;">
            <div class="ct-avatar" :style="{ background: canalColor(modal.canal)+'44', color: canalColor(modal.canal) }">
              {{ iniciales(modal.nombre || modal.contacto) }}
            </div>
            <div>
              <div style="font-size:15px; font-weight:700; color:#f1f5f9;">{{ obtenerNombreContacto(modal) }}</div>
              <div style="font-size:11px; color:#64748b;">{{ modal.contacto }}</div>
            </div>
          </div>
          <button class="ct-modal-close" @click="modal = null">✕</button>
        </div>
        <div class="ct-modal-body">
          <!-- Score -->
          <div style="margin-bottom:16px;">
            <div style="display:flex; justify-content:space-between; font-size:11px; color:#64748b; margin-bottom:6px;">
              <span>Lead Score</span>
              <span style="font-weight:700;" :style="{ color: scoreColor(modal.score) }">{{ modal.score || 0 }}/100</span>
            </div>
            <div style="height:6px; border-radius:3px; background:#1e293b; overflow:hidden;">
              <div :style="{ width: (modal.score||0)+'%', height:'100%', background: scoreColor(modal.score), borderRadius:'3px', transition:'width 0.4s' }"></div>
            </div>
          </div>
          <!-- Nombre personalizado -->
          <div class="ct-field">
            <label>Nombre personalizado</label>
            <input v-model="modalForm.nombre" class="ct-input" placeholder="Ej: Alvaroi" />
          </div>
          <!-- Info grid -->
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
            <div>
              <div class="ct-detail-label">Canal</div>
              <div class="ct-detail-val" :style="{ color: canalColor(modal.canal) }">{{ canalLabel(modal.canal) }}</div>
            </div>
            <div>
              <div class="ct-detail-label">Estado</div>
              <div class="ct-detail-val" style="display:flex; align-items:center; gap:5px;">
                <span class="ct-status-dot" :style="{ background: estadoColor(modal.estadoConversacion) }"></span>
                {{ estadoLabel(modal.estadoConversacion) }}
              </div>
            </div>
            <div>
              <div class="ct-detail-label">Pipeline</div>
              <div class="ct-detail-val">{{ pipelineLabel(modal.estadoConversacion) }}</div>
            </div>
            <div>
              <div class="ct-detail-label">Mensajes</div>
              <div class="ct-detail-val">{{ modal.totalMensajes || 0 }}</div>
            </div>
          </div>
          <!-- Etiquetas -->
          <div style="margin-top:14px;">
            <div class="ct-detail-label" style="margin-bottom:8px;">Etiquetas</div>
            <div style="display:flex; flex-wrap:wrap; gap:6px;">
              <span v-for="tag in etiquetas(modal)" :key="tag.label" class="ct-tag" :style="{ background: tag.color+'18', color: tag.color, border: '1px solid '+tag.color+'33' }">{{ tag.label }}</span>
            </div>
          </div>
        </div>
        <div class="ct-modal-ft">
          <button class="ct-btn-sec" @click="irAChat(modal)">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
            Ver conversación
          </button>
          <button class="ct-btn-pri" @click="guardarNota" :disabled="guardando">
            {{ guardando ? 'Guardando...' : 'Guardar nombre' }}
          </button>
        </div>
      </div>
    </div>

    <!-- ── Modal: Nuevo contacto ── -->
    <div v-if="dialogNuevo" class="ct-overlay" @click.self="dialogNuevo = false">
      <div class="ct-modal">
        <div class="ct-modal-hd">
          <span>Nuevo Contacto</span>
          <button class="ct-modal-close" @click="dialogNuevo = false">✕</button>
        </div>
        <div class="ct-modal-body">
          <div class="ct-field">
            <label>Nombre *</label>
            <input v-model="formNuevo.nombre" class="ct-input" placeholder="Nombre del contacto" />
          </div>
          <div class="ct-field">
            <label>Número / Handle *</label>
            <input v-model="formNuevo.contacto" class="ct-input" placeholder="+52 55 1234 5678 o @usuario" />
          </div>
          <div class="ct-field">
            <label>Canal *</label>
            <select v-model="formNuevo.canal" class="ct-input ct-select">
              <option value="whatsapp">WhatsApp</option>
              <option value="instagram">Instagram</option>
              <option value="facebook">Facebook</option>
              <option value="tiktok">TikTok</option>
              <option value="chat">Chat Web</option>
            </select>
          </div>
          <div class="ct-field">
            <label>Agente IA</label>
            <select v-model="formNuevo.agenteId" class="ct-input ct-select">
              <option value="">— Sin agente —</option>
              <option v-for="ag in agentes" :key="ag.id" :value="ag.id">{{ ag.nombre }}</option>
            </select>
          </div>
        </div>
        <div class="ct-modal-ft">
          <button class="ct-btn-sec" @click="dialogNuevo = false">Cancelar</button>
          <button class="ct-btn-pri" @click="crearContacto" :disabled="!formNuevo.contacto || creando">
            {{ creando ? 'Creando...' : 'Crear Contacto' }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
const ETAPA_MAP = {
  abierto:    { pipeline: 'Nuevo Lead',  estadoLabel: 'Abierto',   color: '#f59e0b' },
  pendiente:  { pipeline: 'Contactado',  estadoLabel: 'Pendiente', color: '#f97316' },
  resuelto:   { pipeline: 'Ganado',      estadoLabel: 'Resuelto',  color: '#22c55e' },
  cerrado:    { pipeline: 'Perdido',     estadoLabel: 'Cerrado',   color: '#475569' },
  nuevo_lead: { pipeline: 'Nuevo Lead',  estadoLabel: 'Nuevo',     color: '#818cf8' },
  contactado: { pipeline: 'Contactado',  estadoLabel: 'Contactado',color: '#60a5fa' },
  calificado: { pipeline: 'Calificado',  estadoLabel: 'Calificado',color: '#60a5fa' },
  propuesta:  { pipeline: 'Propuesta',   estadoLabel: 'Propuesta', color: '#f59e0b' },
  negociacion:{ pipeline: 'Negociación', estadoLabel: 'Negociación',color:'#f97316' },
  ganado:     { pipeline: 'Ganado',      estadoLabel: 'Ganado',    color: '#22c55e' },
  perdido:    { pipeline: 'Perdido',     estadoLabel: 'Perdido',   color: '#ef4444' },
};

export default {
  name: 'Contactos',
  directives: {
    'click-outside': {
      bind(el, binding) {
        el._clickOutside = (e) => { if (!el.contains(e.target)) binding.value(e); };
        document.addEventListener('click', el._clickOutside);
      },
      unbind(el) { document.removeEventListener('click', el._clickOutside); },
    },
  },
  data() {
    return {
      conversaciones: [],
      agentes: [],
      loading: true,
      busqueda: '',
      filtroCanal: '',
      sortActivo: 'nombre_az',
      vista: 'lista',
      dropCanalOpen: false,
      dropSortOpen: false,
      modal: null,
      modalForm: { nombre: '', nota: '' },
      guardando: false,
      dialogNuevo: false,
      creando: false,
      formNuevo: { nombre: '', contacto: '', canal: 'whatsapp', agenteId: '' },
      opcionesCanal: [
        { value: '', label: 'Todos los canales' },
        { value: 'whatsapp',  label: 'WhatsApp'  },
        { value: 'facebook',  label: 'Facebook'  },
        { value: 'instagram', label: 'Instagram' },
        { value: 'tiktok',    label: 'TikTok'    },
      ],
      opcionesSort: [
        { value: 'nombre_az', label: 'Nombre A-Z' },
        { value: 'nombre_za', label: 'Nombre Z-A' },
        { value: 'score_desc',label: 'Mayor puntuación' },
        { value: 'score_asc', label: 'Menor puntuación' },
        { value: 'reciente',  label: 'Más reciente' },
      ],
    };
  },
  computed: {
    filtroCanalLabel() {
      const op = this.opcionesCanal.find(o => o.value === this.filtroCanal);
      return op ? op.label : 'Todos los canales';
    },
    sortLabel() {
      const op = this.opcionesSort.find(o => o.value === this.sortActivo);
      return op ? op.label : 'Nombre A-Z';
    },
    contactosFiltrados() {
      let list = [...this.conversaciones];
      if (this.filtroCanal) list = list.filter(c => c.canal === this.filtroCanal);
      if (this.busqueda.trim()) {
        const q = this.busqueda.toLowerCase();
        list = list.filter(c =>
          (c.nombre || '').toLowerCase().includes(q) ||
          (c.contacto || '').toLowerCase().includes(q) ||
          (c.canal || '').toLowerCase().includes(q)
        );
      }
      list.sort((a, b) => {
        const nA = (a.nombre || a.contacto || '').toLowerCase();
        const nB = (b.nombre || b.contacto || '').toLowerCase();
        if (this.sortActivo === 'nombre_az') return nA.localeCompare(nB);
        if (this.sortActivo === 'nombre_za') return nB.localeCompare(nA);
        if (this.sortActivo === 'score_desc') return (b.score || 0) - (a.score || 0);
        if (this.sortActivo === 'score_asc')  return (a.score || 0) - (b.score || 0);
        if (this.sortActivo === 'reciente')   return new Date(b.fechaCreacion) - new Date(a.fechaCreacion);
        return 0;
      });
      return list;
    },
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
          nombre: c.nombre || '',
          agente: c.agente || null,
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

    abrirDetalle(c) {
      this.modal = { ...c };
      // Extraer nombre personalizado del campo notas si existe
      let nombrePersonalizado = c.nombre || '';
      if (c.canal === 'whatsapp' && c.notas && c.notas.startsWith('Nombre:')) {
        nombrePersonalizado = c.notas.replace('Nombre:', '').trim();
      }
      this.modalForm = { nombre: nombrePersonalizado, nota: '' };
    },
    abrirEditar(c) { this.abrirDetalle(c); },

    async guardarNota() {
      if (!this.modal) return;
      this.guardando = true;
      try {
        // Guardar el nombre personalizado
        let notasGuardar = this.modalForm.nombre.trim()
          ? `Nombre: ${this.modalForm.nombre.trim()}`
          : '';

        await this.$service.patch(`conversaciones/${this.modal.id}`, { notas: notasGuardar });
        const idx = this.conversaciones.findIndex(c => c.id === this.modal.id);
        if (idx !== -1) {
          this.conversaciones[idx].notas = notasGuardar;
          this.conversaciones[idx].nombre = this.modalForm.nombre;
        }
        this.$message && this.$message.success('Nombre actualizado');
        this.modal = null;
      } catch (e) {
        this.$message && this.$message.error(e?.mensaje || 'Error al guardar');
      } finally {
        this.guardando = false;
      }
    },

    irAChat(c) {
      this.modal = null;
      this.$router.push({ name: 'conversaciones' });
    },

    abrirNuevoContacto() {
      this.formNuevo = { nombre: '', contacto: '', canal: 'whatsapp', agenteId: '' };
      this.dialogNuevo = true;
    },

    async crearContacto() {
      if (!this.formNuevo.contacto || this.creando) return;
      this.creando = true;
      try {
        const agenteId = this.formNuevo.agenteId || (this.agentes[0]?.id || null);
        await this.$service.post('conversaciones', {
          contacto: this.formNuevo.contacto,
          nombre: this.formNuevo.nombre,
          canal: this.formNuevo.canal,
          estadoConversacion: 'nuevo_lead',
          agenteId,
        });
        this.$message && this.$message.success('Contacto creado');
        this.dialogNuevo = false;
        await this.cargar();
      } catch (e) {
        this.$message && this.$message.error(e?.mensaje || 'Error al crear');
      } finally {
        this.creando = false;
      }
    },

    exportarCSV() {
      const headers = ['Nombre', 'Contacto', 'Canal', 'Estado', 'Pipeline', 'Score', 'Etiquetas'];
      const rows = this.contactosFiltrados.map(c => [
        c.nombre || this.formatNombre(c.contacto),
        c.contacto,
        c.canal,
        this.estadoLabel(c.estadoConversacion),
        this.pipelineLabel(c.estadoConversacion),
        c.score || 0,
        this.etiquetas(c).map(t => t.label).join('; '),
      ]);
      const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'contactos.csv'; a.click();
      URL.revokeObjectURL(url);
    },

    // ── Helpers ──
    iniciales(str) {
      if (!str) return '??';
      const partes = str.trim().split(/\s+/);
      if (partes.length >= 2) return (partes[0][0] + partes[1][0]).toUpperCase();
      return str.slice(0, 2).toUpperCase();
    },
    formatNombre(str) {
      if (!str) return 'Sin nombre';
      if (str.length > 22) return str.slice(0, 22) + '…';
      return str;
    },
    canalColor(c) {
      const m = { whatsapp: '#25D366', instagram: '#E1306C', facebook: '#1877F2', tiktok: '#69C9D0', chat: '#818cf8' };
      return m[c] || '#64748b';
    },
    canalLabel(c) {
      const m = { whatsapp: 'WhatsApp', instagram: 'Instagram', facebook: 'Facebook', tiktok: 'TikTok', chat: 'Chat Web' };
      return m[c] || c;
    },
    canalIcono(c) {
      if (c === 'whatsapp') return `<svg width="16" height="16" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>`;
      if (c === 'instagram') return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E1306C" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" stroke-linecap="round" stroke-width="3"/></svg>`;
      if (c === 'facebook') return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1877F2" stroke-width="2.5"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>`;
      if (c === 'tiktok') return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#69C9D0" stroke-width="2"><path d="M9 12a4 4 0 104 4V4a5 5 0 005 5"/></svg>`;
      return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#818cf8" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>`;
    },
    estadoLabel(e) { return ETAPA_MAP[e]?.estadoLabel || 'Nuevo'; },
    estadoColor(e) { return ETAPA_MAP[e]?.color || '#818cf8'; },
    pipelineLabel(e) { return ETAPA_MAP[e]?.pipeline || 'Nuevo Lead'; },
    scoreColor(s) { return s >= 70 ? '#22c55e' : s >= 40 ? '#f59e0b' : '#ef4444'; },
    etiquetas(c) {
      const tags = [];
      if (c.score >= 70)  tags.push({ label: 'Hot',  color: '#ef4444' });
      else if (c.score >= 40) tags.push({ label: 'Warm', color: '#f59e0b' });
      if (c.score >= 65)  tags.push({ label: 'Venta', color: '#8b5cf6' });
      if (c.escalado)     tags.push({ label: 'Reclamo', color: '#ef4444' });
      if (!c.escalado && c.score < 40) tags.push({ label: 'Cold', color: '#3b82f6' });
      if (!tags.some(t => ['Hot','Warm','Cold'].includes(t.label)) && c.score < 70) {
        tags.push({ label: 'Info', color: '#475569' });
      }
      return tags.slice(0, 3);
    },

    obtenerNombreContacto(c) {
      if (c.nombre) return c.nombre;
      if (c.canal === 'whatsapp' && c.notas && c.notas.startsWith('Nombre:')) {
        const nombre = c.notas.replace('Nombre:', '').trim();
        return nombre.length > 25 ? nombre.slice(0, 25) + '…' : nombre;
      }
      return this.formatNombre(c.contacto);
    },
  },
};
</script>

<style scoped>
/* ── Page ── */
.ct-page {
  display: flex; flex-direction: column;
  height: 100%; overflow: hidden;
  padding: 22px 26px 0; gap: 16px; box-sizing: border-box;
}

/* ── Header ── */
.ct-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-shrink: 0; }
.ct-title { font-size: 22px; font-weight: 800; color: #f1f5f9; margin: 0 0 4px; }
.ct-subtitle { font-size: 12px; color: #64748b; margin: 0; }
.ct-header-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }

/* ── Buttons ── */
.ct-btn-pri {
  display: flex; align-items: center; gap: 6px; padding: 7px 14px; border-radius: 8px;
  background: #6366f1; border: none; color: #fff; font-size: 13px; font-weight: 600;
  cursor: pointer; font-family: inherit; transition: background 0.15s;
}
.ct-btn-pri:hover:not(:disabled) { background: #4f46e5; }
.ct-btn-pri:disabled { opacity: 0.5; cursor: not-allowed; }
.ct-btn-sec {
  display: flex; align-items: center; gap: 6px; padding: 7px 12px; border-radius: 8px;
  background: #1e293b; border: 1px solid #334155; color: #94a3b8; font-size: 12px;
  font-weight: 600; cursor: pointer; font-family: inherit; transition: all 0.15s;
}
.ct-btn-sec:hover { border-color: #6366f1; color: #818cf8; }

/* ── Toolbar ── */
.ct-toolbar { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
.ct-search {
  width: 100%; background: #1e293b; border: 1px solid #334155; border-radius: 8px;
  color: #e2e8f0; font-size: 13px; padding: 9px 12px 9px 34px; outline: none;
  font-family: inherit; transition: border-color 0.15s; box-sizing: border-box;
}
.ct-search:focus { border-color: #6366f1; }

/* ── Dropdowns ── */
.ct-dropdown-wrap { position: relative; }
.ct-dropdown-btn {
  display: flex; align-items: center; gap: 7px; padding: 8px 14px;
  background: #1e293b; border: 1px solid #334155; border-radius: 8px;
  color: #94a3b8; font-size: 13px; font-weight: 500;
  cursor: pointer; font-family: inherit; transition: all 0.15s; white-space: nowrap;
}
.ct-dropdown-btn:hover { border-color: #6366f1; color: #e2e8f0; }
.ct-dropdown-menu {
  position: absolute; top: calc(100% + 6px); left: 0; z-index: 100;
  background: #1e293b; border: 1px solid #334155; border-radius: 10px;
  min-width: 180px; padding: 4px;
  box-shadow: 0 8px 24px #0009;
}
.ct-dropdown-item {
  display: block; width: 100%; text-align: left; padding: 8px 12px;
  background: none; border: none; border-radius: 7px;
  color: #94a3b8; font-size: 13px; cursor: pointer; font-family: inherit;
  transition: all 0.15s;
}
.ct-dropdown-item:hover { background: #6366f115; color: #e2e8f0; }
.ct-dropdown-item--active { background: #6366f122; color: #818cf8; font-weight: 600; }

/* ── View toggle ── */
.ct-view-btn {
  background: none; border: none; cursor: pointer; color: #64748b;
  padding: 7px 10px; display: flex; align-items: center; transition: all 0.15s;
}
.ct-view-btn--active { background: #6366f122; color: #818cf8; }

/* ── Table ── */
.ct-table-wrap { flex: 1; overflow-y: auto; border-radius: 12px; border: 1px solid #1e3a5f44; }
.ct-table { width: 100%; border-collapse: collapse; background: #111827; }
.ct-table thead tr { border-bottom: 1px solid #1e3a5f44; background: #0d1526; }
.ct-table th {
  padding: 11px 16px; font-size: 10px; font-weight: 700; color: #475569;
  text-transform: uppercase; letter-spacing: 0.8px; text-align: left; white-space: nowrap;
}
.ct-row { border-bottom: 1px solid #1e3a5f22; cursor: pointer; transition: background 0.12s; }
.ct-row:hover { background: #6366f108; }
.ct-row:last-child { border-bottom: none; }
.ct-row td { padding: 13px 16px; vertical-align: middle; }

/* ── Contact info ── */
.ct-avatar {
  width: 36px; height: 36px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 700; flex-shrink: 0;
}
.ct-avatar--lg { width: 42px; height: 42px; font-size: 14px; }
.ct-nombre { font-size: 13px; font-weight: 700; color: #e2e8f0; }
.ct-id { font-size: 11px; color: #475569; margin-top: 2px; }
.ct-canal-label { font-size: 13px; font-weight: 600; }
.ct-status-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; display: inline-block; }
.ct-agent-avatar {
  width: 24px; height: 24px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 9px; font-weight: 700; flex-shrink: 0;
}
.ct-tag { font-size: 10px; font-weight: 600; padding: 2px 7px; border-radius: 999px; white-space: nowrap; }

/* ── Action buttons ── */
.ct-action-btn {
  background: #1e293b; border: 1px solid #334155; border-radius: 7px;
  color: #64748b; padding: 6px; cursor: pointer; display: flex;
  align-items: center; justify-content: center; transition: all 0.15s;
}
.ct-action-btn:hover { border-color: #6366f1; color: #818cf8; background: #6366f115; }

/* ── Grid view ── */
.ct-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 12px; overflow-y: auto; flex: 1; align-content: start; padding-bottom: 16px;
}
.ct-card {
  background: #1e293b; border: 1px solid #1e3a5f44; border-radius: 12px;
  padding: 14px; cursor: pointer; transition: all 0.15s;
}
.ct-card:hover { border-color: #6366f155; }
.ct-empty { text-align: center; padding: 60px; color: #475569; font-size: 13px; grid-column: 1/-1; }

/* ── Modal ── */
.ct-overlay {
  position: fixed; inset: 0; background: #00000088; z-index: 1000;
  display: flex; align-items: center; justify-content: center; padding: 20px;
}
.ct-modal {
  background: #0d1526; border: 1px solid #1e3a5f55; border-radius: 14px;
  width: 100%; max-width: 480px; max-height: 90vh; overflow: hidden;
  display: flex; flex-direction: column;
}
.ct-modal-hd {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 20px; border-bottom: 1px solid #1e3a5f44;
  font-size: 14px; font-weight: 700; color: #e2e8f0; flex-shrink: 0;
}
.ct-modal-close {
  background: none; border: none; cursor: pointer; color: #475569;
  font-size: 16px; padding: 4px 8px; border-radius: 6px; transition: color 0.15s;
}
.ct-modal-close:hover { color: #94a3b8; }
.ct-modal-body { padding: 20px; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 14px; }
.ct-modal-ft { display: flex; justify-content: flex-end; gap: 8px; padding: 14px 20px; border-top: 1px solid #1e3a5f44; flex-shrink: 0; }

.ct-field { display: flex; flex-direction: column; gap: 5px; }
.ct-field label { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
.ct-input {
  background: #1e293b; border: 1px solid #334155; border-radius: 8px;
  color: #e2e8f0; font-size: 13px; padding: 9px 12px; outline: none;
  font-family: inherit; transition: border-color 0.15s; box-sizing: border-box; width: 100%;
}
.ct-input:focus { border-color: #6366f1; }
.ct-select { appearance: none; cursor: pointer; }
.ct-textarea { resize: vertical; }
.ct-detail-label { font-size: 10px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
.ct-detail-val { font-size: 13px; color: #94a3b8; display: flex; align-items: center; gap: 5px; }

/* ── Spinner ── */
.ct-spinner {
  width: 32px; height: 32px; border-radius: 50%;
  border: 3px solid #6366f1; border-top-color: transparent;
  animation: ct-spin 0.75s linear infinite;
}
@keyframes ct-spin { to { transform: rotate(360deg); } }
</style>
