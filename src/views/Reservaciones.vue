<template>
  <div class="ide-page">

    <!-- Header -->
    <div style="display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:20px; flex-wrap:wrap; gap:12px;">
      <div>
        <h2 class="section-title">Reservaciones</h2>
        <p class="section-subtitle">Citas y reservas con agentes IA o humanos</p>
      </div>
      <button v-if="tab === 'reservas'" class="btn-add" @click="abrirNuevaReserva">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Nueva reserva
      </button>
    </div>

    <!-- Tabs -->
    <div style="display:flex; gap:6px; margin-bottom:18px; border-bottom:1px solid var(--border);">
      <button
        v-for="t in [{ id: 'reservas', label: 'Reservas' }, { id: 'config', label: 'Horarios y Servicios' }]"
        :key="t.id"
        @click="tab = t.id"
        :style="tabStyle(t.id)"
      >{{ t.label }}</button>
    </div>

    <!-- ══════════════ TAB: RESERVAS ══════════════ -->
    <template v-if="tab === 'reservas'">
      <div style="display:flex; align-items:center; gap:10px; margin-bottom:16px; flex-wrap:wrap;">
        <select v-model="filtroAgente" class="ide-select" style="width:200px; padding:8px 12px; font-size:12px;" @change="cargar">
          <option value="">Todos los agentes</option>
          <option v-for="a in agentes" :key="a.id" :value="a.id">{{ a.nombre }} ({{ a.tipoAgente === 'humano' ? 'Humano' : 'IA' }})</option>
        </select>
        <select v-model="filtroEstado" class="ide-select" style="width:160px; padding:8px 12px; font-size:12px;" @change="cargar">
          <option value="">Todos los estados</option>
          <option v-for="e in ESTADOS" :key="e" :value="e">{{ ESTADO_LABEL[e] }}</option>
        </select>
        <template v-if="vistaCalendario === 'lista'">
          <input type="date" v-model="filtroDesde" class="ide-input" style="width:150px; padding:8px 12px; font-size:12px;" @change="cargar" />
          <input type="date" v-model="filtroHasta" class="ide-input" style="width:150px; padding:8px 12px; font-size:12px;" @change="cargar" />
          <button
            v-if="filtroAgente || filtroEstado || filtroDesde || filtroHasta"
            @click="filtroAgente=''; filtroEstado=''; filtroDesde=''; filtroHasta=''; cargar()"
            style="background:none; border:1px solid var(--border); border-radius:8px; color:var(--text-faint); padding:7px 12px; font-size:12px; cursor:pointer; font-family:inherit;"
          >Limpiar</button>
        </template>
      </div>

      <!-- Selector de vista -->
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; flex-wrap:wrap; gap:10px;">
        <div style="display:flex; gap:4px; background:var(--bg-page); border:1px solid var(--border); border-radius:8px; padding:3px;">
          <button
            v-for="v in [{ id: 'lista', label: 'Lista' }, { id: 'dia', label: 'Día' }, { id: 'semana', label: 'Semana' }, { id: 'mes', label: 'Mes' }]"
            :key="v.id"
            @click="cambiarVista(v.id)"
            :style="vistaBtnStyle(v.id)"
          >{{ v.label }}</button>
        </div>

        <div v-if="vistaCalendario !== 'lista'" style="display:flex; align-items:center; gap:10px;">
          <button @click="navegar(-1)" class="btn-mini" style="padding:6px 10px;">‹</button>
          <button @click="irHoy" class="btn-mini" style="padding:6px 10px;">Hoy</button>
          <button @click="navegar(1)" class="btn-mini" style="padding:6px 10px;">›</button>
          <span style="font-size:13px; font-weight:700; color:var(--text-primary); min-width:160px; text-align:center;">{{ etiquetaRango }}</span>
        </div>
      </div>

      <div v-if="loading" style="display:flex; justify-content:center; padding:56px;">
        <v-progress-circular indeterminate color="primary" size="36" />
      </div>

      <div v-else-if="!reservas.length" class="ide-ia-card" style="text-align:center; padding:56px; color:var(--text-disabled);">
        <div style="font-size:36px; margin-bottom:12px;">📅</div>
        <div style="font-size:14px; font-weight:700; color:var(--text-muted); margin-bottom:6px;">Sin reservas</div>
        <div style="font-size:12px;">Crea la primera reserva con un agente IA o humano</div>
      </div>

      <!-- Vista LISTA -->
      <div v-else-if="vistaCalendario === 'lista'" style="display:flex; flex-direction:column; gap:10px;">
        <div v-for="r in reservas" :key="r.id" class="ide-ia-card" style="padding:14px 16px;">
          <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:12px; flex-wrap:wrap;">
            <div style="min-width:220px;">
              <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
                <span style="font-size:13px; font-weight:700; color:var(--text-heading);">{{ r.titulo }}</span>
                <span :style="estadoBadgeStyle(r.estadoReserva)">{{ ESTADO_LABEL[r.estadoReserva] || r.estadoReserva }}</span>
              </div>
              <div style="font-size:11px; color:var(--text-faint);">{{ r.codigoReserva }} · {{ nombreAgente(r.agenteId) }} ({{ r.tipoAgenteReserva === 'humano' ? 'Humano' : 'IA' }})</div>
              <div style="font-size:11px; color:var(--text-muted); margin-top:2px;">{{ r.contactoNombre }} <span v-if="r.contactoTelefono">· {{ r.contactoTelefono }}</span></div>
            </div>
            <div style="text-align:right; min-width:140px;">
              <div style="font-size:13px; font-weight:700; color:var(--text-primary);">{{ formatearFechaHora(r.fechaInicio) }}</div>
              <div style="font-size:11px; color:var(--text-faint);">{{ r.duracionMinutos }} min</div>
            </div>
            <div style="display:flex; gap:6px; flex-wrap:wrap;">
              <button v-if="r.estadoReserva === 'confirmada'" @click="cambiarEstado(r, 'completada')" class="btn-mini btn-mini--ok">Completar</button>
              <button v-if="r.estadoReserva === 'confirmada'" @click="cambiarEstado(r, 'no_asistio')" class="btn-mini">No asistió</button>
              <button v-if="r.estadoReserva === 'confirmada'" @click="cambiarEstado(r, 'cancelada')" class="btn-mini btn-mini--danger">Cancelar</button>
              <button @click="abrirEditarReserva(r)" class="btn-mini">Editar</button>
            </div>
          </div>
          <div v-if="r.descripcion" style="margin-top:8px; padding-top:8px; border-top:1px solid color-mix(in srgb, var(--border) 33%, transparent); font-size:12px; color:var(--text-muted);">{{ r.descripcion }}</div>
          <div v-if="r.notasInternas" style="margin-top:6px; font-size:11px; color:var(--text-faint);"><strong>Notas:</strong> {{ r.notasInternas }}</div>
        </div>
      </div>

      <!-- Vista DÍA -->
      <div v-else-if="vistaCalendario === 'dia'" class="ide-ia-card cal-wrap" style="padding:14px; overflow-x:auto;">
        <div class="rescal-grid" :style="rescalGridStyle(1)">
          <div class="cal-corner"></div>
          <div class="cal-day-header" :style="{ gridColumn: 2, gridRow: 1 }">{{ etiquetaDiaCorta(fechaReferencia) }}</div>
          <template v-for="(fila, r) in filasHoraReservas">
            <div :key="'l'+r" class="cal-hour-label" :style="{ gridRow: r + 2, gridColumn: 1 }">{{ fila.endsWith(':00') ? fila : '' }}</div>
            <div :key="'c'+r" class="cal-cell" :style="{ gridRow: r + 2, gridColumn: 2 }"></div>
          </template>
          <div
            v-for="r in reservasDelDia(fechaReferencia)" :key="r.id"
            class="rescal-block" :class="'rescal-block--' + r.estadoReserva"
            :style="rescalBloqueStyle(r, 2)"
            @click="abrirEditarReserva(r)"
            :title="`${r.titulo} · ${formatearFechaHora(r.fechaInicio)}`"
          >{{ horaCorta(r.fechaInicio) }} {{ r.titulo }}</div>
        </div>
      </div>

      <!-- Vista SEMANA -->
      <div v-else-if="vistaCalendario === 'semana'" class="ide-ia-card cal-wrap" style="padding:14px; overflow-x:auto;">
        <div class="rescal-grid" :style="rescalGridStyle(7)">
          <div class="cal-corner"></div>
          <div v-for="(dia, i) in diasDeLaSemana" :key="'h'+i" class="cal-day-header" :style="{ gridColumn: i + 2, gridRow: 1 }">{{ etiquetaDiaCorta(dia) }}</div>
          <template v-for="(fila, r) in filasHoraReservas">
            <div :key="'l'+r" class="cal-hour-label" :style="{ gridRow: r + 2, gridColumn: 1 }">{{ fila.endsWith(':00') ? fila : '' }}</div>
            <div v-for="(dia, c) in diasDeLaSemana" :key="'c'+r+'-'+c" class="cal-cell" :style="{ gridRow: r + 2, gridColumn: c + 2 }"></div>
          </template>
          <template v-for="(dia, c) in diasDeLaSemana">
            <div
              v-for="r in reservasDelDia(dia)" :key="r.id"
              class="rescal-block" :class="'rescal-block--' + r.estadoReserva"
              :style="rescalBloqueStyle(r, c + 2)"
              @click="abrirEditarReserva(r)"
              :title="`${r.titulo} · ${formatearFechaHora(r.fechaInicio)}`"
            >{{ horaCorta(r.fechaInicio) }} {{ r.titulo }}</div>
          </template>
        </div>
      </div>

      <!-- Vista MES -->
      <div v-else-if="vistaCalendario === 'mes'" class="ide-ia-card" style="padding:14px;">
        <div class="mescal-grid">
          <div v-for="d in ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom']" :key="d" class="mescal-dow">{{ d }}</div>
          <div
            v-for="(dia, i) in diasDelMes" :key="i"
            class="mescal-day"
            :class="{ 'mescal-day--fuera': dia.getMonth() !== fechaReferencia.getMonth(), 'mescal-day--hoy': esHoy(dia) }"
          >
            <div class="mescal-day__num">{{ dia.getDate() }}</div>
            <div
              v-for="r in reservasDelDia(dia).slice(0, 3)" :key="r.id"
              class="mescal-chip" :class="'rescal-block--' + r.estadoReserva"
              @click="abrirEditarReserva(r)"
              :title="`${r.titulo} · ${formatearFechaHora(r.fechaInicio)}`"
            >{{ horaCorta(r.fechaInicio) }} {{ r.titulo }}</div>
            <div v-if="reservasDelDia(dia).length > 3" style="font-size:9px; color:var(--text-faint);">+{{ reservasDelDia(dia).length - 3 }} más</div>
          </div>
        </div>
      </div>
    </template>

    <!-- ══════════════ TAB: CONFIGURACIÓN ══════════════ -->
    <template v-else>
      <div style="margin-bottom:20px; max-width:340px;">
        <div class="ide-field">
          <label>Agente</label>
          <select v-model="configAgenteId" class="ide-select" @change="cargarConfigAgente">
            <option value="" disabled>Selecciona un agente…</option>
            <option v-for="a in agentes" :key="a.id" :value="a.id">{{ a.nombre }} ({{ a.tipoAgente === 'humano' ? 'Humano' : 'IA' }})</option>
          </select>
        </div>
      </div>

      <template v-if="configAgenteId">
        <!-- Horarios -->
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:12px;">
          <h3 style="font-size:13px; font-weight:800; color:var(--text-primary);">Horarios de atención</h3>
          <button class="btn-add" @click="abrirNuevoHorario">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Agregar franja
          </button>
        </div>
        <div v-if="!horarios.length" style="font-size:11px; color:var(--text-faint); margin-bottom:8px;">
          Aún no hay franjas configuradas — se muestra un horario de referencia (8:00–18:00). Agrega la primera franja.
        </div>
        <div class="ide-ia-card cal-wrap" style="padding:14px; margin-bottom:28px; overflow-x:auto;">
          <div class="cal-grid" :style="calGridStyle">
            <div class="cal-corner"></div>
            <div v-for="(dia, i) in ORDEN_DIAS" :key="'h'+i" class="cal-day-header" :style="{ gridColumn: i + 2, gridRow: 1 }">{{ dia.label }}</div>

            <template v-for="(fila, r) in filasHora">
              <div :key="'lbl'+r" class="cal-hour-label" :style="{ gridRow: r + 2, gridColumn: 1 }">{{ fila.endsWith(':00') ? fila : '' }}</div>
              <div v-for="(dia, c) in ORDEN_DIAS" :key="'cell'+r+'-'+c" class="cal-cell" :style="{ gridRow: r + 2, gridColumn: c + 2 }"></div>
            </template>

            <div
              v-for="h in horarios" :key="'b'+h.id"
              class="cal-block"
              :style="bloqueStyle(h)"
              @click="eliminarHorario(h)"
              :title="`${h.horaInicio} – ${h.horaFin} · click para eliminar`"
            >{{ h.horaInicio }}–{{ h.horaFin }}</div>
          </div>
          <div style="font-size:10px; color:var(--text-disabled); margin-top:10px;">Click sobre una franja para eliminarla.</div>
        </div>

        <!-- Servicios -->
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:12px;">
          <h3 style="font-size:13px; font-weight:800; color:var(--text-primary);">Servicios</h3>
          <button class="btn-add" @click="abrirNuevoServicio">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Agregar servicio
          </button>
        </div>
        <div v-if="!servicios.length" class="ide-ia-card" style="text-align:center; padding:32px; color:var(--text-disabled); font-size:12px;">Sin servicios configurados</div>
        <div v-else style="display:grid; grid-template-columns:repeat(auto-fill, minmax(220px, 1fr)); gap:10px;">
          <div v-for="s in servicios" :key="s.id" class="ide-ia-card" style="padding:12px 14px;" :style="{ opacity: s.activo ? 1 : 0.55 }">
            <div style="font-size:13px; font-weight:700; color:var(--text-heading); margin-bottom:4px;">{{ s.nombre }}</div>
            <div style="font-size:11px; color:var(--text-faint); margin-bottom:8px;">{{ s.duracionMinutos }} min<span v-if="s.precio"> · {{ s.precio }}</span></div>
            <div style="display:flex; gap:8px;">
              <button @click="abrirEditarServicio(s)" style="background:none; border:none; cursor:pointer; color:#818cf8; font-size:11px; font-family:inherit;">Editar</button>
              <button @click="eliminarServicio(s)" style="background:none; border:none; cursor:pointer; color:#ef4444; font-size:11px; font-family:inherit;">Eliminar</button>
            </div>
          </div>
        </div>
      </template>
    </template>

    <!-- ══════════════ MODAL: Crear/Editar Reserva ══════════════ -->
    <div v-if="dialogReserva" class="cat-overlay" @click.self="dialogReserva = false">
      <div class="cat-modal">
        <div style="display:flex; align-items:center; justify-content:space-between; padding:18px 22px 14px; border-bottom:1px solid var(--border); flex-shrink:0;">
          <span style="font-size:15px; font-weight:700; color:var(--text-heading);">{{ editandoReserva ? 'Editar reserva' : 'Nueva reserva' }}</span>
          <button @click="dialogReserva = false" style="background:none; border:none; cursor:pointer; color:var(--text-disabled); padding:4px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div style="overflow-y:auto; padding:18px 22px; flex:1;">
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
            <div class="ide-field" style="grid-column:span 2;">
              <label>Agente *</label>
              <select v-model="formReserva.agenteId" class="ide-select" :disabled="!!editandoReserva" @change="onAgenteChangeForm">
                <option value="" disabled>Selecciona…</option>
                <option v-for="a in agentes" :key="a.id" :value="a.id">{{ a.nombre }} ({{ a.tipoAgente === 'humano' ? 'Humano' : 'IA' }})</option>
              </select>
            </div>

            <div class="ide-field" style="grid-column:span 2;" v-if="serviciosDelAgenteForm.length">
              <label>Servicio (opcional)</label>
              <select v-model="formReserva.servicioAgenteId" class="ide-select" @change="onServicioChangeForm">
                <option value="">Ninguno / personalizado</option>
                <option v-for="s in serviciosDelAgenteForm" :key="s.id" :value="s.id">{{ s.nombre }} ({{ s.duracionMinutos }} min)</option>
              </select>
            </div>

            <div class="ide-field">
              <label>Fecha *</label>
              <input type="date" v-model="formReserva.fecha" class="ide-input" @change="consultarSlots" />
            </div>
            <div class="ide-field">
              <label>Hora *</label>
              <input type="time" v-model="formReserva.hora" class="ide-input" />
            </div>

            <div class="ide-field" style="grid-column:span 2;" v-if="formReserva.agenteId && formReserva.fecha">
              <label>Slots disponibles (agentes humanos)</label>
              <div v-if="cargandoSlots" style="font-size:11px; color:var(--text-faint);">Consultando…</div>
              <div v-else-if="!slotsDisponibles.length" style="font-size:11px; color:var(--text-faint);">Sin slots configurados para esa fecha, o el agente es IA (sin restricción de horario)</div>
              <div v-else style="display:flex; flex-wrap:wrap; gap:6px;">
                <button
                  v-for="s in slotsDisponibles" :key="s"
                  @click="formReserva.hora = s"
                  :style="slotChipStyle(s)"
                  type="button"
                >{{ s }}</button>
              </div>
            </div>

            <div class="ide-field">
              <label>Duración (min) *</label>
              <input type="number" min="1" v-model.number="formReserva.duracionMinutos" class="ide-input" />
            </div>
            <div></div>

            <div class="ide-field" style="grid-column:span 2;">
              <label>Título *</label>
              <input v-model="formReserva.titulo" class="ide-input" placeholder="Ej: Consulta técnica" />
            </div>

            <div class="ide-field">
              <label>Nombre del contacto *</label>
              <input v-model="formReserva.contactoNombre" class="ide-input" />
            </div>
            <div class="ide-field">
              <label>Teléfono</label>
              <input v-model="formReserva.contactoTelefono" class="ide-input" />
            </div>

            <div class="ide-field" style="grid-column:span 2;">
              <label>Descripción</label>
              <textarea v-model="formReserva.descripcion" class="ide-textarea" rows="3"></textarea>
            </div>
          </div>
        </div>

        <div style="display:flex; justify-content:flex-end; gap:8px; padding:12px 22px 18px; border-top:1px solid var(--border); flex-shrink:0;">
          <button @click="dialogReserva = false" style="background:none; border:1px solid var(--border); border-radius:8px; color:var(--text-faint); padding:8px 16px; font-size:12px; cursor:pointer; font-family:inherit;">Cancelar</button>
          <button @click="guardarReserva" :disabled="saving" style="background:#6366f1; color:#fff; border:none; border-radius:8px; padding:8px 18px; font-size:12px; font-weight:600; cursor:pointer; font-family:inherit; display:flex; align-items:center; gap:6px;">
            <v-progress-circular v-if="saving" indeterminate size="14" width="2" color="white" />
            {{ editandoReserva ? 'Guardar cambios' : 'Crear reserva' }}
          </button>
        </div>
      </div>
    </div>

    <!-- ══════════════ MODAL: Nueva franja horaria ══════════════ -->
    <div v-if="dialogHorario" class="cat-overlay" @click.self="dialogHorario = false">
      <div style="background:var(--bg-surface); border:1px solid var(--border); border-radius:12px; width:380px; max-width:95%; padding:22px;">
        <div style="font-size:14px; font-weight:700; color:var(--text-heading); margin-bottom:16px;">Nueva franja horaria</div>
        <div style="display:flex; flex-direction:column; gap:12px;">
          <div class="ide-field">
            <label>Día</label>
            <select v-model.number="formHorario.diaSemana" class="ide-select">
              <option v-for="(dia, idx) in DIAS" :key="idx" :value="idx">{{ dia }}</option>
            </select>
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
            <div class="ide-field">
              <label>Hora inicio</label>
              <input type="time" v-model="formHorario.horaInicio" class="ide-input" />
            </div>
            <div class="ide-field">
              <label>Hora fin</label>
              <input type="time" v-model="formHorario.horaFin" class="ide-input" />
            </div>
          </div>
        </div>
        <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:20px;">
          <button @click="dialogHorario = false" style="background:none; border:1px solid var(--border); border-radius:8px; color:var(--text-faint); padding:8px 14px; font-size:12px; cursor:pointer; font-family:inherit;">Cancelar</button>
          <button @click="guardarHorario" :disabled="saving" style="background:#6366f1; color:#fff; border:none; border-radius:8px; padding:8px 14px; font-size:12px; font-weight:600; cursor:pointer; font-family:inherit;">Agregar</button>
        </div>
      </div>
    </div>

    <!-- ══════════════ MODAL: Servicio ══════════════ -->
    <div v-if="dialogServicio" class="cat-overlay" @click.self="dialogServicio = false">
      <div style="background:var(--bg-surface); border:1px solid var(--border); border-radius:12px; width:420px; max-width:95%; padding:22px;">
        <div style="font-size:14px; font-weight:700; color:var(--text-heading); margin-bottom:16px;">{{ editandoServicio ? 'Editar servicio' : 'Nuevo servicio' }}</div>
        <div style="display:flex; flex-direction:column; gap:12px;">
          <div class="ide-field">
            <label>Nombre *</label>
            <input v-model="formServicio.nombre" class="ide-input" placeholder="Ej: Consulta técnica" />
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
            <div class="ide-field">
              <label>Duración (min) *</label>
              <input type="number" min="1" v-model.number="formServicio.duracionMinutos" class="ide-input" />
            </div>
            <div class="ide-field">
              <label>Precio</label>
              <input type="number" step="0.01" v-model.number="formServicio.precio" class="ide-input" />
            </div>
          </div>
          <div class="ide-field">
            <label>Descripción</label>
            <textarea v-model="formServicio.descripcion" class="ide-textarea" rows="2"></textarea>
          </div>
          <div style="display:flex; align-items:center; gap:10px;">
            <div class="ide-toggle" :class="{ 'ide-toggle--on': formServicio.activo }" @click="formServicio.activo = !formServicio.activo"><div></div></div>
            <span style="font-size:12px;" :style="{ color: formServicio.activo ? '#22c55e' : 'var(--text-faint)' }">{{ formServicio.activo ? 'Activo' : 'Inactivo' }}</span>
          </div>
        </div>
        <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:20px;">
          <button @click="dialogServicio = false" style="background:none; border:1px solid var(--border); border-radius:8px; color:var(--text-faint); padding:8px 14px; font-size:12px; cursor:pointer; font-family:inherit;">Cancelar</button>
          <button @click="guardarServicio" :disabled="saving" style="background:#6366f1; color:#fff; border:none; border-radius:8px; padding:8px 14px; font-size:12px; font-weight:600; cursor:pointer; font-family:inherit;">{{ editandoServicio ? 'Guardar' : 'Crear' }}</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
