<template>
  <div class="ide-page">

    <!-- Header -->
    <div style="display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:20px; flex-wrap:wrap; gap:12px;">
      <div>
        <h2 style="font-size:18px; font-weight:800; color:#f1f5f9; letter-spacing:-0.3px; margin-bottom:4px;">Oportunidades</h2>
        <p style="font-size:12px; color:#64748b;">Pipeline de ventas: seguimiento de cada prospecto desde el primer contacto hasta la compra</p>
      </div>
      <button class="btn-add" @click="abrirCrear">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Nueva oportunidad
      </button>
    </div>

    <!-- Métricas -->
    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(140px, 1fr)); gap:10px; margin-bottom:20px;">
      <div class="ide-ia-card" style="padding:12px 14px; text-align:center;">
        <div style="font-size:22px; font-weight:900; color:#f1f5f9; line-height:1;">{{ stats.abiertas || 0 }}</div>
        <div style="font-size:10px; color:#64748b; margin-top:3px;">Abiertas</div>
      </div>
      <div class="ide-ia-card" style="padding:12px 14px; text-align:center;">
        <div style="font-size:18px; font-weight:900; color:#3b82f6; line-height:1.3;">{{ formatoMonto(stats.montoPipeline) }}</div>
        <div style="font-size:10px; color:#64748b; margin-top:3px;">En pipeline</div>
      </div>
      <div class="ide-ia-card" style="padding:12px 14px; text-align:center;">
        <div style="font-size:22px; font-weight:900; color:#22c55e; line-height:1;">{{ stats.ganadas || 0 }}</div>
        <div style="font-size:10px; color:#64748b; margin-top:3px;">Ganadas · {{ formatoMonto(stats.montoGanado) }}</div>
      </div>
      <div class="ide-ia-card" style="padding:12px 14px; text-align:center;">
        <div style="font-size:22px; font-weight:900; color:#818cf8; line-height:1;">{{ stats.tasaConversion || 0 }}%</div>
        <div style="font-size:10px; color:#64748b; margin-top:3px;">Conversión</div>
      </div>
      <div class="ide-ia-card" style="padding:12px 14px; text-align:center;" :style="stats.seguimientosVencidos > 0 ? 'border-color:#ef4444;' : ''">
        <div style="font-size:22px; font-weight:900; line-height:1;" :style="{ color: stats.seguimientosVencidos > 0 ? '#ef4444' : '#f1f5f9' }">{{ stats.seguimientosVencidos || 0 }}</div>
        <div style="font-size:10px; color:#64748b; margin-top:3px;">⚠️ Seguim. vencidos</div>
      </div>
    </div>

    <!-- Filtros -->
    <div style="display:flex; align-items:center; gap:10px; margin-bottom:16px; flex-wrap:wrap;">
      <input
        v-model="busqueda"
        class="ide-input"
        placeholder="Buscar contacto, empresa, teléfono, producto…"
        style="width:280px; padding:8px 12px; font-size:12px;"
        @input="cargarDebounce"
      />
      <select v-model="filtroEstado" class="ide-select" style="width:190px; padding:8px 12px; font-size:12px;" @change="pagina = 1; cargar()">
        <option value="">Todos los estados</option>
        <option v-for="e in estadosPipeline" :key="e.valor" :value="e.valor">{{ e.label }}</option>
      </select>
      <select v-model="filtroPrioridad" class="ide-select" style="width:150px; padding:8px 12px; font-size:12px;" @change="pagina = 1; cargar()">
        <option value="">Todas prioridades</option>
        <option value="alta">Alta</option>
        <option value="media">Media</option>
        <option value="baja">Baja</option>
      </select>
      <select v-model="filtroAsignado" class="ide-select" style="width:190px; padding:8px 12px; font-size:12px;" @change="pagina = 1; cargar()">
        <option value="">Todos los responsables</option>
        <option v-for="u in usuariosAsignables" :key="u.id" :value="u.id">{{ u.nombre }}</option>
      </select>
      <button
        v-if="busqueda || filtroEstado || filtroPrioridad || filtroAsignado"
        @click="limpiarFiltros"
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
    <div v-else-if="!oportunidades.length" class="ide-ia-card" style="text-align:center; padding:56px; color:#475569;">
      <div style="font-size:36px; margin-bottom:12px;">🎯</div>
      <div style="font-size:14px; font-weight:700; color:#94a3b8; margin-bottom:6px;">
        {{ hayFiltros ? 'Sin resultados' : 'Sin oportunidades' }}
      </div>
      <div style="font-size:12px;">
        {{ hayFiltros ? 'Intenta con otros filtros' : 'Crea la primera oportunidad para empezar a hacer seguimiento a tus prospectos' }}
      </div>
    </div>

    <!-- Tabla -->
    <div v-else class="ide-ia-card" style="overflow-x:auto; padding:0;">
      <table class="opp-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Contacto</th>
            <th>Primer mensaje</th>
            <th>Empresa</th>
            <th>Producto de interés</th>
            <th>Estado</th>
            <th>Monto</th>
            <th>Responsable</th>
            <th>Próxima acción</th>
            <th>Prioridad</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="o in oportunidades" :key="o.id" class="opp-row" @click="abrirDetalle(o)">
            <td style="font-weight:600; color:#64748b; font-size:11px; white-space:nowrap;">{{ o.numeroOportunidad }}</td>
            <td>
              <div style="font-weight:600; color:#e2e8f0;">{{ o.contactoNombre }}</div>
              <div style="font-size:11px; color:#64748b;">{{ o.contactoTelefono || o.contactoEmail || '' }}</div>
            </td>
            <td style="color:#94a3b8; font-size:11px; white-space:nowrap;">
              {{ o.fechaPrimerContacto ? formatoFechaHora(o.fechaPrimerContacto) : '—' }}
            </td>
            <td style="color:#94a3b8;">{{ o.empresa || '—' }}</td>
            <td style="color:#94a3b8; max-width:180px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" :title="o.productoInteres">{{ o.productoInteres || '—' }}</td>
            <td>
              <span class="opp-badge" :style="badgeEstado(o.estadoOportunidad)">{{ labelEstado(o.estadoOportunidad) }}</span>
            </td>
            <td style="color:#e2e8f0; font-weight:600; white-space:nowrap;">
              {{ o.montoEstimado != null ? `${o.moneda} ${formatoNumero(o.montoEstimado)}` : '—' }}
            </td>
            <td style="color:#94a3b8;">{{ o.asignadoNombre || '—' }}</td>
            <td>
              <div v-if="o.proximaAccion" :style="{ color: accionVencida(o) ? '#ef4444' : '#94a3b8', fontWeight: accionVencida(o) ? '700' : '400' }" style="font-size:11px; max-width:180px;">
                {{ accionVencida(o) ? '⚠️ ' : '' }}{{ o.proximaAccion }}
                <div style="font-size:10px; opacity:0.8;">{{ formatoFecha(o.proximaAccionFecha) }}</div>
              </div>
              <span v-else style="color:#475569;">—</span>
            </td>
            <td>
              <span :style="{ color: colorPrioridad(o.prioridad) }" style="font-size:11px; font-weight:700; text-transform:uppercase;">{{ o.prioridad }}</span>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Paginación -->
      <div style="display:flex; align-items:center; justify-content:space-between; gap:12px; padding:12px 16px; border-top:1px solid #1e3a5f44; flex-wrap:wrap;">
        <div style="font-size:11px; color:#64748b;">Mostrando {{ oportunidades.length }} de {{ total }} oportunidades</div>
        <div style="display:flex; align-items:center; gap:6px;">
          <button class="opp-page-btn" :disabled="pagina <= 1" @click="irPagina(pagina - 1)">‹ Anterior</button>
          <span style="font-size:11px; color:#94a3b8; padding:0 8px; font-weight:700;">Página {{ pagina }} de {{ totalPaginas }}</span>
          <button class="opp-page-btn" :disabled="pagina >= totalPaginas" @click="irPagina(pagina + 1)">Siguiente ›</button>
        </div>
      </div>
    </div>

    <!-- Modal: Crear -->
    <div v-if="dialogCrear" class="opp-overlay" @click.self="dialogCrear = false">
      <div class="opp-modal">
        <div class="opp-modal-header">
          <span style="font-size:15px; font-weight:700; color:#f1f5f9;">Nueva oportunidad</span>
          <button class="opp-close" @click="dialogCrear = false">×</button>
        </div>
        <div class="opp-modal-body">
          <div class="opp-grid2">
            <div>
              <label class="opp-label">Nombre del contacto *</label>
              <input v-model="formCrear.contactoNombre" class="ide-input opp-input" placeholder="Juan Pérez" />
            </div>
            <div>
              <label class="opp-label">Teléfono</label>
              <input v-model="formCrear.contactoTelefono" class="ide-input opp-input" placeholder="+591 71234567" />
            </div>
            <div>
              <label class="opp-label">Email</label>
              <input v-model="formCrear.contactoEmail" class="ide-input opp-input" placeholder="correo@ejemplo.com" />
            </div>
            <div>
              <label class="opp-label">Empresa</label>
              <input v-model="formCrear.empresa" class="ide-input opp-input" placeholder="Opcional" />
            </div>
            <div>
              <label class="opp-label">Origen</label>
              <select v-model="formCrear.origen" class="ide-select opp-input">
                <option value="whatsapp">WhatsApp</option>
                <option value="facebook">Facebook</option>
                <option value="instagram">Instagram</option>
                <option value="referencia">Referencia</option>
                <option value="web">Web</option>
                <option value="otro">Otro</option>
              </select>
            </div>
            <div>
              <label class="opp-label">Prioridad</label>
              <select v-model="formCrear.prioridad" class="ide-select opp-input">
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
              </select>
            </div>
            <div>
              <label class="opp-label">Monto estimado</label>
              <input v-model.number="formCrear.montoEstimado" type="number" min="0" class="ide-input opp-input" placeholder="0.00" />
            </div>
            <div>
              <label class="opp-label">Moneda</label>
              <select v-model="formCrear.moneda" class="ide-select opp-input">
                <option value="USD">USD</option>
                <option value="BOB">BOB</option>
                <option value="PEN">PEN</option>
              </select>
            </div>
          </div>
          <div style="margin-top:12px;">
            <label class="opp-label">Producto de interés</label>
            <input v-model="formCrear.productoInteres" class="ide-input opp-input" placeholder="Ej. TOYOTA BZ5 2025 Pro 550" />
          </div>
          <div style="margin-top:12px;">
            <label class="opp-label">Responsable del seguimiento (equipo humano)</label>
            <select v-model="formCrear.asignadoA" class="ide-select opp-input">
              <option value="">Sin asignar</option>
              <option v-for="u in usuariosAsignables" :key="u.id" :value="u.id">{{ u.nombre }}</option>
            </select>
            <div v-if="!usuariosAsignables.length" style="font-size:11px; color:#f59e0b; margin-top:4px;">
              No hay agentes humanos registrados — créalos en «Equipo Humano»
            </div>
          </div>
          <div style="margin-top:12px;">
            <label class="opp-label">Notas</label>
            <textarea v-model="formCrear.notas" class="ide-input opp-input" rows="2" style="resize:vertical;" placeholder="Contexto inicial del prospecto…"></textarea>
          </div>
        </div>
        <div class="opp-modal-actions">
          <button class="opp-btn-sec" @click="dialogCrear = false">Cancelar</button>
          <button class="opp-btn-pri" :disabled="!formCrear.contactoNombre || guardando" @click="crear">
            {{ guardando ? 'Guardando…' : 'Crear oportunidad' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal: Detalle -->
    <div v-if="sel" class="opp-overlay" @click.self="cerrarDetalle">
      <div class="opp-modal" style="max-width:760px;">
        <div class="opp-modal-header">
          <div>
            <div style="font-size:11px; font-weight:600; color:#64748b;">{{ sel.numeroOportunidad }}</div>
            <span style="font-size:15px; font-weight:700; color:#f1f5f9;">{{ sel.contactoNombre }}</span>
            <span v-if="sel.empresa" style="font-size:12px; color:#64748b;"> · {{ sel.empresa }}</span>
            <div v-if="sel.fechaPrimerContacto" style="font-size:11px; color:#64748b; margin-top:2px;">
              💬 Primer mensaje: {{ formatoFechaHora(sel.fechaPrimerContacto) }}
            </div>
          </div>
          <div style="display:flex; align-items:center; gap:10px;">
            <button v-if="esAdmin" class="opp-close" style="color:#ef4444; font-size:13px;" title="Eliminar" @click="eliminarSel">🗑</button>
            <button class="opp-close" @click="cerrarDetalle">×</button>
          </div>
        </div>

        <div class="opp-modal-body">
          <!-- Estado del pipeline -->
          <div style="margin-bottom:16px;">
            <label class="opp-label">Estado del pipeline</label>
            <div style="display:flex; flex-wrap:wrap; gap:6px; margin-top:4px;">
              <button
                v-for="e in estadosPipeline"
                :key="e.valor"
                class="opp-estado-btn"
                :style="sel.estadoOportunidad === e.valor ? { background: e.color + '33', borderColor: e.color, color: e.color, fontWeight: '800' } : {}"
                @click="cambiarEstado(e.valor)"
              >
                {{ e.label }}
              </button>
            </div>
            <div v-if="sel.motivoCierre" style="margin-top:8px; font-size:12px; color:#94a3b8; background:#0f172a; border-radius:8px; padding:8px 12px;">
              <b>Motivo de cierre:</b> {{ sel.motivoCierre }}
              <span v-if="sel.fechaCierre" style="color:#64748b;"> · {{ formatoFecha(sel.fechaCierre) }}</span>
            </div>
          </div>

          <!-- Datos -->
          <div class="opp-grid2" style="padding-bottom:16px; border-bottom:1px solid #334155;">
            <div>
              <label class="opp-label">Teléfono</label>
              <input v-model="sel.contactoTelefono" class="ide-input opp-input" @change="guardarCampos" />
            </div>
            <div>
              <label class="opp-label">Email</label>
              <input v-model="sel.contactoEmail" class="ide-input opp-input" @change="guardarCampos" />
            </div>
            <div>
              <label class="opp-label">Producto de interés</label>
              <input v-model="sel.productoInteres" class="ide-input opp-input" @change="guardarCampos" />
            </div>
            <div style="display:grid; grid-template-columns:1fr 90px; gap:8px;">
              <div>
                <label class="opp-label">Monto estimado</label>
                <input v-model.number="sel.montoEstimado" type="number" min="0" class="ide-input opp-input" @change="guardarCampos" />
              </div>
              <div>
                <label class="opp-label">Moneda</label>
                <select v-model="sel.moneda" class="ide-select opp-input" @change="guardarCampos">
                  <option value="USD">USD</option>
                  <option value="BOB">BOB</option>
                  <option value="PEN">PEN</option>
                </select>
              </div>
            </div>
            <div>
              <label class="opp-label">Prioridad</label>
              <select v-model="sel.prioridad" class="ide-select opp-input" @change="guardarCampos">
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
              </select>
            </div>
            <div>
              <label class="opp-label">Responsable (equipo humano)</label>
              <select v-model="asignadoSel" class="ide-select opp-input" :disabled="!esAdmin" @change="asignar">
                <option value="">Sin asignar</option>
                <option v-if="asignadoSel && !usuariosAsignables.some(u => u.id === asignadoSel)" :value="asignadoSel">{{ sel.asignadoNombre || 'Asignado actual' }}</option>
                <option v-for="u in usuariosAsignables" :key="u.id" :value="u.id">{{ u.nombre }}</option>
              </select>
            </div>
          </div>

          <!-- Registrar seguimiento -->
          <div style="padding:16px 0; border-bottom:1px solid #334155;">
            <label class="opp-label" style="font-size:12px; color:#e2e8f0;">📝 Registrar seguimiento</label>
            <textarea v-model="segNota" class="ide-input opp-input" rows="2" style="resize:vertical; margin-top:6px;" placeholder="¿Qué se hizo? (opcional si solo programas la próxima acción)"></textarea>
            <div style="display:grid; grid-template-columns:1fr 170px auto; gap:8px; margin-top:8px; align-items:end;">
              <div>
                <label class="opp-label">Próxima acción</label>
                <input v-model="segAccion" class="ide-input opp-input" placeholder="Ej. Enviar cotización" />
              </div>
              <div>
                <label class="opp-label">Fecha límite</label>
                <input v-model="segFecha" type="datetime-local" class="ide-input opp-input" />
              </div>
              <button class="opp-btn-pri" style="height:34px;" :disabled="(!segNota && !segAccion) || guardando" @click="registrarSeguimiento">
                {{ guardando ? 'Guardando…' : 'Guardar' }}
              </button>
            </div>
          </div>

          <!-- Historial -->
          <div style="padding-top:16px;">
            <label class="opp-label" style="font-size:12px; color:#e2e8f0;">Historial de seguimiento</label>
            <div style="max-height:240px; overflow-y:auto; margin-top:8px; display:flex; flex-direction:column; gap:8px;">
              <div v-for="h in historialOrdenado" :key="h.idx" style="display:flex; gap:10px; background:#0f172a; border-radius:8px; padding:8px 12px;">
                <span style="font-size:14px; flex-shrink:0;">{{ iconoAccion(h.accion) }}</span>
                <div style="flex:1; min-width:0;">
                  <!-- Modo edición -->
                  <template v-if="editandoHistorial === h.idx">
                    <textarea v-model="editHistorialTexto" class="ide-input opp-input" rows="2" style="resize:vertical;"></textarea>
                    <div style="display:flex; gap:6px; margin-top:6px;">
                      <button class="opp-btn-pri" style="padding:4px 12px; font-size:11px;" :disabled="!editHistorialTexto || guardandoHistorial" @click="guardarHistorial">
                        {{ guardandoHistorial ? 'Guardando…' : 'Guardar' }}
                      </button>
                      <button class="opp-btn-sec" style="padding:4px 12px; font-size:11px;" @click="editandoHistorial = null">Cancelar</button>
                    </div>
                  </template>
                  <!-- Modo lectura -->
                  <template v-else>
                    <div style="font-size:12px; color:#e2e8f0;">{{ h.detalles }}</div>
                    <div style="font-size:10px; color:#64748b; margin-top:2px;">
                      <b>{{ h.usuarioNombre }}</b> · {{ formatoFechaHora(h.timestamp) }}
                      <span v-if="h.editado" :title="'Corregido por ' + (h.editadoPor || '') + ' el ' + formatoFechaHora(h.editadoEn)" style="color:#f59e0b;"> · (editado)</span>
                    </div>
                  </template>
                </div>
                <button
                  v-if="puedeEditarHistorial(h) && editandoHistorial !== h.idx"
                  style="background:none; border:none; cursor:pointer; color:#64748b; font-size:12px; padding:2px; flex-shrink:0; align-self:flex-start;"
                  title="Corregir este seguimiento"
                  @click="iniciarEdicionHistorial(h)"
                >✏️</button>
              </div>
              <div v-if="!historialOrdenado.length" style="font-size:12px; color:#475569; text-align:center; padding:12px;">Sin actividad registrada</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: motivo de cierre -->
    <div v-if="dialogMotivo" class="opp-overlay" style="z-index:10001;" @click.self="dialogMotivo = false">
      <div class="opp-modal" style="max-width:420px;">
        <div class="opp-modal-header">
          <span style="font-size:14px; font-weight:700; color:#f1f5f9;">
            {{ estadoPendiente === 'perdida' ? '¿Por qué se perdió?' : '¿Por qué canceló?' }}
          </span>
          <button class="opp-close" @click="dialogMotivo = false">×</button>
        </div>
        <div class="opp-modal-body">
          <textarea v-model="motivoCierre" class="ide-input opp-input" rows="3" style="resize:vertical;" placeholder="Ej. Compró con la competencia, precio fuera de presupuesto…"></textarea>
        </div>
        <div class="opp-modal-actions">
          <button class="opp-btn-sec" @click="dialogMotivo = false">Cancelar</button>
          <button class="opp-btn-pri" style="background:#ef4444;" :disabled="!motivoCierre" @click="confirmarCierre">Confirmar</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
const ESTADOS = [
  { valor: 'prospecto',           label: 'Prospecto',        color: '#64748b' },
  { valor: 'necesita-cotizacion', label: 'Necesita cotiz.',  color: '#f59e0b' },
  { valor: 'cotizacion-enviada',  label: 'Cotiz. enviada',   color: '#3b82f6' },
  { valor: 'reunion-pendiente',   label: 'Reunión pend.',    color: '#8b5cf6' },
  { valor: 'reunion-realizada',   label: 'Reunión hecha',    color: '#a855f7' },
  { valor: 'negociacion',         label: 'Negociación',      color: '#ec4899' },
  { valor: 'ganada',              label: '✓ Ganada',         color: '#22c55e' },
  { valor: 'perdida',             label: 'Perdida',          color: '#ef4444' },
  { valor: 'cancelada',           label: 'Cancelada',        color: '#78716c' },
];

export default {
  name: 'Oportunidades',
  data() {
    return {
      oportunidades: [],
      stats: {},
      usuariosAsignables: [],
      loading: false,
      guardando: false,
      busqueda: '',
      filtroEstado: '',
      filtroPrioridad: '',
      filtroAsignado: '',
      pagina: 1,
      totalPaginas: 1,
      total: 0,
      limite: 25,
      debounceTimer: null,
      estadosPipeline: ESTADOS,
      dialogCrear: false,
      formCrear: this.formVacio(),
      sel: null,
      asignadoSel: '',
      segNota: '',
      segAccion: '',
      segFecha: '',
      editandoHistorial: null,
      editHistorialTexto: '',
      guardandoHistorial: false,
      dialogMotivo: false,
      estadoPendiente: '',
      motivoCierre: '',
    };
  },
  computed: {
    hayFiltros() {
      return !!(this.busqueda || this.filtroEstado || this.filtroPrioridad || this.filtroAsignado);
    },
    esAdmin() {
      const rol = (this.$storage.get('user') || {}).rol;
      return rol !== 'AGENTE_HUMANO';
    },
    historialOrdenado() {
      // idx = posición real en el array (necesaria para editar), mostrado en orden inverso
      const h = (this.sel && this.sel.historial) || [];
      return h.map((e, i) => ({ ...e, idx: i })).reverse();
    },
  },
  async mounted() {
    await Promise.all([this.cargar(), this.cargarStats(), this.cargarUsuarios()]);
  },
  methods: {
    formVacio() {
      return {
        contactoNombre: '', contactoTelefono: '', contactoEmail: '', empresa: '',
        origen: 'whatsapp', prioridad: 'media', montoEstimado: null, moneda: 'USD',
        productoInteres: '', asignadoA: '', notas: '',
      };
    },
    async cargar() {
      this.loading = true;
      try {
        const data = await this.$service.list('oportunidades', {
          q: this.busqueda || undefined,
          estado: this.filtroEstado || undefined,
          prioridad: this.filtroPrioridad || undefined,
          asignadoA: this.filtroAsignado || undefined,
          pagina: this.pagina,
          limite: this.limite,
        });
        this.oportunidades = (data && data.items) || [];
        this.total = (data && data.total) || 0;
        this.pagina = (data && data.pagina) || 1;
        this.totalPaginas = (data && data.totalPaginas) || 1;
      } finally {
        this.loading = false;
      }
    },
    async cargarStats() {
      try {
        this.stats = (await this.$service.list('oportunidades/estadisticas')) || {};
      } catch (e) { this.stats = {}; }
    },
    async cargarUsuarios() {
      try {
        this.usuariosAsignables = (await this.$service.list('oportunidades/usuarios-asignables')) || [];
      } catch (e) { this.usuariosAsignables = []; }
    },
    cargarDebounce() {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => { this.pagina = 1; this.cargar(); }, 400);
    },
    limpiarFiltros() {
      this.busqueda = '';
      this.filtroEstado = '';
      this.filtroPrioridad = '';
      this.filtroAsignado = '';
      this.pagina = 1;
      this.cargar();
    },
    irPagina(p) {
      if (p < 1 || p > this.totalPaginas || p === this.pagina) return;
      this.pagina = p;
      this.cargar();
    },
    refrescar() {
      this.cargar();
      this.cargarStats();
    },

    // ── Crear ──
    abrirCrear() {
      this.formCrear = this.formVacio();
      this.dialogCrear = true;
    },
    async crear() {
      this.guardando = true;
      try {
        const payload = { ...this.formCrear };
        if (!payload.asignadoA) delete payload.asignadoA;
        if (payload.montoEstimado == null || payload.montoEstimado === '') delete payload.montoEstimado;
        await this.$service.post('oportunidades', payload);
        this.$message.success('Oportunidad creada');
        this.dialogCrear = false;
        this.refrescar();
      } catch (e) {
        this.$message.error('No se pudo crear la oportunidad');
      } finally {
        this.guardando = false;
      }
    },

    // ── Detalle ──
    async abrirDetalle(o) {
      try {
        const data = await this.$service.get('oportunidades', o.id);
        this.sel = data || { ...o };
      } catch (e) {
        this.sel = { ...o };
      }
      this.asignadoSel = this.sel.asignadoA || '';
      this.segNota = '';
      this.segAccion = this.sel.proximaAccion || '';
      this.segFecha = '';
    },
    cerrarDetalle() {
      // Actualiza solo la fila editada en la tabla, sin recargar toda la página
      if (this.sel) {
        const idx = this.oportunidades.findIndex(o => o.id === this.sel.id);
        if (idx !== -1) this.$set(this.oportunidades, idx, { ...this.oportunidades[idx], ...this.sel });
      }
      this.sel = null;
      this.editandoHistorial = null;
      this.cargarStats(); // métricas al día, sin tocar la tabla
    },
    async guardarCampos() {
      if (!this.sel) return;
      try {
        await this.$service.put(`oportunidades/${this.sel.id}`, {
          contactoTelefono: this.sel.contactoTelefono || undefined,
          contactoEmail: this.sel.contactoEmail || undefined,
          productoInteres: this.sel.productoInteres || undefined,
          montoEstimado: this.sel.montoEstimado != null && this.sel.montoEstimado !== '' ? Number(this.sel.montoEstimado) : undefined,
          moneda: this.sel.moneda,
          prioridad: this.sel.prioridad,
        });
      } catch (e) {
        this.$message.error('No se pudo guardar el cambio');
      }
    },
    cambiarEstado(nuevo) {
      if (!this.sel || this.sel.estadoOportunidad === nuevo) return;
      if (nuevo === 'perdida' || nuevo === 'cancelada') {
        this.estadoPendiente = nuevo;
        this.motivoCierre = '';
        this.dialogMotivo = true;
        return;
      }
      this.aplicarEstado(nuevo);
    },
    async confirmarCierre() {
      this.dialogMotivo = false;
      await this.aplicarEstado(this.estadoPendiente, this.motivoCierre);
    },
    async aplicarEstado(estado, motivo) {
      try {
        const data = await this.$service.patch(`oportunidades/${this.sel.id}/estado`, { estado, motivo });
        this.sel = data || this.sel;
        this.$message.success('Estado actualizado');
      } catch (e) {
        this.$message.error('No se pudo cambiar el estado');
      }
    },
    async asignar() {
      if (!this.sel || !this.asignadoSel) return;
      try {
        const data = await this.$service.patch(`oportunidades/${this.sel.id}/asignar`, { usuarioId: this.asignadoSel });
        this.sel = data || this.sel;
        this.$message.success('Responsable asignado');
      } catch (e) {
        this.$message.error('No se pudo asignar');
      }
    },
    async registrarSeguimiento() {
      if (!this.sel || (!this.segNota && !this.segAccion)) return;
      this.guardando = true;
      try {
        const data = await this.$service.post(`oportunidades/${this.sel.id}/seguimiento`, {
          nota: this.segNota || undefined,
          proximaAccion: this.segAccion || undefined,
          proximaAccionFecha: this.segFecha ? new Date(this.segFecha).toISOString() : undefined,
        });
        this.sel = data || this.sel;
        this.segNota = '';
        this.$message.success('Seguimiento registrado');
      } catch (e) {
        this.$message.error('No se pudo registrar el seguimiento');
      } finally {
        this.guardando = false;
      }
    },
    puedeEditarHistorial(h) {
      return ['seguimiento', 'nota'].includes(h.accion);
    },
    iniciarEdicionHistorial(h) {
      this.editandoHistorial = h.idx;
      this.editHistorialTexto = h.detalles;
    },
    async guardarHistorial() {
      if (!this.sel || this.editandoHistorial === null || !this.editHistorialTexto) return;
      this.guardandoHistorial = true;
      try {
        const data = await this.$service.patch(`oportunidades/${this.sel.id}/historial`, {
          indice: this.editandoHistorial,
          detalles: this.editHistorialTexto,
        });
        this.sel = data || this.sel;
        this.editandoHistorial = null;
        this.$message.success('Seguimiento corregido');
      } catch (e) {
        this.$message.error('No se pudo corregir la entrada');
      } finally {
        this.guardandoHistorial = false;
      }
    },
    eliminarSel() {
      if (!this.sel) return;
      this.$confirm('¿Eliminar esta oportunidad? Esta acción no se puede deshacer.', async () => {
        try {
          await this.$service.delete('oportunidades', this.sel.id);
          this.$message.success('Oportunidad eliminada');
          this.sel = null;
          this.refrescar();
        } catch (e) {
          this.$message.error('No se pudo eliminar');
        }
      });
    },

    // ── Formatos ──
    labelEstado(v) {
      const e = ESTADOS.find(x => x.valor === v);
      return e ? e.label : v;
    },
    badgeEstado(v) {
      const e = ESTADOS.find(x => x.valor === v) || { color: '#64748b' };
      return { background: e.color + '22', color: e.color };
    },
    colorPrioridad(p) {
      return { alta: '#ef4444', media: '#f59e0b', baja: '#64748b' }[p] || '#64748b';
    },
    iconoAccion(a) {
      return {
        creacion: '✨', 'cambio-estado': '🔄', seguimiento: '📝',
        asignacion: '👤', nota: '💬', edicion: '✏️',
      }[a] || '•';
    },
    accionVencida(o) {
      return o.proximaAccionFecha && new Date(o.proximaAccionFecha) < new Date()
        && !['ganada', 'perdida', 'cancelada'].includes(o.estadoOportunidad);
    },
    formatoNumero(n) {
      return Number(n).toLocaleString('es-BO', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    },
    formatoMonto(n) {
      if (n == null) return '$0';
      return '$' + Number(n).toLocaleString('es-BO', { maximumFractionDigits: 0 });
    },
    formatoFecha(f) {
      if (!f) return '';
      return new Date(f).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' });
    },
    formatoFechaHora(f) {
      if (!f) return '';
      return new Date(f).toLocaleString('es-BO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
    },
  },
};
</script>

<style scoped>
.opp-table { width: 100%; border-collapse: collapse; font-size: 12px; }
.opp-table th {
  text-align: left; padding: 10px 12px; color: #64748b; font-size: 10px;
  text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #1e3a5f44;
  white-space: nowrap;
}
.opp-table td { padding: 10px 12px; border-bottom: 1px solid #1e3a5f22; vertical-align: middle; }
.opp-row { cursor: pointer; transition: background 0.12s; }
.opp-row:hover { background: #1e293b66; }

.opp-badge {
  padding: 3px 9px; border-radius: 5px; font-size: 10px; font-weight: 700;
  white-space: nowrap; display: inline-block;
}

.opp-page-btn {
  background: transparent; border: 1px solid #334155; color: #94a3b8;
  border-radius: 6px; padding: 5px 10px; font-size: 11px; font-weight: 600;
  cursor: pointer; font-family: inherit;
}
.opp-page-btn:hover:not(:disabled) { border-color: #6366f1; color: #e2e8f0; }
.opp-page-btn:disabled { opacity: 0.35; cursor: not-allowed; }

.opp-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.65); z-index: 9999;
  display: flex; align-items: center; justify-content: center; padding: 20px;
}
.opp-modal {
  background: #1e293b; border: 1px solid #334155; border-radius: 14px;
  width: 100%; max-width: 640px; max-height: 90vh; display: flex; flex-direction: column;
}
.opp-modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 20px 12px; border-bottom: 1px solid #334155; flex-shrink: 0;
}
.opp-modal-body { padding: 16px 20px; overflow-y: auto; }
.opp-modal-actions {
  display: flex; justify-content: flex-end; gap: 8px;
  padding: 12px 20px 16px; border-top: 1px solid #334155; flex-shrink: 0;
}
.opp-close {
  background: none; border: none; font-size: 20px; cursor: pointer;
  color: #64748b; line-height: 1; padding: 2px 6px;
}

.opp-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.opp-label { display: block; font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 4px; }
.opp-input { width: 100%; padding: 8px 10px; font-size: 12px; box-sizing: border-box; }

.opp-estado-btn {
  background: transparent; border: 1px solid #334155; color: #94a3b8;
  border-radius: 6px; padding: 5px 10px; font-size: 11px; font-weight: 600;
  cursor: pointer; font-family: inherit; transition: all 0.15s;
}
.opp-estado-btn:hover { border-color: #6366f1; }

.opp-btn-pri {
  background: #6366f1; color: #fff; border: none; border-radius: 8px;
  padding: 8px 16px; font-size: 12px; font-weight: 700; cursor: pointer; font-family: inherit;
}
.opp-btn-pri:disabled { opacity: 0.5; cursor: not-allowed; }
.opp-btn-sec {
  background: none; border: 1px solid #334155; color: #94a3b8;
  border-radius: 8px; padding: 8px 16px; font-size: 12px; font-weight: 600;
  cursor: pointer; font-family: inherit;
}

@media (max-width: 640px) {
  .opp-grid2 { grid-template-columns: 1fr; }
}
</style>
