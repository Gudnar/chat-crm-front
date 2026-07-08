<template>
  <div class="ide-page">

    <!-- Header -->
    <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:20px;">
      <div>
        <div class="section-title">Equipo de Agentes Humanos</div>
        <p class="section-subtitle" style="margin-bottom:0;">Operadores con credenciales propias para el seguimiento de conversaciones</p>
      </div>
      <button class="ah-new-btn" @click="abrirDialog()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Nuevo Agente Humano
      </button>
    </div>

    <!-- Métricas del equipo -->
    <div class="ah-metrics">
      <div class="ide-ia-card ah-metric">
        <div class="ah-metric__value">{{ agentes.length }}</div>
        <div class="ah-metric__label">Agentes</div>
      </div>
      <div class="ide-ia-card ah-metric">
        <div class="ah-metric__value" style="color:#22c55e;">{{ disponiblesCount }}</div>
        <div class="ah-metric__label">Disponibles</div>
      </div>
      <div class="ide-ia-card ah-metric">
        <div class="ah-metric__value" style="color:#f59e0b;">{{ activasTotal }}</div>
        <div class="ah-metric__label">Conv. activas</div>
      </div>
      <div class="ide-ia-card ah-metric">
        <div class="ah-metric__value" style="color:#818cf8;">{{ cola.length }}</div>
        <div class="ah-metric__label">En cola</div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" style="display:flex; justify-content:center; padding:48px;">
      <div class="ah-spinner"></div>
    </div>

    <template v-else>
      <!-- Empty state -->
      <div v-if="agentes.length === 0" class="ide-ia-card" style="text-align:center; padding:48px;">
        <div style="font-size:48px; margin-bottom:16px;">🧑‍💼</div>
        <div style="color:#e2e8f0; font-size:15px; font-weight:700; margin-bottom:8px;">Aún no hay agentes humanos</div>
        <div style="color:#64748b; font-size:13px; margin-bottom:24px;">Crea el primero para asignarle conversaciones. Tendrá sus propias credenciales de acceso.</div>
        <button class="ah-new-btn" @click="abrirDialog()">Crear primer agente</button>
      </div>

      <!-- Grid de agentes -->
      <div v-else class="ah-grid">
        <div v-for="ag in agentes" :key="ag.id" class="ide-ia-card ide-ia-card--hover ah-card">
          <div class="ah-card__hd">
            <div class="ah-avatar" :style="{ background: ag.color+'22', color: ag.color }">
              {{ ag.avatar }}
              <span class="ah-session-dot" :style="{ background: ag.sesionActiva ? '#22c55e' : '#475569' }" :title="ag.sesionActiva ? 'Sesión activa' : 'Sin sesión'"></span>
            </div>
            <div style="flex:1; min-width:0;">
              <div class="ah-name">{{ ag.nombre }}</div>
              <div class="ah-user">@{{ ag.credenciales ? ag.credenciales.usuario : '—' }}</div>
            </div>
            <div style="display:flex; gap:4px;">
              <button class="ah-ico-btn" @click.stop="verEstadisticas(ag)" title="Estadísticas">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>
              </button>
              <button class="ah-ico-btn" @click.stop="abrirDialog(ag)" title="Editar">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button class="ah-ico-btn ah-ico-btn--del" @click.stop="confirmarEliminar(ag)" title="Eliminar">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
              </button>
            </div>
          </div>

          <p class="ah-desc">{{ ag.descripcion || 'Sin descripción' }}</p>

          <div class="ah-footer">
            <span class="ah-badge" :style="badgeDisponibilidad(ag.estadoDisponibilidad)">
              ● {{ etiquetaDisponibilidad(ag.estadoDisponibilidad) }}
            </span>
            <span v-for="esp in (ag.especialidades || []).slice(0, 2)" :key="esp" class="ah-badge" style="background:#6366f122; color:#818cf8;">{{ esp }}</span>
            <div style="margin-left:auto; font-size:11px; color:#64748b;">{{ ag.conversacionesActivas || 0 }} activas</div>
          </div>
        </div>
      </div>

      <!-- Cola de conversaciones sin asignar -->
      <div class="ide-ia-card" style="margin-top:24px; padding:18px;">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:14px;">
          <div>
            <div style="font-size:14px; font-weight:700; color:#e2e8f0;">Cola de conversaciones</div>
            <div style="font-size:11px; color:#64748b;">Escaladas o sin agente asignado</div>
          </div>
          <button class="ah-auto-btn" :disabled="cola.length === 0 || asignandoAuto" @click="asignacionAutomatica">
            <span v-if="asignandoAuto" class="ah-spinner ah-spinner--sm ah-spinner--white"></span>
            ⚡ Asignación automática
          </button>
        </div>

        <div v-if="cola.length === 0" style="text-align:center; padding:20px; color:#475569; font-size:12px;">
          🎉 No hay conversaciones pendientes de asignar
        </div>

        <div v-else class="ah-cola">
          <div v-for="conv in cola" :key="conv.id" class="ah-cola__item">
            <div style="flex:1; min-width:0;">
              <div style="font-size:12px; font-weight:700; color:#e2e8f0;">{{ conv.contacto }}</div>
              <div style="font-size:10px; color:#64748b;">
                {{ conv.canal }} · {{ conv.totalMensajes }} mensajes
                <span v-if="conv.escalado" style="color:#ef4444; font-weight:700;"> · ESCALADA</span>
              </div>
            </div>
            <select v-model="seleccionAgente[conv.id]" class="ide-select ah-cola__select">
              <option :value="undefined" disabled>Asignar a…</option>
              <option v-for="ag in agentes.filter(a => a.activo)" :key="ag.id" :value="ag.id">
                {{ ag.avatar }} {{ ag.nombre }} ({{ etiquetaDisponibilidad(ag.estadoDisponibilidad) }})
              </option>
            </select>
            <button class="ah-asignar-btn" :disabled="!seleccionAgente[conv.id]" @click="asignar(conv)">Asignar</button>
          </div>
        </div>
      </div>
    </template>

    <!-- Modal crear/editar -->
    <transition name="modal-fade">
      <div v-if="dialog" class="ah-modal-backdrop" @mousedown.self="dialog = false">
        <div class="ah-modal">
          <div class="ah-modal-header">
            <span>{{ editando ? 'Editar Agente Humano' : 'Nuevo Agente Humano' }}</span>
            <button class="ah-modal-close" @click="dialog = false">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="ah-modal-body">
            <div class="ah-section-label">Datos personales</div>
            <div class="ah-form-grid">
              <div class="ide-field">
                <label>Nombres *</label>
                <input v-model="form.nombres" class="ide-input" placeholder="Carlos" />
              </div>
              <div class="ide-field">
                <label>Apellidos</label>
                <input v-model="form.apellidos" class="ide-input" placeholder="Mendoza" />
              </div>
              <div class="ide-field ah-form-full">
                <label>Correo electrónico</label>
                <input v-model="form.correoElectronico" class="ide-input" type="email" placeholder="carlos@empresa.com" />
              </div>
            </div>

            <div class="ah-section-label" style="margin-top:16px;">Credenciales de acceso</div>
            <div class="ah-form-grid">
              <div class="ide-field">
                <label>Usuario *</label>
                <input v-model="form.usuario" class="ide-input" placeholder="carlos.mendoza" :disabled="!!editando" />
              </div>
              <div class="ide-field">
                <label>{{ editando ? 'Nueva contraseña (opcional)' : 'Contraseña *' }}</label>
                <input v-model="form.contrasena" class="ide-input" type="password" placeholder="Mínimo 6 caracteres" />
              </div>
            </div>

            <div class="ah-section-label" style="margin-top:16px;">Perfil</div>
            <div class="ah-form-grid">
              <div class="ide-field">
                <label>Avatar (emoji)</label>
                <input v-model="form.avatar" class="ide-input" placeholder="🧑‍💼" maxlength="4" />
              </div>
              <div class="ide-field">
                <label>Color</label>
                <input v-model="form.color" class="ide-input" type="color" style="height:36px; padding:2px;" />
              </div>
              <div class="ide-field ah-form-full">
                <label>Especialidades (separadas por coma)</label>
                <input v-model="especialidadesTexto" class="ide-input" placeholder="ventas, soporte técnico, facturación" />
              </div>
              <div class="ide-field ah-form-full">
                <label>Descripción</label>
                <input v-model="form.descripcion" class="ide-input" placeholder="Agente senior de ventas" />
              </div>
            </div>
          </div>
          <div class="ah-modal-footer">
            <button class="ah-btn-cancel" @click="dialog = false">Cancelar</button>
            <button class="ah-btn-ok" :disabled="saving" @click="guardar">
              <span v-if="saving" class="ah-spinner ah-spinner--sm ah-spinner--white"></span>
              {{ editando ? 'Actualizar' : 'Crear Agente' }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Modal estadísticas -->
    <transition name="modal-fade">
      <div v-if="statsDialog" class="ah-modal-backdrop" @mousedown.self="statsDialog = false">
        <div class="ah-modal" style="max-width:440px;">
          <div class="ah-modal-header">
            <span>Estadísticas — {{ stats.nombre }}</span>
            <button class="ah-modal-close" @click="statsDialog = false">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="ah-modal-body">
            <div class="ah-stats-grid">
              <div class="ah-stat"><div class="ah-stat__v">{{ stats.activas }}</div><div class="ah-stat__l">Activas</div></div>
              <div class="ah-stat"><div class="ah-stat__v" style="color:#22c55e;">{{ stats.resueltas }}</div><div class="ah-stat__l">Resueltas</div></div>
              <div class="ah-stat"><div class="ah-stat__v" style="color:#f59e0b;">{{ stats.asignadasHoy }}</div><div class="ah-stat__l">Hoy</div></div>
              <div class="ah-stat"><div class="ah-stat__v" style="color:#ef4444;">{{ stats.escaladas }}</div><div class="ah-stat__l">Escaladas</div></div>
              <div class="ah-stat"><div class="ah-stat__v">{{ stats.tiempoPromedioMinutos }}m</div><div class="ah-stat__l">T. promedio</div></div>
              <div class="ah-stat"><div class="ah-stat__v" style="color:#818cf8;">{{ stats.tasaResolucion }}%</div><div class="ah-stat__l">Resolución</div></div>
            </div>
          </div>
        </div>
      </div>
    </transition>

  </div>
</template>

<script>
const FORM_VACIO = {
  nombres: '', apellidos: '', correoElectronico: '',
  usuario: '', contrasena: '',
  avatar: '🧑‍💼', color: '#22c55e',
  descripcion: '',
};

export default {
  name: 'AgentesHumanos',
  data: () => ({
    agentes: [],
    cola: [],
    loading: true,
    dialog: false,
    saving: false,
    editando: null,
    asignandoAuto: false,
    statsDialog: false,
    stats: {},
    seleccionAgente: {},
    form: { ...FORM_VACIO },
    especialidadesTexto: '',
  }),
  computed: {
    disponiblesCount() {
      return this.agentes.filter(a => a.estadoDisponibilidad === 'disponible').length;
    },
    activasTotal() {
      return this.agentes.reduce((sum, a) => sum + (a.conversacionesActivas || 0), 0);
    },
  },
  async mounted() {
    await this.cargar();
  },
  methods: {
    // Multi-tenant: el SUPER_ADMIN administra el equipo del cliente seleccionado
    // en el modulo Clientes; sin esto el backend rechaza la peticion.
    conCliente(url) {
      const user = this.$storage.get('user') || {};
      if (user.rol !== 'SUPER_ADMIN') return url;
      const clienteId = this.$store.getters.clienteId;
      if (!clienteId) return url;
      return url + (url.includes('?') ? '&' : '?') + 'clienteId=' + clienteId;
    },
    sinClienteSeleccionado() {
      const user = this.$storage.get('user') || {};
      return user.rol === 'SUPER_ADMIN' && !this.$store.getters.clienteId;
    },
    async cargar() {
      if (this.sinClienteSeleccionado()) {
        this.$message.warning('Selecciona un cliente en el modulo Clientes (boton Gestionar) para administrar su equipo humano');
        this.agentes = [];
        this.cola = [];
        this.loading = false;
        return;
      }
      try {
        this.loading = true;
        const [agentes, cola] = await Promise.all([
          this.$service.list(this.conCliente('agentes-humanos')),
          this.$service.list(this.conCliente('agentes-humanos/cola')),
        ]);
        this.agentes = agentes || [];
        this.cola = cola || [];
        this.seleccionAgente = {};
      } finally {
        this.loading = false;
      }
    },
    abrirDialog(ag = null) {
      if (ag) {
        this.editando = ag;
        this.form = {
          nombres: ag.credenciales?.nombres || ag.nombre,
          apellidos: ag.credenciales?.apellidos || '',
          correoElectronico: ag.credenciales?.correoElectronico || '',
          usuario: ag.credenciales?.usuario || '',
          contrasena: '',
          avatar: ag.avatar,
          color: ag.color,
          descripcion: ag.descripcion || '',
        };
        this.especialidadesTexto = (ag.especialidades || []).join(', ');
      } else {
        this.editando = null;
        this.form = { ...FORM_VACIO };
        this.especialidadesTexto = '';
      }
      this.dialog = true;
    },
    async guardar() {
      if (!this.form.nombres) { this.$message.error('El nombre es obligatorio'); return; }
      if (!this.editando && (!this.form.usuario || !this.form.contrasena)) {
        this.$message.error('Usuario y contraseña son obligatorios'); return;
      }
      if (this.form.contrasena && this.form.contrasena.length < 6) {
        this.$message.error('La contraseña debe tener al menos 6 caracteres'); return;
      }
      this.saving = true;
      try {
        const payload = {
          ...this.form,
          especialidades: this.especialidadesTexto.split(',').map(s => s.trim()).filter(Boolean),
        };
        if (!payload.contrasena) delete payload.contrasena;
        if (!payload.correoElectronico) delete payload.correoElectronico;
        if (this.editando) {
          delete payload.usuario;
          await this.$service.put(this.conCliente(`agentes-humanos/${this.editando.id}`), payload);
          this.$message.success('Agente actualizado');
        } else {
          await this.$service.post(this.conCliente('agentes-humanos'), payload);
          this.$message.success('Agente creado. Ya puede iniciar sesión con sus credenciales.');
        }
        this.dialog = false;
        await this.cargar();
      } finally {
        this.saving = false;
      }
    },
    confirmarEliminar(ag) {
      this.$confirm(`¿Eliminar al agente "${ag.nombre}"? Sus credenciales quedarán desactivadas.`, async () => {
        await this.$service.delete(this.conCliente(`agentes-humanos/${ag.id}`));
        this.$message.success('Agente eliminado');
        await this.cargar();
      });
    },
    async verEstadisticas(ag) {
      this.stats = await this.$service.get(this.conCliente(`agentes-humanos/${ag.id}/estadisticas`)) || {};
      this.statsDialog = true;
    },
    async asignar(conv) {
      const agenteHumanoId = this.seleccionAgente[conv.id];
      if (!agenteHumanoId) return;
      await this.$service.post(this.conCliente('agentes-humanos/asignar'), {
        conversacionId: conv.id,
        agenteHumanoId,
        razon: 'Asignación manual desde panel de equipo',
        esEscalada: !!conv.escalado,
      });
      this.$message.success('Conversación asignada');
      await this.cargar();
    },
    async asignacionAutomatica() {
      this.asignandoAuto = true;
      try {
        const res = await this.$service.post(this.conCliente('agentes-humanos/asignacion-automatica'), {});
        this.$message.success(res?.mensaje || `${res?.asignadas ?? 0} conversación(es) asignada(s)`);
        await this.cargar();
      } finally {
        this.asignandoAuto = false;
      }
    },
    etiquetaDisponibilidad(estado) {
      const map = { disponible: 'Disponible', ocupado: 'Ocupado', ausente: 'Ausente', inactivo: 'Inactivo' };
      return map[estado] || estado;
    },
    badgeDisponibilidad(estado) {
      const map = {
        disponible: { background: '#22c55e22', color: '#22c55e' },
        ocupado:    { background: '#f59e0b22', color: '#f59e0b' },
        ausente:    { background: '#ef444422', color: '#ef4444' },
        inactivo:   { background: '#47556922', color: '#64748b' },
      };
      return map[estado] || map.inactivo;
    },
  },
};
</script>

<style scoped>
.ah-metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; margin-bottom: 20px; }
.ah-metric { padding: 14px; text-align: center; }
.ah-metric__value { font-size: 22px; font-weight: 800; color: #e2e8f0; }
.ah-metric__label { font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 2px; }

.ah-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 14px; }
.ah-card { padding: 14px; }

