<template>
  <div class="ide-page">

    <!-- Header -->
    <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:20px;">
      <div>
        <div class="section-title">Agentes IA</div>
        <p class="section-subtitle" style="margin-bottom:0;">Crea y administra tus agentes de inteligencia artificial</p>
      </div>
      <button class="ag-new-btn" @click="abrirDialog()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Nuevo Agente
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" style="display:flex; justify-content:center; padding:48px;">
      <div class="ag-spinner"></div>
    </div>

    <!-- Empty state -->
    <div v-else-if="agentes.length === 0" class="ide-ia-card" style="text-align:center; padding:48px;">
      <div style="font-size:48px; margin-bottom:16px;">🤖</div>
      <div style="color:#e2e8f0; font-size:15px; font-weight:700; margin-bottom:8px;">No hay agentes creados</div>
      <div style="color:#64748b; font-size:13px; margin-bottom:24px;">Crea tu primer agente IA con Claude</div>
      <button class="ag-new-btn" @click="abrirDialog()">Crear primer agente</button>
    </div>

    <!-- Grid -->
    <div v-else class="ag-grid">
      <div v-for="ag in agentes" :key="ag.id" class="ide-ia-card ide-ia-card--hover ag-card">
        <div class="ag-card__hd">
          <div class="ag-avatar" :style="{ background: ag.color+'22', color: ag.color }">{{ ag.avatar }}</div>
          <div style="flex:1; min-width:0;">
            <div class="ag-name">{{ ag.nombre }}</div>
            <div class="ag-model">{{ ag.modelo }}</div>
          </div>
          <div style="display:flex; gap:4px;">
            <button class="ag-ico-btn" @click.stop="abrirDialog(ag)" title="Editar">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="ag-ico-btn" @click.stop="$router.push({ name: 'agente-detalle', params: { id: ag.id } })" title="Ver detalle">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            </button>
            <button class="ag-ico-btn ag-ico-btn--del" @click.stop="confirmarEliminar(ag)" title="Eliminar">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
            </button>
          </div>
        </div>

        <p class="ag-desc">{{ ag.descripcion || 'Sin descripción' }}</p>

        <div class="ag-footer">
          <span class="ag-badge" :style="{ background: ag.activo ? '#22c55e22' : '#ef444422', color: ag.activo ? '#22c55e' : '#ef4444' }">
            {{ ag.activo ? '● Activo' : '● Inactivo' }}
          </span>
          <span class="ag-badge" style="background:#6366f122; color:#818cf8;">{{ ag.modoOperacion }}</span>
          <div style="margin-left:auto; font-size:11px; color:#64748b;">{{ ag.totalConversaciones }} conv.</div>
        </div>
      </div>
    </div>

    <!-- Dialog crear/editar -->
    <transition name="modal-fade">
      <div v-if="dialog" class="ag-modal-backdrop" @mousedown.self="dialog = false">
        <div class="ag-modal">
          <div class="ag-modal-header">
            <span>{{ editando ? 'Editar Agente' : 'Nuevo Agente IA' }}</span>
            <button class="ag-modal-close" @click="dialog = false">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="ag-modal-body">
            <div class="ag-form-grid">
              <div class="ide-field">
                <label>Nombre del agente *</label>
                <input v-model="form.nombre" class="ide-input" placeholder="Ej: Sofía, Max, Aria…" />
              </div>
              <div class="ide-field">
                <label>Tono de comunicación</label>
                <select v-model="form.tono" class="ide-select">
                  <option v-for="t in tonos" :key="t" :value="t">{{ t }}</option>
                </select>
              </div>
              <div class="ide-field">
                <label>Modelo Claude</label>
                <select v-model="form.modelo" class="ide-select">
                  <option value="claude-haiku-4-5">Claude Haiku 4.5 — Rápido</option>
                  <option value="claude-sonnet-4-6">Claude Sonnet 4.6 — Equilibrado</option>
                  <option value="claude-opus-4-7">Claude Opus 4.7 — Máxima calidad</option>
                </select>
              </div>
              <div class="ide-field">
                <label>Modo de operación</label>
                <select v-model="form.modoOperacion" class="ide-select">
                  <option value="full">🤖 IA Total</option>
                  <option value="hybrid">⚡ Híbrido</option>
                  <option value="assist">🧑 Asistente</option>
                </select>
              </div>
              <div class="ide-field ag-form-full">
                <label>Descripción</label>
                <input v-model="form.descripcion" class="ide-input" placeholder="Descripción breve del agente" />
              </div>
              <div class="ide-field ag-form-full">
                <label>System Prompt (instrucciones para Claude)</label>
                <textarea v-model="form.systemPrompt" class="ide-textarea" placeholder="Eres un agente de ventas llamado Sofía…" rows="5"></textarea>
              </div>
            </div>
          </div>
          <div class="ag-modal-footer">
            <button class="ag-btn-cancel" @click="dialog = false">Cancelar</button>
            <button class="ag-btn-ok" :disabled="saving" @click="guardar">
              <span v-if="saving" class="ag-spinner ag-spinner--sm ag-spinner--white"></span>
              {{ editando ? 'Actualizar' : 'Crear Agente' }}
            </button>
          </div>
        </div>
      </div>
    </transition>

  </div>
</template>

