<template>
  <div class="ide-mod">

    <!-- Sub-nav -->
    <div class="ide-subnav">
      <div class="ide-sn-hd">
        <div class="ide-sn-ico" style="background:linear-gradient(135deg,#6366f1,#8b5cf6);">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
        </div>
        <div>
          <div class="ide-sn-title">Calificación IA</div>
          <div class="ide-sn-sub" style="color:#6366f1;">Lead Scoring</div>
        </div>
      </div>

      <button
        v-for="s in secciones" :key="s.id"
        class="ide-sn-btn"
        :class="seccion === s.id ? 'ide-sn-btn--i' : ''"
        @click="seccion = s.id"
      >
        <span v-html="s.svg" style="flex-shrink:0; display:flex;"></span>
        {{ s.label }}
      </button>
    </div>

    <!-- Content -->
    <div class="ide-body">

      <!-- REGLAS -->
      <template v-if="seccion === 'reglas'">
        <div class="ide-sec-hd">
          <h2>Reglas de calificación</h2>
          <p>Claude asignará puntos automáticamente cuando detecte estas señales en la conversación</p>
        </div>

        <div style="max-width:680px;">
          <div class="ide-ia-card" style="margin-bottom:16px;">
            <div style="font-size:13px; font-weight:700; color:#e2e8f0; margin-bottom:14px;">Criterios activos</div>
            <div style="display:flex; flex-direction:column; gap:10px;">
              <div
                v-for="c in criterios" :key="c.id"
                style="display:flex; align-items:flex-start; gap:14px; padding:12px 14px; background:#0f172a; border-radius:8px; border:1px solid;"
                :style="{ borderColor: c.activo ? c.color+'33' : '#1e3a5f22' }"
              >
                <div class="cal-ico" :style="{ background: c.color+'22', color: c.color }">{{ c.emoji }}</div>
                <div style="flex:1;">
                  <div style="display:flex; align-items:center; gap:8px; margin-bottom:3px;">
                    <span style="font-size:13px; font-weight:700; color:#e2e8f0;">{{ c.label }}</span>
                    <span style="font-size:11px; font-weight:700; padding:1px 7px; border-radius:999px;" :style="{ background: c.color+'22', color: c.color }">+{{ c.puntos }} pts</span>
                  </div>
                  <div style="font-size:11px; color:#64748b; line-height:1.5;">{{ c.desc }}</div>
                </div>
                <div class="ide-toggle" :class="{ 'ide-toggle--on': c.activo }" @click="c.activo = !c.activo"><div></div></div>
              </div>
            </div>
          </div>

          <div style="display:flex; justify-content:flex-end; gap:8px;">
            <button class="cal-btn-ghost" @click="agregarCriterio">+ Agregar criterio</button>
            <v-btn depressed color="primary" style="font-size:12px; border-radius:8px;" :loading="savingReglas" @click="guardarReglas">Guardar reglas</v-btn>
          </div>
        </div>
      </template>

      <!-- UMBRALES -->
      <template v-else-if="seccion === 'umbrales'">
        <div class="ide-sec-hd">
          <h2>Umbrales de clasificación</h2>
          <p>Define los rangos de puntuación para cada categoría de lead</p>
        </div>

        <div style="max-width:520px;">
          <div class="ide-ia-card" style="margin-bottom:16px;">
            <div style="display:flex; flex-direction:column; gap:12px;">
              <div v-for="tier in tiers" :key="tier.id" class="cal-tier-row" :style="{ borderColor: tier.color+'33' }">
                <div style="width:10px; height:10px; border-radius:50%; flex-shrink:0;" :style="{ background: tier.color }"></div>
                <div style="flex:1;">
                  <div style="font-size:13px; font-weight:700; color:#e2e8f0; margin-bottom:2px;">{{ tier.emoji }} {{ tier.label }}</div>
                  <div style="font-size:11px; color:#64748b;">{{ tier.desc }}</div>
                </div>
                <div style="display:flex; align-items:center; gap:8px; flex-shrink:0;">
                  <input type="number" v-model.number="tier.min" class="ide-input" style="width:60px; padding:4px 8px; font-size:12px; text-align:center;" :min="0" :max="100" />
                  <span style="color:#475569; font-size:12px;">–</span>
                  <input type="number" v-model.number="tier.max" class="ide-input" style="width:60px; padding:4px 8px; font-size:12px; text-align:center;" :min="0" :max="100" />
                  <span style="font-size:11px; color:#64748b;">pts</span>
                </div>
              </div>
            </div>
          </div>

          <div class="ide-ia-card" style="margin-bottom:16px;">
            <div style="font-size:12px; font-weight:700; color:#e2e8f0; margin-bottom:12px;">Vista previa del scoring</div>
            <div style="display:flex; height:24px; border-radius:8px; overflow:hidden;">
              <div v-for="tier in tiers" :key="tier.id" :style="{ flex: tier.max-tier.min, background: tier.color }" :title="tier.label"></div>
            </div>
            <div style="display:flex; justify-content:space-between; margin-top:4px; font-size:10px; color:#64748b;">
              <span>0</span><span>50</span><span>100</span>
            </div>
          </div>

          <div style="display:flex; justify-content:flex-end;">
            <v-btn depressed color="primary" style="font-size:12px; border-radius:8px;" :loading="savingUmbrales" @click="guardarUmbrales">Guardar umbrales</v-btn>
          </div>
        </div>
      </template>

      <!-- RESULTADOS -->
      <template v-else-if="seccion === 'resultados'">
        <div class="ide-sec-hd" style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px;">
          <div>
            <h2 style="margin:0 0 4px;">Resultados de calificación</h2>
            <p style="margin:0;">Distribución actual de leads calificados por Claude</p>
          </div>
          <button class="cal-btn-recal" :class="{ 'cal-btn-recal--loading': recalificandoTodo }" @click="recalificarTodo" :disabled="recalificandoTodo">
            <svg v-if="!recalificandoTodo" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
            <v-progress-circular v-else indeterminate size="13" width="2" color="white" />
            {{ recalificandoTodo ? 'Calificando…' : 'Recalificar todo' }}
          </button>
        </div>

        <div v-if="loading" style="display:flex; justify-content:center; padding:32px;">
          <v-progress-circular indeterminate color="primary" size="28" />
        </div>
        <template v-else>
          <div class="cal-lead-grid">
            <div v-for="tier in leadTiers" :key="tier.label" class="ide-ia-card" :style="{ border: '1px solid '+tier.color+'44', textAlign:'center', padding:'24px' }">
              <div style="font-size:28px; margin-bottom:10px;">{{ tier.emoji }}</div>
              <div style="font-size:32px; font-weight:900;" :style="{ color: tier.color }">{{ tier.value }}</div>
              <div style="font-size:13px; font-weight:700; color:#e2e8f0; margin:4px 0;">{{ tier.label }}</div>
              <div style="font-size:11px; color:#64748b;">Score {{ tier.range }}</div>
            </div>
          </div>

          <div class="ide-ia-card" style="margin-top:16px;">
            <div style="font-size:13px; font-weight:700; color:#e2e8f0; margin-bottom:14px;">Conversaciones calificadas</div>
            <div v-if="conversaciones.length === 0" style="text-align:center; color:#64748b; font-size:13px; padding:16px;">
              No hay conversaciones con mensajes aún
            </div>
            <div v-else style="display:flex; flex-direction:column; gap:0;">
              <div v-for="conv in conversaciones" :key="conv.id" style="display:flex; align-items:center; gap:12px; padding:10px 0; border-bottom:1px solid #1e3a5f22;">
                <div class="cal-contact-av">{{ (conv.contacto || '?').slice(0,2).toUpperCase() }}</div>
                <div style="flex:1; min-width:0;">
                  <div style="font-size:13px; font-weight:600; color:#e2e8f0;">{{ conv.contacto }}</div>
                  <div style="font-size:11px; color:#64748b;">{{ conv.canal }} · {{ formatDate(conv.fechaCreacion) }}</div>
                  <div v-if="conv.motivoScore" style="font-size:10px; color:#475569; margin-top:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" :title="conv.motivoScore">{{ conv.motivoScore }}</div>
                </div>
                <div style="display:flex; align-items:center; gap:8px; flex-shrink:0;">
                  <!-- Score editable inline -->
                  <div v-if="editandoScore === conv.id" style="display:flex; align-items:center; gap:4px;">
                    <input
                      type="number" :value="conv.score" min="0" max="100"
                      class="ide-input" style="width:60px; padding:4px 8px; font-size:13px; font-weight:700; text-align:center;"
                      @change="guardarScoreManual(conv, $event.target.value)"
                      @blur="editandoScore = null"
                      @keyup.enter="guardarScoreManual(conv, $event.target.value)"
                      @keyup.escape="editandoScore = null"
                      v-focus
                    />
                  </div>
                  <div v-else style="text-align:right; cursor:pointer;" @click="editandoScore = conv.id" title="Click para editar">
                    <div style="font-size:18px; font-weight:900;" :style="{ color: scoreColor(conv.score) }">{{ conv.score }}</div>
                    <div class="cal-tier-badge" :style="tierBadge(conv.score)">{{ tierLabel(conv.score) }}</div>
                  </div>
                  <!-- Botón Calificar IA -->
                  <button
                    class="cal-btn-ia"
                    :class="{ 'cal-btn-ia--loading': calificandoId === conv.id }"
                    :disabled="!!calificandoId"
                    @click="calificarConIA(conv)"
                    title="Calificar con IA"
                  >
                    <v-progress-circular v-if="calificandoId === conv.id" indeterminate size="11" width="2" color="#818cf8" />
                    <span v-else>⚡</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </template>
      </template>

      <!-- PROMPT -->
      <template v-else-if="seccion === 'prompt'">
        <div class="ide-sec-hd">
          <h2>Prompt de calificación</h2>
          <p>Instrucciones específicas para que Claude califique leads</p>
        </div>

        <div style="max-width:680px;">
          <div class="ide-ia-card" style="margin-bottom:16px; background:#1a0f0a; border-color:#c9644244;">
            <div style="font-size:12px; font-weight:700; color:#e8956d; margin-bottom:8px;">💡 ¿Qué es el prompt de calificación?</div>
            <p style="font-size:12px; color:#94a3b8; line-height:1.6;">Es el conjunto de instrucciones que recibe Claude para evaluar y puntuar cada conversación. Claude analizará el texto y asignará una puntuación del 0 al 100 basándose en estos criterios.</p>
          </div>

          <div class="ide-field" style="margin-bottom:16px;">
            <label>Instrucciones de calificación para Claude</label>
            <textarea v-model="promptCalif" class="ide-textarea" rows="12" style="font-size:12px; line-height:1.7;"
              placeholder="Analiza la conversación y asigna un score del 0 al 100 basándote en:
