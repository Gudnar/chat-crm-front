<template>
  <div class="pw-content">
    <div class="pw-page-hd">
      <div>
        <h2 class="pw-page-title">Plantillas de WhatsApp</h2>
        <p class="pw-page-sub">Mensajes pre-aprobados por Meta para escribir fuera de la ventana de 24 horas</p>
      </div>
      <button class="pw-btn-new" @click="abrirModal()">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Nueva plantilla
      </button>
    </div>

    <div v-if="loading" style="display:flex;justify-content:center;padding:40px;">
      <v-progress-circular indeterminate color="primary" size="28"/>
    </div>
    <div v-else-if="plantillas.length === 0" class="pw-empty">
      <div style="font-size:32px;margin-bottom:12px;">📄</div>
      <div style="font-size:14px;font-weight:700;color:var(--text-primary);margin-bottom:6px;">Sin plantillas aún</div>
      <div style="font-size:12px;color:var(--text-faint);">Crea una plantilla para poder escribirle a un contacto después de 24h sin respuesta</div>
      <button class="pw-btn-new" style="margin-top:16px;" @click="abrirModal()">+ Crear plantilla</button>
    </div>
    <div v-else class="pw-table-wrap">
      <table class="pw-table">
        <thead>
          <tr>
            <th>Plantilla</th>
            <th>Categoría</th>
            <th>Idioma</th>
            <th>Estado</th>
            <th>Creada</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in plantillas" :key="p.id">
            <td>
              <div style="font-size:13px;font-weight:700;color:var(--text-primary);font-family:monospace;">{{ p.nombre }}</div>
              <div style="font-size:11px;color:var(--text-faint);margin-top:2px;max-width:340px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">{{ p.componentes.body.texto }}</div>
              <div v-if="p.estadoPlantilla === 'rechazada' && p.motivoRechazo" style="font-size:10px;color:#ef4444;margin-top:3px;" :title="p.motivoRechazo">Motivo: {{ p.motivoRechazo }}</div>
            </td>
            <td><span class="pw-badge">{{ categoriaLabel(p.categoria) }}</span></td>
            <td><span style="font-size:12px;color:var(--text-faint);">{{ p.idioma }}</span></td>
            <td>
              <span class="pw-estado" :class="'pw-estado--'+p.estadoPlantilla">
                <span class="pw-estado-dot"></span>
                {{ estadoLabel(p.estadoPlantilla) }}
              </span>
            </td>
            <td><span style="font-size:11px;color:var(--text-faint);">{{ formatDate(p.fechaCreacion) }}</span></td>
            <td>
              <div style="display:flex;gap:4px;">
                <button class="pw-ico-btn" title="Sincronizar estado con Meta" :disabled="sincronizandoId === p.id" @click="sincronizar(p)">
                  <v-progress-circular v-if="sincronizandoId === p.id" indeterminate size="12" width="2" color="#22c55e"/>
                  <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>
                </button>
                <button class="pw-ico-btn pw-ico-btn--del" title="Eliminar" @click="eliminar(p)">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal nueva plantilla -->
    <transition name="modal-fade">
      <div v-if="dialog" class="pw-modal-bd" @mousedown.self="dialog = false">
        <div class="pw-modal">
          <div class="pw-modal-hd">
            <span>Nueva plantilla</span>
            <button class="pw-modal-close" @click="dialog = false">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="pw-modal-body">
            <div class="pw-modal-cols">
              <!-- Columna izquierda: formulario -->
              <div class="pw-form-col">
                <div class="pw-field">
                  <label>Nombre *</label>
                  <input v-model="form.nombre" class="ide-input" placeholder="ej: recordatorio_captura" maxlength="100" @input="form.nombre = form.nombre.toLowerCase().replace(/[^a-z0-9_]/g, '_')"/>
                  <div style="font-size:10px;color:var(--text-disabled);margin-top:3px;">Solo minúsculas, números y guion bajo — no se puede cambiar luego de creada</div>
                </div>

                <div style="display:flex;gap:10px;">
                  <div class="pw-field" style="flex:1;">
                    <label>Categoría *</label>
                    <select v-model="form.categoria" class="ide-select">
                      <option value="UTILITY">Utilidad (UTILITY)</option>
                      <option value="MARKETING">Marketing</option>
                      <option value="AUTHENTICATION">Autenticación</option>
                    </select>
                  </div>
                  <div class="pw-field" style="flex:1;">
                    <label>Idioma *</label>
                    <select v-model="form.idioma" class="ide-select">
                      <option value="es">Español (es)</option>
                      <option value="es_MX">Español México (es_MX)</option>
                      <option value="en_US">Inglés (en_US)</option>
                      <option value="pt_BR">Portugués (pt_BR)</option>
                    </select>
                  </div>
                </div>

                <div class="pw-field">
                  <label>
                    <input type="checkbox" v-model="form.incluirHeader" style="margin-right:6px;"/>
                    Incluir encabezado (texto corto arriba del mensaje)
                  </label>
                  <input v-if="form.incluirHeader" v-model="form.headerTexto" class="ide-input" placeholder="Ej: Recordatorio de cita" maxlength="60" style="margin-top:6px;"/>
                </div>

                <div class="pw-field">
                  <label>Mensaje (body) *</label>
                  <textarea v-model="form.bodyTexto" class="ide-textarea" rows="4" maxlength="1024" :placeholder="`Ej: Hola ${llave(1)}, notamos que dejaste pendiente tu reserva. ¿Deseas continuar?`"></textarea>
                  <div style="font-size:10px;color:var(--text-disabled);margin-top:3px;">Usa {{ llave(1) }}, {{ llave(2) }}... para variables que se reemplazan al enviar. {{ form.bodyTexto.length }}/1024</div>
                </div>

                <div v-if="placeholders.length" class="pw-field">
                  <label>Ejemplos para cada variable (Meta los exige para aprobar)</label>
                  <div v-for="(n, idx) in placeholders" :key="n" style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
                    <span style="font-size:11px;color:var(--text-faint);width:24px;">{{ llave(n) }}</span>
                    <input v-model="form.bodyEjemplos[idx]" class="ide-input" :placeholder="'Valor de ejemplo ' + n" maxlength="80"/>
                  </div>
                </div>

                <div class="pw-field">
                  <label>Pie de página (opcional)</label>
                  <input v-model="form.footerTexto" class="ide-input" placeholder="Ej: Este mensaje es automático" maxlength="60"/>
                </div>

                <div class="pw-field">
                  <label>Botones (opcional, máx. 3)</label>
                  <div v-for="(b, idx) in form.botones" :key="idx" class="pw-boton-row">
                    <select v-model="b.tipo" class="ide-select" style="width:130px;">
                      <option value="QUICK_REPLY">Respuesta rápida</option>
                      <option value="URL">Enlace</option>
                      <option value="PHONE_NUMBER">Llamar</option>
                    </select>
                    <input v-model="b.texto" class="ide-input" placeholder="Texto del botón" maxlength="25" style="flex:1;"/>
                    <input v-if="b.tipo === 'URL'" v-model="b.url" class="ide-input" placeholder="https://..." style="flex:1;"/>
                    <input v-if="b.tipo === 'PHONE_NUMBER'" v-model="b.telefono" class="ide-input" placeholder="+591..." style="flex:1;"/>
                    <button class="pw-ico-btn pw-ico-btn--del" @click="form.botones.splice(idx, 1)">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </div>
                  <button v-if="form.botones.length < 3" class="pw-btn-ghost" style="margin-top:4px;" @click="form.botones.push({ tipo: 'QUICK_REPLY', texto: '', url: '', telefono: '' })">+ Agregar botón</button>
                </div>
              </div>

              <!-- Columna derecha: preview -->
              <div class="pw-preview-col">
                <div style="font-size:11px;font-weight:700;color:var(--text-faint);margin-bottom:8px;text-transform:uppercase;letter-spacing:0.4px;">Vista previa</div>
                <div class="pw-preview-bubble">
                  <div v-if="form.incluirHeader && form.headerTexto" class="pw-preview-header">{{ form.headerTexto }}</div>
                  <div class="pw-preview-body">{{ previewBody || 'Escribe el mensaje...' }}</div>
                  <div v-if="form.footerTexto" class="pw-preview-footer">{{ form.footerTexto }}</div>
                  <div v-if="form.botones.length" class="pw-preview-botones">
                    <div v-for="(b, idx) in form.botones" :key="idx" class="pw-preview-boton">{{ b.texto || '(sin texto)' }}</div>
                  </div>
                </div>
                <div class="pw-preview-hint">Meta revisa el contenido en 24-48h. Evita mayúsculas excesivas y lenguaje promocional agresivo en categoría Utilidad.</div>
              </div>
            </div>
          </div>
          <div class="pw-modal-ft">
            <button class="pw-btn-ghost" @click="dialog = false">Cancelar</button>
            <button class="pw-btn-ok" :disabled="!formValido || guardando" @click="guardar">
              <v-progress-circular v-if="guardando" indeterminate size="12" width="2" color="white"/>
              <span v-else>Enviar a revisión</span>
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
function formVacio() {
  return {
    nombre: '', categoria: 'UTILITY', idioma: 'es',
    incluirHeader: false, headerTexto: '',
    bodyTexto: '', bodyEjemplos: [],
    footerTexto: '', botones: [],
  };
}

