<template>
  <div class="fw-content">
    <div class="fw-page-hd">
      <div>
        <h2 class="fw-page-title">Flows de WhatsApp</h2>
        <p class="fw-page-sub">Formularios nativos de una sola pantalla (varios campos de una vez, sin ida y vuelta)</p>
      </div>
      <button class="fw-btn-new" @click="abrirModal()">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Nuevo flow
      </button>
    </div>

    <div v-if="loading" style="display:flex;justify-content:center;padding:40px;">
      <v-progress-circular indeterminate color="primary" size="28"/>
    </div>
    <div v-else-if="flows.length === 0" class="fw-empty">
      <div style="font-size:32px;margin-bottom:12px;">📝</div>
      <div style="font-size:14px;font-weight:700;color:var(--text-primary);margin-bottom:6px;">Sin flows aún</div>
      <div style="font-size:12px;color:var(--text-faint);">Crea un formulario para capturar varios datos de una sola vez (reserva, encuesta, datos de contacto)</div>
      <button class="fw-btn-new" style="margin-top:16px;" @click="abrirModal()">+ Crear flow</button>
    </div>
    <div v-else class="fw-table-wrap">
      <table class="fw-table">
        <thead>
          <tr>
            <th>Flow</th>
            <th>Categoría</th>
            <th>Campos</th>
            <th>Estado</th>
            <th>Creado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="f in flows" :key="f.id">
            <td>
              <div style="font-size:13px;font-weight:700;color:var(--text-primary);font-family:monospace;">{{ f.nombre }}</div>
              <div style="font-size:11px;color:var(--text-faint);margin-top:2px;max-width:280px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">{{ f.mensajeCuerpo }}</div>
              <div v-if="f.estadoFlow === 'error_validacion' && f.erroresValidacion" style="font-size:10px;color:#ef4444;margin-top:3px;" :title="f.erroresValidacion">Errores de validación — ver detalle</div>
            </td>
            <td><span class="fw-badge">{{ categoriaLabel(f.categoria) }}</span></td>
            <td><span style="font-size:12px;color:var(--text-faint);">{{ f.campos.length }} campo{{ f.campos.length === 1 ? '' : 's' }}</span></td>
            <td>
              <span class="fw-estado" :class="'fw-estado--'+f.estadoFlow">
                <span class="fw-estado-dot"></span>
                {{ estadoLabel(f.estadoFlow) }}
              </span>
            </td>
            <td><span style="font-size:11px;color:var(--text-faint);">{{ formatDate(f.fechaCreacion) }}</span></td>
            <td>
              <div style="display:flex;gap:4px;">
                <button v-if="f.estadoFlow === 'borrador' || f.estadoFlow === 'error_validacion'" class="fw-ico-btn" title="Editar" @click="editar(f)">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button v-if="f.estadoFlow === 'borrador'" class="fw-ico-btn fw-ico-btn--pub" title="Publicar" :disabled="publicandoId === f.id" @click="publicar(f)">
                  <v-progress-circular v-if="publicandoId === f.id" indeterminate size="12" width="2" color="#22c55e"/>
                  <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                </button>
                <button class="fw-ico-btn" title="Vista previa" :disabled="previewId === f.id" @click="vistaPrevia(f)">
                  <v-progress-circular v-if="previewId === f.id" indeterminate size="12" width="2" color="#818cf8"/>
                  <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
                <button class="fw-ico-btn" title="Sincronizar estado con Meta" :disabled="sincronizandoId === f.id" @click="sincronizar(f)">
                  <v-progress-circular v-if="sincronizandoId === f.id" indeterminate size="12" width="2" color="#22c55e"/>
                  <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>
                </button>
                <button class="fw-ico-btn fw-ico-btn--del" title="Eliminar" @click="eliminar(f)">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal nuevo/editar flow -->
    <transition name="modal-fade">
      <div v-if="dialog" class="fw-modal-bd" @mousedown.self="cerrarModal">
        <div class="fw-modal">
          <div class="fw-modal-hd">
            <span>{{ editandoId ? 'Editar flow' : 'Nuevo flow' }}</span>
            <button class="fw-modal-close" @click="cerrarModal">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="fw-modal-body">
            <div class="fw-modal-cols">
              <!-- Columna izquierda: formulario -->
              <div class="fw-form-col">
                <div class="fw-field">
                  <label>Nombre interno *</label>
                  <input
                    v-model="form.nombre" class="ide-input" placeholder="ej: reserva_spa" maxlength="100"
                    :disabled="!!editandoId"
                    @input="form.nombre = form.nombre.toLowerCase().replace(/[^a-z0-9_]/g, '_')"
                  />
                  <div style="font-size:10px;color:var(--text-disabled);margin-top:3px;">
                    {{ editandoId ? 'No se puede cambiar luego de creado — el agente lo usa para elegir este flow.' : 'Solo minúsculas, números y guion bajo — el agente lo usa con iniciar_flow(nombre_flow: "...")' }}
                  </div>
                </div>

                <div style="display:flex;gap:10px;">
                  <div class="fw-field" style="flex:1;">
                    <label>Categoría *</label>
                    <select v-model="form.categoria" class="ide-select">
                      <option v-for="c in categorias" :key="c.valor" :value="c.valor">{{ c.label }}</option>
                    </select>
                  </div>
                  <div class="fw-field" style="flex:1;">
                    <label>Texto del botón (CTA)</label>
                    <input v-model="form.cta" class="ide-input" placeholder="Ej: Reservar" maxlength="20"/>
                  </div>
                </div>

                <div class="fw-field">
                  <label>Mensaje que acompaña el botón *</label>
                  <textarea v-model="form.mensajeCuerpo" class="ide-textarea" rows="2" maxlength="1024" placeholder="Ej: Completá tus datos para la reserva:"></textarea>
                </div>

                <div class="fw-field">
                  <label>Título de la pantalla</label>
                  <input v-model="form.screenTitle" class="ide-input" placeholder="Ej: Reserva" maxlength="100"/>
                </div>

                <div class="fw-field">
                  <label>Campos del formulario *</label>
                  <div v-for="(campo, idx) in form.campos" :key="idx" class="fw-campo-card">
                    <div class="fw-campo-row1">
                      <select v-model="campo.tipo" class="ide-select" style="width:150px;flex-shrink:0;">
                        <option v-for="t in tiposCampo" :key="t.valor" :value="t.valor">{{ t.label }}</option>
                      </select>
                      <input v-model="campo.etiqueta" class="ide-input" placeholder="Etiqueta visible, ej: Nombre completo" style="flex:1;"/>
                      <label class="fw-campo-check">
                        <input type="checkbox" v-model="campo.requerido"/> Obligatorio
                      </label>
                      <div class="fw-campo-mover">
                        <button class="fw-ico-btn" title="Mover arriba" :disabled="idx === 0" @click="moverCampo(idx, -1)">▲</button>
                        <button class="fw-ico-btn" title="Mover abajo" :disabled="idx === form.campos.length - 1" @click="moverCampo(idx, 1)">▼</button>
                        <button class="fw-ico-btn fw-ico-btn--del" title="Quitar campo" @click="quitarCampo(idx)">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                      </div>
                    </div>
                    <select v-if="campo.tipo === 'TextInput'" v-model="campo.inputType" class="ide-select" style="margin-top:6px;width:160px;">
                      <option value="text">Texto libre</option>
                      <option value="email">Email</option>
                      <option value="phone">Teléfono</option>
                      <option value="number">Número</option>
                    </select>
                    <textarea
                      v-if="['Dropdown', 'RadioButtonsGroup', 'CheckboxGroup'].includes(campo.tipo)"
                      v-model="campo.opcionesTexto" class="ide-textarea" rows="3" style="margin-top:6px;"
                      placeholder="Una opción por línea, ej:&#10;Mañana&#10;Tarde&#10;Noche"
                    ></textarea>
                  </div>
                  <button class="fw-btn-ghost" style="margin-top:4px;" @click="agregarCampo">+ Agregar campo</button>
                </div>
              </div>

              <!-- Columna derecha: preview -->
              <div class="fw-preview-col">
                <div style="font-size:11px;font-weight:700;color:var(--text-faint);margin-bottom:8px;text-transform:uppercase;letter-spacing:0.4px;">Vista previa</div>

                <div class="fw-preview-bubble">
                  <div class="fw-preview-body">{{ form.mensajeCuerpo || 'Escribe el mensaje...' }}</div>
                  <div class="fw-preview-boton">{{ form.cta || 'Comenzar' }}</div>
                </div>
                <div class="fw-preview-hint" style="margin-bottom:14px;">Esto es lo que el cliente ve primero en el chat — al tocar el botón se abre el formulario de abajo.</div>

                <div class="fw-preview-form">
                  <div class="fw-preview-form-title">{{ form.screenTitle || 'Formulario' }}</div>
                  <div v-for="(campo, idx) in form.campos" :key="idx" class="fw-preview-campo">
                    <label>{{ campo.etiqueta || '(sin etiqueta)' }}<span v-if="campo.requerido" style="color:#ef4444;"> *</span></label>
                    <input v-if="campo.tipo === 'TextInput'" disabled :type="tipoInputHtml(campo.inputType)" class="ide-input" placeholder="..."/>
                    <textarea v-if="campo.tipo === 'TextArea'" disabled class="ide-textarea" rows="2"></textarea>
                    <input v-if="campo.tipo === 'DatePicker'" disabled type="date" class="ide-input"/>
                    <select v-if="campo.tipo === 'Dropdown'" disabled class="ide-select">
                      <option v-for="(o, i2) in opcionesDe(campo)" :key="i2">{{ o }}</option>
                    </select>
                    <div v-if="campo.tipo === 'RadioButtonsGroup'">
                      <div v-for="(o, i2) in opcionesDe(campo)" :key="i2" class="fw-preview-opcion"><input type="radio" disabled/> {{ o }}</div>
                    </div>
                    <div v-if="campo.tipo === 'CheckboxGroup'">
                      <div v-for="(o, i2) in opcionesDe(campo)" :key="i2" class="fw-preview-opcion"><input type="checkbox" disabled/> {{ o }}</div>
                    </div>
                  </div>
                  <div v-if="!form.campos.length" style="font-size:11px;color:var(--text-disabled);">Agregá campos para ver el formulario acá.</div>
                  <div class="fw-preview-form-footer">Enviar</div>
                </div>
              </div>
            </div>
          </div>
          <div class="fw-modal-ft">
            <button class="fw-btn-ghost" @click="cerrarModal">Cancelar</button>
            <button class="fw-btn-ok" :disabled="!formValido || guardando" @click="guardar">
              <v-progress-circular v-if="guardando" indeterminate size="12" width="2" color="white"/>
              <span v-else>{{ editandoId ? 'Guardar cambios' : 'Guardar borrador' }}</span>
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
const TIPOS_CAMPO = [
  { valor: 'TextInput', label: 'Texto corto' },
  { valor: 'TextArea', label: 'Texto largo' },
  { valor: 'DatePicker', label: 'Fecha' },
  { valor: 'Dropdown', label: 'Lista desplegable' },
  { valor: 'RadioButtonsGroup', label: 'Opciones (botones)' },
  { valor: 'CheckboxGroup', label: 'Casillas (varias)' },
];