const ESTADOS = ['confirmada', 'completada', 'cancelada', 'no_asistio'];
const ESTADO_LABEL = { confirmada: 'Confirmada', completada: 'Completada', cancelada: 'Cancelada', no_asistio: 'No asistió' };
const ESTADO_COLOR = { confirmada: '#6366f1', completada: '#22c55e', cancelada: '#ef4444', no_asistio: '#f59e0b' };
const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

// Calendario semanal: columnas de Lunes a Domingo (orden habitual de negocio, distinto
// del índice diaSemana que usa el backend, donde 0 = domingo).
const ORDEN_DIAS = [
  { idx: 1, label: 'Lun' }, { idx: 2, label: 'Mar' }, { idx: 3, label: 'Mié' },
  { idx: 4, label: 'Jue' }, { idx: 5, label: 'Vie' }, { idx: 6, label: 'Sáb' }, { idx: 0, label: 'Dom' },
];

const aMinutos = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

const aHHmm = (minutos) => {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

const formReservaVacio = () => ({
  agenteId: '', servicioAgenteId: '', fecha: '', hora: '', duracionMinutos: 30,
  contactoNombre: '', contactoTelefono: '', contactoEmail: '', titulo: '', descripcion: '',
});

export default {
  name: 'Reservaciones',
  data() {
    return {
      ESTADOS, ESTADO_LABEL, DIAS, ORDEN_DIAS,
      tab: 'reservas',
      reservas: [],
      agentes: [],
      loading: false,
      saving: false,

      filtroAgente: '', filtroEstado: '', filtroDesde: '', filtroHasta: '',
      vistaCalendario: 'lista',
      fechaReferencia: new Date(),

      dialogReserva: false,
      editandoReserva: null,
      formReserva: formReservaVacio(),
      serviciosDelAgenteForm: [],
      slotsDisponibles: [],
      cargandoSlots: false,

      configAgenteId: '',
      horarios: [],
      servicios: [],

      dialogHorario: false,
      formHorario: { diaSemana: 1, horaInicio: '08:00', horaFin: '10:00' },

      dialogServicio: false,
      editandoServicio: null,
      formServicio: { nombre: '', descripcion: '', duracionMinutos: 30, precio: null, activo: true },
    };
  },
  computed: {
    rangoMinutos() {
      if (!this.horarios.length) return { min: 8 * 60, max: 18 * 60 };
      const minutos = this.horarios.flatMap(h => [aMinutos(h.horaInicio), aMinutos(h.horaFin)]);
      return {
        min: Math.floor(Math.min(...minutos) / 60) * 60,
        max: Math.ceil(Math.max(...minutos) / 60) * 60,
      };
    },
    filasHora() {
      const { min, max } = this.rangoMinutos;
      const filas = [];
      for (let m = min; m < max; m += 30) filas.push(aHHmm(m));
      return filas;
    },
    calGridStyle() {
      return {
        display: 'grid',
        gridTemplateColumns: '56px repeat(7, minmax(90px, 1fr))',
        gridTemplateRows: `28px repeat(${this.filasHora.length}, 22px)`,
        minWidth: '760px',
      };
    },

    // ── Calendario de RESERVAS (día/semana/mes) ──
    rangoActual() {
      const d = new Date(this.fechaReferencia);
      if (this.vistaCalendario === 'dia') {
        const desde = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
        const hasta = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);
        return { desde, hasta };
      }
      if (this.vistaCalendario === 'semana') {
        const offsetLunes = (d.getDay() + 6) % 7; // días desde el lunes (0=domingo en JS)
        const desde = new Date(d.getFullYear(), d.getMonth(), d.getDate() - offsetLunes, 0, 0, 0);
        const hasta = new Date(desde.getFullYear(), desde.getMonth(), desde.getDate() + 6, 23, 59, 59);
        return { desde, hasta };
      }
      if (this.vistaCalendario === 'mes') {
        const desde = new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0);
        const hasta = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
        return { desde, hasta };
      }
      return null;
    },
    diasDeLaSemana() {
      const d = this.fechaReferencia;
      const offsetLunes = (d.getDay() + 6) % 7;
      const desde = new Date(d.getFullYear(), d.getMonth(), d.getDate() - offsetLunes);
      return Array.from({ length: 7 }, (_, i) => new Date(desde.getFullYear(), desde.getMonth(), desde.getDate() + i));
    },
    diasDelMes() {
      const d = this.fechaReferencia;
      const primerDia = new Date(d.getFullYear(), d.getMonth(), 1);
      const offsetLunes = (primerDia.getDay() + 6) % 7;
      const inicioGrid = new Date(primerDia.getFullYear(), primerDia.getMonth(), 1 - offsetLunes);
      return Array.from({ length: 42 }, (_, i) => new Date(inicioGrid.getFullYear(), inicioGrid.getMonth(), inicioGrid.getDate() + i));
    },
    rangoHorasReservas() {
      const enRango = this.reservas || [];
      if (!enRango.length) return { min: 8 * 60, max: 20 * 60 };
      const minutos = enRango.flatMap(r => {
        const ini = new Date(r.fechaInicio);
        const fin = new Date(r.fechaFin);
        return [ini.getHours() * 60 + ini.getMinutes(), fin.getHours() * 60 + fin.getMinutes()];
      });
      return {
        min: Math.min(8 * 60, Math.floor(Math.min(...minutos) / 60) * 60),
        max: Math.max(20 * 60, Math.ceil(Math.max(...minutos) / 60) * 60),
      };
    },
    filasHoraReservas() {
      const { min, max } = this.rangoHorasReservas;
      const filas = [];
      for (let m = min; m < max; m += 30) filas.push(aHHmm(m));
      return filas;
    },
    etiquetaRango() {
      const d = this.fechaReferencia;
      const opcionesLargas = { day: 'numeric', month: 'long', year: 'numeric' };
      if (this.vistaCalendario === 'dia') {
        return d.toLocaleDateString('es-BO', { weekday: 'long', ...opcionesLargas });
      }
      if (this.vistaCalendario === 'semana') {
        const { desde, hasta } = this.rangoActual;
        return `${desde.toLocaleDateString('es-BO', { day: 'numeric', month: 'short' })} – ${hasta.toLocaleDateString('es-BO', { day: 'numeric', month: 'short', year: 'numeric' })}`;
      }
      if (this.vistaCalendario === 'mes') {
        return d.toLocaleDateString('es-BO', { month: 'long', year: 'numeric' });
      }
      return '';
    },
  },
  async mounted() {
    await this.cargarAgentes();
    await this.cargar();
  },
  methods: {
    bloqueStyle(h) {
      const { min } = this.rangoMinutos;
      const filaInicio = 2 + (aMinutos(h.horaInicio) - min) / 30;
      const filaFin = 2 + (aMinutos(h.horaFin) - min) / 30;
      const columna = ORDEN_DIAS.findIndex(d => d.idx === h.diaSemana) + 2;
      return { gridRow: `${filaInicio} / ${filaFin}`, gridColumn: String(columna) };
    },
    tabStyle(id) {
      const activo = this.tab === id;
      return {
        background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
        padding: '10px 16px', fontSize: '12px', fontWeight: activo ? '700' : '500',
        color: activo ? '#818cf8' : 'var(--text-faint)',
        borderBottom: activo ? '2px solid #6366f1' : '2px solid transparent',
        marginBottom: '-1px',
      };
    },
    estadoBadgeStyle(estado) {
      const color = ESTADO_COLOR[estado] || 'var(--text-faint)';
      return { background: `${color}22`, color, padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '700' };
    },
    slotChipStyle(slot) {
      const activo = this.formReserva.hora === slot;
      return {
        background: activo ? '#6366f1' : 'none', color: activo ? '#fff' : 'var(--text-muted)',
        border: '1px solid var(--border)', borderRadius: '6px', padding: '4px 10px',
        fontSize: '11px', cursor: 'pointer', fontFamily: 'inherit',
      };
    },
    nombreAgente(id) {
      const a = this.agentes.find(x => x.id === id);
      return a ? a.nombre : '—';
    },
    formatearFechaHora(iso) {
      if (!iso) return '—';
      const d = new Date(iso);
      return d.toLocaleString('es-BO', { dateStyle: 'medium', timeStyle: 'short' });
    },
    async cargarAgentes() {
      this.agentes = await this.$service.list('agentes') || [];
    },
    async cargar() {
      this.loading = true;
      try {
        let desde = this.filtroDesde || undefined;
        let hasta = this.filtroHasta || undefined;
        if (this.vistaCalendario !== 'lista') {
          const { desde: d1, hasta: d2 } = this.rangoActual;
          desde = d1.toISOString();
          hasta = d2.toISOString();
        }
        this.reservas = await this.$service.list('reservaciones', {
          agenteId: this.filtroAgente || undefined,
          estado: this.filtroEstado || undefined,
          desde, hasta,
        }) || [];
      } finally {
        this.loading = false;
      }
    },

    // ── Calendario de reservas (día/semana/mes) ──
    vistaBtnStyle(v) {
      const activo = this.vistaCalendario === v;
      return {
        background: activo ? '#6366f1' : 'none', color: activo ? '#fff' : 'var(--text-muted)',
        border: 'none', borderRadius: '6px', padding: '6px 14px', fontSize: '12px',
        fontWeight: activo ? '700' : '500', cursor: 'pointer', fontFamily: 'inherit',
      };
    },
    async cambiarVista(v) {
      this.vistaCalendario = v;
      if (v !== 'lista') this.fechaReferencia = new Date();
      await this.cargar();
    },
    async navegar(delta) {
      const d = new Date(this.fechaReferencia);
      if (this.vistaCalendario === 'dia') d.setDate(d.getDate() + delta);
      else if (this.vistaCalendario === 'semana') d.setDate(d.getDate() + delta * 7);
      else if (this.vistaCalendario === 'mes') d.setMonth(d.getMonth() + delta);
      this.fechaReferencia = d;
      await this.cargar();
    },
    async irHoy() {
      this.fechaReferencia = new Date();
      await this.cargar();
    },
    reservasDelDia(dia) {
      const y = dia.getFullYear(), m = dia.getMonth(), d = dia.getDate();
      return (this.reservas || [])
        .filter(r => {
          const f = new Date(r.fechaInicio);
          return f.getFullYear() === y && f.getMonth() === m && f.getDate() === d;
        })
        .sort((a, b) => new Date(a.fechaInicio) - new Date(b.fechaInicio));
    },
    rescalGridStyle(numCols) {
      return {
        display: 'grid',
        gridTemplateColumns: `56px repeat(${numCols}, minmax(90px, 1fr))`,
        gridTemplateRows: `28px repeat(${this.filasHoraReservas.length}, 22px)`,
        minWidth: `${56 + numCols * 100}px`,
      };
    },
    rescalBloqueStyle(r, columna) {
      const { min } = this.rangoHorasReservas;
      const ini = new Date(r.fechaInicio);
      const fin = new Date(r.fechaFin);
      const iniMin = ini.getHours() * 60 + ini.getMinutes();
      const finMin = Math.max(iniMin + 30, fin.getHours() * 60 + fin.getMinutes());
      const filaInicio = 2 + (iniMin - min) / 30;
      const filaFin = 2 + (finMin - min) / 30;
      return { gridRow: `${filaInicio} / ${filaFin}`, gridColumn: String(columna) };
    },
    etiquetaDiaCorta(dia) {
      return dia.toLocaleDateString('es-BO', { weekday: 'short', day: 'numeric' });
    },
    horaCorta(iso) {
      const d = new Date(iso);
      return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    },
    esHoy(dia) {
      const hoy = new Date();
      return dia.getFullYear() === hoy.getFullYear() && dia.getMonth() === hoy.getMonth() && dia.getDate() === hoy.getDate();
    },

    // ── Reserva ──
    abrirNuevaReserva() {
      this.editandoReserva = null;
      this.formReserva = formReservaVacio();
      this.serviciosDelAgenteForm = [];
      this.slotsDisponibles = [];
      this.dialogReserva = true;
    },
    async abrirEditarReserva(reserva) {
      this.editandoReserva = reserva;
      const fechaInicio = new Date(reserva.fechaInicio);
      const pad = n => String(n).padStart(2, '0');
      this.formReserva = {
        agenteId: reserva.agenteId,
        servicioAgenteId: reserva.servicioAgenteId || '',
        fecha: `${fechaInicio.getFullYear()}-${pad(fechaInicio.getMonth() + 1)}-${pad(fechaInicio.getDate())}`,
        hora: `${pad(fechaInicio.getHours())}:${pad(fechaInicio.getMinutes())}`,
        duracionMinutos: reserva.duracionMinutos,
        contactoNombre: reserva.contactoNombre,
        contactoTelefono: reserva.contactoTelefono || '',
        contactoEmail: reserva.contactoEmail || '',
        titulo: reserva.titulo,
        descripcion: reserva.descripcion || '',
      };
      this.slotsDisponibles = [];
      await this.onAgenteChangeForm();
      this.dialogReserva = true;
    },
    async onAgenteChangeForm() {
      this.serviciosDelAgenteForm = this.formReserva.agenteId
        ? await this.$service.list('servicios-agente', { agenteId: this.formReserva.agenteId }) || []
        : [];
      await this.consultarSlots();
    },
    onServicioChangeForm() {
      const s = this.serviciosDelAgenteForm.find(x => x.id === this.formReserva.servicioAgenteId);
      if (s) this.formReserva.duracionMinutos = s.duracionMinutos;
    },
    async consultarSlots() {
      if (!this.formReserva.agenteId || !this.formReserva.fecha) { this.slotsDisponibles = []; return; }
      this.cargandoSlots = true;
      try {
        this.slotsDisponibles = await this.$service.list('reservaciones/disponibilidad', {
          agenteId: this.formReserva.agenteId,
          fecha: this.formReserva.fecha,
          duracionMinutos: this.formReserva.duracionMinutos,
        }) || [];
      } finally {
        this.cargandoSlots = false;
      }
    },
    async guardarReserva() {
      const f = this.formReserva;
      if (!f.agenteId || !f.fecha || !f.hora || !f.titulo || !f.contactoNombre) {
        this.$message.error('Completa los campos obligatorios (*)');
        return;
      }
      this.saving = true;
      try {
        const payload = {
          agenteId: f.agenteId,
          servicioAgenteId: f.servicioAgenteId || undefined,
          fechaInicio: `${f.fecha}T${f.hora}:00`,
          duracionMinutos: f.duracionMinutos,
          titulo: f.titulo,
          descripcion: f.descripcion || undefined,
          contactoNombre: f.contactoNombre,
          contactoTelefono: f.contactoTelefono || undefined,
          contactoEmail: f.contactoEmail || undefined,
        };
        if (this.editandoReserva) {
          await this.$service.put(`reservaciones/${this.editandoReserva.id}`, payload);
          this.$message.success('Reserva actualizada');
        } else {
          await this.$service.post('reservaciones', payload);
          this.$message.success('Reserva creada');
        }
        this.dialogReserva = false;
        await this.cargar();
      } catch (e) {
        // el interceptor de axios ya muestra el mensaje de error del backend
      } finally {
        this.saving = false;
      }
    },
    async cambiarEstado(reserva, estado) {
      try {
        await this.$service.put(`reservaciones/${reserva.id}/estado`, { estado });
        this.$message.success('Estado actualizado');
        await this.cargar();
      } catch (e) { /* interceptor ya notifica */ }
    },

    // ── Config: Horarios ──
    async cargarConfigAgente() {
      if (!this.configAgenteId) return;
      this.horarios = await this.$service.list('horarios-agente', { agenteId: this.configAgenteId }) || [];
      this.servicios = await this.$service.list('servicios-agente', { agenteId: this.configAgenteId }) || [];
    },
    abrirNuevoHorario() {
      this.formHorario = { diaSemana: 1, horaInicio: '08:00', horaFin: '10:00' };
      this.dialogHorario = true;
    },
    async guardarHorario() {
      if (this.formHorario.horaFin <= this.formHorario.horaInicio) {
        this.$message.error('La hora fin debe ser posterior a la hora inicio');
        return;
      }
      this.saving = true;
      try {
        await this.$service.post('horarios-agente', { agenteId: this.configAgenteId, ...this.formHorario });
        this.$message.success('Franja agregada');
        this.dialogHorario = false;
        await this.cargarConfigAgente();
      } catch (e) { /* interceptor ya notifica */ } finally {
        this.saving = false;
      }
    },
    async eliminarHorario(h) {
      await this.$service.delete('horarios-agente', h.id);
      this.$message.success('Franja eliminada');
      await this.cargarConfigAgente();
    },

    // ── Config: Servicios ──
    abrirNuevoServicio() {
      this.editandoServicio = null;
      this.formServicio = { nombre: '', descripcion: '', duracionMinutos: 30, precio: null, activo: true };
      this.dialogServicio = true;
    },
    abrirEditarServicio(s) {
      this.editandoServicio = s;
      this.formServicio = { nombre: s.nombre, descripcion: s.descripcion || '', duracionMinutos: s.duracionMinutos, precio: s.precio, activo: s.activo };
      this.dialogServicio = true;
    },
    async guardarServicio() {
      if (!this.formServicio.nombre || !this.formServicio.duracionMinutos) {
        this.$message.error('Nombre y duración son obligatorios');
        return;
      }
      this.saving = true;
      try {
        if (this.editandoServicio) {
          await this.$service.put(`servicios-agente/${this.editandoServicio.id}`, this.formServicio);
          this.$message.success('Servicio actualizado');
        } else {
          await this.$service.post('servicios-agente', { agenteId: this.configAgenteId, ...this.formServicio });
          this.$message.success('Servicio creado');
        }
        this.dialogServicio = false;
        await this.cargarConfigAgente();
      } catch (e) { /* interceptor ya notifica */ } finally {
        this.saving = false;
      }
    },
    async eliminarServicio(s) {
      await this.$service.delete('servicios-agente', s.id);
      this.$message.success('Servicio eliminado');
      await this.cargarConfigAgente();
    },
  },
};
</script>

