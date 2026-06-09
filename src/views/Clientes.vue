<template>
  <div class="cl-layout">

    <!-- ── HEADER ── -->
    <div class="cl-header">
      <div class="cl-header__left">
        <div class="cl-header-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
          </svg>
        </div>
        <div>
          <h1 class="cl-header-title">Clientes</h1>
          <p class="cl-header-sub">{{ clientes.length }} cliente{{ clientes.length !== 1 ? 's' : '' }} registrado{{ clientes.length !== 1 ? 's' : '' }}</p>
        </div>
      </div>
      <div class="cl-header__right">
        <div class="cl-search-wrap">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" class="cl-search-ico"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input v-model="busqueda" class="cl-search" placeholder="Buscar cliente..." />
        </div>
        <button class="cl-btn-primary" @click="abrirCrear">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Nuevo cliente
        </button>
      </div>
    </div>

    <!-- ── BODY ── -->
    <div class="cl-body">
      <!-- Loading -->
      <div v-if="cargando" class="cl-loading">
        <div class="cl-spinner"></div>
      </div>

      <!-- Empty -->
      <div v-else-if="!clientesFiltrados.length" class="cl-empty">
        <div class="cl-empty-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#475569" stroke-width="1.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
        </div>
        <div class="cl-empty-title">{{ busqueda ? 'Sin resultados' : 'Sin clientes registrados' }}</div>
        <div class="cl-empty-sub">{{ busqueda ? 'Prueba con otro término de búsqueda' : 'Crea el primer cliente para comenzar' }}</div>
        <button v-if="!busqueda" class="cl-btn-primary" style="margin-top:16px;" @click="abrirCrear">+ Nuevo cliente</button>
      </div>

      <!-- Grid -->
      <div v-else class="cl-grid">
        <div v-for="cl in clientesFiltrados" :key="cl.id" class="cl-card">

          <!-- Card header -->
          <div class="cl-card-hd">
            <div class="cl-avatar" :style="{ background: avatarColor(cl.nombre) }">
              {{ cl.nombre.charAt(0).toUpperCase() }}
            </div>
            <div class="cl-card-info">
              <div class="cl-card-nombre">{{ cl.nombre }}</div>
              <div class="cl-card-slug">{{ cl.slug }}</div>
            </div>
            <span class="cl-plan" :class="`cl-plan--${cl.plan || 'basico'}`">{{ cl.plan || 'básico' }}</span>
          </div>

          <!-- Meta -->
          <div class="cl-card-meta">
            <div v-if="cl.correoContacto" class="cl-meta-row">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              {{ cl.correoContacto }}
            </div>
            <div v-if="cl.telefono" class="cl-meta-row">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.63A2 2 0 012 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
              {{ cl.telefono }}
            </div>
            <div v-if="cl.servicios && cl.servicios.length" class="cl-tags-row">
              <span v-for="s in cl.servicios.slice(0, 3)" :key="s" class="cl-tag">{{ s }}</span>
              <span v-if="cl.servicios.length > 3" class="cl-tag cl-tag--more">+{{ cl.servicios.length - 3 }}</span>
            </div>
          </div>

          <!-- Resumen de recursos -->
          <div v-if="resumenes[cl.id]" class="cl-resumen">
            <span class="cl-res-item" title="Agentes IA">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
              {{ resumenes[cl.id].agentes }}
            </span>
            <span class="cl-res-item" title="Conversaciones">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
              {{ resumenes[cl.id].conversaciones }}
            </span>
            <span class="cl-res-item" title="Usuarios">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              {{ resumenes[cl.id].usuarios }}
            </span>
            <span class="cl-res-item" title="Redes sociales">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
              {{ resumenes[cl.id].cuentasRedesSociales }}
            </span>
          </div>

          <!-- Footer -->
          <div class="cl-card-ft">
            <span class="cl-status" :class="cl.activo !== false ? 'cl-status--on' : 'cl-status--off'">
              {{ cl.activo !== false ? 'Activo' : 'Inactivo' }}
            </span>
            <div class="cl-card-acts">
              <button class="cl-act-btn cl-act-btn--gear" @click="gestionarCliente(cl)" title="Gestionar">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
              </button>
              <button class="cl-act-btn cl-act-btn--users" @click="abrirUsuarios(cl)" title="Usuarios">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
              </button>
              <button class="cl-act-btn" @click="abrirEditar(cl)" title="Editar">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button class="cl-act-btn cl-act-btn--del" @click="confirmarEliminar(cl)" title="Eliminar">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── MODAL USUARIOS ── -->
    <transition name="cl-fade">
      <div v-if="dialogUsuarios" class="cl-backdrop" @mousedown.self="cerrarUsuarios">
        <div class="cl-dialog cl-dialog--lg">

          <div class="cl-dialog-hd">
            <div>
              <div class="cl-dialog-title">Usuarios — {{ clienteSeleccionado && clienteSeleccionado.nombre }}</div>
              <div class="cl-dialog-sub">{{ panelUsuario ? (editandoUsuario ? 'Editar usuario' : 'Nuevo usuario') : `${usuarios.length} usuario(s) registrado(s)` }}</div>
            </div>
            <div style="display:flex;gap:8px;align-items:center;">
              <button v-if="!panelUsuario" class="cl-btn-primary cl-btn-sm" @click="nuevoUsuario">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Nuevo usuario
              </button>
              <button class="cl-dialog-close" @click="cerrarUsuarios">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          </div>

          <!-- LISTA -->
          <div v-if="!panelUsuario" class="cl-dialog-body">
            <div v-if="cargandoUsuarios" class="cl-u-loading">
              <div class="cl-spinner"></div>
            </div>
            <div v-else-if="!usuarios.length" class="cl-u-empty">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#475569" stroke-width="1.5"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <div style="color:#94a3b8;font-size:13px;font-weight:600;margin-top:10px;">Sin usuarios registrados</div>
              <div style="color:#475569;font-size:11px;margin-top:4px;">Crea el primer usuario para este cliente</div>
            </div>
            <div v-else class="cl-u-list">
              <div v-for="u in usuarios" :key="u.id" class="cl-u-row">
                <div class="cl-u-avatar" :style="{ background: avatarColor(u.nombres) }">
                  {{ u.nombres.charAt(0).toUpperCase() }}
                </div>
                <div class="cl-u-info">
                  <div class="cl-u-nombre">{{ u.nombres }} {{ u.apellidos || '' }}</div>
                  <div class="cl-u-meta">@{{ u.usuario }}{{ u.correoElectronico ? ' · ' + u.correoElectronico : '' }}</div>
                </div>
                <div class="cl-u-roles">
                  <span class="cl-u-badge cl-u-badge--rol" :class="u.rol === 'ADMIN_CLIENTE' ? 'cl-u-badge--admin' : 'cl-u-badge--colab'">
                    {{ u.rol === 'ADMIN_CLIENTE' ? 'Admin' : 'Colaborador' }}
                  </span>
                  <span v-if="u.rolClienteNombre" class="cl-u-badge">{{ u.rolClienteNombre }}</span>
                </div>
                <div class="cl-u-acts">
                  <button class="cl-act-btn" @click="editarUsuario(u)" title="Editar">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button class="cl-act-btn cl-act-btn--del" @click="confirmarEliminarUsuario(u)" title="Eliminar">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- FORMULARIO -->
          <div v-else class="cl-dialog-body">
            <div class="cl-form-row">
              <div class="cl-field">
                <label>Nombre de usuario *</label>
                <input v-model="formUsuario.usuario" class="cl-input" placeholder="ej. jperez" :disabled="!!editandoUsuario" />
              </div>
              <div class="cl-field">
                <label>Contraseña {{ editandoUsuario ? '(dejar vacío para no cambiar)' : '*' }}</label>
                <input v-model="formUsuario.contrasena" class="cl-input" type="password" placeholder="Mínimo 6 caracteres" autocomplete="new-password" />
              </div>
            </div>
            <div class="cl-form-row">
              <div class="cl-field">
                <label>Nombres *</label>
                <input v-model="formUsuario.nombres" class="cl-input" placeholder="Juan" />
              </div>
              <div class="cl-field">
                <label>Apellidos</label>
                <input v-model="formUsuario.apellidos" class="cl-input" placeholder="Pérez" />
              </div>
            </div>
            <div class="cl-form-row">
              <div class="cl-field">
                <label>Correo electrónico</label>
                <input v-model="formUsuario.correoElectronico" class="cl-input" type="email" placeholder="juan@empresa.com" />
              </div>
              <div class="cl-field">
                <label>Nivel de acceso</label>
                <select v-model="formUsuario.rol" class="cl-select">
                  <option value="ADMIN_CLIENTE">Administrador del cliente</option>
                  <option value="COLABORADOR">Colaborador</option>
                </select>
              </div>
            </div>
            <div class="cl-field">
              <label>Rol personalizado</label>
              <select v-model="formUsuario.rolClienteId" class="cl-select">
                <option value="">Sin rol personalizado</option>
                <option v-for="r in roles" :key="r.id" :value="r.id">{{ r.nombre }}</option>
              </select>
            </div>
          </div>

          <div class="cl-dialog-ft">
            <button v-if="panelUsuario" class="cl-btn-ghost" @click="panelUsuario = false">Volver</button>
            <button v-if="panelUsuario" class="cl-btn-primary" :disabled="guardandoUsuario" @click="guardarUsuario">
              <svg v-if="guardandoUsuario" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation:spin 1s linear infinite;"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
              {{ guardandoUsuario ? 'Guardando…' : (editandoUsuario ? 'Guardar cambios' : 'Crear usuario') }}
            </button>
            <button v-else class="cl-btn-ghost" @click="cerrarUsuarios">Cerrar</button>
          </div>

        </div>
      </div>
    </transition>

    <!-- ── MODAL CREAR / EDITAR ── -->
    <transition name="cl-fade">
      <div v-if="dialog" class="cl-backdrop" @mousedown.self="cerrarDialog">
        <div class="cl-dialog">
          <div class="cl-dialog-hd">
            <div>
              <div class="cl-dialog-title">{{ editando ? 'Editar cliente' : 'Nuevo cliente' }}</div>
              <div class="cl-dialog-sub">{{ editando ? 'Modifica los datos del cliente' : 'Completa los datos para registrar el cliente' }}</div>
            </div>
            <button class="cl-dialog-close" @click="cerrarDialog">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <div class="cl-dialog-body">
            <!-- Nombre + Slug -->
            <div class="cl-form-row">
              <div class="cl-field">
                <label>Nombre de la empresa *</label>
                <input v-model="form.nombre" class="cl-input" placeholder="Ej. MiDoc" @input="autoSlug" />
              </div>
              <div class="cl-field">
                <label>Slug (URL) *</label>
                <input v-model="form.slug" class="cl-input" placeholder="midoc" />
                <span class="cl-field-hint">Solo letras minúsculas, números y guiones</span>
              </div>
            </div>

            <!-- Contacto -->
            <div class="cl-form-row">
              <div class="cl-field">
                <label>Correo de contacto</label>
                <input v-model="form.correoContacto" class="cl-input" placeholder="contacto@empresa.com" type="email" />
              </div>
              <div class="cl-field">
                <label>Teléfono</label>
                <input v-model="form.telefono" class="cl-input" placeholder="+591 70000000" />
              </div>
            </div>

            <!-- Plan -->
            <div class="cl-form-row">
              <div class="cl-field">
                <label>Plan</label>
                <select v-model="form.plan" class="cl-select">
                  <option value="basico">Básico</option>
                  <option value="profesional">Profesional</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
              <div v-if="editando" class="cl-field" style="display:flex;flex-direction:column;justify-content:flex-end;">
                <label style="margin-bottom:8px;">Estado</label>
                <div class="cl-toggle-row" @click="form.activo = !form.activo">
                  <div class="cl-toggle" :class="{ 'cl-toggle--on': form.activo }">
                    <div class="cl-toggle-knob"></div>
                  </div>
                  <span class="cl-toggle-lbl">{{ form.activo ? 'Cliente activo' : 'Cliente inactivo' }}</span>
                </div>
              </div>
            </div>

            <!-- Días de atención -->
            <div class="cl-field">
              <label>Días de atención</label>
              <div class="cl-dias-wrap">
                <label
                  v-for="d in diasOpciones"
                  :key="d.value"
                  class="cl-dia"
                  :class="{ 'cl-dia--on': form.diasAtencion.includes(d.value) }"
                  @click="toggleDia(d.value)"
                >{{ d.label }}</label>
              </div>
            </div>

            <!-- Horario -->
            <div class="cl-form-row">
              <div class="cl-field">
                <label>Hora inicio atención</label>
                <input v-model="form.horaInicioAtencion" class="cl-input" type="time" />
              </div>
              <div class="cl-field">
                <label>Hora fin atención</label>
                <input v-model="form.horaFinAtencion" class="cl-input" type="time" />
              </div>
            </div>

            <!-- Servicios -->
            <div class="cl-field">
              <label>Servicios <span style="color:#475569;font-weight:400;">(Enter para agregar)</span></label>
              <input
                v-model="servicioInput"
                class="cl-input"
                placeholder="Ej: Consulta médica"
                @keydown.enter.prevent="agregarServicio"
              />
              <div v-if="form.servicios.length" class="cl-tags-editable">
                <span
                  v-for="(s, i) in form.servicios"
                  :key="i"
                  class="cl-tag-edit"
                  @click="quitarServicio(i)"
                >{{ s }} <span style="opacity:0.6;">✕</span></span>
              </div>
            </div>
          </div>

          <div class="cl-dialog-ft">
            <button class="cl-btn-ghost" @click="cerrarDialog">Cancelar</button>
            <button class="cl-btn-primary" :disabled="guardando" @click="guardar">
              <svg v-if="guardando" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation:spin 1s linear infinite;"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
              {{ guardando ? 'Guardando…' : (editando ? 'Guardar cambios' : 'Crear cliente') }}
            </button>
          </div>
        </div>
      </div>
    </transition>

  </div>
