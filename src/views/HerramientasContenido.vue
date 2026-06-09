<template>
  <div>
    <!-- Stats -->
    <div class="hc-stats">
      <div v-for="s in stats" :key="s.label" class="ide-ia-card hc-stat">
        <div class="stat-value" :style="{ color: s.color }">{{ s.value }}</div>
        <div style="font-size:11px; color:#64748b; margin-top:2px;">{{ s.label }}</div>
      </div>
    </div>

    <div v-if="loading" style="display:flex; justify-content:center; padding:32px;">
      <v-progress-circular indeterminate color="primary" size="28" />
    </div>

    <div v-else style="display:flex; flex-direction:column; gap:10px; margin-top:16px;">
      <div
        v-for="h in herramientas" :key="h.id"
        class="ide-ia-card"
        :style="{ border: '1px solid ' + (h.activa ? h.color+'33' : '#1e3a5f22') }"
      >
        <div style="display:flex; align-items:flex-start; gap:12px;">
          <div class="hc-ico" :style="{ background: h.color+'22' }">🔧</div>
          <div style="flex:1;">
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:3px;">
              <span style="font-size:13px; font-weight:700; color:#e2e8f0;">{{ h.label }}</span>
              <span v-if="h.activa" class="hc-badge" :style="h.autoConfirmar ? 'background:#22c55e22;color:#22c55e;' : 'background:#f59e0b22;color:#f59e0b;'">
                {{ h.autoConfirmar ? '✓ Auto' : '⏳ Aprobación' }}
              </span>
              <span v-else class="hc-badge" style="background:#47556922;color:#64748b;">Inactiva</span>
            </div>
            <div style="font-size:11px; color:#64748b;">{{ h.descripcion }}</div>
          </div>
          <div class="ide-toggle" :class="{ 'ide-toggle--on': h.activa }" @click="toggle(h)"><div></div></div>
        </div>

        <div v-if="h.activa && h.parametros && h.parametros.length" style="display:flex; gap:6px; flex-wrap:wrap; margin-top:10px;">
          <code v-for="p in h.parametros" :key="p" class="hc-param">{{ p }}</code>
        </div>

        <div v-if="h.activa" style="display:flex; align-items:center; gap:8px; margin-top:10px;">
          <div style="font-size:11px; color:#64748b; flex-shrink:0;">Confianza:</div>
          <div class="score-bar" style="flex:1;">
            <div :style="{ width: h.confianzaMinima+'%', height:'100%', background: h.color, borderRadius:'2px' }"></div>
          </div>
          <span style="font-size:12px; font-weight:700;" :style="{ color: h.color }">{{ h.confianzaMinima }}%</span>
        </div>
      </div>

      <!-- Agregar -->
      <div class="hc-add" @click="dialogAdd = true">
        <span style="font-size:18px;">+</span>
        <span style="font-size:12px; color:#475569;">Agregar herramienta</span>
      </div>
    </div>

    <!-- Dialog -->
    <v-dialog v-model="dialogAdd" max-width="480" persistent>
      <v-card style="background:#1e293b; border:1px solid #334155; border-radius:12px;">
        <v-card-title style="color:#f1f5f9; font-size:15px; font-weight:700; padding:20px 24px 12px;">Nueva Herramienta</v-card-title>
        <v-card-text style="padding:0 24px 8px;">
          <div style="display:flex; flex-direction:column; gap:12px;">
            <div class="ide-field"><label>Nombre interno *</label><input v-model="formH.nombre" class="ide-input" placeholder="calificar_lead" /></div>
            <div class="ide-field"><label>Etiqueta *</label><input v-model="formH.label" class="ide-input" placeholder="Calificar Lead" /></div>
            <div class="ide-field"><label>Descripción *</label><textarea v-model="formH.descripcion" class="ide-textarea" rows="2" placeholder="Describe qué hace esta herramienta"></textarea></div>
          </div>
        </v-card-text>
        <v-card-actions style="padding:0 24px 20px; justify-content:flex-end; gap:8px;">
          <v-btn text @click="dialogAdd = false" style="color:#64748b; font-size:12px;">Cancelar</v-btn>
          <v-btn depressed color="primary" :loading="saving" @click="crear" style="font-size:12px; border-radius:8px;">Crear</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  name: 'HerramientasContenido',
  props: { agenteId: { type: String, required: true } },
  data: () => ({
    herramientas: [],
    loading: true,
    dialogAdd: false,
    saving: false,
    formH: { nombre: '', label: '', descripcion: '' },
  }),
  computed: {
    stats() {
      return [
        { label: 'Activas',           value: this.herramientas.filter(h => h.activa).length,                        color: '#22c55e' },
        { label: 'Auto-confirmación', value: this.herramientas.filter(h => h.activa && h.autoConfirmar).length,     color: '#6366f1' },
        { label: 'Req. aprobación',   value: this.herramientas.filter(h => h.activa && !h.autoConfirmar).length,    color: '#f59e0b' },
        { label: 'Inactivas',         value: this.herramientas.filter(h => !h.activa).length,                       color: '#475569' },
      ];
    },
  },
  async mounted() {
    await this.cargar();
  },
  watch: {
    agenteId() { this.cargar(); },
  },
  methods: {
    async cargar() {
      try {
        this.loading = true;
        this.herramientas = await this.$service.list(`herramientas/agente/${this.agenteId}`) || [];
      } finally {
        this.loading = false;
      }
    },
    async toggle(h) {
      try {
        await this.$service.put(`herramientas/${h.id}`, { ...h, activa: !h.activa });
        h.activa = !h.activa;
      } catch (e) {
        this.$message.error('Error al actualizar');
      }
    },
    async crear() {
      if (!this.formH.nombre || !this.formH.label) { this.$message.error('Nombre y etiqueta son obligatorios'); return; }
      this.saving = true;
      try {
        await this.$service.post('herramientas', { ...this.formH, agenteId: this.agenteId });
        this.$message.success('Herramienta creada');
        this.dialogAdd = false;
        this.formH = { nombre: '', label: '', descripcion: '' };
        await this.cargar();
      } finally {
        this.saving = false;
      }
    },
  },
};
</script>

<style scoped>
.hc-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.hc-stat  { text-align: center; padding: 14px; }
.hc-ico   { width: 36px; height: 36px; border-radius: 9px; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }
.hc-badge { font-size: 10px; font-weight: 600; padding: 1px 7px; border-radius: 999px; }
.hc-param { font-size: 11px; background: #0f172a; color: #94a3b8; padding: 3px 8px; border-radius: 4px; border: 1px solid #1e3a5f33; }
.hc-add   { display: flex; align-items: center; justify-content: center; gap: 8px; border: 1px dashed #334155; cursor: pointer; padding: 14px; border-radius: 12px; color: #475569; transition: border-color 0.15s; }
.hc-add:hover { border-color: #c96442; color: #e8956d; }
</style>