export default {
  name: 'Plantillas',
  data: () => ({
    loading: false,
    dialog: false,
    guardando: false,
    sincronizandoId: null,
    plantillas: [],
    form: formVacio(),
  }),
  computed: {
    placeholders() {
      const encontrados = new Set();
      const regex = /\{\{(\d+)\}\}/g;
      let m;
      while ((m = regex.exec(this.form.bodyTexto)) !== null) encontrados.add(Number(m[1]));
      return Array.from(encontrados).sort((a, b) => a - b);
    },
    previewBody() {
      let texto = this.form.bodyTexto;
      this.placeholders.forEach((n, idx) => {
        const ejemplo = this.form.bodyEjemplos[idx] || `{{${n}}}`;
        texto = texto.split(`{{${n}}}`).join(ejemplo);
      });
      return texto;
    },
    formValido() {
      return /^[a-z0-9_]+$/.test(this.form.nombre) && this.form.categoria && this.form.bodyTexto.trim().length > 0;
    },
  },
  watch: {
    'form.bodyTexto'() {
      const cantidad = this.placeholders.length;
      const ejemplos = this.form.bodyEjemplos.slice(0, cantidad);
      while (ejemplos.length < cantidad) ejemplos.push('');
      this.form.bodyEjemplos = ejemplos;
    },
  },
  async mounted() {
    await this.cargar();
  },
  methods: {
    llave(n) { return `{{${n}}}`; },

    async cargar() {
      this.loading = true;
      try { this.plantillas = await this.$service.list('plantillas-whatsapp') || []; }
      finally { this.loading = false; }
    },

    abrirModal() {
      this.form = formVacio();
      this.dialog = true;
    },

    async guardar() {
      if (!this.formValido) return;
      this.guardando = true;
      try {
        const componentes = {
          body: {
            texto: this.form.bodyTexto,
            ...(this.placeholders.length ? { ejemplos: this.form.bodyEjemplos } : {}),
          },
        };
        if (this.form.incluirHeader && this.form.headerTexto) {
          componentes.header = { tipo: 'text', texto: this.form.headerTexto };
        }
        if (this.form.footerTexto) componentes.footer = this.form.footerTexto;
        if (this.form.botones.length) {
          componentes.botones = this.form.botones.map(b => ({
            tipo: b.tipo, texto: b.texto,
            ...(b.tipo === 'URL' ? { url: b.url } : {}),
            ...(b.tipo === 'PHONE_NUMBER' ? { telefono: b.telefono } : {}),
          }));
        }

        await this.$service.post('plantillas-whatsapp', {
          nombre: this.form.nombre, categoria: this.form.categoria, idioma: this.form.idioma, componentes,
        });
        this.$message.success('Plantilla enviada a revisión de Meta');
        this.dialog = false;
        await this.cargar();
      } finally { this.guardando = false; }
    },

    async sincronizar(p) {
      this.sincronizandoId = p.id;
      try {
        await this.$service.post(`plantillas-whatsapp/${p.id}/sincronizar`, {});
        this.$message.success('Estado sincronizado');
        await this.cargar();
      } finally { this.sincronizandoId = null; }
    },

    eliminar(p) {
      this.$confirm(`¿Eliminar la plantilla "${p.nombre}"?`, async () => {
        await this.$service.delete(`plantillas-whatsapp/${p.id}`);
        this.$message.success('Plantilla eliminada');
        await this.cargar();
      });
    },

    categoriaLabel(c) {
      return { UTILITY: 'Utilidad', MARKETING: 'Marketing', AUTHENTICATION: 'Autenticación' }[c] || c;
    },
    estadoLabel(e) {
      return { pendiente_meta: 'En revisión', aprobada: 'Aprobada', rechazada: 'Rechazada', pausada: 'Pausada' }[e] || e;
    },
    formatDate(d) {
      if (!d) return '—';
      return new Date(d).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' });
    },
  },
};
</script>

