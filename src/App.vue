<template>
  <div id="ide-root">
    <router-view />
  </div>
</template>

<script>
export default { name: 'App' };
</script>

<style>
/* ── Tema (variables CSS) ──
   Oscuro es el default y conserva EXACTAMENTE los valores originales del sistema.
   Claro se activa poniendo data-theme="light" en <html> (ver AppLayout.vue). */
:root {
  --bg-page: var(--bg-page);
  --bg-surface: var(--bg-surface);
  --bg-panel: var(--bg-panel);
  --border: var(--border);
  --border-card: var(--border-card);
  --text-heading: var(--text-heading);
  --text-primary: var(--text-primary);
  --text-body: var(--text-body);
  --text-muted: var(--text-muted);
  --text-faint: var(--text-faint);
  --text-disabled: var(--text-disabled);
}
:root[data-theme="light"] {
  --bg-page: #f8fafc;
  --bg-surface: #ffffff;
  --bg-panel: var(--text-heading);
  --border: var(--text-primary);
  --border-card: var(--text-primary);
  --text-heading: var(--bg-page);
  --text-primary: var(--bg-surface);
  --text-body: var(--border);
  --text-muted: var(--text-disabled);
  --text-faint: var(--text-faint);
  --text-disabled: var(--text-muted);
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body, #app, #ide-root { height: 100%; width: 100%; overflow: hidden; }
body {
  font-family: 'Inter', sans-serif;
  background: var(--bg-page);
  color: var(--text-heading);
  -webkit-font-smoothing: antialiased;
}
::-webkit-scrollbar { width: 5px; height: 5px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: var(--text-disabled); }
input::placeholder, textarea::placeholder { color: var(--text-disabled); }
button, select, textarea { font-family: 'Inter', sans-serif; }

/* Vuetify reset */
.v-application { font-family: 'Inter', sans-serif !important; background: transparent !important; }
.v-application--wrap { min-height: unset !important; }
.v-btn { letter-spacing: 0 !important; text-transform: none !important; font-family: 'Inter', sans-serif !important; }
.v-dialog > .v-card { border-radius: 12px !important; }

/* ── Global Utility Classes ── */
.ide-ia-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-card);
  border-radius: 12px;
  padding: 16px;
}
.ide-ia-card--hover { cursor: pointer; transition: border-color 0.15s; }
.ide-ia-card--hover:hover { border-color: #6366f133; }

.section-title { font-size: 18px; font-weight: 800; color: var(--text-heading); margin-bottom: 4px; letter-spacing: -0.3px; }
.section-subtitle { font-size: 12px; color: var(--text-faint); margin-bottom: 16px; }
.stat-value { font-size: 28px; font-weight: 900; color: var(--text-heading); line-height: 1.1; }
.score-bar { height: 4px; background: var(--border-card); border-radius: 2px; overflow: hidden; }

/* ── Module Layout (CRM Chat sub-nav pattern) ── */
.ide-mod        { display: flex; height: 100%; overflow: hidden; }
.ide-page       { height: 100%; overflow-y: auto; padding: 20px 24px; }
.ide-subnav     { width: 200px; flex-shrink: 0; border-right: 1px solid var(--border-card); padding: 12px 8px; overflow-y: auto; }
.ide-body       { flex: 1; overflow-y: auto; padding: 24px 28px; }
.ide-body--bare { flex: 1; overflow: hidden; display: flex; flex-direction: column; }

.ide-sn-hd {
  display: flex; align-items: center; gap: 8px;
  padding: 6px 10px 14px;
  border-bottom: 1px solid var(--border-card);
  margin-bottom: 8px;
}
.ide-sn-ico {
  width: 28px; height: 28px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; flex-shrink: 0;
}
.ide-sn-title  { font-size: 12px; font-weight: 800; color: var(--text-primary); }
.ide-sn-sub    { font-size: 9px; font-weight: 700; }
.ide-sn-sep    { font-size: 11px; font-weight: 700; color: var(--text-disabled); text-transform: uppercase; letter-spacing: 1px; padding: 4px 10px 10px; }

.ide-sn-btn {
  display: flex; align-items: center; gap: 9px;
  width: 100%; padding: 9px 12px; margin-bottom: 2px;
  border-radius: 8px; border: none; cursor: pointer;
  background: transparent; color: var(--text-faint);
  font-size: 12px; font-weight: 500;
  transition: all 0.15s; text-align: left;
  font-family: 'Inter', sans-serif;
}
.ide-sn-btn:hover    { background: color-mix(in srgb, var(--bg-surface) 33%, transparent); color: var(--text-muted); }
.ide-sn-btn--o { background: #c9644222 !important; color: #e8956d !important; font-weight: 700; }
.ide-sn-btn--i { background: #6366f122 !important; color: #818cf8 !important; font-weight: 700; }

/* ── Global Form Elements ── */
.ide-field       { display: flex; flex-direction: column; gap: 6px; margin-bottom: 0; }
.ide-field label { font-size: 12px; font-weight: 700; color: var(--text-muted); }
.ide-input, .ide-select, .ide-textarea {
  background: var(--bg-page); border: 1px solid var(--border); border-radius: 8px;
  color: var(--text-heading); font-size: 13px; padding: 8px 12px;
  outline: none; font-family: inherit; width: 100%;
  transition: border-color 0.15s;
}
.ide-input:focus, .ide-select:focus, .ide-textarea:focus { border-color: #6366f1; }
.ide-textarea { resize: vertical; }
.ide-select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat; background-position: right 10px center; padding-right: 28px;
}

/* ── Toggle Switch ── */
.ide-toggle     { width: 36px; height: 20px; border-radius: 10px; background: var(--border); cursor: pointer; position: relative; transition: background 0.2s; flex-shrink: 0; }
.ide-toggle--on { background: #6366f1; }
.ide-toggle div { position: absolute; top: 2px; left: 2px; width: 16px; height: 16px; border-radius: 50%; background: #fff; transition: left 0.2s; }
.ide-toggle--on div { left: 18px; }

/* ── Section header inside modules ── */
.ide-sec-hd     { margin-bottom: 20px; }
.ide-sec-hd h2  { font-size: 15px; font-weight: 800; color: var(--text-heading); letter-spacing: -0.3px; margin-bottom: 4px; }
.ide-sec-hd p   { font-size: 12px; color: var(--text-faint); }
</style>