</template>

<script>
const DIAS = [
  { value: 'lunes',     label: 'Lun' },
  { value: 'martes',    label: 'Mar' },
  { value: 'miercoles', label: 'Mié' },
  { value: 'jueves',    label: 'Jue' },
  { value: 'viernes',   label: 'Vie' },
  { value: 'sabado',    label: 'Sáb' },
  { value: 'domingo',   label: 'Dom' },
];

const emptyForm = () => ({
  nombre: '',
  slug: '',
  correoContacto: '',
  telefono: '',
  plan: 'basico',
  diasAtencion: [],
  horaInicioAtencion: '08:00',
  horaFinAtencion: '18:00',
  servicios: [],
  activo: true,
});

const emptyFormUsuario = () => ({
  usuario: '',
  contrasena: '',
  nombres: '',
  apellidos: '',
  correoElectronico: '',
  rol: 'COLABORADOR',
  rolClienteId: '',
});

const COLORS = ['#6366f1', '#c96442', '#22c55e', '#0ea5e9', '#a855f7', '#f59e0b', '#ef4444'];

export default {
  name: 'Clientes',
  data() {
    return {
      clientes: [],
      resumenes: {},
      cargando: false,
      busqueda: '',
      dialog: false,
      editando: null,
      form: emptyForm(),
      servicioInput: '',
      guardando: false,
      diasOpciones: DIAS,
      // usuarios modal
      dialogUsuarios: false,
      clienteSeleccionado: null,
      usuarios: [],
      roles: [],
      cargandoUsuarios: false,
      panelUsuario: false,
      editandoUsuario: null,
      formUsuario: emptyFormUsuario(),
      guardandoUsuario: false,
    };
  },
  computed: {
    clientesFiltrados() {
      if (!this.busqueda.trim()) return this.clientes;
      const q = this.busqueda.toLowerCase();
      return this.clientes.filter(c =>
        c.nombre.toLowerCase().includes(q) ||
        (c.slug || '').toLowerCase().includes(q) ||
        (c.correoContacto || '').toLowerCase().includes(q)
      );
    },
  },
  async mounted() {
    await this.cargar();
  },
  methods: {
    async cargar() {
      this.cargando = true;
      try {
        this.clientes = (await this.$service.list('clientes')) || [];
        this.cargarResumenes();
      } catch (e) {
        this.$message.error('Error al cargar clientes');
      } finally {
        this.cargando = false;
      }
    },
    async cargarResumenes() {
      for (const cl of this.clientes) {
        try {
          const res = await this.$service.get(`clientes/${cl.id}/resumen`);
          this.$set(this.resumenes, cl.id, res);
        } catch (_e) { /* silent */ }
      }
    },
    gestionarCliente(cl) {
      this.$store.commit('setClienteId', cl.id);
      this.$store.commit('setClienteInfo', cl);
      this.$router.push({ name: 'configuracion' });
    },
    avatarColor(nombre) {
      const i = nombre.charCodeAt(0) % COLORS.length;
      return COLORS[i] + '33';
    },
    autoSlug() {
      if (this.editando) return;
      this.form.slug = this.form.nombre
        .toLowerCase()
        .normalize('NFD').replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    },
    toggleDia(dia) {
      const idx = this.form.diasAtencion.indexOf(dia);
      if (idx >= 0) this.form.diasAtencion.splice(idx, 1);
      else this.form.diasAtencion.push(dia);
    },
    agregarServicio() {
      const s = this.servicioInput.trim();
      if (s && !this.form.servicios.includes(s)) this.form.servicios.push(s);
      this.servicioInput = '';
    },
    quitarServicio(i) {
      this.form.servicios.splice(i, 1);
    },
    abrirCrear() {
      this.editando = null;
      this.form = emptyForm();
      this.servicioInput = '';
      this.dialog = true;
    },
    abrirEditar(cl) {
      this.editando = cl.id;
      this.form = {
        nombre: cl.nombre,
        slug: cl.slug,
        correoContacto: cl.correoContacto || '',
        telefono: cl.telefono || '',
        plan: cl.plan || 'basico',
        diasAtencion: [...(cl.diasAtencion || [])],
        horaInicioAtencion: cl.horaInicioAtencion || '08:00',
        horaFinAtencion: cl.horaFinAtencion || '18:00',
        servicios: [...(cl.servicios || [])],
        activo: cl.activo !== false,
      };
      this.servicioInput = '';
      this.dialog = true;
    },
    cerrarDialog() {
      this.dialog = false;
      this.editando = null;
    },
    async guardar() {
      if (!this.form.nombre.trim() || !this.form.slug.trim()) {
        this.$message.error('Nombre y slug son obligatorios');
        return;
      }
      this.guardando = true;
      try {
        if (this.editando) {
          await this.$service.put(`clientes/${this.editando}`, this.form);
          this.$message.success('Cliente actualizado');
        } else {
          await this.$service.post('clientes', this.form);
          this.$message.success('Cliente creado');
        }
        this.cerrarDialog();
        await this.cargar();
      } catch (_e) {
        // error message already shown by the service interceptor
      } finally {
        this.guardando = false;
      }
    },
    confirmarEliminar(cl) {
      this.$confirm(`¿Eliminar el cliente "${cl.nombre}"? Esta acción no se puede deshacer.`, async () => {
        try {
          await this.$service.delete('clientes', cl.id);
          this.$message.success('Cliente eliminado');
          await this.cargar();
        } catch (_e) {
          // error message already shown by the service interceptor
        }
      });
    },

    // ── Gestión de usuarios ──────────────────────────────────────

    async abrirUsuarios(cl) {
      this.clienteSeleccionado = cl;
      this.panelUsuario = false;
      this.editandoUsuario = null;
      this.formUsuario = emptyFormUsuario();
      this.dialogUsuarios = true;
      this.cargandoUsuarios = true;
      try {
        const [usuarios, roles] = await Promise.all([
          this.$service.list(`clientes/${cl.id}/usuarios`),
          this.$service.list(`clientes/${cl.id}/roles`),
        ]);
        this.usuarios = usuarios || [];
        this.roles = roles || [];
      } catch (_e) {
        // handled by interceptor
      } finally {
        this.cargandoUsuarios = false;
      }
    },

    cerrarUsuarios() {
      this.dialogUsuarios = false;
      this.clienteSeleccionado = null;
      this.usuarios = [];
      this.roles = [];
      this.panelUsuario = false;
      this.editandoUsuario = null;
    },

    nuevoUsuario() {
      this.editandoUsuario = null;
      this.formUsuario = emptyFormUsuario();
      this.panelUsuario = true;
    },

    editarUsuario(u) {
      this.editandoUsuario = u.id;
      this.formUsuario = {
        usuario: u.usuario,
        contrasena: '',
        nombres: u.nombres,
        apellidos: u.apellidos || '',
        correoElectronico: u.correoElectronico || '',
        rol: u.rol || 'COLABORADOR',
        rolClienteId: u.rolClienteId || '',
      };
      this.panelUsuario = true;
    },

    async guardarUsuario() {
      if (!this.formUsuario.nombres.trim()) {
        this.$message.error('El nombre es obligatorio');
        return;
      }
      if (!this.editandoUsuario && !this.formUsuario.usuario.trim()) {
        this.$message.error('El usuario es obligatorio');
        return;
      }
      if (!this.editandoUsuario && this.formUsuario.contrasena.length < 6) {
        this.$message.error('La contraseña debe tener al menos 6 caracteres');
        return;
      }

      this.guardandoUsuario = true;
      const cid = this.clienteSeleccionado.id;
      const payload = { ...this.formUsuario };
      if (!payload.contrasena) delete payload.contrasena;
      if (!payload.rolClienteId) delete payload.rolClienteId;
      if (!payload.apellidos) delete payload.apellidos;
      if (!payload.correoElectronico) delete payload.correoElectronico;

      try {
        if (this.editandoUsuario) {
          await this.$service.put(`clientes/${cid}/usuarios/${this.editandoUsuario}`, payload);
          this.$message.success('Usuario actualizado');
        } else {
          await this.$service.post(`clientes/${cid}/usuarios`, payload);
          this.$message.success('Usuario creado');
        }
        this.panelUsuario = false;
        this.editandoUsuario = null;
        this.usuarios = (await this.$service.list(`clientes/${cid}/usuarios`)) || [];
      } catch (_e) {
        // handled by interceptor
      } finally {
        this.guardandoUsuario = false;
      }
    },

    confirmarEliminarUsuario(u) {
      this.$confirm(`¿Eliminar el usuario "${u.usuario}"? Esta acción no se puede deshacer.`, async () => {
        try {
          await this.$service.delete(`clientes/${this.clienteSeleccionado.id}/usuarios`, u.id);
          this.$message.success('Usuario eliminado');
          this.usuarios = this.usuarios.filter(x => x.id !== u.id);
        } catch (_e) {
          // handled by interceptor
        }
      });
    },
  },
};
</script>

