<template>
  <div class="ide-app">

    <!-- ── SIDEBAR ── -->
    <div class="ide-sidebar" :class="{ 'ide-sidebar--collapsed': collapsed }">

      <!-- Logo -->
      <div class="ide-sidebar__header" :class="{ 'ide-sidebar__header--collapsed': collapsed }">
        <div class="ide-logo">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
          </svg>
        </div>
        <div v-if="!collapsed" class="ide-logo-text">
          <div class="ide-logo-name">CRM Chat</div>
          <div class="ide-logo-sub">OMNICANAL</div>
        </div>
      </div>

      <!-- Client badge (ADMIN_CLIENTE / COLABORADOR) -->
      <div v-if="clienteNombre && userRol !== 'SUPER_ADMIN'" class="ide-cliente-badge">
        <span class="ide-cliente-dot"></span>
        <span v-if="!collapsed" class="ide-cliente-name">{{ clienteNombre }}</span>
      </div>

      <!-- Nav -->
      <nav class="ide-nav">
        <button
          v-for="item in nav"
          :key="item.id"
          class="ide-nav__item"
          :class="{ 'ide-nav__item--active': active === item.id }"
          :style="collapsed ? 'padding: 10px 0; justify-content: center;' : ''"
          :title="collapsed ? item.label : undefined"
          @click="go(item)"
        >
          <!-- Active indicator bar -->
          <div v-if="active === item.id" class="ide-nav__indicator"></div>

          <span class="ide-nav__icon" v-html="item.svg"></span>
          <span v-if="!collapsed" class="ide-nav__label">{{ item.label }}</span>
          <span v-if="item.badge && !collapsed" class="ide-nav__badge" :class="item.badge === 'NEW' ? 'ide-nav__badge--new' : ''">
            {{ item.badge }}
          </span>
          <span v-if="item.badge && collapsed" class="ide-nav__dot" :class="item.badge === 'NEW' ? 'ide-nav__dot--new' : ''"></span>
        </button>
      </nav>

      <!-- Footer -->
      <div class="ide-sidebar__footer">
        <div v-if="!collapsed" class="ide-user">
          <div class="ide-avatar ide-avatar--small" style="background: #6366f133; color: #818cf8; position:relative;">
            {{ userInitials }}
            <span style="position:absolute; bottom:-1px; right:-1px; width:8px; height:8px; border-radius:50%; background:#22c55e; border:1.5px solid #0d1526;"></span>
          </div>
          <div class="ide-user-info">
            <div class="ide-user-name">{{ userName }}</div>
            <div style="font-size:9px; color:#475569; font-weight:600;">{{ userRolLabel }}</div>
            <div class="ide-user-online" style="font-size:9px;">● En línea</div>
          </div>
        </div>
        <div style="display:flex; gap:4px; align-items:center;">
          <button class="ide-collapse-btn" :style="collapsed ? 'justify-content: center; flex:1;' : 'flex:1;'" @click="collapsed = !collapsed">
            <svg v-if="collapsed" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
            <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
            <span v-if="!collapsed" class="ide-collapse-label">Colapsar</span>
          </button>
          <button class="ide-logout-btn" title="Cerrar sesión" @click="handleLogout">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
          </button>
        </div>
      </div>
    </div>

    <!-- ── MAIN ── -->
    <div class="ide-main">

      <!-- Top Bar -->
      <div class="ide-topbar">
        <div class="ide-topbar__left">
          <span class="ide-topbar__title">{{ moduleTitle }}</span>
          <div v-if="active === 'conversaciones'" class="ide-topbar__badges">
            <span class="ide-badge" style="background:#25D36622;color:#25D366;border:1px solid #25D36644;">WhatsApp</span>
            <span class="ide-badge" style="background:#E1306C22;color:#E1306C;border:1px solid #E1306C44;">Instagram</span>
            <span class="ide-badge" style="background:#1877F222;color:#1877F2;border:1px solid #1877F244;">Facebook</span>
            <span class="ide-badge" style="background:#69C9D022;color:#69C9D0;border:1px solid #69C9D044;">TikTok</span>
          </div>
        </div>
        <div class="ide-topbar__right">
          <div class="ide-topbar__time">
            <span style="color:#64748b;">{{ dateStr }}</span>
            <span style="margin-left:8px;color:#94a3b8;font-weight:700;">{{ timeStr }}</span>
          </div>
          <div class="ide-topbar__actions">
            <button class="ide-icon-btn" title="Notificaciones">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg>
              <span class="ide-icon-btn__dot"></span>
            </button>
            <button class="ide-icon-btn" title="Recargar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>
            </button>
          </div>
          <div class="ide-topbar__user">
            <div class="ide-avatar ide-avatar--small" style="background:#6366f133;color:#818cf8;">{{ userInitials }}</div>
            <div>
              <div class="ide-user-name">{{ userName }}</div>
              <div style="font-size:9px;color:#475569;">{{ userRolLabel }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Module content -->
      <div class="ide-module">
        <router-view />
      </div>
    </div>

  </div>
</template>

<script>
const SVGS = {
  grid:     `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`,
  bot:      `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/><line x1="12" y1="17" x2="12" y2="17" stroke-width="3" stroke-linecap="round"/><line x1="8" y1="17" x2="8" y2="17" stroke-width="3" stroke-linecap="round"/><line x1="16" y1="17" x2="16" y2="17" stroke-width="3" stroke-linecap="round"/></svg>`,
  tool:     `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>`,
  inbox:    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>`,
  analytics:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>`,
  settings: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>`,
  clients:  `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>`,
  account:  `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  social:   `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>`,
  pipeline: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><rect x="2" y="7" width="6" height="10" rx="1"/><rect x="9" y="4" width="6" height="16" rx="1"/><rect x="16" y="9" width="6" height="8" rx="1"/></svg>`,
  whatsapp: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>`,
  star:     `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  megaphone:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>`,
  catalog:  `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>`,
  ticket:   `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M15 5H9a2 2 0 00-2 2v2a2 2 0 002 2h6a2 2 0 002-2V7a2 2 0 00-2-2z"/><path d="M15 13H9a2 2 0 00-2 2v2a2 2 0 002 2h6a2 2 0 002-2v-2a2 2 0 00-2-2z"/></svg>`,
};

const ALL_NAV = [
  { id:'clientes',       label:'Clientes',      route:'clientes',       svg: SVGS.clients,   badge: null,  roles: ['SUPER_ADMIN'] },
  { id:'conversaciones', label:'Bandeja',       route:'conversaciones', svg: SVGS.inbox,     badge: null,  roles: null },
  { id:'redes-sociales', label:'Publicaciones', route:'redes-sociales', svg: SVGS.social,    badge: null,  roles: ['SUPER_ADMIN', 'ADMIN_CLIENTE'] },
  { id:'pipeline',       label:'Pipeline',      route:'pipeline',       svg: SVGS.pipeline,  badge: null,  roles: null },
  { id:'contactos',      label:'Contactos',     route:'contactos',      svg: SVGS.clients,   badge: null,  roles: null },
  { id:'calificacion',   label:'Calificar',     route:'calificacion',   svg: SVGS.star,      badge: null,  roles: null },
  { id:'remarketing',    label:'Remarketing',   route:'remarketing',    svg: SVGS.megaphone, badge: null,  roles: null },
  { id:'reportes',       label:'Reportes',      route:'reportes',       svg: SVGS.analytics, badge: null,  roles: null },
  { id:'catalogo',       label:'Catálogo',      route:'catalogo',       svg: SVGS.catalog,   badge: null,  roles: null },
  { id:'soporte',        label:'Soporte',       route:'soporte',        svg: SVGS.ticket,    badge: null,  roles: null },
  { id:'agentes',        label:'Agente IA',     route:'agentes',        svg: SVGS.bot,       badge: 'NEW', roles: null },
  { id:'configuracion',  label:'Configuración', route:'configuracion',  svg: SVGS.settings,  badge: null,  roles: ['SUPER_ADMIN', 'ADMIN_CLIENTE'] },
];

const TITLES = {
  home:             'Dashboard',
  pipeline:         'Pipeline de Ventas',
  clientes:         'Clientes',
  contactos:        'Contactos',
  agentes:          'Agente IA',
  herramientas:     'Herramientas',
  conversaciones:   'Bandeja de entrada',
  'redes-sociales': 'Publicaciones',
  calificacion:     'Calificar',
  remarketing:      'Remarketing',
  reportes:         'Reportes',
  configuracion:    'Configuración',
  'agente-detalle': 'Detalle del Agente',
  catalogo:         'Catálogo de Productos',
  'mi-cuenta':      'Mi Cuenta',
};

export default {
  name: 'AppLayout',
  data() {
    return {
      collapsed: false,
      time: new Date(),
    };
  },
  computed: {
    currentUser() {
      return this.$store.getters.currentUser || this.$storage.get('user') || {};
    },
    userRol() { return this.currentUser?.rol || 'USER'; },
    nav() {
      const rol = this.userRol;
      return ALL_NAV.filter(item => !item.roles || item.roles.includes(rol));
    },
    active() {
      const name = this.$route.name || '';
      const found = ALL_NAV.find(n => n.route === name);
      return found ? found.id : name;
    },
    moduleTitle() { return TITLES[this.active] || TITLES[this.$route.name] || 'IDE-IA'; },
    userName() { return this.currentUser?.nombres || this.currentUser?.usuario || 'Usuario'; },
    userInitials() {
      const n = this.currentUser?.nombres || this.currentUser?.usuario || 'U';
      return n.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();
    },
    userRolLabel() {
      const map = { SUPER_ADMIN: 'Super Admin', ADMIN_CLIENTE: 'Administrador', COLABORADOR: 'Colaborador' };
      return map[this.userRol] || this.userRol;
    },
    clienteNombre() {
      return this.$store.getters.clienteInfo?.nombre || null;
    },
    timeStr() {
      return this.time.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
    },
    dateStr() {
      return this.time.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' });
    },
  },
  mounted() {
    this._restoreAuth();
    this._timer = setInterval(() => { this.time = new Date(); }, 60000);
  },
  beforeDestroy() {
    clearInterval(this._timer);
  },
  methods: {
    _restoreAuth() {
      if (!this.$store.getters.isAuth) {
        const token = this.$storage.get('token');
        const user = this.$storage.get('user');
        if (token && user) {
          this.$store.commit('setAuth', true);
          this.$store.commit('setUser', user);
          this.$store.commit('setClienteId', user.clienteId ?? null);
        }
      }
    },
    go(item) {
      if (this.$route.name !== item.route) {
        this.$router.push({ name: item.route });
      }
    },
    handleLogout() {
      this.$confirm('¿Deseas cerrar sesión?', () => {
        this.$storage.removeAll();
        this.$store.commit('logout');
        this.$router.push('/login');
      });
    },
  },
};
</script>

<style scoped>
/* ── Root ── */
.ide-app {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: #0a0f1e;
}

/* ── Sidebar ── */
.ide-sidebar {
  width: 200px;
  flex-shrink: 0;
  background: #0d1526;
  border-right: 1px solid #1e3a5f44;
  display: flex;
  flex-direction: column;
  transition: width 0.25s cubic-bezier(.4,0,.2,1);
  overflow: hidden;
  z-index: 10;
}
.ide-sidebar--collapsed { width: 60px; }

/* Logo */
.ide-sidebar__header {
  padding: 18px 16px;
  border-bottom: 1px solid #1e3a5f44;
  display: flex;
  align-items: center;
  gap: 10px;
}
.ide-sidebar__header--collapsed {
  padding: 18px 0;
  justify-content: center;
}
.ide-logo {
  width: 32px; height: 32px;
  border-radius: 9px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.ide-logo-name {
  font-size: 14px; font-weight: 800; color: #f1f5f9; letter-spacing: -0.3px;
}
.ide-logo-sub {
  font-size: 9px; color: #475569; font-weight: 600;
  text-transform: uppercase; letter-spacing: 1px;
}

/* Client badge */
.ide-cliente-badge {
  display: flex; align-items: center; gap: 6px;
  padding: 5px 14px;
  font-size: 10px; font-weight: 700; color: #c96442;
  letter-spacing: 0.5px; text-transform: uppercase;
  white-space: nowrap; overflow: hidden;
}
.ide-cliente-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: #22c55e; flex-shrink: 0;
}
.ide-cliente-name { overflow: hidden; text-overflow: ellipsis; }

/* Logout */
.ide-logout-btn {
  background: none; border: none; cursor: pointer;
  color: #475569; padding: 5px; border-radius: 6px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; transition: color 0.15s;
}
.ide-logout-btn:hover { color: #ef4444; }

/* Nav */
.ide-nav {
  flex: 1;
  padding: 12px 8px;
  display: flex; flex-direction: column; gap: 2px;
  overflow-y: auto;
}
.ide-nav__item {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 12px;
  border-radius: 9px; border: none; cursor: pointer;
  background: transparent;
  color: #64748b;
  font-size: 13px; font-weight: 500;
  transition: all 0.15s;
  width: 100%; text-align: left;
  position: relative;
}
.ide-nav__item:hover { background: #1e293b44; color: #94a3b8; }
.ide-nav__item--active {
  background: #6366f122 !important;
  color: #818cf8 !important;
  font-weight: 700;
}
.ide-nav__indicator {
  position: absolute; left: 0; top: 20%; bottom: 20%;
  width: 3px; border-radius: 0 3px 3px 0;
  background: #6366f1;
}
.ide-nav__icon { flex-shrink: 0; display: flex; }
.ide-nav__label { flex: 1; white-space: nowrap; }
.ide-nav__badge {
  margin-left: auto;
  min-width: 18px; height: 18px; border-radius: 999px;
  background: #6366f1; color: #fff;
  font-size: 10px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  padding: 0 5px;
}
.ide-nav__badge--new { background: #c96442; }
.ide-nav__dot {
  position: absolute; top: 4px; right: 4px;
  width: 8px; height: 8px; border-radius: 50%;
  background: #ef4444;
}
.ide-nav__dot--new { background: #c96442; }

/* Footer */
.ide-sidebar__footer {
  border-top: 1px solid #1e3a5f44;
  padding: 12px 8px;
  display: flex; flex-direction: column; gap: 8px;
}
.ide-user {
  display: flex; align-items: center; gap: 8px;
  padding: 6px 8px; border-radius: 8px;
  background: #161d2f;
}
.ide-user-info { flex: 1; min-width: 0; }
.ide-user-name { font-size: 11px; font-weight: 700; color: #e2e8f0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ide-user-online { font-size: 9px; color: #22c55e; font-weight: 600; }
.ide-collapse-btn {
  display: flex; align-items: center; gap: 6px;
  background: none; border: none; cursor: pointer;
  padding: 4px 8px; color: #475569;
  width: 100%;
}
.ide-collapse-btn:hover { color: #94a3b8; }
.ide-collapse-label { font-size: 10px; font-weight: 600; margin-left: auto; }

/* Avatar */
.ide-avatar {
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; flex-shrink: 0;
}
.ide-avatar--small { width: 28px; height: 28px; font-size: 11px; }

/* ── Main ── */
.ide-main {
  flex: 1;
  display: flex; flex-direction: column;
  overflow: hidden;
}

/* Top Bar */
.ide-topbar {
  height: 52px;
  flex-shrink: 0;
  background: #0d1526;
  border-bottom: 1px solid #1e3a5f44;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 20px;
}
.ide-topbar__left {
  display: flex; align-items: center; gap: 10px;
}
.ide-topbar__title {
  font-size: 16px; font-weight: 800; color: #f1f5f9; letter-spacing: -0.3px;
}
.ide-topbar__badges { display: flex; gap: 6px; }
.ide-badge {
  display: inline-flex; align-items: center;
  padding: 1px 7px; border-radius: 999px;
  font-size: 10px; font-weight: 600;
  white-space: nowrap; flex-shrink: 0;
}
.ide-badge--new { background: #c9644222; color: #e8956d; border: 1px solid #c9644244; }

.ide-topbar__right {
  display: flex; align-items: center; gap: 14px;
}
.ide-topbar__time { font-size: 12px; font-weight: 500; }
.ide-topbar__actions { display: flex; gap: 8px; }
.ide-icon-btn {
  background: none; border: none; cursor: pointer;
  color: #64748b; padding: 4px; position: relative;
  border-radius: 6px; transition: color 0.15s;
  display: flex; align-items: center; justify-content: center;
}
.ide-icon-btn:hover { color: #94a3b8; }
.ide-icon-btn__dot {
  position: absolute; top: 2px; right: 2px;
  width: 7px; height: 7px; border-radius: 50%;
  background: #ef4444;
}
.ide-topbar__user {
  display: flex; align-items: center; gap: 8px;
  padding-left: 10px; border-left: 1px solid #1e3a5f44;
}

/* Module */
.ide-module {
  flex: 1;
  overflow: hidden;
}
</style>