.ah-card__hd { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
.ah-avatar { width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; position: relative; }
.ah-session-dot { position: absolute; bottom: -2px; right: -2px; width: 9px; height: 9px; border-radius: 50%; border: 2px solid #0d1526; }
.ah-name { font-size: 14px; font-weight: 700; color: #e2e8f0; }
.ah-user { font-size: 11px; color: #64748b; margin-top: 1px; }

.ah-ico-btn { background: none; border: none; cursor: pointer; color: #475569; padding: 4px; border-radius: 5px; display: flex; transition: color 0.15s; }
.ah-ico-btn:hover { color: #94a3b8; }
.ah-ico-btn--del:hover { color: #ef4444; }

.ah-desc { font-size: 12px; color: #64748b; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin: 0 0 12px; }
.ah-footer { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.ah-badge { font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 999px; }

.ah-new-btn {
  display: inline-flex; align-items: center; gap: 6px;
  background: #22c55e; color: #fff; border: none; border-radius: 8px;
  padding: 8px 14px; font-size: 12px; font-weight: 700; cursor: pointer;
  transition: background 0.15s; font-family: inherit;
}
.ah-new-btn:hover { background: #16a34a; }

.ah-auto-btn {
  display: inline-flex; align-items: center; gap: 6px;
  background: #6366f1; color: #fff; border: none; border-radius: 8px;
  padding: 7px 12px; font-size: 11px; font-weight: 700; cursor: pointer;
  transition: background 0.15s; font-family: inherit;
}
.ah-auto-btn:hover:not(:disabled) { background: #4f46e5; }
.ah-auto-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.ah-cola { display: flex; flex-direction: column; gap: 8px; }
.ah-cola__item {
  display: flex; align-items: center; gap: 10px;
  background: #0f172a; border: 1px solid #1e3a5f44; border-radius: 8px;
  padding: 10px 12px;
}
.ah-cola__select { max-width: 220px; font-size: 11px; }
.ah-asignar-btn {
  background: #22c55e; color: #fff; border: none; border-radius: 6px;
  padding: 6px 12px; font-size: 11px; font-weight: 700; cursor: pointer;
  font-family: inherit; flex-shrink: 0;
}
.ah-asignar-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.ah-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.ah-form-full { grid-column: span 2; }
.ah-section-label { font-size: 11px; font-weight: 700; color: #818cf8; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 10px; }

.ah-stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.ah-stat { background: #0f172a; border-radius: 8px; padding: 14px 10px; text-align: center; }
.ah-stat__v { font-size: 20px; font-weight: 800; color: #e2e8f0; }
.ah-stat__l { font-size: 9px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 2px; }

/* Modal */
.ah-modal-backdrop {
  position: fixed; inset: 0; background: rgba(0,0,0,0.6);
  backdrop-filter: blur(2px); display: flex; align-items: center;
  justify-content: center; z-index: 9999;
}
.ah-modal {
  background: #1e293b; border: 1px solid #334155; border-radius: 12px;
  width: 100%; max-width: 560px; box-shadow: 0 20px 60px rgba(0,0,0,0.5);
  display: flex; flex-direction: column; max-height: 90vh;
}
.ah-modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 24px 14px; font-size: 15px; font-weight: 700; color: #f1f5f9;
  border-bottom: 1px solid #1e3a5f33; flex-shrink: 0;
}
.ah-modal-close { background: none; border: none; color: #475569; cursor: pointer; padding: 2px; border-radius: 4px; display: flex; }
.ah-modal-close:hover { color: #94a3b8; }
.ah-modal-body { padding: 20px 24px; overflow-y: auto; flex: 1; }
.ah-modal-footer {
  display: flex; justify-content: flex-end; gap: 8px;
  padding: 14px 24px 20px; border-top: 1px solid #1e3a5f33; flex-shrink: 0;
}
.ah-btn-cancel {
  background: transparent; border: 1px solid #334155; color: #64748b;
  border-radius: 8px; padding: 8px 16px; font-size: 12px; font-weight: 600;
  cursor: pointer; font-family: inherit; transition: border-color 0.15s;
}
.ah-btn-cancel:hover { border-color: #475569; color: #94a3b8; }
.ah-btn-ok {
  background: #22c55e; color: #fff; border: none; border-radius: 8px;
  padding: 8px 20px; font-size: 12px; font-weight: 700; cursor: pointer;
  font-family: inherit; display: inline-flex; align-items: center; gap: 6px;
  transition: background 0.15s;
}
.ah-btn-ok:hover:not(:disabled) { background: #16a34a; }
.ah-btn-ok:disabled { opacity: 0.6; cursor: not-allowed; }

.ah-spinner {
  width: 36px; height: 36px; border-radius: 50%;
  border: 3px solid #22c55e; border-top-color: transparent;
  animation: ah-spin 0.75s linear infinite;
}
.ah-spinner--sm { width: 14px; height: 14px; border-width: 2px; }
.ah-spinner--white { border-color: #fff; border-top-color: transparent; }
@keyframes ah-spin { to { transform: rotate(360deg); } }

.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.2s; }
.modal-fade-enter, .modal-fade-leave-to { opacity: 0; }
</style>