- Intención de compra (30 pts): El cliente menciona querer comprar o contratar
- Presupuesto disponible (20 pts): Indica cuánto puede invertir
- Urgencia (20 pts): Necesita resolverlo pronto
- Autoridad (15 pts): Es quien toma la decisión
- Perfil ideal (15 pts): Coincide con el buyer persona

Responde SOLO con un JSON: { score: número, motivo: string }"></textarea>
          </div>

          <div style="display:flex; justify-content:flex-end;">
            <v-btn depressed color="primary" style="font-size:12px; border-radius:8px;" :loading="savingPrompt" @click="guardarPrompt">Guardar prompt</v-btn>
          </div>
        </div>
      </template>

    </div>
  </div>
</template>

<script>
const SVGS = {
  star:   `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`,
  sliders:`<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>`,
  list:   `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>`,
  edit:   `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
};

export default {
  name: 'Calificacion',
  directives: {
    focus: { inserted(el) { el.focus(); el.select(); } },
  },
  data: () => ({
    seccion: 'resultados',
    loading: false,
    savingPrompt: false,
    savingReglas: false,
    savingUmbrales: false,
    recalificandoTodo: false,
    calificandoId: null,
    editandoScore: null,
    conversaciones: [],
    promptCalif: '',
    secciones: [
      { id: 'resultados', label: 'Resultados',    svg: SVGS.list    },
      { id: 'reglas',     label: 'Reglas',        svg: SVGS.star    },
      { id: 'umbrales',   label: 'Umbrales',      svg: SVGS.sliders },
      { id: 'prompt',     label: 'Prompt IA',     svg: SVGS.edit    },
    ],
    criterios: [
      { id: 'intencion',   emoji: '🛒', label: 'Intención de compra',    desc: 'El cliente menciona comprar, contratar o adquirir el producto/servicio', puntos: 30, color: '#22c55e', activo: true  },
      { id: 'presupuesto', emoji: '💰', label: 'Presupuesto disponible', desc: 'El cliente indica cuánto puede invertir o su rango de presupuesto',       puntos: 20, color: '#f59e0b', activo: true  },
      { id: 'urgencia',    emoji: '⏰', label: 'Urgencia / tiempo límite',desc: 'Necesita resolver pronto, tiene fecha límite o urgencia real',            puntos: 20, color: '#f97316', activo: true  },
      { id: 'autoridad',   emoji: '👔', label: 'Toma de decisiones',     desc: 'Es el responsable final de la decisión de compra',                        puntos: 15, color: '#8b5cf6', activo: false },
      { id: 'fit',         emoji: '🎯', label: 'Perfil de cliente ideal', desc: 'Coincide con el buyer persona o segmento objetivo definido',              puntos: 15, color: '#6366f1', activo: false },
    ],
    tiers: [
      { id: 'hot',  emoji: '🔥', label: 'Hot Lead',  desc: 'Listo para comprar, alta prioridad',   color: '#22c55e', min: 70, max: 100 },
      { id: 'warm', emoji: '🌡', label: 'Warm Lead', desc: 'Interesado, requiere seguimiento',      color: '#f59e0b', min: 40, max: 69  },
      { id: 'cold', emoji: '❄️', label: 'Cold Lead', desc: 'Poco interés o fuera del perfil',       color: '#60a5fa', min: 0,  max: 39  },
    ],
  }),
  computed: {
    leadTiers() {
      const hot  = this.conversaciones.filter(c => c.score >= 70).length;
      const warm = this.conversaciones.filter(c => c.score >= 40 && c.score < 70).length;
      const cold = this.conversaciones.filter(c => c.score < 40).length;
      return [
        { label: 'Hot Leads',  range: '70–100', value: hot,  color: '#22c55e', emoji: '🔥' },
        { label: 'Warm Leads', range: '40–69',  value: warm, color: '#f59e0b', emoji: '🌡' },
        { label: 'Cold Leads', range: '0–39',   value: cold, color: '#60a5fa', emoji: '❄️' },
      ];
    },
  },
  async mounted() {
    await Promise.all([this.cargar(), this.cargarConfig()]);
  },
  methods: {
    async cargar() {
      try {
        this.loading = true;
        const data = await this.$service.list('conversaciones') || [];
        this.conversaciones = data.filter(c => c.totalMensajes > 0).sort((a, b) => b.score - a.score);
      } finally {
        this.loading = false;
      }
    },
    async cargarConfig() {
      try {
        const cfg = await this.$service.get('conversaciones/calificacion-config');
        if (cfg) {
          if (cfg.prompt) this.promptCalif = cfg.prompt;
          if (cfg.criterios) this.criterios = cfg.criterios;
          if (cfg.umbrales) {
            const u = cfg.umbrales;
            this.tiers = [
              { ...this.tiers[0], min: u.hot?.min ?? 70,  max: u.hot?.max ?? 100 },
              { ...this.tiers[1], min: u.warm?.min ?? 40, max: u.warm?.max ?? 69  },
              { ...this.tiers[2], min: u.cold?.min ?? 0,  max: u.cold?.max ?? 39  },
            ];
          }
        }
      } catch { /* sin config previa */ }
    },

    async guardarPrompt() {
      this.savingPrompt = true;
      try {
        await this.$service.put('conversaciones/calificacion-config', { prompt: this.promptCalif });
        this.$message.success('Prompt guardado');
      } finally { this.savingPrompt = false; }
    },
    async guardarReglas() {
      this.savingReglas = true;
      try {
        await this.$service.put('conversaciones/calificacion-config', { criterios: this.criterios });
        this.$message.success('Reglas guardadas');
      } finally { this.savingReglas = false; }
    },
    async guardarUmbrales() {
      this.savingUmbrales = true;
      try {
        const umbrales = {
          hot:  { min: this.tiers[0].min, max: this.tiers[0].max },
          warm: { min: this.tiers[1].min, max: this.tiers[1].max },
          cold: { min: this.tiers[2].min, max: this.tiers[2].max },
        };
        await this.$service.put('conversaciones/calificacion-config', { umbrales });
        this.$message.success('Umbrales guardados');
      } finally { this.savingUmbrales = false; }
    },

    async calificarConIA(conv) {
      this.calificandoId = conv.id;
      try {
        const res = await this.$service.post(`conversaciones/${conv.id}/calificar`, {});
        if (res) {
          conv.score = res.score;
          conv.motivoScore = res.motivo;
          this.$message.success(`Score: ${res.score} — ${res.motivo || ''}`);
        }
      } catch { /* $service ya muestra el error */ } finally {
        this.calificandoId = null;
      }
    },

    async recalificarTodo() {
      this.recalificandoTodo = true;
      try {
        const res = await this.$service.post('conversaciones/calificar-lote', {});
        this.$message.success(`Calificadas: ${res?.calificadas || 0}`);
        await this.cargar();
      } finally { this.recalificandoTodo = false; }
    },

    async guardarScoreManual(conv, val) {
      const score = Math.min(100, Math.max(0, parseInt(val, 10) || 0));
      try {
        await this.$service.patch(`conversaciones/${conv.id}/score`, { score });
        conv.score = score;
        this.$message.success('Score actualizado');
      } finally { this.editandoScore = null; }
    },

    scoreColor(s) { return s >= 70 ? '#22c55e' : s >= 40 ? '#f59e0b' : '#60a5fa'; },
    tierLabel(s)  { return s >= 70 ? '🔥 Hot' : s >= 40 ? '🌡 Warm' : '❄️ Cold'; },
    tierBadge(s) {
      if (s >= 70) return 'background:#22c55e22; color:#22c55e;';
      if (s >= 40) return 'background:#f59e0b22; color:#f59e0b;';
      return 'background:#60a5fa22; color:#60a5fa;';
    },
    formatDate(d) { return d ? new Date(d).toLocaleDateString('es-BO', { day:'2-digit', month:'short' }) : ''; },
    agregarCriterio() { this.$message.info('Editor de criterios personalizados disponible próximamente'); },
  },
};
</script>

<style scoped>
.cal-ico { width: 34px; height: 34px; border-radius: 9px; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }
.cal-tier-row { display: flex; align-items: center; gap: 12px; padding: 12px 14px; background: #0f172a; border-radius: 8px; border: 1px solid; }
.cal-lead-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
.cal-contact-av { width: 34px; height: 34px; border-radius: 9px; background: #6366f122; color: #818cf8; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0; }
.cal-tier-badge { font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 999px; }
.cal-btn-ghost {
  padding: 8px 14px; border-radius: 8px; border: 1px solid #334155;
  background: none; color: #64748b; font-size: 12px; font-weight: 600;
  cursor: pointer; font-family: inherit; transition: all 0.15s;
}
.cal-btn-ghost:hover { border-color: #6366f133; color: #94a3b8; }

.cal-btn-ia {
  width: 28px; height: 28px; border-radius: 6px; border: 1px solid #6366f133;
  background: #6366f111; color: #818cf8; font-size: 14px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.15s; flex-shrink: 0;
}
.cal-btn-ia:hover:not(:disabled) { background: #6366f122; border-color: #6366f166; }
.cal-btn-ia:disabled { opacity: 0.5; cursor: not-allowed; }

.cal-btn-recal {
  display: flex; align-items: center; gap: 6px;
  padding: 7px 14px; border-radius: 8px; border: 1px solid #6366f133;
  background: #6366f111; color: #818cf8; font-size: 12px; font-weight: 600;
  cursor: pointer; font-family: inherit; transition: all 0.15s;
}
.cal-btn-recal:hover:not(:disabled) { background: #6366f122; }
.cal-btn-recal:disabled { opacity: 0.6; cursor: not-allowed; }
</style>
