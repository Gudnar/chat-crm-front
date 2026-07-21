<template>
  <div class="ide-page">

    <!-- Header -->
    <div style="display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:20px; flex-wrap:wrap; gap:12px;">
      <div>
        <h2 style="font-size:18px; font-weight:800; color:#f1f5f9; letter-spacing:-0.3px; margin-bottom:4px;">Recursos</h2>
        <p style="font-size:12px; color:#64748b;">Archivos que el agente IA puede enviar por WhatsApp: catálogos, fichas, fotos, audios, videos</p>
      </div>
      <button v-if="puedeGestionar" class="btn-add" @click="abrirForm(null)">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Agregar
      </button>
    </div>

    <!-- Stats row -->
    <div style="display:grid; grid-template-columns:repeat(4,1fr); gap:10px; margin-bottom:20px; max-width:560px;">
      <div class="ide-ia-card" style="padding:12px 14px; text-align:center;">
        <div style="font-size:22px; font-weight:900; color:#f1f5f9; line-height:1;">{{ recursos.length }}</div>
        <div style="font-size:10px; color:#64748b; margin-top:3px;">Total</div>
      </div>
      <div class="ide-ia-card" style="padding:12px 14px; text-align:center;">
        <div style="font-size:22px; font-weight:900; color:#818cf8; line-height:1;">{{ contarTipo('PDF') }}</div>
        <div style="font-size:10px; color:#64748b; margin-top:3px;">PDF</div>
      </div>
      <div style="padding:12px 14px; text-align:center;" class="ide-ia-card">
        <div style="font-size:22px; font-weight:900; color:#22c55e; line-height:1;">{{ contarTipo('IMAGEN') }}</div>
        <div style="font-size:10px; color:#64748b; margin-top:3px;">Imágenes</div>
      </div>
      <div class="ide-ia-card" style="padding:12px 14px; text-align:center;">
        <div style="font-size:22px; font-weight:900; color:#f59e0b; line-height:1;">{{ contarTipo('AUDIO') + contarTipo('VIDEO') }}</div>
        <div style="font-size:10px; color:#64748b; margin-top:3px;">Audio / Video</div>
      </div>
    </div>

    <!-- Filters -->
    <div style="display:flex; align-items:center; gap:10px; margin-bottom:16px; flex-wrap:wrap;">
      <input
        v-model="busqueda"
        class="ide-input"
        placeholder="Buscar por nombre, categoría, keyword…"
        style="width:260px; padding:8px 12px; font-size:12px;"
      />
      <select v-model="tipoFiltro" class="ide-select" style="width:160px; padding:8px 12px; font-size:12px;">
        <option value="">Todos los tipos</option>
        <option v-for="t in TIPOS" :key="t" :value="t">{{ ICONOS[t] }} {{ t }}</option>
      </select>
      <select v-model="categoriaFiltro" class="ide-select" style="width:180px; padding:8px 12px; font-size:12px;">
        <option value="">Todas las categorías</option>
        <option v-for="c in categorias" :key="c" :value="c">{{ c }}</option>
      </select>
      <button
        v-if="busqueda || tipoFiltro || categoriaFiltro"
        @click="busqueda = ''; tipoFiltro = ''; categoriaFiltro = ''"
        style="background:none; border:1px solid #334155; border-radius:8px; color:#64748b; padding:7px 12px; font-size:12px; cursor:pointer; font-family:inherit;"
      >
        Limpiar
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" style="display:flex; justify-content:center; padding:56px;">
      <v-progress-circular indeterminate color="primary" size="36" />
    </div>

    <!-- Empty -->
    <div v-else-if="!recursosFiltrados.length" class="ide-ia-card" style="text-align:center; padding:56px; color:#475569;">
      <div style="font-size:36px; margin-bottom:12px;">📎</div>
      <div style="font-size:14px; font-weight:700; color:#94a3b8; margin-bottom:6px;">
        {{ busqueda || tipoFiltro || categoriaFiltro ? 'Sin resultados' : 'Sin recursos' }}
      </div>
      <div style="font-size:12px;">
        {{ busqueda || tipoFiltro || categoriaFiltro ? 'Intenta con otros filtros' : 'Sube el primer catálogo, ficha o imagen para que el agente pueda enviarlo por WhatsApp' }}
      </div>
      <button v-if="puedeGestionar && !busqueda && !tipoFiltro && !categoriaFiltro" class="btn-add" @click="abrirForm(null)" style="margin:16px auto 0;">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Agregar recurso
      </button>
    </div>

    <!-- Grid -->
    <div v-else style="display:grid; grid-template-columns:repeat(auto-fill, minmax(220px, 1fr)); gap:14px;">
      <div v-for="r in recursosFiltrados" :key="r.id" class="ide-ia-card rec-card" style="padding:0; overflow:hidden; display:flex; flex-direction:column;" :style="{ opacity: r.activo ? 1 : 0.55 }">

        <!-- Preview -->
        <div style="height:120px; background:#0f172a; display:flex; align-items:center; justify-content:center; flex-shrink:0; overflow:hidden;">
          <img v-if="r.tipo === 'IMAGEN' && recursoUrl(r)" :src="recursoUrl(r)" style="width:100%; height:100%; object-fit:cover;" @error="e => e.target.style.display='none'" />
          <audio v-else-if="r.tipo === 'AUDIO' && recursoUrl(r)" :src="recursoUrl(r)" controls style="width:90%;" />
          <video v-else-if="r.tipo === 'VIDEO' && verVideo === r.id && recursoUrl(r)" :src="recursoUrl(r)" controls style="width:100%; height:100%; object-fit:contain;" />
          <button v-else-if="r.tipo === 'VIDEO'" @click="verVideo = r.id" style="background:none; border:none; cursor:pointer; display:flex; flex-direction:column; align-items:center; gap:6px; color:#64748b;">
            <span style="font-size:32px;">{{ ICONOS[r.tipo] }}</span>
            <span style="font-size:11px;">Ver video</span>
          </button>
          <span v-else style="font-size:36px;">{{ ICONOS[r.tipo] || '📎' }}</span>
        </div>

        <!-- Info -->
        <div style="padding:12px 14px; flex:1; display:flex; flex-direction:column; gap:6px;">
          <div style="font-size:13px; font-weight:700; color:#e2e8f0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" :title="r.nombre">{{ r.nombre }}</div>
          <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
            <span v-if="r.categoria" style="background:#6366f122; color:#818cf8; padding:2px 8px; border-radius:4px; font-size:10px;">{{ r.categoria }}</span>
            <span v-if="r.activo" style="background:#22c55e33; color:#22c55e; padding:2px 8px; border-radius:4px; font-size:10px; font-weight:600;">Activo</span>
            <span v-else style="background:#ef444433; color:#ef4444; padding:2px 8px; border-radius:4px; font-size:10px; font-weight:600;">Inactivo</span>
          </div>
          <div style="font-size:10px; color:#475569;">{{ r.tamanobytes ? formatearBytes(r.tamanobytes) : (r.urlExterna ? 'URL externa' : '—') }}</div>
        </div>

        <!-- Actions -->
        <div style="display:flex; border-top:1px solid #334155; flex-shrink:0;">
          <a :href="recursoUrl(r) || '#'" target="_blank" rel="noopener" style="flex:1; text-align:center; padding:8px 0; font-size:11px; color:#94a3b8; text-decoration:none; border-right:1px solid #334155;">Ver</a>
          <button v-if="puedeGestionar" @click="abrirForm(r)" style="flex:1; background:none; border:none; border-right:1px solid #334155; cursor:pointer; padding:8px 0; font-size:11px; color:#818cf8; font-family:inherit;">Editar</button>
          <button v-if="puedeGestionar" @click="confirmarEliminar(r)" style="flex:1; background:none; border:none; cursor:pointer; padding:8px 0; font-size:11px; color:#ef4444; font-family:inherit;">Eliminar</button>
        </div>
      </div>
    </div>

    <!-- Modal: Create / Edit -->
    <div v-if="dialogForm" class="cat-overlay" @click.self="dialogForm = false">
      <div class="cat-modal">
        <!-- Header -->
        <div style="display:flex; align-items:center; justify-content:space-between; padding:18px 22px 14px; border-bottom:1px solid #334155; flex-shrink:0;">
          <span style="font-size:15px; font-weight:700; color:#f1f5f9;">{{ editando ? 'Editar recurso' : 'Nuevo recurso' }}</span>
          <div style="display:flex; align-items:center; gap:10px;">
            <button v-if="editando" @click="confirmarEliminar(editando)" style="background:none; border:none; cursor:pointer; color:#ef4444; font-size:12px; font-family:inherit; display:flex; align-items:center; gap:4px;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>
              Eliminar
            </button>
            <button @click="dialogForm = false" style="background:none; border:none; cursor:pointer; color:#475569; padding:4px; border-radius:4px; line-height:0; display:flex;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </div>

        <!-- Body -->
        <div style="overflow-y:auto; padding:18px 22px; flex:1;">

          <!-- Toggle modo origen (solo al crear) -->
          <div v-if="!editando" style="display:flex; align-items:center; gap:10px; margin-bottom:16px;">
            <div class="ide-toggle" :class="{ 'ide-toggle--on': modoUrlExterna }" @click="modoUrlExterna = !modoUrlExterna"><div></div></div>
            <span style="font-size:12px; color:#94a3b8;">{{ modoUrlExterna ? 'Usando URL externa' : 'Subiendo archivo' }}</span>
          </div>

          <!-- Modo archivo -->
          <div v-if="!editando && !modoUrlExterna" style="margin-bottom:16px;">
            <div v-if="!archivoSeleccionado" style="margin-bottom:10px; font-size:10px; color:#64748b; display:flex; gap:10px; flex-wrap:wrap;">
              <span v-for="t in TIPOS" :key="t">{{ ICONOS[t] }} {{ t }}: máx {{ formatearBytes(LIMITES[t]) }}</span>
            </div>
            <label class="img-upload-zone" :class="{ 'img-upload-zone--drag': dragging }" @dragover.prevent="dragging = true" @dragleave="dragging = false" @drop.prevent="onDrop">
              <input type="file" :accept="mimesAceptados" style="display:none;" @change="onFileChange" />
              <template v-if="!archivoSeleccionado">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="1.5" style="margin-bottom:4px;"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                <span style="font-size:12px; color:#64748b;">Arrastra o <span style="color:#818cf8;">selecciona un archivo</span></span>
                <span style="font-size:10px; color:#475569; margin-top:2px;">PDF, imagen, audio o video</span>
              </template>
              <template v-else>
                <img v-if="tipoDetectado === 'IMAGEN'" :src="previewUrl" style="max-width:100%; max-height:100px; border-radius:6px; margin-bottom:6px;" />
                <video v-else-if="tipoDetectado === 'VIDEO'" :src="previewUrl" controls style="max-width:100%; max-height:100px; margin-bottom:6px;" />
                <audio v-else-if="tipoDetectado === 'AUDIO'" :src="previewUrl" controls style="margin-bottom:6px;" />
                <span v-else style="font-size:28px; margin-bottom:4px;">{{ ICONOS[tipoDetectado] || '📎' }}</span>
                <span style="font-size:12px; color:#e2e8f0; font-weight:600;">{{ archivoSeleccionado.name }}</span>
                <span style="font-size:10px; color:#64748b; margin-top:2px;">{{ formatearBytes(archivoSeleccionado.size) }} · cambiar archivo</span>
              </template>
            </label>
            <div v-if="errorArchivo" style="margin-top:8px; font-size:11px; color:#ef4444;">{{ errorArchivo }}</div>
          </div>

          <!-- Modo URL externa -->
          <div v-if="!editando && modoUrlExterna" style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:16px;">
            <div class="ide-field" style="grid-column:span 2;">
              <label>URL del archivo *</label>
              <input v-model="form.urlExterna" class="ide-input" placeholder="https://…" />
            </div>
            <div class="ide-field">
              <label>Tipo de recurso *</label>
              <select v-model="form.tipo" class="ide-select">
                <option value="" disabled>Selecciona…</option>
                <option v-for="t in TIPOS" :key="t" :value="t">{{ ICONOS[t] }} {{ t }}</option>
              </select>
            </div>
          </div>

          <!-- Editar: URL externa también editable si el recurso ya la usaba -->
          <div v-if="editando && editando.urlExterna" class="ide-field" style="margin-bottom:16px;">
            <label>URL del archivo</label>
            <input v-model="form.urlExterna" class="ide-input" placeholder="https://…" />
          </div>

          <!-- Metadata -->
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
            <div class="ide-field" style="grid-column:span 2;">
              <label>Nombre *</label>
              <input v-model="form.nombre" class="ide-input" placeholder="Ej: Catálogo de productos 2026" />
            </div>
            <div class="ide-field">
              <label>Categoría</label>
              <input v-model="form.categoria" class="ide-input" placeholder="catalogo, ficha técnica…" list="rec-categorias" />
              <datalist id="rec-categorias">
                <option v-for="c in categorias" :key="c" :value="c" />
              </datalist>
            </div>
            <div class="ide-field">
              <label>Agente</label>
              <select v-model="form.agenteId" class="ide-select">
                <option value="">Todos los agentes</option>
                <option v-for="a in agentes" :key="a.id" :value="a.id">{{ a.nombre }}</option>
              </select>
            </div>
            <div class="ide-field" style="grid-column:span 2;">
              <label>Keywords <span style="color:#475569; font-size:10px;">(separadas por coma, para búsqueda)</span></label>
              <input v-model="form.keywords" class="ide-input" placeholder="catalogo, precios, 2026" />
            </div>
            <div class="ide-field" style="grid-column:span 2;">
              <label>Descripción</label>
              <textarea v-model="form.descripcion" class="ide-textarea" rows="3" placeholder="Cuándo debe usarse este recurso…"></textarea>
            </div>
            <div v-if="editando" class="ide-field" style="grid-column:span 2; flex-direction:row; align-items:center; gap:10px;">
              <div class="ide-toggle" :class="{ 'ide-toggle--on': form.activo }" @click="form.activo = !form.activo"><div></div></div>
              <span style="font-size:12px;" :style="{ color: form.activo ? '#22c55e' : '#64748b' }">{{ form.activo ? 'Recurso activo' : 'Recurso inactivo' }}</span>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div style="display:flex; justify-content:flex-end; gap:8px; padding:12px 22px 18px; border-top:1px solid #334155; flex-shrink:0;">
          <button @click="dialogForm = false" style="background:none; border:1px solid #334155; border-radius:8px; color:#64748b; padding:8px 16px; font-size:12px; cursor:pointer; font-family:inherit;">Cancelar</button>
          <button @click="guardar" :disabled="saving" style="background:#6366f1; color:#fff; border:none; border-radius:8px; padding:8px 18px; font-size:12px; font-weight:600; cursor:pointer; font-family:inherit; display:flex; align-items:center; gap:6px;">
            <v-progress-circular v-if="saving" indeterminate size="14" width="2" color="white" />
            {{ editando ? 'Guardar cambios' : 'Crear recurso' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal: Delete confirm -->
    <div v-if="dialogEliminar" class="cat-overlay" @click.self="dialogEliminar = false">
      <div style="background:#1e293b; border:1px solid #334155; border-radius:12px; width:420px; max-width:95%; padding:24px;">
        <div style="font-size:15px; font-weight:700; color:#f1f5f9; margin-bottom:8px;">Eliminar recurso</div>
        <div style="font-size:12px; color:#94a3b8; line-height:1.6; margin-bottom:20px;">
          ¿Estás seguro de que deseas eliminar
          <strong style="color:#f1f5f9;">{{ eliminando ? eliminando.nombre : '' }}</strong>?
          El archivo se eliminará del servidor.
        </div>
        <div style="display:flex; justify-content:flex-end; gap:8px;">
          <button @click="dialogEliminar = false" style="background:none; border:1px solid #334155; border-radius:8px; color:#64748b; padding:8px 14px; font-size:12px; cursor:pointer; font-family:inherit;">Cancelar</button>
          <button @click="eliminar" :disabled="deleting" style="background:#ef4444; color:#fff; border:none; border-radius:8px; padding:8px 14px; font-size:12px; font-weight:600; cursor:pointer; font-family:inherit; display:flex; align-items:center; gap:6px;">
            <v-progress-circular v-if="deleting" indeterminate size="14" width="2" color="white" />
            Eliminar
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
const TIPOS = ['PDF', 'IMAGEN', 'AUDIO', 'VIDEO'];

const MIMES = {
  PDF: ['application/pdf'],
  IMAGEN: ['image/jpeg', 'image/png', 'image/webp'],
  AUDIO: ['audio/mpeg', 'audio/mp4', 'audio/ogg', 'audio/aac', 'audio/amr'],
  VIDEO: ['video/mp4', 'video/3gpp'],
};

// Límites reales de la WhatsApp Cloud API (backend/src/core/recurso/recurso.constants.ts)
const LIMITES = {
  PDF: 100 * 1024 * 1024,
  IMAGEN: 5 * 1024 * 1024,
  AUDIO: 16 * 1024 * 1024,
  VIDEO: 16 * 1024 * 1024,
};

const ICONOS = { PDF: '📄', IMAGEN: '🖼️', AUDIO: '🎵', VIDEO: '🎬' };

const detectarTipo = (mime) => Object.entries(MIMES).find(([, mimes]) => mimes.includes(mime))?.[0] || null;

const formatearBytes = (bytes) => {
  if (bytes == null) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default {
  name: 'Recursos',
  data() {
    return {
      TIPOS,
      MIMES,
      LIMITES,
      ICONOS,
      recursos: [],
      agentes: [],
      loading: false,
      saving: false,
      deleting: false,
      dragging: false,
      busqueda: '',
      tipoFiltro: '',
      categoriaFiltro: '',
      dialogForm: false,
      dialogEliminar: false,
      editando: null,
      eliminando: null,
      modoUrlExterna: false,
      archivoSeleccionado: null,
      previewUrl: null,
      errorArchivo: '',
      verVideo: null,
      form: {
        nombre: '', categoria: '', keywords: '', descripcion: '',
        agenteId: '', urlExterna: '', activo: true, tipo: '',
      },
    };
  },
  computed: {
    currentUser() { return this.$store.getters.currentUser || this.$storage.get('user') || {}; },
    userRol() { return this.currentUser?.rol || 'USER'; },
    puedeGestionar() { return ['SUPER_ADMIN', 'ADMIN_CLIENTE'].includes(this.userRol); },
    categorias() {
      return [...new Set(this.recursos.filter(r => r.categoria).map(r => r.categoria))].sort();
    },
    recursosFiltrados() {
      const q = this.busqueda.trim().toLowerCase();
      return this.recursos.filter(r =>
        (!this.tipoFiltro || r.tipo === this.tipoFiltro) &&
        (!this.categoriaFiltro || r.categoria === this.categoriaFiltro) &&
        (!q ||
          r.nombre.toLowerCase().includes(q) ||
          (r.categoria || '').toLowerCase().includes(q) ||
          (r.keywords || []).some(k => k.toLowerCase().includes(q))),
      );
    },
    tipoDetectado() {
      if (!this.archivoSeleccionado) return null;
      return detectarTipo(this.archivoSeleccionado.type);
    },
    mimesAceptados() {
      return Object.values(MIMES).flat().join(',');
    },
  },
  async mounted() {
    await Promise.all([this.cargar(), this.cargarAgentes()]);
  },
  methods: {
    formatearBytes,
    contarTipo(tipo) {
      return this.recursos.filter(r => r.tipo === tipo).length;
    },
    async cargar() {
      this.loading = true;
      try {
        this.recursos = await this.$service.list('recursos') || [];
      } finally {
        this.loading = false;
      }
    },
    async cargarAgentes() {
      this.agentes = await this.$service.list('agentes') || [];
    },
    recursoUrl(r) {
      if (r.urlExterna) return r.urlExterna;
      if (!r.archivoLocal) return null;
      const base = (process.env.VUE_APP_BASE_SERVER || 'http://localhost:3001/api/').replace(/\/api\/?$/, '');
      return `${base}/uploads/recursos/${r.clienteId}/${r.archivoLocal}`;
    },
    abrirForm(recurso) {
      this.editando = recurso || null;
      this.modoUrlExterna = false;
      this.archivoSeleccionado = null;
      this.errorArchivo = '';
      this.verVideo = null;
      if (this.previewUrl) URL.revokeObjectURL(this.previewUrl);
      this.previewUrl = null;
      this.form = recurso
        ? {
            nombre: recurso.nombre || '', categoria: recurso.categoria || '',
            keywords: (recurso.keywords || []).join(', '), descripcion: recurso.descripcion || '',
            agenteId: recurso.agenteId || '', urlExterna: recurso.urlExterna || '',
            activo: recurso.activo, tipo: recurso.tipo || '',
          }
        : { nombre: '', categoria: '', keywords: '', descripcion: '', agenteId: '', urlExterna: '', activo: true, tipo: '' };
      this.dialogForm = true;
    },
    onFileChange(e) {
      this.setArchivo(e.target.files?.[0]);
      e.target.value = '';
    },
    onDrop(e) {
      this.dragging = false;
      this.setArchivo(e.dataTransfer.files?.[0]);
    },
    setArchivo(file) {
      if (!file) return;
      this.errorArchivo = '';
      const tipo = detectarTipo(file.type);
      if (!tipo) {
        this.errorArchivo = `Tipo de archivo no permitido: ${file.type || 'desconocido'}`;
        return;
      }
      if (file.size > LIMITES[tipo]) {
        this.errorArchivo = `El archivo pesa ${formatearBytes(file.size)}, el límite para ${tipo} es ${formatearBytes(LIMITES[tipo])}.`;
        return;
      }
      if (this.previewUrl) URL.revokeObjectURL(this.previewUrl);
      this.archivoSeleccionado = file;
      this.previewUrl = URL.createObjectURL(file);
    },
    async guardar() {
      if (!this.form.nombre) { this.$message.error('El nombre es obligatorio'); return; }

      if (!this.editando) {
        if (this.modoUrlExterna) {
          if (!this.form.urlExterna) { this.$message.error('Indica la URL del archivo'); return; }
          if (!this.form.tipo) { this.$message.error('Selecciona el tipo de recurso'); return; }
        } else if (!this.archivoSeleccionado) {
          this.$message.error('Selecciona un archivo'); return;
        }
      }

      this.saving = true;
      try {
        if (this.editando) {
          const payload = {
            nombre: this.form.nombre,
            categoria: this.form.categoria || undefined,
            keywords: this.form.keywords,
            descripcion: this.form.descripcion || undefined,
            agenteId: this.form.agenteId || undefined,
            urlExterna: this.editando.urlExterna ? (this.form.urlExterna || undefined) : undefined,
            activo: this.form.activo,
          };
          const actualizado = await this.$service.put(`recursos/${this.editando.id}`, payload);
          const idx = this.recursos.findIndex(r => r.id === this.editando.id);
          if (idx !== -1) this.recursos.splice(idx, 1, Object.assign({}, this.recursos[idx], actualizado));
          this.$message.success('Recurso actualizado');
          this.dialogForm = false;
        } else {
          const fd = new FormData();
          fd.append('nombre', this.form.nombre);
          if (this.form.categoria) fd.append('categoria', this.form.categoria);
          if (this.form.keywords) fd.append('keywords', this.form.keywords);
          if (this.form.descripcion) fd.append('descripcion', this.form.descripcion);
          if (this.form.agenteId) fd.append('agenteId', this.form.agenteId);
          if (this.modoUrlExterna) {
            fd.append('urlExterna', this.form.urlExterna);
            fd.append('tipo', this.form.tipo);
          } else {
            fd.append('archivo', this.archivoSeleccionado);
          }
          const res = await this.$http.post(`${this.$baseServer}recursos`, fd, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          const creado = res.data && res.data.datos;
          if (creado) this.recursos.unshift(creado);
          this.$message.success('Recurso creado');
          this.dialogForm = false;
        }
      } catch (e) {
        // el interceptor de axios ya muestra el mensaje de error del backend
      } finally {
        this.saving = false;
      }
    },
    confirmarEliminar(r) {
      this.eliminando = r;
      this.dialogEliminar = true;
    },
    async eliminar() {
      this.deleting = true;
      try {
        await this.$service.delete(`recursos/${this.eliminando.id}`);
        this.recursos = this.recursos.filter(r => r.id !== this.eliminando.id);
        this.$message.success('Recurso eliminado');
        this.dialogEliminar = false;
        this.dialogForm = false;
        this.editando = null;
      } finally {
        this.deleting = false;
      }
    },
  },
};
</script>

<style scoped>
.rec-card { transition: transform 0.15s, box-shadow 0.15s; }
.rec-card:hover { transform: translateY(-2px); box-shadow: 0 6px 24px #00000055; }

.btn-add {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #6366f1;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 9px 16px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  flex-shrink: 0;
  transition: background 0.15s;
}
.btn-add:hover { background: #4f46e5; }

.img-upload-zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  border: 2px dashed #334155;
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}
.img-upload-zone:hover,
.img-upload-zone--drag {
  border-color: #818cf8;
  background: #6366f108;
}

.cat-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.65);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}
.cat-modal {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 12px;
  width: 680px;
  max-width: 95vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
</style>
