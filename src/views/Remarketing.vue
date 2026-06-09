<template>
  <div class="rem-layout">

    <!-- Sub-nav lateral -->
    <div class="rem-subnav">
      <div class="rem-sn-hd">
        <div class="rem-sn-ico">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
        </div>
        <div>
          <div class="rem-sn-title">Remarketing</div>
          <div class="rem-sn-sub">Campañas programadas</div>
        </div>
      </div>

      <button v-for="s in secciones" :key="s.id" class="rem-sn-btn" :class="{ 'rem-sn-btn--active': seccion === s.id }" @click="seleccionarSeccion(s.id)">
        <span v-html="s.svg" style="flex-shrink:0;display:flex;"></span>
        {{ s.label }}
      </button>
    </div>

    <!-- Contenido principal -->
    <div class="rem-content">

      <!-- LISTA DE CAMPAÑAS -->
      <template v-if="seccion === 'campanas'">
        <div class="rem-page-hd">
          <div>
            <h2 class="rem-page-title">Campañas</h2>
            <p class="rem-page-sub">Programadas · En ejecución · Completadas</p>
          </div>
          <button class="rem-btn-new" @click="abrirModal()">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Nueva campaña
          </button>
        </div>

        <div v-if="loading" style="display:flex;justify-content:center;padding:40px;">
          <v-progress-circular indeterminate color="primary" size="28"/>
        </div>
        <div v-else-if="campanas.length === 0" class="rem-empty">
          <div style="font-size:32px;margin-bottom:12px;">📣</div>
          <div style="font-size:14px;font-weight:700;color:#e2e8f0;margin-bottom:6px;">Sin campañas aún</div>
          <div style="font-size:12px;color:#64748b;">Crea tu primera campaña de remarketing para reconectar con tus leads</div>
          <button class="rem-btn-new" style="margin-top:16px;" @click="abrirModal()">+ Crear campaña</button>
        </div>
        <div v-else class="rem-table-wrap">
          <table class="rem-table">
            <thead>
              <tr>
                <th>Campaña</th>
                <th>Tipo</th>
                <th>Segmento</th>
                <th>Programada para</th>
                <th>Estado</th>
                <th>Enviados</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="c in campanas" :key="c.id">
                <td>
                  <div style="font-size:13px;font-weight:700;color:#e2e8f0;">{{ c.nombre }}</div>
                  <div v-if="c.descripcion" style="font-size:11px;color:#64748b;margin-top:1px;">{{ c.descripcion }}</div>
                </td>
                <td>
                  <span class="rem-badge" :class="c.tipoMensaje === 'ia' ? 'rem-badge--ia' : 'rem-badge--fijo'">
                    {{ c.tipoMensaje === 'ia' ? '⚡ IA' : '📝 Fijo' }}
                  </span>
                </td>
                <td>
                  <div style="display:flex;align-items:center;gap:6px;">
                    <span class="rem-score-range" :style="scoreRangeStyle(c.scoreMin, c.scoreMax)">{{ c.scoreMin }}–{{ c.scoreMax }}</span>
                    <span style="font-size:10px;color:#64748b;">pts</span>
                  </div>
                </td>
                <td>
                  <div style="font-size:12px;color:#e2e8f0;">{{ formatDateTime(c.programadoEn) }}</div>
                  <div v-if="c.ejecutadoEn" style="font-size:10px;color:#64748b;">Ejecutada: {{ formatDateTime(c.ejecutadoEn) }}</div>
                </td>
                <td>
                  <span class="rem-estado" :class="'rem-estado--'+c.estadoCampana">
                    <span class="rem-estado-dot"></span>
                    {{ estadoLabel(c.estadoCampana) }}
                  </span>
                </td>
                <td>
                  <div v-if="c.estadoCampana === 'completado'" style="font-size:12px;color:#e2e8f0;">
                    <span style="color:#22c55e;font-weight:700;">{{ c.totalEnviados }}</span>
                    <span v-if="c.totalErrores > 0" style="color:#ef4444;"> / {{ c.totalErrores }} err</span>
                  </div>
                  <span v-else style="font-size:11px;color:#475569;">—</span>
                </td>
                <td>
                  <div style="display:flex;gap:4px;">
                    <button class="rem-ico-btn" title="Ver detalle" @click="verDetalle(c)">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    </button>
                    <button v-if="c.estadoCampana === 'pendiente'" class="rem-ico-btn rem-ico-btn--run" title="Ejecutar ahora" :disabled="ejecutandoId === c.id" @click="ejecutarAhora(c)">
                      <v-progress-circular v-if="ejecutandoId === c.id" indeterminate size="12" width="2" color="#22c55e"/>
                      <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                    </button>
                    <button v-if="c.estadoCampana === 'pendiente'" class="rem-ico-btn rem-ico-btn--cancel" title="Cancelar" @click="cancelarCampana(c)">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                    <button class="rem-ico-btn rem-ico-btn--del" title="Eliminar" @click="eliminarCampana(c)">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>

      <!-- DETALLE DE CAMPAÑA -->
      <template v-else-if="seccion === 'detalle' && campanaDetalle">
        <div class="rem-page-hd">
          <div style="display:flex;align-items:center;gap:10px;">
            <button class="rem-btn-back" @click="seccion = 'campanas'">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
              Volver
            </button>
            <div>
              <h2 class="rem-page-title">{{ campanaDetalle.nombre }}</h2>
              <p class="rem-page-sub">{{ formatDateTime(campanaDetalle.programadoEn) }} · Tipo: {{ campanaDetalle.tipoMensaje === 'ia' ? '⚡ IA' : '📝 Fijo' }}</p>
            </div>
          </div>
          <span class="rem-estado" :class="'rem-estado--'+campanaDetalle.estadoCampana">
            <span class="rem-estado-dot"></span>
            {{ estadoLabel(campanaDetalle.estadoCampana) }}
          </span>
        </div>

        <!-- Métricas -->
        <div class="rem-kpi-row">
          <div class="rem-kpi">
            <div class="rem-kpi-val">{{ (campanaDetalle.envios || []).length }}</div>
            <div class="rem-kpi-lbl">Contactos</div>
          </div>
          <div class="rem-kpi">
            <div class="rem-kpi-val" style="color:#22c55e;">{{ campanaDetalle.totalEnviados || 0 }}</div>
            <div class="rem-kpi-lbl">Enviados</div>
          </div>
          <div class="rem-kpi">
            <div class="rem-kpi-val" style="color:#ef4444;">{{ campanaDetalle.totalErrores || 0 }}</div>
            <div class="rem-kpi-lbl">Errores</div>
          </div>
          <div class="rem-kpi">
            <div class="rem-kpi-val">{{ campanaDetalle.scoreMin }}–{{ campanaDetalle.scoreMax }}</div>
            <div class="rem-kpi-lbl">Rango score</div>
          </div>
        </div>

        <!-- Mensaje -->
        <div class="rem-card" style="margin-bottom:16px;">
          <div style="font-size:12px;font-weight:700;color:#64748b;margin-bottom:8px;">MENSAJE</div>
          <div style="font-size:13px;color:#e2e8f0;line-height:1.6;white-space:pre-wrap;">{{ campanaDetalle.mensaje }}</div>
        </div>

        <!-- Tabla de envíos -->
        <div class="rem-card">
          <div style="font-size:13px;font-weight:700;color:#e2e8f0;margin-bottom:14px;">Registro de envíos</div>
          <div v-if="!(campanaDetalle.envios || []).length" style="text-align:center;color:#64748b;font-size:13px;padding:16px;">
            Sin envíos registrados aún
          </div>
          <table v-else class="rem-table">
            <thead>
              <tr>
                <th>Contacto</th>
                <th>Score</th>
                <th>Mensaje enviado</th>
                <th>Estado</th>
                <th>Hora</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="e in campanaDetalle.envios" :key="e.id">
                <td>
                  <div style="display:flex;align-items:center;gap:8px;">
                    <div class="rem-av">{{ (e.contacto || '?').slice(0,2).toUpperCase() }}</div>
                    <span style="font-size:12px;color:#e2e8f0;">{{ e.contacto }}</span>
                  </div>
                </td>
                <td>
                  <div style="display:flex;align-items:center;gap:6px;">
                    <div style="width:50px;height:5px;border-radius:3px;background:#1e293b;overflow:hidden;">
                      <div :style="{ width:e.scoreAlEnvio+'%', height:'100%', background:scoreColor(e.scoreAlEnvio) }"></div>
                    </div>
                    <span style="font-size:12px;font-weight:700;" :style="{ color: scoreColor(e.scoreAlEnvio) }">{{ e.scoreAlEnvio }}</span>
                  </div>
                </td>
                <td>
                  <div style="font-size:11px;color:#94a3b8;max-width:260px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" :title="e.mensajeEnviado">
                    {{ e.mensajeEnviado || '—' }}
                  </div>
                </td>
                <td>
                  <span class="rem-envio-estado" :class="'rem-envio-estado--'+e.estadoEnvio">{{ envioEstadoLabel(e.estadoEnvio) }}</span>
                  <div v-if="e.error" style="font-size:10px;color:#ef4444;margin-top:2px;" :title="e.error">Error</div>
                </td>
                <td><span style="font-size:11px;color:#64748b;">{{ e.enviadoEn ? formatDateTime(e.enviadoEn) : '—' }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>

    </div>

    <!-- Modal nueva campaña -->
    <transition name="modal-fade">
      <div v-if="dialog" class="rem-modal-bd" @mousedown.self="dialog = false">
        <div class="rem-modal">
          <div class="rem-modal-hd">
            <span>Nueva campaña de remarketing</span>
            <button class="rem-modal-close" @click="dialog = false">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="rem-modal-body">
            <div class="rem-field">
              <label>Nombre *</label>
              <input v-model="form.nombre" class="ide-input" placeholder="Ej: Seguimiento hot leads mayo" maxlength="100"/>
            </div>
            <div class="rem-field">
              <label>Descripción</label>
              <input v-model="form.descripcion" class="ide-input" placeholder="Opcional" maxlength="500"/>
            </div>

            <!-- Tipo de mensaje -->
            <div class="rem-field">
              <label>Tipo de mensaje</label>
              <div class="rem-type-toggle">
                <button :class="['rem-type-btn', form.tipoMensaje === 'fijo' ? 'rem-type-btn--active' : '']" @click="form.tipoMensaje = 'fijo'">
                  📝 Plantilla fija
                </button>
                <button :class="['rem-type-btn', form.tipoMensaje === 'ia' ? 'rem-type-btn--active' : '']" @click="form.tipoMensaje = 'ia'">
                  ⚡ Personalizado IA
                </button>
              </div>
              <div v-if="form.tipoMensaje === 'ia'" class="rem-ia-hint">
                Claude generará un mensaje único por contacto basado en su historial de conversación
              </div>
            </div>

            <div class="rem-field">
              <label>{{ form.tipoMensaje === 'ia' ? 'Objetivo / contexto de la campaña *' : 'Mensaje *' }}</label>
              <textarea
                v-model="form.mensaje"
                class="ide-textarea"
                rows="4"
                :placeholder="form.tipoMensaje === 'ia'
                  ? 'Ej: Queremos recordarles nuestra oferta de descuento del 20% válida hasta fin de mes...'
                  : 'Ej: Hola {contacto}, te recordamos que tenemos una oferta especial esperándote...'"
              ></textarea>
              <div v-if="form.tipoMensaje === 'fijo'" style="font-size:10px;color:#475569;margin-top:3px;">Usa {contacto} para personalizar con el número de teléfono</div>
            </div>

            <!-- Fecha/hora -->
            <div class="rem-field">
              <label>Programar para *</label>
              <input v-model="form.programadoEn" type="datetime-local" class="ide-input" :min="minFecha"/>
            </div>

            <!-- Segmento por score -->
            <div class="rem-field">
              <label>Segmento por score</label>
              <div style="display:flex;align-items:center;gap:12px;">
                <div style="display:flex;align-items:center;gap:6px;">
                  <span style="font-size:11px;color:#64748b;">Mín:</span>
                  <input v-model.number="form.scoreMin" type="number" min="0" max="100" class="ide-input" style="width:64px;padding:6px 8px;font-size:13px;text-align:center;"/>
                </div>
                <span style="color:#475569;font-size:12px;">–</span>
                <div style="display:flex;align-items:center;gap:6px;">
                  <span style="font-size:11px;color:#64748b;">Máx:</span>
                  <input v-model.number="form.scoreMax" type="number" min="0" max="100" class="ide-input" style="width:64px;padding:6px 8px;font-size:13px;text-align:center;"/>
                </div>
                <div class="rem-seg-preview" :style="segmentoBadgeStyle">
                  {{ segmentoLabel }}
                </div>
              </div>
            </div>

          </div>
          <div class="rem-modal-ft">
            <button class="rem-btn-ghost" @click="dialog = false">Cancelar</button>
            <button class="rem-btn-ok" :disabled="!formValido || guardando" @click="guardarCampana">
              <v-progress-circular v-if="guardando" indeterminate size="12" width="2" color="white"/>
              <span v-else>Crear campaña</span>
            </button>
          </div>
        </div>
      </div>
    </transition>

  </div>
</template>

<script>
const SVGS = {
  list: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>`,
  chart:`<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>`,
};

function isoLocal() {
  const d = new Date(); d.setMinutes(d.getMinutes() + 5);
  return d.toISOString().slice(0, 16);
}

export default {
  name: 'Remarketing',
  data: () => ({
    seccion: 'campanas',
    loading: false,
    dialog: false,
    guardando: false,
    ejecutandoId: null,
    campanas: [],
    campanaDetalle: null,
    form: { nombre: '', descripcion: '', mensaje: '', tipoMensaje: 'fijo', programadoEn: isoLocal(), scoreMin: 0, scoreMax: 100 },
    secciones: [
      { id: 'campanas', label: 'Campañas',  svg: SVGS.list  },
      { id: 'detalle',  label: 'Detalle',   svg: SVGS.chart },
    ],
  }),
  computed: {
    minFecha() {
      const d = new Date(); d.setMinutes(d.getMinutes() + 1);
      return d.toISOString().slice(0, 16);
    },
    formValido() {
      return this.form.nombre.trim() && this.form.mensaje.trim() && this.form.programadoEn;
    },
    segmentoLabel() {
      const min = this.form.scoreMin; const max = this.form.scoreMax;
      if (min >= 70) return '🔥 Solo Hot leads';
      if (min >= 40 && max < 70) return '🌡 Solo Warm leads';
      if (max < 40) return '❄️ Solo Cold leads';
      if (min >= 70) return '🔥 Hot leads';
      if (min >= 40) return '🔥🌡 Hot + Warm';
      if (max >= 70) return '🔥🌡❄️ Todos';
      return '🌡❄️ Warm + Cold';
    },
    segmentoBadgeStyle() {
      const min = this.form.scoreMin;
      if (min >= 70) return 'background:#22c55e22;color:#22c55e;border-color:#22c55e33;';
      if (min >= 40) return 'background:#f59e0b22;color:#f59e0b;border-color:#f59e0b33;';
      return 'background:#60a5fa22;color:#60a5fa;border-color:#60a5fa33;';
    },
  },
  async mounted() {
    await this.cargar();
  },
  methods: {
    async cargar() {
      this.loading = true;
      try { this.campanas = await this.$service.list('remarketing') || []; }
      finally { this.loading = false; }
    },

    seleccionarSeccion(id) {
      if (id === 'detalle' && !this.campanaDetalle) return;
      this.seccion = id;
    },

    abrirModal() {
      this.form = { nombre: '', descripcion: '', mensaje: '', tipoMensaje: 'fijo', programadoEn: isoLocal(), scoreMin: 0, scoreMax: 100 };
      this.dialog = true;
    },

    async guardarCampana() {
      if (!this.formValido) return;
      this.guardando = true;
      try {
        await this.$service.post('remarketing', {
          ...this.form,
          programadoEn: new Date(this.form.programadoEn).toISOString(),
        });
        this.$message.success('Campaña creada');
        this.dialog = false;
        await this.cargar();
      } finally { this.guardando = false; }
    },

    async ejecutarAhora(campana) {
      this.ejecutandoId = campana.id;
      try {
        await this.$service.post(`remarketing/${campana.id}/ejecutar`, {});
        this.$message.success('Campaña en ejecución');
        await this.cargar();
      } finally { this.ejecutandoId = null; }
    },

    cancelarCampana(campana) {
      this.$confirm(`¿Cancelar la campaña "${campana.nombre}"?`, async () => {
        await this.$service.patch(`remarketing/${campana.id}/cancelar`, {});
        this.$message.success('Campaña cancelada');
        await this.cargar();
      });
    },

    eliminarCampana(campana) {
      this.$confirm(`¿Eliminar la campaña "${campana.nombre}"?`, async () => {
        await this.$service.delete(`remarketing/${campana.id}`);
        this.$message.success('Campaña eliminada');
        await this.cargar();
      });
    },

    async verDetalle(campana) {
      try {
        this.campanaDetalle = await this.$service.get(`remarketing/${campana.id}`);
        this.seccion = 'detalle';
      } catch { /* error ya mostrado */ }
    },

    estadoLabel(e) {
      return { pendiente: 'Pendiente', ejecutando: 'Ejecutando', completado: 'Completado', cancelado: 'Cancelado' }[e] || e;
    },
    envioEstadoLabel(e) {
      return { pendiente: 'Pendiente', enviado: 'Enviado', error: 'Error' }[e] || e;
    },
    scoreColor(s) { return s >= 70 ? '#22c55e' : s >= 40 ? '#f59e0b' : '#60a5fa'; },
    scoreRangeStyle(min, max) {
      const color = min >= 70 ? '#22c55e' : min >= 40 ? '#f59e0b' : '#60a5fa';
      return `background:${color}22;color:${color};border:1px solid ${color}33;`;
    },
    formatDateTime(d) {
      if (!d) return '—';
      return new Date(d).toLocaleString('es-BO', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' });
    },
  },
};
</script>

<style scoped>
.rem-layout { display:flex; height:100%; overflow:hidden; background:#0a0f1e; }

/* Sub-nav */
.rem-subnav { width:200px; flex-shrink:0; background:#0d1526; border-right:1px solid #1e3a5f44; display:flex; flex-direction:column; overflow:hidden; }
.rem-sn-hd { display:flex; align-items:center; gap:10px; padding:16px 14px 14px; border-bottom:1px solid #1e3a5f33; }
.rem-sn-ico { width:32px; height:32px; border-radius:9px; background:linear-gradient(135deg,#22c55e,#16a34a); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.rem-sn-title { font-size:13px; font-weight:800; color:#f1f5f9; }
.rem-sn-sub { font-size:10px; color:#22c55e; margin-top:1px; }
.rem-sn-btn { display:flex; align-items:center; gap:10px; padding:9px 14px; border:none; background:transparent; color:#64748b; font-size:12px; font-weight:500; cursor:pointer; text-align:left; transition:all 0.15s; font-family:inherit; width:100%; }
.rem-sn-btn:hover { background:#1e293b44; color:#94a3b8; }
.rem-sn-btn--active { background:#22c55e11; color:#22c55e; font-weight:700; border-left:3px solid #22c55e; }

/* Content */
.rem-content { flex:1; display:flex; flex-direction:column; overflow:hidden; padding:24px; overflow-y:auto; }
.rem-page-hd { display:flex; align-items:center; justify-content:space-between; margin-bottom:20px; flex-wrap:wrap; gap:10px; }
.rem-page-title { font-size:22px; font-weight:900; color:#f1f5f9; letter-spacing:-0.5px; margin:0 0 4px; }
.rem-page-sub { font-size:12px; color:#64748b; margin:0; }

/* Card */
.rem-card { background:#111827; border:1px solid #1e3a5f44; border-radius:12px; padding:16px 18px; }

/* KPI row */
.rem-kpi-row { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:16px; }
.rem-kpi { background:#111827; border:1px solid #1e3a5f44; border-radius:10px; padding:14px 16px; text-align:center; }
.rem-kpi-val { font-size:26px; font-weight:900; color:#f1f5f9; letter-spacing:-1px; }
.rem-kpi-lbl { font-size:11px; color:#64748b; margin-top:2px; }

/* Botones */
.rem-btn-new { display:flex; align-items:center; gap:7px; padding:8px 16px; border-radius:9px; background:#22c55e; border:none; color:#fff; font-size:12px; font-weight:700; cursor:pointer; font-family:inherit; transition:all 0.15s; }
.rem-btn-new:hover { background:#16a34a; }
.rem-btn-back { display:flex; align-items:center; gap:6px; padding:6px 12px; border-radius:8px; border:1px solid #334155; background:none; color:#64748b; font-size:12px; font-weight:600; cursor:pointer; font-family:inherit; transition:all 0.15s; }
.rem-btn-back:hover { color:#94a3b8; border-color:#475569; }
.rem-btn-ghost { padding:8px 16px; border-radius:8px; border:1px solid #334155; background:none; color:#64748b; font-size:12px; font-weight:600; cursor:pointer; font-family:inherit; transition:all 0.15s; }
.rem-btn-ghost:hover { color:#94a3b8; }
.rem-btn-ok { display:flex; align-items:center; gap:6px; padding:8px 20px; border-radius:8px; border:none; background:#22c55e; color:#fff; font-size:12px; font-weight:700; cursor:pointer; font-family:inherit; transition:all 0.15s; min-width:120px; justify-content:center; }
.rem-btn-ok:hover:not(:disabled) { background:#16a34a; }
.rem-btn-ok:disabled { opacity:0.5; cursor:not-allowed; }

/* Icon buttons */
.rem-ico-btn { width:28px; height:28px; border-radius:6px; border:1px solid #1e3a5f44; background:#0f172a; color:#64748b; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:all 0.15s; }
.rem-ico-btn:hover { color:#94a3b8; border-color:#334155; }
.rem-ico-btn:disabled { opacity:0.4; cursor:not-allowed; }
.rem-ico-btn--run:hover { color:#22c55e; border-color:#22c55e33; }
.rem-ico-btn--cancel:hover { color:#f59e0b; border-color:#f59e0b33; }
.rem-ico-btn--del:hover { color:#ef4444; border-color:#ef444433; }

/* Badges */
.rem-badge { font-size:10px; font-weight:700; padding:3px 8px; border-radius:999px; }
.rem-badge--ia { background:#6366f122; color:#818cf8; }
.rem-badge--fijo { background:#0f172a; color:#64748b; border:1px solid #334155; }

/* Estado */
.rem-estado { display:inline-flex; align-items:center; gap:5px; font-size:11px; font-weight:700; padding:3px 9px; border-radius:999px; }
.rem-estado--pendiente { background:#f59e0b22; color:#f59e0b; }
.rem-estado--ejecutando { background:#818cf822; color:#818cf8; animation:pulse 1.5s ease-in-out infinite; }
.rem-estado--completado { background:#22c55e22; color:#22c55e; }
.rem-estado--cancelado  { background:#ef444422; color:#ef4444; }
.rem-estado-dot { width:5px; height:5px; border-radius:50%; background:currentColor; }
@keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }

/* Envio estado */
.rem-envio-estado { font-size:10px; font-weight:700; padding:2px 7px; border-radius:999px; }
.rem-envio-estado--enviado  { background:#22c55e22; color:#22c55e; }
.rem-envio-estado--pendiente{ background:#f59e0b22; color:#f59e0b; }
.rem-envio-estado--error    { background:#ef444422; color:#ef4444; }

/* Score range */
.rem-score-range { font-size:11px; font-weight:700; padding:2px 8px; border-radius:999px; }

/* Segmento preview */
.rem-seg-preview { font-size:11px; font-weight:700; padding:3px 10px; border-radius:999px; border:1px solid; }

/* Tabla */
.rem-table-wrap { overflow-x:auto; }
.rem-table { width:100%; border-collapse:collapse; }
.rem-table thead tr { background:#161d2f; }
.rem-table th { padding:8px 12px; text-align:left; font-size:10px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.5px; border-bottom:1px solid #334155; white-space:nowrap; }
.rem-table td { padding:10px 12px; border-bottom:1px solid #1e3a5f22; vertical-align:middle; }
.rem-table tbody tr:hover { background:#1e293b22; }

/* Avatar */
.rem-av { width:30px; height:30px; border-radius:8px; background:#6366f122; color:#818cf8; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700; flex-shrink:0; }

/* Empty state */
.rem-empty { text-align:center; padding:60px 20px; color:#64748b; }

/* Modal */
.rem-modal-bd { position:fixed; inset:0; background:#000000aa; display:flex; align-items:center; justify-content:center; z-index:1000; }
.rem-modal { background:#0d1526; border:1px solid #1e3a5f66; border-radius:14px; width:520px; max-width:95vw; max-height:90vh; display:flex; flex-direction:column; overflow:hidden; }
.rem-modal-hd { display:flex; align-items:center; justify-content:space-between; padding:16px 20px; border-bottom:1px solid #1e3a5f44; font-size:14px; font-weight:800; color:#f1f5f9; flex-shrink:0; }
.rem-modal-close { background:none; border:none; color:#64748b; cursor:pointer; display:flex; padding:2px; }
.rem-modal-close:hover { color:#94a3b8; }
.rem-modal-body { flex:1; overflow-y:auto; padding:20px; display:flex; flex-direction:column; gap:14px; }
.rem-modal-ft { padding:14px 20px; border-top:1px solid #1e3a5f44; display:flex; justify-content:flex-end; gap:8px; flex-shrink:0; }

/* Form fields */
.rem-field label { display:block; font-size:11px; font-weight:700; color:#94a3b8; margin-bottom:5px; text-transform:uppercase; letter-spacing:0.4px; }

/* Type toggle */
.rem-type-toggle { display:flex; gap:6px; }
.rem-type-btn { flex:1; padding:8px 10px; border-radius:8px; border:1px solid #334155; background:#0f172a; color:#64748b; font-size:12px; font-weight:600; cursor:pointer; font-family:inherit; transition:all 0.15s; }
.rem-type-btn:hover { border-color:#475569; color:#94a3b8; }
.rem-type-btn--active { border-color:#22c55e44; background:#22c55e11; color:#22c55e; }

.rem-ia-hint { font-size:11px; color:#22c55e; background:#22c55e11; border:1px solid #22c55e22; border-radius:6px; padding:6px 10px; margin-top:6px; line-height:1.5; }

/* Transition */
.modal-fade-enter-active, .modal-fade-leave-active { transition:opacity 0.2s ease; }
.modal-fade-enter, .modal-fade-leave-to { opacity:0; }
</style>
