<template>
  <div>
    <!-- Toolbar -->
    <div class="bk-toolbar">
      <div class="bk-toolbar-left">
        <input v-model="filtro" class="ide-input bk-input-search" placeholder="Buscar pregunta o respuesta…" />
        <select v-model="categoriaFiltro" class="ide-select bk-select-category">
          <option value="">Todas las categorías</option>
          <option v-for="c in categorias" :key="c" :value="c">{{ c }}</option>
        </select>
      </div>
      <div class="bk-toolbar-right">
        <button class="bk-add-btn bk-add-btn--success" :disabled="exportando" title="Descargar la base de conocimiento en Excel" @click="exportarExcel">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          {{ exportando ? 'Exportando…' : 'Exportar' }}
        </button>
        <label class="bk-add-btn bk-add-btn--warning" :class="{ 'bk-add-btn--loading': importando }" title="Cargar o actualizar desde Excel (columnas: Pregunta, Respuesta, Categoría, Activo, Orden)">
          <input type="file" accept=".xlsx,.xls" style="display:none;" @change="importarExcel" :disabled="importando" />
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          {{ importando ? 'Importando…' : 'Importar' }}
        </label>
        <button class="bk-add-btn" @click="abrir(null)">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Nueva pregunta
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" style="display:flex; justify-content:center; padding:32px;">
      <v-progress-circular indeterminate color="primary" size="28" />
    </div>

    <!-- Empty state -->
    <div v-else-if="!items.length" class="ide-ia-card" style="text-align:center; padding:40px; color:#475569;">
      <div style="font-size:28px; margin-bottom:12px;">📚</div>
      <div style="font-size:13px; font-weight:600; color:#94a3b8; margin-bottom:4px;">Sin preguntas frecuentes</div>
      <div style="font-size:11px;">Agrega preguntas y respuestas para que el agente responda automáticamente</div>
    </div>

    <!-- List -->
    <div v-else style="display:flex; flex-direction:column; gap:8px;">
      <div
        v-for="item in filtrados" :key="item.id"
        class="ide-ia-card"
        style="padding:12px 14px;"
      >
        <div style="display:flex; align-items:flex-start; gap:10px;">
          <div style="flex:1; min-width:0;">
            <div style="display:flex; align-items:center; gap:6px; margin-bottom:5px; flex-wrap:wrap;">
              <span v-if="item.categoria" style="font-size:10px; font-weight:700; padding:2px 8px; border-radius:999px; background:#6366f122; color:#818cf8;">{{ item.categoria }}</span>
              <span v-if="!item.activo" style="font-size:10px; font-weight:700; padding:2px 8px; border-radius:999px; background:#47556922; color:#64748b;">Inactivo</span>
              <span v-if="item.orden" style="font-size:10px; color:#475569;">#{{ item.orden }}</span>
            </div>
            <div style="font-size:13px; font-weight:600; color:#e2e8f0; margin-bottom:5px; line-height:1.4;">{{ item.pregunta }}</div>
            <div style="font-size:11px; color:#64748b; line-height:1.6; white-space:pre-wrap;">{{ item.respuesta }}</div>
          </div>
          <div style="display:flex; align-items:center; gap:6px; flex-shrink:0; margin-top:2px;">
            <button @click="abrir(item)" title="Editar" style="background:none; border:none; cursor:pointer; color:#475569; padding:5px; border-radius:5px; line-height:1; transition:color .15s;" @mouseenter="e=>e.target.style.color='#94a3b8'" @mouseleave="e=>e.target.style.color='#475569'">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button @click="confirmarEliminar(item)" title="Eliminar" style="background:none; border:none; cursor:pointer; color:#475569; padding:5px; border-radius:5px; line-height:1; transition:color .15s;" @mouseenter="e=>e.target.style.color='#ef4444'" @mouseleave="e=>e.target.style.color='#475569'">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
            </button>
            <div class="ide-toggle" :class="{ 'ide-toggle--on': item.activo }" @click="toggleActivo(item)" style="transform:scale(0.85);"><div></div></div>
          </div>
        </div>
      </div>

      <!-- No match -->
      <div v-if="!filtrados.length" style="text-align:center; padding:24px; color:#475569; font-size:12px;">
        No se encontraron resultados
      </div>
    </div>

    <!-- Count -->
    <div v-if="!loading && items.length" style="margin-top:10px; font-size:11px; color:#475569;">
      {{ filtrados.length }} de {{ items.length }} pregunta(s)
    </div>

    <!-- Modal: Add/Edit -->
    <div v-if="dialog" class="bk-overlay" @click.self="dialog = false">
      <div class="bk-modal">
        <div style="font-size:15px; font-weight:700; color:#f1f5f9; margin-bottom:18px;">
          {{ editando ? 'Editar pregunta frecuente' : 'Nueva pregunta frecuente' }}
        </div>
        <div style="display:flex; flex-direction:column; gap:14px;">
          <div class="ide-field">
            <label>Pregunta *</label>
            <input v-model="form.pregunta" class="ide-input" placeholder="¿Cuál es el horario de atención?" maxlength="500" />
            <div style="font-size:10px; color:#475569; margin-top:2px;">{{ (form.pregunta||'').length }}/500</div>
          </div>
          <div class="ide-field">
            <label>Respuesta *</label>
            <textarea v-model="form.respuesta" class="ide-textarea" rows="5" placeholder="Escribe la respuesta completa…"></textarea>
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
            <div class="ide-field">
              <label>Categoría</label>
              <input v-model="form.categoria" class="ide-input" placeholder="Horarios, Precios, Envíos…" maxlength="100" list="bk-cats" />
              <datalist id="bk-cats">
                <option v-for="c in categorias" :key="c" :value="c" />
              </datalist>
            </div>
            <div class="ide-field">
              <label>Orden de prioridad</label>
              <input v-model.number="form.orden" type="number" min="0" class="ide-input" placeholder="0" />
            </div>
          </div>
          <div style="display:flex; align-items:center; gap:10px;">
            <div class="ide-toggle" :class="{ 'ide-toggle--on': form.activo }" @click="form.activo = !form.activo"><div></div></div>
            <span style="font-size:12px;" :style="{ color: form.activo ? '#22c55e' : '#64748b' }">{{ form.activo ? 'Activo' : 'Inactivo' }}</span>
          </div>
        </div>
        <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:20px;">
          <button @click="dialog = false" style="background:none; border:1px solid #334155; border-radius:8px; color:#64748b; padding:8px 14px; font-size:12px; cursor:pointer; font-family:inherit;">Cancelar</button>
          <button @click="guardar" :disabled="saving" style="background:#6366f1; color:#fff; border:none; border-radius:8px; padding:8px 16px; font-size:12px; font-weight:600; cursor:pointer; font-family:inherit; display:flex; align-items:center; gap:6px;">
            <v-progress-circular v-if="saving" indeterminate size="14" width="2" color="white" />
            {{ editando ? 'Guardar cambios' : 'Agregar' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal: Delete confirm -->
    <div v-if="dialogEliminar" class="bk-overlay" @click.self="dialogEliminar = false">
      <div style="background:#1e293b; border:1px solid #334155; border-radius:12px; width:420px; max-width:95vw; padding:24px;">
        <div style="font-size:15px; font-weight:700; color:#f1f5f9; margin-bottom:8px;">Eliminar pregunta</div>
        <div style="font-size:12px; color:#94a3b8; line-height:1.6; margin-bottom:20px;">
          ¿Estás seguro de que deseas eliminar esta pregunta? El agente dejará de usar esta respuesta.
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
export default {
  name: 'BaseConocimiento',
  props: {
    agenteId: { type: String, required: true },
  },
  data() {
    return {
      items: [],
      loading: false,
      saving: false,
      deleting: false,
      dialog: false,
      dialogEliminar: false,
      filtro: '',
      categoriaFiltro: '',
      editando: null,
      eliminandoItem: null,
      form: { pregunta: '', respuesta: '', categoria: '', orden: 0, activo: true },
      exportando: false,
      importando: false,
    };
  },
  computed: {
    categorias() {
      return [...new Set(this.items.filter(i => i.categoria).map(i => i.categoria))].sort();
    },
    filtrados() {
      const q = this.filtro.toLowerCase();
      return this.items.filter(i => {
        const matchQ = !q || i.pregunta.toLowerCase().includes(q) || i.respuesta.toLowerCase().includes(q);
        const matchC = !this.categoriaFiltro || i.categoria === this.categoriaFiltro;
        return matchQ && matchC;
      });
    },
  },
  async mounted() {
    await this.cargar();
  },
  methods: {
    async cargar() {
      this.loading = true;
      try {
        const data = await this.$service.get(`agentes/${this.agenteId}/base-conocimiento`);
        this.items = data || [];
      } finally {
        this.loading = false;
      }
    },
    async exportarExcel() {
      this.exportando = true;
      try {
        const response = await fetch(`${this.$baseServer}agentes/${this.agenteId}/base-conocimiento/exportar/excel`, {
          headers: { 'Authorization': `Bearer ${this.$storage.get('token')}` },
        });
        if (!response.ok) throw new Error('Error al exportar');
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `base-conocimiento-${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        this.$message.success('Excel exportado');
      } catch (e) {
        this.$message.error('Error al exportar Excel');
      } finally {
        this.exportando = false;
      }
    },
    async importarExcel(event) {
      const file = event.target.files && event.target.files[0];
      if (!file) return;
      this.importando = true;
      try {
        const formData = new FormData();
        formData.append('archivo', file);
        const response = await fetch(`${this.$baseServer}agentes/${this.agenteId}/base-conocimiento/importar/excel`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${this.$storage.get('token')}` },
          body: formData,
        });
        const json = await response.json();
        const resultado = json.datos || json;

        if (resultado.creadas > 0 || resultado.actualizadas > 0) {
          this.$message.success(`${resultado.creadas} creadas, ${resultado.actualizadas} actualizadas`);
          await this.cargar();
        } else if (!resultado.errores || !resultado.errores.length) {
          this.$message.warning('No se encontraron preguntas en el archivo');
        }
        if (resultado.errores && resultado.errores.length) {
          const msg = resultado.errores.slice(0, 3).join(' | ');
          this.$message.warning(`${resultado.errores.length} error(es): ${msg}${resultado.errores.length > 3 ? '…' : ''}`);
        }
      } catch (e) {
        this.$message.error('Error al importar archivo');
      } finally {
        this.importando = false;
        event.target.value = '';
      }
    },
    abrir(item) {
      this.editando = item;
      this.form = item
        ? { pregunta: item.pregunta, respuesta: item.respuesta, categoria: item.categoria || '', orden: item.orden || 0, activo: item.activo }
        : { pregunta: '', respuesta: '', categoria: '', orden: 0, activo: true };
      this.dialog = true;
    },
    async guardar() {
      if (!this.form.pregunta.trim()) { this.$message.error('La pregunta es obligatoria'); return; }
      if (!this.form.respuesta.trim()) { this.$message.error('La respuesta es obligatoria'); return; }
      this.saving = true;
      try {
        if (this.editando) {
          const updated = await this.$service.put(`agentes/${this.agenteId}/base-conocimiento/${this.editando.id}`, this.form);
          const idx = this.items.findIndex(i => i.id === this.editando.id);
          if (idx !== -1) this.items.splice(idx, 1, updated);
          this.$message.success('Pregunta actualizada');
        } else {
          const created = await this.$service.post(`agentes/${this.agenteId}/base-conocimiento`, this.form);
          this.items.push(created);
          this.$message.success('Pregunta agregada');
        }
        this.dialog = false;
      } catch (e) {
        this.$message.error('Error al guardar');
      } finally {
        this.saving = false;
      }
    },
    confirmarEliminar(item) {
      this.eliminandoItem = item;
      this.dialogEliminar = true;
    },
    async eliminar() {
      this.deleting = true;
      try {
        await this.$service.delete(`agentes/${this.agenteId}/base-conocimiento/${this.eliminandoItem.id}`);
        this.items = this.items.filter(i => i.id !== this.eliminandoItem.id);
        this.$message.success('Pregunta eliminada');
        this.dialogEliminar = false;
      } catch (e) {
        this.$message.error('Error al eliminar');
      } finally {
        this.deleting = false;
      }
    },
    async toggleActivo(item) {
      try {
        const updated = await this.$service.put(`agentes/${this.agenteId}/base-conocimiento/${item.id}`, { activo: !item.activo });
        Object.assign(item, updated);
      } catch (e) {
        this.$message.error('Error al actualizar');
      }
    },
  },
};
</script>


<style scoped>
/* Toolbar */
.bk-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 10px;
}

.bk-toolbar-left,
.bk-toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.bk-input-search {
  width: 220px !important;
  padding: 7px 12px !important;
  font-size: 12px !important;
}

.bk-select-category {
  width: 170px !important;
  padding: 7px 12px !important;
  font-size: 12px !important;
}

/* Buttons */
.bk-add-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #6366f1;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 14px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.15s ease;
  white-space: nowrap;
  min-width: max-content;
}

.bk-add-btn:hover:not(:disabled) {
  background: #4f46e5;
}

.bk-add-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.bk-add-btn--success {
  background: #22c55e;
}

.bk-add-btn--success:hover:not(:disabled) {
  background: #16a34a;
}

.bk-add-btn--warning {
  background: #f59e0b;
}

.bk-add-btn--warning:hover:not(:disabled) {
  background: #d97706;
}

.bk-add-btn--loading {
  opacity: 0.7;
  pointer-events: none;
}

/* Modal */
.bk-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.65);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bk-modal {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 12px;
  width: 600px;
  max-width: 95vw;
  max-height: 90vh;
  overflow-y: auto;
  padding: 24px;
}
</style>