<style scoped>
.pw-content { flex:1; display:flex; flex-direction:column; overflow-y:auto; padding:24px; height:100%; background:var(--bg-panel); }
.pw-page-hd { display:flex; align-items:center; justify-content:space-between; margin-bottom:20px; flex-wrap:wrap; gap:10px; }
.pw-page-title { font-size:22px; font-weight:900; color:var(--text-heading); letter-spacing:-0.5px; margin:0 0 4px; }
.pw-page-sub { font-size:12px; color:var(--text-faint); margin:0; }

.pw-btn-new { display:flex; align-items:center; gap:7px; padding:8px 16px; border-radius:9px; background:#25d366; border:none; color:#fff; font-size:12px; font-weight:700; cursor:pointer; font-family:inherit; transition:all 0.15s; }
.pw-btn-new:hover { background:#1ebe5a; }
.pw-btn-ghost { padding:8px 16px; border-radius:8px; border:1px solid var(--border); background:none; color:var(--text-faint); font-size:12px; font-weight:600; cursor:pointer; font-family:inherit; transition:all 0.15s; }
.pw-btn-ghost:hover { color:var(--text-muted); }
.pw-btn-ok { display:flex; align-items:center; gap:6px; padding:8px 20px; border-radius:8px; border:none; background:#25d366; color:#fff; font-size:12px; font-weight:700; cursor:pointer; font-family:inherit; transition:all 0.15s; min-width:140px; justify-content:center; }
.pw-btn-ok:hover:not(:disabled) { background:#1ebe5a; }
.pw-btn-ok:disabled { opacity:0.5; cursor:not-allowed; }

.pw-ico-btn { width:28px; height:28px; border-radius:6px; border:1px solid var(--border-card); background:var(--bg-page); color:var(--text-faint); display:flex; align-items:center; justify-content:center; cursor:pointer; transition:all 0.15s; flex-shrink:0; }
.pw-ico-btn:hover { color:var(--text-muted); border-color:var(--border); }
.pw-ico-btn:disabled { opacity:0.4; cursor:not-allowed; }
.pw-ico-btn--del:hover { color:#ef4444; border-color:#ef444433; }

.pw-badge { font-size:10px; font-weight:700; padding:3px 8px; border-radius:999px; background:var(--bg-page); color:var(--text-faint); border:1px solid var(--border); }

.pw-estado { display:inline-flex; align-items:center; gap:5px; font-size:11px; font-weight:700; padding:3px 9px; border-radius:999px; }
.pw-estado--pendiente_meta { background:#f59e0b22; color:#f59e0b; }
.pw-estado--aprobada { background:#22c55e22; color:#22c55e; }
.pw-estado--rechazada { background:#ef444422; color:#ef4444; }
.pw-estado--pausada { background:#94a3b822; color:#94a3b8; }
.pw-estado-dot { width:5px; height:5px; border-radius:50%; background:currentColor; }

.pw-table-wrap { overflow-x:auto; }
.pw-table { width:100%; border-collapse:collapse; }
.pw-table thead tr { background:var(--bg-panel); }
.pw-table th { padding:8px 12px; text-align:left; font-size:10px; font-weight:700; color:var(--text-faint); text-transform:uppercase; letter-spacing:0.5px; border-bottom:1px solid var(--border); white-space:nowrap; }
.pw-table td { padding:10px 12px; border-bottom:1px solid var(--border-card); vertical-align:middle; }
.pw-table tbody tr:hover { background:color-mix(in srgb, var(--bg-surface) 13%, transparent); }

.pw-empty { text-align:center; padding:60px 20px; color:var(--text-faint); }

.pw-modal-bd { position:fixed; inset:0; background:#000000aa; display:flex; align-items:center; justify-content:center; z-index:1000; }
.pw-modal { background:var(--bg-panel); border:1px solid color-mix(in srgb, var(--border-card) 40%, transparent); border-radius:14px; width:760px; max-width:95vw; max-height:90vh; display:flex; flex-direction:column; overflow:hidden; }
.pw-modal-hd { display:flex; align-items:center; justify-content:space-between; padding:16px 20px; border-bottom:1px solid var(--border-card); font-size:14px; font-weight:800; color:var(--text-heading); flex-shrink:0; }
.pw-modal-close { background:none; border:none; color:var(--text-faint); cursor:pointer; display:flex; padding:2px; }
.pw-modal-close:hover { color:var(--text-muted); }
.pw-modal-body { flex:1; overflow-y:auto; padding:20px; }
.pw-modal-ft { padding:14px 20px; border-top:1px solid var(--border-card); display:flex; justify-content:flex-end; gap:8px; flex-shrink:0; }

.pw-modal-cols { display:flex; gap:24px; }
.pw-form-col { flex:1.3; display:flex; flex-direction:column; gap:14px; min-width:0; }
.pw-preview-col { flex:1; min-width:0; }

.pw-field label { display:block; font-size:11px; font-weight:700; color:var(--text-muted); margin-bottom:5px; text-transform:uppercase; letter-spacing:0.4px; }

.pw-boton-row { display:flex; align-items:center; gap:6px; margin-bottom:6px; }

.pw-preview-bubble { background:#e5ddd5; border-radius:10px; padding:14px; }
.pw-preview-header { font-weight:800; font-size:13px; color:#111; margin-bottom:6px; }
.pw-preview-body { font-size:13px; color:#111; line-height:1.5; white-space:pre-wrap; word-break:break-word; }
.pw-preview-footer { font-size:11px; color:#667781; margin-top:8px; }
.pw-preview-botones { margin-top:10px; border-top:1px solid #00000014; padding-top:8px; display:flex; flex-direction:column; gap:6px; }
.pw-preview-boton { text-align:center; font-size:12px; font-weight:700; color:#00a5f4; background:#fff; border-radius:6px; padding:6px; }
.pw-preview-hint { font-size:10px; color:var(--text-disabled); margin-top:10px; line-height:1.5; }

.modal-fade-enter-active, .modal-fade-leave-active { transition:opacity 0.2s ease; }
.modal-fade-enter, .modal-fade-leave-to { opacity:0; }

@media (max-width: 700px) {
  .pw-modal-cols { flex-direction:column; }
}
</style>