<script>
export default {
  name: 'Agentes',
  data: () => ({
    agentes: [],
    loading: true,
    dialog: false,
    saving: false,
    editando: null,
    form: {
      nombre: '', descripcion: '', modelo: 'claude-haiku-4-5',
      tono: 'profesional', modoOperacion: 'hybrid', systemPrompt: '',
      avatar: '✦', color: '#6366f1',
    },
    tonos: ['profesional', 'amigable', 'formal', 'técnico', 'empático'],
  }),
  async mounted() {
    await this.cargar();
  },
  methods: {
    async cargar() {
      try {
        this.loading = true;
        this.agentes = await this.$service.list('agentes') || [];
      } finally {
        this.loading = false;
      }
    },
    abrirDialog(ag = null) {
      if (ag) {
        this.editando = ag;
        this.form = { ...ag };
      } else {
        this.editando = null;
        this.form = { nombre: '', descripcion: '', modelo: 'claude-haiku-4-5', tono: 'profesional', modoOperacion: 'hybrid', systemPrompt: '', avatar: '✦', color: '#6366f1' };
      }
      this.dialog = true;
    },
    async guardar() {
      if (!this.form.nombre) { this.$message.error('El nombre es obligatorio'); return; }
      this.saving = true;
      try {
        if (this.editando) {
          await this.$service.put(`agentes/${this.editando.id}`, this.form);
          this.$message.success('Agente actualizado');
        } else {
          await this.$service.post('agentes', this.form);
          this.$message.success('Agente creado correctamente');
        }
        this.dialog = false;
        await this.cargar();
      } catch (e) {
        this.$message.error(e?.mensaje || 'Error al guardar');
      } finally {
        this.saving = false;
      }
    },
    confirmarEliminar(ag) {
      this.$confirm(`¿Eliminar el agente "${ag.nombre}"?`, async () => {
        await this.$service.delete(`agentes/${ag.id}`);
        this.$message.success('Agente eliminado');
        await this.cargar();
      });
    },
  },
};
</script>

<style scoped>
.ag-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 14px; }
.ag-card { padding: 14px; }

.ag-card__hd { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
.ag-avatar { width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
.ag-name   { font-size: 14px; font-weight: 700; color: #e2e8f0; }
.ag-model  { font-size: 11px; color: #64748b; margin-top: 1px; }

.ag-ico-btn {
  background: none; border: none; cursor: pointer; color: #475569;
  padding: 4px; border-radius: 5px; display: flex; transition: color 0.15s;
}
.ag-ico-btn:hover { color: #94a3b8; }
.ag-ico-btn--del:hover { color: #ef4444; }

.ag-desc { font-size: 12px; color: #64748b; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin: 0 0 12px; }
.ag-footer { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.ag-badge  { font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 999px; }

.ag-new-btn {
  display: inline-flex; align-items: center; gap: 6px;
  background: #6366f1; color: #fff; border: none; border-radius: 8px;
  padding: 8px 14px; font-size: 12px; font-weight: 700; cursor: pointer;
  transition: background 0.15s; font-family: inherit;
}
.ag-new-btn:hover { background: #4f46e5; }

.ag-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.ag-form-full { grid-column: span 2; }

/* Modal */
.ag-modal-backdrop {
  position: fixed; inset: 0; background: rgba(0,0,0,0.6);
  backdrop-filter: blur(2px); display: flex; align-items: center;
  justify-content: center; z-index: 9999;
}
.ag-modal {
  background: #1e293b; border: 1px solid #334155; border-radius: 12px;
  width: 100%; max-width: 560px; box-shadow: 0 20px 60px rgba(0,0,0,0.5);
  display: flex; flex-direction: column; max-height: 90vh;
}
.ag-modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 24px 14px; font-size: 15px; font-weight: 700; color: #f1f5f9;
  border-bottom: 1px solid #1e3a5f33; flex-shrink: 0;
}
.ag-modal-close {
  background: none; border: none; color: #475569; cursor: pointer;
  padding: 2px; border-radius: 4px; display: flex;
}
.ag-modal-close:hover { color: #94a3b8; }
.ag-modal-body { padding: 20px 24px; overflow-y: auto; flex: 1; }
.ag-modal-footer {
  display: flex; justify-content: flex-end; gap: 8px;
  padding: 14px 24px 20px; border-top: 1px solid #1e3a5f33; flex-shrink: 0;
}
.ag-btn-cancel {
  background: transparent; border: 1px solid #334155; color: #64748b;
  border-radius: 8px; padding: 8px 16px; font-size: 12px; font-weight: 600;
  cursor: pointer; font-family: inherit; transition: border-color 0.15s;
}
.ag-btn-cancel:hover { border-color: #475569; color: #94a3b8; }
.ag-btn-ok {
  background: #6366f1; color: #fff; border: none; border-radius: 8px;
  padding: 8px 20px; font-size: 12px; font-weight: 700; cursor: pointer;
  font-family: inherit; display: inline-flex; align-items: center; gap: 6px;
  transition: background 0.15s;
}
.ag-btn-ok:hover:not(:disabled) { background: #4f46e5; }
.ag-btn-ok:disabled { opacity: 0.6; cursor: not-allowed; }

/* Spinners */
.ag-spinner {
  width: 36px; height: 36px; border-radius: 50%;
  border: 3px solid #6366f1; border-top-color: transparent;
  animation: ag-spin 0.75s linear infinite;
}
.ag-spinner--sm  { width: 14px; height: 14px; border-width: 2px; }
.ag-spinner--white { border-color: #fff; border-top-color: transparent; }
@keyframes ag-spin { to { transform: rotate(360deg); } }

.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.2s; }
.modal-fade-enter, .modal-fade-leave-to { opacity: 0; }
</style>