const CATEGORIAS = [
  { valor: 'SIGN_UP', label: 'Registro' },
  { valor: 'SIGN_IN', label: 'Inicio de sesión' },
  { valor: 'APPOINTMENT_BOOKING', label: 'Reserva de cita' },
  { valor: 'LEAD_GENERATION', label: 'Captación de leads' },
  { valor: 'CONTACT_US', label: 'Contacto' },
  { valor: 'CUSTOMER_SUPPORT', label: 'Soporte al cliente' },
  { valor: 'SURVEY', label: 'Encuesta' },
  { valor: 'OTHER', label: 'Otro' },
];

function campoVacio() {
  return { tipo: 'TextInput', etiqueta: '', requerido: true, inputType: 'text', opcionesTexto: '' };
}

function formVacio() {
  return {
    nombre: '', categoria: 'OTHER', cta: 'Comenzar', mensajeCuerpo: '', screenTitle: 'Formulario',
    campos: [campoVacio()],
  };
}

export default {
  name: 'Flows',
  data: () => ({
    loading: false,
    dialog: false,
    guardando: false,
    editandoId: null,
    publicandoId: null,
    sincronizandoId: null,
    previewId: null,
    flows: [],
    form: formVacio(),
    tiposCampo: TIPOS_CAMPO,
    categorias: CATEGORIAS,
  }),
  computed: {
    formValido() {
      if (!/^[a-z0-9_]+$/.test(this.form.nombre)) return false;
      if (!this.form.categoria || !this.form.mensajeCuerpo.trim()) return false;
      if (!this.form.campos.length) return false;
      const conOpciones = ['Dropdown', 'RadioButtonsGroup', 'CheckboxGroup'];
      return this.form.campos.every(c => {
        if (!c.etiqueta.trim()) return false;
        if (conOpciones.includes(c.tipo) && this.opcionesDe(c).length === 0) return false;
        return true;
      });
    },
  },
  async mounted() {
    await this.cargar();
  },
  methods: {
    opcionesDe(campo) {
      return (campo.opcionesTexto || '').split('\n').map(o => o.trim()).filter(Boolean);
    },
    tipoInputHtml(inputType) {
      return { text: 'text', email: 'email', phone: 'tel', number: 'number' }[inputType] || 'text';
    },
    slugify(texto, idx) {
      const base = texto.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
      return base || `campo_${idx + 1}`;
    },

    async cargar() {
      this.loading = true;
      try { this.flows = await this.$service.list('flows-whatsapp') || []; }
      finally { this.loading = false; }
    },

    abrirModal() {
      this.editandoId = null;
      this.form = formVacio();
      this.dialog = true;
    },

    editar(f) {
      this.editandoId = f.id;
      this.form = {
        nombre: f.nombre, categoria: f.categoria, cta: f.cta, mensajeCuerpo: f.mensajeCuerpo, screenTitle: f.screenTitle,
        campos: f.campos.map(c => ({ ...c, opcionesTexto: (c.opciones || []).join('\n') })),
      };
      this.dialog = true;
    },

    cerrarModal() {
      this.dialog = false;
    },

    agregarCampo() {
      this.form.campos.push(campoVacio());
    },

    quitarCampo(idx) {
      this.form.campos.splice(idx, 1);
    },

    moverCampo(idx, direccion) {
      const destino = idx + direccion;
      if (destino < 0 || destino >= this.form.campos.length) return;
      const campos = [...this.form.campos];
      [campos[idx], campos[destino]] = [campos[destino], campos[idx]];
      this.form.campos = campos;
    },

    async guardar() {
      if (!this.formValido) return;
      this.guardando = true;
      try {
        const campos = this.form.campos.map((c, idx) => ({
          tipo: c.tipo,
          nombre: this.slugify(c.etiqueta, idx),
          etiqueta: c.etiqueta,
          requerido: c.requerido,
          ...(c.tipo === 'TextInput' ? { inputType: c.inputType } : {}),
          ...(['Dropdown', 'RadioButtonsGroup', 'CheckboxGroup'].includes(c.tipo) ? { opciones: this.opcionesDe(c) } : {}),
        }));

        if (this.editandoId) {
          await this.$service.patch(`flows-whatsapp/${this.editandoId}`, {
            categoria: this.form.categoria, cta: this.form.cta, mensajeCuerpo: this.form.mensajeCuerpo, screenTitle: this.form.screenTitle, campos,
          });
          this.$message.success('Flow actualizado');
        } else {
          await this.$service.post('flows-whatsapp', {
            nombre: this.form.nombre, categoria: this.form.categoria, cta: this.form.cta, mensajeCuerpo: this.form.mensajeCuerpo, screenTitle: this.form.screenTitle, campos,
          });
          this.$message.success('Flow creado en borrador');
        }
        this.dialog = false;
        await this.cargar();
      } finally { this.guardando = false; }
    },

    async publicar(f) {
      this.publicandoId = f.id;
      try {
        await this.$service.post(`flows-whatsapp/${f.id}/publicar`, {});
        this.$message.success('Flow publicado');
        await this.cargar();
      } catch (e) {
        this.$message.error('Meta rechazó la publicación — sincronizá para ver el detalle');
      } finally { this.publicandoId = null; }
    },

    async sincronizar(f) {
      this.sincronizandoId = f.id;
      try {
        await this.$service.post(`flows-whatsapp/${f.id}/sincronizar`, {});
        this.$message.success('Estado sincronizado');
        await this.cargar();
      } finally { this.sincronizandoId = null; }
    },

    async vistaPrevia(f) {
      this.previewId = f.id;
      try {
        const datos = await this.$service.get('flows-whatsapp', `${f.id}/preview`);
        if (datos && datos.previewUrl) window.open(datos.previewUrl, '_blank');
        else this.$message.error('No se pudo obtener la vista previa');
      } finally { this.previewId = null; }
    },

    eliminar(f) {
      this.$confirm(`¿Eliminar el flow "${f.nombre}"?`, async () => {
        await this.$service.delete(`flows-whatsapp/${f.id}`);
        this.$message.success('Flow eliminado');
        await this.cargar();
      });
    },

    categoriaLabel(c) {
      return (CATEGORIAS.find(x => x.valor === c) || {}).label || c;
    },
    estadoLabel(e) {
      return { borrador: 'Borrador', publicado: 'Publicado', error_validacion: 'Error de validación', obsoleto: 'Obsoleto' }[e] || e;
    },
    formatDate(d) {
      if (!d) return '—';
      return new Date(d).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' });
    },
  },
};
</script>

