<template>
  <div class="ide-page">
    <div class="section-title">Mis Citas</div>
    <p class="section-subtitle">Reservas agendadas contigo</p>

    <div v-if="loading" style="display:flex; justify-content:center; padding:56px;">
      <v-progress-circular indeterminate color="primary" size="36" />
    </div>

    <div v-else-if="!citas.length" class="ide-ia-card" style="text-align:center; padding:56px; color:var(--text-disabled);">
      <div style="font-size:36px; margin-bottom:12px;">📅</div>
      <div style="font-size:14px; font-weight:700; color:var(--text-muted); margin-bottom:6px;">Sin citas agendadas</div>
      <div style="font-size:12px;">Cuando un cliente agende contigo, aparecerá aquí</div>
    </div>

    <div v-else style="display:flex; flex-direction:column; gap:10px;">
      <div v-for="c in citas" :key="c.id" class="ide-ia-card" style="padding:14px 16px;">
        <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:12px; flex-wrap:wrap;">
          <div style="min-width:220px;">
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
              <span style="font-size:13px; font-weight:700; color:var(--text-heading);">{{ c.titulo }}</span>
              <span :style="estadoBadgeStyle(c.estadoReserva)">{{ ESTADO_LABEL[c.estadoReserva] || c.estadoReserva }}</span>
            </div>
            <div style="font-size:11px; color:var(--text-faint);">{{ c.codigoReserva }}</div>
            <div style="font-size:11px; color:var(--text-muted); margin-top:2px;">{{ c.contactoNombre }} <span v-if="c.contactoTelefono">· {{ c.contactoTelefono }}</span></div>
          </div>
          <div style="text-align:right; min-width:140px;">
            <div style="font-size:13px; font-weight:700; color:var(--text-primary);">{{ formatearFechaHora(c.fechaInicio) }}</div>
            <div style="font-size:11px; color:var(--text-faint);">{{ c.duracionMinutos }} min</div>
          </div>
        </div>

        <div v-if="c.descripcion" style="margin-top:8px; padding-top:8px; border-top:1px solid color-mix(in srgb, var(--border) 33%, transparent); font-size:12px; color:var(--text-muted);">{{ c.descripcion }}</div>

        <div v-if="c.estadoReserva === 'confirmada'" style="display:flex; gap:8px; margin-top:10px; flex-wrap:wrap;">
          <button @click="abrirCompletar(c)" class="btn-mini btn-mini--ok">Marcar completada</button>
          <button @click="cambiarEstado(c, 'no_asistio')" class="btn-mini">Cliente no asistió</button>
          <button @click="cambiarEstado(c, 'cancelada')" class="btn-mini btn-mini--danger">Cancelar</button>
        </div>
        <div v-if="c.notasInternas" style="margin-top:8px; font-size:11px; color:var(--text-faint);"><strong>Notas:</strong> {{ c.notasInternas }}</div>
      </div>
    </div>

    <!-- Modal completar con notas -->
    <div v-if="dialogCompletar" class="cat-overlay" @click.self="dialogCompletar = false">
      <div style="background:var(--bg-surface); border:1px solid var(--border); border-radius:12px; width:420px; max-width:95%; padding:22px;">
        <div style="font-size:14px; font-weight:700; color:var(--text-heading); margin-bottom:16px;">Completar cita</div>
        <div class="ide-field" style="margin-bottom:14px;">
          <label>Resultado</label>
          <select v-model="formCompletar.resultado" class="ide-select">
            <option value="exitosa">Exitosa</option>
            <option value="cliente_no_avanzo">Cliente no avanzó</option>
            <option value="requiere_seguimiento">Requiere seguimiento</option>
          </select>
        </div>
        <div class="ide-field">
          <label>Notas</label>
          <textarea v-model="formCompletar.notasInternas" class="ide-textarea" rows="3" placeholder="Resumen de la cita…"></textarea>
        </div>
        <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:20px;">
          <button @click="dialogCompletar = false" style="background:none; border:1px solid var(--border); border-radius:8px; color:var(--text-faint); padding:8px 14px; font-size:12px; cursor:pointer; font-family:inherit;">Cancelar</button>
          <button @click="guardarCompletar" :disabled="saving" style="background:#22c55e; color:#fff; border:none; border-radius:8px; padding:8px 14px; font-size:12px; font-weight:600; cursor:pointer; font-family:inherit;">Guardar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
const ESTADO_LABEL = { confirmada: 'Confirmada', completada: 'Completada', cancelada: 'Cancelada', no_asistio: 'No asistió' };
const ESTADO_COLOR = { confirmada: '#6366f1', completada: '#22c55e', cancelada: '#ef4444', no_asistio: '#f59e0b' };

export default {
  name: 'MisCitas',
  data() {
    return {
      ESTADO_LABEL,
      citas: [],
      loading: false,
      saving: false,
      dialogCompletar: false,
      completando: null,
      formCompletar: { resultado: 'exitosa', notasInternas: '' },
    };
  },
  async mounted() {
    await this.cargar();
  },
  methods: {
    estadoBadgeStyle(estado) {
      const color = ESTADO_COLOR[estado] || 'var(--text-faint)';
      return { background: `${color}22`, color, padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '700' };
    },
    formatearFechaHora(iso) {
      if (!iso) return '—';
      return new Date(iso).toLocaleString('es-BO', { dateStyle: 'medium', timeStyle: 'short' });
    },
    async cargar() {
      this.loading = true;
      try {
        this.citas = await this.$service.list('reservaciones/mias') || [];
      } finally {
        this.loading = false;
      }
    },
    async cambiarEstado(cita, estado) {
      try {
        await this.$service.put(`reservaciones/${cita.id}/estado`, { estado });
        this.$message.success('Estado actualizado');
        await this.cargar();
      } catch (e) { /* interceptor ya notifica */ }
    },
    abrirCompletar(cita) {
      this.completando = cita;
      this.formCompletar = { resultado: 'exitosa', notasInternas: '' };
      this.dialogCompletar = true;
    },
    async guardarCompletar() {
      this.saving = true;
      try {
        await this.$service.put(`reservaciones/${this.completando.id}/estado`, {
          estado: 'completada',
          resultado: this.formCompletar.resultado,
          notasInternas: this.formCompletar.notasInternas || undefined,
        });
        this.$message.success('Cita completada');
        this.dialogCompletar = false;
        await this.cargar();
      } catch (e) { /* interceptor ya notifica */ } finally {
        this.saving = false;
      }
    },
  },
};
</script>

<style scoped>
.btn-mini {
  background: none; border: 1px solid var(--border); border-radius: 6px;
  color: var(--text-muted); padding: 6px 10px; font-size: 11px; cursor: pointer;
  font-family: 'Inter', sans-serif; white-space: nowrap;
}
.btn-mini--ok { border-color: #22c55e55; color: #22c55e; }
.btn-mini--danger { border-color: #ef444455; color: #ef4444; }

.cat-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.65); z-index: 9999;
  display: flex; align-items: center; justify-content: center;
}
</style>
