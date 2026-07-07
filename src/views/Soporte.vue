<template>
  <div class="ide-page">
    <!-- Header -->
    <div style="display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:20px; flex-wrap:wrap; gap:12px;">
      <div>
        <h2 style="font-size:18px; font-weight:800; color:#f1f5f9; letter-spacing:-0.3px; margin-bottom:4px;">Centro de Soporte</h2>
        <p style="font-size:12px; color:#64748b;">Gestiona y da seguimiento a los casos de soporte de tus clientes</p>
      </div>
      <button class="btn-nuevo-caso" @click="dialogNuevoCaso = true">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Nuevo caso
      </button>
    </div>

    <!-- Stats -->
    <div style="display:grid; grid-template-columns:repeat(5,1fr); gap:10px; margin-bottom:20px;">
      <div class="ide-ia-card" style="padding:12px 14px; text-align:center;">
        <div style="font-size:22px; font-weight:900; color:#f1f5f9; line-height:1;">{{ estadisticas.total || 0 }}</div>
        <div style="font-size:10px; color:#64748b; margin-top:3px;">Total</div>
      </div>
      <div class="ide-ia-card" style="padding:12px 14px; text-align:center;">
        <div style="font-size:22px; font-weight:900; color:#ef4444; line-height:1;">{{ estadisticas.abiertos || 0 }}</div>
        <div style="font-size:10px; color:#64748b; margin-top:3px;">Abiertos</div>
      </div>
      <div class="ide-ia-card" style="padding:12px 14px; text-align:center;">
        <div style="font-size:22px; font-weight:900; color:#f59e0b; line-height:1;">{{ estadisticas.enProgreso || 0 }}</div>
        <div style="font-size:10px; color:#64748b; margin-top:3px;">En progreso</div>
      </div>
      <div class="ide-ia-card" style="padding:12px 14px; text-align:center;">
        <div style="font-size:22px; font-weight:900; color:#22c55e; line-height:1;">{{ estadisticas.resueltos || 0 }}</div>
        <div style="font-size:10px; color:#64748b; margin-top:3px;">Resueltos</div>
      </div>
      <div class="ide-ia-card" style="padding:12px 14px; text-align:center;">
        <div style="font-size:22px; font-weight:900; color:#818cf8; line-height:1;">{{ estadisticas.cerrados || 0 }}</div>
        <div style="font-size:10px; color:#64748b; margin-top:3px;">Cerrados</div>
      </div>
    </div>

    <!-- Filters -->
    <div style="display:flex; align-items:center; gap:10px; margin-bottom:16px; flex-wrap:wrap;">
      <input v-model="busqueda" class="ide-input" placeholder="Buscar caso..." style="width:260px; padding:8px 12px; font-size:12px;" />
      <select v-model="filtroEstado" class="ide-select" style="width:140px; padding:8px 12px; font-size:12px;">
        <option value="">Todos los estados</option>
        <option value="abierto">Abierto</option>
        <option value="en_progreso">En progreso</option>
        <option value="resuelto">Resuelto</option>
        <option value="cerrado">Cerrado</option>
      </select>
      <select v-model="filtroPrioridad" class="ide-select" style="width:140px; padding:8px 12px; font-size:12px;">
        <option value="">Todas prioridades</option>
        <option value="baja">Baja</option>
        <option value="media">Media</option>
        <option value="alta">Alta</option>
        <option value="urgente">Urgente</option>
      </select>
    </div>

    <!-- Loading -->
    <div v-if="loading" style="display:flex; justify-content:center; padding:56px;">
      <v-progress-circular indeterminate color="primary" size="36" />
    </div>

    <!-- Empty state -->
    <div v-else-if="casosFiltrados.length === 0" class="ide-ia-card" style="text-align:center; padding:56px; color:#475569;">
      <div style="font-size:36px; margin-bottom:12px;">🎫</div>
      <div style="font-size:14px; font-weight:700; color:#94a3b8; margin-bottom:6px;">Sin casos</div>
      <div style="font-size:12px;">Crea un nuevo caso para darle seguimiento a tus clientes</div>
    </div>

    <!-- Cases table -->
    <div v-else class="ide-ia-card" style="overflow-x:auto; padding:0;">
      <table class="sop-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Contacto</th>
            <th>Título</th>
            <th>Categoría</th>
            <th>Estado</th>
            <th>Prioridad</th>
            <th>Última actividad</th>
            <th>Seguim.</th>
            <th>Creado</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="caso in casosFiltrados" :key="caso.id" class="sop-row" @click="seleccionarCaso(caso)">
            <td style="font-weight:600; color:#64748b; font-size:11px; white-space:nowrap;">
              {{ caso.numeroCaso }}
              <span v-if="caso.conversacionId" style="color:#818cf8;" title="Creado desde una conversación">💬</span>
            </td>
            <td>
              <div style="font-weight:600; color:#e2e8f0;">{{ caso.nombreContacto }}</div>
              <div v-if="caso.telefonoContacto || caso.emailContacto" style="font-size:11px; color:#64748b;">{{ caso.telefonoContacto || caso.emailContacto }}</div>
            </td>
            <td style="color:#94a3b8; max-width:220px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" :title="caso.titulo">{{ caso.titulo }}</td>
            <td>
              <span v-if="caso.categoria" style="background:#6366f122; color:#818cf8; padding:2px 8px; border-radius:4px; font-size:11px;">{{ caso.categoria }}</span>
              <span v-else style="color:#475569;">—</span>
            </td>
            <td>
              <span class="sop-badge" :style="{ background: estadoColor(caso.estadoCaso)+'22', color: estadoColor(caso.estadoCaso) }">{{ estadoLabel(caso.estadoCaso) }}</span>
            </td>
            <td>
              <span :style="{ color: prioridadColor(caso.prioridad) }" style="font-size:11px; font-weight:700; text-transform:uppercase;">{{ caso.prioridad }}</span>
            </td>
            <td style="font-size:11px; color:#94a3b8; white-space:nowrap;">
              <template v-if="ultimaActividad(caso)">
                <div>{{ ultimaActividad(caso).accion }}</div>
                <div style="font-size:10px; color:#64748b;">{{ formatDateTime(ultimaActividad(caso).timestamp) }}</div>
              </template>
              <span v-else style="color:#475569;">—</span>
            </td>
            <td style="text-align:center;">
              <span style="background:#6366f122; color:#818cf8; padding:2px 8px; border-radius:4px; font-size:11px; font-weight:700;">{{ (caso.historial || []).length }}</span>
            </td>
            <td style="font-size:11px; color:#64748b; white-space:nowrap;">{{ formatDate(caso.fechaCreacion) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal: Nuevo Caso -->
    <div v-if="dialogNuevoCaso" class="sop-overlay" @click.self="dialogNuevoCaso = false">
      <div style="background:#1e293b; border:1px solid #334155; border-radius:12px; width:480px; max-width:95vw; padding:24px;">
        <div style="font-size:15px; font-weight:700; color:#f1f5f9; margin-bottom:16px;">Crear nuevo caso de soporte</div>
        <div style="display:flex; flex-direction:column; gap:12px; margin-bottom:16px;">
          <div class="ide-field">
            <label>Título *</label>
            <input v-model="formNuevoCaso.titulo" class="ide-input" placeholder="Resumen del problema" />
          </div>
          <div class="ide-field">
            <label>Descripción *</label>
            <textarea v-model="formNuevoCaso.descripcion" class="ide-textarea" rows="3" placeholder="Detalles del caso..."></textarea>
          </div>
          <div class="ide-field">
            <label>Nombre del contacto *</label>
            <input v-model="formNuevoCaso.nombreContacto" class="ide-input" placeholder="Ej: Juan García" />
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
            <div class="ide-field">
              <label>Prioridad</label>
              <select v-model="formNuevoCaso.prioridad" class="ide-select">
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>
            <div class="ide-field">
              <label>Categoría</label>
              <input v-model="formNuevoCaso.categoria" class="ide-input" placeholder="Ej: Técnico" />
            </div>
          </div>
        </div>
        <div style="display:flex; justify-content:flex-end; gap:8px;">
          <button @click="dialogNuevoCaso = false" style="background:none; border:1px solid #334155; border-radius:8px; color:#64748b; padding:8px 14px; font-size:12px; cursor:pointer; font-family:inherit;">Cancelar</button>
          <button @click="crearCaso" :disabled="creandoCaso" style="background:#6366f1; color:#fff; border:none; border-radius:8px; padding:8px 16px; font-size:12px; font-weight:600; cursor:pointer; font-family:inherit; display:flex; align-items:center; gap:6px;">
            <v-progress-circular v-if="creandoCaso" indeterminate size="14" width="2" color="white"></v-progress-circular>
            Crear caso
          </button>
        </div>
      </div>
    </div>

    <!-- Modal: Detalle Caso -->
    <div v-if="casoSeleccionado" class="sop-overlay" @click.self="casoSeleccionado = null">
      <div style="background:#1e293b; border:1px solid #334155; border-radius:12px; width:600px; max-width:95vw; max-height:90vh; overflow-y:auto; padding:24px;">
        <!-- Header -->
        <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:20px;">
          <div>
            <div style="font-size:12px; font-weight:600; color:#64748b; margin-bottom:4px;">{{ casoSeleccionado.numeroCaso }}</div>
            <div style="font-size:16px; font-weight:700; color:#f1f5f9;">{{ casoSeleccionado.titulo }}</div>
          </div>
          <button @click="casoSeleccionado = null" style="background:none; border:none; cursor:pointer; color:#475569; font-size:20px; padding:0;">×</button>
        </div>

        <!-- Info grid -->
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:20px; padding-bottom:20px; border-bottom:1px solid #334155;">
          <div>
            <div style="font-size:10px; font-weight:600; color:#64748b; margin-bottom:4px;">Estado</div>
            <select v-model="casoSeleccionado.estadoCaso" @change="actualizarCaso" class="ide-select" style="width:100%;">
              <option value="abierto">Abierto</option>
              <option value="en_progreso">En progreso</option>
              <option value="resuelto">Resuelto</option>
              <option value="cerrado">Cerrado</option>
            </select>
          </div>
          <div>
            <div style="font-size:10px; font-weight:600; color:#64748b; margin-bottom:4px;">Prioridad</div>
            <select v-model="casoSeleccionado.prioridad" @change="actualizarCaso" class="ide-select" style="width:100%;">
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
              <option value="urgente">Urgente</option>
            </select>
          </div>
          <div>
            <div style="font-size:10px; font-weight:600; color:#64748b; margin-bottom:4px;">Contacto</div>
            <div style="font-size:12px; color:#f1f5f9;">{{ casoSeleccionado.nombreContacto }}</div>
            <div v-if="casoSeleccionado.telefonoContacto" style="font-size:11px; color:#64748b;">📱 {{ casoSeleccionado.telefonoContacto }}</div>
          </div>
          <div>
            <div style="font-size:10px; font-weight:600; color:#64748b; margin-bottom:4px;">Creado</div>
            <div style="font-size:12px; color:#f1f5f9;">{{ formatDate(casoSeleccionado.fechaCreacion) }}</div>
          </div>
        </div>

        <!-- Description -->
        <div style="margin-bottom:20px;">
          <div style="font-size:12px; font-weight:600; color:#e2e8f0; margin-bottom:8px;">Descripción</div>
          <div style="font-size:11px; color:#94a3b8; line-height:1.6; white-space:pre-wrap;">{{ casoSeleccionado.descripcion }}</div>
        </div>

        <!-- Historial -->
        <div style="margin-bottom:20px;">
          <div style="font-size:12px; font-weight:600; color:#e2e8f0; margin-bottom:10px;">Historial de seguimiento</div>
          <div style="display:flex; flex-direction:column; gap:8px; max-height:200px; overflow-y:auto;">
            <div v-for="(entrada, i) in casoSeleccionado.historial" :key="i" style="font-size:11px; padding:8px; background:#0f172a; border-radius:6px;">
              <div style="color:#818cf8; margin-bottom:2px;">{{ entrada.accion }}</div>
              <div style="color:#64748b;">{{ entrada.detalles }}</div>
              <div style="color:#475569; font-size:9px;">{{ formatTime(entrada.timestamp) }}</div>
            </div>
          </div>
        </div>

        <!-- Nueva nota -->
        <div style="margin-bottom:16px;">
          <div style="font-size:12px; font-weight:600; color:#e2e8f0; margin-bottom:8px;">Agregar nota</div>
          <textarea v-model="nuevaNota" class="ide-textarea" rows="2" placeholder="Escribe tu nota..." style="margin-bottom:8px;"></textarea>
          <button @click="agregarNota" :disabled="!nuevaNota.trim()" style="background:#6366f1; color:#fff; border:none; border-radius:8px; padding:8px 16px; font-size:12px; font-weight:600; cursor:pointer; font-family:inherit;">Agregar nota</button>
        </div>

        <!-- Close button -->
        <div style="display:flex; justify-content:flex-end; gap:8px;">
          <button @click="casoSeleccionado = null" style="background:none; border:1px solid #334155; border-radius:8px; color:#64748b; padding:8px 14px; font-size:12px; cursor:pointer; font-family:inherit;">Cerrar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Soporte',
  data: () => ({
    casos: [],
    loading: false,
    busqueda: '',
    filtroEstado: '',
    filtroPrioridad: '',
    dialogNuevoCaso: false,
    creandoCaso: false,
    casoSeleccionado: null,
    nuevaNota: '',
    estadisticas: {},
    formNuevoCaso: {
      titulo: '',
      descripcion: '',
      nombreContacto: '',
      prioridad: 'media',
      categoria: '',
    },
  }),
  computed: {
    casosFiltrados() {
      let list = this.casos;
      if (this.filtroEstado) {
        list = list.filter(c => c.estadoCaso === this.filtroEstado);
      }
      if (this.filtroPrioridad) {
        list = list.filter(c => c.prioridad === this.filtroPrioridad);
      }
      if (this.busqueda.trim()) {
        const q = this.busqueda.toLowerCase();
        list = list.filter(c =>
          c.numeroCaso.toLowerCase().includes(q) ||
          c.titulo.toLowerCase().includes(q) ||
          c.nombreContacto.toLowerCase().includes(q)
        );
      }
      return list.sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion));
    },
  },
  async mounted() {
    await this.cargar();
    await this.cargarEstadisticas();

    // Si viene desde Pipeline con parámetros, precarga el formulario
    if (this.$route.query.crear === '1') {
      this.formNuevo.titulo = this.$route.query.nombre || '';
      this.formNuevo.nombreContacto = this.$route.query.nombre || '';
      this.formNuevo.telefonoContacto = this.$route.query.contacto || '';
      if (this.$route.query.conversacionId) {
        this.formNuevo.conversacionId = this.$route.query.conversacionId;
      }
      this.dialogNuevo = true;
      // Limpiar query para que no se repita al volver
      this.$router.replace({ query: {} }).catch(() => {});
    }
  },
  methods: {
    async cargar() {
      this.loading = true;
      try {
        const data = await this.$service.list('soporte');
        this.casos = data || [];
      } finally {
        this.loading = false;
      }
    },
    async cargarEstadisticas() {
      try {
        this.estadisticas = await this.$service.get('soporte/estadisticas') || {};
      } catch (_e) {
        // ignore errors
      }
    },
    async crearCaso() {
      if (!this.formNuevoCaso.titulo.trim() || !this.formNuevoCaso.descripcion.trim()) {
        this.$message && this.$message.warning('Completa todos los campos requeridos');
        return;
      }
      try {
        this.creandoCaso = true;
        const caso = await this.$service.post('soporte', this.formNuevoCaso);
        this.casos.unshift(caso);
        this.dialogNuevoCaso = false;
        this.formNuevoCaso = { titulo: '', descripcion: '', nombreContacto: '', prioridad: 'media', categoria: '' };
        this.$message && this.$message.success('Caso creado correctamente');
        await this.cargarEstadisticas();
      } catch (e) {
        this.$message && this.$message.error('Error al crear caso');
      } finally {
        this.creandoCaso = false;
      }
    },
    async seleccionarCaso(caso) {
      try {
        this.casoSeleccionado = await this.$service.get(`soporte/${caso.id}`);
        this.nuevaNota = '';
      } catch (e) {
        this.$message && this.$message.error('Error al cargar caso');
      }
    },
    async actualizarCaso() {
      if (!this.casoSeleccionado) return;
      try {
        const datos = await this.$service.patch(`soporte/${this.casoSeleccionado.id}`, {
          estadoCaso: this.casoSeleccionado.estadoCaso,
          prioridad: this.casoSeleccionado.prioridad,
        });
        if (datos) {
          this.casoSeleccionado = datos;
          const idx = this.casos.findIndex(c => c.id === this.casoSeleccionado.id);
          if (idx !== -1) {
            this.casos[idx] = datos;
          }
          this.$message && this.$message.success('Caso actualizado');
          await this.cargarEstadisticas();
        }
      } catch (e) {
        this.$message && this.$message.error('Error al actualizar');
      }
    },
    async agregarNota() {
      if (!this.casoSeleccionado || !this.nuevaNota.trim()) return;
      try {
        const datos = await this.$service.post(`soporte/${this.casoSeleccionado.id}/notas`, {
          nota: this.nuevaNota,
        });
        if (datos) {
          this.casoSeleccionado = datos;
          this.nuevaNota = '';
          this.$message && this.$message.success('Nota agregada');
        }
      } catch (e) {
        this.$message && this.$message.error('Error al agregar nota');
      }
    },
    prioridadColor(p) {
      const map = { urgente: '#ef4444', alta: '#f59e0b', media: '#818cf8', baja: '#3b82f6' };
      return map[p] || '#64748b';
    },
    estadoColor(e) {
      const map = { abierto: '#ef4444', en_progreso: '#f59e0b', resuelto: '#22c55e', cerrado: '#64748b' };
      return map[e] || '#64748b';
    },
    estadoLabel(e) {
      const map = { abierto: 'Abierto', en_progreso: 'En progreso', resuelto: 'Resuelto', cerrado: 'Cerrado' };
      return map[e] || e;
    },
    formatDate(d) {
      if (!d) return '';
      return new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
    },
    formatTime(d) {
      if (!d) return '';
      return new Date(d).toLocaleString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
    },
    formatDateTime(d) {
      if (!d) return '';
      return new Date(d).toLocaleString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
    },
    ultimaActividad(caso) {
      const h = caso.historial || [];
      return h.length ? h[h.length - 1] : null;
    },
  },
};
</script>

<style scoped>
.sop-table { width: 100%; border-collapse: collapse; font-size: 12px; }
.sop-table th {
  text-align: left; padding: 10px 12px; color: #64748b; font-size: 10px;
  text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #1e3a5f44;
  white-space: nowrap;
}
.sop-table td { padding: 10px 12px; border-bottom: 1px solid #1e3a5f22; vertical-align: middle; }
.sop-row { cursor: pointer; transition: background 0.12s; }
.sop-row:hover { background: #1e293b66; }
.sop-badge {
  padding: 3px 9px; border-radius: 5px; font-size: 10px; font-weight: 700;
  white-space: nowrap; display: inline-block;
}

.btn-nuevo-caso {
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
.btn-nuevo-caso:hover { background: #4f46e5; }

.sop-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.65);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