<style scoped>
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

/* ── Layout ── */
.cl-layout {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background: #0a0f1e;
}

/* ── Header ── */
.cl-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid #1e3a5f44;
  flex-shrink: 0;
  gap: 12px;
  flex-wrap: wrap;
}
.cl-header__left  { display: flex; align-items: center; gap: 12px; }
.cl-header__right { display: flex; align-items: center; gap: 10px; }

.cl-header-icon {
  width: 40px; height: 40px;
  background: linear-gradient(135deg, #6366f1, #818cf8);
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.cl-header-title { font-size: 18px; font-weight: 800; color: #f1f5f9; margin: 0; }
.cl-header-sub   { font-size: 12px; color: #475569; margin: 0; }

.cl-search-wrap { position: relative; display: flex; align-items: center; }
.cl-search-ico  { position: absolute; left: 10px; pointer-events: none; }
.cl-search {
  background: #111827; border: 1px solid #1e3a5f44; border-radius: 8px;
  color: #e2e8f0; font-size: 12px; padding: 7px 12px 7px 30px;
  outline: none; font-family: inherit; width: 220px; transition: border-color 0.15s;
}
.cl-search:focus { border-color: #6366f1; }
.cl-search::placeholder { color: #334155; }

/* ── Buttons ── */
.cl-btn-primary {
  display: inline-flex; align-items: center; gap: 6px;
  background: #6366f1; color: #fff;
  border: none; border-radius: 8px;
  font-size: 13px; font-weight: 700; padding: 8px 16px;
  cursor: pointer; font-family: inherit; transition: background 0.15s;
  white-space: nowrap; flex-shrink: 0;
}
.cl-btn-primary:hover:not(:disabled) { background: #4f46e5; }
.cl-btn-primary:disabled { opacity: 0.55; cursor: not-allowed; }
.cl-btn-ghost {
  display: inline-flex; align-items: center; gap: 6px;
  background: #1e293b; color: #94a3b8;
  border: 1px solid #334155; border-radius: 8px;
  font-size: 13px; font-weight: 600; padding: 8px 16px;
  cursor: pointer; font-family: inherit; transition: all 0.15s;
}
.cl-btn-ghost:hover { background: #263348; }

/* ── Body / scroll ── */
.cl-body { flex: 1; overflow-y: auto; }

.cl-loading {
  display: flex; justify-content: center; align-items: center;
  padding: 80px;
}
.cl-spinner {
  width: 32px; height: 32px; border-radius: 50%;
  border: 3px solid #1e3a5f;
  border-top-color: #6366f1;
  animation: spin 0.8s linear infinite;
}

/* ── Empty state ── */
.cl-empty {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 80px 20px; text-align: center;
}
.cl-empty-icon {
  width: 64px; height: 64px; border-radius: 16px;
  background: #1e293b; display: flex; align-items: center; justify-content: center;
  margin-bottom: 16px;
}
.cl-empty-title { font-size: 15px; font-weight: 700; color: #e2e8f0; margin-bottom: 6px; }
.cl-empty-sub   { font-size: 12px; color: #475569; }

/* ── Grid ── */
.cl-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 14px;
  padding: 20px 24px;
}

/* ── Card ── */
.cl-card {
  background: #111827;
  border: 1px solid #1e3a5f44;
  border-radius: 14px;
  padding: 16px;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.cl-card:hover { border-color: #6366f133; box-shadow: 0 4px 24px #6366f108; }

.cl-card-hd {
  display: flex; align-items: center; gap: 10px;
  margin-bottom: 12px;
}
.cl-avatar {
  width: 40px; height: 40px; border-radius: 10px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 17px; font-weight: 800; color: #e2e8f0;
}
.cl-card-info { flex: 1; min-width: 0; }
.cl-card-nombre { font-size: 14px; font-weight: 700; color: #e2e8f0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.cl-card-slug   { font-size: 11px; color: #475569; font-family: monospace; }

.cl-plan { font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 999px; flex-shrink: 0; }
.cl-plan--basico      { background: #6366f122; color: #818cf8; }
.cl-plan--profesional { background: #f59e0b22; color: #f59e0b; }
.cl-plan--enterprise  { background: #22c55e22; color: #22c55e; }

/* ── Card meta ── */
.cl-card-meta {
  border-top: 1px solid #1e3a5f33;
  padding-top: 10px;
  margin-bottom: 10px;
  display: flex; flex-direction: column; gap: 4px;
}
.cl-meta-row {
  display: flex; align-items: center; gap: 6px;
  font-size: 11px; color: #64748b;
}
.cl-tags-row { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 6px; }
.cl-tag {
  font-size: 10px; font-weight: 600;
  background: #0f172a; color: #64748b;
  border: 1px solid #1e3a5f44;
  padding: 2px 7px; border-radius: 999px;
}
.cl-tag--more { color: #475569; }

/* ── Resumen ── */
.cl-resumen {
  display: flex; gap: 12px; align-items: center;
  border-top: 1px solid #1e3a5f33;
  padding-top: 8px; margin-bottom: 8px;
}
.cl-res-item {
  display: flex; align-items: center; gap: 4px;
  font-size: 11px; font-weight: 600; color: #475569;
}

/* ── Card footer ── */
.cl-card-ft {
  display: flex; align-items: center; justify-content: space-between;
  border-top: 1px solid #1e3a5f33; padding-top: 10px;
}
.cl-status { font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 999px; }
.cl-status--on  { background: #22c55e18; color: #22c55e; border: 1px solid #22c55e33; }
.cl-status--off { background: #ef444418; color: #ef4444; border: 1px solid #ef444433; }

.cl-card-acts { display: flex; gap: 6px; }
.cl-act-btn {
  width: 30px; height: 30px; border-radius: 7px;
  background: #1e293b; border: 1px solid #1e3a5f44;
  color: #64748b; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.15s;
}
.cl-act-btn:hover         { background: #263348; color: #94a3b8; }
.cl-act-btn--gear         { background: #6366f118; border-color: #6366f133; color: #818cf8; }
.cl-act-btn--gear:hover   { background: #6366f133; }
.cl-act-btn--del:hover    { background: #ef444412; border-color: #ef444433; color: #ef4444; }

/* ── Dialog inner ── */
.cl-dialog-hd {
  display: flex; align-items: flex-start; justify-content: space-between;
  padding: 20px 24px 16px;
  border-bottom: 1px solid #1e3a5f33;
}
.cl-dialog-title { font-size: 16px; font-weight: 800; color: #f1f5f9; margin-bottom: 2px; }
.cl-dialog-sub   { font-size: 12px; color: #475569; }
.cl-dialog-close {
  background: none; border: none; color: #475569; cursor: pointer;
  padding: 4px; border-radius: 6px; transition: color 0.15s;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.cl-dialog-close:hover { color: #ef4444; }

.cl-dialog-body {
  padding: 20px 24px;
  display: flex; flex-direction: column; gap: 16px;
  max-height: 60vh; overflow-y: auto;
}
.cl-dialog-ft {
  display: flex; justify-content: flex-end; gap: 8px;
  padding: 14px 24px;
  border-top: 1px solid #1e3a5f33;
}

/* ── Form ── */
.cl-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.cl-field { display: flex; flex-direction: column; gap: 5px; }
.cl-field label { font-size: 11px; font-weight: 700; color: #94a3b8; }
.cl-field-hint  { font-size: 10px; color: #475569; }

.cl-input {
  background: #0f172a; border: 1px solid #1e3a5f; border-radius: 8px;
  color: #e2e8f0; font-size: 13px; padding: 9px 11px; outline: none;
  font-family: inherit; transition: border-color 0.15s; width: 100%;
}
.cl-input:focus { border-color: #6366f1; }
.cl-input::placeholder { color: #334155; }

.cl-select {
  background: #0f172a; border: 1px solid #1e3a5f; border-radius: 8px;
  color: #e2e8f0; font-size: 13px; padding: 9px 11px; outline: none;
  font-family: inherit; width: 100%; appearance: none;
}

.cl-dias-wrap { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 2px; }
.cl-dia {
  padding: 5px 12px; border-radius: 6px;
  background: #0f172a; border: 1px solid #1e3a5f44;
  font-size: 11px; font-weight: 600; color: #64748b;
  cursor: pointer; user-select: none; transition: all 0.12s;
}
.cl-dia--on { background: #6366f122; border-color: #6366f144; color: #818cf8; }

.cl-tags-editable { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 6px; }
.cl-tag-edit {
  display: inline-flex; align-items: center; gap: 4px;
  background: #6366f122; color: #818cf8; border: 1px solid #6366f133;
  font-size: 11px; font-weight: 600; padding: 3px 9px; border-radius: 999px;
  cursor: pointer; transition: background 0.12s;
}
.cl-tag-edit:hover { background: #6366f133; }

/* ── Toggle ── */
.cl-toggle-row { display: flex; align-items: center; gap: 10px; cursor: pointer; }
.cl-toggle {
  width: 40px; height: 22px; border-radius: 999px;
  background: #334155; position: relative; transition: background 0.2s; flex-shrink: 0;
}
.cl-toggle--on { background: #6366f1; }
.cl-toggle-knob {
  position: absolute; top: 3px; left: 3px;
  width: 16px; height: 16px; border-radius: 50%;
  background: #fff; transition: transform 0.2s;
}
.cl-toggle--on .cl-toggle-knob { transform: translateX(18px); }
.cl-toggle-lbl { font-size: 13px; color: #cbd5e1; }

/* ── Modal backdrop ── */
.cl-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}
.cl-dialog {
  background: #111827;
  border: 1px solid #1e3a5f55;
  border-radius: 16px;
  overflow: hidden;
  width: 100%;
  max-width: 640px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

/* ── Fade transition ── */
.cl-fade-enter-active, .cl-fade-leave-active { transition: opacity 0.2s; }
.cl-fade-enter, .cl-fade-leave-to { opacity: 0; }

/* ── Users button ── */
.cl-act-btn--users         { background: #0ea5e918; border-color: #0ea5e933; color: #38bdf8; }
.cl-act-btn--users:hover   { background: #0ea5e933; }

/* ── Dialog wide ── */
.cl-dialog--lg { max-width: 740px; }

/* ── Small button ── */
.cl-btn-sm { padding: 6px 12px; font-size: 12px; }

/* ── Users modal ── */
.cl-u-loading {
  display: flex; justify-content: center; align-items: center;
  padding: 40px;
}
.cl-u-empty {
  display: flex; flex-direction: column; align-items: center;
  padding: 40px 20px; text-align: center;
}
.cl-u-list { display: flex; flex-direction: column; gap: 8px; }
.cl-u-row {
  display: flex; align-items: center; gap: 12px;
  background: #0f172a; border: 1px solid #1e3a5f33;
  border-radius: 10px; padding: 10px 12px;
  transition: border-color 0.15s;
}
.cl-u-row:hover { border-color: #1e3a5f88; }
.cl-u-avatar {
  width: 34px; height: 34px; border-radius: 8px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 14px; font-weight: 800; color: #e2e8f0;
}
.cl-u-info { flex: 1; min-width: 0; }
.cl-u-nombre { font-size: 13px; font-weight: 700; color: #e2e8f0; }
.cl-u-meta   { font-size: 11px; color: #475569; font-family: monospace; margin-top: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.cl-u-roles  { display: flex; gap: 5px; align-items: center; flex-wrap: wrap; }
.cl-u-badge {
  font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 999px;
  background: #1e293b; color: #64748b; border: 1px solid #334155;
}
.cl-u-badge--admin { background: #6366f118; color: #818cf8; border-color: #6366f133; }
.cl-u-badge--colab { background: #0ea5e918; color: #38bdf8; border-color: #0ea5e933; }
.cl-u-acts { display: flex; gap: 5px; flex-shrink: 0; }
</style>