<style scoped>
.fw-content { flex:1; display:flex; flex-direction:column; overflow-y:auto; padding:24px; height:100%; background:var(--bg-panel); }
.fw-page-hd { display:flex; align-items:center; justify-content:space-between; margin-bottom:20px; flex-wrap:wrap; gap:10px; }
.fw-page-title { font-size:22px; font-weight:900; color:var(--text-heading); letter-spacing:-0.5px; margin:0 0 4px; }
.fw-page-sub { font-size:12px; color:var(--text-faint); margin:0; }

.fw-btn-new { display:flex; align-items:center; gap:7px; padding:8px 16px; border-radius:9px; background:#25d366; border:none; color:#fff; font-size:12px; font-weight:700; cursor:pointer; font-family:inherit; transition:all 0.15s; }
.fw-btn-new:hover { background:#1ebe5a; }
.fw-btn-ghost { padding:8px 16px; border-radius:8px; border:1px solid var(--border); background:none; color:var(--text-faint); font-size:12px; font-weight:600; cursor:pointer; font-family:inherit; transition:all 0.15s; }
.fw-btn-ghost:hover { color:var(--text-muted); }
.fw-btn-ok { display:flex; align-items:center; gap:6px; padding:8px 20px; border-radius:8px; border:none; background:#25d366; color:#fff; font-size:12px; font-weight:700; cursor:pointer; font-family:inherit; transition:all 0.15s; min-width:150px; justify-content:center; }
.fw-btn-ok:hover:not(:disabled) { background:#1ebe5a; }
.fw-btn-ok:disabled { opacity:0.5; cursor:not-allowed; }

.fw-ico-btn { width:28px; height:28px; border-radius:6px; border:1px solid var(--border-card); background:var(--bg-page); color:var(--text-faint); display:flex; align-items:center; justify-content:center; cursor:pointer; transition:all 0.15s; flex-shrink:0; font-size:10px; }
.fw-ico-btn:hover { color:var(--text-muted); border-color:var(--border); }
.fw-ico-btn:disabled { opacity:0.4; cursor:not-allowed; }
.fw-ico-btn--del:hover { color:#ef4444; border-color:#ef444433; }
.fw-ico-btn--pub:hover { color:#22c55e; border-color:#22c55e33; }

.fw-badge { font-size:10px; font-weight:700; padding:3px 8px; border-radius:999px; background:var(--bg-page); color:var(--text-faint); border:1px solid var(--border); }

.fw-estado { display:inline-flex; align-items:center; gap:5px; font-size:11px; font-weight:700; padding:3px 9px; border-radius:999px; }
.fw-estado--borrador { background:#f59e0b22; color:#f59e0b; }
.fw-estado--publicado { background:#22c55e22; color:#22c55e; }
.fw-estado--error_validacion { background:#ef444422; color:#ef4444; }
.fw-estado--obsoleto { background:#94a3b822; color:#94a3b8; }
.fw-estado-dot { width:5px; height:5px; border-radius:50%; background:currentColor; }

.fw-table-wrap { overflow-x:auto; }
.fw-table { width:100%; border-collapse:collapse; }
.fw-table thead tr { background:var(--bg-panel); }
.fw-table th { padding:8px 12px; text-align:left; font-size:10px; font-weight:700; color:var(--text-faint); text-transform:uppercase; letter-spacing:0.5px; border-bottom:1px solid var(--border); white-space:nowrap; }
.fw-table td { padding:10px 12px; border-bottom:1px solid var(--border-card); vertical-align:middle; }
.fw-table tbody tr:hover { background:color-mix(in srgb, var(--bg-surface) 13%, transparent); }

.fw-empty { text-align:center; padding:60px 20px; color:var(--text-faint); }

.fw-modal-bd { position:fixed; inset:0; background:#000000aa; display:flex; align-items:center; justify-content:center; z-index:1000; }
.fw-modal { background:var(--bg-panel); border:1px solid color-mix(in srgb, var(--border-card) 40%, transparent); border-radius:14px; width:880px; max-width:95vw; max-height:90vh; display:flex; flex-direction:column; overflow:hidden; }
.fw-modal-hd { display:flex; align-items:center; justify-content:space-between; padding:16px 20px; border-bottom:1px solid var(--border-card); font-size:14px; font-weight:800; color:var(--text-heading); flex-shrink:0; }
.fw-modal-close { background:none; border:none; color:var(--text-faint); cursor:pointer; display:flex; padding:2px; }
.fw-modal-close:hover { color:var(--text-muted); }
.fw-modal-body { flex:1; overflow-y:auto; padding:20px; }
.fw-modal-ft { padding:14px 20px; border-top:1px solid var(--border-card); display:flex; justify-content:flex-end; gap:8px; flex-shrink:0; }

.fw-modal-cols { display:flex; gap:24px; }
.fw-form-col { flex:1.3; display:flex; flex-direction:column; gap:14px; min-width:0; }
.fw-preview-col { flex:1; min-width:0; }

.fw-field label { display:block; font-size:11px; font-weight:700; color:var(--text-muted); margin-bottom:5px; text-transform:uppercase; letter-spacing:0.4px; }

.fw-campo-card { border:1px solid var(--border-card); border-radius:8px; padding:10px; margin-bottom:8px; background:var(--bg-page); }
.fw-campo-row1 { display:flex; align-items:center; gap:6px; }
.fw-campo-check { display:flex; align-items:center; gap:4px; font-size:11px; color:var(--text-faint); white-space:nowrap; flex-shrink:0; text-transform:none; }
.fw-campo-mover { display:flex; gap:4px; flex-shrink:0; }

.fw-preview-bubble { background:#e5ddd5; border-radius:10px; padding:14px; }
.fw-preview-body { font-size:13px; color:#111; line-height:1.5; white-space:pre-wrap; word-break:break-word; margin-bottom:10px; }
.fw-preview-boton { text-align:center; font-size:12px; font-weight:700; color:#00a5f4; background:#fff; border-radius:6px; padding:8px; }
.fw-preview-hint { font-size:10px; color:var(--text-disabled); margin-top:8px; line-height:1.5; }

.fw-preview-form { background:#fff; border-radius:10px; padding:14px; border:1px solid var(--border-card); }
.fw-preview-form-title { font-size:14px; font-weight:800; color:#111; margin-bottom:12px; }
.fw-preview-campo { margin-bottom:10px; }
.fw-preview-campo label { display:block; font-size:11px; font-weight:600; color:#333; margin-bottom:4px; text-transform:none; }
.fw-preview-campo input, .fw-preview-campo textarea, .fw-preview-campo select { background:#f5f5f5; border:1px solid #ddd; border-radius:6px; padding:6px 8px; font-size:12px; width:100%; color:#333; }
.fw-preview-opcion { font-size:12px; color:#333; display:flex; align-items:center; gap:4px; margin-bottom:2px; }
.fw-preview-form-footer { text-align:center; font-size:12px; font-weight:700; color:#fff; background:#25d366; border-radius:6px; padding:8px; margin-top:12px; }

.modal-fade-enter-active, .modal-fade-leave-active { transition:opacity 0.2s ease; }
.modal-fade-enter, .modal-fade-leave-to { opacity:0; }

@media (max-width: 760px) {
  .fw-modal-cols { flex-direction:column; }
}
</style>
