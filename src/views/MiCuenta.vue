<template>
  <div class="cfg-layout">

    <!-- ── SUB-NAV ── -->
    <div class="cfg-subnav">
      <div class="cfg-sn-sep">CONFIGURACIÓN</div>

      <button
        v-for="s in secciones"
        :key="s.id"
        class="cfg-sn-btn"
        :class="{ 'cfg-sn-btn--active': seccion === s.id }"
        @click="seccion = s.id"
      >
        <span v-html="s.svg" style="flex-shrink:0;display:flex;"></span>
        {{ s.label }}
      </button>
    </div>

    <!-- ── CONTENT ── -->
    <div class="cfg-body">

      <!-- ─── CANALES CONECTADOS ─── -->
      <template v-if="seccion === 'canales'">
        <div class="cfg-sec-hd">
          <h2 class="cfg-sec-title">Canales conectados</h2>
          <p class="cfg-sec-sub">Administra tus conexiones de mensajería</p>
        </div>

        <div class="cfg-canales">
          <div v-for="canal in canales" :key="canal.id" class="cfg-canal-card">
            <div class="cfg-canal-icon" :style="{ background: canal.bg }">
              <span v-html="canal.svg"></span>
            </div>
            <div class="cfg-canal-info">
              <div class="cfg-canal-nombre">{{ canal.nombre }}</div>
              <div class="cfg-canal-meta">{{ canal.info }}</div>
            </div>
            <div class="cfg-canal-actions">
              <span v-if="canal.conectado" class="cfg-badge-ok">Conectado</span>
              <button
                v-if="canal.conectado"
                class="cfg-btn-outline"
                @click="configurarCanal(canal)"
              >Configurar</button>
              <button
                v-else
                class="cfg-btn-connect"
                @click="conectarCanal(canal)"
              >+ Conectar</button>
            </div>
          </div>
        </div>
      </template>

      <!-- ─── AGENTES Y EQUIPOS ─── -->
      <template v-else-if="seccion === 'equipo'">
        <div class="cfg-sec-hd" style="display:flex;align-items:flex-start;justify-content:space-between;">
          <div>
            <h2 class="cfg-sec-title">Agentes y equipos</h2>
            <p class="cfg-sec-sub">Usuarios con acceso a la plataforma</p>
          </div>
          <button class="cfg-btn-primary cfg-btn--sm" @click="abrirDialogo()">+ Nuevo usuario</button>
        </div>

        <div v-if="cargandoUsuarios" class="cfg-loading">Cargando...</div>
        <template v-else>
          <div v-if="!usuarios.length" class="cfg-empty">No hay usuarios registrados</div>
          <div class="cfg-user-list">
            <div v-for="u in usuarios" :key="u.id" class="cfg-user-card">
              <div class="cfg-user-av" :style="{ background: avatarColor(u.nombres) }">
                {{ initials(u.nombres) }}
              </div>
              <div class="cfg-user-info">
                <div class="cfg-user-name">{{ u.nombres }} {{ u.apellidos }}</div>
                <div class="cfg-user-meta">@{{ u.usuario }} · {{ u.correoElectronico || '—' }}</div>
              </div>
              <div class="cfg-user-rol" :class="u.rol === 'ADMIN_CLIENTE' ? 'cfg-rol--admin' : 'cfg-rol--colab'">
                {{ u.rol === 'ADMIN_CLIENTE' ? 'Admin' : 'Colaborador' }}
              </div>
              <div class="cfg-user-acts">
                <button class="cfg-act-btn" title="Editar" @click="abrirDialogo(u)">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button class="cfg-act-btn cfg-act-btn--del" title="Eliminar" @click="confirmarEliminar(u)">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                </button>
              </div>
            </div>
          </div>
        </template>
      </template>

      <!-- ─── PLANTILLAS ─── -->
      <template v-else-if="seccion === 'plantillas'">
        <div class="cfg-sec-hd" style="display:flex;align-items:flex-start;justify-content:space-between;">
          <div>
            <h2 class="cfg-sec-title">Plantillas</h2>
            <p class="cfg-sec-sub">Mensajes predefinidos para respuestas rápidas</p>
          </div>
          <button class="cfg-btn-primary cfg-btn--sm" @click="$message && $message.info('Próximamente')">+ Nueva plantilla</button>
        </div>
        <div class="cfg-plantillas">
          <div v-for="p in plantillas" :key="p.id" class="cfg-plantilla-card">
            <div class="cfg-plantilla-header">
              <span class="cfg-plantilla-name">{{ p.nombre }}</span>
              <span class="cfg-badge-canal" :style="{ background: p.canalColor+'22', color: p.canalColor, border: '1px solid '+p.canalColor+'44' }">{{ p.canal }}</span>
            </div>
            <div class="cfg-plantilla-text">{{ p.texto }}</div>
            <div class="cfg-plantilla-footer">
              <span class="cfg-tag">{{ p.categoria }}</span>
              <div style="display:flex;gap:4px;">
                <button class="cfg-act-btn" title="Editar"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                <button class="cfg-act-btn cfg-act-btn--del" title="Eliminar"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg></button>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- ─── ETIQUETAS ─── -->
      <template v-else-if="seccion === 'etiquetas'">
        <div class="cfg-sec-hd" style="display:flex;align-items:flex-start;justify-content:space-between;">
          <div>
            <h2 class="cfg-sec-title">Etiquetas</h2>
            <p class="cfg-sec-sub">Clasifica tus conversaciones y contactos</p>
          </div>
          <button class="cfg-btn-primary cfg-btn--sm" @click="abrirEtiqueta()">+ Nueva etiqueta</button>
        </div>
        <div class="cfg-etiquetas-grid">
          <div v-for="e in etiquetas" :key="e.id" class="cfg-etiqueta-card">
            <div class="cfg-etiqueta-dot" :style="{ background: e.color }"></div>
            <div style="flex:1;">
              <div class="cfg-etiqueta-nombre">{{ e.nombre }}</div>
              <div class="cfg-etiqueta-count">{{ e.count }} contactos</div>
            </div>
            <div style="display:flex;gap:4px;">
              <button class="cfg-act-btn" @click="abrirEtiqueta(e)"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
              <button class="cfg-act-btn cfg-act-btn--del"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg></button>
            </div>
          </div>
        </div>
      </template>

      <!-- ─── AUTOMATIZACIONES ─── -->
      <template v-else-if="seccion === 'automatizaciones'">
        <div class="cfg-sec-hd" style="display:flex;align-items:flex-start;justify-content:space-between;">
          <div>
            <h2 class="cfg-sec-title">Automatizaciones</h2>
            <p class="cfg-sec-sub">Reglas automáticas de asignación y seguimiento</p>
          </div>
          <button class="cfg-btn-primary cfg-btn--sm" @click="$message && $message.info('Próximamente')">+ Nueva regla</button>
        </div>
        <div class="cfg-auto-list">
          <div v-for="a in automatizaciones" :key="a.id" class="cfg-auto-card">
            <div class="cfg-auto-icon" :style="{ background: a.activa ? '#22c55e18' : '#1e293b', color: a.activa ? '#22c55e' : '#475569' }">
              <span v-html="a.svg"></span>
            </div>
            <div style="flex:1;">
              <div class="cfg-auto-nombre">{{ a.nombre }}</div>
              <div class="cfg-auto-desc">{{ a.descripcion }}</div>
            </div>
            <div class="cfg-toggle-wrap" @click="a.activa = !a.activa">
              <div class="cfg-toggle" :class="{ 'cfg-toggle--on': a.activa }">
                <div class="cfg-toggle-knob"></div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- ─── NOTIFICACIONES ─── -->
      <template v-else-if="seccion === 'notificaciones'">
        <div class="cfg-sec-hd">
          <h2 class="cfg-sec-title">Notificaciones</h2>
          <p class="cfg-sec-sub">Configura qué alertas quieres recibir</p>
        </div>
        <div class="cfg-noti-list">
          <div v-for="n in notifConfig" :key="n.id" class="cfg-noti-row">
            <div style="flex:1;">
              <div class="cfg-noti-nombre">{{ n.nombre }}</div>
              <div class="cfg-noti-desc">{{ n.descripcion }}</div>
            </div>
            <div class="cfg-noti-canales">
              <label v-for="c in n.canales" :key="c.id" class="cfg-noti-ch">
                <input type="checkbox" v-model="c.activo" />
                {{ c.label }}
              </label>
            </div>
          </div>
        </div>
        <div style="margin-top:20px;">
          <button class="cfg-btn-primary" @click="$message && $message.success('Preferencias guardadas')">Guardar preferencias</button>
        </div>
      </template>

      <!-- ─── CUENTA Y ACCESO ─── -->
      <template v-else-if="seccion === 'cuenta'">
        <div class="cfg-sec-hd">
          <h2 class="cfg-sec-title">Cuenta y acceso</h2>
          <p class="cfg-sec-sub">Información de la empresa y configuración de acceso</p>
        </div>
        <div v-if="cargando" class="cfg-loading">Cargando...</div>
        <template v-else>
          <div style="max-width:640px;display:flex;flex-direction:column;gap:16px;">
            <div class="cfg-form-row">
              <div class="cfg-field">
                <label>Nombre de la empresa *</label>
                <input v-model="forma.nombre" class="cfg-input" placeholder="Ej. MiEmpresa" />
              </div>
              <div class="cfg-field">
                <label>Correo de contacto</label>
                <input v-model="forma.correoContacto" class="cfg-input" type="email" placeholder="contacto@empresa.com" />
              </div>
            </div>
            <div class="cfg-form-row">
              <div class="cfg-field">
                <label>Teléfono</label>
                <input v-model="forma.telefono" class="cfg-input" placeholder="+52 55 1234 5678" />
              </div>
              <div class="cfg-field">
                <label>URL del logo</label>
                <input v-model="forma.logoUrl" class="cfg-input" placeholder="https://..." />
              </div>
            </div>
            <button class="cfg-btn-primary" :disabled="guardando" @click="guardarEmpresa" style="align-self:flex-start;">
              {{ guardando ? 'Guardando…' : 'Guardar cambios' }}
            </button>
          </div>
        </template>
      </template>

    </div>

    <!-- ── MODAL: Config canal ── -->
    <v-dialog v-model="modalCanal" max-width="500" content-class="ide-dialog">
      <v-card class="cfg-dialog-card" style="border-radius:14px;" v-if="canalActivo">
        <v-card-title class="cfg-dialog-title">{{ canalActivo.nombre }}</v-card-title>
        <v-card-text style="padding:0 24px 16px;">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
            <div class="cfg-canal-icon cfg-canal-icon--sm" :style="{ background: canalActivo.bg }">
              <span v-html="canalActivo.svg"></span>
            </div>
            <div>
              <div class="cfg-canal-nombre">{{ canalActivo.nombre }}</div>
              <div class="cfg-canal-meta">{{ canalActivo.info }}</div>
            </div>
            <span class="cfg-badge-ok" style="margin-left:auto;">Conectado</span>
          </div>
          <div v-if="canalActivo.id === 'whatsapp'" class="cfg-canal-tip">
            Para editar credenciales de WhatsApp Cloud API ve a la sección
            <strong style="color:#818cf8;">WhatsApp API</strong> en el menú lateral.
          </div>
          <div v-else class="cfg-canal-tip">
            La configuración detallada de {{ canalActivo.nombre }} estará disponible próximamente.
          </div>
        </v-card-text>
        <v-card-actions style="padding:8px 24px 20px;gap:8px;">
          <button class="cfg-btn-ghost" style="flex:1;" @click="modalCanal = false">Cerrar</button>
          <button v-if="canalActivo.id === 'whatsapp'" class="cfg-btn-primary" style="flex:1;" @click="irAWhatsApp">Ir a WhatsApp API</button>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ── MODAL: Crear/editar usuario ── -->
    <v-dialog v-model="dialogo" max-width="480" content-class="ide-dialog">
      <v-card class="cfg-dialog-card" style="border-radius:14px;">
        <v-card-title class="cfg-dialog-title">{{ editando ? 'Editar usuario' : 'Nuevo usuario' }}</v-card-title>
        <v-card-text style="padding:0 24px 8px;">
          <div style="display:flex;flex-direction:column;gap:14px;padding-top:8px;">
            <div class="cfg-form-row">
              <div class="cfg-field">
                <label>Nombres *</label>
                <input v-model="form.nombres" class="cfg-input" placeholder="Nombre completo" />
              </div>
              <div class="cfg-field">
                <label>Apellidos</label>
                <input v-model="form.apellidos" class="cfg-input" placeholder="Apellidos" />
              </div>
            </div>
            <div v-if="!editando" class="cfg-field">
              <label>Usuario *</label>
              <input v-model="form.usuario" class="cfg-input" placeholder="nombre_usuario" />
            </div>
            <div class="cfg-field">
              <label>Correo electrónico</label>
              <input v-model="form.correoElectronico" class="cfg-input" type="email" placeholder="usuario@empresa.com" />
            </div>
            <div class="cfg-field">
              <label>{{ editando ? 'Nueva contraseña (dejar vacío para no cambiar)' : 'Contraseña *' }}</label>
              <input v-model="form.contrasena" class="cfg-input" type="password" placeholder="••••••••" />
            </div>
            <div class="cfg-field">
              <label>Nivel de acceso</label>
              <select v-model="form.rol" class="cfg-select">
                <option value="COLABORADOR">Colaborador</option>
                <option value="ADMIN_CLIENTE">Administrador</option>
              </select>
            </div>
          </div>
        </v-card-text>
        <v-card-actions style="padding:16px 24px 20px;gap:8px;">
          <button class="cfg-btn-ghost" style="flex:1;" @click="dialogo = false">Cancelar</button>
          <button class="cfg-btn-primary" style="flex:1;" :disabled="guardandoUsuario" @click="guardarUsuario">
            {{ guardandoUsuario ? 'Guardando…' : (editando ? 'Actualizar' : 'Crear usuario') }}
          </button>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ── MODAL: Etiqueta ── -->
    <v-dialog v-model="dialogoEtiqueta" max-width="360" content-class="ide-dialog">
      <v-card class="cfg-dialog-card" style="border-radius:14px;">
        <v-card-title class="cfg-dialog-title">{{ etiquetaEdit ? 'Editar etiqueta' : 'Nueva etiqueta' }}</v-card-title>
        <v-card-text style="padding:0 24px 16px;">
          <div style="display:flex;flex-direction:column;gap:12px;padding-top:8px;">
            <div class="cfg-field">
              <label>Nombre *</label>
              <input v-model="formEtiqueta.nombre" class="cfg-input" placeholder="Ej. Interesado" />
            </div>
            <div class="cfg-field">
              <label>Color</label>
              <div style="display:flex;gap:8px;flex-wrap:wrap;">
                <button
                  v-for="c in coloresEtiqueta"
                  :key="c"
                  :style="{ width:'24px', height:'24px', borderRadius:'50%', background:c, border: formEtiqueta.color === c ? '2px solid #fff' : '2px solid transparent', cursor:'pointer' }"
                  @click="formEtiqueta.color = c"
                ></button>
              </div>
            </div>
          </div>
        </v-card-text>
        <v-card-actions style="padding:8px 24px 20px;gap:8px;">
          <button class="cfg-btn-ghost" style="flex:1;" @click="dialogoEtiqueta = false">Cancelar</button>
          <button class="cfg-btn-primary" style="flex:1;" @click="guardarEtiqueta">Guardar</button>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </div>
