<template>
  <div class="rep-layout">

    <!-- ── SUB-NAV ── -->
    <div class="rep-subnav">
      <div class="rep-sn-sep">REPORTES</div>

      <button
        v-for="s in secciones"
        :key="s.id"
        class="rep-sn-btn"
        :class="{ 'rep-sn-btn--active': seccion === s.id }"
        @click="seccion = s.id"
      >
        <span v-html="s.svg" style="flex-shrink:0;display:flex;"></span>
        {{ s.label }}
      </button>

      <div class="rep-sn-footer">
        <button class="rep-pdf-btn" @click="exportarPDF">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Exportar PDF
        </button>
      </div>
    </div>

    <!-- ── CONTENT ── -->
    <div class="rep-content">

      <!-- Filter bar -->
      <div class="rep-filters">
        <div class="rep-filters__left">
          <span class="rep-period-lbl">Período:</span>
          <button
            v-for="p in periodos"
            :key="p"
            class="rep-period-btn"
            :class="{ 'rep-period-btn--active': periodo === p }"
            @click="periodo = p"
          >{{ p }}</button>
        </div>
        <div class="rep-filters__right">
          <div class="rep-select-wrap">
            <select v-model="filtroCanal" class="rep-select">
              <option value="">Todos los canales</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="instagram">Instagram</option>
              <option value="facebook">Facebook</option>
              <option value="tiktok">TikTok</option>
            </select>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" class="rep-sel-arrow"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
          <button class="rep-export-btn" @click="exportarCSV">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Exportar
          </button>
        </div>
      </div>

      <!-- Scrollable body -->
      <div class="rep-scroll">

        <!-- ─── RESUMEN GENERAL ─── -->
        <template v-if="seccion === 'resumen'">
          <div class="rep-sec-hd">
            <h2 class="rep-sec-title">Resumen General</h2>
            <p class="rep-sec-sub">Vista consolidada de todos los canales y métricas clave</p>
          </div>

          <div class="rep-kpi-grid">
            <div v-for="k in kpisGlobales" :key="k.label" class="rep-kpi-card">
              <div class="rep-kpi-top">
                <span class="rep-kpi-lbl">{{ k.label }}</span>
                <rep-sparkline :data="k.spark" :color="k.color" />
              </div>
              <div class="rep-kpi-val">{{ k.value }}</div>
              <div class="rep-kpi-bot">
                <span class="rep-trend" :class="k.trend >= 0 ? 'rep-trend--up' : 'rep-trend--dn'">
                  {{ k.trend >= 0 ? '↑' : '↓' }} {{ Math.abs(k.trend) }}%
                </span>
                <span class="rep-kpi-sub">{{ k.sub }}</span>
              </div>
            </div>
          </div>

          <div class="rep-charts-row">
            <div class="rep-card rep-vol-card">
              <div class="rep-card-head">
                <span class="rep-card-title">Volumen de conversaciones</span>
                <div class="rep-legend">
                  <span class="rep-leg-dot" style="background:#818cf8;"></span><span class="rep-leg-lbl">Entrantes</span>
                  <span class="rep-leg-dot" style="background:#22c55e;"></span><span class="rep-leg-lbl">Resueltas</span>
                </div>
              </div>
              <rep-bar-chart :data="volumenSemanal" />
            </div>
            <div class="rep-card rep-donut-card">
              <div class="rep-card-title" style="margin-bottom:16px;">Por canal</div>
              <rep-donut :data="canalDonut" />
            </div>
          </div>

          <div class="rep-card" style="margin-bottom:20px;">
            <div class="rep-card-title" style="margin-bottom:16px;">Mapa de calor — actividad por hora y día</div>
            <rep-heatmap :data="heatmapRows" />
          </div>
        </template>

        <!-- ─── CONVERSACIONES ─── -->
        <template v-else-if="seccion === 'conversaciones'">
          <div class="rep-sec-hd">
            <h2 class="rep-sec-title">Conversaciones</h2>
            <p class="rep-sec-sub">Análisis detallado de todos los chats gestionados</p>
          </div>
          <div class="rep-kpi-grid">
            <div v-for="k in statsConv" :key="k.label" class="rep-kpi-card">
              <div class="rep-kpi-top">
                <span class="rep-kpi-lbl">{{ k.label }}</span>
                <rep-sparkline :data="k.spark" :color="k.color" />
              </div>
              <div class="rep-kpi-val" :style="{ color: k.color }">{{ k.value }}</div>
              <div class="rep-kpi-bot">
                <span class="rep-trend" :class="k.trend >= 0 ? 'rep-trend--up' : 'rep-trend--dn'">{{ k.trend >= 0 ? '↑' : '↓' }} {{ Math.abs(k.trend) }}%</span>
                <span class="rep-kpi-sub">{{ k.sub }}</span>
              </div>
            </div>
          </div>
          <div class="rep-charts-row">
            <div class="rep-card" style="flex:1;">
              <div class="rep-card-title" style="margin-bottom:14px;">Distribución por canal</div>
              <div style="display:flex;flex-direction:column;gap:10px;">
                <div v-for="c in canalStats" :key="c.label" style="display:flex;align-items:center;gap:12px;">
                  <span style="font-size:12px;color:#cbd5e1;width:90px;flex-shrink:0;">{{ c.label }}</span>
                  <div style="flex:1;height:8px;border-radius:4px;background:#1e293b;overflow:hidden;">
                    <div :style="{ width:c.pct+'%', height:'100%', background:c.color, borderRadius:'4px' }"></div>
                  </div>
                  <span style="font-size:11px;font-weight:700;min-width:32px;text-align:right;" :style="{ color:c.color }">{{ c.pct }}%</span>
                </div>
              </div>
            </div>
            <div class="rep-card" style="flex:1;">
              <div class="rep-card-title" style="margin-bottom:14px;">Estado de conversaciones</div>
              <div style="display:flex;flex-direction:column;gap:8px;">
                <div v-for="(stage, i) in funnelConv" :key="stage.label">
                  <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
                    <div style="display:flex;align-items:center;gap:6px;">
                      <div :style="{ width:'8px',height:'8px',borderRadius:'50%',background:stage.color }"></div>
                      <span style="font-size:12px;color:#cbd5e1;font-weight:600;">{{ stage.label }}</span>
                    </div>
                    <div style="display:flex;gap:12px;font-size:11px;">
                      <span style="color:#f1f5f9;font-weight:700;">{{ stage.value }}</span>
                      <span v-if="i > 0" :style="{ color: stage.conv >= 60 ? '#22c55e' : stage.conv >= 30 ? '#f59e0b' : '#ef4444' }">{{ stage.conv }}%</span>
                    </div>
                  </div>
                  <div style="height:16px;border-radius:4px;background:#1e293b;overflow:hidden;">
                    <div :style="{ width: funnelConv[0].value > 0 ? Math.round((stage.value/funnelConv[0].value)*100)+'%' : '0%', height:'100%', background:stage.color, opacity:0.8 }"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- ─── LEADS & PROSPECTOS ─── -->
        <template v-else-if="seccion === 'leads'">
          <div class="rep-sec-hd">
            <h2 class="rep-sec-title">Leads &amp; Prospectos</h2>
            <p class="rep-sec-sub">Clasificación automática por nivel de interés detectado por IA</p>
          </div>
          <div class="rep-lead-grid">
            <div v-for="tier in leadTiers" :key="tier.label" class="rep-card" :style="{ border:'1px solid '+tier.color+'44', textAlign:'center', padding:'24px 20px' }">
              <div style="font-size:28px;margin-bottom:10px;">{{ tier.emoji }}</div>
              <div style="font-size:32px;font-weight:900;margin-bottom:4px;" :style="{ color:tier.color }">{{ tier.value }}</div>
              <div style="font-size:12px;font-weight:700;color:#e2e8f0;margin-bottom:4px;">{{ tier.label }}</div>
              <div style="font-size:11px;color:#64748b;">Score {{ tier.range }}</div>
            </div>
          </div>
          <div class="rep-card" style="margin-top:16px;">
            <div class="rep-card-title" style="margin-bottom:14px;">Embudo de captación</div>
            <div style="display:flex;flex-direction:column;gap:8px;">
              <div v-for="(stage, i) in funnelLeads" :key="stage.label">
                <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
                  <div style="display:flex;align-items:center;gap:6px;">
                    <div :style="{ width:'8px',height:'8px',borderRadius:'50%',background:stage.color }"></div>
                    <span style="font-size:12px;color:#cbd5e1;font-weight:600;">{{ stage.label }}</span>
                  </div>
                  <div style="display:flex;gap:12px;font-size:11px;">
                    <span style="color:#f1f5f9;font-weight:700;">{{ stage.value }}</span>
                    <span v-if="i > 0" :style="{ color: stage.conv >= 60 ? '#22c55e' : stage.conv >= 30 ? '#f59e0b' : '#ef4444' }">conv. {{ stage.conv }}%</span>
                  </div>
                </div>
                <div style="height:20px;border-radius:4px;background:#1e293b;overflow:hidden;">
                  <div :style="{ width: funnelLeads[0].value > 0 ? Math.round((stage.value/funnelLeads[0].value)*100)+'%' : '0%', height:'100%', background:stage.color, opacity:0.8 }"></div>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- ─── VENTAS & CTA ─── -->
        <template v-else-if="seccion === 'ventas'">
          <div class="rep-sec-hd">
            <h2 class="rep-sec-title">Ventas &amp; CTA</h2>
            <p class="rep-sec-sub">Seguimiento de conversiones y llamadas a la acción</p>
          </div>
          <div class="rep-kpi-grid">
            <div v-for="k in statsVentas" :key="k.label" class="rep-kpi-card">
              <div class="rep-kpi-top">
                <span class="rep-kpi-lbl">{{ k.label }}</span>
                <rep-sparkline :data="k.spark" :color="k.color" />
              </div>
              <div class="rep-kpi-val" :style="{ color: k.color }">{{ k.value }}</div>
              <div class="rep-kpi-bot">
                <span class="rep-trend" :class="k.trend >= 0 ? 'rep-trend--up' : 'rep-trend--dn'">{{ k.trend >= 0 ? '↑' : '↓' }} {{ Math.abs(k.trend) }}%</span>
                <span class="rep-kpi-sub">{{ k.sub }}</span>
              </div>
            </div>
          </div>
          <div class="rep-card" style="margin-bottom:20px;">
            <div class="rep-card-title" style="margin-bottom:16px;">Pipeline de conversión</div>
            <div style="display:flex;align-items:flex-end;gap:12px;height:140px;padding:0 8px;">
              <div v-for="etapa in pipelineVentas" :key="etapa.label" style="flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;">
                <div style="font-size:11px;font-weight:700;" :style="{ color:etapa.color }">{{ etapa.value }}</div>
                <div :style="{ width:'100%', height:etapa.h+'px', background:etapa.color, borderRadius:'4px 4px 0 0', opacity:0.8 }"></div>
                <span style="font-size:9px;color:#64748b;text-align:center;line-height:1.2;">{{ etapa.label }}</span>
              </div>
            </div>
          </div>
        </template>

        <!-- ─── AGENTES ─── -->
        <template v-else-if="seccion === 'agentes'">
          <div class="rep-sec-hd">
            <h2 class="rep-sec-title">Rendimiento por Agente</h2>
            <p class="rep-sec-sub">Métricas individuales de productividad de cada agente IA</p>
          </div>
          <div v-if="loading" style="display:flex;justify-content:center;padding:32px;">
            <v-progress-circular indeterminate color="primary" size="28" />
          </div>
          <template v-else>
            <div class="rep-kpi-grid">
              <div v-for="s in statsAgentes" :key="s.label" class="rep-kpi-card">
                <div class="rep-kpi-top">
                  <span class="rep-kpi-lbl">{{ s.label }}</span>
                  <rep-sparkline :data="s.spark" :color="s.color" />
                </div>
                <div class="rep-kpi-val" :style="{ color: s.color }">{{ s.value }}</div>
              </div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:20px;">
              <div v-for="ag in agentes" :key="ag.id" class="rep-card">
                <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">
                  <div class="rep-ag-av" :style="{ background:ag.color+'22', color:ag.color }">{{ ag.avatar }}</div>
                  <div style="flex:1;">
                    <div style="font-size:14px;font-weight:800;color:#f1f5f9;">{{ ag.nombre }}</div>
                    <div :style="{ fontSize:'10px', fontWeight:600, color: ag.activo ? '#22c55e' : '#ef4444' }">{{ ag.activo ? '● Activo' : '● Inactivo' }}</div>
                  </div>
                  <div style="text-align:right;">
                    <div style="font-size:10px;color:#64748b;">{{ ag.modelo }}</div>
                    <div style="font-size:10px;color:#475569;">{{ ag.modoOperacion || 'hybrid' }}</div>
                  </div>
                </div>
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;">
                  <div class="rep-ag-metric"><div style="font-size:14px;font-weight:800;color:#818cf8;">{{ ag.totalConversaciones || 0 }}</div><div style="font-size:9px;color:#64748b;">Conv.</div></div>
                  <div class="rep-ag-metric"><div style="font-size:14px;font-weight:800;color:#22c55e;">{{ ag.totalMensajes || 0 }}</div><div style="font-size:9px;color:#64748b;">Msg</div></div>
                  <div class="rep-ag-metric"><div style="font-size:11px;font-weight:700;color:#f59e0b;text-transform:capitalize;">{{ ag.tono || '—' }}</div><div style="font-size:9px;color:#64748b;">Tono</div></div>
                </div>
              </div>
            </div>
            <div class="rep-card">
              <div class="rep-card-title" style="margin-bottom:14px;">Tabla comparativa</div>
              <table style="width:100%;border-collapse:collapse;">
                <thead>
                  <tr style="background:#161d2f;">
                    <th v-for="h in ['Agente','Conversaciones','Mensajes','Modelo','Estado']" :key="h" style="padding:8px 12px;text-align:left;font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid #334155;">{{ h }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="ag in agentes" :key="ag.id" style="border-bottom:1px solid #1e3a5f22;">
                    <td style="padding:10px 12px;">
                      <div style="display:flex;align-items:center;gap:8px;">
                        <div class="rep-ag-av" :style="{ background:ag.color+'22', color:ag.color }">{{ ag.avatar }}</div>
                        <span style="font-size:12px;font-weight:700;color:#e2e8f0;">{{ ag.nombre }}</span>
                      </div>
                    </td>
                    <td style="padding:10px 12px;font-size:13px;font-weight:700;color:#f1f5f9;">{{ ag.totalConversaciones || 0 }}</td>
                    <td style="padding:10px 12px;font-size:12px;color:#94a3b8;">{{ ag.totalMensajes || 0 }}</td>
                    <td style="padding:10px 12px;font-size:11px;color:#64748b;">{{ ag.modelo }}</td>
                    <td style="padding:10px 12px;">
                      <span :style="{ fontSize:'11px', fontWeight:700, color: ag.activo ? '#22c55e' : '#ef4444' }">{{ ag.activo ? '● Activo' : '● Inactivo' }}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </template>
        </template>

        <!-- ─── PUBLICACIONES ─── -->
        <template v-else-if="seccion === 'publicaciones'">
          <div class="rep-sec-hd">
            <h2 class="rep-sec-title">Publicaciones</h2>
            <p class="rep-sec-sub">Rendimiento de contenido publicado en redes sociales</p>
          </div>
          <div class="rep-kpi-grid">
            <div v-for="k in statsPubs" :key="k.label" class="rep-kpi-card">
              <div class="rep-kpi-top">
                <span class="rep-kpi-lbl">{{ k.label }}</span>
                <rep-sparkline :data="k.spark" :color="k.color" />
              </div>
              <div class="rep-kpi-val" :style="{ color: k.color }">{{ k.value }}</div>
              <div class="rep-kpi-bot">
                <span class="rep-trend" :class="k.trend >= 0 ? 'rep-trend--up' : 'rep-trend--dn'">{{ k.trend >= 0 ? '↑' : '↓' }} {{ Math.abs(k.trend) }}%</span>
                <span class="rep-kpi-sub">{{ k.sub }}</span>
              </div>
            </div>
          </div>
          <div class="rep-charts-row">
            <div class="rep-card rep-vol-card">
              <div class="rep-card-head">
                <span class="rep-card-title">Alcance semanal por red social</span>
              </div>
              <div style="display:flex;flex-direction:column;gap:10px;margin-top:12px;">
                <div v-for="c in canalStats" :key="c.label" style="display:flex;align-items:center;gap:12px;">
                  <span style="font-size:12px;color:#cbd5e1;width:90px;flex-shrink:0;">{{ c.label }}</span>
                  <div style="flex:1;height:10px;border-radius:4px;background:#1e293b;overflow:hidden;">
                    <div :style="{ width:c.pct+'%', height:'100%', background:c.color, borderRadius:'4px' }"></div>
                  </div>
                  <span style="font-size:11px;font-weight:700;min-width:32px;text-align:right;" :style="{ color:c.color }">{{ c.pct }}%</span>
                </div>
              </div>
            </div>
            <div class="rep-card rep-donut-card">
              <div class="rep-card-title" style="margin-bottom:16px;">Por plataforma</div>
              <rep-donut :data="canalDonut" />
            </div>
          </div>
        </template>

      </div>
    </div>
  </div>
</template>

<script>
const SVGS = {
  grid:    `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`,
  inbox:   `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>`,
  qualify: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  bar:     `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>`,
  bot:     `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>`,
  image:   `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`,
};

/* ── Sparkline ── */
const RepSparkline = {
  name: 'RepSparkline',
  props: { data: Array, color: { type: String, default: '#6366f1' } },
  computed: {
    pts() {
      const d = this.data; const w = 80; const h = 36;
      const max = Math.max(...d); const min = Math.min(...d); const range = max - min || 1;
      return d.map((v, i) => `${(i / (d.length - 1)) * w},${h - ((v - min) / range) * (h - 4) - 2}`).join(' ');
    },
    lastPt() {
      const parts = this.pts.split(' ');
      return (parts[parts.length - 1] || '80,18').split(',');
    },
  },
  template: `<svg width="80" height="36" viewBox="0 0 80 36" style="overflow:visible;flex-shrink:0;">
    <polyline :points="pts" fill="none" :stroke="color" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
    <circle :cx="lastPt[0]" :cy="lastPt[1]" r="2.5" :fill="color"/>
  </svg>`,
};

/* ── Bar Chart ── */
const RepBarChart = {
  name: 'RepBarChart',
  props: { data: { type: Array, default: () => [] } },
  computed: {
    maxVal() {
      return Math.max(...this.data.map(d => Math.max(d.entrantes || 0, d.resueltas || 0)), 1);
    },
  },
  template: `<div style="display:flex;align-items:flex-end;gap:4px;height:120px;padding-top:8px;">
    <div v-for="d in data" :key="d.label" style="flex:1;display:flex;flex-direction:column;align-items:center;">
      <div style="width:100%;display:flex;gap:2px;align-items:flex-end;height:96px;">
        <div :style="{ flex:1, height:Math.round((d.entrantes/maxVal)*96)+'px', background:'#818cf8', borderRadius:'3px 3px 0 0', opacity:0.85 }"></div>
        <div :style="{ flex:1, height:Math.round((d.resueltas/maxVal)*96)+'px', background:'#22c55e', borderRadius:'3px 3px 0 0', opacity:0.85 }"></div>
      </div>
      <div style="font-size:9px;color:#64748b;margin-top:6px;">{{ d.label }}</div>
    </div>
  </div>`,
};

/* ── Donut Chart ── */
const RepDonut = {
  name: 'RepDonut',
  props: { data: { type: Array, default: () => [] } },
  computed: {
    total() { return this.data.reduce((s, d) => s + (d.value || 0), 0); },
    circ() { return 2 * Math.PI * 40; },
    segments() {
      const circ = this.circ;
      const total = this.total || 1;
      let cum = 0;
      return this.data.map(d => {
        const dash = (d.value / total) * circ;
        const seg = { label: d.label, value: d.value, color: d.color, dashArray: `${dash} ${circ - dash}`, dashOffset: -cum };
        cum += dash;
        return seg;
      });
    },
  },
  template: `<div style="display:flex;align-items:center;gap:20px;">
    <svg width="120" height="120" viewBox="0 0 120 120" style="flex-shrink:0;">
      <circle cx="60" cy="60" r="40" fill="none" stroke="#1e293b" stroke-width="18"/>
      <circle v-for="seg in segments" :key="seg.label"
        cx="60" cy="60" r="40" fill="none"
        :stroke="seg.color" stroke-width="18"
        :stroke-dasharray="seg.dashArray"
        :stroke-dashoffset="seg.dashOffset"
        transform="rotate(-90 60 60)"
      />
      <text x="60" y="55" text-anchor="middle" font-size="17" font-weight="900" fill="#f1f5f9">{{ total }}</text>
      <text x="60" y="70" text-anchor="middle" font-size="8" fill="#64748b">total</text>
    </svg>
    <div style="display:flex;flex-direction:column;gap:10px;">
      <div v-for="d in data" :key="d.label" style="display:flex;align-items:center;gap:8px;">
        <div :style="{ width:'8px',height:'8px',borderRadius:'50%',background:d.color,flexShrink:0 }"></div>
        <span style="font-size:11px;color:#94a3b8;flex:1;">{{ d.label }}</span>
        <span style="font-size:12px;font-weight:700;color:#f1f5f9;">{{ d.value }}</span>
      </div>
    </div>
  </div>`,
};

/* ── Heatmap ── */
const RepHeatmap = {
  name: 'RepHeatmap',
  props: { data: { type: Array, default: () => [] } },
  data() {
    return {
      hours: ['00h','02h','04h','06h','08h','10h','12h','14h','16h','18h','20h','22h'],
      days:  ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'],
    };
  },
  methods: {
    cellBg(val) {
      if (!val || val < 0.05) return '#1e293b';
      if (val < 0.25) return '#6366f118';
      if (val < 0.45) return '#6366f133';
      if (val < 0.65) return '#6366f155';
      if (val < 0.85) return '#818cf877';
      return '#818cf8aa';
    },
  },
  template: `<div>
    <div style="display:flex;gap:3px;margin-bottom:3px;padding-left:34px;">
      <div v-for="d in days" :key="d" style="flex:1;text-align:center;font-size:9px;color:#475569;font-weight:600;">{{ d }}</div>
    </div>
    <div v-for="(row, hi) in data" :key="hi" style="display:flex;gap:3px;margin-bottom:3px;">
      <div style="width:30px;flex-shrink:0;font-size:9px;color:#475569;text-align:right;padding-right:4px;line-height:14px;">{{ hours[hi] }}</div>
      <div v-for="(val, di) in row" :key="di" :style="{ flex:1, height:'14px', borderRadius:'2px', background:cellBg(val) }"></div>
    </div>
  </div>`,
};

/* ── generate heatmap data ── */
function makeHeatmap() {
  return Array.from({ length: 12 }, (_, hi) =>
    Array.from({ length: 7 }, (_, di) => {
      const hour = hi * 2;
      const isBiz = hour >= 8 && hour <= 18;
      const isWeekday = di < 5;
      const base = isBiz ? (isWeekday ? 0.65 : 0.35) : (isWeekday ? 0.15 : 0.08);
      return Math.min(1, Math.max(0, base + (Math.random() * 0.3 - 0.15)));
    })
  );
}

export default {
  name: 'Reportes',
  components: { RepSparkline, RepBarChart, RepDonut, RepHeatmap },
  data: () => ({
    seccion: 'resumen',
    periodo: 'Semana',
    filtroCanal: '',
    agentes: [],
    stats: null,
    loading: true,
    periodos: ['Hoy', 'Semana', 'Mes', 'Trimestre', 'Año'],
    secciones: [
      { id: 'resumen',        label: 'Resumen General',    svg: SVGS.grid    },
      { id: 'conversaciones', label: 'Conversaciones',     svg: SVGS.inbox   },
      { id: 'leads',          label: 'Leads & Prospectos', svg: SVGS.qualify },
      { id: 'ventas',         label: 'Ventas & CTA',       svg: SVGS.bar     },
      { id: 'agentes',        label: 'Agentes',            svg: SVGS.bot     },
      { id: 'publicaciones',  label: 'Publicaciones',      svg: SVGS.image   },
    ],
    volumenSemanal: [
      { label: 'Lun', entrantes: 45, resueltas: 32 },
      { label: 'Mar', entrantes: 62, resueltas: 48 },
      { label: 'Mié', entrantes: 55, resueltas: 40 },
      { label: 'Jue', entrantes: 78, resueltas: 65 },
      { label: 'Vie', entrantes: 70, resueltas: 58 },
      { label: 'Sáb', entrantes: 38, resueltas: 28 },
      { label: 'Dom', entrantes: 25, resueltas: 18 },
    ],
    heatmapRows: makeHeatmap(),
    funnelConv: [
      { label: 'Recibidas',   value: 0, color: '#6366f1', conv: 100 },
      { label: 'Respondidas', value: 0, color: '#3b82f6', conv: 93  },
      { label: 'En proceso',  value: 0, color: '#f59e0b', conv: 24  },
      { label: 'Resueltas',   value: 0, color: '#22c55e', conv: 92  },
    ],
    funnelLeads: [
      { label: 'Contactos totales',   value: 0, color: '#6366f1', conv: 100 },
      { label: 'Leads identificados', value: 0, color: '#8b5cf6', conv: 15  },
      { label: 'Leads calificados',   value: 0, color: '#f59e0b', conv: 67  },
      { label: 'Hot leads',           value: 0, color: '#ef4444', conv: 31  },
      { label: 'Convertidos',         value: 0, color: '#22c55e', conv: 37  },
    ],
    pipelineVentas: [
      { label: 'Nuevo Lead',  value: 186, color: '#818cf8', h: 110 },
      { label: 'Contactado',  value: 124, color: '#60a5fa', h: 80  },
      { label: 'Calificado',  value: 89,  color: '#60a5fa', h: 64  },
      { label: 'Propuesta',   value: 67,  color: '#f59e0b', h: 50  },
      { label: 'Negociación', value: 54,  color: '#f97316', h: 40  },
      { label: 'Ganado',      value: 47,  color: '#22c55e', h: 30  },
      { label: 'Perdido',     value: 18,  color: '#ef4444', h: 14  },
    ],
  }),
  computed: {
    totalConv() { return this.agentes.reduce((s, a) => s + (a.totalConversaciones || 0), 0); },
    totalMsg()  { return this.agentes.reduce((s, a) => s + (a.totalMensajes || 0), 0); },
    activeCount() { return this.agentes.filter(a => a.activo).length; },

    kpisGlobales() {
      const n = this.agentes.length;
      return [
        { label: 'Mensajes recibidos', value: this.fmtNum(this.stats?.totalMensajes || 1284), trend: 12, sub: 'vs semana ant.',   color: '#818cf8', spark: [42,65,51,78,84,68,90] },
        { label: 'Nuevos leads',       value: this.stats ? (this.stats.hotLeads || 0) + (this.stats.warmLeads || 0) : 186,         trend: 8,  sub: 'calificados',     color: '#f59e0b', spark: [30,45,55,62,58,72,80] },
        { label: 'Conversiones',       value: this.totalConv > 0 ? Math.round(this.totalConv * 0.25) : 47,                        trend: 15, sub: 'ventas cerradas', color: '#22c55e', spark: [10,15,12,22,25,30,35] },
        { label: 'CSAT promedio',      value: '91%',                                                                               trend: 3,  sub: 'satisfacción',    color: '#60a5fa', spark: [78,82,80,85,88,90,91] },
        { label: 'Tiempo respuesta',   value: '4m 32s',                                                                           trend: -18, sub: 'reducción',       color: '#f97316', spark: [8,7,6.5,6,5.5,5,4.5] },
        { label: 'Tasa resolución',    value: '87%',                                                                               trend: 5,  sub: 'primer contacto', color: '#a78bfa', spark: [72,75,78,80,82,85,87] },
        { label: 'Ingresos estimados', value: '$142K',                                                                             trend: 22, sub: 'este mes',        color: '#34d399', spark: [80,95,110,120,130,138,142] },
        { label: 'Agentes activos',    value: `${this.activeCount}/${n || 4}`,                                                     trend: 0,  sub: '100% disponibles', color: '#818cf8', spark: [3,3,4,4,4,4,this.activeCount || 4] },
      ];
    },
    statsConv() {
      const conv = this.totalConv;
      return [
        { label: 'Total conversaciones', value: conv || 284,                                                 trend: 12, sub: 'este período',  color: '#6366f1', spark: [20,35,28,45,38,60,55] },
        { label: 'Abiertas',             value: this.stats?.abiertas  || 48,                                trend: -3, sub: 'en espera',     color: '#f59e0b', spark: [60,55,50,48,52,46,48] },
        { label: 'Resueltas',            value: this.stats?.resueltas || 219,                               trend: 14, sub: 'cerradas OK',   color: '#22c55e', spark: [150,165,180,195,205,215,219] },
        { label: 'Promedio / agente',    value: this.agentes.length ? Math.round(conv / this.agentes.length) : 71, trend: 8, sub: 'productividad', color: '#818cf8', spark: [45,52,60,58,65,68,71] },
      ];
    },
    leadTiers() {
      return [
        { label: 'Hot Leads',  range: '70–100', value: this.stats?.hotLeads  || 42, color: '#ef4444', emoji: '🔥' },
        { label: 'Warm Leads', range: '40–69',  value: this.stats?.warmLeads || 98, color: '#f59e0b', emoji: '🌡' },
        { label: 'Cold Leads', range: '0–39',   value: this.stats?.coldLeads || 46, color: '#60a5fa', emoji: '❄️' },
      ];
    },
    statsVentas() {
      return [
        { label: 'Ingresos estimados', value: '$142K', trend: 22, sub: 'este mes',       color: '#34d399', spark: [80,95,110,120,130,138,142] },
        { label: 'Conversiones',       value: 47,       trend: 15, sub: 'ventas cerradas', color: '#22c55e', spark: [10,15,12,22,25,30,35] },
        { label: 'Ticket promedio',    value: '$3.0K',  trend: 6,  sub: 'por venta',       color: '#818cf8', spark: [2.5,2.7,2.8,2.9,2.9,3.0,3.0] },
        { label: 'Tasa conversión',    value: '25%',    trend: 3,  sub: 'leads → ventas',  color: '#f59e0b', spark: [18,20,21,22,23,24,25] },
      ];
    },
    statsAgentes() {
      return [
        { label: 'Agentes activos',  value: this.activeCount || 4,   color: '#22c55e', spark: [3,3,4,4,4,4,4] },
        { label: 'Conv. totales',    value: this.totalConv  || 284,  color: '#6366f1', spark: [20,35,28,45,38,60,55] },
        { label: 'Mensajes totales', value: this.totalMsg   || 1284, color: '#f59e0b', spark: [80,120,100,180,150,200,180] },
        { label: 'Modelos activos',  value: [...new Set(this.agentes.map(a => a.modelo))].length || 2, color: '#8b5cf6', spark: [1,1,2,2,2,2,2] },
      ];
    },
    statsPubs() {
      return [
        { label: 'Total publicaciones',      value: 84,     trend: 12, sub: 'esta semana',       color: '#E1306C', spark: [10,12,11,14,13,15,14] },
        { label: 'Conversaciones generadas', value: 318,    trend: 24, sub: 'desde publicaciones', color: '#818cf8', spark: [30,40,45,55,62,70,80] },
        { label: 'Mayor engagement',         value: '4.8K', trend: 18, sub: 'likes + comentarios', color: '#f59e0b', spark: [2,3,3.5,4,4.2,4.6,4.8] },
        { label: 'Conversiones hoy',         value: 12,     trend: 9,  sub: 'leads directos',     color: '#22c55e', spark: [5,7,8,9,10,11,12] },
      ];
    },
    canalDonut() {
      const CANAL_META = {
        whatsapp:  { label: 'WhatsApp',  color: '#25D366' },
        instagram: { label: 'Instagram', color: '#E1306C' },
        facebook:  { label: 'Facebook',  color: '#1877F2' },
        tiktok:    { label: 'TikTok',    color: '#EE1D52' },
        chat:      { label: 'Chat',      color: '#818cf8' },
      };
      const porCanal = this.stats?.porCanal;
      if (porCanal && Object.keys(porCanal).length > 0) {
        return Object.entries(porCanal)
          .sort((a, b) => b[1] - a[1])
          .map(([canal, count]) => {
            const meta = CANAL_META[canal] || { label: canal, color: '#64748b' };
            return { label: meta.label, value: count, color: meta.color };
          });
      }
      return [
        { label: 'WhatsApp',  value: 612, color: '#25D366' },
        { label: 'Instagram', value: 318, color: '#E1306C' },
        { label: 'Facebook',  value: 224, color: '#1877F2' },
        { label: 'TikTok',    value: 130, color: '#EE1D52' },
      ];
    },
    canalStats() {
      const CANAL_META = {
        whatsapp:  { label: 'WhatsApp',  color: '#25D366' },
        instagram: { label: 'Instagram', color: '#E1306C' },
        facebook:  { label: 'Facebook',  color: '#1877F2' },
        tiktok:    { label: 'TikTok',    color: '#EE1D52' },
        chat:      { label: 'Chat',      color: '#818cf8' },
      };
      const porCanal = this.stats?.porCanal;
      if (porCanal && Object.keys(porCanal).length > 0) {
        const total = Object.values(porCanal).reduce((s, v) => s + v, 0) || 1;
        return Object.entries(porCanal)
          .sort((a, b) => b[1] - a[1])
          .map(([canal, count]) => {
            const meta = CANAL_META[canal] || { label: canal, color: '#64748b' };
            return { label: meta.label, color: meta.color, pct: Math.round((count / total) * 100) };
          });
      }
      return [
        { label: 'WhatsApp',  color: '#25D366', pct: 48 },
        { label: 'Instagram', color: '#E1306C', pct: 25 },
        { label: 'Facebook',  color: '#1877F2', pct: 17 },
        { label: 'TikTok',    color: '#EE1D52', pct: 10 },
      ];
    },
  },
  async mounted() {
    await this.cargar();
  },
  methods: {
    async cargar() {
      try {
        this.loading = true;
        const [agentes, stats] = await Promise.all([
          this.$service.list('agentes'),
          this.$service.list('conversaciones/estadisticas').catch(() => null),
        ]);
        this.agentes = (agentes || []).map((ag, i) => ({
          ...ag,
          avatar: (ag.nombre || ag.id || 'A').charAt(0).toUpperCase(),
          color: ['#6366f1', '#22c55e', '#f59e0b', '#e879f9', '#60a5fa'][i % 5],
        }));
        this.stats = stats;
        if (stats) {
          const conv = this.totalConv;
          this.funnelConv[0].value = conv;
          this.funnelConv[1].value = Math.round(conv * 0.93);
          this.funnelConv[2].value = Math.round(conv * 0.24);
          this.funnelConv[3].value = stats.resueltas || Math.round(conv * 0.85);
          this.funnelLeads[0].value = conv;
          this.funnelLeads[1].value = (stats.hotLeads || 0) + (stats.warmLeads || 0) + (stats.coldLeads || 0);
          this.funnelLeads[2].value = (stats.hotLeads || 0) + (stats.warmLeads || 0);
          this.funnelLeads[3].value = stats.hotLeads || 0;
          this.funnelLeads[4].value = Math.round((stats.hotLeads || 0) * 0.37);
        }
      } finally {
        this.loading = false;
      }
    },
    fmtNum(n) {
      const num = Number(n);
      if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
      if (num >= 1000) return num.toLocaleString('es-MX');
      return String(n);
    },
    exportarPDF() {
      this.$message && this.$message.info('Exportación PDF disponible próximamente');
    },
    exportarCSV() {
      this.$message && this.$message.info('Exportación CSV disponible próximamente');
    },
  },
};
</script>

<style scoped>
/* ── Layout ── */
.rep-layout {
  display: flex;
  height: 100%;
  overflow: hidden;
  background: #0a0f1e;
}

/* ── Sub-nav ── */
.rep-subnav {
  width: 200px;
  flex-shrink: 0;
  background: #0d1526;
  border-right: 1px solid #1e3a5f44;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.rep-sn-sep {
  padding: 16px 16px 8px;
  font-size: 10px;
  font-weight: 700;
  color: #475569;
  letter-spacing: 1px;
  text-transform: uppercase;
}
.rep-sn-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 14px;
  border: none;
  background: transparent;
  color: #64748b;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  text-align: left;
  border-radius: 0;
  transition: all 0.15s;
  font-family: inherit;
  width: 100%;
}
.rep-sn-btn:hover { background: #1e293b44; color: #94a3b8; }
.rep-sn-btn--active { background: #6366f118; color: #818cf8; font-weight: 700; border-left: 3px solid #6366f1; }
.rep-sn-footer {
  margin-top: auto;
  padding: 10px 8px;
  border-top: 1px solid #1e3a5f33;
}
.rep-pdf-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 12px;
  border-radius: 8px;
  background: none;
  border: 1px solid #334155;
  color: #64748b;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
}
.rep-pdf-btn:hover { color: #94a3b8; border-color: #475569; }

/* ── Content area ── */
.rep-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ── Filter bar ── */
.rep-filters {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px;
  border-bottom: 1px solid #1e3a5f44;
  flex-shrink: 0;
  gap: 12px;
  flex-wrap: wrap;
}
.rep-filters__left { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.rep-filters__right { display: flex; align-items: center; gap: 10px; }
.rep-period-lbl { font-size: 12px; color: #64748b; font-weight: 600; flex-shrink: 0; }
.rep-period-btn {
  padding: 4px 13px;
  border-radius: 999px;
  border: 1px solid #334155;
  background: transparent;
  color: #64748b;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;
}
.rep-period-btn:hover { border-color: #475569; color: #94a3b8; }
.rep-period-btn--active { border-color: #6366f155; background: #6366f122; color: #818cf8; }

.rep-select-wrap {
  position: relative;
  display: flex;
  align-items: center;
}
.rep-select {
  appearance: none;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  color: #94a3b8;
  font-size: 12px;
  font-weight: 600;
  padding: 6px 28px 6px 12px;
  cursor: pointer;
  font-family: inherit;
  outline: none;
}
.rep-select:focus { border-color: #6366f1; }
.rep-sel-arrow { position: absolute; right: 9px; pointer-events: none; }

.rep-export-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 8px;
  border: 1px solid #334155;
  background: #1e293b;
  color: #94a3b8;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
}
.rep-export-btn:hover { background: #263348; border-color: #475569; color: #f1f5f9; }

/* ── Scroll area ── */
.rep-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
}

/* ── Section header ── */
.rep-sec-hd { margin-bottom: 20px; }
.rep-sec-title { font-size: 22px; font-weight: 900; color: #f1f5f9; letter-spacing: -0.5px; margin: 0 0 4px; }
.rep-sec-sub { font-size: 12px; color: #64748b; margin: 0; }

/* ── KPI grid ── */
.rep-kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}
.rep-kpi-card {
  background: #111827;
  border: 1px solid #1e3a5f44;
  border-radius: 12px;
  padding: 14px 16px;
}
.rep-kpi-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 8px;
}
.rep-kpi-lbl { font-size: 11px; color: #64748b; font-weight: 600; line-height: 1.3; flex: 1; padding-right: 6px; }
.rep-kpi-val { font-size: 26px; font-weight: 900; color: #f1f5f9; letter-spacing: -1px; margin-bottom: 4px; }
.rep-kpi-bot { display: flex; align-items: center; gap: 8px; }
.rep-kpi-sub { font-size: 10px; color: #475569; }
.rep-trend { font-size: 11px; font-weight: 700; flex-shrink: 0; }
.rep-trend--up { color: #22c55e; }
.rep-trend--dn { color: #ef4444; }

/* ── Charts row ── */
.rep-charts-row {
  display: flex;
  gap: 14px;
  margin-bottom: 20px;
}
.rep-vol-card  { flex: 2; }
.rep-donut-card { flex: 1; }

/* ── Generic card ── */
.rep-card {
  background: #111827;
  border: 1px solid #1e3a5f44;
  border-radius: 12px;
  padding: 16px 18px;
}
.rep-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.rep-card-title { font-size: 13px; font-weight: 700; color: #e2e8f0; }
.rep-legend { display: flex; align-items: center; gap: 8px; }
.rep-leg-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.rep-leg-lbl { font-size: 11px; color: #64748b; }

/* ── Lead grid ── */
.rep-lead-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 0; }

/* ── Agent card ── */
.rep-ag-av {
  width: 38px; height: 38px;
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-size: 16px; font-weight: 800;
  flex-shrink: 0;
}
.rep-ag-metric {
  text-align: center;
  padding: 8px;
  background: #0f172a;
  border-radius: 8px;
}
</style>