<style scoped>
.cal-wrap { overflow-x: auto; }
.cal-grid { position: relative; }
.cal-corner { grid-column: 1; grid-row: 1; }
.cal-day-header {
  font-size: 11px; font-weight: 700; color: var(--text-muted); text-align: center;
  display: flex; align-items: center; justify-content: center;
  border-bottom: 1px solid var(--border);
}
.cal-hour-label {
  font-size: 10px; color: var(--text-faint); text-align: right; padding-right: 6px;
  transform: translateY(-7px);
}
.cal-cell {
  border-top: 1px solid var(--bg-surface);
  border-left: 1px solid var(--bg-surface);
}
.cal-block {
  background: #6366f1cc;
  border: 1px solid #818cf8;
  border-radius: 4px;
  color: #fff;
  font-size: 9px;
  font-weight: 600;
  padding: 2px 4px;
  margin: 0 2px;
  overflow: hidden;
  cursor: pointer;
  display: flex;
  align-items: center;
  z-index: 1;
  transition: background 0.15s;
}
.cal-block:hover { background: #ef4444cc; border-color: #ef4444; }

/* Calendario de reservas (día/semana) */
.rescal-block {
  border-radius: 4px;
  color: #fff;
  font-size: 9px;
  font-weight: 600;
  padding: 2px 4px;
  margin: 0 2px;
  overflow: hidden;
  cursor: pointer;
  z-index: 1;
  border: 1px solid;
}
.rescal-block--confirmada { background: #6366f1cc; border-color: #818cf8; }
.rescal-block--completada { background: #22c55ecc; border-color: #4ade80; }
.rescal-block--cancelada { background: color-mix(in srgb, var(--text-faint) 60%, transparent); border-color: var(--text-muted); text-decoration: line-through; }
.rescal-block--no_asistio { background: #f59e0bcc; border-color: #fbbf24; }

/* Calendario de reservas (mes) */
.mescal-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(100px, 1fr));
  gap: 1px;
  background: var(--bg-surface);
}
.mescal-dow {
  font-size: 11px; font-weight: 700; color: var(--text-muted); text-align: center;
  padding: 6px 0; background: var(--bg-page);
}
.mescal-day {
  background: var(--bg-page);
  min-height: 90px;
  padding: 4px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.mescal-day--fuera { opacity: 0.35; }
.mescal-day--hoy { box-shadow: inset 0 0 0 1px #6366f1; }
.mescal-day__num { font-size: 11px; font-weight: 700; color: var(--text-primary); margin-bottom: 2px; }
.mescal-chip {
  font-size: 9px; font-weight: 600; color: #fff;
  border-radius: 3px; padding: 1px 4px; cursor: pointer; overflow: hidden;
  white-space: nowrap; text-overflow: ellipsis;
}

.btn-add {
  display: flex; align-items: center; gap: 6px;
  background: #6366f1; color: #fff; border: none; border-radius: 8px;
  padding: 9px 16px; font-size: 12px; font-weight: 600; cursor: pointer;
  font-family: 'Inter', sans-serif; flex-shrink: 0; transition: background 0.15s;
}
.btn-add:hover { background: #4f46e5; }

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
.cat-modal {
  background: var(--bg-surface); border: 1px solid var(--border); border-radius: 12px;
  width: 640px; max-width: 95vw; max-height: 90vh;
  display: flex; flex-direction: column; overflow: hidden;
}
</style>