</template>

<script>
const SVG_WA = `<svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>`;
const SVG_FB = `<svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`;
const SVG_IG = `<svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>`;
const SVG_TK = `<svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.82a8.18 8.18 0 004.78 1.52V6.9a4.84 4.84 0 01-1.01-.21z"/></svg>`;

const SVGS_NAV = {
  channels: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>`,
  team:     `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>`,
  template: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  tag:      `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>`,
  auto:     `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>`,
  bell:     `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg>`,
  settings: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>`,
};

const SVG_AUTO_ASSIGN = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>`;
const SVG_AUTO_RESP = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>`;
const SVG_AUTO_LEAD = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;

export default {
  name: 'MiCuenta',
  data: () => ({
    seccion: 'canales',
    secciones: [
      { id: 'canales',          label: 'Canales conectados', svg: SVGS_NAV.channels },
      { id: 'equipo',           label: 'Agentes y equipos',  svg: SVGS_NAV.team     },
      { id: 'plantillas',       label: 'Plantillas',         svg: SVGS_NAV.template },
      { id: 'etiquetas',        label: 'Etiquetas',          svg: SVGS_NAV.tag      },
      { id: 'automatizaciones', label: 'Automatizaciones',   svg: SVGS_NAV.auto     },
      { id: 'notificaciones',   label: 'Notificaciones',     svg: SVGS_NAV.bell     },
      { id: 'cuenta',           label: 'Cuenta y acceso',    svg: SVGS_NAV.settings },
    ],
    canales: [
      {
        id: 'whatsapp',
        nombre: 'WhatsApp Cloud API',
        info: '+52 55 1234 0000 · 612 mensajes',
        conectado: true,
        color: '#25D366',
        bg: 'linear-gradient(135deg,#25D366,#128C7E)',
        svg: SVG_WA,
      },
      {
        id: 'facebook',
        nombre: 'Facebook Messenger',
        info: 'MiEmpresa Oficial · 224 mensajes',
        conectado: true,
        color: '#1877F2',
        bg: '#1877F2',
        svg: SVG_FB,
      },
      {
        id: 'instagram',
        nombre: 'Instagram DM',
        info: '@miempresa_mx · 318 mensajes',
        conectado: true,
        color: '#E1306C',
        bg: 'linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)',
        svg: SVG_IG,
      },
      {
        id: 'tiktok',
        nombre: 'TikTok Messages',
        info: '—',
        conectado: false,
        color: '#EE1D52',
        bg: '#1a1a2e',
        svg: SVG_TK,
      },
    ],
    plantillas: [
      { id: 1, nombre: 'Bienvenida', texto: 'Hola {{nombre}}, gracias por contactarnos. ¿En qué podemos ayudarte hoy?', categoria: 'Saludo', canal: 'WhatsApp', canalColor: '#25D366' },
      { id: 2, nombre: 'Seguimiento',texto: 'Hola {{nombre}}, te escribimos para dar seguimiento a tu consulta. ¿Pudiste resolver tu duda?', categoria: 'Seguimiento', canal: 'WhatsApp', canalColor: '#25D366' },
      { id: 3, nombre: 'Cierre',     texto: 'Gracias por contactar a {{empresa}}. Hemos resuelto tu solicitud. ¡Que tengas un excelente día!', categoria: 'Cierre', canal: 'Instagram', canalColor: '#E1306C' },
    ],
    etiquetas: [
      { id: 1, nombre: 'Hot Lead',   color: '#ef4444', count: 42 },
      { id: 2, nombre: 'Interesado', color: '#f59e0b', count: 87 },
      { id: 3, nombre: 'Cliente',    color: '#22c55e', count: 134 },
      { id: 4, nombre: 'Prospecto',  color: '#818cf8', count: 56 },
      { id: 5, nombre: 'Reclamación',color: '#f97316', count: 18 },
      { id: 6, nombre: 'Inactivo',   color: '#64748b', count: 29 },
    ],
    automatizaciones: [
      { id: 1, nombre: 'Asignación automática',        descripcion: 'Asigna conversaciones al agente disponible', activa: true,  svg: SVG_AUTO_ASSIGN },
      { id: 2, nombre: 'Respuesta fuera de horario',   descripcion: 'Envía mensaje cuando no hay agentes activos', activa: true,  svg: SVG_AUTO_RESP  },
      { id: 3, nombre: 'Calificación de leads',        descripcion: 'Puntúa leads automáticamente con IA',        activa: false, svg: SVG_AUTO_LEAD  },
    ],
    notifConfig: [
      { id: 'nueva_conv',   nombre: 'Nueva conversación',     descripcion: 'Cuando llegue un mensaje nuevo sin asignar', canales: [{ id:'app', label:'App', activo:true }, { id:'email', label:'Email', activo:false }] },
      { id: 'asignada',     nombre: 'Conversación asignada',  descripcion: 'Cuando te asignen una conversación',         canales: [{ id:'app', label:'App', activo:true }, { id:'email', label:'Email', activo:true  }] },
      { id: 'hot_lead',     nombre: 'Hot lead detectado',     descripcion: 'Cuando un lead supere el score 70+',         canales: [{ id:'app', label:'App', activo:true }, { id:'email', label:'Email', activo:false }] },
      { id: 'sin_respuesta',nombre: 'Sin respuesta (30 min)', descripcion: 'Conversaciones sin respuesta por más de 30 min', canales: [{ id:'app', label:'App', activo:false }, { id:'email', label:'Email', activo:false }] },
    ],
    coloresEtiqueta: ['#ef4444','#f97316','#f59e0b','#22c55e','#14b8a6','#3b82f6','#8b5cf6','#ec4899','#64748b','#818cf8'],
    // Dialogs
    modalCanal: false,
    canalActivo: null,
    dialogo: false,
    editando: null,
    guardandoUsuario: false,
    form: { nombres:'', apellidos:'', usuario:'', correoElectronico:'', contrasena:'', rol:'COLABORADOR' },
    dialogoEtiqueta: false,
    etiquetaEdit: null,
    formEtiqueta: { nombre:'', color:'#818cf8' },
    // Data
    cargandoUsuarios: false,
    usuarios: [],
    cargando: false,
    guardando: false,
    forma: { nombre:'', correoContacto:'', telefono:'', logoUrl:'' },
  }),
  mounted() {
    this.cargarEmpresa();
    this.cargarUsuarios();
  },
  methods: {
    configurarCanal(canal) {
      this.canalActivo = canal;
      this.modalCanal = true;
    },
    conectarCanal() {
      this.$message && this.$message.info('Conexión de canal disponible próximamente');
    },
    irAWhatsApp() {
      this.modalCanal = false;
      this.$router.push({ name: 'configuracion' });
    },
    async cargarEmpresa() {
      this.cargando = true;
      try {
        const data = await this.$service.get('mi-cuenta');
        if (data) {
          this.forma = { nombre: data.nombre || '', correoContacto: data.correoContacto || '', telefono: data.telefono || '', logoUrl: data.logoUrl || '' };
          this.$store.commit('setClienteInfo', data);
        }
      } finally {
        this.cargando = false;
      }
    },
    async guardarEmpresa() {
      if (!this.forma.nombre) { this.$message.error('El nombre de la empresa es requerido'); return; }
      this.guardando = true;
      try {
        const data = await this.$service.put('mi-cuenta', this.forma);
        this.$store.commit('setClienteInfo', data);
        this.$message.success('Información guardada correctamente');
      } catch (e) {
        this.$message.error(e?.mensaje || 'Error al guardar');
      } finally {
        this.guardando = false;
      }
    },
    async cargarUsuarios() {
      this.cargandoUsuarios = true;
      try {
        const data = await this.$service.get('mi-cuenta/usuarios');
        this.usuarios = Array.isArray(data) ? data : [];
      } finally {
        this.cargandoUsuarios = false;
      }
    },
    abrirDialogo(usuario = null) {
      this.editando = usuario;
      if (usuario) {
        this.form = { nombres: usuario.nombres || '', apellidos: usuario.apellidos || '', usuario: usuario.usuario || '', correoElectronico: usuario.correoElectronico || '', contrasena: '', rol: usuario.rol || 'COLABORADOR' };
      } else {
        this.form = { nombres:'', apellidos:'', usuario:'', correoElectronico:'', contrasena:'', rol:'COLABORADOR' };
      }
      this.dialogo = true;
    },
    async guardarUsuario() {
      if (!this.form.nombres || (!this.editando && (!this.form.usuario || !this.form.contrasena))) {
        this.$message.error('Completa los campos requeridos');
        return;
      }
      this.guardandoUsuario = true;
      try {
        const payload = { ...this.form };
        if (this.editando && !payload.contrasena) delete payload.contrasena;
        if (this.editando) { delete payload.usuario; await this.$service.put(`mi-cuenta/usuarios/${this.editando.id}`, payload); }
        else { await this.$service.post('mi-cuenta/usuarios', payload); }
        this.dialogo = false;
        await this.cargarUsuarios();
        this.$message.success(this.editando ? 'Usuario actualizado' : 'Usuario creado');
      } catch (e) {
        this.$message.error(e?.mensaje || 'Error al guardar usuario');
      } finally {
        this.guardandoUsuario = false;
      }
    },
    confirmarEliminar(u) {
      this.$confirm(`¿Eliminar al usuario "${u.nombres}"?`, async () => {
        try {
          await this.$service.delete(`mi-cuenta/usuarios/${u.id}`);
          await this.cargarUsuarios();
          this.$message.success('Usuario eliminado');
        } catch (e) {
          this.$message.error(e?.mensaje || 'Error al eliminar');
        }
      });
    },
    abrirEtiqueta(e = null) {
      this.etiquetaEdit = e;
      this.formEtiqueta = e ? { nombre: e.nombre, color: e.color } : { nombre: '', color: '#818cf8' };
      this.dialogoEtiqueta = true;
    },
    guardarEtiqueta() {
      if (!this.formEtiqueta.nombre.trim()) { this.$message.error('El nombre es requerido'); return; }
      if (this.etiquetaEdit) {
        this.etiquetaEdit.nombre = this.formEtiqueta.nombre;
        this.etiquetaEdit.color = this.formEtiqueta.color;
      } else {
        this.etiquetas.push({ id: Date.now(), nombre: this.formEtiqueta.nombre, color: this.formEtiqueta.color, count: 0 });
      }
      this.dialogoEtiqueta = false;
      this.$message.success('Etiqueta guardada');
    },
    initials(n) { return (n || 'U').split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase(); },
    avatarColor(n) {
      const c = ['#6366f133','#8b5cf633','#22c55e33','#f59e0b33','#e1306c33'];
      return c[(n || 'A').charCodeAt(0) % c.length];
    },
  },
};
</script>

<style scoped>
/* ── Layout ── */
.cfg-layout { display:flex; height:100%; overflow:hidden; background:#0a0f1e; }

/* ── Sub-nav ── */
.cfg-subnav {
  width: 200px; flex-shrink:0;
  background:#0d1526; border-right:1px solid #1e3a5f44;
  display:flex; flex-direction:column; overflow:hidden;
  padding: 4px 0;
}
.cfg-sn-sep {
  padding:16px 16px 8px; font-size:10px; font-weight:700;
  color:#475569; letter-spacing:1px; text-transform:uppercase;
}
.cfg-sn-btn {
  display:flex; align-items:center; gap:10px;
  padding:9px 16px; border:none; background:transparent;
  color:#64748b; font-size:12px; font-weight:500;
  cursor:pointer; text-align:left; transition:all 0.15s;
  font-family:inherit; width:100%;
}
.cfg-sn-btn:hover { background:#1e293b44; color:#94a3b8; }
.cfg-sn-btn--active { background:#6366f118; color:#818cf8; font-weight:700; border-left:3px solid #6366f1; }

/* ── Body ── */
.cfg-body { flex:1; overflow-y:auto; padding:28px 32px; }

/* ── Section header ── */
.cfg-sec-hd { margin-bottom:24px; }
.cfg-sec-title { font-size:22px; font-weight:900; color:#f1f5f9; letter-spacing:-0.5px; margin:0 0 4px; }
.cfg-sec-sub { font-size:12px; color:#64748b; margin:0; }

/* ── Canal cards ── */
.cfg-canales { display:flex; flex-direction:column; gap:12px; max-width:720px; }
.cfg-canal-card {
  display:flex; align-items:center; gap:16px;
  background:#111827; border:1px solid #1e3a5f44; border-radius:14px;
  padding:16px 20px; transition:border-color 0.15s;
}
.cfg-canal-card:hover { border-color:#334155; }
.cfg-canal-icon {
  width:48px; height:48px; border-radius:14px;
  display:flex; align-items:center; justify-content:center;
  flex-shrink:0;
}
.cfg-canal-icon--sm { width:40px; height:40px; border-radius:10px; }
.cfg-canal-nombre { font-size:15px; font-weight:800; color:#f1f5f9; margin-bottom:3px; }
.cfg-canal-meta { font-size:12px; color:#64748b; }
.cfg-canal-info { flex:1; min-width:0; }
.cfg-canal-actions { display:flex; align-items:center; gap:10px; flex-shrink:0; }
.cfg-badge-ok {
  padding:4px 12px; border-radius:999px;
  background:#22c55e18; color:#22c55e;
  border:1px solid #22c55e33;
  font-size:11px; font-weight:700;
}
.cfg-btn-outline {
  padding:6px 16px; border-radius:8px;
  border:1px solid #334155; background:transparent;
  color:#94a3b8; font-size:12px; font-weight:600;
  cursor:pointer; font-family:inherit; transition:all 0.15s;
}
.cfg-btn-outline:hover { border-color:#475569; color:#f1f5f9; }
.cfg-btn-connect {
  padding:8px 18px; border-radius:8px;
  border:none; background:#6366f1;
  color:#fff; font-size:13px; font-weight:700;
  cursor:pointer; font-family:inherit; transition:background 0.15s;
}
.cfg-btn-connect:hover { background:#4f46e5; }

/* ── Canal tip in modal ── */
.cfg-canal-tip {
  background:#1e293b; border:1px solid #334155; border-radius:8px;
  padding:12px 14px; font-size:12px; color:#94a3b8; line-height:1.5;
}

/* ── User list ── */
.cfg-loading { color:#475569; font-size:13px; padding:20px 0; }
.cfg-empty   { color:#475569; font-size:13px; padding:40px; text-align:center; }
.cfg-user-list { display:flex; flex-direction:column; gap:8px; max-width:680px; }
.cfg-user-card {
  display:flex; align-items:center; gap:12px;
  background:#111827; border:1px solid #1e3a5f44; border-radius:10px;
  padding:12px 16px;
}
.cfg-user-av {
  width:36px; height:36px; border-radius:9px; flex-shrink:0;
  display:flex; align-items:center; justify-content:center;
  font-size:12px; font-weight:700; color:#818cf8;
}
.cfg-user-info { flex:1; min-width:0; }
.cfg-user-name { font-size:13px; font-weight:700; color:#e2e8f0; }
.cfg-user-meta { font-size:11px; color:#64748b; }
.cfg-user-rol {
  font-size:10px; font-weight:700; padding:2px 8px; border-radius:999px; flex-shrink:0;
}
.cfg-rol--admin { background:#6366f122; color:#818cf8; }
.cfg-rol--colab { background:#1e293b; color:#64748b; }
.cfg-user-acts { display:flex; gap:4px; }
.cfg-act-btn {
  background:none; border:none; color:#475569; cursor:pointer;
  padding:5px; border-radius:6px; transition:color 0.15s;
  display:flex; align-items:center; justify-content:center;
}
.cfg-act-btn:hover { color:#94a3b8; }
.cfg-act-btn--del:hover { color:#ef4444; }

/* ── Plantillas ── */
.cfg-plantillas { display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:12px; }
.cfg-plantilla-card {
  background:#111827; border:1px solid #1e3a5f44; border-radius:12px;
  padding:14px 16px; display:flex; flex-direction:column; gap:8px;
}
.cfg-plantilla-header { display:flex; align-items:center; justify-content:space-between; gap:8px; }
.cfg-plantilla-name { font-size:13px; font-weight:700; color:#e2e8f0; }
.cfg-badge-canal { font-size:10px; font-weight:700; padding:2px 8px; border-radius:999px; }
.cfg-plantilla-text { font-size:12px; color:#64748b; line-height:1.5; }
.cfg-plantilla-footer { display:flex; align-items:center; justify-content:space-between; }
.cfg-tag { font-size:10px; font-weight:600; background:#1e293b; color:#475569; padding:2px 8px; border-radius:4px; }

/* ── Etiquetas ── */
.cfg-etiquetas-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(240px,1fr)); gap:10px; }
.cfg-etiqueta-card {
  display:flex; align-items:center; gap:12px;
  background:#111827; border:1px solid #1e3a5f44; border-radius:10px;
  padding:12px 14px;
}
.cfg-etiqueta-dot { width:12px; height:12px; border-radius:50%; flex-shrink:0; }
.cfg-etiqueta-nombre { font-size:13px; font-weight:700; color:#e2e8f0; }
.cfg-etiqueta-count { font-size:11px; color:#64748b; margin-top:2px; }

/* ── Automatizaciones ── */
.cfg-auto-list { display:flex; flex-direction:column; gap:10px; max-width:640px; }
.cfg-auto-card {
  display:flex; align-items:center; gap:14px;
  background:#111827; border:1px solid #1e3a5f44; border-radius:12px;
  padding:14px 18px;
}
.cfg-auto-icon {
  width:38px; height:38px; border-radius:10px; flex-shrink:0;
  display:flex; align-items:center; justify-content:center;
}
.cfg-auto-nombre { font-size:13px; font-weight:700; color:#e2e8f0; margin-bottom:3px; }
.cfg-auto-desc { font-size:11px; color:#64748b; }
.cfg-toggle-wrap { flex-shrink:0; cursor:pointer; }
.cfg-toggle {
  width:40px; height:22px; border-radius:999px;
  background:#334155; position:relative; transition:background 0.2s;
}
.cfg-toggle--on { background:#6366f1; }
.cfg-toggle-knob {
  position:absolute; top:3px; left:3px;
  width:16px; height:16px; border-radius:50%;
  background:#fff; transition:transform 0.2s;
}
.cfg-toggle--on .cfg-toggle-knob { transform:translateX(18px); }

/* ── Notificaciones ── */
.cfg-noti-list { display:flex; flex-direction:column; gap:0; max-width:640px; }
.cfg-noti-row {
  display:flex; align-items:center; gap:16px;
  padding:14px 0; border-bottom:1px solid #1e3a5f22;
}
.cfg-noti-nombre { font-size:13px; font-weight:700; color:#e2e8f0; margin-bottom:3px; }
.cfg-noti-desc { font-size:11px; color:#64748b; }
.cfg-noti-canales { display:flex; gap:14px; flex-shrink:0; }
.cfg-noti-ch {
  display:flex; align-items:center; gap:5px;
  font-size:11px; color:#64748b; cursor:pointer;
}
.cfg-noti-ch input { accent-color:#6366f1; }

/* ── Form ── */
.cfg-form-row { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
.cfg-field { display:flex; flex-direction:column; gap:5px; }
.cfg-field label { font-size:11px; font-weight:700; color:#94a3b8; }
.cfg-input {
  background:#0f172a; border:1px solid #1e3a5f; border-radius:8px;
  color:#e2e8f0; font-size:13px; padding:9px 11px; outline:none;
  font-family:inherit; transition:border-color 0.15s; width:100%;
}
.cfg-input:focus { border-color:#6366f1; }
.cfg-input::placeholder { color:#334155; }
.cfg-select {
  background:#0f172a; border:1px solid #1e3a5f; border-radius:8px;
  color:#e2e8f0; font-size:13px; padding:9px 11px; outline:none;
  font-family:inherit; width:100%;
}

/* ── Buttons ── */
.cfg-btn-primary {
  display:inline-flex; align-items:center; justify-content:center; gap:6px;
  border-radius:8px; border:none; background:#6366f1; color:#fff;
  font-size:13px; font-weight:600; padding:9px 18px;
  cursor:pointer; transition:background 0.15s; font-family:inherit;
}
.cfg-btn-primary:hover:not(:disabled) { background:#4f46e5; }
.cfg-btn-primary:disabled { opacity:0.55; cursor:not-allowed; }
.cfg-btn--sm { font-size:12px; padding:7px 14px; }
.cfg-btn-ghost {
  display:inline-flex; align-items:center; justify-content:center;
  border-radius:8px; border:1px solid #334155; background:#1e293b;
  color:#94a3b8; font-size:13px; font-weight:600; padding:9px 18px;
  cursor:pointer; font-family:inherit; transition:background 0.15s;
}
.cfg-btn-ghost:hover { background:#273548; }

/* ── Dialog ── */
.cfg-dialog-card { background:#1e293b !important; border:1px solid #334155; }
.cfg-dialog-title { font-size:15px !important; font-weight:800 !important; color:#f1f5f9 !important; padding:20px 24px 12px !important; }
</style>
